import { useState } from 'react';
import Modal from '@/components/Modal/Modal';
import Button from '@/components/Button/Button';
import InputField from '@/components/InputField/InputField';
import { useRegistrarEntrada } from '../hooks/useInventario';
import styles from './InventarioModal.module.css';

export default function EntradaMercanciaModal({ isOpen, onClose, producto }) {
  const [cantidad, setCantidad] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [fechaFactura, setFechaFactura] = useState('');
  const [error, setError] = useState('');
  const entradaMutation = useRegistrarEntrada();

  async function handleSubmit() {
    if (!cantidad || Number(cantidad) <= 0) { setError('La cantidad debe ser mayor a cero'); return; }
    setError('');
    try {
      await entradaMutation.mutateAsync({
        productId: producto.id_producto,
        quantity: Number(cantidad),
        supplier: proveedor || undefined,
        invoiceDate: fechaFactura || undefined,
      });
      setCantidad('');
      setProveedor('');
      setFechaFactura('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar entrada');
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Entrada de Mercancía — ${producto?.nombre || ''}`}>
      <div className={styles.body}>
        <p className={styles.info}>Stock actual: <strong>{producto?.stock_actual}</strong></p>
        <InputField label="Cantidad a ingresar" type="number" min="1" value={cantidad} onChange={(e) => { setCantidad(e.target.value); setError(''); }} required />
        <InputField label="Proveedor (opcional)" value={proveedor} onChange={(e) => setProveedor(e.target.value)} placeholder="Nombre del proveedor" />
        <InputField label="Fecha de factura (opcional)" type="date" value={fechaFactura} onChange={(e) => setFechaFactura(e.target.value)} />
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button loading={entradaMutation.isPending} onClick={handleSubmit}>Registrar Entrada</Button>
        </div>
      </div>
    </Modal>
  );
}
