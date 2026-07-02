# Tareas Frontend — Sistema Punto de Venta (Papelería)

**Stack:** React 18 + Vite · react-router-dom · @tanstack/react-query · axios · CSS Modules  
**Basado en:** `spec.md` (v1.0), `plan.md`, `skill-ith-backend.md`  
**Convenciones:**
- Componentes: `PascalCase` (un componente por archivo `.jsx`)
- Hooks: `camelCase` con prefijo `use` (`useProductos.js`)
- Archivos API: `camelCase` (`productos.api.js`)
- CSS Modules: mismo nombre que el componente (`LoginPage.module.css`), clases internas en `camelCase`
- Variables de entorno: `VITE_API_BASE_URL` en `frontend/.env`

---

## FASE 1 — Infraestructura Base

---

### F-001 — Inicializar proyecto Vite + React

**Archivo(s):** `frontend/` (raíz del proyecto)

**DoD:**
```
Given que ejecuto: npm create vite@latest frontend -- --template react
When instalo dependencias con npm install
Then el servidor arranca con npm run dev en http://localhost:5173
And el archivo vite.config.js existe y tiene el alias "@" apuntando a src/
```

---

### F-002 — Instalar dependencias del proyecto

**Archivo(s):** `frontend/package.json`

**Dependencias requeridas:**
```
react-router-dom @tanstack/react-query axios
```

**DoD:**
```
Given que ejecuto: npm install react-router-dom @tanstack/react-query axios
When reviso package.json
Then las tres dependencias aparecen en "dependencies"
And npm run dev no lanza errores de módulo no encontrado
```

---

### F-003 — Cliente axios con interceptor JWT

**Archivo(s):** `src/api/client.js`

**DoD:**
```
Given que existe VITE_API_BASE_URL=http://localhost:4000/api en frontend/.env
When importo el cliente en cualquier módulo
Then las peticiones salen con la baseURL configurada
And si existe un token en localStorage, el header Authorization: Bearer <token> se agrega automáticamente
And si la respuesta es 401, el cliente limpia el token y redirige a /login
```

---

### F-004 — AuthContext + RequireAuth + RequireRole

**Archivo(s):** `src/auth/AuthContext.jsx`, `src/auth/RequireAuth.jsx`, `src/auth/RequireRole.jsx`

**DoD:**
```
Given que el usuario inicia sesión correctamente
When el contexto recibe el token y el objeto de usuario
Then AuthContext expone: { user, token, login, logout }
And RequireAuth redirige a /login si no hay token
And RequireRole("administrador") redirige a /sin-acceso si el rol no coincide
```

---

### F-005 — Definición de rutas (router.jsx)

**Archivo(s):** `src/router.jsx`

**Rutas requeridas:**
| Ruta | Componente | Roles permitidos |
|---|---|---|
| `/login` | LoginPage | público |
| `/venta` | VentaPage | cajero, administrador |
| `/devoluciones` | DevolucionPage | cajero, administrador |
| `/productos` | CatalogoProductosPage | administrador |
| `/productos/nuevo` | ProductoFormPage | administrador |
| `/productos/:id/editar` | ProductoEditPage | administrador |
| `/inventario` | InventarioPage | administrador |
| `/inventario/:id/historial` | HistorialMovimientosPage | administrador |
| `/caja/abrir` | AperturaCajaPage | cajero, administrador |
| `/caja/corte` | CorteCajaPage | cajero, administrador |
| `/caja/historial` | HistorialCortesPage | administrador |
| `/reportes/ventas` | ReporteVentasPage | administrador |
| `/reportes/stock-bajo` | ReporteStockBajoPage | administrador |

**DoD:**
```
Given que el usuario no está autenticado
When navega a /venta
Then es redirigido a /login
And cuando un cajero navega a /productos
Then es redirigido a /sin-acceso
```

---

### F-006 — Layouts por rol

**Archivo(s):** `src/layouts/AdminLayout.jsx`, `src/layouts/CajeroLayout.jsx`

**DoD:**
```
Given que el usuario tiene rol "administrador"
When accede a cualquier ruta protegida
Then ve el AdminLayout con navegación a: Productos, Inventario, Ventas, Caja, Reportes, Usuarios
Given que el usuario tiene rol "cajero"
When accede a cualquier ruta protegida
Then ve el CajeroLayout con navegación a: Venta, Devoluciones, Caja
And el nombre del usuario y botón "Cerrar sesión" son visibles en el header
```

