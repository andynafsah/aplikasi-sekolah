/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import Login from './pages/Login';
import FirstRunDatabaseSetup from './pages/FirstRunDatabaseSetup';
import apiClient from './api/client';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import { Menu, Sprout, GraduationCap, CalendarDays, LogOut, User, BookOpen, Loader2 } from 'lucide-react';
import { PWAInstallerBanner, PWAInstallHeaderButton } from './components/pwa/PWAInstallerBanner';

// Resilient dynamic module importer with auto-retry
function lazyRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  retries = 2,
  interval = 600
): React.LazyExoticComponent<T> {
  return lazy(() =>
    new Promise<{ default: T }>((resolve, reject) => {
      const attempt = (remainingRetries: number) => {
        factory()
          .then(resolve)
          .catch((error) => {
            if (remainingRetries <= 0) {
              const refreshed = sessionStorage.getItem('lazy_import_refreshed');
              if (!refreshed) {
                sessionStorage.setItem('lazy_import_refreshed', 'true');
                window.location.reload();
                return;
              }
              sessionStorage.removeItem('lazy_import_refreshed');
              reject(error);
              return;
            }
            setTimeout(() => {
              attempt(remainingRetries - 1);
            }, interval);
          });
      };
      attempt(retries);
    })
  );
}

import Sivitas from './pages/Sivitas';
import Keuangan from './pages/Keuangan';
import Library from './pages/Library';
import Inventory from './pages/Inventory';
import Asset from './pages/Asset';
import Procurement from './pages/Procurement';
import Boarding from './pages/Boarding';
import Sistem from './pages/Sistem';
import DatabaseManagement from './pages/DatabaseManagement';
import Tenants from './pages/Tenants';
import SchoolProfile from './pages/SchoolProfile';
import SchoolUnits from './pages/SchoolUnits';
import Branding from './pages/Branding';
import StudioDokumen from './pages/StudioDokumen';
import DomainSubscription from './pages/DomainSubscription';
import SetupWizardPage from './pages/SetupWizardPage';
import Admission from './pages/Admission';
import AICopilot from './pages/AICopilot';
import NotificationGateway from './pages/NotificationGateway';
import ParentPortal from './pages/ParentPortal';
import MobilePlatform from './pages/MobilePlatform';
import AutomationWorkflow from './pages/AutomationWorkflow';
import BusinessIntelligence from './pages/BusinessIntelligence';
import TataUsaha from './pages/TataUsaha';
import AuditCompliance from './pages/AuditCompliance';
import Attendance from './pages/Attendance';
import Pegawai from './pages/Pegawai';
import Payroll from './pages/Payroll';
import BillingSpp from './pages/BillingSpp';
import Dapodik from './pages/Dapodik';
import UserGuide from './pages/UserGuide';

