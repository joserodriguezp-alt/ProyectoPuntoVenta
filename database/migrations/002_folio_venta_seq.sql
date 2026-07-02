-- ============================================================
-- Migracion: secuencia para folios de venta
-- Garantiza folios unicos e incrementales aun con escrituras
-- concurrentes (hasta 3 terminales simultaneas, spec 5.1).
-- ============================================================

CREATE SEQUENCE IF NOT EXISTS folio_venta_seq START 1;
