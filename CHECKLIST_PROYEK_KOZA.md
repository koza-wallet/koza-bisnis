# Checklist Komprehensif Proyek KoZa Bisnis

Dokumen ini memuat seluruh rekam jejak pekerjaan sistem KoZa Bisnis dari awal pembangunan hingga saat ini, baik yang **sudah selesai diimplementasikan [x]** maupun yang **masih dalam antrean pengembangan [ ]**.

---

## 1. Fondasi Backend & Database Multi-Tenant (P0)

- [x] **Setup Skema Database Supabase**: Tabel `stores`, `products`, `orders`, `expenses`, `landing_pages`, `topup_transactions`, dan `chat_sessions`.
- [x] **Isolasi Multi-Tenant (RLS)**: Row Level Security aktif di seluruh tabel database untuk menjamin kerahasiaan data antar-toko.
- [x] **Autentikasi Seller**: Supabase Auth (Login, Registrasi, Lupa Password) dengan proteksi Next.js Middleware pada rute `/dashboard`.
- [x] **Dynamic Slug Lookup**: Etalase publik `/toko/[slug]` dan landing page `/lp/[slug]` mengambil data langsung dari Supabase berdasarkan URL slug.
- [x] **Server-Side Order Creation**: Form checkout menulis pesanan baru langsung ke Supabase dengan status awal transaksi.
- [x] **Migrasi State Context**: `src/lib/store-context.tsx` terhubung penuh ke Supabase untuk sinkronisasi data antar-perangkat secara real-time.

---

## 2. Keamanan Pre-Launch & Hardening Database (P1 & Pentest)

- [x] **Proteksi HPP (Cost Price)**: Kolom `cost_price` disembunyikan dari publik melalui database VIEW `public_products` (`security_invoker = false`).
- [x] **Validasi Script Pixel Anti-XSS**: Sanitasi regex ketat untuk Meta Pixel (`^\d{10,20}$`) dan TikTok Pixel (`^[A-Za-z0-9]{15,25}$`).
- [x] **Uji Penetrasi IDOR (6/6 PASS)**: Anonim dan user lain terbukti diblokir dari membaca pesanan, pengeluaran, atau memodifikasi toko lain.
- [x] **Sanitasi & Validasi Input Server-Side**: Endpoint `POST /api/orders/create` membersihkan tag HTML, script, control char, serta validasi nomor HP `628...`.
- [x] **Rate Limiting Checkout**: Pembatasan maksimal 5 order per 60 detik per IP (`src/lib/rate-limit.ts`) guna mencegah serangan spam order.
- [x] **Verifikasi Server-to-Server Pembayaran**: Signature SHA-512 Midtrans tervalidasi kriptografis dengan penguncian baris database atomik (`FOR UPDATE`).
- [x] **RPC Settlement Lockdown**: Fungsi settlement saldo/kuota dicabut dari akses publik (`anon`, `authenticated`) dan dikunci eksklusif untuk `service_role`.
- [x] **Proteksi Kolom Berprivilese**: Database trigger `BEFORE UPDATE` memblokir manipulasi `quota_balance`, `plan`, dan `plan_expiry_date` dari DevTools browser.
- [x] **Server-Side Price & Profit Calculation**: HPP dan laba bersih dihitung otomatis oleh server di backend saat order dibuat untuk mencegah manipulasi total belanja.
- [x] **Siklus Kuota Pesanan Atomik**: Pesanan masuk tidak pernah diblokir saat kuota habis (berstatus `TERKUNCI_KUOTA`), dan kuota seller baru dipotong saat menekan "Verifikasi Pembayaran".
- [x] **Entropi Tinggi Order ID**: Format nomor pesanan acak aman 8 karakter crypto (`KZ-XXXXXX`).
- [x] **Security Headers Lengkap**: Content-Security-Policy (CSP), X-Frame-Options, X-Content-Type-Options, dan Strict-Transport-Security.
- [x] **White-Label Privacy**: View `public_stores` menyembunyikan string nama paket langganan dan hanya mengekspos boolean `is_white_label`.

