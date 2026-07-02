import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductos, useDeactivateProducto } from '../hooks/useProductos';
import DataTable from '@/components/DataTable/DataTable';
import Button from '@/components/Button/Button';
import Modal from '@/components/Modal/Modal';
import { formatCurrency } from '@/utils/currency';
import styles from './CatalogoProductosPage.module.css';

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useState(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  });
  return debounced;
}

export default function CatalogoProductosPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [toDeactivate, setToDeactivate] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const debouncedSearch = useDebounce(search);

  const { data: productos = [], isLoading } = useProductos(debouncedSearch);
  const deactivateMutation = useDeactivateProducto();

  const handleDeactivate = useCallback(async () => {
    try {
      await deactivateMutation.mutateAsync(toDeactivate.id_producto);
      setSuccessMsg('Producto desactivado');
      setToDeactivate(null);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.error || 'Error al desactivar');
    }
  }, [toDeactivate, deactivateMutation]);

  const columns = [
    { key: 'nombre', header: 'Nombre' },
    { key: 'codigo_barras', header: 'Código' },
    { key: 'precio_venta', header: 'Precio', render: (r) => formatCurrency(r.precio_venta) },
    { key: 'stock_actual', header: 'Stock' },
    {
      key: 'activo',
      header: 'Estado',
      render: (r) => (
        <span className={r.activo ? styles.active : styles.inactive}>
          {r.activo ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (r) => (
        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => navigate(`/productos/${r.id_producto}/editar`)}>
            Editar
          </Button>
          {r.activo && (
            <Button variant="danger" onClick={() => setToDeactivate(r)}>
              Desactivar
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Catálogo de Productos</h1>
        <Button onClick={() => navigate('/productos/nuevo')}>+ Nuevo Producto</Button>
      </div>

      {successMsg && <p className={styles.success}>{successMsg}</p>}

      <input
        className={styles.search}
        placeholder="Buscar por nombre, código de barras o código interno..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <DataTable columns={columns} data={productos} loading={isLoading} emptyMessage="No se encontraron productos" />

      <Modal isOpen={!!toDeactivate} onClose={() => setToDeactivate(null)} title="Confirmar desactivación">
        <p style={{ marginBottom: 20 }}>
          ¿Deseas desactivar el producto <strong>{toDeactivate?.nombre}</strong>? No aparecerá en búsquedas de venta.
        </p>
        <div className={styles.modalActions}>
          <Button variant="secondary" onClick={() => setToDeactivate(null)}>Cancelar</Button>
          <Button variant="danger" loading={deactivateMutation.isPending} onClick={handleDeactivate}>
            Desactivar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
