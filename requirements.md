# Requirements Backend --- APAR Check

## 1. Ringkasan Proyek

**APAR Check** adalah REST API untuk aplikasi pemeriksaan dan monitoring
Alat Pemadam Api Ringan (APAR). Backend menangani autentikasi admin,
data petugas, inventaris APAR, formulir dan hasil pemeriksaan, foto
bukti, jadwal pemeriksaan, tindak lanjut temuan, notifikasi, dashboard,
dan laporan.

Dokumen ini menjadi spesifikasi awal implementasi backend. Detail
endpoint, aturan keselamatan, dan struktur data perlu dikonfirmasi
bersama pemilik aplikasi dan tim frontend sebelum dianggap sebagai
kontrak API final.

## 2. Tech Stack

-   **Framework:** NestJS.
-   **Bahasa:** TypeScript dengan strict mode.
-   **Runtime:** Node.js versi LTS yang kompatibel dengan versi NestJS.
-   **Database:** MongoDB Atlas.
-   **ODM:** Mongoose melalui `@nestjs/mongoose` dan `mongoose`.
-   **Dokumentasi API:** Swagger / OpenAPI menggunakan
    `@nestjs/swagger`.
-   **Validasi request:** `class-validator` dan `class-transformer`.
-   **Autentikasi:** Passport, `@nestjs/passport`, dan JWT melalui
    `@nestjs/jwt` serta `passport-jwt`.
-   **Password hashing:** `argon2` atau `bcrypt`; pilih satu dan gunakan
    secara konsisten.
-   **Upload file:** Mulai dengan `FileInterceptor` dari
    `@nestjs/platform-express` dan `multer`; penyimpanan permanen
    menggunakan object storage yang ditentukan saat implementasi.
-   **Konfigurasi:** `@nestjs/config`.
-   **Keamanan HTTP:** `helmet` dan konfigurasi CORS.
-   **Logging:** NestJS Logger; solusi logging terstruktur dapat
    ditambahkan bila dibutuhkan.
-   **Testing:** Jest, Supertest, dan test database terisolasi.
-   **Deployment:** Penyedia hosting Node.js yang mendukung aplikasi
    NestJS. Frontend dapat di-deploy terpisah di Vercel.

### Dokumentasi API yang dimaksud

Tool dokumentasi backend yang kemungkinan pernah digunakan adalah
**Swagger dengan OpenAPI melalui `@nestjs/swagger`**. Swagger
menyediakan halaman dokumentasi interaktif, biasanya di `/api/docs`,
yang menampilkan endpoint, skema request/response, dan cara mencoba API.
Gunakan OpenAPI sebagai kontrak antara backend dan frontend.

## 3. Instalasi Proyek

Buat proyek NestJS:

``` bash
npm i -g @nestjs/cli
nest new apar-check-backend
cd apar-check-backend
```

Instal dependensi utama:

``` bash
npm install @nestjs/config @nestjs/mongoose mongoose
npm install class-validator class-transformer
npm install @nestjs/swagger
npm install @nestjs/passport passport passport-jwt @nestjs/jwt
npm install helmet
npm install argon2
```

Instal tipe dan alat pengujian tambahan bila diperlukan:

``` bash
npm install -D @types/passport-jwt
npm install -D supertest
npm install -D @types/supertest
```

NestJS biasanya sudah menyediakan Jest dan konfigurasi testing pada
proyek awal. Periksa `package.json` sebelum memasang ulang dependensi
yang sudah tersedia.

Jika menggunakan upload file lokal sementara:

``` bash
npm install multer
npm install -D @types/multer
```

File lokal hanya cocok untuk lingkungan pengembangan atau storage
sementara. Untuk deployment, gunakan penyimpanan file persisten yang
sesuai dan jangan mengandalkan filesystem container sebagai storage
permanen.

## 4. Environment Variables

Buat `.env.example`:

``` dotenv
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1
FRONTEND_ORIGIN=http://localhost:5173

MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority

JWT_ACCESS_SECRET=replace-with-a-long-random-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=replace-with-another-long-random-secret
JWT_REFRESH_EXPIRES_IN=7d

UPLOAD_MAX_FILE_SIZE_MB=5
UPLOAD_ALLOWED_MIME_TYPES=image/jpeg,image/png,image/webp

SWAGGER_ENABLED=true
```

