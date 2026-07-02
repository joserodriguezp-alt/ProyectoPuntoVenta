// Acceso a datos de devoluciones y su detalle
const { supabase } = require('../../config/database');

async function insertReturn(data) {
  const { data: result, error } = await supabase
    .from('devoluciones')
    .insert({
      id_venta_origen: data.saleId,
      id_usuario: data.userId,
      id_corte: data.registerId,
      total_devuelto: data.totalReturned,
      nota: data.note || null
    })
    .select()
    .single();
  if (error) throw error;
  return result;
}

async function insertReturnDetail(data) {
  const { data: result, error } = await supabase
    .from('detalle_devolucion')
    .insert({
      id_devolucion: data.returnId,
      id_detalle: data.saleDetailId,
      id_producto: data.productId,
      cantidad_devuelta: data.quantity,
      monto_devuelto: data.amount
    })
    .select()
    .single();
  if (error) throw error;
  return result;
}

module.exports = { insertReturn, insertReturnDetail };
