# Especificación de Requerimientos — Sistema Punto de Venta (Papelería)

**Versión:** 1.0  
**Fecha:** 2026-06-29  
**Analista:** José Rodríguez P.  
**Institución:** Instituto Tecnológico de Hermosillo

---

## 1. Descripción General

Sistema de punto de venta (TPV) para papelería orientado a pequeñas y medianas tiendas. Gestiona el catálogo de productos, procesa ventas, controla el inventario y genera cortes de caja. Uso en entorno local con un solo operador por turno.

---

## 2. Actores del Sistema

| Actor | Descripción |
|---|---|
| **Cajero** | Opera el punto de venta durante un turno (ventas, devoluciones, consultas) |
| **Administrador** | Gestiona productos, precios, usuarios y reportes |
| **Sistema** | Ejecuta validaciones, actualiza inventario y genera documentos automáticamente |

---

## 3. Módulos del Sistema

1. Gestión de Productos  
2. Ventas (Cobro en Caja)  
3. Control de Inventario  
4. Corte de Caja  
5. Reportes

---

## 4. Historias de Usuario y Criterios de Aceptación

---

### MÓDULO 1 — Gestión de Productos

---

#### HU-01 — Registrar producto nuevo

**Como** administrador,  
**quiero** dar de alta un producto en el catálogo,  
**para** que el cajero pueda buscarlo y venderlo.

**Campos requeridos:** nombre, código de barras (o código interno), categoría, precio de venta, precio de costo, unidad de medida, stock inicial, stock mínimo.

**Criterios de aceptación:**

```
Scenario: Alta exitosa de producto
  Given que estoy en el formulario de nuevo producto
  When ingreso todos los campos obligatorios con valores válidos
  And presiono "Guardar"
  Then el producto aparece en el catálogo con estado Activo
  And el inventario refleja el stock inicial ingresado

Scenario: Código de barras duplicado
  Given que ya existe un producto con código de barras "7501000000001"
  When intento registrar otro producto con el mismo código
  Then el sistema muestra el error "El código de barras ya está registrado"
  And no se crea el producto duplicado

Scenario: Campo obligatorio vacío
  Given que estoy en el formulario de nuevo producto
  When dejo el campo "precio de venta" vacío
  And presiono "Guardar"
  Then el sistema resalta el campo faltante
  And no se guarda el producto
```

---

#### HU-02 — Editar producto existente

**Como** administrador,  
**quiero** modificar los datos de un producto (precio, nombre, stock mínimo),  
**para** mantener el catálogo actualizado.

**Criterios de aceptación:**

```
Scenario: Cambio de precio de venta
  Given que selecciono un producto existente
  When modifico el precio de venta a un valor mayor a 0
  And guardo los cambios
  Then el nuevo precio se aplica en la siguiente venta
  And el historial de precios registra el cambio con fecha y usuario

Scenario: Precio inválido
  Given que edito un producto
  When ingreso un precio de venta de "0" o negativo
  Then el sistema muestra el error "El precio debe ser mayor a cero"
  And no se guardan los cambios
```

---

#### HU-03 — Desactivar producto

**Como** administrador,  
**quiero** desactivar un producto sin eliminarlo,  
**para** conservar el historial de ventas sin que el cajero pueda venderlo.

**Criterios de aceptación:**

```
Scenario: Desactivación de producto
  Given que selecciono un producto activo
  When presiono "Desactivar" y confirmo la acción
  Then el producto queda en estado Inactivo
  And no aparece en los resultados de búsqueda del cajero
  And las ventas pasadas que lo incluyen permanecen en el historial

Scenario: Intento de venta de producto inactivo
  Given que un producto está en estado Inactivo
  When el cajero busca el producto por código o nombre
  Then el sistema no lo muestra en los resultados
```

---

#### HU-04 — Buscar producto por código o nombre

**Como** cajero,  
**quiero** buscar un producto por código de barras o nombre,  
**para** agregarlo rápidamente a la venta.

**Criterios de aceptación:**

```
Scenario: Búsqueda por código de barras (lector o teclado)
  Given que hay un producto activo con código "7501000000001"
  When ingreso el código en la barra de búsqueda
  Then el producto se agrega automáticamente al ticket con cantidad 1

Scenario: Búsqueda por nombre parcial
  Given que existen productos con nombres que contienen "cuaderno"
  When escribo "cuad" en la barra de búsqueda
  Then se muestra una lista con todos los productos activos que coinciden
  And puedo seleccionar uno para agregarlo al ticket

Scenario: Producto no encontrado
  Given que no existe ningún producto con el término buscado
  When ingreso el término en la barra de búsqueda
  Then el sistema muestra "Producto no encontrado"
  And no se agrega ningún artículo al ticket
```