Ketentuan keamanan: - Jangan commit file `.env` atau memasukkan secret
ke repository. - Jangan menggunakan placeholder secret pada
production. - Simpan credential MongoDB Atlas dan JWT secret pada
environment/secret manager platform deployment. - Batasi IP/network
access MongoDB Atlas sesuai lingkungan deployment. - Buat database user
dengan hak minimum yang diperlukan. - Pastikan password database
di-URL-encode bila mengandung karakter khusus. - Jangan mengekspos
secret melalui endpoint atau log.

## 5. Struktur Direktori

Gunakan modular architecture NestJS agar fitur dapat dikembangkan secara
terpisah.

``` text
apar-check-backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── common/
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── pipes/
│   │   ├── enums/
│   │   └── utils/
│   ├── config/
│   ├── auth/
│   ├── users/
│   ├── locations/
│   ├── apar/
│   ├── checklist-templates/
│   ├── inspections/
│   ├── schedules/
│   ├── corrective-actions/
│   ├── notifications/
│   ├── dashboard/
│   ├── reports/
│   └── health/
├── test/
├── .env.example
├── .gitignore
├── nest-cli.json
├── package.json
├── tsconfig.json
└── requirements.md
```

Setiap module yang relevan sebaiknya memiliki controller, service, DTO,
schema/model, dan test. Hindari menaruh seluruh logika aplikasi dalam
satu controller.

## 6. Konfigurasi Aplikasi

`main.ts` harus: - Memuat konfigurasi melalui `ConfigModule`. -
Mengaktifkan global validation pipe. - Mengatur prefix API dari
environment, misalnya `/api/v1`. - Mengaktifkan CORS hanya untuk origin
frontend yang diizinkan. - Mengaktifkan Helmet. - Mendaftarkan Swagger
jika diaktifkan oleh konfigurasi. - Mengatur batas payload dan upload
secara wajar. - Menggunakan port dari environment. - Menangani shutdown
dengan baik.

Validasi global yang direkomendasikan:

``` ts
new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
});
```

Gunakan DTO untuk request masuk. Jangan menerima object database mentah
langsung dari request pengguna.

## 7. Modul dan Fitur Backend

### 7.1 Authentication (`auth`)

Fitur: - Login administrator/pengguna terdaftar. - Mengambil profil
pengguna yang sedang login. - Logout atau pencabutan sesi sesuai
strategi token. - Refresh token bila strategi refresh token digunakan. -
Lupa/reset password bila mekanisme email atau proses administratif
tersedia. - Guard autentikasi dan role-based authorization.

Persyaratan: - Password di-hash menggunakan Argon2 atau bcrypt. - Jangan
pernah menyimpan atau mengembalikan password dalam bentuk plaintext. -
JWT access token memiliki masa berlaku yang terbatas. - Jika refresh
token digunakan, tentukan mekanisme penyimpanan, rotasi, dan
pencabutannya. - Jangan membuat endpoint registrasi admin publik. - Akun
awal admin dibuat melalui seed/script atau proses provisioning yang
aman. - Respons login tidak boleh membocorkan apakah username atau
password tertentu yang salah secara berlebihan. - Lindungi login dari
percobaan berulang dengan rate limiting pada lapisan aplikasi atau
infrastruktur.

Contoh endpoint: - `POST /api/v1/auth/login` -
`POST /api/v1/auth/refresh` (jika digunakan) -
`POST /api/v1/auth/logout` - `GET /api/v1/auth/me` -
`POST /api/v1/auth/forgot-password` (jika disetujui) -
`POST /api/v1/auth/reset-password` (jika disetujui)

### 7.2 Users (`users`)

Fitur: - Daftar pengguna dengan pagination. - Detail pengguna. - Membuat
pengguna. - Memperbarui profil dan status akun. - Mengaktifkan atau
menonaktifkan akun. - Menetapkan role sesuai kewenangan. - Melihat
aktivitas pemeriksaan milik petugas.

Role awal: - `admin`: pengelolaan sistem sesuai kebijakan. -
`inspector`: mengirim pemeriksaan sesuai kewenangan. - `viewer`: hanya
membaca data yang diizinkan, jika diperlukan.

