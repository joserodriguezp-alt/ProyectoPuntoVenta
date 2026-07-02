import { useState } from 'react';
import { formatCurrency, round2 } from '@/utils/currency';
import Button from '@/components/Button/Button';
import styles from './PanelPago.module.css';

const FORMAS = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'tarjeta_debito', label: 'Débito' },
  { value: 'tarjeta_credito', label: 'Crédito' },
  { value: 'transferencia', label: 'Transferencia' },
];

export default function PanelPago({ total, onCobrar, onDescuento, descuentoGlobal, loading, disabled }) {
  const [formaPago, setFormaPago] = useState('efectivo');
  const [efectivoRecibido, setEfectivoRecibido] = useState('');

  const cambio = formaPago === 'efectivo' && efectivoRecibido
    ? round2(Number(efectivoRecibido) - total)
    : null;

  const puedeCobrar = !disabled && (
    formaPago !== 'efectivo' || (Number(efectivoRecibido) >= total)
  );

  function handleCobrar() {
    onCobrar({
      paymentMethod: formaPago,
      amountPaid: formaPago === 'efectivo' ? Number(efectivoRecibido) : total,
    });
  }

  return (
    <div className={styles.panel}>
      <div className={styles.totalArea}>
        <span className={styles.totalLabel}>TOTAL A PAGAR</span>
        <span className={styles.totalValue}>{formatCurrency(total)}</span>
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>Forma de pago</span>
        <div className={styles.formas}>
          {FORMAS.map((f) => (
            <button
              key={f.value}
              className={`${styles.formaBtn} ${formaPago === f.value ? styles.activa : ''}`}
              onClick={() => setFormaPago(f.value)}
              type="button"
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {formaPago === 'efectivo' && (
        <div className={styles.section}>
          <label className={styles.sectionLabel}>Efectivo recibido</label>
          <input
            className={styles.moneyInput}
            type="number"
            min={total}
            step="0.01"
            value={efectivoRecibido}
            onChange={(e) => setEfectivoRecibido(e.target.value)}
            placeholder="0.00"
          />
          {cambio !== null && (
            <div className={`${styles.cambioRow} ${cambio < 0 ? styles.negativo : ''}`}>
              <span>{cambio < 0 ? 'Falta' : 'Cambio'}</span>
              <span>{formatCurrency(Math.abs(cambio))}</span>
            </div>
          )}
        </div>
      )}

      <Button
        variant="success"
        fullWidth
        onClick={handleCobrar}
        disabled={!puedeCobrar}
        loading={loading}
      >
        Cobrar {formatCurrency(total)}
      </Button>

      <Button variant="secondary" fullWidth onClick={onDescuento} type="button">
        {descuentoGlobal > 0 ? `Desc. global: ${descuentoGlobal}%` : 'Aplicar descuento global'}
      </Button>
    </div>
  );
}