---

### MÓDULO 2 — Ventas (Cobro en Caja)

---

#### HU-05 — Crear nueva venta

**Como** cajero,  
**quiero** registrar los productos de una venta y cobrar al cliente,  
**para** generar el ticket y actualizar el inventario.

**Criterios de aceptación:**

```
Scenario: Venta con pago en efectivo exacto
  Given que el cajero tiene una caja abierta
  And ha agregado al menos un producto al ticket
  When selecciona "Efectivo" y el monto ingresado es igual al total
  Then el sistema registra la venta
  And muestra el ticket con folio, productos, total y cambio "$0.00"
  And descuenta las unidades del inventario

Scenario: Pago con cambio
  Given que el total de la venta es "$45.50"
  When el cajero ingresa un pago de "$50.00" en efectivo
  Then el sistema muestra el cambio de "$4.50"
  And registra la venta con el monto recibido

Scenario: Monto de pago insuficiente
  Given que el total de la venta es "$45.50"
  When el cajero ingresa un pago de "$40.00"
  Then el sistema muestra el error "Monto insuficiente"
  And no procesa la venta

Scenario: Intento de venta sin caja abierta
  Given que no hay ninguna caja abierta en el turno actual
  When el cajero intenta procesar una venta
  Then el sistema muestra "Debe abrir la caja antes de realizar ventas"
  And bloquea la acción de cobro
```

---

#### HU-06 — Modificar cantidad de un producto en el ticket

**Como** cajero,  
**quiero** cambiar la cantidad de un producto ya agregado al ticket,  
**para** corregir errores sin cancelar toda la venta.

**Criterios de aceptación:**

```
Scenario: Aumento de cantidad
  Given que el ticket contiene "Lápiz #2" con cantidad 1
  When el cajero cambia la cantidad a 3
  Then el subtotal de ese renglón se actualiza a precio × 3
  And el total del ticket se recalcula

Scenario: Cantidad mayor al stock disponible
  Given que el stock disponible de "Libreta profesional" es 2
  When el cajero intenta establecer cantidad 5
  Then el sistema muestra "Stock insuficiente. Disponible: 2"
  And no permite la cantidad solicitada

Scenario: Eliminar renglón del ticket
  Given que el ticket contiene 2 productos
  When el cajero elimina uno de los renglones
  Then ese producto desaparece del ticket
  And el total se recalcula con el producto restante
```

---

#### HU-07 — Cancelar venta en curso

**Como** cajero,  
**quiero** cancelar una venta antes de cobrar,  
**para** limpiar el ticket si el cliente decide no comprar.

**Criterios de aceptación:**

```
Scenario: Cancelación antes del cobro
  Given que hay productos en el ticket y aún no se ha procesado el pago
  When el cajero presiona "Cancelar venta" y confirma
  Then el ticket se vacía
  And no se genera ningún movimiento en el inventario
  And no se registra ninguna venta

Scenario: Cancelación sin confirmación
  Given que el cajero presiona "Cancelar venta"
  When no confirma la acción en el diálogo de confirmación
  Then el ticket permanece sin cambios
```

---

#### HU-08 — Aplicar descuento a la venta

**Como** cajero,  
**quiero** aplicar un descuento en porcentaje o monto fijo al total,  
**para** ofrecer promociones o ajustes a clientes frecuentes.

**Criterios de aceptación:**

```
Scenario: Descuento porcentual válido
  Given que el total del ticket es "$100.00"
  When el cajero aplica un descuento del 10%
  Then el total se actualiza a "$90.00"
  And el ticket impreso muestra el descuento aplicado

Scenario: Descuento mayor al total
  Given que el total del ticket es "$50.00"
  When se intenta aplicar un descuento de "$60.00"
  Then el sistema muestra "El descuento no puede ser mayor al total"
  And no aplica el descuento

Scenario: Descuento requiere autorización
  Given que el descuento supera el 20%
  When el cajero intenta aplicarlo
  Then el sistema solicita la clave del administrador
  And solo aplica el descuento si la clave es correcta
```

---

#### HU-09 — Registrar devolución