Contoh endpoint: - `GET /api/v1/users` - `POST /api/v1/users` -
`GET /api/v1/users/:id` - `PATCH /api/v1/users/:id` -
`PATCH /api/v1/users/:id/status` - `GET /api/v1/users/:id/inspections`

Semua endpoint pengelolaan pengguna harus dibatasi dengan autentikasi
dan role yang sesuai.

### 7.3 Locations (`locations`)

Menyimpan struktur lokasi seperti gedung, lantai, departemen, ruangan,
atau area.

Field yang disarankan: - `name` - `code` - `parentId` untuk struktur
bertingkat, jika diperlukan - `description` - `isActive` - `createdAt` -
`updatedAt`

Contoh endpoint: - `GET /api/v1/locations` - `POST /api/v1/locations` -
`GET /api/v1/locations/:id` - `PATCH /api/v1/locations/:id` -
`DELETE /api/v1/locations/:id` hanya jika aman dan tidak merusak
referensi historis

Gunakan soft delete/nonaktifkan lokasi jika sudah dipakai oleh data
pemeriksaan.

### 7.4 APAR Inventory (`apar`)

Fitur: - CRUD inventaris APAR. - Pencarian berdasarkan kode, tipe,
merek, dan lokasi. - Filter berdasarkan kondisi, status operasional, dan
jadwal. - Detail APAR dan riwayat pemeriksaan. - Mencatat tanggal
instalasi, tanggal servis atau kedaluwarsa jika relevan. - Menyimpan
tanggal pemeriksaan terakhir dan jadwal berikutnya berdasarkan aturan
yang disepakati.

Field yang disarankan: - `code` (unik dan wajib) - `type` - `brand` -
`capacity` - `serialNumber` - `locationId` - `specificLocation` -
`installedAt` - `serviceDueAt` atau tanggal relevan lainnya bila
digunakan - `inspectionIntervalDays` atau konfigurasi jadwal yang
disepakati - `operationalStatus` - `photoUrl` atau referensi file -
`notes` - `isActive` - `createdAt` - `updatedAt`

Contoh endpoint: - `GET /api/v1/apar` - `POST /api/v1/apar` -
`GET /api/v1/apar/:id` - `PATCH /api/v1/apar/:id` -
`PATCH /api/v1/apar/:id/status` - `GET /api/v1/apar/:id/inspections` -
`GET /api/v1/apar/:id/summary`

Ketentuan: - Kode APAR harus unik. - Validasi referensi lokasi. - Jangan
menghapus permanen aset yang telah memiliki riwayat; gunakan
penonaktifan atau soft delete. - Status kondisi terbaru harus konsisten
dengan pemeriksaan terakhir yang valid, kecuali ada proses koreksi yang
tercatat.

### 7.5 Checklist Templates (`checklist-templates`)

Fitur: - Menyediakan daftar kategori dan pertanyaan pemeriksaan. -
Mengelompokkan pertanyaan berdasarkan kondisi fisik, tekanan/kesiapan,
penempatan, dan dokumentasi. - Mengatur opsi jawaban dan apakah
catatan/foto diwajibkan untuk jawaban tertentu. - Mendukung variasi
checklist berdasarkan jenis APAR bila dibutuhkan. - Menyimpan versi
checklist.

Field yang disarankan: - `name` - `aparTypes` - `version` - `sections` -
`questions` - `answerOptions` - `requiresNotesFor` -
`requiresPhotoFor` - `isActive` - `effectiveFrom` - `createdAt` -
`updatedAt`

Contoh endpoint: - `GET /api/v1/checklist-templates` -
`GET /api/v1/checklist-templates/:id` -
`POST /api/v1/checklist-templates` (admin) -
`PATCH /api/v1/checklist-templates/:id` (admin)

Hasil pemeriksaan harus menyimpan snapshot pertanyaan/versi checklist
yang digunakan saat inspeksi dilakukan, sehingga perubahan checklist di
masa depan tidak mengubah interpretasi data historis.

### 7.6 Inspections (`inspections`)

Fitur: - Membuat pemeriksaan. - Menyimpan draft jika fitur draft
disepakati. - Mengirim hasil pemeriksaan. - Mengambil daftar pemeriksaan
dengan pagination, sorting, dan filter. - Melihat detail pemeriksaan. -
Menampilkan riwayat pemeriksaan per APAR dan per petugas. - Menyimpan
jawaban checklist, catatan, foto, temuan, dan rekomendasi. - Menyimpan
audit informasi untuk perubahan administratif yang diizinkan.

