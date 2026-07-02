// Restringe el acceso a una ruta segun el rol del usuario autenticado (debe ejecutarse despues de authMiddleware)
function requireRole(...allowedRoles) {
  return function roleCheck(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Token requerido' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'No tiene permisos para realizar esta accion' });
    }

    return next();
  };
}

module.exports = requireRole;
