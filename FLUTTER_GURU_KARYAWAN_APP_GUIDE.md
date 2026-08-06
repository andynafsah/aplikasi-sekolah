# Panduan API & Arsitektur App Flutter (Guru & Karyawan)

Dokumen ini menjelaskan daftar endpoint REST API backend yang digunakan untuk pembuatan aplikasi mobile Flutter khusus **Guru** & **Pegawai/Karyawan**.

---

## 1. Modul Autentikasi & Profil (Login Multi-Role)

### 1.1. Login Guru / Pegawai
- **Endpoint**: `POST /api/auth/login`
- **Request Body**:
```json
{
  "emailOrNip": "198203152008",
  "password": "password123",
  "deviceInfo": "Samsung A54 Android 14"
}
```
- **Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "G-002",
    "nip": "198203152008",
    "name": "Ustadz Ahmad Fauzi, S.Pd.",
    "role": "GURU", // "GURU" atau "PEGAWAI" / "KARYAWAN"
    "unit": "SMP IT",
    "email": "ahmad.fauzi@sekolah.sch.id",
    "photoUrl": "https://...",
    "position": "Guru Bahasa Arab & Wali Kelas 8A"
  }
}
```

### 1.2. Get Current Profile
- **Endpoint**: `GET /api/auth/me` (Header: `Authorization: Bearer <token>`)

---

## 2. Modul Presensi & Attendance (Guru & Karyawan)

### 2.1. Ambil Parameter Geofence & Shift Kerja
Gunakan API ini saat app Flutter baru dibuka untuk memvalidasi posisi GPS pengguna dan jadwal shift kerja hari ini.
- **Endpoint**: `POST /api/attendance/getGeofences`
- **Request Body**: `{"tenant_id": "school-main"}`
- **Endpoint Shift**: `POST /api/attendance/getRules`

### 2.2. Do Check-In (Presensi Masuk)
Dukungan metode: `GPS`, `DYNAMIC_QR`, `FACE`, atau `BARCODE`.
- **Endpoint**: `POST /api/attendance/checkIn`
- **Request Body**:
```json
{
  "personId": "G-002",
  "personName": "Ustadz Ahmad Fauzi, S.Pd.",
  "role": "GURU",
  "method": "GPS",
  "latitude": -6.208851,
  "longitude": 106.845620,
  "locationName": "Gedung Rektorat Utama",
  "photoBase64": "data:image/jpeg;base64,...",
  "qrPayload": "DYNAMIC_QR_ABC_123"
}
```

### 2.3. Do Check-Out (Presensi Pulang)
- **Endpoint**: `POST /api/attendance/checkOut`
- **Request Body**:
```json
{
  "attendanceId": "ATT-20260730-0091",
  "personId": "G-002",
  "latitude": -6.208851,
  "longitude": 106.845620,
  "checkOutTime": "15:35"
}
```

### 2.4. Riwayat Presensi Saya (Monthly History)
- **Endpoint**: `POST /api/attendance/myHistory`
- **Request Body**: `{"personId": "G-002", "month": 7, "year": 2026}`

### 2.5. Pengajuan Izin / Cuti / Sakit & Lembur
- **Pengajuan Izin**: `POST /api/attendance/submitLeave`
- **Pengajuan Lembur**: `POST /api/attendance/overtimeRequest`

---

## 3. Modul KBM Guru (Kegiatan Belajar Mengajar)

### 3.1. Jadwal Mengajar Guru Hari Ini & Minggu Ini
Mengambil daftar jam mengajar, mata pelajaran, rincian kelas/rombel, dan lokasi ruangan.
- **Endpoint**: `GET /api/teacher/schedule?teacherId=G-002`
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "scheduleId": "SCH-101",
      "day": "Kamis",
      "timeSlot": "07:30 - 09:00",
      "subjectName": "Bahasa Arab",
      "className": "Kelas 8A",
      "room": "Ruang 204 Gedung SMP",
      "totalStudents": 32,
      "status": "UPCOMING"
    }
  ]
}
```

### 3.2. Presensi Siswa di Kelas (Input oleh Guru)
Guru membuka kelas dan mencatat kehadiran siswa per rombel pada jam pelajaran tersebut.
- **Endpoint**: `POST /api/class/attendance`
- **Request Body**:
```json
{
  "scheduleId": "SCH-101",
  "teacherId": "G-002",
  "classId": "CLS-8A",
  "date": "2026-07-30",
  "attendances": [
    { "studentId": "STD-001", "studentName": "Ahmad Dani", "status": "HADIR" },
    { "studentId": "STD-002", "studentName": "Bilal bin Rabah", "status": "SAKIT", "note": "Surat dokter" },
    { "studentId": "STD-003", "studentName": "Fatimah Zahra", "status": "IZIN" }
  ]
}
```

### 3.3. Input Jurnal KBM & Materi Pembelajaran
Catatan jurnal harian mengajar (materi yang disampaikan, kendala kelas, & tugas).
- **Endpoint**: `POST /api/teacher/journal`
- **Request Body**:
```json
{
  "scheduleId": "SCH-101",
  "teacherId": "G-002",
  "topic": "Bab 3: Nahwu Shorof - Fi'il Madhi & Mudhari",
  "summary": "Siswa diajarkan konjugasi fi'il madhi 14 dhomir dan latihan hafalan tasrif.",
  "assignmentGiven": "Tugas latihan halaman 45 buku paket"
}
```

### 3.4. Klaim / Permintaan Guru Pengganti (Badala)
Bila guru berhalangan/sakit, guru dapat mengajukan guru pengganti melalui aplikasi Flutter.
- **Endpoint**: `POST /api/attendance/assignReplacementTeacher`
- **Request Body**:
```json
{
  "originalTeacherId": "G-002",
  "replacementTeacherId": "G-005",
  "scheduleId": "SCH-101",
  "reason": "Sakit demam, mohon diwakilkan jam ke 1-2 Bahasa Arab"
}
```

---

## 4. Modul Payroll & Slip Gaji (Guru & Karyawan)

### 4.1. Lihat Slip Gaji & Honor Mengajar Bulanan
- **Endpoint**: `GET /api/payroll/myPaystub?employeeId=G-002&month=7&year=2026`
- **Response**:
```json
{
  "success": true,
  "data": {
    "basicSalary": 4500000,
    "teachingHonor": 1200000,
    "overtimePay": 250000,
    "onTimeBonus": 100000,
    "latePenalties": -30000,
    "netSalary": 6020000,
    "paidAt": "2026-07-28"
  }
}
```

---

## 5. Ringkasan Struktur Folder Flutter (`lib/`)

```
lib/
├── models/
│   ├── user_model.dart
│   ├── attendance_model.dart
│   ├── schedule_model.dart
│   └── paystub_model.dart
├── services/
│   ├── auth_service.dart
│   ├── attendance_service.dart
│   ├── kbm_service.dart
│   └── payroll_service.dart
├── views/
│   ├── auth/
│   │   └── login_screen.dart
│   ├── attendance/
│   │   ├── attendance_screen.dart
│   │   ├── gps_checkin_view.dart
│   │   └── qr_scanner_view.dart
│   ├── kbm/
│   │   ├── schedule_view.dart
│   │   ├── student_attendance_view.dart
│   │   └── teaching_journal_view.dart
│   └── profile/
│       ├── profile_screen.dart
│       └── paystub_view.dart
└── main.dart
```
