# PANDUAN INTEGRASI FLUTTER DENGAN ENTERPRISE MOBILE API GATEWAY

Dokumen ini berisi panduan teknis langkah-demi-langkah (tutor) untuk membangun aplikasi mobile **Flutter** (Android & iOS) yang terhubung secara mulus dengan **Enterprise Mobile API Gateway** (`/api/v2/mobile`) sistem Anda.

Panduan ini mencakup:
1. **Konfigurasi Proyek & Dependencies (pubspec.yaml)**
2. **Arsitektur Konektivitas & Keamanan (Multi-Tenancy & JWT)**
3. **Implementasi HTTP Client Kustom dengan Dio (Interceptors & Auto-Refresh Token)**
4. **Implementasi Fitur Offline-First Sync (SQLite/Isar + Queue)**
5. **Kode Integrasi Notifikasi Push (FCM / APNS)**
6. **Contoh Kode Layanan Flutter (Dart Services)**

---

## 1. KONFIGURASI PROYEK & DEPENDENCIES

Tambahkan library berikut ke file `pubspec.yaml` proyek Flutter Anda untuk menangani request HTTP, enkripsi, penyimpanan lokal aman, biometrik, dan database offline:

```yaml
dependencies:
  flutter:
    sdk: flutter

  # HTTP Client Berkinerja Tinggi & Dukungan Interceptors
  dio: ^5.4.0

  # Penyimpanan Lokal Aman untuk Token JWT & Kredensial Sensitif
  flutter_secure_storage: ^9.0.0

  # Penyimpanan Preferensi Aplikasi Cepat (Tema, Bahasa, Cache Ringan)
  shared_preferences: ^2.2.2

  # Otentikasi Biometrik Perangkat (Fingerprint / FaceID)
  local_auth: ^2.1.8

  # Database SQLite Lokal untuk Sinkronisasi Offline-First
  sqflite: ^2.3.0
  path: ^1.8.3

  # Penanganan Push Notifications (jika menggunakan FCM)
  firebase_core: ^2.24.0
  firebase_messaging: ^14.7.10
```

---

## 2. ARSITEKTUR KONEKTIVITAS & KEAMANAN

Untuk dapat berkomunikasi secara aman dengan sistem, aplikasi Flutter harus mematuhi tiga pilar keamanan utama API Gateway:

1. **Multi-Tenancy Isolation**: Setiap request wajib menyertakan header `X-Tenant-ID`. Ini menentukan institusi/yayasan mana yang sedang diakses.
2. **Bearer Authorization JWT**: Akses ke seluruh endpoint privat wajib melampirkan token JWT valid pada header `Authorization: Bearer <token>`.
3. **Automatic Token Refresh**: Jika JWT Token kedaluwarsa (HTTP 401), HTTP Client Flutter harus secara otomatis meminta token baru menggunakan `Refresh Token` sebelum mengulangi request awal.

---

## 3. IMPLEMENTASI HTTP CLIENT (DIO CLIENT)

Berikut adalah implementasi `ApiClient` di Flutter menggunakan **Dio**. Kode ini secara otomatis menyisipkan **Tenant ID**, token **JWT Bearer**, dan menangani **Auto-Refresh Token** saat kedaluwarsa:

