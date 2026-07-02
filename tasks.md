# Tareas — Backend TPV Papelería

**Basado en:** `spec.md` (v1.0), `plan.md`, `modelo_datos.md`, `database/schema.sql`
**Alcance:** exclusivamente backend (Node.js + Express + Supabase/PostgreSQL)
**Fecha:** 2026-06-30

---

## Cómo usar este documento

Cada tarea es atómica (un solo entregable verificable) y tiene un **criterio de terminado (DoD)** comprobable mediante una petición HTTP, una consulta SQL o una corrida de tests — no una apreciación subjetiva. Las tareas están ordenadas por dependencia: completar una sección antes de iniciar la siguiente evita bloqueos (p. ej. Caja debe existir antes de Ventas, porque toda venta exige una caja abierta).

> **Nota de brecha detectada:** `database/schema.sql` no incluye una tabla para el historial de cambios de precio que exige HU-02 ("el historial de precios registra el cambio con fecha y usuario"). Se agrega como tarea explícita (T-015) que incluye la migración faltante.

---

## 0. Configuración Base del Proyecto

- [ ] **T-001 — Inicializar proyecto backend**
  Crear `backend/package.json`, scripts `dev`/`start`, y la estructura de carpetas definida en `plan.md §3` (`src/config`, `src/middleware`, `src/modules`, `src/utils`, `src/jobs`).
  **DoD:** `npm run dev` levanta el servidor Express en el puerto de `PORT`; `GET /api/health` responde `200 { "status": "ok" }`.

- [ ] **T-002 — Configurar variables de entorno**
  Crear `backend/.env.example` con todas las variables de `plan.md §9` y `src/config/env.js` que las valide al arrancar.
  **DoD:** si falta `SUPABASE_DB_URL` o `JWT_SECRET`, el proceso termina con un mensaje de error claro en consola (no arranca en silencio); con todas las variables presentes, arranca normalmente.

- [ ] **T-003 — Conexión a Supabase PostgreSQL**
  Implementar `src/config/db.js` con un pool de `pg` apuntando a `SUPABASE_DB_URL`.
  **DoD:** `GET /api/health/db` ejecuta `SELECT 1` contra Supabase y responde `200`; si la base no está disponible, responde `503` con `{ "error": "..." }` en vez de tirar el proceso.

- [ ] **T-004 — Aplicar `database/schema.sql` en Supabase**
  Ejecutar el script contra el proyecto Supabase (vía SQL Editor o `psql`).
  **DoD:** consulta a `information_schema.tables` confirma la existencia de las 10 tablas y `pg_type` confirma los 5 ENUMs del script; `SELECT username FROM usuarios WHERE username = 'admin'` retorna 1 fila.

- [ ] **T-005 — Middlewares globales de Express**
  Configurar `cors`, `express.json()`, logging (`morgan`) y `src/middleware/error.middleware.js` como manejador central de errores.
  **DoD:** una ruta de prueba que hace `throw new ApiError(400, 'mensaje')` responde `400 { "error": "mensaje" }` sin exponer stack trace; una ruta que lanza un error no controlado responde `500 { "error": "Error interno del servidor" }`.

- [ ] **T-006 — ESLint + Prettier**
  Configurar linting y formato según convenciones de `plan.md §5.2`.
  **DoD:** `npm run lint` pasa sin errores sobre el código base inicial; introducir intencionalmente una variable no usada hace fallar el comando.

---

## 1. Autenticación y Autorización (transversal)

- [ ] **T-007 — Middleware de validación genérico (`validate.middleware.js`)**
  Recibe un esquema `zod` y valida `req.body`/`req.query` antes del controller.
  **DoD:** `POST /api/auth/login` con body `{}` responde `400` con el campo faltante indicado, sin que el controller de login se ejecute (verificable con un log o spy).

