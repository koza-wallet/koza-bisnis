-- ==============================================================================
-- KOZA BISNIS — SETUP COMPLETE PRODUCTION DATABASE (2026-09-11)
-- 
-- Skrip All-in-One: Menyiapkan seluruh tabel, RLS, Midtrans, & proteksi keamanan.
-- Cukup jalankan skrip ini SEKALI di Supabase SQL Editor.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABEL: STORES (Toko Multi-Tenant)
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    whatsapp_number TEXT NOT NULL,
    origin_city TEXT NOT NULL DEFAULT 'Kota Jakarta Selatan',
    origin_district TEXT NOT NULL DEFAULT 'Kebayoran Baru',
    quota_balance INTEGER NOT NULL DEFAULT 10,
    plan TEXT NOT NULL DEFAULT 'NON_PRO', -- 'NON_PRO', 'PRO_MONTHLY', 'PRO_ANNUAL'
    plan_expiry_date TIMESTAMPTZ,
    bank_name TEXT,
    bank_account_number TEXT,
    bank_account_name TEXT,
    qris_image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON public.stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_stores_slug ON public.stores(slug);

-- 3. TABEL: PRODUCTS (Katalog Produk Toko)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    selling_price NUMERIC(15, 2) NOT NULL,
    cost_price NUMERIC(15, 2) NOT NULL DEFAULT 0, -- HPP RAHASIA (Private ke seller)
    weight_grams INTEGER NOT NULL DEFAULT 300,
    stock INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    category TEXT DEFAULT 'Umum',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_products_store_id ON public.products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);

-- 4. VIEW KEAMANAN: PUBLIC_PRODUCTS (Jangan expose HPP ke publik)
CREATE OR REPLACE VIEW public.public_products 
WITH (security_invoker = true) AS
SELECT 
    id,
    store_id,
    name,
    slug,
    description,
    selling_price,
    weight_grams,
    stock,
    image_url,
    category,
    is_active,
    created_at
FROM public.products
WHERE is_active = true;

