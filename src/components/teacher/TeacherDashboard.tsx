import React, { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen, Users, Bell, ChevronRight, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { Schedule, Student } from '../../types/teacher';
import apiClient from '../../api/client';

interface TeacherDashboardProps {
  teacherName: string;
  schedules: Schedule[];
  students: Student[];
  onStartKbm: () => void;
}

export default function TeacherDashboard({ teacherName, schedules, students, onStartKbm }: TeacherDashboardProps) {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.post('/api/action', { action: 'getTeacherDashboardData' })
      .then(res => {
        if (res.data?.success) {
          setDashboardData(res.data.data);
        }
      })
      .catch(err => {
        if (err?.response?.status !== 401) {
          console.warn('Teacher dashboard fallback active:', err?.message || err);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const todaySchedules = schedules.filter(s => s.day === 'SENIN'); // Default simulation day is Monday

  const totalStudents = dashboardData?.totalStudents ?? students.length;
  const totalClasses = dashboardData?.totalClasses ?? 1;
  const totalSubjects = dashboardData?.totalSubjects ?? 1;
  const weeklyHours = dashboardData?.weeklyHours ?? 24;
  const activeAssignments = dashboardData?.activeAssignments ?? [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Assalamualaikum, {teacherName}</h2>
          <p className="text-blue-100 text-xs mt-1 md:text-sm">Selamat datang di Teacher Academic Workspace. Semua administrasi, KBM, dan penilaian terintegrasi di sini.</p>
        </div>
        <button
          onClick={onStartKbm}
          className="bg-white text-blue-700 hover:bg-blue-50 transition-colors px-5 py-2.5 rounded-xl font-bold text-xs shrink-0 self-start md:self-auto flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <BookOpen className="h-4 w-4" />
          Mulai KBM Kelas Aktif
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Siswa Diampu</span>
            <span className="text-xl font-extrabold text-slate-800">{totalStudents} Siswa</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Beban Mengajar</span>
            <span className="text-xl font-extrabold text-slate-800">{weeklyHours} Jam / Pekan</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Kelas</span>
            <span className="text-xl font-extrabold text-slate-800">{totalClasses} Kelas</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Mata Pelajaran</span>
            <span className="text-xl font-extrabold text-slate-800">{totalSubjects} Mapel</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side Column: Active Assignments + Today's Agenda */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Assignments List */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                Daftar Penugasan Aktif Anda (Ploting Guru)
              </h3>
              <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2.5 py-1 rounded-md">Live Sync</span>
            </div>

            {loading ? (
              <div className="py-8 flex items-center justify-center gap-2 text-xs text-slate-400">
                <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                Menghubungkan ke database akademik...
              </div>
            ) : activeAssignments.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Anda belum ditugaskan ke kelas manapun oleh Administrator.
              </div>
            ) : (
              <div className="space-y-3">
                {activeAssignments.map((asg: any) => (
                  <div key={asg.id} className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block">Kelas {asg.class_name} ({asg.unit_id})</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {asg.subject_name ? `Mata Pelajaran: ${asg.subject_name}` : 'Wali Kelas / Pembina'}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-800 rounded-lg text-[9px] font-black uppercase tracking-wider">
                      {asg.assignment_type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's Schedule Timeline */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                Agenda Mengajar Hari Ini (Senin)
              </h3>
              <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2.5 py-1 rounded-md">Hari Aktif</span>
            </div>

            <div className="relative border-l border-slate-100 pl-4 ml-2 space-y-6">
              {todaySchedules.map((sch, sIdx) => (
                <div key={sch.id} className="relative">
                  <div className="absolute -left-[25px] top-1 h-4 w-4 rounded-full border-2 border-blue-500 bg-white" />
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">Fisika - Kelas X MIPA 1</h4>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                        <Clock className="h-3.5 w-3.5" />
                        {sch.start_time} - {sch.end_time} WIB (Jam ke 1-2)
                      </span>
                    </div>
                    <button
                      onClick={onStartKbm}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      Buka Kelas
                    </button>
                  </div>
                </div>
              ))}

              <div className="relative">
                <div className="absolute -left-[25px] top-1 h-4 w-4 rounded-full border-2 border-slate-300 bg-white" />
                <div className="bg-slate-50/50 border border-slate-100/60 p-4 rounded-xl opacity-60">
                  <h4 className="font-bold text-slate-700 text-xs">Fisika - Kelas XI IPS 1</h4>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                    <Clock className="h-3.5 w-3.5" />
                    09:30 - 11:00 WIB (Jam ke 3-4)
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side Column: Dynamic Alerts & Reminders */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-4">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            Pengingat & Tugas Mandiri
          </h3>
          <div className="space-y-4">
            <div className="p-3.5 bg-amber-50/80 border border-amber-100 rounded-xl">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">SUMATIF DEPAN MATA</span>
              <p className="text-xs text-amber-900 mt-1">Ulangan Akhir Bab 1 Fisika (Kinematika) dijadwalkan Rabu besok di kelas X MIPA 1.</p>
            </div>
            <div className="p-3.5 bg-blue-50/80 border border-blue-100 rounded-xl">
              <span className="text-[10px] font-bold text-blue-800 uppercase block">MODUL AJAR (RPP)</span>
              <p className="text-xs text-blue-900 mt-1">Lengkapi modul ajar (ATP/TP) bab Usaha & Energi untuk persiapan KBM pekan depan.</p>
            </div>
            <div className="p-3.5 bg-emerald-50/80 border border-emerald-100 rounded-xl">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">SETORAN TAHFIDZ</span>
              <p className="text-xs text-emerald-900 mt-1">Siswa Zaid Al-Khair memiliki target setoran hafalan baru Juz 30 hari ini.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Schedule Table view (Jadwal Mengajar) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            Kalender Jadwal Mengajar Mingguan
          </h3>
          <span className="text-xs text-slate-400 font-mono">Tahun Ajaran 2025/2026 (Ganjil)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase">Jam Pelajaran</th>
                <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase">Senin</th>
                <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase">Selasa</th>
                <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase">Rabu</th>
                <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase">Kamis</th>
                <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase">Jumat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-500">Jam 1-2 (07:30 - 09:00)</td>
                <td className="py-2 px-3">
                  <div className="p-2 bg-blue-50 border border-blue-100 rounded-lg">
                    <span className="font-bold text-blue-700 block text-[10px]">Fisika</span>
                    <span className="text-slate-500 text-[9px]">X MIPA 1</span>
                  </div>
                </td>
                <td className="py-2 px-3 text-slate-300">-</td>
                <td className="py-2 px-3">
                  <div className="p-2 bg-blue-50 border border-blue-100 rounded-lg">
                    <span className="font-bold text-blue-700 block text-[10px]">Fisika</span>
                    <span className="text-slate-500 text-[9px]">X MIPA 1</span>
                  </div>
                </td>
                <td className="py-2 px-3 text-slate-300">-</td>
                <td className="py-2 px-3 text-slate-300">-</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-500">Jam 3-4 (09:30 - 11:00)</td>
                <td className="py-2 px-3">
                  <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg">
                    <span className="font-bold text-indigo-700 block text-[10px]">Fisika</span>
                    <span className="text-slate-500 text-[9px]">XI IPS 1</span>
                  </div>
                </td>
                <td className="py-2 px-3">
                  <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg">
                    <span className="font-bold text-indigo-700 block text-[10px]">Fisika</span>
                    <span className="text-slate-500 text-[9px]">XI IPS 1</span>
                  </div>
                </td>
                <td className="py-2 px-3 text-slate-300">-</td>
                <td className="py-2 px-3 text-slate-300">-</td>
                <td className="py-2 px-3 text-slate-300">-</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-500">Jam 5-6 (11:30 - 13:00)</td>
                <td className="py-2 px-3 text-slate-300">-</td>
                <td className="py-2 px-3 text-slate-300">-</td>
                <td className="py-2 px-3 text-slate-300">-</td>
                <td className="py-2 px-3">
                  <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-lg">
                    <span className="font-bold text-emerald-700 block text-[10px]">Praktikum</span>
                    <span className="text-slate-500 text-[9px]">X MIPA 1</span>
                  </div>
                </td>
                <td className="py-2 px-3 text-slate-300">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
