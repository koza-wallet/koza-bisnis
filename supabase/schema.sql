-- ==============================================================================
-- KoZa Bisnis — Database Schema & Multi-Tenant Row Level Security (RLS)
-- Sesuai Rekomendasi Audit Pre-Launch (P0 & P1)
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

-- 4. VIEW KEAMANAN: PUBLIC_PRODUCTS (P1 Audit: Jangan expose HPP ke publik)
-- Menggunakan security_invoker = true agar RLS dievaluasi pada level pemanggil, bukan admin
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
    category TEXT NOT NULL, -- 'ADS_TIKTOK', 'ADS_META', 'PACKAGING', 'OPERASIONAL', 'GAJI', 'LAINNYA'
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
    builder_mode TEXT NOT NULL DEFAULT 'MANUAL_BERDU', -- 'AI', 'MANUAL_BERDU', 'TEMPLATE'
    hero JSONB NOT NULL DEFAULT '{}'::jsonb,
    problem_section JSONB DEFAULT '{}'::jsonb,
    solution_section JSONB DEFAULT '{}'::jsonb,
    features JSONB DEFAULT '[]'::jsonb,
    testimonials JSONB DEFAULT '[]'::jsonb,
    pricing JSONB NOT NULL DEFAULT '{}'::jsonb,
    faqs JSONB DEFAULT '[]'::jsonb,
    blocks JSONB DEFAULT '[]'::jsonb, -- 15 blok modular ala Berdu
    design JSONB DEFAULT '{}'::jsonb, -- font, warna primer, background, radius
    seo JSONB DEFAULT '{}'::jsonb,
    pixels JSONB DEFAULT '{}'::jsonb, -- metaPixelId, tiktokPixelId
    analytics JSONB NOT NULL DEFAULT '{"viewsCount": 0, "ordersCount": 0, "conversionRate": 0}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_landing_pages_store_id ON public.landing_pages(store_id);
CREATE INDEX IF NOT EXISTS idx_landing_pages_slug ON public.landing_pages(slug);

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- A. Aktifkan RLS pada seluruh tabel
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;

-- B. Kebijakan STORES
-- Seller hanya boleh mengakses dan mengedit toko miliknya sendiri
CREATE POLICY "Seller can read own store"
    ON public.stores FOR SELECT
    USING (auth.uid() = owner_id);

CREATE POLICY "Seller can insert own store"
    ON public.stores FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Seller can update own store"
    ON public.stores FOR UPDATE
    USING (auth.uid() = owner_id);

-- Publik boleh melihat profil toko publik (untuk halaman toko /toko/[slug])
CREATE POLICY "Public can view store by slug"
    ON public.stores FOR SELECT
    USING (true);

-- C. Kebijakan PRODUCTS
-- Seller memiliki akses penuh atas produk di tokonya
CREATE POLICY "Seller full access to own products"
    ON public.products FOR ALL
    USING (
        store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
    );

-- Publik boleh melihat produk aktif (pembacaan umum)
CREATE POLICY "Public can view active products"
    ON public.products FOR SELECT
    USING (is_active = true);

-- D. Kebijakan ORDERS
-- Seller hanya boleh membaca dan mengubah status order di tokonya
CREATE POLICY "Seller can view orders for own store"
    ON public.orders FOR SELECT
    USING (
        store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
    );

CREATE POLICY "Seller can update orders for own store"
    ON public.orders FOR UPDATE
    USING (
        store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
    );

-- Pembeli (Publik/Anon) BOLEH mengirimkan pesanan baru ke tabel orders
CREATE POLICY "Public can place orders"
    ON public.orders FOR INSERT
    WITH CHECK (true);

-- E. Kebijakan EXPENSES
-- Hanya seller pemilik toko yang boleh membaca dan menambah pengeluaran
CREATE POLICY "Seller full access to own expenses"
    ON public.expenses FOR ALL
    USING (
        store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
    );

-- F. Kebijakan LANDING_PAGES
-- Seller memiliki kontrol penuh atas landing page tokonya
CREATE POLICY "Seller full access to own landing pages"
    ON public.landing_pages FOR ALL
    USING (
        store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
    );

-- Publik boleh melihat landing page yang aktif (/lp/[slug])
CREATE POLICY "Public can view active landing pages"
    ON public.landing_pages FOR SELECT
    USING (is_active = true);

-- ==============================================================================
-- 9. AUTO-PROFILE INITIALIZER (TRIGGER SAAT SELLER SIGNUP)
-- ==============================================================================
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

-- Trigger saat ada user baru registrasi di Supabase Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_seller();
