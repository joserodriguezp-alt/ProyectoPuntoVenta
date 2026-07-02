import { useState } from 'react';
import { useProductos } from '@/features/productos/hooks/useProductos';
import EntradaMercanciaModal from '../components/EntradaMercanciaModal';
import AjusteInventarioModal from '../components/AjusteInventarioModal';
import DataTable from '@/components/DataTable/DataTable';
import Button from '@/components/Button/Button';
import styles from './InventarioPage.module.css';

export default function InventarioPage() {
  const [search, setSearch] = useState('');
  const [productoEntrada, setProductoEntrada] = useState(null);
  const [productoAjuste, setProductoAjuste] = useState(null);
  const { data: productos = [], isLoading } = useProductos(search);

  const columns = [
    { key: 'nombre', header: 'Producto' },
    { key: 'codigo_barras', header: 'Código' },
    {
      key: 'stock_actual',
      header: 'Stock',
      render: (r) => (
        <span className={r.stock_actual <= r.stock_minimo ? styles.stockBajo : styles.stockOk}>
          {r.stock_actual}
        </span>
      ),
    },
    { key: 'stock_minimo', header: 'Mín.' },
    { key: 'unidad_medida', header: 'Unidad' },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (r) => (
        <div className={styles.actions}>
          <Button onClick={() => setProductoEntrada(r)}>+ Entrada</Button>
          <Button variant="secondary" onClick={() => setProductoAjuste(r)}>Ajustar</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Inventario</h1>
      </div>

      <input
        className={styles.search}
        placeholder="Buscar producto..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <DataTable columns={columns} data={productos} loading={isLoading} emptyMessage="Sin productos" />

      {productoEntrada && (
        <EntradaMercanciaModal
          isOpen={!!productoEntrada}
          onClose={() => setProductoEntrada(null)}
          producto={productoEntrada}
        />
      )}
      {productoAjuste && (
        <AjusteInventarioModal
          isOpen={!!productoAjuste}
          onClose={() => setProductoAjuste(null)}
          producto={productoAjuste}
        />
      )}
    </div>
  );
}