Informasi pemeriksaan: - Nomor referensi unik, misalnya
`INS-2026-0001`. - APAR yang diperiksa. - Identitas petugas. - Tanggal
dan waktu pemeriksaan. - Lokasi saat pemeriksaan. - Versi checklist. -
Jawaban setiap pertanyaan. - Foto bukti. - Catatan dan temuan. - Kondisi
keseluruhan. - Rekomendasi. - Waktu submit. - Pembuat dan waktu
pembuatan/perubahan.

Contoh endpoint: - `POST /api/v1/inspections` -
`GET /api/v1/inspections` - `GET /api/v1/inspections/:id` -
`PATCH /api/v1/inspections/:id` hanya untuk draft atau koreksi yang
diizinkan - `POST /api/v1/inspections/:id/submit` -
`GET /api/v1/inspections/:id/print-data` -
`GET /api/v1/inspections/by-apar/:aparId` -
`GET /api/v1/inspections/by-user/:userId`

Ketentuan: - Nomor referensi harus dibuat server-side dan unik. -
Hindari double submit; gunakan idempotency key atau mekanisme lain bila
diperlukan. - Pemeriksaan yang sudah dikirim tidak boleh diam-diam
ditimpa. - Koreksi hasil yang telah dikirim harus dibatasi, divalidasi,
dan tercatat dalam audit log. - Snapshot data APAR dan checklist saat
pemeriksaan dapat disimpan bila diperlukan untuk menjaga konteks
historis. - Validasi bahwa APAR aktif dan dapat diperiksa sesuai
kebijakan. - Pastikan tanggal dan waktu disimpan dengan format
konsisten, disarankan UTC pada database dan dikonversi untuk tampilan
lokal.

### 7.7 Aturan hasil pemeriksaan

Kondisi APAR: - `good` --- Baik. - `needs_repair` --- Perlu Perbaikan. -
`damaged` --- Rusak. - `not_inspected` --- Belum Diperiksa.

Pilihan jawaban checklist: - `good` - `needs_repair` - `damaged` -
`not_applicable` jika diperbolehkan oleh template.

Ketentuan: - Kondisi keseluruhan dihitung atau divalidasi di backend
berdasarkan aturan yang disetujui. - Temuan kritis tidak boleh tertutupi
oleh banyak jawaban baik. - Jangan hanya menghitung jumlah jawaban baik
untuk menentukan kondisi akhir. - Simpan alasan atau temuan yang
menyebabkan kondisi keseluruhan. - Kriteria teknis dan batas kritis
harus divalidasi pihak keselamatan dan standar yang berlaku, bukan
ditentukan sepihak oleh implementasi software. - Hasil digital bukan
sertifikasi bahwa APAR memenuhi semua persyaratan keselamatan atau
hukum.

### 7.8 Schedules (`schedules`)

Fitur: - Membuat dan mengubah jadwal pemeriksaan. - Melihat kalender dan
daftar jadwal. - Menentukan petugas jika penugasan digunakan. -
Mengidentifikasi jadwal yang mendekati jatuh tempo atau terlambat. -
Menandai jadwal selesai hanya setelah pemeriksaan terkait tercatat.

Status: - `scheduled` - `due_soon` - `overdue` - `completed`

Contoh endpoint: - `GET /api/v1/schedules` - `POST /api/v1/schedules` -
`GET /api/v1/schedules/:id` - `PATCH /api/v1/schedules/:id` -
`GET /api/v1/schedules/overdue`

Ketentuan: - Interval pemeriksaan harus dapat dikonfigurasi berdasarkan
kebijakan organisasi dan kebutuhan jenis APAR. - Jangan menganggap semua
APAR mempunyai interval yang sama tanpa persetujuan. - Perhitungan
overdue dilakukan berdasarkan tanggal jatuh tempo yang valid. - Jadwal
tidak otomatis selesai hanya karena tanggalnya telah lewat.

### 7.9 Corrective Actions (`corrective-actions`)

Fitur: - Membuat tindak lanjut dari temuan pemeriksaan. - Menetapkan
prioritas, penanggung jawab, dan tenggat. - Memperbarui status tindak
lanjut. - Menambahkan catatan dan bukti penyelesaian. - Melihat riwayat
perubahan status.

