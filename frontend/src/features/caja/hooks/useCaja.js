import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCajaActual, abrirCaja, cerrarCaja, getHistorialCortes, getDetalleCorte } from '@/api/caja.api';

export function useCajaActual() {
  return useQuery({ queryKey: ['caja-actual'], queryFn: getCajaActual, retry: false });
}

export function useAbrirCaja() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: abrirCaja, onSuccess: () => qc.invalidateQueries({ queryKey: ['caja-actual'] }) });
}

export function useCerrarCaja() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => cerrarCaja(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['caja-actual'] }); qc.invalidateQueries({ queryKey: ['historial-cortes'] }); },
  });
}

export function useHistorialCortes() {
  return useQuery({ queryKey: ['historial-cortes'], queryFn: getHistorialCortes });
}

export function useDetalleCorte(id) {
  return useQuery({ queryKey: ['corte', id], queryFn: () => getDetalleCorte(id), enabled: !!id });
}
