# Manual de Usuario — Sistema de Punto de Venta

**TPV Papelería**
Instituto Tecnológico de Hermosillo

---

> Este manual está escrito para el personal de caja. No necesitas saber de computadoras para seguirlo — solo lee paso a paso y encontrarás lo que necesitas.

---

## Contenido

1. [Cómo entrar al sistema (iniciar sesión)](#1-cómo-entrar-al-sistema-iniciar-sesión)
2. [Cómo abrir la caja al inicio del turno](#2-cómo-abrir-la-caja-al-inicio-del-turno)
3. [Cómo buscar un producto](#3-cómo-buscar-un-producto)
4. [Cómo registrar una venta](#4-cómo-registrar-una-venta)
5. [Cómo hacer una devolución](#5-cómo-hacer-una-devolución)
6. [Cómo hacer el corte de caja al final del turno](#6-cómo-hacer-el-corte-de-caja-al-final-del-turno)
7. [Preguntas frecuentes](#7-preguntas-frecuentes)

---

## 1. Cómo entrar al sistema (iniciar sesión)

Antes de hacer cualquier cosa, necesitas identificarte en el sistema.

1. Abre el navegador (Chrome o Edge) y ve a la dirección que te dio tu supervisor.
2. Verás una pantalla con dos campos: **Usuario** y **Contraseña**.
3. Escribe tu nombre de usuario y tu contraseña.
4. Haz clic en el botón **Entrar**.

Si los datos son correctos, el sistema te llevará directamente a tu pantalla de trabajo.

> **¿Qué pasa si me equivoco la contraseña?**
> El sistema te mostrará un mensaje en rojo que dice "Credenciales inválidas". Verifica que no tengas activado el Bloq Mayús y vuelve a intentarlo. Si no recuerdas tu contraseña, pídele al administrador que la cambie.

---

## 2. Cómo abrir la caja al inicio del turno

Antes de poder registrar ventas, la caja debe estar "abierta". Esto se hace una sola vez al inicio de cada turno.

1. En el menú del lado izquierdo, haz clic en **Caja**.
2. Haz clic en **Abrir Caja**.
3. Verás un campo que dice **Fondo inicial**. Escribe ahí la cantidad de dinero en efectivo con la que empiezas el turno (por ejemplo: `500`).
4. Haz clic en el botón **Abrir turno**.
5. El sistema mostrará un mensaje de confirmación. A partir de este momento ya puedes registrar ventas.

> **Importante:** Solo puede haber una caja abierta a la vez. Si el sistema te dice que ya hay una caja abierta, es porque alguien del turno anterior no hizo el corte. Avisa a tu supervisor.

---

## 3. Cómo buscar un producto

Hay dos formas de encontrar un producto: con el lector de código de barras o escribiendo el nombre.

### Opción A — Con lector de código de barras (más rápida)

1. Coloca el cursor dentro del campo de búsqueda en la pantalla de ventas (haz clic en él).
2. Pasa el lector por el código de barras del producto.
3. El producto aparece automáticamente en la lista con su nombre y precio.

### Opción B — Escribiendo el nombre

1. Haz clic en el campo de búsqueda.
2. Escribe las primeras letras del nombre del producto (por ejemplo: `cuad` para buscar cuadernos).
3. Aparecerá una lista con los productos que coinciden.
4. Haz clic en el producto correcto para seleccionarlo.

> **¿No aparece el producto?**
> Puede que el producto no esté dado de alta en el sistema o esté inactivo. Avisa al administrador para que lo revise.

---

## 4. Cómo registrar una venta

### Paso 1 — Agregar productos al carrito

1. Busca el primer producto usando cualquiera de los métodos del paso anterior.
2. Una vez que aparezca en el carrito, verifica que la **cantidad** sea correcta.
   - Si el cliente lleva más de una pieza, cambia el número en la columna **Cant.**.
3. Repite con cada producto que el cliente lleve.
4. Revisa que el **total** que aparece abajo coincida con lo que el cliente va a pagar.

### Paso 2 — Cobrar

1. Haz clic en el botón **Cobrar**.
2. Aparecerá una ventana. Escribe en el campo **Efectivo recibido** la cantidad de dinero que te entregó el cliente (por ejemplo: `200`).
3. El sistema calculará automáticamente el **cambio**.
4. Haz clic en **Confirmar venta**.

### Paso 3 — Entregar el cambio y el ticket

1. El sistema mostrará el resumen de la venta con el folio (número único, por ejemplo: `V-000034`).
2. Entrega el cambio al cliente.
3. Si necesitas imprimir el ticket, haz clic en **Imprimir**.

---

### Ventas con descuento

Si el cliente tiene un descuento autorizado:

1. Antes de hacer clic en **Cobrar**, ingresa el porcentaje de descuento en el campo **Descuento (%)**.
2. Si el descuento es mayor al límite permitido (20%), el sistema pedirá que un **administrador autorice el descuento**.
3. El administrador deberá escribir su usuario y contraseña en los campos que aparecen.
4. Una vez autorizado, continúa con el cobro normalmente.

---

## 5. Cómo hacer una devolución

Si un cliente regresa un producto de una compra reciente:

1. En el menú, haz clic en **Devoluciones**.
2. En el campo **Folio de venta**, escribe el número del ticket original (por ejemplo: `V-000034`).
3. Haz clic en **Buscar**.
4. El sistema mostrará los productos de esa venta.
5. Selecciona los productos que el cliente está devolviendo y escribe la cantidad a devolver.
6. En el campo **Motivo**, escribe brevemente la razón (por ejemplo: `Producto defectuoso`).
7. Haz clic en **Registrar devolución**.

> **Límite de tiempo:** Solo se pueden hacer devoluciones de ventas del día actual o del día anterior. Si la venta es más antigua, el sistema no la permitirá y deberás consultar al administrador.

---

## 6. Cómo hacer el corte de caja al final del turno

El corte de caja es el proceso de contar el dinero en efectivo y registrar el cierre del turno.

### Paso 1 — Contar el dinero

Antes de entrar al sistema, cuenta físicamente todo el efectivo que tienes en caja. Anota la cantidad total.

### Paso 2 — Registrar el corte en el sistema

1. En el menú, haz clic en **Caja**.
2. Haz clic en **Corte de caja**.
3. Verás un resumen del turno con:
   - **Fondo inicial:** el dinero con el que abriste la caja.
   - **Total de ventas:** la suma de todas las ventas del turno.
   - **Total de devoluciones:** el dinero regresado a clientes.
   - **Efectivo esperado:** lo que debería haber en caja según el sistema.
4. En el campo **Efectivo contado**, escribe la cantidad que contaste físicamente.
5. Si quieres dejar una nota (por ejemplo, si falta dinero y sabes el motivo), escríbela en el campo **Nota**.
6. Haz clic en **Cerrar turno**.

### Paso 3 — Revisar el resultado

El sistema mostrará uno de tres resultados:

| Resultado | Qué significa |
|---|---|
| **Cuadre exacto** | El dinero contado coincide exactamente con lo esperado. |
| **Sobrante** | Hay más dinero del esperado. El sistema muestra cuánto. |
| **Faltante** | Hay menos dinero del esperado. El sistema muestra cuánto. |

> Si hay diferencia (sobrante o faltante), no te alarmes. El sistema la registra automáticamente. Informa a tu supervisor para que quede anotado.

---

## 7. Preguntas frecuentes

**¿Qué hago si el sistema no me deja registrar una venta?**
Verifica que la caja esté abierta. Si ves un mensaje que dice "Debe abrir la caja antes de realizar ventas", ve al menú **Caja → Abrir Caja** y registra el fondo inicial.

---

**¿Qué hago si el sistema dice "Stock insuficiente"?**
El producto no tiene existencia suficiente para la cantidad que pediste. Verifica cuántas piezas hay físicamente en el estante. Si hay más en físico que en el sistema, avisa al administrador para que haga un ajuste de inventario.

---

**¿Puedo cancelar una venta a la mitad?**
Sí. Antes de hacer clic en **Confirmar venta**, puedes cerrar la ventana de cobro o quitar productos del carrito. Una vez que confirmas la venta, ya no se puede cancelar directamente — en ese caso se debe hacer una devolución.

---

**¿Qué es el folio?**
Es el número único que identifica cada venta (ejemplo: `V-000034`). Aparece en el ticket y sirve para consultar o devolver esa compra en el futuro. Guarda los tickets para poder hacer devoluciones.

---

**Cerré el navegador sin hacer el corte, ¿qué hago?**
No hay problema. La caja sigue "abierta" en el sistema. Abre el navegador de nuevo, inicia sesión y ve a **Caja → Corte de caja** para cerrar el turno normalmente.

---

**¿Por qué no puedo entrar a ciertas secciones?**
El sistema tiene dos tipos de usuarios: **cajeros** y **administradores**. Como cajero, solo verás las secciones que necesitas para trabajar. Las secciones de administración (usuarios, productos, historial de cortes) solo las ve el administrador. Si necesitas hacer algo que no puedes, pídele ayuda a tu supervisor.

---

*Manual generado para el proyecto escolar TPV Papelería — ITH, julio 2026.*
