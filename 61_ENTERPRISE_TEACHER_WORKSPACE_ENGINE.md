Lanjutkan project ERP yang sudah ada.

Jangan membuat project baru.
Jangan mengubah modul yang sudah selesai kecuali diperlukan.

Gunakan RBAC, Assignment Engine, KBM Engine, Attendance Engine, Assessment Engine, Auto Leger Engine, Formula Engine, Rapor Engine, Notification Engine, Print Engine, Dashboard Engine, Calendar Engine, Prisma ORM, Laravel API, React dan Tailwind yang sudah ada.

Implementasikan langsung production-ready.

==================================================

TARGET

Refactor menu "KBM Saya" menjadi Enterprise Teacher Workspace.

Satu halaman kerja untuk Guru, Wali Kelas dan Guru Mapel.

Semua data mengikuti Assignment Engine.

Zero Hardcode.

Zero Dummy Data.

==================================================

DASHBOARD GURU

Tampilkan:

- Jadwal Hari Ini
- Kelas Diampu
- Mapel Diampu
- Jam Mengajar
- Tugas Belum Selesai
- Penilaian Belum Diisi
- Absensi Belum Diisi
- Rapor Belum Selesai
- Pengumuman
- Agenda Hari Ini

==================================================

KBM

Guru dapat:

Mulai KBM

Tutup KBM

Jurnal Mengajar

Materi

CP

TP

ATP

Upload Materi

Upload File

Upload Video

Link Pembelajaran

==================================================

ABSENSI

Absen siswa:

QR

Manual

Edit (sesuai izin)

Lihat riwayat

==================================================

PENILAIAN

Input:

Tugas

UH

PTS

PAS

Praktik

Proyek

Observasi

Tahfidz

Diniyah

Ekstrakurikuler

==================================================

AUTO LEGER

Nilai otomatis masuk ke Leger.

Guru tidak perlu input dua kali.

==================================================

RAPOR

Lihat progres rapor.

Isi deskripsi.

Validasi.

Kirim ke Wali Kelas.

==================================================

WALI KELAS

Data siswa

Absensi

Prestasi

Pelanggaran

Catatan

Mutasi

Verifikasi Nilai

Verifikasi Rapor

==================================================

KOMUNIKASI

Kirim pengumuman ke:

Kelas

Siswa

Orang Tua

Guru

==================================================

KALENDER

Sinkron dengan:

KBM

Ujian

Tahfidz

Agenda

Libur

==================================================

LAPORAN

Preview

Print

PDF

Excel

CSV

==================================================

FILTER

Semester

Tahun

Kelas

Mapel

Tanggal

==================================================

RBAC

Guru hanya melihat kelas dan mapel yang diampu.

Wali Kelas hanya kelasnya.

Kepala Sekolah sesuai unit.

Hak akses berasal dari database.

==================================================

API

Gunakan REST API yang sudah ada.

Tambah endpoint bila diperlukan.

==================================================

DATABASE

Gunakan schema Prisma.

Tidak boleh merusak relasi lama.

==================================================

VALIDATION

Tidak ada Hardcode.

Tidak ada Dummy Data.

Tidak ada Duplicate Input.

Semua perubahan otomatis sinkron ke:

Attendance

Assessment

Auto Leger

Rapor

Dashboard

Notification

Audit Trail

Print Center

Flutter Mobile

==================================================

OUTPUT

Bangun Enterprise Teacher Workspace agar seluruh pekerjaan harian guru, wali kelas dan guru mapel dapat dilakukan dari satu halaman yang cepat, sederhana, terintegrasi dan siap produksi.