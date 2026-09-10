# RUNBOOK: STRATEGI & PANDUAN OPERASIONAL BACKUP DATABASE SUPABASE (KOZA BISNIS)

Dokumen ini adalah panduan teknis operasional bagi tim engineering KoZa Bisnis untuk menjamin **Business Continuity** dan **Zero Data Loss** pada database PostgreSQL produksi (Supabase).

---

## 1. Arsitektur Cadangan Berlapis (3-Tier Backup Strategy)

Untuk menjamin ketersediaan data merchant (katalog produk, kuota order, transaksi settlement Midtrans, dan riwayat pesanan), KoZa Bisnis menerapkan tiga lapis pencadangan:

| Lapisan | Mekanisme | Frekuensi | RPO (Recovery Point Objective) | RTO (Recovery Time Objective) |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1** | **Supabase Point-in-Time Recovery (PITR)** | Berkelanjutan (Write-Ahead Logging / WAL) | **< 2 Menit** | **10 - 20 Menit** |
| **Tier 2** | **Automated Daily Backups** | Setiap 24 Jam (Otomatis oleh Supabase) | **< 24 Jam** | **15 - 30 Menit** |
| **Tier 3** | **External Off-Site Snapshot (`pg_dump`)** | Harian / Mingguan ke Cloud Storage Terisolasi | **< 24 Jam** | **30 - 60 Menit** |

---

## 2. Konfigurasi Supabase Point-in-Time Recovery (PITR)

FITUR PITR adalah garis pertahanan utama jika terjadi kesalahan fatal (misal: developer/admin tidak sengaja mengeksekusi `DELETE` tanpa `WHERE` atau anomali migrasi data).

### Langkah Aktivasi di Supabase Dashboard:
1. Masuk ke **Supabase Dashboard** $\rightarrow$ Pilih project **KoZa Bisnis Production**.
2. Buka menu **Project Settings** (ikon gerigi di kiri bawah) $\rightarrow$ **Database**.
3. Gulir ke bagian **Database Backups**.
4. Di bagian **Point in Time Recovery (PITR)**, aktifkan toggle **Enable PITR**.
5. Pilih periode retensi yang diinginkan (default **7 hari**, atau **30 hari** untuk kepatuhan enterprise).
6. Simpan konfigurasi. Supabase akan secara otomatis mengarsipkan physical WAL ke storage aman.

---

## 3. Skrip Pencadangan Mandiri / Off-Site (Tier 3)

Sebagai antisipasi mitigasi bencana vendor (*vendor lock-in / cloud provider disaster*), jalankan skrip snapshot terjadwal menggunakan `supabase db dump` atau `pg_dump`.

### Skrip Backup Otomatis (`scripts/backup-database.sh`):
```bash
#!/usr/bin/env bash
set -euo pipefail

# Format timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups"
BACKUP_FILE="${BACKUP_DIR}/koza_db_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "==> Memulai dump database KoZa Bisnis: ${TIMESTAMP}"

# Catatan: Gunakan Connection String Pooling atau Direct URL dari Supabase Settings
# Pastikan DATABASE_URL sudah diset di environment aman
if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL belum diatur."
  exit 1
fi

# Eksekusi pg_dump dengan kompresi gzip
pg_dump "$DATABASE_URL" \
  --format=plain \
  --no-owner \
  --no-privileges \
  --exclude-schema='supabase_functions' \
  | gzip > "$BACKUP_FILE"

echo "==> Backup selesai: ${BACKUP_FILE} (Ukuran: $(du -h "$BACKUP_FILE" | cut -f1))"

# (Opsional) Sinkronisasi ke S3 / Google Cloud Storage terenkripsi:
# aws s3 cp "$BACKUP_FILE" s3://koza-cold-backups/database/
```

---

## 4. Prosedur Disaster Recovery (Pemulihan Darurat)

Jika terjadi insiden data corruption atau downtime tak terduga, ikuti langkah berikut:

### Skenario A: Mengembalikan Database ke Detik Tertentu (via PITR)
1. Buka **Supabase Dashboard** $\rightarrow$ **Project Settings** $\rightarrow$ **Database** $\rightarrow$ **Backups**.
2. Klik tombol **Restore**.
3. Pilih opsi **Point in time**.
4. Tentukan tanggal, jam, menit, dan detik persis **1 menit sebelum insiden terjadi**.
5. Konfirmasi pemulihan. Supabase akan memutar ulang log WAL hingga detik tersebut.
6. *Downtime*: Aplikasi akan mengalami read-only singkat selama proses kloning basis data selesai.

### Skenario B: Pemulihan dari Berkas Dump Lokal (`.sql.gz`)
Jika basis data baru perlu dibangun dari nol:
```bash
# 1. Dekompresi berkas cadangan
gunzip -k backups/koza_db_YYYYMMDD_HHMMSS.sql.gz

# 2. Impor struktur & data ke database target
psql "$NEW_DATABASE_URL" < backups/koza_db_YYYYMMDD_HHMMSS.sql

# 3. Verifikasi integritas tabel krusial
psql "$NEW_DATABASE_URL" -c "SELECT count(*) FROM stores; SELECT count(*) FROM orders;"
```

---

## 5. Matriks Prioritas Data Krusial KoZa Bisnis

Saat audit berkala, pastikan tabel-tabel berikut selalu terverifikasi datanya:
1. `public.stores`: Profil toko, saldo kuota order (`quota_balance`), paket langganan (`plan`).
2. `public.topup_transactions`: Bukti pembayaran Midtrans (order ID, status settlement, nominal).
3. `public.orders`: Seluruh pesanan pembeli fisik dan transaksi WhatsApp.
4. `public.products`: Katalog produk, stok aktif, harga jual, dan foto produk.
5. `public.expenses`: Laporan keuangan laba/rugi UMKM.

---

## 6. Uji Coba Pemulihan Terjadwal (Drill Test)
- Lakukan **Simulasi Restore (Recovery Drill)** minimal **sekali setiap 3 bulan** pada environment staging/test Supabase untuk memastikan berkas cadangan tidak rusak (*corrupted*) dan skrip restore bekerja tanpa kendala.
