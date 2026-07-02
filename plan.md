# Plan de Implementación — Sistema Punto de Venta (Papelería)

**Basado en:** `spec.md` (v1.0) y `modelo_datos.md`
**Fecha:** 2026-06-30

---

## 1. Stack Tecnológico

| Capa | Tecnología | Notas |
|---|---|---|
| Backend | **Node.js** + **Express.js** | API REST, una sola app monolítica (no microservicios) |
| Base de datos | **Supabase (PostgreSQL administrado)** | Sustituye a MySQL/MariaDB de `spec.md` §5.2. Se usa Supabase únicamente como Postgres alojado; **no** se usa Supabase Auth ni Row Level Security como mecanismo principal de control de acceso |
| Acceso a datos | **`pg` (node-postgres)** con consultas preparadas y transacciones explícitas | Necesario porque las ventas/inventario requieren `BEGIN/COMMIT/ROLLBACK` atómicos (spec §5.5); el cliente `@supabase/supabase-js` no soporta transacciones multi-sentencia |
| Cliente Supabase | **`@supabase/supabase-js`** (opcional, solo backend) | Para Supabase Storage (respaldo de `.sql` diario) y operaciones administrativas simples que no requieren transacción |
| Autenticación | **JWT** (`jsonwebtoken`) + **bcrypt** (cost factor ≥10) | Tabla `usuarios` propia, roles `administrador`/`cajero`, gestionado 100% en el backend (no Supabase Auth), tal como exige spec §5.2/§5.4 |
| Validación | `zod` | Validación de payloads de entrada en cada ruta |
| Frontend | **React 18** + **Vite** | SPA |
| Enrutamiento frontend | `react-router-dom` | Rutas protegidas por rol |
| Estado / datos remotos | `@tanstack/react-query` + Context API (solo para sesión/auth) | Evita estado global innecesario; cache y revalidación de datos del servidor |
| HTTP client | `axios` (instancia única con interceptor de token) | |
| Estilos | CSS Modules (`*.module.css`) | Sin librería de componentes pesada; UI táctil simple según spec §5.3/§5.7 |
| Impresión de ticket | CSS `@media print` para 58/80mm; capa ESC/POS opcional vía `node-thermal-printer` | Empezar con CSS print (v1.0), dejar preparado el módulo para ESC/POS |
| Variables de entorno | `dotenv` | Backend y frontend (`VITE_*`) |
| Linting/format | ESLint + Prettier | Mismo en backend y frontend |

**Justificación de Supabase:** se usa como Postgres administrado para simplificar la operación (sin instalar/mantener motor local) conservando los requisitos transaccionales y de autenticación propios del spec. Si en el futuro se requiere acceso offline total, el `connection string` de Supabase puede sustituirse por una instancia Postgres local sin cambiar código de aplicación (toda la capa de datos pasa por `pg`).

---

## 2. Arquitectura General

```
[Navegador / Frontend React+Vite]
          │  HTTPS (JSON, JWT en header Authorization)
          ▼
[Backend Express — API REST]
          │  pg (transacciones SQL)
          ▼
[Supabase PostgreSQL]
```

- Cliente-servidor con API REST, frontend totalmente desacoplado del backend (spec §5.1).
- Backend stateless: la sesión vive en el JWT, no en memoria de servidor.
- Todas las rutas requieren JWT válido excepto `POST /api/auth/login` (spec §5.4).
- Middleware de roles (`requireRole('administrador')`) protege rutas administrativas.

---

## 3. Estructura de Carpetas — Backend

