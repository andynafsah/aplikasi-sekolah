# Arsitektur Sistem (Enterprise Clean Architecture)
# ARCHITECTURE.md

Version : 3.0.0
Status : Production / Documentation
Last Updated : 2026-07-07

Dokumen ini menjelaskan struktur arsitektur perangkat lunak, pola desain, dan alur data dari aplikasi **Enterprise ERP Pesantren**. Kami menggabungkan prinsip **Clean Architecture** (Robert C. Martin) dengan **Domain-Driven Design (DDD)** untuk memisahkan domain inti bisnis dari detail teknis (framework, database, library eksternal).

---

## 📌 PRINSIP UTAMA ARSITEKTUR
1.  **Independen Terhadap Framework:** Kerangka kerja bisnis inti (`domain` & `application`) tidak bergantung pada pustaka eksternal seperti Express, Fastify, Prisma, atau Axios. Komponen eksternal dapat diganti kapan saja tanpa menyentuh aturan bisnis pesantren.
2.  **Ketergantungan Satu Arah (Inward Dependency Rule):** Ketergantungan kode hanya boleh mengarah ke dalam. Layer luar boleh mengetahui layer dalam, namun layer dalam dilarang keras mengetahui atau mengimpor kode dari layer luar.
3.  **Domain-Driven Design (DDD):** Kode dikelompokkan berdasarkan konteks domain bisnis (`modules/`) bukan berdasarkan tipe berkas teknis. Aturan bisnis dimodelkan secara eksplisit dalam Entitas dan Kasus Penggunaan (Use Case).
4.  **Dependency Injection (DI):** Instansiasi kelas diatur secara terpusat oleh wadah DI (`di.ts`). Hal ini mengeliminasi keterikatan langsung (tight coupling) antar modul dan menyederhanakan proses penulisan mock-test.

---

## 🗺️ LAYER STRUKTUR SISTEM

Arsitektur aplikasi terbagi menjadi 5 lingkaran konsentris (layer) utama yang didefinisikan sebagai berikut:

```
        ┌──────────────────────────────────────────────┐
        │                 PRESENTATION                 │  <-- Router, Controller, API Dispatcher
        │   ┌──────────────────────────────────────┐   │
        │   │            INFRASTRUCTURE            │  <-- API Client, Database Connection Pool
        │   │   ┌──────────────────────────────┐   │   │
        │   │   │         APPLICATION          │   │   │  <-- Service, DTO, Schema Validator
        │   │   │   ┌──────────────────────┐   │   │   │
        │   │   │   │        DOMAIN        │   │   │   │  <-- Entity Base, Repository Interface
        │   │   │   │   ┌──────────────┐   │   │   │   │
        │   │   │   │   │     CORE     │   │   │   │   │  <-- Logger, Environment, DI Container
        │   │   │   │   └──────────────┘   │   │   │   │
        │   │   │   └──────────────────────┘   │   │   │
        │   │   └──────────────────────────────┘   │   │
        │   └──────────────────────────────────────┘   │
        └──────────────────────────────────────────────┘
```

### 1. Core Layer (`src/core/`)
Layer terdalam yang menangani utilitas dasar sistem yang melintasi semua domain (cross-cutting concerns).
*   **Environment Validator (`environment.ts`):** Memvalidasi keberadaan dan tipe data variabel lingkungan (.env) menggunakan skema Zod secara ketat sebelum server aktif.
*   **Unified Error Handler (`error-handler.ts`):** Mengelola standardisasi exception. Memetakan error operasional ke respon HTTP JSON yang konsisten.
*   **Structured Logger (`logger.ts`):** Sistem pencatatan log modular untuk merekam performa aplikasi dan jejak audit.
*   **DI Container (`di.ts`):** Registrasi objek modular runtime untuk kebutuhan penguraian dependensi otomatis.

