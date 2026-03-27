# GitHub Setup Dari Nol

Dokumen ini untuk menyiapkan repository Photobooth dari awal sampai siap kolaborasi di GitHub.

## Opsi A: Project Sudah Ada di Lokal, Belum Ada Repo GitHub
1. Pastikan di root project:
```bash
cd photobooth
```

2. Inisialisasi git (jika belum):
```bash
git init
```

3. Pastikan `.gitignore` aktif dan `.env.local` tidak ikut commit.

4. Commit pertama:
```bash
git add .
git commit -m "chore: initial project setup"
```

5. Buat repository baru di GitHub (tanpa README agar tidak conflict).

6. Hubungkan remote:
```bash
git remote add origin https://github.com/<username>/<repo>.git
```

7. Rename branch utama dan push:
```bash
git branch -M main
git push -u origin main
```

## Opsi B: Repository Sudah Ada di GitHub
1. Clone:
```bash
git clone https://github.com/<username>/<repo>.git
cd <repo>
```

2. Copy env:
```bash
cp .env.example .env.local
```
Windows PowerShell:
```powershell
Copy-Item .env.example .env.local
```

3. Isi `.env.local`, install dependency, lalu jalankan:
```bash
npm install
npm run dev
```

## Workflow Branch Yang Direkomendasikan
1. Sinkron `main`:
```bash
git checkout main
git pull origin main
```

2. Buat branch fitur:
```bash
git checkout -b feat/nama-fitur
```

3. Commit bertahap:
```bash
git add .
git commit -m "feat: tambah fitur X"
```

4. Push branch:
```bash
git push -u origin feat/nama-fitur
```

5. Buat Pull Request ke `main`.

## Aturan Commit Message (Simple)
- `feat:` fitur baru
- `fix:` perbaikan bug
- `chore:` tugas teknis non-fitur
- `docs:` perubahan dokumentasi
- `refactor:` perapihan kode tanpa ubah perilaku

Contoh:
```txt
feat: add frame save API
fix: handle empty slots in frame editor
docs: update setup instructions
```

## Setup Secrets Untuk Deployment
Jika deploy via Vercel/GitHub Actions, masukkan environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

Catatan:
- Jangan simpan secret di file yang di-commit.
- Gunakan `.env.local` untuk local dan dashboard provider untuk production.

## Checklist Sebelum Push
- `npm run lint` lulus
- `npm run build` lulus
- `.env.local` tidak ter-commit
- README dan docs update
- Tidak ada hardcoded secret di source code

