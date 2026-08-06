# Panduan Integrasi Enterprise Attendance API untuk Flutter

Dokumen ini berisi panduan *step-by-step* serta contoh implementasi kode dalam bahasa **Dart (Flutter)** untuk mengonsumsi REST API **Enterprise Smart Attendance Ecosystem & Security Engine** yang terintegrasi di Backend ERP.

---

## 1. Arsitektur & Endpoint Utama

Backend ERP menyediakan endpoint terpusat yang dapat diakses melalui HTTP POST / GET.
- **Base URL Development:** `https://ais-dev-cuu72c5niw56xr2fibir2x-217257253856.asia-east1.run.app` (atau URL Production sesuai deploy).
- **Authentication:** Bearer Token JWT di header `Authorization: Bearer <JWT_TOKEN>` atau dikirim dalam JSON body `token`.

---

## 2. Struktur Model Data Dart (`attendance_model.dart`)

```dart
class AttendanceRecord {
  final String id;
  final String personId;
  final String name;
  final String role;
  final String date;
  final String time;
  final String type; // MASUK, PULANG, SHALAT, TAHFIDZ, ASRAMA, LEMBUR
  final String status; // HADIR, TERLAMBAT, IZIN, SAKIT, ALFA, DISPENSASI
  final String method; // MANUAL, QR, BARCODE, GPS, SMART_CARD, RFID
  final String details;
  final double? lat;
  final double? lng;

  AttendanceRecord({
    required this.id,
    required this.personId,
    required this.name,
    required this.role,
    required this.date,
    required this.time,
    required this.type,
    required this.status,
    required this.method,
    required this.details,
    this.lat,
    this.lng,
  });

  factory AttendanceRecord.fromJson(Map<String, dynamic> json) {
    return AttendanceRecord(
      id: json['id'] ?? '',
      personId: json['personId'] ?? json['student_id'] ?? '',
      name: json['name'] ?? '',
      role: json['role'] ?? 'SANTRI',
      date: json['date'] ?? '',
      time: json['time'] ?? '',
      type: json['type'] ?? 'MASUK',
      status: json['status'] ?? 'HADIR',
      method: json['method'] ?? 'GPS',
      details: json['details'] ?? '',
      lat: json['lat'] != null ? (json['lat'] as num).toDouble() : null,
      lng: json['lng'] != null ? (json['lng'] as num).toDouble() : null,
    );
  }
}
```

---

## 3. Layanan API Client Flutter (`attendance_api_service.dart`)

Gunakan package `http` di Flutter (`pubspec.yaml`: `http: ^1.2.0`).

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'attendance_model.dart';

class AttendanceApiService {
  final String baseUrl;
  final String jwtToken;

