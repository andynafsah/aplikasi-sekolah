# Panduan Role-Based Dashboards untuk Flutter (Enterprise ERP & Attendance Ecosystem)

Dokumen ini berisi panduan dan contoh implementasi kode dalam bahasa **Dart (Flutter)** untuk merancang **Dashboard Dinamis berdasarkan Peran (RBAC)** yang terhubung langsung ke backend ERP Enterprise.

---

## 1. Arsitektur Role & Akses Dashboard

Berdasarkan data autentikasi (`/api/v1/auth/login`), aplikasi Flutter mendeteksi `role` pengguna dan merender dashboard yang sesuai:
1. **SUPER_ADMIN / ADMIN:** Memantau seluruh rekapitulasi kehadiran institusi, konfigurasi late policy, geofence, dan audit trail.
2. **GURU (Teacher):** Mengelola presensi kelas binaan, jurnal KBM, pencatatan tahfidz, dan izin siswa.
3. **PEGAWAI (Employee):** Absensi mandiri (GPS/QR), riwayat kehadiran personal, dan slip gaji/payroll.
4. **SANTRI / SISWA:** Presensi mandiri, melihat statistik kehadiran pribadi, catatan tahfidz & disiplin.
5. **ORANG_TUA (Parent):** Memantau status kehadiran anak secara real-time, nilai, tagihan SPP, dan pengumuman yayasan.

---

## 2. Service Router Dashboard (`dashboard_service.dart`)

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class DashboardService {
  final String baseUrl = 'https://ais-dev-cuu72c5niw56xr2fibir2x-217257253856.asia-east1.run.app';

  Future<Map<String, dynamic>> fetchDashboardSummary(String token, String tenantId, String role) async {
    final url = Uri.parse('$baseUrl/api/attendance/getAttendances');
    final response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'tenant_id': tenantId}),
    );

    if (response.statusCode == 200) {
      final resData = jsonDecode(response.body);
      // Analisis data absensi berdasarkan role
      List records = resData['data'] ?? [];
      
      int hadir = records.where((r) => r['status'] == 'HADIR').length;
      int terlambat = records.where((r) => r['status'] == 'TERLAMBAT').length;
      int izinSakit = records.where((r) => r['status'] == 'IZIN' || r['status'] == 'SAKIT').length;
      int alfa = records.where((r) => r['status'] == 'ALFA').length;

      return {
        'hadir': hadir,
        'terlambat': terlambat,
        'izin_sakit': izinSakit,
        'alfa': alfa,
        'total': records.length,
        'recent': records,
      };
    }
    throw Exception('Gagal memuat rekapitulasi dashboard');
  }
}
```

---

## 3. Implementasi Role-Based Dashboard Screen di Flutter (`role_dashboard_screen.dart`)

```dart
import 'package:flutter/material.dart';
import 'dashboard_service.dart';

class RoleDashboardScreen extends StatefulWidget {
  final Map<String, dynamic> userData;
  final String token;

  const RoleDashboardScreen({
    Key? key,
    required this.userData,
    required this.token,
  }) : super(key: key);

  @override
  _RoleDashboardScreenState createState() => _RoleDashboardScreenState();
}

