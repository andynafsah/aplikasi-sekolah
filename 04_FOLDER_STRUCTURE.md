# BLUEPRINT STRUKTUR FOLDER
# 04_FOLDER_STRUCTURE.md

Version : 3.0.0
Status : Production / Blueprint
Last Updated : 2026-07-07

---

## 📌 PRINSIP DASAR
Arsitektur ini didesain menggunakan kombinasi **Clean Architecture** dan **Domain-Driven Design (DDD)** untuk menjamin pemisahan tanggung jawab yang bersih (*separation of concerns*), skalabilitas tinggi, pengujian yang mudah, dan kemudahan bagi pengembang.

Setiap file di dalam `/src` harus ditempatkan sesuai dengan layer arsitekturnya. Tidak diperkenankan membuat folder root baru di dalam `/src` di luar daftar yang sudah disepakati di bawah ini.

---

## 📂 STRUKTUR DIREKTORI UTAMA (`src/`)

```bash
src/
├── core/            # Cross-cutting concerns (logger, environment, error-handling)
├── domain/          # Pure Enterprise Business Rules & Contracts (Entities, Repository Interfaces)
├── application/     # Application Use Cases & Helpers (Base Services, Validators, DTOs)
├── infrastructure/  # Low-level external tools implementation (Database pools, API clients, storage)
├── presentation/    # Delivery mechanisms (HTTP Controller base, Router engines, API dispatchers)
├── modules/         # Feature-based business contexts / domains (Auth, Akademik, Keuangan, dsb)
├── shared/          # Reusable shared UI components, helpers, and assets across modules
├── config/          # Static compile-time/runtime configuration and constants
├── providers/       # Integrations with external third-party SDKs & services
├── types/           # Global, shared TypeScript type and interface declarations
├── utils/           # Pure helper functions without business state
├── hooks/           # Custom React Hook abstractions
└── assets/          # Static resources such as images, icons, and local styles
```

---

## 🔍 PENJELASAN LAYER & TANGGUNG JAWAB

### 1. `core/` (Pusat Konfigurasi & Utilitas Sistem)
*   **Tanggung Jawab:** Menangani operasi sistem dasar dan penanganan kesalahan lintas modul (*cross-cutting concerns*). Layer ini tidak memiliki ketergantungan ke layer lainnya.
*   **File Utama:**
    *   `environment.ts`: Validasi variabel lingkungan menggunakan `zod` secara ketat.
    *   `logger.ts`: Sistem pencatatan log dengan dukungan level keparahan (*severities*) dan penyiaran *event stream*.
    *   `error-handler.ts`: Manajemen exception terpusat untuk memetakan error operasional ke respon API standar.

### 2. `domain/` (Aturan Bisnis Inti / Enterprise Rules)
*   **Tanggung Jawab:** Menyimpan logika bisnis murni dan kontrak data. Layer ini sama sekali terbebas dari library eksternal (seperti Express, Prisma, atau Axios) dan framework UI.
*   **File Utama:**
    *   `entity.base.ts`: Base class untuk Entitas DDD yang memiliki identitas unik, penanda multi-tenancy, dan fungsi pembantu serialisasi.
    *   `repository.interface.ts`: Kontrak antarmuka generik (`IBaseRepository`) untuk operasi manipulasi database.

### 3. `application/` (Kasus Penggunaan / Application Use Cases)
*   **Tanggung Jawab:** Mengoordinasikan alur data dari dan ke entitas domain. Berisi base class layanan bisnis, validator skema input, dan objek transfer data (DTO).
*   **File Utama:**
    *   `service.base.ts`: Wrapper eksekusi aman yang menangani logger otomatis dan pengamanan transaksi database.
    *   `validator.base.ts`: Mesin validasi input berbasis skema Zod.
    *   `dto.base.ts`: Standarisasi struktur respon API (`IApiResponse`) dan paginasi data.