  AttendanceApiService({
    required this.baseUrl,
    required this.jwtToken,
  });

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $jwtToken',
      };

  // 1. Ambil Rekapitulasi Kehadiran
  Future<List<AttendanceRecord>> getAttendances(String tenantId) async {
    final url = Uri.parse('$baseUrl/api/attendance/getAttendances');
    final response = await http.post(
      url,
      headers: _headers,
      body: jsonEncode({'tenant_id': tenantId}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['success'] == true && data['data'] != null) {
        return (data['data'] as List)
            .map((item) => AttendanceRecord.fromJson(item))
            .toList();
      }
    }
    throw Exception('Gagal memuat data kehadiran: ${response.body}');
  }

  // 2. Kirim Absensi GPS / Check-In
  Future<bool> checkIn({
    required String tenantId,
    required String personId,
    required String type,
    required String status,
    required double lat,
    required double lng,
    required String deviceOs,
    required String details,
  }) async {
    final url = Uri.parse('$baseUrl/api/attendance/checkIn');
    final response = await http.post(
      url,
      headers: _headers,
      body: jsonEncode({
        'tenant_id': tenantId,
        'personId': personId,
        'type': type,
        'status': status,
        'lat': lat,
        'lng': lng,
        'deviceOs': deviceOs,
        'details': details,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['success'] == true;
    }
    return false;
  }

  // 3. Scan Dynamic QR Code Absensi
  Future<Map<String, dynamic>> smartAttendanceScan({
    required String tenantId,
    required String qrPayload,
    required String personId,
  }) async {
    final url = Uri.parse('$baseUrl/api/attendance/smartAttendance');
    final response = await http.post(
      url,
      headers: _headers,
      body: jsonEncode({
        'tenant_id': tenantId,
        'qr_payload': qrPayload,
        'personId': personId,
      }),
    );

    return jsonDecode(response.body);
  }

  // 4. Ambil Aturan Kehadiran & Jam Kerja (Late Policy)
  Future<Map<String, dynamic>> getRules(String tenantId) async {
    final url = Uri.parse('$baseUrl/api/attendance/getRules');
    final response = await http.post(
      url,
      headers: _headers,
      body: jsonEncode({'tenant_id': tenantId}),
    );
    return jsonDecode(response.body);
  }

  // 5. Ajukan / Update Perizinan (Leave Request)
  Future<bool> updateLeavePermission({
    required String tenantId,
    required String leaveId,
    required String status, // APPROVED / REJECTED
    required String approverNote,
  }) async {
    final url = Uri.parse('$baseUrl/api/attendance/updateLeavePermission');
    final response = await http.post(
      url,
      headers: _headers,
      body: jsonEncode({
        'tenant_id': tenantId,
        'leave_id': leaveId,
        'status': status,
        'approver_note': approverNote,
      }),
    );
    final data = jsonDecode(response.body);
    return data['success'] == true;
  }
}
```

---

## 4. Implementasi UI / Screen di Flutter (`attendance_screen.dart`)

```dart
import 'package:flutter/material.dart';
import 'attendance_model.dart';
import 'attendance_api_service.dart';

class AttendanceScreen extends StatefulWidget {
  final String tenantId;
  final String token;

  const AttendanceScreen({Key? key, required this.tenantId, required this.token})
      : super(key: key);

  @override
  _AttendanceScreenState createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen> {
  late AttendanceApiService _apiService;
  List<AttendanceRecord> _records = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _apiService = AttendanceApiService(
      baseUrl: 'https://ais-dev-cuu72c5niw56xr2fibir2x-217257253856.asia-east1.run.app',
      jwtToken: widget.token,
    );
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final records = await _apiService.getAttendances(widget.tenantId);
      setState(() {
        _records = records;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Enterprise Attendance Mobile'),
        backgroundColor: Colors.indigo,
        actions: [
          IconButton(
            icon: Icon(Icons.refresh),
            onPressed: _loadData,
          )
        ],
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: _records.length,
              itemBuilder: (context, index) {
                final rec = _records[index];
                return Card(
                  margin: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: rec.status == 'HADIR'
                          ? Colors.green
                          : rec.status == 'TERLAMBAT'
                              ? Colors.orange
                              : Colors.red,
                      child: Text(
                        rec.status[0],
                        style: TextStyle(color: Colors.white),
                      ),
                    ),
                    title: Text(rec.name, style: TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text('${rec.role} • ${rec.date} ${rec.time} (${rec.method})'),
                    trailing: Chip(
                      label: Text(rec.status, style: TextStyle(fontSize: 10, color: Colors.white)),
                      backgroundColor: rec.status == 'HADIR' ? Colors.green.shade700 : Colors.amber.shade800,
                    ),
                  ),
                );
              },
            ),
    );
  }
}
```

---

## 5. Ringkasan Eksekusi Modul

Modul Backend **Enterprise Smart Attendance Security & Realtime Engine** (`55_ENTERPRISE_ATTENDANCE_SECURITY_AND_REALTIME_ENGINE.md`) telah **sepenuhnya diimplementasikan dan aktif** di server ERP. Anda tinggal menggunakan rute API di atas untuk dihubungkan ke aplikasi Flutter mobile Anda tanpa perlu membangun ulang logika bisnis backend.
