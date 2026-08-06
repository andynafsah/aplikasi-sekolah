# REST API CONTRACT SPECIFICATION
# docs/api-contracts.md

Seluruh endpoint REST API menggunakan format JSON untuk komunikasi data bolak-balik dengan **React Web Frontend** dan **Flutter Mobile Client**. Endpoint diproteksi oleh middleware autentikasi JWT Bearer Token dan Role-Based Access Control (RBAC).

---

## 🔑 1. AUTHENTICATION MODULE (`/api/v1/auth`)

### POST `/api/v1/auth/login`
Menerima kredensial pengguna untuk membuat sesi baru.
*   **Payload (JSON)**:
    ```json
    {
      "username": "admin@enterprise.com",
      "password": "admin123",
      "rememberMe": true
    }
    ```
*   **Response (JSON)**:
    ```json
    {
      "success": true,
      "message": "Login successful",
      "data": {
        "accessToken": "eyJhbGciOi...",
        "refreshToken": "eyJhbGciOi...",
        "expiresIn": 900,
        "user": {
          "id": "usr-88273",
          "name": "Super Admin",
          "username": "superadmin",
          "role": "SUPER_ADMIN",
          "photo": "/uploads/profiles/usr-88273.jpg"
        },
        "menus": [
          { "id": "dashboard", "title": "Dashboard", "path": "/dashboard", "icon": "LayoutDashboard" },
          { "id": "students", "title": "Kesiswaan", "path": "/students", "icon": "Users" }
        ]
      }
    }
    ```

### POST `/api/v1/auth/refresh`
Menyegarkan Access Token yang telah kedaluwarsa.
*   **Payload (JSON)**:
    ```json
    {
      "refreshToken": "eyJhbGciOi..."
    }
    ```
*   **Response (JSON)**:
    ```json
    {
      "success": true,
      "data": {
        "accessToken": "eyJhbGciOi...",
        "expiresIn": 900
      }
    }
    ```

### GET `/api/v1/auth/sessions`
Mendapatkan daftar perangkat yang sedang masuk (Session Management).
*   **Headers**: `Authorization: Bearer <accessToken>`
*   **Response (JSON)**:
    ```json
    {
      "success": true,
      "data": [
        { "id": "sess-01", "userAgent": "Mozilla/5.0... Chrome/120.0", "ip": "110.10.2.4", "lastActive": "2026-07-15T13:00:00Z", "isCurrent": true },
        { "id": "sess-02", "userAgent": "Flutter Client (iPhone 15 Pro)", "ip": "114.22.45.10", "lastActive": "2026-07-15T12:45:00Z", "isCurrent": false }
      ]
    }
    ```

### POST `/api/v1/auth/logout`
Mencabut Refresh Token sesi saat ini.

### POST `/api/v1/auth/logout-all`
Mencabut seluruh Refresh Token yang diasosiasikan dengan pengguna (Logout All Devices).

---

## 🎓 2. STUDENT MODULE (`/api/v1/students`)

*   **GET `/api/v1/students`**: List data siswa (mendukung pencarian, paginasi, filter kelas, gender, dan status_santri).
*   **GET `/api/v1/students/:id`**: Detail biodata siswa lengkap, riwayat kelas, dan data orang tua.
*   **POST `/api/v1/students`**: Tambah siswa baru (Validasi NIK, NISN wajib di sisi backend).
*   **PUT `/api/v1/students/:id`**: Perbarui data siswa.
*   **DELETE `/api/v1/students/:id`**: Soft-delete data siswa.

---

## 👨‍🏫 3. TEACHER MODULE (`/api/v1/teachers`)

*   **GET `/api/v1/teachers`**: List data pendidik, bidang studi diampu, status sertifikasi.
*   **POST `/api/v1/teachers`**: Daftarkan guru baru.
*   **PUT `/api/v1/teachers/:id`**: Update profil pendidik.
*   **GET `/api/v1/teachers/:id/card`**: Generate ID Card Guru berbentuk PDF biner dengan QR Code personal terintegrasi.

---

## 💼 4. EMPLOYEE MODULE (`/api/v1/employees`)

*   **GET `/api/v1/employees`**: List data staf non-kependidikan (TU, Bendahara, Pegawai Kebersihan).
*   **POST `/api/v1/employees`**: Rekrut data pegawai baru.

---

## 💵 5. FINANCE MODULE (`/api/v1/finance`)

*   **GET `/api/v1/finance/cashbook`**: Arus Kas Masuk & Keluar sekolah (Buku Kas Umum).
*   **POST `/api/v1/finance/transactions`**: Catat pengeluaran operasional (seperti pembelian ATK, listrik, perawatan asrama) dengan upload bukti fisik (PDF/JPG).
*   **GET `/api/v1/finance/summary`**: Rekap neraca saldo keuangan yayasan, realisasi anggaran sekolah, sisa piutang.

