/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Award, 
  FileText, 
  ShieldCheck, 
  Bell, 
  Download, 
  Upload, 
  Check, 
  X, 
  AlertTriangle,
  ClipboardList,
  Plus
} from 'lucide-react';
import { 
  Pelanggaran, 
  Prestasi, 
  Pembinaan, 
  Perizinan, 
  Kunjungan, 
  Keamanan, 
  AuditLog, 
  Student 
} from '../../types/boarding';

interface AuditSectionProps {
  pelanggarans: Pelanggaran[];
  prestasils: Prestasi[];
  pembinaans: Pembinaan[];
  perizinans: Perizinan[];
  kunjungans: Kunjungan[];
  keamanans: Keamanan[];
  auditLogs: AuditLog[];
  students: Student[];
  onAddPelanggaran: (p: Omit<Pelanggaran, 'id'>) => void;
  onApprovePermit: (id: string, status: 'APPROVED' | 'REJECTED') => void;
  onAddIncident: (i: Omit<Keamanan, 'id'>) => void;
  onImportCSV: (data: string) => void;
}

export default function AuditSection({
  pelanggarans,
  prestasils,
  pembinaans,
  perizinans,
  kunjungans,
  keamanans,
  auditLogs,
  students,
  onAddPelanggaran,
  onApprovePermit,
  onAddIncident,
  onImportCSV
}: AuditSectionProps) {
  const [activeSubTab, setActiveSubTab] = useState<'discipline' | 'permits' | 'keamanan' | 'audit_export'>('discipline');
  
  // Modals state
  const [showViolationForm, setShowViolationForm] = useState(false);
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [importText, setImportText] = useState('');
  const [showImportArea, setShowImportArea] = useState(false);

  // Form states
  const [newViolation, setNewViolation] = useState({
    studentId: '',
    category: 'RINGAN' as const,
    violation: '',
    points: 5,
    punishment: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [newIncident, setNewIncident] = useState({
    type: 'PATROLI' as const,
    officer: 'Pak Bambang (Chief Security)',
    description: '',
    status: 'AMAN' as const,
    timestamp: new Date().toISOString().slice(0, 16)
  });

  const getStudentName = (id: string) => students.find(s => s.id === id)?.name || 'Santri';

  const handleViolationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newViolation.studentId || !newViolation.violation) return;
    onAddPelanggaran(newViolation);
    setNewViolation({
      studentId: '',
      category: 'RINGAN',
      violation: '',
      points: 5,
      punishment: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowViolationForm(false);
  };

  const handleIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncident.description) return;
    onAddIncident(newIncident);
    setNewIncident({
      type: 'PATROLI',
      officer: 'Pak Bambang (Chief Security)',
      description: '',
      status: 'AMAN',
      timestamp: new Date().toISOString().slice(0, 16)
    });
    setShowIncidentForm(false);
  };

  const downloadCSV = (moduleName: string, items: any[]) => {
    if (items.length === 0) return;
    const headers = Object.keys(items[0]).join(',');
    const rows = items.map(item => 
      Object.values(item).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${moduleName}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    onImportCSV(importText);
    setImportText('');
    setShowImportArea(false);
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Sub tabs */}
      <div className="flex border-b border-slate-200 gap-4 pb-2">
        {(['discipline', 'permits', 'keamanan', 'audit_export'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`pb-2 px-1 text-xs font-bold capitalize transition-all cursor-pointer ${
              activeSubTab === tab ? 'text-teal-600 border-b-2 border-teal-500 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab === 'discipline' ? 'Kedisiplinan &amp; Sanksi' : tab === 'permits' ? 'Perizinan &amp; Wali' : tab === 'keamanan' ? 'Keamanan &amp; Patroli' : 'Audit Trail &amp; Eksport'}
          </button>
        ))}
      </div>

      {/* 1: DISCIPLINE */}
      {activeSubTab === 'discipline' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-600" />
              <span>Poin Pelanggaran &amp; Penghargaan Prestasi</span>
            </h4>
            <button
              onClick={() => setShowViolationForm(true)}
              className="px-3 py-1.5 bg-red-650 hover:bg-red-750 text-white font-bold rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Catat Pelanggaran Santri
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pelanggaran */}
            <div className="space-y-3">
              <h5 className="font-extrabold text-slate-700">Daftar Pelanggaran &amp; Sanksi</h5>
              <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 text-slate-550 font-bold">
                      <th className="p-2.5">Santri</th>
                      <th className="p-2.5">Pelanggaran</th>
                      <th className="p-2.5 text-center">Poin</th>
                      <th className="p-2.5">Sanksi / Pembinaan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pelanggarans.map(pl => (
                      <tr key={pl.id} className="hover:bg-slate-50">
                        <td className="p-2.5">
                          <p className="font-bold text-slate-800">{getStudentName(pl.studentId)}</p>
                          <p className="text-[9px] text-slate-400 font-mono">{pl.date}</p>
                        </td>
                        <td className="p-2.5">
                          <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold mr-1.5 ${
                            pl.category === 'BERAT' ? 'bg-red-100 text-red-800 border border-red-200' :
                            pl.category === 'SEDANG' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-650'
                          }`}>
                            {pl.category}
                          </span>
                          <span className="text-slate-755">{pl.violation}</span>
                        </td>
                        <td className="p-2.5 text-center font-bold text-red-650 font-mono">-{pl.points}</td>
                        <td className="p-2.5 italic text-slate-550 font-semibold">"{pl.punishment}"</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Prestasi */}
            <div className="space-y-3">
              <h5 className="font-extrabold text-slate-700">Penghargaan Prestasi Santri</h5>
              <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 text-slate-550 font-bold">
                      <th className="p-2.5">Santri</th>
                      <th className="p-2.5">Kategori</th>
                      <th className="p-2.5">Prestasi yang Diraih</th>
                      <th className="p-2.5">Tingkat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {prestasils.map(pr => (
                      <tr key={pr.id} className="hover:bg-slate-50">
                        <td className="p-2.5">
                          <p className="font-bold text-slate-800">{getStudentName(pr.studentId)}</p>
                          <p className="text-[9px] text-slate-400 font-mono">{pr.date}</p>
                        </td>
                        <td className="p-2.5 font-bold uppercase tracking-wide text-teal-600">{pr.category}</td>
                        <td className="p-2.5 font-semibold text-slate-700">{pr.achievement}</td>
                        <td className="p-2.5 font-bold text-slate-550 flex items-center gap-1">
                          <Award className="h-3 w-3 text-amber-500" />
                          <span>{pr.level}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2: PERMITS & VISITORS */}
      {activeSubTab === 'permits' && (
        <div className="space-y-6">
          <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
            <FileText className="h-4 w-4 text-teal-600" />
            <span>Perizinan Santri &amp; Buku Tamu Kunjungan Wali</span>
          </h4>

          <div className="space-y-3">
            <h5 className="font-extrabold text-slate-700">Daftar Pengajuan Surat Izin Asrama</h5>
            <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-slate-550 font-bold">
                    <th className="p-3">Santri</th>
                    <th className="p-3">Jenis Izin</th>
                    <th className="p-3">Alasan Keluar</th>
                    <th className="p-3">Rentang Tanggal</th>
                    <th className="p-3">Notifikasi WhatsApp</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {perizinans.map(pz => (
                    <tr key={pz.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-800">{getStudentName(pz.studentId)}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold">
                          {pz.type}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-slate-700">{pz.reason}</td>
                      <td className="p-3 font-mono text-slate-500">{pz.dateStart} s/d {pz.dateEnd}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold ${
                          pz.whatsappSent ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-400'
                        }`}>
                          <Bell className="h-3 w-3" />
                          <span>{pz.whatsappSent ? 'Terkirim' : 'Menunggu'}</span>
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          pz.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          pz.status === 'REJECTED' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'
                        }`}>
                          {pz.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {pz.status === 'PENDING' ? (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => onApprovePermit(pz.id, 'APPROVED')}
                              className="p-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded cursor-pointer"
                              title="Setujui"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => onApprovePermit(pz.id, 'REJECTED')}
                              className="p-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded cursor-pointer"
                              title="Tolak"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-semibold italic">Approved by "{pz.approvedBy || 'Sistem'}"</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3: KEAMANAN & PATROLI */}
      {activeSubTab === 'keamanan' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-teal-600" />
              <span>Sistem Patroli Keamanan &amp; Laporan Insiden Asrama</span>
            </h4>
            <button
              onClick={() => setShowIncidentForm(true)}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Log Patroli / Insiden
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {keamanans.map(km => (
              <div key={km.id} className="bg-white border p-4 rounded-xl shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      km.type === 'PATROLI' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      {km.type}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      km.status === 'AMAN' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      km.status === 'BUTUH_TINDAKAN' ? 'bg-red-50 text-red-750 animate-pulse' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {km.status}
                    </span>
                  </div>
                  <p className="font-bold text-slate-800 text-xs leading-relaxed">"{km.description}"</p>
                </div>
                <div className="mt-4 border-t pt-2 flex justify-between items-center text-[10px] text-slate-400">
                  <span className="font-semibold">{km.officer}</span>
                  <span className="font-mono">{new Date(km.timestamp).toLocaleString('id-ID')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4: AUDIT TRAIL & EXPORT */}
      {activeSubTab === 'audit_export' && (
        <div className="space-y-6">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-teal-600" />
              <span>Sistem Keamanan Log Aktivitas (Audit Trail) &amp; Integrasi Data</span>
            </h4>
            <div className="flex gap-2">
              <button
                onClick={() => setShowImportArea(!showImportArea)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg flex items-center gap-1 cursor-pointer border"
              >
                <Upload className="h-3.5 w-3.5" /> Import CSV
              </button>
              <button
                onClick={() => downloadCSV('BOARDING_AUDIT', auditLogs)}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" /> Ekspor Audit CSV
              </button>
            </div>
          </div>

          {/* Import area */}
          {showImportArea && (
            <div className="bg-slate-50 border border-dashed border-slate-300 p-4 rounded-xl space-y-3">
              <p className="font-bold text-slate-700">Paste Data CSV untuk Import Santri / Kamar / Pelanggaran</p>
              <textarea
                value={importText}
                onChange={e => setImportText(e.target.value)}
                className="w-full h-24 p-3 border rounded bg-white text-xs font-mono"
                placeholder="name,nis,gender,class&#10;Muhammad Ali,1301,PUTRA,10-A&#10;Khadijah,2044,PUTRI,11-C"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowImportArea(false)}
                  className="px-3 py-1 bg-slate-200 text-slate-700 rounded font-bold"
                >
                  Batal
                </button>
                <button
                  onClick={handleImport}
                  className="px-3 py-1 bg-teal-650 text-white rounded font-bold hover:bg-teal-750"
                >
                  Proses Import
                </button>
              </div>
            </div>
          )}

          <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[11px] h-64 overflow-y-auto space-y-1.5 shadow-inner">
            <p className="text-teal-400 font-bold border-b border-teal-800 pb-1.5 mb-2 flex items-center gap-2">
              <span>● SYSTEM AUDIT LOG SYSTEM (REAL-TIME STREAM)</span>
            </p>
            {auditLogs.map(log => (
              <p key={log.id} className="leading-relaxed hover:bg-slate-800 p-1 rounded">
                <span className="text-indigo-400 font-bold">[{log.timestamp}]</span>{' '}
                <span className="text-yellow-400 font-bold">&lt;{log.module}&gt;</span>{' '}
                <span className="text-emerald-400 font-bold">{log.action}</span> -{' '}
                <span className="text-slate-200">{log.details}</span>{' '}
                <span className="text-slate-500 text-[10px]">by {log.user}</span>
              </p>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD VIOLATION */}
      {showViolationForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-xl p-5 border border-slate-200 shadow-xl space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">Catat Pelanggaran Santri</h4>
            <form onSubmit={handleViolationSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Pilih Santri</label>
                <select
                  required
                  value={newViolation.studentId}
                  onChange={e => setNewViolation({ ...newViolation, studentId: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded-lg focus:outline-none"
                >
                  <option value="">-- Pilih Santri --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.nis})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Kategori Sanksi</label>
                  <select
                    value={newViolation.category}
                    onChange={e => {
                      const cat = e.target.value as any;
                      const pts = cat === 'BERAT' ? 50 : cat === 'SEDANG' ? 15 : 5;
                      setNewViolation({ ...newViolation, category: cat, points: pts });
                    }}
                    className="w-full px-3 py-1.5 border rounded-lg focus:outline-none"
                  >
                    <option value="RINGAN">Ringan</option>
                    <option value="SEDANG">Sedang</option>
                    <option value="BERAT">Berat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Bobot Poin</label>
                  <input
                    type="number"
                    required
                    value={newViolation.points}
                    onChange={e => setNewViolation({ ...newViolation, points: parseInt(e.target.value) || 5 })}
                    className="w-full px-3 py-1.5 border rounded-lg focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">Bentuk Pelanggaran / Kronologi</label>
                <input
                  type="text"
                  required
                  value={newViolation.violation}
                  onChange={e => setNewViolation({ ...newViolation, violation: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded-lg focus:outline-none"
                  placeholder="Terlambat jamaah subuh / Merusak lemari"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">Sanksi / Tindakan Pembinaan</label>
                <input
                  type="text"
                  required
                  value={newViolation.punishment}
                  onChange={e => setNewViolation({ ...newViolation, punishment: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded-lg focus:outline-none"
                  placeholder="E.g. Menulis Istighfar / Skorsing 3 hari"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowViolationForm(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-red-650 text-white hover:bg-red-755 rounded-lg font-bold"
                >
                  Simpan Sanksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD INCIDENT */}
      {showIncidentForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-xl p-5 border border-slate-200 shadow-xl space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">Catat Log Keamanan / Patroli</h4>
            <form onSubmit={handleIncidentSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Jenis Aktivitas</label>
                  <select
                    value={newIncident.type}
                    onChange={e => setNewIncident({ ...newIncident, type: e.target.value as any })}
                    className="w-full px-3 py-1.5 border rounded-lg focus:outline-none"
                  >
                    <option value="PATROLI">Patroli Rutin</option>
                    <option value="INSIDEN">Laporan Kejadian/Insiden</option>
                    <option value="CHECK_IN">Check In Tamu Khusus</option>
                    <option value="CHECK_OUT">Check Out Tamu Khusus</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Status Keamanan</label>
                  <select
                    value={newIncident.status}
                    onChange={e => setNewIncident({ ...newIncident, status: e.target.value as any })}
                    className="w-full px-3 py-1.5 border rounded-lg focus:outline-none"
                  >
                    <option value="AMAN">Kondisi Aman</option>
                    <option value="BUTUH_TINDAKAN">Butuh Tindakan Segera</option>
                    <option value="SELESAI">Selesai Ditangani</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">Petugas Piket</label>
                <input
                  type="text"
                  required
                  value={newIncident.officer}
                  onChange={e => setNewIncident({ ...newIncident, officer: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">Deskripsi &amp; Hasil Temuan Lapangan</label>
                <textarea
                  required
                  value={newIncident.description}
                  onChange={e => setNewIncident({ ...newIncident, description: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded-lg focus:outline-none h-16"
                  placeholder="Kondisi pintu gerbang barat terkunci rapat. Penerangan asrama normal."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIncidentForm(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-teal-600 text-white hover:bg-teal-700 rounded-lg font-bold"
                >
                  Simpan Laporan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
