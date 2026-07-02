# TPV Papelería — Sistema de Punto de Venta

Sistema de punto de venta web para papelería, desarrollado como proyecto escolar en el Instituto Tecnológico de Hermosillo (ITH). Permite gestionar ventas, inventario, caja y usuarios con autenticación por roles.

---

## Descripción del proyecto

La aplicación cubre el ciclo completo de operación de una caja registradora:

- **Apertura y corte de caja** con cálculo automático de sobrante/faltante.
- **Ventas en mostrador** con búsqueda de producto por código de barras o nombre, descuentos con autorización de administrador y generación de folio.
- **Devoluciones** parciales o totales con reintegro automático al inventario.
- **Gestión de inventario**: entradas de mercancía, ajustes y consulta de movimientos por producto.
- **Administración de productos y usuarios** restringida al rol `administrador`.
- **Documentación interactiva** de la API disponible en `/api/docs`.

---

## Tecnologías

### Backend
| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | 18+ | Runtime del servidor |
| Express | 4.x | Framework HTTP |
| Supabase JS | 2.x | Cliente de base de datos (PostgreSQL) |
| JSON Web Token | 9.x | Autenticación por tokens |
| bcrypt | 5.x | Hash de contraseñas |
| swagger-ui-express | — | Documentación interactiva de la API |
| Jest + Babel | 29.x | Pruebas unitarias |
| nodemon | 3.x | Recarga automática en desarrollo |

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| React | 18.x | Librería de UI |
| Vite | 5.x | Empaquetador y servidor de desarrollo |
| React Router DOM | 6.x | Enrutamiento SPA |
| TanStack Query | 5.x | Caché y sincronización de estado servidor |
| Axios | 1.x | Cliente HTTP |
| CSS Modules | — | Estilos encapsulados por componente |

### Base de datos
| Tecnología | Uso |
|---|---|
| Supabase (PostgreSQL) | Base de datos principal alojada en la nube |

---

## Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- npm v9 o superior
- Cuenta en [Supabase](https://supabase.com/) con el schema del proyecto aplicado

---

## Instalación

Clona el repositorio e instala las dependencias de cada parte por separado.

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd ProyectoPuntoVenta

# 2. Instalar dependencias del backend
cd backend
npm install

# 3. Instalar dependencias del frontend
cd ../frontend
npm install
```

---

## Variables de entorno

### Backend — `backend/.env`

Crea el archivo `backend/.env` copiando el ejemplo de abajo. **Nunca subas este archivo al repositorio.**

```env
# Supabase — obtén estos valores en: Project Settings > API
SUPABASE_URL=https://TU_PROYECTO.supabase.co
SUPABASE_SERVICE_KEY=sb_secret_...

# JWT
JWT_SECRET=cambia_esto_por_una_clave_secreta_larga_y_aleatoria
JWT_EXPIRES_IN=12h

# Seguridad
BCRYPT_SALT_ROUNDS=10

# Servidor
PORT=4000
TZ=America/Hermosillo

# Descuentos: porcentaje máximo sin autorización de administrador
DISCOUNT_AUTH_THRESHOLD=20
```

| Variable | Requerida | Descripción |
|---|---|---|
| `SUPABASE_URL` | Sí | URL del proyecto en Supabase |
| `SUPABASE_SERVICE_KEY` | Sí | Clave de servicio (service_role) de Supabase |
| `JWT_SECRET` | Sí | Clave para firmar tokens JWT (mínimo 32 caracteres) |
| `JWT_EXPIRES_IN` | No | Duración del token (default: `12h`) |
| `BCRYPT_SALT_ROUNDS` | No | Rondas de hash (default: `10`) |
| `PORT` | No | Puerto del servidor (default: `4000`) |
| `TZ` | No | Zona horaria del servidor (default: `America/Hermosillo`) |
| `DISCOUNT_AUTH_THRESHOLD` | No | % de descuento que requiere autorización (default: `20`) |

> La aplicación valida al arrancar que `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` y `JWT_SECRET` estén presentes. Si falta alguna, el servidor se detiene con un mensaje de error.

### Frontend

El frontend no requiere archivo `.env`. La URL base de la API (`http://localhost:4000/api`) está configurada en `frontend/src/api/client.js`.

---

## Configuración de base de datos

Aplica el schema y las migraciones en el SQL Editor de Supabase en este orden:

```
1. database/schema.sql          — Tablas y relaciones principales
2. database/migrations/001_historial_precios.sql
3. database/migrations/002_folio_venta_seq.sql
4. database/migrations/003_generate_folio_function.sql
```

Después crea el usuario administrador inicial ejecutando:

```sql
INSERT INTO usuarios (nombre_completo, username, password_hash, rol)
VALUES (
  'Administrador',
  'admin',
  -- Genera el hash con: node -e "require('bcrypt').hash('tu_password',10).then(console.log)"
  '$2b$10$HASH_GENERADO_AQUI',
  'administrador'
);
```

---

## Correr el proyecto en desarrollo

Necesitas dos terminales abiertas al mismo tiempo.

### Terminal 1 — Backend

```bash
cd backend
npm run dev
```

El servidor arranca en `http://localhost:4000`.

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

La aplicación arranca en `http://localhost:5173`.

### URLs disponibles en desarrollo

| URL | Descripción |
|---|---|
| `http://localhost:5173` | Aplicación web |
| `http://localhost:4000/api/health` | Estado del servidor |
| `http://localhost:4000/api/docs` | Documentación interactiva Swagger UI |
| `http://localhost:4000/api/docs.json` | Spec OpenAPI 3.0 en JSON |

---

## Scripts disponibles

### Backend (`cd backend`)

```bash
npm run dev          # Servidor con recarga automática (nodemon)
npm start            # Servidor en producción
npm test             # Ejecutar pruebas unitarias
npm run test:coverage  # Pruebas con reporte de cobertura
npm run lint         # Revisar estilo de código (ESLint)
```

### Frontend (`cd frontend`)

```bash
npm run dev      # Servidor de desarrollo con HMR
npm run build    # Compilar para producción (genera dist/)
npm run preview  # Vista previa del build de producción
```

---

## Estructura de carpetas

```
ProyectoPuntoVenta/
│
├── backend/
│   ├── src/
│   │   ├── app.js                    # Configuración de Express (middlewares y rutas)
│   │   ├── config/
│   │   │   ├── database.js           # Cliente Supabase
│   │   │   ├── env.js                # Carga y validación de variables de entorno
│   │   │   └── swagger.js            # Spec OpenAPI 3.0 completo
│   │   ├── middleware/
│   │   │   ├── auth-middleware.js    # Verificación de JWT
│   │   │   ├── role-middleware.js    # Restricción por rol
│   │   │   └── error-middleware.js   # Manejo centralizado de errores
│   │   ├── modules/
│   │   │   ├── users/                # Autenticación y gestión de usuarios
│   │   │   ├── products/             # Catálogo de productos
│   │   │   ├── inventory/            # Stock, entradas y ajustes
│   │   │   ├── sales/                # Ventas y devoluciones
│   │   │   └── cash-register/        # Apertura y corte de caja
│   │   └── utils/
│   │       └── api-error.js          # Clase de error con statusCode
│   ├── __tests__/
│   │   ├── venta.test.js             # Pruebas: stock insuficiente y cálculo de totales
│   │   └── corte-caja.test.js        # Pruebas: apertura, cierre y validaciones de caja
│   ├── babel.config.js               # Configuración de Babel para Jest
│   ├── jest.config.js                # Configuración de Jest
│   ├── server.js                     # Punto de entrada (listen)
│   └── .env                          # Variables de entorno (NO subir al repo)
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx                  # Punto de entrada de React
│   │   ├── App.jsx                   # Raíz de la aplicación
│   │   ├── router.jsx                # Definición de rutas con protección por rol
│   │   ├── api/
│   │   │   ├── client.js             # Instancia de axios con interceptor JWT
│   │   │   ├── productos.api.js
│   │   │   ├── ventas.api.js
│   │   │   ├── inventario.api.js
│   │   │   └── caja.api.js
│   │   ├── auth/
│   │   │   ├── AuthContext.jsx       # Contexto global de autenticación
│   │   │   ├── RequireAuth.jsx       # Guard: redirige si no hay sesión
│   │   │   └── RequireRole.jsx       # Guard: redirige si el rol no coincide
│   │   ├── layouts/
│   │   │   ├── AdminLayout.jsx       # Navegación y shell del administrador
│   │   │   └── CajeroLayout.jsx      # Navegación y shell del cajero
│   │   ├── features/
│   │   │   ├── auth/pages/           # LoginPage
│   │   │   ├── ventas/               # Página de cobro en mostrador
│   │   │   ├── devoluciones/         # Página de devoluciones
│   │   │   ├── inventario/           # Stock, entradas, ajustes, movimientos
│   │   │   ├── productos/            # CRUD de productos
│   │   │   └── caja/                 # Apertura, cierre y corte de caja
│   │   ├── components/               # Componentes reutilizables (Button, Modal, etc.)
│   │   ├── styles/
│   │   │   ├── global.css
│   │   │   ├── variables.css         # Tokens de diseño (colores, tipografía)
│   │   │   └── print.css             # Estilos para impresión de tickets
│   │   └── utils/
│   │       ├── currency.js           # Formateo de moneda (MXN)
│   │       └── dateFormat.js         # Formateo de fechas
│   └── index.html
│
└── database/
    ├── schema.sql                    # Definición completa de tablas
    └── migrations/                   # Cambios incrementales al schema
```

---

## Roles de usuario

| Rol | Acceso |
|---|---|
| `administrador` | Todo: usuarios, productos, inventario, ventas, devoluciones, caja, historial |
| `cajero` | Ventas, devoluciones, apertura y cierre de caja |

---

## Pruebas

```bash
cd backend
npm test
```

Las pruebas cubren:

- **Stock insuficiente**: valida que no se venda más de lo disponible.
- **Cálculo de totales**: subtotal, descuentos y cambio.
- **Corte de caja**: efectivo esperado, sobrante/faltante, validaciones de apertura y cierre.

---

## Documentación de la API

Con el backend corriendo, abre en el navegador:

```
http://localhost:4000/api/docs
```

Desde ahí puedes explorar todos los endpoints, ver los esquemas de request/response y probar llamadas directamente en el navegador usando el token JWT obtenido en `POST /api/auth/login`.
