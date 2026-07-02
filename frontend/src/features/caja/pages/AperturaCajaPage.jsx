import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCajaActual, useAbrirCaja } from '../hooks/useCaja';
import { formatCurrency } from '@/utils/currency';
import { formatDateTime } from '@/utils/dateFormat';
import InputField from '@/components/InputField/InputField';
import Button from '@/components/Button/Button';
import styles from './AperturaCajaPage.module.css';

export default function AperturaCajaPage() {
  const navigate = useNavigate();
  const { data: caja, isLoading, error } = useCajaActual();
  const abrirMutation = useAbrirCaja();
  const [fondoInicial, setFondoInicial] = useState('');
  const [errores, setErrores] = useState('');

  async function handleAbrir() {
    const n = Number(fondoInicial);
    if (isNaN(n) || n < 0) { setErrores('El fondo inicial no puede ser negativo'); return; }
    setErrores('');
    try {
      await abrirMutation.mutateAsync({ initialFund: n });
    } catch (err) {
      setErrores(err.response?.data?.error || 'Error al abrir caja');
    }
  }

  if (isLoading) return <p>Verificando estado de caja...</p>;

  if (caja && caja.estado === 'abierto') {
    return (
      <div className={styles.page}>
        <div className={styles.abierta}>
          <div className={styles.badge}>Caja Abierta</div>
          <h1 className={styles.title}>Caja en turno</h1>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}><span>Fondo inicial</span><strong>{formatCurrency(caja.fondo_inicial)}</strong></div>
            <div className={styles.infoItem}><span>Abierta a las</span><strong>{formatDateTime(caja.fecha_apertura)}</strong></div>
          </div>
          <Button onClick={() => navigate('/caja/corte')}>Ir a Corte de Caja</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Apertura de Caja</h1>
      <div className={styles.card}>
        <p className={styles.hint}>Registra el fondo inicial del turno para comenzar a cobrar.</p>
        <InputField
          label="Fondo inicial (efectivo en caja)"
          type="number"
          min="0"
          step="0.01"
          value={fondoInicial}
          onChange={(e) => { setFondoInicial(e.target.value); setErrores(''); }}
          placeholder="0.00"
        />
        {errores && <p className={styles.error}>{errores}</p>}
        <Button fullWidth loading={abrirMutation.isPending} onClick={handleAbrir}>
          Abrir Caja
        </Button>
      </div>
    </div>
  );
}
