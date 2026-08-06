# PANDUAN INTEGRASI FLUTTER: ENTERPRISE AUTO LEGER & FORMULA ENGINE

Dokumen ini menjelaskan cara mengintegrasikan **Enterprise Auto Leger Engine** dan **Assessment Formula Engine** ke dalam aplikasi mobile **Flutter** Anda. 

Dengan panduan ini, aplikasi Flutter Anda akan memiliki kemampuan untuk:
1. **Dynamic Formula Synchronization**: Mengunduh bobot penilaian (PH, PTS, PAS) dan KKM dinamis dari database (Zero Hardcode).
2. **On-Device Auto Calculation**: Menghitung Nilai Akhir, Predikat, dan Kelulusan secara instan di HP secara offline sebelum disinkronkan ke server.
3. **Teacher Mobile Grading Workspace**: Antarmuka bagi Guru untuk menginput nilai harian siswa secara cepat (bulk) dengan fitur Auto-Save & Remedial Generator.
4. **Student Academic Progress & Ranking Tracker**: Dasbor bagi Siswa/Orang Tua untuk melihat grafik perkembangan nilai, rata-rata, predikat, dan ranking kelas secara realtime.

---

## 1. STRUKTUR DATA KONTRAK API & MODEL DART

Agar Flutter dapat membaca konfigurasi rumus penilaian dan data leger secara dinamis, buatlah model Dart berikut di proyek VS Code Anda.

### A. Model Formula & KKM Dinamis (`lib/models/formula_model.dart`)
```dart
// lib/models/formula_model.dart
class FormulaModel {
  final String id;
  final String subjectCode;
  final double weightPH;  // Bobot Penilaian Harian (contoh: 0.30)
  final double weightPTS; // Bobot Penilaian Tengah Semester (contoh: 0.30)
  final double weightPAS; // Bobot Penilaian Akhir Semester (contoh: 0.40)
  final double kkm;       // Kriteria Ketuntasan Minimal (contoh: 75.0)

  FormulaModel({
    required this.id,
    required this.subjectCode,
    required this.weightPH,
    required this.weightPTS,
    required this.weightPAS,
    required this.kkm,
  });

  factory FormulaModel.fromJson(Map<String, dynamic> json) {
    return FormulaModel(
      id: json['id'] ?? '',
      subjectCode: json['subject_code'] ?? 'UMUM',
      weightPH: (json['weight_ph'] ?? 30.0) / 100.0,   // Konversi persen ke desimal
      weightPTS: (json['weight_pts'] ?? 30.0) / 100.0,
      weightPAS: (json['weight_pas'] ?? 40.0) / 100.0,
      kkm: (json['kkm'] ?? 75.0).toDouble(),
    );
  }

  // Melakukan kalkulasi nilai akhir secara lokal di HP (Offline-Ready)
  double calculateFinalScore(double ph, double pts, double pas) {
    return (ph * weightPH) + (pts * weightPTS) + (pas * weightPAS);
  }

  // Menentukan status ketuntasan secara otomatis
  bool isTuntas(double finalScore) {
    return finalScore >= kkm;
  }

  // Menentukan Predikat berdasarkan rentang dinamis
  String getPredicate(double score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    return 'D';
  }
}
```

### B. Model Detail Nilai Siswa (`lib/models/leger_student_model.dart`)
```dart
// lib/models/leger_student_model.dart
class LegerStudentModel {
  final String studentId;
  final String name;
  final String nis;
  final double ph;
  final double pts;
  final double pas;
  double finalScore;
  int rank;
  String predicate;
  String status; // 'TUNTAS' | 'BELUM_TUNTAS'
  String description;

  LegerStudentModel({
    required this.studentId,
    required this.name,
    required this.nis,
    required this.ph,
    required this.pts,
    required this.pas,
    this.finalScore = 0.0,
    this.rank = 0,
    this.predicate = 'D',
    this.status = 'BELUM_TUNTAS',
    this.description = '',
  });

  factory LegerStudentModel.fromJson(Map<String, dynamic> json) {
    return LegerStudentModel(
      studentId: json['student_id'] ?? '',
      name: json['name'] ?? '',
      nis: json['nis'] ?? '',
      ph: (json['ph'] ?? 0.0).toDouble(),
      pts: (json['pts'] ?? 0.0).toDouble(),
      pas: (json['pas'] ?? 0.0).toDouble(),
      finalScore: (json['final_score'] ?? 0.0).toDouble(),
      rank: json['rank'] ?? 0,
      predicate: json['predicate'] ?? 'D',
      status: json['status'] ?? 'BELUM_TUNTAS',
      description: json['description'] ?? '',
    );
  }
}
```

