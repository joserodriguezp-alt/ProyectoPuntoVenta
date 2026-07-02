// Manejador central de errores: nunca expone detalles internos al cliente
const ApiError = require('../utils/api-error');

function errorMiddleware(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ success: false, error: err.message });
  }

  // Violacion de restriccion UNIQUE de PostgreSQL (codigo de barras duplicado, username duplicado, etc.)
  if (err.code === '23505') {
    return res.status(409).json({ success: false, error: 'El registro ya existe' });
  }

  // Violacion de llave foranea (referencia a un registro inexistente)
  if (err.code === '23503') {
    return res.status(400).json({ success: false, error: 'Referencia invalida a un registro relacionado' });
  }

  // Violacion de un CHECK constraint
  if (err.code === '23514') {
    return res.status(400).json({ success: false, error: 'Los datos no cumplen las reglas de negocio' });
  }

  console.error('Error interno:', err);
  return res.status(500).json({ success: false, error: 'Error interno del servidor' });
}

function notFoundMiddleware(req, res) {
  res.status(404).json({ success: false, error: 'Recurso no encontrado' });
}

module.exports = { errorMiddleware, notFoundMiddleware };
