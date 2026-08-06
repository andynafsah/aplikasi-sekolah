import React, { useState } from 'react';
import { 
  GitBranch, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Users, 
  Shield, 
  ArrowRight, 
  AlertTriangle, 
  Send,
  Sliders,
  Layers
} from 'lucide-react';

interface HierarchyNode {
  level: number;
  role: string;
  name: string;
  unit: string;
  sla_hours: number;
  auto_escalate_to?: string;
}

interface DispositionFlowItem {
  id: string;
  letter_number: string;
  subject: string;
  sender: string;
  current_level: number;
  current_holder: string;
  urgency: 'BIASA' | 'PENTING' | 'KILAT';
  created_at: string;
  timeline: { level: number; role: string; status: 'DONE' | 'ACTIVE' | 'PENDING'; note?: string }[];
}

export default function DispositionHierarchyMatrix() {
  const fetchHierarchy = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/action?action=hierarchyList', {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      const data = await res.json();
      if (data && data.success && data.data && data.data.length > 0) {
        setHierarchy(data.data);
      }
    } catch (e) { console.error(e); }
  };
  React.useEffect(() => { fetchHierarchy(); }, []);

  const [hierarchy, setHierarchy] = useState<HierarchyNode[]>([
    { level: 1, role: 'Pengasuh Pondok / Yayasan Utama', name: 'Kiai Ahmad Dahlan, Lc.', unit: 'Yayasan Pusat', sla_hours: 12, auto_escalate_to: 'Kepala Sekolah' },
    { level: 2, role: 'Kepala Sekolah Utama', name: 'Dr. H. Ahmad Musyaffa, M.Ag.', unit: 'SMP - SMA Terpadu', sla_hours: 24, auto_escalate_to: 'Wakasek Kurikulum/Kesiswaan' },
    { level: 3, role: 'Wakil Kepala Sekolah (Wakasek)', name: 'Ust. H. Abdullah Faqih, M.Pd.', unit: 'Bidang Akademik & Keagamaan', sla_hours: 24, auto_escalate_to: 'Kepala Bagian TU' },
    { level: 4, role: 'Kepala Bagian Tata Usaha (Kasie TU)', name: 'Dra. Hj. Nurjanah, M.Pd.', unit: 'Sekretariat TU', sla_hours: 12, auto_escalate_to: 'Staf Arsiparis Pelaksana' },
    { level: 5, role: 'Staf Pelaksana & Arsiparis', name: 'Siti Rahmawati, A.Md.', unit: 'Arsip & Operasional', sla_hours: 6 }
  ]);

  const fetchDispositions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/action?action=dispositionList', {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      const data = await res.json();
      if (data && data.success && data.data && data.data.length > 0) {
        setDispositions(data.data);
      }
    } catch (e) { console.error(e); }
  };
  React.useEffect(() => { fetchDispositions(); }, []);

  const [dispositions, setDispositions] = useState<DispositionFlowItem[]>([
    {
      id: 'DISP-2026-001',
      letter_number: 'SURAT/DINAS/088/2026',
      subject: 'Undangan Verifikasi Lapangan Akreditasi Lembaga',
      sender: 'Dinas Pendidikan & Kebudayaan Provinsi',
      current_level: 2,
      current_holder: 'Dr. H. Ahmad Musyaffa, M.Ag. (Kepala Sekolah)',
      urgency: 'KILAT',
      created_at: '2026-08-04 09:00',
      timeline: [
        { level: 1, role: 'Pengasuh Pondok', status: 'DONE', note: 'Disetujui. Lanjutkan instruksi ke Kepala Sekolah untuk rapat persiapan.' },
        { level: 2, role: 'Kepala Sekolah', status: 'ACTIVE', note: 'Sedang meninjau draf dokumen pendukung akreditasi.' },
        { level: 3, role: 'Wakasek', status: 'PENDING' },
        { level: 4, role: 'Kasie TU', status: 'PENDING' }
      ]
    },
    {
      id: 'DISP-2026-002',
      letter_number: 'B/102/KEMENAG/VIII/2026',
      subject: 'Surat Edaran Panduan Lomba Tahfidz Al-Qur\'an Tingkat Nasional',
      sender: 'Kementerian Agama RI',
      current_level: 3,
      current_holder: 'Ust. H. Abdullah Faqih, M.Pd. (Wakasek)',
      urgency: 'PENTING',
      created_at: '2026-08-03 14:30',
      timeline: [
        { level: 1, role: 'Pengasuh Pondok', status: 'DONE', note: 'Diteruskan ke Kepala Sekolah.' },
        { level: 2, role: 'Kepala Sekolah', status: 'DONE', note: 'Disposisi ke Wakasek untuk utus 5 santri terbaik.' },
        { level: 3, role: 'Wakasek', status: 'ACTIVE', note: 'Sedang menyeleksi calon peserta halaqah.' },
        { level: 4, role: 'Kasie TU', status: 'PENDING' }
      ]
    }
  ]);

  const handleAdvanceLevel = (dispId: string) => {
    setDispositions(dispositions.map(d => {
      if (d.id === dispId && d.current_level < hierarchy.length) {
        const nextLevel = d.current_level + 1;
        const nextHolder = hierarchy.find(h => h.level === nextLevel);
        const updatedTimeline = d.timeline.map(t => {
          if (t.level === d.current_level) return { ...t, status: 'DONE' as const, note: 'Disposisi diteruskan ke jenjang berikutnya.' };
          if (t.level === nextLevel) return { ...t, status: 'ACTIVE' as const };
          return t;
        });

        return {
          ...d,
          current_level: nextLevel,
          current_holder: `${nextHolder?.name} (${nextHolder?.role})`,
          timeline: updatedTimeline
        };
      }
      return d;
    }));
    alert('Disposisi berhasil diteruskan ke hirarki tingkat berikutnya!');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-blue-500/30 text-blue-200 px-3 py-1 rounded-full border border-blue-400/30 mb-2">
            <Sparkles className="h-3 w-3" /> Modul 4: Hirarki Disposisi Digital
          </span>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <GitBranch className="h-6 w-6 text-blue-400" />
            Alur Disposisi Berjenjang & SLA Otomatis
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Matriks alur disposisi berjenjang dari Pengasuh Pondok hingga Staf TU Pelaksana dengan batas waktu penyelesaian (SLA).
          </p>
        </div>
      </div>

      {/* 5-Level Hierarchy Visual Diagram */}
      <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-4">
        <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
          <Shield className="h-4 w-4 text-blue-600" />
          Matriks Hirarki Pimpinan & Struktur Disposisi Lembaga
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {hierarchy.map((node, index) => (
            <div key={node.level} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  Level {node.level}
                </span>
                <span className="text-[9px] text-slate-500 font-bold flex items-center gap-1">
                  <Clock className="h-3 w-3 text-amber-600" /> SLA {node.sla_hours}j
                </span>
              </div>

              <div>
                <strong className="block text-slate-900 text-xs leading-tight">{node.role}</strong>
                <span className="text-[11px] text-slate-600 font-bold block mt-1">{node.name}</span>
                <span className="text-[9px] text-slate-400 block">{node.unit}</span>
              </div>

              {index < hierarchy.length - 1 && (
                <div className="hidden md:block absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 bg-white border border-slate-300 rounded-full p-1 shadow-2xs">
                  <ArrowRight className="h-3 w-3 text-slate-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Active Disposition Flow Cards */}
      <div className="space-y-4">
        <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
          <Layers className="h-4 w-4 text-indigo-600" />
          Monitoring Disposisi Berjalan Berjenjang
        </h3>

        {dispositions.map((disp) => (
          <div key={disp.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-blue-700">{disp.letter_number}</span>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                    disp.urgency === 'KILAT' ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {disp.urgency}
                  </span>
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm mt-0.5">{disp.subject}</h4>
                <p className="text-[11px] text-slate-500">Pengirim: {disp.sender} • Masuk: {disp.created_at}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAdvanceLevel(disp.id)}
                  disabled={disp.current_level >= hierarchy.length}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <Send className="h-3.5 w-3.5" />
                  Teruskan Disposisi (Level {disp.current_level + 1})
                </button>
              </div>
            </div>

            {/* Current Position */}
            <div className="p-3 bg-indigo-50/60 border border-indigo-150 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-600 font-bold">Posisi Disposisi Saat Ini:</span>
              <strong className="text-indigo-900 font-extrabold">{disp.current_holder}</strong>
            </div>

            {/* Steps Timeline */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 text-xs">
              {disp.timeline.map((step) => (
                <div 
                  key={step.level}
                  className={`p-3 rounded-xl border ${
                    step.status === 'DONE'
                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                      : step.status === 'ACTIVE'
                      ? 'bg-amber-50 border-amber-400 text-amber-950 ring-2 ring-amber-300'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-mono font-bold">Lvl {step.level}</span>
                    {step.status === 'DONE' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                    {step.status === 'ACTIVE' && <Clock className="h-3.5 w-3.5 text-amber-600 animate-pulse" />}
                  </div>
                  <strong className="block text-[11px] font-bold">{step.role}</strong>
                  {step.note && <p className="text-[10px] mt-1 italic">{step.note}</p>}
                </div>
              ))}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
