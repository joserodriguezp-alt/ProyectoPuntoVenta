// Rutas de administracion de usuarios: requieren sesion y rol administrador
const express = require('express');
const authMiddleware = require('../../middleware/auth-middleware');
const requireRole = require('../../middleware/role-middleware');
const userController = require('./user-controller');

const router = express.Router();

router.use(authMiddleware, requireRole('administrador'));

// GET /api/users
router.get('/', userController.list);

// POST /api/users
router.post('/', userController.create);

// PATCH /api/users/:id
router.patch('/:id', userController.update);

module.exports = router;