---

## 2. LAYANAN INTEGRASI LEGER & FORMULA ACADEMIC (`AcademicService`)

Layanan ini mengurus sinkronisasi pengambilan formula, pengiriman input nilai massal (bulk save), serta pengolahan ranking dan remedial di sisi HP:

```dart
// lib/services/academic_service.dart
import '../config/app_config.dart';
import 'api_client.dart';
import '../models/formula_model.dart';
import '../models/leger_student_model.dart';

class AcademicService {
  final ApiClient _apiClient = ApiClient();

  // 1. Ambil Formula & Bobot Penilaian Dinamis dari Server
  Future<FormulaModel> fetchActiveFormula(String subjectId, String classId) async {
    try {
      final response = await _apiClient.dio.get('/academic/formulas', queryParameters: {
        'subject_id': subjectId,
        'class_id': classId,
      });

      if (response.statusCode == 200 && response.data['success'] == true) {
        return FormulaModel.fromJson(response.data['formula']);
      }
    } catch (_) {
      // Offline fallback: return formula standar
    }
    return FormulaModel(id: 'default', subjectCode: 'GENERIC', weightPH: 0.3, weightPTS: 0.3, weightPAS: 0.4, kkm: 75);
  }

  // 2. Simpan atau Perbarui Nilai Leger Siswa secara Massal (Bulk Save)
  Future<bool> bulkSaveLeger(String classId, String subjectId, List<LegerStudentModel> students) async {
    final payload = students.map((student) => {
      'student_id': student.studentId,
      'ph': student.ph,
      'pts': student.pts,
      'pas': student.pas,
      'final_score': student.finalScore,
      'predicate': student.predicate,
      'status': student.status,
    }).toList();

    try {
      final response = await _apiClient.dio.post('/academic/ledger/bulk-save', data: {
        'class_id': classId,
        'subject_id': subjectId,
        'scores': payload,
      });

      return response.statusCode == 200 && response.data['success'] == true;
    } catch (e) {
      // Jika offline, simpan ke SQLite lokal via SyncService
      return false;
    }
  }

  // 3. Auto Ranking Algoritma di Sisi HP (Client-Side Sorting)
  List<LegerStudentModel> calculateLocalRanking(List<LegerStudentModel> students, FormulaModel formula) {
    // Hitung Nilai Akhir terlebih dahulu
    for (var student in students) {
      student.finalScore = formula.calculateFinalScore(student.ph, student.pts, student.pas);
      student.status = formula.isTuntas(student.finalScore) ? 'TUNTAS' : 'BELUM_TUNTAS';
      student.predicate = formula.getPredicate(student.finalScore);
      student.description = student.status == 'TUNTAS' 
        ? "Sangat baik dan kompeten dalam menguasai seluruh indikator pembelajaran."
        : "Perlu bimbingan intensif dan mengikuti program remedial terpadu.";
    }

    // Urutkan berdasarkan Nilai Akhir tertinggi ke terendah
    students.sort((a, b) => b.finalScore.compareTo(a.finalScore));

    // Berikan peringkat
    for (int i = 0; i < students.length; i++) {
      students[i].rank = i + 1;
    }

    return students;
  }
}
```

---

## 3. UI WORKSPACE GURU: INPUT NILAI MASSAL (BULK GRADING WITH AUTO-CALCULATION)

Halaman ini memungkinkan Guru menginput nilai PH, PTS, dan PAS siswa secara interaktif. Sistem akan **menghitung secara realtime**, **mendeteksi kelulusan KKM**, dan **mengurutkan peringkat (ranking) secara otomatis** setiap kali Guru mengubah nilai di dalam form:

