/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import {
  Users,
  UserCheck,
  Plus,
  RefreshCw,
  Heart,
  Calendar,
  BookOpen,
  DollarSign,
  Award,
  Clock,
  ArrowRight,
  Sparkles,
  CreditCard,
  Building,
  Home,
  UserPlus,
  Compass,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Smartphone,
  CheckCircle,
  Megaphone
} from 'lucide-react';

export default function ParentPortal() {
  const { tenant } = useAuth();
  const queryClient = useQueryClient();
  const isPondok = tenant?.type === 'PONDOK' || tenant?.type === 'KEDUA';

  // Administration view or active parent simulation session
  const [simulationParentEmail, setSimulationParentEmail] = useState<string | null>(null);

  // Parent account form
  const [pName, setPName] = useState('');
  const [pEmail, setPEmail] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pUsername, setPUsername] = useState('');
  const [pPassword, setPPassword] = useState('');
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Link Student form
  const [selectedParentId, setSelectedParentId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [relationship, setRelationship] = useState('Ayah');

  // Queries
  const { data: parents, refetch: refetchParents, isLoading: loadingParents } = useQuery({
    queryKey: ['parentsList'],
    queryFn: async () => {
      const res = await axios.post('/api/action?action=parentPortal', { subAction: 'list_parents' });
      return res.data?.data || [];
    }
  });

  const { data: students, isLoading: loadingStudents } = useQuery({
    queryKey: ['studentsList'],
    queryFn: async () => {
      // Fetch school students
      const res = await axios.post('/api/action?action=getSivitas');
      return res.data?.data?.students || [];
    }
  });

  // Query parent portal simulated view
  const { data: portalData, refetch: refetchPortal, isLoading: loadingPortal } = useQuery({
    queryKey: ['parentDashboard', simulationParentEmail],
    queryFn: async () => {
      if (!simulationParentEmail) return null;
      const res = await axios.post('/api/action?action=parentDashboard', { parent_email: simulationParentEmail });
      return res.data?.data;
    },
    enabled: !!simulationParentEmail
  });

  // Announcements query
  const { data: announcements } = useQuery({
    queryKey: ['schoolAnnouncements'],
    queryFn: async () => {
      const res = await axios.post('/api/action?action=notificationQueue'); // fetches queue/logs for messages
      return res.data?.data || [];
    }
  });

  // Mutations
  const createParentMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axios.post('/api/action?action=parentPortal', { subAction: 'save_parent', ...payload });
      return res.data;
    },
    onSuccess: () => {
      refetchParents();
      setPName('');
      setPEmail('');
      setPPhone('');
      setPUsername('');
      setPPassword('');
      setFormSuccess('Akun Wali Murid berhasil didaftarkan!');
      setTimeout(() => setFormSuccess(null), 3000);
    }
  });

  const linkStudentMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axios.post('/api/action?action=parentPortal', { subAction: 'link_student', ...payload });
      return res.data;
    },
    onSuccess: () => {
      refetchParents();
      setSelectedParentId('');
      setSelectedStudentId('');
      setFormSuccess('Siswa berhasil ditautkan ke Wali Murid!');
      setTimeout(() => setFormSuccess(null), 3000);
    }
  });

  const payInvoiceMutation = useMutation({
    mutationFn: async (invoice_id: string) => {
      const res = await axios.post('/api/action?action=parentPortal', { subAction: 'simulate_payment', invoice_id });
      return res.data;
    },
    onSuccess: () => {
      refetchPortal();
      alert('Pembayaran Berhasil Terverifikasi! Tagihan berganti status menjadi PAID secara real-time.');
    }
  });

  const handleRegisterParent = (e: React.FormEvent) => {
    e.preventDefault();
    createParentMutation.mutate({
      name: pName,
      email: pEmail,
      phone: pPhone,
      username: pUsername,
      password: pPassword
    });
  };

  const handleLinkStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParentId || !selectedStudentId) return;
    linkStudentMutation.mutate({
      parent_id: selectedParentId,
      student_id: selectedStudentId,
      relationship
    });
  };

  return (
    <div className="space-y-6 font-sans">

      {/* PORTAL SIMULATOR ACTIVE SESSION BANNER */}
      {simulationParentEmail && portalData?.parent && (
        <div className="bg-emerald-600 text-white p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-md animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-emerald-100 font-bold font-mono uppercase tracking-wider">Sesi Wali Murid Aktif</p>
              <h3 className="text-sm font-extrabold">{portalData.parent.name} ({portalData.parent.email})</h3>
            </div>
          </div>
          <button
            onClick={() => setSimulationParentEmail(null)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-emerald-700 font-extrabold text-xs rounded-lg hover:bg-emerald-50 cursor-pointer shadow-sm transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Panel Admin Sekolah
          </button>
        </div>
      )}

      {/* ------------------- PORTAL PREVIEW VIEW ------------------- */}
      {simulationParentEmail && portalData ? (
        <div className="space-y-6 animate-fade-in">
          
          {/* Welcome Dashboard */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  Selamat Datang Wali Murid
                </span>
                <h2 className="text-xl font-black text-slate-800 mt-2">Portal Monitoring {portalData.parent.name}</h2>
                <p className="text-xs text-slate-400 mt-0.5">Pantau prestasi akademik, kehadiran presensi harian, asrama, dan administrasi keuangan putra-putri Anda.</p>
              </div>
            </div>

            {/* List of children */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {portalData.students?.map((std: any) => (
                <div key={std.id} className="p-4 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-mono">NAMA SISWA/SANTRI</p>
                    <p className="text-sm font-bold text-slate-800">{std.name}</p>
                    <p className="text-xs text-slate-500">NIS: {std.nis} • Kelas: {std.classroom_id === 'cl-1' ? 'X-A Unggulan' : 'X-B'}</p>
                  </div>
                  {std.is_santri && (
                    <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2.5 py-1 rounded-full font-mono">
                      Santri Mukim
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Attendance tracking */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 lg:col-span-1">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Calendar className="h-5 w-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-800 text-sm">Absensi & Presensi Harian</h3>
              </div>
              
              {portalData.attendances?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Belum ada rekap presensi hari ini.</p>
              ) : (
                <div className="space-y-3">
                  {portalData.attendances?.map((att: any) => (
                    <div key={att.id} className="p-3 bg-slate-50 border rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{att.student_name || 'Siswa'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">Tanggal: {att.date}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                        att.status === 'HADIR' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {att.status}
                      </span>
                    </div>
                  ))}
                  <div className="p-3 bg-emerald-50 text-emerald-950 rounded-lg text-xs flex gap-2">
                    <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>Laporan presensi masuk otomatis terkirim langsung ke nomor WhatsApp Anda setiap pagi.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Grades academic tracker */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 lg:col-span-1">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Award className="h-5 w-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-800 text-sm">Hasil Nilai Akademik & CBT</h3>
              </div>

              {portalData.grades?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Nilai ulangan belum dipublish oleh wali kelas.</p>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {portalData.grades?.map((gr: any) => (
                    <div key={gr.id} className="p-3 bg-slate-50 border rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{gr.subject_name || gr.subject_id}</p>
                        <p className="text-[10px] text-slate-400 font-mono">Tipe: {gr.type || 'Ulangan Harian'}</p>
                      </div>
                      <span className="text-sm font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded">
                        {gr.score}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SPP Invoice payment with real-time update simulator */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 lg:col-span-1">
              <div className="flex items-center gap-2 pb-2 border-b">
                <DollarSign className="h-5 w-5 text-amber-600" />
                <h3 className="font-extrabold text-slate-800 text-sm">Administrasi SPP & Keuangan</h3>
              </div>

              {portalData.invoices?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Tidak ada tagihan aktif.</p>
              ) : (
                <div className="space-y-3">
                  {portalData.invoices?.map((inv: any) => (
                    <div key={inv.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 hover:shadow-sm transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[9px] text-slate-400 font-mono uppercase">Nama Tagihan</p>
                          <p className="text-xs font-bold text-slate-800">{inv.name || 'SPP Bulan Juli 2026'}</p>
                          <p className="text-xs font-extrabold text-amber-600 mt-1">Rp {inv.amount?.toLocaleString('id-ID') || '450.000'}</p>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {inv.status}
                        </span>
                      </div>

                      {inv.status === 'UNPAID' ? (
                        <button
                          onClick={() => {
                            if (confirm('Konfirmasi pembayaran tagihan via Payment Gateway / Virtual Account Sekolah?')) {
                              payInvoiceMutation.mutate(inv.id);
                            }
                          }}
                          disabled={payInvoiceMutation.isPending}
                          className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-black text-[11px] rounded-lg shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CreditCard className="h-3.5 w-3.5" /> {payInvoiceMutation.isPending ? 'Memproses...' : 'Bayar Tagihan Sekarang'}
                        </button>
                      ) : (
                        <div className="p-2 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded text-center flex items-center justify-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> LUNAS • VA Terbayar Otomatis
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      ) : (
        // ------------------- SCHOOL ADMIN MANAGER VIEW -------------------
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          
          {/* List of Parents & Simulator Triggers */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">Daftar Akun Wali Murid (Orang Tua)</h3>
                <p className="text-xs text-slate-400">Pilih salah satu wali murid untuk masuk ke simulator Portal Wali Murid secara langsung.</p>
              </div>
            </div>

            {loadingParents ? (
              <p className="text-xs text-slate-400 animate-pulse font-mono">Memuat database wali murid...</p>
            ) : (
              <div className="space-y-3">
                {parents?.map((parent: any) => (
                  <div key={parent.id} className="p-4 bg-slate-50 border border-slate-150 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-sm transition">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <UserCheck className="h-4 w-4 text-blue-600" /> {parent.name}
                      </h4>
                      <p className="text-xs text-slate-500 font-mono">
                        Email: {parent.email} • Telp: {parent.phone}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSimulationParentEmail(parent.email)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white font-extrabold text-[10px] rounded hover:bg-emerald-700 cursor-pointer shadow-sm transition uppercase"
                      >
                        Buka Portal Wali Murid <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Setup / Register Panel & Link student */}
          <div className="space-y-6 lg:col-span-1">
            
            {/* Form to Register parent */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm">Daftarkan Wali Murid Baru</h3>
              
              <form onSubmit={handleRegisterParent} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    placeholder="Contoh: Ahmad Subarjo"
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email Aktif</label>
                  <input
                    type="email"
                    placeholder="Contoh: ahmad@gmail.com"
                    value={pEmail}
                    onChange={(e) => setPEmail(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nomor WhatsApp</label>
                  <input
                    type="text"
                    placeholder="Contoh: 08123456780"
                    value={pPhone}
                    onChange={(e) => setPPhone(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Username</label>
                    <input
                      type="text"
                      placeholder="Username..."
                      value={pUsername}
                      onChange={(e) => setPUsername(e.target.value)}
                      className="w-full text-xs p-2 bg-slate-50 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
                    <input
                      type="password"
                      placeholder="Password..."
                      value={pPassword}
                      onChange={(e) => setPPassword(e.target.value)}
                      className="w-full text-xs p-2 bg-slate-50 border rounded-lg"
                    />
                  </div>
                </div>

                {formSuccess && <p className="text-xs text-emerald-600 font-bold">{formSuccess}</p>}

                <button
                  type="submit"
                  disabled={createParentMutation.isPending}
                  className="w-full py-2.5 bg-blue-600 text-white font-extrabold text-xs rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  {createParentMutation.isPending ? 'Mendaftarkan...' : 'Daftarkan Akun'}
                </button>
              </form>
            </div>

            {/* Form to Link student to parent */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm">Tautkan Siswa ke Wali Murid</h3>
              <form onSubmit={handleLinkStudent} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Pilih Wali Murid</label>
                  <select
                    value={selectedParentId}
                    onChange={(e) => setSelectedParentId(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg"
                    required
                  >
                    <option value="">-- Pilih Orang Tua --</option>
                    {parents?.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Pilih Siswa/Santri</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg"
                    required
                  >
                    <option value="">-- Pilih Siswa --</option>
                    {students?.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.nis})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Hubungan</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg"
                  >
                    <option value="Ayah">Ayah</option>
                    <option value="Ibu">Ibu</option>
                    <option value="Wali">Wali / Saudara Kandung</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 text-white font-extrabold text-xs rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  Tautkan Siswa Sekarang
                </button>
              </form>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
