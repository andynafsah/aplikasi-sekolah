/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Home, 
  LayoutGrid, 
  BookOpen, 
  Shirt, 
  ShieldCheck, 
  Smartphone, 
  BarChart3, 
  Search, 
  Plus, 
  Users, 
  GraduationCap, 
  Sprout, 
  Sparkles,
  RefreshCw,
  Bell,
  HeartPulse,
  Clock,
  Shield,
  Coffee,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

import { 
  Student, 
  Gedung, 
  Kamar, 
  TempatTidur, 
  Penempatan, 
  Musyrif, 
  Perizinan, 
  Kunjungan, 
  Tahfidz, 
  TargetHafalan, 
  IbadahLog, 
  Pelanggaran, 
  Prestasi, 
  Pembinaan, 
  Laundry, 
  BarangTitipan, 
  Loker, 
  Konsumsi, 
  Piket, 
  Keamanan, 
  AuditLog 
} from '../types/boarding';

import {
  defaultStudents,
  defaultGedungs,
  defaultKamars,
  defaultTempatTidurs,
  defaultPenempatans,
  defaultMusyriifs,
  defaultPerizinans,
  defaultKunjungans,
  defaultTahfidzLogs,
  defaultTargetHafalan,
  defaultIbadahLogs,
  defaultPelanggarans,
  defaultPrestasils,
  defaultPembinaans,
  defaultLaundries,
  defaultBarangTitipans,
  defaultLokers,
  defaultKonsumsis,
  defaultPikets,
  defaultKeamanans,
  defaultAuditLogs
} from '../utils/boardingMockData';

// Modular component imports
import AsramaSection from '../components/boarding/AsramaSection';
import TahfidzSection from '../components/boarding/TahfidzSection';
import ServicesSection from '../components/boarding/ServicesSection';
import AuditSection from '../components/boarding/AuditSection';

type PresetMode = 'PONDOK_MODERN' | 'PONDOK_SALAF' | 'BOARDING_SCHOOL' | 'RUMAH_TAHFIDZ' | 'MAHAD';

