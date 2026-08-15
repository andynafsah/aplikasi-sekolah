import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Users, 
  AlertTriangle, 
  UserCheck, 
  Sliders, 
  Gift, 
  ShieldAlert, 
  Sparkles,
  Info,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  MapPin
} from 'lucide-react';

export function AttendanceScheduler() {
  // Tabs within scheduler: 'schedules' | 'calendars' | 'holidays' | 'overrides' | 'assignments' | 'tester'
  const [activeTab, setActiveTab] = useState<'schedules' | 'calendars' | 'holidays' | 'overrides' | 'assignments' | 'tester'>('schedules');

  // DB States
  const [schedules, setSchedules] = useState<any[]>([]);
  const [calendars, setCalendars] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [overrides, setOverrides] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [conflicts, setConflicts] = useState<any[]>([]);

  // Loading States
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Forms States
  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    type: 'REGULAR',
    start_time: '07:30',
    end_time: '15:30',
    grace_period: '10',
    checkin_open: '06:00',
    checkin_close: '09:00',
    checkout_open: '15:00',
    checkout_close: '18:00',
    unit_id: ''
  });

  const [calendarForm, setCalendarForm] = useState({
    name: '',
    type: 'EMPLOYEE',
    working_days: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']
  });

  const [holidayForm, setHolidayForm] = useState({
    name: '',
    date_start: '',
    date_end: '',
    type: 'NATIONAL',
    description: '',
    calendar_id: ''
  });

  const [overrideForm, setOverrideForm] = useState({
    target_type: 'PERSON',
    target_id: '',
    date: '',
    schedule_id: '',
    name: ''
  });

  const [assignmentForm, setAssignmentForm] = useState({
    schedule_id: '',
    target_type: 'ROLE',
    target_id: '',
    priority: '1'
  });

  // Tester State
  const [testerForm, setTesterForm] = useState({
    userId: 'std-1',
    role: 'SANTRI',
    rombelId: 'XII-A',
    unitId: 'SMA',
    date: new Date().toISOString().split('T')[0]
  });
  const [testerResult, setTesterResult] = useState<any | null>(null);

  // Initial Seed Lists for selection convenience
  const roleList = ['SANTRI', 'SISWA', 'GURU', 'PEGAWAI', 'SECURITY', 'ADMIN'];
  const indonesianDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  // Fetch all data from backend REST API
  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}`, 'Content-Type': 'application/json' };
      
      const [resSchedules, resCalendars, resHolidays, resOverrides, resAssignments, resConflicts] = await Promise.all([
        fetch('/api/v1/attendance/schedules', { headers }).then(r => r.json()),
        fetch('/api/v1/attendance/calendars', { headers }).then(r => r.json()),
        fetch('/api/v1/attendance/holidays', { headers }).then(r => r.json()),
        fetch('/api/v1/attendance/overrides', { headers }).then(r => r.json()),
        fetch('/api/v1/attendance/assignments', { headers }).then(r => r.json()),
        fetch('/api/v1/attendance/conflicts', { headers }).then(r => r.json())
      ]);

      if (resSchedules.success) setSchedules(resSchedules.data);
      if (resCalendars.success) setCalendars(resCalendars.data);
      if (resHolidays.success) setHolidays(resHolidays.data);
      if (resOverrides.success) setOverrides(resOverrides.data);
      if (resAssignments.success) setAssignments(resAssignments.data);
      if (resConflicts.success) setConflicts(resConflicts.data);
    } catch (err: any) {
      showNotice('error', 'Gagal memuat data penjadwalan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showNotice = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Submit handlers
  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}`, 'Content-Type': 'application/json' };
      const res = await fetch('/api/v1/attendance/schedules', {
        method: 'POST',
        headers,
        body: JSON.stringify(scheduleForm)
      }).then(r => r.json());

      if (res.success) {
        showNotice('success', 'Jadwal Kerja berhasil ditambahkan ke database.');
        setScheduleForm({
          name: '',
          type: 'REGULAR',
          start_time: '07:30',
          end_time: '15:30',
          grace_period: '10',
          checkin_open: '06:00',
          checkin_close: '09:00',
          checkout_open: '15:00',
          checkout_close: '18:00',
          unit_id: ''
        });
        fetchData();
      } else {
        showNotice('error', res.message);
      }
    } catch (err: any) {
      showNotice('error', err.message);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menonaktifkan jadwal ini?')) return;
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` };
      const res = await fetch(`/api/v1/attendance/schedules/${id}`, {
        method: 'DELETE',
        headers
      }).then(r => r.json());

      if (res.success) {
        showNotice('success', 'Jadwal Kerja berhasil dihapus.');
        fetchData();
      }
    } catch (err: any) {
      showNotice('error', err.message);
    }
  };

  const handleCreateCalendar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}`, 'Content-Type': 'application/json' };
      const res = await fetch('/api/v1/attendance/calendars', {
        method: 'POST',
        headers,
        body: JSON.stringify(calendarForm)
      }).then(r => r.json());

      if (res.success) {
        showNotice('success', 'Kalender kerja berhasil disimpan.');
        setCalendarForm({ name: '', type: 'EMPLOYEE', working_days: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'] });
        fetchData();
      } else {
        showNotice('error', res.message);
      }
    } catch (err: any) {
      showNotice('error', err.message);
    }
  };

  const handleCreateHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}`, 'Content-Type': 'application/json' };
      const res = await fetch('/api/v1/attendance/holidays', {
        method: 'POST',
        headers,
        body: JSON.stringify(holidayForm)
      }).then(r => r.json());

      if (res.success) {
        showNotice('success', 'Hari libur berhasil disimpan.');
        setHolidayForm({ name: '', date_start: '', date_end: '', type: 'NATIONAL', description: '', calendar_id: '' });
        fetchData();
      } else {
        showNotice('error', res.message);
      }
    } catch (err: any) {
      showNotice('error', err.message);
    }
  };

  const handleCreateOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}`, 'Content-Type': 'application/json' };
      const res = await fetch('/api/v1/attendance/overrides', {
        method: 'POST',
        headers,
        body: JSON.stringify(overrideForm)
      }).then(r => r.json());

      if (res.success) {
        showNotice('success', 'Override jadwal belajar/kerja berhasil disimpan.');
        setOverrideForm({ target_type: 'PERSON', target_id: '', date: '', schedule_id: '', name: '' });
        fetchData();
      } else {
        showNotice('error', res.message);
      }
    } catch (err: any) {
      showNotice('error', err.message);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}`, 'Content-Type': 'application/json' };
      const res = await fetch('/api/v1/attendance/assignments', {
        method: 'POST',
        headers,
        body: JSON.stringify(assignmentForm)
      }).then(r => r.json());

      if (res.success) {
        showNotice('success', 'Tugas Jadwal Kerja berhasil dipetakan secara dinamis.');
        setAssignmentForm({ schedule_id: '', target_type: 'ROLE', target_id: '', priority: '1' });
        fetchData();
      } else {
        showNotice('error', res.message);
      }
    } catch (err: any) {
      showNotice('error', err.message);
    }
  };

  // Run dynamic calculation simulator
  const handleTestEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` };
      const queryParams = new URLSearchParams(testerForm).toString();
      const res = await fetch(`/api/v1/attendance/my-schedule/today?${queryParams}`, { headers }).then(r => r.json());

      if (res.success) {
        setTesterResult(res.data);
        showNotice('success', 'Simulasi kalender kerja dievaluasi secara dinamis!');
      } else {
        showNotice('error', res.message);
      }
    } catch (err: any) {
      showNotice('error', err.message);
    }
  };

  return (
    <div className="flex flex-col gap-6" id="attendance-scheduler-dashboard">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-8 -translate-y-8">
          <Calendar className="w-64 h-64 text-emerald-950" />
        </div>
        <div className="flex flex-col gap-1 z-10">
          <span className="text-[10px] font-bold tracking-wider text-emerald-800 uppercase bg-emerald-100/70 border border-emerald-200/50 px-2.5 py-1 rounded-full w-max">
            Sistem Jadwal Dinamis Database-Driven
          </span>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Enterprise Schedule & Working Calendar Engine</h2>
          <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
            Kelola shift, toleransi keterlambatan, hari libur nasional, hari kerja kalender akademik, dan overrides dinamis tanpa hardcoding.
          </p>
        </div>
        <button 
          onClick={fetchData}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm z-10 disabled:opacity-50"
        >
          {loading ? 'Mensinkronkan...' : 'Sinkronkan Data'}
        </button>
      </div>

      {/* 2. Notification Toast */}
      {notification && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm border ${
            notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
            notification.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200' :
            'bg-slate-50 text-slate-800 border-slate-200'
          }`}
        >
          <Info className="w-4 h-4 shrink-0" />
          <span>{notification.message}</span>
        </motion.div>
      )}

      {/* 3. Conflict Warning Banner */}
      {conflicts.length > 0 && (
        <div className="bg-rose-50 border border-rose-150 p-4 rounded-2xl flex items-start gap-3 text-xs text-rose-900 shadow-sm">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 animate-bounce" />
          <div className="flex flex-col gap-1">
            <span className="font-bold">Terdeteksi Konflik Tumpang Tindih Penjadwalan ({conflicts.length})!</span>
            <p className="text-rose-700">Terdapat beberapa aturan prioritas yang bertentangan di database. Sistem akan mengutamakan prioritas level tertinggi:</p>
            <ul className="list-disc pl-5 font-mono text-[10px] text-rose-800 space-y-1 mt-1">
              {conflicts.map((c, i) => (
                <li key={i}>{c.message} (Target: {c.target})</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 4. Statistics Dashboard Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Clock className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Jadwal Aktif</span>
            <span className="text-lg font-black text-slate-800">{schedules.length} Sesi</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kalender Kerja</span>
            <span className="text-lg font-black text-slate-800">{calendars.length} Kalender</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-2">
          <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
            <Gift className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Libur Nasional</span>
            <span className="text-lg font-black text-slate-800">{holidays.length} Hari</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pengecualian / Override</span>
            <span className="text-lg font-black text-slate-800">{overrides.length} Aturan</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-2 col-span-2 lg:col-span-1">
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Users className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tugas Khusus</span>
            <span className="text-lg font-black text-slate-800">{assignments.length} Pemetaan</span>
          </div>
        </div>
      </div>

      {/* 5. Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-1 font-sans text-xs">
        {[
          { id: 'schedules', label: 'Jadwal & Shift', icon: Clock },
          { id: 'calendars', label: 'Hari Kerja', icon: Calendar },
          { id: 'holidays', label: 'Hari Libur', icon: Gift },
          { id: 'overrides', label: 'Override Kalender', icon: Sparkles },
          { id: 'assignments', label: 'Pemetaan Pengguna', icon: Users },
          { id: 'tester', label: 'Simulator Dinamis', icon: Sliders }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id 
                  ? 'border-emerald-600 text-emerald-700' 
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 6. Tabs Content Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT & CENTER CONTAINER: LISTS / VIEW (2 COLS) */}
        <div className="xl:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col gap-4">
          
          {/* A. schedules Tab */}
          {activeTab === 'schedules' && (
            <div className="flex flex-col gap-4">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Daftar Jadwal Kerja & Jam Belajar</h3>
                  <p className="text-[10px] text-slate-500">Seluruh konfigurasi jam masuk, pulang, toleransi keterlambatan, dan jendela waktu check-in/out.</p>
                </div>
              </div>

              {schedules.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Clock className="w-8 h-8" />
                  <span className="text-xs font-bold">Belum ada Jadwal Kerja yang terdaftar di database.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {schedules.map((s) => (
                    <div key={s.id} className="border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden bg-slate-50/50">
                      <div className="absolute right-0 top-0 text-[9px] font-mono px-2 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-bl-xl uppercase">
                        {s.type}
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-bold text-slate-800 pr-12 leading-tight">{s.name}</span>
                        
                        <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-[10px] text-slate-600 bg-white p-2 rounded-xl border border-slate-100">
                          <div>Masuk: <b className="text-slate-800">{s.start_time}</b></div>
                          <div>Pulang: <b className="text-slate-800">{s.end_time}</b></div>
                          <div>Toleransi: <b className="text-amber-700">{s.grace_period} menit</b></div>
                          <div>Status: <b className={s.active ? 'text-emerald-700' : 'text-slate-400'}>{s.active ? 'AKTIF' : 'NONAKTIF'}</b></div>
                        </div>

                        <div className="mt-2 text-[10px] text-slate-500 leading-relaxed bg-amber-50/50 p-2 rounded-xl border border-amber-100/30">
                          <div>Window In: <span className="font-mono">{s.checkin_open || '-'}</span> s.d. <span className="font-mono">{s.checkin_close || '-'}</span></div>
                          <div>Window Out: <span className="font-mono">{s.checkout_open || '-'}</span> s.d. <span className="font-mono">{s.checkout_close || '-'}</span></div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 mt-4 border-t border-slate-150 pt-3">
                        <button 
                          onClick={() => handleDeleteSchedule(s.id)}
                          className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-all"
                          title="Hapus Jadwal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* B. Calendars Tab */}
          {activeTab === 'calendars' && (
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Kalender Kerja & Hari Kerja Aktif</h3>
                <p className="text-[10px] text-slate-500">Atur pengelompokan hari kerja yang berlaku untuk masing-masing peranan civitas secara terpusat.</p>
              </div>

              <div className="space-y-4">
                {calendars.map((c) => {
                  const daysList = JSON.parse(c.working_days || '[]');
                  return (
                    <div key={c.id} className="border border-slate-200 rounded-2xl p-4 flex flex-col gap-3 bg-slate-50/40">
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800">{c.name}</span>
                          <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider">{c.type}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${c.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                          {c.active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {indonesianDays.map((d) => {
                          const isWorking = daysList.includes(d);
                          return (
                            <span 
                              key={d}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                                isWorking 
                                  ? 'bg-emerald-600 text-white shadow-sm' 
                                  : 'bg-slate-100 text-slate-400 border border-slate-200/50'
                              }`}
                            >
                              {d}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* C. Holidays Tab */}
          {activeTab === 'holidays' && (
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Hari Libur Organisasi & Kalender Akademik</h3>
                <p className="text-[10px] text-slate-500">Mencegah kalkulasi keterlambatan atau ketidakhadiran (Alpa) otomatis pada tanggal libur resmi.</p>
              </div>

              {holidays.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl text-slate-400">
                  Belum ada pengecualian hari libur yang terdaftar.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {holidays.map((h) => (
                    <div key={h.id} className="py-3 flex justify-between items-center text-xs">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-800">{h.name}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(h.date_start).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                          {h.date_end && ` s.d. ${new Date(h.date_end).toLocaleDateString('id-ID', { dateStyle: 'long' })}`}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold bg-violet-100 text-violet-800 px-2.5 py-1 rounded-lg uppercase">
                        {h.type}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* D. Overrides Tab */}
          {activeTab === 'overrides' && (
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Pengecualian Jadwal Khusus (Calendar Override)</h3>
                <p className="text-[10px] text-slate-500">Atur perubahan shift insidental (misalnya: pengurangan jam belajar saat Ramadhan, Ujian Tengah Semester, dll).</p>
              </div>

              {overrides.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl text-slate-400">
                  Belum ada pengecualian jadwal khusus yang dibuat.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {overrides.map((ov) => (
                    <div key={ov.id} className="py-3 flex justify-between items-center text-xs">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-800">{ov.name || 'Override Jadwal'}</span>
                        <span className="text-[10px] text-slate-500">
                          Tanggal: {new Date(ov.date).toLocaleDateString('id-ID', { dateStyle: 'long' })} | Target: <b className="text-slate-700">{ov.target_type} ({ov.target_id})</b>
                        </span>
                      </div>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-lg">
                        {ov.schedule_id ? `ID Jadwal: ${ov.schedule_id.substring(0, 8)}` : 'HARI LIBUR'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* E. Assignments Tab */}
          {activeTab === 'assignments' && (
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Pemetaan Multi-level Target & Jadwal</h3>
                <p className="text-[10px] text-slate-500">Petakan Jadwal Kerja / Jam Belajar ke perorangan, peranan (role), kelas (rombel), atau unit organisasi sekolah.</p>
              </div>

              {assignments.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl text-slate-400">
                  Belum ada jadwal yang dipetakan ke civitas sekolah.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {assignments.map((asm) => {
                    const sched = schedules.find(s => s.id === asm.schedule_id);
                    return (
                      <div key={asm.id} className="py-3 flex justify-between items-center text-xs">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-slate-800">
                            Target: <b className="text-emerald-700">{asm.target_type}</b> ({asm.target_id})
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Jadwal: {sched ? sched.name : 'Unknown Schedule ID: ' + asm.schedule_id}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-lg">
                            Prioritas: {asm.priority}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* F. Tester Simulator Tab */}
          {activeTab === 'tester' && (
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Simulator Evaluasi Jadwal Dinamis</h3>
                <p className="text-[10px] text-slate-500 font-mono">Backend Engine Live Tester. Masukkan kriteria pencarian di panel samping untuk mengevaluasi status kalender kerja secara instan.</p>
              </div>

              {testerResult ? (
                <div className="border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${testerResult.isWorkingDay ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {testerResult.isWorkingDay ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800">
                        {testerResult.isWorkingDay ? 'HARI KERJA AKTIF' : 'HARI LIBUR / OFF-DAY'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Sumber Keputusan: <b className="text-slate-800">{testerResult.source}</b>
                      </span>
                    </div>
                  </div>

                  {testerResult.isHoliday && (
                    <div className="p-3 rounded-xl bg-violet-50 border border-violet-200 text-xs text-violet-800">
                      <b>Keterangan Hari Libur Nasional:</b> {testerResult.holidayName}
                    </div>
                  )}

                  {testerResult.schedule ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div className="bg-white p-4 rounded-xl border border-slate-150 flex flex-col gap-1.5 text-xs">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Detail Sesi Jadwal</span>
                        <div className="font-bold text-slate-800 text-sm">{testerResult.schedule.name}</div>
                        <div>Tipe: <span className="font-mono text-emerald-700 font-bold">{testerResult.schedule.type}</span></div>
                        <div>Toleransi Keterlambatan: <span className="font-mono font-bold text-amber-700">{testerResult.schedule.grace_period} menit</span></div>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-slate-150 flex flex-col gap-1 text-xs leading-relaxed font-mono text-[11px]">
                        <span className="text-[10px] font-sans font-bold text-slate-400 uppercase">Jendela Waktu Check-In / Out</span>
                        <div>Jam Masuk: <b className="text-slate-800">{testerResult.schedule.start_time}</b></div>
                        <div>Jam Pulang: <b className="text-slate-800">{testerResult.schedule.end_time}</b></div>
                        <div>Window Masuk: <span className="text-emerald-700">{testerResult.schedule.checkin_open || '-'} s.d. {testerResult.schedule.checkin_close || '-'}</span></div>
                        <div>Window Pulang: <span className="text-indigo-700">{testerResult.schedule.checkout_open || '-'} s.d. {testerResult.schedule.checkout_close || '-'}</span></div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic p-4 text-center border border-dashed border-slate-200 rounded-xl bg-white">
                      Tidak ada detail sesi kerja yang aktif di tanggal ini (Weekend/Holiday/Off).
                    </div>
                  )}

                  {testerResult.conflictMessage && (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{testerResult.conflictMessage}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
                  <Sliders className="w-8 h-8" />
                  <span>Tekan "Kalkulasi Evaluasi" di panel samping untuk mensimulasikan pencarian jadwal dinamis.</span>
                </div>
              )}
            </div>
          )}

        </div>

        {/* RIGHT CONTAINER: DYNAMIC FORM PANEL (1 COL) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col gap-4">
          
          {/* A. Create Schedule Form */}
          {activeTab === 'schedules' && (
            <form onSubmit={handleCreateSchedule} className="space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Tambah Jadwal Kerja</h4>
                <p className="text-[10px] text-slate-500 leading-normal">Buat sesi jadwal atau shift belajar/kerja baru ke database.</p>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-600">Nama Sesi Jadwal</label>
                <input 
                  type="text"
                  placeholder="e.g. Regular Staff SMA"
                  value={scheduleForm.name}
                  onChange={(e) => setScheduleForm(p => ({ ...p, name: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-600">Tipe Jadwal</label>
                  <select 
                    value={scheduleForm.type}
                    onChange={(e) => setScheduleForm(p => ({ ...p, type: e.target.value }))}
                    className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold"
                  >
                    <option value="REGULAR">REGULAR</option>
                    <option value="SHIFT">SHIFT</option>
                    <option value="STUDENT">STUDENT</option>
                    <option value="SECURITY">SECURITY</option>
                    <option value="CUSTOM">CUSTOM</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-600">Toleransi (Menit)</label>
                  <input 
                    type="number"
                    value={scheduleForm.grace_period}
                    onChange={(e) => setScheduleForm(p => ({ ...p, grace_period: e.target.value }))}
                    className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold font-mono"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="flex flex-col gap-1 font-sans">
                  <label className="font-bold text-slate-600 font-sans">Jam Masuk (Start)</label>
                  <input 
                    type="text"
                    placeholder="07:30"
                    value={scheduleForm.start_time}
                    onChange={(e) => setScheduleForm(p => ({ ...p, start_time: e.target.value }))}
                    className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold font-mono"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1 font-sans">
                  <label className="font-bold text-slate-600 font-sans">Jam Pulang (End)</label>
                  <input 
                    type="text"
                    placeholder="15:30"
                    value={scheduleForm.end_time}
                    onChange={(e) => setScheduleForm(p => ({ ...p, end_time: e.target.value }))}
                    className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold font-mono"
                    required
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <h5 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-2">Check-in Windows (Batasan Waktu)</h5>
                
                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-600">Checkin Buka</label>
                    <input 
                      type="text"
                      placeholder="06:00"
                      value={scheduleForm.checkin_open}
                      onChange={(e) => setScheduleForm(p => ({ ...p, checkin_open: e.target.value }))}
                      className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-600">Checkin Tutup</label>
                    <input 
                      type="text"
                      placeholder="09:00"
                      value={scheduleForm.checkin_close}
                      onChange={(e) => setScheduleForm(p => ({ ...p, checkin_close: e.target.value }))}
                      className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-600">Checkout Buka</label>
                    <input 
                      type="text"
                      placeholder="15:00"
                      value={scheduleForm.checkout_open}
                      onChange={(e) => setScheduleForm(p => ({ ...p, checkout_open: e.target.value }))}
                      className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-600">Checkout Tutup</label>
                    <input 
                      type="text"
                      placeholder="18:00"
                      value={scheduleForm.checkout_close}
                      onChange={(e) => setScheduleForm(p => ({ ...p, checkout_close: e.target.value }))}
                      className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold font-mono"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl transition-all font-bold mt-2"
              >
                Simpan Sesi Jadwal
              </button>
            </form>
          )}

          {/* B. Create Working Calendar Form */}
          {activeTab === 'calendars' && (
            <form onSubmit={handleCreateCalendar} className="space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Konfigurasi Hari Kerja</h4>
                <p className="text-[10px] text-slate-500 leading-normal">Definisikan hari operasional kerja aktif untuk tenant saat ini.</p>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-600">Nama Kalender Kerja</label>
                <input 
                  type="text"
                  placeholder="e.g. Kalender Akademik Santri"
                  value={calendarForm.name}
                  onChange={(e) => setCalendarForm(p => ({ ...p, name: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-600">Kategori Peranan</label>
                <select 
                  value={calendarForm.type}
                  onChange={(e) => setCalendarForm(p => ({ ...p, type: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold"
                >
                  <option value="ACADEMIC">ACADEMIC (GURU)</option>
                  <option value="EMPLOYEE">EMPLOYEE (PEGAWAI)</option>
                  <option value="STUDENT">STUDENT (SANTRI/SISWA)</option>
                  <option value="SECURITY">SECURITY (SATPAM/SHIFT)</option>
                  <option value="CUSTOM">CUSTOM</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-600">Pilih Hari Kerja</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {indonesianDays.map((day) => {
                    const selected = calendarForm.working_days.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => {
                          setCalendarForm(p => {
                            const exist = p.working_days.includes(day);
                            const updated = exist 
                              ? p.working_days.filter(d => d !== day)
                              : [...p.working_days, day];
                            return { ...p, working_days: updated };
                          });
                        }}
                        className={`p-2 rounded-xl text-center font-bold transition-all border ${
                          selected 
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm' 
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl transition-all font-bold mt-2"
              >
                Buat Kalender Kerja
              </button>
            </form>
          )}

          {/* C. Create Holiday Form */}
          {activeTab === 'holidays' && (
            <form onSubmit={handleCreateHoliday} className="space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Tambah Hari Libur Resmi</h4>
                <p className="text-[10px] text-slate-500 leading-normal">Definisikan tanggal libur nasional atau libur khusus pesantren/madrasah.</p>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-600">Nama Hari Libur</label>
                <input 
                  type="text"
                  placeholder="e.g. Hari Raya Idul Fitri"
                  value={holidayForm.name}
                  onChange={(e) => setHolidayForm(p => ({ ...p, name: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-600">Mulai Tanggal</label>
                  <input 
                    type="date"
                    value={holidayForm.date_start}
                    onChange={(e) => setHolidayForm(p => ({ ...p, date_start: e.target.value }))}
                    className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold font-mono"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-600">Selesai Tanggal (Optional)</label>
                  <input 
                    type="date"
                    value={holidayForm.date_end}
                    onChange={(e) => setHolidayForm(p => ({ ...p, date_end: e.target.value }))}
                    className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-600">Kategori Libur</label>
                <select 
                  value={holidayForm.type}
                  onChange={(e) => setHolidayForm(p => ({ ...p, type: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold"
                >
                  <option value="NATIONAL">NATIONAL (Libur Nasional)</option>
                  <option value="ORGANIZATION">ORGANIZATION (Pemerintah/Global)</option>
                  <option value="UNIT">UNIT (Hanya Unit Tertentu)</option>
                  <option value="ACADEMIC">ACADEMIC (Hanya Libur Sekolah)</option>
                  <option value="CUSTOM">CUSTOM</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-600">Terapkan pada Kalender Kerja</label>
                <select 
                  value={holidayForm.calendar_id}
                  onChange={(e) => setHolidayForm(p => ({ ...p, calendar_id: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold"
                >
                  <option value="">Semua Kalender (Global Default)</option>
                  {calendars.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-600">Deskripsi / Keterangan</label>
                <textarea 
                  rows={2}
                  placeholder="e.g. Libur Lebaran bersama keluarga."
                  value={holidayForm.description}
                  onChange={(e) => setHolidayForm(p => ({ ...p, description: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl transition-all font-bold mt-2"
              >
                Simpan Hari Libur
              </button>
            </form>
          )}

          {/* D. Create Override Form */}
          {activeTab === 'overrides' && (
            <form onSubmit={handleCreateOverride} className="space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Override Sesi Kerja</h4>
                <p className="text-[10px] text-slate-500 leading-normal">Override kalender khusus untuk target tertentu di tanggal khusus.</p>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-600">Alasan Override / Keterangan</label>
                <input 
                  type="text"
                  placeholder="e.g. Jam Singkat Ramadhan"
                  value={overrideForm.name}
                  onChange={(e) => setOverrideForm(p => ({ ...p, name: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-600">Tipe Target</label>
                  <select 
                    value={overrideForm.target_type}
                    onChange={(e) => setOverrideForm(p => ({ ...p, target_type: e.target.value }))}
                    className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold"
                  >
                    <option value="PERSON">PERSON (Individu)</option>
                    <option value="ROLE">ROLE (Peranan)</option>
                    <option value="ROMBEL">ROMBEL (Rombongan Belajar)</option>
                    <option value="UNIT">UNIT (Madrasah / Kampus)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-600">ID / Kode Target</label>
                  <input 
                    type="text"
                    placeholder="e.g. std-1, GURU, XII-A"
                    value={overrideForm.target_id}
                    onChange={(e) => setOverrideForm(p => ({ ...p, target_id: e.target.value }))}
                    className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-600">Tanggal Pengecualian</label>
                  <input 
                    type="date"
                    value={overrideForm.date}
                    onChange={(e) => setOverrideForm(p => ({ ...p, date: e.target.value }))}
                    className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold font-mono"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-600">Jadwal Alternatif</label>
                  <select 
                    value={overrideForm.schedule_id}
                    onChange={(e) => setOverrideForm(p => ({ ...p, schedule_id: e.target.value }))}
                    className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold"
                  >
                    <option value="">LIBUR TOTAL (Off Day Override)</option>
                    {schedules.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.start_time})</option>
                    ))}
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl transition-all font-bold mt-2"
              >
                Pasang Override Jadwal
              </button>
            </form>
          )}

          {/* E. Create Assignment Form */}
          {activeTab === 'assignments' && (
            <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Petakan Target Baru</h4>
                <p className="text-[10px] text-slate-500 leading-normal">Pasangkan Sesi Jadwal / Shift ke target kelompok civitas.</p>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-600">Pilih Jadwal Sesi</label>
                <select 
                  value={assignmentForm.schedule_id}
                  onChange={(e) => setAssignmentForm(p => ({ ...p, schedule_id: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold"
                  required
                >
                  <option value="">-- Pilih Jadwal Kerja --</option>
                  {schedules.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.start_time})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-600">Tipe Target</label>
                  <select 
                    value={assignmentForm.target_type}
                    onChange={(e) => setAssignmentForm(p => ({ ...p, target_type: e.target.value }))}
                    className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold"
                  >
                    <option value="ROLE">ROLE (GURU, SANTRI, dll)</option>
                    <option value="PERSON">PERSON (Individu)</option>
                    <option value="ROMBEL">ROMBEL (Rombel/Kelas)</option>
                    <option value="UNIT">UNIT (Madrasah/Kampus)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-600">Nilai / ID Target</label>
                  <input 
                    type="text"
                    placeholder="e.g. GURU, std-1, XII-A"
                    value={assignmentForm.target_id}
                    onChange={(e) => setAssignmentForm(p => ({ ...p, target_id: e.target.value }))}
                    className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-600">Tingkat Prioritas Evaluasi</label>
                <select 
                  value={assignmentForm.priority}
                  onChange={(e) => setAssignmentForm(p => ({ ...p, priority: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold"
                >
                  <option value="1">1 - Default Organisasi (Tingkat Paling Rendah)</option>
                  <option value="2">2 - Tingkat Unit Kampus</option>
                  <option value="3">3 - Tingkat Rombel/Kelas</option>
                  <option value="4">4 - Tingkat Peranan / Shift</option>
                  <option value="5">5 - Tingkat Personal Individu (Tingkat Paling Tinggi)</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl transition-all font-bold mt-2"
              >
                Petakan Tugas Jadwal
              </button>
            </form>
          )}

          {/* F. Tester Simulator Panel Sidebar */}
          {activeTab === 'tester' && (
            <form onSubmit={handleTestEvaluation} className="space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Parameter Simulator</h4>
                <p className="text-[10px] text-slate-500 leading-normal">Definisikan parameter untuk menguji logika kalender kerja dinamis di backend.</p>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-600">Personal ID</label>
                <input 
                  type="text"
                  value={testerForm.userId}
                  onChange={(e) => setTesterForm(p => ({ ...p, userId: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-600">Peranan (Role)</label>
                  <select 
                    value={testerForm.role}
                    onChange={(e) => setTesterForm(p => ({ ...p, role: e.target.value }))}
                    className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold"
                  >
                    {roleList.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-600">Kelas / Rombel</label>
                  <input 
                    type="text"
                    value={testerForm.rombelId}
                    onChange={(e) => setTesterForm(p => ({ ...p, rombelId: e.target.value }))}
                    className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-600">Unit Organisasi</label>
                  <input 
                    type="text"
                    value={testerForm.unitId}
                    onChange={(e) => setTesterForm(p => ({ ...p, unitId: e.target.value }))}
                    className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-600">Tanggal Pengujian</label>
                  <input 
                    type="date"
                    value={testerForm.date}
                    onChange={(e) => setTesterForm(p => ({ ...p, date: e.target.value }))}
                    className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold font-mono"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl transition-all font-bold mt-2"
              >
                Kalkulasi Evaluasi
              </button>
            </form>
          )}

        </div>

      </div>

    </div>
  );
}
