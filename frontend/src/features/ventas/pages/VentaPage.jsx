import { useState } from 'react';
import { useVenta } from '../hooks/useVenta';
import BuscadorProducto from '../components/BuscadorProducto';
import TicketActual from '../components/TicketActual';
import PanelPago from '../components/PanelPago';
import DescuentoModal from '../components/DescuentoModal';
import TicketImpreso from '../components/TicketImpreso';
import { createVenta } from '@/api/ventas.api';
import styles from './VentaPage.module.css';

export default function VentaPage() {
  const venta = useVenta();
  const [showDescuento, setShowDescuento] = useState(false);
  const [cobrando, setCobrando] = useState(false);
  const [ventaCompletada, setVentaCompletada] = useState(null);
  const [error, setError] = useState('');

  async function handleCobrar({ paymentMethod, amountPaid }) {
    if (venta.items.length === 0) { setError('Agrega al menos un producto'); return; }
    setCobrando(true);
    setError('');
    try {
      const body = {
        items: venta.items.map((i) => ({
          productId: i.id_producto,
          quantity: i.cantidad,
        })),
        amountReceived: amountPaid,
        discountPercent: venta.descuentoGlobal > 0 ? venta.descuentoGlobal : undefined,
      };
      const result = await createVenta(body);
      const ventaData = {
        folio: result.folio,
        fecha: result.fecha || new Date().toISOString(),
        cajero: result.cajero,
        detalles: venta.items.map((i) => ({
          nombre: i.nombre,
          cantidad: i.cantidad,
          precio_unitario: i.precio_unitario,
          descuento_porcentaje: i.descuento,
        })),
        descuento_global: venta.descuentoGlobal,
        total: venta.total,
        forma_pago: paymentMethod,
        monto_pagado: amountPaid,
      };
      setVentaCompletada(ventaData);
      venta.limpiarVenta();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar la venta');
    } finally {
      setCobrando(false);
    }
  }

  function handleAplicarDescuento(porcentaje, _clave) {
    venta.setDescuentoGlobal(porcentaje);
    setShowDescuento(false);
  }

  if (ventaCompletada) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Venta Completada</h1>
        <TicketImpreso venta={ventaCompletada} onNuevaVenta={() => setVentaCompletada(null)} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Nueva Venta</h1>

      <div className={styles.layout}>
        <div className={styles.left}>
          <div className={styles.card}>
            <BuscadorProducto onAgregar={venta.agregarProducto} />
          </div>
          <div className={styles.card}>
            <TicketActual
              items={venta.items}
              subtotal={venta.subtotal}
              total={venta.total}
              descuentoGlobal={venta.descuentoGlobal}
              onCambiarCantidad={venta.cambiarCantidad}
              onEliminar={venta.eliminarItem}
              onDescuentoItem={venta.cambiarDescuento}
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
        </div>

        <div className={styles.right}>
          <PanelPago
            total={venta.total}
            descuentoGlobal={venta.descuentoGlobal}
            onCobrar={handleCobrar}
            onDescuento={() => setShowDescuento(true)}
            loading={cobrando}
            disabled={venta.items.length === 0}
          />
        </div>
      </div>

      <DescuentoModal
        isOpen={showDescuento}
        onClose={() => setShowDescuento(false)}
        onAplicar={handleAplicarDescuento}
        descuentoActual={venta.descuentoGlobal}
      />
    </div>
  );
}