---

## 3. Monetisasi, Billing & Pricing 2.0 (Investor Model)

- [x] **3-Tier Subscription Engine**: Basic (Rp 75.000/bln), Pro AI Flagship (Rp 329.000/bln), dan Add-On Kuota/Token AI (mulai Rp 49.000).
- [x] **Toggle Bulanan vs Tahunan**: Diskon bayar 10 bulan gratis 2 bulan (Basic Rp 750.000/thn, Pro AI Rp 2.990.000/thn).
- [x] **Billing & Top-Up Dashboard**: Terintegrasi di `/dashboard/topup` dengan Snap Midtrans Popup (BCA, Mandiri, BRI, QRIS, GoPay, dll).
- [x] **Watermark Dinamis**: Micro-badge *Powered by KoZa* otomatis muncul di etalase toko Basic, dan 100% white-label (hilang) pada toko Pro AI.
- [x] **Upsell Modal Pro**: Muncul otomatis saat toko Basic mencoba menggunakan fitur eksklusif Pro.

---

## 4. Fitur Toko, Katalog & Operasional Transaksi

- [x] **Storefront Publik Editorial (`/toko/[slug]`)**: Header profil toko squircle, filter kategori pills, search live, keranjang belanja (drawer), dan checkout express.
- [x] **Fitur Grosir B2B**: Konfigurasi Minimum Order Quantity (MOQ) dan tier harga grosir bertingkat (mis. beli $\ge$12 pcs harga otomatis diskon).
- [x] **Pengaturan Ekspedisi Toko Kustom**: Pilihan kurir reguler (JNE, J&T, SiCepat, dll) dan kargo (JTR, J&T Cargo, Indah Logistik) di `/dashboard/pengaturan`.
- [x] **Pelacakan Resi Publik (`/lacak/[orderNumber]`)**: Halaman tracking status paket, kurir ekspedisi, dan form rating ulasan bintang dari pembeli.
- [x] **Manajemen Pesanan (`/dashboard/pesanan`)**: Filter status dinamis berpenghitung, input resi, generator chat WhatsApp instan, dan tombol verifikasi pembayaran.
- [x] **Buku Kas & Keuangan**: Rekap omset, HPP riil, laba bersih, dan pencatatan pengeluaran operasional toko.
- [x] **Landing Page Builder Toko (`/lp/[slug]`)**: Halaman penawaran produk tunggal berkonversi tinggi dengan direct checkout.

---

## 5. Dukungan Custom Domain Toko (`namatoko.com`)

- [x] **Multi-Tenant Hostname Rewriting**: Middleware otomatis mendeteksi custom domain toko seller dan me-rewrite ke etalase `/toko/[slug]` tanpa mengubah URL browser pembeli.
- [x] **Live DNS Verification API**: Endpoint `GET /api/domain/verify` memeriksa CNAME (`cname.kozabisnis.com`) dan A Record (`76.76.21.21`) secara real-time.
- [x] **Dashboard Pengaturan Domain**: UI input custom domain toko, instruksi DNS record, dan status badge verifikasi aktif.
- [ ] **Otomasi SSL Edge Vercel API (P2.2)**: Otomatisasi pendaftaran domain ke Vercel API (`POST /v1/projects/{projectId}/domains`) agar sertifikat SSL terbit otomatis tanpa konfigurasi manual di dashboard Vercel admin.

---

## 6. Jaga AI CS — WhatsApp Gateway Riil (P2.1)

