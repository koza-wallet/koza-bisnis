# KoZa Bisnis — Catatan Audit & Rencana Kerja Engineer (Pre-Launch)

**Tanggal audit**: 2026-09-10
**Konteks**: Audit dilakukan sebelum `kozabisnis.com` launching ke publik dengan target 1.000 seller berbayar. Metode: code review manual + `npm audit` + secret scan (git history & kode). Tidak ada rahasia/API key bocor — temuan di bawah ini murni soal **kesiapan arsitektur & keamanan data**, bukan kredensial.

---

## P0 — BLOCKER LAUNCH: Backend & Multi-Tenant Belum Ada

**Masalah inti**: seluruh aplikasi (`src/lib/store-context.tsx`) menyimpan data (toko, produk, pesanan, landing page) **hanya di `localStorage` browser**. Tidak ada `fetch()`, tidak ada `axios`, tidak ada folder `src/app/api` — nol komunikasi ke server mana pun. `@supabase/supabase-js` & `@supabase/ssr` sudah ada di `package.json` tapi **belum dipakai sama sekali** di kode.

Akibat konkret kalau di-launch apa adanya:
- Pembeli yang buka `/toko/[slug]` dari device sendiri **tidak melihat produk seller asli** — yang muncul cuma data demo dari `src/lib/mock-data.ts`, karena `localStorage` privat per-browser.
- `src/app/toko/[slug]/page.tsx` bahkan **tidak pernah membaca parameter `slug`** untuk mencari toko yang benar (lihat baris 32: `const { store, products } = useStore();` — tidak ada lookup by slug).
- Pesanan yang dibuat pembeli tersimpan di `localStorage` milik **pembeli**, bukan terkirim ke seller — dashboard pesanan seller tidak akan pernah menerimanya.
- `/dashboard` tanpa login/auth — siapa pun yang buka URL di browser yang sama bisa lihat/edit data toko yang sama.

### Tugas Engineer

1. **Aktifkan Supabase** (dependency sudah terpasang, tinggal dipakai):
   - Buat project Supabase, desain schema: `stores`, `products`, `orders`, `expenses`, `landing_pages` — semua punya kolom `owner_id` (FK ke user Supabase Auth) untuk isolasi antar-seller.
   - Aktifkan **Row Level Security (RLS)** di semua tabel: seller hanya boleh baca/tulis baris miliknya sendiri.
2. **Auth seller**: implementasikan Supabase Auth (email/password atau magic link) untuk `/dashboard`. Lindungi semua route dashboard dengan middleware yang cek session — user tanpa login tidak boleh mengakses.
3. **Perbaiki lookup by slug**: `/toko/[slug]` dan `/lp/[slug]` harus query ke tabel `stores`/`landing_pages` berdasarkan `slug` (server component atau route handler), bukan ambil dari Context lokal. Ini yang membuat setiap link toko benar-benar menampilkan data seller yang tepat untuk siapa pun yang membukanya.
4. **Pindahkan `createOrder` ke server** (Server Action atau API route) yang menulis ke tabel `orders` dengan `store_id` yang benar (hasil lookup slug) — bukan disimpan di browser pembeli.
5. **Migrasi state dashboard** dari `useState + localStorage` (`store-context.tsx`) ke data-fetching berbasis Supabase (query saat load, mutation via Server Action), supaya seller yang login dari device manapun melihat data yang sama.

---

## P1 — Keamanan yang Harus Beres Bersamaan dengan Migrasi Backend

