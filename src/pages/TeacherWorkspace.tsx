import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Sparkles, BookOpen, Clock, Calendar, Users, GraduationCap,
  ChevronRight, ChevronLeft, Grid, FileText, CheckCircle2, AlertCircle, Award, ShieldCheck, Heart,
  BarChart3, RefreshCw
} from 'lucide-react';
import { Student, Schedule, AttendanceRecord, JournalRecord, LessonPlan, GradeRecord } from '../types/teacher';

// Import modular components
import TeacherDashboard from '../components/teacher/TeacherDashboard';
import TeacherAttendance from '../components/teacher/TeacherAttendance';
import TeacherLessons from '../components/teacher/TeacherLessons';
import TeacherAssessments from '../components/teacher/TeacherAssessments';
import TeacherKarakter from '../components/teacher/TeacherKarakter';
import TeacherFinalReports from '../components/teacher/TeacherFinalReports';
import EnterpriseAcademicEngine from '../components/EnterpriseAcademicEngine';

// Group tab domains for side navigation
interface TabGroup {
  id: string;
  title: string;
  items: { id: string; label: string; icon: any }[];
}

export default function TeacherWorkspace() {
  const { user } = useAuth();
  const teacherName = user?.name || 'Ahmad Ghozali, S.Pd.';

  // Initial Data Mock (Single Source of Truth)
  const [students, setStudents] = useState<Student[]>([
    { id: 'std-1', nis: '102401', nisn: '0081234567', name: 'Farhan Ramadhan', gender: 'L', classroom_id: 'cl-1', status: 'AKTIF', is_santri: false },
    { id: 'std-2', nis: '102402', nisn: '0087654321', name: 'Laila Fitriani', gender: 'P', classroom_id: 'cl-1', status: 'AKTIF', is_santri: false },
    { id: 'std-3', nis: '102305', nisn: '0071112223', name: 'Rizky Pratama', gender: 'L', classroom_id: 'cl-1', status: 'AKTIF', is_santri: false },
    { id: 'std-4', nis: '202401', nisn: '0098889991', name: 'Zaid Al-Khair', gender: 'L', classroom_id: 'cl-1', status: 'AKTIF', is_santri: true },
    { id: 'std-5', nis: '202402', nisn: '0098889992', name: 'Aisyah Humaira', gender: 'P', classroom_id: 'cl-1', status: 'AKTIF', is_santri: true }
  ]);

  const [schedules] = useState<Schedule[]>([
    { id: 'sch-1', classroom_id: 'cl-1', course_id: 'crs-2', teacher_id: 'tch-1', day: 'SENIN', start_time: '07:30', end_time: '09:00' },
    { id: 'sch-2', classroom_id: 'cl-3', course_id: 'crs-3', teacher_id: 'tch-3', day: 'SELASA', start_time: '08:00', end_time: '09:30' }
  ]);

  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([
    { studentId: 'std-1', name: 'Farhan Ramadhan', nis: '102401', gender: 'L', status: 'HADIR', notes: '' },
    { studentId: 'std-2', name: 'Laila Fitriani', nis: '102402', gender: 'P', status: 'HADIR', notes: '' },
    { studentId: 'std-3', name: 'Rizky Pratama', nis: '102305', gender: 'L', status: 'SAKIT', notes: 'Demam tinggi' },
    { studentId: 'std-4', name: 'Zaid Al-Khair', nis: '202401', gender: 'L', status: 'HADIR', notes: '' },
    { studentId: 'std-5', name: 'Aisyah Humaira', nis: '202402', gender: 'P', status: 'IZIN', notes: 'Acara keluarga' }
  ]);

  const [journals, setJournals] = useState<JournalRecord[]>([
    { id: 'j-1', date: '2026-07-02', classId: 'cl-1', className: 'X MIPA 1', subjectName: 'Fisika', topic: 'Hukum Newton I (Inersia) & Eksperimen koin jatuh', hours: '1-2', challenges: 'Siswa di baris belakang agak bising', solutions: 'Posisi duduk diselingi siswa berprestasi', status: 'Terverifikasi' },
    { id: 'j-2', date: '2026-07-01', classId: 'cl-1', className: 'X MIPA 1', subjectName: 'Fisika', topic: 'Pengenalan Besaran & Satuan Fisis', hours: '1-2', challenges: '', solutions: '', status: 'Terverifikasi' }
  ]);

  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([
    { id: 'lp-1', topic: 'Hukum Newton I & II (Dinamika Partikel)', classId: 'cl-1', duration: 90, objectives: ['Siswa mampu menjabarkan rumus gaya fisis', 'Siswa mampu melakukan demonstrasi inersia koin'], activities: ['Apersepsi (15m)', 'Eksperimen koin (45m)', 'Diskusi (30m)'], assessments: 'Asesmen Formatif (LKPD)', p3_dimensions: ['Bernalar Kritis', 'Mandiri'] }
  ]);

  const [gradesList, setGradesList] = useState<GradeRecord[]>([
    { studentId: 'std-1', name: 'Farhan Ramadhan', formative1: 85, formative2: 88, summative: 82, pts: 80, pas: 85, praktik: 90, p5_status: 'BSH', sikap_spiritual: 'Sangat Baik', sikap_sosial: 'Baik', ekskul_name: 'Pramuka', ekskul_grade: 'A', ekskul_notes: 'Aktif memimpin regu penjelajah', catatan: 'Pertahankan kegigihan belajarmu yang luar biasa.' } as any,
    { studentId: 'std-2', name: 'Laila Fitriani', formative1: 90, formative2: 92, summative: 88, pts: 85, pas: 90, praktik: 92, p5_status: 'SB', sikap_spiritual: 'Sangat Baik', sikap_sosial: 'Sangat Baik', ekskul_name: 'PMR', ekskul_grade: 'A', ekskul_notes: 'Tanggap melakukan pertolongan pertama', catatan: 'Prestasi akademik dan adab perilaku sangat membanggakan.' } as any,
    { studentId: 'std-3', name: 'Rizky Pratama', formative1: 75, formative2: 78, summative: 74, pts: 70, pas: 72, praktik: 75, p5_status: 'MB', sikap_spiritual: 'Baik', sikap_sosial: 'Baik', ekskul_name: 'Karya Ilmiah', ekskul_grade: 'B', ekskul_notes: 'Menunjukkan kreativitas yang baik', catatan: 'Tingkatkan kedisiplinan mengumpulkan tugas mandiri.' } as any,
    { studentId: 'std-4', name: 'Zaid Al-Khair', formative1: 80, formative2: 82, summative: 78, pts: 75, pas: 80, praktik: 82, p5_status: 'BSH', sikap_spiritual: 'Sangat Baik', sikap_sosial: 'Baik', ekskul_name: 'Seni Kaligrafi', ekskul_grade: 'A', ekskul_notes: 'Karya goresan khat naskhi sangat rapi', catatan: 'Sangat aktif di kegiatan halaqah tahfidzul qur\'an.' } as any,
    { studentId: 'std-5', name: 'Aisyah Humaira', formative1: 88, formative2: 85, summative: 84, pts: 82, pas: 86, praktik: 88, p5_status: 'BSH', sikap_spiritual: 'Sangat Baik', sikap_sosial: 'Sangat Baik', ekskul_name: 'Panahan', ekskul_grade: 'A', ekskul_notes: 'Menunjukkan fokus dan konsentrasi tinggi', catatan: 'Adab kesopanan sangat baik dan menjadi teladan.' } as any
  ]);

  // Active Tab layout management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const tabGroups: TabGroup[] = [
    {
      id: 'mengajar',
      title: 'Dashboard & Mengajar',
      items: [
        { id: 'dashboard', label: 'Dashboard Guru', icon: GraduationCap },
        { id: 'KBM-aktif', label: 'KBM Saya (Konsol)', icon: BookOpen }
      ]
    },
    {
      id: 'kurikulum',
      title: 'Administrasi Kurikulum',
      items: [
        { id: 'administrasi', label: 'RPP & CP-ATP', icon: FileText }
      ]
    },
    {
      id: 'presensi',
      title: 'Presensi & Kehadiran',
      items: [
        { id: 'absensi', label: 'Absensi & Jurnal', icon: Clock }
      ]
    },
    {
      id: 'penilaian',
      title: 'Tugas & Penilaian',
      items: [
        { id: 'asesmen', label: 'Tugas, Kuis, & Nilai', icon: Award }
      ]
    },
    {
      id: 'pesantren',
      title: 'Karakter & Khusus',
      items: [
        { id: 'karakter', label: 'Tahfidz & Karakter', icon: Heart }
      ]
    },
    {
      id: 'rekap',
      title: 'Rekap & Rapor',
      items: [
        { id: 'rapor', label: 'Leger & Rapor', icon: BarChart3 }
      ]
    }
  ];

  const handleStartKbm = () => {
    setActiveTab('KBM-aktif');
  };

  const handleAddJournal = (newJ: Omit<JournalRecord, 'id' | 'status'>) => {
    setJournals(prev => [
      {
        ...newJ,
        id: `j-${Date.now()}`,
        status: 'Terverifikasi'
      },
      ...prev
    ]);
  };

  const handleAddLessonPlan = (newPlan: Omit<LessonPlan, 'id'>) => {
    setLessonPlans(prev => [
      {
        ...newPlan,
        id: `lp-${Date.now()}`
      },
      ...prev
    ]);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-120px)] bg-slate-50/20 p-1">
      
      {/* 1. LEFT SIDEBAR: Category navigation */}
      {sidebarOpen && (
        <div className="w-full lg:w-64 shrink-0 flex flex-col gap-4 animate-fade-in">
          
          {/* Active Class Indicator card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black">
                X
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-xs">Kelas X MIPA 1</h3>
                <span className="text-[10px] text-slate-400 font-mono">Fisika • Wali Kelas</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>TP 2025/2026</span>
              <span>Ganjil</span>
            </div>
          </div>

          {/* Categories Menu */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-5">
            {tabGroups.map((group) => (
              <div key={group.id} className="space-y-1.5">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block px-2">
                  {group.title}
                </span>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-bold transition-all text-left cursor-pointer ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="h-4 w-4 shrink-0" />
                          <span>{item.label}</span>
                        </div>
                        <ChevronRight className={`h-3 w-3 opacity-60 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. MAIN CENTER CONTAINER */}
      <div className="flex-1 min-w-0">
        
        {/* Quick Header Context */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black transition-all cursor-pointer shadow-xs shrink-0"
                title={sidebarOpen ? "Sembunyikan menu samping" : "Tampilkan menu samping"}
              >
                {sidebarOpen ? (
                  <>
                    <ChevronLeft className="h-3.5 w-3.5 text-blue-400" />
                    <span>Sembunyikan Menu</span>
                  </>
                ) : (
                  <>
                    <Grid className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                    <span>Tampilkan Menu</span>
                  </>
                )}
              </button>
              
              <span className="text-[9px] bg-blue-50 text-blue-600 font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">TEACHER ACADEMIC WORKSPACE</span>
              
              {!sidebarOpen && (
                <span className="text-[9px] bg-amber-50 text-amber-800 border border-amber-200/40 px-2 py-1 rounded-md font-bold animate-fade-in flex items-center gap-1">
                  <span className="h-1 w-1 rounded-full bg-amber-500 animate-ping" />
                  Mode Kerja Luas Aktif 🖥️
                </span>
              )}
            </div>
            <h1 className="text-lg font-black text-slate-800 mt-1.5">{teacherName}</h1>
            <p className="text-xs text-slate-400 mt-0.5">NIP: 19851010201001 • Spesialisasi: Fisika</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-right">
              <span className="text-[9px] text-slate-400 block uppercase">Jam Mengajar</span>
              <span className="text-xs font-bold text-slate-700">24 Jam / Pekan</span>
            </div>
          </div>
        </div>

        {/* Dynamic Inner Tab View dispatcher */}
        {activeTab === 'dashboard' && (
          <TeacherDashboard
            teacherName={teacherName}
            schedules={schedules}
            students={students}
            onStartKbm={handleStartKbm}
          />
        )}

        {activeTab === 'KBM-aktif' && (
          <TeacherLessons
            lessonPlans={lessonPlans}
            onAddLessonPlan={handleAddLessonPlan}
          />
        )}

        {activeTab === 'administrasi' && (
          <TeacherLessons
            lessonPlans={lessonPlans}
            onAddLessonPlan={handleAddLessonPlan}
          />
        )}

        {activeTab === 'absensi' && (
          <TeacherAttendance
            students={students}
            attendanceList={attendanceList}
            setAttendanceList={setAttendanceList}
            journals={journals}
            onAddJournal={handleAddJournal}
          />
        )}

        {activeTab === 'asesmen' && (
          <TeacherAssessments
            gradesList={gradesList}
            setGradesList={setGradesList}
          />
        )}

        {activeTab === 'karakter' && (
          <TeacherKarakter
            gradesList={gradesList}
            setGradesList={setGradesList}
          />
        )}

        {activeTab === 'rapor' && (
          <EnterpriseAcademicEngine />
        )}
      </div>
    </div>
  );
}
