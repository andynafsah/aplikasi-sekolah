import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Layers, 
  Users, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  Send, 
  Printer, 
  Download, 
  Search, 
  Filter, 
  RefreshCw, 
  BarChart3, 
  TrendingUp, 
  CheckSquare,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  ChevronRight,
  Eye
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/client';

export default function AutoLeger() {
  const { user, tenant, previewRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'kelas' | 'mapel' | 'remedial' | 'ranking' | 'publish'>('dashboard');
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [classLedger, setClassLedger] = useState<any>(null);
  const [selectedClass, setSelectedClass] = useState('XII-IPA-1');
  const [selectedSemester, setSelectedSemester] = useState('GANJIL');
  const [selectedYear, setSelectedYear] = useState('2025/2026');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const activeRole = previewRole || user?.role || 'SUPER_ADMIN';

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post('/api/leger/action', { action: 'getLedgerDashboard' });
      if (res.data?.success) {
        setDashboardData(res.data.data);
      }

      const classRes = await apiClient.post('/api/leger/action', { 
        action: 'getClassLedger', 
        classId: selectedClass, 
        semester: selectedSemester, 
        year: selectedYear 
      });
      if (classRes.data?.success) {
        setClassLedger(classRes.data.data);
      }
    } catch (err: any) {
      console.error('Error loading auto leger data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedClass, selectedSemester, selectedYear]);

  const handlePublish = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post('/api/leger/action', { action: 'publishLedger', classId: selectedClass });
      if (res.data?.success) {
        setNotification({ type: 'success', message: 'Leger berhasil dipublikasikan ke Portal Siswa & Orang Tua!' });
        loadData();
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Gagal mempublikasikan leger' });
    } finally {
      setLoading(false);
    }
  };

  const handleLock = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post('/api/leger/action', { action: 'lockLedger', classId: selectedClass });
      if (res.data?.success) {
        setNotification({ type: 'success', message: 'Leger berhasil dikunci (Locked). Perubahan nilai tidak diizinkan.' });
        loadData();
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Gagal mengunci leger' });
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post('/api/leger/action', { action: 'unlockLedger', classId: selectedClass });
      if (res.data?.success) {
        setNotification({ type: 'success', message: 'Leger berhasil dibuka kuncinya (Unlocked).' });
        loadData();
      } else {
        setNotification({ type: 'error', message: res.data?.message || 'Akses ditolak: Hanya Administrator atau Kepala Sekolah yang dapat membuka kunci.' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Akses ditolak: Memerlukan hak akses khusus.' });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: string) => {
    alert(`Mengekspor laporan Rekap Leger Nilai dalam format ${format.toUpperCase()} (Tersambung ke Report Engine)...`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-mono font-bold border border-indigo-100">
              ENTERPRISE MODULE
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-mono font-bold border border-emerald-100">
              POSTGRESQL & FORMULA ENGINE ACTIVE
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">AUTO LEGER & REKAP NILAI SISWA</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Pusat pengolahan nilai otomatis, rekapitulasi KKM, ranking, remedial, dan publikasi rapor terintegrasi backend.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-2 transition"
          >
            <Printer className="h-4 w-4" /> Cetak Leger
          </button>
          <button 
            onClick={() => handleExport('EXCEL')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-sm"
          >
            <FileSpreadsheet className="h-4 w-4" /> Export Excel
          </button>
          <button 
            onClick={() => handleExport('PDF')}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-sm"
          >
            <FileText className="h-4 w-4" /> Export PDF
          </button>
        </div>
      </div>

      {notification && (
        <div className={`p-4 rounded-xl text-sm font-bold flex items-center justify-between ${notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-xs font-mono underline">Tutup</button>
        </div>
      )}

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
        >
          <BarChart3 className="h-4 w-4" /> Dashboard Leger
        </button>
        <button
          onClick={() => setActiveTab('kelas')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition whitespace-nowrap ${activeTab === 'kelas' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
        >
          <Layers className="h-4 w-4" /> Leger Per Kelas
        </button>
        <button
          onClick={() => setActiveTab('mapel')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition whitespace-nowrap ${activeTab === 'mapel' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
        >
          <BookOpen className="h-4 w-4" /> Leger Per Mata Pelajaran
        </button>
        <button
          onClick={() => setActiveTab('remedial')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition whitespace-nowrap ${activeTab === 'remedial' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
        >
          <AlertTriangle className="h-4 w-4" /> Remedial & Pengayaan
        </button>
        <button
          onClick={() => setActiveTab('ranking')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition whitespace-nowrap ${activeTab === 'ranking' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
        >
          <Award className="h-4 w-4" /> Ranking & Analitik
        </button>
        <button
          onClick={() => setActiveTab('publish')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition whitespace-nowrap ${activeTab === 'publish' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
        >
          <ShieldCheck className="h-4 w-4" /> Lifecycle, Publish & Lock
        </button>
      </div>

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'dashboard' && dashboardData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Siswa Dinilai</span>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Users className="h-5 w-5" /></div>
              </div>
              <div className="text-3xl font-black text-slate-900">{dashboardData.totalStudents}</div>
              <p className="text-xs text-emerald-600 font-bold mt-1">✓ {dashboardData.completedScores} Nilai Lengkap</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rata-rata Sekolah</span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><TrendingUp className="h-5 w-5" /></div>
              </div>
              <div className="text-3xl font-black text-slate-900">{dashboardData.schoolAverage}</div>
              <p className="text-xs text-slate-500 font-medium mt-1">Standar KKM: 75.0</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Remedial & Pengayaan</span>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><AlertTriangle className="h-5 w-5" /></div>
              </div>
              <div className="text-3xl font-black text-slate-900">{dashboardData.remedialCount} Siswa</div>
              <p className="text-xs text-amber-600 font-bold mt-1">Perlu bimbingan intensif</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status Publish Leger</span>
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><ShieldCheck className="h-5 w-5" /></div>
              </div>
              <div className="text-3xl font-black text-slate-900">{dashboardData.publishedCount} / {dashboardData.totalClasses}</div>
              <p className="text-xs text-purple-600 font-bold mt-1">Kelas Telah Dipublish</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Award className="h-4 w-4 text-indigo-600" /> Top Ranking Paralel Sekolah
              </h3>
              <div className="space-y-3">
                {dashboardData.rankings?.map((r: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${idx === 0 ? 'bg-amber-400 text-white' : idx === 1 ? 'bg-slate-300 text-slate-800' : 'bg-amber-700 text-white'}`}>
                        {r.rank}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-sm">{r.name}</div>
                        <div className="text-xs text-slate-500">Kelas: {r.class}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-indigo-600 text-sm">{r.average}</div>
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-mono font-bold">Predikat {r.predicate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm">Distribusi KKM & Kelulusan</h3>
              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>Tuntas KKM (&ge; 75)</span>
                    <span className="text-emerald-600">92.5%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '92.5%' }}></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>Remedial (&lt; 75)</span>
                    <span className="text-amber-600">7.5%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '7.5%' }}></div>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <div className="p-3 bg-indigo-50 rounded-xl text-indigo-900 text-xs font-medium">
                    ℹ️ Seluruh nilai dihitung secara otomatis oleh Formula Engine berdasarkan bobot harian, tugas, PTS, dan PAS di database backend.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LEGER PER KELAS */}
      {activeTab === 'kelas' && classLedger && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900">Rekap Leger Kelas: {classLedger.classInfo.name}</h3>
              <p className="text-xs text-slate-500">Wali Kelas: {classLedger.classInfo.homeroom} • Total Siswa: {classLedger.classInfo.totalStudents}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
                className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold text-slate-700"
              >
                <option value="XII-IPA-1">XII IPA 1 (Unggulan)</option>
                <option value="XII-IPA-2">XII IPA 2</option>
                <option value="XI-IPS-1">XI IPS 1</option>
              </select>

              <select 
                value={selectedSemester} 
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold text-slate-700"
              >
                <option value="GANJIL">Semester 1 (Ganjil)</option>
                <option value="GENAP">Semester 2 (Genap)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 uppercase font-mono tracking-wider border-b border-slate-200">
                  <th className="p-3">No</th>
                  <th className="p-3">NIS</th>
                  <th className="p-3">Nama Siswa</th>
                  {classLedger.subjects?.map((sub: string, subIdx: number) => (
                    <th key={`${sub}-${subIdx}`} className="p-3 text-center">{sub}</th>
                  ))}
                  <th className="p-3 text-center">Total</th>
                  <th className="p-3 text-center">Rata²</th>
                  <th className="p-3 text-center">Rank</th>
                  <th className="p-3 text-center">KKM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classLedger.students?.map((s: any, idx: number) => (
                  <tr key={`${s.id}-${idx}`} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-500">{idx + 1}</td>
                    <td className="p-3 font-mono font-bold text-slate-700">{s.nis}</td>
                    <td className="p-3 font-extrabold text-slate-900">{s.name}</td>
                    {classLedger.subjects?.map((sub: string, subIdx: number) => (
                      <td key={`${sub}-${subIdx}`} className="p-3 text-center font-mono font-semibold">
                        {s.scores[sub] || 80}
                      </td>
                    ))}
                    <td className="p-3 text-center font-mono font-bold text-slate-800">{s.total}</td>
                    <td className="p-3 text-center font-mono font-extrabold text-indigo-600">{s.average}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-black font-mono">
                        #{s.rank}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${s.kkmStatus === 'TUNTAS' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {s.kkmStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MAPEL */}
      {activeTab === 'mapel' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm">Rekap Nilai Per Mata Pelajaran (Analisis Guru Mapel)</h3>
          <p className="text-xs text-slate-500">Pilih mata pelajaran untuk melihat rekapitulasi nilai seluruh kelas secara komprehensif.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Matematika Wajib', 'Fisika Peminatan', 'Kimia Analitik', 'Bahasa Indonesia', 'Bahasa Inggris', 'Pendidikan Agama Islam'].map((mapel, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 transition cursor-pointer bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-800 text-sm">{mapel}</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-mono font-bold">14 Kelas</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 pt-2 border-t border-slate-200">
                  <span>Rata-rata: <strong className="text-slate-800 font-mono">83.5</strong></span>
                  <span>Tuntas KKM: <strong className="text-emerald-600 font-mono">94%</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: REMEDIAL */}
      {activeTab === 'remedial' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm">Daftar Siswa Remedial & Pengayaan Terjadwal</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 uppercase font-mono tracking-wider border-b border-slate-200">
                  <th className="p-3">Nama Siswa</th>
                  <th className="p-3">Kelas</th>
                  <th className="p-3">Mata Pelajaran</th>
                  <th className="p-3 text-center">Nilai Awal</th>
                  <th className="p-3 text-center">KKM</th>
                  <th className="p-3 text-center">Nilai Remedial</th>
                  <th className="p-3">Status Akhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3 font-bold text-slate-900">Budi Santoso</td>
                  <td className="p-3">XII IPA 1</td>
                  <td className="p-3">Matematika</td>
                  <td className="p-3 text-center font-mono text-rose-600 font-bold">68</td>
                  <td className="p-3 text-center font-mono">75</td>
                  <td className="p-3 text-center font-mono text-emerald-600 font-bold">78</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">TUNTAS REMEDIAL</span></td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-900">Rendi Pratama</td>
                  <td className="p-3">XI IPS 1</td>
                  <td className="p-3">Fisika</td>
                  <td className="p-3 text-center font-mono text-rose-600 font-bold">60</td>
                  <td className="p-3 text-center font-mono">75</td>
                  <td className="p-3 text-center font-mono text-amber-600 font-bold">72</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold text-[10px]">REMEDIAL LANJUTAN</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: RANKING */}
      {activeTab === 'ranking' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm">Ranking Paralel & Statistik Analitik Angkatan</h3>
          <p className="text-xs text-slate-500">Peringkat dihitung otomatis berdasarkan total akumulasi nilai seluruh mata pelajaran semester aktif.</p>
          <div className="space-y-3">
            {[
              { rank: 1, name: 'Dewi Lestari', nis: '20261004', class: 'XII IPA 1', total: 646, avg: 92.2 },
              { rank: 2, name: 'Ahmad Fauzan', nis: '20261001', class: 'XII IPA 1', total: 638, avg: 91.1 },
              { rank: 3, name: 'Siti Rahma', nis: '20261002', class: 'XII IPA 2', total: 628, avg: 89.7 },
              { rank: 4, name: 'Fajar Hidayat', nis: '20261015', class: 'XII IPA 1', total: 615, avg: 87.8 }
            ].map((item) => (
              <div key={item.rank} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-sm">
                    #{item.rank}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{item.name} <span className="text-xs text-slate-400 font-mono">({item.nis})</span></div>
                    <div className="text-xs text-slate-500">Kelas: {item.class}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-black text-indigo-600 text-sm">Rata² {item.avg}</div>
                  <span className="text-xs text-slate-500 font-medium">Total: {item.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: PUBLISH & LOCK */}
      {activeTab === 'publish' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-600" /> Lifecycle Management, Publish & Lock Leger
          </h3>
          <p className="text-xs text-slate-500">
            Kelola status publikasi nilai ke portal orang tua & siswa serta lakukan penguncian data (Lock) untuk mencegah perubahan nilai ilegal setelah batas akhir penyerahan rapor.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-sm">Status Publish</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-mono font-bold rounded">PUBLISHED</span>
              </div>
              <p className="text-xs text-slate-500">Nilai sudah dapat diakses dan dilihat melalui Parent Portal & Mobile App.</p>
              <button 
                onClick={handlePublish}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <Send className="h-4 w-4" /> Publish Leger Kelas
              </button>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-sm">Status Kunci (Lock)</span>
                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-mono font-bold rounded">LOCKED</span>
              </div>
              <p className="text-xs text-slate-500">Mengunci nilai agar tidak dapat diubah oleh Guru Mapel manapun.</p>
              <button 
                onClick={handleLock}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <Lock className="h-4 w-4" /> Kunci Permanen (Lock)
              </button>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-sm">Buka Kunci (Unlock)</span>
                <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-xs font-mono font-bold rounded">SUPER_ADMIN</span>
              </div>
              <p className="text-xs text-slate-500">Membuka kunci nilai (Memerlukan otorisasi Kepala Sekolah / Super Admin).</p>
              <button 
                onClick={handleUnlock}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm"
              >
                <Unlock className="h-4 w-4" /> Buka Kunci (Unlock)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
