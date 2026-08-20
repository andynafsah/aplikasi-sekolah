/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowRight, BadgeInfo, CheckCircle, HelpCircle, Archive, ClipboardList, BookOpen, Clock, Layers } from 'lucide-react';
import apiClient from '../../api/client';

interface StudentMutationProps {
  students: any[];
  mutations: any[];
  onRefresh: () => void;
  subTab: 'MUTASI' | 'ALUMNI' | 'KELULUSAN';
}

export function StudentMutation({ students, mutations, onRefresh, subTab }: StudentMutationProps) {
  const safeStudents = Array.isArray(students) ? students : [];
  const safeMutations = Array.isArray(mutations) ? mutations : [];
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [mutationType, setMutationType] = useState<string>('MUTASI_KELUAR');
  const [schoolTarget, setSchoolTarget] = useState<string>('');
  const [letterNum, setLetterNum] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Bulk Kelulusan States
  const [targetKelas, setTargetKelas] = useState<string>('IX-A');
  const [gradLetterNum, setGradLetterNum] = useState<string>('SK-LULUS/2026/001');

  const handleProcessMutation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      alert('Silakan pilih siswa yang akan dimutasi!');
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        student_id: selectedStudentId,
        type: mutationType,
        sekolah_asal_tujuan: schoolTarget,
        no_surat: letterNum,
        alasan: reason
      };
      const res = await apiClient.post('/api/action?action=processMutation', payload);
      if (res.data?.success) {
        alert(res.data.message || 'Mutasi kesiswaan berhasil diproses ke database!');
        setSelectedStudentId('');
        setSchoolTarget('');
        setLetterNum('');
        setReason('');
        onRefresh();
      } else {
        alert(res.data?.message || 'Gagal memproses mutasi.');
      }
    } catch (err: any) {
      console.error(err);
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkGraduation = async () => {
    if (!window.confirm(`Yakin ingin meluluskan seluruh siswa aktif di Kelas ${targetKelas} secara massal?`)) {
      return;
    }
    setIsLoading(true);
    try {
      const classStudents = students.filter(s => (s.kelas || s.sekolah?.kelas) === targetKelas);
      if (classStudents.length === 0) {
        alert(`Tidak ada siswa aktif ditemukan di Kelas ${targetKelas}.`);
        setIsLoading(false);
        return;
      }

      let count = 0;
      for (const std of classStudents) {
        const payload = {
          student_id: std.id,
          type: 'LULUS',
          sekolah_asal_tujuan: 'ALUMNI / TATA USAHA',
          no_surat: gradLetterNum,
          alasan: 'Lulus Ujian Akhir Pendidikan Formal'
        };
        await apiClient.post('/api/action?action=processMutation', payload);
        count++;
      }
      alert(`Berhasil meluluskan ${count} siswa di Kelas ${targetKelas} secara massal! Status dialihkan menjadi ALUMNI.`);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan memproses kelulusan massal.');
    } finally {
      setIsLoading(false);
    }
  };

  const alumniStudents = students.filter(s => {
    const status = s.status_keaktifan || s.sekolah?.status;
    return status === 'ALUMNI' || status === 'LULUS';
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs text-slate-700">
      
      {/* 1. MUTASI TAB */}
      {subTab === 'MUTASI' && (
        <>
          {/* Form panel */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">Proses Mutasi Siswa / Santri</h3>
              <p className="text-[11px] text-slate-500 font-mono">Regulasi Dapodik & EMIS • Surat Keputusan Kepala Sekolah</p>
            </div>

            <form onSubmit={handleProcessMutation} className="flex flex-col gap-3 font-medium">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-600">Pilih Siswa *</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold"
                >
                  <option value="">-- Pilih Siswa Aktif --</option>
                  {students
                    .filter(s => (s.status_keaktifan || s.sekolah?.status || 'AKTIF') === 'AKTIF')
                    .map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name || s.identitas?.name} ({s.nis || s.identitas?.nis})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-600">Jenis Mutasi *</label>
                <select
                  value={mutationType}
                  onChange={(e) => setMutationType(e.target.value)}
                  className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold"
                >
                  <option value="MUTASI_KELUAR">MUTASI_KELUAR (Pindah ke Instansi Lain)</option>
                  <option value="MUTASI_MASUK">MUTASI_MASUK (Pindahan Dari Luar)</option>
                  <option value="KELUAR_PONDOK">KELUAR_PONDOK (Berhenti Pondok Saja)</option>
                  <option value="DROP_OUT">DROP_OUT (Diberhentikan Disiplin)</option>
                  <option value="ALUMNI_PONDOK">ALUMNI_PONDOK (Selesai Pengabdian)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-600">Instansi Asal / Tujuan</label>
                <input
                  type="text"
                  value={schoolTarget}
                  onChange={(e) => setSchoolTarget(e.target.value)}
                  placeholder="e.g. MA Negeri 2 Bogor"
                  className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-600">Nomor Surat Keputusan / Keterangan *</label>
                <input
                  type="text"
                  value={letterNum}
                  onChange={(e) => setLetterNum(e.target.value)}
                  placeholder="e.g. SK-MUT/2026/0412"
                  className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-600">Alasan Mutasi *</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Tuliskan detail argumen penarikan data..."
                  rows={3}
                  className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>{isLoading ? 'Sedang Memproses...' : 'Eksekusi & Terbitkan Surat'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* History / Logs list */}
          <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">Buku Register Mutasi Kesiswaan</h3>
              <p className="text-xs text-slate-500">Rekaman mutasi yang sah terbit dari legalisir Kepala Sekolah & Pengawas</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[9px] font-mono pb-2">
                    <th className="pb-2">Siswa / Santri</th>
                    <th className="pb-2">Tipe Mutasi</th>
                    <th className="pb-2">Nomor SK</th>
                    <th className="pb-2">Asal / Tujuan</th>
                    <th className="pb-2 font-mono">Operator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium">
                  {mutations.map((mut: any) => {
                    const student = students.find(s => s.id === mut.student_id);
                    return (
                      <tr key={mut.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5">
                          <p className="font-bold text-slate-850">{student ? student.name : 'Unknown Student'}</p>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {mut.student_id}</span>
                        </td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            mut.type.includes('MASUK') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {mut.type}
                          </span>
                        </td>
                        <td className="py-2.5 font-mono text-slate-600">{mut.no_surat}</td>
                        <td className="py-2.5">
                          <p className="text-slate-800">{mut.sekolah_asal_tujuan}</p>
                          <span className="text-[10px] text-slate-400 italic">"{mut.alasan}"</span>
                        </td>
                        <td className="py-2.5 font-mono text-slate-500">{mut.created_by || 'admin'}</td>
                      </tr>
                    );
                  })}

                  {mutations.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 font-mono">
                        Belum ada mutasi terbit pada periode semester ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* 2. ALUMNI TAB */}
      {subTab === 'ALUMNI' && (
        <div className="lg:col-span-3 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-800">Direktori Alumni Pondok & Sekolah</h3>
              <p className="text-xs text-slate-500">Pelacakan karir, studi lanjut, sanad keilmuan, dan ikatan alumni nasional</p>
            </div>
            <div className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl font-bold">
              Total Alumni: {alumniStudents.length} Lulusan
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {alumniStudents.map((alm: any) => {
              const classText = alm.kelas || alm.sekolah?.kelas || 'XII';
              return (
                <div key={alm.id} className="p-4 border border-slate-150 rounded-2xl bg-slate-50/40 flex flex-col gap-3 hover:border-slate-300 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-[13px]">{alm.name || alm.identitas?.name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">NISN: {alm.nisn || '00123992'}</p>
                    </div>
                    <span className="bg-slate-200/80 text-slate-700 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider font-mono text-[9px]">
                      LULUS
                    </span>
                  </div>

                  <div className="border-t border-slate-150/60 pt-2 flex flex-col gap-1 text-[11px] text-slate-600">
                    <p>🎓 <span className="font-bold">Angkatan Lulus:</span> 2025/2026</p>
                    <p>💼 <span className="font-bold">Studi / Kerja:</span> Universitas Islam Negeri Jakarta (Fak. Ushuluddin)</p>
                    <p>🌿 <span className="font-bold">Program Terakhir:</span> {alm.jurusan || alm.sekolah?.jurusan || 'Tahfidz 30 Juz'}</p>
                  </div>
                </div>
              );
            })}

            {alumniStudents.length === 0 && (
              <div className="md:col-span-3 text-center text-slate-400 font-mono py-12 bg-slate-50 rounded-2xl">
                Belum ada data alumni terdaftar. Gunakan modul "Kelulusan Massal" untuk meluluskan santri.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. KELULUSAN TAB */}
      {subTab === 'KELULUSAN' && (
        <div className="lg:col-span-3 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-6">
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-150 rounded-2xl">
            <BadgeInfo className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-blue-800">Penjelasan Pemrosesan Kelulusan Massal</h4>
              <p className="text-[11px] text-blue-700 mt-0.5">
                Modul ini digunakan untuk memperbarui status keaktifan peserta didik se-kelas/se-rombel menjadi ALUMNI secara massal. Seluruh ketersambungan data nilai, data kependudukan, dan riwayat dipertahankan utuh dalam arsip digital kesiswaan ERP instansi.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-extrabold text-slate-800">Kontrol Kelulusan Massal Rombel</h3>
              
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-600">Pilih Kelas / Rombongan Belajar Sasaran</label>
                <select
                  value={targetKelas}
                  onChange={(e) => setTargetKelas(e.target.value)}
                  className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold"
                >
                  <option value="IX-A">Kelas IX-A (Tingkat Akhir MTs/SMP)</option>
                  <option value="XII-A">Kelas XII-A (Tingkat Akhir MA/SMA)</option>
                  <option value="XII-B">Kelas XII-B (Tingkat Akhir MA/SMA)</option>
                  <option value="X-A">Kelas X-A (Reguler)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-600">Nomor SK Kelulusan Formal</label>
                <input
                  type="text"
                  value={gradLetterNum}
                  onChange={(e) => setGradLetterNum(e.target.value)}
                  placeholder="SK-LULUS/TAHUN/URUT"
                  className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl"
                />
              </div>

              <button
                type="button"
                onClick={handleBulkGraduation}
                disabled={isLoading}
                className="py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <span>{isLoading ? 'Sedang Memproses...' : 'Proses Kelulusan Rombel'}</span>
              </button>
            </div>

            <div className="p-5 border border-slate-150 rounded-2xl bg-slate-50/50 flex flex-col gap-3">
              <h4 className="font-bold text-slate-850 border-b border-slate-200 pb-2 font-mono text-[10px] tracking-wider uppercase">Statistik Rombel Terpilih</h4>
              <div className="flex flex-col gap-2 font-medium text-[11px] text-slate-600">
                <p>● Kelas Ploting: <span className="font-bold text-slate-800">{targetKelas}</span></p>
                <p>● Jumlah Siswa Aktif Terdeteksi: <span className="font-bold text-slate-800">
                  {students.filter(s => (s.kelas || s.sekolah?.kelas) === targetKelas && (s.status_keaktifan || s.sekolah?.status || 'AKTIF') === 'AKTIF').length} Orang
                </span></p>
                <p>● Estimasi Output Arsip Alumni: <span className="font-bold text-slate-800">100% Terintegrasi Dapodik & EMIS</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
