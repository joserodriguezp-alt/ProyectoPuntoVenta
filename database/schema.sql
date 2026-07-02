-- ============================================================
-- TPV Papelería — Esquema PostgreSQL
-- Zona horaria: America/Hermosillo (UTC-7)
-- ============================================================

-- ============================================================
-- LIMPIEZA  (re-ejecutable en desarrollo)
-- ============================================================
DROP TABLE IF EXISTS movimientos_inventario CASCADE;
DROP TABLE IF EXISTS detalle_devolucion     CASCADE;
DROP TABLE IF EXISTS devoluciones           CASCADE;
DROP TABLE IF EXISTS detalle_venta          CASCADE;
DROP TABLE IF EXISTS ventas                 CASCADE;
DROP TABLE IF EXISTS corte_caja             CASCADE;
DROP TABLE IF EXISTS productos              CASCADE;
DROP TABLE IF EXISTS categorias             CASCADE;
DROP TABLE IF EXISTS usuarios               CASCADE;
DROP TABLE IF EXISTS datos_empresa          CASCADE;

DROP TYPE IF EXISTS rol_usuario      CASCADE;
DROP TYPE IF EXISTS estado_corte     CASCADE;
DROP TYPE IF EXISTS metodo_pago_tipo CASCADE;
DROP TYPE IF EXISTS estado_venta     CASCADE;
DROP TYPE IF EXISTS tipo_movimiento  CASCADE;

-- ============================================================
-- TIPOS ENUM
-- ============================================================
CREATE TYPE rol_usuario      AS ENUM ('administrador', 'cajero');
CREATE TYPE estado_corte     AS ENUM ('abierto', 'cerrado');
CREATE TYPE metodo_pago_tipo AS ENUM ('efectivo');
CREATE TYPE estado_venta     AS ENUM ('completada', 'cancelada', 'devuelta_parcial');
CREATE TYPE tipo_movimiento  AS ENUM ('venta', 'entrada', 'ajuste', 'devolucion');

-- ============================================================
-- FUNCIÓN disparadora para updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABLAS DE SOPORTE
-- ============================================================

-- ------------------------------------------------------------
-- Configuración de la empresa (singleton)
-- ------------------------------------------------------------
CREATE TABLE datos_empresa (
    id               SMALLINT        NOT NULL DEFAULT 1,
    nombre           VARCHAR(100)    NOT NULL,
    rfc              VARCHAR(15),
    direccion        VARCHAR(200),
    telefono         VARCHAR(20),
    leyenda_ticket   VARCHAR(200)    DEFAULT 'Gracias por su compra',

    PRIMARY KEY (id),
    CONSTRAINT chk_singleton CHECK (id = 1)
);

