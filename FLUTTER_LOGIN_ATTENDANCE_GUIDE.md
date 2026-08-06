# Panduan Lengkap Integrasi Login & Absensi (Siswa/Santri & Karyawan) untuk Flutter & Stitch

Dokumen ini berisi panduan teknis, spesifikasi REST API backend ERP, serta contoh kode lengkap dalam bahasa **Dart (Flutter)** untuk fitur **Login Autentikasi** serta **Absensi Mandiri Siswa/Santri dan Karyawan**.

---

## 1. Spesifikasi Endpoint REST API

### A. Endpoint Login (`POST /api/v1/auth/login`)
Digunakan oleh user (Superadmin, Guru, Pegawai, Siswa, Santri, atau Orang Tua) untuk mendapatkan Token JWT dan data hak akses (RBAC).

- **URL:** `https://ais-dev-cuu72c5niw56xr2fibir2x-217257253856.asia-east1.run.app/api/v1/auth/login`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "email": "admin@pesantren.sch.id",
    "password": "password123",
    "tenant_id": "tenant-1"
  }
  ```
- **Response Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login berhasil",
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "usr-1",
      "name": "Ustadz Budi Raharjo",
      "email": "admin@pesantren.sch.id",
      "role": "GURU",
      "tenant_id": "tenant-1"
    }
  }
  ```

---

### B. Endpoint Absensi Masuk / Pulang Mandiri (`POST /api/attendance/checkIn`)
Digunakan oleh Siswa/Santri, Guru, dan Pegawai untuk melakukan presensi mandiri (dilengkapi validasi GPS, OS Device, dan Status Kehadiran).

- **URL:** `https://ais-dev-cuu72c5niw56xr2fibir2x-217257253856.asia-east1.run.app/api/attendance/checkIn`
- **Method:** `POST`
- **Headers:** 
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>`
- **Request Body:**
  ```json
  {
    "tenant_id": "tenant-1",
    "personId": "std-1",
    "type": "MASUK", 
    "status": "HADIR",
    "lat": -6.20885,
    "lng": 106.84562,
    "deviceOs": "Android 14",
    "details": "Presensi GPS Radius Sekolah"
  }
  ```
- **Response Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Absensi berhasil direkam",
    "data": {
      "id": "rec-new-1",
      "personId": "std-1",
      "time": "07:05",
      "status": "HADIR",
      "method": "GPS"
    }
  }
  ```

---

## 2. Implementasi Service Flutter (`auth_attendance_service.dart`)

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class AuthAttendanceService {
  final String baseUrl = 'https://ais-dev-cuu72c5niw56xr2fibir2x-217257253856.asia-east1.run.app';

  // 1. Fungsi Login
  Future<Map<String, dynamic>> login(String email, String password, String tenantId) async {
    final url = Uri.parse('$baseUrl/api/v1/auth/login');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password,
        'tenant_id': tenantId,
      }),
    );

    return jsonDecode(response.body);
  }

  // 2. Fungsi Absensi Mandiri (Siswa / Santri / Karyawan)
  Future<bool> submitAttendance({
    required String token,
    required String tenantId,
    required String personId,
    required String type, // 'MASUK' | 'PULANG' | 'SHALAT' | 'TAHFIDZ'
    required String status, // 'HADIR' | 'IZIN' | 'SAKIT' | 'TERLAMBAT'
    required double lat,
    required double lng,
    required String deviceOs,
    required String details,
  }) async {
    final url = Uri.parse('$baseUrl/api/attendance/checkIn');
    final response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
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
}
```

---

## 3. Contoh UI Flutter Screen untuk Login & Absensi (`login_attendance_page.dart`)

```dart
import 'package:flutter/material.dart';
import 'auth_attendance_service.dart';

class LoginAttendancePage extends StatefulWidget {
  @override
  _LoginAttendancePageState createState() => _LoginAttendancePageState();
}

class _LoginAttendancePageState extends State<LoginAttendancePage> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final AuthAttendanceService _service = AuthAttendanceService();

  bool _isLoading = false;
  String? _token;
  Map<String, dynamic>? _userData;

  void _handleLogin() async {
    setState(() => _isLoading = true);
    try {
      final res = await _service.login(
        _emailController.text.trim(),
        _passwordController.text.trim(),
        'tenant-1',
      );

      if (res['success'] == true) {
        setState(() {
          _token = res['token'];
          _userData = res['user'];
        } );
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Login Berhasil! Selamat datang ${_userData?['name']}')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Login Gagal: ${res['message']}')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _handleCheckIn() async {
    if (_token == null || _userData == null) return;

    setState(() => _isLoading = true);
    try {
      bool success = await _service.submitAttendance(
        token: _token!,
        tenantId: _userData!['tenant_id'] ?? 'tenant-1',
        personId: _userData!['id'],
        type: 'MASUK',
        status: 'HADIR',
        lat: -6.20885,
        lng: 106.84562,
        deviceOs: 'Flutter Mobile App',
        details: 'Presensi Mandiri via GPS Smartphone',
      );

      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Absensi Berhasil Direkam!')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal mengirim absensi.')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Portal Login & Absensi Mobile')),
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: _token == null
            ? Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  TextField(
                    controller: _emailController,
                    decoration: InputDecoration(labelText: 'Email / NIP / NIS'),
                  ),
                  SizedBox(height: 12),
                  TextField(
                    controller: _passwordController,
                    decoration: InputDecoration(labelText: 'Password'),
                    obscureText: true,
                  ),
                  SizedBox(height: 24),
                  _isLoading
                      ? CircularProgressIndicator()
                      : ElevatedButton(
                          onPressed: _handleLogin,
                          child: Text('Login ke ERP'),
                        ),
                ],
              )
            : Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('Halo, ${_userData?['name']}!', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                    Text('Role: ${_userData?['role']}', style: TextStyle(color: Colors.grey)),
                    SizedBox(height: 32),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
                      onPressed: _isLoading ? null : _handleCheckIn,
                      icon: Icon(Icons.fingerprint, color: Colors.white),
                      label: Text('Absen Masuk Sekarang (GPS)', style: TextStyle(color: Colors.white)),
                    ),
                    SizedBox(height: 16),
                    TextButton(
                      onPressed: () => setState(() => _token = null),
                      child: Text('Logout', style: TextStyle(color: Colors.red)),
                    ),
                  ],
                ),
              ),
      ),
    );
  }
}
```
