Lanjutkan project ERP yang sudah ada.

JANGAN membuat project baru.

JANGAN mengubah arsitektur aplikasi.

JANGAN mengubah REST API yang sudah ada.

JANGAN membuat business logic baru di frontend.

Implementasikan langsung dalam bentuk kode production-ready.

========================================================

TARGET

Bangun Enterprise Student Attendance System yang sepenuhnya dinamis, terintegrasi dengan database, REST API, RBAC, Assignment, Scope, jadwal pelajaran, dan seluruh modul akademik.

Seluruh absensi siswa harus menjadi bagian dari sistem ERP dan tersinkron otomatis ke Dashboard, KBM, Leger, Rapor, Analitik Akademik, Portal Orang Tua, dan aplikasi Flutter.

========================================================

METODE ABSENSI

Sistem harus mendukung beberapa metode absensi.

1.

Scan QR Code Kartu Pelajar

2.

Scan Barcode Kartu Pelajar

3.

Input Manual

4.

Import apabila diperlukan

Tidak boleh menggunakan dummy.

========================================================

KARTU PELAJAR

Setiap siswa memiliki:

Nomor Induk

QR Code unik

Barcode unik

Digital Student Card

QR dan Barcode berasal dari database.

Tidak boleh hardcoded.

========================================================

PETUGAS YANG BERHAK MELAKUKAN ABSENSI

Super Admin

Kepala Sekolah

Wakil Kepala

Operator

TU (opsional jika diaktifkan)

Guru

Guru Mapel

Wali Kelas

Guru Piket (jika diaktifkan)

Petugas Piket

Hak akses mengikuti RBAC.

========================================================

ABSENSI OLEH GURU MAPEL

Guru Mapel hanya dapat:

Melihat jadwal mengajarnya.

Melihat kelas yang diampu.

Melihat mata pelajaran yang diampu.

Melakukan absensi hanya pada kelas dan jam pelajaran yang sedang berlangsung.

Tidak boleh mengakses kelas lain.

========================================================

ABSENSI OLEH WALI KELAS

Wali Kelas dapat:

Melihat seluruh siswa pada kelas perwaliannya.

Melakukan absensi manual apabila diperlukan.

Mengubah status absensi sesuai hak akses.

Melihat riwayat absensi kelas.

========================================================

ABSENSI MANUAL

Absensi manual hanya dapat dilakukan oleh:

Wali Kelas

Guru Mapel (untuk kelas yang sedang diajar)

Operator (jika diberikan hak)

TU (jika diberikan hak)

Setiap perubahan wajib mencatat:

User

Tanggal

Jam

Alasan

Device

IP

Audit Trail

========================================================

STATUS KEHADIRAN

Hadir

Terlambat

Izin

Sakit

Alpha

Tugas

Dispensasi

Pulang Cepat

========================================================

VALIDASI

Sebelum absensi disimpan, sistem wajib memvalidasi:

Role

Permission

Assignment

Scope

Academic Year

Semester

Unit

Kelas

Rombel

Jadwal

Mata Pelajaran

Jam Pelajaran

Status siswa

QR/Barcode valid

Tidak boleh terjadi absensi ganda pada sesi yang sama.

========================================================

PROSES SCAN

Guru membuka menu Absensi.

↓

Pilih Kelas.

↓

Pilih Mata Pelajaran.

↓

Pilih Jam Pelajaran.

↓

Buka Scanner.

↓

Scan QR atau Barcode kartu pelajar.

↓

Sistem menampilkan:

Foto

Nama

NIS

Kelas

Rombel

Status Kehadiran

Jam Scan

↓

Konfirmasi otomatis.

↓

Data langsung tersimpan ke database.

↓

Scanner aktif kembali agar guru dapat melanjutkan scan siswa berikutnya tanpa menekan tombol tambahan.

========================================================

ABSENSI MANUAL

Jika kartu pelajar rusak, hilang, atau scanner tidak dapat digunakan:

Guru atau Wali Kelas memilih siswa dari daftar kelas.

Pilih status kehadiran.

Isi alasan jika diperlukan.

Simpan.

Semua aktivitas masuk ke Audit Trail.

========================================================

REKAP

Sistem harus menghasilkan rekap otomatis:

Per Hari

Per Minggu

Per Bulan

Per Semester

Per Tahun

Per Siswa

Per Kelas

Per Wali Kelas

Per Guru

Per Mata Pelajaran

Per Unit

========================================================

LAPORAN

Preview

Print

PDF

Excel

CSV

Filter

Search

Sorting

Pagination

========================================================

INTEGRASI

Setelah absensi berhasil disimpan, data otomatis terhubung ke:

Dashboard

KBM

Jurnal Mengajar

Leger

Rapor

Analitik Akademik

Portal Orang Tua

Portal Siswa

Notifikasi

REST API

Flutter Mobile

========================================================

NOTIFIKASI

Orang tua dapat menerima notifikasi apabila fitur diaktifkan.

Contoh:

Siswa hadir.

Siswa terlambat.

Siswa tidak hadir.

========================================================

KEAMANAN

Semua endpoint wajib memvalidasi:

JWT

RBAC

Permission

Assignment

Scope

Audit Trail

========================================================

LARANGAN

Tidak boleh ada:

Dummy Data

Mock API

Hardcoded Kelas

Hardcoded Guru

Hardcoded Jadwal

Hardcoded Mata Pelajaran

Hardcoded QR

Hardcoded Barcode

Local Storage sebagai sumber data utama

========================================================

OUTPUT

Bangun Enterprise Student Attendance System yang sepenuhnya dinamis, menggunakan QR Code dan Barcode pada kartu pelajar sebagai metode utama absensi, mendukung absensi manual oleh Wali Kelas atau Guru Mapel sesuai hak akses dan jadwal mengajar, seluruh data tersimpan di database melalui REST API, terintegrasi dengan Dashboard, KBM, Leger, Rapor, Analitik Akademik, Portal Orang Tua, dan Flutter Mobile, serta siap digunakan pada lingkungan produksi.