-- ==============================================================================
-- KOZA BISNIS — PATCH: WhatsApp Gateway Integration (Jaga AI CS Multi-Tenant)
-- Target: Project Ref beserhtzbfkwpvcheuag (kozabisnis.com)
-- ==============================================================================

-- 1. Tambahkan kolom whatsapp_bot_settings ke tabel stores
ALTER TABLE public.stores
ADD COLUMN IF NOT EXISTS whatsapp_bot_settings JSONB DEFAULT '{
    "provider": "fonnte",
    "status": "DISCONNECTED",
    "isActive": false
}'::jsonb;

-- 2. Buat index GIN untuk pencarian cepat berdasarkan deviceToken / provider
CREATE INDEX IF NOT EXISTS idx_stores_whatsapp_bot_settings
    ON public.stores USING gin (whatsapp_bot_settings);

-- Catatan Keamanan:
-- Kolom whatsapp_bot_settings SENGAJA TIDAK DIMASUKKAN ke dalam view public_stores
-- agar token perangkat WhatsApp seller tidak pernah terekspos ke publik/kompetitor.
