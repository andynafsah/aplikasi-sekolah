/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserRole } from '../types/index';

export interface DropdownItem {
  value: string;
  label: string;
}

// Enterprise Roles & Target Audiences
export const TARGET_ROLES: { value: UserRole | 'ALL' | 'ALUMNI' | 'STAFF' | 'MUTASI' | 'SATPAM' | 'SANTRI'; label: string }[] = [
  { value: 'ALL', label: 'Semua User' },
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'ADMINISTRATOR', label: 'Administrator' },
  { value: 'YAYASAN', label: 'Ketua Yayasan' },
  { value: 'KEPALA_SEKOLAH', label: 'Kepala Sekolah' },
  { value: 'TU', label: 'Staff TU' },
  { value: 'GURU', label: 'Guru Mapel' },
  { value: 'WALI_KELAS', label: 'Wali Kelas' },
  { value: 'BENDAHARA', label: 'Bendahara Keuangan' },
  { value: 'STAFF', label: 'Pegawai & Staff' },
  { value: 'SANTRI', label: 'Siswa / Santri' },
  { value: 'ORANG_TUA', label: 'Wali Santri' },
  { value: 'ALUMNI', label: 'Alumni' },
  { value: 'SATPAM', label: 'Satpam / Security' }
];

// Target Filters (Dynamic Data Scope & Assignment)
export const FILTER_UNITS: DropdownItem[] = [
  { value: 'ALL', label: 'Semua Unit Pendidikan' },
  { value: 'SD', label: 'SD IT Al-Hikmah' },
  { value: 'SMP', label: 'SMP IT Al-Hikmah' },
  { value: 'SMA', label: 'SMA IT Al-Hikmah' },
  { value: 'MA', label: 'Madrasah Aliyah Tahfidz' }
];

export const FILTER_CLASSES: DropdownItem[] = [
  { value: 'ALL', label: 'Semua Kelas' },
  { value: 'X-A', label: 'Kelas X-A' },
  { value: 'X-B', label: 'Kelas X-B' },
  { value: 'XI-A', label: 'Kelas XI-A' },
  { value: 'XI-B', label: 'Kelas XI-B' },
  { value: 'XII-A', label: 'Kelas XII-A' },
  { value: 'XII-B', label: 'Kelas XII-B' }
];

export const FILTER_COURSES: DropdownItem[] = [
  { value: 'ALL', label: 'Semua Mata Pelajaran' },
  { value: 'MTK', label: 'Matematika' },
  { value: 'ARAB', label: 'Bahasa Arab' },
  { value: 'FIQIH', label: 'Fiqih Islam' },
  { value: 'TAHFIDZ', label: 'Tahfidz Al-Qur\'an' },
  { value: 'ENG', label: 'Bahasa Inggris' }
];

export const FILTER_DORMS: DropdownItem[] = [
  { value: 'ALL', label: 'Semua Asrama' },
  { value: 'UMAR', label: 'Asrama Umar Bin Khattab' },
  { value: 'AISYAH', label: 'Asrama Aisyah binti Abu Bakar' },
  { value: 'FATIMAH', label: 'Asrama Fatimah Az-Zahra' }
];

export const FILTER_YEARS: DropdownItem[] = [
  { value: '2025/2026', label: 'Tahun Ajaran 2025/2026' },
  { value: '2026/2027', label: 'Tahun Ajaran 2026/2027' }
];

export const FILTER_SEMESTERS: DropdownItem[] = [
  { value: 'GANJIL', label: 'Semester Ganjil' },
  { value: 'GENAP', label: 'Semester Genap' }
];

// Smart Template Variables Description
export const SMART_VARIABLES = [
  { key: '{{nama}}', desc: 'Nama lengkap siswa / santri' },
  { key: '{{kelas}}', desc: 'Nama kelas aktif siswa' },
  { key: '{{unit}}', desc: 'Unit sekolah (misal: SMA, SMP)' },
  { key: '{{wali}}', desc: 'Nama lengkap wali santri' },
  { key: '{{tagihan}}', desc: 'Jumlah nominal tagihan jatuh tempo' },
  { key: '{{tanggal}}', desc: 'Tanggal jatuh tempo / tanggal rilis' },
  { key: '{{semester}}', desc: 'Semester aktif (Ganjil/Genap)' },
  { key: '{{tahun}}', desc: 'Tahun ajaran aktif (e.g., 2025/2026)' }
];