class _RoleDashboardScreenState extends State<RoleDashboardScreen> {
  final DashboardService _service = DashboardService();
  bool _isLoading = true;
  Map<String, dynamic> _stats = {};

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final data = await _service.fetchDashboardSummary(
        widget.token,
        widget.userData['tenant_id'] ?? 'tenant-1',
        widget.userData['role'],
      );
      setState(() {
        _stats = data;
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
    String role = widget.userData['role'] ?? 'SISWA';
    String name = widget.userData['name'] ?? 'Pengguna';

    return Scaffold(
      appBar: AppBar(
        title: Text('Dashboard - $role'),
        backgroundColor: _getRoleColor(role),
        actions: [
          IconButton(icon: Icon(Icons.refresh), onPressed: _loadData),
        ],
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadData,
              child: SingleChildScrollView(
                physics: AlwaysScrollableScrollPhysics(),
                padding: EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Welcome Banner
                    Card(
                      color: _getRoleColor(role).withOpacity(0.1),
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      child: Padding(
                        padding: EdgeInsets.all(16.0),
                        child: Row(
                          children: [
                            CircleAvatar(
                              radius: 30,
                              backgroundColor: _getRoleColor(role),
                              child: Text(
                                name[0],
                                style: TextStyle(fontSize: 24, color: Colors.white, fontWeight: FontWeight.bold),
                              ),
                            ),
                            SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('Selamat Datang,', style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                                  Text(name, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                                  SizedBox(height: 4),
                                  Chip(
                                    label: Text('Role: $role', style: TextStyle(color: Colors.white, fontSize: 10)),
                                    backgroundColor: _getRoleColor(role),
                                    padding: EdgeInsets.zero,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    SizedBox(height: 20),

                    // Role-Specific Widgets
                    if (role == 'SUPER_ADMIN' || role == 'GURU') ...[
                      Text('Rekapitulasi Kehadiran Institusi', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      SizedBox(height: 10),
                      GridView.count(
                        crossAxisCount: 2,
                        shrinkWrap: true,
                        physics: NeverScrollableScrollPhysics(),
                        crossAxisSpacing: 10,
                        mainAxisSpacing: 10,
                        childAspectRatio: 1.5,
                        children: [
                          _buildStatCard('Hadir', '${_stats['hadir']}', Colors.green),
                          _buildStatCard('Terlambat', '${_stats['terlambat']}', Colors.orange),
                          _buildStatCard('Izin / Sakit', '${_stats['izin_sakit']}', Colors.blue),
                          _buildStatCard('Alpha', '${_stats['alfa']}', Colors.red),
                        ],
                      ),
                    ] else ...[
                      Text('Status Kehadiran Hari Ini', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      SizedBox(height: 10),
                      Card(
                        child: ListTile(
                          leading: Icon(Icons.check_circle, color: Colors.green, size: 36),
                          title: Text('Sudah Melakukan Absensi'),
                          subtitle: Text('Metode: GPS & Smart Card • Pukul 07:02 WIB'),
                          trailing: Chip(label: Text('HADIR', style: TextStyle(color: Colors.white)), backgroundColor: Colors.green),
                        ),
                      ),
                    ],

                    SizedBox(height: 20),
                    Text('Aktivitas & Log Terbaru', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    SizedBox(height: 10),
                    ListView.builder(
                      shrinkWrap: true,
                      physics: NeverScrollableScrollPhysics(),
                      itemCount: (_stats['recent'] as List?)?.length ?? 0,
                      itemBuilder: (context, index) {
                        final item = _stats['recent'][index];
                        return Card(
                          margin: EdgeInsets.symmetric(vertical: 4),
                          child: ListTile(
                            leading: Icon(Icons.person, color: Colors.indigo),
                            title: Text(item['name'] ?? ''),
                            subtitle: Text('${item['type']} • ${item['date']} ${item['time']} (${item['method']})'),
                            trailing: Text(
                              item['status'],
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: item['status'] == 'HADIR' ? Colors.green : Colors.orange,
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  Color _getRoleColor(String role) {
    switch (role) {
      case 'SUPER_ADMIN':
        return Colors.indigo;
      case 'GURU':
        return Colors.teal;
      case 'PEGAWAI':
        return Colors.blueGrey;
      case 'SANTRI':
      case 'SISWA':
        return Colors.green;
      case 'ORANG_TUA':
        return Colors.deepPurple;
      default:
        return Colors.blue;
    }
  }

  Widget _buildStatCard(String title, String value, Color color) {
    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(title, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 14)),
          SizedBox(height: 8),
          Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color)),
        ],
      ),
    );
  }
}
```
