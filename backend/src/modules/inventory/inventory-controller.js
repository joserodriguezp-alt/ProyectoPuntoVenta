// Controller de inventario
const ApiError = require('../../utils/api-error');
const inventoryService = require('./inventory-service');

async function getStock(req, res) {
  try {
    const { productId } = req.params;
    const stock = await inventoryService.getStock(productId);
    return res.status(200).json({ success: true, data: stock });
  } catch (err) {
    if (err instanceof ApiError) {
      return res.status(err.statusCode).json({ success: false, error: err.message });
    }
    console.error('Error al consultar stock:', err);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
}

async function registerEntry(req, res) {
  try {
    const { productId, quantity, supplier, invoiceDate } = req.body;
    const result = await inventoryService.registerEntry({
      productId,
      quantity,
      supplier,
      invoiceDate,
      userId: req.user.id
    });
    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    if (err instanceof ApiError) {
      return res.status(err.statusCode).json({ success: false, error: err.message });
    }
    console.error('Error al registrar entrada de inventario:', err);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
}

async function registerAdjustment(req, res) {
  try {
    const { productId, quantity, reason, confirm } = req.body;
    const result = await inventoryService.registerAdjustment({
      productId,
      quantity,
      reason,
      confirm: Boolean(confirm),
      userId: req.user.id
    });
    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    if (err instanceof ApiError) {
      return res.status(err.statusCode).json({ success: false, error: err.message });
    }
    console.error('Error al registrar ajuste de inventario:', err);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
}

async function getMovements(req, res) {
  try {
    const { productId } = req.params;
    const { from, to } = req.query;
    const movements = await inventoryService.getMovements(productId, from, to);
    return res.status(200).json({ success: true, data: movements });
  } catch (err) {
    console.error('Error al consultar movimientos de inventario:', err);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
}

module.exports = { getStock, registerEntry, registerAdjustment, getMovements };
