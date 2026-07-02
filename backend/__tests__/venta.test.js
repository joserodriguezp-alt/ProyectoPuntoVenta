'use strict';

// ─── Mocks de infraestructura ────────────────────────────────────────────────
jest.mock('../src/config/database', () => ({ supabase: {} }));

jest.mock('../src/config/env', () => ({
  supabaseUrl: 'https://test.supabase.co',
  supabaseServiceKey: 'test-key',
  jwtSecret: 'test-secret',
  jwtExpiresIn: '12h',
  bcryptSaltRounds: 10,
  discountAuthThreshold: 20,
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue('$2b$10$hash'),
}));

// ─── Mocks de repositorios ───────────────────────────────────────────────────
jest.mock('../src/modules/sales/sale-repository');
jest.mock('../src/modules/inventory/inventory-repository');
jest.mock('../src/modules/cash-register/cash-register-repository');
jest.mock('../src/modules/users/user-repository');

const saleService            = require('../src/modules/sales/sale-service');
const saleRepository         = require('../src/modules/sales/sale-repository');
const inventoryRepository    = require('../src/modules/inventory/inventory-repository');
const cashRegisterRepository = require('../src/modules/cash-register/cash-register-repository');

// ─── Datos de prueba compartidos ─────────────────────────────────────────────
const CAJA_ABIERTA = { id_corte: 1, fondo_inicial: 500, estado: 'abierto' };

function mockProducto(overrides = {}) {
  return {
    id_producto: 1,
    nombre: 'Cuaderno',
    precio_venta: 50,
    stock_actual: 10,
    activo: true,
    ...overrides,
  };
}