export default function Boarding() {
  // Preset state
  const [presetMode, setPresetMode] = useState<PresetMode>('PONDOK_MODERN');
  const [activeMainTab, setActiveMainTab] = useState<'dashboard' | 'asrama' | 'tahfidz' | 'services' | 'audit_records' | 'mobile_sim'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Core database states
  const [students, setStudents] = useState<Student[]>(defaultStudents);
  const [gedungs, setGedungs] = useState<Gedung[]>(defaultGedungs);
  const [kamars, setKamars] = useState<Kamar[]>(defaultKamars);
  const [beds, setBeds] = useState<TempatTidur[]>(defaultTempatTidurs);
  const [penempatans, setPenempatans] = useState<Penempatan[]>(defaultPenempatans);
  const [musyrifs, setMusyrifs] = useState<Musyrif[]>(defaultMusyriifs);
  const [perizinans, setPerizinans] = useState<Perizinan[]>(defaultPerizinans);
  const [kunjungans, setKunjungans] = useState<Kunjungan[]>(defaultKunjungans);
  const [tahfidzLogs, setTahfidzLogs] = useState<Tahfidz[]>(defaultTahfidzLogs);
  const [targetHafalans, setTargetHafalans] = useState<TargetHafalan[]>(defaultTargetHafalan);
  const [ibadahLogs, setIbadahLogs] = useState<IbadahLog[]>(defaultIbadahLogs);
  const [pelanggarans, setPelanggarans] = useState<Pelanggaran[]>(defaultPelanggarans);
  const [prestasils, setPrestasils] = useState<Prestasi[]>(defaultPrestasils);
  const [pembinaans, setPembinaans] = useState<Pembinaan[]>(defaultPembinaans);
  const [laundries, setLaundries] = useState<Laundry[]>(defaultLaundries);
  const [titipans, setTitipans] = useState<BarangTitipan[]>(defaultBarangTitipans);
  const [lokers, setLokers] = useState<Loker[]>(defaultLokers);
  const [konsumsis, setKonsumsis] = useState<Konsumsi[]>(defaultKonsumsis);
  const [pikets, setPikets] = useState<Piket[]>(defaultPikets);
  const [keamanans, setKeamanans] = useState<Keamanan[]>(defaultKeamanans);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(defaultAuditLogs);

  // Helper to trigger interactive alerts and logs
  const triggerAction = (actionName: string, module: string, details: string) => {
    const timestamp = new Date().toISOString();
    const newLog: AuditLog = {
      id: `au-${Date.now()}`,
      timestamp: timestamp.replace('T', ' ').substring(0, 19),
      user: 'nafsahku@gmail.com',
      action: actionName,
      module,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
    setToastMessage(`${actionName}: ${details}`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // -------------------------------------------------------------
  // CRUD & Mutation actions
  // -------------------------------------------------------------

  const handleAddGedung = (g: Omit<Gedung, 'id'>) => {
    const id = `gd-${Date.now()}`;
    setGedungs(prev => [...prev, { id, ...g }]);
    triggerAction('CREATE', 'ASRAMA', `Gedung asrama baru ${g.name} (${g.code}) ditambahkan`);
  };

  const handleAddKamar = (k: Omit<Kamar, 'id'>) => {
    const id = `km-${Date.now()}`;
    const newRoom: Kamar = { id, ...k };
    setKamars(prev => [...prev, newRoom]);

    // Automatically generate beds for this room
    const generatedBeds: TempatTidur[] = [];
    for (let i = 1; i <= k.capacity; i++) {
      generatedBeds.push({
        id: `bt-${id}-${i}`,
        kamarId: id,
        bedNo: `Bed ${newRoom.code.split('-')[1] || 'R'}-${i}`,
        status: 'TERSEDIA'
      });
    }
    setBeds(prev => [...prev, ...generatedBeds]);
    triggerAction('CREATE', 'ASRAMA', `Kamar baru ${k.name} (${k.code}) dibuat di lantai ${k.floor} dengan ${k.capacity} bed`);
  };

  const handleAddPenempatan = (p: Omit<Penempatan, 'id'>) => {
    const id = `pn-${Date.now()}`;
    setPenempatans(prev => [...prev, { id, ...p }]);

    // Update Bed status to occupied
    setBeds(prev => prev.map(b => b.id === p.bedId ? { ...b, status: 'TERISI' } : b));

    const sName = students.find(s => s.id === p.studentId)?.name || 'Santri';
    const rName = kamars.find(k => k.id === p.kamarId)?.name || 'Kamar';
    triggerAction('ALLOCATE', 'ASRAMA', `Santri ${sName} ditempatkan di ${rName}`);
  };

  const handleMutasiKamar = (studentId: string, targetKamarId: string, targetBedId: string) => {
    // 1. Locate current penempatan
    const currentPn = penempatans.find(pn => pn.studentId === studentId);
    if (!currentPn) return;

    // 2. Clear old bed status
    setBeds(prev => prev.map(b => b.id === currentPn.bedId ? { ...b, status: 'TERSEDIA' } : b));

    // 3. Mark new bed occupied
    setBeds(prev => prev.map(b => b.id === targetBedId ? { ...b, status: 'TERISI' } : b));

    // 4. Update Penempatan object
    setPenempatans(prev => prev.map(pn => pn.studentId === studentId ? { ...pn, kamarId: targetKamarId, bedId: targetBedId } : pn));

    const sName = students.find(s => s.id === studentId)?.name || 'Santri';
    const rName = kamars.find(k => k.id === targetKamarId)?.name || 'Kamar';
    triggerAction('MUTASI', 'ASRAMA', `Mutasi Santri: ${sName} dipindahkan ke ${rName}`);
  };

  const handleAddTahfidzLog = (t: Omit<Tahfidz, 'id'>) => {
    const id = `tf-${Date.now()}`;
    setTahfidzLogs(prev => [ { id, ...t }, ...prev]);

    // Update target progression if exists
    setTargetHafalans(prev => prev.map(tgt => {
      if (tgt.studentId === t.studentId) {
        return { ...tgt, achievedJuz: Math.max(tgt.achievedJuz, t.juz) };
      }
      return tgt;
    }));

    const sName = students.find(s => s.id === t.studentId)?.name || 'Santri';
    triggerAction('SETORAN_TAHFIDZ', 'TAHFIDZ', `Santri ${sName} menyetorkan Juz ${t.juz} (${t.surah}) dengan nilai ${t.nilai}`);
  };

  const handleUpdateIbadah = (studentId: string, updatedLog: Partial<IbadahLog>) => {
    setIbadahLogs(prev => prev.map(ib => {
      if (ib.studentId === studentId) {
        return { ...ib, ...updatedLog } as IbadahLog;
      }
      return ib;
    }));
    const sName = students.find(s => s.id === studentId)?.name || 'Santri';
    triggerAction('UPDATE_IBADAH', 'TAHFIDZ', `Lembar amalan ibadah harian santri ${sName} diperbarui`);
  };

  const handleAddLaundry = (l: Omit<Laundry, 'id'>) => {
    const id = `ld-${Date.now()}`;
    setLaundries(prev => [...prev, { id, ...l }]);
    const sName = students.find(s => s.id === l.studentId)?.name || 'Santri';
    triggerAction('CREATE', 'LAUNDRY', `Menerima laundry ${l.weight} Kg dari santri ${sName}`);
  };

  const handleAdvanceLaundry = (id: string) => {
    setLaundries(prev => prev.map(l => {
      if (l.id === id) {
        const nextStatus: Laundry['status'] = 
          l.status === 'PENERIMAAN' ? 'PROSES' : 
          l.status === 'PROSES' ? 'SELESAI' : 'PENGAMBILAN';
        return { ...l, status: nextStatus, dateCompleted: nextStatus === 'SELESAI' ? new Date().toISOString().split('T')[0] : l.dateCompleted };
      }
      return l;
    }));
    triggerAction('UPDATE_STATUS', 'LAUNDRY', `Status laundry ID #${id} dimajukan`);
  };

  const handleAddTitipan = (t: Omit<BarangTitipan, 'id'>) => {
    const id = `bt-${Date.now()}`;
    setTitipans(prev => [...prev, { id, ...t }]);
    const sName = students.find(s => s.id === t.studentId)?.name || 'Santri';
    triggerAction('DEPOSIT', 'TITIPAN', `Titipan baru ${t.itemName} (${t.category}) dari ${sName}`);
  };

  const handleReturnTitipan = (id: string) => {
    setTitipans(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, status: 'DIAMBIL', dateReturned: new Date().toISOString().split('T')[0] };
      }
      return t;
    }));
    triggerAction('WITHDRAW', 'TITIPAN', `Barang titipan #${id} diserahterimakan kembali ke santri`);
  };

  const handleAddKonsumsi = (k: Omit<Konsumsi, 'id'>) => {
    const id = `ks-${Date.now()}`;
    setKonsumsis(prev => [...prev, { id, ...k }]);
    triggerAction('CREATE', 'KONSUMSI', `Menu Makanan baru hari ${k.day} (${k.mealType}) ditambahkan`);
  };

  const handleAddPelanggaran = (p: Omit<Pelanggaran, 'id'>) => {
    const id = `pl-${Date.now()}`;
    setPelanggarans(prev => [...prev, { id, ...p }]);
    const sName = students.find(s => s.id === p.studentId)?.name || 'Santri';
    triggerAction('VIOLATION', 'KEDISIPLINAN', `Sanksi poin diberikan kepada ${sName} atas pelanggaran ${p.violation}`);
  };

  const handleApprovePermit = (id: string, status: 'APPROVED' | 'REJECTED') => {
    setPerizinans(prev => prev.map(pz => {
      if (pz.id === id) {
        return { ...pz, status, approvedBy: 'Ustadz Ahmad Fauzi', whatsappSent: true };
      }
      return pz;
    }));
    const pz = perizinans.find(p => p.id === id);
    const sName = pz ? getStudentName(pz.studentId) : 'Santri';
    triggerAction(status, 'PERIZINAN', `Pengajuan Izin santri ${sName} telah di-${status.toLowerCase()}. Notifikasi WhatsApp terkirim ke wali.`);
  };

  const handleAddIncident = (i: Omit<Keamanan, 'id'>) => {
    const id = `km-${Date.now()}`;
    setKeamanans(prev => [...prev, { id, ...i }]);
    triggerAction('SECURITY', 'KEAMANAN', `Log baru dicatat oleh ${i.officer}: ${i.description}`);
  };

  const handleImportCSV = (data: string) => {
    // Simulated CSV Import
    triggerAction('IMPORT', 'DATABASE', `Memproses data import. Sukses mengimpor baris baru`);
  };

  const getStudentName = (id: string) => students.find(s => s.id === id)?.name || 'Santri';

  // Preset information map
  const presetConfig = {
    PONDOK_MODERN: {
      title: "Pondok Modern Boarding ERP",
      desc: "Kurikulum terpadu Gontor modern, sains, dan pembiasaan bahasa resmi (Arab & Inggris)",
      badge: "Modern",
      color: "from-blue-600 to-indigo-700",
      accent: "blue"
    },
    PONDOK_SALAF: {
      title: "Pesantren Salafiyah Tradisional",
      desc: "Metode kajian Kitab Kuning, Sorogan, Bandongan, dan pendalaman ilmu syar\'i klasik",
      badge: "Salafiyah",
      color: "from-emerald-600 to-teal-700",
      accent: "emerald"
    },
    BOARDING_SCHOOL: {
      title: "National Boarding School Center",
      desc: "Fokus akademik nasional, olimpiade sains, kepemimpinan, dan asrama modern",
      badge: "Boarding",
      color: "from-purple-600 to-indigo-700",
      accent: "purple"
    },
    RUMAH_TAHFIDZ: {
      title: "Rumah Tahfidz & Quranic School",
      desc: "Fokus akselerasi hafalan Al-Qur\'an 30 Juz, talaqqi, tajwid, dan sanad qiraah",
      badge: "Tahfidz",
      color: "from-rose-600 to-orange-600",
      accent: "rose"
    },
    MAHAD: {
      title: "Ma'had Aly & Dirasah Islamiyah",
      desc: "Perguruan tinggi pesantren, pendalaman fiqih madzhab, bahasa arab murni",
      badge: "Ma'had Aly",
      color: "from-teal-650 to-green-700",
      accent: "teal"
    }
  };

  // Compute stats
  const totalStudents = students.length;
  const occupiedBedsCount = beds.filter(b => b.status === 'TERISI').length;
  const totalBedsCount = beds.length;
  const activePermitsCount = perizinans.filter(p => p.status === 'PENDING').length;
  const activeIncidents = keamanans.filter(k => k.status === 'BUTUH_TINDAKAN').length;

  return (
    <div className="space-y-6">
      
      {/* Dynamic Toast Notifier */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white font-mono text-xs px-4 py-3 rounded-xl shadow-2xl border border-slate-750 flex items-center gap-3 animate-slide-in">
          <div className="h-2 w-2 rounded-full bg-teal-500 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Preset Banner Selector */}
      <div className="bg-white border rounded-2xl shadow-sm p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 bg-teal-50 text-teal-700 font-extrabold uppercase rounded-full text-[9px] tracking-wider border border-teal-200">
                CORE 19
              </span>
              <span className="text-slate-400 font-mono text-xs">•</span>
              <h1 className="text-lg font-extrabold text-slate-800 tracking-tight">Boarding &amp; Pesantren Management</h1>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Alur kerja terpadu untuk pendampingan asrama, pencatatan ibadah, halaqah Quran, perizinan keluar-masuk, konsumsi, dan audit keamanan.
            </p>
          </div>

          {/* Selector pills */}
          <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl">
            {(Object.keys(presetConfig) as PresetMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => {
                  setPresetMode(mode);
                  triggerAction('CONFIG_CHANGE', 'SYSTEM', `Mengubah modul boarding ke preset: ${mode}`);
                }}
                className={`px-3 py-1.5 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer ${
                  presetMode === mode 
                    ? 'bg-teal-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {presetConfig[mode].badge}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Preset Details card */}
        <div className="mt-4 p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-teal-50 text-teal-600 shrink-0`}>
              {presetMode === 'PONDOK_SALAF' ? <Sprout className="h-5 w-5" /> : <GraduationCap className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-xs">{presetConfig[presetMode].title}</h3>
              <p className="text-[10px] text-slate-500 leading-normal">{presetConfig[presetMode].desc}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 font-mono">
            <span>Status:</span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-sans uppercase">Enterprise Active</span>
          </div>
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-1 shrink-0">
        {[
          { id: 'dashboard', label: 'Dashboard Pesantren', icon: Home },
          { id: 'asrama', label: 'Gedung & Asrama', icon: LayoutGrid },
          { id: 'tahfidz', label: 'Tahfidz & Ibadah', icon: BookOpen },
          { id: 'services', label: 'Layanan Asrama', icon: Shirt },
          { id: 'audit_records', label: 'Kedisiplinan, Perizinan & Audit', icon: ShieldCheck },
          { id: 'mobile_sim', label: 'Simulasi Mobile App', icon: Smartphone }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveMainTab(tab.id as any)}
              className={`flex items-center gap-2 py-2.5 px-4 font-bold text-xs rounded-t-xl shrink-0 transition-all cursor-pointer ${
                activeMainTab === tab.id 
                  ? 'bg-white border-t border-x border-slate-200 text-teal-600 font-extrabold shadow-[0_-2px_6px_rgba(0,0,0,0.02)]' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* CONTENT WORKSPACE */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm min-h-[450px]">
        
        {/* TAB 1: EXECUTIVE DASHBOARD */}
        {activeMainTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* Core Stats Bento */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-slate-50 border p-4 rounded-xl shadow-xs">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Santri</p>
                <h4 className="text-xl font-black text-slate-800 mt-1">{totalStudents}</h4>
                <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-semibold mt-1 inline-block">Mondok</span>
              </div>

              <div className="bg-slate-50 border p-4 rounded-xl shadow-xs">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Beds Terpakai</p>
                <h4 className="text-xl font-black text-slate-800 mt-1">{occupiedBedsCount} <span className="text-xs font-normal text-slate-400">/ {totalBedsCount}</span></h4>
                <div className="w-full bg-slate-200 h-1 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-teal-500" style={{ width: `${(occupiedBedsCount/totalBedsCount)*100}%` }} />
                </div>
              </div>

              <div className="bg-slate-50 border p-4 rounded-xl shadow-xs">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Izin Pending</p>
                <h4 className="text-xl font-black text-amber-600 mt-1">{activePermitsCount} <span className="text-xs font-normal text-slate-400">Santri</span></h4>
                <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.2 rounded font-semibold mt-1 inline-block">Approval</span>
              </div>

              <div className="bg-slate-50 border p-4 rounded-xl shadow-xs">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Keamanan Log</p>
                <h4 className="text-xl font-black text-red-600 mt-1">{activeIncidents} <span className="text-xs font-normal text-slate-400">Incident</span></h4>
                <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-semibold mt-1 inline-block">Need Action</span>
              </div>

              <div className="bg-slate-50 border p-4 rounded-xl shadow-xs col-span-2 md:col-span-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Laundry Today</p>
                <h4 className="text-xl font-black text-slate-800 mt-1">{laundries.filter(l => l.status === 'PENERIMAAN').length} <span className="text-xs font-normal text-slate-400">Bags</span></h4>
                <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded font-semibold mt-1 inline-block">Queued</span>
              </div>
            </div>

            {/* Main grid dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Quick lists */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Active Worship Log highlight */}
                <div className="bg-slate-50/50 border rounded-xl p-4 space-y-3">
                  <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Lembar Ibadah Hari Ini (Amalan Terkontrol)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {ibadahLogs.slice(0, 3).map(ib => (
                      <div key={ib.id} className="bg-white border rounded-lg p-3 space-y-2">
                        <p className="font-bold text-slate-800 text-[11px]">{getStudentName(ib.studentId)}</p>
                        <div className="space-y-1 text-[10px] text-slate-500">
                          <p className="flex justify-between"><span>Jamaah Shalat:</span> <strong className="text-slate-700">{Object.values(ib.shalatJamaah).filter(Boolean).length}/5</strong></p>
                          <p className="flex justify-between"><span>Tahajud:</span> <strong className="text-slate-700">{ib.tahajud ? '✅' : '❌'}</strong></p>
                          <p className="flex justify-between"><span>Dhuha:</span> <strong className="text-slate-700">{ib.dhuha ? '✅' : '❌'}</strong></p>
                          <p className="flex justify-between"><span>Puasa Sunnah:</span> <strong className="text-slate-700">{ib.puasa !== 'NONE' ? '✅' : '❌'}</strong></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tahfidz Halaqah Highlights */}
                <div className="bg-slate-50/50 border rounded-xl p-4 space-y-3">
                  <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-teal-600" />
                    <span>Halaqah Qur'an: Setoran Terbaru</span>
                  </h4>
                  <div className="divide-y divide-slate-100 bg-white border rounded-lg overflow-hidden">
                    {tahfidzLogs.slice(0, 3).map(tf => (
                      <div key={tf.id} className="p-3 flex justify-between items-center text-[11px]">
                        <div>
                          <p className="font-bold text-slate-800">{getStudentName(tf.studentId)}</p>
                          <p className="text-[9px] text-slate-400">Juz {tf.juz} • {tf.surah} Ayat {tf.verseRange}</p>
                        </div>
                        <div className="text-right">
                          <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[9px] font-bold">
                            NILAI {tf.nilai}
                          </span>
                          <p className="text-[9px] text-slate-400 mt-0.5">Ust. {tf.pembimbing.split(' ')[1] || tf.pembimbing}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Security, Dining menu and Audit logs */}
              <div className="space-y-6">
                
                {/* Dining Menu Box */}
                <div className="bg-amber-50/30 border border-amber-100 p-4 rounded-xl space-y-3">
                  <h4 className="font-extrabold text-amber-800 text-xs flex items-center gap-2">
                    <Coffee className="h-4 w-4 text-amber-600" />
                    <span>Sajian Dapur Hari Ini</span>
                  </h4>
                  <div className="space-y-2 text-[11px]">
                    {konsumsis.slice(0, 2).map(ks => (
                      <div key={ks.id} className="bg-white border border-amber-100 rounded-lg p-2.5">
                        <p className="font-bold text-amber-800 text-[10px] uppercase">Makan {ks.mealType}</p>
                        <p className="text-slate-700 mt-1 leading-normal font-medium">"{ks.menu}"</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Security status */}
                <div className="bg-red-50/20 border border-red-100 p-4 rounded-xl space-y-3">
                  <h4 className="font-extrabold text-red-800 text-xs flex items-center gap-2">
                    <Shield className="h-4 w-4 text-red-600" />
                    <span>Laporan Keamanan Aktif</span>
                  </h4>
                  <div className="bg-white border rounded-lg p-3 text-[11px]">
                    <p className="font-bold text-slate-800">Status Patroli Terakhir:</p>
                    <p className="text-slate-650 mt-1 leading-relaxed italic">
                      "{keamanans[0]?.description || 'Kondisi steril, asrama terkunci.'}"
                    </p>
                    <p className="text-[10px] text-slate-400 mt-2 font-mono">{keamanans[0]?.officer}</p>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* TAB 2: ASRAMA & GEDUNG */}
        {activeMainTab === 'asrama' && (
          <AsramaSection 
            gedungs={gedungs}
            kamars={kamars}
            beds={beds}
            students={students}
            penempatans={penempatans}
            musyrifs={musyrifs}
            onAddGedung={handleAddGedung}
            onAddKamar={handleAddKamar}
            onAddPenempatan={handleAddPenempatan}
            onMutasiKamar={handleMutasiKamar}
          />
        )}

        {/* TAB 3: TAHFIDZ & IBADAH */}
        {activeMainTab === 'tahfidz' && (
          <TahfidzSection 
            tahfidzLogs={tahfidzLogs}
            targetHafalans={targetHafalans}
            ibadahLogs={ibadahLogs}
            students={students}
            onAddTahfidzLog={handleAddTahfidzLog}
            onUpdateIbadah={handleUpdateIbadah}
          />
        )}

        {/* TAB 4: LAYANAN ASRAMA */}
        {activeMainTab === 'services' && (
          <ServicesSection 
            laundries={laundries}
            titipans={titipans}
            lokers={lokers}
            konsumsis={konsumsis}
            pikets={pikets}
            students={students}
            onAddLaundry={handleAddLaundry}
            onAdvanceLaundry={handleAdvanceLaundry}
            onAddTitipan={handleAddTitipan}
            onReturnTitipan={handleReturnTitipan}
            onAddKonsumsi={handleAddKonsumsi}
          />
        )}

        {/* TAB 5: AUDIT, DISCIPLINE & PERMISSIONS */}
        {activeMainTab === 'audit_records' && (
          <AuditSection 
            pelanggarans={pelanggarans}
            prestasils={prestasils}
            pembinaans={pembinaans}
            perizinans={perizinans}
            kunjungans={kunjungans}
            keamanans={keamanans}
            auditLogs={auditLogs}
            students={students}
            onAddPelanggaran={handleAddPelanggaran}
            onApprovePermit={handleApprovePermit}
            onAddIncident={handleAddIncident}
            onImportCSV={handleImportCSV}
          />
        )}

        {/* TAB 6: MOBILE PORTAL SIMULATOR */}
        {activeMainTab === 'mobile_sim' && (
          <div className="max-w-xs mx-auto bg-slate-950 p-3 rounded-[32px] border-4 border-slate-800 shadow-2xl relative">
            {/* Notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-800 rounded-full z-20 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-slate-900 mr-2" />
              <span className="w-8 h-1 rounded-full bg-slate-900" />
            </div>

            <div className="bg-[#f8fafc] w-full rounded-[24px] overflow-hidden text-slate-800 min-h-[460px] pb-4 select-none pt-6 font-sans">
              
              {/* Mobile Header */}
              <div className="bg-teal-600 text-white p-4 pb-6 pt-3">
                <div className="flex justify-between items-center text-[10px] opacity-80 mb-2">
                  <span>Simulated Mobile View</span>
                  <span>100% LTE</span>
                </div>
                <h4 className="font-extrabold text-xs">Aplikasi Wali Santri</h4>
                <p className="text-[9px] opacity-90 mt-0.5">Monitoring Terpadu Pesantren</p>
              </div>

              {/* Mobile Content (Scrollable simulation) */}
              <div className="p-3 -mt-4 space-y-3 h-80 overflow-y-auto">
                
                {/* Santri identity */}
                <div className="bg-white border rounded-xl p-3 shadow-xs flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0">
                    MF
                  </div>
                  <div>
                    <h5 className="font-extrabold text-[10px] text-slate-800">Muhammad Farhan</h5>
                    <p className="text-[8px] text-slate-400 font-bold">Kamar Abu Bakar (Bed A-1)</p>
                  </div>
                </div>

                {/* Quran Memorization Widget */}
                <div className="bg-white border rounded-xl p-3 shadow-xs space-y-1.5">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Hafalan Quran</p>
                  <div className="flex justify-between text-[10px]">
                    <span className="font-bold text-slate-800">Pencapaian Juz</span>
                    <span className="font-mono text-teal-600 font-bold">29 / 30 Juz</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500" style={{ width: '96%' }} />
                  </div>
                </div>

                {/* Digital Permit QR Code Card */}
                <div className="bg-teal-50 border border-teal-100 rounded-xl p-3 shadow-xs text-center space-y-2">
                  <p className="text-[8px] text-teal-700 font-bold uppercase tracking-widest">Surat Izin Digital (QR Code)</p>
                  <div className="h-16 w-16 bg-white mx-auto border p-1 rounded-md flex items-center justify-center">
                    {/* Simulated QR block layout */}
                    <div className="grid grid-cols-4 gap-0.5 h-14 w-14">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <span key={i} className={`h-full w-full ${i % 3 === 0 || i % 7 === 0 ? 'bg-slate-900' : 'bg-white'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-[8px] text-slate-500 leading-normal">Tunjukkan QR ini pada gerbang keamanan pesantren saat kepulangan</p>
                </div>

                {/* Today's menu info */}
                <div className="bg-white border rounded-xl p-3 shadow-xs space-y-1">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Menu Makan Siang Hari Ini</p>
                  <p className="text-[10px] font-medium text-slate-700">"Nasi Putih + Sayur Asem + Ayam Goreng Lengkuas + Tempe"</p>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
