import React, { useState } from 'react';
import { BookOpen, Sparkles, Plus, Save, Trash, FileText, Check, Clock, Eye, AlertCircle, Play, CheckCircle } from 'lucide-react';
import { LessonPlan } from '../../types/teacher';

interface TeacherLessonsProps {
  lessonPlans: LessonPlan[];
  onAddLessonPlan: (newPlan: Omit<LessonPlan, 'id'>) => void;
}

export default function TeacherLessons({ lessonPlans, onAddLessonPlan }: TeacherLessonsProps) {
  const [activeSubTab, setActiveSubTab] = useState<'kbm' | 'cp' | 'rpp' | 'kktp' | 'materi'>('kbm');
  const [successMsg, setSuccessMsg] = useState('');

  // RPP Creator states
  const [showAddPlanForm, setShowAddPlanForm] = useState(false);
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(90);
  const [objectives, setObjectives] = useState('');
  const [p3, setP3] = useState<string[]>(['Bernalar Kritis', 'Mandiri']);
  const [aiGenerating, setAiGenerating] = useState(false);

  // KBM Saya simulator states
  const [kbmStarted, setKbmStarted] = useState(false);
  const [kbmStep, setKbmStep] = useState(1);
  const [kbmTimer, setKbmTimer] = useState(90);

  // CP/ATP list
  const [cps, setCps] = useState([
    { code: 'FIS-E-1', domain: 'Pemahaman Sains', description: 'Peserta didik mampu mendeskripsikan gejala alam dalam cakupan keterampilan proses dalam pengukuran dan konsep dasar fisika.' },
    { code: 'FIS-E-2', domain: 'Keterampilan Proses', description: 'Peserta didik mampu mengamati, menyelidiki, menganalisis, serta mengomunikasikan hasil pengukuran fisis secara presisi.' }
  ]);

  // KKTP thresholds
  const [kktpList, setKktpList] = useState([
    { id: '1', objective: 'Menjelaskan konsep Hukum Newton I, II, dan III', minScore: 75, status: 'Aktif' },
    { id: '2', objective: 'Mengukur dan menghitung resultan gaya fisis', minScore: 70, status: 'Aktif' }
  ]);

  // Materi / Slides
  const [materiList, setMateriList] = useState([
    { id: 'mat-1', title: 'Slide Pembelajaran: Dinamika Partikel & Gaya', type: 'PDF / Slides', size: '4.2 MB', date: '2026-07-01' },
    { id: 'mat-2', title: 'Lembar Kerja Peserta Didik (LKPD) Hukum Newton', type: 'Word Doc', size: '1.1 MB', date: '2026-07-02' },
    { id: 'mat-3', title: 'Animasi Interaktif: Gaya Gesek Bidang Miring', type: 'Simulasi Web', size: 'Interactive', date: '2026-07-03' }
  ]);

  const handleCreateRPP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;

    onAddLessonPlan({
      topic,
      classId: 'cl-1',
      duration,
      objectives: objectives.split('\n').filter(o => o.trim() !== ''),
      activities: [
        'Apersepsi & Orientasi Masalah (15 Menit)',
        'Eksperimen Kelompok Terbimbing (45 Menit)',
        'Presentasi Hasil & Diskusi Pleno (20 Menit)',
        'Asesmen Formatif & Refleksi Akhir (10 Menit)'
      ],
      assessments: 'Asesmen Formatif (Laporan Praktikum & Kuis Singkat)',
      p3_dimensions: p3
    });

    setTopic('');
    setObjectives('');
    setShowAddPlanForm(false);
    setSuccessMsg('Modul Ajar / RPP baru berhasil dibuat!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleAIGenerator = () => {
    if (!topic) {
      alert('Silakan masukkan topik materi terlebih dahulu sebelum menggunakan fitur kecerdasan buatan (AI)!');
      return;
    }
    setAiGenerating(true);
    setTimeout(() => {
      setDuration(90);
      setObjectives(
        `1. Siswa mampu menganalisis pengaruh gaya terhadap percepatan benda secara kuantitatif.\n2. Siswa dapat merancang eksperimen sederhana untuk menguji Hukum II Newton.\n3. Siswa dapat mengomunikasikan hasil pengukuran gaya dengan tingkat presisi tinggi.`
      );
      setP3(['Bernalar Kritis', 'Mandiri', 'Gotong Royong']);
      setAiGenerating(false);
      setSuccessMsg('AI Copilot berhasil menyusun RPP Kurikulum Merdeka yang menantang & berorientasi pada Profil Pelajar Pancasila secara otomatis!');
      setTimeout(() => setSuccessMsg(''), 4000);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('kbm')}
          className={`px-4 py-2.5 font-bold text-xs border-b-2 cursor-pointer transition-all ${
            activeSubTab === 'kbm'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          KBM Saya (Konsol Mengajar)
        </button>
        <button
          onClick={() => setActiveSubTab('cp')}
          className={`px-4 py-2.5 font-bold text-xs border-b-2 cursor-pointer transition-all ${
            activeSubTab === 'cp'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          CP, ATP, & TP
        </button>
        <button
          onClick={() => setActiveSubTab('rpp')}
          className={`px-4 py-2.5 font-bold text-xs border-b-2 cursor-pointer transition-all ${
            activeSubTab === 'rpp'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Modul Ajar (RPP)
        </button>
        <button
          onClick={() => setActiveSubTab('kktp')}
          className={`px-4 py-2.5 font-bold text-xs border-b-2 cursor-pointer transition-all ${
            activeSubTab === 'kktp'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          KKTP
        </button>
        <button
          onClick={() => setActiveSubTab('materi')}
          className={`px-4 py-2.5 font-bold text-xs border-b-2 cursor-pointer transition-all ${
            activeSubTab === 'materi'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Materi & Bahan Ajar
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 1. KBM SAYA - KONSOL MENGAJAR */}
      {activeSubTab === 'kbm' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          {!kbmStarted ? (
            <div className="text-center py-10 space-y-4 max-w-md mx-auto">
              <div className="inline-block p-4 bg-blue-50 text-blue-600 rounded-full">
                <BookOpen className="h-10 w-10 animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">Konsol KBM Kelas Aktif</h3>
                <p className="text-slate-400 text-xs mt-1">Mulai sesi KBM tatap muka hari ini di kelas X MIPA 1 untuk mengakses materi presentasi, aktivitas RPP, dan absensi cepat.</p>
              </div>
              <button
                onClick={() => setKbmStarted(true)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="h-4 w-4 fill-white" />
                Mulai Pembelajaran Kelas (Fisika X MIPA 1)
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Active Session Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                <div>
                  <span className="text-[10px] bg-red-50 text-red-600 border border-red-200 font-bold px-2.5 py-1 rounded-md uppercase tracking-wider animate-pulse inline-block">SESI KBM SEDANG BERLANGSUNG</span>
                  <h3 className="font-extrabold text-slate-800 text-sm mt-1.5">Fisika - Kelas X MIPA 1</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Topik: Hukum Newton & Pembuktian Resultan Gaya</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sisa Waktu Sesi</span>
                    <span className="text-base font-extrabold text-slate-700">{kbmTimer} Menit</span>
                  </div>
                  <button
                    onClick={() => {
                      setKbmStarted(false);
                      setSuccessMsg('Sesi KBM hari ini berhasil diselesaikan dengan sukses!');
                      setTimeout(() => setSuccessMsg(''), 4000);
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Akhiri KBM
                  </button>
                </div>
              </div>

              {/* Lesson Phases Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { step: 1, title: 'Pembukaan (15m)', desc: 'Apersepsi & Teori' },
                  { step: 2, title: 'Eksperimen (45m)', desc: 'Praktikum Kelompok' },
                  { step: 3, title: 'Pleno (20m)', desc: 'Presentasi Kelompok' },
                  { step: 4, title: 'Formatif (10m)', desc: 'Asesmen & Kuis' }
                ].map((ph) => (
                  <button
                    key={ph.step}
                    onClick={() => setKbmStep(ph.step)}
                    className={`p-4 rounded-xl text-left border cursor-pointer transition-all ${
                      kbmStep === ph.step
                        ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                        : 'border-slate-100 bg-slate-50 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                        kbmStep === ph.step ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {ph.step}
                      </span>
                      <span className="text-xs font-bold text-slate-800">{ph.title}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 pl-7">{ph.desc}</p>
                  </button>
                ))}
              </div>

              {/* Whiteboard / Presentation Simulation */}
              <div className="bg-slate-950 text-white rounded-2xl p-6 min-h-[220px] flex flex-col justify-between border border-slate-800 shadow-inner">
                <div>
                  <span className="text-[9px] bg-white/10 text-white/80 border border-white/10 font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono">WHITEBOARD & SLIDE SIMULATION</span>
                  {kbmStep === 1 && (
                    <div className="mt-6 space-y-3">
                      <h4 className="text-base font-extrabold text-blue-400">Pembukaan: Mengenal Hukum II Newton</h4>
                      <p className="text-sm text-slate-300 max-w-xl">Hukum II Newton menyatakan bahwa percepatan sebuah benda berbanding lurus dengan gaya total yang bekerja padanya dan berbanding terbalik dengan massanya.</p>
                      <div className="p-3 bg-white/5 border border-white/10 rounded-xl max-w-sm font-mono text-xs text-amber-300">
                        Rumus: a = F_resultan / m
                      </div>
                    </div>
                  )}
                  {kbmStep === 2 && (
                    <div className="mt-6 space-y-3">
                      <h4 className="text-base font-extrabold text-emerald-400">Eksperimen Kelompok: Koin & Kelereng Bidang Miring</h4>
                      <p className="text-sm text-slate-300">Langkah Kegiatan kelompok: Ukur percepatan kelereng di atas bidang miring kayu dengan berbagai variasi sudut sudut (15 derajat, 30 derajat, 45 derajat).</p>
                      <span className="text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-3 py-1 rounded-md font-mono inline-block">Kelompok Terdiri atas 4 Siswa</span>
                    </div>
                  )}
                  {kbmStep === 3 && (
                    <div className="mt-6 space-y-3">
                      <h4 className="text-base font-extrabold text-indigo-400">Pleno: Diskusi & Presentasi Kelas</h4>
                      <p className="text-sm text-slate-300">Perwakilan kelompok mempresentasikan tabel resultan gaya fisis dan grafik percepatan fisis yang telah didapatkan didalam eksperimen.</p>
                    </div>
                  )}
                  {kbmStep === 4 && (
                    <div className="mt-6 space-y-3">
                      <h4 className="text-base font-extrabold text-amber-400">Formatif: Refleksi & Penilaian Mandiri</h4>
                      <p className="text-sm text-slate-300">Silakan siswa membuka menu kuis cepat didalam Parent Portal atau tracker untuk mengerjakan kuis instan formatif Hukum Newton.</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-6 pt-4 border-t border-white/5">
                  <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer">Buka Slide PDF</button>
                  <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer">Coret Papan Tulis</button>
                  <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer">Tampilkan Simulasi PhET</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. CP, ATP & TP */}
      {activeSubTab === 'cp' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Capaian Pembelajaran (CP) & Alur Tujuan Pembelajaran (ATP)</h3>
            <p className="text-slate-500 text-xs mt-0.5">Pemetaan standar kompetensi kurikulum merdeka nasional.</p>
          </div>

          <div className="space-y-4">
            {cps.map((item) => (
              <div key={item.code} className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50/40 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-blue-50 text-blue-700 font-black px-2.5 py-1 rounded-md font-mono">{item.code}</span>
                  <h4 className="text-xs font-bold text-slate-800">{item.domain}</h4>
                </div>
                <p className="text-slate-600 text-xs mt-2 pl-2 border-l-2 border-slate-200 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. MODUL AJAR (RPP) */}
      {activeSubTab === 'rpp' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Penyusunan RPP & Modul Ajar</h3>
              <p className="text-slate-500 text-xs mt-0.5">Dukung penyusunan rencana pembelajaran berbasis Profil Pelajar Pancasila.</p>
            </div>
            {!showAddPlanForm && (
              <button
                onClick={() => setShowAddPlanForm(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Tambah RPP Baru
              </button>
            )}
          </div>

          {showAddPlanForm && (
            <form onSubmit={handleCreateRPP} className="bg-slate-50/50 border border-slate-200 p-5 rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-blue-500" />
                  RPP / Rencana Modul Ajar Baru
                </h4>
                <button
                  type="button"
                  onClick={handleAIGenerator}
                  disabled={aiGenerating}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-300 text-white text-[10px] font-black rounded-lg flex items-center gap-1 transition-all shadow-sm cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {aiGenerating ? 'Menyusun RPP...' : 'Auto-Generate RPP (AI)'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Topik Materi</label>
                  <input
                    type="text"
                    required
                    value={topic}
                    placeholder="Contoh: Hukum Newton tentang Gravitasi"
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Durasi Pembelajaran (Menit)</label>
                  <input
                    type="number"
                    required
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Tujuan Pembelajaran (Satu baris per tujuan)</label>
                <textarea
                  rows={3}
                  required
                  value={objectives}
                  placeholder="Contoh:&#10;Siswa dapat menjelaskan resultan gaya fisis.&#10;Siswa dapat merakit peralatan uji fisis."
                  onChange={(e) => setObjectives(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setShowAddPlanForm(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Simpan Modul
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {lessonPlans.map((plan) => (
              <div key={plan.id} className="p-5 border border-slate-200 rounded-xl hover:shadow-sm transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-xs">{plan.topic}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">Durasi: {plan.duration} Menit</span>
                </div>

                <div className="space-y-1.5">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase">Tujuan Pembelajaran (TP):</h5>
                  <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">
                    {plan.objectives.map((obj, oIdx) => (
                      <li key={oIdx}>{obj}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {plan.p3_dimensions.map((dim) => (
                    <span key={dim} className="px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-md text-[9px] font-bold uppercase tracking-wider">
                      {dim}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. KKTP */}
      {activeSubTab === 'kktp' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)</h3>
            <p className="text-slate-500 text-xs mt-0.5">Penentuan kriteria ketuntasan siswa berdasarkan instrumen asesmen.</p>
          </div>

          <div className="space-y-4">
            {kktpList.map((item) => (
              <div key={item.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{item.objective}</h4>
                  <span className="text-[10px] text-slate-400 mt-1 block">Metode: Interval Nilai Kinerja</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Kriteria Lulus</span>
                  <span className="text-xs font-black text-blue-600">&gt;= {item.minScore} / 100</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. MATERI & BAHAN AJAR */}
      {activeSubTab === 'materi' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Manajemen Materi & Bahan Pembelajaran</h3>
              <p className="text-slate-500 text-xs mt-0.5">Simpan, kelola, dan bagikan materi ajar ke portal belajar siswa.</p>
            </div>
            <button
              onClick={() => {
                setSuccessMsg('Sistem berhasil mengunggah berkas materi pembelajaran baru!');
                setTimeout(() => setSuccessMsg(''), 4000);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Unggah Materi
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {materiList.map((mat) => (
              <div key={mat.id} className="p-4 border border-slate-200 rounded-xl hover:shadow-sm transition-all space-y-2">
                <div className="h-8 w-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-500">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 truncate">{mat.title}</h4>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-100">
                  <span>{mat.type}</span>
                  <span>{mat.size}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