```
backend/
├── src/
│   ├── config/
│   │   ├── env.js                 # Carga y valida variables de entorno
│   │   └── db.js                  # Pool de pg apuntando a Supabase
│   ├── middleware/
│   │   ├── auth.middleware.js     # Verifica JWT
│   │   ├── role.middleware.js     # requireRole('administrador' | 'cajero')
│   │   ├── error.middleware.js    # Manejador central de errores -> JSON en español
│   │   └── validate.middleware.js # Ejecuta esquemas zod sobre req.body/query
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.controller.js
│   │   │   └── auth.service.js
│   │   ├── productos/
│   │   │   ├── productos.routes.js
│   │   │   ├── productos.controller.js
│   │   │   ├── productos.service.js
│   │   │   ├── productos.repository.js
│   │   │   └── productos.schema.js   # esquemas zod (alta/edición)
│   │   ├── categorias/
│   │   │   └── ...
│   │   ├── ventas/
│   │   │   ├── ventas.routes.js
│   │   │   ├── ventas.controller.js
│   │   │   ├── ventas.service.js     # transacción venta + descuento inventario
│   │   │   ├── ventas.repository.js
│   │   │   └── ventas.schema.js
│   │   ├── devoluciones/
│   │   │   └── ...
│   │   ├── inventario/
│   │   │   ├── inventario.routes.js
│   │   │   ├── inventario.controller.js
│   │   │   ├── inventario.service.js # entradas, ajustes, historial
│   │   │   └── inventario.repository.js
│   │   ├── caja/                     # apertura / corte de caja
│   │   │   └── ...
│   │   ├── reportes/
│   │   │   ├── reportes.routes.js
│   │   │   ├── reportes.controller.js
│   │   │   └── reportes.service.js   # ventas por periodo, stock bajo
│   │   └── usuarios/
│   │       └── ...
│   ├── utils/
│   │   ├── asyncHandler.js
│   │   ├── apiError.js
│   │   ├── currency.js               # formato MXN, redondeo 2 decimales
│   │   └── dateUtils.js              # zona horaria America/Hermosillo
│   ├── jobs/
│   │   └── backupDiario.js           # respaldo .sql automático (node-cron)
│   ├── app.js                        # configuración de Express (middlewares globales)
│   └── server.js                     # arranque del servidor (listen)
├── tests/
│   └── modules/                      # tests unitarios/integración por módulo
├── .env.example
├── package.json
└── README.md
```

**Patrón por módulo:** `routes → controller → service → repository`.
- `routes`: solo define endpoints y aplica middlewares.
- `controller`: traduce HTTP (req/res) a llamadas de servicio.
- `service`: lógica de negocio (reglas de spec §6), orquesta transacciones.
- `repository`: única capa que ejecuta SQL contra Supabase vía `pg`.

---

## 4. Estructura de Carpetas — Frontend

```
frontend/
├── public/
├── src/
│   ├── api/
│   │   ├── client.js                 # instancia axios + interceptor JWT
│   │   ├── productos.api.js
│   │   ├── ventas.api.js
│   │   ├── inventario.api.js
│   │   ├── caja.api.js
│   │   └── reportes.api.js
│   ├── auth/
│   │   ├── AuthContext.jsx           # sesión, usuario, rol
│   │   ├── RequireAuth.jsx           # ruta protegida
│   │   └── RequireRole.jsx           # ruta protegida por rol
│   ├── components/                   # UI compartida y "tonta" (sin lógica de negocio)
│   │   ├── Button/
│   │   ├── Modal/
│   │   ├── InputField/
│   │   └── DataTable/
│   ├── features/
│   │   ├── productos/
│   │   │   ├── components/
│   │   │   ├── hooks/                # useProductos.js (react-query)
│   │   │   └── pages/
│   │   │       ├── CatalogoProductosPage.jsx
│   │   │       └── ProductoFormPage.jsx
│   │   ├── ventas/
│   │   │   ├── components/           # TicketActual, BuscadorProducto, PanelPago
│   │   │   ├── hooks/
│   │   │   └── pages/VentaPage.jsx
│   │   ├── devoluciones/
│   │   ├── inventario/
│   │   ├── caja/
│   │   │   └── pages/{AperturaCajaPage,CorteCajaPage,HistorialCortesPage}.jsx
│   │   ├── reportes/
│   │   └── auth/
│   │       └── pages/LoginPage.jsx
│   ├── layouts/
│   │   ├── AdminLayout.jsx
│   │   └── CajeroLayout.jsx
│   ├── hooks/                        # hooks genéricos (useDebounce, useKeyboardShortcut)
│   ├── utils/
│   │   ├── currency.js               # formato $ MXN
│   │   └── dateFormat.js             # DD/MM/YYYY
│   ├── styles/
│   │   ├── variables.css
│   │   └── print.css                 # estilos de impresión de ticket
│   ├── router.jsx                    # definición de rutas con react-router
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── index.html
├── vite.config.js
└── package.json
```