**Como** cajero,  
**quiero** procesar la devolución de un producto vendido,  
**para** reintegrar el importe al cliente y restituir el inventario.

**Criterios de aceptación:**

```
Scenario: Devolución con folio de venta válido
  Given que existe una venta con folio "V-000123"
  When el cajero busca el folio e indica los productos a devolver
  Then el sistema genera un comprobante de devolución
  And reintegra las unidades al inventario
  And registra el egreso de caja por el monto devuelto

Scenario: Folio de venta no encontrado
  Given que el cajero ingresa el folio "V-999999"
  When el folio no existe en el sistema
  Then el sistema muestra "Folio de venta no encontrado"
  And no procesa ninguna devolución

Scenario: Devolución parcial
  Given que una venta incluye 3 productos diferentes
  When el cajero selecciona solo 1 de los 3 para devolver
  Then solo ese producto se devuelve al inventario
  And el monto devuelto corresponde únicamente al producto seleccionado
```

---

### MÓDULO 3 — Control de Inventario

---

#### HU-10 — Consultar stock actual

**Como** administrador o cajero,  
**quiero** consultar el stock disponible de un producto,  
**para** saber si hay suficiente mercancía antes de una venta o pedido.

**Criterios de aceptación:**

```
Scenario: Consulta exitosa
  Given que existen productos registrados con stock
  When busco un producto por nombre o código
  Then el sistema muestra el stock actual, stock mínimo y unidad de medida

Scenario: Alerta de stock mínimo
  Given que el stock de "Pluma azul" es igual o menor a su stock mínimo
  When consulto el producto
  Then el sistema muestra una alerta visual "Stock bajo"
  And el producto aparece resaltado en el listado de inventario
```

---

#### HU-11 — Registrar entrada de mercancía

**Como** administrador,  
**quiero** registrar la llegada de mercancía (compra o reposición),  
**para** actualizar el inventario con las nuevas existencias.

**Criterios de aceptación:**

```
Scenario: Entrada de inventario exitosa
  Given que selecciono un producto y registro una entrada de 50 unidades
  When guardo el movimiento con proveedor y fecha de factura
  Then el stock del producto aumenta en 50 unidades
  And el movimiento queda registrado en el historial de entradas

Scenario: Cantidad de entrada inválida
  Given que intento registrar una entrada con cantidad "0" o negativa
  Then el sistema muestra "La cantidad debe ser mayor a cero"
  And no modifica el inventario
```

---

#### HU-12 — Ajuste manual de inventario

**Como** administrador,  
**quiero** realizar un ajuste manual del stock (merma, robo, error de conteo),  
**para** mantener el inventario alineado con la existencia física.

**Criterios de aceptación:**

```
Scenario: Ajuste por merma
  Given que selecciono un producto y registro un ajuste negativo de 3 unidades
  When ingreso el motivo "Merma" y confirmo
  Then el stock se reduce en 3 unidades
  And el ajuste queda en el historial con fecha, usuario y motivo

Scenario: Ajuste requiere motivo obligatorio
  Given que intento guardar un ajuste sin seleccionar motivo
  Then el sistema muestra "Debe indicar el motivo del ajuste"
  And no aplica el ajuste

Scenario: Ajuste que llevaría stock a negativo
  Given que el stock actual es 2
  When intento registrar un ajuste negativo de 5 unidades
  Then el sistema muestra "El ajuste resultaría en stock negativo"
  And solicita confirmación explícita antes de continuar
```

---

#### HU-13 — Ver historial de movimientos de inventario

**Como** administrador,  
**quiero** ver todos los movimientos de un producto (entradas, ventas, ajustes),  
**para** auditar cambios y detectar inconsistencias.

**Criterios de aceptación:**

```
Scenario: Historial por producto
  Given que selecciono un producto con movimientos registrados
  When accedo a "Historial de movimientos"
  Then se muestra una lista cronológica con fecha, tipo (venta/entrada/ajuste), cantidad y usuario responsable

Scenario: Filtro por rango de fechas
  Given que estoy en el historial de un producto
  When filtro por el rango "2026-06-01" a "2026-06-30"
  Then solo se muestran los movimientos ocurridos en ese periodo
```

---

### MÓDULO 4 — Corte de Caja

---

#### HU-14 — Abrir caja al inicio del turno

**Como** cajero,  
**quiero** registrar la apertura de caja con el fondo inicial,  
**para** que el sistema tenga referencia del saldo inicial del turno.