---

### F-007 — Utilidades: currency.js y dateFormat.js

**Archivo(s):** `src/utils/currency.js`, `src/utils/dateFormat.js`

**DoD:**
```
Given que llamo formatCurrency(45.5)
Then retorna la cadena "$45.50"
Given que llamo formatDate("2026-06-29T10:00:00Z")
Then retorna "29/06/2026" en zona horaria America/Hermosillo
```

---

## FASE 2 — Autenticación

---

### F-008 — LoginPage

**Archivo(s):** `src/features/auth/pages/LoginPage.jsx`, `LoginPage.module.css`

**HU:** Transversal (spec §5.4)

**DoD:**
```
Given que estoy en /login
When ingreso username "admin" y password "admin123" correctos y presiono Iniciar sesión
Then el sistema llama POST /api/auth/login
And guarda el token en localStorage
And redirige al layout según el rol (cajero → /venta, administrador → /productos)

Given que ingreso credenciales incorrectas
When presiono Iniciar sesión
Then se muestra el mensaje de error debajo del formulario
And el token no se guarda

Given que algún campo está vacío
When presiono Iniciar sesión sin completar username o password
Then se resalta el campo faltante con texto "Campo requerido"
And no se realiza la petición al servidor
```

---

## FASE 3 — Componentes Compartidos

---

### F-009 — Componente Button

**Archivo(s):** `src/components/Button/Button.jsx`, `Button.module.css`

**Props:** `variant` (primary | secondary | danger), `disabled`, `loading`, `onClick`, `type`

**DoD:**
```
Given que renderizo <Button variant="primary" loading={true}>Guardar</Button>
Then el botón muestra un indicador de carga y está deshabilitado
And no dispara onClick mientras loading es true
```

---

### F-010 — Componente InputField

**Archivo(s):** `src/components/InputField/InputField.jsx`, `InputField.module.css`

**Props:** `label`, `name`, `type`, `value`, `onChange`, `error`, `required`

**DoD:**
```
Given que renderizo <InputField label="Precio" error="El precio debe ser mayor a cero" />
Then el label aparece encima del input
And el mensaje de error aparece debajo en color rojo
And el borde del input cambia a rojo
```

---

### F-011 — Componente Modal

**Archivo(s):** `src/components/Modal/Modal.jsx`, `Modal.module.css`

**Props:** `isOpen`, `onClose`, `title`, `children`

**DoD:**
```
Given que isOpen={true}
Then el modal es visible con overlay de fondo oscuro
And la tecla Escape cierra el modal
Given que isOpen={false}
Then el modal no renderiza nada en el DOM
```

---

### F-012 — Componente DataTable

**Archivo(s):** `src/components/DataTable/DataTable.jsx`, `DataTable.module.css`

**Props:** `columns` (array de { key, header, render? }), `data`, `emptyMessage`

**DoD:**
```
Given que data es un arreglo vacío
Then se muestra el emptyMessage centrado en la tabla
Given que data tiene registros
Then cada fila renderiza los valores según columns
And las celdas con render personalizado muestran el resultado de render(row)
```

---

## FASE 4 — Módulo Productos (HU-01 a HU-04)

---

### F-013 — API de productos

**Archivo(s):** `src/api/productos.api.js`

**Funciones:** `getProductos(search?)`, `getProductoPorCodigo(barcode)`, `createProducto(data)`, `updateProducto(id, data)`, `deactivateProducto(id)`

**DoD:**
```
Given que llamo getProductos("cuaderno")
Then se realiza GET /api/products?search=cuaderno con el token en el header
And retorna el array de productos del campo data de la respuesta
```

---

### F-014 — Hook useProductos

**Archivo(s):** `src/features/productos/hooks/useProductos.js`

**DoD:**
```
Given que uso useProductos({ search: "pluma" })
Then internamente usa useQuery de react-query con la key ["productos", "pluma"]
And expone { productos, isLoading, error, refetch }
And cuando search cambia, se realiza una nueva petición automáticamente
```

---

### F-015 — CatalogoProductosPage

**Archivo(s):** `src/features/productos/pages/CatalogoProductosPage.jsx`

**HU:** HU-03, HU-04