Status: - `open` - `in_progress` - `pending_verification` - `completed`

Prioritas: - `low` - `medium` - `high` - `critical`

Field: - Referensi pemeriksaan. - APAR terkait. - Temuan dan deskripsi
masalah. - Prioritas. - Penanggung jawab. - Target penyelesaian. -
Catatan tindakan. - Referensi foto/bukti. - Status. - Riwayat perubahan.

Contoh endpoint: - `GET /api/v1/corrective-actions` -
`POST /api/v1/corrective-actions` -
`GET /api/v1/corrective-actions/:id` -
`PATCH /api/v1/corrective-actions/:id` -
`POST /api/v1/corrective-actions/:id/evidence` -
`PATCH /api/v1/corrective-actions/:id/status`

Perubahan status dan penyelesaian harus memeriksa role pengguna dan
dicatat.

### 7.10 Dashboard (`dashboard`)

Sediakan endpoint ringkasan untuk mengurangi kebutuhan frontend
menggabungkan banyak request.

Contoh: - `GET /api/v1/dashboard/summary` -
`GET /api/v1/dashboard/inspection-trends` -
`GET /api/v1/dashboard/condition-distribution` -
`GET /api/v1/dashboard/inspections-by-location` -
`GET /api/v1/dashboard/recent-inspections` -
`GET /api/v1/dashboard/attention-required`

Ringkasan yang dibutuhkan: - Total APAR terdaftar. - Total pemeriksaan
pada periode tertentu. - APAR dengan kondisi baik. - APAR perlu
perbaikan. - APAR rusak/kritis. - APAR belum diperiksa sesuai definisi
periode. - Jadwal terlambat. - Tindak lanjut yang belum selesai. -
Grafik aktivitas pemeriksaan. - Distribusi kondisi APAR. - Pemeriksaan
berdasarkan lokasi.

Ketentuan: - Semua angka harus berasal dari query yang konsisten. -
Dukung filter rentang tanggal dan lokasi bila dibutuhkan. - Definisikan
secara jelas apakah metrik menghitung aset unik, event pemeriksaan, atau
jadwal. - Hindari menghitung jumlah pemeriksaan sebagai jumlah APAR. -
Gunakan index dan aggregation MongoDB yang sesuai untuk dataset yang
bertumbuh.

### 7.11 Reports (`reports`)

Fitur: - Membuat ringkasan laporan berdasarkan periode. - Memfilter
berdasarkan lokasi, jenis APAR, kondisi, petugas, dan status tindak
lanjut. - Menyediakan data untuk laporan detail pemeriksaan. -
Mengekspor PDF/Excel jika disetujui dan implementasinya tersedia.

Contoh endpoint: - `GET /api/v1/reports/summary` -
`GET /api/v1/reports/inspections` -
`GET /api/v1/reports/inspections/:id` -
`GET /api/v1/reports/export?format=pdf` -
`GET /api/v1/reports/export?format=xlsx`

Ketentuan: - Validasi format ekspor yang diperbolehkan. - Terapkan batas
tanggal dan pagination untuk laporan besar. - Jangan membuat endpoint
ekspor yang mengembalikan file bila fitur ekspor belum
diimplementasikan. - Tetapkan apakah file dihasilkan oleh backend atau
frontend; untuk laporan besar, backend umumnya lebih tepat.

### 7.12 Notifications (`notifications`)

Fitur: - Notifikasi jadwal mendekati jatuh tempo. - Notifikasi jadwal
terlambat. - Temuan rusak/kritis. - Tindak lanjut mendekati/melewati
tenggat. - Penandaan telah dibaca.

Contoh endpoint: - `GET /api/v1/notifications` -
`PATCH /api/v1/notifications/:id/read` -
`PATCH /api/v1/notifications/read-all`

Pengiriman email/WhatsApp merupakan fitur opsional dan memerlukan
provider serta konfigurasi terpisah. Jangan mengklaim notifikasi
eksternal tersedia sebelum integrasinya dibuat.

### 7.13 File Upload

Backend harus mendukung upload foto bukti pemeriksaan sesuai keputusan
penyimpanan file.

