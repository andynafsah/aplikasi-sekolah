/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Wallet, 
  Layers, 
  Settings, 
  Menu, 
  X, 
  Sprout,
  ShieldCheck,
  FileText,
  Building,
  Clock,
  Home,
  ShoppingCart,
  Video,
  Sparkles,
  BarChart3,
  Database,
  Bell,
  HeartHandshake,
  Smartphone,
  Zap
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  collapsed?: boolean;
  setCollapsed?: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
}

export default function Sidebar({ activeTab, setActiveTab, mobileOpen, setMobileOpen, collapsed = false, setCollapsed }: SidebarProps) {
  const { user, tenant, hasMenuAccess, previewRole } = useAuth();
  const { settings } = useSettings();

  const isPondok = tenant?.type === 'PONDOK' || tenant?.type === 'KEDUA';

  // Role Normalization Helper
  const normalizeRole = (r: string): string => {
    const raw = r?.toUpperCase()?.replace(/\s+/g, '_') || '';
    if (raw === 'SUPERADMIN' || raw === 'ADMIN') return 'SUPER_ADMIN';
    if (raw === 'OWNER') return 'OWNER_YAYASAN';
    if (raw === 'BENDAHARA' || raw === 'BENDAHARA_KEUANGAN') return 'BENDAHARA_SEKOLAH';
    if (raw === 'OPERATOR' || raw === 'OPS') return 'OPERATOR_SEKOLAH';
    if (raw === 'PRINCIPAL') return 'KEPALA_SEKOLAH';
    if (raw === 'TEACHER' || raw === 'USTADZ') return 'GURU';
    if (raw === 'STUDENT' || raw === 'SISWA') return 'SANTRI';
    if (raw === 'PARENT' || raw === 'ORANG_TUA') return 'WALI_SANTRI';
    return raw;
  };

  const activeRole = previewRole || user?.role || '';
  const roleNorm = normalizeRole(activeRole);
  const isSuperAdmin = roleNorm === 'SUPER_ADMIN';
  const isYayasan = roleNorm === 'OWNER_YAYASAN' || roleNorm === 'KETUA_YAYASAN';
  const isKepsek = roleNorm === 'KEPALA_SEKOLAH';
  const isOperator = roleNorm === 'OPERATOR_SEKOLAH' || roleNorm === 'ADMIN_TU';

  const TAB_TO_MENU_MAP: Record<string, string> = {
    dashboard: 'dashboard',
    sivitas: 'siswa',
    pegawai: 'guru',
    attendance: 'smart_attendance',
    admission: 'ppdb',
    akademik: 'kbm',
    'teacher-workspace': 'jadwal_mengajar',
    'virtual-classroom': 'virtual_classroom',
    'billing-spp': 'spp',
    keuangan: 'laporan_keuangan',
    payroll: 'gaji',
    library: 'buku',
    inventory: 'barang',
    asset: 'asset',
    procurement: 'pengadaan',
    boarding: 'kamar',
    'ai-copilot': 'ai_copilot',
    'notification-gateway': 'pengumuman',
    'parent-portal': 'parent_portal_admin',
    'mobile-platform': 'profil',
    'automation-workflow': 'setting_sistem',
    'business-intelligence': 'laporan_keuangan',
    'tata-usaha': 'surat',
    'audit-compliance': 'audit_log',
    'school-profile': 'setting_sistem',
    'school-units': 'setting_sistem',
    branding: 'setting_sistem',
    'setup-wizard': 'setting_sistem',
    sistem: 'setting_sistem',
    database: 'setting_sistem',
    'studio-dokumen': 'setting_sistem',
    'ploting-guru': 'setting_sistem',
    'auto-leger': 'kbm',
    'curriculum-command-center': 'kbm',
    dapodik: 'dapodik'
  };

  const rawMenuGroups = [
    {
      title: 'Utama',
      items: [
        { id: 'dashboard', name: 'Dashboard', icon: Layers },
        { id: 'user-guide', name: 'Panduan & Manual Peran', icon: FileText },
      ]
    },
    {
      title: 'Enterprise Komunikasi',
      items: [
        { id: 'notification-gateway', name: 'Komunikasi & Pengumuman', icon: Bell },
        { id: 'parent-portal', name: 'Parent Portal & Tracker', icon: HeartHandshake }
      ]
    },
    ...(isSuperAdmin ? [
      {
        title: 'Master Data',
        items: [
          { id: 'ploting-guru', name: 'Ploting Guru', icon: Settings }
        ]
      }
    ] : []),
    {
      title: 'Sivitas',
      items: [
        { id: 'sivitas', name: isPondok ? 'Sivitas & Santri' : 'Sivitas & Siswa', icon: Users },
        { id: 'pegawai', name: 'Guru & Karyawan', icon: Users },
        { id: 'attendance', name: 'Smart Attendance', icon: Clock },
      ]
    },
    {
      title: 'Penerimaan Baru',
      items: [
        { id: 'admission', name: isPondok ? 'PPDB & Seleksi Santri' : 'PPDB & Seleksi Siswa', icon: GraduationCap },
      ]
    },
    {
      title: 'Akademik',
      items: [
        { id: 'akademik', name: 'Kurikulum & KBM', icon: BookOpen },
        { id: 'curriculum-command-center', name: 'Curriculum Command Center', icon: Sparkles },
        { id: 'auto-leger', name: 'Academic Grade Center (Auto Leger)', icon: BookOpen },
        { id: 'teacher-workspace', name: 'KBM Saya (Guru)', icon: Sparkles },
        { id: 'virtual-classroom', name: 'Kelas & Rapat Virtual', icon: Video },
      ]
    },
    {
      title: 'Keuangan',
      items: [
        { id: 'billing-spp', name: 'Billing & SPP Siswa', icon: Wallet },
        { id: 'keuangan', name: 'Akuntansi & Ledger', icon: Wallet },
        { id: 'payroll', name: 'Gaji & HRD Payroll', icon: Wallet },
      ]
    },
    {
      title: 'Operasional',
      items: [
        { id: 'library', name: 'Perpustakaan', icon: BookOpen },
        { id: 'inventory', name: 'Inventaris & Logistik', icon: Layers },
        { id: 'asset', name: 'Manajemen Aset', icon: Building },
        { id: 'procurement', name: 'Pengadaan & PO', icon: ShoppingCart },
        ...(isPondok ? [{ id: 'boarding', name: 'Asrama & Santri', icon: Home }] : []),
      ]
    },
    {
      title: 'AI Smart Hub (Sprint 21)',
      items: [
        { id: 'ai-copilot', name: 'AI Copilot & Gateway', icon: Sparkles }
      ]
    },
    {
      title: 'Mobile Platform (Sprint 23)',
      items: [
        { id: 'mobile-platform', name: 'Enterprise Mobile Portal', icon: Smartphone }
      ]
    },
    {
      title: 'Otomasi & BPM (Sprint 24)',
      items: [
        { id: 'automation-workflow', name: 'Workflow & BPM Engine', icon: Zap }
      ]
    },
    {
      title: 'Business Intelligence (Sprint 25)',
      items: [
        { id: 'business-intelligence', name: 'Executive Cockpit & DW', icon: BarChart3 }
      ]
    },
    {
      title: 'Tata Usaha (Sprint 26)',
      items: [
        { id: 'tata-usaha', name: 'Manajemen Tata Usaha', icon: FileText },
        { id: 'dapodik', name: 'Persiapan Dapodik', icon: Database }
      ]
    },
    {
      title: 'Audit & Compliance (Sprint 27)',
      items: [
        { id: 'audit-compliance', name: 'Audit, Risiko & Patuh', icon: ShieldCheck }
      ]
    }
  ];

  // Dynamically inject single-tenant configurations & system management
  if (isSuperAdmin) {
    const configItems = [
      { id: 'school-profile', name: 'Profil Sekolah', icon: GraduationCap },
      { id: 'school-units', name: 'Unit / Cabang', icon: Layers },
      { id: 'branding', name: 'Branding & Logo', icon: Sprout },
      { id: 'studio-dokumen', name: 'Studio Dokumen', icon: FileText },
      { id: 'sistem', name: 'Sistem & Audit', icon: Settings },
      { id: 'database', name: 'Database Management', icon: Database }
    ];

    rawMenuGroups.push({
      title: 'Pengaturan & Sistem',
      items: configItems
    });
  }

  // Filter groups dynamically according to Enterprise RBAC dynamic config mappings
  const menuGroups = rawMenuGroups.map(group => {
    const activeItems = group.items.filter(item => {
      // Explicitly hide Persiapan Dapodik for SANTRI and WALI_SANTRI roles
      if (item.id === 'dapodik' && ((user?.role as string) === 'SANTRI' || (user?.role as string) === 'WALI_SANTRI')) {
        return false;
      }
      // Explicitly control KBM & Absensi visibility (hide for students/parents)
      if (item.id === 'akademik') {
        const studentParentRoles = ['SANTRI', 'SISWA', 'WALI_SANTRI', 'PARENT', 'ORANG_TUA', 'STUDENT'];
        if (studentParentRoles.includes(roleNorm) || studentParentRoles.includes(activeRole)) {
          return false;
        }
      }
      // Explicitly control KBM Saya (Guru) visibility (only for Teachers and Super Admin)
      if (item.id === 'teacher-workspace') {
        const teacherRoles = ['GURU', 'GURU_MAPEL', 'WALI_KELAS', 'TEACHER', 'USTADZ', 'SUPER_ADMIN'];
        if (!teacherRoles.includes(roleNorm) && !teacherRoles.includes(activeRole)) {
          return false;
        }
      }
      // Explicitly hide Komunikasi & Pengumuman for Guru, Wali Kelas, Wali Santri, and Santri
      if (item.id === 'notification-gateway') {
        const checkRoles = ['GURU', 'GURU_MAPEL', 'WALI_KELAS', 'WALI_SANTRI', 'SANTRI', 'ORANG_TUA', 'PARENT', 'STUDENT', 'SISWA', 'TEACHER', 'USTADZ'];
        if (checkRoles.includes(roleNorm) || checkRoles.includes(activeRole)) {
          return false;
        }
      }
      // Explicitly hide Sistem & Audit, Database Management, and Audit Compliance for non-Super Admin roles
      if (['sistem', 'database', 'audit-compliance'].includes(item.id)) {
        if (!isSuperAdmin) {
          return false;
        }
      }
      const dbMenuCode = TAB_TO_MENU_MAP[item.id];
      if (!dbMenuCode) return true; // Default show if not mapped
      return hasMenuAccess(dbMenuCode);
    });
    return { ...group, items: activeItems };
  }).filter(group => group.items.length > 0);

  const sidebarBg = 'bg-white border-slate-200';

  const activeIndicator = isPondok 
    ? 'bg-teal-50 text-teal-700 border-l-4 border-teal-600 font-semibold' 
    : 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 font-semibold';

  const hoverEffect = isPondok
    ? 'hover:bg-teal-50/40 hover:text-teal-600'
    : 'hover:bg-blue-50/40 hover:text-blue-600';

  const renderContent = (isMobileDrawer = false) => {
    const isCompCollapsed = !isMobileDrawer && collapsed;

    return (
      <div className="flex flex-col h-full text-slate-600 font-sans bg-white select-none">
        {/* Title / Logo Header */}
        <div className={`p-4 border-b flex items-center ${isCompCollapsed ? 'justify-center' : 'justify-between'} border-slate-100 h-16`}>
          {!isCompCollapsed ? (
            <div className="flex items-center gap-3 overflow-hidden">
              {isPondok ? (
                <div className="p-1.5 bg-teal-50 rounded-lg text-teal-600 shrink-0"><Sprout className="h-5 w-5" /></div>
              ) : (
                <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600 shrink-0"><GraduationCap className="h-5 w-5" /></div>
              )}
              <div className="truncate">
                <h1 className="font-extrabold text-slate-800 text-sm tracking-tight uppercase truncate">School ERP SaaS</h1>
                <p className="text-[10px] text-slate-400 font-mono tracking-wider">v2.4 Enterprise</p>
              </div>
            </div>
          ) : (
            <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600 shrink-0" title="School ERP SaaS v2.4">
              {isPondok ? <Sprout className="h-5 w-5 text-teal-600" /> : <GraduationCap className="h-5 w-5 text-blue-600" />}
            </div>
          )}

          {/* Desktop Hamburger Toggle inside Sidebar Header */}
          {!isMobileDrawer && setCollapsed && (
            <button 
              onClick={() => setCollapsed(!collapsed)} 
              title={collapsed ? "Buka Sidebar" : "Kecilkan Sidebar"}
              className="hidden md:flex p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          {/* Mobile Close Button */}
          {isMobileDrawer && (
            <button 
              onClick={() => setMobileOpen(false)} 
              className="md:hidden p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation Group items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {menuGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!isCompCollapsed ? (
                <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{group.title}</h3>
              ) : (
                <div className="my-2 border-t border-slate-100" title={group.title} />
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    title={item.name}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (isMobileDrawer) setMobileOpen(false);
                    }}
                    className={`w-full flex items-center ${isCompCollapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'} rounded-lg text-sm font-medium transition-all text-left cursor-pointer ${
                      isActive ? activeIndicator : 'text-slate-500 ' + hoverEffect
                    }`}
                  >
                    <Icon className={`h-5 w-5 shrink-0 ${isActive ? (isPondok ? 'text-teal-600' : 'text-blue-600') : 'text-slate-400'}`} />
                    {!isCompCollapsed && <span className="truncate">{item.name}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className={`hidden md:block ${collapsed ? 'w-20' : 'w-64'} h-screen border-r shrink-0 overflow-hidden relative z-20 transition-all duration-300 ${sidebarBg}`}>
        {renderContent(false)}
      </aside>

      {/* Mobile Sidebar Off-Canvas Drawer */}
      <div className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        <div className={`absolute top-0 bottom-0 left-0 w-64 max-w-[80vw] transition-transform duration-300 ${sidebarBg} ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {renderContent(true)}
        </div>
      </div>
    </>
  );
}