**Criterios de aceptación:**

```
Scenario: Apertura exitosa
  Given que no hay ninguna caja abierta
  When el cajero ingresa el fondo inicial y presiona "Abrir caja"
  Then el sistema registra la apertura con hora, fecha y usuario
  And permite procesar ventas

Scenario: Apertura con caja ya abierta
  Given que ya existe una caja abierta en el turno actual
  When otro usuario intenta abrir una nueva caja
  Then el sistema muestra "Ya existe una caja abierta para este turno"
  And bloquea la acción
```

---

#### HU-15 — Realizar corte de caja

**Como** cajero o administrador,  
**quiero** cerrar la caja al final del turno,  
**para** obtener un resumen de ventas, ingresos y diferencias.

**Criterios de aceptación:**

```
Scenario: Corte de caja exitoso
  Given que hay una caja abierta con ventas registradas
  When el cajero indica el efectivo contado en caja
  And presiona "Realizar corte"
  Then el sistema genera un resumen con:
    - Fondo inicial
    - Total de ventas en efectivo
    - Total de devoluciones
    - Efectivo esperado en caja
    - Efectivo contado
    - Diferencia (sobrante o faltante)
  And la caja queda en estado Cerrado
  And no se pueden registrar más ventas hasta abrir una nueva caja

Scenario: Diferencia detectada en corte
  Given que el efectivo contado difiere del esperado
  When se genera el corte
  Then el sistema resalta la diferencia como "Sobrante" o "Faltante"
  And permite al administrador agregar una nota de justificación

Scenario: Corte sin ventas registradas
  Given que la caja se abrió pero no hubo ninguna venta
  When se realiza el corte
  Then el resumen muestra total de ventas "$0.00" y diferencia "$0.00"
```

---

#### HU-16 — Consultar historial de cortes

**Como** administrador,  
**quiero** ver el historial de cortes de caja anteriores,  
**para** revisar el desempeño de ventas por turno o día.

**Criterios de aceptación:**

```
Scenario: Listado de cortes
  Given que existen cortes de caja registrados
  When accedo a "Historial de cortes"
  Then se muestra una lista con fecha, turno, cajero, total de ventas y diferencia

Scenario: Ver detalle de un corte
  Given que selecciono un corte de la lista
  When presiono "Ver detalle"
  Then se muestra el desglose completo del corte incluyendo todas las ventas del turno
```

---

### MÓDULO 5 — Reportes

---

#### HU-17 — Reporte de ventas por período

**Como** administrador,  
**quiero** generar un reporte de ventas por día, semana o mes,  
**para** analizar el desempeño comercial de la tienda.

**Criterios de aceptación:**

```
Scenario: Reporte diario
  Given que existen ventas registradas en la fecha seleccionada
  When genero el reporte del día "2026-06-29"
  Then se muestra el total de transacciones, monto total y ticket promedio
  And el reporte es exportable a PDF o CSV

Scenario: Rango sin ventas
  Given que no hay ventas en el período seleccionado
  When genero el reporte
  Then el sistema muestra "No hay ventas en el período seleccionado"
  And no genera un archivo vacío
```

---

#### HU-18 — Reporte de productos con stock bajo

**Como** administrador,  
**quiero** ver todos los productos que están en o por debajo del stock mínimo,  
**para** planificar reposiciones antes de que se agoten.

**Criterios de aceptación:**

```
Scenario: Lista de productos con stock bajo
  Given que existen productos cuyo stock es igual o menor al mínimo configurado
  When accedo al reporte "Stock bajo"
  Then se muestra la lista con nombre, stock actual, stock mínimo y diferencia
  And el reporte es exportable

Scenario: Sin productos con stock bajo
  Given que todos los productos tienen stock mayor a su mínimo
  When accedo al reporte "Stock bajo"
  Then el sistema muestra "Todos los productos tienen stock suficiente"
```

---

## 5. Restricciones Técnicas

### 5.1 Plataforma y Arquitectura

| Aspecto | Restricción |
|---|---|
| **Tipo de aplicación** | Aplicación web local (acceso por navegador en red interna) |
| **Arquitectura** | Cliente-servidor con API REST; frontend separado del backend |
| **Entorno de ejecución** | Servidor local (Windows o Linux); sin dependencia de internet en operación |
| **Usuarios concurrentes** | Mínimo 1, soporte para hasta 3 terminales simultáneas |

### 5.2 Backend

