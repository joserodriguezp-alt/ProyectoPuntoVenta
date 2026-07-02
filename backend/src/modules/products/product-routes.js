// Rutas del catalogo de productos
const express = require('express');
const authMiddleware = require('../../middleware/auth-middleware');
const requireRole = require('../../middleware/role-middleware');
const productController = require('./product-controller');

const router = express.Router();

router.use(authMiddleware);

// GET /api/products?codigo=...  o  ?q=...  (cajero y administrador)
router.get('/', productController.search);

// POST /api/products (solo administrador)
router.post('/', requireRole('administrador'), productController.create);

// PATCH /api/products/:id (solo administrador)
router.patch('/:id', requireRole('administrador'), productController.update);

// PATCH /api/products/:id/deactivate (solo administrador)
router.patch('/:id/deactivate', requireRole('administrador'), productController.deactivate);

module.exports = router;