**DoD:**
```
Given que estoy en /productos
Then veo una tabla con: nombre, código, categoría, precio de venta, stock actual, estado (Activo/Inactivo)
And veo un campo de búsqueda en la parte superior

Given que escribo "cuad" en la búsqueda
When dejo de escribir (debounce 300ms)
Then la tabla se actualiza con productos cuyo nombre contiene "cuad"

Given que presiono el botón "Desactivar" en un producto activo
When confirmo en el modal de confirmación
Then el producto cambia a estado Inactivo en la tabla
And aparece un mensaje de éxito "Producto desactivado"
```

---

### F-016 — ProductoFormPage (alta de producto)

**Archivo(s):** `src/features/productos/pages/ProductoFormPage.jsx`

**HU:** HU-01

**Campos del formulario:** nombre*, código de barras, código interno, categoría*, precio de venta*, precio de costo*, unidad de medida*, stock inicial, stock mínimo

**DoD:**
```
Given que estoy en /productos/nuevo
When completo todos los campos obligatorios y presiono "Guardar"
Then se llama POST /api/products
And al recibir 201, me redirige a /productos con mensaje "Producto creado correctamente"

Given que dejo "precio de venta" vacío y presiono "Guardar"
Then el campo se resalta con error "Campo requerido"
And no se realiza la petición

Given que ingreso un código de barras ya registrado y presiono "Guardar"
Then se muestra el error "El registro ya existe" debajo del campo código de barras
```

---

### F-017 — ProductoEditPage (edición de producto)

**Archivo(s):** `src/features/productos/pages/ProductoEditPage.jsx`

**HU:** HU-02

**DoD:**
```
Given que estoy en /productos/:id/editar
Then el formulario carga los datos actuales del producto via GET /api/products

When modifico el precio de venta a un valor mayor a 0 y presiono "Guardar"
Then se llama PATCH /api/products/:id
And aparece el mensaje "Producto actualizado"
And el nuevo precio se refleja al volver al catálogo

Given que ingreso precio de venta "0" o negativo
Then aparece el error "El precio debe ser mayor a cero"
And el botón "Guardar" no envía el formulario
```

---

## FASE 5 — Módulo Ventas (HU-05 a HU-09)

---

### F-018 — API de ventas

**Archivo(s):** `src/api/ventas.api.js`

**Funciones:** `createVenta(data)`, `getVentaPorFolio(folio)`, `createDevolucion(data)`

**DoD:**
```
Given que llamo createVenta({ items, amountReceived })
Then se realiza POST /api/sales con el token en el header
And retorna la venta creada con su folio y detalle
```

---

### F-019 — BuscadorProducto

**Archivo(s):** `src/features/ventas/components/BuscadorProducto.jsx`

**HU:** HU-04

**DoD:**
```
Given que escribo un código de barras completo (13 dígitos) y presiono Enter
Then se busca el producto via GET /api/products?search=<codigo>
And si se encuentra, se agrega al ticket con cantidad 1 y el campo se limpia
And si no se encuentra, se muestra "Producto no encontrado" debajo del campo

Given que escribo texto parcial "cua"
Then aparece un dropdown con los productos que coinciden
And al hacer clic en uno, se agrega al ticket
```

---

### F-020 — TicketActual

**Archivo(s):** `src/features/ventas/components/TicketActual.jsx`

**HU:** HU-05, HU-06, HU-07

**DoD:**
```
Given que el ticket tiene productos
Then cada renglón muestra: nombre, cantidad (editable), precio unitario, subtotal, botón "×" para eliminar

Given que cambio la cantidad de un producto a un valor mayor al stock
Then ese renglón muestra "Stock insuficiente. Disponible: X" en rojo
And el total no se actualiza hasta corregir la cantidad

Given que presiono "×" en un renglón
Then ese producto desaparece del ticket
And el total se recalcula
```

---

### F-021 — PanelPago

**Archivo(s):** `src/features/ventas/components/PanelPago.jsx`

**HU:** HU-05, HU-08

**DoD:**
```
Given que el ticket tiene artículos con total "$100.00"
Then el panel muestra: subtotal, descuento (editable), total, campo "Monto recibido"
And el cambio se calcula en tiempo real conforme se escribe el monto recibido

Given que el monto recibido es menor al total
Then el campo "Cambio" muestra "$0.00" en rojo y el botón "Cobrar" está deshabilitado

Given que el descuento aplicado supera el 20%
When el cajero lo ingresa y presiona "Cobrar"
Then aparece el DescuentoModal solicitando usuario y clave de administrador
```

