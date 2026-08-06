# PANDUAN PENYELARASAN MENU & NAVIGASI DYNAMIC-ROLE DI FLUTTER

Panduan ini menjelaskan bagaimana cara membangun sistem navigasi dan menu dinamis (Dynamic Role-Based Menu) pada aplikasi **Flutter** agar selaras dan sinkron secara fungsional dengan hak akses (RBAC) dan fitur-fitur yang ada pada aplikasi web ini.

---

## 1. PEMETAAN MENU BERDASARKAN PERAN (ROLE MAPPING)

Aplikasi web Anda menggunakan sistem otentikasi multi-peran yang ketat. Pada aplikasi mobile Flutter, menu yang tampil di halaman beranda (Dashboard) harus disaring secara dinamis berdasarkan nilai `role` yang dikembalikan saat Login (`STUDENT`, `TEACHER`, `EMPLOYEE`, atau `PARENT`).

Berikut pemetaan menu ideal agar sinkron dengan aplikasi web:

| Nama Menu | Ikon (Lucide/Material) | Role yang Diizinkan | Endpoint API Terkait | Fungsi Utama |
| :--- | :---: | :---: | :--- | :--- |
| **Presensi GPS** | `fingerprint` | Semua Role | `/sync` | Melakukan absen masuk/pulang berbasis geofence. |
| **Smart Rapor & Nilai**| `assignment` | `STUDENT`, `TEACHER` | `/profile`, `/dashboard` | Melihat/menginput capaian akademik & nilai rapor. |
| **LMS & Tugas** | `book` | `STUDENT`, `TEACHER` | `/dashboard` | Akses materi pelajaran, tugas harian, dan ujian online. |
| **Tagihan & SPP** | `payments` | `STUDENT`, `PARENT` | `/dashboard` | Memantau tagihan keuangan, riwayat SPP, dan invoice. |
| **Mutabaah & Tahfidz** | `favorite` | `STUDENT`, `PARENT`, `TEACHER`| `/dashboard` | Pemantauan hafalan Quran, shalat harian, dan kegiatan asrama. |
| **Pelaporan Kerusakan**| `bug_report` | Semua Role | `/crashes/log` | Mengirim crash log dan umpan balik operasional. |
| **Pengaturan Aplikasi**| `settings` | Semua Role | `/settings` | Menyinkronkan tema warna, bahasa, dan notifikasi. |

---

## 2. STRUKTUR DATA MENU DINAMIS DI FLUTTER

Gunakan model data Dart berikut untuk mendefinisikan menu yang secara otomatis menyaring dirinya sendiri berdasarkan peran pengguna yang sedang aktif.

### A. Model Data Menu (`lib/models/menu_item_model.dart`)
```dart
// lib/models/menu_item_model.dart
import 'package:flutter/material.dart';

class MenuItemModel {
  final String title;
  final String description;
  final IconData icon;
  final Color color;
  final String routeName;
  final List<String> allowedRoles; // Role yang diizinkan melihat menu ini

  const MenuItemModel({
    required this.title,
    required this.description,
    required this.icon,
    required this.color,
    required this.routeName,
    required this.allowedRoles,
  });
}
```

### B. Daftar Menu Global (`lib/config/menu_config.dart`)
```dart
// lib/config/menu_config.dart
import 'package:flutter/material.dart';
import '../models/menu_item_model.dart';

class MenuConfig {
  static const List<MenuItemModel> allMenus = [
    MenuItemModel(
      title: 'Presensi GPS',
      description: 'Absen masuk & pulang sekolah',
      icon: Icons.fingerprint_rounded,
      color: Colors.emerald,
      routeName: '/attendance',
      allowedRoles: ['STUDENT', 'TEACHER', 'EMPLOYEE'],
    ),
    MenuItemModel(
      title: 'Smart Rapor',
      description: 'Cek capaian nilai akademik',
      icon: Icons.assignment_rounded,
      color: Colors.blue,
      routeName: '/rapor',
      allowedRoles: ['STUDENT', 'TEACHER'],
    ),
    MenuItemModel(
      title: 'Keuangan & SPP',
      description: 'Info tagihan & riwayat bayar',
      icon: Icons.account_balance_wallet_rounded,
      color: Colors.amber,
      routeName: '/finance',
      allowedRoles: ['STUDENT', 'PARENT'],
    ),
    MenuItemModel(
      title: 'LMS & Pembelajaran',
      description: 'Materi, tugas, dan ujian',
      icon: Icons.import_contacts_rounded,
      color: Colors.purple,
      routeName: '/lms',
      allowedRoles: ['STUDENT', 'TEACHER'],
    ),
    MenuItemModel(
      title: 'Mutabaah & Asrama',
      description: 'Pemantauan hafalan & tahfidz',
      icon: Icons.favorite_rounded,
      color: Colors.rose,
      routeName: '/boarding',
      allowedRoles: ['STUDENT', 'PARENT', 'TEACHER'],
    ),
    MenuItemModel(
      title: 'Pengaturan',
      description: 'Preferensi & tema sistem',
      icon: Icons.settings_suggest_rounded,
      color: Colors.blueGrey,
      routeName: '/settings',
      allowedRoles: ['STUDENT', 'PARENT', 'TEACHER', 'EMPLOYEE'],
    ),
  ];

  // Fungsi untuk memfilter menu berdasarkan Role Pengguna
  static List<MenuItemModel> getMenusForRole(String userRole) {
    return allMenus.where((menu) => menu.allowedRoles.contains(userRole)).toList();
  }
}
```

