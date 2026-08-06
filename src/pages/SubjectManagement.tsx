import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Plus, Search, Filter, MoreVertical, 
  Download, Upload, Printer, FileText, Trash2, 
  Edit2, Archive, RotateCcw, ChevronRight, Layers, 
  Book, Palette, CheckCircle, XCircle, Info,
  ChevronDown, Grid, List as ListIcon, Trash
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import apiClient from '../api/client';
import { useAuth } from '../contexts/AuthContext';

interface SubjectCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  order: number;
  status: string;
}

interface Curriculum {
  id: string;
  code: string;
  name: string;
  description: string;
  academic_year: string;
  semester: string;
  level: string;
  unit: string;
  status: string;
}

interface Subject {
  id: string;
  category_id: string;
  curriculum_id: string;
  code: string;
  name: string;
  name_arabic: string;
  name_english: string;
  level: string;
  unit: string;
  semester: string;
  kkm: number;
  weight: number;
  hours_per_week: number;
  color: string;
  icon: string;
  order: number;
  is_rapor: boolean;
  is_leger: boolean;
  is_absensi: boolean;
  is_tahfidz: boolean;
  status: string;
  category?: SubjectCategory;
  curriculum?: Curriculum;
}

export default function SubjectManagement() {
  const { user, activeRole } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [categories, setCategories] = useState<SubjectCategory[]>([]);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'subjects' | 'categories' | 'curriculums'>('subjects');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCurriculum, setSelectedCurriculum] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCurriculumModalOpen, setIsCurriculumModalOpen] = useState(false);
  
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editingCategory, setEditingCategory] = useState<SubjectCategory | null>(null);
  const [editingCurriculum, setEditingCurriculum] = useState<Curriculum | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeRole]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, subRes, curRes] = await Promise.all([
        apiClient.get('/api/v1/akademik/subjects/categories'),
        apiClient.get('/api/v1/akademik/subjects', {
          params: { 
            role: activeRole,
            teacher_id: user?.id
          }
        }),
        apiClient.get('/api/v1/akademik/curriculums')
      ]);
      if (catRes.data.success) setCategories(catRes.data.data);
      if (subRes.data.success) setSubjects(subRes.data.data);
      if (curRes.data.success) setCurriculums(curRes.data.data);
    } catch (err) {
      console.error('Error fetching data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus mata pelajaran ini?')) return;
    try {
      const res = await apiClient.delete('/api/v1/akademik/subjects', { data: { id } });
      if (res.data.success) {
        setSubjects(prev => prev.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error('Error deleting subject', err);
    }
  };

  const filteredSubjects = subjects.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || s.category_id === selectedCategory;
    const matchesCurriculum = selectedCurriculum === 'all' || s.curriculum_id === selectedCurriculum;
    return matchesSearch && matchesCategory && matchesCurriculum;
  });

  const isUserAdmin = activeRole === 'SUPER_ADMIN' || activeRole === 'OWNER' || activeRole === 'ADMINISTRATOR' || activeRole === 'KEPALA_SEKOLAH' || activeRole === 'OPERATOR_SEKOLAH';

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            Enterprise Curriculum Engine
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Sistem Kurikulum & Mata Pelajaran 100% Dinamis. Zero Hardcode.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isUserAdmin && (
            <>
              <button 
                onClick={() => setIsCurriculumModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 font-semibold text-sm bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              >
                <Layers className="w-4 h-4" />
                Master Kurikulum
              </button>
              <button 
                onClick={() => setIsCategoryModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 font-semibold text-sm bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              >
                <Grid className="w-4 h-4" />
                Kategori Mapel
              </button>
              <button 
                onClick={() => { setEditingSubject(null); setIsModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2 text-white font-bold text-sm bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Plus className="w-4 h-4" />
                Tambah Mapel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Mapel', value: subjects.length, icon: Book, color: 'blue' },
          { label: 'Kurikulum Aktif', value: curriculums.length, icon: CheckCircle, color: 'emerald' },
          { label: 'Kategori', value: categories.length, icon: Layers, color: 'indigo' },
          { label: 'Mapel Rapor', value: subjects.filter(s => s.is_rapor).length, icon: FileText, color: 'amber' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari mapel..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            />
          </div>
          <select 
            value={selectedCurriculum}
            onChange={(e) => setSelectedCurriculum(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Semua Kurikulum</option>
            {curriculums.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Semua Kategori</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden sm:block" />
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 text-slate-700 font-semibold text-sm bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 text-slate-700 font-semibold text-sm bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all">
            <Upload className="w-4 h-4" />
            Import
          </button>
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="h-8 w-8 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Memuat data...</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode='popLayout'>
            {filteredSubjects.map((subject, index) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={`${subject.id}-${index}`}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden"
              >
                <div className="p-5 flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {isUserAdmin && (
                        <>
                          <button 
                            onClick={() => { setEditingSubject(subject); setIsModalOpen(true); }}
                            className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-xl transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteSubject(subject.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-xl transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">CODE: {subject.code}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${subject.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                        {subject.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2">{subject.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold uppercase tracking-tight">
                        {subject.category?.name || 'Uncategorized'}
                      </span>
                      <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-600 text-[11px] font-bold uppercase tracking-tight">
                        KKM: {subject.kkm}
                      </span>
                      {subject.curriculum && (
                        <span className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[11px] font-bold uppercase tracking-tight">
                          {subject.curriculum.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Jam/Minggu</span>
                      <span className="text-xs font-semibold text-slate-700">{subject.hours_per_week || 2} Jam</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-slate-400 font-bold uppercase text-right">Jenjang</span>
                      <span className="text-xs font-semibold text-slate-700">{subject.level || 'SMA'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-wider">Mata Pelajaran</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-wider">Kurikulum</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-wider">Kategori</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-wider">KKM</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-wider">Rapor</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubjects.map((subject, index) => (
                <tr key={`${subject.id}-${index}`} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{subject.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">{subject.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-600">{subject.curriculum?.name || '-'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-tight">
                      {subject.category?.name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-black text-slate-900 text-sm">
                    {subject.kkm}
                  </td>
                  <td className="px-6 py-4">
                    {subject.is_rapor ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-slate-300" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isUserAdmin && (
                        <>
                          <button 
                            onClick={() => { setEditingSubject(subject); setIsModalOpen(true); }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteSubject(subject.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Subject */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl border border-white/20"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  {editingSubject ? 'Edit Mata Pelajaran' : 'Tambah Mapel Enterprise'}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-200"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const payload = Object.fromEntries(formData.entries());
                
                // Convert checkboxes
                const finalPayload = {
                  ...payload,
                  is_rapor: formData.get('is_rapor') === 'on',
                  is_leger: formData.get('is_leger') === 'on',
                  is_absensi: formData.get('is_absensi') === 'on',
                  is_tahfidz: formData.get('is_tahfidz') === 'on',
                  kkm: parseInt(payload.kkm as string),
                  weight: parseFloat(payload.weight as string),
                  hours_per_week: parseInt(payload.hours_per_week as string),
                };

                try {
                  const url = '/api/v1/akademik/subjects';
                  const method = editingSubject ? 'put' : 'post';
                  const data = editingSubject ? { ...finalPayload, id: editingSubject.id } : finalPayload;
                  const res = await (apiClient as any)[method](url, data);
                  if (res.data.success) {
                    fetchData();
                    setIsModalOpen(false);
                  }
                } catch (err) {
                  console.error('Error saving subject', err);
                }
              }} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Basic Info */}
                  <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nama Mapel (ID)</label>
                      <input name="name" required defaultValue={editingSubject?.name} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Kode Mapel</label>
                      <input name="code" required defaultValue={editingSubject?.code} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nama Arab</label>
                      <input name="name_arabic" defaultValue={editingSubject?.name_arabic} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-right" dir="rtl" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nama Inggris</label>
                      <input name="name_english" defaultValue={editingSubject?.name_english} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold" />
                    </div>
                  </div>

                  {/* Configs */}
                  <div className="space-y-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Konfigurasi Output</p>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" name="is_rapor" defaultChecked={editingSubject?.is_rapor ?? true} className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 transition-all" />
                      <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">Tampil di Rapor</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" name="is_leger" defaultChecked={editingSubject?.is_leger ?? true} className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 transition-all" />
                      <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">Tampil di Leger</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" name="is_absensi" defaultChecked={editingSubject?.is_absensi ?? true} className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 transition-all" />
                      <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">Aktif Absensi</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" name="is_tahfidz" defaultChecked={editingSubject?.is_tahfidz} className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 transition-all" />
                      <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">Modul Tahfidz</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Kurikulum</label>
                    <select name="curriculum_id" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold">
                      <option value="">Pilih Kurikulum</option>
                      {curriculums.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Kategori</label>
                    <select name="category_id" required defaultValue={editingSubject?.category_id} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold">
                      <option value="">Pilih Kategori</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">KKM</label>
                    <input name="kkm" type="number" required defaultValue={editingSubject?.kkm || 75} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Bobot Nilai</label>
                    <input name="weight" type="number" step="0.1" defaultValue={editingSubject?.weight || 1.0} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Jam / Minggu</label>
                    <input name="hours_per_week" type="number" defaultValue={editingSubject?.hours_per_week || 2} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Jenjang</label>
                    <select name="level" defaultValue={editingSubject?.level || 'SMA'} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold">
                      <option value="SD">SD / MI</option>
                      <option value="SMP">SMP / MTs</option>
                      <option value="SMA">SMA / MA</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Semester</label>
                    <select name="semester" defaultValue={editingSubject?.semester || 'BOTH'} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold">
                      <option value="GANJIL">Ganjil</option>
                      <option value="GENAP">Genap</option>
                      <option value="BOTH">Keduanya</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Urutan Rapor</label>
                    <input name="order" type="number" defaultValue={editingSubject?.order || 0} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold" />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-slate-500 font-bold text-sm hover:bg-slate-50 rounded-xl transition-all">Batal</button>
                  <button type="submit" className="px-8 py-2.5 bg-blue-600 text-white font-black text-sm rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">Simpan Mapel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Curriculums */}
      <AnimatePresence>
        {isCurriculumModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900 uppercase">Master Kurikulum</h2>
                <button onClick={() => setIsCurriculumModalOpen(false)}><XCircle className="w-6 h-6 text-slate-300 hover:text-slate-500 transition-all" /></button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  {curriculums.map(cur => (
                    <div key={cur.id} className="p-5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between group hover:border-blue-500 transition-all">
                      <div>
                        <p className="font-black text-slate-900 text-lg leading-tight">{cur.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cur.code}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold">{cur.academic_year || '2024/2025'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 transition-all"><Edit2 className="w-4 h-4" /></button>
                        <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-rose-600 transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                  <button className="p-5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50 flex items-center justify-center gap-3 text-slate-400 hover:text-blue-600 font-bold text-sm uppercase transition-all">
                    <Plus className="w-5 h-5" />
                    Tambah Kurikulum
                  </button>
                </div>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button onClick={() => setIsCurriculumModalOpen(false)} className="px-8 py-2.5 bg-slate-900 text-white font-black text-sm rounded-xl transition-all">Selesai</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Categories modal stays similarly simple but can be enhanced if needed */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900 uppercase">Kategori Mata Pelajaran</h2>
                <button onClick={() => setIsCategoryModalOpen(false)}><XCircle className="w-6 h-6 text-slate-300 hover:text-slate-500 transition-all" /></button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categories.map(cat => (
                    <div key={cat.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: cat.color }}>
                          {cat.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{cat.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">ORDER: {cat.order}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-blue-600 transition-all"><Edit2 className="w-4 h-4" /></button>
                        <button className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-rose-600 transition-all"><Trash className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                  <button className="p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50 flex items-center justify-center gap-3 text-slate-400 hover:text-blue-600 font-bold text-sm uppercase transition-all">
                    <Plus className="w-5 h-5" />
                    Add Category
                  </button>
                </div>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button onClick={() => setIsCategoryModalOpen(false)} className="px-8 py-2.5 bg-slate-900 text-white font-black text-sm rounded-xl transition-all">Selesai</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