---

## 📝 6. SPP MODULE (`/api/v1/finance/spp`)

*   **GET `/api/v1/finance/spp/payments`**: Daftar riwayat pembayaran SPP per siswa.
*   **GET `/api/v1/finance/spp/bills/:studentId`**: Informasi tagihan SPP berjalan dan sisa tunggakan akumulasi.
*   **POST `/api/v1/finance/spp/pay`**: Catat transaksi pembayaran SPP baru (Tunai / Transfer).
    *   *System Action*: Mengubah sisa piutang, mencatat ke Buku Kas Umum, memicu notifikasi WhatsApp struk ke Wali Santri, dan mengembalikan PDF Slip Pembayaran.

---

## 📅 7. ATTENDANCE MODULE (`/api/v1/attendance`)

*   **GET `/api/v1/attendance`**: Rekap absensi siswa & guru harian.
*   **POST `/api/v1/attendance/register`**: Submit absensi (Hadit, Izin, Sakit, Alpa) per kelas.
*   **POST `/api/v1/attendance/sync`**: Endpoint khusus rekonsiliasi data presensi offline dari Flutter (SQLite SQLite Cache Sync Broker).

---

## 💸 8. PAYROLL MODULE (`/api/v1/payroll`)

*   **GET `/api/v1/payroll/slips`**: Riwayat penggajian guru & karyawan.
*   **POST `/api/v1/payroll/generate`**: Hitung otomatis gaji bulanan berdasarkan komponen gaji pokok, tunjangan wali kelas, potongan absensi, dll.
*   **GET `/api/v1/payroll/slips/:id`**: Unduh Slip Gaji PDF biner resmi dengan Tanda Tangan Digital Kepala Sekolah.

---

## 🎫 9. PPDB MODULE (`/api/v1/ppdb`)

*   **GET `/api/v1/ppdb/applicants`**: List pendaftar calon siswa baru.
*   **POST `/api/v1/ppdb/register`**: Formulir registrasi PPDB mandiri.
*   **POST `/api/v1/ppdb/verify/:id`**: Validasi kelengkapan berkas fisik calon siswa (Status: DITERIMA / DITOLAK).

---

## 📦 10. INVENTORY MODULE (`/api/v1/inventory`)

*   **GET `/api/v1/inventory/items`**: Daftar sarana & prasarana sekolah, lokasi (kamar asrama, kelas, TU), kondisi barang.
*   **POST `/api/v1/inventory/items`**: Daftarkan pengadaan barang inventaris baru.
*   **GET `/api/v1/inventory/items/:id/barcode`**: Generate label barcode Code128 PDF siap cetak untuk pelabelan barang.

---

## 📄 11. DOCUMENT MODULE (`/api/v1/documents`)

*   **GET `/api/v1/documents`**: Surat keputusan, arsip digital, surat masuk & keluar sekolah.
*   **POST `/api/v1/documents/surat`**: Buat surat baru berdasarkan template sistem.
*   **POST `/api/v1/documents/upload`**: Upload dokumen fisik kearsipan (File diunggah ke storage, path tercatat di database).

---

## 🔔 12. NOTIFICATION MODULE (`/api/v1/notifications`)

*   **GET `/api/v1/notifications`**: Log daftar pengumuman & notifikasi yang dikirimkan.
*   **POST `/api/v1/notifications/push`**: Kirim pengumuman instan massal (FCM) ke seluruh mobile client Flutter.
*   **POST `/api/v1/notifications/whatsapp`**: Kirim pesan manual/otomatis menggunakan WhatsApp API Gateway.

---

## 📊 13. REPORT MODULE (`/api/v1/reports`)

*   **GET `/api/v1/reports/leger/:classId`**: Download Leger nilai kelas berformat Excel (ExcelJS).
*   **GET `/api/v1/reports/raport/:studentId`**: Download Rapor akademis siswa berformat PDF resmi.

---

## 🤖 14. AI MODULE (`/api/v1/ai`)

*   **POST `/api/v1/ai/generate-summary`**: Menganalisis grafik performa nilai ujian kelas atau grafik profitabilitas keuangan menggunakan model Gemini API.
*   **POST `/api/v1/ai/dapodik-ocr`**: Mengekstrak data gambar KK / Ijazah calon siswa baru PPDB menggunakan multimodal AI (Gemini Flash OCR) untuk mempercepat pengisian data di form kesiswaan.

---

## ⚙️ 15. SETTINGS MODULE (`/api/v1/settings`)

*   **GET `/api/v1/settings`**: Konfigurasi instansi sekolah, tahun ajaran aktif, semester, nomor rekening pembayaran SPP, template surat kustom, WhatsApp API Keys, dan SMTP credentials.
*   **PUT `/api/v1/settings`**: Perbarui setelan konfigurasi global sistem sekolah.
