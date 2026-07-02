// Controller de administracion de usuarios (solo administrador)
const ApiError = require('../../utils/api-error');
const userService = require('./user-service');

async function list(req, res) {
  try {
    const users = await userService.listUsers();
    return res.status(200).json({ success: true, data: users });
  } catch (err) {
    console.error('Error al listar usuarios:', err);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
}

async function create(req, res) {
  try {
    const { fullName, username, password, role } = req.body;
    const user = await userService.createUser({ fullName, username, password, role });
    return res.status(201).json({ success: true, data: user });
  } catch (err) {
    if (err instanceof ApiError) {
      return res.status(err.statusCode).json({ success: false, error: err.message });
    }
    console.error('Error al crear usuario:', err);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
}

async function update(req, res) {
  try {
    const { id } = req.params;
    const { fullName, role, active, password } = req.body;
    const user = await userService.updateUser(id, { fullName, role, active, password });
    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    if (err instanceof ApiError) {
      return res.status(err.statusCode).json({ success: false, error: err.message });
    }
    console.error('Error al actualizar usuario:', err);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
}

module.exports = { list, create, update };
