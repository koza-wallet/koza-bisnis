-- ==============================================================================
-- KoZa Bisnis — Patch Tracking Resi Phase 2: Live ETA & Customer Reviews
-- Target: Mendukung perkiraan tanggal tiba (ETA) dan ulasan rating bintang pembeli
-- ==============================================================================

BEGIN;

-- 1. Tambahkan kolom ETA dan Ulasan Pembeli pada tabel orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS estimated_delivery_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS customer_rating INTEGER CHECK (customer_rating BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS customer_review TEXT,
ADD COLUMN IF NOT EXISTS customer_review_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS review_submitted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_orders_customer_rating ON public.orders(customer_rating);

-- 2. Perbarui View Publik Aman public_order_tracking
DROP VIEW IF EXISTS public.public_order_tracking CASCADE;

CREATE OR REPLACE VIEW public.public_order_tracking 
WITH (security_invoker = false) AS
SELECT 
    o.id,
    o.order_number,
    o.store_id,
    s.name AS store_name,
    s.logo_url AS store_logo_url,
    s.whatsapp_number AS store_whatsapp_number,
    s.slug AS store_slug,
    o.customer_name,
    o.customer_phone,
    o.destination_city,
    o.destination_district,
    o.courier_name,
    o.courier_service,
    o.tracking_number,
    o.status,
    o.last_tracking_status,
    o.tracking_history,
    o.estimated_delivery_date,
    o.customer_rating,
    o.customer_review,
    o.customer_review_tags,
    o.review_submitted_at,
    o.items,
    o.shipping_cost,
    o.grand_total,
    o.created_at,
    o.updated_at
FROM public.orders o
JOIN public.stores s ON o.store_id = s.id;

-- 3. Berikan izin SELECT pada view publik kepada anonim dan terautentikasi
GRANT SELECT ON public.public_order_tracking TO anon, authenticated;

COMMIT;
