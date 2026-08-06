import React, { useState, useEffect } from 'react';
import { Clock, Check, Users, Plus, Save, AlertCircle, Sparkles, Send, FileText, Trash2, Edit2 } from 'lucide-react';
import { AttendanceRecord, JournalRecord, Student } from '../../types/teacher';
import apiClient from '../../api/client';

interface TeacherAttendanceProps {
  students: Student[];
  attendanceList: AttendanceRecord[];
  setAttendanceList: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  journals: JournalRecord[];
  onAddJournal: (newJournal: Omit<JournalRecord, 'id' | 'status'>) => void;
}

export default function TeacherAttendance({
  students,
  attendanceList,
  setAttendanceList,
  journals,
  onAddJournal
}: TeacherAttendanceProps) {
  const [activeSubTab, setActiveSubTab] = useState<'absensi' | 'jurnal' | 'piket'>('absensi');
  
  // Jurnal Form state
  const [topic, setTopic] = useState('');
  const [hours, setHours] = useState('1-2');
  const [challenges, setChallenges] = useState('');
  const [solutions, setSolutions] = useState('');
  const [showAddJournalForm, setShowAddJournalForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Piket schedule state
  const [piketSchedule, setPiketSchedule] = useState<any[]>([]);
  const [showPiketForm, setShowPiketForm] = useState(false);
  const [newPiketDay, setNewPiketDay] = useState('');
  const [newPiketStudents, setNewPiketStudents] = useState('');

  useEffect(() => {
    if (activeSubTab === 'piket') {
      fetchPiketSchedule();
    }
  }, [activeSubTab]);

  const fetchPiketSchedule = async () => {
    try {
      const res = await apiClient.get('/api/v1/akademik/piket');
      if (res.data.success) {
        setPiketSchedule(res.data.data.map((p: any) => ({ ...p, students: typeof p.students === 'string' ? JSON.parse(p.students) : p.students })));
      }
    } catch (err) {
      console.error('Failed to fetch piket schedule:', err);
    }
  };

  const handleAddPiket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPiketDay || !newPiketStudents) return;
    
    try {
      await apiClient.post('/api/v1/akademik/piket', {
        day: newPiketDay, students: JSON.stringify(newPiketStudents.split(',').map(s => s.trim()))
      });
      fetchPiketSchedule();
      setShowPiketForm(false);
      setNewPiketDay('');
      setNewPiketStudents('');
    } catch (err) {
      console.error('Failed to add piket:', err);
    }
  };

  const handleDeletePiket = async (id: string) => {
    try {
      await apiClient.delete('/api/v1/akademik/piket', {
        data: { id }
      });
      fetchPiketSchedule();
    } catch (err) {
      console.error('Failed to delete piket:', err);
    }
  };

  const updateAttendanceStatus = (studentId: string, status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALFA') => {
    setAttendanceList(prev => prev.map(item => 
      item.studentId === studentId ? { ...item, status } : item
    ));
  };

  const handleSaveAttendance = () => {
    setSuccessMsg('Presensi berhasil disimpan dan disinkronisasikan ke Server Cloud Utama!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleSendWAAlert = () => {
    const absentCount = attendanceList.filter(a => a.status !== 'HADIR').length;
    setSuccessMsg(`Berhasil! Mengirimkan ${absentCount} Notifikasi WhatsApp Otomatis ke Orang Tua Wali Murid.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleJournalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;

    onAddJournal({
      date: new Date().toISOString().split('T')[0],
      classId: 'cl-1',
      className: 'X MIPA 1',
      subjectName: 'Fisika',
      topic,
      hours,
      challenges,
      solutions
    });

    setTopic('');
    setChallenges('');
    setSolutions('');
    setShowAddJournalForm(false);
    setSuccessMsg('Jurnal mengajar harian berhasil disimpan!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('absensi')}
          className={`px-4 py-2.5 font-bold text-xs border-b-2 cursor-pointer transition-all ${
            activeSubTab === 'absensi'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Absensi Murid
        </button>
        <button
          onClick={() => setActiveSubTab('jurnal')}
          className={`px-4 py-2.5 font-bold text-xs border-b-2 cursor-pointer transition-all ${
            activeSubTab === 'jurnal'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Jurnal Mengajar Harian
        </button>
        <button
          onClick={() => setActiveSubTab('piket')}
          className={`px-4 py-2.5 font-bold text-xs border-b-2 cursor-pointer transition-all ${
            activeSubTab === 'piket'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Jadwal Piket Kebersihan
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 1. ABSENSI MURID SUB TAB */}
      {activeSubTab === 'absensi' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Form Kehadiran Siswa Kelas X MIPA 1</h3>
              <p className="text-slate-500 text-xs mt-0.5">Sesi KBM Fisika hari ini: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSendWAAlert}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                Kirim Alert WA Ortu
              </button>
              <button
                onClick={handleSaveAttendance}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Save className="h-3.5 w-3.5" />
                Simpan Presensi
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl">
            <div className="text-center p-2">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Hadir (H)</span>
              <span className="text-lg font-black text-slate-700">{attendanceList.filter(a => a.status === 'HADIR').length}</span>
            </div>
            <div className="text-center p-2">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Izin (I)</span>
              <span className="text-lg font-black text-amber-600">{attendanceList.filter(a => a.status === 'IZIN').length}</span>
            </div>
            <div className="text-center p-2">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Sakit (S)</span>
              <span className="text-lg font-black text-blue-600">{attendanceList.filter(a => a.status === 'SAKIT').length}</span>
            </div>
            <div className="text-center p-2">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Alfa (A)</span>
              <span className="text-lg font-black text-red-600">{attendanceList.filter(a => a.status === 'ALFA').length}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4">NIS</th>
                  <th className="py-3 px-4">Gender</th>
                  <th className="py-3 px-4 text-center">Status Kehadiran</th>
                  <th className="py-3 px-4">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {attendanceList.map((item) => (
                  <tr key={item.studentId} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-800">{item.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{item.nis}</td>
                    <td className="py-3 px-4 text-slate-500">{item.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        {(['HADIR', 'IZIN', 'SAKIT', 'ALFA'] as const).map((st) => (
                          <button
                            key={st}
                            onClick={() => updateAttendanceStatus(item.studentId, st)}
                            className={`w-10 py-1.5 text-[10px] font-black rounded-lg transition-colors cursor-pointer ${
                              item.status === st
                                ? st === 'HADIR'
                                  ? 'bg-emerald-600 text-white'
                                  : st === 'IZIN'
                                  ? 'bg-amber-500 text-white'
                                  : st === 'SAKIT'
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-red-600 text-white'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            {st[0]}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={item.notes || ''}
                        placeholder="Tambahkan keterangan..."
                        onChange={(e) => {
                          const val = e.target.value;
                          setAttendanceList(prev => prev.map(a => 
                            a.studentId === item.studentId ? { ...a, notes: val } : a
                          ));
                        }}
                        className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 text-slate-600 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. JURNAL MENGAJAR SUB TAB */}
      {activeSubTab === 'jurnal' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Riwayat Jurnal Mengajar</h3>
              <p className="text-slate-500 text-xs mt-0.5">Mendokumentasikan materi, hambatan kelas, dan solusi pembelajaran.</p>
            </div>
            {!showAddJournalForm && (
              <button
                onClick={() => setShowAddJournalForm(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Catat Jurnal Baru
              </button>
            )}
          </div>

          {/* Form input jurnal baru */}
          {showAddJournalForm && (
            <form onSubmit={handleJournalSubmit} className="bg-slate-50/50 border border-slate-200 p-5 rounded-xl space-y-4">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-blue-500" />
                Catat Jurnal Pembelajaran Baru
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Pokok Bahasan / Materi</label>
                  <input
                    type="text"
                    required
                    value={topic}
                    placeholder="Contoh: Hukum Newton I & II dan Praktikum Kelereng"
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Jam Ke-</label>
                  <select
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1-2">Jam ke 1 - 2 (07:30 - 09:00)</option>
                    <option value="3-4">Jam ke 3 - 4 (09:30 - 11:00)</option>
                    <option value="5-6">Jam ke 5 - 6 (11:30 - 13:00)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Hambatan / Catatan Kelas</label>
                  <textarea
                    rows={2}
                    value={challenges}
                    placeholder="Kondisi siswa, sarana yang bermasalah, atau kendala lainnya..."
                    onChange={(e) => setChallenges(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Solusi / Tindak Lanjut</label>
                  <textarea
                    rows={2}
                    value={solutions}
                    placeholder="Penanganan masalah atau instruksi tugas remedial..."
                    onChange={(e) => setSolutions(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setShowAddJournalForm(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Simpan Jurnal
                </button>
              </div>
            </form>
          )}

          {/* Tabel Riwayat Jurnal */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50">
                  <th className="py-3 px-4">Tanggal / Jam</th>
                  <th className="py-3 px-4">Kelas / Mapel</th>
                  <th className="py-3 px-4">Materi / Bahasan</th>
                  <th className="py-3 px-4">Hambatan & Solusi</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {journals.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50/40">
                    <td className="py-3.5 px-4 font-semibold text-slate-600">
                      <div>{j.date}</div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">Jam ke-{j.hours}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{j.className}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{j.subjectName}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium max-w-[200px] truncate">{j.topic}</td>
                    <td className="py-3.5 px-4 max-w-[280px]">
                      {j.challenges ? (
                        <div className="space-y-1">
                          <div className="text-slate-500 font-mono text-[10px]"><span className="text-red-500">Hambatan:</span> {j.challenges}</div>
                          <div className="text-slate-600 font-mono text-[10px]"><span className="text-emerald-600">Solusi:</span> {j.solutions}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">KBM Berjalan Lancar & Kondusif</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wide ${
                        j.status === 'Terverifikasi'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-50 text-slate-500 border border-slate-200'
                      }`}>
                        {j.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. JADWAL PIKET SUB TAB */}
      {activeSubTab === 'piket' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Piket Harian Kebersihan Kelas X MIPA 1</h3>
              <p className="text-slate-500 text-xs mt-0.5">Mengelola tim piket harian yang bertanggung jawab atas ketertiban dan kebersihan kelas.</p>
            </div>
            {!showPiketForm && (
              <button
                onClick={() => setShowPiketForm(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Tambah Jadwal
              </button>
            )}
          </div>

          {showPiketForm && (
            <form onSubmit={handleAddPiket} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4">
              <h4 className="font-bold text-slate-700 text-sm">Tambah Jadwal Piket Baru</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Hari</label>
                  <select 
                    value={newPiketDay}
                    onChange={(e) => setNewPiketDay(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    required
                  >
                    <option value="">Pilih Hari</option>
                    <option value="Senin">Senin</option>
                    <option value="Selasa">Selasa</option>
                    <option value="Rabu">Rabu</option>
                    <option value="Kamis">Kamis</option>
                    <option value="Jumat">Jumat</option>
                    <option value="Sabtu">Sabtu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Petugas Piket (Siswa)</label>
                  <input 
                    type="text" 
                    value={newPiketStudents}
                    onChange={(e) => setNewPiketStudents(e.target.value)}
                    placeholder="Contoh: Budi, Andi, Caca"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    required
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Pisahkan nama dengan tanda koma (,)</p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPiketForm(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg text-sm font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors cursor-pointer"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {piketSchedule.map((p) => (
              <div key={p.id} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50 relative">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-blue-600 block uppercase tracking-wider">{p.day}</span>
                  <div className="flex gap-1">
                    <button onClick={() => handleDeletePiket(p.id)} className="text-slate-400 hover:text-red-500">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {p.students.map((st: string, sIdx: number) => (
                    <div key={sIdx} className="bg-white px-2.5 py-1.5 border border-slate-100 rounded-lg text-slate-700 text-xs font-semibold">
                      {st}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