Persyaratan: - Validasi MIME type dan ukuran file. - Buat nama file yang
aman dan unik. - Jangan mempercayai nama file yang dikirim pengguna. -
Simpan metadata file dan referensi storage. - Batasi tipe file yang
diperbolehkan. - Tangani kegagalan upload dan pembersihan file yatim. -
Periksa izin akses file dan jangan membuat data sensitif dapat diakses
publik tanpa kebijakan yang jelas.

Penyimpanan file permanen harus ditentukan secara terpisah. MongoDB
Atlas digunakan untuk data aplikasi; jangan menganggap database sebagai
tempat ideal untuk semua file gambar besar. Pilih object storage yang
disetujui organisasi, lalu simpan URL/key dan metadata di MongoDB.

### 7.14 Health (`health`)

Sediakan endpoint untuk health check aplikasi dan koneksi database.

Contoh: - `GET /api/v1/health` - `GET /api/v1/health/ready`

Jangan mengembalikan URI database, secret, atau informasi internal yang
sensitif pada respons health check.

## 8. Rancangan Schema MongoDB

Gunakan Mongoose schema dengan validasi, timestamps, dan index yang
sesuai.

Collection yang disarankan: - `users` - `locations` - `apar_assets` -
`checklist_templates` - `inspections` - `inspection_schedules` -
`corrective_actions` - `notifications` - `audit_logs`

Pertimbangan: - Gunakan ObjectId untuk referensi antardokumen. -
Tambahkan `createdAt` dan `updatedAt`. - Gunakan enum atau validasi
schema untuk status. - Buat unique index untuk kode APAR, username/email
yang relevan, dan nomor referensi pemeriksaan. - Index tanggal
pemeriksaan, APAR, lokasi, status, dan field yang sering difilter. -
Gunakan pagination untuk daftar. - Hindari populate/aggregation
berlebihan yang membuat dashboard lambat. - Pilih embedded document
untuk jawaban checklist yang memang bagian dari satu pemeriksaan, tetapi
pertimbangkan ukuran dokumen dan kebutuhan query. - Gunakan soft
delete/nonaktifkan aset untuk menjaga referensi historis. - Definisikan
strategi backup dan pemulihan database. - Jangan menyimpan data yang
tidak diperlukan.

### Contoh bentuk dokumen inspeksi

``` ts
{
  _id: ObjectId,
  referenceNumber: "INS-2026-0001",
  aparId: ObjectId,
  aparSnapshot: {
    code: "APAR-GDG-A-001",
    type: "dry_chemical_powder",
    locationName: "Gedung A - Lantai 1"
  },
  inspectorId: ObjectId,
  inspectorSnapshot: {
    fullName: "Budi Santoso",
    employeeId: "EMP-001"
  },
  inspectionDate: ISODate,
  checklistTemplateId: ObjectId,
  checklistVersion: 1,
  results: [
    {
      questionId: "physical-condition-01",
      questionSnapshot: "Kondisi fisik tabung",
      answer: "good",
      notes: null,
      photoKeys: []
    }
  ],
  overallCondition: "good",
  findings: [],
  recommendations: [],
  status: "submitted",
  submittedAt: ISODate,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

Contoh tersebut adalah ilustrasi struktur, bukan schema final.

## 9. Pagination, Filter, dan Format Respons

Daftar endpoint harus mendukung parameter yang relevan, misalnya:

``` text
?page=1&limit=20&search=APAR-GDG-A&condition=needs_repair
&locationId=<id>&startDate=2026-10-01&endDate=2026-10-31
```

Validasi: - `page` minimal 1. - `limit` memiliki batas maksimum yang
wajar. - Sorting hanya menerima field yang diizinkan. - Tanggal
divalidasi dan memiliki zona waktu yang konsisten. - Filter status harus
menggunakan enum yang dikenal.

Format respons sukses yang disarankan:

``` json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

Format detail dapat mengembalikan objek pada `data`, dengan bentuk akhir
yang disepakati frontend.

Format error yang konsisten:

``` json
{
  "statusCode": 400,
  "message": "Validasi request gagal",
  "error": "Bad Request",
  "details": [
    {
      "field": "code",
      "messages": ["Kode APAR wajib diisi"]
    }
  ],
  "timestamp": "2026-10-14T00:00:00.000Z",
  "path": "/api/v1/apar"
}
```

