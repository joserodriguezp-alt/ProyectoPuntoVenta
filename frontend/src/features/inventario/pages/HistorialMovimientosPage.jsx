import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMovimientos } from '@/api/inventario.api';
import { useProductos } from '@/features/productos/hooks/useProductos';
import DataTable from '@/components/DataTable/DataTable';
import { formatDateTime } from '@/utils/dateFormat';
import styles from './HistorialMovimientosPage.module.css';

const TIPO_LABELS = {
  entrada: 'Entrada',
  salida_venta: 'Venta',
  venta: 'Venta',
  devolucion: 'Devolución',
  ajuste: 'Ajuste',
};

export default function HistorialMovimientosPage() {
  const [productoId, setProductoId] = useState('');
  const { data: productos = [] } = useProductos('');

  const { data: movimientos = [], isLoading } = useQuery({
    queryKey: ['movimientos', productoId],
    queryFn: () => getMovimientos(productoId),
    enabled: !!productoId,
  });

  const columns = [
    { key: 'fecha', header: 'Fecha', render: (r) => formatDateTime(r.fecha || r.created_at) },
    { key: 'tipo', header: 'Tipo', render: (r) => <span className={styles[r.tipo] || ''}>{TIPO_LABELS[r.tipo] || r.tipo}</span> },
    {
      key: 'cantidad',
      header: 'Cantidad',
      render: (r) => <span className={r.cantidad > 0 ? styles.pos : styles.neg}>{r.cantidad > 0 ? '+' : ''}{r.cantidad}</span>,
    },
    { key: 'stock_anterior', header: 'Stock anterior', render: (r) => r.stock_anterior ?? r.stock_previo ?? '—' },
    { key: 'stock_resultante', header: 'Stock resultante' },
    { key: 'motivo', header: 'Motivo', render: (r) => r.motivo || r.notas || r.reason || '—' },
  ];

  return (
    <div>
      <h1 className={styles.title}>Historial de Movimientos</h1>

      <div className={styles.filtro}>
        <label className={styles.filtroLabel}>Selecciona un producto:</label>
        <select className={styles.select} value={productoId} onChange={(e) => setProductoId(e.target.value)}>
          <option value="">— Elige un producto —</option>
          {productos.map((p) => (
            <option key={p.id_producto} value={p.id_producto}>
              {p.nombre} {p.codigo_barras ? `(${p.codigo_barras})` : ''}
            </option>
          ))}
        </select>
      </div>

      {!productoId && <p className={styles.hint}>Selecciona un producto para ver sus movimientos de inventario.</p>}

      {productoId && (
        <DataTable columns={columns} data={movimientos} loading={isLoading} emptyMessage="Sin movimientos para este producto" />
      )}
    </div>
  );
}
