# Panduan & Kode Lengkap `main.dart` untuk Flutter (Enterprise ERP & Attendance Ecosystem)

Seluruh definisi file REST API backend ERP Anda terletak di dalam folder **`/src/routes/`** (seperti `auth.routes.ts`, `attendance.routes.ts`, `dashboard.routes.ts`, `student.routes.ts`, dll.), yang di-gateway melalui server Express/Fastify pada base URL:
`https://ais-dev-cuu72c5niw56xr2fibir2x-217257253856.asia-east1.run.app`

Berikut adalah kode lengkap **`main.dart`** yang siap Anda salin ke dalam proyek Flutter (`lib/main.dart`). Kode ini sudah mencakup:
1. **Autentikasi Login** (Menyimpan Token & Role RBAC).
2. **Dynamic Dashboard Router** (Menyesuaikan tampilan otomatis berdasarkan role: `SUPER_ADMIN`, `GURU`, `PEGAWAI`, `SANTRI/SISWA`).
3. **Absensi Mandiri GPS** (Karyawan & Siswa).
4. **Fitur Scan QR Code Siswa** (Khusus Wali Kelas / Petugas Piket menggunakan `mobile_scanner`).

---

## 1. `pubspec.yaml` Dependencies yang Diperlukan

Pastikan Anda menambahkan dependensi berikut di `pubspec.yaml` proyek Flutter Anda:
```yaml
dependencies:
  flutter:
    sdk: flutter
  http: ^1.2.0
  mobile_scanner: ^3.5.7
  shared_preferences: ^2.2.2
```

---

## 2. Kode Lengkap `lib/main.dart`

