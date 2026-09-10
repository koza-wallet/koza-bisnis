-- ==============================================================================
-- KoZa Bisnis — Patch Pengaturan Ekspedisi Mandiri Toko (Store Shipping Settings)
-- Mengizinkan setiap seller memilih kurir yang didukung secara global untuk tokonya
-- ==============================================================================

-- 1. Tambah kolom enabled_couriers ke tabel stores
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS enabled_couriers JSONB NOT NULL DEFAULT '["JNT", "JNE", "SICEPAT"]'::jsonb;

-- 2. Perbarui View Keamanan: public_stores
-- Mengekspos enabled_couriers agar storefront dan landing page bisa membaca kurir aktif
-- Kolom privat (owner_id, quota_balance, plan) TETAP RAHASIA & TERLINDUNGI
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

-- Berikan hak akses SELECT view public_stores kepada publik (anon dan authenticated)
GRANT SELECT ON public.public_stores TO anon, authenticated;
