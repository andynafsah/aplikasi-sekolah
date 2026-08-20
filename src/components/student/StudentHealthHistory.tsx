/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Heart, Activity, User, Phone, Mail, Award, AlertCircle, Clock, CheckCircle2, ShieldAlert, Key, X, Copy, CheckCircle, ShieldCheck } from 'lucide-react';
import apiClient from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';

interface StudentHealthHistoryProps {
  students: any[];
  histories: any[];
  onSelectStudent: (id: string) => void;
  selectedStudentId: string;
  subTab: 'KESEHATAN' | 'ORTU' | 'WALI' | 'RIWAYAT';
}

export function StudentHealthHistory({ students, histories, onSelectStudent, selectedStudentId, subTab }: StudentHealthHistoryProps) {
  const { tenant } = useAuth();
  const safeStudents = Array.isArray(students) ? students : [];
  const safeHistories = Array.isArray(histories) ? histories : [];
  const selectedStudent = safeStudents.find(s => s.id === selectedStudentId) || safeStudents[0];

  const studentName = selectedStudent ? (selectedStudent.name || selectedStudent.identitas?.name) : 'Ahmad Baihaqi';
  const studentNis = selectedStudent ? (selectedStudent.nis || selectedStudent.identitas?.nis) : 'NIS20260001';

  // Wali Santri Account Modal State
  const [isWaliModalOpen, setIsWaliModalOpen] = useState(false);
  const [waliUsername, setWaliUsername] = useState('');
  const [waliEmail, setWaliEmail] = useState('');
  const [waliPassword, setWaliPassword] = useState('');
  const [waliPhone, setWaliPhone] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const handleOpenWaliModal = (defaultName?: string, defaultHp?: string, defaultEmail?: string) => {
    const cleanNis = (studentNis || '202601').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    setWaliUsername(`wali_${cleanNis}`);
    setWaliPhone(defaultHp && defaultHp !== '-' ? defaultHp : '0812-3456-7890');
    setWaliEmail(defaultEmail && defaultEmail !== '-' ? defaultEmail : `wali.${cleanNis}@sekolah.sch.id`);
    setWaliPassword('WaliSantri2026!');
    setIsCopied(false);
    setIsWaliModalOpen(true);
  };

  // REAL DATA OR MOCK BINDINGS
  const ayahNama = selectedStudent?.nama_ayah || selectedStudent?.orang_tua?.ayah?.nama || '-';
  const ayahNik = selectedStudent?.nik_ayah || selectedStudent?.orang_tua?.ayah?.nik || '-';
  const ayahKerja = selectedStudent?.pekerjaan_ayah || selectedStudent?.orang_tua?.ayah?.pekerjaan || '-';
  const ayahHp = selectedStudent?.orang_tua?.ayah?.no_hp || '0812-3456-7890';
  const ayahEmail = selectedStudent?.orang_tua?.ayah?.email || 'ayah.kandung@gmail.com';

  const ibuNama = selectedStudent?.nama_ibu || selectedStudent?.orang_tua?.ibu?.nama || '-';
  const ibuNik = selectedStudent?.nik_ibu || selectedStudent?.orang_tua?.ibu?.nik || '-';
  const ibuKerja = selectedStudent?.pekerjaan_ibu || selectedStudent?.orang_tua?.ibu?.pekerjaan || '-';
  const ibuHp = selectedStudent?.orang_tua?.ibu?.no_hp || '0812-7654-3210';
  const ibuEmail = selectedStudent?.orang_tua?.ibu?.email || 'ibu.kandung@gmail.com';

  const waliNama = selectedStudent?.nama_wali || selectedStudent?.orang_tua?.wali?.nama || '-';
  const waliNik = selectedStudent?.nik_wali || selectedStudent?.orang_tua?.wali?.nik || '-';
  const waliKerja = selectedStudent?.pekerjaan_wali || selectedStudent?.orang_tua?.wali?.pekerjaan || '-';
  const waliHp = selectedStudent?.orang_tua?.wali?.no_hp || '-';

  // HEALTH METRICS
  const tinggi = Number(selectedStudent?.tinggi_badan || selectedStudent?.kesehatan?.tinggi || 165);
  const berat = Number(selectedStudent?.berat_badan || selectedStudent?.kesehatan?.berat || 55);
  const bmi = selectedStudent?.kesehatan?.bmi || (berat / ((tinggi/100) * (tinggi/100))).toFixed(1);
  const bpjs = selectedStudent?.bpjs || selectedStudent?.kesehatan?.bpjs || 'BPJS-012993002';
  const allergies = selectedStudent?.alergi || selectedStudent?.kesehatan?.alergi || 'Tidak Ada';
  const disabilitas = selectedStudent?.berkebutuhan_khusus || selectedStudent?.kesehatan?.disabilitas || 'Tidak Ada';

  // BMI status description
  const getBmiStatus = (bmiVal: number) => {
    if (bmiVal < 18.5) return { label: 'UNDERWEIGHT (Kekurangan Berat)', color: 'text-amber-600 bg-amber-50 border-amber-100' };
    if (bmiVal < 24.9) return { label: 'IDEAL (Normal)', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
    return { label: 'OVERWEIGHT (Kelebihan Berat)', color: 'text-red-600 bg-red-50 border-red-100' };
  };
  const bmiStatus = getBmiStatus(Number(bmi));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs text-slate-700">
      
      {/* Target student indicator */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800">Personel Kependudukan</h3>
          <p className="text-xs text-slate-500 font-mono">Dapodik Terverifikasi • Sinkronisasi Kartu Keluarga</p>
        </div>

        <div className="flex flex-col gap-1.5 font-medium">
          <label className="font-bold text-slate-600">Pilih Siswa Target:</label>
          <select
            value={selectedStudentId}
            onChange={(e) => onSelectStudent(e.target.value)}
            className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold"
          >
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.name || s.identitas?.name} ({s.nis || s.identitas?.nis})
              </option>
            ))}
          </select>
        </div>

        {/* Selected card snippet */}
        <div className="p-4 border border-slate-150 rounded-2xl bg-slate-50/50 flex flex-col gap-2">
          <p className="font-bold text-slate-800 text-[13px]">{studentName}</p>
          <p className="font-mono text-[10px] text-slate-500">NIS: {studentNis}</p>
          <p className="text-slate-600 mt-1">Kelas: {selectedStudent?.kelas || selectedStudent?.sekolah?.kelas || 'X-A'}</p>
          <p className="text-slate-600">Asrama: {selectedStudent?.asrama || selectedStudent?.pondok?.asrama || 'N/A'}</p>
        </div>
      </div>

      {/* Main details block */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        
        {/* 1. KESEHATAN TAB */}
        {subTab === 'KESEHATAN' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">Kartu Pemeriksaan Fisik & Kesehatan</h3>
              <p className="text-xs text-slate-500 font-mono">Metrik Indeks Massa Tubuh (IMU/BMI) & BPJS Kesehatan</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-slate-400 font-bold font-mono">TINGGI BADAN</span>
                <span className="text-2xl font-extrabold text-slate-800 mt-1">{tinggi} cm</span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-slate-400 font-bold font-mono">BERAT BADAN</span>
                <span className="text-2xl font-extrabold text-slate-800 mt-1">{berat} kg</span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-slate-400 font-bold font-mono">NILAI IMT (BMI)</span>
                <span className="text-2xl font-extrabold text-blue-600 mt-1">{bmi}</span>
              </div>
            </div>

            <div className={`p-3.5 border rounded-xl font-bold font-mono text-[10px] flex items-center gap-2 mt-1 ${bmiStatus.color}`}>
              <Activity className="h-4 w-4" />
              <span>STATUS IMT: {bmiStatus.label}</span>
            </div>

            <div className="border-t border-slate-100 pt-4 mt-2 flex flex-col gap-3">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider font-mono text-[10px]">Data Alergi, Disabilitas & Jaminan</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-slate-500">Nomor Jaminan BPJS</span>
                  <p className="font-mono text-slate-800 text-[11px] font-bold">{bpjs}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-slate-500">Kebutuhan Khusus / Disabilitas</span>
                  <p className="font-mono text-slate-800 text-[11px] font-bold">{disabilitas}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-slate-500">Riwayat Penyakit / Alergi</span>
                  <p className="font-mono text-slate-800 text-[11px] font-bold">{allergies}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-slate-500">Golongan Darah</span>
                  <span className="inline-block px-2 py-0.5 bg-red-50 text-red-700 font-extrabold font-mono rounded w-max">{selectedStudent?.golongan_darah || 'O'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. ORANG TUA TAB */}
        {subTab === 'ORTU' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Profil Kontak & Kredensial Orang Tua Kandung</h3>
                <p className="text-xs text-slate-500 font-mono">Daftar NIK & Pekerjaan Resmi Tercatat dalam Kartu Keluarga</p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenWaliModal(ayahNama !== '-' ? ayahNama : ibuNama, ayahHp !== '-' ? ayahHp : ibuHp, ayahEmail)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Key className="h-4 w-4" />
                <span>Buat / Kelola Akun Login Wali Santri</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profil Ayah */}
              <div className="p-4 border border-slate-150 rounded-2xl bg-slate-50/50 flex flex-col gap-3">
                <h4 className="font-extrabold text-slate-800 border-b border-slate-200 pb-2">PROFIL AYAH KANDUNG</h4>
                <div className="flex flex-col gap-2">
                  <p><span className="font-bold text-slate-500">Nama Lengkap:</span> <span className="font-bold text-slate-800">{ayahNama}</span></p>
                  <p><span className="font-bold text-slate-500">NIK Ayah:</span> <span className="font-mono text-slate-700">{ayahNik}</span></p>
                  <p><span className="font-bold text-slate-500">Pekerjaan:</span> <span className="text-slate-750">{ayahKerja}</span></p>
                  <p className="flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-slate-400" /> <span className="font-mono">{ayahHp}</span></p>
                  <p className="flex items-center gap-1"><Mail className="h-3.5 w-3.5 text-slate-400" /> <span className="font-mono">{ayahEmail}</span></p>
                </div>
              </div>

              {/* Profil Ibu */}
              <div className="p-4 border border-slate-150 rounded-2xl bg-slate-50/50 flex flex-col gap-3">
                <h4 className="font-extrabold text-slate-800 border-b border-slate-200 pb-2">PROFIL IBU KANDUNG</h4>
                <div className="flex flex-col gap-2">
                  <p><span className="font-bold text-slate-500">Nama Lengkap:</span> <span className="font-bold text-slate-800">{ibuNama}</span></p>
                  <p><span className="font-bold text-slate-500">NIK Ibu:</span> <span className="font-mono text-slate-700">{ibuNik}</span></p>
                  <p><span className="font-bold text-slate-500">Pekerjaan:</span> <span className="text-slate-750">{ibuKerja}</span></p>
                  <p className="flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-slate-400" /> <span className="font-mono">{ibuHp}</span></p>
                  <p className="flex items-center gap-1"><Mail className="h-3.5 w-3.5 text-slate-400" /> <span className="font-mono">{ibuEmail}</span></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. WALI TAB */}
        {subTab === 'WALI' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Profil Kredensial Wali Santri (Bukan Orang Tua)</h3>
                <p className="text-xs text-slate-500 font-mono">Dibutuhkan jika siswa diasuh oleh kakek, paman, atau asisten hukum</p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenWaliModal(waliNama, waliHp)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Key className="h-4 w-4" />
                <span>Buat / Kelola Akun Login Wali Asuh</span>
              </button>
            </div>

            <div className="p-5 border border-slate-150 rounded-2xl bg-slate-50/50 flex flex-col gap-3 max-w-md">
              <h4 className="font-extrabold text-slate-800 border-b border-slate-200 pb-2">DATA WALI ASAL</h4>
              <div className="flex flex-col gap-2.5">
                <p><span className="font-bold text-slate-500">Nama Wali:</span> <span className="font-bold text-slate-850">{waliNama}</span></p>
                <p><span className="font-bold text-slate-500">NIK Wali:</span> <span className="font-mono text-slate-750">{waliNik}</span></p>
                <p><span className="font-bold text-slate-500">Pekerjaan:</span> <span className="text-slate-750">{waliKerja}</span></p>
                <p className="flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-slate-400" /> <span className="font-mono">{waliHp}</span></p>
              </div>
            </div>
          </div>
        )}

        {/* 4. RIWAYAT TIMELINE TAB */}
        {subTab === 'RIWAYAT' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-5">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">Garis Waktu Riwayat Pendidikan & Kedisiplinan</h3>
              <p className="text-xs text-slate-500 font-mono font-bold uppercase tracking-wider text-blue-600">Timeline Kesiswaan SaaS</p>
            </div>

            {/* Vertical timeline */}
            <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-2">
              {histories
                .filter(h => h.student_id === selectedStudentId)
                .map((h: any, idx: number) => (
                  <div key={idx} className="flex gap-4 relative">
                    {/* Line icon indicator */}
                    <div className="flex flex-col items-center">
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-full border border-blue-150">
                        <Clock className="h-3.5 w-3.5" />
                      </div>
                      <div className="w-0.5 flex-1 bg-slate-150 mt-1" />
                    </div>
                    {/* Timeline card */}
                    <div className="flex-1 p-3.5 border border-slate-100 bg-slate-50 rounded-2xl flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded text-[9px] font-bold font-mono">{h.category}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{new Date(h.created_at || Date.now()).toLocaleDateString('id-ID')}</span>
                      </div>
                      <h4 className="font-extrabold text-slate-850 text-[11px]">{h.action}</h4>
                      <p className="text-slate-600 text-[10.5px] leading-relaxed italic">"{h.details}"</p>
                      <span className="text-[9px] text-slate-400 font-mono">Dicatat oleh: {h.operator || 'system'}</span>
                    </div>
                  </div>
                ))}

              {histories.filter(h => h.student_id === selectedStudentId).length === 0 && (
                <p className="text-center text-slate-400 font-mono py-8">Belum ada peristiwa historis terekam untuk siswa ini.</p>
              )}
            </div>
          </div>
        )}

      </div>

      {/* MODAL BUAT / KELOLA AKUN LOGIN WALI SANTRI */}
      {isWaliModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-500/30">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider font-mono text-white">
                    Buat / Kelola Akun Login Wali Santri
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Kredensial Parent Portal untuk Orang Tua / Wali {studentName}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsWaliModalOpen(false)}
                className="text-slate-400 hover:text-white transition p-1 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              
              {/* Info Santri Terhubung */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-600 font-mono block">Santri / Siswa Terhubung</span>
                  <span className="font-extrabold text-slate-900 text-sm block mt-0.5">{studentName}</span>
                  <span className="text-[11px] text-slate-500 font-mono block">
                    NIS: {studentNis} • Kelas: {selectedStudent?.kelas || 'X-A'} • Wali: {ayahNama !== '-' ? ayahNama : waliNama !== '-' ? waliNama : ibuNama}
                  </span>
                </div>
                <span className="px-2.5 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-bold uppercase font-mono">
                  WALI_SANTRI
                </span>
              </div>

              {/* Form Input Akun Wali */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Username Login (NIS / No HP Wali) *</label>
                  <input 
                    type="text"
                    value={waliUsername}
                    onChange={(e) => setWaliUsername(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold focus:outline-none focus:border-indigo-500"
                    placeholder="wali_202601"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">No. WhatsApp Wali *</label>
                    <input 
                      type="text"
                      value={waliPhone}
                      onChange={(e) => setWaliPhone(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:outline-none focus:border-indigo-500"
                      placeholder="081234567890"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Wali *</label>
                    <input 
                      type="email"
                      value={waliEmail}
                      onChange={(e) => setWaliEmail(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500"
                      placeholder="wali@sekolah.sch.id"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password Login Parent Portal *</label>
                  <input 
                    type="text"
                    value={waliPassword}
                    onChange={(e) => setWaliPassword(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold text-emerald-700 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                {/* Box Kredensial & Copy Button */}
                <div className="p-3 bg-slate-900 text-white rounded-xl space-y-2 border border-slate-800">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Ringkasan Akses Parent Portal (Wali Santri):</span>
                    <button
                      type="button"
                      onClick={() => {
                        const text = `Kredensial Login Parent Portal Wali Santri:\nSantri: ${studentName} (${studentNis})\nUsername: ${waliUsername}\nNo. WA: ${waliPhone}\nPassword: ${waliPassword}\nAkses: Tagihan SPP, Presensi, Tahfidz & Chat Wali Kelas`;
                        navigator.clipboard.writeText(text);
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 2000);
                      }}
                      className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {isCopied ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{isCopied ? 'Tersalin!' : 'Salin Kredensial'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-[11px] space-y-0.5 text-slate-200">
                    <div><span className="text-slate-400">User:</span> <strong className="text-white">{waliUsername}</strong></div>
                    <div><span className="text-slate-400">Pass:</span> <strong className="text-emerald-400">{waliPassword}</strong></div>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsWaliModalOpen(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await apiClient.post('/action?action=create_user_account', {
                      name: studentName + ' (Wali)',
                      email: waliEmail,
                      username: waliUsername,
                      password: waliPassword,
                      role: 'WALI_SANTRI',
                      tenantId: tenant?.id
                    });
                    if (res.data.success) {
                      alert('Akun login sistem untuk Wali Santri ' + studentName + ' (' + waliUsername + ') BERHASIL DIBUAT & DIBERIKAN AKSES SISTEM!');
                      setIsWaliModalOpen(false);
                    } else {
                      alert('Gagal membuat akun: ' + res.data.message);
                    }
                  } catch (err) {
                    alert('Terjadi kesalahan saat menghubungi server.');
                  }
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Simpan &amp; Aktifkan Akun Wali</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