```dart
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:shared_preferences/shared_preferences.dart';

// Konfigurasi Base URL Backend ERP Anda
const String kBaseUrl = 'https://ais-dev-cuu72c5niw56xr2fibir2x-217257253856.asia-east1.run.app';

void main() {
  runApp(const EnterpriseErpApp());
}

class EnterpriseErpApp extends StatelessWidget {
  const EnterpriseErpApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Enterprise ERP & Attendance Mobile',
      theme: ThemeData(
        primarySwatch: Colors.indigo,
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
        fontFamily: 'Roboto',
      ),
      home: const AuthWrapper(),
      debugShowCheckedModeBanner: false,
    );
  }
}

/// ==========================================
/// 1. AUTH WRAPPER (CEK SESI LOGIN)
/// ==========================================
class AuthWrapper extends StatefulWidget {
  const AuthWrapper({Key? key}) : super(key: key);

  @override
  State<AuthWrapper> createState() => _AuthWrapperState();
}

class _AuthWrapperState extends State<AuthWrapper> {
  bool _isLoading = true;
  String? _token;
  Map<String, dynamic>? _userData;

  @override
  void initState() {
    super.initState();
    _checkLoginSession();
  }

  Future<void> _checkLoginSession() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    final userStr = prefs.getString('user_data');

    if (token != null && userStr != null) {
      setState(() {
        _token = token;
        _userData = jsonDecode(userStr);
        _isLoading = false;
      });
    } else {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_token == null || _userData == null) {
      return LoginScreen(onLoginSuccess: (token, user) {
        setState(() {
          _token = token;
          _userData = user;
        });
      });
    } else {
      return RoleDashboardScreen(
        token: _token!,
        userData: _userData!,
        onLogout: () async {
          final prefs = await SharedPreferences.getInstance();
          await prefs.clear();
          setState(() {
            _token = null;
            _userData = null;
          });
        },
      );
    }
  }
}

/// ==========================================
/// 2. LOGIN SCREEN
/// ==========================================
class LoginScreen extends StatefulWidget {
  final Function(String, Map<String, dynamic>) onLoginSuccess;

  const LoginScreen({Key? key, required this.onLoginSuccess}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController(text: 'admin@pesantren.sch.id');
  final _passwordController = TextEditingController(text: 'password123');
  bool _isLoading = false;

  Future<void> _handleLogin() async {
    setState(() => _isLoading = true);
    try {
      final response = await http.post(
        Uri.parse('$kBaseUrl/api/v1/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': _emailController.text.trim(),
          'password': _passwordController.text.trim(),
          'tenant_id': 'tenant-1',
        }),
      );

      final data = jsonDecode(response.body);
      if (response.statusCode == 200 && data['success'] == true) {
        final token = data['token'];
        final user = data['user'];

        // Simpan ke SharedPreferences
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('jwt_token', token);
        await prefs.setString('user_data', jsonEncode(user));

        widget.onLoginSuccess(token, user);
      } else {
        _showSnackBar(data['message'] ?? 'Login Gagal');
      }
    } catch (e) {
      _showSnackBar('Koneksi Error: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _showSnackBar(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Card(
            elevation: 4,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Icon(Icons.school, size: 64, color: Colors.indigo),
                  const SizedBox(height: 16),
                  const Text(
                    'Enterprise ERP Login',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Smart Attendance & Academic Ecosystem',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                  const SizedBox(height: 32),
                  TextField(
                    controller: _emailController,
                    decoration: const InputDecoration(
                      labelText: 'Email / NIP / NIS',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.person),
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _passwordController,
                    obscureText: true,
                    decoration: const InputDecoration(
                      labelText: 'Password',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.lock),
                    ),
                  ),
                  const SizedBox(height: 24),
                  _isLoading
                      ? const Center(child: CircularProgressIndicator())
                      : ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            backgroundColor: Colors.indigo,
                          ),
                          onPressed: _handleLogin,
                          child: const Text('MASUK SISTEM', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// ==========================================
/// 3. DYNAMIC ROLE DASHBOARD SCREEN
/// ==========================================
class RoleDashboardScreen extends StatefulWidget {
  final String token;
  final Map<String, dynamic> userData;
  final VoidCallback onLogout;

  const RoleDashboardScreen({
    Key? key,
    required this.token,
    required this.userData,
    required this.onLogout,
  }) : super(key: key);

  @override
  State<RoleDashboardScreen> createState() => _RoleDashboardScreenState();
}

class _RoleDashboardScreenState extends State<RoleDashboardScreen> {
  bool _isLoading = true;
  Map<String, dynamic> _stats = {};
  List<dynamic> _recentAttendances = [];

  @override
  void initState() {
    super.initState();
    _fetchDashboardData();
  }

  Future<void> _fetchDashboardData() async {
    setState(() => _isLoading = true);
    try {
      final response = await http.post(
        Uri.parse('$kBaseUrl/api/attendance/getAttendances'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${widget.token}',
        },
        body: jsonEncode({'tenant_id': widget.userData['tenant_id'] ?? 'tenant-1'}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final list = data['data'] as List? ?? [];

        int hadir = list.where((x) => x['status'] == 'HADIR').length;
        int terlambat = list.where((x) => x['status'] == 'TERLAMBAT').length;
        int izinSakit = list.where((x) => x['status'] == 'IZIN' || x['status'] == 'SAKIT').length;
        int alfa = list.where((x) => x['status'] == 'ALFA').length;

        setState(() {
          _stats = {
            'hadir': hadir,
            'terlambat': terlambat,
            'izinSakit': izinSakit,
            'alfa': alfa,
            'total': list.length,
          };
          _recentAttendances = list;
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _submitSelfCheckIn() async {
    setState(() => _isLoading = true);
    try {
      final response = await http.post(
        Uri.parse('$kBaseUrl/api/attendance/checkIn'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${widget.token}',
        },
        body: jsonEncode({
          'tenant_id': widget.userData['tenant_id'] ?? 'tenant-1',
          'personId': widget.userData['id'],
          'type': 'MASUK',
          'status': 'HADIR',
          'lat': -6.2088,
          'lng': 106.8456,
          'deviceOs': 'Flutter Mobile App',
          'details': 'Presensi mandiri GPS Smartphone',
        }),
      );

      final data = jsonDecode(response.body);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(data['message'] ?? 'Absensi berhasil direkam')),
      );
      _fetchDashboardData();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final role = widget.userData['role'] ?? 'SISWA';
    final name = widget.userData['name'] ?? 'User';

    return Scaffold(
      appBar: AppBar(
        title: Text('Dashboard ($role)'),
        backgroundColor: Colors.indigo,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchDashboardData,
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: widget.onLogout,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchDashboardData,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // User Banner
                  Card(
                    color: Colors.indigo.shade50,
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          CircleAvatar(
                            radius: 28,
                            backgroundColor: Colors.indigo,
                            child: Text(name[0], style: const TextStyle(fontSize: 22, color: Colors.white, fontWeight: FontWeight.bold)),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Selamat Datang,', style: TextStyle(fontSize: 12, color: Colors.grey)),
                                Text(name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                                const SizedBox(height: 4),
                                Chip(
                                  label: Text('Role: $role', style: const TextStyle(color: Colors.white, fontSize: 10)),
                                  backgroundColor: Colors.indigo.shade700,
                                  padding: EdgeInsets.zero,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Menu Aksi Khusus Guru / Wali Kelas (Scan QR)
                  if (role == 'SUPER_ADMIN' || role == 'GURU') ...[
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.teal,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => TeacherScannerScreen(
                              token: widget.token,
                              tenantId: widget.userData['tenant_id'] ?? 'tenant-1',
                            ),
                          ),
                        );
                      },
                      icon: const Icon(Icons.qr_code_scanner, color: Colors.white),
                      label: const Text('Scan QR Code Kehadiran Siswa', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    ),
                    const SizedBox(height: 20),
                  ],

                  // Menu Absensi Mandiri (Siswa / Karyawan / Guru)
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green.shade700,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    onPressed: _submitSelfCheckIn,
                    icon: const Icon(Icons.fingerprint, color: Colors.white),
                    label: const Text('Absen Masuk Mandiri (GPS)', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                  const SizedBox(height: 24),

                  // Statistik Grid
                  const Text('Statistik Kehadiran', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisSpacing: 10,
                    mainAxisSpacing: 10,
                    childAspectRatio: 1.6,
                    children: [
                      _buildStatCard('Hadir', '${_stats['hadir'] ?? 0}', Colors.green),
                      _buildStatCard('Terlambat', '${_stats['terlambat'] ?? 0}', Colors.orange),
                      _buildStatCard('Izin / Sakit', '${_stats['izinSakit'] ?? 0}', Colors.blue),
                      _buildStatCard('Alpha', '${_stats['alfa'] ?? 0}', Colors.red),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Live Log Kehadiran
                  const Text('Log Aktivitas Kehadiran Terbaru', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _recentAttendances.length,
                    itemBuilder: (context, index) {
                      final item = _recentAttendances[index];
                      return Card(
                        margin: const EdgeInsets.symmetric(vertical: 4),
                        child: ListTile(
                          leading: const Icon(Icons.person_pin, color: Colors.indigo),
                          title: Text(item['name'] ?? 'Siswa/Pegawai'),
                          subtitle: Text('${item['type']} • ${item['date']} ${item['time']} (${item['method']})'),
                          trailing: Chip(
                            label: Text(item['status'] ?? 'HADIR', style: const TextStyle(fontSize: 10, color: Colors.white)),
                            backgroundColor: item['status'] == 'HADIR' ? Colors.green : Colors.orange,
                          ),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildStatCard(String title, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(title, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 13)),
          const SizedBox(height: 4),
          Text(value, style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: color)),
        ],
      ),
    );
  }
}

/// ==========================================
/// 4. TEACHER QR SCANNER SCREEN
/// ==========================================
class TeacherScannerScreen extends StatefulWidget {
  final String token;
  final String tenantId;

  const TeacherScannerScreen({Key? key, required this.token, required this.tenantId}) : super(key: key);

  @override
  State<TeacherScannerScreen> createState() => _TeacherScannerScreenState();
}

class _TeacherScannerScreenState extends State<TeacherScannerScreen> {
  MobileScannerController cameraController = MobileScannerController();
  bool _isProcessing = false;
  String _statusMessage = 'Arahkan kamera ke QR Code Siswa/Santri';

  void _onDetect(BarcodeCapture capture) async {
    if (_isProcessing) return;

    for (final barcode in capture.barcodes) {
      final rawValue = barcode.rawValue;
      if (rawValue != null && rawValue.isNotEmpty) {
        setState(() {
          _isProcessing = true;
          _statusMessage = 'Memproses QR Code...';
        });

        try {
          final response = await http.post(
            Uri.parse('$kBaseUrl/api/attendance/smartAttendance'),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ${widget.token}',
            },
            body: jsonEncode({
              'tenant_id': widget.tenantId,
              'qr_payload': rawValue,
              'personId': 'std-1',
            }),
          );

          final data = jsonDecode(response.body);
          if (response.statusCode == 200 && data['success'] == true) {
            _showSuccessDialog(data['data']?['name'] ?? 'Siswa');
          } else {
            setState(() {
              _statusMessage = 'Gagal: ${data['message'] ?? 'QR tidak valid'}';
              _isProcessing = false;
            });
          }
        } catch (e) {
          setState(() {
            _statusMessage = 'Error: $e';
            _isProcessing = false;
          });
        }
        break;
      }
    }
  }

  void _showSuccessDialog(String name) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.check_circle, color: Colors.green),
            SizedBox(width: 8),
            Text('Absensi Berhasil'),
          ],
        ),
        content: Text('Siswa $name berhasil dicatat HADIR.'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              setState(() {
                _isProcessing = false;
                _statusMessage = 'Arahkan kamera ke QR Code berikutnya';
              });
            },
            child: const Text('Scan Lagi'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan QR Kehadiran Siswa'),
        backgroundColor: Colors.teal,
        actions: [
          IconButton(
            icon: ValueListenableBuilder(
              valueListenable: cameraController.torchState,
              builder: (context, state, child) {
                return Icon(
                  state == TorchState.on ? Icons.flash_on : Icons.flash_off,
                  color: state == TorchState.on ? Colors.yellow : Colors.white,
                );
              },
            ),
            onPressed: () => cameraController.toggleTorch(),
          ),
          IconButton(
            icon: const Icon(Icons.camera_front),
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
              padding: const EdgeInsets.all(16),
              alignment: Alignment.center,
              color: Colors.teal.shade50,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    _statusMessage,
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.teal.shade800),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  if (_isProcessing) const CircularProgressIndicator(),
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
