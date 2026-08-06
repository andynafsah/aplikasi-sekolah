import React, { useState } from 'react';
import { Plus, Save, Check, Award, BookMarked, MessageSquare, ShieldCheck, Heart } from 'lucide-react';
import { GradeRecord, TahfidzRecord } from '../../types/teacher';

interface TeacherKarakterProps {
  gradesList: GradeRecord[];
  setGradesList: React.Dispatch<React.SetStateAction<GradeRecord[]>>;
}

export default function TeacherKarakter({ gradesList, setGradesList }: TeacherKarakterProps) {
  const [activeSubTab, setActiveSubTab] = useState<'tahfidz' | 'diniyah' | 'sikap' | 'ekskul' | 'catatan'>('tahfidz');
  const [successMsg, setSuccessMsg] = useState('');

  // Tahfidz detailed records simulation
  const [tahfidzRecords, setTahfidzRecords] = useState<TahfidzRecord[]>([
    {
      studentId: 'std-1',
      name: 'Farhan Ramadhan',
      juz: 30,
      lastSurah: 'An-Naba',
      lastVerse: '20',
      memorizationLevel: 'Lancar',
      setoranHistory: [
        { id: '1', date: '2026-07-01', surahName: 'An-Naba', fromVerse: 1, toVerse: 20, status: 'LULUS', tester: 'Ustadz Yusuf' }
      ]
    },
    {
      studentId: 'std-2',
      name: 'Laila Fitriani',
      juz: 29,
      lastSurah: 'Al-Mulk',
      lastVerse: '15',
      memorizationLevel: 'Sangat Lancar',
      setoranHistory: [
        { id: '2', date: '2026-07-02', surahName: 'Al-Mulk', fromVerse: 1, toVerse: 15, status: 'LULUS', tester: 'Ustadz Yusuf' }
      ]
    }
  ]);

  const [newSetoran, setNewSetoran] = useState({
    studentId: 'std-1',
    juz: 30,
    surahName: '',
    fromVerse: 1,
    toVerse: 10,
    memorizationLevel: 'Lancar' as const
  });
  const [showAddSetoran, setShowAddSetoran] = useState(false);

  const handleAddSetoranSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSetoran.surahName) return;

    setTahfidzRecords(prev => prev.map(rec => {
      if (rec.studentId === newSetoran.studentId) {
        return {
          ...rec,
          juz: newSetoran.juz,
          lastSurah: newSetoran.surahName,
          lastVerse: newSetoran.toVerse.toString(),
          memorizationLevel: newSetoran.memorizationLevel,
          setoranHistory: [
            {
              id: Date.now().toString(),
              date: new Date().toISOString().split('T')[0],
              surahName: newSetoran.surahName,
              fromVerse: newSetoran.fromVerse,
              toVerse: newSetoran.toVerse,
              status: 'LULUS',
              tester: 'Ustadz Yusuf'
            },
            ...rec.setoranHistory
          ]
        };
      }
      return rec;
    }));

    setNewSetoran({ studentId: 'std-1', juz: 30, surahName: '', fromVerse: 1, toVerse: 10, memorizationLevel: 'Lancar' });
    setShowAddSetoran(false);
    setSuccessMsg('Setoran hafalan baru berhasil diverifikasi dan disimpan!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const updateGradeField = (studentId: string, field: keyof GradeRecord, value: any) => {
    setGradesList(prev => prev.map(item => 
      item.studentId === studentId ? { ...item, [field]: value } : item
    ));
  };

  const handleSaveKarakter = () => {
    setSuccessMsg('Sikap, ekstrakurikuler, dan catatan konseling perkembangan berhasil disinkronisasikan!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('tahfidz')}
          className={`px-4 py-2.5 font-bold text-xs border-b-2 cursor-pointer transition-all ${
            activeSubTab === 'tahfidz' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Tahfidz & Murajaah
        </button>
        <button
          onClick={() => setActiveSubTab('diniyah')}
          className={`px-4 py-2.5 font-bold text-xs border-b-2 cursor-pointer transition-all ${
            activeSubTab === 'diniyah' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Materi Diniyah
        </button>
        <button
          onClick={() => setActiveSubTab('sikap')}
          className={`px-4 py-2.5 font-bold text-xs border-b-2 cursor-pointer transition-all ${
            activeSubTab === 'sikap' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Sikap & Akhlak
        </button>
        <button
          onClick={() => setActiveSubTab('ekskul')}
          className={`px-4 py-2.5 font-bold text-xs border-b-2 cursor-pointer transition-all ${
            activeSubTab === 'ekskul' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Ekstrakurikuler
        </button>
        <button
          onClick={() => setActiveSubTab('catatan')}
          className={`px-4 py-2.5 font-bold text-xs border-b-2 cursor-pointer transition-all ${
            activeSubTab === 'catatan' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Catatan Guru
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 1. TAHFIDZ & MURAJAAH */}
      {activeSubTab === 'tahfidz' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Setoran Hafalan Al-Qur'an & Murajaah</h3>
              <p className="text-slate-500 text-xs mt-0.5">Pantau capaian juz hafalan baru dan riwayat kelancaran lafadz santri.</p>
            </div>
            {!showAddSetoran && (
              <button
                onClick={() => setShowAddSetoran(true)}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Catat Setoran Baru
              </button>
            )}
          </div>

          {showAddSetoran && (
            <form onSubmit={handleAddSetoranSubmit} className="bg-slate-50/50 border border-slate-200 p-5 rounded-xl space-y-4">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <BookMarked className="h-4 w-4 text-blue-500" />
                Verifikasi Setoran Hafalan Baru
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Siswa / Santri</label>
                  <select
                    value={newSetoran.studentId}
                    onChange={(e) => setNewSetoran(prev => ({ ...prev, studentId: e.target.value }))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    {tahfidzRecords.map(t => (
                      <option key={t.studentId} value={t.studentId}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Juz Al-Qur'an</label>
                  <input
                    type="number"
                    value={newSetoran.juz}
                    onChange={(e) => setNewSetoran(prev => ({ ...prev, juz: parseInt(e.target.value) || 30 }))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Surah</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: An-Naba"
                    value={newSetoran.surahName}
                    onChange={(e) => setNewSetoran(prev => ({ ...prev, surahName: e.target.value }))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Dari Ayat</label>
                  <input
                    type="number"
                    value={newSetoran.fromVerse}
                    onChange={(e) => setNewSetoran(prev => ({ ...prev, fromVerse: parseInt(e.target.value) || 1 }))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Hingga Ayat</label>
                  <input
                    type="number"
                    value={newSetoran.toVerse}
                    onChange={(e) => setNewSetoran(prev => ({ ...prev, toVerse: parseInt(e.target.value) || 1 }))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Tingkat Kelancaran</label>
                  <select
                    value={newSetoran.memorizationLevel}
                    onChange={(e) => setNewSetoran(prev => ({ ...prev, memorizationLevel: e.target.value as any }))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="Sangat Lancar">Sangat Lancar</option>
                    <option value="Lancar">Lancar</option>
                    <option value="Cukup">Cukup</option>
                    <option value="Kurang">Kurang</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddSetoran(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer hover:bg-blue-700"
                >
                  Verifikasi Hafalan
                </button>
              </div>
            </form>
          )}

          {/* Records list */}
          <div className="space-y-4">
            {tahfidzRecords.map((t) => (
              <div key={t.studentId} className="p-4 border border-slate-200 rounded-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs">{t.name}</h4>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Hafalan Aktif: Juz {t.juz} ({t.lastSurah} : {t.lastVerse})</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wide self-start sm:self-auto ${
                    t.memorizationLevel === 'Sangat Lancar'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}>
                    {t.memorizationLevel}
                  </span>
                </div>

                {/* Setoran Logs history */}
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Riwayat Setoran Sepekan Terakhir</span>
                  {t.setoranHistory.map((h) => (
                    <div key={h.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-700">{h.surahName} : Ayat {h.fromVerse} - {h.toVerse}</span>
                        <div className="text-[9px] text-slate-400 mt-0.5">{h.date} • Penguji: {h.tester}</div>
                      </div>
                      <span className="text-[9px] font-black text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded font-mono border border-emerald-200">
                        {h.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. MATERI DINIYAH */}
      {activeSubTab === 'diniyah' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Evaluasi Pembelajaran Kitab Diniyah / Salafiyah</h3>
            <p className="text-slate-500 text-xs mt-0.5">Input pemahaman bacaan kitab kuning, ilmu nahwu-sharaf, dan hadits diniyah.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50">
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4 text-center">Fashahah / Kelancaran (100)</th>
                  <th className="py-3 px-4 text-center">Pemaknaan Kitab (100)</th>
                  <th className="py-3 px-4 text-center">Syarah / Pemahaman</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {gradesList.map((item) => (
                  <tr key={item.studentId} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-bold text-slate-800">{item.name}</td>
                    <td className="py-2 px-4 text-center">
                      <input
                        type="number"
                        defaultValue={82}
                        className="w-16 bg-slate-50 border border-slate-200 rounded-lg text-center py-1 text-slate-800 text-xs font-bold focus:bg-white focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-4 text-center">
                      <input
                        type="number"
                        defaultValue={85}
                        className="w-16 bg-slate-50 border border-slate-200 rounded-lg text-center py-1 text-slate-800 text-xs font-bold focus:bg-white focus:outline-none"
                      />
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[10px]">
                      Mampu merumuskan pemaknaan lafadz dengan luwes.
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. SIKAP & AKHLAK */}
      {activeSubTab === 'sikap' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Penilaian Karakter & Sikap Akhlakul Karimah</h3>
              <p className="text-slate-500 text-xs mt-0.5">Nilai integritas perilaku, adab sosial, dan kedisiplinan beribadah harian.</p>
            </div>
            <button
              onClick={handleSaveKarakter}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer hover:bg-blue-700"
            >
              <Save className="h-4 w-4" />
              Simpan Sikap
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50">
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4 text-center">Sikap Spiritual (Adab / Shalat)</th>
                  <th className="py-3 px-4 text-center">Sikap Sosial (Kedisiplinan)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {gradesList.map((item) => (
                  <tr key={item.studentId} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-bold text-slate-800">{item.name}</td>
                    <td className="py-2 px-4 text-center">
                      <select
                        value={item.sikap_spiritual || 'Baik'}
                        onChange={(e) => updateGradeField(item.studentId, 'sikap_spiritual', e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold focus:bg-white focus:outline-none"
                      >
                        <option value="Sangat Baik">Sangat Baik</option>
                        <option value="Baik">Baik</option>
                        <option value="Cukup">Cukup</option>
                        <option value="Kurang">Kurang</option>
                      </select>
                    </td>
                    <td className="py-2 px-4 text-center">
                      <select
                        value={item.sikap_sosial || 'Baik'}
                        onChange={(e) => updateGradeField(item.studentId, 'sikap_sosial', e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold focus:bg-white focus:outline-none"
                      >
                        <option value="Sangat Baik">Sangat Baik</option>
                        <option value="Baik">Baik</option>
                        <option value="Cukup">Cukup</option>
                        <option value="Kurang">Kurang</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. EKSTRAKURIKULER */}
      {activeSubTab === 'ekskul' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Penilaian Minat & Bakat Ekstrakurikuler</h3>
              <p className="text-slate-500 text-xs mt-0.5">Input nama kegiatan, nilai huruf, dan laporan capaian prestasi ekskul.</p>
            </div>
            <button
              onClick={handleSaveKarakter}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer hover:bg-blue-700"
            >
              <Save className="h-4 w-4" />
              Simpan Ekskul
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50">
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4">Ekstrakurikuler</th>
                  <th className="py-3 px-4 text-center">Nilai</th>
                  <th className="py-3 px-4">Deskripsi Capaian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {gradesList.map((item) => (
                  <tr key={item.studentId} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-bold text-slate-800">{item.name}</td>
                    <td className="py-2 px-4">
                      <input
                        type="text"
                        value={item.ekskul_name || ''}
                        onChange={(e) => updateGradeField(item.studentId, 'ekskul_name', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs focus:bg-white"
                      />
                    </td>
                    <td className="py-2 px-4 text-center">
                      <select
                        value={item.ekskul_grade || 'B'}
                        onChange={(e) => updateGradeField(item.studentId, 'ekskul_grade', e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 text-xs font-bold focus:bg-white"
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="text"
                        value={item.ekskul_notes || ''}
                        onChange={(e) => updateGradeField(item.studentId, 'ekskul_notes', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs focus:bg-white"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. CATATAN GURU */}
      {activeSubTab === 'catatan' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Catatan Bimbingan & Konseling Wali Kelas</h3>
              <p className="text-slate-500 text-xs mt-0.5">Catat arahan pastoral, bimbingan akhlak, dan prestasi luar biasa individu.</p>
            </div>
            <button
              onClick={handleSaveKarakter}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer hover:bg-blue-700"
            >
              <Save className="h-4 w-4" />
              Simpan Catatan
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50">
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4">Catatan Wali Kelas (Untuk Rapor)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {gradesList.map((item) => (
                  <tr key={item.studentId} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-bold text-slate-800">{item.name}</td>
                    <td className="py-2 px-4">
                      <textarea
                        rows={1}
                        value={item.catatan || ''}
                        onChange={(e) => updateGradeField(item.studentId, 'catatan', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:bg-white focus:outline-none"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