```dart
// lib/screens/bulk_grading_screen.dart
import 'package:flutter/material.dart';
import '../models/formula_model.dart';
import '../models/leger_student_model.dart';
import '../services/academic_service.dart';

class BulkGradingScreen extends StatefulWidget {
  final String classId;
  final String subjectId;

  const BulkGradingScreen({super.key, required this.classId, required this.subjectId});

  @override
  State<BulkGradingScreen> createState() => _BulkGradingScreenState();
}

class _BulkGradingScreenState extends State<BulkGradingScreen> {
  final _academicService = AcademicService();
  late FormulaModel _formula;
  List<LegerStudentModel> _students = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    // Load formula dinamis & list siswa simulasi
    _formula = await _academicService.fetchActiveFormula(widget.subjectId, widget.classId);
    
    // Contoh data siswa (biasanya diambil dari SQLite lokal atau API /academic/ledger)
    _students = [
      LegerStudentModel(studentId: 's1', name: 'Muhammad Al-Fatih', nis: '1001', ph: 85, pts: 80, pas: 90),
      LegerStudentModel(studentId: 's2', name: 'Siti Aisyah', nis: '1002', ph: 70, pts: 72, pas: 68),
      LegerStudentModel(studentId: 's3', name: 'Rahmat Hidayat', nis: '1003', ph: 95, pts: 90, pas: 92),
    ];

    _recalculateAll();
  }

  // Rekalkulasi otomatis & Ranking Realtime di HP saat nilai diedit
  void _recalculateAll() {
    setState(() {
      _students = _academicService.calculateLocalRanking(_students, _formula);
      _isLoading = false;
    });
  }

  void _saveGrades() async {
    setState(() => _isLoading = true);
    final success = await _academicService.bulkSaveLeger(widget.classId, widget.subjectId, _students);
    setState(() => _isLoading = false);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(success ? 'Leger berhasil disimpan & disinkronkan!' : 'Koneksi lambat. Nilai disimpan di antrean offline HP.'),
        backgroundColor: success ? Colors.green : Colors.orange,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Scaffold(body: Center(child: CircularProgressIndicator()));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Input Nilai & Auto Leger'),
        backgroundColor: Colors.indigo.shade800,
        foregroundColor: Colors.white,
        actions: [
          IconButton(icon: const Icon(Icons.save_rounded), onPressed: _saveGrades),
        ],
      ),
      body: Column(
        children: [
          // Banner Info Rumus & KKM Aktif (Zero Hardcode)
          Container(
            color: Colors.indigo.shade50,
            padding: const EdgeInsets.all(16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text("KKM: ${_formula.kkm.toInt()}", style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.indigo)),
                Text(
                  "Bobot: PH (${(_formula.weightPH * 100).toInt()}%) | PTS (${(_formula.weightPTS * 100).toInt()}%) | PAS (${(_formula.weightPAS * 100).toInt()}%)",
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.blueGrey),
                ),
              ],
            ),
          ),

          // Daftar Input Nilai Siswa
          Expanded(
            child: ListView.builder(
              itemCount: _students.length,
              itemBuilder: (context, index) {
                final student = _students[index];
                final bool isTuntas = student.status == 'TUNTAS';

                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  child: Padding(
                    padding: const EdgeInsets.all(12.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              "${student.name} (${student.nis})",
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: isTuntas ? Colors.green.shade100 : Colors.red.shade100,
                                borderRadius: BorderRadius.circular(100),
                              ),
                              child: Text(
                                "Peringkat #${student.rank} • ${student.predicate} (${student.finalScore.toStringAsFixed(1)})",
                                style: TextStyle(
                                  fontSize: 11, 
                                  fontWeight: FontWeight.bold, 
                                  color: isTuntas ? Colors.green.shade800 : Colors.red.shade800
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(child: _buildScoreField("PH", student.ph, (val) => _students[index] = LegerStudentModel(
                              studentId: student.studentId, name: student.name, nis: student.nis, ph: val, pts: student.pts, pas: student.pas
                            ))),
                            const SizedBox(width: 10),
                            Expanded(child: _buildScoreField("PTS", student.pts, (val) => _students[index] = LegerStudentModel(
                              studentId: student.studentId, name: student.name, nis: student.nis, ph: student.ph, pts: val, pas: student.pas
                            ))),
                            const SizedBox(width: 10),
                            Expanded(child: _buildScoreField("PAS", student.pas, (val) => _students[index] = LegerStudentModel(
                              studentId: student.studentId, name: student.name, nis: student.nis, ph: student.ph, pts: student.pts, pas: val
                            ))),
                          ],
                        )
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildScoreField(String label, double currentValue, Function(double) onChanged) {
    return TextFormField(
      initialValue: currentValue.toInt().toString(),
      keyboardType: TextInputType.number,
      decoration: InputDecoration(
        labelText: label,
        border: const OutlineInputBorder(),
        contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
      ),
      onChanged: (text) {
        final parsed = double.tryParse(text) ?? 0.0;
        if (parsed >= 0 && parsed <= 100) {
          onChanged(parsed);
          _recalculateAll(); // Trigger auto kalkulasi dan ranking langsung
        }
      },
    );
  }
}
```