// Automation Event Triggers
export const AUTOMATION_TRIGGERS = [
  { value: 'BILLING_DUE', label: 'SPP Jatuh Tempo', category: 'Keuangan' },
  { value: 'GRADE_PUBLISHED', label: 'Nilai Mapel Dipublish', category: 'Akademik' },
  { value: 'REPORT_PUBLISHED', label: 'Rapor Semester Dipublish', category: 'Akademik' },
  { value: 'ATTENDANCE_ALFA', label: 'Absensi Siswa Alfa / Membolos', category: 'Kesiswaan' },
  { value: 'STUDENT_MUTATION', label: 'Mutasi Siswa (Masuk/Keluar)', category: 'Administrasi' },
  { value: 'GRADUATION', label: 'Kelulusan Siswa Resmi', category: 'Kelulusan' },
  { value: 'PPDB_SUBMITTED', label: 'PPDB Pendaftar Baru Masuk', category: 'PPDB' },
  { value: 'NEW_ANNOUNCEMENT', label: 'Pengumuman Baru Diterbitkan', category: 'Umum' },
  { value: 'NEW_OFFICIAL_LETTER', label: 'Surat Keputusan Resmi Baru', category: 'Administrasi' }
];

// Fallback high-fidelity chart stats
export const MOCK_DASHBOARD_STATS = {
  totalBroadcasts: 184,
  whatsappSent: 4235,
  emailSent: 3120,
  pushSent: 8490,
  deliveryRate: 98.6,
  readRate: 85.2,
  failRate: 1.4,
  
  chartData: [
    { date: 'Senin', 'WhatsApp': 240, 'Email': 110, 'Push': 400, 'Reads': 680, 'Fails': 3 },
    { date: 'Selasa', 'WhatsApp': 300, 'Email': 140, 'Push': 450, 'Reads': 810, 'Fails': 5 },
    { date: 'Rabu', 'WhatsApp': 180, 'Email': 90, 'Push': 380, 'Reads': 590, 'Fails': 2 },
    { date: 'Kamis', 'WhatsApp': 410, 'Email': 210, 'Push': 600, 'Reads': 1120, 'Fails': 8 },
    { date: 'Jumat', 'WhatsApp': 320, 'Email': 130, 'Push': 480, 'Reads': 890, 'Fails': 4 },
    { date: 'Sabtu', 'WhatsApp': 150, 'Email': 80, 'Push': 250, 'Reads': 420, 'Fails': 1 },
    { date: 'Minggu', 'WhatsApp': 90, 'Email': 50, 'Push': 180, 'Reads': 290, 'Fails': 0 }
  ]
};

// Mock Attachments
export const ATTACHMENT_TYPES = [
  { extension: 'pdf', label: 'PDF Document', color: 'bg-rose-100 text-rose-700' },
  { extension: 'docx', label: 'Word Document', color: 'bg-blue-100 text-blue-700' },
  { extension: 'xlsx', label: 'Excel Spreadsheet', color: 'bg-emerald-100 text-emerald-700' },
  { extension: 'mp4', label: 'Video Clip', color: 'bg-amber-100 text-amber-700' },
  { extension: 'mp3', label: 'Audio Record', color: 'bg-indigo-100 text-indigo-700' },
  { extension: 'zip', label: 'Compressed ZIP', color: 'bg-slate-100 text-slate-700' }
];

// User assignment scope visualizer helper
export function getUserScopeLabel(role: string): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'Seluruh Lembaga & Cabang Yayasan (Global Scope)';
    case 'ADMINISTRATOR':
      return 'Semua Data Komunikasi Sekolah (Full Admin)';
    case 'KEPALA_SEKOLAH':
      return 'Unit Sekolah Sendiri (Unit Scope)';
    case 'GURU':
      return 'Kelas & Mapel yang Diampu (Assignment Scope)';
    case 'WALI_KELAS':
      return 'Kelas Homeroom Sendiri (Class Scope)';
    case 'BENDAHARA':
      return 'Log & Pengumuman Keuangan (Finance Scope)';
    case 'TU':
      return 'Surat Menyurat & PPDB (Administrative Scope)';
    case 'SANTRI':
    case 'ORANG_TUA':
      return 'Hanya Menerima Pesan Terkait (Read-Only Target)';
    default:
      return 'Akses Terbatas (Scoped Role)';
  }
}
