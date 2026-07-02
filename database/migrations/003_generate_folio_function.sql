-- Funcion para generar folios de venta usando la secuencia folio_venta_seq
CREATE OR REPLACE FUNCTION generate_folio_venta()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 'V-' || LPAD(nextval('folio_venta_seq')::text, 6, '0')
$$;
