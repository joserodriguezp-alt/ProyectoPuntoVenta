// Logica de negocio de ventas: cobro en caja (HU-05 a HU-08)
const bcrypt = require('bcrypt');
const env = require('../../config/env');
const ApiError = require('../../utils/api-error');
const saleRepository = require('./sale-repository');
const inventoryRepository = require('../inventory/inventory-repository');
const cashRegisterRepository = require('../cash-register/cash-register-repository');
const userRepository = require('../users/user-repository');

function round2(value) {
  return Math.round(Number(value) * 100) / 100;
}

async function resolveDiscount(subtotal, discountInput) {
  const { discountPercent, discountAmount, discountAuthUsername, discountAuthPassword } = discountInput;

  let amount = 0;
  if (discountPercent) {
    amount = round2((subtotal * Number(discountPercent)) / 100);
  } else if (discountAmount) {
    amount = round2(Number(discountAmount));
  }

  if (amount === 0) return 0;

  if (amount > subtotal) {
    throw new ApiError(400, 'El descuento no puede ser mayor al total');
  }

  const effectivePercent = subtotal > 0 ? (amount / subtotal) * 100 : 0;

  if (effectivePercent > env.discountAuthThreshold) {
    if (!discountAuthUsername || !discountAuthPassword) {
      throw new ApiError(401, 'El descuento requiere autorizacion de un administrador');
    }

    const admin = await userRepository.findByUsername(discountAuthUsername);
    if (!admin || admin.rol !== 'administrador' || !admin.activo) {
      throw new ApiError(401, 'Credenciales de administrador invalidas');
    }

    const passwordMatches = await bcrypt.compare(discountAuthPassword, admin.password_hash);
    if (!passwordMatches) {
      throw new ApiError(401, 'Credenciales de administrador invalidas');
    }
  }

  return amount;
}

async function createSale({ items, amountReceived, discountPercent, discountAmount, discountAuthUsername, discountAuthPassword }, userId) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'La venta debe incluir al menos un producto');
  }
  if (amountReceived === undefined) {
    throw new ApiError(400, 'El monto recibido es obligatorio');
  }

  const openRegister = await cashRegisterRepository.findOpen();
  if (!openRegister) {
    throw new ApiError(400, 'Debe abrir la caja antes de realizar ventas');
  }

  const lineItems = [];
  let subtotal = 0;

  for (const item of items) {
    if (!item.productId || !item.quantity || Number(item.quantity) <= 0) {
      throw new ApiError(400, 'Cada renglon debe tener un producto y una cantidad mayor a cero');
    }

    const product = await inventoryRepository.findProductById(item.productId);
    if (!product || !product.activo) {
      throw new ApiError(404, `Producto ${item.productId} no encontrado`);
    }

    const quantity = Number(item.quantity);
    if (quantity > product.stock_actual) {
      throw new ApiError(400, `Stock insuficiente para ${product.nombre}. Disponible: ${product.stock_actual}`);
    }

    const unitPrice = Number(product.precio_venta);
    const lineSubtotal = round2(unitPrice * quantity);
    subtotal = round2(subtotal + lineSubtotal);

    lineItems.push({ product, quantity, unitPrice, lineSubtotal });
  }

  const discount = await resolveDiscount(subtotal, {
    discountPercent,
    discountAmount,
    discountAuthUsername,
    discountAuthPassword
  });

  const total = round2(subtotal - discount);

  if (Number(amountReceived) < total) {
    throw new ApiError(400, 'Monto insuficiente');
  }

  const change = round2(Number(amountReceived) - total);
  const folio = await saleRepository.nextFolio();

  const sale = await saleRepository.insertSale({
    folio,
    registerId: openRegister.id_corte,
    userId,
    subtotal,
    discount,
    total,
    amountReceived: round2(amountReceived),
    change
  });

  const details = [];
  for (const line of lineItems) {
    const detail = await saleRepository.insertSaleDetail({
      saleId: sale.id_venta,
      productId: line.product.id_producto,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      lineDiscount: 0,
      subtotal: line.lineSubtotal
    });
    details.push(detail);

    const resultingStock = line.product.stock_actual - line.quantity;
    await inventoryRepository.updateStock(line.product.id_producto, resultingStock);
    await inventoryRepository.insertMovement({
      productId: line.product.id_producto,
      userId,
      type: 'venta',
      quantity: -line.quantity,
      previousStock: line.product.stock_actual,
      resultingStock,
      referenceId: sale.id_venta,
      referenceType: 'venta'
    });
  }

  return { ...sale, detalle: details };
}

async function getByFolio(folio) {
  const sale = await saleRepository.findByFolio(folio);
  if (!sale) {
    throw new ApiError(404, 'Folio de venta no encontrado');
  }
  return sale;
}

module.exports = { createSale, getByFolio };
