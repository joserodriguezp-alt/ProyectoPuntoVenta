-- ============================================================
-- Migracion: historial de cambios de precio de venta
-- Requerido por HU-02: "el historial de precios registra el
-- cambio con fecha y usuario". No existia en database/schema.sql.
-- ============================================================

CREATE TABLE IF NOT EXISTS historial_precios (
    id_historial     SERIAL          PRIMARY KEY,
    id_producto      INTEGER         NOT NULL
                                       REFERENCES productos (id_producto)
                                       ON UPDATE CASCADE ON DELETE CASCADE,
    id_usuario       INTEGER         NOT NULL
                                       REFERENCES usuarios (id_usuario)
                                       ON UPDATE CASCADE ON DELETE RESTRICT,
    precio_anterior  NUMERIC(10,2)   NOT NULL,
    precio_nuevo     NUMERIC(10,2)   NOT NULL,
    fecha            TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_historial_precios_producto ON historial_precios (id_producto);
