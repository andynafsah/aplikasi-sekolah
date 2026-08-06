/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Calendar, 
  Check, 
  Compass, 
  Sparkles,
  BarChart3
} from 'lucide-react';
import { Tahfidz, TargetHafalan, IbadahLog, Student } from '../../types/boarding';

interface TahfidzSectionProps {
  tahfidzLogs: Tahfidz[];
  targetHafalans: TargetHafalan[];
  ibadahLogs: IbadahLog[];
  students: Student[];
  onAddTahfidzLog: (t: Omit<Tahfidz, 'id'>) => void;
  onUpdateIbadah: (studentId: string, updatedLog: Partial<IbadahLog>) => void;
}

export default function TahfidzSection({
  tahfidzLogs,
  targetHafalans,
  ibadahLogs,
  students,
  onAddTahfidzLog,
  onUpdateIbadah
}: TahfidzSectionProps) {
  const [activeSubTab, setActiveSubTab] = useState<'halaqah' | 'targets' | 'ibadah'>('halaqah');
  const [showLogForm, setShowLogForm] = useState(false);

  // Form states
  const [newLog, setNewLog] = useState({
    studentId: '',
    type: 'SETORAN' as const,
    juz: 30,
    surah: '',
    verseRange: '',
    nilai: 'A' as const,
    pembimbing: 'Ustadz Ahmad Fauzi',
    date: new Date().toISOString().split('T')[0]
  });

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLog.studentId || !newLog.surah || !newLog.verseRange) return;
    onAddTahfidzLog(newLog);
    setShowLogForm(false);
  };

  const getStudentName = (id: string) => students.find(s => s.id === id)?.name || 'Santri';
  const getStudentNIS = (id: string) => students.find(s => s.id === id)?.nis || '-';

  return (
    <div className="space-y-4 text-xs">
      {/* Sub menu */}
      <div className="flex border-b border-slate-200 gap-4 pb-2">
        {(['halaqah', 'targets', 'ibadah'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`pb-2 px-1 text-xs font-bold capitalize transition-all cursor-pointer ${
              activeSubTab === tab ? 'text-teal-600 border-b-2 border-teal-500 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab === 'halaqah' ? 'Halaqah Setoran & Murajaah' : tab === 'targets' ? 'Target Hafalan Santri' : 'Amalan Ibadah Harian'}
          </button>
        ))}
      </div>

      {/* SUB-TAB 1: HALAQAH SETORAN */}
      {activeSubTab === 'halaqah' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-teal-600" />
              <span>Log Halaqah Qur\'an (Setoran &amp; Murajaah)</span>
            </h4>
            <button
              onClick={() => setShowLogForm(true)}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Catat Setoran Hafalan
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                    <th className="p-3">Santri</th>
                    <th className="p-3">Tanggal</th>
                    <th className="p-3">Metode</th>
                    <th className="p-3">Juz / Surah</th>
                    <th className="p-3">Ayat</th>
                    <th className="p-3 text-center">Nilai</th>
                    <th className="p-3">Pembimbing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tahfidzLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <p className="font-bold text-slate-800">{getStudentName(log.studentId)}</p>
                        <p className="text-[10px] text-slate-400">NIS: {getStudentNIS(log.studentId)}</p>
                      </td>
                      <td className="p-3 text-slate-500 font-mono">{log.date}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          log.type === 'SETORAN' ? 'bg-teal-50 text-teal-700 border border-teal-100' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                        }`}>
                          {log.type}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-700">Juz {log.juz} - Surah {log.surah}</td>
                      <td className="p-3 font-mono text-slate-500">Ayat {log.verseRange}</td>
                      <td className="p-3 text-center">
                        <span className={`h-6 w-6 inline-flex items-center justify-center rounded-full font-bold text-xs ${
                          log.nilai === 'A' ? 'bg-emerald-100 text-emerald-800 font-extrabold' :
                          log.nilai === 'B' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {log.nilai}
                        </span>
                      </td>
                      <td className="p-3 text-slate-650 italic font-semibold">"{log.pembimbing}"</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: TARGETS */}
      {activeSubTab === 'targets' && (
        <div className="space-y-4">
          <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Target Hafalan &amp; Pencapaian Individual</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {targetHafalans.map(tgt => {
              const pct = Math.min(100, Math.round((tgt.achievedJuz / tgt.targetJuz) * 100));
              return (
                <div key={tgt.id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                  <h5 className="font-bold text-slate-800">{getStudentName(tgt.studentId)}</h5>
                  <p className="text-slate-400 text-[10px] mt-0.5">Deadline: {tgt.deadline}</p>

                  <div className="mt-4 space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-650">
                      <span>Pencapaian Juz:</span>
                      <span>{tgt.achievedJuz} / {tgt.targetJuz} Juz ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-teal-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: IBADAH LOGS */}
      {activeSubTab === 'ibadah' && (
        <div className="space-y-4">
          <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
            <Compass className="h-4 w-4 text-emerald-600" />
            <span>Lembar Kontrol Amalan Ibadah Yaumiyah</span>
          </h4>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                    <th className="p-3">Santri</th>
                    <th className="p-3">Shalat Berjamaah</th>
                    <th className="p-3 text-center">Tahajud</th>
                    <th className="p-3 text-center">Dhuha</th>
                    <th className="p-3">Puasa Sunnah</th>
                    <th className="p-3 text-center">Dzikir / Ma\'tsurat</th>
                    <th className="p-3 text-center">Kajian Kitab</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ibadahLogs.map(ib => (
                    <tr key={ib.id} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <p className="font-bold text-slate-800">{getStudentName(ib.studentId)}</p>
                        <p className="text-[9px] text-slate-400">Log: {ib.date}</p>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1.5 flex-wrap">
                          {Object.entries(ib.shalatJamaah).map(([name, val]) => (
                            <button
                              key={name}
                              onClick={() => {
                                const nextShalat = { ...ib.shalatJamaah, [name]: !val };
                                onUpdateIbadah(ib.studentId, { shalatJamaah: nextShalat });
                              }}
                              className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase cursor-pointer ${
                                val ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-400'
                              }`}
                            >
                              {name.substring(0, 3)}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={!!ib.tahajud}
                          onChange={() => onUpdateIbadah(ib.studentId, { tahajud: !ib.tahajud })}
                          className="h-4 w-4 text-teal-600 rounded cursor-pointer"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={!!ib.dhuha}
                          onChange={() => onUpdateIbadah(ib.studentId, { dhuha: !ib.dhuha })}
                          className="h-4 w-4 text-teal-600 rounded cursor-pointer"
                        />
                      </td>
                      <td className="p-3">
                        <select
                          value={ib.puasa || 'NONE'}
                          onChange={e => onUpdateIbadah(ib.studentId, { puasa: e.target.value as any })}
                          className="px-2 py-1 border rounded bg-white"
                        >
                          <option value="NONE">-</option>
                          <option value="SENIN_KAMIS">Senin-Kamis</option>
                          <option value="DAUD">Daud</option>
                          <option value="AYYAMUL_BIDH">Ayyamul Bidh</option>
                        </select>
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={!!ib.dzikir}
                          onChange={() => onUpdateIbadah(ib.studentId, { dzikir: !ib.dzikir })}
                          className="h-4 w-4 text-teal-600 rounded cursor-pointer"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={!!ib.kajian}
                          onChange={() => onUpdateIbadah(ib.studentId, { kajian: !ib.kajian })}
                          className="h-4 w-4 text-teal-600 rounded cursor-pointer"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD LOG TAHFIDZ */}
      {showLogForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-xl p-5 border border-slate-200 shadow-xl space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">Catat Setoran / Murajaah Qur'an</h4>
            <form onSubmit={handleLogSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Pilih Santri</label>
                <select
                  required
                  value={newLog.studentId}
                  onChange={e => setNewLog({ ...newLog, studentId: e.target.value })}
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
                  <label className="block text-slate-600 font-bold mb-1">Metode Setoran</label>
                  <select
                    value={newLog.type}
                    onChange={e => setNewLog({ ...newLog, type: e.target.value as any })}
                    className="w-full px-3 py-1.5 border rounded-lg focus:outline-none"
                  >
                    <option value="SETORAN">Setoran Baru</option>
                    <option value="MURAJAAH">Murajaah</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Juz</label>
                  <input
                    type="number"
                    required
                    value={newLog.juz}
                    onChange={e => setNewLog({ ...newLog, juz: parseInt(e.target.value) || 30 })}
                    className="w-full px-3 py-1.5 border rounded-lg focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Nama Surah</label>
                  <input
                    type="text"
                    required
                    value={newLog.surah}
                    onChange={e => setNewLog({ ...newLog, surah: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-lg focus:outline-none"
                    placeholder="E.g. Al-Baqarah"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Rentang Ayat</label>
                  <input
                    type="text"
                    required
                    value={newLog.verseRange}
                    onChange={e => setNewLog({ ...newLog, verseRange: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-lg focus:outline-none"
                    placeholder="E.g. 1-20"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Nilai Kelayakan</label>
                  <select
                    value={newLog.nilai}
                    onChange={e => setNewLog({ ...newLog, nilai: e.target.value as any })}
                    className="w-full px-3 py-1.5 border rounded-lg focus:outline-none"
                  >
                    <option value="A">A (Sangat Lancar)</option>
                    <option value="B">B (Lancar)</option>
                    <option value="C">C (Cukup Lancar)</option>
                    <option value="D">D (Mengulang)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Pembimbing / Ust</label>
                  <input
                    type="text"
                    required
                    value={newLog.pembimbing}
                    onChange={e => setNewLog({ ...newLog, pembimbing: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-lg focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogForm(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-teal-600 text-white hover:bg-teal-700 rounded-lg font-bold"
                >
                  Simpan Halaqah Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