- [ ] **T-008 — `POST /api/auth/login`**
  Implementar `auth.routes.js` / `auth.controller.js` / `auth.service.js` según `spec.md` HU transversal de autenticación.
  **DoD (escenarios spec):**
  - Login con `admin` / `admin123` responde `200` con `token` JWT y datos de usuario, **sin** `password_hash` en la respuesta.
  - Password incorrecta responde `401 { "error": "Contraseña incorrecta" }`.
  - Usuario inexistente o `activo = false` responde `401 { "error": "Usuario no encontrado" }`.

- [ ] **T-009 — Middleware `auth.middleware.js` (verificación de JWT)**
  **DoD:**
  - Request sin header `Authorization` a ruta protegida responde `401 { "error": "Token requerido" }`.
  - Token inválido o expirado responde `401 { "error": "Token inválido o expirado" }`.
  - Token válido agrega `req.user = { id, usuario, rol }` y continúa al siguiente handler.

- [ ] **T-010 — Middleware `role.middleware.js` (`requireRole`)**
  **DoD:** un usuario con rol `cajero` que llama una ruta envuelta en `requireRole('administrador')` responde `403`; un usuario `administrador` pasa y llega al controller.

- [ ] **T-011 — CRUD de usuarios (solo administrador)**
  `POST /api/usuarios`, `GET /api/usuarios`, `PATCH /api/usuarios/:id` (editar/desactivar).
  **DoD:** admin crea un usuario enviando password en texto plano; en la fila persistida, `password_hash` ≠ texto plano y `bcrypt.compare(passwordPlano, password_hash)` retorna `true`; un cajero que intenta `POST /api/usuarios` recibe `403`.

---

## 2. Módulo Productos (HU-01 a HU-04)

- [ ] **T-012 — Esquema `zod` de alta/edición de producto**
  Campos obligatorios según HU-01: nombre, código de barras o interno, categoría, precio de venta, precio de costo, unidad de medida, stock inicial, stock mínimo.
  **DoD:** payload sin `precio_venta` es rechazado por el middleware de validación con `400` antes de tocar la base de datos.

- [ ] **T-013 — `POST /api/productos` (alta)**
  **DoD (escenarios HU-01):**
  - Alta con todos los campos válidos responde `201`, el producto queda `activo = true` y `stock_actual` refleja el stock inicial ingresado.
  - Alta con `codigo_barras` ya existente responde `409 { "error": "El código de barras ya está registrado" }` y el conteo de filas en `productos` no aumenta.
  - Alta con `precio_venta` vacío responde `400` y no se inserta fila.

- [ ] **T-014 — `PATCH /api/productos/:id` (edición)**
  **DoD (escenarios HU-02):**
  - Cambiar `precio_venta` a un valor > 0 responde `200` y un `SELECT` posterior confirma el nuevo precio.
  - Enviar `precio_venta = 0` o negativo responde `400 { "error": "El precio debe ser mayor a cero" }` y el precio en base de datos no cambia.

- [ ] **T-015 — Historial de cambios de precio (migración + registro)**
  Agregar tabla `historial_precios` (`id_producto`, `precio_anterior`, `precio_nuevo`, `id_usuario`, `fecha`) — no existe en `database/schema.sql`, requiere migración nueva. `PATCH /api/productos/:id` inserta una fila cuando `precio_venta` cambia.
  **DoD:** tras un cambio de precio exitoso, `SELECT * FROM historial_precios WHERE id_producto = :id ORDER BY fecha DESC LIMIT 1` retorna una fila con `id_usuario` igual al usuario autenticado del JWT (no del body) y los precios anterior/nuevo correctos.

- [ ] **T-016 — `PATCH /api/productos/:id/desactivar`**
  **DoD (escenarios HU-03):**
  - Producto activo pasa a `activo = false`.
  - `GET /api/productos?q=...` ya no lo incluye en los resultados.
  - Una venta histórica que referencia ese producto (`detalle_venta`) sigue siendo consultable sin error (FK no se rompe, no hay `ON DELETE CASCADE` sobre productos).

