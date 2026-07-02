import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCajaActual, useCerrarCaja } from '../hooks/useCaja';
import { formatCurrency } from '@/utils/currency';
import { formatDateTime } from '@/utils/dateFormat';
import InputField from '@/components/InputField/InputField';
import Button from '@/components/Button/Button';
import styles from './CorteCajaPage.module.css';

export default function CorteCajaPage() {
  const navigate = useNavigate();
  const { data: caja, isLoading } = useCajaActual();
  const cerrarMutation = useCerrarCaja();
  const [efectivoContado, setEfectivoContado] = useState('');
  const [notas, setNotas] = useState('');
  const [error, setError] = useState('');
  const [confirmando, setConfirmando] = useState(false);

  if (isLoading) return <p>Cargando...</p>;

  if (!caja || caja.estado !== 'abierto') {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Corte de Caja</h1>
        <div className={styles.sinCaja}>
          No hay caja abierta.
          <Button variant="secondary" onClick={() => navigate('/caja/apertura')}>Ir a Apertura</Button>
        </div>
      </div>
    );
  }

  async function handleCerrar() {
    if (efectivoContado === '') { setError('Ingresa el efectivo contado'); return; }
    setError('');
    try {
      await cerrarMutation.mutateAsync({
        id: caja.id_corte,
        payload: {
          cashCounted: Number(efectivoContado),
          note: notas || undefined,
        },
      });
      navigate('/caja/historial');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cerrar caja');
    }
  }

  const totalVentas = Number(caja.total_ventas || 0);
  const totalDevoluciones = Number(caja.total_devoluciones || 0);
  const diferencia = efectivoContado !== '' ? Number(efectivoContado) - (Number(caja.fondo_inicial) + totalVentas) : null;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Corte de Caja</h1>
      <div className={styles.card}>
        <div className={styles.resumen}>
          <div className={styles.resumenItem}><span>Apertura</span><strong>{formatDateTime(caja.fecha_apertura)}</strong></div>
          <div className={styles.resumenItem}><span>Fondo inicial</span><strong>{formatCurrency(caja.fondo_inicial)}</strong></div>
          <div className={styles.resumenItem}><span>Ventas del turno</span><strong>{formatCurrency(totalVentas)}</strong></div>
          <div className={styles.resumenItem}><span>Devoluciones</span><strong className={styles.neg}>{formatCurrency(totalDevoluciones)}</strong></div>
          <div className={`${styles.resumenItem} ${styles.esperado}`}>
            <span>Efectivo esperado</span>
            <strong>{formatCurrency(Number(caja.fondo_inicial) + totalVentas - totalDevoluciones)}</strong>
          </div>
        </div>

        <InputField
          label="Efectivo contado en caja"
          type="number"
          min="0"
          step="0.01"
          value={efectivoContado}
          onChange={(e) => { setEfectivoContado(e.target.value); setError(''); }}
          placeholder="0.00"
          required
        />

        {diferencia !== null && (
          <div className={`${styles.diferencia} ${diferencia < 0 ? styles.negativa : diferencia > 0 ? styles.positiva : styles.ok}`}>
            {diferencia === 0 ? 'Cuadre exacto' : diferencia > 0 ? `Sobrante: ${formatCurrency(diferencia)}` : `Faltante: ${formatCurrency(Math.abs(diferencia))}`}
          </div>
        )}

        <InputField label="Notas del corte" value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Observaciones..." />

        {error && <p className={styles.error}>{error}</p>}

        {!confirmando ? (
          <Button variant="danger" fullWidth onClick={() => setConfirmando(true)}>
            Cerrar Caja
          </Button>
        ) : (
          <div className={styles.confirmar}>
            <p>¿Confirmar cierre de caja? Esta acción no se puede deshacer.</p>
            <div className={styles.confirmarBtns}>
              <Button variant="secondary" onClick={() => setConfirmando(false)}>Cancelar</Button>
              <Button variant="danger" loading={cerrarMutation.isPending} onClick={handleCerrar}>Confirmar Cierre</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
