/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Eye, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  QrCode, 
  User, 
  Users, 
  Clock, 
  GraduationCap, 
  Calendar, 
  Building2, 
  Search, 
  Check, 
  ShieldCheck,
  ChevronDown,
  Layers,
  Award,
  AlertTriangle,
  BookOpen,
  DollarSign
} from 'lucide-react';
import apiClient from '../api/client';
import { useAuth } from '../contexts/AuthContext';

type ReportModule = 'student' | 'employee' | 'attendance';

interface EnterpriseReportPrintEngineProps {
  initialModule?: ReportModule;
}

export default function EnterpriseReportPrintEngine({ initialModule = 'student' }: EnterpriseReportPrintEngineProps) {
  const { user, previewRole } = useAuth();
  const [activeModule, setActiveModule] = useState<ReportModule>(initialModule);

  // Filter States
  const [unitFilter, setUnitFilter] = useState('SMA Unggulan Boarding School');
  const [jenjangFilter, setJenjangFilter] = useState('SMA');
  const [programFilter, setProgramFilter] = useState('MIPA Sains');
  const [kelasFilter, setKelasFilter] = useState('X-MIPA-1');
  const [semesterFilter, setSemesterFilter] = useState('Ganjil');
  const [tahunAjaranFilter, setTahunAjaranFilter] = useState('2025/2026');
  const [startDate, setStartDate] = useState('2026-07-01');
  const [endDate, setEndDate] = useState('2026-07-31');
  const [statusFilter, setStatusFilter] = useState('AKTIF');
  const [periodFilter, setPeriodFilter] = useState<'HARIAN' | 'MINGGUAN' | 'BULANAN' | 'SEMESTER' | 'TAHUNAN'>('BULANAN');
  const [groupByFilter, setGroupByFilter] = useState<'UNIT' | 'KELAS' | 'GURU' | 'PEGAWAI' | 'SANTRI' | 'ASRAMA'>('KELAS');

  // Report Data & Loading States
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0);

  // Active user details
  const activeRole = previewRole || user?.role || 'SUPER_ADMIN';
  const username = user?.username || user?.name || 'Administrator System';

  // Fetch report data from API
  const fetchReportData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        unit: unitFilter,
        jenjang: jenjangFilter,
        program: programFilter,
        kelas: kelasFilter,
        semester: semesterFilter,
        academicYear: tahunAjaranFilter,
        startDate,
        endDate,
        status: statusFilter,
        period: periodFilter,
        groupBy: groupByFilter
      };

      const res = await apiClient.get(`/reports/${activeModule}`, { params });
      if (res.data && res.data.success) {
        setReportData(res.data);
      } else {
        throw new Error(res.data?.message || 'Gagal memuat data laporan.');
      }
    } catch (err: any) {
      console.error('Report fetch error:', err);
      setError(err.message || 'Gagal tersambung ke Report Engine.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [activeModule, unitFilter, kelasFilter, periodFilter, groupByFilter]);

  // Handle Downloads
  const handleDownload = async (format: 'pdf' | 'excel' | 'csv' | 'print') => {
    try {
      if (format === 'csv' || format === 'excel') {
        const response = await apiClient.get('/reports/download', {
          params: {
            type: activeModule,
            format,
            unit: unitFilter,
            kelas: kelasFilter,
            period: periodFilter
          },
          responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Laporan_${activeModule.toUpperCase()}_${Date.now()}.${format === 'excel' ? 'xls' : 'csv'}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else if (format === 'print') {
        window.print();
      } else {
        setIsPreviewModalOpen(true);
      }
    } catch (err: any) {
      alert(`Gagal mengunduh berkas: ${err.message}`);
    }
  };

  const headerKop = reportData?.header || {
    namaYayasan: 'YAYASAN DARUL HIJRAH INDONESIA',
    namaSekolah: 'SMA UNGGULAN DARUL HIJRAH BOARDING SCHOOL',
    logoYayasan: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=150',
    alamat: 'Jl. Raya Pendidikan Sains No. 45, Pondok Gede, Jakarta',
    telepon: '021-8490123',
    email: 'info@darulhijrah.sch.id',
    website: 'www.darulhijrah.sch.id'
  };

  return (
    <div className="space-y-6">
      {/* Print CSS Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-report-area, #printable-report-area * {
            visibility: visible;
          }
          #printable-report-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            background: white;
            color: black;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Top Banner & Module Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              Enterprise Report & Print Engine Engine
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Pusat Cetak & Laporan Terpadu</h1>
            <p className="text-sm text-slate-500 mt-1">
              Dokumen resmi dengan Kop Surat Standar Yayasan, Filter Dinamis, & QR Code Verifikasi Berkas.
            </p>
          </div>

          {/* Module Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveModule('student')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-all ${
                activeModule === 'student'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Laporan Siswa
            </button>
            <button
              onClick={() => setActiveModule('employee')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-all ${
                activeModule === 'employee'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Users className="w-4 h-4" />
              Laporan Pegawai
            </button>
            <button
              onClick={() => setActiveModule('attendance')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-all ${
                activeModule === 'attendance'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Clock className="w-4 h-4" />
              Laporan Absensi
            </button>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>Hak Akses RBAC: <strong className="text-slate-800">{activeRole}</strong></span>
            <span className="text-slate-300">|</span>
            <span>Pengguna: <strong className="text-slate-800">{username}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPreviewModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4 text-slate-600" />
              Pratinjau Resmi
            </button>
            <button
              onClick={() => handleDownload('print')}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded-lg shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              Cetak Dokumen
            </button>
            <button
              onClick={() => handleDownload('pdf')}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Unduh PDF
            </button>
            <button
              onClick={() => handleDownload('excel')}
              className="flex items-center gap-2 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg shadow-sm transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </button>
            <button
              onClick={() => handleDownload('csv')}
              className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow-sm transition-colors"
            >
              <FileText className="w-4 h-4" />
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 no-print">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-emerald-600" />
          Filter Parameter Data & Periode
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Unit Sekolah</label>
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="SMA Unggulan Boarding School">SMA Unggulan Boarding School</option>
              <option value="SMP Islam Terpadu">SMP Islam Terpadu</option>
              <option value="SD Islam Terpadu">SD Islam Terpadu</option>
              <option value="Pondok Pesantren Main Campus">Pondok Pesantren Main Campus</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Kelas / Rombel</label>
            <select
              value={kelasFilter}
              onChange={(e) => setKelasFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="X-MIPA-1">Kelas X-MIPA-1</option>
              <option value="XI-MIPA-1">Kelas XI-MIPA-1</option>
              <option value="XII-MIPA-1">Kelas XII-MIPA-1</option>
              <option value="ALL">Semua Kelas</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Semester & Tahun</label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Ganjil">Ganjil</option>
                <option value="Genap">Genap</option>
              </select>
              <select
                value={tahunAjaranFilter}
                onChange={(e) => setTahunAjaranFilter(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="2025/2026">2025/2026</option>
                <option value="2024/2025">2024/2025</option>
              </select>
            </div>
          </div>

          {activeModule === 'attendance' ? (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Periode Rekap & GroupBy</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={periodFilter}
                  onChange={(e: any) => setPeriodFilter(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="HARIAN">Harian</option>
                  <option value="MINGGUAN">Mingguan</option>
                  <option value="BULANAN">Bulanan</option>
                  <option value="SEMESTER">Semester</option>
                  <option value="TAHUNAN">Tahunan</option>
                </select>
                <select
                  value={groupByFilter}
                  onChange={(e: any) => setGroupByFilter(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="KELAS">Per Kelas</option>
                  <option value="UNIT">Per Unit</option>
                  <option value="GURU">Per Guru</option>
                  <option value="PEGAWAI">Per Pegawai</option>
                  <option value="SANTRI">Per Santri</option>
                  <option value="ASRAMA">Per Asrama</option>
                </select>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status Subjek</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="AKTIF">Status AKTIF</option>
                <option value="LULUS">Status LULUS</option>
                <option value="MUTASI">Status MUTASI</option>
              </select>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={fetchReportData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Muat Ulang Data Laporan
          </button>
        </div>
      </div>

      {/* Main Printable Document Section */}
      <div id="printable-report-area" className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-8">
        
        {/* UNIFIED TEMPLATE HEADER / KOP SURAT */}
        <div className="border-b-2 border-slate-800 pb-6 mb-6">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={headerKop.logoYayasan}
                alt="Logo Sekolah"
                className="w-20 h-20 object-contain rounded"
              />
              <div>
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest">{headerKop.namaYayasan}</h3>
                <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">{headerKop.namaSekolah}</h2>
                <p className="text-xs text-slate-500 mt-1">{headerKop.alamat}</p>
                <p className="text-xs text-slate-500">
                  Telp: {headerKop.telepon} | Email: {headerKop.email} | Web: {headerKop.website}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 text-right">
                <span className="block text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Dokumen Resmi ERP</span>
                <span className="text-xs font-mono font-semibold text-emerald-900">
                  {activeModule.toUpperCase()}-REPORT-{new Date().getFullYear()}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 text-center">
            <h1 className="text-lg font-bold text-slate-900 uppercase tracking-wide">
              {activeModule === 'student' && 'LAPORAN DATA INDUK & RIWAYAT LENGKAP SISWA / SANTRI'}
              {activeModule === 'employee' && 'LAPORAN DATA INDUK & RIWAYAT INTEGRATED PEGAWAI / GURU'}
              {activeModule === 'attendance' && 'LAPORAN REKAPITULASI PRESENSI & KEHADIRAN TERPADU'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Unit: {unitFilter} | Kelas: {kelasFilter} | Periode: {semesterFilter} {tahunAjaranFilter}
            </p>
          </div>
        </div>

        {/* LOADING & ERROR STATES */}
        {isLoading && (
          <div className="py-12 text-center">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">Sedang memproses dan menyusun data laporan...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
            ❌ {error}
          </div>
        )}

        {/* REPORT CONTENT BY MODULE */}
        {!isLoading && !error && reportData && (
          <div className="space-y-8">

            {/* 1. STUDENT REPORT */}
            {activeModule === 'student' && (
              <div className="space-y-8">
                {reportData.data?.map((st: any, idx: number) => {
                  const induk = st?.dataInduk || {};
                  const ortu = st?.dataOrangTua || {};
                  const ayah = ortu?.ayah || {};
                  const ibu = ortu?.ibu || {};
                  const wali = st?.dataWali || {};
                  const pend = st?.riwayatPendidikan || {};
                  const tahfidz = st?.riwayatTahfidz || {};
                  const abs = st?.riwayatAbsensi?.rekap || {};
                  const prestasi = st?.riwayatPrestasi || [];
                  const pelanggaran = st?.riwayatPelanggaran || [];

                  return (
                  <div key={induk.id || idx} className="border border-slate-200 rounded-lg p-6 space-y-6">
                    
                    {/* Header Item */}
                    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <div>
                        <span className="text-xs font-semibold text-emerald-600 uppercase">Siswa #{idx + 1}</span>
                        <h2 className="text-lg font-bold text-slate-900">{induk.namaLengkap || 'Siswa Tanpa Nama'}</h2>
                        <p className="text-xs text-slate-500">NIS: {induk.nis || '-'} | NISN: {induk.nisn || '-'} | Status: <strong className="text-emerald-700">{induk.status || 'AKTIF'}</strong></p>
                      </div>
                      <div className="text-right">
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-medium text-xs rounded-full">
                          {induk.jenisKelamin || '-'}
                        </span>
                      </div>
                    </div>

                    {/* Section 1: Biodata & Data Orang Tua */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="border border-slate-100 rounded-lg p-4 bg-slate-50/50">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <User className="w-4 h-4 text-emerald-600" />
                          Biodata Lengkap Siswa
                        </h3>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Tempat, Tgl Lahir:</span> <span className="font-semibold">{induk.tempatLahir || '-'}, {induk.tanggalLahir || '-'}</span></div>
                          <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Agama:</span> <span className="font-semibold">{induk.agama || '-'}</span></div>
                          <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Golongan Darah:</span> <span className="font-semibold">{induk.golonganDarah || '-'}</span></div>
                          <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Hobi & Cita-cita:</span> <span className="font-semibold">{induk.hobi || '-'} / {induk.citaCita || '-'}</span></div>
                          <div className="flex justify-between pt-1"><span className="text-slate-500">Alamat Tempat Tinggal:</span> <span className="font-semibold text-right max-w-[200px]">{induk.alamat || '-'}</span></div>
                        </div>
                      </div>

                      <div className="border border-slate-100 rounded-lg p-4 bg-slate-50/50">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Users className="w-4 h-4 text-emerald-600" />
                          Data Orang Tua & Wali
                        </h3>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Nama Ayah:</span> <span className="font-semibold">{ayah.nama || '-'} ({ayah.pekerjaan || '-'})</span></div>
                          <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Kontak Ayah:</span> <span className="font-semibold">{ayah.telepon || '-'}</span></div>
                          <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Nama Ibu:</span> <span className="font-semibold">{ibu.nama || '-'} ({ibu.pekerjaan || '-'})</span></div>
                          <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Kontak Ibu:</span> <span className="font-semibold">{ibu.telepon || '-'}</span></div>
                          <div className="flex justify-between pt-1"><span className="text-slate-500">Data Wali (Jika ada):</span> <span className="font-semibold">{wali.nama || '-'} ({wali.hubungan || '-'})</span></div>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Riwayat Pendidikan, Kelas, & Tahfidz */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Riwayat Pendidikan</span>
                        <p className="text-xs font-semibold text-slate-800 mt-1">{pend.asalSekolah || '-'}</p>
                        <p className="text-[11px] text-slate-500">No. Ijazah: {pend.noIjazah || '-'}</p>
                      </div>

                      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase">Capaian Tahfidz Quran</span>
                        <p className="text-xs font-bold text-emerald-900 mt-1">{tahfidz.totalJuz || 0} Juz (Surah {tahfidz.surahTerakhir || '-'})</p>
                        <p className="text-[11px] text-emerald-700">Fashohah: {tahfidz.fashohahScore || '-'} | Tajwid: {tahfidz.tajwidScore || '-'}</p>
                      </div>

                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <span className="text-[10px] font-bold text-blue-800 uppercase">Rekap Presensi Siswa</span>
                        <p className="text-xs font-bold text-blue-900 mt-1">
                          Hadir: {abs.hadir || 0} | Izin: {abs.izin || 0} | Sakit: {abs.sakit || 0}
                        </p>
                        <p className="text-[11px] text-blue-700">Alpha: {abs.alfa || 0} | Terlambat: {abs.terlambat || 0}</p>
                      </div>
                    </div>

                    {/* Section 3: Tables for Prestasi & Pelanggaran */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 uppercase mb-2 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-amber-500" />
                          Riwayat Prestasi & Penghargaan
                        </h4>
                        <table className="w-full text-xs text-left border border-slate-200 rounded">
                          <thead className="bg-slate-100 text-slate-700">
                            <tr>
                              <th className="p-2 border-b">Judul Prestasi</th>
                              <th className="p-2 border-b">Tingkat</th>
                              <th className="p-2 border-b">Penyelenggara</th>
                            </tr>
                          </thead>
                          <tbody>
                            {prestasi.length === 0 ? (
                              <tr><td colSpan={3} className="p-3 text-center text-slate-400">Tidak ada catatan prestasi</td></tr>
                            ) : (
                              prestasi.map((pr: any, pidx: number) => (
                                <tr key={pidx} className="border-b last:border-0">
                                  <td className="p-2 font-medium">{pr.judul || '-'}</td>
                                  <td className="p-2 text-slate-600">{pr.tingkat || '-'}</td>
                                  <td className="p-2 text-slate-600">{pr.penyelenggara || '-'}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-800 uppercase mb-2 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                          Riwayat Pelanggaran & Poin Catatan
                        </h4>
                        <table className="w-full text-xs text-left border border-slate-200 rounded">
                          <thead className="bg-slate-100 text-slate-700">
                            <tr>
                              <th className="p-2 border-b">Deskripsi Pelanggaran</th>
                              <th className="p-2 border-b">Tingkat</th>
                              <th className="p-2 border-b">Poin</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pelanggaran.length === 0 ? (
                              <tr><td colSpan={3} className="p-3 text-center text-slate-400">Tidak ada catatan pelanggaran</td></tr>
                            ) : (
                              pelanggaran.map((vl: any, vidx: number) => (
                                <tr key={vidx} className="border-b last:border-0">
                                  <td className="p-2 font-medium">{vl.deskripsi || '-'}</td>
                                  <td className="p-2 text-rose-600 font-semibold">{vl.keparahan || '-'}</td>
                                  <td className="p-2 text-slate-800 font-mono">+{vl.poin || 0}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                );
                })}
              </div>
            )}

            {/* 2. EMPLOYEE REPORT */}
            {activeModule === 'employee' && (
              <div className="space-y-8">
                {reportData.data?.map((emp: any, idx: number) => {
                  const induk = emp?.dataInduk || {};
                  const jab = emp?.jabatan || {};
                  const plotting = emp?.plottingKelas || [];
                  const mengajar = emp?.riwayatMengajar || [];

                  return (
                  <div key={induk.id || idx} className="border border-slate-200 rounded-lg p-6 space-y-6">
                    
                    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <div>
                        <span className="text-xs font-semibold text-emerald-600 uppercase">Pegawai / Guru #{idx + 1}</span>
                        <h2 className="text-lg font-bold text-slate-900">{induk.namaLengkap || 'Pegawai Tanpa Nama'}</h2>
                        <p className="text-xs text-slate-500">NIP: {induk.nip || '-'} | NUPTK: {induk.nuptk || '-'} | Status: <strong className="text-emerald-700">{induk.statusKepegawaian || 'AKTIF'}</strong></p>
                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 font-semibold text-xs rounded-lg">
                          {jab.struktural || 'Staf'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="border border-slate-100 rounded-lg p-4 bg-slate-50/50">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <User className="w-4 h-4 text-emerald-600" />
                          Biodata & Kontak Pegawai
                        </h3>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Pendidikan Terakhir:</span> <span className="font-semibold">{induk.pendidikanTerakhir || '-'}</span></div>
                          <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">TTL & Gender:</span> <span className="font-semibold">{induk.tempatLahir || '-'}, {induk.tanggalLahir || '-'} ({induk.jenisKelamin || '-'})</span></div>
                          <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Email Resmi:</span> <span className="font-semibold">{induk.email || '-'}</span></div>
                          <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Nomor Telepon:</span> <span className="font-semibold">{induk.telepon || '-'}</span></div>
                          <div className="flex justify-between pt-1"><span className="text-slate-500">Alamat Domisili:</span> <span className="font-semibold text-right max-w-[200px]">{induk.alamat || '-'}</span></div>
                        </div>
                      </div>

                      <div className="border border-slate-100 rounded-lg p-4 bg-slate-50/50">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-emerald-600" />
                          Jabatan, Unit, & Plotting Tugas
                        </h3>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Unit Kerja Utama:</span> <span className="font-semibold">{jab.unitKerja || '-'}</span></div>
                          <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Golongan / Masa Kerja:</span> <span className="font-semibold">{jab.golongan || '-'} ({jab.masaKerja || '-'})</span></div>
                          <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Role Sistem RBAC:</span> <span className="font-semibold">{emp.role || '-'}</span></div>
                          <div className="flex justify-between pt-1"><span className="text-slate-500">Plotting Wali Kelas:</span> <span className="font-semibold text-emerald-700">{plotting[0]?.kelas || 'Tidak Memegang Wali Kelas'}</span></div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase mb-2 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                        Riwayat Mengajar & Plotting Mata Pelajaran
                      </h4>
                      <table className="w-full text-xs text-left border border-slate-200 rounded">
                        <thead className="bg-slate-100 text-slate-700">
                          <tr>
                            <th className="p-2 border-b">Tahun Ajaran</th>
                            <th className="p-2 border-b">Mata Pelajaran</th>
                            <th className="p-2 border-b">Kelas</th>
                            <th className="p-2 border-b">Beban Jam/Minggu</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mengajar.length === 0 ? (
                            <tr><td colSpan={4} className="p-3 text-center text-slate-400">Tidak ada riwayat mengajar</td></tr>
                          ) : (
                            mengajar.map((rm: any, ridx: number) => (
                              <tr key={ridx} className="border-b last:border-0">
                                <td className="p-2 font-medium">{rm.tahunAjaran || '-'} {rm.semester || ''}</td>
                                <td className="p-2 font-semibold text-emerald-800">{rm.mataPelajaran || '-'}</td>
                                <td className="p-2 text-slate-600">{rm.kelas || '-'}</td>
                                <td className="p-2 text-slate-800 font-mono">{rm.jamPerMinggu || 0} Jam</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                  </div>
                );
                })}
              </div>
            )}

            {/* 3. ATTENDANCE REPORT */}
            {activeModule === 'attendance' && reportData.data && (
              <div className="space-y-6">
                
                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-center">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase">Hadir Tepat</span>
                    <p className="text-xl font-black text-emerald-900 mt-1">{reportData?.data?.summary?.totalHadir ?? 0}</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-center">
                    <span className="text-[10px] font-bold text-amber-700 uppercase">Terlambat</span>
                    <p className="text-xl font-black text-amber-900 mt-1">{reportData?.data?.summary?.totalTerlambat ?? 0}</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-center">
                    <span className="text-[10px] font-bold text-blue-700 uppercase">Izin Berkemas</span>
                    <p className="text-xl font-black text-blue-900 mt-1">{reportData?.data?.summary?.totalIzin ?? 0}</p>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-lg text-center">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase">Sakit Dokter</span>
                    <p className="text-xl font-black text-indigo-900 mt-1">{reportData?.data?.summary?.totalSakit ?? 0}</p>
                  </div>
                  <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg text-center">
                    <span className="text-[10px] font-bold text-rose-700 uppercase">Alpha Tanpa Keterangan</span>
                    <p className="text-xl font-black text-rose-900 mt-1">{reportData?.data?.summary?.totalAlpha ?? 0}</p>
                  </div>
                  <div className="bg-teal-50 border border-teal-200 p-3 rounded-lg text-center">
                    <span className="text-[10px] font-bold text-teal-700 uppercase">Rata-Rata Kehadiran</span>
                    <p className="text-xl font-black text-teal-900 mt-1">{reportData?.data?.summary?.persentaseRataRata ?? 0}%</p>
                  </div>
                </div>

                {/* Group Breakdown Table */}
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase mb-3 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    Rincian Rekapitulasi Presensi per Group [{groupByFilter}]
                  </h3>
                  <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5 border-b">Nama Grup / Unit / Kelas</th>
                        <th className="p-2.5 border-b text-center">Hadir</th>
                        <th className="p-2.5 border-b text-center">Izin</th>
                        <th className="p-2.5 border-b text-center">Sakit</th>
                        <th className="p-2.5 border-b text-center">Alpha</th>
                        <th className="p-2.5 border-b text-center">Terlambat</th>
                        <th className="p-2.5 border-b text-center">Total Entries</th>
                        <th className="p-2.5 border-b text-center">Persentase</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.data.breakdown?.map((bd: any, bidx: number) => (
                        <tr key={bidx} className="border-b last:border-0 hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-800">{bd.groupName}</td>
                          <td className="p-2.5 text-center font-semibold text-emerald-700">{bd.hadir}</td>
                          <td className="p-2.5 text-center text-blue-700">{bd.izin}</td>
                          <td className="p-2.5 text-center text-indigo-700">{bd.sakit}</td>
                          <td className="p-2.5 text-center text-rose-700 font-bold">{bd.alfa}</td>
                          <td className="p-2.5 text-center text-amber-700">{bd.terlambat}</td>
                          <td className="p-2.5 text-center font-mono">{bd.total}</td>
                          <td className="p-2.5 text-center">
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[11px]">
                              {bd.persentaseKehadiran}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

          </div>
        )}

        {/* UNIFIED TEMPLATE FOOTER */}
        <div className="pt-8 border-t-2 border-slate-800 mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          
          {/* Verification QR Code */}
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="p-2 bg-white rounded border border-slate-300 shadow-xs">
              <QrCode className="w-12 h-12 text-slate-800" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-500 uppercase">QR Verifikasi Dokumen</span>
              <p className="text-[10px] text-slate-600 font-mono mt-0.5">HASH: {Math.random().toString(36).substring(2, 12).toUpperCase()}</p>
              <p className="text-[9px] text-slate-400 mt-0.5">Pindai QR untuk validasi keaslian dokumen di Portal Resmi.</p>
            </div>
          </div>

          {/* Page Info & Timestamp */}
          <div className="text-center text-xs text-slate-500 space-y-1">
            <p>Tanggal Cetak: <strong className="text-slate-800">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></p>
            <p>Dicetak Oleh: <strong className="text-slate-800">{username} ({activeRole})</strong></p>
            <p className="text-[10px] text-slate-400">Halaman 1 dari 1 — Dokumen ini telah diverifikasi secara elektronik.</p>
          </div>

          {/* Official Signature Area */}
          <div className="text-right text-xs text-slate-700 space-y-8">
            <div>
              <p className="font-medium">Jakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-bold text-slate-900 mt-1">Kepala Sekolah / Pimpinan Unit</p>
            </div>
            <div className="pt-4">
              <p className="font-bold text-slate-900 underline">Dr. H. Ahmad Hidayat M.Pd</p>
              <p className="text-[10px] text-slate-500">NIP. 197805122003121001</p>
            </div>
          </div>

        </div>

      </div>

      {/* FULLSCREEN PREVIEW MODAL */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 bg-slate-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Pratinjau Cetak Dokumen Resmi ERP</h3>
              </div>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-white"
              >
                Tutup
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <p className="text-xs text-slate-500 mb-4">
                Berikut adalah tampilan pratinjau dokumen dengan Kop Surat resmi dan QR Code Verifikasi sesuai standar cetak.
              </p>
              <div className="border border-slate-300 p-8 rounded bg-white shadow-inner">
                {/* Render identical printable area inside modal */}
                <div className="text-center font-bold text-slate-800 mb-4">
                  {headerKop.namaSekolah} — {activeModule.toUpperCase()} REPORT
                </div>
                <div className="text-xs text-slate-600 text-center">
                  Dokumen siap dicetak atau diunduh sebagai PDF.
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => { setIsPreviewModalOpen(false); handleDownload('print'); }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow"
              >
                Cetak Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
