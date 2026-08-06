# Panduan Fitur Scan QR Siswa/Santri oleh Wali Kelas untuk Flutter & Stitch

Dokumen ini berisi panduan teknis, spesifikasi REST API backend ERP, serta contoh kode lengkap dalam bahasa **Dart (Flutter)** untuk fitur **Wali Kelas melakukan Scan QR Code Absensi Siswa / Santri**.

---

## 1. Spesifikasi Endpoint REST API (`smartAttendance`)

Digunakan oleh Wali Kelas atau Petugas Piket untuk memindai (scan) QR Code digital siswa/santri dan langsung mencatat kehadiran ke server ERP.

- **URL:** `https://ais-dev-cuu72c5niw56xr2fibir2x-217257253856.asia-east1.run.app/api/attendance/smartAttendance`
- **Method:** `POST`
- **Headers:** 
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>`
- **Request Body:**
  ```json
  {
    "tenant_id": "tenant-1",
    "qr_payload": "UUID-STUDENT-001-SIGNATURE-xyz987",
    "personId": "std-1"
  }
  ```
- **Response Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Absensi QR Siswa berhasil direkam",
    "data": {
      "id": "rec-qr-1",
      "personId": "std-1",
      "name": "Muhammad Ahmad Baihaqi",
      "status": "HADIR",
      "method": "QR",
      "time": "07:15"
    }
  }
  ```

---

## 2. Dependensi Flutter (`pubspec.yaml`)

Untuk menggunakan pemindai kamera QR di Flutter, tambahkan package berikut:
```yaml
dependencies:
  flutter:
    sdk: flutter
  http: ^1.2.0
  mobile_scanner: ^3.5.7
```

---

## 3. Implementasi Service API Scanner (`teacher_scanner_service.dart`)

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class TeacherScannerService {
  final String baseUrl = 'https://ais-dev-cuu72c5niw56xr2fibir2x-217257253856.asia-east1.run.app';

  Future<Map<String, dynamic>> scanStudentQr({
    required String token,
    required String tenantId,
    required String qrPayload,
    required String personId,
  }) async {
    final url = Uri.parse('$baseUrl/api/attendance/smartAttendance');
    final response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'tenant_id': tenantId,
        'qr_payload': qrPayload,
        'personId': personId,
      }),
    );

    return jsonDecode(response.body);
  }
}
```

---

## 4. Contoh UI Flutter Screen untuk Scanner Wali Kelas (`teacher_qr_scanner_screen.dart`)

```dart
import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'teacher_scanner_service.dart';

class TeacherQrScannerScreen extends StatefulWidget {
  final String token;
  final String tenantId;

  const TeacherQrScannerScreen({
    Key? key,
    required this.token,
    required this.tenantId,
  }) : super(key: key);

  @override
  _TeacherQrScannerScreenState createState() => _TeacherQrScannerScreenState();
}

class _TeacherQrScannerScreenState extends State<TeacherQrScannerScreen> {
  final TeacherScannerService _scannerService = TeacherScannerService();
  MobileScannerController cameraController = MobileScannerController();
  bool _isProcessing = false;
  String _scanResultStatus = 'Arahkan kamera ke QR Code Siswa / Santri';

  void _onDetect(BarcodeCapture capture) async {
    if (_isProcessing) return;

    final List<Barcode> barcodes = capture.barcodes;
    for (final barcode in barcodes) {
      final String? rawValue = barcode.rawValue;
      if (rawValue != null && rawValue.isNotEmpty) {
        setState(() {
          _isProcessing = true;
          _scanResultStatus = 'Memproses QR Code...';
        });

        try {
          // Kirim payload QR ke ERP Backend
          final res = await _scannerService.scanStudentQr(
            token: widget.token,
            tenantId: widget.tenantId,
            qrPayload: rawValue,
            personId: 'std-1', // ID siswa dari hasil scan/database
          );

          if (res['success'] == true) {
            _showSuccessDialog(res['data']?['name'] ?? 'Siswa');
          } else {
            setState(() {
              _scanResultStatus = 'Gagal: ${res['message'] ?? 'QR tidak valid'}';
              _isProcessing = false;
            });
          }
        } catch (e) {
          setState(() {
            _scanResultStatus = 'Error koneksi: $e';
            _isProcessing = false;
          });
        }
        break;
      }
    }
  }

  void _showSuccessDialog(String studentName) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Icon(Icons.check_circle, color: Colors.green),
            SizedBox(width: 8),
            Text('Absensi Berhasil'),
          ],
        ),
        content: Text('Siswa $studentName berhasil dicatat HADIR.'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              setState(() {
                _isProcessing = false;
                _scanResultStatus = 'Arahkan kamera ke QR Code berikutnya';
              });
            },
            child: Text('Scan Lagi'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Wali Kelas - Scan QR Kehadiran'),
        backgroundColor: Colors.teal,
        actions: [
          IconButton(
            icon: ValueListenableBuilder(
              valueListenable: cameraController.torchState,
              builder: (context, state, child) {
                switch (state) {
                  case TorchState.off:
                    return Icon(Icons.flash_off, color: Colors.grey);
                  case TorchState.on:
                    return Icon(Icons.flash_on, color: Colors.yellow);
                }
              },
            ),
            onPressed: () => cameraController.toggleTorch(),
          ),
          IconButton(
            icon: Icon(Icons.camera_front),
            onPressed: () => cameraController.switchCamera(),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            flex: 4,
            child: MobileScanner(
              controller: cameraController,
              onDetect: _onDetect,
            ),
          ),
          Expanded(
            flex: 1,
            child: Container(
              padding: EdgeInsets.all(16),
              alignment: Alignment.center,
              color: Colors.teal.shade50,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    _scanResultStatus,
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.teal.shade800),
                    textAlign: TextAlign.center,
                  ),
                  SizedBox(height: 8),
                  if (_isProcessing) CircularProgressIndicator(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    cameraController.dispose();
    super.dispose();
  }
}
```
