-- Código de ventas secuencial. Arranca en 600 (no en 1) a propósito: si
-- alguien inspecciona su propio código no puede inferir fácil cuántos
-- revendedores hay en total.
CREATE SEQUENCE IF NOT EXISTS revendedor_codigo_seq START WITH 600 INCREMENT BY 1;
