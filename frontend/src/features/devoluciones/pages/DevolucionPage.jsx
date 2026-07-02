import { useState } from 'react';
import { getVentaPorFolio, createDevolucion } from '@/api/ventas.api';
import { formatCurrency } from '@/utils/currency';
import { formatDateTime } from '@/utils/dateFormat';
import Button from '@/components/Button/Button';
import InputField from '@/components/InputField/InputField';
import styles from './DevolucionPage.module.css';

export default function DevolucionPage() {
  const [folio, setFolio] = useState('');
  const [venta, setVenta] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [errBusqueda, setErrBusqueda] = useState('');
  const [seleccion, setSeleccion] = useState({});
  const [motivo, setMotivo] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [errDevolucion, setErrDevolucion] = useState('');
  const [exito, setExito] = useState('');

  async function buscarVenta() {
    if (!folio.trim()) return;
    setBuscando(true);
    setErrBusqueda('');
    setVenta(null);
    setSeleccion({});
    setExito('');
    try {
      const result = await getVentaPorFolio(folio.trim());
      setVenta(result);
    } catch (err) {
      setErrBusqueda(err.response?.data?.error || 'No se encontró la venta');
    } finally {
      setBuscando(false);
    }
  }

  function toggleItem(detailId, max) {
    setSeleccion((prev) => {
      if (prev[detailId] !== undefined) {
        const copy = { ...prev };
        delete copy[detailId];
        return copy;
      }
      return { ...prev, [detailId]: 1 };
    });
  }

  function setCantidad(detailId, val, max) {
    const n = Math.min(Math.max(1, Number(val)), max);
    setSeleccion((prev) => ({ ...prev, [detailId]: n }));
  }

  async function handleDevolucion() {
    const items = Object.entries(seleccion).map(([id, qty]) => ({ saleDetailId: Number(id), quantity: qty }));
    if (items.length === 0) { setErrDevolucion('Selecciona al menos un producto'); return; }
    if (!motivo.trim()) { setErrDevolucion('El motivo es obligatorio'); return; }
    setProcesando(true);
    setErrDevolucion('');
    try {
      await createDevolucion({ saleFolio: folio.trim(), items, note: motivo });
      setExito('Devolución procesada exitosamente');
      setVenta(null);
      setFolio('');
      setSeleccion({});
      setMotivo('');
    } catch (err) {
      setErrDevolucion(err.response?.data?.error || 'Error al procesar la devolución');
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Devoluciones</h1>

      {exito && <div className={styles.exito}>{exito}</div>}

      <div className={styles.buscador}>
        <InputField
          label="Folio de venta"
          value={folio}
          onChange={(e) => setFolio(e.target.value)}
          placeholder="V-000001"
          onKeyDown={(e) => e.key === 'Enter' && buscarVenta()}
        />
        <Button onClick={buscarVenta} loading={buscando}>Buscar</Button>
      </div>
      {errBusqueda && <p className={styles.error}>{errBusqueda}</p>}

      {venta && (
        <div className={styles.ventaInfo}>
          <div className={styles.infoRow}>
            <span>Folio: <strong>{venta.folio}</strong></span>
            <span>Fecha: {formatDateTime(venta.fecha)}</span>
            <span>Total: <strong>{formatCurrency(venta.total)}</strong></span>
            <span className={`${styles.estado} ${venta.estado === 'anulada' ? styles.anulada : ''}`}>{venta.estado}</span>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Seleccionar</th>
                <th>Producto</th>
                <th>Cant. vendida</th>
                <th>Precio unit.</th>
                <th>Cant. a devolver</th>
              </tr>
            </thead>
            <tbody>
              {(venta.detalles || []).map((d) => {
                const checked = seleccion[d.id_detalle] !== undefined;
                const disponible = d.cantidad - (d.cantidad_devuelta || 0);
                if (disponible <= 0) return null;
                return (
                  <tr key={d.id_detalle}>
                    <td>
                      <input type="checkbox" checked={checked} onChange={() => toggleItem(d.id_detalle, disponible)} />
                    </td>
                    <td>{d.nombre || d.producto_nombre}</td>
                    <td>{d.cantidad}</td>
                    <td>{formatCurrency(d.precio_unitario)}</td>
                    <td>
                      {checked && (
                        <input
                          className={styles.cantInput}
                          type="number"
                          min="1"
                          max={disponible}
                          value={seleccion[d.id_detalle]}
                          onChange={(e) => setCantidad(d.id_detalle, e.target.value, disponible)}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <InputField
            label="Motivo de la devolución"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ej. Producto defectuoso, cambio de talla..."
            required
          />
          {errDevolucion && <p className={styles.error}>{errDevolucion}</p>}

          <div className={styles.footer}>
            <Button variant="danger" loading={procesando} onClick={handleDevolucion}>
              Procesar Devolución
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
