/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpen, 
  Users, 
  ShieldCheck, 
  Search, 
  GraduationCap, 
  Coins, 
  Building2, 
  Lock, 
  FileText, 
  HeartHandshake, 
  CheckCircle2, 
  HelpCircle, 
  Download, 
  Printer, 
  Copy, 
  Sparkles, 
  ChevronRight, 
  Smartphone, 
  Clock, 
  Zap, 
  Layers, 
  Check, 
  UserCheck, 
  ArrowUpRight,
  ShieldAlert,
  Home
} from 'lucide-react';

export default function UserGuide() {
  const { user, previewRole } = useAuth();

  const normalizeRole = (r: string): string => {
    const raw = r?.toUpperCase()?.replace(/\s+/g, '_') || '';
    if (raw === 'SUPERADMIN' || raw === 'ADMIN' || raw === 'SUPER_ADMIN') return 'SUPER_ADMIN';
    if (raw === 'OWNER' || raw === 'OWNER_YAYASAN') return 'OWNER_YAYASAN';
    if (raw === 'BENDAHARA' || raw === 'BENDAHARA_KEUANGAN' || raw === 'BENDAHARA_SEKOLAH') return 'BENDAHARA_SEKOLAH';
    if (raw === 'OPERATOR' || raw === 'OPS' || raw === 'ADMIN_TU' || raw === 'TU' || raw === 'OPERATOR_SEKOLAH') return 'OPERATOR_SEKOLAH';
    if (raw === 'PRINCIPAL' || raw === 'KEPALA_SEKOLAH') return 'KEPALA_SEKOLAH';
    if (raw === 'TEACHER' || raw === 'USTADZ' || raw === 'GURU') return 'GURU';
    if (raw === 'STUDENT' || raw === 'SISWA' || raw === 'SANTRI') return 'SANTRI';
    if (raw === 'PARENT' || raw === 'ORANG_TUA' || raw === 'WALI_SANTRI') return 'WALI_SANTRI';
    if (raw === 'WALI_KELAS') return 'WALI_KELAS';
    return raw;
  };

  const activeRoleRaw = previewRole || user?.role || '';
  const roleNorm = normalizeRole(activeRoleRaw);
  const isSuperAdmin = roleNorm === 'SUPER_ADMIN';

  // Default selected role is user's active role if not super admin
  const [selectedRole, setSelectedRole] = useState<string>(() => {
    if (isSuperAdmin) return 'ALL';
    return roleNorm || 'ALL';
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Auto update selectedRole when roleNorm or previewRole changes
  useEffect(() => {
    if (!isSuperAdmin) {
      if (roleNorm && roleNorm !== 'SUPER_ADMIN') {
        setSelectedRole(roleNorm);
      } else {
        setSelectedRole('ALL');
      }
    } else {
      setSelectedRole('ALL');
    }
  }, [roleNorm, isSuperAdmin]);

  const allRoles = [
    { id: 'ALL', name: 'Semua Peran Saya', icon: Layers, color: 'bg-slate-100 text-slate-800' },
    { id: 'SUPER_ADMIN', name: 'Super Admin', icon: ShieldCheck, color: 'bg-amber-100 text-amber-900' },
    { id: 'OWNER_YAYASAN', name: 'Pengurus Yayasan', icon: Building2, color: 'bg-purple-100 text-purple-900' },
    { id: 'KEPALA_SEKOLAH', name: 'Kepala Sekolah / Kyai', icon: GraduationCap, color: 'bg-blue-100 text-blue-900' },
    { id: 'BENDAHARA_SEKOLAH', name: 'Bendahara Keuangan', icon: Coins, color: 'bg-emerald-100 text-emerald-900' },
    { id: 'OPERATOR_SEKOLAH', name: 'Operator Sekolah & TU', icon: FileText, color: 'bg-indigo-100 text-indigo-900' },
    { id: 'GURU', name: 'Ustadz / Guru Mapel', icon: Users, color: 'bg-teal-100 text-teal-900' },
    { id: 'WALI_KELAS', name: 'Wali Kelas', icon: UserCheck, color: 'bg-cyan-100 text-cyan-900' },
    { id: 'WALI_SANTRI', name: 'Wali Santri / Orang Tua', icon: HeartHandshake, color: 'bg-rose-100 text-rose-900' },
    { id: 'SANTRI', name: 'Santri / Siswa', icon: Home, color: 'bg-sky-100 text-sky-900' },
  ];

  // Filter out SUPER_ADMIN for non-Super Admin users
  const roles = allRoles.filter(r => {
    if (r.id === 'SUPER_ADMIN' && !isSuperAdmin) return false;
    return true;
  });

  const guideData = [
    {
      roleId: 'SUPER_ADMIN',
      roleTitle: 'Super Admin (Administrator Sistem Utama)',
      badge: 'Akses Akses Penuh Sistem',
      badgeColor: 'bg-amber-500/10 text-amber-700 border-amber-300',
      description: 'Super Admin memegang kendali penuh atas manajemen multi-tenant, konfigurasi RBAC (Akses Menu & Kebijakan), audit log, manajemen database, serta setup awal unit yayasan.',
      responsibilities: [
        'Mengelola hak akses (RBAC) pengguna dan penetapan role.',
        'Mengonfigurasi data master yayasan, unit sekolah, dan kop surat resmi.',
        'Memantau keamanan sistem, audit log aktivitas, dan performa database.',
        'Mengaktifkan integrasi WhatsApp Gateway (Fonnte), Payment Gateway, & AI Copilot.',
        'Melakukan sinkronisasi data dengan sistem Dapodik Kemdikbud.'
      ],
      steps: [
        {
          title: '1. Pengaturan Kop Surat & Identitas Yayasan',
          detail: 'Buka menu "Kop Surat & Unit". Upload logo resmi yayasan, atur nama instansi, alamat, nomor telepon, dan email untuk pencetakan dokumen resmi otomatis.'
        },
        {
          title: '2. Pengelolaan RBAC & Hak Akses Menu',
          detail: 'Masuk ke "RBAC & Hak Akses". Pilih peran pengguna (misal: Guru, Bendahara) dan centang menu mana saja yang diizinkan untuk diakses.'
        },
        {
          title: '3. Audit Trail & Pemantauan Log',
          detail: 'Masuk ke "Sistem & Audit Log" untuk melihat secara real-time aktivitas pengeditan data, login, dan transaksi di seluruh unit.'
        },
        {
          title: '4. Backup & Manajemen Database',
          detail: 'Buka menu "Manajemen Database" untuk memantau status tabel, kapasitas penyimpanan, dan menjalankan ekspor/sinkronisasi backup.'
        }
      ],
      keyFeatures: ['RBAC Configurator', 'Multi-Unit Kop Surat', 'WhatsApp Gateway Setup', 'Audit Log Viewer', 'Dapodik Integration']
    },
    {
      roleId: 'OWNER_YAYASAN',
      roleTitle: 'Pengurus / Ketua Yayasan (Executive Owner)',
      badge: 'Eksekutif Yayasan',
      badgeColor: 'bg-purple-500/10 text-purple-700 border-purple-300',
      description: 'Pengurus Yayasan berfokus pada pengawasan makro keuangan, perkembangan total santri/siswa lintas unit, performa bisnis pendidikan, serta rekomendasi keputusan berbasis AI.',
      responsibilities: [
        'Memantau laporan arus kas (pemasukan vs pengeluaran) seluruh unit yayasan.',
        'Melihat tren pendaftaran PPDB dan pertumbuhan jumlah siswa YoY.',
        'Menerima rekomendasi keputusan strategis dari AI Executive Advisory.',
        'Mengevaluasi laporan kinerja kepala sekolah dan unit operasional.'
      ],
      steps: [
        {
          title: '1. Executive Cockpit Dashboard',
          detail: 'Akses menu Dashboard utama untuk melihat ringkasan keuangan, total siswa, rasio pelunasan SPP, dan indikator kesehatan unit.'
        },
        {
          title: '2. Business Intelligence & DW',
          detail: 'Masuk ke menu "Executive Cockpit & DW" untuk menganalisis grafik performa keuangan bulanan dan komparasi antar unit sekolah.'
        },
        {
          title: '3. Memantau AI Executive Advisory',
          detail: 'Periksa widget AI Advisory pada Dashboard untuk saran otomatis mengenai efisiensi biaya dan strategi penagihan tunggakan.'
        }
      ],
      keyFeatures: ['Multi-Unit Matrix', 'Cash Flow Executive Chart', 'AI Executive Advisory', 'Business Intelligence Dashboard']
    },
    {
      roleId: 'KEPALA_SEKOLAH',
      roleTitle: 'Kepala Sekolah / Kyai Pesantren',
      badge: 'Pimpinan Unit Operasional',
      badgeColor: 'bg-blue-500/10 text-blue-700 border-blue-300',
      description: 'Kepala Sekolah dan Kyai bertanggung jawab mengawasi kelancaran KBM, disiplin presensi guru & santri, pengesahan nilai/rapor, serta kegiatan pengasuhan asrama.',
      responsibilities: [
        'Mengawasi ketercapaian jam mengajar guru dan presensi harian.',
        'Melihat statistik pencapaian tahfidz Al-Quran dan akademik siswa.',
        'Menyetujui dokumen kelulusan, rapor semester, dan pengumuman sekolah.',
        'Mengevaluasi pengadaan sarana & prasarana unit.'
      ],
      steps: [
        {
          title: '1. Pemantauan Presensi KBM',
          detail: 'Buka menu "Smart Attendance" untuk melihat tingkat kehadiran guru dan siswa secara real-time setiap harinya.'
        },
        {
          title: '2. Pengawasan Ploting & Jadwal Mengajar',
          detail: 'Masuk ke menu "Ploting Guru" untuk memverifikasi kesesuaian beban mengajar guru dengan standar kurikulum.'
        },
        {
          title: '3. Verifikasi Rapor & Capaian Santri',
          detail: 'Akses menu "KBM & Absensi" untuk memantau progres penilaian guru dan kesiapan cetak rapor semester.'
        }
      ],
      keyFeatures: ['Monitoring Presensi', 'Monitoring Tahfidz & KBM', 'Verifikasi Rapor', 'Approval Pengadaan']
    },
    {
      roleId: 'BENDAHARA_SEKOLAH',
      roleTitle: 'Bendahara Keuangan (Finance & Cashier)',
      badge: 'Pengelola Keuangan Unit',
      badgeColor: 'bg-emerald-500/10 text-emerald-700 border-emerald-300',
      description: 'Bendahara bertanggung jawab mengelola pembayaran SPP, penetapan tarif iuran, pembuatan invoice massal, penginputan kas masuk/keluar, serta slip gaji karyawan.',
      responsibilities: [
        'Membuat dan menerbitkan invoice SPP/Iuran bulanan siswa.',
        'Mencatat kwitansi pembayaran tunai maupun mentransfer via Payment Gateway.',
        'Mengirim pengingat tagihan SPP otomatis ke WhatsApp Wali Santri.',
        'Mengelola Buku Kas Umum (BKU), Jurnal Umum, dan Laporan Keuangan.',
        'Memproses penggajian guru & staf pada modul HRD Payroll.'
      ],
      steps: [
        {
          title: '1. Penerbitan Tagihan SPP Massal',
          detail: 'Buka menu "Billing & SPP Siswa", klik "Buat Tagihan Massal", pilih angkatan/kelas dan bulan tagihan, lalu klik Terbitkan.'
        },
        {
          title: '2. Pembayaran & Cetak Kwitansi',
          detail: 'Cari nama siswa di "Billing & SPP Siswa", klik "Bayar", pilih metode (Tunai/Transfer), lalu cetak Kwitansi Resmi bermaterai/berlogo.'
        },
        {
          title: '3. Kirim Pengingat WhatsApp',
          detail: 'Klik tombol "Blast Pengingat WA" untuk mengirimkan pesan tagihan SPP beserta rincian ke nomor WhatsApp Orang Tua.'
        },
        {
          title: '4. Pencatatan Pengeluaran Kas',
          detail: 'Buka menu "Akuntansi & Ledger", buat entri Kas Keluar untuk operasional (listrik, pemeliharaan, dll) lengkap dengan kuitansi lampiran.'
        }
      ],
      keyFeatures: ['Billing SPP Massal', 'WhatsApp Billing Blast', 'Kwitansi Digital & Print', 'Buku Kas Umum (BKU)', 'Payroll Gaji']
    },
    {
      roleId: 'OPERATOR_SEKOLAH',
      roleTitle: 'Operator Sekolah & Tata Usaha (TU)',
      badge: 'Administrasi Data Master',
      badgeColor: 'bg-indigo-500/10 text-indigo-700 border-indigo-300',
      description: 'Operator dan Staf TU mengelola administrasi data siswa/guru, nomor induk (NISN/NUPTK), pembuatan surat-menyurat resmi, serta integrasi data Dapodik Kemdikbud.',
      responsibilities: [
        'Menginput dan memutakhirkan data biodata siswa, guru, dan staf.',
        'Mengelola penerimaan siswa baru (PPDB & Seleksi).',
        'Membuat surat keputusan, surat keterangan aktif sekolah, & persuratan TU.',
        'Melakukan pemetaan rombel, plotting mata pelajaran, dan validasi Dapodik.'
      ],
      steps: [
        {
          title: '1. Entri & Update Data Siswa/Guru',
          detail: 'Akses menu "Sivitas & Siswa" atau "Guru & Karyawan" untuk menambah data baru atau melakukan impor Excel secara massal.'
        },
        {
          title: '2. Pengelolaan Persuratan TU',
          detail: 'Buka menu "Manajemen Tata Usaha", pilih "Buat Surat Baru", gunakan template otomatis (Surat Keterangan, Izin, Mutasi), lalu cetak/unduh PDF.'
        },
        {
          title: '3. Validasi & Sinkronisasi Dapodik',
          detail: 'Akses menu "Persiapan Dapodik" untuk mengecek duplikasi NISN, kelengkapan NUPTK, dan sinkronisasi berkala.'
        }
      ],
      keyFeatures: ['Impor Excel Data Master', 'Generator Surat Otomatis', 'Validasi Dapodik', 'Manajemen Rombel & Ploting']
    },
    {
      roleId: 'GURU',
      roleTitle: 'Ustadz / Guru Mata Pelajaran',
      badge: 'Pendidik & pengajar',
      badgeColor: 'bg-teal-500/10 text-teal-700 border-teal-300',
      description: 'Guru mata pelajaran berfokus pada pelaksanaan KBM, pencatatan absensi harian kelas, penginputan nilai harian/UTS/UAS, serta pelaksanaan kelas virtual.',
      responsibilities: [
        'Mencatat kehadiran siswa di setiap sesi tatap muka KBM.',
        'Menginput bobot nilai harian, tugas, UTS, dan UAS.',
        'Menyusun modul ajar, materi pembelajaran, dan kuis online.',
        'Melaksanakan pertemuan tatap muka virtual via Virtual Classroom.'
      ],
      steps: [
        {
          title: '1. Akses Workspace KBM Guru',
          detail: 'Buka menu "KBM Saya (Guru)" untuk melihat jadwal mengajar hari ini dan daftar kelas bimbingan.'
        },
        {
          title: '2. Input Absensi Jam Pelajaran',
          detail: 'Pilih kelas mengajar, tandai status siswa (Hadir, Izin, Sakit, Alpa), lalu klik Simpan Absensi.'
        },
        {
          title: '3. Input Nilai & Evaluasi Siswa',
          detail: 'Pilih mata pelajaran, buka lembar nilai, input angka kuis/UTS/UAS, dan masukkan catatan perkembangan akademik.'
        }
      ],
      keyFeatures: ['Workspace KBM Guru', 'Presensi Jam Pelajaran', 'Input Nilai Raport', 'Virtual Classroom & Meet']
    },
    {
      roleId: 'WALI_KELAS',
      roleTitle: 'Wali Kelas / Guru Pendamping',
      badge: 'Pembimbing Rombel',
      badgeColor: 'bg-cyan-500/10 text-cyan-700 border-cyan-300',
      description: 'Wali Kelas mendampingi perkembangan akademik dan karakter satu rombel, melakukan rekapitulasi presensi bulanan, serta memfinalisasi cetak Rapor Semester.',
      responsibilities: [
        'Memantau rekap kehadiran dan kedisiplinan siswa di kelasnya.',
        'Menginput narasi catatan Wali Kelas dan perkembangan ekstrakurikuler.',
        'Memeriksa kelengkapan nilai dari seluruh guru mata pelajaran.',
        'Mencetak atau menerbitkan Rapor Digital ke Parent Portal.'
      ],
      steps: [
        {
          title: '1. Rekap Nilai & Catatan Wali Kelas',
          detail: 'Akses menu "KBM & Absensi", pilih tab Wali Kelas, lengkapi deskripsi sikap, kegiatan ekstrakurikuler, dan catatan motivasi.'
        },
        {
          title: '2. Cetak & Menerbitkan Rapor Digital',
          detail: 'Setelah semua nilai lengkap, lakukan penguncian nilai dan klik "Cetak Rapor PDF" atau publish ke aplikasi Orang Tua.'
        }
      ],
      keyFeatures: ['Rekapitulasi Rombel', 'Catatan Sikap & Ekstra', 'Publish Rapor Digital', 'Komunikasi Wali Santri']
    },
    {
      roleId: 'WALI_SANTRI',
      roleTitle: 'Wali Santri / Orang Tua Murid',
      badge: 'Akses Orang Tua (Mobile/Web)',
      badgeColor: 'bg-rose-500/10 text-rose-700 border-rose-300',
      description: 'Wali Santri mendapatkan akses penuh transparansi mengenai perkembangan hafalan, kedisiplinan presensi, riwayat kesehatan, tagihan SPP, dan Rapor anak.',
      responsibilities: [
        'Memantau kehadiran harian anak di sekolah/pesantren.',
        'Melihat rincian tagihan SPP dan melakukan pembayaran secara langsung.',
        'Menerima pengumuman resmi dan berkomunikasi dengan sekolah.',
        'Melihat pencapaian hafalan Al-Quran dan Rapor Digital.'
      ],
      steps: [
        {
          title: '1. Buka Parent Portal & Tracker',
          detail: 'Masuk ke menu "Parent Portal & Tracker" dari browser atau aplikasi mobile untuk melihat ringkasan anak.'
        },
        {
          title: '2. Pembayaran SPP Online',
          detail: 'Pilih menu "Tagihan SPP", klik Bayar Sekarang menggunakan QRIS, Bank Transfer, atau Virtual Account.'
        },
        {
          title: '3. Memantau Presensi & Tahfidz',
          detail: 'Akses tab "Progres Santri" untuk melihat histori jam presensi, setoran juz hafalan, serta catatan kesehatan.'
        }
      ],
      keyFeatures: ['Parent Portal', 'Cek & Bayar SPP Online', 'Tracker Hafalan Al-Quran', 'Rapor Digital Download']
    },
    {
      roleId: 'SANTRI',
      roleTitle: 'Santri / Siswa',
      badge: 'Akses Peserta Didik',
      badgeColor: 'bg-sky-500/10 text-sky-700 border-sky-300',
      description: 'Siswa dan Santri dapat melihat jadwal pelajaran harian, materi kuis, tugas sekolah, jadwal kamar asrama, serta riwayat presensi harian.',
      responsibilities: [
        'Melihat jadwal KBM harian dan ruang kelas.',
        'Mengakses materi pembelajaran dan mengumpulkan tugas online.',
        'Memeriksa catatan hafalan Al-Quran mandiri.',
        'Membaca pengumuman resmi sekolah/pesantren.'
      ],
      steps: [
        {
          title: '1. Jadwal KBM & Kelas Virtual',
          detail: 'Lihat menu Dashboard / Akademik untuk mengecek jam pelajaran dan link pertemuan tatap muka online.'
        },
        {
          title: '2. Portal Perpustakaan & Modul',
          detail: 'Masuk ke menu Perpustakaan untuk meminjam e-book atau membaca referensi bahan ajar.'
        }
      ],
      keyFeatures: ['Jadwal KBM Live', 'e-Library', 'Tracker Hafalan Mandiri', 'Pengumuman Sekolah']
    }
  ];

  // Common FAQ & Workflows Guide
  const faqs = [
    {
      question: 'Bagaimana cara menambahkan guru atau siswa baru secara massal?',
      answer: 'Operator atau Super Admin dapat membuka menu "Sivitas & Siswa" atau "Guru & Karyawan", klik tombol "Impor Excel", unduh template file .xlsx yang disediakan, isi data sesuai format, lalu unggah kembali untuk diproses secara otomatis.'
    },
    {
      question: 'Bagaimana cara menerbitkan tagihan SPP bulanan ke seluruh wali murid?',
      answer: 'Bendahara Keuangan membuka menu "Billing & SPP Siswa" -> Klik "Buat Tagihan Massal" -> Pilih Angkatan/Kelas dan Bulan -> Klik "Terbitkan". Selanjutnya klik "Blast Pengingat WA" untuk mengirim notifikasi pesan WhatsApp otomatis ke nomor HP orang tua.'
    },
    {
      question: 'Apakah sekolah bisa menggunakan Kop Surat resmi sesuai unit masing-masing (TK/SD/SMP/SMA)?',
      answer: 'Ya! Buka menu "Kop Surat & Unit". Tambahkan unit sekolah (misal: Unit SMP Pesantren) dan unggah logo serta informasi spesifik unit tersebut. Setiap pencetakan kwitansi, surat TU, atau rapor akan otomatis menggunakan Kop Surat unit yang dipilih.'
    },
    {
      question: 'Bagaimana cara menguji tampilan sistem dari sudut pandang peran lain?',
      answer: 'Khusus Super Admin, gunakan fitur "Mode Lihat Sebagai (Role Impersonation)" yang berada di bagian paling atas Dashboard. Pilih peran (misal: Bendahara atau Guru) untuk langsung mensimulasikan visualisasi widget dan hak akses menu.'
    }
  ];

  const availableGuideData = guideData.filter(g => {
    if (!isSuperAdmin) {
      if (g.roleId === 'SUPER_ADMIN') return false;
      if (roleNorm && roleNorm !== 'ALL') {
        if (roleNorm === 'GURU' || roleNorm === 'WALI_KELAS') {
          return g.roleId === 'GURU' || g.roleId === 'WALI_KELAS';
        }
        return g.roleId === roleNorm;
      }
    }
    return true;
  });

  const filteredGuide = availableGuideData.filter(g => {
    const matchRole = selectedRole === 'ALL' || g.roleId === selectedRole;
    const matchSearch = !searchQuery || 
      g.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.responsibilities.some(r => r.toLowerCase().includes(searchQuery.toLowerCase())) ||
      g.steps.some(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.detail.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchRole && matchSearch;
  });

  const handleCopyGuide = () => {
    const textToCopy = availableGuideData.map(g => `
# ${g.roleTitle}
Deskripsi: ${g.description}

Tanggung Jawab Utama:
${g.responsibilities.map(r => `- ${r}`).join('\n')}

Langkah-Langkah Penggunaan:
${g.steps.map(s => `* ${s.title}\n  ${s.detail}`).join('\n')}

Fitur Kunci: ${g.keyFeatures.join(', ')}
    `).join('\n\n-----------------------------------\n\n');

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-sans pb-16">
      
      {/* 1. Page Header */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-blue-400" /> Dokumentasi Resmi &amp; Panduan Pengguna
            </span>
            <span className="text-xs text-slate-400 font-mono">Versi 2.5 Enterprise</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Panduan &amp; Manual Penggunaan Aplikasi per Peran
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Petunjuk operasional lengkap untuk Super Admin, Pengurus Yayasan, Kepala Sekolah, Bendahara, Operator TU, Guru/Ustadz, Wali Kelas, Wali Santri, dan Santri/Siswa.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0 print:hidden">
          <button
            onClick={handleCopyGuide}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-blue-400" />}
            <span>{copied ? 'Tercopy ke Clipboard!' : 'Salin Teks Manual'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Filter & Search Control Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4 print:hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari topik panduan atau fitur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium self-end md:self-center">
            Menampilkan <strong className="text-slate-800">{filteredGuide.length}</strong> dari {availableGuideData.length} Modul Panduan Peran
          </div>
        </div>

        {/* Role Pill Filters */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {roles.map((r) => {
            const Icon = r.icon;
            const isSelected = selectedRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setSelectedRole(r.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{r.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Role Guides Grid Section */}
      <div className="space-y-6">
        {filteredGuide.length === 0 ? (
          <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
            <HelpCircle className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">Panduan tidak ditemukan</h3>
            <p className="text-xs text-slate-400">Tidak ada topik panduan yang cocok dengan kata kunci "{searchQuery}".</p>
          </div>
        ) : (
          filteredGuide.map((item) => (
            <div 
              key={item.roleId} 
              className="bg-white border border-slate-200 rounded-2xl p-6 md:p-7 shadow-sm space-y-6 transition-all hover:border-slate-300"
            >
              {/* Role Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
                    {item.roleTitle}
                  </h2>
                </div>
              </div>

              {/* Role Description */}
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                {item.description}
              </p>

              {/* Responsibilities & Workflow Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left: Responsibilities */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Tanggung Jawab &amp; Fokus Utama</span>
                  </h3>
                  <ul className="space-y-2">
                    {item.responsibilities.map((resp, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right: Key Features */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span>Modul &amp; Fitur Utama yang Diakses</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {item.keyFeatures.map((feat, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200">
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Step-by-Step Procedure */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span>Panduan Langkah-demi-Langkah Operasional</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {item.steps.map((step, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 hover:bg-blue-50/40 border border-slate-200 rounded-xl space-y-1 transition-colors">
                      <h4 className="text-xs font-bold text-slate-800">{step.title}</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{step.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* 4. Common FAQ & Quick Workflows */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-7 shadow-sm space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-indigo-600" />
            <span>Pertanyaan Umum &amp; Solusi Operasional (FAQ)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Jawaban langsung untuk kendala harian dan alur kerja paling sering digunakan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200/90 space-y-2">
              <h3 className="text-xs font-bold text-slate-800 flex items-start gap-2">
                <span className="text-blue-600 shrink-0 font-extrabold">Q:</span>
                <span>{faq.question}</span>
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed pl-5">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Support & Helpdesk Footer */}
      <div className="p-5 bg-slate-900 text-slate-300 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 text-white rounded-xl">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-xs">Butuh Bantuan Lebih Lanjut?</h4>
            <p className="text-[11px] text-slate-400">Tim Helpdesk &amp; Technical Support Siap Membantu 24/7</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-emerald-400 font-bold">WhatsApp Support: +62 812-3456-7890</span>
        </div>
      </div>

    </div>
  );
}