### 4. `infrastructure/` (Implementasi Alat Rendah / Low-level Tools)
*   **Tanggung Jawab:** Menyediakan implementasi nyata dari kontrak domain (misalnya koneksi database, integrasi sistem file, dsb).
*   **File Utama:**
    *   `api-client.ts`: Instansi global Axios yang secara otomatis menyuntikkan token otorisasi Bearer dan identitas penyewa (`X-Tenant-ID`) melalui request interceptor.

### 5. `presentation/` (Mekanisme Pengiriman / Delivery Mechanisms)
*   **Tanggung Jawab:** Mengatur bagaimana data disajikan ke luar atau bagaimana request eksternal diterima (Web/HTTP Router, Controllers, format JSON).
*   **File Utama:**
    *   `controller.base.ts`: Controller abstrak untuk standarisasi format output data dan isolasi exception penanganan request.
    *   `router.ts`: Router kustom yang memproses pipeline middleware, pencocokan regex rute, dan parsing parameter.
    *   `routes.ts`: Tempat registrasi terpusat seluruh endpoint aplikasi dengan middleware chaining.

### 6. `modules/` (Modul Domain Fungsional / Domain Modules)
*   **Tanggung Jawab:** Menyimpan fitur-fitur fungsional mandiri yang mengelompokkan controller, service, dan repository ke dalam domain bisnis spesifik (misalnya: `auth`, `siswa`, `keuangan`, dll.).
*   **File Utama:**
    *   `auth.skeleton.ts`: Logika otentikasi sesi, pembuatan JWT simulasi, verifikasi peran (RBAC), dan penyelesaian multi-tenancy.

### 7. `shared/` (Komponen & Utilitas Bersama)
*   **Tanggung Jawab:** Menyimpan elemen UI, layout, atau utilitas visual yang dapat digunakan berulang kali di berbagai modul (misal: tombol, tabel dasar, modal konfirmasi, tata letak panel).

### 8. `config/` (Konfigurasi Aplikasi)
*   **Tanggung Jawab:** Menyimpan konstanta statis, daftar rute navigasi menu, peta warna tema, atau setelan aplikasi yang bersifat deklaratif.

### 9. `providers/` (Penyedia Layanan Eksternal)
*   **Tanggung Jawab:** Menyimpan adapter dan integrasi dengan SDK atau API pihak ketiga, seperti Firebase, Google Workspace SDK, sistem pembayaran, dsb.

### 10. `types/` (Definisi Tipe TypeScript)
*   **Tanggung Jawab:** Deklarasi tipe data global, antarmuka entitas generik, dan tipe kustom TypeScript lainnya yang dibagikan ke seluruh aplikasi.

### 11. `utils/` (Helper Fungsi Murni)
*   **Tanggung Jawab:** Menyimpan fungsi-fungsi utilitas murni (*pure helper functions*) tanpa state bisnis (misal: generator string acak, kalkulasi persentase, pemotong teks).

### 12. `hooks/` (React Custom Hooks)
*   **Tanggung Jawab:** Menyimpan React hooks kustom untuk modularisasi efek samping (*side-effects*), siklus hidup komponen, atau manipulasi state UI yang kompleks.

### 13. `assets/` (Aset Statis)
*   **Tanggung Jawab:** Tempat penyimpanan media statis seperti berkas gambar SVG/PNG, ikon visual, suara notifikasi, dan file CSS global (`index.css`).

---

## ⚠️ ATURAN DAN DISIPLIN STRUKTUR

1.  **Dilarang Keras Membuat Folder Root Baru:** Semua modul dan file fungsional baru harus masuk ke dalam salah satu folder dari daftar di atas.
2.  **Ketergantungan Aliran Satu Arah:** Layer bawah tidak boleh mengimpor sesuatu dari layer atas. Sebagai contoh, file di dalam `domain/` dilarang keras mengimpor kode dari `application/` atau `presentation/`.
3.  **Gaya Penamaan File:**
    *   Gunakan **PascalCase** untuk penamaan berkas `Class`, `Controller`, `Service`, dan `Repository`.
    *   Gunakan **camelCase** untuk penamaan variabel, fungsi murni, utilitas, dan custom hooks.
    *   Gunakan **kebab-case** untuk penamaan folder komponen UI bersama.
