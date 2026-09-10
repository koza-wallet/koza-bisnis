-- ====================================================================
-- MIGRASI TABEL TOPUP TRANSACTIONS & FUNGSI OTOMATISASI MIDTRANS
-- ====================================================================

-- 1. Tabel Riwayat Transaksi Top-Up & Membership
CREATE TABLE IF NOT EXISTS public.topup_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    order_id TEXT NOT NULL UNIQUE,
    amount NUMERIC(12, 2) NOT NULL,
    package_code TEXT NOT NULL,
    package_name TEXT NOT NULL,
    package_type TEXT NOT NULL DEFAULT 'QUOTA', -- 'QUOTA', 'MEMBERSHIP'
    quota_amount INTEGER NOT NULL DEFAULT 0,
    plan_tier TEXT, -- 'PRO_MONTHLY', 'PRO_ANNUAL'
    payment_type TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'SETTLED', 'EXPIRED', 'FAILED'
    snap_token TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_topup_transactions_store_id ON public.topup_transactions(store_id);
CREATE INDEX IF NOT EXISTS idx_topup_transactions_order_id ON public.topup_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_topup_transactions_status ON public.topup_transactions(status);

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE public.topup_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Penjual hanya bisa membaca riwayat transaksi tokonya sendiri
DROP POLICY IF EXISTS "Sellers can view own topup transactions" ON public.topup_transactions;
CREATE POLICY "Sellers can view own topup transactions"
    ON public.topup_transactions
    FOR SELECT
    USING (
        store_id IN (
            SELECT id FROM public.stores WHERE owner_id = auth.uid()
        )
    );

-- Policy: Penjual bisa membuat record transaksi baru untuk tokonya sendiri
DROP POLICY IF EXISTS "Sellers can insert own topup transactions" ON public.topup_transactions;
CREATE POLICY "Sellers can insert own topup transactions"
    ON public.topup_transactions
    FOR INSERT
    WITH CHECK (
        store_id IN (
            SELECT id FROM public.stores WHERE owner_id = auth.uid()
        )
    );

-- 3. Fungsi Atomik & Idempoten untuk Memproses Pembayaran Sukses dari Webhook
-- Fungsi ini berjalan dengan SECURITY DEFINER agar bisa dipanggil aman via Supabase RPC setelah verifikasi SHA512 signature
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
    v_new_expiry TIMESTAMPTZ;
BEGIN
    -- 1. Ambil data transaksi berdasarkan order_id
    SELECT * INTO v_tx 
    FROM public.topup_transactions 
    WHERE order_id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Transaction order_id not found');
    END IF;

    -- 2. Cek Idempotensi: Jika sudah SETTLED, jangan tambah kuota dua kali!
    IF v_tx.status = 'SETTLED' THEN
        RETURN jsonb_build_object('success', true, 'message', 'Transaction already settled previously (idempotent)');
    END IF;

    -- 3. Update status transaksi menjadi SETTLED
    UPDATE public.topup_transactions
    SET 
        status = 'SETTLED',
        payment_type = COALESCE(p_payment_type, v_tx.payment_type),
        updated_at = timezone('utc'::text, now())
    WHERE id = v_tx.id;

    -- 4. Eksekusi penambahan hak akses ke tabel stores
    IF v_tx.package_type = 'MEMBERSHIP' THEN
        -- Paket Pro Member
        IF v_tx.plan_tier = 'PRO_ANNUAL' THEN
            v_bonus_quota := 500;
            v_new_expiry := timezone('utc'::text, now()) + INTERVAL '365 days';
        ELSE
            -- Default PRO_MONTHLY
            v_bonus_quota := 100;
            v_new_expiry := timezone('utc'::text, now()) + INTERVAL '30 days';
        END IF;

        UPDATE public.stores
        SET 
            plan = COALESCE(v_tx.plan_tier, 'PRO_MONTHLY'),
            plan_expiry_date = v_new_expiry,
            quota_balance = quota_balance + v_bonus_quota,
            updated_at = timezone('utc'::text, now())
        WHERE id = v_tx.store_id;

    ELSE
        -- Paket Kuota Order Biasa
        UPDATE public.stores
        SET 
            quota_balance = quota_balance + v_tx.quota_amount,
            updated_at = timezone('utc'::text, now())
        WHERE id = v_tx.store_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true, 
        'message', 'Payment settled and store quota/membership updated successfully',
        'store_id', v_tx.store_id,
        'package_code', v_tx.package_code
    );
END;
$$;

-- Berikan izin eksekusi ke anon, authenticated, dan service_role
GRANT EXECUTE ON FUNCTION public.handle_midtrans_settlement TO anon, authenticated, service_role;

-- 4. Fungsi untuk Mencatat Transaksi Batal / Expired
CREATE OR REPLACE FUNCTION public.handle_midtrans_failure(
    p_order_id TEXT,
    p_status TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.topup_transactions
    SET 
        status = p_status,
        updated_at = timezone('utc'::text, now())
    WHERE order_id = p_order_id AND status = 'PENDING';

    RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.handle_midtrans_failure TO anon, authenticated, service_role;
