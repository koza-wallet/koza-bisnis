-- ==============================================================================
-- PATCH KUOTA PESAN WHATSAPP JAGA AI (Fonnte Lite 1.000 pesan/bulan) + ADDON
-- Mengganti limit kasar 150 chat/hari (in-memory) dengan kuota bulanan riil
-- sesuai batas paket Fonnte Lite yang dipakai tiap device toko Pro, plus
-- addon berbayar 1.000 pesan/Rp49rb yang bisa dibeli seller kalau kuota
-- dasar habis. Addon TIDAK roll-over -- hangus bareng kuota dasar tiap
-- pergantian bulan (period_key berubah -> baris baru -> addon_purchased 0 lagi).
-- ==============================================================================

-- 1. Tabel pemakaian pesan WhatsApp per toko per bulan
CREATE TABLE IF NOT EXISTS public.whatsapp_message_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    period_key TEXT NOT NULL, -- Format 'YYYY-MM'
    messages_sent INTEGER NOT NULL DEFAULT 0, -- Gabungan semua pesan keluar via Fonnte: balasan Jaga AI + notifikasi order + notifikasi resi
    addon_purchased INTEGER NOT NULL DEFAULT 0, -- Total pesan addon yang dibeli periode ini
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (store_id, period_key)
);

ALTER TABLE public.whatsapp_message_usage ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.whatsapp_message_usage FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.whatsapp_message_usage TO service_role;

-- 2. Perbarui fungsi settlement idempoten supaya mendukung package_type baru 'WA_ADDON'
CREATE OR REPLACE FUNCTION public.handle_midtrans_settlement(
    p_order_id TEXT,
    p_payment_type TEXT DEFAULT 'midtrans'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tx RECORD;
    v_bonus_quota INTEGER := 0;
    v_bonus_ai INTEGER := 0;
    v_new_expiry TIMESTAMPTZ;
    v_assigned_plan TEXT;
    v_period_key TEXT;
BEGIN
    SELECT * INTO v_tx FROM public.topup_transactions WHERE order_id = p_order_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Transaction order_id not found');
    END IF;

    IF v_tx.status = 'SETTLED' THEN
        RETURN jsonb_build_object('success', true, 'message', 'Transaction already settled previously (idempotent)');
    END IF;

    UPDATE public.topup_transactions
    SET
        status = 'SETTLED',
        payment_type = COALESCE(p_payment_type, v_tx.payment_type),
        updated_at = timezone('utc'::text, now())
    WHERE id = v_tx.id;

    IF v_tx.package_type = 'MEMBERSHIP' THEN
        IF v_tx.plan_tier = 'PRO_ANNUAL' THEN
            v_assigned_plan := 'PRO_ANNUAL';
            v_bonus_quota := 500;
            v_bonus_ai := 36;
            v_new_expiry := timezone('utc'::text, now()) + INTERVAL '365 days';
        ELSIF v_tx.plan_tier = 'PRO_AI' OR v_tx.plan_tier = 'PRO_MONTHLY' THEN
            v_assigned_plan := 'PRO_AI';
            v_bonus_quota := 250;
            v_bonus_ai := 3;
            v_new_expiry := timezone('utc'::text, now()) + INTERVAL '30 days';
        ELSIF v_tx.plan_tier = 'BASIC' THEN
            v_assigned_plan := 'BASIC';
            v_bonus_quota := 100;
            v_bonus_ai := 0;
            v_new_expiry := timezone('utc'::text, now()) + INTERVAL '30 days';
        ELSE
            v_assigned_plan := 'PRO_AI';
            v_bonus_quota := 100;
            v_bonus_ai := 3;
            v_new_expiry := timezone('utc'::text, now()) + INTERVAL '30 days';
        END IF;

        UPDATE public.stores
        SET
            plan = v_assigned_plan,
            plan_expiry_date = v_new_expiry,
            quota_balance = quota_balance + v_bonus_quota,
            ai_credits_balance = COALESCE(ai_credits_balance, 0) + v_bonus_ai,
            updated_at = timezone('utc'::text, now())
        WHERE id = v_tx.store_id;

    ELSIF v_tx.package_type = 'AI_TOKEN' THEN
        UPDATE public.stores
        SET
            ai_credits_balance = COALESCE(ai_credits_balance, 0) + v_tx.quota_amount,
            updated_at = timezone('utc'::text, now())
        WHERE id = v_tx.store_id;

    ELSIF v_tx.package_type = 'WA_ADDON' THEN
        v_period_key := to_char(timezone('utc'::text, now()), 'YYYY-MM');

        INSERT INTO public.whatsapp_message_usage (store_id, period_key, addon_purchased)
        VALUES (v_tx.store_id, v_period_key, v_tx.quota_amount)
        ON CONFLICT (store_id, period_key)
        DO UPDATE SET
            addon_purchased = public.whatsapp_message_usage.addon_purchased + EXCLUDED.addon_purchased,
            updated_at = timezone('utc'::text, now());

    ELSE
        -- Top-up Kuota Order biasa
        UPDATE public.stores
        SET
            quota_balance = quota_balance + v_tx.quota_amount,
            updated_at = timezone('utc'::text, now())
        WHERE id = v_tx.store_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Payment settled successfully',
        'plan', v_assigned_plan,
        'bonus_quota', v_bonus_quota,
        'bonus_ai', v_bonus_ai
    );
END;
$$;

REVOKE ALL ON FUNCTION public.handle_midtrans_settlement(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_midtrans_settlement(TEXT, TEXT) TO service_role;
