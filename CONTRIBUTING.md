# Panduan Kontribusi
# CONTRIBUTING.md

Version : 3.0.0
Status : Production / Documentation
Last Updated : 2026-07-07

Kami sangat senang Anda tertarik untuk berkontribusi pada pengembangan **Enterprise ERP Pesantren**! Dokumen ini memuat standar teknis, konvensi penulisan kode, dan workflow kolaborasi yang wajib ditaati oleh seluruh pengembang di tim kami demi menjaga kualitas sistem dan stabilitas arsitektur.

---

## 📌 ALUR PENGEMBANGAN (WORKFLOW)

1.  **Ambil Tiket Pekerjaan:** Selalu pastikan Anda sedang mengerjakan fitur atau perbaikan yang sesuai dengan papan kerja (Jira/GitHub Issues).
2.  **Gunakan Percabangan (Branching) yang Tepat:**
    *   Fitur baru: `feature/nama-fitur` (contoh: `feature/ppdb-online`)
    *   Perbaikan bug: `bugfix/nama-bug` (contoh: `bugfix/spp-not-sync`)
    *   Dokumentasi: `docs/deskripsi-singkat`
    *   Refaktor kode: `refactor/deskripsi`
3.  **Lakukan Sinkronisasi Berkala:** Tarik perubahan terbaru dari branch `master` atau `development` sebelum memulai penulisan kode harian untuk mencegah konflik besar.
4.  **Kirim Pull Request (PR):**
    *   Arahkan PR Anda ke branch `development` (bukan langsung ke `master`).
    *   Sebutkan ID Tiket/Issue terkait di dalam deskripsi PR.
    *   Pastikan build lokal dan proses linter berjalan sukses (`npm run lint` & `npm run build`) sebelum mengajukan penelaahan (review).

---

## 💻 STANDAR PENULISAN KODE (CODE STYLE)

### 1. Gaya Penulisan Bahasa & Tipe Data
*   **Gunakan TypeScript secara ketat.** Hindari penggunaan tipe data `any` kecuali dalam kondisi darurat yang telah disetujui tim arsitek.
*   **Penamaan Variabel & Fungsi:** Gunakan `camelCase` (contoh: `getStudentById`, `isOnline`).
*   **Penamaan Berkas & Kelas:**
    *   Gunakan `PascalCase` untuk kelas utama, controller, service, repository, dan antarmuka UI (contoh: `StudentController.ts`, `AuthService.ts`).
    *   Gunakan `kebab-case` untuk folder komponen visual bersama (contoh: `shared/components/button-primary`).
*   **Impor & Modul:** Tempatkan semua baris `import` di bagian paling atas file. Gunakan impor terstruktur dan hindari impor tipe data bertumpuk jika tidak diperlukan.

### 2. Disiplin Layer (Clean Architecture)
Sesuai blueprint [`04_FOLDER_STRUCTURE.md`](./04_FOLDER_STRUCTURE.md), Anda wajib mematuhi aturan ketergantungan satu arah:
*   `domain/` dilarang mengimpor dari layer manapun di atasnya (`application`, `infrastructure`, `presentation`).
*   `application/` hanya boleh berkomunikasi dengan kontrak antarmuka di `domain/`.
*   Semua dependensi eksternal harus disuntikkan secara dinamis menggunakan **Dependency Injection** (`di.ts`), tidak boleh di-instansiasi langsung di dalam kelas bisnis menggunakan keyword `new`.

---

## 📁 STRUKTUR KOMIT (CONVENTIONAL COMMITS)
Kami menggunakan standar [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) untuk menjaga kerapian riwayat git:

*   `feat: <deskripsi>` - Menambahkan fitur baru (contoh: `feat: implementasi whatsapp notification service`)
*   `fix: <deskripsi>` - Memperbaiki bug (contoh: `fix: perbaikan parsing token expired di middleware`)
*   `docs: <deskripsi>` - Perubahan atau penambahan dokumentasi (contoh: `docs: update panduan instalasi mysql`)
*   `style: <deskripsi>` - Format kode, spasi, titik koma, tanpa perubahan logika bisnis (contoh: `style: linter-cleanup di controller`)
*   `refactor: <deskripsi>` - Refaktor kode tanpa merusak fungsionalitas (contoh: `refactor: optimasi query penarikan data siswa`)
*   `test: <deskripsi>` - Menambahkan atau memperbarui tes (contoh: `test: unit-test auth service`)
*   `chore: <deskripsi>` - Memperbarui konfigurasi build, library, dll (contoh: `chore: update packages ke vite 6.x`)

---

## 🛠️ DATABASE MIGRATION POLICY
Jika Anda melakukan perubahan struktur data di database:
1.  **Dilarang mengubah tabel langsung di server.**
2.  Perbarui berkas skema deklaratif Prisma (`prisma.schema`) atau deklarasi Drizzle schema Anda.
3.  Jalankan perintah migrasi lokal untuk menghasilkan berkas `.sql` migrasi baru.
4.  Tambahkan berkas migrasi `.sql` tersebut ke dalam commit Anda dengan format nama yang terstruktur.
5.  Pastikan perubahan skema tidak merusak data penyewa lain (Multi-tenant safe) dan selalu sertakan kolom `tenant_id` pada tabel baru.

---

## 🧪 PENGUJIAN KODE (TESTING)
*   Tulis unit test untuk setiap service atau utilitas baru yang Anda buat menggunakan Vitest.
*   Cakupan pengujian (test coverage) minimal untuk logika bisnis inti (`domain/` dan `application/`) adalah **80%**.
*   Simulasi pengujian controller dapat menggunakan router internal (`router.ts`) dengan mock request dan response.

---

## 🚨 VERIFIKASI SEBELUM PUSH
Pastikan Anda menjalankan pemeriksaan otomatis ini secara lokal sebelum melakukan push ke repositori jarak jauh:

```bash
# Memeriksa kepatuhan tipe data TypeScript (Linter)
npm run lint

# Menjalankan build produksi untuk memastikan tidak ada kesalahan kompilasi
npm run build
```

Jika terjadi error, segera selesaikan sebelum mengajukan perubahan. Terima kasih atas dedikasi dan kerja keras Anda dalam membangun solusi masa depan pondok pesantren!