---

### F-022 — DescuentoModal

**Archivo(s):** `src/features/ventas/components/DescuentoModal.jsx`

**HU:** HU-08 (spec §6 regla 6)

**DoD:**
```
Given que el descuento supera el umbral del 20%
When aparece el modal
Then solicita username y password de un administrador

Given que el administrador ingresa credenciales correctas y confirma
Then el descuento se aplica y el modal se cierra

Given que las credenciales son incorrectas
Then se muestra "Credenciales de administrador inválidas"
And el descuento no se aplica
```

---

### F-023 — VentaPage

**Archivo(s):** `src/features/ventas/pages/VentaPage.jsx`

**HU:** HU-05, HU-06, HU-07, HU-08

**DoD:**
```
Given que hay una caja abierta y el cajero agrega productos y cobra correctamente
When se procesa la venta
Then se muestra el TicketImpreso con los datos de la venta
And el ticket se puede imprimir con Ctrl+P (CSS print media)
And se puede iniciar una nueva venta presionando "Nueva venta"

Given que no hay caja abierta
When el cajero entra a /venta
Then aparece el aviso "Debe abrir la caja antes de realizar ventas" con botón "Abrir caja"
And el botón "Cobrar" está deshabilitado

Given que el cajero presiona "Cancelar venta"
When confirma en el modal de confirmación
Then el ticket se vacía y todos los campos se reinician
```

---

### F-024 — TicketImpreso

**Archivo(s):** `src/features/ventas/components/TicketImpreso.jsx`, `src/styles/print.css`

**HU:** HU-05 (spec §5.7)

**DoD:**
```
Given que se completa una venta
Then el ticket muestra: nombre del negocio, folio, fecha/hora en formato DD/MM/YYYY HH:mm,
  lista de productos (cantidad, descripción, precio unitario, subtotal),
  descuento, total, monto recibido, cambio

When el cajero presiona Ctrl+P
Then el navegador imprime solo el ticket (sin menús ni layout de la app)
And el formato es adecuado para 80mm (ancho máximo configurado en print.css)
```

---

### F-025 — DevolucionPage

**Archivo(s):** `src/features/devoluciones/pages/DevolucionPage.jsx`

**HU:** HU-09

**DoD:**
```
Given que estoy en /devoluciones
When ingreso el folio "V-000001" y presiono "Buscar"
Then se muestra el detalle de la venta con la lista de productos y cantidades disponibles a devolver

Given que selecciono 1 producto con cantidad 1 y presiono "Registrar devolución"
Then se llama POST /api/sales/returns
And aparece el comprobante de devolución con el monto devuelto

Given que ingreso el folio "V-999999" que no existe
Then se muestra "Folio de venta no encontrado"

Given que intento devolver una venta de hace más de 2 días
Then se muestra "Solo se pueden devolver ventas del día actual o del día anterior"
```

---

## FASE 6 — Módulo Inventario (HU-10 a HU-13)

---

### F-026 — API de inventario

**Archivo(s):** `src/api/inventario.api.js`

**Funciones:** `getStock(productId)`, `getMovimientos(productId, from?, to?)`, `registrarEntrada(data)`, `registrarAjuste(data)`

**DoD:**
```
Given que llamo registrarEntrada({ productId, quantity, supplier })
Then se realiza POST /api/inventory/entries con el token en el header
And retorna el movimiento registrado
```

---

### F-027 — InventarioPage

**Archivo(s):** `src/features/inventario/pages/InventarioPage.jsx`

**HU:** HU-10, HU-11, HU-12

**DoD:**
```
Given que estoy en /inventario
Then veo la tabla de productos con: nombre, código, stock actual, stock mínimo, unidad, estado de stock

Given que el stock de un producto es igual o menor a su mínimo
Then ese renglón muestra la etiqueta "Stock bajo" en color naranja/rojo resaltado

Given que presiono "Entrada" en un producto
Then aparece EntradaMercanciaModal pre-llenado con ese producto

Given que presiono "Ajuste" en un producto
Then aparece AjusteInventarioModal pre-llenado con ese producto
```

---

### F-028 — EntradaMercanciaModal

**Archivo(s):** `src/features/inventario/components/EntradaMercanciaModal.jsx`

**HU:** HU-11

