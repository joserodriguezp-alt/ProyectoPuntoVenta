# Modelo de Datos — TPV Papelería

## Diagrama Entidad-Relación

```mermaid
erDiagram

    CATEGORIAS {
        INT id_categoria PK
        VARCHAR_80 nombre
        VARCHAR_200 descripcion
        TINYINT activo
    }

    USUARIOS {
        INT id_usuario PK
        VARCHAR_80 nombre_completo
        VARCHAR_30 username
        VARCHAR_100 password_hash
        ENUM_rol rol
        TINYINT activo
        DATETIME created_at
    }

    DATOS_EMPRESA {
        INT id PK
        VARCHAR_100 nombre
        VARCHAR_15 rfc
        VARCHAR_200 direccion
        VARCHAR_20 telefono
        VARCHAR_200 leyenda_ticket
    }

    PRODUCTOS {
        INT id_producto PK
        VARCHAR_30 codigo_barras
        VARCHAR_20 codigo_interno
        VARCHAR_100 nombre
        TEXT descripcion
        INT id_categoria FK
        DECIMAL_10_2 precio_venta
        DECIMAL_10_2 precio_costo
        VARCHAR_20 unidad_medida
        INT stock_actual
        INT stock_minimo
        TINYINT activo
        DATETIME created_at
        DATETIME updated_at
    }

    CORTE_CAJA {
        INT id_corte PK
        INT id_usuario FK
        DATETIME fecha_apertura
        DATETIME fecha_cierre
        DECIMAL_10_2 fondo_inicial
        DECIMAL_10_2 total_ventas
        DECIMAL_10_2 total_devoluciones
        DECIMAL_10_2 efectivo_esperado
        DECIMAL_10_2 efectivo_contado
        DECIMAL_10_2 diferencia
        ENUM_estado estado
        VARCHAR_200 nota_diferencia
    }

    VENTAS {
        INT id_venta PK
        VARCHAR_15 folio
        INT id_corte FK
        INT id_usuario FK
        DECIMAL_10_2 subtotal
        DECIMAL_10_2 descuento
        DECIMAL_10_2 total
        DECIMAL_10_2 monto_recibido
        DECIMAL_10_2 cambio
        ENUM_metodo_pago metodo_pago
        ENUM_estado estado
        DATETIME fecha_venta
    }

    DETALLE_VENTA {
        INT id_detalle PK
        INT id_venta FK
        INT id_producto FK
        INT cantidad
        DECIMAL_10_2 precio_unitario
        DECIMAL_10_2 descuento_renglon
        DECIMAL_10_2 subtotal
    }

    DEVOLUCIONES {
        INT id_devolucion PK
        INT id_venta_origen FK
        INT id_usuario FK
        INT id_corte FK
        DECIMAL_10_2 total_devuelto
        DATETIME fecha_devolucion
        TEXT nota
    }

    DETALLE_DEVOLUCION {
        INT id_detalle_dev PK
        INT id_devolucion FK
        INT id_detalle FK
        INT id_producto FK
        INT cantidad_devuelta
        DECIMAL_10_2 monto_devuelto
    }

    MOVIMIENTOS_INVENTARIO {
        INT id_movimiento PK
        INT id_producto FK
        INT id_usuario FK
        ENUM_tipo tipo
        INT cantidad
        INT stock_anterior
        INT stock_resultante
        INT referencia_id
        VARCHAR_20 referencia_tipo
        VARCHAR_100 motivo
        DATETIME fecha
    }

    %% ── Relaciones ───────────────────────────────────────────────────

    CATEGORIAS           ||--o{ PRODUCTOS             : "clasifica"
    USUARIOS             ||--o{ CORTE_CAJA            : "opera"
    USUARIOS             ||--o{ VENTAS                : "realiza"
    USUARIOS             ||--o{ DEVOLUCIONES          : "procesa"
    USUARIOS             ||--o{ MOVIMIENTOS_INVENTARIO: "genera"

    CORTE_CAJA           ||--o{ VENTAS                : "agrupa"
    CORTE_CAJA           ||--o{ DEVOLUCIONES          : "registra"

    VENTAS               ||--|{ DETALLE_VENTA         : "contiene"
    VENTAS               ||--o{ DEVOLUCIONES          : "origina"

    DETALLE_VENTA        ||--o{ DETALLE_DEVOLUCION    : "referencia"

    DEVOLUCIONES         ||--|{ DETALLE_DEVOLUCION    : "detalla"

    PRODUCTOS            ||--o{ DETALLE_VENTA         : "aparece en"
    PRODUCTOS            ||--o{ DETALLE_DEVOLUCION    : "devuelto en"
    PRODUCTOS            ||--o{ MOVIMIENTOS_INVENTARIO: "rastreado en"
```

---

## Notas del Modelo

### Decisiones de diseño

| Decisión | Justificación |
|---|---|
| `precio_unitario` en `detalle_venta` | Congela el precio al momento de la venta; cambios futuros no alteran tickets pasados (RN-04 del spec) |
| `estado` en `corte_caja` como ENUM | Solo dos valores posibles (`abierto`, `cerrado`); garantiza integridad a nivel de BD |
| `movimientos_inventario.referencia_id` + `referencia_tipo` | Patrón de referencia polimórfica: un movimiento puede originarse de una venta, devolución o ajuste manual |
| `detalle_devolucion.id_detalle FK` | Vincula la devolución al renglón exacto de la venta original para calcular correctamente el monto a reintegrar |
| `corte_caja` en `devoluciones` | Permite saber en qué turno se procesó la devolución, independientemente del turno de la venta original |
| Tabla `datos_empresa` con `CHECK (id = 1)` | Singleton de configuración; asegura un único registro sin lógica en aplicación |

### ENUMs definidos en el SQL

| Campo | Valores |
|---|---|
| `usuarios.rol` | `'administrador'`, `'cajero'` |
| `corte_caja.estado` | `'abierto'`, `'cerrado'` |
| `ventas.metodo_pago` | `'efectivo'` *(v1.0; tarjeta fuera de alcance)* |
| `ventas.estado` | `'completada'`, `'cancelada'`, `'devuelta_parcial'` |
| `movimientos_inventario.tipo` | `'venta'`, `'entrada'`, `'ajuste'`, `'devolucion'` |
