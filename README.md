# APAR Check Backend

REST API NestJS untuk fondasi aplikasi pemeriksaan APAR.

## Menjalankan lokal

1. Salin `.env.example` menjadi `.env`.
2. Isi `MONGODB_URI` dan ganti `JWT_ACCESS_SECRET` dengan secret acak yang panjang.
3. Jalankan `npm install`.
4. Jalankan `npm run start:dev`.

API tersedia di `http://localhost:3000/api/v1`. Swagger tersedia di
`http://localhost:3000/api/docs` jika `SWAGGER_ENABLED=true`.

## Modul MVP

- `auth`: login JWT dan profil pengguna.
- `users`: pengelolaan pengguna oleh admin.
- `locations`: lokasi dengan soft delete.
- `apar`: inventaris APAR, pencarian, pagination, dan status operasional.
- `health`: liveness dan readiness check.

Akun pengguna tidak dapat didaftarkan secara publik. Akun admin awal dapat
dibuat melalui script provisioning setelah database dikonfigurasi:

```powershell
$env:ADMIN_EMAIL = "aparrspura@gmail.com"
$env:ADMIN_PASSWORD = "aparrspura123"
$env:ADMIN_EMPLOYEE_ID = "adminapar"
$env:ADMIN_FULL_NAME = "Admin APAR"
npm run provision:admin
```

Script membaca `MONGODB_URI` dari `.env`, melakukan hash password dengan
Argon2, dan menolak pembuatan jika email atau employee ID sudah terdaftar.
Environment variable kredensial hanya berlaku untuk sesi terminal tersebut
dan tidak disimpan ke source code.

## Validasi

```bash
npm run build
npm test -- --runInBand
```

## Deployment ke Vercel

Backend sudah menyediakan entrypoint serverless pada `api/index.ts` dan
konfigurasi pada `vercel.json`. Di Vercel, import repository GitHub lalu atur
**Root Directory** ke `backend` (jika repository berisi frontend dan backend).
Gunakan pengaturan berikut:

- Build Command: `npm run build`
- Framework Preset: `Other`
- Node.js Version: `22.x`

Tambahkan environment variable berikut di Vercel untuk Production, Preview, dan
Development sesuai kebutuhan:

```text
MONGODB_URI=<connection-string-MongoDB-Atlas>
JWT_ACCESS_SECRET=<secret-acak-panjang>
FRONTEND_ORIGINS=https://<domain-frontend-vercel>
API_PREFIX=api/v1
SWAGGER_ENABLED=false
```

Setelah deployment selesai, API dapat diuji melalui:

```text
https://<domain-backend-vercel>/api/v1/health
```

Jangan mengunggah `.env` ke GitHub. Nilai environment production harus
dimasukkan melalui menu **Project Settings > Environment Variables** di Vercel.