```dart
// lib/services/api_client.dart
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiClient {
  final Dio dio = Dio();
  final _storage = const FlutterSecureStorage();
  
  // Ganti dengan URL deployment API Gateway Anda
  static const String baseUrl = 'https://ais-dev-cuu72c5niw56xr2fibir2x-217257253856.asia-east1.run.app';
  static const String tenantId = 'TENANT-YAYASAN-PRO-MAX'; // Ambil dinamis saat setup/login

  ApiClient() {
    dio.options.baseUrl = '$baseUrl/api/v2/mobile';
    dio.options.connectTimeout = const Duration(seconds: 15);
    dio.options.receiveTimeout = const Duration(seconds: 15);

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // 1. Sisipkan Header Multi-Tenancy wajib
          options.headers['X-Tenant-ID'] = tenantId;
          options.headers['Accept'] = 'application/json';

          // 2. Baca JWT Token dari Secure Storage dan sisipkan ke header
          final token = await _storage.read(key: 'jwt_token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException e, handler) async {
          // 3. Tangani Auto-Refresh jika mendapat HTTP 401 Unauthorized
          if (e.response?.statusCode == 401) {
            final refreshToken = await _storage.read(key: 'refresh_token');
            if (refreshToken != null) {
              try {
                // Minta token baru
                final refreshResponse = await Dio().post(
                  '$baseUrl/api/v2/mobile/auth/refresh',
                  data: {'refreshToken': refreshToken},
                  headers: {'X-Tenant-ID': tenantId},
                );

                if (refreshResponse.statusCode == 200 && refreshResponse.data['success'] == true) {
                  final newToken = refreshResponse.data['token'];
                  
                  // Simpan token baru ke Secure Storage
                  await _storage.write(key: 'jwt_token', value: newToken);

                  // Ulangi request asli yang sempat gagal dengan token baru
                  e.requestOptions.headers['Authorization'] = 'Bearer $newToken';
                  final cloneReq = await dio.fetch(e.requestOptions);
                  return handler.resolve(cloneReq);
                }
              } catch (err) {
                // Refresh token kedaluwarsa, paksa user login ulang
                await _storage.deleteAll();
                // Arahkan navigasi ke halaman Login (menggunakan router Anda)
              }
            }
          }
          return handler.next(e);
        },
      ),
    );
  }
}
```

---

## 4. LAYANAN AUTENTIKASI & BIOMETRIK (AUTH SERVICE)

Layanan ini mengelola otentikasi login, logout, serta verifikasi lokal menggunakan sidik jari/FaceID:

```dart
// lib/services/auth_service.dart
import 'package:local_auth/local_auth.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'api_client.dart';

class AuthService {
  final ApiClient _client = ApiClient();
  final _storage = const FlutterSecureStorage();
  final LocalAuthentication _localAuth = LocalAuthentication();

  // Login Standar dengan Username & Password
  Future<bool> login(String username, String password, String deviceUuid) async {
    try {
      final response = await _client.dio.post('/auth/login', data: {
        'username': username,
        'password': password,
        'device_uuid': deviceUuid,
      });

      if (response.statusCode == 200 && response.data['success'] == true) {
        // Simpan kredensial token
        await _storage.write(key: 'jwt_token', value: response.data['token']);
        await _storage.write(key: 'refresh_token', value: response.data['refreshToken']);
        await _storage.write(key: 'user_id', value: response.data['user']['id']);
        await _storage.write(key: 'user_role', value: response.data['user']['role']);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  // Verifikasi Biometrik (Fingerprint / Face ID) di Device
  Future<bool> authenticateBiometrically() async {
    final bool canAuthenticateWithBiometrics = await _localAuth.canCheckBiometrics;
    final bool canAuthenticate = canAuthenticateWithBiometrics || await _localAuth.isDeviceSupported();

    if (!canAuthenticate) return false;

    try {
      return await _localAuth.authenticate(
        localizedReason: 'Silakan verifikasi biometrik Anda untuk masuk ke Konsol',
        options: const AuthenticationOptions(
          biometricOnly: true,
          stickyAuth: true,
        ),
      );
    } catch (e) {
      return false;
    }
  }

  // Logout Perangkat & Bersihkan Sesi Server
  Future<void> logout(String deviceUuid) async {
    try {
      await _client.dio.post('/auth/logout', data: {'device_uuid': deviceUuid});
    } finally {
      await _storage.deleteAll();
    }
  }
}
```

---

## 5. FITUR OFFLINE-FIRST DATABASE & SINKRONISASI (OFFLINE SYNC)

Untuk mendukung kemampuan **Offline-First**, aplikasi Flutter Anda harus menyimpan transaksi lokal di database SQLite saat internet terputus, lalu mengirimkannya ke server saat internet kembali aktif.

### A. Inisialisasi Database SQLite Lokal