| Aspecto | Restricción |
|---|---|
| **Lenguaje** | Node.js (JavaScript/TypeScript) |
| **Framework** | Express.js |
| **Base de datos** | Supabase (PostgreSQL administrado, relacional, transaccional) |
| **ORM** | Cliente `pg` (node-postgres) con consultas preparadas y transacciones explícitas; `@supabase/supabase-js` solo para Storage/operaciones administrativas no transaccionales |
| **Autenticación** | JWT con expiración configurable; roles: administrador, cajero |
| **Contraseñas** | Almacenamiento con hash bcrypt (mínimo cost factor 10) |

### 5.3 Frontend

| Aspecto | Restricción |
|---|---|
| **Framework** | React (Vite) o HTML/CSS/JS vanilla según complejidad |
| **Diseño** | Responsivo para pantalla de 10" o superior; compatible con touch |
| **Impresión de ticket** | Impresión directa a impresora térmica de 58mm o 80mm vía CSS print o ESC/POS |

### 5.4 Seguridad

- Todas las rutas de la API requieren token JWT válido, excepto el endpoint de login.
- Los roles limitan el acceso: el cajero no puede acceder a reportes administrativos, ajustes de inventario ni configuración de productos.
- Las operaciones de escritura críticas (ajuste de inventario, edición de precios, corte de caja) quedan registradas con usuario y timestamp.
- No se almacenan datos de tarjetas de crédito ni información de pago sensible.

### 5.5 Base de Datos

- Las ventas y sus renglones deben registrarse en una transacción atómica; si falla cualquier parte, se revierte completa.
- El inventario se actualiza dentro de la misma transacción que la venta.
- Respaldo automático diario en archivo `.sql` en carpeta local configurada por el administrador.

### 5.6 Rendimiento

- La búsqueda de productos por código de barras debe responder en menos de 300 ms.
- El proceso de cobro (desde confirmar pago hasta mostrar ticket) debe completarse en menos de 2 segundos.
- El sistema debe soportar un catálogo de hasta 5,000 productos sin degradación notable.

### 5.7 Usabilidad

- El flujo de venta debe poder completarse íntegramente con teclado (sin ratón), para agilizar la operación del cajero.
- Los mensajes de error deben ser en español, claros y orientados al usuario no técnico.
- El ticket impreso debe incluir: nombre del negocio, folio, fecha/hora, lista de productos (cantidad, descripción, precio unitario, subtotal), descuentos, total, monto recibido y cambio.

### 5.8 Internacionalización y Moneda

- Moneda: Peso Mexicano (MXN), símbolo `$`, dos decimales.
- Zona horaria: `America/Hermosillo` (UTC-7, sin horario de verano).
- Formato de fecha: `DD/MM/YYYY`.

---

## 6. Reglas de Negocio Clave

1. No se puede procesar ninguna venta si no hay una caja abierta en el turno.
2. El stock nunca puede quedar en negativo salvo ajuste manual con confirmación explícita del administrador.
3. Un producto desactivado no puede venderse, pero sus ventas históricas deben conservarse.
4. El precio de venta al momento de la venta se almacena en el renglón del ticket; cambios futuros de precio no afectan ventas pasadas.
5. Las devoluciones solo pueden hacerse sobre ventas del día o del día anterior (configurable).
6. Los descuentos superiores al umbral configurado requieren clave de administrador.
7. El corte de caja es definitivo; no puede reabrirse ni modificarse una vez cerrado.

---

## 7. Fuera del Alcance (v1.0)

- Facturación electrónica (CFDI / SAT) — se contempla para versión 2.0.
- Gestión de clientes (CRM) o programa de lealtad.
- Integración con terminal bancaria (cobro con tarjeta).
- Módulo de compras a proveedores automatizado.
- Aplicación móvil nativa.
- Soporte multi-sucursal.

---

## 8. Glosario

| Término | Definición |
|---|---|
| **Ticket / Folio** | Comprobante de venta con identificador único incremental |
| **Corte de caja** | Cierre del turno que reconcilia el efectivo físico con el registrado en el sistema |
| **Fondo inicial** | Efectivo que el cajero deposita en caja al abrir el turno para dar cambio |
| **Stock mínimo** | Cantidad mínima de un producto antes de emitir alerta de reposición |
| **Ajuste de inventario** | Corrección manual del stock por causas no relacionadas con ventas (merma, robo, conteo) |
| **TPV** | Terminal Punto de Venta |