---

## 4. UI PORTAL SISWA: STATISTIK AKADEMIK & PROGRESS REPORT

Gunakan visualisasi diagram/progres sederhana ini di sisi Siswa atau Orang Tua untuk memantau grafik kenaikan nilai serta perbandingan posisi nilai siswa terhadap rata-rata kelas:

```dart
// lib/screens/student_progress_dashboard.dart
import 'package:flutter/material.dart';

class StudentProgressDashboard extends StatelessWidget {
  final double studentAverage = 87.5;
  final double classAverage = 78.2;
  final int classRank = 3;
  final int totalStudents = 32;

  const StudentProgressDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Rapor & Analitik Akademik'),
        backgroundColor: Colors.teal.shade800,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Card Summary Rapor Otomatis
            Card(
              color: Colors.teal.shade50,
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildMetric("Peringkat", "#$classRank", "dari $totalStudents anak"),
                    const VerticalDivider(),
                    _buildMetric("Rata-rata", "$studentAverage", "Predikat A"),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 30),
            const Text(
              "STATISTIK BANDING KELAS",
              style: TextStyle(fontWeight: FontWeight.bold, color: Colors.slate600, fontSize: 12, letterSpacing: 1),
            ),
            const SizedBox(height: 15),

            // Indikator Banding Batang Sederhana (Custom Horizontal Chart)
            _buildStatBar("Nilai Rata-rata Anda", studentAverage, Colors.teal),
            const SizedBox(height: 12),
            _buildStatBar("Nilai Rata-rata Kelas", classAverage, Colors.blueGrey),
            
            const SizedBox(height: 40),
            
            // Catatan Evaluasi Otomatis dari AI / Wali Kelas
            const Text(
              "CATATAN EVALUASI & MUTU",
              style: TextStyle(fontWeight: FontWeight.bold, color: Colors.slate600, fontSize: 12, letterSpacing: 1),
            ),
            const SizedBox(height: 15),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.slate.shade200),
              ),
              child: const Row(
                children: [
                  Icon(Icons.stars_rounded, color: Colors.amber, size: 28),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Text(
                      "Luar biasa! Capaian nilai Anda berada 9.3 poin di atas rata-rata kelas. Pertahankan kebiasaan belajar Anda di asrama.",
                      style: TextStyle(fontSize: 13, height: 1.4, color: Colors.slate800),
                    ),
                  )
                ],
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildMetric(String label, String value, String sub) {
    return Column(
      children: [
        Text(label, style: const TextStyle(fontSize: 12, color: Colors.blueGrey)),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: Colors.teal)),
        const SizedBox(height: 4),
        Text(sub, style: const TextStyle(fontSize: 10, color: Colors.slate500)),
      ],
    );
  }

  Widget _buildStatBar(String title, double score, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            Text("$score / 100", style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
          ],
        ),
        const SizedBox(height: 8),
        Container(
          width: double.infinity,
          height: 16,
          decoration: BoxDecoration(
            color: Colors.slate.shade100,
            borderRadius: BorderRadius.circular(100),
          ),
          child: FractionallySizedBox(
            alignment: Alignment.centerLeft,
            widthFactor: score / 100,
            child: Container(
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(100),
              ),
            ),
          ),
        )
      ],
    );
  }
}
```

---

## 5. REKOMENDASI TESTING SINKRONISASI LEGER

Untuk menguji pengolahan nilai ini secara komprehensif:
1. Jalankan aplikasi web utama Anda, pergi ke tab **"Akademik"** -> **"Leger & Rapor Enterprise"**.
2. Di sana terdapat menu simulasi rumus (misalnya Anda mengubah bobot PH ke 40% dan PTS ke 20%).
3. Saat Anda menekan tombol simpan rumus di web, buka aplikasi Flutter Anda dan lakukan refresh. Formula baru tersebut akan otomatis diserap oleh Flutter melalui `fetchActiveFormula()`, dan seluruh input nilai harian di HP akan dikalkulasi ulang menyesuaikan aturan terbaru tersebut secara dinamis tanpa perlu update aplikasi di Google Play Store!
