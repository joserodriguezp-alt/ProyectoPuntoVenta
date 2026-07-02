// Controller de ventas
const ApiError = require('../../utils/api-error');
const saleService = require('./sale-service');
const returnService = require('./return-service');

async function create(req, res) {
  try {
    const sale = await saleService.createSale(req.body, req.user.id);
    return res.status(201).json({ success: true, data: sale });
  } catch (err) {
    if (err instanceof ApiError) {
      return res.status(err.statusCode).json({ success: false, error: err.message });
    }
    console.error('Error al registrar venta:', err);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
}

async function getByFolio(req, res) {
  try {
    const { folio } = req.params;
    const sale = await saleService.getByFolio(folio);
    return res.status(200).json({ success: true, data: sale });
  } catch (err) {
    if (err instanceof ApiError) {
      return res.status(err.statusCode).json({ success: false, error: err.message });
    }
    console.error('Error al consultar venta:', err);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
}

async function createReturn(req, res) {
  try {
    const saleReturn = await returnService.processReturn(req.body, req.user.id);
    return res.status(201).json({ success: true, data: saleReturn });
  } catch (err) {
    if (err instanceof ApiError) {
      return res.status(err.statusCode).json({ success: false, error: err.message });
    }
    console.error('Error al registrar devolucion:', err);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
}

module.exports = { create, getByFolio, createReturn };