- [ ] **T-017 — `GET /api/productos?codigo=` y `?q=` (búsqueda)**
  Solo retorna productos `activo = true`.
  **DoD (escenarios HU-04):**
  - Búsqueda por `codigo` exacto existente retorna el producto único.
  - Búsqueda por `q=cuad` (parcial, case-insensitive) retorna todos los productos activos cuyo nombre contiene "cuad".
  - Búsqueda sin coincidencias retorna `200` con arreglo vacío (el frontend decide mostrar "Producto no encontrado").
  - Con un catálogo de prueba de 5,000 productos, el tiempo de respuesta medido es menor a 300 ms (spec §5.6).

---

## 3. Módulo Categorías (soporte de Productos)

- [ ] **T-018 — `GET /api/categorias` y `POST /api/categorias`**
  **DoD:** `GET` retorna solo categorías `activo = true`; `POST` con `nombre` duplicado responde `409` (constraint `UNIQUE` de `categorias.nombre`).

---

## 4. Módulo Caja — Apertura (HU-14, prerrequisito de Ventas)

- [ ] **T-019 — `POST /api/caja/apertura`**
  **DoD (escenarios HU-14):**
  - Con `fondo_inicial` válido y sin caja abierta, crea `corte_caja` con `estado = 'abierto'`, `id_usuario` del JWT y `fecha_apertura = NOW()`; responde `201`.
  - Si ya existe un corte con `estado = 'abierto'`, responde `409 { "error": "Ya existe una caja abierta para este turno" }` y no se inserta un segundo registro.

- [ ] **T-020 — `GET /api/caja/actual`**
  **DoD:** si hay un corte `abierto`, lo retorna completo; si no hay ninguno, responde `404` (usado por el servicio de ventas para bloquear el cobro).

---

## 5. Módulo Ventas (HU-05 a HU-09)

- [ ] **T-021 — Esquema `zod` de venta**
  Valida renglones (`id_producto`, `cantidad`), método de pago y monto recibido.
  **DoD:** payload con `renglones: []` (ticket vacío) responde `400` antes de llegar al service.

- [ ] **T-022 — Generador de folio de venta**
  Función que produce folios únicos (`VARCHAR(15)`) de forma segura ante concurrencia.
  **DoD:** ejecutar 10 inserciones de venta en paralelo (`Promise.all`) no produce ninguna violación de la constraint `UNIQUE` sobre `ventas.folio`.

- [ ] **T-023 — `POST /api/ventas` (transacción atómica venta + inventario)**
  **DoD (escenarios HU-05):**
  - Con caja abierta y al menos un producto, pago en efectivo exacto: responde `201` con folio, productos, total y `cambio: "0.00"`; `stock_actual` de cada producto disminuye en la cantidad vendida; se inserta un `movimientos_inventario` tipo `'venta'` por cada renglón.
  - Pago de `$50.00` sobre total de `$45.50`: `cambio` calculado y persistido es `4.50`.
  - Pago insuficiente (`$40.00` sobre `$45.50`): responde `400 { "error": "Monto insuficiente" }`; no se crea fila en `ventas` ni se modifica `stock_actual` (rollback verificable).
  - Sin caja abierta: responde `400 { "error": "Debe abrir la caja antes de realizar ventas" }`; no se crea ninguna venta.

- [ ] **T-024 — Validación de stock disponible al confirmar venta**
  **DoD (escenario HU-06):** intentar vender una cantidad mayor al `stock_actual` responde `400 { "error": "Stock insuficiente. Disponible: N" }` (N = stock real) dentro de la misma transacción de `POST /api/ventas`, sin modificar inventario.

- [ ] **T-025 — Recalculo de totales en el backend**
  El backend ignora cualquier `total`/`subtotal` enviado en el payload y los recalcula desde `precio_venta` vigente × cantidad − descuentos.
  **DoD:** enviar un payload con `total` manipulado (distinto al correcto) produce una venta persistida con el total correctamente recalculado, no el enviado.

- [ ] **T-026 — Confirmar que "cancelar venta en curso" no requiere endpoint de backend**
  Documentar explícitamente que el ticket vive en el frontend hasta el cobro; `POST /api/ventas` es la única operación de escritura del flujo.
  **DoD:** README del backend deja constancia de esta decisión; no existe ningún endpoint de creación de "venta en borrador/pendiente" en el código.

