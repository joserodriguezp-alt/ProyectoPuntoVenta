import client from './client';

export async function createVenta(payload) {
  const { data } = await client.post('/sales', payload);
  return data.data;
}

export async function getVentaPorFolio(folio) {
  const { data } = await client.get(`/sales/${folio}`);
  return data.data;
}

export async function createDevolucion(payload) {
  const { data } = await client.post('/sales/returns', payload);
  return data.data;
}
