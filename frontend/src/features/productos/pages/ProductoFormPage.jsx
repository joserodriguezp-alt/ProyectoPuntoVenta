import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateProducto } from '../hooks/useProductos';
import InputField from '@/components/InputField/InputField';
import Button from '@/components/Button/Button';
import styles from './ProductoFormPage.module.css';

const UNIDADES = ['pieza', 'caja', 'paquete', 'rollo', 'metro', 'litro', 'kilogramo'];

const INITIAL = {
  nombre: '', codigoBarras: '', codigoInterno: '', idCategoria: '',
  precioVenta: '', precioCosto: '', unidadMedida: 'pieza',
  stockInicial: '0', stockMinimo: '0', descripcion: '',
};

export default function ProductoFormPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const createMutation = useCreateProducto();

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  }

  function validate() {
    const errs = {};
    if (!form.nombre.trim()) errs.nombre = 'Campo requerido';
    if (!form.idCategoria) errs.idCategoria = 'Campo requerido';
    if (!form.precioVenta || Number(form.precioVenta) <= 0) errs.precioVenta = 'El precio debe ser mayor a cero';
    if (form.precioCosto === '' || Number(form.precioCosto) < 0) errs.precioCosto = 'El precio de costo no puede ser negativo';
    if (!form.unidadMedida) errs.unidadMedida = 'Campo requerido';
    if (!form.codigoBarras && !form.codigoInterno) errs.codigoBarras = 'Debe proporcionar código de barras o código interno';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setApiError('');
    try {
      await createMutation.mutateAsync({
        name: form.nombre,
        barcode: form.codigoBarras || undefined,
        internalCode: form.codigoInterno || undefined,
        categoryId: Number(form.idCategoria),
        salePrice: Number(form.precioVenta),
        costPrice: Number(form.precioCosto),
        unit: form.unidadMedida,
        initialStock: Number(form.stockInicial),
        minStock: Number(form.stockMinimo),
        description: form.descripcion || undefined,
      });
      navigate('/productos');
    } catch (err) {
      setApiError(err.response?.data?.error || 'Error al guardar el producto');
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Nuevo Producto</h1>
        <Button variant="secondary" onClick={() => navigate('/productos')}>← Volver</Button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.grid}>
          <InputField label="Nombre" name="nombre" value={form.nombre} onChange={(e) => set('nombre', e.target.value)} error={errors.nombre} required />
          <InputField label="ID Categoría" name="idCategoria" type="number" value={form.idCategoria} onChange={(e) => set('idCategoria', e.target.value)} error={errors.idCategoria} required placeholder="1" />
          <InputField label="Código de barras" name="codigoBarras" value={form.codigoBarras} onChange={(e) => set('codigoBarras', e.target.value)} error={errors.codigoBarras} placeholder="7501000000001" />
          <InputField label="Código interno" name="codigoInterno" value={form.codigoInterno} onChange={(e) => set('codigoInterno', e.target.value)} />
          <InputField label="Precio de venta" name="precioVenta" type="number" min="0.01" step="0.01" value={form.precioVenta} onChange={(e) => set('precioVenta', e.target.value)} error={errors.precioVenta} required />
          <InputField label="Precio de costo" name="precioCosto" type="number" min="0" step="0.01" value={form.precioCosto} onChange={(e) => set('precioCosto', e.target.value)} error={errors.precioCosto} required />
          <div>
            <label className={styles.label}>Unidad de medida *</label>
            <select className={styles.select} value={form.unidadMedida} onChange={(e) => set('unidadMedida', e.target.value)}>
              {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <InputField label="Stock inicial" name="stockInicial" type="number" min="0" value={form.stockInicial} onChange={(e) => set('stockInicial', e.target.value)} />
          <InputField label="Stock mínimo" name="stockMinimo" type="number" min="0" value={form.stockMinimo} onChange={(e) => set('stockMinimo', e.target.value)} />
        </div>
        <InputField label="Descripción" name="descripcion" value={form.descripcion} onChange={(e) => set('descripcion', e.target.value)} />
        {apiError && <p className={styles.apiError}>{apiError}</p>}
        <div className={styles.footer}>
          <Button variant="secondary" type="button" onClick={() => navigate('/productos')}>Cancelar</Button>
          <Button type="submit" loading={createMutation.isPending}>Guardar Producto</Button>
        </div>
      </form>
    </div>
  );
}
