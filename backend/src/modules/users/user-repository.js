// Acceso a datos de la tabla usuarios
const { supabase } = require('../../config/database');

const PUBLIC_COLUMNS = 'id_usuario, nombre_completo, username, rol, activo, created_at';

async function findByUsername(username) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('username', username)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function findById(id) {
  const { data, error } = await supabase
    .from('usuarios')
    .select(PUBLIC_COLUMNS)
    .eq('id_usuario', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function listUsers() {
  const { data, error } = await supabase
    .from('usuarios')
    .select(PUBLIC_COLUMNS)
    .order('nombre_completo');
  if (error) throw error;
  return data || [];
}

async function createUser({ fullName, username, passwordHash, role }) {
  const { data, error } = await supabase
    .from('usuarios')
    .insert({ nombre_completo: fullName, username, password_hash: passwordHash, rol: role })
    .select(PUBLIC_COLUMNS)
    .single();
  if (error) throw error;
  return data;
}

async function updateUser(id, { fullName, role, active, passwordHash }) {
  const updates = {};
  if (fullName !== undefined && fullName !== null) updates.nombre_completo = fullName;
  if (role !== undefined && role !== null) updates.rol = role;
  if (active !== undefined && active !== null) updates.activo = active;
  if (passwordHash !== undefined && passwordHash !== null) updates.password_hash = passwordHash;

  const { data, error } = await supabase
    .from('usuarios')
    .update(updates)
    .eq('id_usuario', id)
    .select(PUBLIC_COLUMNS)
    .maybeSingle();
  if (error) throw error;
  return data;
}

module.exports = { findByUsername, findById, listUsers, createUser, updateUser };
