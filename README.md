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
