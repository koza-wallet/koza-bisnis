-- ==============================================================================
-- KoZa Bisnis — Patch Fitur Grosir, Produsen & Distributor (B2B)
-- Menambahkan Minimum Order Quantity (MOQ) dan Tiered Wholesale Pricing
-- ==============================================================================

-- 1. Tambah kolom min_order_quantity dan wholesale_tiers ke tabel products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS min_order_quantity INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS wholesale_tiers JSONB NOT NULL DEFAULT '[]'::jsonb;

-- 2. Perbarui View Keamanan: public_products
-- Mengekspos min_order_quantity dan wholesale_tiers ke publik untuk kalkulasi harga di storefront/LP
-- Kolom cost_price (HPP / modal pabrik) TETAP DILINDUNGI & TIDAK DITAMPILKAN
DROP VIEW IF EXISTS public.public_products;

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

-- Berikan hak akses SELECT view public_products kepada publik (anon dan authenticated)
GRANT SELECT ON public.public_products TO anon, authenticated;
