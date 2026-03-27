# Photobooth Web App

Aplikasi photobooth berbasis Next.js untuk:
- pengalaman user dari landing page sampai hasil foto
- manajemen framedi panel admin
- penyimpanan data frame ke Supabase
- pengiriman hasil foto ke email via Resend

## Fitur Utama
- Alur user: `Landing -> Frame -> Camera -> Editor -> Result`
- Pilihan frame dari data database (`/frames`)
- Editor foto dan hasil akhir strip photobooth
- Panel admin:
  - `Admin Users`
  - `Admin Gallery`
  - `Admin Frame Editor`
- API internal untuk CRUD frame
- Proteksi route admin menggunakan Supabase Auth + middleware

## Tech Stack
- `Next.js 15` (App Router, TypeScript)
- `React 19`
- `Tailwind CSS 4`
- `Supabase` (Auth, Database, Storage)
- `Resend` (email attachment hasil foto)
- `motion` + `lucide-react`

## Struktur Folder
```txt
app/
  admin/
    editor/
    gallery/
    users/
  api/
    frames/
    send-email/
  camera/
  editor/
  frames/
  login/
  result/
  actions/
lib/
  supabase.ts
  types.ts
utils/
  supabase/
middleware.ts
```

## Prasyarat
- Node.js `>= 20`
- npm `>= 10`
- Akun Supabase
- Akun Resend (opsional, jika pakai fitur kirim email)

## Setup Lokal Dari Nol
1. Clone repository:
```bash
git clone <URL_REPO_GITHUB>
cd photobooth
```

2. Install dependency:
```bash
npm install
```

3. Buat file environment:
```bash
cp .env.example .env.local
```
Jika di Windows PowerShell:
```powershell
Copy-Item .env.example .env.local
```

4. Isi nilai environment di `.env.local`.

5. Jalankan development server:
```bash
npm run dev
```

6. Buka:
`http://localhost:3000`

## Environment Variables
Lihat file `.env.example` untuk daftar lengkap. Yang wajib:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Untuk fitur email:
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

Opsional:
- `DISABLE_HMR` (`true`/`false`, untuk kondisi khusus)

## Setup Supabase
### 1) Buat table `frames`
```sql
create table if not exists public.frames (
  id text primary key,
  name text not null,
  category text,
  image_url text not null,
  canvas_width integer not null,
  canvas_height integer not null,
  slots jsonb not null,
  created_at timestamptz not null default now()
);
```
### 2) Buat storage bucket `frames`
- Bucket name: `frames`
- Visibility: `Public`
- Digunakan untuk menyimpan gambar frame (`<id>.png`)

### 3) Buat user admin
- Buat user di Supabase Auth (email/password)
- Login melalui halaman `/login`
- Route `/admin/*` akan otomatis diproteksi oleh `middleware.ts`

## Scripts
- `npm run dev` -> jalankan local development
- `npm run build` -> build production
- `npm run start` -> run production build
- `npm run lint` -> linting

## API Endpoint Ringkas
- `GET /api/frames` -> ambil daftar frame
- `POST /api/frames` -> simpan/update frame
- `DELETE /api/frames/:id` -> hapus frame + file storage
- `POST /api/send-email` -> kirim hasil foto ke email

## Keamanan & Catatan Penting
- Jangan commit `.env.local` ke GitHub.
- `SUPABASE_SERVICE_ROLE_KEY` hanya dipakai server-side.
- Jika secret pernah tersebar, lakukan rotate key di Supabase/Resend.

## Setup GitHub Dari Awal
Panduan lengkap ada di:
- `docs/GITHUB_SETUP.md`

## Troubleshooting Cepat
- Build error terkait env:
  - cek `.env.local` sudah lengkap dan tanpa typo.
- Admin redirect ke login terus:
  - cek session auth Supabase dan `NEXT_PUBLIC_SUPABASE_*`.
- Gagal kirim email:
  - cek `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, dan domain sender.