-- ------------------------------------------------------------
-- Usuarios del sistema
-- ------------------------------------------------------------
CREATE TABLE usuarios (
    id_usuario       SERIAL          PRIMARY KEY,
    nombre_completo  VARCHAR(80)     NOT NULL,
    username         VARCHAR(30)     NOT NULL UNIQUE,
    password_hash    VARCHAR(100)    NOT NULL,       -- bcrypt, cost >= 10
    rol              rol_usuario     NOT NULL DEFAULT 'cajero',
    activo           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Categorías de productos
-- ------------------------------------------------------------
CREATE TABLE categorias (
    id_categoria     SERIAL          PRIMARY KEY,
    nombre           VARCHAR(80)     NOT NULL UNIQUE,
    descripcion      VARCHAR(200),
    activo           BOOLEAN         NOT NULL DEFAULT TRUE
);

-- ============================================================
-- MÓDULO 1 — PRODUCTOS
-- ============================================================
CREATE TABLE productos (
    id_producto      SERIAL          PRIMARY KEY,
    codigo_barras    VARCHAR(30)     UNIQUE,
    codigo_interno   VARCHAR(20)     UNIQUE,
    nombre           VARCHAR(100)    NOT NULL,
    descripcion      TEXT,
    id_categoria     INTEGER         REFERENCES categorias (id_categoria)
                                       ON UPDATE CASCADE ON DELETE SET NULL,
    precio_venta     NUMERIC(10,2)   NOT NULL,
    precio_costo     NUMERIC(10,2)   NOT NULL DEFAULT 0.00,
    unidad_medida    VARCHAR(20)     NOT NULL DEFAULT 'pieza',
    stock_actual     INTEGER         NOT NULL DEFAULT 0,
    stock_minimo     INTEGER         NOT NULL DEFAULT 0,
    activo           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_precio_venta  CHECK (precio_venta  > 0),
    CONSTRAINT chk_precio_costo  CHECK (precio_costo  >= 0),
    CONSTRAINT chk_stock_minimo  CHECK (stock_minimo  >= 0)
);

CREATE INDEX idx_productos_categoria ON productos (id_categoria);
CREATE INDEX idx_productos_nombre    ON productos (nombre);
CREATE INDEX idx_productos_activo    ON productos (activo);

CREATE TRIGGER trg_productos_updated_at
    BEFORE UPDATE ON productos
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ============================================================
-- MÓDULO 4 — CORTE DE CAJA
-- (declarado antes de ventas porque ventas lo referencia)
-- ============================================================
CREATE TABLE corte_caja (
    id_corte             SERIAL          PRIMARY KEY,
    id_usuario           INTEGER         NOT NULL
                                           REFERENCES usuarios (id_usuario)
                                           ON UPDATE CASCADE ON DELETE RESTRICT,
    fecha_apertura       TIMESTAMP       NOT NULL DEFAULT NOW(),
    fecha_cierre         TIMESTAMP,
    fondo_inicial        NUMERIC(10,2)   NOT NULL DEFAULT 0.00,
    total_ventas         NUMERIC(10,2)   NOT NULL DEFAULT 0.00,
    total_devoluciones   NUMERIC(10,2)   NOT NULL DEFAULT 0.00,
    efectivo_esperado    NUMERIC(10,2)   NOT NULL DEFAULT 0.00,
    efectivo_contado     NUMERIC(10,2),
    diferencia           NUMERIC(10,2),
    estado               estado_corte    NOT NULL DEFAULT 'abierto',
    nota_diferencia      VARCHAR(200)
);

CREATE INDEX idx_corte_usuario  ON corte_caja (id_usuario);
CREATE INDEX idx_corte_estado   ON corte_caja (estado);
CREATE INDEX idx_corte_apertura ON corte_caja (fecha_apertura);

-- ============================================================
-- MÓDULO 2 — VENTAS
-- ============================================================
CREATE TABLE ventas (
    id_venta         SERIAL              PRIMARY KEY,
    folio            VARCHAR(15)         NOT NULL UNIQUE,
    id_corte         INTEGER             NOT NULL
                                           REFERENCES corte_caja (id_corte)
                                           ON UPDATE CASCADE ON DELETE RESTRICT,
    id_usuario       INTEGER             NOT NULL
                                           REFERENCES usuarios   (id_usuario)
                                           ON UPDATE CASCADE ON DELETE RESTRICT,
    subtotal         NUMERIC(10,2)       NOT NULL DEFAULT 0.00,
    descuento        NUMERIC(10,2)       NOT NULL DEFAULT 0.00,
    total            NUMERIC(10,2)       NOT NULL DEFAULT 0.00,
    monto_recibido   NUMERIC(10,2)       NOT NULL DEFAULT 0.00,
    cambio           NUMERIC(10,2)       NOT NULL DEFAULT 0.00,
    metodo_pago      metodo_pago_tipo    NOT NULL DEFAULT 'efectivo',
    estado           estado_venta        NOT NULL DEFAULT 'completada',
    fecha_venta      TIMESTAMP           NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_total_positivo   CHECK (total     >= 0),
    CONSTRAINT chk_descuento_valido CHECK (descuento >= 0 AND descuento <= subtotal),
    CONSTRAINT chk_cambio_valido    CHECK (cambio    >= 0)
);

CREATE INDEX idx_ventas_corte   ON ventas (id_corte);
CREATE INDEX idx_ventas_usuario ON ventas (id_usuario);
CREATE INDEX idx_ventas_fecha   ON ventas (fecha_venta);
CREATE INDEX idx_ventas_estado  ON ventas (estado);

-- ------------------------------------------------------------
-- Detalle de venta (renglones del ticket)
-- ------------------------------------------------------------
CREATE TABLE detalle_venta (
    id_detalle          SERIAL          PRIMARY KEY,
    id_venta            INTEGER         NOT NULL
                                          REFERENCES ventas    (id_venta)
                                          ON UPDATE CASCADE ON DELETE CASCADE,
    id_producto         INTEGER         NOT NULL
                                          REFERENCES productos (id_producto)
                                          ON UPDATE CASCADE ON DELETE RESTRICT,
    cantidad            INTEGER         NOT NULL,
    precio_unitario     NUMERIC(10,2)   NOT NULL,   -- precio congelado al momento de la venta
    descuento_renglon   NUMERIC(10,2)   NOT NULL DEFAULT 0.00,
    subtotal            NUMERIC(10,2)   NOT NULL,   -- (precio_unitario - descuento_renglon) * cantidad

    CONSTRAINT chk_cantidad_pos        CHECK (cantidad          > 0),
    CONSTRAINT chk_precio_unitario_pos CHECK (precio_unitario   > 0),
    CONSTRAINT chk_desc_renglon_valido CHECK (descuento_renglon >= 0)
);

CREATE INDEX idx_detalle_venta    ON detalle_venta (id_venta);
CREATE INDEX idx_detalle_producto ON detalle_venta (id_producto);

-- ============================================================
-- MÓDULO 2 — DEVOLUCIONES
-- ============================================================
CREATE TABLE devoluciones (
    id_devolucion    SERIAL          PRIMARY KEY,
    id_venta_origen  INTEGER         NOT NULL
                                       REFERENCES ventas     (id_venta)
                                       ON UPDATE CASCADE ON DELETE RESTRICT,
    id_usuario       INTEGER         NOT NULL
                                       REFERENCES usuarios   (id_usuario)
                                       ON UPDATE CASCADE ON DELETE RESTRICT,
    id_corte         INTEGER         NOT NULL
                                       REFERENCES corte_caja (id_corte)
                                       ON UPDATE CASCADE ON DELETE RESTRICT,
    total_devuelto   NUMERIC(10,2)   NOT NULL,
    fecha_devolucion TIMESTAMP       NOT NULL DEFAULT NOW(),
    nota             TEXT,

    CONSTRAINT chk_total_devuelto_pos CHECK (total_devuelto > 0)
);

CREATE INDEX idx_dev_venta_origen ON devoluciones (id_venta_origen);
CREATE INDEX idx_dev_usuario      ON devoluciones (id_usuario);
CREATE INDEX idx_dev_corte        ON devoluciones (id_corte);
CREATE INDEX idx_dev_fecha        ON devoluciones (fecha_devolucion);

-- ------------------------------------------------------------
-- Detalle de devolución
-- ------------------------------------------------------------
CREATE TABLE detalle_devolucion (
    id_detalle_dev    SERIAL          PRIMARY KEY,
    id_devolucion     INTEGER         NOT NULL
                                        REFERENCES devoluciones  (id_devolucion)
                                        ON UPDATE CASCADE ON DELETE CASCADE,
    id_detalle        INTEGER         NOT NULL
                                        REFERENCES detalle_venta (id_detalle)
                                        ON UPDATE CASCADE ON DELETE RESTRICT,
    id_producto       INTEGER         NOT NULL
                                        REFERENCES productos     (id_producto)
                                        ON UPDATE CASCADE ON DELETE RESTRICT,
    cantidad_devuelta INTEGER         NOT NULL,
    monto_devuelto    NUMERIC(10,2)   NOT NULL,

    CONSTRAINT chk_cant_devuelta_pos CHECK (cantidad_devuelta > 0)
);

CREATE INDEX idx_det_dev_devolucion ON detalle_devolucion (id_devolucion);
CREATE INDEX idx_det_dev_detalle    ON detalle_devolucion (id_detalle);
CREATE INDEX idx_det_dev_producto   ON detalle_devolucion (id_producto);

-- ============================================================
-- MÓDULO 3 — MOVIMIENTOS DE INVENTARIO (bitácora)
-- ============================================================
CREATE TABLE movimientos_inventario (
    id_movimiento    SERIAL          PRIMARY KEY,
    id_producto      INTEGER         NOT NULL
                                       REFERENCES productos (id_producto)
                                       ON UPDATE CASCADE ON DELETE RESTRICT,
    id_usuario       INTEGER         NOT NULL
                                       REFERENCES usuarios  (id_usuario)
                                       ON UPDATE CASCADE ON DELETE RESTRICT,
    tipo             tipo_movimiento NOT NULL,
    cantidad         INTEGER         NOT NULL,   -- positivo = entrada, negativo = salida
    stock_anterior   INTEGER         NOT NULL,
    stock_resultante INTEGER         NOT NULL,
    referencia_id    INTEGER,                    -- id de la venta, devolución o ajuste
    referencia_tipo  VARCHAR(20),                -- 'venta' | 'devolucion' | 'entrada' | 'ajuste'
    motivo           VARCHAR(100),               -- obligatorio cuando tipo = 'ajuste'
    fecha            TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mov_producto ON movimientos_inventario (id_producto);
CREATE INDEX idx_mov_usuario  ON movimientos_inventario (id_usuario);
CREATE INDEX idx_mov_tipo     ON movimientos_inventario (tipo);
CREATE INDEX idx_mov_fecha    ON movimientos_inventario (fecha);

-- ============================================================
-- DATOS INICIALES
-- ============================================================

INSERT INTO datos_empresa (id, nombre, rfc, direccion, telefono, leyenda_ticket)
VALUES (1, 'Papelería', 'XAXX010101000', 'Hermosillo, Sonora', '662-000-0000',
        'Gracias por su compra');

-- Contraseña: 'admin123' → bcrypt hash cost 10. Cambiar al primer login.
INSERT INTO usuarios (nombre_completo, username, password_hash, rol)
VALUES ('Administrador', 'admin',
        '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LpmwKriSoHm',
        'administrador');

INSERT INTO categorias (nombre) VALUES
    ('Escritura'),
    ('Cuadernos y Libretas'),
    ('Papel y Block'),
    ('Arte y Dibujo'),
    ('Organización y Archivo'),
    ('Tecnología Escolar'),
    ('Otros');