-- 5. TABEL: ORDERS (Pesanan dari Pembeli)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    destination_city TEXT NOT NULL,
    destination_district TEXT,
    courier_name TEXT NOT NULL,
    courier_service TEXT DEFAULT 'Reguler',
    shipping_cost NUMERIC(15, 2) NOT NULL DEFAULT 0,
    items_total NUMERIC(15, 2) NOT NULL DEFAULT 0,
    grand_total NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total_cost_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    net_profit NUMERIC(15, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'MENUNGGU_BAYAR', -- 'MENUNGGU_BAYAR', 'DIPROSES', 'DIKIRIM', 'SELESAI', 'DIBATALKAN'
    payment_method TEXT NOT NULL DEFAULT 'WHATSAPP', -- 'WHATSAPP', 'QRIS_TOKO'
    tracking_number TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_orders_store_id ON public.orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- 6. TABEL: EXPENSES (Biaya Operasional Toko)
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    description TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_expenses_store_id ON public.expenses(store_id);

-- 7. TABEL: LANDING_PAGES (Landing Page Builder Ala Berdu & AI)
CREATE TABLE IF NOT EXISTS public.landing_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    theme TEXT NOT NULL DEFAULT 'EMERALD',
    tone TEXT NOT NULL DEFAULT 'URGENT',
    builder_mode TEXT NOT NULL DEFAULT 'MANUAL_BERDU',
    hero JSONB NOT NULL DEFAULT '{}'::jsonb,
    problem_section JSONB DEFAULT '{}'::jsonb,
    solution_section JSONB DEFAULT '{}'::jsonb,
    features JSONB DEFAULT '[]'::jsonb,
    testimonials JSONB DEFAULT '[]'::jsonb,
    pricing JSONB NOT NULL DEFAULT '{}'::jsonb,
    faqs JSONB DEFAULT '[]'::jsonb,
    blocks JSONB DEFAULT '[]'::jsonb,
    design JSONB DEFAULT '{}'::jsonb,
    seo JSONB DEFAULT '{}'::jsonb,
    pixels JSONB DEFAULT '{}'::jsonb,
    analytics JSONB NOT NULL DEFAULT '{"viewsCount": 0, "ordersCount": 0, "conversionRate": 0}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_landing_pages_store_id ON public.landing_pages(store_id);
CREATE INDEX IF NOT EXISTS idx_landing_pages_slug ON public.landing_pages(slug);

-- 8. TABEL: TOPUP_TRANSACTIONS (Riwayat Transaksi Midtrans)
CREATE TABLE IF NOT EXISTS public.topup_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    order_id TEXT NOT NULL UNIQUE,
    amount NUMERIC(12, 2) NOT NULL,
    package_code TEXT NOT NULL,
    package_name TEXT NOT NULL,
    package_type TEXT NOT NULL DEFAULT 'QUOTA',
    quota_amount INTEGER NOT NULL DEFAULT 0,
    plan_tier TEXT,
    payment_type TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING',
    snap_token TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_topup_transactions_store_id ON public.topup_transactions(store_id);
CREATE INDEX IF NOT EXISTS idx_topup_transactions_order_id ON public.topup_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_topup_transactions_status ON public.topup_transactions(status);

-- ------------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topup_transactions ENABLE ROW LEVEL SECURITY;

-- Kebijakan STORES
DROP POLICY IF EXISTS "Seller can read own store" ON public.stores;
CREATE POLICY "Seller can read own store" ON public.stores FOR SELECT USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Seller can insert own store" ON public.stores;
CREATE POLICY "Seller can insert own store" ON public.stores FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Seller can update own store" ON public.stores;
CREATE POLICY "Seller can update own store" ON public.stores FOR UPDATE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Public can view store by slug" ON public.stores;
CREATE POLICY "Public can view store by slug" ON public.stores FOR SELECT USING (true);

-- Kebijakan PRODUCTS
DROP POLICY IF EXISTS "Seller full access to own products" ON public.products;
CREATE POLICY "Seller full access to own products" ON public.products FOR ALL USING (
    store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (is_active = true);

-- Kebijakan ORDERS
DROP POLICY IF EXISTS "Seller can view orders for own store" ON public.orders;
CREATE POLICY "Seller can view orders for own store" ON public.orders FOR SELECT USING (
    store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Seller can update orders for own store" ON public.orders;
CREATE POLICY "Seller can update orders for own store" ON public.orders FOR UPDATE USING (
    store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Public can place orders" ON public.orders;
CREATE POLICY "Public can place orders" ON public.orders FOR INSERT WITH CHECK (true);

-- Kebijakan EXPENSES
DROP POLICY IF EXISTS "Seller full access to own expenses" ON public.expenses;
CREATE POLICY "Seller full access to own expenses" ON public.expenses FOR ALL USING (
    store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
);

-- Kebijakan LANDING_PAGES
DROP POLICY IF EXISTS "Seller full access to own landing pages" ON public.landing_pages;
CREATE POLICY "Seller full access to own landing pages" ON public.landing_pages FOR ALL USING (
    store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Public can view active landing pages" ON public.landing_pages;
CREATE POLICY "Public can view active landing pages" ON public.landing_pages FOR SELECT USING (is_active = true);

-- Kebijakan TOPUP_TRANSACTIONS
DROP POLICY IF EXISTS "Sellers can view own topup transactions" ON public.topup_transactions;
CREATE POLICY "Sellers can view own topup transactions" ON public.topup_transactions FOR SELECT USING (
    store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Sellers can insert own topup transactions" ON public.topup_transactions;
CREATE POLICY "Sellers can insert own topup transactions" ON public.topup_transactions FOR INSERT WITH CHECK (
    store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
);

-- ------------------------------------------------------------------------------
-- 10. TRIGGER AUTO-PROFILE INITIALIZER (SAAT USER SELLER SIGNUP)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_seller()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.stores (
        owner_id,
        slug,
        name,
        description,
        whatsapp_number,
        quota_balance
    ) VALUES (
        NEW.id,
        'toko-' || substr(NEW.id::text, 1, 8),
        COALESCE(NEW.raw_user_meta_data->>'store_name', 'Toko Baru KoZa'),
        'Selamat datang di toko resmi kami di KoZa Bisnis!',
        COALESCE(NEW.raw_user_meta_data->>'whatsapp_number', '6281234567890'),
        10
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_seller();

-- ------------------------------------------------------------------------------
-- 11. FUNGSI SETTLEMENT MIDTRANS (HAK HANYA UNTUK SERVICE_ROLE)
-- ------------------------------------------------------------------------------
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
            v_bonus_quota := 500;
            v_new_expiry := timezone('utc'::text, now()) + INTERVAL '365 days';
        ELSE
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
        UPDATE public.stores
        SET 
            quota_balance = quota_balance + v_tx.quota_amount,
            updated_at = timezone('utc'::text, now())
        WHERE id = v_tx.store_id;
    END IF;

    RETURN jsonb_build_object('success', true, 'message', 'Payment settled successfully');
END;
$$;

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

CREATE OR REPLACE FUNCTION public.revert_topup_transaction(
    p_order_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tx RECORD;
BEGIN
    SELECT * INTO v_tx FROM public.topup_transactions WHERE order_id = p_order_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Order not found');
    END IF;

    IF v_tx.status = 'SETTLED' THEN
        UPDATE public.topup_transactions SET status = 'PENDING', updated_at = timezone('utc'::text, now()) WHERE id = v_tx.id;
        UPDATE public.stores SET quota_balance = GREATEST(0, quota_balance - v_tx.quota_amount), updated_at = timezone('utc'::text, now()) WHERE id = v_tx.store_id;
    END IF;

    RETURN jsonb_build_object('success', true, 'message', 'Transaction reverted');
END;
$$;

-- CABUT AKSES PUBLIK (Mencegah bypass console browser)
REVOKE ALL ON FUNCTION public.handle_midtrans_settlement(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_midtrans_failure(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.revert_topup_transaction(TEXT) FROM PUBLIC, anon, authenticated;

-- HANYA BERIKAN KE SERVICE_ROLE
GRANT EXECUTE ON FUNCTION public.handle_midtrans_settlement(TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_midtrans_failure(TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.revert_topup_transaction(TEXT) TO service_role;

-- ------------------------------------------------------------------------------
-- 12. TRIGGER BEFORE UPDATE: PROTEKSI KOLOM KUOTA & PLAN TOKO DARI CONSOLE
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_privileged_store_fields_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF auth.role() = 'service_role'
       OR current_user IN ('postgres', 'service_role', 'supabase_admin')
       OR coalesce(current_setting('request.jwt.claim.role', true), '') = 'service_role' THEN
        RETURN NEW;
    END IF;

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
