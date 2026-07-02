// Acceso a datos de la tabla productos (y su historial de precios)
const { supabase } = require('../../config/database');

async function findByBarcode(barcode) {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('codigo_barras', barcode)
    .eq('activo', true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function findById(id) {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('id_producto', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function findActiveById(id) {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('id_producto', id)
    .eq('activo', true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function search(term) {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('activo', true)
    .or(`nombre.ilike.%${term}%,codigo_barras.ilike.%${term}%,codigo_interno.ilike.%${term}%`)
    .order('nombre')
    .limit(50);
  if (error) throw error;
  return data || [];
}

async function listAll() {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('activo', true)
    .order('nombre');
  if (error) throw error;
  return data || [];
}

async function create(data) {
  const { data: result, error } = await supabase
    .from('productos')
    .insert({
      codigo_barras: data.barcode || null,
      codigo_interno: data.internalCode || null,
      nombre: data.name,
      descripcion: data.description || null,
      id_categoria: data.categoryId || null,
      precio_venta: data.salePrice,
      precio_costo: data.costPrice,
      unidad_medida: data.unit,
      stock_actual: data.initialStock,
      stock_minimo: data.minStock
    })
    .select()
    .single();
  if (error) throw error;
  return result;
}

async function update(id, fields) {
  const updates = {};
  if (fields.name !== undefined) updates.nombre = fields.name;
  if (fields.description !== undefined) updates.descripcion = fields.description;
  if (fields.categoryId !== undefined) updates.id_categoria = fields.categoryId;
  if (fields.salePrice !== undefined) updates.precio_venta = fields.salePrice;
  if (fields.costPrice !== undefined) updates.precio_costo = fields.costPrice;
  if (fields.unit !== undefined) updates.unidad_medida = fields.unit;
  if (fields.minStock !== undefined) updates.stock_minimo = fields.minStock;
  if (fields.barcode !== undefined) updates.codigo_barras = fields.barcode;
  if (fields.internalCode !== undefined) updates.codigo_interno = fields.internalCode;

  const { data, error } = await supabase
    .from('productos')
    .update(updates)
    .eq('id_producto', id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function insertPriceHistory({ productId, oldPrice, newPrice, userId }) {
  const { error } = await supabase
    .from('historial_precios')
    .insert({
      id_producto: productId,
      id_usuario: userId,
      precio_anterior: oldPrice,
      precio_nuevo: newPrice
    });
  if (error) throw error;
}

async function deactivate(id) {
  const { data, error } = await supabase
    .from('productos')
    .update({ activo: false })
    .eq('id_producto', id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

module.exports = {
  findByBarcode,
  findById,
  findActiveById,
  search,
  listAll,
  create,
  update,
  insertPriceHistory,
  deactivate
};
