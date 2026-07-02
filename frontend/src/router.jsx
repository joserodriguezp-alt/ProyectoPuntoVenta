import { createBrowserRouter } from 'react-router-dom';
import RequireAuth from '@/auth/RequireAuth';
import RequireRole from '@/auth/RequireRole';
import AdminLayout from '@/layouts/AdminLayout';
import CajeroLayout from '@/layouts/CajeroLayout';

import LoginPage from '@/features/auth/pages/LoginPage';
import CatalogoProductosPage from '@/features/productos/pages/CatalogoProductosPage';
import ProductoFormPage from '@/features/productos/pages/ProductoFormPage';
import ProductoEditPage from '@/features/productos/pages/ProductoEditPage';
import VentaPage from '@/features/ventas/pages/VentaPage';
import DevolucionPage from '@/features/devoluciones/pages/DevolucionPage';
import InventarioPage from '@/features/inventario/pages/InventarioPage';
import HistorialMovimientosPage from '@/features/inventario/pages/HistorialMovimientosPage';
import AperturaCajaPage from '@/features/caja/pages/AperturaCajaPage';
import CorteCajaPage from '@/features/caja/pages/CorteCajaPage';
import HistorialCortesPage from '@/features/caja/pages/HistorialCortesPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },

  {
    element: <RequireAuth><RequireRole roles={['administrador']}><AdminLayout /></RequireRole></RequireAuth>,
    children: [
      { path: '/productos', element: <CatalogoProductosPage /> },
      { path: '/productos/nuevo', element: <ProductoFormPage /> },
      { path: '/productos/:id/editar', element: <ProductoEditPage /> },
      { path: '/inventario', element: <InventarioPage /> },
      { path: '/inventario/movimientos', element: <HistorialMovimientosPage /> },
      { path: '/caja/apertura', element: <AperturaCajaPage /> },
      { path: '/caja/corte', element: <CorteCajaPage /> },
      { path: '/caja/historial', element: <HistorialCortesPage /> },
      { path: '/venta', element: <VentaPage /> },
      { path: '/devoluciones', element: <DevolucionPage /> },
    ],
  },

  {
    element: <RequireAuth><RequireRole roles={['cajero']}><CajeroLayout /></RequireRole></RequireAuth>,
    children: [
      { path: '/cajero/venta', element: <VentaPage /> },
      { path: '/cajero/devoluciones', element: <DevolucionPage /> },
      { path: '/cajero/caja', element: <AperturaCajaPage /> },
      { path: '/cajero/caja/corte', element: <CorteCajaPage /> },
    ],
  },

  { path: '/', element: <RequireAuth><span /></RequireAuth> },
  { path: '/sin-acceso', element: <div style={{ padding: 40, textAlign: 'center' }}><h2>Sin acceso</h2><p>No tienes permisos para ver esta página.</p></div> },
]);
