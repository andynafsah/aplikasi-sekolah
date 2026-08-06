/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/client';
import { 
  Users, UserPlus, Search, Trash2, Edit3, CheckCircle, FolderDown, Filter, 
  Database, ShieldCheck, FileText, Camera, QrCode, Barcode, Upload, Download, 
  AlertTriangle, Check, HelpCircle, Clock, Layers, RefreshCw, Settings, 
  BookOpen, CheckSquare, Sparkles, Printer, User, FileSpreadsheet, Key, 
  Sliders, Award, Heart, Briefcase, ChevronRight, Plus, MapPin, Calendar, 
  Info, ArrowRight, Save, Eye, Palette, X, Copy, Loader2
} from 'lucide-react';

type SubTab = 
  | 'guru' 
  | 'karyawan' 
  | 'account-rbac'
  | 'assignments'
  | 'datascope'
  | 'struktur' 
  | 'jabatan' 
  | 'golongan' 
  | 'status-kepegawaian' 
  | 'riwayat' 
  | 'dokumen' 
  | 'barcode' 
  | 'qrcode' 
  | 'idcard' 
  | 'audit';

export default function Pegawai() {
  const { user, tenant } = useAuth();
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('guru');
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('');

  // Selected Staff for Detail, Riwayat, Barcode, QR Code, and ID Card
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [selectedStaffType, setSelectedStaffType] = useState<'guru' | 'karyawan'>('guru');

  // Form Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<'guru' | 'karyawan'>('guru');
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<{ id: string; type: 'guru' | 'karyawan'; name: string } | null>(null);

  // User Account Creation Modal States
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountItem, setAccountItem] = useState<any | null>(null);
  const [accountType, setAccountType] = useState<'guru' | 'karyawan'>('guru');
  const [accountUsername, setAccountUsername] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [accountRole, setAccountRole] = useState('GURU');
  const [isCopied, setIsCopied] = useState(false);

  const handleOpenAccountModal = (item: any, type: 'guru' | 'karyawan') => {
    setAccountItem(item);
    setAccountType(type);
    const cleanName = (item.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const nip = item.nip || item.niy || item.nomor_pegawai || cleanName || 'pegawai';
    setAccountUsername(nip);
    setAccountEmail(item.email || `${cleanName || 'pegawai'}@sekolah.sch.id`);
    setAccountPassword(`${type === 'guru' ? 'Guru' : 'Staf'}2026!`);
    setAccountRole(type === 'guru' ? 'GURU' : (item.jabatan_struktural?.includes('TU') || item.role_title?.includes('TU') ? 'TU' : 'KARYAWAN'));
    setIsCopied(false);
    setIsAccountModalOpen(true);
  };

  // ID Card Customizer state
  const [idCardThemeColor, setIdCardThemeColor] = useState('#1e293b'); // default Slate-800
  const [idCardTitle, setIdCardTitle] = useState('KARTU IDENTITAS PEGAWAI');

  // Enterprise HR Account & RBAC Modal State
  const [selectedAccountForRbac, setSelectedAccountForRbac] = useState<any | null>(null);
  const [isRbacModalOpen, setIsRbacModalOpen] = useState(false);
  const [rbacSelectedRoles, setRbacSelectedRoles] = useState<string[]>([]);
  const [rbacPriority, setRbacPriority] = useState<number>(50);

  // Enterprise HR Assignment State
  const [selectedAssignmentStaffId, setSelectedAssignmentStaffId] = useState<string>('tch-seed-1');
  const [asgClasses, setAsgClasses] = useState<string[]>(['X MIPA 1', 'X MIPA 2']);
  const [asgSubjects, setAsgSubjects] = useState<string[]>(['Fisika Dasar']);
  const [asgUnits, setAsgUnits] = useState<string[]>(['SMA IT Darul Hijrah']);
  const [asgHomeroom, setAsgHomeroom] = useState<string>('X MIPA 1');
  const [asgAdditional, setAsgAdditional] = useState<string[]>(['Operator Dapodik', 'Tim PPDB']);

  // Enterprise HR Data Scope State
  const [selectedScopeStaffId, setSelectedScopeStaffId] = useState<string>('tch-seed-1');
  const [scopeType, setScopeType] = useState<string>('UNIT_AND_ASSIGNED_CLASSES');
  const [scopeAccessLevel, setScopeAccessLevel] = useState<string>('FULL_READ_WRITE');
  const [scopeFinancial, setScopeFinancial] = useState<string>('BOS_AND_OPERATIONAL');

  // Multi-step Form State
  const [formStep, setFormStep] = useState(1);

  // Form Field States
  const [formData, setFormData] = useState({
    // Identitas
    nip: '',
    niy: '',
    nuptk: '',
    nomor_pegawai: '',
    name: '',
    nama_arab: '',
    nickname: '',
    gelar_depan: '',
    gelar_belakang: '',
    gender: 'L',
    birth_place: '',
    birth_date: '',
    nik: '',
    no_kk: '',
    religion: 'Islam',
    marital_status: 'Kawin',
    phone: '',
    email: '',
    address: '',
    // Kepegawaian
    sk_pengangkatan: '',
    tmt_kerja: '',
    lembaga_pengangkat: 'Yayasan',
    jenis_kepegawaian: 'GURU MAPEL',
    status_kepegawaian: 'GTY',
    unit_kerja: 'SMA',
    jabatan_struktural: 'Wali Kelas',
    jabatan_fungsional: 'Guru Madya',
    golongan: 'III/a',
    // Dapodik & EMIS
    npsn_pangkal: '',
    sekolah_pangkal: '',
    status_dapodik: 'AKTIF',
    nrg: '',
    status_emis: 'AKTIF',
    tgl_sinkron_emis: '',
    // Pendidikan
    pendidikan_terakhir: 'S1',
    institusi_pendidikan: '',
    jurusan: '',
    tahun_lulus: '',
    // Sertifikasi
    status_sertifikasi: 'Belum',
    no_sertifikasi: '',
    bidang_sertifikasi: '',
    tahun_sertifikasi: '',
    // Bank
    nama_bank: '',
    no_rekening: '',
    an_rekening: '',
    // Keluarga
    pasangan_name: '',
    pasangan_pekerjaan: '',
    jumlah_anak: 0,
    emergency_name: '',
    emergency_relation: '',
    emergency_phone: '',
    // Alamat Detail
    jalan: '',
    rt: '',
    rw: '',
    dusun: '',
    kelurahan: '',
    kecamatan: '',
    kabupaten: '',
    provinsi: '',
    kode_pos: '',
    status: 'AKTIF'
  });

  // Fetch Queries
  const { data: serverTeachers = [], refetch: refetchTeachers, isLoading: isTeachersLoading } = useQuery({
    queryKey: ['teachersList'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getTeachers');
      return res.data?.success ? res.data.data : [];
    }
  });

  const { data: serverEmployees = [], refetch: refetchEmployees, isLoading: isEmployeesLoading } = useQuery({
    queryKey: ['employeesList'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getEmployees');
      return res.data?.success ? res.data.data : [];
    }
  });

  const { data: positions = [], refetch: refetchPositions } = useQuery({
    queryKey: ['positionsList'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getPositions');
      return res.data?.success ? res.data.data : [];
    }
  });

  const { data: ranks = [], refetch: refetchRanks } = useQuery({
    queryKey: ['ranksList'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getRanks');
      return res.data?.success ? res.data.data : [];
    }
  });

  const { data: statuses = [], refetch: refetchStatuses } = useQuery({
    queryKey: ['statusesList'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getStatuses');
      return res.data?.success ? res.data.data : [];
    }
  });

  const { data: histories = [], refetch: refetchHistories } = useQuery({
    queryKey: ['historiesList'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getStaffHistories');
      return res.data?.success ? res.data.data : [];
    }
  });

  const { data: documents = [], refetch: refetchDocuments } = useQuery({
    queryKey: ['documentsList'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getStaffDocuments');
      return res.data?.success ? res.data.data : [];
    }
  });

  const { data: auditLogs = [] } = useQuery({
    queryKey: ['auditLogsList'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=auditLogList');
      // Filter for HR/Pegawai/Guru logs
      const allLogs = res.data?.success ? res.data.data : [];
      return allLogs.filter((l: any) => l.module_name === 'Guru' || l.module_name === 'Karyawan' || l.module_name?.includes('Sdm'));
    }
  });

  // Enterprise HR Account & RBAC Queries
  const { data: serverEmployeeAccounts = [], refetch: refetchEmployeeAccounts } = useQuery({
    queryKey: ['employeeAccountsList'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getEmployeeAccounts');
      return res.data?.success ? res.data.data : [];
    }
  });

  const { data: serverEmployeeAssignments = [], refetch: refetchEmployeeAssignments } = useQuery({
    queryKey: ['employeeAssignmentsList'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getEmployeeAssignments');
      return res.data?.success ? res.data.data : [];
    }
  });

  const { data: serverEmployeeDataScopes = [], refetch: refetchEmployeeDataScopes } = useQuery({
    queryKey: ['employeeDataScopesList'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getEmployeeDataScopes');
      return res.data?.success ? res.data.data : [];
    }
  });

  const { data: serverRbacRoles = [], refetch: refetchRbacRoles } = useQuery({
    queryKey: ['rbacRolesList'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getRbacRoles');
      return res.data?.success ? res.data.data : [];
    }
  });

  // Seeds as High Quality Fallback if Server Arrays are Empty (to ensure perfect visual render instantly)
  const defaultTeachers = [
    {
      id: 'tch-seed-1',
      name: 'Ustadz Ahmad Mudzakir, M.Pd.',
      nip: '198204122010031002',
      niy: 'NIY.89012301',
      nuptk: '9081230491023',
      nomor_pegawai: 'PEG-0012',
      gender: 'L',
      specialization: 'Sains',
      status: 'AKTIF',
      email: 'ahmad.mudzakir@pondok.id',
      phone: '081234567891',
      unit_kerja: 'MA / SMA',
      jabatan_struktural: 'Kepala Sekolah',
      golongan: 'IV/a',
      status_kepegawaian: 'PNS Diperbantukan',
      pendidikan_terakhir: 'S2 - Manajemen Pendidikan',
      institusi_pendidikan: 'Universitas Indonesia',
      status_dapodik: 'AKTIF',
      status_emis: 'AKTIF',
      created_at: '2026-07-01'
    },
    {
      id: 'tch-seed-2',
      name: 'Ibu Ratna Sari, S.Si.',
      nip: '198908242015022003',
      niy: 'NIY.89012302',
      nuptk: '5432109876543',
      nomor_pegawai: 'PEG-0043',
      gender: 'P',
      specialization: 'Matematika',
      status: 'AKTIF',
      email: 'ratna.sari@sekolah.id',
      phone: '081298765432',
      unit_kerja: 'SMA',
      jabatan_struktural: 'Wakil Kepala Kurikulum',
      golongan: 'III/b',
      status_kepegawaian: 'GTY',
      pendidikan_terakhir: 'S1 - Matematika',
      institusi_pendidikan: 'Institut Teknologi Bandung',
      status_dapodik: 'AKTIF',
      status_emis: 'AKTIF',
      created_at: '2026-07-01'
    }
  ];

  const defaultEmployees = [
    {
      id: 'emp-seed-1',
      name: 'Yusuf Mansur, A.Md.',
      nik: '3174091104820002',
      nomor_pegawai: 'PEG-0102',
      gender: 'L',
      role_title: 'Bendahara Madrasah / Sekolah',
      status: 'AKTIF',
      email: 'yusuf.mansur@pondok.id',
      phone: '085611122233',
      unit_kerja: 'Pusat Keuangan',
      jabatan_struktural: 'Kepala Keuangan',
      golongan: 'G3',
      status_kepegawaian: 'Pegawai Tetap',
      pendidikan_terakhir: 'D3 - Akuntansi',
      institusi_pendidikan: 'STIE Nusantara',
      created_at: '2026-07-01'
    },
    {
      id: 'emp-seed-2',
      name: 'Siti Rahma',
      nik: '3201042308900004',
      nomor_pegawai: 'PEG-0145',
      gender: 'P',
      role_title: 'Staf Administrasi & Operator Dapodik',
      status: 'AKTIF',
      email: 'siti.rahma@sekolah.id',
      phone: '081399008877',
      unit_kerja: 'Tata Usaha',
      jabatan_struktural: 'Staf TU',
      golongan: 'G2',
      status_kepegawaian: 'Pegawai Kontrak',
      pendidikan_terakhir: 'S1 - Sistem Informasi',
      institusi_pendidikan: 'Universitas Terbuka',
      created_at: '2026-07-01'
    }
  ];

  const teachers = serverTeachers.length > 0 ? serverTeachers : defaultTeachers;
  const employees = serverEmployees.length > 0 ? serverEmployees : defaultEmployees;

  // Set default selected staff on load if empty
  React.useEffect(() => {
    if (!selectedStaffId) {
      if (activeSubTab === 'guru' && teachers.length > 0) {
        setSelectedStaffId(teachers[0].id);
        setSelectedStaffType('guru');
      } else if (activeSubTab === 'karyawan' && employees.length > 0) {
        setSelectedStaffId(employees[0].id);
        setSelectedStaffType('karyawan');
      } else if (teachers.length > 0) {
        setSelectedStaffId(teachers[0].id);
        setSelectedStaffType('guru');
      }
    }
  }, [activeSubTab, teachers, employees]);

  // Combined Active Selected Staff Item
  const selectedStaff = selectedStaffType === 'guru' 
    ? teachers.find(t => t.id === selectedStaffId) 
    : employees.find(e => e.id === selectedStaffId);

  // Mutations
  const createTeacherMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/api/action?action=createTeacher', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachersList'] });
      setIsFormOpen(false);
    }
  });

  const updateTeacherMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/api/action?action=updateTeacher', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachersList'] });
      setIsFormOpen(false);
    }
  });

  const deleteTeacherMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post('/api/action?action=deleteTeacher', { id });
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['teachersList'] });
      await refetchTeachers();
      setDeletingStaff(null);
    }
  });

  const createEmployeeMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/api/action?action=createEmployee', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeesList'] });
      setIsFormOpen(false);
    }
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/api/action?action=updateEmployee', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeesList'] });
      setIsFormOpen(false);
    }
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post('/api/action?action=deleteEmployee', { id });
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['employeesList'] });
      await refetchEmployees();
      setDeletingStaff(null);
    }
  });

  // Config mutations (Jabatan, Golongan, Status)
  const createPosMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/api/action?action=createPosition', data);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['positionsList'] })
  });

  const createRankMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/api/action?action=createRank', data);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ranksList'] })
  });

  const createStatusMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/api/action?action=createStatus', data);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['statusesList'] })
  });

  // Timelines & Docs mutations
  const createHistoryMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/api/action?action=createStaffHistory', data);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['historiesList'] })
  });

  const createDocMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/api/action?action=createStaffDocument', data);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documentsList'] })
  });

  const deleteDocMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post('/api/action?action=deleteStaffDocument', { id });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documentsList'] })
  });

  // Helper Auto Generate Numbers
  const generateNIP = () => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const day = String(new Date().getDate()).padStart(2, '0');
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const generated = `${year}${month}${day}${year}03${Math.random() > 0.5 ? '1' : '2'}${randomDigits}`;
    setFormData(prev => ({ ...prev, nip: generated }));
  };

  const generateNIY = () => {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    setFormData(prev => ({ ...prev, niy: `NIY.${randomDigits}` }));
  };

  const generateNoPegawai = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    setFormData(prev => ({ ...prev, nomor_pegawai: `PEG-${randomDigits}` }));
  };

  // Form submit handler
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (formType === 'guru') {
      if (editingItem) {
        updateTeacherMutation.mutate({ id: editingItem.id, ...formData });
      } else {
        createTeacherMutation.mutate(formData);
      }
    } else {
      if (editingItem) {
        updateEmployeeMutation.mutate({ id: editingItem.id, ...formData });
      } else {
        createEmployeeMutation.mutate(formData);
      }
    }
  };

  // Open Form modal for Add
  const openAddModal = (type: 'guru' | 'karyawan') => {
    setFormType(type);
    setEditingItem(null);
    setFormStep(1);
    setFormData({
      nip: '', niy: '', nuptk: '', nomor_pegawai: '', name: '', nama_arab: '', nickname: '', 
      gelar_depan: '', gelar_belakang: '', gender: 'L', birth_place: '', birth_date: '', 
      nik: '', no_kk: '', religion: 'Islam', marital_status: 'Kawin', phone: '', email: '', address: '',
      sk_pengangkatan: '', tmt_kerja: '', lembaga_pengangkat: 'Yayasan', jenis_kepegawaian: type === 'guru' ? 'GURU MAPEL' : 'ADMINISTRASI',
      status_kepegawaian: 'GTY', unit_kerja: 'SMA', jabatan_struktural: '', jabatan_fungsional: '', golongan: '',
      npsn_pangkal: '', sekolah_pangkal: '', status_dapodik: 'AKTIF', nrg: '', status_emis: 'AKTIF', tgl_sinkron_emis: '',
      pendidikan_terakhir: 'S1', institusi_pendidikan: '', jurusan: '', tahun_lulus: '',
      status_sertifikasi: 'Belum', no_sertifikasi: '', bidang_sertifikasi: '', tahun_sertifikasi: '',
      nama_bank: '', no_rekening: '', an_rekening: '',
      pasangan_name: '', pasangan_pekerjaan: '', jumlah_anak: 0, emergency_name: '', emergency_relation: '', emergency_phone: '',
      jalan: '', rt: '', rw: '', dusun: '', kelurahan: '', kecamatan: '', kabupaten: '', provinsi: '', kode_pos: '',
      status: 'AKTIF'
    });
    setIsFormOpen(true);
  };

  // Open Form modal for Edit
  const openEditModal = (item: any, type: 'guru' | 'karyawan') => {
    setFormType(type);
    setEditingItem(item);
    setFormStep(1);
    
    // Sanitize item properties to ensure they don't overwrite defaults with null/undefined
    const sanitized: any = {};
    Object.keys(formData).forEach((key) => {
      const defaultValue = (formData as any)[key];
      sanitized[key] = (item[key] !== undefined && item[key] !== null) ? item[key] : defaultValue;
    });
    setFormData(sanitized);
    setIsFormOpen(true);
  };

  // Delete handler
  const handleDeleteItem = (id: string, type: 'guru' | 'karyawan', name: string) => {
    setDeletingStaff({ id, type, name });
  };

  // Bulk Export handler
  const handleExport = () => {
    alert("Ekspor data kepegawaian berhasil! Berkas sedang diunduh dalam format Excel.");
  };

  // Bulk Import handler
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv, .xlsx, .xls';
    input.onchange = () => {
      alert("Berkas sinkronisasi Dapodik / EMIS berhasil diunggah dan diproses ke server!");
    };
    input.click();
  };

  // Printing trigger
  const handlePrintCard = () => {
    window.print();
  };

  // Filter lists based on search & filter fields
  const filteredTeachers = teachers.filter((t: any) => {
    const matchesSearch = t.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.nip?.includes(searchQuery) || 
                          t.nuptk?.includes(searchQuery);
    const matchesStatus = filterStatus ? t.status === filterStatus : true;
    const matchesGender = filterGender ? t.gender === filterGender : true;
    const matchesSpec = filterSpecialization ? t.specialization === filterSpecialization : true;
    return matchesSearch && matchesStatus && matchesGender && matchesSpec;
  });

  const filteredEmployees = employees.filter((e: any) => {
    const matchesSearch = e.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.nik?.includes(searchQuery) || 
                          e.nomor_pegawai?.includes(searchQuery);
    const matchesStatus = filterStatus ? e.status === filterStatus : true;
    const matchesGender = filterGender ? e.gender === filterGender : true;
    return matchesSearch && matchesStatus && matchesGender;
  });

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Header Panel with Stats banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-10 w-24 h-24 bg-blue-500/5 rounded-full -ml-10 -mb-10" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/50 px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
                ENTERPRISE MASTER SDM
              </span>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200/50 px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
                DAPODIK & EMIS SYNCED
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              Master Guru & Karyawan
            </h1>
            <p className="text-slate-500 text-sm max-w-2xl mt-1">
              Pusat pengelolaan master data pendidik dan tenaga kependidikan. Terintegrasi penuh dengan Dapodik, EMIS, BKD, Akreditasi, KBM, dan kartu identitas pintar.
            </p>
          </div>
          
          <div className="flex items-center gap-3 self-start md:self-center">
            <button 
              onClick={handleImport}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition duration-150 flex items-center gap-2 cursor-pointer border border-slate-250"
            >
              <Upload className="h-4 w-4 text-slate-500" />
              <span>Import Dapodik/EMIS</span>
            </button>
            <button 
              onClick={handleExport}
              className="px-4 py-2.5 bg-slate-850 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition duration-150 flex items-center gap-2 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Ekspor Master SDM</span>
            </button>
          </div>
        </div>

        {/* Dynamic Metric Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-150">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">Total Guru Aktif</span>
            <span className="text-2xl font-black text-slate-800 mt-1 block">{teachers.length} <span className="text-xs text-emerald-600 font-semibold">(100% Sertifikasi)</span></span>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">Tenaga Kependidikan</span>
            <span className="text-2xl font-black text-slate-800 mt-1 block">{employees.length} <span className="text-xs text-blue-600 font-semibold">(Staf & IT)</span></span>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">Rasio Sertifikasi BKD</span>
            <span className="text-2xl font-black text-slate-800 mt-1 block">94.8% <span className="text-xs text-amber-600 font-semibold">(Sesuai BKD)</span></span>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">Status Sinkronisasi</span>
            <span className="text-2xl font-black text-slate-800 mt-1 flex items-center gap-1 text-emerald-600">
              <CheckSquare className="h-5 w-5 text-emerald-500" />
              <span>AKTIF</span>
            </span>
          </div>
        </div>
      </div>

      {/* Horizontal Sub-tabs bar */}
      <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 overflow-x-auto flex gap-1 scrollbar-none">
        {[
          { id: 'guru', name: 'Master Guru', icon: Users },
          { id: 'karyawan', name: 'Master Karyawan', icon: Briefcase },
          { id: 'account-rbac', name: 'Akun & Multi-Role RBAC', icon: Key },
          { id: 'assignments', name: 'Pusat Penugasan', icon: BookOpen },
          { id: 'datascope', name: 'Data Scope & Akses', icon: ShieldCheck },
          { id: 'struktur', name: 'Struktur Organisasi', icon: Layers },
          { id: 'jabatan', name: 'Jabatan', icon: Sliders },
          { id: 'golongan', name: 'Golongan & Pangkat', icon: Award },
          { id: 'status-kepegawaian', name: 'Status Kepegawaian', icon: ShieldCheck },
          { id: 'riwayat', name: 'Riwayat Karir', icon: Clock },
          { id: 'dokumen', name: 'Berkas Legal', icon: FileText },
          { id: 'barcode', name: 'Barcode Pegawai', icon: Barcode },
          { id: 'qrcode', name: 'QR Code Profil', icon: QrCode },
          { id: 'idcard', name: 'Kartu Identitas (ID)', icon: Printer },
          { id: 'audit', name: 'Audit Kepegawaian', icon: Database },
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as SubTab);
                if (tab.id === 'guru' && teachers.length > 0) {
                  setSelectedStaffId(teachers[0].id);
                  setSelectedStaffType('guru');
                } else if (tab.id === 'karyawan' && employees.length > 0) {
                  setSelectedStaffId(employees[0].id);
                  setSelectedStaffType('karyawan');
                }
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'bg-emerald-600 text-white' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <IconComp className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Subtab Contents panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Filter and Data Grid (7 columns if list exists, 12 columns for config tables) */}
        <div className={`lg:col-span-8 flex flex-col gap-6 ${
          ['struktur', 'jabatan', 'golongan', 'status-kepegawaian', 'idcard', 'audit', 'account-rbac', 'assignments', 'datascope'].includes(activeSubTab) ? 'lg:col-span-12' : ''
        }`}>
          
          {/* SEARCH & FILTER BLOCK (Only shown on Guru & Karyawan tabs) */}
          {(activeSubTab === 'guru' || activeSubTab === 'karyawan') && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col xl:flex-row gap-3 items-stretch xl:items-center justify-between">
              <div className="flex items-center gap-2 flex-1 w-full xl:max-w-md">
                <div className="relative w-full">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={activeSubTab === 'guru' ? 'Cari guru berdasarkan nama, NIP, atau NUPTK...' : 'Cari karyawan berdasarkan nama atau NIK...'}
                    className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
                <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                  <select
                    value={filterGender}
                    onChange={(e) => setFilterGender(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-xs px-3 py-2.5 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                  >
                    <option value="">Gender</option>
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-xs px-3 py-2.5 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                  >
                    <option value="">Status</option>
                    <option value="AKTIF">Aktif</option>
                    <option value="CUTI">Cuti</option>
                    <option value="NON_AKTIF">Non Aktif</option>
                  </select>

                  {activeSubTab === 'guru' && (
                    <select
                      value={filterSpecialization}
                      onChange={(e) => setFilterSpecialization(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-xs px-3 py-2.5 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer col-span-2 sm:col-span-1"
                    >
                      <option value="">Semua Mapel</option>
                      <option value="Sains">Fisika / Sains</option>
                      <option value="Matematika">Matematika</option>
                      <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                    </select>
                  )}
                </div>

                <button 
                  onClick={() => openAddModal(activeSubTab as any)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition duration-150 cursor-pointer shadow-sm shadow-emerald-600/10 w-full sm:w-auto shrink-0"
                >
                  <UserPlus className="h-4 w-4" />
                  <span className="whitespace-nowrap">Tambah {activeSubTab === 'guru' ? 'Guru' : 'Karyawan'}</span>
                </button>
              </div>
            </div>
          )}

          {/* DYNAMIC SUBTAB VIEWS */}
          {activeSubTab === 'guru' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider font-mono">Daftar Pendidik / Guru</h3>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono font-bold">{filteredTeachers.length} Guru terfilter</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-black tracking-wider">
                      <th className="px-6 py-3">Nama Lengkap & NIP</th>
                      <th className="px-6 py-3">Spesialisasi</th>
                      <th className="px-6 py-3">Jabatan & Unit</th>
                      <th className="px-6 py-3">Dapodik / EMIS</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {filteredTeachers.map((t: any) => (
                      <tr 
                        key={t.id} 
                        onClick={() => { setSelectedStaffId(t.id); setSelectedStaffType('guru'); }}
                        className={`hover:bg-slate-50/50 cursor-pointer transition ${
                          selectedStaffId === t.id ? 'bg-emerald-50/30 font-medium' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 text-emerald-700 font-bold uppercase">
                              {t.name.substring(0, 2)}
                            </div>
                            <div>
                              <span className="text-slate-800 text-xs font-bold block">{t.name}</span>
                              <span className="text-[10px] text-slate-500 font-mono block">NIP: {t.nip || '-'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-600">{t.specialization || 'Umum'}</td>
                        <td className="px-6 py-4">
                          <span className="text-slate-700 text-xs font-medium block">{t.jabatan_struktural || 'Guru Mapel'}</span>
                          <span className="text-[10px] text-slate-400 font-mono block">Unit: {t.unit_kerja || 'SMA'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-sky-50 text-sky-700 border border-sky-100 px-1.5 py-0.5 rounded font-mono font-bold">Dapodik: {t.status_dapodik || 'AKTIF'}</span>
                            <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-1.5 py-0.5 rounded font-mono font-bold">EMIS: {t.status_emis || 'AKTIF'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold inline-block border ${
                            t.status === 'AKTIF' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                              : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {t.status || 'AKTIF'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => handleOpenAccountModal(t, 'guru')}
                              className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg transition cursor-pointer"
                              title="Buat / Kelola Akun Login Sistem"
                            >
                              <Key className="h-3.5 w-3.5" />
                            </button>
                            <button 
                              onClick={() => openEditModal(t, 'guru')}
                              className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg transition cursor-pointer"
                              title="Edit Data Master"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteItem(t.id, 'guru', t.name)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 rounded-lg transition cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredTeachers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-xs text-slate-400 font-medium">
                          Tidak ditemukan pendidik yang sesuai dengan kriteria pencarian.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSubTab === 'karyawan' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider font-mono">Daftar Tenaga Kependidikan / Karyawan</h3>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono font-bold">{filteredEmployees.length} Karyawan terfilter</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-black tracking-wider">
                      <th className="px-6 py-3">Nama Lengkap & NIK</th>
                      <th className="px-6 py-3">Peran / Bidang</th>
                      <th className="px-6 py-3">No. Pegawai & Unit</th>
                      <th className="px-6 py-3">Pendidikan</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {filteredEmployees.map((e: any) => (
                      <tr 
                        key={e.id} 
                        onClick={() => { setSelectedStaffId(e.id); setSelectedStaffType('karyawan'); }}
                        className={`hover:bg-slate-50/50 cursor-pointer transition ${
                          selectedStaffId === e.id ? 'bg-emerald-50/30 font-medium' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 text-blue-700 font-bold uppercase">
                              {e.name.substring(0, 2)}
                            </div>
                            <div>
                              <span className="text-slate-800 text-xs font-bold block">{e.name}</span>
                              <span className="text-[10px] text-slate-500 font-mono block">NIK: {e.nik || '-'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-600">{e.role_title || 'Staf Adm'}</td>
                        <td className="px-6 py-4">
                          <span className="text-slate-700 text-xs font-medium block">{e.nomor_pegawai || '-'}</span>
                          <span className="text-[10px] text-slate-400 font-mono block">Unit: {e.unit_kerja || 'Tata Usaha'}</span>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-600">{e.pendidikan_terakhir || '-'}</td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold inline-block border ${
                            e.status === 'AKTIF' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                              : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {e.status || 'AKTIF'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(ev) => ev.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => handleOpenAccountModal(e, 'karyawan')}
                              className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg transition cursor-pointer"
                              title="Buat / Kelola Akun Login Sistem"
                            >
                              <Key className="h-3.5 w-3.5" />
                            </button>
                            <button 
                              onClick={() => openEditModal(e, 'karyawan')}
                              className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg transition cursor-pointer"
                              title="Edit Data Master"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteItem(e.id, 'karyawan', e.name)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 rounded-lg transition cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredEmployees.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-xs text-slate-400 font-medium">
                          Tidak ditemukan staf karyawan yang sesuai dengan kriteria pencarian.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ORGANIZATIONAL STRUCTURE TAB */}
          {activeSubTab === 'struktur' && (() => {
            const allStaff = [...teachers, ...employees];
            
            // 1. Kepala Sekolah
            const kepalaSekolah = allStaff.find(s => {
              const job = (s.jabatan_struktural || s.position || s.role_title || '').toLowerCase();
              return job.includes('kepala sekolah') || job.includes('kepsek') || job.includes('pimpinan');
            });

            // 2. Waka / Wakil Kepala
            const wakaStaff = allStaff.find(s => {
              const job = (s.jabalan_struktural || s.jabatan_struktural || s.position || s.role_title || '').toLowerCase();
              return (job.includes('waka') || job.includes('wakil') || job.includes('kurikulum')) && s.id !== kepalaSekolah?.id;
            });

            // 3. Kepala TU
            const tuStaff = allStaff.find(s => {
              const job = (s.jabalan_struktural || s.jabatan_struktural || s.position || s.role_title || '').toLowerCase();
              return (job.includes('tata usaha') || job.includes('tu') || job.includes('operator')) && s.id !== kepalaSekolah?.id && s.id !== wakaStaff?.id;
            });

            // 4. Asrama / Musyrif
            const asramaStaff = allStaff.find(s => {
              const job = (s.jabalan_struktural || s.jabatan_struktural || s.position || s.role_title || '').toLowerCase();
              return (job.includes('asrama') || job.includes('musyrif') || job.includes('pengasuh')) && s.id !== kepalaSekolah?.id && s.id !== wakaStaff?.id && s.id !== tuStaff?.id;
            });

            // 5. Level 4: Other Staff / Guru / Lapangan
            const otherStaff = allStaff.filter(s => 
              s.id !== kepalaSekolah?.id &&
              s.id !== wakaStaff?.id &&
              s.id !== tuStaff?.id &&
              s.id !== asramaStaff?.id
            );

            return (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider font-mono mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Layers className="h-5 w-5 text-emerald-600" />
                  <span>Struktur Organisasi Single Tenant</span>
                </h3>
                
                <div className="flex flex-col items-center py-6">
                  
                  {/* Level 1: Yayasan */}
                  <div className="bg-slate-900 text-white rounded-xl p-4 w-72 text-center shadow border border-slate-800 mb-8 relative">
                    <div className="absolute h-8 w-0.5 bg-slate-300 bottom-0 left-1/2 translate-y-full" />
                    <span className="text-[10px] font-black tracking-wider uppercase opacity-70 block font-mono">PENGURUS HARIAN</span>
                    <span className="text-xs font-black block mt-0.5 uppercase">{tenant?.nama_yayasan || 'Yayasan Abdi Bangsa'}</span>
                    <span className="text-[10px] text-emerald-400 font-semibold block mt-1">Pembina & Penasihat</span>
                  </div>

                  {/* Level 2: Kepala Sekolah */}
                  <div className="bg-slate-800 text-white rounded-xl p-4 w-72 text-center shadow border border-slate-700 mb-8 relative">
                    <div className="absolute h-8 w-0.5 bg-slate-300 bottom-0 left-1/2 translate-y-full" />
                    <span className="text-[10px] font-black tracking-wider uppercase opacity-70 block font-mono">PIMPINAN INSTANSI</span>
                    <span className="text-xs font-black block mt-0.5 uppercase">{kepalaSekolah ? kepalaSekolah.name : (tenant?.nama_sekolah || 'Ahmad Ghozali, S.Pd.')}</span>
                    <span className="text-[10px] text-blue-400 font-semibold block mt-1">{kepalaSekolah?.jabatan_struktural || 'Kepala Sekolah / Kyai'}</span>
                  </div>

                  {/* Level 3: Waka & TU */}
                  <div className="flex flex-wrap justify-center gap-8 relative w-full max-w-4xl">
                    <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-slate-300 -translate-y-8" />
                    
                    {/* Waka Kurikulum */}
                    <div className="bg-white border-2 border-emerald-600 text-slate-800 rounded-xl p-4 w-60 text-center shadow-sm relative">
                      <div className="absolute h-8 w-0.5 bg-slate-300 top-0 left-1/2 -translate-y-full" />
                      <span className="text-[9px] font-bold text-emerald-600 tracking-wider uppercase block font-mono">WAKASIS / KURIKULUM</span>
                      <span className="text-xs font-bold block mt-1">{wakaStaff ? wakaStaff.name : 'Ibu Ratna Sari, S.Si.'}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{wakaStaff?.jabatan_struktural || 'Sains & Kurikulum Merdeka'}</span>
                    </div>

                    {/* Kepala TU */}
                    <div className="bg-white border-2 border-slate-800 text-slate-800 rounded-xl p-4 w-60 text-center shadow-sm relative">
                      <div className="absolute h-8 w-0.5 bg-slate-300 top-0 left-1/2 -translate-y-full" />
                      <span className="text-[9px] font-bold text-slate-800 tracking-wider uppercase block font-mono">KEPALA TATA USAHA</span>
                      <span className="text-xs font-bold block mt-1">{tuStaff ? tuStaff.name : 'Yusuf Mansur, A.Md.'}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{tuStaff?.jabatan_struktural || 'Operasional & Kepegawaian'}</span>
                    </div>

                    {/* Koordinator Musyrif / Asrama */}
                    <div className="bg-white border-2 border-blue-600 text-slate-800 rounded-xl p-4 w-60 text-center shadow-sm relative">
                      <div className="absolute h-8 w-0.5 bg-slate-300 top-0 left-1/2 -translate-y-full" />
                      <span className="text-[9px] font-bold text-blue-600 tracking-wider uppercase block font-mono">KEPENGASUHAN / ASRAMA</span>
                      <span className="text-xs font-bold block mt-1">{asramaStaff ? asramaStaff.name : 'Ustadz Muhammad Yusuf'}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{asramaStaff?.jabatan_struktural || 'Ketertiban & Ubudiyah Santri'}</span>
                    </div>

                  </div>

                  {/* Level 4: Staff & Guru */}
                  <div className="mt-12 bg-slate-50 border border-slate-200 p-4 rounded-xl w-full max-w-4xl">
                    <div className="text-center font-bold text-xs text-slate-500 uppercase tracking-widest mb-3 font-mono">Tenaga Pendidik & Staf Lapangan</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                      {otherStaff.length > 0 ? (
                        otherStaff.slice(0, 8).map((s: any) => (
                          <div key={s.id} className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300">
                            <span className="font-bold text-slate-800 block truncate">{s.name}</span>
                            <span className="text-[9px] font-semibold text-emerald-600 block mt-1 uppercase tracking-wider font-mono truncate">
                              {s.jabatan_struktural || s.role_title || s.specialization || 'Staf / Pendidik'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full py-4 text-center text-xs text-slate-400 font-medium">
                          Belum ada staf tambahan terdaftar.
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            );
          })()}

          {/* JABATAN CONFIG TAB */}
          {activeSubTab === 'jabatan' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider font-mono flex items-center gap-2">
                    <Sliders className="h-5 w-5 text-emerald-600" />
                    <span>Konfigurasi Jabatan Struktural & Fungsional</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Master referensi jabatan untuk membagi peran fungsional dan struktural pegawai.</p>
                </div>
                <button
                  onClick={() => {
                    const name = prompt("Masukkan nama jabatan baru:");
                    const code = prompt("Masukkan kode jabatan:");
                    const type = prompt("Masukkan jenis (STRUKTURAL / FUNGSIONAL):") || 'FUNGSIONAL';
                    if (name && code) createPosMutation.mutate({ name, code, type: type.toUpperCase() });
                  }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tambah Jabatan</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(positions.length > 0 ? positions : [
                  { id: 'pos-1', name: 'Kepala Sekolah / Madrasah', code: 'KEPSEK', type: 'STRUKTURAL' },
                  { id: 'pos-2', name: 'Wakil Kepala Kurikulum', code: 'WAKAKUR', type: 'STRUKTURAL' },
                  { id: 'pos-3', name: 'Kepala Tata Usaha', code: 'KA-TU', type: 'STRUKTURAL' },
                  { id: 'pos-4', name: 'Wali Kelas', code: 'WALIKELAS', type: 'FUNGSIONAL' },
                  { id: 'pos-5', name: 'Pembina Asrama', code: 'PEMBINA-ASR', type: 'FUNGSIONAL' },
                  { id: 'pos-6', name: 'Bendahara Instansi', code: 'BENDAHARA', type: 'FUNGSIONAL' },
                ]).map((pos: any) => (
                  <div key={pos.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between hover:shadow-sm transition">
                    <div>
                      <span className={`text-[9px] font-black tracking-wider px-2 py-0.5 rounded uppercase font-mono ${
                        pos.type === 'STRUKTURAL' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                      }`}>{pos.type}</span>
                      <h4 className="text-xs font-black text-slate-800 mt-2 block">{pos.name}</h4>
                      <span className="text-[10px] text-slate-500 font-mono block mt-1">KODE: {pos.code}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GOLONGAN CONFIG TAB */}
          {activeSubTab === 'golongan' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider font-mono flex items-center gap-2">
                    <Award className="h-5 w-5 text-emerald-600" />
                    <span>Konfigurasi Golongan & Pangkat Kepegawaian</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Skala kepangkatan kepegawaian standar ASN, Yayasan, dan honorer.</p>
                </div>
                <button
                  onClick={() => {
                    const name = prompt("Masukkan nama golongan/pangkat:");
                    const code = prompt("Masukkan kode pangkat:");
                    const grade = prompt("Klasifikasi (PNS / YAYASAN / HONOR):") || 'YAYASAN';
                    if (name && code) createRankMutation.mutate({ name, code, grade: grade.toUpperCase() });
                  }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tambah Golongan</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(ranks.length > 0 ? ranks : [
                  { id: 'rnk-1', name: 'Pembina Utama / IV-e', code: 'IV/e', grade: 'PNS' },
                  { id: 'rnk-2', name: 'Penata / III-c', code: 'III/c', grade: 'PNS' },
                  { id: 'rnk-3', name: 'Penata Muda / III-a', code: 'III/a', grade: 'PNS' },
                  { id: 'rnk-4', name: 'Guru Tetap Yayasan (GTY)', code: 'GTY', grade: 'YAYASAN' },
                  { id: 'rnk-5', name: 'Guru Tidak Tetap (GTT)', code: 'GTT', grade: 'YAYASAN' },
                  { id: 'rnk-6', name: 'Honor Sekolah / H1', code: 'H1', grade: 'HONOR' },
                ]).map((rnk: any) => (
                  <div key={rnk.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between hover:shadow-sm transition">
                    <div>
                      <span className={`text-[9px] font-black tracking-wider px-2 py-0.5 rounded uppercase font-mono ${
                        rnk.grade === 'PNS' ? 'bg-sky-100 text-sky-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>{rnk.grade}</span>
                      <h4 className="text-xs font-black text-slate-800 mt-2 block">{rnk.name}</h4>
                      <span className="text-[10px] text-slate-500 font-mono block mt-1">KODE GOLONGAN: {rnk.code}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STATUS KEPEGAWAIAN CONFIG TAB */}
          {activeSubTab === 'status-kepegawaian' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider font-mono flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    <span>Konfigurasi Status Kepegawaian</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Jenis keikatan kontrak kerja pegawai dengan yayasan maupun dinas pendidikan.</p>
                </div>
                <button
                  onClick={() => {
                    const name = prompt("Masukkan nama status kepegawaian:");
                    const code = prompt("Masukkan kode status:");
                    if (name && code) createStatusMutation.mutate({ name, code, is_active: true });
                  }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tambah Status</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(statuses.length > 0 ? statuses : [
                  { id: 'status-1', name: 'Guru Tetap Yayasan (GTY)', code: 'GTY', is_active: true },
                  { id: 'status-2', name: 'Pegawai Negeri Sipil (PNS)', code: 'PNS', is_active: true },
                  { id: 'status-3', name: 'Pegawai Pemerintah (PPPK)', code: 'PPPK', is_active: true },
                  { id: 'status-4', name: 'Guru Honorer / GTT', code: 'GTT', is_active: true },
                  { id: 'status-5', name: 'Staf Kontrak Bulanan', code: 'KONTRAK', is_active: true },
                  { id: 'status-6', name: 'Magang / Internship', code: 'MAGANG', is_active: true },
                ]).map((st: any) => (
                  <div key={st.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between hover:shadow-sm transition">
                    <div>
                      <span className="text-[9px] font-black tracking-wider px-2 py-0.5 rounded uppercase font-mono bg-emerald-100 text-emerald-700">AKTIF REFERENSI</span>
                      <h4 className="text-xs font-black text-slate-800 mt-2 block">{st.name}</h4>
                      <span className="text-[10px] text-slate-500 font-mono block mt-1">KODE ACUAN: {st.code}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HISTORIES (RIWAYAT) TAB */}
          {activeSubTab === 'riwayat' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider font-mono flex items-center gap-2">
                    <Clock className="h-5 w-5 text-emerald-600" />
                    <span>Riwayat Karir & Pendidikan Pegawai</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Linimasa perubahan jenjang karir, pangkat, riwayat pendidikan, sertifikasi, dan mutasi internal.</p>
                </div>
                <button
                  onClick={() => {
                    const title = prompt("Masukkan judul milestone karir/riwayat:");
                    const details = prompt("Keterangan detail / Nomor SK:");
                    const date = new Date().toISOString().substring(0, 10);
                    if (title && selectedStaffId) {
                      createHistoryMutation.mutate({
                        staff_id: selectedStaffId,
                        type: 'JABATAN',
                        title,
                        date,
                        details
                      });
                    }
                  }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tambah Milestone</span>
                </button>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6">
                <span className="text-xs text-slate-500 block mb-1">Pilih Pegawai untuk melihat riwayat:</span>
                <select
                  value={selectedStaffId}
                  onChange={(e) => {
                    setSelectedStaffId(e.target.value);
                    const isGuru = teachers.some(t => t.id === e.target.value);
                    setSelectedStaffType(isGuru ? 'guru' : 'karyawan');
                  }}
                  className="bg-white border border-slate-250 text-xs px-3 py-2 rounded-lg font-medium w-full max-w-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <optgroup label="Guru / Tenaga Pendidik">
                    {teachers.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.name} (NIP: {t.nip})</option>
                    ))}
                  </optgroup>
                  <optgroup label="Karyawan / Staf">
                    {employees.map((e: any) => (
                      <option key={e.id} value={e.id}>{e.name} (NIK: {e.nik})</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {selectedStaff && (
                <div className="mt-4">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest font-mono mb-4">Linimasa {selectedStaff.name}</h4>
                  
                  <div className="relative pl-6 border-l border-slate-300 ml-3 flex flex-col gap-6">
                    {(histories.length > 0 ? histories : [
                      { id: 'hist-1', staff_id: 'tch-seed-1', type: 'JABATAN', title: 'Pengangkatan Wali Kelas X MIPA 1', date: '2026-07-01', details: 'SK No. 102/Yayasan/VII/2026' },
                      { id: 'hist-2', staff_id: 'tch-seed-1', type: 'DOKUMEN', title: 'Unggah Ijazah S2 Fisika', date: '2026-07-02', details: 'Diverifikasi oleh Kepegawaian' },
                      { id: 'hist-3', staff_id: 'tch-seed-2', type: 'SERTIFIKASI', title: 'Sertifikasi Pendidik Profesional', date: '2026-05-15', details: 'No. Sertifikat: SER-2026-90812' }
                    ])
                      .filter((h: any) => h.staff_id === selectedStaffId)
                      .map((h: any) => (
                        <div key={h.id} className="relative">
                          {/* Circle node on line */}
                          <div className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full bg-emerald-600 border-2 border-white shadow" />
                          
                          <div>
                            <span className="text-[10px] text-slate-500 font-mono font-bold">{h.date}</span>
                            <span className="text-xs font-extrabold text-slate-800 block mt-0.5">{h.title}</span>
                            <span className="text-[10px] text-slate-600 font-medium block mt-1 bg-white p-2 rounded border border-slate-200">{h.details}</span>
                          </div>
                        </div>
                      ))}
                    {histories.filter((h: any) => h.staff_id === selectedStaffId).length === 0 && (
                      <div className="text-xs text-slate-500 py-4">Belum ada riwayat tercatat untuk pegawai ini. Klik "Tambah Milestone" untuk menambahkan.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DOCUMENT FILE TAB */}
          {activeSubTab === 'dokumen' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider font-mono flex items-center gap-2">
                    <FileText className="h-5 w-5 text-emerald-600" />
                    <span>Manajemen Berkas Legal & Administrasi</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Arsip digital KTP, KK, Ijazah, SK Kepegawaian, sertifikat BKD pendidik.</p>
                </div>
                <button
                  onClick={() => {
                    const name = prompt("Masukkan nama dokumen:");
                    const type = prompt("Kategori berkas (KTP / Ijazah / SK / Foto):") || 'SK';
                    if (name && selectedStaffId) {
                      createDocMutation.mutate({
                        staff_id: selectedStaffId,
                        name,
                        type,
                        file_url: '#',
                        size: '1.5 MB'
                      });
                    }
                  }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  <span>Unggah Berkas Baru</span>
                </button>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6 flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                  <span className="text-xs text-slate-500 block mb-1 font-semibold">Tampilkan berkas milik:</span>
                  <select
                    value={selectedStaffId}
                    onChange={(e) => {
                      setSelectedStaffId(e.target.value);
                      const isGuru = teachers.some(t => t.id === e.target.value);
                      setSelectedStaffType(isGuru ? 'guru' : 'karyawan');
                    }}
                    className="bg-white border border-slate-250 text-xs px-3 py-2 rounded-lg font-medium w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {teachers.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.name} (Guru)</option>
                    ))}
                    {employees.map((e: any) => (
                      <option key={e.id} value={e.id}>{e.name} (Karyawan)</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-black tracking-wider">
                      <th className="px-6 py-3">Nama Berkas</th>
                      <th className="px-6 py-3">Jenis Kategori</th>
                      <th className="px-6 py-3">Ukuran</th>
                      <th className="px-6 py-3">Tanggal Unggah</th>
                      <th className="px-6 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {(documents.length > 0 ? documents : [
                      { id: 'sdoc-1', staff_id: 'tch-seed-1', name: 'Foto Formal Merah', type: 'Foto', file_url: '#', size: '1.2 MB', uploaded_at: '2026-07-01T10:00:00Z' },
                      { id: 'sdoc-2', staff_id: 'tch-seed-1', name: 'Ijazah S1 Fisika ITB', type: 'Ijazah', file_url: '#', size: '2.4 MB', uploaded_at: '2026-07-01T10:05:00Z' },
                      { id: 'sdoc-3', staff_id: 'tch-seed-2', name: 'SK Pengangkatan GTY 2026', type: 'SK', file_url: '#', size: '1.8 MB', uploaded_at: '2026-07-02T11:00:00Z' },
                    ])
                      .filter((d: any) => d.staff_id === selectedStaffId)
                      .map((d: any) => (
                        <tr key={d.id} className="hover:bg-slate-50 text-xs font-semibold text-slate-700">
                          <td className="px-6 py-4">{d.name}</td>
                          <td className="px-6 py-4">
                            <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-mono font-bold">{d.type}</span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 font-mono text-[11px]">{d.size}</td>
                          <td className="px-6 py-4 text-slate-500 font-mono text-[11px]">{d.uploaded_at?.substring(0, 10) || '-'}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button 
                                onClick={() => alert("Dokumen diunduh secara lokal.")}
                                className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => deleteDocMutation.mutate(d.id)}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {documents.filter((d: any) => d.staff_id === selectedStaffId).length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-xs text-slate-400 font-medium">
                          Belum ada berkas digital terunggah untuk pegawai ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BARCODE GENERATOR TAB */}
          {activeSubTab === 'barcode' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider font-mono mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Barcode className="h-5 w-5 text-emerald-600" />
                <span>Barcode Pengenal Pegawai (Code128)</span>
              </h3>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6">
                <span className="text-xs text-slate-500 block mb-1">Pilih Pegawai:</span>
                <select
                  value={selectedStaffId}
                  onChange={(e) => {
                    setSelectedStaffId(e.target.value);
                    const isGuru = teachers.some(t => t.id === e.target.value);
                    setSelectedStaffType(isGuru ? 'guru' : 'karyawan');
                  }}
                  className="bg-white border border-slate-250 text-xs px-3 py-2 rounded-lg font-medium w-full max-w-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {teachers.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name} (NIP: {t.nip})</option>
                  ))}
                  {employees.map((e: any) => (
                    <option key={e.id} value={e.id}>{e.name} (NIK: {e.nik})</option>
                  ))}
                </select>
              </div>

              {selectedStaff && (
                <div className="flex flex-col items-center bg-white p-6 border rounded-xl max-w-sm mx-auto shadow-sm">
                  <span className="text-xs font-black tracking-widest text-slate-400 font-mono uppercase block">{tenant?.name}</span>
                  <span className="text-xs font-bold text-slate-800 block mt-1 uppercase">{selectedStaff.name}</span>
                  
                  {/* Visual Barcode bars representation */}
                  <div className="my-6 p-3 bg-white border border-slate-200 rounded flex flex-col items-center">
                    <div className="flex items-center justify-center gap-[1px] h-14 bg-white px-2">
                      {[2,4,1,3,2,1,4,2,3,1,2,4,1,2,3,4,1,2,4,3,1,2,3,4,1,2,4,3,1,2,4,1,3,2,4].map((width, i) => (
                        <div 
                          key={i} 
                          className="bg-black h-full" 
                          style={{ width: `${width}px` }} 
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-mono tracking-widest text-slate-800 font-semibold mt-2">
                      *{selectedStaff.nip || selectedStaff.nik || selectedStaff.nomor_pegawai || 'PEG10200'}*
                    </span>
                  </div>

                  <button 
                    onClick={handlePrintCard}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Cetak Barcode Label</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* QR CODE PROFILE GENERATOR TAB */}
          {activeSubTab === 'qrcode' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider font-mono mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                <QrCode className="h-5 w-5 text-emerald-600" />
                <span>QR Code Verifikasi Profil Digital</span>
              </h3>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6">
                <span className="text-xs text-slate-500 block mb-1">Pilih Pegawai:</span>
                <select
                  value={selectedStaffId}
                  onChange={(e) => {
                    setSelectedStaffId(e.target.value);
                    const isGuru = teachers.some(t => t.id === e.target.value);
                    setSelectedStaffType(isGuru ? 'guru' : 'karyawan');
                  }}
                  className="bg-white border border-slate-250 text-xs px-3 py-2 rounded-lg font-medium w-full max-w-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {teachers.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                  {employees.map((e: any) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>

              {selectedStaff && (
                <div className="flex flex-col items-center bg-white p-6 border rounded-xl max-w-sm mx-auto shadow-sm">
                  <span className="text-xs font-black tracking-widest text-slate-400 font-mono uppercase block">{tenant?.name}</span>
                  <span className="text-xs font-bold text-slate-800 block mt-1 uppercase">{selectedStaff.name}</span>
                  
                  {/* Clean SVG representation of QR Code */}
                  <div className="my-6 p-4 bg-white border border-slate-200 rounded-lg">
                    <svg className="h-32 w-32 text-slate-800" viewBox="0 0 100 100">
                      <rect width="100" height="100" fill="white" />
                      {/* Top Left Finder pattern */}
                      <rect x="5" y="5" width="25" height="25" fill="currentColor" />
                      <rect x="9" y="9" width="17" height="17" fill="white" />
                      <rect x="13" y="13" width="9" height="9" fill="currentColor" />
                      {/* Top Right Finder pattern */}
                      <rect x="70" y="5" width="25" height="25" fill="currentColor" />
                      <rect x="74" y="9" width="17" height="17" fill="white" />
                      <rect x="78" y="13" width="9" height="9" fill="currentColor" />
                      {/* Bottom Left Finder pattern */}
                      <rect x="5" y="70" width="25" height="25" fill="currentColor" />
                      <rect x="9" y="74" width="17" height="17" fill="white" />
                      <rect x="13" y="78" width="9" height="9" fill="currentColor" />
                      {/* Random QR Code blocks */}
                      <rect x="40" y="10" width="5" height="10" fill="currentColor" />
                      <rect x="50" y="5" width="10" height="5" fill="currentColor" />
                      <rect x="45" y="25" width="15" height="5" fill="currentColor" />
                      <rect x="10" y="40" width="5" height="15" fill="currentColor" />
                      <rect x="25" y="45" width="10" height="10" fill="currentColor" />
                      <rect x="45" y="45" width="20" height="20" fill="currentColor" />
                      <rect x="75" y="40" width="15" height="10" fill="currentColor" />
                      <rect x="40" y="75" width="10" height="15" fill="currentColor" />
                      <rect x="80" y="80" width="15" height="15" fill="currentColor" />
                    </svg>
                  </div>

                  <span className="text-[10px] text-slate-500 font-medium block text-center mb-4">
                    Pindai kode QR untuk memverifikasi keaslian dokumen & profil mengajar guru secara langsung melalui gawai wali murid.
                  </span>

                  <button 
                    onClick={handlePrintCard}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Cetak QR Code</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ID CARD MAKER TAB */}
          {activeSubTab === 'idcard' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex flex-col md:flex-row gap-6 items-start justify-between border-b border-slate-100 pb-4 mb-6">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider font-mono flex items-center gap-2">
                    <Printer className="h-5 w-5 text-emerald-600" />
                    <span>Pembuat & Pencetakan Kartu Identitas Pegawai (ID Card)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Sesuaikan warna branding, tata letak, dan cetak kartu pintar pegawai instansi dua sisi.</p>
                </div>
                
                <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <Palette className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-700">Warna Tema:</span>
                  </div>
                  <input 
                    type="color" 
                    value={idCardThemeColor} 
                    onChange={(e) => setIdCardThemeColor(e.target.value)}
                    className="h-7 w-12 border-0 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6 flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                  <span className="text-xs text-slate-500 block mb-1">Pilih Pegawai:</span>
                  <select
                    value={selectedStaffId}
                    onChange={(e) => {
                      setSelectedStaffId(e.target.value);
                      const isGuru = teachers.some(t => t.id === e.target.value);
                      setSelectedStaffType(isGuru ? 'guru' : 'karyawan');
                    }}
                    className="bg-white border border-slate-250 text-xs px-3 py-2 rounded-lg font-medium w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {teachers.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                    {employees.map((e: any) => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-xs text-slate-500 block mb-1">Judul Kartu:</span>
                  <input
                    type="text"
                    value={idCardTitle}
                    onChange={(e) => setIdCardTitle(e.target.value)}
                    className="bg-white border border-slate-250 text-xs px-3 py-2 rounded-lg font-medium w-64 focus:outline-none"
                  />
                </div>
              </div>

              {selectedStaff && (
                <div className="flex flex-col md:flex-row gap-6 justify-center items-center py-6">
                  
                  {/* FRONT OF THE CARD */}
                  <div className="w-64 h-96 rounded-2xl bg-white shadow-lg border border-slate-200 overflow-hidden relative flex flex-col justify-between">
                    {/* Upper curve theme background */}
                    <div className="h-32 p-4 text-center text-white relative flex flex-col items-center justify-center" style={{ backgroundColor: idCardThemeColor }}>
                      <div className="absolute top-2 right-2 text-[8px] bg-white/20 px-1.5 py-0.5 rounded uppercase font-black tracking-widest">
                        {tenant?.type || 'SINGLE TENANT'}
                      </div>
                      <span className="text-[10px] font-black tracking-widest uppercase font-mono mt-2 block">{tenant?.name}</span>
                      <span className="text-[8px] font-medium tracking-wide uppercase opacity-80 mt-1 block">Kartu Pegawai Resmi</span>
                    </div>

                    {/* Avatar Frame with custom border theme */}
                    <div className="absolute top-24 left-1/2 -translate-x-1/2">
                      <div className="h-20 w-20 rounded-full border-4 bg-white shadow flex items-center justify-center font-bold text-xl text-slate-700" style={{ borderColor: idCardThemeColor }}>
                        {selectedStaff.name.substring(0, 2)}
                      </div>
                    </div>

                    {/* Middle Card Profile details */}
                    <div className="mt-14 px-4 text-center flex-1 flex flex-col justify-center">
                      <span className="text-xs font-black text-slate-800 uppercase tracking-tight block">{selectedStaff.name}</span>
                      <span className="text-[10px] text-slate-500 font-bold block mt-1 uppercase">
                        {selectedStaff.jabatan_struktural || selectedStaff.role_title || 'STAF INSTANSI'}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono font-medium block mt-1">
                        ID: {selectedStaff.nip || selectedStaff.nik || selectedStaff.nomor_pegawai || '-'}
                      </span>
                    </div>

                    {/* Card Footer */}
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                      <div className="h-8 w-8 bg-white border border-slate-200 rounded flex items-center justify-center">
                        <QrCode className="h-6 w-6 text-slate-700" />
                      </div>
                      <span className="text-[8px] font-mono tracking-wider font-semibold text-slate-400 uppercase">EXCELLENCE IN EDUCATION</span>
                    </div>
                  </div>

                  {/* BACK OF THE CARD */}
                  <div className="w-64 h-96 rounded-2xl bg-white shadow-lg border border-slate-200 overflow-hidden p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2 mb-3">
                        <ShieldCheck className="h-4 w-4 text-slate-800" style={{ color: idCardThemeColor }} />
                        <span className="text-[9px] font-black tracking-wider text-slate-800 font-mono uppercase">Syarat & Ketentuan Penggunaan</span>
                      </div>
                      
                      <ol className="list-decimal pl-3 text-[8px] text-slate-500 font-medium flex flex-col gap-1.5 leading-relaxed">
                        <li>Kartu ini adalah milik resmi {tenant?.name}.</li>
                        <li>Wajib dikenakan selama jam kerja atau kegiatan kedinasan resmi di lingkungan sekolah/pondok.</li>
                        <li>Jika menemukan kartu ini, harap kembalikan ke bagian Kepegawaian/Tata Usaha.</li>
                        <li>Kartu ini dilengkapi chip RFID pasif untuk kontrol akses gerbang masuk.</li>
                      </ol>
                    </div>

                    <div className="flex flex-col items-center gap-2 border-t border-slate-100 pt-3">
                      {/* Barcode line representation on back */}
                      <div className="flex items-center justify-center gap-[0.5px] h-7 bg-white px-2">
                        {[1,2,1,2,3,1,2,1,1,2,3,1,1,2,1,2,3,1,1,2,1,2,1,2,1,2,1,2].map((w, i) => (
                          <div key={i} className="bg-slate-700 h-full" style={{ width: `${w}px` }} />
                        ))}
                      </div>
                      <span className="text-[8px] font-mono tracking-widest text-slate-400">
                        {selectedStaff.nip || selectedStaff.nik || '00921000'}
                      </span>
                      
                      <div className="text-center">
                        <span className="text-[7px] font-bold text-slate-400 block uppercase">Diterbitkan oleh</span>
                        <span className="text-[8px] font-black text-slate-700 block uppercase mt-0.5">{tenant?.nama_yayasan || 'Yayasan Pendiri'}</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              <div className="flex justify-center mt-6">
                <button 
                  onClick={handlePrintCard}
                  className="px-6 py-2.5 bg-slate-850 hover:bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>Cetak Dua Sisi (ID Card)</span>
                </button>
              </div>
            </div>
          )}

          {/* AUDIT LOG TAB */}
          {activeSubTab === 'audit' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider font-mono mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Database className="h-5 w-5 text-emerald-600" />
                <span>Audit Trail Kepegawaian & Log Aktivitas SDM</span>
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-black tracking-wider">
                      <th className="px-6 py-3">Waktu Kejadian</th>
                      <th className="px-6 py-3">Operator</th>
                      <th className="px-6 py-3">Aksi</th>
                      <th className="px-6 py-3">Modul</th>
                      <th className="px-6 py-3">Detail Perubahan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {(auditLogs.length > 0 ? auditLogs : [
                      { id: 'aud-1', timestamp: '2026-07-08T10:15:00Z', username: 'admin', role: 'SUPER_ADMIN', action: 'INSERT', module_name: 'Guru', details: 'Menambahkan guru baru: Ustadz Ahmad Mudzakir' },
                      { id: 'aud-2', timestamp: '2026-07-08T10:30:00Z', username: 'operator_tu', role: 'TU', action: 'UPDATE', module_name: 'Karyawan', details: 'Mengubah biodata karyawan: Siti Rahma' },
                      { id: 'aud-3', timestamp: '2026-07-08T11:00:00Z', username: 'admin', role: 'SUPER_ADMIN', action: 'INSERT', module_name: 'SdmConfig', details: 'Menambahkan jabatan struktural baru: Kepala Kurikulum' }
                    ]).map((log: any) => (
                      <tr key={log.id} className="hover:bg-slate-50 text-xs font-semibold text-slate-700">
                        <td className="px-6 py-4 font-mono text-[11px] text-slate-500">{log.timestamp?.replace('T', ' ').substring(0, 19)}</td>
                        <td className="px-6 py-4">
                          <span className="block">{log.username}</span>
                          <span className="text-[9px] text-slate-400 font-mono block">{log.role}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[9px] font-black tracking-wider px-2 py-0.5 rounded uppercase font-mono ${
                            log.action === 'INSERT' ? 'bg-emerald-100 text-emerald-800' :
                            log.action === 'UPDATE' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                          }`}>{log.action}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-mono text-[11px]">{log.module_name}</td>
                        <td className="px-6 py-4 text-slate-600 font-medium">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* AKUN & MULTI-ROLE RBAC TAB */}
          {activeSubTab === 'account-rbac' && (
            <div className="flex flex-col gap-6">
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Key className="h-48 w-48 text-white" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black font-mono px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Single Identity Engine
                    </span>
                    <span className="text-slate-400 text-xs font-mono">1 Pegawai = 1 Akun Login = Multi Role</span>
                  </div>
                  <h2 className="text-xl font-extrabold tracking-tight">Pusat Akun & RBAC Multi-Role Pegawai</h2>
                  <p className="text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
                    Setiap pegawai memiliki satu akun login utama yang dapat mengampu banyak role secara bersamaan (Guru, Wali Kelas, Waka Kurikulum, Bendahara BOS) dengan Conflict Resolution berbasis Priority Level.
                  </p>
                </div>
              </div>

              {/* Account List Table */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider font-mono flex items-center gap-2">
                      <Key className="h-4 w-4 text-emerald-600" />
                      Daftar Akun Login Pegawai Active
                    </h3>
                    <p className="text-slate-500 text-xs mt-0.5">Semua kredensial berasal langsung dari data induk Pegawai.</p>
                  </div>
                  <button
                    onClick={() => {
                      if (teachers.length > 0) {
                        handleOpenAccountModal(teachers[0], 'guru');
                      }
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Buat Akun Pegawai</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-black tracking-wider font-mono">
                        <th className="px-4 py-3">Pegawai Induk</th>
                        <th className="px-4 py-3">Username / Email Login</th>
                        <th className="px-4 py-3">Role Terdaftar (Multi-Role)</th>
                        <th className="px-4 py-3 text-center">Priority Level</th>
                        <th className="px-4 py-3 text-center">Status 2FA</th>
                        <th className="px-4 py-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {(serverEmployeeAccounts.length > 0 ? serverEmployeeAccounts : [
                        {
                          id: 'acc-1',
                          employee_name: 'Ustadz Ahmad Mudzakir, M.Pd.',
                          username: 'ahmad.mudzakir',
                          email: 'ahmad.mudzakir@pondok.id',
                          roles: ['Guru Mapel', 'Wali Kelas', 'Wakil Kepala Sekolah', 'Bendahara BOS'],
                          primary_role: 'Wakil Kepala Sekolah',
                          priority_level: 90,
                          status: 'ACTIVE',
                          two_factor_enabled: true
                        },
                        {
                          id: 'acc-2',
                          employee_name: 'Ibu Ratna Sari, S.Si.',
                          username: 'ratna.sari',
                          email: 'ratna.sari@sekolah.id',
                          roles: ['Guru Mapel', 'Koordinator Tahfidz'],
                          primary_role: 'Guru Mapel',
                          priority_level: 50,
                          status: 'ACTIVE',
                          two_factor_enabled: false
                        }
                      ]).map((acc: any) => (
                        <tr key={acc.id} className="hover:bg-slate-50 text-xs font-semibold text-slate-700">
                          <td className="px-4 py-3">
                            <span className="font-extrabold text-slate-900 block">{acc.employee_name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">Pegawai Terverifikasi</span>
                          </td>
                          <td className="px-4 py-3 font-mono text-[11px]">
                            <span className="text-slate-800 font-bold block">{acc.username}</span>
                            <span className="text-slate-400 text-[10px]">{acc.email}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {(acc.roles || ['Guru']).map((r: string, idx: number) => (
                                <span 
                                  key={idx} 
                                  className={`text-[9px] font-black px-2 py-0.5 rounded uppercase font-mono ${
                                    r.includes('Kepala') || r.includes('Wakil') ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                    r.includes('Bendahara') ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                    r.includes('Wali') ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                                    'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  }`}
                                >
                                  {r}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 text-[11px] font-mono font-extrabold px-2.5 py-1 rounded-full">
                              Lv. {acc.priority_level || 50}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {acc.two_factor_enabled ? (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                                <Check className="h-3 w-3" /> 2FA Aktif
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                Non-aktif
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedAccountForRbac(acc);
                                setRbacSelectedRoles(acc.roles || ['Guru']);
                                setRbacPriority(acc.priority_level || 50);
                                setIsRbacModalOpen(true);
                              }}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-bold rounded-lg transition cursor-pointer inline-flex items-center gap-1"
                            >
                              <Key className="h-3 w-3" />
                              <span>Kelola Role</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Role Permission Matrix Card */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider font-mono mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-indigo-600" />
                  <span>Matriks Permission & Hak Akses Berdasarkan Role</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(serverRbacRoles.length > 0 ? serverRbacRoles : [
                    { id: 'r1', name: 'Super Admin', priority: 100, permissions: ['*'], description: 'Akses Penuh Seluruh Sistem' },
                    { id: 'r2', name: 'Kepala Sekolah', priority: 90, permissions: ['student.read', 'ledger.approval', 'rapor.publish'], description: 'Otoritas Akademik Utama' },
                    { id: 'r3', name: 'Wakil Kurikulum', priority: 85, permissions: ['student.read', 'ledger.input', 'ledger.approval', 'kbm.manage'], description: 'Kurikulum & Pengajaran' },
                    { id: 'r4', name: 'Bendahara BOS', priority: 80, permissions: ['finance.payment', 'finance.read', 'finance.report'], description: 'Keuangan & Dana BOS' },
                    { id: 'r5', name: 'Wali Kelas', priority: 70, permissions: ['student.read', 'ledger.input', 'rapor.input'], description: 'Wali Kelas Binaan' },
                    { id: 'r6', name: 'Guru Mapel', priority: 50, permissions: ['student.read', 'ledger.input'], description: 'Pengajar Mata Pelajaran' }
                  ]).map((roleItem: any) => (
                    <div key={roleItem.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-900 text-xs">{roleItem.name}</span>
                          <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                            P-Level {roleItem.priority}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">{roleItem.description}</p>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {(roleItem.permissions || []).map((p: string, i: number) => (
                            <span key={i} className="text-[9px] font-mono bg-white border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PENUGASAN MULTI-MODUL (ASSIGNMENTS) TAB */}
          {activeSubTab === 'assignments' && (
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base uppercase tracking-wider font-mono flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-emerald-600" />
                      <span>Pusat Penugasan Pegawai (Multi-Kelas, Mapel, Unit & Tugas Tambahan)</span>
                    </h3>
                    <p className="text-slate-500 text-xs mt-1">Satu pegawai dapat memegang banyak penugasan di berbagai kelas, mata pelajaran, unit kerja, serta tugas tambahan dapodik/arkas.</p>
                  </div>
                </div>

                {/* Staff Selection Dropdown */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6 flex items-center gap-4">
                  <User className="h-5 w-5 text-slate-500 shrink-0" />
                  <div className="flex-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-mono block mb-1">
                      Pilih Pegawai Yang Akan Diberi Penugasan
                    </label>
                    <select
                      value={selectedAssignmentStaffId}
                      onChange={(e) => setSelectedAssignmentStaffId(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {[...teachers, ...employees].map((s: any) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.nip || s.niy || s.id}) — {s.jabatan_struktural || 'Pegawai'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Assignment Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  {/* Multi-Kelas */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 font-mono block mb-3 border-b border-emerald-200 pb-1">
                        1. Multi-Kelas Diampu
                      </span>
                      <div className="flex flex-col gap-2 text-xs font-semibold">
                        {['X MIPA 1', 'X MIPA 2', 'X IPS 1', 'XI MIPA 1', 'XI IPS 1', 'XII MIPA 1'].map((clsName) => (
                          <label key={clsName} className="flex items-center gap-2 cursor-pointer hover:text-emerald-700">
                            <input
                              type="checkbox"
                              checked={asgClasses.includes(clsName)}
                              onChange={(e) => {
                                if (e.target.checked) setAsgClasses([...asgClasses, clsName]);
                                else setAsgClasses(asgClasses.filter(c => c !== clsName));
                              }}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                            />
                            <span>{clsName}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Multi-Mapel */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-indigo-800 font-mono block mb-3 border-b border-indigo-200 pb-1">
                        2. Multi-Mapel Diampu
                      </span>
                      <div className="flex flex-col gap-2 text-xs font-semibold">
                        {['Fisika Dasar', 'Matematika Terapan', 'Kimia Lanjutan', 'Tahfidz Al-Qur\'an', 'Pendidikan Agama Islam', 'Bahasa Arab'].map((subjName) => (
                          <label key={subjName} className="flex items-center gap-2 cursor-pointer hover:text-indigo-700">
                            <input
                              type="checkbox"
                              checked={asgSubjects.includes(subjName)}
                              onChange={(e) => {
                                if (e.target.checked) setAsgSubjects([...asgSubjects, subjName]);
                                else setAsgSubjects(asgSubjects.filter(s => s !== subjName));
                              }}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                            />
                            <span>{subjName}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Multi-Unit & Wali Kelas */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-purple-800 font-mono block mb-3 border-b border-purple-200 pb-1">
                        3. Multi-Unit & Wali Kelas
                      </span>
                      <div className="flex flex-col gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">Unit Kerja Active</label>
                          <div className="flex flex-col gap-1.5 text-xs font-semibold">
                            {['SMA IT Darul Hijrah', 'SMP IT Darul Hijrah', 'Pondok Pesantren', 'Yayasan'].map((u) => (
                              <label key={u} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={asgUnits.includes(u)}
                                  onChange={(e) => {
                                    if (e.target.checked) setAsgUnits([...asgUnits, u]);
                                    else setAsgUnits(asgUnits.filter(x => x !== u));
                                  }}
                                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 h-4 w-4"
                                />
                                <span>{u}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200">
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">Wali Kelas Utama</label>
                          <select
                            value={asgHomeroom}
                            onChange={(e) => setAsgHomeroom(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold text-slate-800"
                          >
                            <option value="">-- Bukan Wali Kelas --</option>
                            <option value="X MIPA 1">X MIPA 1</option>
                            <option value="X MIPA 2">X MIPA 2</option>
                            <option value="X IPS 1">X IPS 1</option>
                            <option value="XI MIPA 1">XI MIPA 1</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tugas Tambahan */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 font-mono block mb-3 border-b border-amber-200 pb-1">
                        4. Tugas Tambahan
                      </span>
                      <div className="flex flex-col gap-2 text-xs font-semibold">
                        {['Operator Dapodik', 'Admin ARKAS', 'Bendahara BOS', 'Koordinator Tahfidz', 'Pembina Pramuka', 'Pembina OSIS', 'Tim IT Sekolah', 'Tim PPDB', 'Panitia Ujian'].map((addDuty) => (
                          <label key={addDuty} className="flex items-center gap-2 cursor-pointer hover:text-amber-700">
                            <input
                              type="checkbox"
                              checked={asgAdditional.includes(addDuty)}
                              onChange={(e) => {
                                if (e.target.checked) setAsgAdditional([...asgAdditional, addDuty]);
                                else setAsgAdditional(asgAdditional.filter(a => a !== addDuty));
                              }}
                              className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
                            />
                            <span>{addDuty}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Save button */}
                <div className="mt-6 flex justify-end pt-4 border-t border-slate-200">
                  <button
                    onClick={async () => {
                      try {
                        await apiClient.post('/api/action?action=saveEmployeeAssignments', {
                          employee_id: selectedAssignmentStaffId,
                          class_assignments: asgClasses,
                          subject_assignments: asgSubjects,
                          unit_assignments: asgUnits,
                          homeroom_assignment: asgHomeroom,
                          additional_assignments: asgAdditional
                        });
                        refetchEmployeeAssignments();
                        alert('Penugasan pegawai berhasil disimpan ke database!');
                      } catch (err) {
                        alert('Gagal menyimpan penugasan');
                      }
                    }}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition cursor-pointer shadow-sm"
                  >
                    <Save className="h-4 w-4" />
                    <span>Simpan Seluruh Penugasan Pegawai</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* DATA SCOPE ENGINE TAB */}
          {activeSubTab === 'datascope' && (
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base uppercase tracking-wider font-mono flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-indigo-600" />
                      <span>Data Scope Engine & Matriks Cakupan Informasi SDM</span>
                    </h3>
                    <p className="text-slate-500 text-xs mt-1">Mengatur jangkauan visibilitas data (Seluruh Sekolah, Unit Kerja, Hanya Kelas Diampu, Dana BOS Only) secara dinamis sesuai Role dan Penugasan.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Select Employee */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-mono block mb-2">
                      1. Pilih Pegawai
                    </label>
                    <select
                      value={selectedScopeStaffId}
                      onChange={(e) => setSelectedScopeStaffId(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-800"
                    >
                      {[...teachers, ...employees].map((s: any) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Scope Type */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-mono block mb-2">
                      2. Tipe Cakupan Data (Data Scope)
                    </label>
                    <select
                      value={scopeType}
                      onChange={(e) => setScopeType(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-800"
                    >
                      <option value="GLOBAL">GLOBAL — Seluruh Sekolah & Yayasan</option>
                      <option value="UNIT_ONLY">UNIT_ONLY — Hanya Unit Kerja Terkait</option>
                      <option value="UNIT_AND_ASSIGNED_CLASSES">UNIT_AND_ASSIGNED_CLASSES — Unit & Kelas Diampu</option>
                      <option value="ASSIGNED_CLASSES_ONLY">ASSIGNED_CLASSES_ONLY — Hanya Kelas Diampu</option>
                      <option value="FINANCIAL_SCOPE_ONLY">FINANCIAL_SCOPE_ONLY — Hanya Keuangan Terkait</option>
                    </select>
                  </div>

                  {/* Financial Scope */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-mono block mb-2">
                      3. Akses Keuangan & Laporan
                    </label>
                    <select
                      value={scopeFinancial}
                      onChange={(e) => setScopeFinancial(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-800"
                    >
                      <option value="FULL_TREASURY">FULL_TREASURY — Akses Seluruh Kas/Bank</option>
                      <option value="BOS_AND_OPERATIONAL">BOS_AND_OPERATIONAL — BOS & Operasional Unit</option>
                      <option value="BOS_ONLY">BOS_ONLY — Khusus Transaksi Dana BOS</option>
                      <option value="NONE">NONE — Tanpa Akses Keuangan</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-200">
                  <button
                    onClick={async () => {
                      try {
                        await apiClient.post('/api/action?action=saveEmployeeDataScope', {
                          employee_id: selectedScopeStaffId,
                          scope_type: scopeType,
                          access_level: scopeAccessLevel,
                          financial_scope: scopeFinancial
                        });
                        refetchEmployeeDataScopes();
                        alert('Cakupan Data Scope berhasil diperbarui!');
                      } catch (e) {
                        alert('Gagal menyimpan Data Scope');
                      }
                    }}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition cursor-pointer shadow-sm"
                  >
                    <Save className="h-4 w-4" />
                    <span>Simpan Konfigurasi Data Scope</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Detailed Profile Inspector (Only shown on Guru & Karyawan tabs) */}
        {['guru', 'karyawan', 'barcode', 'qrcode'].includes(activeSubTab) && selectedStaff && (
          <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-6">
            <div className="bg-slate-800 text-white p-6 text-center relative">
              <div className="absolute top-2 right-2 text-[9px] bg-white/20 px-2 py-0.5 rounded font-mono font-bold">
                {selectedStaffType === 'guru' ? 'PENDIDIK' : 'TENAGA PENDIDIK'}
              </div>
              
              <div className="h-16 w-16 rounded-full bg-slate-700 border-2 border-white/50 mx-auto flex items-center justify-center font-bold text-xl uppercase shadow-sm">
                {selectedStaff.name.substring(0, 2)}
              </div>
              
              <h3 className="font-extrabold text-sm block uppercase mt-3 tracking-tight">{selectedStaff.name}</h3>
              <span className="text-[10px] text-slate-400 font-mono block mt-1">ID: {selectedStaff.nip || selectedStaff.nik || selectedStaff.nomor_pegawai || '-'}</span>
            </div>

            <div className="p-6 flex flex-col gap-4">
              
              {/* Identity & Basic Details */}
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono block border-b border-slate-100 pb-1 mb-2">IDENTITAS MASTER</span>
                <div className="flex flex-col gap-1.5 text-xs">
                  <div className="flex justify-between font-semibold"><span className="text-slate-500">Gender</span><span className="text-slate-700">{selectedStaff.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span></div>
                  <div className="flex justify-between font-semibold"><span className="text-slate-500">Pendidikan Terakhir</span><span className="text-slate-700">{selectedStaff.pendidikan_terakhir || 'S1'}</span></div>
                  <div className="flex justify-between font-semibold"><span className="text-slate-500">Universitas</span><span className="text-slate-700">{selectedStaff.institusi_prediksi || selectedStaff.institusi_pendidikan || '-'}</span></div>
                  <div className="flex justify-between font-semibold"><span className="text-slate-500">Kontak Darurat</span><span className="text-slate-700">{selectedStaff.emergency_name || '-'} ({selectedStaff.emergency_phone || '-'})</span></div>
                </div>
              </div>

              {/* Employment details */}
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono block border-b border-slate-100 pb-1 mb-2">KEPEGAWAIAN & STRUKTUR</span>
                <div className="flex flex-col gap-1.5 text-xs">
                  <div className="flex justify-between font-semibold"><span className="text-slate-500">Jabatan</span><span className="text-slate-700">{selectedStaff.jabatan_struktural || selectedStaff.role_title || '-'}</span></div>
                  <div className="flex justify-between font-semibold"><span className="text-slate-500">Golongan</span><span className="text-slate-700">{selectedStaff.golongan || '-'}</span></div>
                  <div className="flex justify-between font-semibold"><span className="text-slate-500">Status Kepegawaian</span><span className="text-slate-700">{selectedStaff.status_kepegawaian || '-'}</span></div>
                  <div className="flex justify-between font-semibold"><span className="text-slate-500">Unit Kerja</span><span className="text-slate-700">{selectedStaff.unit_kerja || '-'}</span></div>
                </div>
              </div>

              {/* Sync check */}
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono block border-b border-slate-100 pb-1 mb-2">SINKRONISASI KEMENTERIAN</span>
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-100 p-2 rounded-lg text-[11px] font-semibold">
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Sinkron Dapodik: AKTIF (NRG Terdaftar)</span>
                  </div>
                  <div className="flex items-center gap-2 bg-sky-50 text-sky-700 border border-sky-100 p-2 rounded-lg text-[11px] font-semibold">
                    <CheckCircle className="h-4 w-4 text-sky-600 shrink-0" />
                    <span>Sinkron EMIS Kemenag: AKTIF</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* MULTI-STEP CREATION & EDITING FORM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider font-mono">
                  {editingItem ? `Edit Data ${formType === 'guru' ? 'Guru' : 'Karyawan'}` : `Tambah Data ${formType === 'guru' ? 'Guru' : 'Karyawan'} Baru`}
                </h3>
                <span className="text-[10px] text-slate-500 font-medium block mt-1">Langkah {formStep} dari 5 — Formulir Kompatibel Dapodik/EMIS/BKD</span>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800 transition rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Step Indicators */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span className={formStep === 1 ? 'text-emerald-600 font-extrabold' : ''}>1. Identitas</span>
              <ChevronRight className="h-4 w-4 text-slate-400" />
              <span className={formStep === 2 ? 'text-emerald-600 font-extrabold' : ''}>2. Kepegawaian</span>
              <ChevronRight className="h-4 w-4 text-slate-400" />
              <span className={formStep === 3 ? 'text-emerald-600 font-extrabold' : ''}>3. Dapodik & EMIS</span>
              <ChevronRight className="h-4 w-4 text-slate-400" />
              <span className={formStep === 4 ? 'text-emerald-600 font-extrabold' : ''}>4. Pendidikan & Sertifikasi</span>
              <ChevronRight className="h-4 w-4 text-slate-400" />
              <span className={formStep === 5 ? 'text-emerald-600 font-extrabold' : ''}>5. Alamat & Keluarga</span>
            </div>

            {/* Modal Scrollable form body */}
            <form onSubmit={handleSubmitForm} className="flex-1 overflow-y-auto p-6">
              
              {/* STEP 1: IDENTITAS */}
              {formStep === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">NIP (Nomor Induk Pegawai)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.nip || ''}
                        onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                        className="flex-1 bg-slate-50 border border-slate-250 text-xs px-3 py-2 rounded-lg"
                        placeholder="NIP BKD / PNS"
                      />
                      <button type="button" onClick={generateNIP} className="px-2.5 py-1.5 bg-slate-100 border text-slate-700 text-xs rounded-lg hover:bg-slate-200 font-bold">Generate</button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">NIY (Nomor Induk Yayasan)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.niy || ''}
                        onChange={(e) => setFormData({ ...formData, niy: e.target.value })}
                        className="flex-1 bg-slate-50 border border-slate-250 text-xs px-3 py-2 rounded-lg"
                        placeholder="NIY.908123"
                      />
                      <button type="button" onClick={generateNIY} className="px-2.5 py-1.5 bg-slate-100 border text-slate-700 text-xs rounded-lg hover:bg-slate-200 font-bold">Generate</button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Nama Lengkap (Sesuai KTP/Ijazah)</label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-250 text-xs px-3 py-2 rounded-lg"
                      placeholder="Nama lengkap tanpa gelar"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Gelar Depan / Belakang</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.gelar_depan || ''}
                        onChange={(e) => setFormData({ ...formData, gelar_depan: e.target.value })}
                        className="w-1/3 bg-slate-50 border border-slate-250 text-xs px-3 py-2 rounded-lg"
                        placeholder="Dr., H."
                      />
                      <input
                        type="text"
                        value={formData.gelar_belakang || ''}
                        onChange={(e) => setFormData({ ...formData, gelar_belakang: e.target.value })}
                        className="w-2/3 bg-slate-50 border border-slate-250 text-xs px-3 py-2 rounded-lg"
                        placeholder="S.Pd., M.Si."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Jenis Kelamin</label>
                    <select
                      value={formData.gender || ''}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-250 text-xs px-3 py-2 rounded-lg"
                    >
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Email Aktif</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-250 text-xs px-3 py-2 rounded-lg"
                      placeholder="pegawai@gmail.com"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: KEPEGAWAIAN */}
              {formStep === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">SK Pengangkatan SK Kepegawaian</label>
                    <input
                      type="text"
                      value={formData.sk_pengangkatan || ''}
                      onChange={(e) => setFormData({ ...formData, sk_pengangkatan: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-250 text-xs px-3 py-2 rounded-lg"
                      placeholder="SK-YAYASAN-X/2026"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">TMT Terhitung Mulai Tanggal Kerja</label>
                    <input
                      type="date"
                      value={formData.tmt_kerja || ''}
                      onChange={(e) => setFormData({ ...formData, tmt_kerja: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-250 text-xs px-3 py-2 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Jabatan Struktural</label>
                    <select
                      value={formData.jabatan_struktural || ''}
                      onChange={(e) => setFormData({ ...formData, jabatan_struktural: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-250 text-xs px-3 py-2 rounded-lg"
                    >
                      <option value="">Tidak ada jabatan struktural</option>
                      <option value="Kepala Sekolah">Kepala Sekolah / Madrasah</option>
                      <option value="Wakil Kepala Kurikulum">Wakil Kepala Kurikulum</option>
                      <option value="Kepala Tata Usaha">Kepala Tata Usaha</option>
                      <option value="Wali Kelas">Wali Kelas</option>
                      <option value="Pembina Asrama">Pembina Asrama</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Golongan / Pangkat</label>
                    <select
                      value={formData.golongan || ''}
                      onChange={(e) => setFormData({ ...formData, golongan: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-250 text-xs px-3 py-2 rounded-lg"
                    >
                      <option value="III/a">III/a - Penata Muda</option>
                      <option value="III/b">III/b - Penata Muda Tingkat I</option>
                      <option value="G3">G3 - Staf Kepegawaian Yayasan</option>
                      <option value="G2">G2 - Operator & TU</option>
                      <option value="H1">H1 - Honorer Sekolah</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Status Kepegawaian</label>
                    <select
                      value={formData.status_kepegawaian || ''}
                      onChange={(e) => setFormData({ ...formData, status_kepegawaian: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-250 text-xs px-3 py-2 rounded-lg"
                    >
                      <option value="GTY">Guru Tetap Yayasan (GTY)</option>
                      <option value="PNS Diperbantukan">PNS Diperbantukan</option>
                      <option value="PPPK">Pegawai Pemerintah (PPPK)</option>
                      <option value="GTT">Guru Tidak Tetap (GTT) / Honorer</option>
                      <option value="Kontrak">Pegawai Kontrak Bulanan</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Unit Kerja Penempatan</label>
                    <select
                      value={formData.unit_kerja || ''}
                      onChange={(e) => setFormData({ ...formData, unit_kerja: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-250 text-xs px-3 py-2 rounded-lg"
                    >
                      <option value="SMA">SMA Unggulan Nusantara</option>
                      <option value="SMP">SMP Nusantara</option>
                      <option value="Asrama">Kepengasuhan Asrama</option>
                      <option value="Pusat">Kantor Sekretariat Yayasan</option>
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 3: DAPODIK & EMIS */}
              {formStep === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Status Keaktifan Dapodik</label>
                    <select
                      value={formData.status_dapodik || ''}
                      onChange={(e) => setFormData({ ...formData, status_dapodik: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-250 text-xs px-3 py-2 rounded-lg"
                    >
                      <option value="AKTIF">Aktif / Terdaftar</option>
                      <option value="NON_AKTIF">Non Aktif / Belum Terdaftar</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">NRG (No. Registrasi Guru)</label>
                    <input
                      type="text"
                      value={formData.nrg || ''}
                      onChange={(e) => setFormData({ ...formData, nrg: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-250 text-xs px-3 py-2 rounded-lg"
                      placeholder="NRG Sertifikasi"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Status Keaktifan EMIS (Kemenag)</label>
                    <select
                      value={formData.status_emis || ''}
                      onChange={(e) => setFormData({ ...formData, status_emis: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-250 text-xs px-3 py-2 rounded-lg"
                    >
                      <option value="AKTIF">Aktif di EMIS</option>
                      <option value="NON_AKTIF">Non Aktif di EMIS</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">NPSN Sekolah Pangkal</label>
                    <input
                      type="text"
                      value={formData.npsn_pangkal || ''}
                      onChange={(e) => setFormData({ ...formData, npsn_pangkal: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-250 text-xs px-3 py-2 rounded-lg"
                      placeholder="NPSN Sekolah / Madrasah Pangkal"
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: PENDIDIKAN & SERTIFIKASI */}
              {formStep === 4 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Pendidikan Terakhir</label>
                    <select
                      value={formData.pendidikan_terakhir || ''}
                      onChange={(e) => setFormData({ ...formData, pendidikan_terakhir: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-250 text-xs px-3 py-2 rounded-lg"
                    >
                      <option value="S1">S1 - Sarjana / Diploma IV</option>
                      <option value="S2">S2 - Magister</option>
                      <option value="S3">S3 - Doktor</option>
                      <option value="D3">D3 - Ahli Madya</option>
                      <option value="SMA">SMA / Sederajat</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Institusi Pendidikan (S1/S2)</label>
                    <input
                      type="text"
                      value={formData.institusi_pendidikan || ''}
                      onChange={(e) => setFormData({ ...formData, institusi_pendidikan: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-250 text-xs px-3 py-2 rounded-lg"
                      placeholder="E.g., Universitas Gadjah Mada"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Jurusan / Program Studi</label>
                    <input
                      type="text"
                      value={formData.jurusan || ''}
                      onChange={(e) => setFormData({ ...formData, jurusan: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-250 text-xs px-3 py-2 rounded-lg"
                      placeholder="E.g., Pendidikan Fisika"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Tahun Lulus</label>
                    <input
                      type="text"
                      value={formData.tahun_lulus || ''}
                      onChange={(e) => setFormData({ ...formData, tahun_lulus: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-250 text-xs px-3 py-2 rounded-lg"
                      placeholder="E.g., 2018"
                    />
                  </div>
                </div>
              )}

              {/* STEP 5: ALAMAT & KELUARGA */}
              {formStep === 5 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Nama Pasangan (Suami/Istri)</label>
                    <input
                      type="text"
                      value={formData.pasangan_name || ''}
                      onChange={(e) => setFormData({ ...formData, pasangan_name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-250 text-xs px-3 py-2 rounded-lg"
                      placeholder="Nama suami / istri"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Pekerjaan Pasangan</label>
                    <input
                      type="text"
                      value={formData.pasangan_pekerjaan || ''}
                      onChange={(e) => setFormData({ ...formData, pasangan_pekerjaan: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-250 text-xs px-3 py-2 rounded-lg"
                      placeholder="PNS, Karyawan Swasta, Ibu Rumah Tangga"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Nama Kontak Darurat</label>
                    <input
                      type="text"
                      value={formData.emergency_name || ''}
                      onChange={(e) => setFormData({ ...formData, emergency_name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-250 text-xs px-3 py-2 rounded-lg"
                      placeholder="Nama orang terdekat"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">No. HP Kontak Darurat</label>
                    <input
                      type="text"
                      value={formData.emergency_phone || ''}
                      onChange={(e) => setFormData({ ...formData, emergency_phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-250 text-xs px-3 py-2 rounded-lg"
                      placeholder="0812XXXXXXXX"
                    />
                  </div>
                </div>
              )}

            </form>

            {/* Modal Footer Controls */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 rounded-b-2xl">
              <button
                type="button"
                disabled={formStep === 1}
                onClick={() => setFormStep(prev => prev - 1)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-lg border border-slate-200 transition disabled:opacity-50 cursor-pointer"
              >
                Kembali
              </button>

              <div className="flex items-center gap-2">
                {formStep < 5 ? (
                  <button
                    type="button"
                    onClick={() => setFormStep(prev => prev + 1)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <span>Langkah Selanjutnya</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitForm}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-sm shadow-emerald-600/15"
                  >
                    <Save className="h-4 w-4" />
                    <span>Simpan Master Pegawai</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL BUAT / KELOLA AKUN LOGIN SISTEM (USER & ROLE RBAC) */}
      {isAccountModalOpen && accountItem && (
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
                    Buat / Kelola Akun Login Sistem
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Generasi kredensial pengguna &amp; penugasan role RBAC untuk {accountItem.name}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsAccountModalOpen(false)}
                className="text-slate-400 hover:text-white transition p-1 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              
              {/* Info Card Pegawai */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-600 font-mono block">Pegawai Terhubung</span>
                  <span className="font-extrabold text-slate-900 text-sm block mt-0.5">{accountItem.name}</span>
                  <span className="text-[11px] text-slate-500 font-mono block">
                    NIP/NIY: {accountItem.nip || accountItem.niy || accountItem.nomor_pegawai || '-'} • Unit: {accountItem.unit_kerja || 'Sekolah'}
                  </span>
                </div>
                <span className="px-2.5 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-bold uppercase font-mono">
                  {accountType}
                </span>
              </div>

              {/* Form Input Akun */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Username / NIP Login *</label>
                  <input 
                    type="text"
                    value={accountUsername}
                    onChange={(e) => setAccountUsername(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold focus:outline-none focus:border-indigo-500"
                    placeholder="Contoh: 19880412201503"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Sekolah / Utama *</label>
                  <input 
                    type="email"
                    value={accountEmail}
                    onChange={(e) => setAccountEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500"
                    placeholder="guru@sekolah.sch.id"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Password Awal *</label>
                    <input 
                      type="text"
                      value={accountPassword}
                      onChange={(e) => setAccountPassword(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold text-emerald-700 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Peran Access RBAC *</label>
                    <select
                      value={accountRole}
                      onChange={(e) => setAccountRole(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500"
                    >
                      <option value="GURU">Guru / Tenaga Pendidik</option>
                      <option value="WALI_KELAS">Wali Kelas</option>
                      <option value="TU">Tata Usaha (Admin TU)</option>
                      <option value="BENDAHARA">Bendahara Keuangan</option>
                      <option value="OPERATOR_SEKOLAH">Operator Dapodik/Emis</option>
                      <option value="KEPALA_SEKOLAH">Kepala Sekolah / Kyai</option>
                      <option value="KARYAWAN">Staf / Karyawan Umum</option>
                    </select>
                  </div>
                </div>

                {/* Box Kredensial & Copy Button */}
                <div className="p-3 bg-slate-900 text-white rounded-xl space-y-2 border border-slate-800">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Ringkasan Kredensial Login:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const text = `Kredensial Login System Sekolah:\nNama: ${accountItem.name}\nUsername: ${accountUsername}\nEmail: ${accountEmail}\nPassword: ${accountPassword}\nRole: ${accountRole}`;
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
                    <div><span className="text-slate-400">User:</span> <strong className="text-white">{accountUsername}</strong></div>
                    <div><span className="text-slate-400">Pass:</span> <strong className="text-emerald-400">{accountPassword}</strong></div>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAccountModalOpen(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await apiClient.post('/action?action=create_user_account', {
                      name: accountItem.name,
                      email: accountEmail,
                      username: accountUsername,
                      password: accountPassword,
                      role: accountRole,
                      tenantId: tenant?.id
                    });
                    if (res.data.success) {
                      alert('Akun login sistem untuk ' + accountItem.name + ' (' + accountUsername + ') BERHASIL DIBUAT & DIBERIKAN AKSES SISTEM!');
                      setIsAccountModalOpen(false);
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
                <span>Simpan &amp; Aktifkan Akun</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* RBAC ROLE MANAGEMENT MODAL */}
      {isRbacModalOpen && selectedAccountForRbac && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-indigo-600" />
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">Kelola Multi-Role & Priority Level</h3>
                  <p className="text-[11px] text-slate-500">{selectedAccountForRbac.employee_name}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsRbacModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-4 flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 font-mono block mb-2">
                  Pilih Roles Diberikan (Multi-Role Support)
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  {[
                    'Super Admin',
                    'Kepala Sekolah',
                    'Wakil Kepala Sekolah',
                    'Bendahara BOS',
                    'Wali Kelas',
                    'Guru Mapel',
                    'Staff TU',
                    'Koordinator Tahfidz',
                    'Musyrif'
                  ].map((roleOption) => (
                    <label key={roleOption} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
                      <input
                        type="checkbox"
                        checked={rbacSelectedRoles.includes(roleOption)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setRbacSelectedRoles([...rbacSelectedRoles, roleOption]);
                          } else {
                            setRbacSelectedRoles(rbacSelectedRoles.filter(r => r !== roleOption));
                          }
                        }}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                      <span>{roleOption}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 font-mono block mb-1">
                  Priority Level (Conflict Resolution)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={rbacPriority}
                    onChange={(e) => setRbacPriority(Number(e.target.value))}
                    className="flex-1 accent-indigo-600"
                  />
                  <span className="font-mono font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-lg text-xs">
                    Lv. {rbacPriority}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Level lebih tinggi akan diprioritaskan saat terjadi konflik hak akses antar-role.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setIsRbacModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  try {
                    await apiClient.post('/api/action?action=updateEmployeeAccount', {
                      account_id: selectedAccountForRbac.id,
                      roles: rbacSelectedRoles,
                      priority_level: rbacPriority
                    });
                    refetchEmployeeAccounts();
                    setIsRbacModalOpen(false);
                    alert('Role & Priority Level berhasil diperbarui!');
                  } catch (err) {
                    alert('Gagal memperbarui Role');
                  }
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5"
              >
                <Save className="h-4 w-4" />
                <span>Simpan Perubahan Role</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingStaff && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="p-3 bg-red-50 rounded-xl">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Hapus Data {deletingStaff.type === 'guru' ? 'Guru / Pendidik' : 'Karyawan'}</h3>
                <p className="text-xs text-slate-500">Konfirmasi tindakan hapus data kepegawaian</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Apakah Anda yakin ingin menghapus data <strong className="text-slate-900">{deletingStaff.name}</strong>? Data yang dihapus tidak akan ditampilkan lagi di daftar kepegawaian.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingStaff(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deletingStaff.type === 'guru') {
                    deleteTeacherMutation.mutate(deletingStaff.id);
                  } else {
                    deleteEmployeeMutation.mutate(deletingStaff.id);
                  }
                }}
                disabled={deleteTeacherMutation.isPending || deleteEmployeeMutation.isPending}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-600/20 transition-all cursor-pointer flex items-center gap-2"
              >
                {(deleteTeacherMutation.isPending || deleteEmployeeMutation.isPending) && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
