-- ==============================================================================
-- KOZA BISNIS — PATCH #8: PROCESS ORDER WITH QUOTA (2026-09-11)
-- 
-- Memindahkan gerbang konsumsi kuota ke saat seller memproses pesanan di dashboard.
-- Jika kuota toko habis, pesanan masuk ke status 'TERKUNCI_KUOTA' dan seller
-- didorong untuk melakukan top-up kuota untuk memprosesnya.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.process_order_with_quota(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_store_id UUID;
    v_owner_id UUID;
    v_quota INTEGER;
    v_order_status TEXT;
BEGIN
    -- 1. Ambil data order
    SELECT store_id, status INTO v_store_id, v_order_status 
    FROM public.orders 
    WHERE id = p_order_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pesanan tidak ditemukan');
    END IF;

    -- 2. Verifikasi kepemilikan toko secara ketat (karena SECURITY DEFINER)
    SELECT owner_id, quota_balance INTO v_owner_id, v_quota
    FROM public.stores 
    WHERE id = v_store_id 
    FOR UPDATE;

    IF v_owner_id IS DISTINCT FROM auth.uid() THEN
        RETURN jsonb_build_object('success', false, 'message', 'Akses ditolak: Anda bukan pemilik toko pesanan ini');
    END IF;

    -- 3. Cek ketersediaan kuota
    IF v_quota <= 0 THEN
        UPDATE public.orders 
        SET status = 'TERKUNCI_KUOTA', updated_at = timezone('utc'::text, now())
        WHERE id = p_order_id;

        RETURN jsonb_build_object(
            'success', false, 
            'locked', true,
            'message', 'Kuota order toko habis. Silakan top-up kuota untuk memproses pesanan ini.'
        );
    END IF;

    -- 4. Kurangi kuota 1 dan ubah status pesanan menjadi DIPROSES
    UPDATE public.stores 
    SET quota_balance = quota_balance - 1, updated_at = timezone('utc'::text, now())
    WHERE id = v_store_id;

    UPDATE public.orders 
    SET status = 'DIPROSES', updated_at = timezone('utc'::text, now())
    WHERE id = p_order_id;

    RETURN jsonb_build_object('success', true, 'remaining_quota', v_quota - 1);
END;
$$;

-- Cabut akses dari public dan anon
REVOKE ALL ON FUNCTION public.process_order_with_quota(UUID) FROM PUBLIC, anon;

-- Izinkan authenticated seller memanggil fungsi ini (aman karena ada validasi v_owner_id = auth.uid())
GRANT EXECUTE ON FUNCTION public.process_order_with_quota(UUID) TO authenticated;
