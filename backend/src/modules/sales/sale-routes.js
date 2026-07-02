// Rutas de ventas y devoluciones
const express = require('express');
const authMiddleware = require('../../middleware/auth-middleware');
const saleController = require('./sale-controller');

const router = express.Router();

router.use(authMiddleware);

// POST /api/sales (cajero y administrador)
router.post('/', saleController.create);

// GET /api/sales/:folio (cajero y administrador)
router.get('/:folio', saleController.getByFolio);

// POST /api/sales/returns (cajero y administrador)
router.post('/returns', saleController.createReturn);

module.exports = router;
