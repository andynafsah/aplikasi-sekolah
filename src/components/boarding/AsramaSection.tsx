/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  LayoutGrid, 
  Plus, 
  MapPin, 
  Eye, 
  ArrowRightLeft, 
  Users, 
  Clock,
  Shield,
  Trash2
} from 'lucide-react';
import { Gedung, Kamar, TempatTidur, Student, Penempatan, Musyrif } from '../../types/boarding';

interface AsramaSectionProps {
  gedungs: Gedung[];
  kamars: Kamar[];
  beds: TempatTidur[];
  students: Student[];
  penempatans: Penempatan[];
  musyrifs: Musyrif[];
  onAddGedung: (g: Omit<Gedung, 'id'>) => void;
  onAddKamar: (k: Omit<Kamar, 'id'>) => void;
  onAddPenempatan: (p: Omit<Penempatan, 'id'>) => void;
  onMutasiKamar: (studentId: string, targetKamarId: string, targetBedId: string) => void;
}

export default function AsramaSection({
  gedungs,
  kamars,
  beds,
  students,
  penempatans,
  musyrifs,
  onAddGedung,
  onAddKamar,
  onAddPenempatan,
  onMutasiKamar
}: AsramaSectionProps) {
  const [activeSubTab, setActiveSubTab] = useState<'gedung' | 'kamar' | 'penempatan' | 'musyrif'>('gedung');
  const [showGedungForm, setShowGedungForm] = useState(false);
  const [showKamarForm, setShowKamarForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [showMutasiForm, setShowMutasiForm] = useState(false);

  // Form states
  const [newGedung, setNewGedung] = useState({ code: '', name: '', type: 'PUTRA' as const, capacity: 40 });
  const [newKamar, setNewKamar] = useState({ code: '', name: '', floor: 1, capacity: 8, status: 'TERSEDIA' as const, gedungId: '' });
  const [newAssign, setNewAssign] = useState({ studentId: '', kamarId: '', bedId: '', entryDate: new Date().toISOString().split('T')[0] });
  const [mutasi, setMutasi] = useState({ studentId: '', targetKamarId: '', targetBedId: '' });

  const handleGedungSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGedung.code || !newGedung.name) return;
    onAddGedung(newGedung);
    setNewGedung({ code: '', name: '', type: 'PUTRA', capacity: 40 });
    setShowGedungForm(false);
  };

  const handleKamarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKamar.code || !newKamar.name || !newKamar.gedungId) return;
    onAddKamar(newKamar);
    setNewKamar({ code: '', name: '', floor: 1, capacity: 8, status: 'TERSEDIA', gedungId: '' });
    setShowKamarForm(false);
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssign.studentId || !newAssign.kamarId || !newAssign.bedId) return;
    onAddPenempatan(newAssign);
    setShowAssignForm(false);
  };

  const handleMutasiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mutasi.studentId || !mutasi.targetKamarId || !mutasi.targetBedId) return;
    onMutasiKamar(mutasi.studentId, mutasi.targetKamarId, mutasi.targetBedId);
    setShowMutasiForm(false);
  };

  const getStudentName = (id: string) => students.find(s => s.id === id)?.name || 'Santri';
  const getStudentNIS = (id: string) => students.find(s => s.id === id)?.nis || '-';
  const getKamarName = (id: string) => kamars.find(k => k.id === id)?.name || '-';
  const getGedungName = (id: string) => gedungs.find(g => g.id === id)?.name || '-';
  const getBedNo = (id: string) => beds.find(b => b.id === id)?.bedNo || '-';

  return (
    <div className="space-y-4 text-xs">
      {/* Sub menu */}
      <div className="flex border-b border-slate-200 gap-4 pb-2">
        {(['gedung', 'kamar', 'penempatan', 'musyrif'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`pb-2 px-1 text-xs font-bold capitalize transition-all cursor-pointer ${
              activeSubTab === tab ? 'text-teal-600 border-b-2 border-teal-500 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab === 'penempatan' ? 'Alokasi Bed & Penempatan' : tab}
          </button>
        ))}
      </div>

      {/* SUB-TAB 1: GEDUNG */}
      {activeSubTab === 'gedung' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-teal-600" />
              <span>Daftar Gedung Asrama Pesantren</span>
            </h4>
            <button
              onClick={() => setShowGedungForm(true)}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Tambah Gedung
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {gedungs.map(gd => {
              const countKamar = kamars.filter(k => k.gedungId === gd.id).length;
              return (
                <div key={gd.id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 bg-slate-100 font-mono text-[9px] font-bold text-slate-600 rounded">
                      {gd.code}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      gd.type === 'PUTRA' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-pink-50 text-pink-700 border border-pink-100'
                    }`}>
                      {gd.type}
                    </span>
                  </div>
                  <h5 className="font-extrabold text-slate-800 text-xs mt-2">{gd.name}</h5>
                  <div className="mt-3 space-y-1 text-[10px] text-slate-500">
                    <p>Jumlah Kamar: <strong className="text-slate-700">{countKamar} Kamar</strong></p>
                    <p>Kapasitas Santri: <strong className="text-slate-700">{gd.capacity} Orang</strong></p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: KAMAR */}
      {activeSubTab === 'kamar' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-teal-600" />
              <span>Manajemen Kamar &amp; Lantai</span>
            </h4>
            <button
              onClick={() => setShowKamarForm(true)}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Tambah Kamar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {kamars.map(km => {
              const totalBeds = beds.filter(b => b.kamarId === km.id).length;
              const occupiedBeds = beds.filter(b => b.kamarId === km.id && b.status === 'TERISI').length;
              return (
                <div key={km.id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between">
                      <span className="font-mono font-bold text-slate-700">{km.code}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                        km.status === 'TERSEDIA' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        km.status === 'PENUH' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {km.status}
                      </span>
                    </div>
                    <h5 className="font-extrabold text-slate-800 mt-1">{km.name}</h5>
                    <p className="text-slate-400 text-[10px] mt-0.5">Lantai {km.floor} • Gedung: {getGedungName(km.gedungId)}</p>
                  </div>

                  <div className="mt-3 border-t pt-2">
                    <div className="flex justify-between text-[10px] text-slate-500 font-semibold mb-1">
                      <span>Beds Terisi:</span>
                      <span>{occupiedBeds} / {km.capacity}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${occupiedBeds >= km.capacity ? 'bg-red-500' : 'bg-teal-500'}`}
                        style={{ width: `${(occupiedBeds / km.capacity) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: PENEMPATAN & MUTASI */}
      {activeSubTab === 'penempatan' && (
        <div className="space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-teal-600" />
              <span>Alokasi Bed Santri &amp; Mutasi Kamar</span>
            </h4>
            <div className="flex gap-2">
              <button
                onClick={() => setShowMutasiForm(true)}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <ArrowRightLeft className="h-3.5 w-3.5" /> Mutasi Kamar
              </button>
              <button
                onClick={() => setShowAssignForm(true)}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Penempatan Baru
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                    <th className="p-3">Santri</th>
                    <th className="p-3">Kamar</th>
                    <th className="p-3">Tempat Tidur</th>
                    <th className="p-3">Tanggal Masuk</th>
                    <th className="p-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {penempatans.map(pn => (
                    <tr key={pn.id} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <p className="font-bold text-slate-800">{getStudentName(pn.studentId)}</p>
                        <p className="text-[10px] text-slate-400">NIS: {getStudentNIS(pn.studentId)}</p>
                      </td>
                      <td className="p-3 font-semibold text-slate-700">{getKamarName(pn.kamarId)}</td>
                      <td className="p-3 font-mono text-slate-500">{getBedNo(pn.bedId)}</td>
                      <td className="p-3 text-slate-550">{pn.entryDate}</td>
                      <td className="p-3">
                        <button
                          onClick={() => {
                            setMutasi({ studentId: pn.studentId, targetKamarId: '', targetBedId: '' });
                            setShowMutasiForm(true);
                          }}
                          className="text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <ArrowRightLeft className="h-3 w-3" /> Pindahkan
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: MUSYRIF / MUSYRIFAH */}
      {activeSubTab === 'musyrif' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-teal-600" />
              <span>Pembina Pendamping Asrama (Musyrif / Musyrifah)</span>
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {musyrifs.map(my => (
              <div key={my.id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-start gap-3">
                <div className="p-2.5 bg-teal-50 rounded-lg text-teal-600">
                  <Shield className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h5 className="font-bold text-slate-800 text-xs">{my.name}</h5>
                  <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase bg-slate-50 px-1.5 py-0.5 rounded w-fit">
                    {my.type} • {my.shift} Shift
                  </p>
                  <p className="text-[10px] text-slate-500">Mendampingi: <strong className="text-slate-700">{getGedungName(my.dormId)}</strong></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD GEDUNG */}
      {showGedungForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-xl p-5 border border-slate-200 shadow-xl space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">Tambah Gedung Asrama</h4>
            <form onSubmit={handleGedungSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Kode Gedung</label>
                <input
                  type="text"
                  required
                  value={newGedung.code}
                  onChange={e => setNewGedung({ ...newGedung, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-1.5 border rounded-lg focus:outline-none"
                  placeholder="E.g. GD-HAMZAH"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">Nama Gedung</label>
                <input
                  type="text"
                  required
                  value={newGedung.name}
                  onChange={e => setNewGedung({ ...newGedung, name: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded-lg focus:outline-none"
                  placeholder="Asrama Sayyidina Hamzah"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Tipe Asrama</label>
                  <select
                    value={newGedung.type}
                    onChange={e => setNewGedung({ ...newGedung, type: e.target.value as any })}
                    className="w-full px-3 py-1.5 border rounded-lg focus:outline-none"
                  >
                    <option value="PUTRA">PUTRA</option>
                    <option value="PUTRI">PUTRI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Kapasitas</label>
                  <input
                    type="number"
                    value={newGedung.capacity}
                    onChange={e => setNewGedung({ ...newGedung, capacity: parseInt(e.target.value) || 40 })}
                    className="w-full px-3 py-1.5 border rounded-lg focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGedungForm(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-teal-600 text-white hover:bg-teal-700 rounded-lg font-bold"
                >
                  Simpan Gedung
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD KAMAR */}
      {showKamarForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-xl p-5 border border-slate-200 shadow-xl space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">Tambah Kamar Baru</h4>
            <form onSubmit={handleKamarSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Pilih Gedung</label>
                <select
                  required
                  value={newKamar.gedungId}
                  onChange={e => setNewKamar({ ...newKamar, gedungId: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded-lg focus:outline-none"
                >
                  <option value="">-- Pilih Gedung --</option>
                  {gedungs.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Kode Kamar</label>
                  <input
                    type="text"
                    required
                    value={newKamar.code}
                    onChange={e => setNewKamar({ ...newKamar, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-1.5 border rounded-lg focus:outline-none"
                    placeholder="KM-103"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Nama Kamar</label>
                  <input
                    type="text"
                    required
                    value={newKamar.name}
                    onChange={e => setNewKamar({ ...newKamar, name: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-lg focus:outline-none"
                    placeholder="E.g. Ali bin Abi Thalib"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Lantai</label>
                  <input
                    type="number"
                    required
                    value={newKamar.floor}
                    onChange={e => setNewKamar({ ...newKamar, floor: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-1.5 border rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Kapasitas Bed</label>
                  <input
                    type="number"
                    required
                    value={newKamar.capacity}
                    onChange={e => setNewKamar({ ...newKamar, capacity: parseInt(e.target.value) || 8 })}
                    className="w-full px-3 py-1.5 border rounded-lg focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKamarForm(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-teal-600 text-white hover:bg-teal-700 rounded-lg font-bold"
                >
                  Simpan Kamar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PENEMPATAN / ASSIGN */}
      {showAssignForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-xl p-5 border border-slate-200 shadow-xl space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">Alokasikan Bed Baru Santri</h4>
            <form onSubmit={handleAssignSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Pilih Santri</label>
                <select
                  required
                  value={newAssign.studentId}
                  onChange={e => setNewAssign({ ...newAssign, studentId: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded-lg focus:outline-none"
                >
                  <option value="">-- Pilih Santri --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.nis})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">Kamar Tujuan</label>
                <select
                  required
                  value={newAssign.kamarId}
                  onChange={e => setNewAssign({ ...newAssign, kamarId: e.target.value, bedId: '' })}
                  className="w-full px-3 py-1.5 border rounded-lg focus:outline-none"
                >
                  <option value="">-- Pilih Kamar --</option>
                  {kamars.map(k => (
                    <option key={k.id} value={k.id}>{k.name} ({k.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">Tempat Tidur (Bed)</label>
                <select
                  required
                  value={newAssign.bedId}
                  onChange={e => setNewAssign({ ...newAssign, bedId: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded-lg focus:outline-none"
                >
                  <option value="">-- Pilih Bed --</option>
                  {beds
                    .filter(b => b.kamarId === newAssign.kamarId && b.status === 'TERSEDIA')
                    .map(b => (
                      <option key={b.id} value={b.id}>{b.bedNo}</option>
                    ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignForm(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-teal-600 text-white hover:bg-teal-700 rounded-lg font-bold"
                >
                  Simpan Penempatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MUTASI KAMAR */}
      {showMutasiForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-xl p-5 border border-slate-200 shadow-xl space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">Mutasi Kamar / Pindah Bed</h4>
            <form onSubmit={handleMutasiSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Santri yang Dipindahkan</label>
                <select
                  required
                  value={mutasi.studentId}
                  onChange={e => setMutasi({ ...mutasi, studentId: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded-lg focus:outline-none animate-fade-in"
                >
                  <option value="">-- Pilih Santri --</option>
                  {penempatans.map(pn => (
                    <option key={pn.id} value={pn.studentId}>
                      {getStudentName(pn.studentId)} (Dari Kamar: {getKamarName(pn.kamarId)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">Kamar Target Mutasi</label>
                <select
                  required
                  value={mutasi.targetKamarId}
                  onChange={e => setMutasi({ ...mutasi, targetKamarId: e.target.value, targetBedId: '' })}
                  className="w-full px-3 py-1.5 border rounded-lg focus:outline-none"
                >
                  <option value="">-- Pilih Kamar Tujuan --</option>
                  {kamars.map(k => (
                    <option key={k.id} value={k.id}>{k.name} ({k.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">Pilih Bed Target</label>
                <select
                  required
                  value={mutasi.targetBedId}
                  onChange={e => setMutasi({ ...mutasi, targetBedId: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded-lg focus:outline-none"
                >
                  <option value="">-- Pilih Bed Kosong --</option>
                  {beds
                    .filter(b => b.kamarId === mutasi.targetKamarId && b.status === 'TERSEDIA')
                    .map(b => (
                      <option key={b.id} value={b.id}>{b.bedNo}</option>
                    ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMutasiForm(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-amber-600 text-white hover:bg-amber-700 rounded-lg font-bold"
                >
                  Konfirmasi Mutasi Kamar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