**DoD:**
```
Given que estoy en el modal de entrada
When ingreso cantidad 50, proveedor "Dist. ABC" y presiono "Guardar"
Then se llama POST /api/inventory/entries
And el stock del producto en la tabla aumenta en 50
And aparece mensaje "Entrada registrada correctamente"

Given que ingreso cantidad 0 o negativa
Then aparece el error "La cantidad debe ser mayor a cero"
And el formulario no se envía
```

---

### F-029 — AjusteInventarioModal

**Archivo(s):** `src/features/inventario/components/AjusteInventarioModal.jsx`

**HU:** HU-12

**DoD:**
```
Given que ingreso un ajuste de -3 con motivo "Merma" y presiono "Guardar"
Then se llama POST /api/inventory/adjustments
And el stock se reduce en 3 unidades

Given que no ingreso motivo y presiono "Guardar"
Then aparece "Debe indicar el motivo del ajuste"

Given que el ajuste resultaría en stock negativo (ej. stock actual 2, ajuste -5)
Then aparece la advertencia "El ajuste resultaría en stock negativo"
And muestra un checkbox "Confirmar de todas formas" que el usuario debe marcar
And solo al marcar el checkbox se habilita el botón "Guardar"
```

---

### F-030 — HistorialMovimientosPage

**Archivo(s):** `src/features/inventario/pages/HistorialMovimientosPage.jsx`

**HU:** HU-13

**DoD:**
```
Given que estoy en /inventario/:id/historial
Then veo el nombre del producto en el encabezado
And una tabla con: fecha, tipo (venta/entrada/ajuste/devolución), cantidad, stock resultante, usuario

Given que selecciono fecha inicio "2026-06-01" y fecha fin "2026-06-30" y presiono "Filtrar"
Then la tabla muestra solo los movimientos de ese rango
And si no hay movimientos en el rango, muestra "Sin movimientos en el período seleccionado"
```

---

## FASE 7 — Módulo Corte de Caja (HU-14 a HU-16)

---

### F-031 — API de caja

**Archivo(s):** `src/api/caja.api.js`

**Funciones:** `getCajaActual()`, `abrirCaja(data)`, `cerrarCaja(id, data)`, `getHistorialCortes()`, `getDetalleCorte(id)`

**DoD:**
```
Given que llamo abrirCaja({ initialFund: 500 })
Then se realiza POST /api/cash-register/open con el token en el header
And retorna el corte creado con estado "abierto"
```

---

### F-032 — AperturaCajaPage

**Archivo(s):** `src/features/caja/pages/AperturaCajaPage.jsx`

**HU:** HU-14

**DoD:**
```
Given que no hay caja abierta y estoy en /caja/abrir
When ingreso fondo inicial "$500.00" y presiono "Abrir caja"
Then se llama POST /api/cash-register/open
And aparece el mensaje "Caja abierta correctamente" con la hora de apertura
And soy redirigido a /venta

Given que ya existe una caja abierta
When entro a /caja/abrir
Then se muestra "Ya existe una caja abierta para este turno" con botón "Ir a ventas"
```

---

### F-033 — CorteCajaPage

**Archivo(s):** `src/features/caja/pages/CorteCajaPage.jsx`

**HU:** HU-15

**DoD:**
```
Given que hay una caja abierta y estoy en /caja/corte
Then se muestra el resumen de la caja: fondo inicial, total de ventas, total de devoluciones, efectivo esperado

When ingreso el efectivo contado "$1,200.00" y presiono "Realizar corte"
Then se llama PATCH /api/cash-register/:id/close
And se muestra el resumen final con la diferencia:
  - Si diferencia = 0 → "Exacto" en verde
  - Si diferencia > 0 → "Sobrante: $X.XX" en azul
  - Si diferencia < 0 → "Faltante: $X.XX" en rojo
And si hay diferencia, aparece un campo de texto "Nota de justificación"
And la caja queda en estado Cerrado
```

---

### F-034 — HistorialCortesPage

**Archivo(s):** `src/features/caja/pages/HistorialCortesPage.jsx`

**HU:** HU-16

**DoD:**
```
Given que estoy en /caja/historial
Then veo la tabla de cortes con: fecha/hora de apertura y cierre, cajero, total ventas, diferencia, estado

Given que presiono "Ver detalle" en un corte
Then aparece un modal con el desglose completo: todas las ventas del turno con folio, hora y total
```

---

## FASE 8 — Módulo Reportes (HU-17 a HU-18)

---

### F-035 — API de reportes

