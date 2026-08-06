# MANUAL INSTALASI & ALUR SETUP AWAL (LOCALHOST & PRODUCTION)
# docs/installation-guide.md

Dokumen ini memandu Anda melakukan instalasi sistem sekolah terpadu ini di lingkungan **localhost** dan memahami alur ketika pertama kali dijalankan.

---

## 🚀 ALUR INSTALASI DI LOCALHOST (PENGEMBANGAN)

### Langkah 1: Kloning Repositori & Pemasangan Dependensi
Pastikan komputer lokal Anda sudah terpasang **Node.js v18 - v22** dan **NPM**.
```bash
# Clone repository
git clone https://github.com/akun-anda/enterprise-school.git
cd enterprise-school

# Pasang seluruh dependensi root (Backend & Frontend)
npm install
```

### Langkah 2: Konfigurasi File Lingkungan (`.env`)
Salin file `.env.example` ke `.env` di folder root / backend:
```bash
cp .env.example .env
```
Secara default, jika Anda tidak mengisi konfigurasi database MySQL, sistem akan otomatis berjalan dalam mode **SQLite internal** (`prisma/dev.db`) demi kemudahan uji coba cepat tanpa repot instalasi MySQL terlebih dahulu.

Jika ingin menghubungkan ke database MySQL lokal:
```env
DATABASE_URL="mysql://root:password_anda@127.0.0.1:3306/erp_school"
PORT=3000
NODE_ENV=development
```

### Langkah 3: Inisialisasi Database Prisma
Jalankan migrasi skema tabel Prisma dan masukkan data master awal (Seeder):
```bash
# Sinkronkan skema database
npx prisma db push

# Jalankan seeder master (Membuat peran, hak akses, sekolah dasar, dan akun administrator default)
npx prisma db seed
```

### Langkah 4: Jalankan Server Pengembangan (Vite + Express)
```bash
npm run dev
```
Aplikasi akan aktif dan dapat diakses melalui browser Anda di alamat:
*   **Web Portal**: `http://localhost:3000`
*   **REST API Swagger/Health**: `http://localhost:3000/health`

---

## ❓ PERTANYAAN UMUM SETUP AWAL

### Q1: Saat pertama kali dibuka, tampilan awalnya langsung layar Login atau halaman Setting?
**A1:** Sistem ini dilengkapi dengan **Dynamic Installation Gatekeeper (Sistem Deteksi Sesi Sekolah)**. 

*   **Kasus A (Belum Terinstal / Database Kosong)**:
    Jika database MySQL/SQLite Anda benar-benar baru dan belum terisi (belum ada profil sekolah terdaftar di tabel `School`), backend Express akan mencegat seluruh akses rute halaman dan otomatis mengarahkan browser Anda ke **Halaman First-Run Database Setup UI** (`/first-run-setup`).
    Di sini Anda wajib mengisi:
    1.  Nama sekolah, NPSN, Yayasan, Alamat, dan No. Telp.
    2.  Pendaftaran akun administrator pertama (`super_admin`) berserta password kustom.
    3.  Pilihan muatan database (kosong atau otomatis mengisi mata pelajaran kurikulum merdeka standar).
    Setelah proses setup ini disubmit, backend akan melakukan proses sanitasi database, mengunci status sistem, dan me-redirect Anda ke layar login.

*   **Kasus B (Sudah Terinstal / Database Siap)**:
    Jika database sudah berisi profil sekolah (hasil dari menjalankan `npx prisma db seed` atau setup sebelumnya), browser akan langsung menyajikan **Halaman Login Utama** (`/login`). Anda dapat login menggunakan kredensial hasil seeder default atau yang baru saja Anda daftarkan di halaman setup.

---

## 🔑 KREDENSIAL DEFAULT HASIL SEEDER

Jika Anda menginisialisasi database menggunakan perintah `npx prisma db seed`, akun demo multi-role siap pakai berikut akan didaftarkan otomatis:

| No | Peran (Role) | Username | Email | Password | Hak Akses Utama |
|---|---|---|---|---|---|
| 1 | **SUPER_ADMIN** | `superadmin` | `admin@enterprise.com` | `admin123` | Semua fitur, kelola database, log audit global |
| 2 | **YAYASAN / OWNER** | `yayasan` | `yayasan@enterprise.com` | `admin123` | Dashboard eksekutif, laporan keuangan & log aktivitas |
| 3 | **KEPALA SEKOLAH** | `kepsek` | `kepsek@enterprise.com` | `admin123` | Monitoring akademik, persetujuan anggaran kelas |
| 4 | **TATA USAHA (TU)** | `tu` | `tu@enterprise.com` | `admin123` | Entri kesiswaan, PPDB, inventarisasi sekolah |
| 5 | **BENDAHARA** | `bendahara` | `bendahara`@enterprise.com | `admin123` | Manajemen SPP, slip gaji, buku kas, rekap kuitansi |
| 6 | **GURU** | `guru` | `guru@enterprise.com` | `admin123` | Input nilai harian, input presensi siswa, rincian mengajar |
| 7 | **WALI KELAS** | `walikelas` | `walikelas@enterprise.com` | `admin123` | Pengesahan rapor kelas binaan, tinjau leger nilai |
| 8 | **PEGAWAI** | `karyawan` | `karyawan@enterprise.com` | `admin123` | Mengakses presensi harian staf |
| 9 | **SANTRI / SISWA** | `santri` | `santri@enterprise.com` | `admin123` | Jadwal pelajaran harian, absensi kelas harian, tugas |
| 10| **WALI SANTRI / ORANG TUA**| `walisantri` | `walisantri@enterprise.com` | `admin123` | Meninjau histori tabungan anak, status tunggakan SPP |

*Gunakan salah satu kredensial di atas untuk menguji coba visual antarmuka (UI) dashboard masing-masing peran secara real-time.*
