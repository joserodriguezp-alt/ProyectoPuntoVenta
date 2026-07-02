// Acceso a datos de la tabla corte_caja
const { supabase } = require('../../config/database');

async function findOpen() {
  const { data, error } = await supabase
    .from('corte_caja')
    .select('*')
    .eq('estado', 'abierto')
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function findById(id) {
  const { data, error } = await supabase
    .from('corte_caja')
    .select('*')
    .eq('id_corte', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function create({ userId, initialFund }) {
  const { data, error } = await supabase
    .from('corte_caja')
    .insert({ id_usuario: userId, fondo_inicial: initialFund })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function sumSalesByRegister(registerId) {
  const { data, error } = await supabase
    .from('ventas')
    .select('total')
    .eq('id_corte', registerId)
    .neq('estado', 'cancelada');
  if (error) throw error;
  return (data || []).reduce((sum, row) => sum + Number(row.total), 0);
}

async function sumReturnsByRegister(registerId) {
  const { data, error } = await supabase
    .from('devoluciones')
    .select('total_devuelto')
    .eq('id_corte', registerId);
  if (error) throw error;
  return (data || []).reduce((sum, row) => sum + Number(row.total_devuelto), 0);
}

async function close(id, fields) {
  const { data, error } = await supabase
    .from('corte_caja')
    .update({
      fecha_cierre: new Date().toISOString(),
      total_ventas: fields.totalSales,
      total_devoluciones: fields.totalReturns,
      efectivo_esperado: fields.expectedCash,
      efectivo_contado: fields.cashCounted,
      diferencia: fields.difference,
      nota_diferencia: fields.note || null,
      estado: 'cerrado'
    })
    .eq('id_corte', id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function listHistory() {
  const { data, error } = await supabase
    .from('corte_caja')
    .select('*, usuarios(nombre_completo)')
    .eq('estado', 'cerrado')
    .order('fecha_cierre', { ascending: false });
  if (error) throw error;
  return (data || []).map(({ usuarios, ...rest }) => ({
    ...rest,
    cajero_nombre: usuarios?.nombre_completo || null
  }));
}

async function listSalesByRegister(registerId) {
  const { data, error } = await supabase
    .from('ventas')
    .select('*, usuarios(nombre_completo)')
    .eq('id_corte', registerId)
    .order('fecha_venta');
  if (error) throw error;
  return (data || []).map(({ usuarios, ...rest }) => ({
    ...rest,
    cajero_nombre: usuarios?.nombre_completo || null
  }));
}

module.exports = {
  findOpen,
  findById,
  create,
  sumSalesByRegister,
  sumReturnsByRegister,
  close,
  listHistory,
  listSalesByRegister
};
