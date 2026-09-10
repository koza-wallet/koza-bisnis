-- ==============================================================================
-- KoZa Bisnis — Patch Chat Sessions & Human Takeover Cost Guard
-- Target: Manajemen status obrolan, proteksi biaya LLM, dan ambil alih seller
-- ==============================================================================

BEGIN;

-- 1. Buat Tabel: chat_sessions
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    buyer_phone TEXT NOT NULL,
    bot_status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'PAUSED', 'ESCALATED_TO_HUMAN'
    paused_until TIMESTAMPTZ,
    turn_count INTEGER NOT NULL DEFAULT 0,
    last_buyer_message TEXT,
    last_bot_reply TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_chat_session_store_buyer UNIQUE (store_id, buyer_phone)
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_store_buyer ON public.chat_sessions(store_id, buyer_phone);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_bot_status ON public.chat_sessions(bot_status);

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- 3. Kebijakan RLS: Seller hanya berhak membaca & mengedit chat session tokonya sendiri
DROP POLICY IF EXISTS "Seller full access to own chat sessions" ON public.chat_sessions;

CREATE POLICY "Seller full access to own chat sessions"
    ON public.chat_sessions FOR ALL
    USING (
        store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
    );

-- 4. Berikan izin kepada service_role dan authenticated
GRANT ALL ON public.chat_sessions TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.chat_sessions TO authenticated;

COMMIT;
