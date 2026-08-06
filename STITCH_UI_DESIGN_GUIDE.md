# Panduan UI/UX Design System & Wireframe Blueprint untuk Stitch (Enterprise Attendance & ERP Ecosystem)

Dokumen ini berisi spesifikasi desain UI/UX, komponen layout, palet warna, tipografi, dan struktur hierarki layar untuk **Enterprise Smart Attendance & ERP Ecosystem** yang dirancang agar dapat langsung dirender dan diimplementasikan di **Stitch** atau platform prototyping modern lainnya.

---

## 1. Design Tokens & Global Style Guide

### A. Color Palette (Sophisticated Light Theme with Professional Accents)
- **Primary / Dominant:** Deep Navy / Indigo (`#1E293B` text / `#0F172A` headers)
- **Brand Accent:** Emerald Green (`#059669` for presence / success) & Amber Warmth (`#D97706` for late status)
- **Background Canvas:** Off-White / Soft Slate (`#F8FAFC`)
- **Card / Surface Container:** Pure White (`#FFFFFF`) with ultra-subtle border (`#E2E8F0`)
- **Text Primary:** Slate 900 (`#0F172A`)
- **Text Secondary:** Slate 500 (`#64748B`)
- **Border Radius Rule:** 
  - Outer Container: `12px` to `16px`
  - Inner Buttons/Pills: `8px` to `9999px` (fully rounded)
  - *No heavy shadows or neon gradients.* Strict flat corporate elevation with 1px border.

### B. Typography (Modern Sans-Serif Hierarchy)
- **Display Headings:** Plus Jakarta Sans / Inter (Bold, 600–700 weight, tight line-height `1.2`)
- **Body Text:** Inter (Regular 400, 15px/16px, line-height `1.5` to `1.7`)
- **Badges & Tags:** JetBrains Mono or Inter Medium (Uppercase, tracking wider, 10-12px)

---

## 2. Layout Architecture & Screen Blueprints (Stitch Ready)

Aplikasi dibangun dengan layout **Single-View Dashboard Ecosystem** yang terbagi menjadi beberapa tab fungsional utama:

### A. Dashboard Utama (Realtime Monitoring)
- **Header Section:**
  - App Branding: "Enterprise Smart Attendance Ecosystem"
  - Quick Filter Bar: Unit (SD/SMP/SMA/SMK), Tahun Ajaran, Semester, Tanggal.
- **KPI Grid (4 Cards Row):**
  - Hadir (`#059669` indicator)
  - Terlambat (`#D97706` indicator)
  - Izin / Sakit (`#3B82F6` indicator)
  - Alpha / Belum Hadir (`#EF4444` indicator)
- **Realtime Chart & Activity Log Widget:**
  - Grafik distribusi kehadiran harian per jam.
  - Tabel live stream kehadiran terbaru (Nama, Role [Siswa/Santri/Guru/Pegawai], Waktu, Metode [GPS / QR / Barcode / Smart Card], Status).

### B. Dynamic QR & Security Check-In Screen
- **Live QR Code Generator Box:**
  - Tampilan QR Code pusat dengan hitung mundur masa berlaku (timer 30 detik / 1 menit).
  - Indikator status keamanan enkripsi (UUID + Signature + Expired Time aktif).
- **Scanner Interface / Manual Approval Card:**
  - Form verifikasi manual absensi dengan dropdown alasan wajib, status (Pending, Approved, Rejected) yang langsung terhubung ke RBAC.

### C. Late Policy & Geofence Rule Engine
- **Konfigurasi Aturan:**
  - Tabel pengaturan Jam Masuk, Jam Pulang, Grace Period, dan Sanksi Terlambat per Unit / Role / Shift.
  - Peta / Radius Geofencing GPS sekolah interaktif.

---

## 3. Komponen UI Siap Pakai untuk Stitch (JSON / Markdown Layout Spec)

Berikut adalah struktur komponen hierarki untuk dirender di Stitch:

```json
{
  "screen_name": "EnterpriseAttendanceDashboard",
  "layout": "responsive_flex_container",
  "background": "#F8FAFC",
  "padding": "24px",
  "components": [
    {
      "type": "TopNavigationBar",
      "title": "Smart Attendance & Security Hub",
      "subtitle": "Realtime Enterprise Attendance Engine with RBAC & Geofencing",
      "actions": ["FilterButton", "ExportPdfButton", "RefreshLiveStream"]
    },
    {
      "type": "KpiGrid",
      "columns": 4,
      "items": [
        { "label": "Total Hadir", "value": "1,245", "trend": "+98%", "color": "emerald" },
        { "label": "Terlambat", "value": "32", "trend": "-4%", "color": "amber" },
        { "label": "Izin / Sakit", "value": "18", "trend": "Stable", "color": "blue" },
        { "label": "Belum Absen", "value": "12", "trend": "Pending", "color": "rose" }
      ]
    },
    {
      "type": "TabNavigationMenu",
      "tabs": [
        "Live Dashboard",
        "Dynamic QR & Security",
        "Manual Approval",
        "Late Policy Rules",
        "Geofence & Device Logs"
      ]
    },
    {
      "type": "DataTableView",
      "title": "Live Attendance Audit Log",
      "searchable": true,
      "pagination": true,
      "columns": ["Nama & NIP/NIS", "Role & Unit", "Waktu Check-In", "Metode", "Status Kehadiran", "Aksi"]
    }
  ]
}
```

---

## 4. Panduan Eksekusi di Stitch
1. Salin spesifikasi token warna dan tipografi di atas ke dalam pengaturan tema Stitch.
2. Gunakan struktur layout `EnterpriseAttendanceDashboard` untuk membangun tampilan utama.
3. Hubungkan setiap tombol aksi (seperti *Check-In*, *Approve Leave*, *Generate Dynamic QR*) ke endpoint REST API backend ERP yang telah tersedia.