- [ ] **T-027 — Descuento sobre la venta (con autorización de administrador)**
  **DoD (escenarios HU-08):**
  - Descuento porcentual o monto fijo válido (≤ subtotal) se aplica, persiste en `ventas.descuento`, y el total responde recalculado.
  - Descuento mayor al subtotal responde `400 { "error": "El descuento no puede ser mayor al total" }` (reforzado también por `chk_descuento_valido` a nivel DB).
  - Descuento que supera el umbral configurado (>20%) sin `passwordAdmin` válida en el payload responde `401`/`403`, no se aplica.
  - Con `passwordAdmin` correcta (verificada con `bcrypt.compare` contra un usuario `rol = 'administrador'`), el descuento se aplica.

- [ ] **T-028 — `GET /api/ventas/:folio`**
  **DoD (escenarios HU-09):** folio existente retorna la venta con su `detalle_venta` completo; folio inexistente responde `404 { "error": "Folio de venta no encontrado" }`.

- [ ] **T-029 — `POST /api/devoluciones` (transacción atómica)**
  **DoD (escenarios HU-09 + RN-05):**
  - Devolución sobre una venta válida crea fila en `devoluciones` + `detalle_devolucion`, reintegra `stock_actual` de los productos devueltos e inserta `movimientos_inventario` tipo `'devolucion'`.
  - Devolución parcial (1 de 3 productos de la venta) solo afecta el `stock_actual` del producto seleccionado y `total_devuelto` corresponde únicamente a ese renglón.
  - Intento de devolución sobre una venta fuera de la ventana permitida (no es del día actual ni del día anterior) responde `400` con rechazo explícito.

---

## 6. Módulo Inventario (HU-10 a HU-13)

- [ ] **T-030 — `GET /api/inventario/:idProducto`**
  **DoD (escenarios HU-10):** retorna `stock_actual`, `stock_minimo`, `unidad_medida`; cuando `stock_actual <= stock_minimo`, la respuesta incluye `stockBajo: true`.

- [ ] **T-031 — `POST /api/inventario/entradas`**
  **DoD (escenarios HU-11):**
  - Entrada de 50 unidades incrementa `stock_actual` en 50 e inserta `movimientos_inventario` tipo `'entrada'` con proveedor y fecha de factura.
  - Cantidad 0 o negativa responde `400 { "error": "La cantidad debe ser mayor a cero" }` y no modifica `stock_actual`.

- [ ] **T-032 — `POST /api/inventario/ajustes`**
  **DoD (escenarios HU-12):**
  - Ajuste negativo válido (ej. -3, "Merma") reduce `stock_actual` en 3 y queda en `movimientos_inventario` tipo `'ajuste'` con `motivo`, `id_usuario` (del JWT) y fecha.
  - Ajuste sin `motivo` responde `400 { "error": "Debe indicar el motivo del ajuste" }`.
  - Ajuste que llevaría el stock a negativo, enviado sin `confirmar: true`, responde `409 { "error": "El ajuste resultaría en stock negativo" }` sin aplicar el cambio; reenviado con `confirmar: true` se aplica y el stock puede quedar negativo.

- [ ] **T-033 — `GET /api/inventario/:idProducto/movimientos?desde=&hasta=`**
  **DoD (escenarios HU-13):** retorna lista cronológica (fecha, tipo, cantidad, usuario); con `desde=2026-06-01&hasta=2026-06-30` solo se incluyen movimientos dentro de ese rango (verificar con un movimiento fuera de rango que no aparece).

---

## 7. Módulo Corte de Caja — Cierre e Historial (HU-15, HU-16)

