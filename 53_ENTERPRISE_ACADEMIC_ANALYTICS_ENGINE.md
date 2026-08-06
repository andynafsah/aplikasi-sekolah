# 53_ENTERPRISE_ACADEMIC_ANALYTICS_ENGINE.md

# ENTERPRISE ACADEMIC ANALYTICS ENGINE

Version

Enterprise 1.0

Architecture

Single Tenant

Laravel API / Express

MySQL / SQLite

Prisma ORM

React

Flutter Ready

Status

Production Ready

====================================================================

# OBJECTIVE

Bangun Enterprise Academic Analytics Engine sebagai pusat pengolahan data analitik akademik, kehadiran, prestasi, pelanggaran kedisiplinan, serta keputusan pleno kelulusan dan kenaikan kelas secara real-time.

Seluruh data analitik harus berasal dari kalkulasi dinamis database relasional menggunakan Prisma ORM.

Tidak boleh ada data analitik atau visualisasi statistik yang ditulis secara hardcode atau menggunakan mock data di backend maupun frontend.

Semua metrik dan perhitungan statistik harus langsung terintegrasi dan memengaruhi:

Dashboard Analitik Akademik

↓

Laporan Kinerja Kelas (Leger)

↓

Rekomendasi AI (Predictive Analysis)

↓

Sidang Pleno Kelulusan & Kenaikan

↓

Aplikasi Mobile Wali Santri (Flutter Ready)

====================================================================

# CORE PRINCIPLES

Dynamic Analytics

Database Driven

Statistical Precision

Zero Hardcoded Fallbacks

Zero Mock Data

Real-time Computation

====================================================================

# SYSTEM SCHEMA MODELS

Sistem menggunakan lima tabel utama di database untuk melacak dan mengoptimalkan analitik:

1. GradeStatistic (grade_statistics)
- Menyimpan hasil agregasi nilai per mata pelajaran, kelas, semester, dan tahun akademik.
- Kolom: highest_score, lowest_score, average_score, median_score, mode_score, std_dev, pass_percentage, distribution (JSON string).

2. AttendanceStatistic (attendance_statistics)
- Melacak rekap kehadiran santri secara agregat untuk performa absensi.
- Kolom: hadir, izin, sakit, alfa, terlambat.

3. AchievementStatistic (achievement_statistics)
- Melacak pencapaian prestasi akademik, non-akademik, tahfidz, olimpiade, lomba, dan kejuaraan.
- Kolom: achievement_type, title, grade, organizer.

4. ViolationStatistic (violation_statistics)
- Melacak tingkat pelanggaran kedisiplinan santri beserta bobot poin sanksi.
- Kolom: severity (RINGAN, SEDANG, BERAT), description, points.

5. PromotionResult & GraduationResult
- Menyimpan keputusan pleno resmi untuk kenaikan kelas dan kelulusan angkatan akhir.
- Kolom: student_id, student_name, current_class, target_class, status, notes, average_score, approved_by.

====================================================================

# MATHEMATICAL STATISTICS ALGORITHMS

Sistem menghitung metrik statistik dari data nilai mentah (Raw Scores) menggunakan algoritma berikut:

1. Rata-rata (Mean)
- Total seluruh nilai dibagi dengan jumlah komponen nilai yang terdaftar.

2. Median (Nilai Tengah)
- Mengurutkan himpunan nilai secara menaik (ascending) lalu mengambil nilai tengah.
- Jika genap, mengambil rata-rata dari dua nilai tengah.

3. Modus (Mode)
- Menghitung frekuensi kemunculan setiap nilai unik dan mengambil nilai dengan frekuensi tertinggi.

4. Deviasi Standar (Standard Deviation)
- Mengukur seberapa jauh sebaran data nilai dari nilai rata-rata (mean).
- Menggunakan formula variansi populasi untuk presisi sebaran:
  σ = √[ Σ(xi - μ)² / N ]

5. Persentase Kelulusan (Pass Percentage)
- Persentase siswa yang nilai akhirnya mencapai atau melebihi Kriteria Ketuntasan Minimal (KKM = 75).

====================================================================

# GRADE DISTRIBUTION CATEGORIES

Distribusi nilai dikelompokkan secara dinamis ke dalam 5 rentang performa untuk chart grafik batang:

- Sangat Rendah: Nilai di bawah 60
- Cukup Rendah: Nilai 60 sampai sebelum 70
- Cukup Baik: Nilai 70 sampai sebelum 80
- Baik: Nilai 80 sampai sebelum 90
- Sangat Baik: Nilai 90 ke atas

====================================================================

# PRODUCTION READY API CONTRACT

Endpoint: GET /api/v1/akademik/assessment/dashboard

Format Response JSON Sukses:

```json
{
  "success": true,
  "statistics": {
    "highest": 95,
    "lowest": 65,
    "average": 83.2,
    "median": 84,
    "mode": 85,
    "stdDev": 4.8,
    "passPercentage": 89,
    "distribution": {
      "under_60": 0,
      "from_60_to_70": 3,
      "from_70_to_80": 8,
      "from_80_to_90": 15,
      "above_90": 4
    },
    "promotion_stats": {
      "naik": 8,
      "tinggal": 0,
      "pending": 1
    },
    "graduation_stats": {
      "lulus": 2,
      "tidak_lulus": 0,
      "pending": 0
    }
  },
  "achievements": [
    {
      "id": "...",
      "student_name": "Raihan",
      "achievement_type": "AKADEMIK",
      "title": "Medali Emas Olimpiade Fisika Nasional",
      "grade": "Juara 1",
      "organizer": "Puspresnas Kemdikbud"
    }
  ],
  "violations": [
    {
      "id": "...",
      "student_name": "Farhan Ramadhan",
      "severity": "RINGAN",
      "description": "Terlambat masuk kelas KBM pagi",
      "points": 5
    }
  ],
  "promotions": [],
  "graduations": [],
  "attendance": []
}
```

====================================================================

# SECURITY & AUDIT COMPLIANCE

Setiap pencatatan prestasi, sanksi pelanggaran, kenaikan kelas, dan keputusan lulus pleno wajib melalui:

- Validasi Tenant ID: Menjamin data tidak bocor antar lembaga/sekolah dalam skema multi-school.
- Audit Log: Mencatat identitas Ustadz/Ustadzah atau Admin yang mengubah sanksi poin atau status kelulusan.
- Transactional Safe: Operasi tulis data pleno kenaikan dan kelulusan menggunakan database transaction agar konsisten dan menghindari race-conditions.