// helper: captura el error lanzado por una promesa
async function catchError(promise) {
  try { await promise; } catch (e) { return e; }
  throw new Error('Se esperaba que la promesa rechazara');
}

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 1 — Stock insuficiente al vender
// ─────────────────────────────────────────────────────────────────────────────
describe('Venta › Stock insuficiente', () => {
  beforeEach(() => {
    cashRegisterRepository.findOpen.mockResolvedValue(CAJA_ABIERTA);
  });

  test('lanza 400 cuando la cantidad solicitada supera el stock disponible', async () => {
    // GIVEN: producto con stock_actual = 3
    inventoryRepository.findProductById.mockResolvedValue(
      mockProducto({ stock_actual: 3 })
    );

    // WHEN: se intenta vender 5 unidades / THEN: 400 + mensaje
    const err = await catchError(
      saleService.createSale(
        { items: [{ productId: 1, quantity: 5 }], amountReceived: 250 },
        1
      )
    );

    expect(err.statusCode).toBe(400);
    expect(err.message).toMatch(/Stock insuficiente/);
  });

  test('lanza 400 cuando el stock es exactamente cero', async () => {
    inventoryRepository.findProductById.mockResolvedValue(
      mockProducto({ stock_actual: 0 })
    );

    const err = await catchError(
      saleService.createSale(
        { items: [{ productId: 1, quantity: 1 }], amountReceived: 50 },
        1
      )
    );

    expect(err.statusCode).toBe(400);
  });

  test('lanza 400 cuando la lista de productos está vacía', async () => {
    const err = await catchError(
      saleService.createSale({ items: [], amountReceived: 100 }, 1)
    );

    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('La venta debe incluir al menos un producto');
  });

  test('lanza 400 cuando no hay caja abierta', async () => {
    cashRegisterRepository.findOpen.mockResolvedValue(null);
    inventoryRepository.findProductById.mockResolvedValue(mockProducto());

    const err = await catchError(
      saleService.createSale(
        { items: [{ productId: 1, quantity: 1 }], amountReceived: 50 },
        1
      )
    );

    expect(err.statusCode).toBe(400);
    expect(err.message).toMatch(/caja/i);
  });

  test('lanza 404 cuando el producto no existe en la BD', async () => {
    inventoryRepository.findProductById.mockResolvedValue(null);

    const err = await catchError(
      saleService.createSale(
        { items: [{ productId: 999, quantity: 1 }], amountReceived: 50 },
        1
      )
    );

    expect(err.statusCode).toBe(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 2 — Cálculo de totales de venta
// ─────────────────────────────────────────────────────────────────────────────
describe('Venta › Cálculo de totales', () => {
  beforeEach(() => {
    cashRegisterRepository.findOpen.mockResolvedValue(CAJA_ABIERTA);
    saleRepository.nextFolio.mockResolvedValue('V-000001');
    saleRepository.insertSale.mockResolvedValue({ id_venta: 1, folio: 'V-000001', total: 0 });
    saleRepository.insertSaleDetail.mockResolvedValue({ id_detalle: 1 });
    inventoryRepository.updateStock.mockResolvedValue(true);
    inventoryRepository.insertMovement.mockResolvedValue(true);
  });

  test('subtotal = precio × cantidad cuando no hay descuento', async () => {
    // GIVEN: producto $100, 2 unidades, stock suficiente
    inventoryRepository.findProductById.mockResolvedValue(
      mockProducto({ precio_venta: 100, stock_actual: 10 })
    );

    await saleService.createSale(
      { items: [{ productId: 1, quantity: 2 }], amountReceived: 200 },
      1
    );

    // THEN: insertSale recibe subtotal=200, discount=0, total=200
    expect(saleRepository.insertSale).toHaveBeenCalledWith(
      expect.objectContaining({ subtotal: 200, discount: 0, total: 200 })
    );
  });

  test('descuento porcentual se resta correctamente del subtotal', async () => {
    // GIVEN: producto $100, stock suficiente
    inventoryRepository.findProductById.mockResolvedValue(
      mockProducto({ precio_venta: 100, stock_actual: 5 })
    );

    // WHEN: descuento del 10% → total esperado = $90
    await saleService.createSale(
      { items: [{ productId: 1, quantity: 1 }], amountReceived: 90, discountPercent: 10 },
      1
    );

    // THEN: subtotal=100, discount=10, total=90
    expect(saleRepository.insertSale).toHaveBeenCalledWith(
      expect.objectContaining({ subtotal: 100, discount: 10, total: 90 })
    );
  });

  test('el cambio se calcula como efectivo_recibido − total', async () => {
    inventoryRepository.findProductById.mockResolvedValue(
      mockProducto({ precio_venta: 50, stock_actual: 10 })
    );

    await saleService.createSale(
      { items: [{ productId: 1, quantity: 1 }], amountReceived: 100 },
      1
    );

    const llamada = saleRepository.insertSale.mock.calls[0][0];
    // THEN: change = 100 − 50 = 50
    expect(llamada.amountReceived - llamada.total).toBe(50);
  });

  test('lanza 400 cuando el monto recibido es menor al total', async () => {
    inventoryRepository.findProductById.mockResolvedValue(
      mockProducto({ precio_venta: 200, stock_actual: 5 })
    );

    const err = await catchError(
      saleService.createSale(
        { items: [{ productId: 1, quantity: 1 }], amountReceived: 150 },
        1
      )
    );

    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('Monto insuficiente');
  });

  test('acumula correctamente el subtotal de múltiples productos', async () => {
    // GIVEN: dos productos con stock suficiente
    inventoryRepository.findProductById
      .mockResolvedValueOnce(mockProducto({ id_producto: 1, precio_venta: 30, stock_actual: 10 }))
      .mockResolvedValueOnce(mockProducto({ id_producto: 2, precio_venta: 20, stock_actual: 5 }));

    // WHEN: 2 × $30 + 1 × $20 = $80
    await saleService.createSale(
      {
        items: [
          { productId: 1, quantity: 2 },
          { productId: 2, quantity: 1 },
        ],
        amountReceived: 80,
      },
      1
    );

    // THEN: subtotal = 80, total = 80
    expect(saleRepository.insertSale).toHaveBeenCalledWith(
      expect.objectContaining({ subtotal: 80, total: 80 })
    );
  });
});
