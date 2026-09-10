-- ==============================================================================
-- PATCH PRICING & MONETISASI 2.0 (KoZa Bisnis)
-- Menambahkan kolom AI Credits, Custom Domain, dan Penyelarasan Settlement Paket
-- ==============================================================================

-- 1. Tambahkan kolom ai_credits_balance dan custom_domain ke tabel stores
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS ai_credits_balance INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS custom_domain TEXT;

-- 2. Perbarui fungsi idempoten handle_midtrans_settlement untuk mendukung paket 2.0
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

-- 3. Jamin hak akses aman (hanya service_role yang berhak memanggil fungsi settlement)
REVOKE ALL ON FUNCTION public.handle_midtrans_settlement(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_midtrans_settlement(TEXT, TEXT) TO service_role;

-- 4. Perbarui View public_stores agar storefront pembeli dapat mendeteksi status branding/watermark
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
    plan,
    custom_domain,
    created_at
FROM public.stores;

GRANT SELECT ON public.public_stores TO anon, authenticated;

