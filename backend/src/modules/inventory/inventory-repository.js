// Acceso a datos de inventario: stock de productos y bitacora de movimientos
const { supabase } = require('../../config/database');

async function findStockByProductId(productId) {
  const { data, error } = await supabase
    .from('productos')
    .select('id_producto, nombre, stock_actual, stock_minimo, unidad_medida')
    .eq('id_producto', productId)
    .eq('activo', true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function findProductById(productId) {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('id_producto', productId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function updateStock(productId, newStock) {
  const { data, error } = await supabase
    .from('productos')
    .update({ stock_actual: newStock })
    .eq('id_producto', productId)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function insertMovement(movement) {
  const { data, error } = await supabase
    .from('movimientos_inventario')
    .insert({
      id_producto: movement.productId,
      id_usuario: movement.userId,
      tipo: movement.type,
      cantidad: movement.quantity,
      stock_anterior: movement.previousStock,
      stock_resultante: movement.resultingStock,
      referencia_id: movement.referenceId || null,
      referencia_tipo: movement.referenceType || null,
      motivo: movement.reason || null
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function listMovements(productId, from, to) {
  let query = supabase
    .from('movimientos_inventario')
    .select('*, usuarios(nombre_completo)')
    .eq('id_producto', productId)
    .order('fecha', { ascending: false });

  if (from) query = query.gte('fecha', from);
  if (to) query = query.lte('fecha', to);

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map(({ usuarios, ...rest }) => ({
    ...rest,
    usuario_nombre: usuarios?.nombre_completo || null
  }));
}

module.exports = { findStockByProductId, findProductById, updateStock, insertMovement, listMovements };
