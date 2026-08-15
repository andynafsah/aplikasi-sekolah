import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Edit, Trash2, Copy, Download, Upload, 
  ShieldCheck, Users, Layers, AlertCircle, RefreshCw, 
  Search, CheckCircle2, FileText, CheckSquare, Square, Save, X,
  GraduationCap, BookOpen, Clock, UserCheck, Grid, List, BarChart2,
  Filter, AlertTriangle, ChevronRight, Check, Info
} from 'lucide-react';
import apiClient from '../api/client';
import { useAuth } from '../contexts/AuthContext';

interface Assignment {
  id: string;
  teacher_id: string;
  teacher_name: string;
  teacher_nip: string;
  unit_id: string;
  academic_year_id: string;
  academic_year_name: string;
  semester_id: string;
  semester_name: string;
  class_id: string;
  class_name: string;
  subject_id: string | null;
  subject_name: string;
  assignment_type: string;
  is_homeroom: boolean;
  hours_per_week?: number;
  status: string;
}

export default function PlotingGuru() {
  const { user } = useAuth();
  
  // View Modes
  const [activeViewMode, setActiveViewMode] = useState<'list' | 'matrix' | 'workload'>('list');

  // Data lists
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeTab, setSelectedTypeTab] = useState('ALL');
  const [selectedUnitFilter, setSelectedUnitFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Modals
  const [modalType, setModalType] = useState<'add' | 'edit' | 'bulk' | 'copy' | 'import' | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  // Single Form State
  const [formData, setFormData] = useState({
    teacher_id: '',
    unit_id: 'SMA',
    academic_year_id: 'ay-current',
    semester_id: 'sem-current',
    class_id: '',
    subject_id: '',
    assignment_type: 'SUBJECT_TEACHER',
    is_homeroom: false,
    hours_per_week: 4,
    status: 'ACTIVE'
  });

  // Bulk Form State
  const [bulkData, setBulkData] = useState({
    teacher_ids: [] as string[],
    class_ids: [] as string[],
    subject_ids: [] as string[],
    unit_id: 'SMA',
    academic_year_id: 'ay-current',
    semester_id: 'sem-current',
    assignment_type: 'SUBJECT_TEACHER',
    hours_per_week: 4,
    status: 'ACTIVE'
  });

  // Copy Form State
  const [copyData, setCopyData] = useState({
    source_academic_year_id: 'ay-previous',
    target_academic_year_id: 'ay-current',
    source_semester_id: 'sem-current',
    target_semester_id: 'sem-even',
    type: 'YEAR' // 'YEAR' or 'SEMESTER'
  });

  // Import State
  const [importText, setImportText] = useState('');
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Ploting Guru Assignments
      const resAssignments = await apiClient.post('/api/action', { action: 'getTeacherAssignments' });
      if (resAssignments.data?.success) {
        setAssignments(resAssignments.data.data || []);
      }

      // 2. Fetch Teachers
      const resTeachers = await apiClient.post('/api/action', { action: 'getTeachers' });
      if (resTeachers.data?.success) {
        setTeachers(resTeachers.data.data || []);
      }

      // 3. Fetch Classes
      let loadedClasses: any[] = [];
      const resClasses = await apiClient.post('/api/action', { action: 'getClasses' });
      if (resClasses.data?.success && Array.isArray(resClasses.data.data) && resClasses.data.data.length > 0) {
        loadedClasses = resClasses.data.data;
      } else {
        const resClassrooms = await apiClient.post('/api/action', { action: 'getClassrooms' });
        if (resClassrooms.data?.success && Array.isArray(resClassrooms.data.data)) {
          loadedClasses = resClassrooms.data.data;
        }
      }
      if (loadedClasses.length === 0) {
        loadedClasses = [
          { id: 'cl-1', name: 'X MIPA 1', unit_id: 'SMA', level: '10' },
          { id: 'cl-2', name: 'XI MIPA 2', unit_id: 'SMA', level: '11' },
          { id: 'cl-3', name: 'VIII Tahfidz', unit_id: 'SMP', level: '8' },
          { id: 'cl-4', name: 'VII A', unit_id: 'SMP', level: '7' }
        ];
      }
      setClasses(loadedClasses);

      // 4. Fetch Subjects
      let loadedSubjects: any[] = [];
      const resSubjects = await apiClient.post('/api/action', { action: 'getSubjects' });
      if (resSubjects.data?.success && Array.isArray(resSubjects.data.data) && resSubjects.data.data.length > 0) {
        loadedSubjects = resSubjects.data.data;
      } else {
        const resCourses = await apiClient.post('/api/action', { action: 'getCourses' });
        if (resCourses.data?.success && Array.isArray(resCourses.data.data)) {
          loadedSubjects = resCourses.data.data;
        }
      }
      if (loadedSubjects.length === 0) {
        loadedSubjects = [
          { id: 'sub-1', name: 'Fisika Dasar', code: 'FIS-10', unit_id: 'SMA' },
          { id: 'sub-2', name: 'Matematika Peminatan', code: 'MTK-11', unit_id: 'SMA' },
          { id: 'sub-3', name: 'Tahfidz Al-Qur\'an 30 Juz', code: 'THF-30', unit_id: 'SMP' },
          { id: 'sub-4', name: 'Bahasa Inggris', code: 'BIG-07', unit_id: 'SMP' },
          { id: 'sub-5', name: 'Bahasa Arab & Nahwu', code: 'ARB-08', unit_id: 'SMP' }
        ];
      }
      setSubjects(loadedSubjects);

      // 5. Academic Years & Semesters
      setAcademicYears([
        { id: 'ay-current', name: '2025/2026' },
        { id: 'ay-previous', name: '2024/2025' }
      ]);
      setSemesters([
        { id: 'sem-current', name: 'Ganjil', academic_year_id: 'ay-current' },
        { id: 'sem-even', name: 'Genap', academic_year_id: 'ay-current' }
      ]);

    } catch (e: any) {
      setError('Gagal memuat data referensi ploting. Pastikan server online.');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // KPI Calculations
  const metrics = useMemo(() => {
    const active = assignments.filter(a => a.status === 'ACTIVE');
    const uniqueTeachers = new Set(active.map(a => a.teacher_id)).size;
    const homerooms = active.filter(a => a.is_homeroom || a.assignment_type === 'HOMEROOM').length;
    const totalHours = active.reduce((sum, a) => sum + (Number(a.hours_per_week) || 4), 0);

    return {
      totalActive: active.length,
      totalTeachers: uniqueTeachers,
      totalHomerooms: homerooms,
      totalHours
    };
  }, [assignments]);

  // Save or Update Assignment
  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.teacher_id || !formData.class_id || !formData.academic_year_id || !formData.semester_id) {
      alert('Mohon pilih Guru, Kelas, Tahun Ajaran, dan Semester!');
      return;
    }

    try {
      const action = modalType === 'edit' ? 'updateTeacherAssignment' : 'createTeacherAssignment';
      const payload = modalType === 'edit' ? { id: selectedAssignment?.id, ...formData } : formData;

      const res = await apiClient.post('/api/action', { action, ...payload });
      if (res.data?.success) {
        showSuccess(res.data.message || 'Ploting guru berhasil disimpan!');
        setModalType(null);
        fetchData();
      } else {
        alert(res.data?.message || 'Gagal menyimpan ploting.');
      }
    } catch (err: any) {
      alert('Terjadi kesalahan koneksi saat menyimpan.');
    }
  };

  // Delete Assignment
  const handleDeleteAssignment = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus ploting guru ini?')) return;
    try {
      const res = await apiClient.post('/api/action', { action: 'deleteTeacherAssignment', id });
      if (res.data?.success) {
        showSuccess('Ploting berhasil dihapus!');
        fetchData();
      } else {
        alert(res.data?.message || 'Gagal menghapus.');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi saat menghapus.');
    }
  };

  // Quick Toggle Status
  const handleToggleStatus = async (item: Assignment) => {
    const newStatus = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await apiClient.post('/api/action', {
        action: 'updateTeacherAssignment',
        id: item.id,
        ...item,
        status: newStatus
      });
      if (res.data?.success) {
        showSuccess(`Status ploting ${item.teacher_name} diubah menjadi ${newStatus === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}`);
        fetchData();
      }
    } catch (err) {
      alert('Gagal mengubah status ploting.');
    }
  };

  // Bulk Assignment Submission
  const handleSaveBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkData.teacher_ids.length === 0 || bulkData.class_ids.length === 0 || !bulkData.academic_year_id || !bulkData.semester_id) {
      alert('Mohon pilih minimal 1 Guru, 1 Kelas, Tahun Ajaran, dan Semester!');
      return;
    }

    try {
      const res = await apiClient.post('/api/action', { 
        action: 'bulkAssignAssignments', 
        ...bulkData 
      });
      if (res.data?.success) {
        showSuccess(res.data.message || 'Bulk assignment berhasil!');
        setModalType(null);
        fetchData();
      } else {
        alert(res.data?.message || 'Gagal melakukan bulk assignment.');
      }
    } catch (err) {
      alert('Koneksi terganggu saat melakukan bulk assignment.');
    }
  };

  // Copy Ploting
  const handleCopyPloting = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let action = 'copyAssignmentsAcademicYear';
      let payload: any = {};

      if (copyData.type === 'YEAR') {
        action = 'copyAssignmentsAcademicYear';
        payload = {
          source_academic_year_id: copyData.source_academic_year_id,
          target_academic_year_id: copyData.target_academic_year_id
        };
      } else {
        action = 'cloneAssignmentsSemester';
        payload = {
          source_semester_id: copyData.source_semester_id,
          target_semester_id: copyData.target_semester_id
        };
      }

      const res = await apiClient.post('/api/action', { action, ...payload });
      if (res.data?.success) {
        showSuccess(res.data.message || 'Duplikasi ploting berhasil!');
        setModalType(null);
        fetchData();
      } else {
        alert(res.data?.message || 'Gagal menduplikasi ploting.');
      }
    } catch (err) {
      alert('Koneksi terganggu saat memproses duplikasi.');
    }
  };

  // CSV Import Parser
  const handleParseImport = () => {
    setImportError(null);
    if (!importText.trim()) {
      setImportError('Silakan masukkan teks CSV terlebih dahulu.');
      return;
    }

    const rows = importText.split('\n').map(r => r.trim()).filter(Boolean);
    const parsed: any[] = [];
    
    try {
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        if (cols.length < 5) continue;

        parsed.push({
          teacher_id: cols[0],
          unit_id: cols[1] || 'SMA',
          academic_year_id: cols[2] || 'ay-current',
          semester_id: cols[3] || 'sem-current',
          class_id: cols[4],
          subject_id: cols[5] || null,
          assignment_type: cols[6] || 'SUBJECT_TEACHER',
          hours_per_week: Number(cols[7]) || 4,
          status: 'ACTIVE'
        });
      }
      setImportPreview(parsed);
    } catch (e) {
      setImportError('Format CSV tidak valid. Gunakan format yang ditentukan.');
    }
  };

  const handleExecuteImport = async () => {
    if (importPreview.length === 0) return;
    try {
      const res = await apiClient.post('/api/action', {
        action: 'importTeacherAssignments',
        assignments: importPreview
      });

      if (res.data?.success) {
        showSuccess(res.data.message || 'Import data berhasil!');
        setModalType(null);
        setImportText('');
        setImportPreview([]);
        fetchData();
      } else {
        alert(res.data?.message || 'Gagal mengimpor data ploting.');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Terjadi kesalahan saat impor.');
    }
  };

  // Export Data to CSV
  const handleExportCSV = () => {
    if (assignments.length === 0) return;
    const headers = ['ID', 'Guru', 'NIP', 'Unit', 'Tahun Ajaran', 'Semester', 'Kelas', 'Mata Pelajaran', 'Tipe', 'Jam/Minggu', 'Status'];
    const rows = assignments.map(a => [
      a.id,
      a.teacher_name,
      a.teacher_nip,
      a.unit_id,
      a.academic_year_name,
      a.semester_name,
      a.class_name,
      a.subject_name,
      a.assignment_type,
      a.hours_per_week || 4,
      a.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ploting_guru_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter(item => {
      const matchesSearch = 
        (item.teacher_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.class_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.subject_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.teacher_nip || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = 
        selectedTypeTab === 'ALL' || 
        item.assignment_type === selectedTypeTab;

      const matchesUnit =
        selectedUnitFilter === 'ALL' ||
        item.unit_id === selectedUnitFilter;

      const matchesStatus =
        selectedStatusFilter === 'ALL' ||
        item.status === selectedStatusFilter;

      return matchesSearch && matchesType && matchesUnit && matchesStatus;
    });
  }, [assignments, searchTerm, selectedTypeTab, selectedUnitFilter, selectedStatusFilter]);

  // Matrix View Data Grouping (Class-centric)
  const classMatrixData = useMemo(() => {
    const classMap: Record<string, { className: string; unitId: string; homeroom?: Assignment; subjects: Assignment[] }> = {};

    classes.forEach(cl => {
      classMap[cl.id] = {
        className: cl.name,
        unitId: cl.unit_id || 'SMA',
        subjects: []
      };
    });

    assignments.forEach(a => {
      if (!a.class_id) return;
      if (!classMap[a.class_id]) {
        classMap[a.class_id] = {
          className: a.class_name || 'Kelas Lain',
          unitId: a.unit_id || 'SMA',
          subjects: []
        };
      }

      if (a.is_homeroom || a.assignment_type === 'HOMEROOM') {
        classMap[a.class_id].homeroom = a;
      } else {
        classMap[a.class_id].subjects.push(a);
      }
    });

    return Object.entries(classMap).map(([classId, data]) => ({ classId, ...data }));
  }, [classes, assignments]);

  // Workload View Data Grouping (Teacher-centric)
  const teacherWorkloadData = useMemo(() => {
    const teacherMap: Record<string, { teacherName: string; nip: string; assignments: Assignment[]; totalHours: number }> = {};

    teachers.forEach(t => {
      teacherMap[t.id] = {
        teacherName: t.name,
        nip: t.nip || '-',
        assignments: [],
        totalHours: 0
      };
    });

    assignments.forEach(a => {
      if (!a.teacher_id) return;
      if (!teacherMap[a.teacher_id]) {
        teacherMap[a.teacher_id] = {
          teacherName: a.teacher_name || 'Guru',
          nip: a.teacher_nip || '-',
          assignments: [],
          totalHours: 0
        };
      }
      teacherMap[a.teacher_id].assignments.push(a);
      teacherMap[a.teacher_id].totalHours += Number(a.hours_per_week) || 4;
    });

    return Object.entries(teacherMap)
      .map(([teacherId, data]) => ({ teacherId, ...data }))
      .filter(t => t.assignments.length > 0 || teachers.length < 10);
  }, [teachers, assignments]);

  const openAddModal = (defaultClassId?: string) => {
    const firstTeacher = teachers[0]?.id || '';
    const firstClass = defaultClassId || classes[0]?.id || '';

    setFormData({
      teacher_id: firstTeacher,
      unit_id: 'SMA',
      academic_year_id: academicYears[0]?.id || 'ay-current',
      semester_id: semesters[0]?.id || 'sem-current',
      class_id: firstClass,
      subject_id: subjects[0]?.id || '',
      assignment_type: 'SUBJECT_TEACHER',
      is_homeroom: false,
      hours_per_week: 4,
      status: 'ACTIVE'
    });
    setModalType('add');
  };

  const openEditModal = (item: Assignment) => {
    setSelectedAssignment(item);
    setFormData({
      teacher_id: item.teacher_id,
      unit_id: item.unit_id || 'SMA',
      academic_year_id: item.academic_year_id || 'ay-current',
      semester_id: item.semester_id || 'sem-current',
      class_id: item.class_id,
      subject_id: item.subject_id || '',
      assignment_type: item.assignment_type || 'SUBJECT_TEACHER',
      is_homeroom: item.is_homeroom || item.assignment_type === 'HOMEROOM',
      hours_per_week: item.hours_per_week || 4,
      status: item.status || 'ACTIVE'
    });
    setModalType('edit');
  };

  const toggleBulkSelection = (id: string, type: 'teacher' | 'class' | 'subject') => {
    setBulkData(prev => {
      const arrName = type === 'teacher' ? 'teacher_ids' : type === 'class' ? 'class_ids' : 'subject_ids';
      const exists = prev[arrName].includes(id);
      const newArr = exists 
        ? prev[arrName].filter(item => item !== id)
        : [...prev[arrName], id];
      return { ...prev, [arrName]: newArr };
    });
  };

  const selectAllBulk = (type: 'teacher' | 'class' | 'subject') => {
    if (type === 'teacher') {
      const allIds = teachers.map(t => t.id);
      setBulkData(prev => ({ ...prev, teacher_ids: prev.teacher_ids.length === allIds.length ? [] : allIds }));
    } else if (type === 'class') {
      const allIds = classes.map(c => c.id);
      setBulkData(prev => ({ ...prev, class_ids: prev.class_ids.length === allIds.length ? [] : allIds }));
    } else {
      const allIds = subjects.map(s => s.id);
      setBulkData(prev => ({ ...prev, subject_ids: prev.subject_ids.length === allIds.length ? [] : allIds }));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HEADER BANNER */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><ShieldCheck className="h-5 w-5" /></span>
            <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">Modul Kurikulum & SDM</span>
          </div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Ploting Guru, Mapel & Wali Kelas</h1>
          <p className="text-xs text-slate-500">Kelola pemetaan tugas mengajar, pembagian wali kelas, pembimbing tahfidz, serta pemenuhan jam Dapodik secara terpadu.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => openAddModal()}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Tambah Ploting
          </button>
          <button 
            onClick={() => {
              setBulkData({
                teacher_ids: [],
                class_ids: [],
                subject_ids: [],
                unit_id: 'SMA',
                academic_year_id: academicYears[0]?.id || 'ay-current',
                semester_id: semesters[0]?.id || 'sem-current',
                assignment_type: 'SUBJECT_TEACHER',
                hours_per_week: 4,
                status: 'ACTIVE'
              });
              setModalType('bulk');
            }}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Users className="h-4 w-4" />
            Bulk Assign
          </button>
          <button 
            onClick={() => setModalType('copy')}
            className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Copy className="h-4 w-4 text-slate-500" />
            Copy / Clone
          </button>
          <button 
            onClick={() => {
              setImportText('teacher_id,unit_id,academic_year_id,semester_id,class_id,subject_id,assignment_type,hours_per_week\ntch-seed-1,SMA,ay-current,sem-current,cl-1,sub-1,SUBJECT_TEACHER,4');
              setImportPreview([]);
              setModalType('import');
            }}
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            Import CSV
          </button>
          <button 
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            title="Ekspor Data ke CSV"
          >
            <Download className="h-4 w-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-3.5 rounded-2xl flex items-center gap-3 animate-fade-in shadow-xs">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold">{successMsg}</span>
        </div>
      )}

      {/* 2. STATS KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Penugasan</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Layers className="h-4 w-4" /></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">{metrics.totalActive}</span>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Aktif</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Guru Ter-ploting</span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><UserCheck className="h-4 w-4" /></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">{metrics.totalTeachers}</span>
            <span className="text-[10px] text-slate-400 font-medium">dari {teachers.length} Guru</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Wali Kelas Terisi</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl"><GraduationCap className="h-4 w-4" /></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">{metrics.totalHomerooms}</span>
            <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded">Rombel</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Jam / Minggu</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Clock className="h-4 w-4" /></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">{metrics.totalHours}</span>
            <span className="text-[10px] text-slate-400 font-medium">Jam Tatap Muka</span>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTROLS & DISPLAY PANEL */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-5">
        
        {/* Top Switch View Mode & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          
          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1 self-start">
            <button
              onClick={() => setActiveViewMode('list')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeViewMode === 'list' 
                  ? 'bg-white text-blue-700 shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              Tabel Penugasan
            </button>
            <button
              onClick={() => setActiveViewMode('matrix')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeViewMode === 'matrix' 
                  ? 'bg-white text-blue-700 shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="h-3.5 w-3.5" />
              Matriks per Kelas
            </button>
            <button
              onClick={() => setActiveViewMode('workload')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeViewMode === 'workload' 
                  ? 'bg-white text-blue-700 shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart2 className="h-3.5 w-3.5" />
              Beban Mengajar Guru
            </button>
          </div>

          {/* Quick Search & Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input 
                type="text"
                placeholder="Cari guru, kelas, mapel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-9 pr-3 text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
              />
            </div>

            <select
              value={selectedUnitFilter}
              onChange={(e) => setSelectedUnitFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="ALL">Semua Unit</option>
              <option value="SD">SD</option>
              <option value="SMP">SMP</option>
              <option value="SMA">SMA / MA</option>
              <option value="SMK">SMK</option>
            </select>

            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">Aktif</option>
              <option value="INACTIVE">Nonaktif</option>
            </select>
          </div>

        </div>

        {/* Type Category Tabs */}
        {activeViewMode === 'list' && (
          <div className="flex flex-wrap gap-1.5 bg-slate-50 border border-slate-200 p-1.5 rounded-2xl">
            {[
              { id: 'ALL', label: 'Semua Penugasan' },
              { id: 'SUBJECT_TEACHER', label: 'Guru Mapel' },
              { id: 'HOMEROOM', label: 'Wali Kelas' },
              { id: 'TAHFIDZ', label: 'Pembimbing Tahfidz' },
              { id: 'TEACHER', label: 'Guru Utama' },
              { id: 'EXTRACURRICULAR', label: 'Ekstrakurikuler' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTypeTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  selectedTypeTab === tab.id 
                    ? 'bg-blue-600 text-white shadow-2xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* =========================================================================
            VIEW MODE 1: LIST TABLE VIEW
            ========================================================================= */}
        {activeViewMode === 'list' && (
          loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="h-6 w-6 text-blue-600 animate-spin" />
              <span className="text-xs text-slate-400 font-mono">Memuat database ploting guru...</span>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <Layers className="h-10 w-10 mx-auto opacity-30 text-blue-500" />
              <p className="text-sm font-bold text-slate-600">Tidak ada data ploting guru ditemukan.</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Silakan ubah kata kunci pencarian, sesuaikan filter, atau klik tombol "Tambah Ploting" untuk mendaftarkan penugasan baru.
              </p>
              <button
                onClick={() => openAddModal()}
                className="mt-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                + Tambah Ploting Baru
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-150 rounded-2xl shadow-2xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-150 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Guru Pengampu</th>
                    <th className="py-3 px-4">Unit & Kelas</th>
                    <th className="py-3 px-4">Tahun / Semester</th>
                    <th className="py-3 px-4">Mata Pelajaran</th>
                    <th className="py-3 px-4">Tipe Tugas</th>
                    <th className="py-3 px-4 text-center">Beban Jam</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredAssignments.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-bold text-slate-900 block">{item.teacher_name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">NIP: {item.teacher_nip}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-extrabold">
                            {item.unit_id || 'SMA'}
                          </span>
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-800 rounded-md font-bold text-xs">
                            {item.class_name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-semibold text-slate-800 block">{item.academic_year_name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Semester {item.semester_name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">
                          {item.subject_name}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-wide border ${
                          item.assignment_type === 'HOMEROOM' || item.is_homeroom ? 'bg-amber-50 text-amber-800 border-amber-200' :
                          item.assignment_type === 'SUBJECT_TEACHER' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                          item.assignment_type === 'TAHFIDZ' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                          'bg-slate-50 text-slate-800 border-slate-200'
                        }`}>
                          {item.assignment_type === 'HOMEROOM' || item.is_homeroom ? 'WALI KELAS' :
                           item.assignment_type === 'SUBJECT_TEACHER' ? 'GURU MAPEL' :
                           item.assignment_type === 'TAHFIDZ' ? 'PEMBIMBING TAHFIDZ' :
                           item.assignment_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-md text-xs">
                          {item.hours_per_week || 4} Jam/Mgg
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full cursor-pointer transition-all ${
                            item.status === 'ACTIVE' 
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                          title="Klik untuk ubah status"
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${item.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {item.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button 
                            onClick={() => openEditModal(item)}
                            className="p-1.5 hover:bg-blue-50 rounded-lg text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                            title="Edit Ploting"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteAssignment(item.id)}
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Hapus Ploting"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* =========================================================================
            VIEW MODE 2: CLASS MATRIX VIEW
            ========================================================================= */}
        {activeViewMode === 'matrix' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {classMatrixData.map(cls => (
              <div key={cls.classId} className="bg-slate-50/60 border border-slate-200 rounded-2xl p-5 space-y-4 hover:border-blue-300 transition-all shadow-2xs flex flex-col justify-between">
                <div>
                  {/* Class Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg font-black text-xs">
                        {cls.unitId}
                      </span>
                      <h3 className="font-extrabold text-slate-800 text-sm">{cls.className}</h3>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold bg-white px-2 py-1 rounded-md border border-slate-200">
                      {cls.subjects.length + (cls.homeroom ? 1 : 0)} Pengampu
                    </span>
                  </div>

                  {/* Wali Kelas Section */}
                  <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1">
                    <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wide block">
                      Wali Kelas
                    </span>
                    {cls.homeroom ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{cls.homeroom.teacher_name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">NIP: {cls.homeroom.teacher_nip}</p>
                        </div>
                        <button
                          onClick={() => openEditModal(cls.homeroom!)}
                          className="p-1 hover:bg-amber-100 text-amber-800 rounded cursor-pointer"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-amber-700 text-xs italic">
                        <span>Belum Ditentukan</span>
                        <button
                          onClick={() => {
                            setFormData({
                              teacher_id: teachers[0]?.id || '',
                              unit_id: cls.unitId,
                              academic_year_id: 'ay-current',
                              semester_id: 'sem-current',
                              class_id: cls.classId,
                              subject_id: '',
                              assignment_type: 'HOMEROOM',
                              is_homeroom: true,
                              hours_per_week: 2,
                              status: 'ACTIVE'
                            });
                            setModalType('add');
                          }}
                          className="text-[10px] bg-amber-600 text-white font-bold px-2 py-0.5 rounded not-italic cursor-pointer"
                        >
                          + Set Wali Kelas
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Subject Teachers List */}
                  <div className="mt-3 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Guru Mata Pelajaran
                    </span>
                    {cls.subjects.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2">Belum ada guru mapel terploting.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {cls.subjects.map(s => (
                          <div key={s.id} className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                            <div>
                              <p className="font-bold text-slate-800">{s.subject_name}</p>
                              <p className="text-[10px] text-slate-500">{s.teacher_name}</p>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                              {s.hours_per_week || 4} Jm
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <button
                  onClick={() => openAddModal(cls.classId)}
                  className="w-full mt-3 py-2 bg-white hover:bg-blue-50 border border-slate-200 text-blue-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Tambah Plot Kelas Ini
                </button>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================================
            VIEW MODE 3: WORKLOAD ANALYSIS VIEW
            ========================================================================= */}
        {activeViewMode === 'workload' && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3 text-blue-900 text-xs">
              <Info className="h-5 w-5 text-blue-600 shrink-0" />
              <div>
                <p className="font-bold">Pedoman Pemenuhan Beban Kerja Guru (Dapodik / EMIS):</p>
                <p className="text-[11px] text-blue-800">Target standar beban mengajar adalah <b>24 jam pelajaran per minggu</b>. Sistem menandai indikator status pemenuhan untuk tiap guru secara otomatis.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teacherWorkloadData.map(tw => {
                const target = 24;
                const percentage = Math.min(100, Math.round((tw.totalHours / target) * 100));
                
                let badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                let badgeText = 'Sesuai Standard (≥24 Jm)';
                if (tw.totalHours < 18) {
                  badgeStyle = 'bg-rose-50 text-rose-800 border-rose-200';
                  badgeText = 'Kurang (<18 Jm)';
                } else if (tw.totalHours < 24) {
                  badgeStyle = 'bg-amber-50 text-amber-800 border-amber-200';
                  badgeText = 'Hampir Ideal (18-23 Jm)';
                }

                return (
                  <div key={tw.teacherId} className="bg-slate-50/60 border border-slate-200 rounded-2xl p-5 space-y-3 shadow-2xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{tw.teacherName}</h4>
                        <p className="text-[10px] text-slate-400 font-mono">NIP: {tw.nip}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black border ${badgeStyle}`}>
                        {badgeText}
                      </span>
                    </div>

                    {/* Workload Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-600">Total Beban Mengajar</span>
                        <span className="text-blue-700 font-mono">{tw.totalHours} / 24 Jam</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            tw.totalHours >= 24 ? 'bg-emerald-500' : tw.totalHours >= 18 ? 'bg-amber-500' : 'bg-rose-500'
                          }`} 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Classes list */}
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Daftar Kelas & Mapel Diampu:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {tw.assignments.map(a => (
                          <span key={a.id} className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                            <span className="font-bold text-blue-700">{a.class_name}:</span> {a.subject_name}
                            <span className="text-[9px] text-slate-400 font-mono">({a.hours_per_week || 4}Jm)</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* =========================================================================
          MODAL: ADD / EDIT ASSIGNMENT
          ========================================================================= */}
      {(modalType === 'add' || modalType === 'edit') && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-lg shadow-2xl animate-fade-in space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="font-black text-slate-800 text-sm">
                {modalType === 'add' ? 'Tambah Ploting Penugasan Guru' : 'Edit Ploting Penugasan Guru'}
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSaveAssignment} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-4">
                {/* Guru */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Pilih Guru *</label>
                  <select
                    value={formData.teacher_id}
                    onChange={(e) => setFormData({...formData, teacher_id: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">-- Pilih Guru --</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>

                {/* Unit */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Unit Sekolah *</label>
                  <select
                    value={formData.unit_id}
                    onChange={(e) => setFormData({...formData, unit_id: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                  >
                    <option value="SD">SD / Madrasah Ibtidaiyah</option>
                    <option value="SMP">SMP / Madrasah Tsanawiyah</option>
                    <option value="SMA">SMA / Madrasah Aliyah</option>
                    <option value="SMK">SMK</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Tahun Ajaran */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Tahun Ajaran *</label>
                  <select
                    value={formData.academic_year_id}
                    onChange={(e) => setFormData({...formData, academic_year_id: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                  >
                    {academicYears.map(ay => <option key={ay.id} value={ay.id}>{ay.name}</option>)}
                  </select>
                </div>

                {/* Semester */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Semester *</label>
                  <select
                    value={formData.semester_id}
                    onChange={(e) => setFormData({...formData, semester_id: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                  >
                    {semesters.map(sem => <option key={sem.id} value={sem.id}>{sem.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Tipe Assignment */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Tipe Penugasan *</label>
                <select
                  value={formData.assignment_type}
                  onChange={(e) => {
                    const type = e.target.value;
                    setFormData({
                      ...formData, 
                      assignment_type: type,
                      is_homeroom: type === 'HOMEROOM',
                      subject_id: type === 'HOMEROOM' ? '' : formData.subject_id
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                >
                  <option value="SUBJECT_TEACHER">Guru Mata Pelajaran</option>
                  <option value="HOMEROOM">Wali Kelas (Homeroom)</option>
                  <option value="TAHFIDZ">Pembimbing Tahfidz / Qur'an</option>
                  <option value="TEACHER">Guru Utama / Kelas</option>
                  <option value="EXTRACURRICULAR">Pelatih Ekstrakurikuler</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Kelas */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Kelas Target *</label>
                  <select
                    value={formData.class_id}
                    onChange={(e) => setFormData({...formData, class_id: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {classes.map(cl => <option key={cl.id} value={cl.id}>{cl.name}</option>)}
                  </select>
                </div>

                {/* Mata Pelajaran */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Mata Pelajaran</label>
                  <select
                    value={formData.subject_id}
                    onChange={(e) => setFormData({...formData, subject_id: e.target.value})}
                    disabled={formData.assignment_type === 'HOMEROOM'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="">-- Tidak Ada / Wali Kelas --</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code || '-'})</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Beban Jam Per Minggu</label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={formData.hours_per_week}
                    onChange={(e) => setFormData({...formData, hours_per_week: Number(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Status Aktif</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none font-bold text-xs"
                  >
                    <option value="ACTIVE">AKTIF</option>
                    <option value="INACTIVE">NONAKTIF</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 hover:bg-slate-100 rounded-xl text-slate-500 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Save className="h-4 w-4" />
                  Simpan Ploting
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: BULK ASSIGNMENT
          ========================================================================= */}
      {modalType === 'bulk' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-2xl shadow-2xl animate-fade-in space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="font-black text-slate-800 text-sm">Bulk Assign Penugasan Guru Multi-Kelas</h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSaveBulk} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Tahun Ajaran *</label>
                  <select
                    value={bulkData.academic_year_id}
                    onChange={(e) => setBulkData({...bulkData, academic_year_id: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-none"
                  >
                    {academicYears.map(ay => <option key={ay.id} value={ay.id}>{ay.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Semester *</label>
                  <select
                    value={bulkData.semester_id}
                    onChange={(e) => setBulkData({...bulkData, semester_id: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-none"
                  >
                    {semesters.map(sem => <option key={sem.id} value={sem.id}>{sem.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Tipe Penugasan *</label>
                  <select
                    value={bulkData.assignment_type}
                    onChange={(e) => setBulkData({...bulkData, assignment_type: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-none"
                  >
                    <option value="SUBJECT_TEACHER">Guru Mata Pelajaran</option>
                    <option value="HOMEROOM">Wali Kelas</option>
                    <option value="TAHFIDZ">Pembimbing Tahfidz</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Unit *</label>
                  <select
                    value={bulkData.unit_id}
                    onChange={(e) => setBulkData({...bulkData, unit_id: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-none"
                  >
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA</option>
                  </select>
                </div>
              </div>

              {/* Multi Select Grid */}
              <div className="grid grid-cols-3 gap-4 pt-2">
                
                {/* Teachers Select */}
                <div className="border border-slate-150 rounded-xl p-3 space-y-2 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[10px] text-slate-500 uppercase tracking-wide">1. GURU ({bulkData.teacher_ids.length})</span>
                    <button type="button" onClick={() => selectAllBulk('teacher')} className="text-[10px] text-blue-600 font-bold hover:underline">
                      Pilih Semua
                    </button>
                  </div>
                  <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                    {teachers.map(t => {
                      const isSelected = bulkData.teacher_ids.includes(t.id);
                      return (
                        <button
                          type="button"
                          key={t.id}
                          onClick={() => toggleBulkSelection(t.id, 'teacher')}
                          className={`w-full flex items-center gap-2 p-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                            isSelected ? 'bg-blue-50 text-blue-800 font-bold' : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          {isSelected ? <CheckSquare className="h-4 w-4 text-blue-600 shrink-0" /> : <Square className="h-4 w-4 text-slate-300 shrink-0" />}
                          <span className="truncate">{t.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Classes Select */}
                <div className="border border-slate-150 rounded-xl p-3 space-y-2 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[10px] text-slate-500 uppercase tracking-wide">2. KELAS ({bulkData.class_ids.length})</span>
                    <button type="button" onClick={() => selectAllBulk('class')} className="text-[10px] text-blue-600 font-bold hover:underline">
                      Pilih Semua
                    </button>
                  </div>
                  <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                    {classes.map(cl => {
                      const isSelected = bulkData.class_ids.includes(cl.id);
                      return (
                        <button
                          type="button"
                          key={cl.id}
                          onClick={() => toggleBulkSelection(cl.id, 'class')}
                          className={`w-full flex items-center gap-2 p-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                            isSelected ? 'bg-blue-50 text-blue-800 font-bold' : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          {isSelected ? <CheckSquare className="h-4 w-4 text-blue-600 shrink-0" /> : <Square className="h-4 w-4 text-slate-300 shrink-0" />}
                          <span>{cl.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Subjects Select */}
                <div className="border border-slate-150 rounded-xl p-3 space-y-2 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[10px] text-slate-500 uppercase tracking-wide">3. MAPEL ({bulkData.subject_ids.length})</span>
                    <button type="button" onClick={() => selectAllBulk('subject')} className="text-[10px] text-blue-600 font-bold hover:underline">
                      Pilih Semua
                    </button>
                  </div>
                  <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                    {subjects.map(s => {
                      const isSelected = bulkData.subject_ids.includes(s.id);
                      return (
                        <button
                          type="button"
                          key={s.id}
                          onClick={() => toggleBulkSelection(s.id, 'subject')}
                          className={`w-full flex items-center gap-2 p-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                            isSelected ? 'bg-blue-50 text-blue-800 font-bold' : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          {isSelected ? <CheckSquare className="h-4 w-4 text-blue-600 shrink-0" /> : <Square className="h-4 w-4 text-slate-300 shrink-0" />}
                          <span className="truncate">{s.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 hover:bg-slate-100 rounded-xl text-slate-500 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Save className="h-4 w-4" />
                  Simpan Bulk Ploting
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: COPY / CLONE
          ========================================================================= */}
      {modalType === 'copy' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-fade-in space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="font-black text-slate-800 text-sm">Copy / Clone Ploting Penugasan</h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleCopyPloting} className="space-y-4 text-xs">
              
              <div className="flex gap-2 p-1 bg-slate-50 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setCopyData({...copyData, type: 'YEAR'})}
                  className={`flex-1 py-1.5 rounded-lg font-bold cursor-pointer transition-all ${copyData.type === 'YEAR' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600'}`}
                >
                  Salin Tahun Ajaran
                </button>
                <button
                  type="button"
                  onClick={() => setCopyData({...copyData, type: 'SEMESTER'})}
                  className={`flex-1 py-1.5 rounded-lg font-bold cursor-pointer transition-all ${copyData.type === 'SEMESTER' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600'}`}
                >
                  Salin Semester
                </button>
              </div>

              {copyData.type === 'YEAR' ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Tahun Ajaran Sumber</label>
                    <select
                      value={copyData.source_academic_year_id}
                      onChange={(e) => setCopyData({...copyData, source_academic_year_id: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                    >
                      {academicYears.map(ay => <option key={ay.id} value={ay.id}>{ay.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Tahun Ajaran Target</label>
                    <select
                      value={copyData.target_academic_year_id}
                      onChange={(e) => setCopyData({...copyData, target_academic_year_id: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                    >
                      {academicYears.map(ay => <option key={ay.id} value={ay.id}>{ay.name}</option>)}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Semester Sumber</label>
                    <select
                      value={copyData.source_semester_id}
                      onChange={(e) => setCopyData({...copyData, source_semester_id: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                    >
                      {semesters.map(sem => <option key={sem.id} value={sem.id}>{sem.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Semester Target</label>
                    <select
                      value={copyData.target_semester_id}
                      onChange={(e) => setCopyData({...copyData, target_semester_id: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                    >
                      {semesters.map(sem => <option key={sem.id} value={sem.id}>{sem.name}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 hover:bg-slate-100 rounded-xl text-slate-500 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Copy className="h-4 w-4" />
                  Mulai Duplikasi
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: IMPORT CSV
          ========================================================================= */}
      {modalType === 'import' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-xl shadow-2xl animate-fade-in space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="font-black text-slate-800 text-sm">Import Ploting Guru (Format CSV)</h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-3 text-xs">
              
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-amber-900">
                <p className="font-bold">Pedoman Format Baris CSV:</p>
                <p className="font-mono text-[10px]">teacher_id, unit_id, academic_year_id, semester_id, class_id, subject_id, assignment_type, hours_per_week</p>
                <p className="text-[10px] italic">Sistem mengaktifkan <b>Rollback Transaksi Otomatis</b> jika terdapat kesalahan data.</p>
              </div>

              <textarea
                rows={6}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Masukkan baris CSV di sini..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-[11px] focus:outline-none"
              />

              {importError && (
                <p className="text-rose-600 font-bold text-[10px] flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {importError}
                </p>
              )}

              <div className="flex justify-between items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleParseImport}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold flex items-center gap-1 cursor-pointer"
                >
                  <FileText className="h-4 w-4" />
                  Pratinjau Impor
                </button>

                {importPreview.length > 0 && (
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2 py-1 rounded">
                    ✓ Terdeteksi {importPreview.length} baris siap diimpor
                  </span>
                )}
              </div>

              {importPreview.length > 0 && (
                <div className="border border-slate-150 rounded-xl max-h-32 overflow-y-auto bg-slate-50 p-2.5 space-y-1 font-mono text-[9px] text-slate-600">
                  <div className="font-bold border-b pb-1 mb-1 text-slate-700">Preview Data Hasil Parse:</div>
                  {importPreview.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>Guru ID: {item.teacher_id} | Kelas: {item.class_id}</span>
                      <span className="text-blue-600 font-bold">{item.assignment_type} ({item.hours_per_week}Jm)</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 hover:bg-slate-100 rounded-xl text-slate-500 font-bold"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={importPreview.length === 0}
                  onClick={handleExecuteImport}
                  className={`px-5 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer ${
                    importPreview.length > 0 ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Upload className="h-4 w-4" />
                  Eksekusi Impor
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
