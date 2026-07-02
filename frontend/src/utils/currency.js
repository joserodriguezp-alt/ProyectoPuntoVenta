export function formatCurrency(value) {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(num);
}

export function round2(value) {
  return Math.round(Number(value) * 100) / 100;
}
