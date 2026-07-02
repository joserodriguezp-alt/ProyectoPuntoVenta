import client from './client';

export async function getCajaActual() {
  const { data } = await client.get('/cash-register/current');
  return data.data;
}

export async function abrirCaja(payload) {
  const { data } = await client.post('/cash-register/open', payload);
  return data.data;
}

export async function cerrarCaja(id, payload) {
  const { data } = await client.patch(`/cash-register/${id}/close`, payload);
  return data.data;
}

export async function getHistorialCortes() {
  const { data } = await client.get('/cash-register/history');
  return data.data;
}

export async function getDetalleCorte(id) {
  const { data } = await client.get(`/cash-register/${id}`);
  return data.data;
}
