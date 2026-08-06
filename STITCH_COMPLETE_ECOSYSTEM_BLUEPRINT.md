# Blueprint Lengkap Stitch: Enterprise Attendance & ERP Ecosystem (Login, Role Dashboard, Siswa/Santri, Karyawan & QR Scanner)

Dokumen ini adalah cetak biru (blueprint) terpadu untuk diimpor ke **Stitch** atau platform prototyping, menggabungkan seluruh alur dari **Login Otentikasi**, **Dashboard Dinamis berdasarkan Peran (RBAC)**, **Absensi Mandiri (Siswa/Santri & Karyawan)**, hingga **Fitur Scan QR Code oleh Wali Kelas** yang terhubung langsung ke REST API Backend Enterprise ERP.

---

## 1. Arsitektur & Alur Navigasi Aplikasi (Navigation Flow)

```
[ Splash / Auth Gate ]
        │
        ├──> [ Login Screen ] (POST /api/v1/auth/login)
        │         │
        │         ├── (Token & Role Validated) ──┐
        │                                        │
        ▼                                        ▼
[ Superadmin / Admin Dashboard ]       [ Guru / Wali Kelas Dashboard ]
  - Rekapitulasi Kehadiran Institusi     - Presensi Kelas & Jurnal KBM
  - Konfigurasi Late Policy & Geofence   - Scan QR Code Siswa (Kamera)
  - Realtime Audit Log & Reports         - Input Tahfidz & Izin Siswa
        │                                        │
        ▼                                        ▼
[ Pegawai / Karyawan Dashboard ]       [ Siswa / Santri & Orang Tua ]
  - Absensi GPS & Riwayat Masuk          - Status Kehadiran Personal
  - Slip Gaji & Cuti                     - Tagihan SPP & Jadwal Pelajaran
```

---

## 2. Spesifikasi REST API Endpoint Backend

Seluruh endpoint terpusat di Base URL:
`https://ais-dev-cuu72c5niw56xr2fibir2x-217257253856.asia-east1.run.app`

1. **Login Autentikasi:**
   - **Endpoint:** `POST /api/v1/auth/login`
   - **Payload:** `{"email": "...", "password": "...", "tenant_id": "tenant-1"}`
   - **Response:** Mengembalikan `token` JWT dan objek `user` (`id`, `name`, `role`, `tenant_id`).

2. **Rekapitulasi Kehadiran (Dashboard):**
   - **Endpoint:** `POST /api/attendance/getAttendances`
   - **Headers:** `Authorization: Bearer <TOKEN>`
   - **Payload:** `{"tenant_id": "tenant-1"}`
   - **Response:** Daftar lengkap catatan kehadiran seluruh sivitas.

3. **Check-In Mandiri (GPS / Karyawan / Siswa):**
   - **Endpoint:** `POST /api/attendance/checkIn`
   - **Headers:** `Authorization: Bearer <TOKEN>`
   - **Payload:** `{"tenant_id": "tenant-1", "personId": "...", "type": "MASUK", "status": "HADIR", "lat": -6.2088, "lng": 106.8456, "deviceOs": "Android 14", "details": "GPS Checkin"}`

4. **Smart Attendance Scan (QR Wali Kelas):**
   - **Endpoint:** `POST /api/attendance/smartAttendance`
   - **Headers:** `Authorization: Bearer <TOKEN>`
   - **Payload:** `{"tenant_id": "tenant-1", "qr_payload": "UUID-SIGNATURE", "personId": "std-1"}`

---

## 3. Stitch JSON Wireframe / Component Specification

Berikut adalah spesifikasi JSON struktur komponen untuk dirender langsung di Stitch:

```json
{
  "project_name": "Enterprise Attendance & ERP Ecosystem",
  "theme": {
    "primary_color": "#1E293B",
    "accent_color": "#059669",
    "warning_color": "#D97706",
    "background_color": "#F8FAFC",
    "font_family": "Inter / Plus Jakarta Sans"
  },
  "screens": [
    {
      "name": "LoginScreen",
      "route": "/login",
      "elements": [
        { "type": "Heading", "text": "ERP Enterprise Login" },
        { "type": "TextField", "id": "email", "label": "Email / NIP / NIS" },
        { "type": "TextField", "id": "password", "label": "Password", "obscure": true },
        { "type": "Button", "label": "Masuk ke Sistem", "action": "POST /api/v1/auth/login" }
      ]
    },
    {
      "name": "RoleDashboardScreen",
      "route": "/dashboard",
      "elements": [
        { "type": "WelcomeBanner", "display": "User Name & Role Badge" },
        { "type": "KpiGrid", "metrics": ["Total Hadir", "Terlambat", "Izin/Sakit", "Alpha"] },
        { "type": "QuickActionRow", "actions": ["Absen GPS Mandiri", "Scan QR Siswa", "Riwayat Kehadiran", "Pengajuan Cuti"] },
        { "type": "LiveAuditTable", "dataSource": "POST /api/attendance/getAttendances" }
      ]
    },
    {
      "name": "TeacherQrScannerScreen",
      "route": "/scanner",
      "elements": [
        { "type": "CameraPreview", "provider": "mobile_scanner" },
        { "type": "ScannerOverlay", "guide": "Arahkan kamera ke QR Code Siswa/Santri" },
        { "type": "ApiActionTrigger", "endpoint": "POST /api/attendance/smartAttendance" }
      ]
    }
  ]
}
```

---

## 4. Panduan Implementasi Flutter Terpadu

Gabungkan service dan file yang telah dibuat sebelumnya:
1. `AuthAttendanceService` untuk menangani login dan check-in GPS.
2. `RoleDashboardScreen` untuk merender tampilan dashboard adaptif berdasarkan role (Superadmin, Guru, Pegawai, Siswa/Santri).
3. `TeacherQrScannerScreen` untuk memindai QR code siswa secara real-time oleh wali kelas.

Seluruh backend telah aktif dan terhubung secara *database-driven* tanpa dummy data statis.
