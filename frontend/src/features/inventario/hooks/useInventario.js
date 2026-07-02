import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registrarEntrada, registrarAjuste } from '@/api/inventario.api';

export function useRegistrarEntrada() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: registrarEntrada,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['productos'] }),
  });
}

export function useRegistrarAjuste() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: registrarAjuste,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['productos'] }),
  });
}
