import { useState, useCallback } from 'react';
import { round2 } from '@/utils/currency';

export function useVenta() {
  const [items, setItems] = useState([]);
  const [descuentoGlobal, setDescuentoGlobal] = useState(0);

  const agregarProducto = useCallback((producto, cantidad = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id_producto === producto.id_producto);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], cantidad: updated[idx].cantidad + cantidad };
        return updated;
      }
      return [...prev, {
        id_producto: producto.id_producto,
        nombre: producto.nombre,
        codigo_barras: producto.codigo_barras || producto.codigo_interno || '',
        precio_unitario: Number(producto.precio_venta),
        cantidad,
        descuento: 0,
      }];
    });
  }, []);

  const cambiarCantidad = useCallback((idProducto, cantidad) => {
    if (cantidad <= 0) {
      setItems((prev) => prev.filter((i) => i.id_producto !== idProducto));
    } else {
      setItems((prev) => prev.map((i) => i.id_producto === idProducto ? { ...i, cantidad } : i));
    }
  }, []);

  const cambiarDescuento = useCallback((idProducto, descuento) => {
    setItems((prev) => prev.map((i) => i.id_producto === idProducto ? { ...i, descuento } : i));
  }, []);

  const eliminarItem = useCallback((idProducto) => {
    setItems((prev) => prev.filter((i) => i.id_producto !== idProducto));
  }, []);

  const limpiarVenta = useCallback(() => {
    setItems([]);
    setDescuentoGlobal(0);
  }, []);

  const subtotal = items.reduce((acc, i) => {
    const lineaConDescuento = round2(i.precio_unitario * i.cantidad * (1 - i.descuento / 100));
    return round2(acc + lineaConDescuento);
  }, 0);

  const totalConDescuentoGlobal = round2(subtotal * (1 - descuentoGlobal / 100));

  return {
    items,
    descuentoGlobal,
    setDescuentoGlobal,
    agregarProducto,
    cambiarCantidad,
    cambiarDescuento,
    eliminarItem,
    limpiarVenta,
    subtotal,
    total: totalConDescuentoGlobal,
  };
}
