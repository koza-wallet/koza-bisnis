-- ==============================================================================
-- KOZA BISNIS — PATCH #10, #11, & #12: RLS HARDENING (2026-09-11)
-- Target Project Supabase: beserhtzbfkwpvcheuag
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PATCH #11 (CRITICAL): Tutup INSERT Bebas pada Tabel 'orders'
-- ------------------------------------------------------------------------------
-- Menghapus policy INSERT terbuka pada tabel 'orders' agar attacker tidak bisa
-- menyuntikkan pesanan palsu langsung ke REST API Supabase yang membypass gerbang kuota
-- toko (Patch #7 & #8) serta validasi harga server-side.
-- Seluruh order sekarang WAJIB dibuat melalui server API '/api/orders/create'
-- yang menggunakan SUPABASE_SERVICE_ROLE_KEY (service_role otomatis bypass RLS).
DROP POLICY IF EXISTS "Public can place orders" ON public.orders;


-- ------------------------------------------------------------------------------
-- 2. PATCH #10 (CRITICAL): Proteksi Kolom Sensitif Tabel 'stores' & VIEW Publik
-- ------------------------------------------------------------------------------
-- Mencabut policy USING (true) yang membocorkan kolom internal toko (owner_id,
-- quota_balance, plan, plan_expiry_date, dan data rekening bank tanpa filter).
DROP POLICY IF EXISTS "Public can view store by slug" ON public.stores;

-- Membuat VIEW 'public_stores' khusus untuk konsumsi publik (storefront / toko / LP)
-- Menghindari paparan quota_balance, plan, plan_expiry_date, dan owner_id.
-- security_invoker = false memastikan view dievaluasi dengan izin definer sehingga
-- publik (anon) tetap bisa membaca detail toko untuk keperluan storefront.
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
    qris_image_url,
    bank_name, 
    bank_account_number, 
    bank_account_name,
    created_at
FROM public.stores;

REVOKE ALL ON public.public_stores FROM PUBLIC;
GRANT SELECT ON public.public_stores TO anon, authenticated, service_role;


-- ------------------------------------------------------------------------------
-- 3. PATCH #12 (HIGH): Tutup Akses Tabel Mentah 'products' & VIEW Aman Publik
-- ------------------------------------------------------------------------------
-- Mencabut policy SELECT langsung pada tabel mentah 'products' agar kolom
-- cost_price (HPP) tidak dapat di-scrape oleh publik/kompetitor.
DROP POLICY IF EXISTS "Public can view active products" ON public.products;

-- Memperbarui VIEW 'public_products' dengan security_invoker = false agar publik
-- anonim tetap dapat membaca katalog produk aktif tanpa bisa membaca cost_price.
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
    created_at
FROM public.products
WHERE is_active = true;

REVOKE ALL ON public.public_products FROM PUBLIC;
GRANT SELECT ON public.public_products TO anon, authenticated, service_role;
