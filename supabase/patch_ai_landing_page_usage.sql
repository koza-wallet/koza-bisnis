-- ==============================================================================
-- PATCH: Persistensi Kuota AI Landing Page Generator (KoZa Bisnis)
-- Sebelumnya kuota bulanan/tahunan disimpan di in-memory Map (ai-landing-page-limiter.ts)
-- yang reset ke 0 setiap kali instance serverless Vercel di-recycle -- seller Pro AI
-- bisa generate lebih dari kuota seharusnya (325k/2.99jt per tahun) tanpa terdeteksi.
-- Tabel ini menggantikan Map itu dengan storage persisten per toko per periode.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.ai_landing_page_usage (
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    period_key TEXT NOT NULL, -- "2026-09" untuk kuota bulanan, "2026" untuk kuota tahunan
    used_count INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (store_id, period_key)
);

ALTER TABLE public.ai_landing_page_usage ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ai_landing_page_usage FROM anon, authenticated;
GRANT ALL ON public.ai_landing_page_usage TO service_role;
