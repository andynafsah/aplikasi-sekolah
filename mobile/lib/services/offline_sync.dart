import 'dart:convert';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:http/http.dart' as http;
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class OfflineSyncService {
  static final OfflineSyncService instance = OfflineSyncService._init();
  static Database? _database;

  OfflineSyncService._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('offline_cache.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDB,
    );
  }

  Future _createDB(Database db, int version) async {
    // 1. Create a cache table for student attendance records
    await db.execute('''
      CREATE TABLE attendance_cache (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        status TEXT NOT NULL,
        date TEXT NOT NULL,
        check_in TEXT,
        check_out TEXT,
        is_synced INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      )
    ''');

    // 2. Create a generic mutation queue table for offline logs
    await db.execute('''
      CREATE TABLE mutation_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        endpoint TEXT NOT NULL,
        method TEXT NOT NULL,
        payload TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    ''');
  }

  /// Caches student attendance locally when working offline
  Future<void> cacheAttendance({
    required String studentId,
    required String status,
    required String date,
    String? checkIn,
    String? checkOut,
  }) async {
    final db = await instance.database;
    final uuid = DateTime.now().millisecondsSinceEpoch.toString();

    // Store in local cache
    await db.insert('attendance_cache', {
      'id': uuid,
      'student_id': studentId,
      'status': status,
      'date': date,
      'check_in': checkIn,
      'check_out': checkOut,
      'is_synced': 0,
      'created_at': DateTime.now().toIso8601String(),
    });

    // Append to mutation queue for synchronization
    await db.insert('mutation_queue', {
      'endpoint': '/api/v1/attendance/register',
      'method': 'POST',
      'payload': jsonEncode({
        'student_id': studentId,
        'status': status,
        'date': date,
        'check_in': checkIn,
        'check_out': checkOut,
      }),
      'created_at': DateTime.now().toIso8601String(),
    });

    print('💾 [OFFLINE-CACHE] Saved attendance locally to SQLite.');
    
    // Attempt automatic sync in background
    triggerAutomaticSync();
  }

  /// Background broker to trigger synchronization when internet is available
  Future<void> triggerAutomaticSync() async {
    final connectivityResult = await Connectivity().checkConnectivity();
    if (connectivityResult == ConnectivityResult.none) {
      print('🔌 [OFFLINE-SYNC] Client is offline. Delaying sync until network restores.');
      return;
    }

    final db = await instance.database;
    final List<Map<String, dynamic>> queue = await db.query(
      'mutation_queue',
      orderBy: 'id ASC',
    );

    if (queue.isEmpty) {
      print('✅ [OFFLINE-SYNC] All cache is synchronized. Queue is empty.');
      return;
    }

    print('📡 [OFFLINE-SYNC] Connection online! Synchronizing ${queue.length} pending records...');

    const String baseUrl = 'https://sekolah-api.com'; // Replace with server host

    for (var item in queue) {
      final int queueId = item['id'];
      final String endpoint = item['endpoint'];
      final String method = item['method'];
      final String payload = item['payload'];

      try {
        final response = await http.post(
          Uri.parse('$baseUrl$endpoint'),
          headers: {'Content-Type': 'application/json'},
          body: payload,
        );

        if (response.statusCode == 200 || response.statusCode == 201) {
          final resJson = jsonDecode(response.body);
          if (resJson['success'] == true) {
            // Delete from queue upon successful sync
            await db.delete(
              'mutation_queue',
              where: 'id = ?',
              whereArgs: [queueId],
            );
            print('🎯 [OFFLINE-SYNC] Successfully synchronized record #$queueId');
          }
        }
      } catch (e) {
        print('⚠️ [OFFLINE-SYNC] Synchronization error for record #$queueId: $e');
        break; // Stop execution loop to preserve queue sequence order (FIFO)
      }
    }
  }
}
