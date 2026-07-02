import { useState, useRef, useCallback } from 'react';
import { getProductoPorCodigo, getProductos } from '@/api/productos.api';
import styles from './BuscadorProducto.module.css';

export default function BuscadorProducto({ onAgregar }) {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  const buscar = useCallback(async (valor) => {
    if (!valor.trim()) { setResultados([]); setError(''); return; }
    setLoading(true);
    setError('');
    try {
      if (/^[\d\-]+$/.test(valor.trim())) {
        const p = await getProductoPorCodigo(valor.trim());
        if (p) { onAgregar(p); setQuery(''); setResultados([]); }
        else setError('Producto no encontrado');
      } else {
        const lista = await getProductos(valor);
        setResultados(lista.filter((p) => p.activo));
      }
    } catch {
      setError('Error al buscar producto');
    } finally {
      setLoading(false);
    }
  }, [onAgregar]);

  function handleChange(e) {
    const v = e.target.value;
    setQuery(v);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => buscar(v), 350);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      clearTimeout(timerRef.current);
      buscar(query);
    }
  }

  function seleccionar(p) {
    onAgregar(p);
    setQuery('');
    setResultados([]);
    setError('');
  }

  return (
    <div className={styles.wrapper}>
      <input
        className={styles.input}
        placeholder="Código de barras o nombre del producto..."
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        autoFocus
      />
      {loading && <p className={styles.hint}>Buscando...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {resultados.length > 0 && (
        <ul className={styles.list}>
          {resultados.map((p) => (
            <li key={p.id_producto} className={styles.item} onClick={() => seleccionar(p)}>
              <span className={styles.nombre}>{p.nombre}</span>
              <span className={styles.precio}>${Number(p.precio_venta).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
