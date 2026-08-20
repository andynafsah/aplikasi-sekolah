import React, { useState } from 'react';
import { Download, FileSpreadsheet, Sparkles, CheckCircle2, Lock, Unlock, Eye, BarChart3, TrendingUp, Award, Printer } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';
import { GradeRecord } from '../../types/teacher';

interface TeacherFinalReportsProps {
  gradesList: GradeRecord[];
}

export default function TeacherFinalReports({ gradesList }: TeacherFinalReportsProps) {
  const [activeSubTab, setActiveSubTab] = useState<'leger' | 'rapor' | 'approval' | 'analitik'>('leger');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(gradesList[0]?.studentId || '');
  const [lockStatus, setLockStatus] = useState<'Draft' | 'Diajukan' | 'Disetujui'>('Draft');
  const [successMsg, setSuccessMsg] = useState('');

  // Sync selectedStudentId with gradesList when data is loaded/updated
  React.useEffect(() => {
    if (gradesList && gradesList.length > 0) {
      const exists = gradesList.some(s => s.studentId === selectedStudentId);
      if (!exists) {
        setSelectedStudentId(gradesList[0].studentId);
      }
    }
  }, [gradesList, selectedStudentId]);

  // Calculate ranks and combinations for Leger
  const ledgerData = [...gradesList].map(student => {
    const finalScore = Math.round((student.summative * 0.4) + (student.pts * 0.2) + (student.pas * 0.4));
    return {
      ...student,
      finalScore
    };
  }).sort((a, b) => b.finalScore - a.finalScore)
    .map((s, idx) => ({ ...s, rank: idx + 1 }));

  const currentRaporStudent = ledgerData.find(s => s.studentId === selectedStudentId) || ledgerData[0];

  // Recharts Analytics data
  const barChartData = ledgerData.map(s => ({
    name: s.name.split(' ')[0], // First name only for clean labels
    'Nilai Formatif': Math.round((s.formative1 + s.formative2) / 2),
    'Nilai Sumatif': s.summative,
    'Kombinasi Rapor': s.finalScore
  }));

  const passCount = ledgerData.filter(s => s.finalScore >= 75).length;
  const failCount = ledgerData.length - passCount;

  const pieChartData = [
    { name: 'Tuntas (>= KKM 75)', value: passCount },
    { name: 'Belum Tuntas (< KKM 75)', value: failCount }
  ];

  const COLORS = ['#10B981', '#EF4444'];

  const handleApplyApproval = (status: 'Draft' | 'Diajukan' | 'Disetujui') => {
    setLockStatus(status);
    setSuccessMsg(`Status persetujuan & penguncian nilai berhasil diubah menjadi: ${status.toUpperCase()}`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('leger')}
          className={`px-4 py-2.5 font-bold text-xs border-b-2 cursor-pointer transition-all ${
            activeSubTab === 'leger' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Leger Nilai Kelas
        </button>
        <button
          onClick={() => setActiveSubTab('rapor')}
          className={`px-4 py-2.5 font-bold text-xs border-b-2 cursor-pointer transition-all ${
            activeSubTab === 'rapor' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Rapor Siswa
        </button>
        <button
          onClick={() => setActiveSubTab('approval')}
          className={`px-4 py-2.5 font-bold text-xs border-b-2 cursor-pointer transition-all ${
            activeSubTab === 'approval' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Approval & Kunci Nilai
        </button>
        <button
          onClick={() => setActiveSubTab('analitik')}
          className={`px-4 py-2.5 font-bold text-xs border-b-2 cursor-pointer transition-all ${
            activeSubTab === 'analitik' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Analitik KBM
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 1. LEGER NILAI KELAS */}
      {activeSubTab === 'leger' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Leger Nilai Gabungan (X MIPA 1)</h3>
              <p className="text-slate-500 text-xs mt-0.5">Rekapitulasi seluruh nilai siswa yang diurutkan secara otomatis berdasarkan peringkat kelas.</p>
            </div>
            <button
              onClick={() => {
                const headers = ['Rank', 'Nama Siswa', 'Rata Formatif', 'PTS', 'PAS', 'Sikap', 'Nilai Rapor'];
                const rows = ledgerData.map(item => [
                  item.rank,
                  `"${item.name}"`,
                  Math.round((item.formative1 + item.formative2) / 2),
                  item.pts,
                  item.pas,
                  `"${item.sikap_spiritual}"`,
                  item.finalScore
                ]);
                const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement('a');
                link.setAttribute('href', encodedUri);
                link.setAttribute('download', `Leger_Nilai_Kelas_X_MIPA_1_${Date.now()}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setSuccessMsg('Berkas Leger Nilai Kelas format spreadsheet (.csv) berhasil diunduh!');
                setTimeout(() => setSuccessMsg(''), 4000);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              Unduh Excel Leger
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50">
                  <th className="py-3 px-4 text-center">Rank</th>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4 text-center">Rata Formatif</th>
                  <th className="py-3 px-4 text-center">PTS</th>
                  <th className="py-3 px-4 text-center">PAS</th>
                  <th className="py-3 px-4 text-center">Sikap</th>
                  <th className="py-3 px-4 text-center">Nilai Rapor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {ledgerData.map((item) => (
                  <tr key={item.studentId} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 text-center">
                      <span className={`h-5 w-5 rounded-full flex items-center justify-center mx-auto text-[10px] font-black ${
                        item.rank === 1 ? 'bg-amber-500 text-white' : item.rank === 2 ? 'bg-slate-300 text-slate-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {item.rank}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{item.name}</td>
                    <td className="py-3.5 px-4 text-center text-slate-600 font-semibold">{Math.round((item.formative1 + item.formative2) / 2)}</td>
                    <td className="py-3.5 px-4 text-center text-slate-500">{item.pts}</td>
                    <td className="py-3.5 px-4 text-center text-slate-500">{item.pas}</td>
                    <td className="py-3.5 px-4 text-center text-slate-600 font-semibold">{item.sikap_spiritual}</td>
                    <td className="py-3.5 px-4 text-center font-bold font-mono text-blue-600 text-sm">{item.finalScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. RAPOR SISWA */}
      {activeSubTab === 'rapor' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-500">Pilih Siswa:</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold focus:bg-white focus:outline-none"
              >
                {ledgerData.map(s => (
                  <option key={s.studentId} value={s.studentId}>{s.name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              Cetak Draf Rapor (PDF)
            </button>
          </div>

          {/* Rapor Card visualizer layout */}
          {currentRaporStudent && (
            <div className="border border-slate-300 rounded-2xl p-6 md:p-8 space-y-6 bg-amber-50/5 shadow-inner max-w-4xl mx-auto font-sans text-xs">
              {/* Header */}
              <div className="text-center space-y-1.5 border-b-2 border-slate-800 pb-4">
                <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide">LAPORAN HASIL BELAJAR SISWA</h4>
                <h5 className="font-bold text-slate-700 text-xs uppercase">SMA UNGGULAN NUSANTARA</h5>
                <p className="text-[10px] text-slate-400 font-mono">Jl. Pendidikan No. 10, Jakarta • Telp: 021-5551234</p>
              </div>

              {/* Identity details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex"><span className="w-24 font-bold text-slate-400">Nama Siswa</span><span className="font-bold text-slate-800">: {currentRaporStudent.name}</span></div>
                  <div className="flex"><span className="w-24 font-bold text-slate-400">NIS / NISN</span><span className="font-mono text-slate-800">: 10240{currentRaporStudent.studentId[currentRaporStudent.studentId.length - 1]} / 0081234567</span></div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex"><span className="w-24 font-bold text-slate-400">Kelas</span><span className="font-bold text-slate-800">: X MIPA 1</span></div>
                  <div className="flex"><span className="w-24 font-bold text-slate-400">Semester</span><span className="font-bold text-slate-800">: 1 (Ganjil) / 2025/2026</span></div>
                </div>
              </div>

              {/* Grades Table */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">A. Nilai Akademik</span>
                <table className="w-full border border-slate-800 border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-800 text-[10px] font-bold text-slate-700 text-center">
                      <th className="py-2.5 px-3 border-r border-slate-800 text-left w-48">Mata Pelajaran</th>
                      <th className="py-2.5 px-3 border-r border-slate-800 w-16">KKM</th>
                      <th className="py-2.5 px-3 border-r border-slate-800 w-16">Nilai</th>
                      <th className="py-2.5 px-3 border-r border-slate-800 w-20">Predikat</th>
                      <th className="py-2.5 px-3 text-left">Capaian Kompetensi / Deskripsi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr className="border-b border-slate-800">
                      <td className="py-3 px-3 font-bold text-slate-800 border-r border-slate-800">Fisika</td>
                      <td className="py-3 px-3 text-center border-r border-slate-800 font-mono">70</td>
                      <td className="py-3 px-3 text-center border-r border-slate-800 font-black text-sm text-blue-700 font-mono">{currentRaporStudent.finalScore}</td>
                      <td className="py-3 px-3 text-center border-r border-slate-800 font-bold">
                        {currentRaporStudent.finalScore >= 90 ? 'A (Sangat Baik)' : currentRaporStudent.finalScore >= 80 ? 'B (Baik)' : 'C (Cukup)'}
                      </td>
                      <td className="py-3 px-3 text-slate-600 leading-relaxed text-[11px]">
                        {currentRaporStudent.finalScore >= 85
                          ? `Menunjukkan penguasaan sangat prima dalam menganalisis Hukum Newton dan menyusun laporan praktikum resultan gaya secara mandiri.`
                          : `Menunjukkan penguasaan memadai dalam memahami konsep dasar Hukum Newton dan membutuhkan bimbingan lanjutan pada bagian percepatan gerak.`}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Attitude and Extracurriculars */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* B. Karakter */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">B. Perkembangan Karakter & Sikap</span>
                  <div className="border border-slate-800 p-4 rounded-xl bg-slate-50 space-y-2">
                    <div className="flex justify-between"><span className="font-bold text-slate-600">Sikap Spiritual:</span> <span className="font-bold text-emerald-600">{currentRaporStudent.sikap_spiritual}</span></div>
                    <div className="flex justify-between"><span className="font-bold text-slate-600">Sikap Sosial:</span> <span className="font-bold text-blue-600">{currentRaporStudent.sikap_sosial}</span></div>
                  </div>
                </div>

                {/* C. Ekskul */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">C. Kegiatan Ekstrakurikuler</span>
                  <div className="border border-slate-800 p-4 rounded-xl bg-slate-50 space-y-2">
                    <div className="flex justify-between"><span className="font-bold text-slate-600">Nama Ekskul:</span> <span className="font-bold text-slate-800">{currentRaporStudent.ekskul_name || 'Pramuka'}</span></div>
                    <div className="flex justify-between"><span className="font-bold text-slate-600">Nilai Huruf:</span> <span className="font-black text-indigo-600 font-mono">{currentRaporStudent.ekskul_grade}</span></div>
                    <p className="text-[10px] text-slate-500 mt-1 italic">&quot;{currentRaporStudent.ekskul_notes || 'Menunjukkan keaktifan tinggi.'}&quot;</p>
                  </div>
                </div>
              </div>

              {/* Counselor's note */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">D. Catatan Wali Kelas</span>
                <div className="border border-slate-800 p-4 rounded-xl bg-slate-50/50">
                  <p className="text-slate-700 italic font-medium leading-relaxed">&quot;{currentRaporStudent.catatan || 'Terus pertahankan motivasi belajar tinggi ini untuk menghadapi semester genap.'}&quot;</p>
                </div>
              </div>

              {/* Signatures */}
              <div className="flex justify-between pt-8 border-t border-slate-200 text-[10px]">
                <div className="text-center space-y-12">
                  <span>Mengetahui,<br />Orang Tua / Wali Murid</span>
                  <div className="w-32 border-b border-slate-800 mx-auto" />
                </div>
                <div className="text-center space-y-12">
                  <span>Jakarta, 15 Juli 2026<br />Wali Kelas</span>
                  <div className="space-y-1">
                    <span className="font-bold block">Ahmad Ghozali, S.Pd.</span>
                    <span className="font-mono block text-[9px] text-slate-400">NIP: 19851010201001</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. APPROVAL & KUNCI NILAI */}
      {activeSubTab === 'approval' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Status Persetujuan & Penguncian Nilai</h3>
            <p className="text-slate-500 text-xs mt-0.5">Setelah nilai diajukan & disetujui oleh Kepala Sekolah, pengeditan nilai di seluruh lembar kerja akan dikunci.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-5 rounded-2xl border flex flex-col justify-between h-40 transition-all ${
              lockStatus === 'Draft' ? 'border-blue-500 bg-blue-50/40 shadow-sm' : 'border-slate-200'
            }`}>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fase 1</span>
                <h4 className="font-extrabold text-slate-800 text-xs mt-1">Draf Guru</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Nilai masih berada di bawah kuasa penuh guru mata pelajaran dan dapat diubah secara dinamis.</p>
              </div>
              <button
                onClick={() => handleApplyApproval('Draft')}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
              >
                Setel ke Draf
              </button>
            </div>

            <div className={`p-5 rounded-2xl border flex flex-col justify-between h-40 transition-all ${
              lockStatus === 'Diajukan' ? 'border-amber-500 bg-amber-50/30 shadow-sm' : 'border-slate-200'
            }`}>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fase 2</span>
                <h4 className="font-extrabold text-slate-800 text-xs mt-1">Diajukan ke Wali Kelas</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Mengajukan nilai untuk diperiksa. Lembar kerja dikunci sementara waktu.</p>
              </div>
              <button
                onClick={() => handleApplyApproval('Diajukan')}
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[10px] font-bold transition-all cursor-pointer"
              >
                Ajukan Sekarang
              </button>
            </div>

            <div className={`p-5 rounded-2xl border flex flex-col justify-between h-40 transition-all ${
              lockStatus === 'Disetujui' ? 'border-emerald-500 bg-emerald-50/40 shadow-sm' : 'border-slate-200'
            }`}>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fase 3</span>
                <h4 className="font-extrabold text-slate-800 text-xs mt-1">Disetujui & Dikunci</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Nilai telah diverifikasi kepala sekolah, dikunci permanen, dan siap dicetak ke rapor fisik.</p>
              </div>
              <button
                onClick={() => handleApplyApproval('Disetujui')}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold transition-all cursor-pointer"
              >
                Minta Approval Akhir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. ANALITIK KBM */}
      {activeSubTab === 'analitik' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Analitik Daya Serap & Hasil KBM</h3>
            <p className="text-slate-500 text-xs mt-0.5">Visualisasi kurva sebaran nilai, ketuntasan KKM, dan deviasi pencapaian kompetensi.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bar Chart */}
            <div className="lg:col-span-2 border border-slate-100 rounded-xl p-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-4">Sebaran Hasil Belajar per Siswa</span>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={{ background: '#0F172A', border: 'none', borderRadius: '8px', color: '#FFF', fontSize: '10px' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                    <Bar dataKey="Nilai Formatif" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={12} />
                    <Bar dataKey="Kombinasi Rapor" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="border border-slate-100 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-4">Ketuntasan Belajar KKM (75)</span>
                <div className="h-44 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#0F172A', border: 'none', borderRadius: '8px', color: '#FFF', fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-1.5 border-t border-slate-50 pt-3">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 bg-emerald-500 rounded-full" /><span>Tuntas</span></div>
                  <span className="font-bold">{passCount} Siswa ({Math.round((passCount/ledgerData.length)*100)}%)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 bg-red-500 rounded-full" /><span>Belum Tuntas</span></div>
                  <span className="font-bold">{failCount} Siswa ({Math.round((failCount/ledgerData.length)*100)}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
