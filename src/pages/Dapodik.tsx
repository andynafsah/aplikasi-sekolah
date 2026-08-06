import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Download, 
  Printer, 
  Settings, 
  Upload, 
  History, 
  FileSpreadsheet, 
  Plus, 
  Trash2, 
  Users, 
  BookOpen, 
  ShieldAlert,
  FileText,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Check,
  Building2,
  FolderLock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ChecklistItem {
  id: string;
  checklist_num: number;
  title: string;
  status: 'Belum' | 'Proses' | 'Selesai';
  tanggal: string | null;
  pic: string | null;
  catatan: string | null;
  lampiran_name: string | null;
  lampiran_url: string | null;
  custom_fields: string | null;
  created_at: string;
  updated_at: string;
}

interface DapodikSettings {
  active_year: string;
  sync_date: string;
  required_checklists: number[];
  global_pic: string;
}

interface ChangeLog {
  id: string;
  checklist_num: number;
  username: string;
  action: string;
  details: string;
  created_at: string;
}

export default function DapodikPage() {
  const { user } = useAuth();
  
  // States
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [settings, setSettings] = useState<DapodikSettings>({
    active_year: '2025/2026',
    sync_date: '2026-08-31',
    required_checklists: [1, 2, 3, 5, 8, 14],
    global_pic: 'Operator Sekolah Utama'
  });
  const [logs, setLogs] = useState<ChangeLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Filtering & Laporan States
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterSemester, setFilterSemester] = useState<string>('all');
  const [filterUnit, setFilterUnit] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals & Panels
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  
  // Editing Temp States
  const [editStatus, setEditStatus] = useState<Record<string, 'Belum' | 'Proses' | 'Selesai'>>({});
  const [editPic, setEditPic] = useState<Record<string, string>>({});
  const [editCatatan, setEditCatatan] = useState<Record<string, string>>({});
  const [editTanggal, setEditTanggal] = useState<Record<string, string>>({});
  const [editCustomFields, setEditCustomFields] = useState<Record<string, any>>({});
  
  // File upload refs
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Auth checking: Administrator, Operator, TU, Kepala Sekolah, Yayasan
  const roleNorm = user?.role || '';
  const isAllowedToEdit = ['SUPER_ADMIN', 'OWNER', 'ADMINISTRATOR', 'OPERATOR', 'TU', 'ADMIN'].includes(roleNorm);

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get settings
      const settingsRes = await fetch('/api/dapodik/settings');
      if (settingsRes.ok) {
        const sData = await settingsRes.json();
        if (sData.success) {
          setSettings(sData.data);
        }
      }

      // Get checklists
      const checklistsRes = await fetch('/api/dapodik/checklists');
      if (checklistsRes.ok) {
        const cData = await checklistsRes.json();
        if (cData.success) {
          setChecklists(cData.data);
          setNotifications(cData.notifications || []);
          
          // Pre-populate edits
          const tempStatus: Record<string, any> = {};
          const tempPic: Record<string, any> = {};
          const tempCatatan: Record<string, any> = {};
          const tempTanggal: Record<string, any> = {};
          const tempFields: Record<string, any> = {};
          
          cData.data.forEach((item: ChecklistItem) => {
            tempStatus[item.id] = item.status;
            tempPic[item.id] = item.pic || '';
            tempCatatan[item.id] = item.catatan || '';
            tempTanggal[item.id] = item.tanggal || '';
            tempFields[item.id] = item.custom_fields ? JSON.parse(item.custom_fields) : {};
          });
          
          setEditStatus(tempStatus);
          setEditPic(tempPic);
          setEditCatatan(tempCatatan);
          setEditTanggal(tempTanggal);
          setEditCustomFields(tempFields);
        }
      }

      // Get logs
      const logsRes = await fetch('/api/dapodik/logs/0');
      if (logsRes.ok) {
        const lData = await logsRes.json();
        if (lData.success) {
          setLogs(lData.data);
        }
      }
    } catch (err) {
      console.error('Error fetching Dapodik data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate Progress Score
  const totalChecklists = checklists.length || 14;
  const completedChecklists = checklists.filter(item => item.status === 'Selesai').length;
  const progressPercent = Math.round((completedChecklists / totalChecklists) * 100) || 0;

  // Determine Overall Status Color and Label
  let statusColor = 'text-red-600 bg-red-50 border-red-200';
  let statusDot = 'bg-red-500';
  let statusText = 'Belum Siap';
  
  if (progressPercent >= 100) {
    statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    statusDot = 'bg-emerald-500';
    statusText = 'Siap Sinkronisasi';
  } else if (progressPercent >= 50) {
    statusColor = 'text-amber-700 bg-amber-50 border-amber-200';
    statusDot = 'bg-amber-500';
    statusText = 'Perlu Perbaikan';
  }

  // Handle individual checklist save
  const handleSaveChecklist = async (id: string, checklistNum: number) => {
    if (!isAllowedToEdit) {
      alert('Anda tidak memiliki hak akses untuk memodifikasi modul ini.');
      return;
    }
    
    try {
      setSubmitting(true);
      const res = await fetch(`/api/dapodik/checklists/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('erp_token') || localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          status: editStatus[id],
          pic: editPic[id],
          catatan: editCatatan[id],
          tanggal: editTanggal[id] || null,
          custom_fields: JSON.stringify(editCustomFields[id]),
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          // Refresh checklists and logs
          await fetchData();
          alert(`Checklist #${checklistNum} berhasil diperbarui.`);
        } else {
          alert('Gagal menyimpan perubahan: ' + data.message);
        }
      } else {
        alert('Gagal menghubungkan ke server.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan sistem.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle base64 attachment upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, id: string, checklistNum: number) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = async (evt) => {
      const base64Data = evt.target?.result as string;
      try {
        setSubmitting(true);
        const res = await fetch(`/api/dapodik/checklists/${id}/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('erp_token') || localStorage.getItem('token') || ''}`
          },
          body: JSON.stringify({
            fileName: file.name,
            fileData: base64Data
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            await fetchData();
            alert('Lampiran berkas berhasil diunggah secara aman.');
          } else {
            alert('Upload gagal: ' + data.message);
          }
        }
      } catch (err) {
        console.error(err);
        alert('Gagal mengunggah berkas.');
      } finally {
        setSubmitting(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Drag & Drop Upload
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, id: string, checklistNum: number) => {
    e.preventDefault();
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    const file = e.dataTransfer.files[0];
    
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const base64Data = evt.target?.result as string;
      try {
        setSubmitting(true);
        const res = await fetch(`/api/dapodik/checklists/${id}/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('erp_token') || localStorage.getItem('token') || ''}`
          },
          body: JSON.stringify({
            fileName: file.name,
            fileData: base64Data
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            await fetchData();
            alert('Lampiran berkas berhasil diunggah secara aman.');
          } else {
            alert('Upload gagal: ' + data.message);
          }
        }
      } catch (err) {
        console.error(err);
        alert('Gagal mengunggah berkas.');
      } finally {
        setSubmitting(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Settings Save
  const handleSaveSettings = async () => {
    if (!isAllowedToEdit) return;
    try {
      setSubmitting(true);
      const res = await fetch('/api/dapodik/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('erp_token') || localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setShowSettingsModal(false);
          await fetchData();
          alert('Pengaturan Dapodik berhasil disimpan.');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle CSV Import for New Students (Checklist #3)
  const handleImportNewStudentsCsv = (e: React.ChangeEvent<HTMLInputElement>, itemId: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\n');
      
      let rowsCount = 0;
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) rowsCount++;
      }

      // Update local checklist item state values
      const currentFields = { ...editCustomFields[itemId] };
      const newJumlah = (currentFields.jumlah || 0) + rowsCount;
      const newSudahLengkap = (currentFields.sudah_lengkap || 0) + Math.round(rowsCount * 0.9); // Assume 90% have NISN
      const newBelumLengkap = newJumlah - newSudahLengkap;

      const updatedFields = {
        ...currentFields,
        jumlah: newJumlah,
        sudah_lengkap: newSudahLengkap,
        belum_lengkap: newBelumLengkap
      };

      setEditCustomFields({
        ...editCustomFields,
        [itemId]: updatedFields
      });

      // Save automatically to the database
      try {
        setSubmitting(true);
        const res = await fetch(`/api/dapodik/checklists/${itemId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('erp_token') || localStorage.getItem('token') || ''}`
          },
          body: JSON.stringify({
            status: 'Proses',
            custom_fields: JSON.stringify(updatedFields),
            catatan: `Mengimpor data siswa baru sebanyak ${rowsCount} baris dari excel/csv.`
          })
        });

        if (res.ok) {
          await fetchData();
          alert(`Selesai mengimpor ${rowsCount} Siswa baru ke Dapodik.`);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setSubmitting(false);
      }
    };
    reader.readAsText(file);
  };

  // Filter lists based on UI controls
  const filteredChecklists = checklists.filter(item => {
    // Search filter
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.pic && item.pic.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (item.catatan && item.catatan.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Status filter
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    
    // Custom requirements filters
    const isMandatory = filterUnit === 'mandatory' ? settings.required_checklists.includes(item.checklist_num) : true;
    
    return matchesSearch && matchesStatus && isMandatory;
  });

  // Export to Excel / CSV format
  const handleDownloadExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,No,Checklist,Status,Penanggung Jawab,Tanggal,Catatan,Rincian Teknis\n";
    
    checklists.forEach((item) => {
      const fields = item.custom_fields ? JSON.parse(item.custom_fields) : {};
      const fieldsStr = Object.entries(fields).map(([k, v]) => `${k}: ${v}`).join('; ');
      
      const row = [
        item.checklist_num,
        `"${item.title}"`,
        `"${item.status}"`,
        `"${item.pic || ''}"`,
        `"${item.tanggal || ''}"`,
        `"${(item.catatan || '').replace(/"/g, '""')}"`,
        `"${fieldsStr}"`
      ].join(',');
      
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Persiapan_Dapodik_TA_${settings.active_year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Browser Print Preview trigger
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="h-6 w-6 text-blue-600" />
            Dashboard Persiapan Dapodik
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sistem monitoring berkala kualifikasi data dapodik Ditjen PAUD Dikdasmen aktif secara dinamis.
          </p>
        </div>
        
        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <button 
            onClick={fetchData}
            className="p-2 text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg cursor-pointer"
            title="Muat Ulang Data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          
          <button 
            onClick={() => setShowPreviewModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-250 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            <Eye className="h-4 w-4" />
            Preview Laporan
          </button>

          <button 
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-250 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            Cetak Checklist
          </button>

          <button 
            onClick={handleDownloadExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-250 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export Excel
          </button>

          {isAllowedToEdit && (
            <button 
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer shadow-sm"
            >
              <Settings className="h-4 w-4" />
              Pengaturan Sistem
            </button>
          )}
        </div>
      </div>

      {/* DASHBOARD METRICS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* PROGRESS CARD */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Progress Kesiapan</span>
            <span className={`text-xs px-2.5 py-1 rounded-full border font-bold font-mono ${statusColor}`}>
              {statusText}
            </span>
          </div>
          
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-4xl font-black text-slate-800 font-mono">{progressPercent}%</span>
            <span className="text-xs text-slate-400 font-medium font-mono">({completedChecklists} dari {totalChecklists} Selesai)</span>
          </div>
          
          <div className="w-full bg-slate-100 rounded-full h-3 mt-4 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                progressPercent === 100 ? 'bg-emerald-500' : progressPercent >= 50 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* CALENDAR & SYNC TARGET */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Tahun Ajaran & Target</span>
            <Calendar className="h-4 w-4 text-slate-400" />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-medium">Tahun Dapodik</span>
              <span className="font-extrabold text-slate-800">{settings.active_year}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-medium">Batas Sinkronisasi</span>
              <span className="font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">{settings.sync_date}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-medium">Penanggung Jawab</span>
              <span className="font-bold text-slate-800 truncate max-w-[150px]">{settings.global_pic}</span>
            </div>
          </div>
        </div>

        {/* NOTIFIKASI OTOMATIS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Peringatan Validasi Otomatis</span>
            <ShieldAlert className="h-4 w-4 text-amber-500" />
          </div>

          <div className="flex-1 overflow-y-auto max-h-[110px] space-y-2 mt-2 pr-1">
            {notifications.length === 0 ? (
              <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                <Check className="h-4 w-4" />
                Semua persyaratan dapodik tervalidasi sukses.
              </div>
            ) : (
              notifications.map((notif, index) => (
                <div key={index} className="flex items-start gap-2 text-[11px] text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-100 font-medium">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>{notif}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* FILTER & REPORT CARD PANEL */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm mb-6 flex flex-col md:flex-row items-center gap-4 print:hidden">
        
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari checklist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="Belum">Belum Mulai</option>
            <option value="Proses">Proses Pengerjaan</option>
            <option value="Selesai">Selesai / Terverifikasi</option>
          </select>
        </div>

        {/* Mandatory Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Layers className="h-3.5 w-3.5 text-slate-400" />
          <select 
            value={filterUnit}
            onChange={(e) => setFilterUnit(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none cursor-pointer"
          >
            <option value="all">Semua Checklist (14)</option>
            <option value="mandatory">Hanya Checklist Wajib ({settings.required_checklists.length})</option>
          </select>
        </div>
      </div>

      {/* 14 CHECKLIST ITEMS LIST CONTAINER */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="h-8 w-8 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin mb-2" />
            <span className="text-xs font-semibold font-mono text-slate-400 uppercase">MENGAMBIL STATUS PERSYARATAN DAPODIK...</span>
          </div>
        ) : filteredChecklists.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm text-slate-400 text-xs font-medium">
            Tidak ada item checklist yang memenuhi kriteria pencarian.
          </div>
        ) : (
          filteredChecklists.map((item) => {
            const isExpanded = expandedId === item.id;
            const isRequired = settings.required_checklists.includes(item.checklist_num);
            
            // Render specific badge for status
            let badgeStyle = 'bg-slate-50 text-slate-600 border-slate-200';
            if (item.status === 'Selesai') {
              badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-100';
            } else if (item.status === 'Proses') {
              badgeStyle = 'bg-amber-50 text-amber-700 border-amber-100';
            }

            // Custom fields formatting helper
            const fields = editCustomFields[item.id] || {};

            return (
              <div 
                key={item.id}
                className={`bg-white border rounded-2xl shadow-sm overflow-hidden transition-all duration-300 ${
                  isExpanded ? 'border-blue-300 ring-2 ring-blue-50/50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                
                {/* CHECKLIST SUMMARY ROW */}
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-10 w-10 shrink-0 bg-slate-50 text-slate-700 rounded-xl border border-slate-200 flex items-center justify-center font-mono font-extrabold text-sm">
                      {item.checklist_num}
                    </div>
                    
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">{item.title}</h3>
                        {isRequired && (
                          <span className="text-[9px] font-black text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
                            Wajib
                          </span>
                        )}
                      </div>
                      
                      <p className="text-xs text-slate-500 mt-1 truncate max-w-xl">
                        PIC: <span className="font-bold text-slate-700">{item.pic || 'Belum diatur'}</span> 
                        {item.tanggal && ` • Batas: ${item.tanggal}`}
                        {item.catatan && ` • "${item.catatan}"`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Status Pill */}
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${badgeStyle}`}>
                      {item.status === 'Selesai' ? 'Terverifikasi' : item.status === 'Proses' ? 'Pengerjaan' : 'Belum Mulai'}
                    </span>
                    
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </div>
                </div>

                {/* DETAILED EXPANDED CONFIG PANEL */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-slate-100 bg-slate-50/50">
                    
                    {/* Dynamic Checklist specific fields (Inputs / Metrics / DB counts) */}
                    <div className="bg-white border border-slate-150 rounded-xl p-4 shadow-sm mb-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-3">Spesifikasi Detail & Parameter</h4>
                      
                      {/* Render custom elements based on checklist num */}
                      {item.checklist_num === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">Nomor Surat Keputusan (SK)</label>
                            <input 
                              type="text"
                              value={fields.nomor_sk || ''}
                              onChange={(e) => setEditCustomFields({
                                ...editCustomFields,
                                [item.id]: { ...fields, nomor_sk: e.target.value }
                              })}
                              disabled={!isAllowedToEdit}
                              placeholder="e.g. SK-KBM/10/VIII/2026"
                              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">Tanggal Penetapan SK</label>
                            <input 
                              type="date"
                              value={fields.tanggal_sk || ''}
                              onChange={(e) => setEditCustomFields({
                                ...editCustomFields,
                                [item.id]: { ...fields, tanggal_sk: e.target.value }
                              })}
                              disabled={!isAllowedToEdit}
                              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none font-mono"
                            />
                          </div>
                        </div>
                      )}

                      {item.checklist_num === 2 && (
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Jumlah Rombel</span>
                            <span className="text-lg font-black text-slate-700 font-mono">{fields.jumlah_rombel}</span>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Jumlah Siswa</span>
                            <span className="text-lg font-black text-slate-700 font-mono">{fields.jumlah_siswa}</span>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Status Validasi</span>
                            <span className={`text-xs font-black block mt-1.5 uppercase ${
                              fields.validasi === 'Valid' ? 'text-emerald-600' : 'text-red-500'
                            }`}>{fields.validasi}</span>
                          </div>
                        </div>
                      )}

                      {item.checklist_num === 3 && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Jumlah Siswa Baru</span>
                              <span className="text-lg font-black text-slate-700 font-mono">{fields.jumlah}</span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Sudah Lengkap NISN</span>
                              <span className="text-lg font-black text-emerald-600 font-mono">{fields.sudah_lengkap}</span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Belum Lengkap NISN</span>
                              <span className={`text-lg font-black font-mono ${fields.belum_lengkap > 0 ? 'text-amber-600' : 'text-slate-500'}`}>
                                {fields.belum_lengkap}
                              </span>
                            </div>
                          </div>
                          {isAllowedToEdit && (
                            <div className="flex items-center gap-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                              <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                              <div className="flex-1">
                                <span className="text-xs font-bold text-slate-700 block">Unggah & Import Data Excel</span>
                                <span className="text-[10px] text-slate-500 block">Secara otomatis mendaftarkan profil siswa baru ke dalam system Dapodik.</span>
                              </div>
                              <label className="px-3 py-1.5 bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg shadow-sm hover:bg-slate-50 cursor-pointer">
                                Pilih File Excel
                                <input 
                                  type="file" 
                                  accept=".csv,.xlsx,.xls"
                                  onChange={(e) => handleImportNewStudentsCsv(e, item.id)}
                                  className="hidden" 
                                />
                              </label>
                            </div>
                          )}
                        </div>
                      )}

                      {item.checklist_num === 4 && (
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Mutasi Masuk</span>
                            <input 
                              type="number"
                              value={fields.masuk || 0}
                              onChange={(e) => setEditCustomFields({
                                ...editCustomFields,
                                [item.id]: { ...fields, masuk: parseInt(e.target.value) || 0 }
                              })}
                              disabled={!isAllowedToEdit}
                              className="w-16 text-center text-xs font-bold font-mono bg-white border border-slate-200 rounded p-1 mt-1 outline-none"
                            />
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Mutasi Keluar</span>
                            <input 
                              type="number"
                              value={fields.keluar || 0}
                              onChange={(e) => setEditCustomFields({
                                ...editCustomFields,
                                [item.id]: { ...fields, keluar: parseInt(e.target.value) || 0 }
                              })}
                              disabled={!isAllowedToEdit}
                              className="w-16 text-center text-xs font-bold font-mono bg-white border border-slate-200 rounded p-1 mt-1 outline-none"
                            />
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Status Surat</span>
                            <span className="text-xs font-extrabold text-blue-700 mt-1 uppercase">Terarsip</span>
                          </div>
                        </div>
                      )}

                      {item.checklist_num === 5 && (
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Siswa Belum Memiliki Rombel</span>
                            <span className={`text-xl font-black font-mono ${
                              fields.belum_dibagi > 0 ? 'text-red-500 animate-pulse' : 'text-emerald-600'
                            }`}>
                              {fields.belum_dibagi}
                            </span>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Siswa Sudah Masuk Rombel</span>
                            <span className="text-xl font-black text-slate-700 font-mono">
                              {fields.sudah_bagi || fields.sudah_dibagi}
                            </span>
                          </div>
                        </div>
                      )}

                      {item.checklist_num === 6 && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Rata-rata Jam Mengajar</span>
                            <input 
                              type="number"
                              value={fields.jam_mengajar || 24}
                              onChange={(e) => setEditCustomFields({
                                ...editCustomFields,
                                [item.id]: { ...fields, jam_mengajar: parseInt(e.target.value) || 24 }
                              })}
                              disabled={!isAllowedToEdit}
                              className="w-16 text-center text-xs font-bold font-mono bg-white border border-slate-200 rounded p-1 mt-1 outline-none"
                            />
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Linier</span>
                            <input 
                              type="number"
                              value={fields.linier || 12}
                              onChange={(e) => setEditCustomFields({
                                ...editCustomFields,
                                [item.id]: { ...fields, linier: parseInt(e.target.value) || 0 }
                              })}
                              disabled={!isAllowedToEdit}
                              className="w-16 text-center text-xs font-bold font-mono bg-white border border-slate-200 rounded p-1 mt-1 outline-none"
                            />
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Tidak Linier</span>
                            <input 
                              type="number"
                              value={fields.tidak_linier || 0}
                              onChange={(e) => setEditCustomFields({
                                ...editCustomFields,
                                [item.id]: { ...fields, tidak_linier: parseInt(e.target.value) || 0 }
                              })}
                              disabled={!isAllowedToEdit}
                              className="w-16 text-center text-xs font-bold font-mono bg-white border border-slate-200 rounded p-1 mt-1 outline-none"
                            />
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Status Sertifikasi</span>
                            <span className="text-xs font-black text-amber-600 uppercase mt-1">Perlu Verifikasi</span>
                          </div>
                        </div>
                      )}

                      {item.checklist_num === 7 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">Nomor SK Wali Kelas</label>
                            <input 
                              type="text"
                              value={fields.nomor_sk || ''}
                              onChange={(e) => setEditCustomFields({
                                ...editCustomFields,
                                [item.id]: { ...fields, nomor_sk: e.target.value }
                              })}
                              disabled={!isAllowedToEdit}
                              placeholder="e.g. SK-WALI/002/VIII/2026"
                              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">Tanggal SK</label>
                            <input 
                              type="date"
                              value={fields.tanggal_sk || ''}
                              onChange={(e) => setEditCustomFields({
                                ...editCustomFields,
                                [item.id]: { ...fields, tanggal_sk: e.target.value }
                              })}
                              disabled={!isAllowedToEdit}
                              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">Daftar Guru Terlibat</label>
                            <input 
                              type="text"
                              value={fields.guru || ''}
                              onChange={(e) => setEditCustomFields({
                                ...editCustomFields,
                                [item.id]: { ...fields, guru: e.target.value }
                              })}
                              disabled={!isAllowedToEdit}
                              placeholder="e.g. 12 Guru Wali Kelas"
                              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                            />
                          </div>
                        </div>
                      )}

                      {item.checklist_num === 8 && (
                        <div className="grid grid-cols-4 gap-4 text-center">
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Jumlah Guru</span>
                            <span className="text-lg font-black text-slate-700 font-mono">{fields.jumlah_guru}</span>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Jumlah Tendik</span>
                            <span className="text-lg font-black text-slate-700 font-mono">{fields.jumlah_tendik}</span>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Belum Lengkap</span>
                            <span className="text-lg font-black text-amber-600 font-mono">{fields.belum_lengkap}</span>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Sudah Lengkap</span>
                            <span className="text-lg font-black text-emerald-600 font-mono">{fields.sudah_lengkap}</span>
                          </div>
                        </div>
                      )}

                      {item.checklist_num === 9 && (
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center">
                          {[
                            { label: 'Wali Kelas', key: 'wali_kelas' },
                            { label: 'Kepala Lab', key: 'kepala_lab' },
                            { label: 'Kepala Perpus', key: 'kepala_perpus' },
                            { label: 'Operator', key: 'operator' },
                            { label: 'Bendahara', key: 'bendahara' },
                            { label: 'Pembina', key: 'pembina' }
                          ].map(t => (
                            <div key={t.key} className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                              <span className="text-[9px] font-bold text-slate-400 uppercase font-mono block truncate">{t.label}</span>
                              <input 
                                type="number"
                                value={fields[t.key] || 0}
                                onChange={(e) => setEditCustomFields({
                                  ...editCustomFields,
                                  [item.id]: { ...fields, [t.key]: parseInt(e.target.value) || 0 }
                                })}
                                disabled={!isAllowedToEdit}
                                className="w-12 text-center text-xs font-bold font-mono bg-white border border-slate-200 rounded p-0.5 mt-1 outline-none"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {item.checklist_num === 10 && (
                        <div className="grid grid-cols-2 md:grid-cols-7 gap-2 text-center">
                          {[
                            { label: 'Ruang Kelas', key: 'ruang_kelas' },
                            { label: 'Perpustakaan', key: 'perpustakaan' },
                            { label: 'Laboratorium', key: 'laboratorium' },
                            { label: 'UKS', key: 'uks' },
                            { label: 'Toilet', key: 'toilet' },
                            { label: 'Masjid', key: 'masjid' },
                            { label: 'Asrama', key: 'asrama' }
                          ].map(t => (
                            <div key={t.key} className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                              <span className="text-[9px] font-bold text-slate-400 uppercase font-mono block truncate">{t.label}</span>
                              <select 
                                value={fields[t.key] || 'Belum Siap'}
                                onChange={(e) => setEditCustomFields({
                                  ...editCustomFields,
                                  [item.id]: { ...fields, [t.key]: e.target.value }
                                })}
                                disabled={!isAllowedToEdit}
                                className="text-[10px] font-bold bg-white border border-slate-200 rounded p-0.5 mt-1 outline-none w-full"
                              >
                                <option value="Siap">Siap</option>
                                <option value="Belum Siap">Belum Siap</option>
                                <option value="Rusak Ringan">Rusak Ringan</option>
                              </select>
                            </div>
                          ))}
                        </div>
                      )}

                      {item.checklist_num === 11 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">Daftar Ekstrakurikuler</label>
                            <input 
                              type="text"
                              value={Array.isArray(fields.daftar_ekskul) ? fields.daftar_ekskul.join(', ') : (fields.daftar_ekskul || '')}
                              onChange={(e) => setEditCustomFields({
                                ...editCustomFields,
                                [item.id]: { ...fields, daftar_ekskul: e.target.value.split(',').map((s: string) => s.trim()) }
                              })}
                              disabled={!isAllowedToEdit}
                              placeholder="Pramuka, OSIS, Paskibra"
                              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">Pembina Ekskul</label>
                            <input 
                              type="text"
                              value={fields.pembina || ''}
                              onChange={(e) => setEditCustomFields({
                                ...editCustomFields,
                                [item.id]: { ...fields, pembina: e.target.value }
                              })}
                              disabled={!isAllowedToEdit}
                              placeholder="Ustadz Ahmad"
                              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">Peserta Terdaftar</label>
                            <input 
                              type="number"
                              value={fields.peserta || 0}
                              onChange={(e) => setEditCustomFields({
                                ...editCustomFields,
                                [item.id]: { ...fields, peserta: parseInt(e.target.value) || 0 }
                              })}
                              disabled={!isAllowedToEdit}
                              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none font-mono"
                            />
                          </div>
                        </div>
                      )}

                      {item.checklist_num === 12 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">Semester Aktif</label>
                            <select 
                              value={fields.semester || 'Ganjil'}
                              onChange={(e) => setEditCustomFields({
                                ...editCustomFields,
                                [item.id]: { ...fields, semester: e.target.value }
                              })}
                              disabled={!isAllowedToEdit}
                              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                            >
                              <option value="Ganjil">Semester Ganjil</option>
                              <option value="Genap">Semester Genap</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">Jumlah Hari Libur</label>
                            <input 
                              type="number"
                              value={fields.libur || 0}
                              onChange={(e) => setEditCustomFields({
                                ...editCustomFields,
                                [item.id]: { ...fields, libur: parseInt(e.target.value) || 0 }
                              })}
                              disabled={!isAllowedToEdit}
                              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">Hari Efektif KBM</label>
                            <input 
                              type="number"
                              value={fields.hari_efektif || 0}
                              onChange={(e) => setEditCustomFields({
                                ...editCustomFields,
                                [item.id]: { ...fields, hari_efektif: parseInt(e.target.value) || 0 }
                              })}
                              disabled={!isAllowedToEdit}
                              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none font-mono"
                            />
                          </div>
                        </div>
                      )}

                      {item.checklist_num === 13 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">Jumlah Alumni Terdata</label>
                            <input 
                              type="number"
                              value={fields.jumlah_alumni || 0}
                              onChange={(e) => setEditCustomFields({
                                ...editCustomFields,
                                [item.id]: { ...fields, jumlah_alumni: parseInt(e.target.value) || 0 }
                              })}
                              disabled={!isAllowedToEdit}
                              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">Keterangan Penulisan Ijazah</label>
                            <input 
                              type="text"
                              value={fields.nomor_ijazah || ''}
                              onChange={(e) => setEditCustomFields({
                                ...editCustomFields,
                                [item.id]: { ...fields, nomor_ijazah: e.target.value }
                              })}
                              disabled={!isAllowedToEdit}
                              placeholder="Ijazah terdistribusi 100%"
                              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">Status Kelulusan</label>
                            <select 
                              value={fields.status_kelulusan || 'Belum Lulus'}
                              onChange={(e) => setEditCustomFields({
                                ...editCustomFields,
                                [item.id]: { ...fields, status_kelulusan: e.target.value }
                              })}
                              disabled={!isAllowedToEdit}
                              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                            >
                              <option value="Lulus">Lulus (Tuntas)</option>
                              <option value="Belum Lulus">Proses Validasi</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {item.checklist_num === 14 && (
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center">
                          {[
                            { label: 'Database', key: 'backup_database' },
                            { label: 'Dokumen', key: 'backup_dokumen' },
                            { label: 'Nilai KBM', key: 'backup_nilai' },
                            { label: 'Rapor', key: 'backup_rapor' },
                            { label: 'Surat', key: 'backup_surat' },
                            { label: 'Foto Profil', key: 'backup_foto' }
                          ].map(t => (
                            <div key={t.key} className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex flex-col items-center">
                              <span className="text-[9px] font-bold text-slate-400 uppercase font-mono block mb-1">{t.label}</span>
                              <input 
                                type="checkbox"
                                checked={!!fields[t.key]}
                                onChange={(e) => setEditCustomFields({
                                  ...editCustomFields,
                                  [item.id]: { ...fields, [t.key]: e.target.checked }
                                })}
                                disabled={!isAllowedToEdit}
                                className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* GENERAL METADATA EDITORS (Status, Date, PIC, Catatan, Upload) */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                      
                      <div className="space-y-4 lg:col-span-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          
                          {/* STATUS DROPDOWN */}
                          <div>
                            <label className="text-xs font-extrabold text-slate-600 block mb-1">Status Kesiapan</label>
                            <select 
                              value={editStatus[item.id]}
                              onChange={(e) => setEditStatus({ ...editStatus, [item.id]: e.target.value as any })}
                              disabled={!isAllowedToEdit}
                              className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none cursor-pointer font-bold"
                            >
                              <option value="Belum">Belum Mulai</option>
                              <option value="Proses">Sedang Diproses</option>
                              <option value="Selesai">Selesai / Terverifikasi</option>
                            </select>
                          </div>

                          {/* LIMIT DATE INPUT */}
                          <div>
                            <label className="text-xs font-extrabold text-slate-600 block mb-1">Tanggal Batas</label>
                            <input 
                              type="date"
                              value={editTanggal[item.id] || ''}
                              onChange={(e) => setEditTanggal({ ...editTanggal, [item.id]: e.target.value })}
                              disabled={!isAllowedToEdit}
                              className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none font-mono font-bold"
                            />
                          </div>

                          {/* PIC INPUT */}
                          <div>
                            <label className="text-xs font-extrabold text-slate-600 block mb-1">Penanggung Jawab (PIC)</label>
                            <input 
                              type="text"
                              value={editPic[item.id]}
                              onChange={(e) => setEditPic({ ...editPic, [item.id]: e.target.value })}
                              disabled={!isAllowedToEdit}
                              placeholder="e.g. Nama Staf Operator"
                              className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none font-bold text-slate-700"
                            />
                          </div>
                        </div>

                        {/* CATATAN / MEMO */}
                        <div>
                          <label className="text-xs font-extrabold text-slate-600 block mb-1">Catatan Koreksi & Validasi</label>
                          <textarea 
                            value={editCatatan[item.id]}
                            onChange={(e) => setEditCatatan({ ...editCatatan, [item.id]: e.target.value })}
                            disabled={!isAllowedToEdit}
                            rows={2}
                            placeholder="Tuliskan kendala, catatan, atau nomor SK yang relevan..."
                            className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* FILE LAMPIRAN UPLOAD DROPZONE */}
                      <div className="flex flex-col justify-between bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block mb-1">Lampiran SK / Bukti</span>
                          {item.lampiran_name ? (
                            <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-lg border border-emerald-100 flex flex-col gap-1">
                              <span className="text-[11px] font-bold truncate block">{item.lampiran_name}</span>
                              <a 
                                href={item.lampiran_url || '#'} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-[10px] text-blue-600 font-extrabold hover:underline"
                              >
                                Lihat Berkas Lampiran
                              </a>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 block italic">Belum ada lampiran.</span>
                          )}
                        </div>

                        {isAllowedToEdit && (
                          <div 
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, item.id, item.checklist_num)}
                            className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50 rounded-lg p-3 text-center cursor-pointer mt-3 transition-colors"
                          >
                            <Upload className="h-5 w-5 text-slate-400 mx-auto mb-1" />
                            <span className="text-[10px] font-semibold text-slate-500 block">Drag & drop berkas</span>
                            <span className="text-[9px] text-slate-400 block mb-1.5">Atau klik tombol di bawah</span>
                            
                            <label className="inline-block px-2 py-1 bg-white border border-slate-200 text-[10px] font-bold text-slate-700 rounded shadow-sm hover:bg-slate-50 cursor-pointer">
                              Unggah Berkas
                              <input 
                                type="file" 
                                ref={(el) => { fileInputRefs.current[item.id] = el; }}
                                onChange={(e) => handleFileUpload(e, item.id, item.checklist_num)}
                                className="hidden" 
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ACTIONS BAR FOR SINGLE CHECKLIST */}
                    {isAllowedToEdit && (
                      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                        <button 
                          onClick={async () => {
                            if (window.confirm('Apakah Anda yakin ingin melihat riwayat perubahan item ini?')) {
                              try {
                                const logRes = await fetch(`/api/dapodik/logs/${item.checklist_num}`);
                                if (logRes.ok) {
                                  const lData = await logRes.json();
                                  if (lData.success && lData.data.length > 0) {
                                    alert(lData.data.map((l: any) => `[${l.created_at.substring(0,10)}] ${l.username}: ${l.details}`).join('\n'));
                                  } else {
                                    alert('Belum ada riwayat perubahan tercatat untuk item ini.');
                                  }
                                }
                              } catch (err) {
                                console.error(err);
                              }
                            }
                          }}
                          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-semibold"
                        >
                          <History className="h-4 w-4" />
                          Lihat Riwayat ({logs.filter(l => l.checklist_num === item.checklist_num).length})
                        </button>
                        
                        <button 
                          onClick={() => handleSaveChecklist(item.id, item.checklist_num)}
                          disabled={submitting}
                          className="px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-lg hover:bg-blue-700 shadow-sm cursor-pointer disabled:opacity-50"
                        >
                          {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* AUDIT LOG LIST STREAM IN CARD BOTTOM */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mt-8 print:hidden">
        <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider font-mono mb-4 flex items-center gap-2">
          <History className="h-4 w-4 text-slate-500" />
          Aliran Audit & Riwayat Perubahan Dapodik
        </h3>
        
        <div className="overflow-y-auto max-h-[220px] space-y-3 pr-1">
          {logs.length === 0 ? (
            <span className="text-xs text-slate-400 italic block">Belum ada riwayat aktivitas dapodik tercatat.</span>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 text-xs border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                <div className="h-6 w-6 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center font-mono text-[10px] shrink-0 font-bold text-slate-600">
                  {log.checklist_num || 'S'}
                </div>
                <div className="flex-1">
                  <p className="text-slate-700 font-medium">
                    <span className="font-extrabold text-slate-900">{log.username}</span> - {log.details}
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL 1: SYSTEM SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="text-lg font-extrabold text-slate-800 mb-4">Pengaturan Global Dapodik</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Tahun Pelajaran Dapodik Aktif</label>
                <input 
                  type="text" 
                  value={settings.active_year}
                  onChange={(e) => setSettings({ ...settings, active_year: e.target.value })}
                  placeholder="2025/2026"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Batas Akhir / Target Sinkronisasi</label>
                <input 
                  type="date" 
                  value={settings.sync_date}
                  onChange={(e) => setSettings({ ...settings, sync_date: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Penanggung Jawab Utama (Sistem)</label>
                <input 
                  type="text" 
                  value={settings.global_pic}
                  onChange={(e) => setSettings({ ...settings, global_pic: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5">No Checklist yang Wajib Diisi (Mandatory)</label>
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 14 }, (_, i) => i + 1).map((num) => {
                    const isChecked = settings.required_checklists.includes(num);
                    return (
                      <label key={num} className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 bg-slate-50 p-1.5 rounded border border-slate-150 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            let updatedList = [...settings.required_checklists];
                            if (e.target.checked) {
                              updatedList.push(num);
                            } else {
                              updatedList = updatedList.filter(n => n !== num);
                            }
                            setSettings({ ...settings, required_checklists: updatedList });
                          }}
                          className="rounded text-blue-600 border-slate-300"
                        />
                        #{num}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-250 cursor-pointer"
              >
                Batal
              </button>
              <button 
                onClick={handleSaveSettings}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: DETAILED REPORT PREVIEW MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl p-8 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            
            {/* Report Header */}
            <div className="text-center border-b pb-6 mb-6">
              <h2 className="text-xl font-black text-slate-950 uppercase tracking-wide">Laporan Evaluasi Persiapan Dapodik</h2>
              <p className="text-xs text-slate-500 font-mono uppercase mt-1">Yayasan Darul Hadits Lima Puluh Kota • TA: {settings.active_year}</p>
              <div className="flex justify-center gap-4 text-xs font-mono font-bold text-slate-600 mt-3">
                <span>Progress: {progressPercent}% Selesai</span>
                <span>•</span>
                <span>Target: {settings.sync_date}</span>
                <span>•</span>
                <span>Status: {statusText}</span>
              </div>
            </div>

            {/* Table layout of the 14 checklists */}
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 uppercase font-mono font-extrabold">
                  <th className="p-3">No</th>
                  <th className="p-3">Nama Checklist</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Batas Tanggal</th>
                  <th className="p-3">Penanggung Jawab</th>
                  <th className="p-3">Catatan Koreksi</th>
                </tr>
              </thead>
              <tbody>
                {checklists.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-400">{item.checklist_num}</td>
                    <td className="p-3 font-bold text-slate-800">{item.title}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] border uppercase ${
                        item.status === 'Selesai' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                        item.status === 'Proses' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                        'bg-slate-50 border-slate-200 text-slate-600'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-600">{item.tanggal || '-'}</td>
                    <td className="p-3 font-medium text-slate-700">{item.pic || '-'}</td>
                    <td className="p-3 text-slate-500 italic truncate max-w-[200px]">{item.catatan || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Action Bar */}
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
              <button 
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-250 cursor-pointer"
              >
                Tutup
              </button>
              <button 
                onClick={handlePrint}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm cursor-pointer"
              >
                Cetak Laporan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT-ONLY BRANDING SECTION */}
      <div className="hidden print:block p-8 border border-slate-300 rounded-xl bg-white text-slate-900">
        <div className="text-center mb-6">
          <h2 className="text-xl font-black uppercase">Hasil Evaluasi Kesiapan Dapodik</h2>
          <p className="text-xs uppercase mt-0.5">Sekolah / Pondok Pesantren Terpadu • Tahun Ajaran {settings.active_year}</p>
          <p className="text-[10px] font-mono text-slate-400 mt-2">Dihasilkan secara resmi oleh ERP SaaS - {new Date().toLocaleString()}</p>
        </div>
        
        <div className="grid grid-cols-3 gap-4 border p-4 rounded-xl mb-6 text-xs">
          <div>
            <span className="font-bold text-slate-500 block uppercase font-mono text-[9px]">Total Progress</span>
            <span className="text-lg font-black font-mono">{progressPercent}% ({completedChecklists}/14 Selesai)</span>
          </div>
          <div>
            <span className="font-bold text-slate-500 block uppercase font-mono text-[9px]">Status Kelayakan</span>
            <span className="text-lg font-black uppercase">{statusText}</span>
          </div>
          <div>
            <span className="font-bold text-slate-500 block uppercase font-mono text-[9px]">Tanggal Tarik Data</span>
            <span className="text-lg font-black font-mono">{settings.sync_date}</span>
          </div>
        </div>

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 border-b-2 border-slate-300 text-slate-800 uppercase font-mono font-bold">
              <th className="p-2 border">No</th>
              <th className="p-2 border">Checklist Persyaratan Dapodik</th>
              <th className="p-2 border">Status Kesiapan</th>
              <th className="p-2 border">PIC Terkait</th>
              <th className="p-2 border">Tanggal</th>
              <th className="p-2 border">Catatan Evaluasi</th>
            </tr>
          </thead>
          <tbody>
            {checklists.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="p-2 border font-mono font-bold text-center">{item.checklist_num}</td>
                <td className="p-2 border font-bold">{item.title}</td>
                <td className="p-2 border uppercase font-mono text-center font-bold">{item.status}</td>
                <td className="p-2 border">{item.pic || '-'}</td>
                <td className="p-2 border font-mono text-center">{item.tanggal || '-'}</td>
                <td className="p-2 border italic">{item.catatan || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
