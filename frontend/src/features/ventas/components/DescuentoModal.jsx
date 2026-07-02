import { useState } from 'react';
import Modal from '@/components/Modal/Modal';
import Button from '@/components/Button/Button';
import InputField from '@/components/InputField/InputField';
import styles from './DescuentoModal.module.css';

const THRESHOLD = Number(import.meta.env.VITE_DISCOUNT_THRESHOLD || 20);

export default function DescuentoModal({ isOpen, onClose, onAplicar, descuentoActual }) {
  const [valor, setValor] = useState(String(descuentoActual || ''));
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');

  const requiereAuth = Number(valor) > THRESHOLD;

  function handleAplicar() {
    const n = Number(valor);
    if (isNaN(n) || n < 0 || n > 100) { setError('El descuento debe estar entre 0 y 100'); return; }
    if (requiereAuth && !clave.trim()) { setError('Se requiere clave de autorización para descuentos mayores al ' + THRESHOLD + '%'); return; }
    setError('');
    onAplicar(n, clave || undefined);
    setValor('');
    setClave('');
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Descuento Global">
      <div className={styles.body}>
        <InputField
          label="Porcentaje de descuento"
          type="number"
          min="0"
          max="100"
          value={valor}
          onChange={(e) => { setValor(e.target.value); setError(''); }}
          placeholder="0"
        />
        {requiereAuth && (
          <InputField
            label="Clave de autorización (gerente)"
            type="password"
            value={clave}
            onChange={(e) => { setClave(e.target.value); setError(''); }}
          />
        )}
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleAplicar}>Aplicar</Button>
        </div>
      </div>
    </Modal>
  );
}