1. **Jangan expose `costPrice` (HPP) ke publik.** Saat ini `/toko/[slug]/page.tsx:74` memuat objek produk lengkap (termasuk `costPrice`) ke client demi hitung subtotal — walau UI cuma tampilkan `sellingPrice`, siapa pun bisa baca `costPrice` lewat devtools. Setelah backend ada: buat query publik yang **tidak menyertakan `costPrice` sama sekali**, dan hitung margin/laba bersih hanya di endpoint yang butuh auth (dashboard seller).
2. **Validasi Pixel ID sebelum di-inject ke script** (`src/components/pixel-tracker.tsx:22,54`). Saat ini `metaPixelId`/`tiktokPixelId` diinterpolasi langsung ke `dangerouslySetInnerHTML` cuma dengan `.trim()` — tidak ada validasi format. Ini celah **stored XSS**: begitu ada banyak seller dengan akun sendiri, seller yang akunnya kena compromise (atau nilai pixel ID yang tidak divalidasi) bisa menyuntik skrip apa pun ke halaman `/lp/[slug]` yang dilihat publik.
   - Perbaikan: validasi `metaPixelId` harus numerik (regex `^\d{10,20}$`) dan `tiktokPixelId` harus alfanumerik sesuai format resmi TikTok (regex `^[A-Z0-9]{15,25}$`), baik saat disimpan (server-side) maupun sebelum dirender — tolak nilai yang tidak cocok pola.
3. **Uji RLS dengan skenario IDOR**: setelah RLS aktif, coba akses data seller lain lewat user login berbeda — pastikan gagal (403/empty), bukan cuma "tersembunyi di UI".
4. **Validasi & sanitasi input pembeli server-side** (`customerName`, `customerPhone`, `customerAddress` di form checkout) sebelum disimpan/dipakai membentuk pesan WhatsApp — cegah karakter yang bisa merusak format pesan atau, ke depan, disuntik ke tempat lain yang kurang aman.
5. **Rate limit endpoint checkout publik** supaya tidak bisa dibanjiri submission palsu begitu backend live.
6. **Payment gateway wajib verifikasi server-side** (lihat P2) — jangan pernah percaya status "sudah bayar" yang dikirim dari client.

---

## P2 — DITUNDA (Pending, fokus P0/P1 dulu) — Fitur Belum Ada dari Development Log

1. **Jaga AI** — WhatsApp CS bot 24/7 (webhook + auto-reply cek stok/ongkir/link bayar).
2. **Payment Gateway otomatis** (Xendit/Midtrans/Duitku) — begitu backend Supabase ada, integrasikan webhook penyedia untuk verifikasi otomatis QRIS/transfer, bukan konfirmasi manual.
3. **AI Virtual Fashion Model & Video Generator**.
4. **AI 30-Day Content Scheduler**.
5. Eksekusi script Pixel di `/lp/[slug]` (form ID sudah ada — tinggal render `<PixelTracker>` di halaman, sekalian terapkan validasi di poin P1.2).

---

## P3 — Checklist Sebelum Go-Live

- [ ] `npm audit` bersih (sudah ✅ saat ini — cek ulang sebelum deploy final).
- [ ] Tambahkan monitoring/error tracking (Sentry atau Vercel Analytics) supaya tahu kalau ada error di production.
- [ ] Strategi backup database Supabase (PITR / scheduled backup).
- [ ] Privacy Policy & ToS disesuaikan — begitu backend nyata dipakai, aplikasi akan menyimpan **PII asli pembeli** (nama, no. HP, alamat) di database sungguhan, bukan cuma demo. Pastikan kebijakan privasi & keamanan data (enkripsi at-rest, kontrol akses) sudah mencerminkan ini.
- [ ] Uji ulang secret scan (`git log --all` + grep pola API key) setelah kredensial Supabase/payment gateway ditambahkan ke `.env` — pastikan tidak pernah ter-commit.

---

**Ringkasan urutan kerja yang disarankan**: P0 (butuh backend nyata dulu) → P1 (keamanan yang menempel di migrasi yang sama) → P2 (fitur pertumbuhan) → P3 (go-live checklist). Jangan launch untuk seller sungguhan sebelum P0 selesai — saat ini aplikasi secara fungsional tidak bisa menerima pesanan lintas-device.