**Regla de organización:** todo lo específico de un módulo de negocio (HU) vive en `features/<modulo>`; solo lo verdaderamente reutilizable entre módulos sube a `components/` o `hooks/`.

---

## 5. Convenciones de Nombres

### 5.1 Base de datos (Supabase/PostgreSQL)
- Tablas: `snake_case`, plural, en español — ya definidas en `modelo_datos.md` (`productos`, `corte_caja`, `detalle_venta`, `movimientos_inventario`, …).
- Columnas: `snake_case`, español (`precio_venta`, `stock_minimo`, `fecha_venta`).
- Llaves primarias: `id_<entidad>` (`id_producto`, `id_venta`). Llaves foráneas conservan el mismo nombre que la PK referenciada.
- Enums de Postgres: `snake_case` con sufijo del campo, p.ej. tipo `estado_corte_caja`.
- Índices: `idx_<tabla>_<columna>` (ej. `idx_productos_codigo`).
- Constraints: `chk_<tabla>_<regla>`, `fk_<tabla>_<referencia>` cuando se nombren explícitamente.

### 5.2 Backend (Node.js/Express)
- Archivos: `kebab-case` o `<nombre>.<capa>.js` (`ventas.service.js`, `auth.middleware.js`).
- Variables y funciones: `camelCase`.
- Clases (si se usan): `PascalCase`.
- Constantes globales/env: `UPPER_SNAKE_CASE` (`JWT_SECRET`, `SUPABASE_DB_URL`).
- **Frontera API ↔ DB:** la base de datos usa `snake_case` en español; el JSON que viaja por la API usa `camelCase` (también en español, p.ej. `precioVenta`, `stockMinimo`) para ser idiomático en JS. La conversión `snake_case → camelCase` ocurre únicamente en la capa `repository` (nunca se expone `snake_case` crudo al frontend).
- Endpoints REST: sustantivos en plural, minúsculas, español, sin verbos (`GET /api/productos`, `POST /api/ventas`, `PATCH /api/productos/:id`, `POST /api/cortes/:id/cerrar`). Sub-recursos anidados cuando hay dependencia clara (`GET /api/ventas/:id/detalle`, `POST /api/inventario/movimientos`).
- Códigos HTTP: 200/201 éxito, 400 validación, 401 no autenticado, 403 rol insuficiente, 404 no encontrado, 409 conflicto (ej. código de barras duplicado), 500 error de servidor.
- Mensajes de error: siempre en español, formato `{ error: "mensaje claro" }` (spec §5.7).

### 5.3 Frontend (React)
- Componentes: `PascalCase`, un componente por archivo (`ProductoForm.jsx`).
- Hooks personalizados: `camelCase` con prefijo `use` (`useProductos.js`, `useCorteCaja.js`).
- Archivos no-componente (api, utils): `camelCase` o `kebab-case` consistente por carpeta (`productos.api.js`).
- CSS Modules: mismo nombre que el componente (`ProductoForm.module.css`), clases internas en `camelCase`.
- Props y estado local: `camelCase`.
- Contextos: sufijo `Context` (`AuthContext`).

### 5.4 Variables de entorno
- `UPPER_SNAKE_CASE` en ambos proyectos.
- Backend: `SUPABASE_DB_URL`, `SUPABASE_SERVICE_ROLE_KEY` (solo si se usa Storage), `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`, `BCRYPT_SALT_ROUNDS`.
- Frontend (Vite exige prefijo `VITE_`): `VITE_API_BASE_URL`.

### 5.5 Git (cuando se inicialice el repositorio)
- Ramas: `feature/<modulo>-<descripcion-corta>` (`feature/ventas-descuentos`), `fix/<descripcion>`.
- Commits: convencional, en español, imperativo (`feat: agregar alta de productos`, `fix: corregir cálculo de cambio`).

---

## 6. Mapeo de Módulos del Spec → Backend/Frontend