---

## 3. IMPLEMENTASI UI GRID DASHBOARD SINKRON DI FLUTTER

Terapkan visualisasi menu berbentuk Grid Card yang modern, bersih, dan elegan di halaman beranda (`lib/screens/dashboard_screen.dart`):

```dart
// lib/screens/dashboard_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/menu_config.dart';
import '../models/menu_item_model.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final _storage = const FlutterSecureStorage();
  String _userName = "User";
  String _userRole = "STUDENT";
  List<MenuItemModel> _filteredMenus = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadUserInfo();
  }

  // Ambil detail profil hasil login yang tersimpan di HP
  Future<void> _loadUserInfo() async {
    final name = await _storage.read(key: 'user_name') ?? "Sivitas";
    final role = await _storage.read(key: 'user_role') ?? "STUDENT";

    setState(() {
      _userName = name;
      _userRole = role;
      _filteredMenus = MenuConfig.getMenusForRole(role);
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC), // Warna latar belakang netral terang
      appBar: AppBar(
        title: const Text('Portal Mobile Konsol', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Colors.emerald.shade700,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout_rounded),
            onPressed: () async {
              await _storage.deleteAll();
              Navigator.pushReplacementNamed(context, '/login');
            },
          )
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Sambutan Pengguna
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 30),
              decoration: BoxDecoration(
                color: Colors.emerald.shade700,
                borderRadius: const BorderRadius.only(
                  bottomLeft: Radius.circular(24),
                  bottomRight: Radius.circular(24),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Assalamu\'alaikum,', style: TextStyle(color: Colors.emerald.shade100, fontSize: 14)),
                  const SizedBox(height: 5),
                  Text(_userName, style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.white24,
                      borderRadius: BorderRadius.circular(100),
                    ),
                    child: Text(
                      'PERAN: $_userRole',
                      style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 0.5),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 24),
              child: Text(
                'MENU UTAMA SISTEM',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Colors.blueGrey, letterSpacing: 1),
              ),
            ),
            const SizedBox(height: 16),

            // Grid Menu Dinamis
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _filteredMenus.length,
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 1.15,
                ),
                itemBuilder: (context, index) {
                  final menu = _filteredMenus[index];
                  return InkWell(
                    onTap: () {
                      Navigator.pushNamed(context, menu.routeName);
                    },
                    borderRadius: BorderRadius.circular(16),
                    child: Ink(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFE2E8F0)), // Border subtle
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.02),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          )
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: menu.color.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(menu.icon, color: menu.color, size: 24),
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                menu.title,
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF1E293B)),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                menu.description,
                                style: const TextStyle(fontSize: 10, color: Colors.slate500),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          )
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }
}
```

---

## 4. MENYELARASKAN WARNA TEMA SECARA REALTIME DARI SERVER

Aplikasi web Anda menyediakan endpoint pengaturan warna di `/api/v2/mobile/settings`. Di Flutter, Anda dapat meminta konfigurasi ini pada saat aplikasi dimulai untuk menyesuaikan warna tema secara dinamis (Dynamic Color Branding):

```dart
// lib/services/theme_sync_service.dart
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_client.dart';

class ThemeSyncService {
  final ApiClient _apiClient = ApiClient();

  // Tarik pengaturan visual dari API Gateway web
  Future<Color> getPrimaryThemeColor() async {
    final prefs = await SharedPreferences.getInstance();
    
    try {
      final response = await _apiClient.dio.get('/settings');
      if (response.statusCode == 200 && response.data['success'] == true) {
        // Misal mengembalikan string hex seperti "#059669"
        String hexColor = response.data['settings']['mobile_primary_color'] ?? '#059669';
        
        // Simpan cache lokal
        await prefs.setString('cached_primary_color', hexColor);
        return _parseHexColor(hexColor);
      }
    } catch (_) {
      // Abaikan jika offline, gunakan cache lama
    }

    String cachedHex = prefs.getString('cached_primary_color') ?? '#059669';
    return _parseHexColor(cachedHex);
  }

  Color _parseHexColor(String hexString) {
    final buffer = StringBuffer();
    if (hexString.length == 6 || hexString.length == 7) buffer.write('ff');
    buffer.write(hexString.replaceFirst('#', ''));
    return Color(int.parse(buffer.toString(), radix: 16));
  }
}
```

Dengan mengintegrasikan `ThemeSyncService` ini ke dalam `ThemeData` Flutter Anda, perubahan warna branding institusi yang diubah oleh administrator di panel web akan secara otomatis mengubah skema warna UI utama di aplikasi HP pengguna!
