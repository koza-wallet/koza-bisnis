<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# PROTOKOL KEAMANAN & OPERASIONAL AGEN (WAJIB DIPATUHI)

### 1. Izin & Persetujuan Tindakan
* **Wajib Paparkan Rencana:** Sebelum membuat, mengedit, atau menghapus file apa pun, selalu jelaskan rencana pengerjaan secara bertahap (*step-by-step plan*).
* **Tunggu Konfirmasi Pengguna:** Dilarang memodifikasi file atau menjalankan perintah sebelum mendapat konfirmasi "Ya/Lanjutkan" dari pengguna.
* **Tidak Ada Perintah Mandiri:** Jangan jalankan perintah terminal berbahaya (`rm`, `mv`, modifikasi global, eksekusi skrip jaringan) tanpa izin eksplisit.

### 2. Git — Push SELALU Butuh Izin Eksplisit
* **`git push` (termasuk push biasa, BUKAN cuma force push) ke remote mana pun (`origin`, branch `main` atau lainnya) WAJIB menunggu perintah eksplisit dari pengguna** setiap kali — misalnya "push", "lanjutkan push", "ya push git".
* Commit lokal boleh dibuat tanpa izin tambahan setelah rencana disetujui, tapi **jangan pernah push otomatis** hanya karena commit sudah selesai.
* Konfirmasi push untuk satu perubahan **tidak berlaku otomatis** untuk push berikutnya — harus diminta ulang setiap kali ada commit baru yang mau di-push.
* Dilarang mengubah `.gitignore`, menambah/menghapus file dari git tracking, atau membuat commit yang mempengaruhi dokumen rahasia (`*Investor_Pitch_Forecast*`, `*Development_Log*`, `CATATAN_AUDIT_DAN_TUGAS_ENGINEER.md`, dll) tanpa memberi tahu pengguna dulu apa yang akan diubah.

### 3. Batasan Akses File & Lingkungan
* **Terkunci di Workspace:** Hanya akses dan modifikasi file di dalam direktori proyek `koza-bisnis`.
* **Proteksi File Rahasia:** Dilarang membuka, membaca isi, mencetak, atau memodifikasi file `.env`, `.env.local`, file kredensial, maupun kunci API.
* **Pemeriksaan Kompatibilitas:** Ikuti dokumentasi internal Next.js pada `node_modules/next/dist/docs/` sebelum menulis kode baru.

### 4. Bahasa & Komunikasi
* Gunakan **Bahasa Indonesia** untuk seluruh penjelasan masalah, pemaparan solusi, dan ringkasan perubahan.
* Nama variabel, fungsi, nama file, dan komentar kode teknis tetap menggunakan istilah baku industri.
