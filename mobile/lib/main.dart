import 'dart:async';
import 'package:flutter/material.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'services/offline_sync.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const EnterpriseSchoolApp());
}

class EnterpriseSchoolApp extends StatelessWidget {
  const EnterpriseSchoolApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Enterprise School Mobile',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal),
        useMaterial3: true,
      ),
      home: const DashboardScreen(),
    );
  }
}

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  late StreamSubscription<ConnectivityResult> _connectivitySubscription;
  String _networkStatus = "Checking...";

  @override
  void initState() {
    super.initState();
    // 1. Trigger sync on start
    OfflineSyncService.instance.triggerAutomaticSync();

    // 2. Listen to active network changes for real-time automatic synchronization
    _connectivitySubscription = Connectivity().onConnectivityChanged.listen((ConnectivityResult result) {
      setState(() {
        if (result == ConnectivityResult.none) {
          _networkStatus = "Offline (Merekam transaksi ke SQLite Lokal)";
        } else {
          _networkStatus = "Online (Melakukan sinkronisasi database otomatis)";
          // Connection restored: sync cached data to backend MySQL
          OfflineSyncService.instance.triggerAutomaticSync();
        }
      });
    });
  }

  @override
  void dispose() {
    _connectivitySubscription.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard Sekolah Terpadu'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Connection Banner
            Card(
              color: _networkStatus.contains("Offline") ? Colors.amber.shade100 : Colors.teal.shade100,
              child: Padding(
                padding: const EdgeInsets.all(12.0),
                child: Row(
                  children: [
                    Icon(
                      _networkStatus.contains("Offline") ? Icons.signal_wifi_off : Icons.wifi,
                      color: _networkStatus.contains("Offline") ? Colors.amber.shade900 : Colors.teal.shade900,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        _networkStatus,
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: _networkStatus.contains("Offline") ? Colors.amber.shade900 : Colors.teal.shade900,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Status Akademik & Presensi',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            ElevatedButton.icon(
              onPressed: () {
                // Simulate taking attendance offline
                OfflineSyncService.instance.cacheAttendance(
                  studentId: "student-uuid-12345",
                  status: "HADIR",
                  date: DateTime.now().toIso8601String().substring(0, 10),
                  checkIn: "07:15",
                );
                
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Presensi berhasil dicatat dalam cache SQLite lokal!')),
                );
              },
              icon: const Icon(Icons.check_circle_outline),
              label: const Text('Simpan Presensi Siswa (Offline Ready)'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                backgroundColor: Colors.teal,
                foregroundColor: Colors.white,
              ),
            ),
            const SizedBox(height: 12),
            const Card(
              child: Padding(
                padding: EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Ketentuan Offline Cache:',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 8),
                    Text('• Flutter dilarang melakukan kompilasi aturan bisnis.'),
                    Text('• SQLite hanya untuk menyimpan antrean mutasi (Attendance/Finance).'),
                    Text('• Saat internet pulih, antrean otomatis disubmit ke MySQL via REST API.'),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