```dart
// lib/services/database_helper.dart
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class DatabaseHelper {
  static final DatabaseHelper instance = DatabaseHelper._init();
  static Database? _database;

  DatabaseHelper._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('mobile_app.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(path, version: 1, onCreate: _createDB);
  }

  Future _createDB(Database db, int version) async {
    // Tabel lokal penyimpan antrean offline
    await db.execute('''
      CREATE TABLE local_sync_queue (
        id TEXT PRIMARY KEY,
        module TEXT NOT NULL,
        action TEXT NOT NULL,
        payload TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        is_processed INTEGER DEFAULT 0
      )
    ''');
  }
}
```

### B. Sinkronisasi Antrean ke API Gateway

Gunakan protokol resolusi konflik berikut pada Flutter:
1. **Client Wins for User Logs** (Presensi, Input Nilai): Kirim dengan timestamp lokal agar server langsung menyerapnya sebagai data final.
2. **Server Wins for Master Data** (Rapor, Tagihan SPP): Selalu overwrite penyimpanan offline dengan data terbaru dari server.

```dart
// lib/services/sync_service.dart
import 'dart:convert';
import 'package:uuid/uuid.dart';
import 'database_helper.dart';
import 'api_client.dart';

class SyncService {
  final ApiClient _apiClient = ApiClient();
  final _dbHelper = DatabaseHelper.instance;

  // 1. Simpan transaksi ke SQLite jika perangkat Offline
  Future<void> queueOfflineAction({
    required String module,
    required String action,
    required Map<String, dynamic> payload,
  }) async {
    final db = await _dbHelper.database;
    final id = const Uuid().v4();

    await db.insert('local_sync_queue', {
      'id': id,
      'module': module,
      'action': action,
      'payload': jsonEncode(payload),
      'timestamp': DateTime.now().toIso8601String(),
      'is_processed': 0
    });
    
    // Kirim juga salinan antrean ke server sebagai backup audit
    _apiClient.dio.post('/offline-queue', data: {
      'id': id,
      'module': module,
      'action': action,
      'payload': payload,
    }).catchError((_) {}); // Abaikan jika gagal (offline)
  }

  // 2. Kirim seluruh antrean lokal ke API Gateway saat Online
  Future<void> runSynchronization() async {
    final db = await _dbHelper.database;
    final List<Map<String, dynamic>> queue = await db.query(
      'local_sync_queue',
      where: 'is_processed = ?',
      whereArgs: [0]
    );

    if (queue.isEmpty) return;

    // Siapkan payload batch sinkronisasi
    final List<Map<String, dynamic>> syncPayload = queue.map((item) {
      return {
        'id': item['id'],
        'module': item['module'],
        'action': item['action'],
        'payload': jsonDecode(item['payload']),
        'timestamp': item['timestamp']
      };
    }).toList();

    try {
      final response = await _apiClient.dio.post('/sync', data: {
        'actions': syncPayload
      });

      if (response.statusCode == 200 && response.data['success'] == true) {
        // Hapus item yang berhasil diproses dari SQLite lokal
        for (var item in queue) {
          await db.delete(
            'local_sync_queue',
            where: 'id = ?',
            whereArgs: [item['id']]
          );
        }
        print("Sinkronisasi offline berhasil diselesaikan.");
      }
    } catch (e) {
      print("Sinkronisasi gagal: $e");
    }
  }
}
```

---

## 6. INTEGRASI PUSH NOTIFICATION (EXP/FCM/APNS TO GATEWAY)

Saat aplikasi pertama kali dibuka atau setelah user login, registrasikan FCM / Expo token perangkat ke database terpusat lewat API Gateway:

