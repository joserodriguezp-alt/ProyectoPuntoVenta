// Logica de negocio de devoluciones de venta (HU-09 y RN-05)
const ApiError = require('../../utils/api-error');
const saleRepository = require('./sale-repository');
const returnRepository = require('./return-repository');
const inventoryRepository = require('../inventory/inventory-repository');
const cashRegisterRepository = require('../cash-register/cash-register-repository');

function round2(value) {
  return Math.round(Number(value) * 100) / 100;
}

function todayInBusinessTimezone() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Hermosillo' });
}

function isWithinReturnWindow(saleDate) {
  const saleDateString = new Date(saleDate).toLocaleDateString('en-CA', { timeZone: 'America/Hermosillo' });
  const today = todayInBusinessTimezone();
  const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toLocaleDateString('en-CA', {
    timeZone: 'America/Hermosillo'
  });
  return saleDateString === today || saleDateString === yesterday;
}

async function processReturn({ saleFolio, items, note }, userId) {
  if (!saleFolio) {
    throw new ApiError(400, 'El folio de venta es obligatorio');
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'La devolucion debe incluir al menos un producto');
  }

  const openRegister = await cashRegisterRepository.findOpen();
  if (!openRegister) {
    throw new ApiError(400, 'Debe abrir la caja antes de registrar devoluciones');
  }

  const sale = await saleRepository.findSaleByFolio(saleFolio);
  if (!sale) {
    throw new ApiError(404, 'Folio de venta no encontrado');
  }

  if (!isWithinReturnWindow(sale.fecha_venta)) {
    throw new ApiError(400, 'Solo se pueden devolver ventas del dia actual o del dia anterior');
  }

  const validatedItems = [];
  let totalReturned = 0;

  for (const item of items) {
    if (!item.saleDetailId || !item.quantity || Number(item.quantity) <= 0) {
      throw new ApiError(400, 'Cada renglon de devolucion debe indicar el detalle de venta y una cantidad mayor a cero');
    }

    const saleDetail = await saleRepository.findSaleDetailById(item.saleDetailId);
    if (!saleDetail || saleDetail.id_venta !== sale.id_venta) {
      throw new ApiError(400, 'El renglon indicado no pertenece a la venta especificada');
    }

    const alreadyReturned = await saleRepository.sumReturnedQuantity(saleDetail.id_detalle);
    const available = saleDetail.cantidad - alreadyReturned;
    const quantity = Number(item.quantity);

    if (quantity > available) {
      throw new ApiError(400, `Cantidad a devolver excede lo disponible. Disponible: ${available}`);
    }

    const unitRefund = Number(saleDetail.subtotal) / saleDetail.cantidad;
    const amount = round2(unitRefund * quantity);
    totalReturned = round2(totalReturned + amount);

    validatedItems.push({ saleDetail, quantity, amount });
  }

  const saleReturn = await returnRepository.insertReturn({
    saleId: sale.id_venta,
    userId,
    registerId: openRegister.id_corte,
    totalReturned,
    note
  });

  const details = [];
  for (const validated of validatedItems) {
    const detail = await returnRepository.insertReturnDetail({
      returnId: saleReturn.id_devolucion,
      saleDetailId: validated.saleDetail.id_detalle,
      productId: validated.saleDetail.id_producto,
      quantity: validated.quantity,
      amount: validated.amount
    });
    details.push(detail);

    const product = await inventoryRepository.findProductById(validated.saleDetail.id_producto);
    const resultingStock = product.stock_actual + validated.quantity;
    await inventoryRepository.updateStock(product.id_producto, resultingStock);
    await inventoryRepository.insertMovement({
      productId: product.id_producto,
      userId,
      type: 'devolucion',
      quantity: validated.quantity,
      previousStock: product.stock_actual,
      resultingStock,
      referenceId: saleReturn.id_devolucion,
      referenceType: 'devolucion'
    });
  }

  await saleRepository.updateSaleStatus(sale.id_venta, 'devuelta_parcial');

  return { ...saleReturn, detalle: details };
}

module.exports = { processReturn };
