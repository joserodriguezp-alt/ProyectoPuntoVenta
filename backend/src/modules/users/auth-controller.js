// Controller de autenticacion (login)
const ApiError = require('../../utils/api-error');
const userService = require('./user-service');

async function login(req, res) {
  try {
    const { username, password } = req.body;
    const result = await userService.login(username, password);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    if (err instanceof ApiError) {
      return res.status(err.statusCode).json({ success: false, error: err.message });
    }
    console.error('Error en login:', err);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
}

module.exports = { login };
