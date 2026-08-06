/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Shirt, 
  Coffee, 
  Briefcase, 
  Lock, 
  Trash2, 
  Plus, 
  Utensils, 
  Check, 
  AlertTriangle,
  Clock
} from 'lucide-react';
import { Laundry, BarangTitipan, Loker, Konsumsi, Piket, Student } from '../../types/boarding';

interface ServicesSectionProps {
  laundries: Laundry[];
  titipans: BarangTitipan[];
  lokers: Loker[];
  konsumsis: Konsumsi[];
  pikets: Piket[];
  students: Student[];
  onAddLaundry: (l: Omit<Laundry, 'id'>) => void;
  onAdvanceLaundry: (id: string) => void;
  onAddTitipan: (t: Omit<BarangTitipan, 'id'>) => void;
  onReturnTitipan: (id: string) => void;
  onAddKonsumsi: (k: Omit<Konsumsi, 'id'>) => void;
}

export default function ServicesSection({
  laundries,
  titipans,
  lokers,
  konsumsis,
  pikets,
  students,
  onAddLaundry,
  onAdvanceLaundry,
  onAddTitipan,
  onReturnTitipan,
  onAddKonsumsi
}: ServicesSectionProps) {
  const [activeSubTab, setActiveSubTab] = useState<'laundry' | 'konsumsi' | 'titipan' | 'loker' | 'piket'>('laundry');
  const [showLaundryForm, setShowLaundryForm] = useState(false);
  const [showTitipanForm, setShowTitipanForm] = useState(false);
  const [showMenuForm, setShowMenuForm] = useState(false);

  // Forms states
  const [newLaundry, setNewLaundry] = useState({ studentId: '', weight: 2.0, itemsCount: 6, status: 'PENERIMAAN' as const, dateReceived: new Date().toISOString().split('T')[0] });
  const [newTitipan, setNewTitipan] = useState({ studentId: '', itemName: '', category: 'ELEKTRONIK' as const, quantity: '1 Unit', notes: '', status: 'DITITIP' as const, dateReceived: new Date().toISOString().split('T')[0] });
  const [newMenu, setNewMenu] = useState({ day: 'Senin', mealType: 'PAGI' as const, menu: '', dietOption: '' });

  const getStudentName = (id: string) => students.find(s => s.id === id)?.name || 'Santri';

  const handleLaundrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLaundry.studentId) return;
    onAddLaundry(newLaundry);
    setShowLaundryForm(false);
  };

  const handleTitipanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitipan.studentId || !newTitipan.itemName) return;
    onAddTitipan(newTitipan);
    setNewTitipan({ studentId: '', itemName: '', category: 'ELEKTRONIK', quantity: '1 Unit', notes: '', status: 'DITITIP', dateReceived: new Date().toISOString().split('T')[0] });
    setShowTitipanForm(false);
  };

  const handleMenuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenu.menu) return;
    onAddKonsumsi(newMenu);
    setNewMenu({ day: 'Senin', mealType: 'PAGI', menu: '', dietOption: '' });
    setShowMenuForm(false);
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Sub tabs */}
      <div className="flex border-b border-slate-200 gap-4 pb-2">
        {(['laundry', 'konsumsi', 'titipan', 'loker', 'piket'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`pb-2 px-1 text-xs font-bold capitalize transition-all cursor-pointer ${
              activeSubTab === tab ? 'text-teal-600 border-b-2 border-teal-500 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab === 'titipan' ? 'Uang & Barang Titipan' : tab === 'konsumsi' ? 'Menu Konsumsi' : tab === 'piket' ? 'Jadwal Piket' : tab}
          </button>
        ))}
      </div>

      {/* 1: LAUNDRY */}
      {activeSubTab === 'laundry' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <Shirt className="h-4 w-4 text-teal-600" />
              <span>Sistem Monitoring Laundry Santri</span>
            </h4>
            <button
              onClick={() => setShowLaundryForm(true)}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Terima Laundry Baru
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                    <th className="p-3">Santri</th>
                    <th className="p-3">Tanggal Diterima</th>
                    <th className="p-3">Berat (Kg)</th>
                    <th className="p-3">Jumlah Item</th>
                    <th className="p-3">Status Laundry</th>
                    <th className="p-3">Aksi Kemajuan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {laundries.map(l => (
                    <tr key={l.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-800">{getStudentName(l.studentId)}</td>
                      <td className="p-3 text-slate-500 font-mono">{l.dateReceived}</td>
                      <td className="p-3 font-semibold text-slate-700">{l.weight} Kg</td>
                      <td className="p-3 font-mono text-slate-500">{l.itemsCount} Pcs</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          l.status === 'PENERIMAAN' ? 'bg-slate-100 text-slate-600' :
                          l.status === 'PROSES' ? 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse' :
                          l.status === 'SELESAI' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {l.status !== 'PENGAMBILAN' ? (
                          <button
                            onClick={() => onAdvanceLaundry(l.id)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="h-3 w-3 text-teal-600" />
                            <span>
                              {l.status === 'PENERIMAAN' ? 'Mulai Cuci' :
                               l.status === 'PROSES' ? 'Set Selesai' : 'Serahkan Santri'}
                            </span>
                          </button>
                        ) : (
                          <span className="text-slate-400 font-semibold italic">Selesai diambil</span>
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

      {/* 2: KONSUMSI */}
      {activeSubTab === 'konsumsi' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <Coffee className="h-4 w-4 text-teal-600" />
              <span>Dapur &amp; Jadwal Konsumsi Pesantren</span>
            </h4>
            <button
              onClick={() => setShowMenuForm(true)}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Tambah Menu Baru
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {konsumsis.map(ks => (
              <div key={ks.id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold rounded uppercase">
                      {ks.day}
                    </span>
                    <span className="px-2 py-0.5 bg-teal-50 text-teal-700 text-[9px] font-bold rounded border border-teal-100">
                      MAKAN {ks.mealType}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-800 leading-relaxed text-xs">"{ks.menu}"</p>
                </div>
                {ks.dietOption && (
                  <div className="mt-3 p-1.5 bg-red-50 text-red-700 text-[9px] font-bold rounded flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    <span>Catatan Diet: {ks.dietOption}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3: TITIPAN */}
      {activeSubTab === 'titipan' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-teal-600" />
              <span>Buku Penitipan Uang &amp; Barang Berharga Santri</span>
            </h4>
            <button
              onClick={() => setShowTitipanForm(true)}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Titip Barang Baru
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                    <th className="p-3">Santri</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Nama Barang</th>
                    <th className="p-3">Jumlah/Nilai</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Tanggal Titip</th>
                    <th className="p-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {titipans.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-800">{getStudentName(t.studentId)}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-slate-100 rounded font-mono text-[9px] font-bold text-slate-600">
                          {t.category}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-700">{t.itemName}</td>
                      <td className="p-3 font-bold text-slate-800">{t.quantity}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          t.status === 'DITITIP' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 font-mono">{t.dateReceived}</td>
                      <td className="p-3">
                        {t.status === 'DITITIP' ? (
                          <button
                            onClick={() => onReturnTitipan(t.id)}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold rounded cursor-pointer"
                          >
                            Kembalikan ke Santri
                          </button>
                        ) : (
                          <span className="text-slate-400 font-semibold italic">Sudah diambil ({t.dateReturned})</span>
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

      {/* 4: LOKER */}
      {activeSubTab === 'loker' && (
        <div className="space-y-4">
          <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
            <Lock className="h-4 w-4 text-teal-600" />
            <span>Manajemen Loker Asrama</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {lokers.map(lk => (
              <div key={lk.id} className="bg-white border border-slate-200 p-3 rounded-lg flex flex-col justify-between shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="font-mono font-bold text-slate-700">{lk.number}</span>
                  <span className={`h-2.5 w-2.5 rounded-full ${
                    lk.status === 'TERISI' ? 'bg-amber-500' :
                    lk.status === 'RUSAK' ? 'bg-red-500' : 'bg-emerald-500'
                  }`} />
                </div>
                <div className="mt-3 text-[10px]">
                  <p className="text-slate-400 font-semibold uppercase tracking-wider">Status</p>
                  <p className="font-bold text-slate-800">{lk.status}</p>
                  {lk.studentId && (
                    <p className="text-teal-600 font-semibold mt-1 truncate">{getStudentName(lk.studentId)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5: PIKET */}
      {activeSubTab === 'piket' && (
        <div className="space-y-4">
          <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-teal-600" />
            <span>Jadwal Roster Piket Kebersihan Santri</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pikets.map(pk => (
              <div key={pk.id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                <div className="flex justify-between border-b pb-2 mb-2">
                  <span className="font-bold text-slate-800 text-xs">Piket Hari: {pk.day}</span>
                  <span className="text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded font-semibold border">{pk.area}</span>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Petugas Piket:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {pk.studentIds.map(stId => (
                      <span key={stId} className="px-2 py-1 bg-teal-50 text-teal-700 border border-teal-100 rounded text-[10px] font-semibold">
                        {getStudentName(stId)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD LAUNDRY */}
      {showLaundryForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-xl p-5 border border-slate-200 shadow-xl space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">Terima Laundry Baru</h4>
            <form onSubmit={handleLaundrySubmit} className="space-y-3">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Pilih Santri</label>
                <select
                  required
                  value={newLaundry.studentId}
                  onChange={e => setNewLaundry({ ...newLaundry, studentId: e.target.value })}
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
                  <label className="block text-slate-600 font-bold mb-1">Berat Laundry (Kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newLaundry.weight}
                    onChange={e => setNewLaundry({ ...newLaundry, weight: parseFloat(e.target.value) || 2.0 })}
                    className="w-full px-3 py-1.5 border rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Estimasi Item (Pcs)</label>
                  <input
                    type="number"
                    required
                    value={newLaundry.itemsCount}
                    onChange={e => setNewLaundry({ ...newLaundry, itemsCount: parseInt(e.target.value) || 6 })}
                    className="w-full px-3 py-1.5 border rounded-lg focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLaundryForm(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-teal-600 text-white hover:bg-teal-700 rounded-lg font-bold"
                >
                  Simpan Laundry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD TITIPAN */}
      {showTitipanForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-xl p-5 border border-slate-200 shadow-xl space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">Titipkan Barang Berharga / Uang</h4>
            <form onSubmit={handleTitipanSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Pilih Santri</label>
                <select
                  required
                  value={newTitipan.studentId}
                  onChange={e => setNewTitipan({ ...newTitipan, studentId: e.target.value })}
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
                  <label className="block text-slate-600 font-bold mb-1">Kategori Barang</label>
                  <select
                    value={newTitipan.category}
                    onChange={e => setNewTitipan({ ...newTitipan, category: e.target.value as any })}
                    className="w-full px-3 py-1.5 border rounded-lg focus:outline-none"
                  >
                    <option value="ELEKTRONIK">Elektronik (Laptop/HP)</option>
                    <option value="UANG">Uang Tunai</option>
                    <option value="DOKUMEN">Dokumen Asli (Ijazah/Akte)</option>
                    <option value="BERHARGA">Barang Berharga Lain</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Jumlah / Nilai</label>
                  <input
                    type="text"
                    required
                    value={newTitipan.quantity}
                    onChange={e => setNewTitipan({ ...newTitipan, quantity: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-lg focus:outline-none"
                    placeholder="E.g. Rp 500.000 / 1 Pcs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">Nama Barang / Deskripsi</label>
                <input
                  type="text"
                  required
                  value={newTitipan.itemName}
                  onChange={e => setNewTitipan({ ...newTitipan, itemName: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded-lg focus:outline-none"
                  placeholder="Laptop Asus / Uang bekal bulanan"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  value={newTitipan.notes}
                  onChange={e => setNewTitipan({ ...newTitipan, notes: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded-lg focus:outline-none"
                  placeholder="E.g. Disimpan di brankas asrama"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTitipanForm(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-teal-600 text-white hover:bg-teal-700 rounded-lg font-bold"
                >
                  Simpan Titipan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD KONSUMSI */}
      {showMenuForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-xl p-5 border border-slate-200 shadow-xl space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">Tambah Menu Makanan Baru</h4>
            <form onSubmit={handleMenuSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Hari</label>
                  <select
                    value={newMenu.day}
                    onChange={e => setNewMenu({ ...newMenu, day: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-lg focus:outline-none"
                  >
                    {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Waktu</label>
                  <select
                    value={newMenu.mealType}
                    onChange={e => setNewMenu({ ...newMenu, mealType: e.target.value as any })}
                    className="w-full px-3 py-1.5 border rounded-lg focus:outline-none"
                  >
                    <option value="PAGI">Makan Pagi</option>
                    <option value="SIANG">Makan Siang</option>
                    <option value="MALAM">Makan Malam</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">Deskripsi Menu Hidangan</label>
                <textarea
                  required
                  value={newMenu.menu}
                  onChange={e => setNewMenu({ ...newMenu, menu: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded-lg focus:outline-none h-16"
                  placeholder="Contoh: Nasi Putih, Rendang Sapi, Sayur Sop Kol..."
                />
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">Catatan Alergi / Diet Khusus</label>
                <input
                  type="text"
                  value={newMenu.dietOption}
                  onChange={e => setNewMenu({ ...newMenu, dietOption: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded-lg focus:outline-none"
                  placeholder="E.g. Sediakan alternatif telur bagi alergi sapi"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMenuForm(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-teal-600 text-white hover:bg-teal-700 rounded-lg font-bold"
                >
                  Simpan Hidangan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