### 2. Domain Layer (`src/domain/`)
Layer murni aturan bisnis enterprise. Berisi cetak biru entitas bisnis dan kontrak repositori.
*   **Base Entity (`entity.base.ts`):** Kelas dasar untuk semua entitas yang memiliki siklus hidup identitas unik, status multi-tenancy, dan pencatatan audit modifikasi waktu (`createdAt`, `updatedAt`).
*   **Repository Contract (`repository.interface.ts`):** Kontrak antarmuka generik (`IBaseRepository`) untuk menjamin semua modul memiliki operasi CRUD dan pencarian data yang standar.

### 3. Application Layer (`src/application/`)
Mengatur orkestrasi alur data, validasi skema input, dan struktur pemindahan data (DTO).
*   **Base Service (`service.base.ts`):** Menyediakan kerangka eksekusi transaksi database yang aman dan pelaporan log otomatis.
*   **Base Validator (`validator.base.ts`):** Mesin validasi data masukan berbasis Zod.
*   **Base DTO (`dto.base.ts`):** Struktur respon standar API (`IApiResponse`) dan paginasi data.

### 4. Infrastructure Layer (`src/infrastructure/`)
Menjembatani domain bisnis dengan pustaka eksternal, sistem file, dan server database.
*   **API Client (`api-client.ts`):** Konfigurasi global Axios yang mengotomasi pengiriman token otorisasi Bearer dan header `X-Tenant-ID` ke server API eksternal.
*   **Database Pools:** Manajemen koneksi aman ke engine MySQL.

### 5. Presentation Layer (`src/presentation/`)
Layer terluar yang menerima request dari luar dan menyajikan respon kepada client.
*   **Base Controller (`controller.base.ts`):** Kelas abstrak untuk menangani validasi masukan request dan pembungkusan data respon.
*   **Custom Router (`router.ts`):** Mesin routing backend kustom yang memproses pipeline middleware secara serial, pencocokan ekspresi reguler (regex), dan pembacaan parameter rute.
*   **Centralized Routes (`routes.ts`):** Pendaftaran terpusat seluruh rute API.

---

## 🔄 ALUR EKSEKUSI DATA (DATA FLOW)

Berikut adalah ilustrasi alur eksekusi sebuah request HTTP (misalnya pembuatan santri baru) dari client hingga tersimpan ke database:

```
[Client App] ---> (HTTP POST /api/v1/students)
                     │
                     ▼
             [Presentation Layer]
                     │
                     ├─► [Router] (Mencocokkan rute & menjalankan Middleware)
                     ├─► [Middleware] (Memvalidasi JWT, Otorisasi RBAC, Membaca Tenant ID)
                     └─► [StudentController] (Memanggil Validator skema Zod)
                           │
                           ▼
                   [Application Layer]
                           │
                           └─► [StudentService] (Menjalankan logika bisnis, hitung iuran, dll.)
                                 │
                                 ▼
                         [Domain Layer]
                                 │
                                 ├─► [StudentEntity] (Melakukan validasi internal bisnis murni)
                                 └─► [IStudentRepository] (Memanggil kontrak antarmuka)
                                       │
                                       ▼
                             [Infrastructure Layer]
                                       │
                                       └─► [StudentRepositoryImpl] (Implementasi nyata query Prisma / MySQL)
                                             │
                                             ▼
                                      [MySQL Database]
```

---

## 🏢 MULTI-TENANCY ISOLATION POLICY
Aplikasi ini beroperasi menggunakan pendekatan **Shared Database, Shared Schema** dengan pemisahan baris (*logical row-level isolation*).
*   Setiap tabel database wajib memiliki kolom `tenant_id`.
*   Di sisi Frontend, header `X-Tenant-ID` secara otomatis disuntikkan oleh `api-client.ts` berdasarkan domain atau pilihan instansi pengguna.
*   Di sisi Backend, middleware gateway mengekstrak header tersebut, memvalidasinya, dan menyematkannya ke dalam konteks request (`req.tenantId`).
*   Semua metode di kelas `BaseRepository` mewajibkan parameter `tenantId` dan secara otomatis menyuntikkan filter pencarian `where tenant_id = tenantId` untuk memastikan data antar pesantren tidak pernah bocor ke pesantren lain.
