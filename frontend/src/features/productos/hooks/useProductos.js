import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProductos, createProducto, updateProducto, deactivateProducto } from '@/api/productos.api';

export function useProductos(search = '') {
  return useQuery({
    queryKey: ['productos', search],
    queryFn: () => getProductos(search),
  });
}

export function useCreateProducto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createProducto,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['productos'] }),
  });
}

export function useUpdateProducto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateProducto(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['productos'] }),
  });
}

export function useDeactivateProducto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => deactivateProducto(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['productos'] }),
  });
}
