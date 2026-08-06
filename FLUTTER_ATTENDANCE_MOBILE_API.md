# Flutter Mobile & REST API Integration Guide
## Enterprise Attendance & HR Mobile Gateway

Panduan lengkap dokumentasi REST API untuk integrasi Aplikasi Flutter Mobile (Android & iOS) dengan Backend ERP Sekolah, Pesantren, & Yayasan.

---

## 1. Arsitektur & Ketentuan Umum

- **Base URL**: `https://<domain-app-anda>/api/attendance`
- **Content-Type**: `application/json`
- **Autentikasi**: Bearer JWT Token via Header `Authorization: Bearer <token>`
- **Format Respons Standard**:
```json
{
  "success": true,
  "message": "Pesan status sukses",
  "data": { ... },
  "timestamp": "2026-07-30T07:22:00.000Z"
}
```

---

## 2. Daftar Endpoint REST API Flutter Mobile

### 2.1. Check-In Presensi Mobile (GPS / Dynamic QR / Face / Manual)
Mengirimkan transaksi presensi masuk karyawan, guru, siswa, atau santri.

- **Endpoint**: `POST /api/attendance/checkIn`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>`
- **Request Body**:
```json
{
  "personId": "G-002",
  "personName": "Ustadz Ahmad Fauzi, S.Pd.",
  "role": "GURU",
  "nip": "198203152008",
  "unit": "SMP IT",
  "classOrPosition": "Guru Bahasa Arab",
  "method": "GPS",
  "latitude": -6.208851,
  "longitude": 106.845620,
  "locationName": "Kampus Utama Gedung Rektorat",
  "photoBase64": "data:image/jpeg;base64,...",
  "deviceId": "DEVICE-ANDROID-XYZ-9912",
  "qrPayload": "DYNAMIC_QR_TOKEN_ABC123",
  "shiftCode": "REG-PAGI"
}
```
- **Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Presensi Check-In berhasil dicatat!",
  "data": {
    "attendanceId": "ATT-20260730-0091",
    "status": "HADIR",
    "checkInTime": "06:52",
    "lateMinutes": 0,
    "penaltyDeduction": 0,
    "geofenceVerified": true,
    "isAntiFakeGpsValid": true
  }
}
```

---

### 2.2. Check-Out Presensi Mobile
Mengirimkan transaksi presensi pulang & hitung otomatis total jam kerja / durasi.

- **Endpoint**: `POST /api/attendance/checkOut`
- **Request Body**:
```json
{
  "attendanceId": "ATT-20260730-0091",
  "personId": "G-002",
  "latitude": -6.208851,
  "longitude": 106.845620,
  "checkOutTime": "15:35",
  "notes": "Selesai piket sore"
}
```
- **Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Presensi Check-Out berhasil dicatat!",
  "data": {
    "attendanceId": "ATT-20260730-0091",
    "checkOutTime": "15:35",
    "totalDurationHours": 8.7,
    "overtimeHours": 0.5
  }
}
```

---

### 2.3. Riwayat Presensi Saya (My Attendance History)
Mengambil daftar riwayat presensi personel login.

- **Endpoint**: `POST /api/attendance/myHistory` atau `POST /api/attendance/getAttendances`
- **Request Body**:
```json
{
  "personId": "G-002",
  "month": 7,
  "year": 2026
}
```
- **Response Success (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "ATT-20260730-0091",
      "date": "2026-07-30",
      "checkInTime": "06:52",
      "checkOutTime": "15:35",
      "status": "HADIR",
      "method": "GPS",
      "locationName": "Kampus Utama Gedung Rektorat",
      "lat": -6.208851,
      "lng": 106.845620
    }
  ]
}
```

---

### 2.4. Pengajuan Izin / Sakit / Cuti Mobile
Mengirimkan formulir pengajuan izin dengan lampiran foto/surat dokter.

