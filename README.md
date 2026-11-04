# SKYR Menu

Menu digital (QR) SKYR Coffee — Next.js 16 + Prisma + PostgreSQL.

- `/` — menu list untuk pelanggan: kategori, catatan pesanan, musik, dan tombol **Masuk ke room chat** (muncul hanya jika link diisi admin).
- `/skyr-dash` — admin: kelola kategori, menu (urutan, gambar), dan **Link Room Chat**.

## Setup lokal

```bash
cp .env.example .env        # isi DATABASE_URL & SESSION_SECRET
npm install                 # otomatis menjalankan prisma generate
npx prisma migrate deploy   # buat tabel di database lokal
npm run admin:password -- admin <password-baru>
npm run dev
```

Database lokal memakai Postgres di Docker (`Documents/Project/Docker Compose`), database `skyr_menu`.

## Environment variables

| Nama | Keterangan |
|---|---|
| `DATABASE_URL` | Koneksi PostgreSQL (produksi: Supabase) |
| `SESSION_SECRET` | Kunci tanda tangan cookie login admin (`openssl rand -hex 32`). Mengganti nilai ini me-logout semua admin. |
| `BLOB_READ_WRITE_TOKEN` | Upload gambar ke Vercel Blob. Wajib di Vercel. |

## Database & migrasi

Schema ada di `prisma/schema.prisma`, migrasi di `prisma/migrations/`.

Database produksi (Supabase) dibuat dengan `prisma db push`, **tanpa** riwayat migrasi — jangan jalankan
`prisma migrate deploy` ke Supabase. Perubahan schema di produksi dijalankan lewat Supabase → SQL Editor
memakai isi file `migration.sql` yang bersangkutan. Untuk tabel baru, tambahkan juga
`ALTER TABLE "<nama_tabel>" ENABLE ROW LEVEL SECURITY;` — semua tabel di Supabase memakai RLS agar tidak
bisa dibaca/diubah lewat REST API publik Supabase (anon key). Aplikasi tetap bisa akses karena terhubung
sebagai owner tabel (`postgres`).

## Deploy (Vercel)

`npm run build` menjalankan `prisma generate && next build`, sehingga Prisma Client selalu sesuai schema terbaru.
