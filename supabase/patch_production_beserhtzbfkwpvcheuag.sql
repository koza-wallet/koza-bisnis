-- ==============================================================================
-- KOZA BISNIS — SECURITY HARDENING PATCH UNTUK PROJECT PRODUKSI NYATA
-- Project Ref: beserhtzbfkwpvcheuag (kozabisnis.com)
-- ==============================================================================

-- 1. CABUT IZIN EKSEKUSI RPC MIDTRANS DARI PUBLIK (ANON & AUTHENTICATED)
-- Mencegah bypass verifikasi pembayaran Midtrans via console/curl
REVOKE ALL ON FUNCTION public.handle_midtrans_settlement(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_midtrans_failure(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.revert_topup_transaction(TEXT) FROM PUBLIC, anon, authenticated;

-- Pastikan HANYA service_role yang berhak memanggil fungsi settlement
GRANT EXECUTE ON FUNCTION public.handle_midtrans_settlement(TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_midtrans_failure(TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.revert_topup_transaction(TEXT) TO service_role;


-- 2. TRIGGER BEFORE UPDATE: PROTEKSI KUOTA & PLAN TOKO DARI TAMPERING
CREATE OR REPLACE FUNCTION public.prevent_privileged_store_fields_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Izinkan perubahan bebas jika request berasal dari service_role / internal database
    IF auth.role() = 'service_role'
       OR current_user IN ('postgres', 'service_role', 'supabase_admin')
       OR coalesce(current_setting('request.jwt.claim.role', true), '') = 'service_role' THEN
        RETURN NEW;
    END IF;

    -- Jika dipanggil oleh user terautentikasi (seller) atau anon, tolak modifikasi kolom kritis
    IF (OLD.quota_balance IS DISTINCT FROM NEW.quota_balance) THEN
        RAISE EXCEPTION 'Akses Ditolak: quota_balance hanya dapat dimutasi melalui sistem pembayaran resmi.'
            USING ERRCODE = '42501';
    END IF;

    IF (OLD.plan IS DISTINCT FROM NEW.plan) THEN
        RAISE EXCEPTION 'Akses Ditolak: plan hanya dapat diubah melalui sistem pembayaran membership resmi.'
            USING ERRCODE = '42501';
    END IF;

    IF (OLD.plan_expiry_date IS DISTINCT FROM NEW.plan_expiry_date) THEN
        RAISE EXCEPTION 'Akses Ditolak: plan_expiry_date hanya dapat diperpanjang melalui sistem pembayaran resmi.'
            USING ERRCODE = '42501';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_privileged_store_fields ON public.stores;
CREATE TRIGGER trg_prevent_privileged_store_fields
    BEFORE UPDATE ON public.stores
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_privileged_store_fields_update();


-- 3. FUNGSI ATOMIK KONSUMSI KUOTA ORDER TOKO (PATCH #7)
CREATE OR REPLACE FUNCTION public.consume_order_quota(p_store_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_remaining INTEGER;
    v_plan TEXT;
BEGIN
    SELECT plan, quota_balance INTO v_plan, v_remaining
    FROM public.stores
    WHERE id = p_store_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Store not found');
    END IF;

    IF v_remaining > 0 THEN
        UPDATE public.stores
        SET 
            quota_balance = quota_balance - 1,
            updated_at = timezone('utc'::text, now())
        WHERE id = p_store_id
        RETURNING quota_balance INTO v_remaining;

        RETURN jsonb_build_object('success', true, 'remaining', v_remaining, 'plan', v_plan);
    ELSE
        RETURN jsonb_build_object('success', false, 'message', 'Kuota order toko telah habis', 'remaining', 0, 'plan', v_plan);
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_order_quota(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_order_quota(UUID) TO service_role;