- [ ] **T-034 — `POST /api/caja/:id/cerrar`**
  **DoD (escenarios HU-15 + RN-07):**
  - Con ventas registradas y `efectivoContado` recibido, genera resumen con: fondo inicial, total de ventas en efectivo, total de devoluciones, efectivo esperado, efectivo contado y diferencia; el corte pasa a `estado = 'cerrado'`.
  - Tras el cierre, `POST /api/ventas` referenciando ese `id_corte` ya no es aceptado (la caja cerrada bloquea nuevas ventas).
  - Diferencia distinta de cero se etiqueta como `"sobrante"` o `"faltante"` en la respuesta; admite `nota_diferencia` opcional.
  - Corte sin ventas registradas retorna `total_ventas: "0.00"` y `diferencia: "0.00"`.
  - Cualquier intento posterior de `PATCH`/`DELETE` sobre un corte con `estado = 'cerrado'` responde `403`/`405` (el corte es definitivo).

- [ ] **T-035 — `GET /api/cortes` (historial) y `GET /api/cortes/:id` (detalle)**
  **DoD (escenarios HU-16):** el listado retorna fecha, turno, cajero, total de ventas y diferencia por cada corte cerrado; el detalle de un corte específico incluye el desglose completo con todas las ventas de ese turno.

---

## 8. Módulo Reportes (HU-17, HU-18)

- [ ] **T-036 — `GET /api/reportes/ventas?desde=&hasta=`**
  **DoD (escenarios HU-17):** rango con ventas retorna total de transacciones, monto total y ticket promedio; rango sin ventas responde `200` con `{ "mensaje": "No hay ventas en el período seleccionado" }` y sin datos vacíos engañosos (no un reporte con ceros disfrazados de datos reales).

- [ ] **T-037 — `GET /api/reportes/ventas/export?formato=pdf|csv`**
  **DoD:** la respuesta incluye `Content-Disposition: attachment` y el archivo generado (PDF o CSV según el parámetro) contiene los mismos totales que el endpoint JSON equivalente del rango solicitado.

- [ ] **T-038 — `GET /api/reportes/stock-bajo`**
  **DoD (escenarios HU-18):** retorna productos con `stock_actual <= stock_minimo` (nombre, stock actual, mínimo, diferencia); si no hay ninguno, responde `200` con `{ "mensaje": "Todos los productos tienen stock suficiente" }` y arreglo vacío.

---

## 9. Transversal / No Funcionales

- [ ] **T-039 — Auditoría de usuario y timestamp en escrituras críticas**
  Ajuste de inventario, edición de precio y cierre de corte toman `id_usuario` exclusivamente de `req.user` (JWT), nunca del body.
  **DoD:** enviar un `id_usuario` falso en el body de cualquiera de estas tres operaciones no afecta el valor persistido; el valor guardado siempre coincide con el usuario autenticado.

- [ ] **T-040 — Job de respaldo diario (`jobs/backupDiario.js`)**
  Implementado con `node-cron`, vuelca un `.sql` a `BACKUP_DIR`.
  **DoD:** ejecutar la función exportada manualmente (fuera del cron) genera un archivo `.sql` con timestamp en el nombre dentro de `BACKUP_DIR`; el cron programado queda registrado en el log de arranque del servidor.

- [ ] **T-041 — Zona horaria y formato de moneda**
  **DoD:** los timestamps devueltos por la API corresponden a `America/Hermosillo` (UTC-7, sin horario de verano); todos los montos en las respuestas tienen exactamente 2 decimales.

- [ ] **T-042 — Prueba de rendimiento (spec §5.6)**
  **DoD:** con un catálogo de prueba de 5,000 productos, `GET /api/productos?codigo=` responde en menos de 300 ms (medido con `autocannon` o script equivalente); `POST /api/ventas` con un ticket típico responde en menos de 2 s.

- [ ] **T-043 — Suite de tests de integración por módulo**
  **DoD:** `npm test` ejecuta y pasa pruebas que cubren, como mínimo, cada escenario `Given/When/Then` de `spec.md` para los módulos Productos, Ventas, Inventario, Caja y Reportes.

- [ ] **T-044 — Documentación de la API**
  README del backend o colección Postman/Insomnia exportada.
  **DoD:** cada endpoint implementado está documentado con método, ruta, body esperado, respuesta de éxito y posibles errores; un desarrollador de frontend puede integrar el cliente HTTP sin leer el código fuente del backend.