function PageLoader() {
  return (
    <div className="min-h-[300px] flex flex-col items-center justify-center gap-3 p-8 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200">
      <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      <span className="text-xs font-semibold text-slate-500 font-mono uppercase tracking-wider">Memuat Halaman...</span>
    </div>
  );
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center flex flex-col items-center justify-center my-6">
          <div className="h-12 w-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 font-bold text-xl">!</div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">Terjadi Kendala pada Tampilan Modul</h2>
          <p className="text-sm text-slate-600 mb-6 max-w-md">
            Modul ini mengalami kendala saat merender data atau komponen. Silakan muat ulang halaman atau kembali ke dashboard.
          </p>
          {this.state.error && (
            <pre className="text-left text-xs bg-slate-100 text-red-600 p-3 rounded-lg overflow-x-auto mb-6 max-h-32 w-full max-w-xl">
              {this.state.error.toString()}
            </pre>
          )}
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer"
            >
              Coba Muat Ulang Modul
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer"
            >
              Muat Ulang Halaman
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('erp_preview_role');
                window.location.href = '/';
              }}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-all cursor-pointer"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { isAuthenticated, loading, tenant, user, logout, activeRole } = useAuth();
  const { settings, loading: settingsLoading } = useSettings();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dbSchemaInitialized, setDbSchemaInitialized] = useState<boolean | null>(null);
  const [checkingDb, setCheckingDb] = useState(true);

  useEffect(() => {
    const cachedSchema = localStorage.getItem('erp_schema_initialized');
    if (cachedSchema === 'true') {
      setDbSchemaInitialized(true);
      setCheckingDb(false);
      return;
    }

    apiClient.post('/api/action', { action: 'getDiagnostics' })
      .then(res => {
        if (res.data?.success) {
          const init = res.data.data.dbSchemaInitialized;
          setDbSchemaInitialized(init);
          localStorage.setItem('erp_schema_initialized', String(init));
        } else {
          setDbSchemaInitialized(true);
        }
      })
      .catch(err => {
        if (err?.response?.status === 429) {
          console.warn('Rate limited (429) checking diagnostics, defaulting to operational.');
        }
        setDbSchemaInitialized(true);
      })
      .finally(() => {
        setCheckingDb(false);
      });
  }, []);

  if (checkingDb || loading || settingsLoading) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-slate-500 text-xs font-semibold tracking-wider font-mono uppercase">MEMUAT KONFIGURASI ERP SaaS...</span>
        </div>
      </div>
    );
  }

  const isUserAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'OWNER' || user?.role === 'ADMINISTRATOR';
  if (settings.sys_maintenance_mode && isAuthenticated && !isUserAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white text-center font-sans">
        <div className="max-w-md bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-6 animate-fade-in">
          <div className="h-16 w-16 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-2xl flex items-center justify-center animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight mb-2">Mode Pemeliharaan Aktif</h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Sistem saat ini sedang dalam pemeliharaan terjadwal oleh administrator. Silakan coba beberapa saat lagi.
            </p>
          </div>
          <div className="w-full h-[1px] bg-slate-700" />
          <div className="text-[10px] text-slate-500 font-mono uppercase">
            {settings.sekolah_nama || 'School ERP System'}
          </div>
        </div>
      </div>
    );
  }

  if (dbSchemaInitialized === false) {
    return <FirstRunDatabaseSetup onComplete={() => setDbSchemaInitialized(true)} />;
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const isPondok = tenant?.type === 'PONDOK' || tenant?.type === 'KEDUA';

  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin Utama',
    OWNER_YAYASAN: 'Pengurus Yayasan',
    KETUA_YAYASAN: 'Ketua Yayasan',
    BENDAHARA_SEKOLAH: 'Bendahara Keuangan',
    BENDAHARA: 'Bendahara Keuangan',
    OPERATOR_SEKOLAH: 'Operator Sekolah',
    ADMIN_TU: 'Tata Usaha (TU)',
    KEPALA_SEKOLAH: 'Kepala Sekolah / Kyai',
    GURU: 'Ustadz / Guru Mapel',
    WALI_KELAS: 'Wali Kelas',
    PETUGAS_PPDB: 'Petugas PPDB',
    SANTRI: 'Santri / Siswa',
    WALI_SANTRI: 'Wali Santri'
  };

  // Render correct page view
  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'user-guide':
        return <UserGuide />;
      case 'sivitas':
        return <Sivitas />;
      case 'curriculum-command-center':
      case 'akademik':
      case 'auto-leger':
      case 'teacher-workspace':
      case 'virtual-classroom':
      case 'ploting-guru':
      case 'subject-management':
        return <Dashboard />;
      case 'keuangan':
        return <Keuangan />;
      case 'billing-spp':
        return <BillingSpp />;
      case 'payroll':
        return <Payroll />;
      case 'library':
        return <Library />;
      case 'inventory':
        return <Inventory />;
      case 'asset':
        return <Asset />;
      case 'procurement':
        return <Procurement />;
      case 'boarding':
        return <Boarding />;
      case 'sistem':
      case 'database': {
        const norm = (activeRole || '').toUpperCase().replace(/\s+/g, '_');
        const isSuperAdmin = norm === 'SUPER_ADMIN' || user?.role === 'SUPER_ADMIN';
        if (!isSuperAdmin) {
          return <Dashboard />;
        }
        if (activeTab === 'sistem') return <Sistem />;
        return <DatabaseManagement />;
      }
      case 'tenants':
        return <Tenants />;
      case 'school-profile':
        return <SchoolProfile />;
      case 'school-units':
        return <SchoolUnits />;
      case 'branding':
        return <Branding />;
      case 'studio-dokumen':
        return <StudioDokumen />;
      case 'domain-subscription':
        return <DomainSubscription />;
      case 'setup-wizard':
        return <SetupWizardPage />;
      case 'admission':
        return <Admission />;
      case 'ai-copilot':
        return <AICopilot />;
      case 'notification-gateway': {
        const norm = (activeRole || '').toUpperCase().replace(/\s+/g, '_');
        const restricted = ['GURU', 'GURU_MAPEL', 'WALI_KELAS', 'TEACHER', 'USTADZ', 'WALI_SANTRI', 'SANTRI', 'ORANG_TUA', 'PARENT', 'STUDENT', 'SISWA'];
        if (restricted.includes(norm)) {
          return <Dashboard />;
        }
        return <NotificationGateway />;
      }
      case 'parent-portal':
        return <ParentPortal />;
      case 'mobile-platform':
        return <MobilePlatform />;
      case 'automation-workflow':
        return <AutomationWorkflow />;
      case 'business-intelligence':
        return <BusinessIntelligence />;
      case 'tata-usaha':
        return <TataUsaha />;
      case 'audit-compliance': {
        const norm = (activeRole || '').toUpperCase().replace(/\s+/g, '_');
        const isSuperAdmin = norm === 'SUPER_ADMIN' || user?.role === 'SUPER_ADMIN';
        if (!isSuperAdmin) {
          return <Dashboard />;
        }
        return <AuditCompliance />;
      }
      case 'attendance':
        return <Attendance />;
      case 'pegawai':
        return <Pegawai />;
      case 'dapodik':
        return <Dapodik />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f1f5f9] text-slate-800 font-sans overflow-hidden flex-col">
      {/* PWA Banner (Install Prompt & Offline Status) */}
      <PWAInstallerBanner />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Layout */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        mobileOpen={mobileOpen} 
        setMobileOpen={setMobileOpen} 
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header navbar */}
        <header className="h-16 border-b shrink-0 px-3 sm:px-6 flex items-center justify-between relative z-10 bg-white border-slate-200">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => {
                if (window.innerWidth < 768) {
                  setMobileOpen(prev => !prev);
                } else {
                  setSidebarCollapsed(prev => !prev);
                }
              }}
              title="Toggle Menu Sidebar (Hamburger)"
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors flex items-center justify-center active:scale-95"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-2 overflow-hidden max-w-[120px] xs:max-w-[200px] sm:max-w-none">
              {isPondok ? (
                <Sprout className="h-5 w-5 text-teal-600 shrink-0" />
              ) : (
                <GraduationCap className="h-5 w-5 text-blue-600 shrink-0" />
              )}
              <div className="flex flex-col">
                <h2 className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight uppercase truncate">
                  {isPondok ? (settings.pondok_nama || tenant?.name) : (settings.sekolah_nama || tenant?.name)}
                </h2>
                <span className="text-[9px] font-bold text-slate-400 leading-none hidden xs:block">Enterprise Education System</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setActiveTab('user-guide')}
              title="Panduan & Manual Pengguna (Berdasarkan Peran)"
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                activeTab === 'user-guide'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5 text-blue-500" />
              <span className="hidden md:inline">Panduan</span>
            </button>

            <div className="hidden sm:flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg font-mono">
              <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-bold">{settings.ta_aktif}</span>
              <span className="text-slate-300">|</span>
              <span className="uppercase text-[9px] sm:text-[10px] font-semibold text-slate-500">{settings.ta_semester}</span>
            </div>
            
            <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

            <div className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2">
              <div className="hidden lg:flex flex-col items-end mr-1">
                <span className="text-xs font-bold text-slate-800 leading-none">{user?.name}</span>
                <span className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-wider">
                  {roleLabels[activeRole || user?.role || ''] || activeRole || user?.role || 'User'}
                </span>
              </div>
              
              <div className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shrink-0 shadow-sm ${isPondok ? 'bg-teal-600' : 'bg-blue-600'}`}>
                {user?.name ? user.name[0] : <User className="h-4 w-4" />}
              </div>

              <button
                onClick={logout}
                title="Keluar Sesi"
                className="p-1.5 sm:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer border border-transparent hover:border-red-100"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>

            <PWAInstallHeaderButton />

            <span className="text-[10px] bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold px-2 py-1 rounded ml-1 hidden xs:inline-block">
              ONLINE
            </span>
          </div>
        </header>

        {/* Core Scrollable Panel Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-[#f1f5f9]">
          <div className="max-w-7xl mx-auto animate-fade-in pb-12">
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                {renderView()}
              </Suspense>
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SettingsProvider>
          <AppContent />
        </SettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
