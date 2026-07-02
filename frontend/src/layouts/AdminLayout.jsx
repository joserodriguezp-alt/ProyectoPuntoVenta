import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import styles from './AdminLayout.module.css';

const NAV = [
  { to: '/venta', label: '🛒 Venta' },
  { to: '/productos', label: '📦 Productos' },
  { to: '/inventario', label: '📊 Inventario' },
  { to: '/caja/apertura', label: '💰 Caja' },
  { to: '/caja/historial', label: '📋 Historial Cortes' },
  { to: '/devoluciones', label: '↩ Devoluciones' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>TPV Papelería</div>
        <nav className={styles.nav}>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => [styles.link, isActive ? styles.active : ''].join(' ')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.footer}>
          <span className={styles.username}>{user?.username}</span>
          <span className={styles.role}>{user?.role}</span>
          <button className={styles.logout} onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </aside>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
