-- ==============================================================================
-- KOZA BISNIS — MIGRATION RUN: B2B GROSIR & PENGATURAN EKSPEDISI TOKO
-- Project Ref: beserhtzbfkwpvcheuag (kozabisnis.com)
-- Jalankan skrip ini sekali di: https://supabase.com/dashboard/project/beserhtzbfkwpvcheuag/sql/new
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. FITUR B2B GROSIR (MOQ & TIERED WHOLESALE PRICING)
-- ------------------------------------------------------------------------------

-- Tambah kolom min_order_quantity dan wholesale_tiers ke tabel products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS min_order_quantity INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS wholesale_tiers JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Perbarui View aman: public_products (mengekspos aturan grosir ke publik tanpa membocorkan HPP/cost_price)
DROP VIEW IF EXISTS public.public_products CASCADE;

CREATE OR REPLACE VIEW public.public_products 
WITH (security_invoker = false) AS
SELECT 
    id,
    store_id,
    name,
    slug,
    description,
    selling_price,
    weight_grams,
    stock,
    image_url,
    category,
    is_active,
    min_order_quantity,
    wholesale_tiers,
    created_at
FROM public.products
WHERE is_active = true;

GRANT SELECT ON public.public_products TO anon, authenticated;


-- ------------------------------------------------------------------------------
-- 2. PENGATURAN EKSPEDISI MANDIRI TOKO (STORE SHIPPING COURIERS)
-- ------------------------------------------------------------------------------

-- Tambah kolom enabled_couriers ke tabel stores
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS enabled_couriers JSONB NOT NULL DEFAULT '["JNT", "JNE", "SICEPAT"]'::jsonb;

-- Perbarui View aman: public_stores (mengekspos enabled_couriers tanpa membocorkan saldo kuota & plan toko)
DROP VIEW IF EXISTS public.public_stores CASCADE;

CREATE OR REPLACE VIEW public.public_stores 
WITH (security_invoker = false) AS
SELECT 
    id,
    slug,
    name,
    description,
    logo_url,
    whatsapp_number,
    origin_city,
    origin_district,
    bank_name,
    bank_account_number,
    bank_account_name,
    qris_image_url,
    enabled_couriers,
    created_at
FROM public.stores;

GRANT SELECT ON public.public_stores TO anon, authenticated;

COMMIT;
