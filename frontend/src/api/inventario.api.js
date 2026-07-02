import client from './client';

export async function getMovimientos(productId, from, to) {
  const params = {};
  if (from) params.from = from;
  if (to) params.to = to;
  const { data } = await client.get(`/inventory/${productId}/movements`, { params });
  return data.data;
}

export async function registrarEntrada(payload) {
  const { data } = await client.post('/inventory/entries', payload);
  return data.data;
}

export async function registrarAjuste(payload) {
  const { data } = await client.post('/inventory/adjustments', payload);
  return data.data;
}
