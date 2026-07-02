// Rutas de inventario
const express = require('express');
const authMiddleware = require('../../middleware/auth-middleware');
const requireRole = require('../../middleware/role-middleware');
const inventoryController = require('./inventory-controller');

const router = express.Router();

router.use(authMiddleware);

// GET /api/inventory/:productId (cajero y administrador)
router.get('/:productId', inventoryController.getStock);

// GET /api/inventory/:productId/movements?from=&to= (cajero y administrador)
router.get('/:productId/movements', inventoryController.getMovements);

// POST /api/inventory/entries (solo administrador)
router.post('/entries', requireRole('administrador'), inventoryController.registerEntry);

// POST /api/inventory/adjustments (solo administrador)
router.post('/adjustments', requireRole('administrador'), inventoryController.registerAdjustment);

module.exports = router;
