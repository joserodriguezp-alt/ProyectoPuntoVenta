import { formatCurrency } from '@/utils/currency';
import Button from '@/components/Button/Button';
import styles from './TicketActual.module.css';

export default function TicketActual({ items, subtotal, total, descuentoGlobal, onCambiarCantidad, onEliminar, onDescuentoItem }) {
  if (items.length === 0) {
    return <div className={styles.empty}>Agrega productos usando el buscador</div>;
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Precio</th>
            <th>Cant.</th>
            <th>Desc.%</th>
            <th>Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const lineaTotal = item.precio_unitario * item.cantidad * (1 - item.descuento / 100);
            return (
              <tr key={item.id_producto}>
                <td className={styles.nombre}>{item.nombre}</td>
                <td className={styles.mono}>{formatCurrency(item.precio_unitario)}</td>
                <td>
                  <input
                    className={styles.cantInput}
                    type="number"
                    min="1"
                    value={item.cantidad}
                    onChange={(e) => onCambiarCantidad(item.id_producto, Number(e.target.value))}
                  />
                </td>
                <td>
                  <input
                    className={styles.cantInput}
                    type="number"
                    min="0"
                    max="100"
                    value={item.descuento}
                    onChange={(e) => onDescuentoItem(item.id_producto, Number(e.target.value))}
                  />
                </td>
                <td className={styles.mono}>{formatCurrency(lineaTotal)}</td>
                <td>
                  <button className={styles.del} onClick={() => onEliminar(item.id_producto)}>✕</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className={styles.totales}>
        <div className={styles.totalRow}>
          <span>Subtotal</span>
          <span className={styles.mono}>{formatCurrency(subtotal)}</span>
        </div>
        {descuentoGlobal > 0 && (
          <div className={styles.totalRow}>
            <span>Descuento global ({descuentoGlobal}%)</span>
            <span className={`${styles.mono} ${styles.desc}`}>-{formatCurrency(subtotal - total)}</span>
          </div>
        )}
        <div className={`${styles.totalRow} ${styles.grandTotal}`}>
          <span>TOTAL</span>
          <span className={styles.mono}>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
