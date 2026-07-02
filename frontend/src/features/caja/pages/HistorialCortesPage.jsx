import { useState } from 'react';
import { useHistorialCortes, useDetalleCorte } from '../hooks/useCaja';
import { formatCurrency } from '@/utils/currency';
import { formatDateTime } from '@/utils/dateFormat';
import DataTable from '@/components/DataTable/DataTable';
import Modal from '@/components/Modal/Modal';
import Button from '@/components/Button/Button';
import styles from './HistorialCortesPage.module.css';

export default function HistorialCortesPage() {
  const [corteId, setCorteId] = useState(null);
  const { data: cortes = [], isLoading } = useHistorialCortes();
  const { data: detalle } = useDetalleCorte(corteId);

  const columns = [
    { key: 'fecha_cierre', header: 'Fecha cierre', render: (r) => r.fecha_cierre ? formatDateTime(r.fecha_cierre) : '—' },
    { key: 'cajero', header: 'Cajero' },
    { key: 'fondo_inicial', header: 'Fondo inicial', render: (r) => formatCurrency(r.fondo_inicial) },
    { key: 'total_ventas', header: 'Ventas', render: (r) => formatCurrency(r.total_ventas || 0) },
    { key: 'total_devoluciones', header: 'Devoluciones', render: (r) => formatCurrency(r.total_devoluciones || 0) },
    { key: 'efectivo_contado', header: 'Contado', render: (r) => r.efectivo_contado != null ? formatCurrency(r.efectivo_contado) : '—' },
    {
      key: 'diferencia',
      header: 'Diferencia',
      render: (r) => {
        if (r.diferencia == null) return '—';
        const d = Number(r.diferencia);
        return <span className={d < 0 ? styles.neg : d > 0 ? styles.pos : styles.ok}>{formatCurrency(d)}</span>;
      },
    },
    {
      key: 'acciones',
      header: '',
      render: (r) => <Button variant="secondary" onClick={() => setCorteId(r.id_caja)}>Ver detalle</Button>,
    },
  ];

  return (
    <div>
      <h1 className={styles.title}>Historial de Cortes</h1>
      <DataTable columns={columns} data={cortes} loading={isLoading} emptyMessage="Sin cortes registrados" />

      <Modal isOpen={!!corteId} onClose={() => setCorteId(null)} title="Detalle del Corte">
        {detalle ? (
          <div className={styles.detalle}>
            <div className={styles.detalleGrid}>
              <span>Apertura</span><strong>{formatDateTime(detalle.fecha_apertura)}</strong>
              <span>Cierre</span><strong>{detalle.fecha_cierre ? formatDateTime(detalle.fecha_cierre) : '—'}</strong>
              <span>Fondo inicial</span><strong>{formatCurrency(detalle.fondo_inicial)}</strong>
              <span>Total ventas</span><strong>{formatCurrency(detalle.total_ventas || 0)}</strong>
              <span>Total devoluciones</span><strong className={styles.neg}>{formatCurrency(detalle.total_devoluciones || 0)}</strong>
              <span>Efectivo contado</span><strong>{detalle.efectivo_contado != null ? formatCurrency(detalle.efectivo_contado) : '—'}</strong>
              <span>Diferencia</span><strong className={Number(detalle.diferencia) < 0 ? styles.neg : styles.pos}>{detalle.diferencia != null ? formatCurrency(detalle.diferencia) : '—'}</strong>
            </div>
            {detalle.notas && <p className={styles.notas}>Notas: {detalle.notas}</p>}
          </div>
        ) : <p>Cargando...</p>}
      </Modal>
    </div>
  );
}