```dart
// lib/services/notification_service.dart
import 'package:firebase_messaging/firebase_messaging.dart';
import 'api_client.dart';

class NotificationService {
  final ApiClient _apiClient = ApiClient();
  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;

  Future<void> initPushNotifications(String deviceUuid) async {
    // 1. Minta izin Notifikasi ke pengguna (iOS & Android 13+)
    NotificationSettings settings = await _firebaseMessaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      // 2. Dapatkan Push Token unik dari FCM
      String? token = await _firebaseMessaging.getToken();
      
      if (token != null) {
        // 3. Registrasikan Token ke API Gateway
        await _registerTokenWithGateway(deviceUuid, token);
      }

      // Handle token penyegaran berkala
      _firebaseMessaging.onTokenRefresh.listen((newToken) {
        _registerTokenWithGateway(deviceUuid, newToken);
      });
    }
  }

  Future<void> _registerTokenWithGateway(String deviceUuid, String token) async {
    try {
      await _apiClient.dio.post('/push-token/register', data: {
        'device_uuid': deviceUuid,
        'push_token': token,
        'provider': 'FCM' // Atau 'APNS' untuk iOS murni
      });
      print("Push token berhasil didaftarkan ke Gateway.");
    } catch (e) {
      print("Gagal mendaftarkan push token ke Gateway: $e");
    }
  }
}
```

---

## 7. STRUKTUR ENDPOINT & KONTRAK DATA UTAMA

Gunakan referensi pemanggilan ini di Flutter Anda:

| Fitur | Method | Endpoint / Target URL | Deskripsi Kegunaan |
| :--- | :---: | :--- | :--- |
| **Login** | `POST` | `/auth/login` | Otentikasi username + password/PIN, return JWT & User Role. |
| **Refresh** | `POST` | `/auth/refresh` | Mintakan JWT baru menggunakan token penyegar. |
| **Dashboard** | `GET` | `/dashboard` | Menarik ringkasan data finansial, asrama, dan presensi. |
| **Sync Queue** | `POST` | `/sync` | Sinkronisasi batch transaksi offline dari SQLite perangkat. |
| **Register Token**| `POST`| `/push-token/register`| Daftarkan FCM Push Token dari perangkat agar siap menerima pesan. |
| **Profil Santri** | `GET` | `/profile` | Ambil detail profil lengkap, asrama, dan wali kelas. |
| **Settings** | `POST` | `/settings` | Sync preferensi tema & konfigurasi tampilan klien. |
| **Crash Logger** | `POST` | `/crashes/log` | Pelaporan runtime stack-trace crash Flutter ke backend. |

---

## 9. CONTOH IMPLEMENTASI ENDPOINT AKADEMIK

Berikut adalah implementasi Dart untuk endpoint spesifik yang diminta:

### 9.1. Login (/api/v1/auth/login)
```dart
Future<bool> login(String username, String password) async {
  final url = Uri.parse('${ApiClient.baseUrl}/api/v1/auth/login');
  final response = await http.post(
    url,
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({'username': username, 'password': password}),
  );
  
  if (response.statusCode == 200) {
    // Simpan token JWT setelah login sukses
    final data = jsonDecode(response.body);
    await _storage.write(key: 'jwt_token', value: data['token']);
    return true;
  }
  return false;
}
```

### 9.2. Akademik: Subjects (/api/v1/akademik/subjects)
```dart
Future<List<dynamic>> getSubjects() async {
  final url = Uri.parse('${ApiClient.baseUrl}/api/v1/akademik/subjects');
  final response = await http.get(
    url,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer <YOUR_SAVED_TOKEN>',
    },
  );
  
  if (response.statusCode == 200) {
    return jsonDecode(response.body)['data'];
  }
  return [];
}
```

### 9.3. Akademik: Assessment Scores (/api/v1/akademik/assessment/scores)
```dart
Future<List<dynamic>> getAssessmentScores() async {
  final url = Uri.parse('${ApiClient.baseUrl}/api/v1/akademik/assessment/scores');
  final response = await http.get(
    url,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer <YOUR_SAVED_TOKEN>',
    },
  );
  
  if (response.statusCode == 200) {
    return jsonDecode(response.body)['data'];
  }
  return [];
}
```

Untuk menguji seluruh endpoint ini secara visual:
1. Masuk ke aplikasi web Anda.
2. Navigasikan ke panel samping (**Sidebar**) dan pilih menu **"Dashboard"** atau **"Sistem"** -> **"Sivitas"** / **"Tata Usaha"**.
3. Buka halaman **"Virtual Mobile Simulator"** atau tab simulator terpadu untuk menguji integrasi payload 13 aksi secara real-time sebelum menyalinnya ke basis kode Flutter Anda.
