import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProductos } from '@/api/productos.api';
import { useUpdateProducto } from '../hooks/useProductos';
import InputField from '@/components/InputField/InputField';
import Button from '@/components/Button/Button';
import styles from './ProductoFormPage.module.css';

export default function ProductoEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const updateMutation = useUpdateProducto();

  const { data: productos = [] } = useQuery({
    queryKey: ['productos', ''],
    queryFn: () => getProductos(''),
  });

  useEffect(() => {
    const p = productos.find((p) => String(p.id_producto) === id);
    if (p) {
      setForm({
        nombre: p.nombre || '',
        precioVenta: String(p.precio_venta || ''),
        precioCosto: String(p.precio_costo || ''),
        stockMinimo: String(p.stock_minimo || ''),
        descripcion: p.descripcion || '',
        codigoBarras: p.codigo_barras || '',
        codigoInterno: p.codigo_interno || '',
      });
    }
  }, [productos, id]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (form.precioVenta && Number(form.precioVenta) <= 0) errs.precioVenta = 'El precio debe ser mayor a cero';
    if (form.precioCosto !== '' && Number(form.precioCosto) < 0) errs.precioCosto = 'El precio de costo no puede ser negativo';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setApiError('');
    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          name: form.nombre || undefined,
          salePrice: form.precioVenta ? Number(form.precioVenta) : undefined,
          costPrice: form.precioCosto !== '' ? Number(form.precioCosto) : undefined,
          minStock: form.stockMinimo !== '' ? Number(form.stockMinimo) : undefined,
          description: form.descripcion || undefined,
          barcode: form.codigoBarras || undefined,
          internalCode: form.codigoInterno || undefined,
        },
      });
      setSuccess('Producto actualizado');
      setTimeout(() => navigate('/productos'), 1500);
    } catch (err) {
      setApiError(err.response?.data?.error || 'Error al actualizar');
    }
  }

  if (!form) return <p>Cargando...</p>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Editar Producto</h1>
        <Button variant="secondary" onClick={() => navigate('/productos')}>← Volver</Button>
      </div>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.grid}>
          <InputField label="Nombre" name="nombre" value={form.nombre} onChange={(e) => set('nombre', e.target.value)} />
          <InputField label="Código de barras" name="codigoBarras" value={form.codigoBarras} onChange={(e) => set('codigoBarras', e.target.value)} />
          <InputField label="Precio de venta" name="precioVenta" type="number" min="0.01" step="0.01" value={form.precioVenta} onChange={(e) => set('precioVenta', e.target.value)} error={errors.precioVenta} />
          <InputField label="Precio de costo" name="precioCosto" type="number" min="0" step="0.01" value={form.precioCosto} onChange={(e) => set('precioCosto', e.target.value)} error={errors.precioCosto} />
          <InputField label="Stock mínimo" name="stockMinimo" type="number" min="0" value={form.stockMinimo} onChange={(e) => set('stockMinimo', e.target.value)} />
        </div>
        <InputField label="Descripción" name="descripcion" value={form.descripcion} onChange={(e) => set('descripcion', e.target.value)} />
        {apiError && <p className={styles.apiError}>{apiError}</p>}
        {success && <p style={{ color: 'var(--color-success)', fontWeight: 600 }}>{success}</p>}
        <div className={styles.footer}>
          <Button variant="secondary" type="button" onClick={() => navigate('/productos')}>Cancelar</Button>
          <Button type="submit" loading={updateMutation.isPending}>Guardar Cambios</Button>
        </div>
      </form>
    </div>
  );
}