- [x] **WhatsApp Gateway Engine Terpusat**: KoZa mengontrol Fonnte API multi-tenant secara programmatic menggunakan 1 Master Token (`FONNTE_MASTER_TOKEN`).
- [x] **Zero-Touch Onboarding Seller**: Seller Pro klik *"Tautkan WhatsApp Toko"*, QR code muncul in-app, scan via aplikasi WhatsApp ponsel, dan bot langsung aktif.
- [x] **Auto-Register Webhook & Auto-Read**: Sistem otomatis mendaftarkan webhook URL toko dan mengaktifkan autoread pesan personal ke Fonnte.
- [x] **Catalog-Aware RAG**: Pesan calon pembeli dijawab secara cerdas oleh Google Gemini 1.5 Flash menggunakan data katalog riil toko (nama barang, harga, stok, link checkout).
- [x] **AI Cost Guard & Circuit Breaker**: Proteksi biaya dari perulangan pesan (maks 5 chat/menit, cap 500 karakter, auto-mute 5 menit jika LLM error 3x).
- [x] **Human Takeover & Eskalasi Komplain**: Bot otomatis berhenti dan menyerahkan ke manusia jika terdeteksi komplain/retur/penipuan, didukung perintah darurat seller (`!pause` / `!resume`).
- [x] **Churn-Safe Auto Cleanup**: Saat seller disconnect atau berhenti langganan, device langsung dihapus dari Fonnte (`POST /delete-device`) agar tidak menagih biaya langganan gateway.
- [x] **Live di Produksi**: Skrip migrasi telah dieksekusi di database Supabase `beserhtzbfkwpvcheuag` dan kode telah di-deploy ke Vercel (`68f200e`).

---

## 7. Brand, Legalitas & Kesiapan Produksi (P3)

- [x] **Landing Page Utama Anti-Slop (`/`)**: Kalkulator komisi marketplace vs KoZa (hemat hingga 25%), visual perbandingan, dan floating mobile dock.
- [x] **Kepatuhan Hukum Privasi**: Halaman `/kebijakan-privasi` (standar UU PDP) dan `/syarat-ketentuan` (larangan produk ilegal & aturan transaksi).
- [x] **Identitas Brand Resmi**: Integrasi aset logo resmi KoZa Bisnis PNG native (`/brand/koza-icon.png`), favicon, dan app icon di seluruh halaman (perbaikan broken image pada peramban WebKit/Safari/Chrome).
- [x] **Monitoring & Error Boundary**: Halaman error global `src/app/error.tsx` dan not-found modern `src/app/not-found.tsx`.
- [x] **Runbook Backup Supabase**: Panduan teknis disaster recovery dan snapshot PITR di `SUPABASE_BACKUP_RUNBOOK.md`.
- [x] **Kompilasi & Build Produksi**: 100% lolos kompilasi TypeScript (`tsc --noEmit`) dan build produksi Next.js (22/22 rute statis/dinamis).

---

## 8. Fitur Masa Depan yang Belum Dikerjakan (Roadmap Backlog)

- [ ] **P2.2 — Otomasi SSL Edge Vercel**: Script sinkronisasi Vercel Domains API via `VERCEL_AUTH_TOKEN` dan `VERCEL_PROJECT_ID`.
- [ ] **P2.3 — AI Virtual Fashion Model & Photo Studio Generator**: Fitur generasi foto katalog model pakaian studio berbasis AI untuk seller fashion.
- [ ] **P2.5 — AI 30-Day Content Scheduler**: Generator materi promosi & ide konten media sosial 30 hari untuk seller.
- [ ] **P2.4 — Sistem Reseller / Affiliate (On Hold)**: Model dropship diskon langsung di depan / saldo deposit komisi untuk memperluas jaringan penjualan seller.
- [ ] **Integrasi Auto-AWB & Pickup Ekspedisi**: Request pickup kurir dan cetak label thermal resi otomatis via API kurir (mis. Biteship) tanpa seller perlu mengetik nomor resi secara manual.
- [ ] **Notifikasi Otomatis WhatsApp ke Pembeli**: Pengiriman pesan WA otomatis dari bot saat pesanan dikonfirmasi dan saat resi diinput (saat ini seller menggunakan tombol salin template chat manual).
