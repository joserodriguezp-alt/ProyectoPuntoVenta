import { useState } from 'react';
import Modal from '@/components/Modal/Modal';
import Button from '@/components/Button/Button';
import InputField from '@/components/InputField/InputField';
import { useRegistrarAjuste } from '../hooks/useInventario';
import styles from './InventarioModal.module.css';

export default function AjusteInventarioModal({ isOpen, onClose, producto }) {
  const [nuevoStock, setNuevoStock] = useState('');
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState('');
  const ajusteMutation = useRegistrarAjuste();

  async function handleSubmit() {
    if (nuevoStock === '' || Number(nuevoStock) < 0) { setError('El stock debe ser un número mayor o igual a cero'); return; }
    if (!motivo.trim()) { setError('El motivo es obligatorio'); return; }
    setError('');
    const delta = Number(nuevoStock) - Number(producto.stock_actual);
    if (delta === 0) { setError('El nuevo stock es igual al stock actual'); return; }
    try {
      await ajusteMutation.mutateAsync({
        productId: producto.id_producto,
        quantity: delta,
        reason: motivo,
        confirm: true,
      });
      setNuevoStock('');
      setMotivo('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar ajuste');
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Ajuste de Inventario — ${producto?.nombre || ''}`}>
      <div className={styles.body}>
        <p className={styles.info}>Stock actual: <strong>{producto?.stock_actual}</strong></p>
        <InputField label="Nuevo stock (cantidad final)" type="number" min="0" value={nuevoStock} onChange={(e) => { setNuevoStock(e.target.value); setError(''); }} required />
        {nuevoStock !== '' && nuevoStock !== String(producto?.stock_actual) && (
          <p className={styles.info}>
            Diferencia: <strong>{Number(nuevoStock) - Number(producto?.stock_actual) > 0 ? '+' : ''}{Number(nuevoStock) - Number(producto?.stock_actual)}</strong>
          </p>
        )}
        <InputField label="Motivo del ajuste" value={motivo} onChange={(e) => { setMotivo(e.target.value); setError(''); }} required placeholder="Conteo físico, merma, corrección..." />
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="danger" loading={ajusteMutation.isPending} onClick={handleSubmit}>Aplicar Ajuste</Button>
        </div>
      </div>
    </Modal>
  );
}
