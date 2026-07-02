// Controller de corte de caja
const ApiError = require('../../utils/api-error');
const cashRegisterService = require('./cash-register-service');

async function open(req, res) {
  try {
    const { initialFund } = req.body;
    const register = await cashRegisterService.openRegister({ userId: req.user.id, initialFund });
    return res.status(201).json({ success: true, data: register });
  } catch (err) {
    if (err instanceof ApiError) {
      return res.status(err.statusCode).json({ success: false, error: err.message });
    }
    console.error('Error al abrir caja:', err);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
}

async function getCurrent(req, res) {
  try {
    const register = await cashRegisterService.getCurrentOpen();
    return res.status(200).json({ success: true, data: register });
  } catch (err) {
    if (err instanceof ApiError) {
      return res.status(err.statusCode).json({ success: false, error: err.message });
    }
    console.error('Error al consultar caja actual:', err);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
}

async function close(req, res) {
  try {
    const { id } = req.params;
    const { cashCounted, note } = req.body;
    const result = await cashRegisterService.closeRegister({ id, cashCounted, note });
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    if (err instanceof ApiError) {
      return res.status(err.statusCode).json({ success: false, error: err.message });
    }
    console.error('Error al cerrar caja:', err);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
}

async function listHistory(req, res) {
  try {
    const history = await cashRegisterService.listHistory();
    return res.status(200).json({ success: true, data: history });
  } catch (err) {
    console.error('Error al consultar historial de cortes:', err);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
}

async function getDetail(req, res) {
  try {
    const { id } = req.params;
    const detail = await cashRegisterService.getDetail(id);
    return res.status(200).json({ success: true, data: detail });
  } catch (err) {
    if (err instanceof ApiError) {
      return res.status(err.statusCode).json({ success: false, error: err.message });
    }
    console.error('Error al consultar detalle de corte:', err);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
}

module.exports = { open, getCurrent, close, listHistory, getDetail };