**Archivo(s):** `src/api/reportes.api.js`

**Funciones:** `getReporteVentas(from, to)`, `getReporteStockBajo()`

**DoD:**
```
Given que llamo getReporteVentas("2026-06-01", "2026-06-30")
Then se realiza GET /api/reports/sales?from=2026-06-01&to=2026-06-30
And retorna { totalTransacciones, montoTotal, ticketPromedio, ventas: [...] }
```

---

### F-036 — ReporteVentasPage

**Archivo(s):** `src/features/reportes/pages/ReporteVentasPage.jsx`

**HU:** HU-17

**DoD:**
```
Given que estoy en /reportes/ventas
When selecciono fecha inicio y fecha fin y presiono "Generar"
Then se muestra: total de transacciones, monto total, ticket promedio
And la tabla lista las ventas del período con folio, fecha, cajero y total

Given que no hay ventas en el período
Then se muestra "No hay ventas en el período seleccionado"
And el botón "Exportar CSV" está deshabilitado

Given que presiono "Exportar CSV" con datos visibles
Then el navegador descarga un archivo ventas_YYYYMMDD.csv con los datos de la tabla
```

---

### F-037 — ReporteStockBajoPage

**Archivo(s):** `src/features/reportes/pages/ReporteStockBajoPage.jsx`

**HU:** HU-18

**DoD:**
```
Given que estoy en /reportes/stock-bajo
Then se muestra la tabla de productos con stock ≤ stock mínimo
  con columnas: nombre, código, stock actual, stock mínimo, diferencia (negativa en rojo)

Given que todos los productos tienen stock suficiente
Then se muestra "Todos los productos tienen stock suficiente"

Given que presiono "Exportar CSV"
Then el navegador descarga stock_bajo_YYYYMMDD.csv
```

---

## Resumen de Tareas

| ID | Tarea | Fase | HU relacionada |
|---|---|---|---|
| F-001 | Inicializar Vite + React | 1 | — |
| F-002 | Instalar dependencias | 1 | — |
| F-003 | Cliente axios + interceptor JWT | 1 | — |
| F-004 | AuthContext + RequireAuth + RequireRole | 1 | — |
| F-005 | Router con rutas protegidas | 1 | — |
| F-006 | AdminLayout + CajeroLayout | 1 | — |
| F-007 | currency.js + dateFormat.js | 1 | — |
| F-008 | LoginPage | 2 | Transversal |
| F-009 | Button | 3 | — |
| F-010 | InputField | 3 | — |
| F-011 | Modal | 3 | — |
| F-012 | DataTable | 3 | — |
| F-013 | productos.api.js | 4 | HU-01 a HU-04 |
| F-014 | useProductos hook | 4 | HU-04 |
| F-015 | CatalogoProductosPage | 4 | HU-03, HU-04 |
| F-016 | ProductoFormPage | 4 | HU-01 |
| F-017 | ProductoEditPage | 4 | HU-02 |
| F-018 | ventas.api.js | 5 | HU-05 a HU-09 |
| F-019 | BuscadorProducto | 5 | HU-04 |
| F-020 | TicketActual | 5 | HU-05, HU-06, HU-07 |
| F-021 | PanelPago | 5 | HU-05, HU-08 |
| F-022 | DescuentoModal | 5 | HU-08 |
| F-023 | VentaPage | 5 | HU-05 a HU-08 |
| F-024 | TicketImpreso + print.css | 5 | HU-05 |
| F-025 | DevolucionPage | 5 | HU-09 |
| F-026 | inventario.api.js | 6 | HU-10 a HU-13 |
| F-027 | InventarioPage | 6 | HU-10, HU-11, HU-12 |
| F-028 | EntradaMercanciaModal | 6 | HU-11 |
| F-029 | AjusteInventarioModal | 6 | HU-12 |
| F-030 | HistorialMovimientosPage | 6 | HU-13 |
| F-031 | caja.api.js | 7 | HU-14 a HU-16 |
| F-032 | AperturaCajaPage | 7 | HU-14 |
| F-033 | CorteCajaPage | 7 | HU-15 |
| F-034 | HistorialCortesPage | 7 | HU-16 |
| F-035 | reportes.api.js | 8 | HU-17, HU-18 |
| F-036 | ReporteVentasPage | 8 | HU-17 |
| F-037 | ReporteStockBajoPage | 8 | HU-18 |

**Total: 37 tareas**
