-- ==============================================================================
-- KOZA BISNIS — PATCH #14: Cegah domain squatting & minimalkan paparan `plan` publik
-- Project Ref: beserhtzbfkwpvcheuag (kozabisnis.com)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. CEGAH DUA TOKO MEMAKAI custom_domain YANG SAMA (domain squatting / DoS)
-- ------------------------------------------------------------------------------
-- Index unik case-insensitive: NULL tetap boleh berulang (toko yang belum pakai
-- custom domain), tapi begitu diisi, nilainya wajib unik di seluruh platform.
CREATE UNIQUE INDEX IF NOT EXISTS uq_stores_custom_domain_lower
    ON public.stores (lower(custom_domain))
    WHERE custom_domain IS NOT NULL;

-- ------------------------------------------------------------------------------
-- 2. GANTI KOLOM `plan` MENTAH DI public_stores DENGAN BOOLEAN is_white_label
-- ------------------------------------------------------------------------------
-- Sebelumnya patch_pricing_2.0.sql menambahkan kolom `plan` ke view publik supaya
-- storefront bisa tahu kapan watermark "Powered by KoZa" harus disembunyikan.
-- Publik/kompetitor tidak perlu tahu tier PERSIS toko lain (PRO_AI vs PRO_ANNUAL
-- vs BASIC, dst) — cukup tahu ya/tidak untuk keperluan watermark saja.
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
    custom_domain,
    (plan IN ('PRO_AI', 'PRO_MONTHLY', 'PRO_ANNUAL')) AS is_white_label,
    created_at
FROM public.stores;

GRANT SELECT ON public.public_stores TO anon, authenticated;
