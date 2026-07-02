// Logica de negocio de inventario: consulta de stock, entradas, ajustes e historial (HU-10 a HU-13)
const ApiError = require('../../utils/api-error');
const inventoryRepository = require('./inventory-repository');

async function getStock(productId) {
  const product = await inventoryRepository.findStockByProductId(productId);
  if (!product) {
    throw new ApiError(404, 'Producto no encontrado');
  }

  return {
    productId: product.id_producto,
    name: product.nombre,
    currentStock: product.stock_actual,
    minStock: product.stock_minimo,
    unit: product.unidad_medida,
    lowStock: product.stock_actual <= product.stock_minimo
  };
}

async function registerEntry({ productId, quantity, userId, supplier, invoiceDate }) {
  if (!quantity || Number(quantity) <= 0) {
    throw new ApiError(400, 'La cantidad debe ser mayor a cero');
  }

  const product = await inventoryRepository.findProductById(productId);
  if (!product) {
    throw new ApiError(404, 'Producto no encontrado');
  }

  const previousStock = product.stock_actual;
  const resultingStock = previousStock + Number(quantity);

  await inventoryRepository.updateStock(productId, resultingStock);

  const reasonParts = [];
  if (supplier) reasonParts.push(`Proveedor: ${supplier}`);
  if (invoiceDate) reasonParts.push(`Factura: ${invoiceDate}`);

  const movement = await inventoryRepository.insertMovement({
    productId,
    userId,
    type: 'entrada',
    quantity: Number(quantity),
    previousStock,
    resultingStock,
    referenceType: 'entrada',
    reason: reasonParts.join(' | ') || null
  });

  return { previousStock, resultingStock, movement };
}

async function registerAdjustment({ productId, quantity, userId, reason, confirm }) {
  if (quantity === undefined || Number(quantity) === 0) {
    throw new ApiError(400, 'La cantidad de ajuste no puede ser cero');
  }
  if (!reason) {
    throw new ApiError(400, 'Debe indicar el motivo del ajuste');
  }

  const product = await inventoryRepository.findProductById(productId);
  if (!product) {
    throw new ApiError(404, 'Producto no encontrado');
  }

  const previousStock = product.stock_actual;
  const resultingStock = previousStock + Number(quantity);

  if (resultingStock < 0 && !confirm) {
    throw new ApiError(409, 'El ajuste resultaria en stock negativo');
  }

  await inventoryRepository.updateStock(productId, resultingStock);

  const movement = await inventoryRepository.insertMovement({
    productId,
    userId,
    type: 'ajuste',
    quantity: Number(quantity),
    previousStock,
    resultingStock,
    referenceType: 'ajuste',
    reason
  });

  return { previousStock, resultingStock, movement };
}

async function getMovements(productId, from, to) {
  return inventoryRepository.listMovements(productId, from, to);
}

module.exports = { getStock, registerEntry, registerAdjustment, getMovements };
