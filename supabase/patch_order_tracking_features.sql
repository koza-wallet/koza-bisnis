-- ==============================================================================
-- KoZa Bisnis — Patch Fitur Pelacakan Resi & Tracking Paket Publik
-- Target: Mendukung pelacakan real-time & timeline kurir multi-ekspedisi
-- ==============================================================================

BEGIN;

-- 1. Tambah kolom tracking_history dan last_tracking_status pada tabel orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS tracking_history JSONB NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS last_tracking_status TEXT DEFAULT 'SIAP_DIKIRIM';

-- 2. Buat View Publik Aman untuk Pelacakan Pesanan: public_order_tracking
-- Hanya menampilkan informasi logistik untuk pembeli di halaman /lacak/[orderNumber]
-- Kolom privat (total_cost_price, net_profit) TETAP TERLINDUNGI & TIDAK DIEKSPOS
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
    o.items,
    o.shipping_cost,
    o.grand_total,
    o.created_at,
    o.updated_at
FROM public.orders o
JOIN public.stores s ON o.store_id = s.id;

-- Berikan izin akses SELECT pada view publik kepada anonim dan pengguna terautentikasi
GRANT SELECT ON public.public_order_tracking TO anon, authenticated;

COMMIT;
