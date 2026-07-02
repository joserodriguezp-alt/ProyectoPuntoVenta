import client from './client';

export async function getProductos(search = '') {
  const params = search ? { search } : {};
  const { data } = await client.get('/products', { params });
  return data.data;
}

export async function getProductoPorCodigo(barcode) {
  const { data } = await client.get('/products', { params: { search: barcode } });
  const productos = data.data;
  return productos.find((p) => p.codigo_barras === barcode || p.codigo_interno === barcode) || null;
}

export async function createProducto(payload) {
  const { data } = await client.post('/products', payload);
  return data.data;
}

export async function updateProducto(id, payload) {
  const { data } = await client.patch(`/products/${id}`, payload);
  return data.data;
}

export async function deactivateProducto(id) {
  const { data } = await client.patch(`/products/${id}/deactivate`);
  return data.data;
}
