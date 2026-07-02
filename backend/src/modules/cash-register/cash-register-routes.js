// Rutas de corte de caja
const express = require('express');
const authMiddleware = require('../../middleware/auth-middleware');
const requireRole = require('../../middleware/role-middleware');
const cashRegisterController = require('./cash-register-controller');

const router = express.Router();

router.use(authMiddleware);

// POST /api/cash-register/open (cajero y administrador)
router.post('/open', cashRegisterController.open);

// GET /api/cash-register/current (cajero y administrador)
router.get('/current', cashRegisterController.getCurrent);

// PATCH /api/cash-register/:id/close (cajero y administrador)
router.patch('/:id/close', cashRegisterController.close);

// GET /api/cash-register/history (solo administrador)
router.get('/history', requireRole('administrador'), cashRegisterController.listHistory);

// GET /api/cash-register/:id (solo administrador)
router.get('/:id', requireRole('administrador'), cashRegisterController.getDetail);

module.exports = router;
