import { formatCurrency } from '@/utils/currency';
import { formatDateTime } from '@/utils/dateFormat';
import Button from '@/components/Button/Button';
import styles from './TicketImpreso.module.css';

export default function TicketImpreso({ venta, onNuevaVenta }) {
  if (!venta) return null;

  const { folio, fecha, cajero, detalles = [], descuento_global = 0, total, forma_pago, monto_pagado } = venta;
  const subtotal = detalles.reduce((acc, d) => acc + Number(d.precio_unitario) * d.cantidad * (1 - (d.descuento_porcentaje || 0) / 100), 0);
  const cambio = forma_pago === 'efectivo' ? (Number(monto_pagado) - Number(total)) : 0;

  return (
    <div className={styles.wrapper}>
      <div className={styles.ticket} id="ticket-impreso">
        <div className={styles.cabecera}>
          <p className={styles.tienda}>Papelería &amp; Cía</p>
          <p className={styles.sub}>RFC: XAXX010101000</p>
          <p className={styles.sub}>{formatDateTime(fecha)}</p>
        </div>

        <div className={styles.divisor} />

        <div className={styles.folio}>Folio: {folio}</div>
        {cajero && <div className={styles.cajero}>Cajero: {cajero}</div>}

        <div className={styles.divisor} />

        <table className={styles.items}>
          <tbody>
            {detalles.map((d, i) => {
              const lineaTotal = Number(d.precio_unitario) * d.cantidad * (1 - (d.descuento_porcentaje || 0) / 100);
              return (
                <tr key={i}>
                  <td colSpan={3} className={styles.itemNombre}>{d.nombre || d.producto_nombre}</td>
                </tr>
              );
            })}
            {detalles.map((d, i) => {
              const lineaTotal = Number(d.precio_unitario) * d.cantidad * (1 - (d.descuento_porcentaje || 0) / 100);
              return (
                <tr key={`total-${i}`}>
                  <td>{d.cantidad} x ${Number(d.precio_unitario).toFixed(2)}</td>
                  {d.descuento_porcentaje > 0 && <td className={styles.desc}>-{d.descuento_porcentaje}%</td>}
                  <td className={styles.right}>{formatCurrency(lineaTotal)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className={styles.divisor} />

        <div className={styles.totalesTicket}>
          <div className={styles.tRow}><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
          {descuento_global > 0 && <div className={styles.tRow}><span>Descuento ({descuento_global}%)</span><span>-{formatCurrency(subtotal - Number(total))}</span></div>}
          <div className={`${styles.tRow} ${styles.tTotal}`}><span>TOTAL</span><span>{formatCurrency(total)}</span></div>
          <div className={styles.tRow}><span>Pago ({forma_pago})</span><span>{formatCurrency(monto_pagado)}</span></div>
          {cambio > 0 && <div className={styles.tRow}><span>Cambio</span><span>{formatCurrency(cambio)}</span></div>}
        </div>

        <div className={styles.divisor} />
        <p className={styles.gracias}>¡Gracias por su compra!</p>
        <p className={styles.gracias}>Conserve su ticket</p>
      </div>

      <div className={styles.acciones}>
        <Button variant="secondary" onClick={() => window.print()}>Imprimir</Button>
        <Button onClick={onNuevaVenta}>Nueva Venta</Button>
      </div>
    </div>
  );
}