| Módulo (spec.md) | HUs | Backend (`modules/`) | Frontend (`features/`) |
|---|---|---|---|
| Gestión de Productos | HU-01 a HU-04 | `productos`, `categorias` | `productos` |
| Ventas | HU-05 a HU-09 | `ventas`, `devoluciones` | `ventas`, `devoluciones` |
| Control de Inventario | HU-10 a HU-13 | `inventario` | `inventario` |
| Corte de Caja | HU-14 a HU-16 | `caja` | `caja` |
| Reportes | HU-17, HU-18 | `reportes` | `reportes` |
| Transversal | autenticación, roles | `auth`, `usuarios` | `auth`, layouts por rol |

---

## 7. Reglas de Negocio Críticas → Dónde Viven

Las reglas de §6 de `spec.md` se implementan en la capa `service` del backend (nunca en el frontend ni en triggers de DB), para mantenerlas auditables y testeables:

- No vender sin caja abierta → `ventas.service.js` valida `corte_caja.estado = 'abierto'` antes de iniciar la transacción.
- Stock nunca negativo salvo ajuste confirmado → `inventario.service.js` y `ventas.service.js` validan stock dentro de la misma transacción que descuenta inventario.
- Precio congelado en el ticket → `detalle_venta.precio_unitario` se copia del catálogo al momento de la venta, nunca se referencia el precio "vivo".
- Descuento > umbral requiere clave de admin → `ventas.service.js` valida `password` de un usuario con rol `administrador` antes de aplicar.
- Corte de caja es definitivo → no existe endpoint `PATCH`/`DELETE` sobre `corte_caja` una vez `estado = 'cerrado'`.

---

## 8. Seguridad (spec §5.4)

- JWT firmado con `JWT_SECRET`, expiración configurable vía `JWT_EXPIRES_IN` (default 12h, igual que el prototipo existente).
- Contraseñas con bcrypt, `BCRYPT_SALT_ROUNDS >= 10`.
- Middleware `auth.middleware.js` en todas las rutas excepto `/api/auth/login`.
- Middleware `role.middleware.js` bloquea rutas administrativas (`/api/reportes/*`, `/api/inventario/ajustes`, `/api/productos` en escritura) para el rol `cajero`.
- Toda escritura crítica (ajuste de inventario, edición de precio, cierre de corte) inserta `id_usuario` + timestamp del actor, vía `req.user` del JWT — no se confía en el body del request.
- `SUPABASE_SERVICE_ROLE_KEY` y `SUPABASE_DB_URL` solo en backend (`.env`, nunca expuestos al frontend).

---

## 9. Variables de Entorno (referencia)

**backend/.env.example**
```
SUPABASE_DB_URL=postgresql://postgres:[password]@[host]:5432/postgres
JWT_SECRET=
JWT_EXPIRES_IN=12h
BCRYPT_SALT_ROUNDS=10
PORT=4000
TZ=America/Hermosillo
```

**frontend/.env.example**
```
VITE_API_BASE_URL=http://localhost:4000/api
```

---

## 10. Fases de Implementación Sugeridas

1. **Base:** estructura de carpetas, conexión a Supabase, ejecutar `modelo_datos.md`/schema en Supabase, módulo `auth` + middlewares.
2. **Productos e Inventario:** HU-01 a HU-04, HU-10 a HU-13 (catálogo es prerrequisito de ventas).
3. **Caja:** HU-14 (apertura) — bloqueante para ventas.
4. **Ventas:** HU-05 a HU-09 (incluye devoluciones), con transacciones atómicas venta+inventario.
5. **Corte de Caja:** HU-15, HU-16.
6. **Reportes:** HU-17, HU-18, exportación PDF/CSV.
7. **Pulido:** atajos de teclado en venta (spec §5.7), impresión térmica, respaldo automático diario (`jobs/backupDiario.js`).

---

## 11. Pendiente de Decisión

- Exportación de reportes: librería PDF (`pdfkit`/`puppeteer`) vs CSV simple — definir en fase 6.
- ESC/POS real vs solo CSS print para impresión térmica — definir con el hardware disponible en sitio.
