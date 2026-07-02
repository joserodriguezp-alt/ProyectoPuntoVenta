// Logica de negocio de usuarios: autenticacion y administracion de cuentas
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const ApiError = require('../../utils/api-error');
const userRepository = require('./user-repository');

const VALID_ROLES = ['administrador', 'cajero'];

// Quita el password_hash antes de devolver el usuario al cliente
function toPublicUser(user) {
  return {
    id: user.id_usuario,
    fullName: user.nombre_completo,
    username: user.username,
    role: user.rol,
    active: user.activo,
    createdAt: user.created_at
  };
}

async function login(username, password) {
  if (!username || !password) {
    throw new ApiError(400, 'Usuario y contrasena requeridos');
  }

  const user = await userRepository.findByUsername(username);
  if (!user || !user.activo) {
    throw new ApiError(401, 'Usuario no encontrado');
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    throw new ApiError(401, 'Contrasena incorrecta');
  }

  const token = jwt.sign(
    { id: user.id_usuario, username: user.username, role: user.rol },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

  return { token, user: toPublicUser(user) };
}

async function listUsers() {
  const users = await userRepository.listUsers();
  return users.map(toPublicUser);
}

async function createUser({ fullName, username, password, role }) {
  if (!fullName || !username || !password) {
    throw new ApiError(400, 'Nombre completo, usuario y contrasena son obligatorios');
  }

  const finalRole = role || 'cajero';
  if (!VALID_ROLES.includes(finalRole)) {
    throw new ApiError(400, `El rol debe ser uno de: ${VALID_ROLES.join(', ')}`);
  }

  const passwordHash = await bcrypt.hash(password, env.bcryptSaltRounds);
  const created = await userRepository.createUser({ fullName, username, passwordHash, role: finalRole });
  return toPublicUser(created);
}

async function updateUser(id, { fullName, role, active, password }) {
  if (role && !VALID_ROLES.includes(role)) {
    throw new ApiError(400, `El rol debe ser uno de: ${VALID_ROLES.join(', ')}`);
  }

  const passwordHash = password ? await bcrypt.hash(password, env.bcryptSaltRounds) : null;

  const updated = await userRepository.updateUser(id, { fullName, role, active, passwordHash });
  if (!updated) {
    throw new ApiError(404, 'Usuario no encontrado');
  }
  return toPublicUser(updated);
}

module.exports = { login, listUsers, createUser, updateUser, toPublicUser };
