import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Copy, FileSpreadsheet, Download, Upload, 
  ShieldCheck, Users, Layers, Check, AlertCircle, RefreshCw, 
  Search, CheckCircle2, FileText, CheckSquare, Square, Save, X
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
  status: string;
}

export default function PlotingGuru() {
  const { user } = useAuth();
  
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

  // Modals
  const [modalType, setModalType] = useState<'add' | 'edit' | 'bulk' | 'copy' | 'import' | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  // Single Form State
  const [formData, setFormData] = useState({
    teacher_id: '',
    unit_id: 'SD',
    academic_year_id: '',
    semester_id: '',
    class_id: '',
    subject_id: '',
    assignment_type: 'TEACHER',
    is_homeroom: false,
    status: 'ACTIVE'
  });

  // Bulk Form State
  const [bulkData, setBulkData] = useState({
    teacher_ids: [] as string[],
    class_ids: [] as string[],
    subject_ids: [] as string[],
    unit_id: 'SD',
    academic_year_id: '',
    semester_id: '',
    assignment_type: 'TEACHER',
    status: 'ACTIVE'
  });

  // Copy Form State
  const [copyData, setCopyData] = useState({
    source_academic_year_id: '',
    target_academic_year_id: '',
    source_semester_id: '',
    target_semester_id: '',
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
        setAssignments(resAssignments.data.data);
      }

      // 2. Fetch Teachers
      const resTeachers = await apiClient.post('/api/action', { action: 'getTeachers' });
      if (resTeachers.data?.success) {
        setTeachers(resTeachers.data.data);
      }

      // 3. Fetch Classes
      const resClasses = await apiClient.post('/api/action', { action: 'getClasses' });
      if (resClasses.data?.success) {
        setClasses(resClasses.data.data);
      } else {
        // Fallback to getClassrooms
        const resClassrooms = await apiClient.post('/api/action', { action: 'getClassrooms' });
        if (resClassrooms.data?.success) {
          setClasses(resClassrooms.data.data);
        }
      }

      // 4. Fetch Subjects
      const resSubjects = await apiClient.post('/api/action', { action: 'getSubjects' });
      if (resSubjects.data?.success) {
        setSubjects(resSubjects.data.data);
      } else {
        // Fallback to getCourses
        const resCourses = await apiClient.post('/api/action', { action: 'getCourses' });
        if (resCourses.data?.success) {
          setSubjects(resCourses.data.data);
        }
      }

      // 5. Fetch Academic Years & Semesters
      const resSettings = await apiClient.post('/api/action', { action: 'getUnifiedSettings' });
      // Use standard system arrays
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

  // Create or Update Assignment
  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.teacher_id || !formData.class_id || !formData.academic_year_id || !formData.semester_id) {
      alert('Mohon lengkapi semua field utama!');
      return;
    }

    try {
      const action = modalType === 'edit' ? 'updateTeacherAssignment' : 'createTeacherAssignment';
      const payload = modalType === 'edit' ? { id: selectedAssignment?.id, ...formData } : formData;

      const res = await apiClient.post('/api/action', { action, ...payload });
      if (res.data?.success) {
        showSuccess(res.data.message || 'Ploting berhasil disimpan!');
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

  // Bulk Assignment Submission
  const handleSaveBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkData.teacher_ids.length === 0 || bulkData.class_ids.length === 0 || !bulkData.academic_year_id || !bulkData.semester_id) {
      alert('Lengkapi field wajib untuk Bulk Assign!');
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

  // CSV/Excel Import Preview & Processing
  const handleParseImport = () => {
    setImportError(null);
    if (!importText.trim()) {
      setImportError('Silakan masukkan teks CSV/Excel terlebih dahulu.');
      return;
    }

    const rows = importText.split('\n').map(r => r.trim()).filter(Boolean);
    const parsed: any[] = [];
    
    // Header format: teacher_id,unit_id,academic_year_id,semester_id,class_id,subject_id,assignment_type
    try {
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        if (cols.length < 5) continue;

        parsed.push({
          teacher_id: cols[0],
          unit_id: cols[1] || 'SD',
          academic_year_id: cols[2],
          semester_id: cols[3],
          class_id: cols[4],
          subject_id: cols[5] || null,
          assignment_type: cols[6] || 'TEACHER',
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
        // Server auto-rollback on transaction failure is highlighted here
        alert(res.data?.message || 'Gagal mengimpor. Seluruh data di-rollback otomatis.');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Kesalahan fatal. Import dibatalkan & di-rollback.');
    }
  };

  // Export Data to CSV
  const handleExportCSV = () => {
    if (assignments.length === 0) return;
    const headers = ['ID', 'Guru', 'NIP', 'Unit', 'Tahun Ajaran', 'Semester', 'Kelas', 'Mata Pelajaran', 'Tipe', 'Status'];
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
  const filteredAssignments = assignments.filter(item => {
    const matchesSearch = 
      item.teacher_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.teacher_nip.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = 
      selectedTypeTab === 'ALL' || 
      item.assignment_type === selectedTypeTab;

    return matchesSearch && matchesTab;
  });

  const openAddModal = () => {
    setFormData({
      teacher_id: teachers[0]?.id || '',
      unit_id: 'SD',
      academic_year_id: academicYears[0]?.id || '',
      semester_id: semesters[0]?.id || '',
      class_id: classes[0]?.id || '',
      subject_id: '',
      assignment_type: 'TEACHER',
      is_homeroom: false,
      status: 'ACTIVE'
    });
    setModalType('add');
  };

  const openEditModal = (item: Assignment) => {
    setSelectedAssignment(item);
    setFormData({
      teacher_id: item.teacher_id,
      unit_id: item.unit_id,
      academic_year_id: item.academic_year_id,
      semester_id: item.semester_id,
      class_id: item.class_id,
      subject_id: item.subject_id || '',
      assignment_type: item.assignment_type,
      is_homeroom: item.is_homeroom,
      status: item.status
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

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HEADER BANNER */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><ShieldCheck className="h-5 w-5" /></span>
            <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">Master Data</span>
          </div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Ploting Guru & Wali Kelas</h1>
          <p className="text-xs text-slate-400">Tentukan penugasan mengajar, hak akses kelas, dan wali kelas secara dinamis.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
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
                unit_id: 'SD',
                academic_year_id: academicYears[0]?.id || '',
                semester_id: semesters[0]?.id || '',
                assignment_type: 'TEACHER',
                status: 'ACTIVE'
              });
              setModalType('bulk');
            }}
            className="px-4 py-2 bg-slate-950 hover:bg-slate-850 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Users className="h-4 w-4" />
            Bulk Assignment
          </button>
          <button 
            onClick={() => setModalType('copy')}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Copy className="h-4 w-4" />
            Copy / Clone
          </button>
          <button 
            onClick={() => {
              setImportText('teacher_id,unit_id,academic_year_id,semester_id,class_id,subject_id,assignment_type\ntch-1,SD,ay-current,sem-current,cl-1,crs-2,SUBJECT_TEACHER');
              setImportPreview([]);
              setModalType('import');
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            Import CSV
          </button>
          <button 
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            title="Ekspor ke CSV"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Success Alert */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-4 rounded-2xl flex items-center gap-3 animate-fade-in shadow-xs">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-semibold">{successMsg}</span>
        </div>
      )}

      {/* 2. TAB CONTROLS & SEARCH */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Cari guru, kelas, atau mapel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
            />
          </div>

          {/* Group Type Tabs */}
          <div className="flex flex-wrap gap-1 bg-slate-50 border border-slate-200 p-1 rounded-xl">
            {['ALL', 'TEACHER', 'SUBJECT_TEACHER', 'HOMEROOM', 'TAHFIDZ'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTypeTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wide uppercase transition-all cursor-pointer ${
                  selectedTypeTab === tab 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab === 'ALL' ? 'Semua' : tab.replace('_', ' ')}
              </button>
            ))}
          </div>

        </div>

        {/* 3. ASSIGNMENTS LIST TABLE */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="h-6 w-6 text-blue-500 animate-spin" />
            <span className="text-xs text-slate-400 font-mono">Memuat database ploting...</span>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Layers className="h-8 w-8 mx-auto opacity-40 text-blue-400" />
            <p className="text-xs font-semibold">Tidak ada data ploting guru ditemukan.</p>
            <p className="text-[10px]">Silakan klik "Tambah Ploting" untuk mendaftarkan penugasan pertama.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-150 rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Guru</th>
                  <th className="py-3 px-4">Unit</th>
                  <th className="py-3 px-4">Tahun / Semester</th>
                  <th className="py-3 px-4">Kelas</th>
                  <th className="py-3 px-4">Mata Pelajaran</th>
                  <th className="py-3 px-4">Tipe Tugas</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredAssignments.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-bold text-slate-900 block">{item.teacher_name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">NIP: {item.teacher_nip}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-600">{item.unit_id}</td>
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-semibold block">{item.academic_year_name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{item.semester_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md font-bold text-[10px]">
                        {item.class_name}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-600">
                      {item.subject_name}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black tracking-wide ${
                        item.assignment_type === 'HOMEROOM' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                        item.assignment_type === 'SUBJECT_TEACHER' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                        'bg-slate-50 text-slate-800 border border-slate-200'
                      }`}>
                        {item.assignment_type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                        item.status === 'ACTIVE' ? 'text-emerald-600' : 'text-slate-400'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${item.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        {item.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button 
                          onClick={() => openEditModal(item)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteAssignment(item.id)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL: ADD / EDIT ASSIGNMENT
          ========================================================================= */}
      {(modalType === 'add' || modalType === 'edit') && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-lg shadow-2xl animate-fade-in space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="font-black text-slate-800 text-sm">
                {modalType === 'add' ? 'Tambah Ploting Guru' : 'Edit Ploting Guru'}
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSaveAssignment} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-4">
                {/* Guru */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Pilih Guru *</label>
                  <select
                    value={formData.teacher_id}
                    onChange={(e) => setFormData({...formData, teacher_id: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih --</option>
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
                    <option value="">-- Pilih --</option>
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
                    <option value="">-- Pilih --</option>
                    {semesters.map(sem => <option key={sem.id} value={sem.id}>{sem.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Tipe Assignment */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Tipe Penugasan *</label>
                <select
                  value={formData.assignment_type}
                  onChange={(e) => setFormData({...formData, assignment_type: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                >
                  <option value="TEACHER">Guru Utama / Kelas</option>
                  <option value="SUBJECT_TEACHER">Guru Mata Pelajaran</option>
                  <option value="HOMEROOM">Wali Kelas (Homeroom)</option>
                  <option value="TAHFIDZ">Pembimbing Tahfidz / Quran</option>
                  <option value="EXTRACURRICULAR">Pelatih Ekstrakurikuler</option>
                  <option value="MUSYRIF">Musyrif Asrama / Pesantren</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Kelas */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Kelas yang Diampu *</label>
                  <select
                    value={formData.class_id}
                    onChange={(e) => setFormData({...formData, class_id: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                  >
                    <option value="">-- Pilih --</option>
                    {classes.map(cl => <option key={cl.id} value={cl.id}>{cl.name}</option>)}
                  </select>
                </div>

                {/* Mata Pelajaran (Only relevant for Subject Teacher) */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Mata Pelajaran (Opsional)</label>
                  <select
                    value={formData.subject_id}
                    onChange={(e) => setFormData({...formData, subject_id: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                  >
                    <option value="">-- Tidak Ada / Wali Kelas --</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_homeroom}
                    onChange={(e) => setFormData({...formData, is_homeroom: e.target.checked})}
                    className="rounded text-blue-600 focus:ring-0"
                  />
                  <span>Tanggung Jawab Wali Kelas Utama</span>
                </label>

                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-1.5 focus:outline-none font-bold text-[10px]"
                >
                  <option value="ACTIVE">AKTIF</option>
                  <option value="INACTIVE">NONAKTIF</option>
                </select>
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
              <h3 className="font-black text-slate-800 text-sm">Bulk Assign Penugasan Guru</h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
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
                    <option value="">-- Pilih --</option>
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
                    <option value="">-- Pilih --</option>
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
                    <option value="TEACHER">Guru Utama / Kelas</option>
                    <option value="SUBJECT_TEACHER">Guru Mata Pelajaran</option>
                    <option value="HOMEROOM">Wali Kelas (Homeroom)</option>
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
                  <span className="font-black text-[10px] text-slate-400 uppercase tracking-wide block">1. PILIH GURU (BISA MULTI)</span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {teachers.map(t => {
                      const isSelected = bulkData.teacher_ids.includes(t.id);
                      return (
                        <button
                          type="button"
                          key={t.id}
                          onClick={() => toggleBulkSelection(t.id, 'teacher')}
                          className={`w-full flex items-center gap-2 p-1.5 rounded-lg text-left transition-colors ${
                            isSelected ? 'bg-blue-50 text-blue-800 font-bold' : 'hover:bg-slate-100'
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
                  <span className="font-black text-[10px] text-slate-400 uppercase tracking-wide block">2. PILIH KELAS (BISA MULTI)</span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {classes.map(cl => {
                      const isSelected = bulkData.class_ids.includes(cl.id);
                      return (
                        <button
                          type="button"
                          key={cl.id}
                          onClick={() => toggleBulkSelection(cl.id, 'class')}
                          className={`w-full flex items-center gap-2 p-1.5 rounded-lg text-left transition-colors ${
                            isSelected ? 'bg-blue-50 text-blue-800 font-bold' : 'hover:bg-slate-100'
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
                  <span className="font-black text-[10px] text-slate-400 uppercase tracking-wide block">3. PILIH MAPEL (OPSIONAL)</span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {subjects.map(s => {
                      const isSelected = bulkData.subject_ids.includes(s.id);
                      return (
                        <button
                          type="button"
                          key={s.id}
                          onClick={() => toggleBulkSelection(s.id, 'subject')}
                          className={`w-full flex items-center gap-2 p-1.5 rounded-lg text-left transition-colors ${
                            isSelected ? 'bg-blue-50 text-blue-800 font-bold' : 'hover:bg-slate-100'
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
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
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleCopyPloting} className="space-y-4 text-xs">
              
              <div className="flex gap-2 p-1 bg-slate-50 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setCopyData({...copyData, type: 'YEAR'})}
                  className={`flex-1 py-1.5 rounded-lg font-bold ${copyData.type === 'YEAR' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
                >
                  Salin Tahun Ajaran
                </button>
                <button
                  type="button"
                  onClick={() => setCopyData({...copyData, type: 'SEMESTER'})}
                  className={`flex-1 py-1.5 rounded-lg font-bold ${copyData.type === 'SEMESTER' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
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
                      <option value="">-- Pilih --</option>
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
                      <option value="">-- Pilih --</option>
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
                      <option value="">-- Pilih --</option>
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
                      <option value="">-- Pilih --</option>
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
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
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-xl shadow-2xl animate-fade-in space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="font-black text-slate-800 text-sm">Import Ploting Guru (CSV)</h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-3 text-xs">
              
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-amber-900">
                <p className="font-bold">Pedoman Format CSV:</p>
                <p className="font-mono text-[10px]">teacher_id, unit_id, academic_year_id, semester_id, class_id, subject_id, assignment_type</p>
                <p className="text-[10px] italic">Sistem mengaktifkan <b>Rollback Otomatis</b> jika salah satu baris gagal atau parameter salah.</p>
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
                <div className="border border-slate-150 rounded-xl max-h-32 overflow-y-auto bg-slate-50 p-2 space-y-1 font-mono text-[9px] text-slate-600">
                  <div className="font-bold border-b pb-1 mb-1">Preview Data:</div>
                  {importPreview.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>Guru ID: {item.teacher_id} | Kelas: {item.class_id}</span>
                      <span className="text-blue-600">{item.assignment_type}</span>
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
