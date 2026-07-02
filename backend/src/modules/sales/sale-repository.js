// Acceso a datos de ventas y detalle de venta
const { supabase } = require('../../config/database');

// Genera un folio unico llamando la funcion PostgreSQL generate_folio_venta()
async function nextFolio() {
  const { data, error } = await supabase.rpc('generate_folio_venta');
  if (error) throw error;
  return data;
}

async function insertSale(sale) {
  const { data, error } = await supabase
    .from('ventas')
    .insert({
      folio: sale.folio,
      id_corte: sale.registerId,
      id_usuario: sale.userId,
      subtotal: sale.subtotal,
      descuento: sale.discount,
      total: sale.total,
      monto_recibido: sale.amountReceived,
      cambio: sale.change,
      metodo_pago: 'efectivo',
      estado: 'completada'
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function insertSaleDetail(detail) {
  const { data, error } = await supabase
    .from('detalle_venta')
    .insert({
      id_venta: detail.saleId,
      id_producto: detail.productId,
      cantidad: detail.quantity,
      precio_unitario: detail.unitPrice,
      descuento_renglon: detail.lineDiscount,
      subtotal: detail.subtotal
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Busca solo el encabezado de la venta (para uso interno en devoluciones)
async function findSaleByFolio(folio) {
  const { data, error } = await supabase
    .from('ventas')
    .select('*')
    .eq('folio', folio)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Busca la venta con su detalle completo (para el endpoint GET /sales/:folio)
async function findByFolio(folio) {
  const { data: sale, error: saleError } = await supabase
    .from('ventas')
    .select('*')
    .eq('folio', folio)
    .maybeSingle();
  if (saleError) throw saleError;
  if (!sale) return null;

  const { data: details, error: detailError } = await supabase
    .from('detalle_venta')
    .select('*, productos(nombre)')
    .eq('id_venta', sale.id_venta)
    .order('id_detalle');
  if (detailError) throw detailError;

  return {
    ...sale,
    detalle: (details || []).map(({ productos, ...rest }) => ({
      ...rest,
      producto_nombre: productos?.nombre || null
    }))
  };
}

async function findSaleDetailById(detailId) {
  const { data, error } = await supabase
    .from('detalle_venta')
    .select('*')
    .eq('id_detalle', detailId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function sumReturnedQuantity(detailId) {
  const { data, error } = await supabase
    .from('detalle_devolucion')
    .select('cantidad_devuelta')
    .eq('id_detalle', detailId);
  if (error) throw error;
  return (data || []).reduce((sum, row) => sum + Number(row.cantidad_devuelta), 0);
}

async function updateSaleStatus(saleId, status) {
  const { data, error } = await supabase
    .from('ventas')
    .update({ estado: status })
    .eq('id_venta', saleId)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

module.exports = {
  nextFolio,
  insertSale,
  insertSaleDetail,
  findByFolio,
  findSaleByFolio,
  findSaleDetailById,
  sumReturnedQuantity,
  updateSaleStatus
};
