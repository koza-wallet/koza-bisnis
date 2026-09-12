-- ==============================================================================
-- PATCH OWNER FINANCE DASHBOARD (KoZa Bisnis)
-- Tabel internal platform untuk tracking biaya LLM otomatis, biaya infra manual,
-- dan tarif harga LLM yang bisa disesuaikan. HANYA diakses lewat service_role
-- key dari route API yang sudah mengunci akses ke email pemilik platform.
-- Tidak ada RLS policy untuk anon/authenticated -- sengaja deny-all di level DB,
-- data ini lintas-tenant (semua toko) jadi tidak boleh bisa dibaca seller manapun.
-- ==============================================================================

-- 1. Log pemakaian LLM per panggilan (OpenAI/Gemini), untuk hitung biaya otomatis
CREATE TABLE IF NOT EXISTS public.llm_usage_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    provider TEXT NOT NULL CHECK (provider IN ('openai', 'gemini')),
    model TEXT NOT NULL,
    feature TEXT NOT NULL CHECK (feature IN ('jaga_ai_chat', 'ai_landing_page_generate')),
    prompt_tokens INTEGER NOT NULL DEFAULT 0,
    completion_tokens INTEGER NOT NULL DEFAULT 0,
    total_tokens INTEGER NOT NULL DEFAULT 0,
    estimated_cost_usd NUMERIC(12, 6) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_llm_usage_log_created_at ON public.llm_usage_log (created_at);
CREATE INDEX IF NOT EXISTS idx_llm_usage_log_provider ON public.llm_usage_log (provider);

ALTER TABLE public.llm_usage_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.llm_usage_log FROM anon, authenticated;
GRANT ALL ON public.llm_usage_log TO service_role;

-- 2. Tarif harga per-juta-token LLM, bisa diupdate manual kalau OpenAI/Gemini ubah harga.
-- Diseed dengan tarif publik terakhir yang diketahui (2026) -- VERIFIKASI ULANG SECARA
-- BERKALA ke halaman pricing resmi OpenAI/Google, sistem ini tidak bisa cek harga live.
CREATE TABLE IF NOT EXISTS public.llm_pricing_rates (
    provider TEXT PRIMARY KEY CHECK (provider IN ('openai', 'gemini')),
    model TEXT NOT NULL,
    input_price_per_million_usd NUMERIC(10, 4) NOT NULL,
    output_price_per_million_usd NUMERIC(10, 4) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

INSERT INTO public.llm_pricing_rates (provider, model, input_price_per_million_usd, output_price_per_million_usd)
VALUES
    ('openai', 'gpt-4o-mini', 0.15, 0.60),
    ('gemini', 'gemini-1.5-flash', 0.075, 0.30)
ON CONFLICT (provider) DO NOTHING;

ALTER TABLE public.llm_pricing_rates ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.llm_pricing_rates FROM anon, authenticated;
GRANT ALL ON public.llm_pricing_rates TO service_role;

-- 3. Biaya operasional infra platform, input manual bulanan oleh pemilik
-- (Vercel, Domain, Cloudflare, Supabase, dan lainnya tidak punya API biaya publik).
CREATE TABLE IF NOT EXISTS public.platform_operating_costs (
    month DATE PRIMARY KEY, -- konvensi: selalu tanggal 1 di bulan tersebut, mis. 2026-09-01
    vercel_cost_idr NUMERIC(14, 2) NOT NULL DEFAULT 0,
    domain_cost_idr NUMERIC(14, 2) NOT NULL DEFAULT 0,
    cloudflare_cost_idr NUMERIC(14, 2) NOT NULL DEFAULT 0,
    supabase_cost_idr NUMERIC(14, 2) NOT NULL DEFAULT 0,
    other_cost_idr NUMERIC(14, 2) NOT NULL DEFAULT 0,
    usd_idr_rate NUMERIC(10, 2) NOT NULL DEFAULT 15800,
    notes TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.platform_operating_costs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.platform_operating_costs FROM anon, authenticated;
GRANT ALL ON public.platform_operating_costs TO service_role;