- **Endpoint**: `POST /api/attendance/submitLeave`
- **Request Body**:
```json
{
  "personId": "G-002",
  "personName": "Ustadz Ahmad Fauzi, S.Pd.",
  "role": "GURU",
  "type": "IZIN",
  "startDate": "2026-08-01",
  "endDate": "2026-08-02",
  "reason": "Dinas Luar Pelatihan Kurikulum Merdeka Kemdikbud",
  "attachmentBase64": "data:image/jpeg;base64,..."
}
```
- **Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Pengajuan Izin berhasil dikirim & menunggu persetujuan bertingkat HR/Kepala TU",
  "data": {
    "leaveId": "LEAVE-9921",
    "status": "PENDING_APPROVAL"
  }
}
```

---

### 2.5. Pengajuan Lembur (Overtime Mobile Request)
Mengirimkan permohonan lembur kerja untuk dihitung honor otomatis ke Payroll.

- **Endpoint**: `POST /api/attendance/overtimeRequest`
- **Request Body**:
```json
{
  "personId": "P-001",
  "personName": "H. Bambang Sugianto, S.E.",
  "hours": 3,
  "date": "2026-07-30",
  "reason": "Penyelesaian Laporan Keuangan Audit Yayasan Semester 1"
}
```

---

### 2.6. Daftar Geofence GIS & Koordinat Radius Valid
Mengambil koordinat pusat kampus, radius meter, SSID Wifi untuk verifikasi di sisi Flutter Mobile.

- **Endpoint**: `POST /api/attendance/getGeofences`
- **Request Body**:
```json
{
  "tenant_id": "school-main"
}
```
- **Response Success (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "geo-1",
      "location_name": "Kampus Utama Gedung Rektorat & SMA IT",
      "unit": "SMA IT",
      "latitude": -6.208851,
      "longitude": 106.845620,
      "radius": 150,
      "wifiSsid": "SCHOOL_ENTERPRISE_5G"
    }
  ]
}
```

---

### 2.7. Konfigurasi Dynamic QR & Aturan Denda Presensi
Mengambil aturan toleransi keterlambatan, TTL QR Code, & tier potongan denda.

- **Endpoint**: `POST /api/attendance/getRules`
- **Request Body**:
```json
{
  "tenant_id": "school-main"
}
```

---

## 3. Sample Helper Code Service Flutter (Dart)

Salin kode Dart ini langsung ke dalam project Flutter Anda (`lib/services/attendance_api_service.dart`):

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class AttendanceApiService {
  static const String baseUrl = 'https://your-domain.com/api/attendance';
  final String authToken;

  AttendanceApiService({required this.authToken});

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $authToken',
      };

  /// 1. Perform Check-In (GPS / QR / Face)
  Future<Map<String, dynamic>> checkIn({
    required String personId,
    required String personName,
    required String role,
    required String method,
    required double latitude,
    required double longitude,
    required String locationName,
    String? photoBase64,
    String? qrPayload,
  }) async {
    final url = Uri.parse('$baseUrl/checkIn');
    final response = await http.post(
      url,
      headers: _headers,
      body: jsonEncode({
        'personId': personId,
        'personName': personName,
        'role': role,
        'method': method,
        'latitude': latitude,
        'longitude': longitude,
        'locationName': locationName,
        'photoBase64': photoBase64,
        'qrPayload': qrPayload,
      }),
    );

    return jsonDecode(response.body);
  }

  /// 2. Perform Check-Out
  Future<Map<String, dynamic>> checkOut({
    required String attendanceId,
    required String personId,
    required double latitude,
    required double longitude,
    required String checkOutTime,
  }) async {
    final url = Uri.parse('$baseUrl/checkOut');
    final response = await http.post(
      url,
      headers: _headers,
      body: jsonEncode({
        'attendanceId': attendanceId,
        'personId': personId,
        'latitude': latitude,
        'longitude': longitude,
        'checkOutTime': checkOutTime,
      }),
    );

    return jsonDecode(response.body);
  }

  /// 3. Fetch Geofence Coordinates
  Future<List<dynamic>> getGeofences() async {
    final url = Uri.parse('$baseUrl/getGeofences');
    final response = await http.post(
      url,
      headers: _headers,
      body: jsonEncode({'tenant_id': 'school-main'}),
    );

    final data = jsonDecode(response.body);
    if (data['success'] == true) {
      return data['data'];
    } {
      return [];
    }
  }

  /// 4. Submit Leave Request (Izin / Sakit / Cuti)
  Future<Map<String, dynamic>> submitLeave({
    required String personId,
    required String personName,
    required String role,
    required String type,
    required String startDate,
    required String endDate,
    required String reason,
    String? attachmentBase64,
  }) async {
    final url = Uri.parse('$baseUrl/submitLeave');
    final response = await http.post(
      url,
      headers: _headers,
      body: jsonEncode({
        'personId': personId,
        'personName': personName,
        'role': role,
        'type': type,
        'startDate': startDate,
        'endDate': endDate,
        'reason': reason,
        'attachmentBase64': attachmentBase64,
      }),
    );

    return jsonDecode(response.body);
  }
}
```

---

## 4. Kesimpulan Integrasi

Seluruh API di atas telah siap pakai, menggunakan arsitektur RESTful JSON, terbebas dari hardcode, dan terhubung secara langsung dengan modul Backend Express / Node.js, Prisma ORM, Payroll Engine, KBM, dan Command Center real-time.
