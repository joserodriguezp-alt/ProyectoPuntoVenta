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

// ─── Mock de repositorio ─────────────────────────────────────────────────────
jest.mock('../src/modules/cash-register/cash-register-repository');

const cashRegisterService    = require('../src/modules/cash-register/cash-register-service');
const cashRegisterRepository = require('../src/modules/cash-register/cash-register-repository');

// ─── Datos de prueba compartidos ─────────────────────────────────────────────
const REGISTRO_ABIERTO = { id_corte: 1, fondo_inicial: 500, estado: 'abierto' };

function setupCorteExitoso() {
  cashRegisterRepository.findById.mockResolvedValue(REGISTRO_ABIERTO);
  cashRegisterRepository.close.mockResolvedValue({
    ...REGISTRO_ABIERTO,
    estado: 'cerrado',
    fecha_cierre: new Date().toISOString(),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SUITE — Corte de Caja
// ─────────────────────────────────────────────────────────────────────────────
describe('Corte de Caja › Cálculo de efectivo esperado', () => {
  test('efectivo_esperado = fondo_inicial + ventas − devoluciones', async () => {
    // GIVEN: fondo=500, ventas=1000, devoluciones=200
    setupCorteExitoso();
    cashRegisterRepository.sumSalesByRegister.mockResolvedValue(1000);
    cashRegisterRepository.sumReturnsByRegister.mockResolvedValue(200);

    // WHEN: se cierra con efectivo contado = 1300 (exacto)
    await cashRegisterService.closeRegister({ id: 1, cashCounted: 1300 });

    // THEN: expectedCash = 500+1000-200 = 1300, diferencia = 0
    expect(cashRegisterRepository.close).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ expectedCash: 1300, difference: 0 })
    );
  });

  test('detecta sobrante cuando efectivo contado > esperado', async () => {
    // GIVEN: fondo=500, ventas=500, devoluciones=0 → esperado=1000
    setupCorteExitoso();
    cashRegisterRepository.sumSalesByRegister.mockResolvedValue(500);
    cashRegisterRepository.sumReturnsByRegister.mockResolvedValue(0);

    // WHEN: cajero contó 1100
    await cashRegisterService.closeRegister({ id: 1, cashCounted: 1100 });

    // THEN: diferencia = +100 (sobrante)
    expect(cashRegisterRepository.close).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ expectedCash: 1000, difference: 100 })
    );
  });

  test('detecta faltante cuando efectivo contado < esperado', async () => {
    // GIVEN: esperado = 500+500-0 = 1000
    setupCorteExitoso();
    cashRegisterRepository.sumSalesByRegister.mockResolvedValue(500);
    cashRegisterRepository.sumReturnsByRegister.mockResolvedValue(0);

    // WHEN: cajero contó solo 900
    await cashRegisterService.closeRegister({ id: 1, cashCounted: 900 });

    // THEN: diferencia = -100 (faltante)
    expect(cashRegisterRepository.close).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ expectedCash: 1000, difference: -100 })
    );
  });

  test('diferencia = 0 cuando cuadre es exacto', async () => {
    setupCorteExitoso();
    cashRegisterRepository.sumSalesByRegister.mockResolvedValue(300);
    cashRegisterRepository.sumReturnsByRegister.mockResolvedValue(50);

    // esperado = 500+300-50 = 750
    await cashRegisterService.closeRegister({ id: 1, cashCounted: 750 });

    expect(cashRegisterRepository.close).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ difference: 0 })
    );
  });

  test('el resultado indica estado "exacto", "sobrante" o "faltante"', async () => {
    setupCorteExitoso();
    cashRegisterRepository.sumSalesByRegister.mockResolvedValue(0);
    cashRegisterRepository.sumReturnsByRegister.mockResolvedValue(0);

    const resultado = await cashRegisterService.closeRegister({ id: 1, cashCounted: 500 });

    expect(resultado.status).toBe('exacto');
  });
});

describe('Corte de Caja › Validaciones', () => {
  test('lanza 400 si el efectivo contado es negativo', async () => {
    cashRegisterRepository.findById.mockResolvedValue(REGISTRO_ABIERTO);

    await expect(
      cashRegisterService.closeRegister({ id: 1, cashCounted: -1 })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test('lanza 400 si cashCounted no se envía', async () => {
    cashRegisterRepository.findById.mockResolvedValue(REGISTRO_ABIERTO);

    await expect(
      cashRegisterService.closeRegister({ id: 1 })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test('lanza 404 si el corte de caja no existe', async () => {
    cashRegisterRepository.findById.mockResolvedValue(null);

    await expect(
      cashRegisterService.closeRegister({ id: 99, cashCounted: 500 })
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  test('lanza 403 si la caja ya está cerrada', async () => {
    cashRegisterRepository.findById.mockResolvedValue({
      ...REGISTRO_ABIERTO,
      estado: 'cerrado',
    });

    await expect(
      cashRegisterService.closeRegister({ id: 1, cashCounted: 500 })
    ).rejects.toMatchObject({ statusCode: 403 });
  });
});

describe('Corte de Caja › Apertura', () => {
  test('lanza 409 si ya existe una caja abierta', async () => {
    cashRegisterRepository.findOpen.mockResolvedValue(REGISTRO_ABIERTO);

    await expect(
      cashRegisterService.openRegister({ userId: 1, initialFund: 500 })
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  test('lanza 400 si el fondo inicial es negativo', async () => {
    cashRegisterRepository.findOpen.mockResolvedValue(null);

    await expect(
      cashRegisterService.openRegister({ userId: 1, initialFund: -100 })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test('abre caja correctamente con fondo inicial válido', async () => {
    cashRegisterRepository.findOpen.mockResolvedValue(null);
    cashRegisterRepository.create.mockResolvedValue({
      id_corte: 2,
      fondo_inicial: 200,
      estado: 'abierto',
    });

    const result = await cashRegisterService.openRegister({ userId: 1, initialFund: 200 });

    expect(cashRegisterRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 1, initialFund: 200 })
    );
    expect(result.estado).toBe('abierto');
  });
});