Jangan mengembalikan stack trace atau detail internal pada production.

## 10. Dokumentasi Swagger / OpenAPI

Gunakan `@nestjs/swagger` sebagai tool dokumentasi API.

Kebutuhan: - Dokumentasi tersedia di `/api/docs` saat diaktifkan. - API
memiliki judul, deskripsi, dan versi. - Endpoint dikelompokkan
menggunakan tag per module. - DTO menggunakan `@ApiProperty` dan
`@ApiPropertyOptional`. - Endpoint dilengkapi `@ApiOperation`,
`@ApiResponse`, dan dokumentasi status error. - Skema autentikasi
Bearer/JWT didokumentasikan jika digunakan. - Request body, query
parameters, path parameters, pagination, dan contoh respons
dijelaskan. - Dokumentasi tidak menampilkan secret atau data pribadi
nyata. - Swagger dapat dinonaktifkan atau dibatasi pada production
sesuai kebijakan keamanan.

Contoh konfigurasi awal pada `main.ts`:

``` ts
const config = new DocumentBuilder()
  .setTitle('APAR Check API')
  .setDescription('REST API untuk pemeriksaan dan monitoring APAR')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

Gunakan contoh ini sebagai referensi; sesuaikan dengan prefix global dan
kebijakan akses dokumentasi yang diterapkan.

## 11. Validasi dan Error Handling

-   Gunakan DTO untuk semua body/query/parameter yang memerlukan
    validasi.
-   Gunakan `class-validator` dan `class-transformer`.
-   Terapkan `ValidationPipe` secara global.
-   Gunakan exception filter atau pola respons error yang konsisten.
-   Gunakan status HTTP yang sesuai: 200, 201, 204, 400, 401, 403, 404,
    409, 413, 422 jika digunakan, 429, dan 500.
-   Tangani MongoDB duplicate key sebagai konflik yang dapat dipahami
    pengguna.
-   Bedakan data tidak ditemukan, tidak memiliki izin, dan request tidak
    valid.
-   Jangan membocorkan stack trace, query database, atau credential ke
    respons API.
-   Validasi file upload secara server-side.

## 12. Keamanan

-   Hash password menggunakan Argon2 atau bcrypt.
-   Terapkan JWT expiry dan kebijakan refresh/revocation yang jelas.
-   Lindungi route dengan `AuthGuard` dan role/permission guard.
-   Validasi otorisasi pada setiap operasi yang mengakses atau mengubah
    data.
-   Aktifkan Helmet.
-   Konfigurasikan CORS hanya untuk origin yang diperlukan.
-   Terapkan rate limiting, khususnya untuk login, upload, dan endpoint
    publik.
-   Batasi ukuran body dan file.
-   Gunakan HTTPS pada deployment.
-   Sanitasi dan validasi semua input.
-   Jangan mempercayai ID user, role, atau kondisi APAR yang dikirim
    klien tanpa pemeriksaan.
-   Simpan audit trail untuk perubahan penting.
-   Gunakan least privilege untuk database dan storage.
-   Hindari hard delete terhadap data inspeksi yang menjadi bukti
    historis.
-   Tetapkan kebijakan retensi dan akses data bersama organisasi.

## 13. Audit Trail

Catat perubahan penting, seperti: - Pembuatan atau perubahan aset
APAR. - Pengiriman hasil inspeksi. - Koreksi inspeksi yang sudah
dikirim. - Perubahan jadwal. - Perubahan status tindak lanjut. -
Perubahan role dan status pengguna. - Perubahan checklist.

Informasi audit yang disarankan: - Actor/user ID. - Action. - Resource
type dan ID. - Timestamp. - Ringkasan perubahan sebelum/sesudah bila
diperlukan. - Correlation/request ID.

Jangan mencatat password, JWT, token refresh, atau data sensitif yang
tidak diperlukan.

## 14. Testing

### Unit tests

-   Auth service dan password hashing.
-   Role/permission guards.
-   Validasi DTO.
-   Penentuan status hasil pemeriksaan.
-   Validasi jadwal jatuh tempo.
-   Pembuatan nomor referensi unik.
-   Penanganan duplicate key.
-   Perhitungan dashboard.

### Integration tests

-   Koneksi database test.
-   CRUD APAR.
-   Pengiriman inspeksi.
-   Riwayat inspeksi.
-   Pembuatan dan penyelesaian tindak lanjut.
-   Filter dan pagination.
-   Upload file.
-   Autentikasi dan otorisasi.

### End-to-end tests

1.  Login dengan akun valid dan invalid.
2.  Admin membuat APAR.
3.  Petugas yang berwenang mengirim inspeksi.
4.  Backend memvalidasi jawaban dan kondisi hasil.
5.  Detail inspeksi dapat diambil kembali.
6.  Dashboard menampilkan agregasi yang konsisten.
7.  Jadwal terlambat teridentifikasi sesuai aturan.
8.  Tindak lanjut dapat dibuat dan statusnya diperbarui.
9.  Pengguna tanpa izin mendapat respons 401/403 yang tepat.
10. Swagger menampilkan kontrak API yang sesuai implementasi.

Gunakan database test terpisah, bukan database production.

## 15. Deployment dan Operasional

-   Build TypeScript sebelum deployment.
-   Jalankan aplikasi menggunakan command production yang sesuai.
-   Konfigurasi environment variables pada platform hosting.
-   Izinkan koneksi dari backend ke MongoDB Atlas dengan network access
    yang dibatasi.
-   Gunakan HTTPS.
-   Pastikan `FRONTEND_ORIGIN` sesuai domain frontend Vercel yang
    diizinkan.
-   Gunakan health check.
-   Pantau log dan error tanpa mencatat secret.
-   Siapkan backup dan prosedur pemulihan MongoDB Atlas.
-   Dokumentasikan proses migration/perubahan schema bila diperlukan.
-   Jangan mengandalkan file lokal container untuk penyimpanan permanen.
-   Simpan API base URL frontend dan URL backend sesuai environment
    deployment.
-   Uji CORS dan upload pada environment staging sebelum production.

## 16. Kriteria Penerimaan

Backend dapat dianggap siap untuk integrasi awal jika: - Proyek NestJS
menggunakan TypeScript strict. - MongoDB Atlas terhubung melalui
konfigurasi environment. - Swagger/OpenAPI tersedia sesuai
konfigurasi. - Modul auth, users, locations, apar, inspections,
schedules, corrective-actions, dashboard, reports, dan health telah
disiapkan. - DTO dan validasi request digunakan. - Route yang dibatasi
memerlukan autentikasi dan otorisasi. - APAR memiliki kode unik. -
Inspeksi memiliki nomor referensi unik dan menyimpan snapshot
checklist. - Kondisi keseluruhan ditentukan dengan aturan yang disetujui
dan divalidasi server-side. - Riwayat pemeriksaan tidak dapat ditimpa
diam-diam. - Endpoint daftar mendukung pagination dan filter yang
disepakati. - Upload file tervalidasi dan menggunakan storage yang
sesuai. - Respons sukses dan error konsisten. - Tidak ada secret di
repository. - Unit/integration/e2e test utama berjalan. - Endpoint dan
model data didokumentasikan untuk frontend. - Tidak ada klaim bahwa
fitur yang belum diimplementasikan sudah aktif.

## 17. Hal yang Harus Dikonfirmasi

Sebelum implementasi final, konfirmasikan: - Apakah petugas harus login
atau boleh mengirim pemeriksaan melalui halaman publik? - Field
identitas mana yang wajib? - Apakah inventaris APAR akan dimasukkan
terlebih dahulu oleh admin? - Aturan kondisi keseluruhan dan temuan
kritis. - Checklist khusus untuk masing-masing jenis APAR. - Siapa yang
boleh mengoreksi inspeksi setelah dikirim. - Interval inspeksi dan
aturan penentuan overdue. - Pilihan penyimpanan foto permanen. - Apakah
PDF/Excel dihasilkan backend. - Apakah notifikasi memerlukan email atau
WhatsApp. - Strategi autentikasi dan penyimpanan token yang akan
digunakan frontend. - Retensi data, audit, backup, dan hak akses. -
Kontrak API final, nama field, enum, pagination, dan format error
bersama tim frontend.

Gunakan konfigurasi sementara yang ditandai jelas untuk keputusan yang
belum disetujui. Kriteria teknis pemeriksaan APAR harus dikonfirmasi
oleh pihak keselamatan yang berwenang dan mengikuti peraturan/petunjuk
produsen yang relevan.
