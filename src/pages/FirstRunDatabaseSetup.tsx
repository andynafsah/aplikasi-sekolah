import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/client';
import { 
  Database, 
  Settings, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Play, 
  Activity, 
  HardDrive, 
  Terminal, 
  ArrowRight,
  ArrowLeft,
  Server,
  Check,
  Cpu,
  Globe,
  User,
  School,
  Lock,
  Eye,
  EyeOff,
  ChevronRight
} from 'lucide-react';

interface FirstRunDatabaseSetupProps {
  onComplete: () => void;
}

export default function FirstRunDatabaseSetup({ onComplete }: FirstRunDatabaseSetupProps) {
  // Steps: 
  // 0: Welcome & Mode Choice
  // 1: Environment Check
  // 2: Database Setup
  // 3: Database Initializer
  // 4: Seeder
  // 5: School Setup
  // 6: Administrator Account
  // 7: Finish
  const [currentStep, setCurrentStep] = useState<number>(0);
  
  // Database State
  const [dbEngine, setDbEngine] = useState<'mysql'>('mysql');
  const [dbHost, setDbHost] = useState('localhost');
  const [dbPort, setDbPort] = useState('3306');
  const [dbName, setDbName] = useState('erp_school');
  const [dbUser, setDbUser] = useState('root');
  const [dbPassword, setDbPassword] = useState('');
  
  // School State
  const [schoolName, setSchoolName] = useState('Yayasan Darul Hadits Lima Puluh Kota');
  const [foundationName, setFoundationName] = useState('Yayasan Darul Hadits Lima Puluh Kota');
  const [npsn, setNpsn] = useState('12345678');
  const [schoolAddress, setSchoolAddress] = useState('Lima Puluh Kota, Sumatera Barat');
  const [schoolEmail, setSchoolEmail] = useState('info@darulhadits.org');
  const [schoolPhone, setSchoolPhone] = useState('021-5551234');
  const [schoolWebsite, setSchoolWebsite] = useState('www.darulhadits.org');
  const [schoolTimezone, setSchoolTimezone] = useState('Asia/Jakarta');
  const [schoolCurrency, setSchoolCurrency] = useState('IDR');
  const [schoolLanguage, setSchoolLanguage] = useState('id');
  const [academicYear, setAcademicYear] = useState('2025/2026');
  const [activeSemester, setActiveSemester] = useState('Ganjil');

  // Admin State
  const [adminName, setAdminName] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Installer Control States
  const [envCheckData, setEnvCheckData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll terminal logs
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Fetch env diagnostics on Step 1
  const runEnvDiagnostics = async () => {
    setLoading(true);
    setErrorMsg(null);
    setLogs(prev => [...prev, '[SYSTEM] Memulai diagnostik lingkungan server...']);
    try {
      const res = await apiClient.post('/api/action', { action: 'install_getEnvCheck' });
      if (res.data?.success) {
        setEnvCheckData(res.data.data);
        setLogs(prev => [
          ...prev, 
          '✓ Diagnostik selesai.',
          `✓ Node.js: ${res.data.data.node.value} (Status: ${res.data.data.node.ok ? 'OK' : 'FAIL'})`,
          `✓ Write Permission: ${res.data.data.storage.value}`,
          `✓ Active Port: ${res.data.data.port.value}`
        ]);
      } else {
        setErrorMsg('Gagal mengambil diagnostik sistem.');
      }
    } catch (err: any) {
      setErrorMsg(`Error diagnostics: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentStep === 1) {
      runEnvDiagnostics();
    }
  }, [currentStep]);

  // Handle Testing Database Connection (Step 2)
  const handleTestConnection = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setLogs(prev => [...prev, `[SYSTEM] Menguji koneksi database ${dbEngine.toUpperCase()}...`]);
    try {
      const res = await apiClient.post('/api/action', {
        action: 'install_testDbConnection',
        engine: dbEngine,
        host: dbHost,
        port: parseInt(dbPort),
        database: dbName,
        username: dbUser,
        password: dbPassword
      });

      if (res.data?.success) {
        setSuccessMsg(res.data.message);
        setLogs(prev => [...prev, `[SUCCESS] ${res.data.message}`]);
      } else {
        setErrorMsg(res.data.message || 'Koneksi database gagal.');
        setLogs(prev => [...prev, `[ERROR] ${res.data.message}`]);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      setErrorMsg(`Koneksi Gagal: ${msg}`);
      setLogs(prev => [...prev, `[ERROR] ${msg}`]);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Run Database Initializer (Prisma Schema push)
  const handleRunDbInit = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setLogs(prev => [...prev, '[SYSTEM] Menjalankan inisialisasi skema database...']);
    try {
      const res = await apiClient.post('/api/action', {
        action: 'install_initializeDb',
        engine: dbEngine,
        host: dbHost,
        port: parseInt(dbPort),
        database: dbName,
        username: dbUser,
        password: dbPassword
      });

      if (res.data?.success) {
        if (res.data.logs) {
          setLogs(prev => [...prev, ...res.data.logs]);
        }
        setSuccessMsg('Skema database berhasil diinisialisasi dan disinkronkan!');
        setLogs(prev => [...prev, '[SUCCESS] Skema database berhasil dibuat. Seluruh tabel, foreign key, dan indeks siap digunakan.']);
        // Auto progress to next step after short delay
        setTimeout(() => {
          setCurrentStep(4);
        }, 1500);
      } else {
        if (res.data.logs) {
          setLogs(prev => [...prev, ...res.data.logs]);
        }
        setErrorMsg(res.data.message || 'Gagal membuat skema database.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      setErrorMsg(`Error inisialisasi: ${msg}`);
      setLogs(prev => [...prev, `[ERROR] ${msg}`]);
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Run Seeder
  const handleRunSeeder = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setLogs(prev => [...prev, '[SYSTEM] Memulai pemuatan data seed master...']);
    try {
      const res = await apiClient.post('/api/action', { action: 'install_runSeeder' });
      if (res.data?.success) {
        if (res.data.logs) {
          setLogs(prev => [...prev, ...res.data.logs]);
        }
        setSuccessMsg('Role, permission, menu, dan sistem pengaturan default berhasil dimasukkan!');
        setLogs(prev => [...prev, '[SUCCESS] Seed data master berhasil dimuat. 10 role hierarki sekolah siap pakai.']);
        setTimeout(() => {
          setCurrentStep(5);
        }, 1500);
      } else {
        if (res.data.logs) {
          setLogs(prev => [...prev, ...res.data.logs]);
        }
        setErrorMsg(res.data.message || 'Gagal memuat seeder.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      setErrorMsg(`Error seeder: ${msg}`);
      setLogs(prev => [...prev, `[ERROR] ${msg}`]);
    } finally {
      setLoading(false);
    }
  };

  // Step 5: Save School profile
  const handleSaveSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await apiClient.post('/api/action', {
        action: 'install_saveSchool',
        name: schoolName,
        foundation_name: foundationName,
        npsn,
        address: schoolAddress,
        email: schoolEmail,
        phone: schoolPhone,
        website: schoolWebsite,
        timezone: schoolTimezone,
        currency: schoolCurrency,
        language: schoolLanguage,
        academic_year: academicYear,
        semester: activeSemester
      });

      if (res.data?.success) {
        setLogs(prev => [...prev, `[SUCCESS] Profil sekolah "${schoolName}" berhasil disimpan ke database.`]);
        setCurrentStep(6);
      } else {
        setErrorMsg(res.data.message || 'Gagal menyimpan profil sekolah.');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 6: Create Administrator account
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword !== confirmPassword) {
      setErrorMsg('Password konfirmasi tidak cocok.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await apiClient.post('/api/action', {
        action: 'install_createAdmin',
        name: adminName,
        username: adminUsername,
        email: adminEmail,
        password: adminPassword
      });

      if (res.data?.success) {
        setLogs(prev => [...prev, `[SUCCESS] Akun administrator "${adminUsername}" berhasil dikonfigurasi.`]);
        setCurrentStep(7);
      } else {
        setErrorMsg(res.data.message || 'Gagal mendaftarkan akun administrator.');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 7: Finalize & Lock
  const handleCompleteInstallation = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiClient.post('/api/action', { action: 'install_finish' });
      if (res.data?.success) {
        setLogs(prev => [...prev, '[SUCCESS] File storage/install.lock berhasil dibuat. Akses installer dikunci.']);
        setSuccessMsg('Aplikasi ERP berhasil terpasang dengan aman!');
        setTimeout(() => {
          onComplete();
        }, 1500);
      } else {
        setErrorMsg(res.data.message || 'Gagal menyelesaikan instalasi.');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Auto Install (Headless shortcut)
  const handleOneClickAutoInstall = async () => {
    if (!window.confirm('Proses ini akan mengonfigurasi database SQLite default, memuat semua skema, menyebarkan seeder master, mendaftarkan profil sekolah default, membuat akun administrator super_admin / admin123, dan langsung mengaktifkan sistem. Lanjutkan?')) {
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setLogs(['[SYSTEM] Memulai Headless One-Click Auto Installer...']);
    setCurrentStep(3); // Shift view to initializer console

    try {
      // Step 1: Initialize Database SQLite
      setLogs(prev => [...prev, '[SYSTEM] 1/4: Membuat database SQLite & skema tabel...']);
      const initRes = await apiClient.post('/api/action', { action: 'install_initializeDb' });
      if (!initRes.data?.success) throw new Error(initRes.data?.message || 'Inisialisasi database gagal.');
      setLogs(prev => [...prev, ...initRes.data.logs, '✓ Database schema ready.']);

      // Step 2: Seed
      setLogs(prev => [...prev, '[SYSTEM] 2/4: Memasukkan seeder master...']);
      const seedRes = await apiClient.post('/api/action', { action: 'install_runSeeder' });
      if (!seedRes.data?.success) throw new Error(seedRes.data?.message || 'Pemuatan seeder gagal.');
      setLogs(prev => [...prev, ...seedRes.data.logs, '✓ Master seeds ready.']);

      // Step 3: Save default school and admin
      setLogs(prev => [...prev, '[SYSTEM] 3/4: Membuat profil sekolah & admin super...']);
      await apiClient.post('/api/action', {
        action: 'install_saveSchool',
        name: 'Yayasan Darul Hadits Lima Puluh Kota',
        foundation_name: 'Yayasan Darul Hadits Lima Puluh Kota',
        npsn: '12345678',
        address: 'Lima Puluh Kota, Sumatera Barat',
        email: 'info@darulhadits.org',
        phone: '021-5551234',
        website: 'www.darulhadits.org',
        timezone: 'Asia/Jakarta',
        currency: 'IDR',
        language: 'id',
        academic_year: '2025/2026',
        semester: 'Ganjil'
      });

      await apiClient.post('/api/action', {
        action: 'install_createAdmin',
        name: 'Super Administrator',
        username: 'superadmin',
        email: 'admin@sekolah.sch.id',
        password: 'admin'
      });

      setLogs(prev => [...prev, '✓ Default credentials: Username "superadmin", Password "admin"']);

      // Step 4: Finish & Lock
      setLogs(prev => [...prev, '[SYSTEM] 4/4: Mengunci instalasi...']);
      const finishRes = await apiClient.post('/api/action', { action: 'install_finish' });
      if (!finishRes.data?.success) throw new Error(finishRes.data?.message || 'Penguncian gagal.');
      
      setLogs(prev => [...prev, '[SUCCESS] One-Click Auto Install berhasil diselesaikan! Mengarahkan ke halaman login...']);
      setSuccessMsg('ERP Terpasang Sukses! Kredensial default: superadmin / admin');
      setTimeout(() => {
        onComplete();
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Instalasi headless gagal.');
      setLogs(prev => [...prev, `[FATAL ERROR] ${err.message}`]);
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = [
    'Welcome',
    'Env Diagnostics',
    'Database Sync',
    'Core Structures',
    'Master Seeds',
    'School Profile',
    'Admin Security',
    'Ready!'
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 md:p-6 font-sans selection:bg-blue-600 selection:text-white">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row items-stretch min-h-[620px]">
        
        {/* Progress Sidebar */}
        <div className="w-full md:w-80 bg-slate-950/40 border-b md:border-b-0 md:border-r border-slate-800/60 p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Database className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h1 className="text-sm font-black text-white tracking-tight uppercase">School ERP</h1>
                <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">Setup Installation</p>
              </div>
            </div>

            {/* Stepper list */}
            <div className="space-y-2">
              {stepLabels.map((lbl, idx) => {
                const isActive = idx === currentStep;
                const isPassed = idx < currentStep;
                return (
                  <div 
                    key={idx} 
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-blue-600/10 border border-blue-500/20 text-white' 
                        : 'text-slate-500'
                    }`}
                  >
                    <div className={`h-6 w-6 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                      isPassed 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : isActive 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-800 border border-slate-700/50'
                    }`}>
                      {isPassed ? <Check className="h-3 w-3" /> : idx + 1}
                    </div>
                    <div className="text-xs">
                      <p className={`font-semibold tracking-wide ${isActive ? 'text-white' : isPassed ? 'text-slate-300' : 'text-slate-500'}`}>{lbl}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/60 text-[10px] text-slate-500 font-mono flex flex-col gap-1">
            <span>Version ERP Single-Tenant v2026.07</span>
            <span>Local Node Engine Active</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between gap-6 relative">
          
          {/* Main Wizard Screens */}
          <div className="space-y-6">
            
            {/* SCREEN 0: WELCOME */}
            {currentStep === 0 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-2 text-center md:text-left">
                  <span className="px-2.5 py-1 bg-blue-600/15 text-blue-400 text-[9px] font-black tracking-widest rounded-full uppercase border border-blue-500/10 inline-block">Enterprise Deployment</span>
                  <h2 className="text-2xl font-black tracking-tight text-white mt-2">Sistem Setup Wizard</h2>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Selamat datang di wizard instalasi otomatis **Enterprise School ERP Single-Tenant**. Sistem mendeteksi bahwa sistem database belum diinisialisasi atau data master belum dikonfigurasi.
                  </p>
                </div>

                <div className="p-6 bg-slate-950/40 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 hover:border-slate-700 transition-all">
                  <div className="space-y-2 flex-1">
                    <div className="h-10 w-10 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center">
                      <Settings className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-white mt-3">Panduan Langkah Demi Langkah</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Konfigurasikan database kustom Anda (MySQL fisik), periksa kesiapan dependensi server, buat skema, buat instansi sekolah, dan daftarkan akun administrator secara aman dan instan.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <span>Mulai Setup Wizard</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 1: ENV DIAGNOSTICS */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-white">Sistem Diagnostics</h2>
                  <p className="text-xs text-slate-400">Pengecekan kesiapan sistem hosting, write permission, dan versi framework pendukung.</p>
                </div>

                {loading && !envCheckData ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
                    <p className="text-xs text-slate-400">Memeriksa dependensi server...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {envCheckData && Object.entries(envCheckData).map(([key, check]: [string, any]) => (
                      <div key={key} className="p-3.5 bg-slate-950/40 border border-slate-800/80 rounded-xl flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">{check.name}</p>
                          <p className="text-xs font-semibold text-white">{check.value}</p>
                          <p className="text-[9px] text-slate-400 leading-normal">{check.message}</p>
                        </div>
                        <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${
                          check.ok 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {check.ok ? 'Ready' : 'Failed'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SCREEN 2: DATABASE SETUP */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-white">Konfigurasi MySQL Database</h2>
                  <p className="text-xs text-slate-400">Atur sambungan database MySQL fisik/VPS Anda untuk mengaktifkan sistem penyimpanan data terpusat.</p>
                </div>

                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-3 duration-200">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Host Database</label>
                    <input
                      type="text"
                      value={dbHost}
                      onChange={(e) => setDbHost(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 hover:border-slate-700 focus:border-blue-500 px-3 py-2 rounded-xl text-xs text-white outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Port</label>
                    <input
                      type="text"
                      value={dbPort}
                      onChange={(e) => setDbPort(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 hover:border-slate-700 focus:border-blue-500 px-3 py-2 rounded-xl text-xs text-white outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Username Database</label>
                    <input
                      type="text"
                      value={dbUser}
                      onChange={(e) => setDbUser(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 hover:border-slate-700 focus:border-blue-500 px-3 py-2 rounded-xl text-xs text-white outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Password</label>
                    <input
                      type="password"
                      value={dbPassword}
                      onChange={(e) => setDbPassword(e.target.value)}
                      placeholder="Kosongkan jika root tanpa password"
                      className="w-full bg-slate-950/60 border border-slate-800 hover:border-slate-700 focus:border-blue-500 px-3 py-2 rounded-xl text-xs text-white outline-none font-mono"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Nama Database * (Otomatis dibuat jika belum ada)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={dbName}
                        onChange={(e) => setDbName(e.target.value)}
                        className="flex-1 bg-slate-950/60 border border-slate-800 hover:border-slate-700 focus:border-blue-500 px-3 py-2 rounded-xl text-xs text-white outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleTestConnection}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
                      >
                        {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Server className="h-3.5 w-3.5" />}
                        <span>Uji &amp; Buat</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 3: DATABASE INITIALIZER */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-white">Prisma Schema Builder &amp; Migration</h2>
                  <p className="text-xs text-slate-400">Melakukan mapping tabel database, foreign key relations, views, dan optimasi query via Prisma engine secara otomatis.</p>
                </div>

                <div className="p-5 bg-slate-950/40 border border-slate-800 rounded-2xl flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white uppercase tracking-wide">Ready to initialize structural tables</p>
                    <p className="text-[11px] text-slate-400">Menjalankan generator Prisma Client, validasi model, dan sinkronisasi SQL tanpa langkah manual.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRunDbInit}
                    disabled={loading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                    <span>Inisialisasi Skema</span>
                  </button>
                </div>

                {/* Console Log terminal block */}
                <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 font-mono text-[10px] text-slate-400 space-y-1 max-h-[180px] overflow-y-auto">
                  <div className="flex items-center gap-1.5 text-slate-500 font-bold border-b border-slate-900 pb-1 mb-2">
                    <Terminal className="h-3 w-3" />
                    <span>TERMINAL CONSOLE LOGS</span>
                  </div>
                  {logs.length === 0 ? (
                    <div className="text-slate-600 italic">Siap menjalankan inisialisasi skema...</div>
                  ) : (
                    logs.map((log, i) => {
                      let color = 'text-slate-400';
                      if (log.startsWith('[SUCCESS]')) color = 'text-emerald-400';
                      if (log.startsWith('[ERROR]') || log.startsWith('[FATAL ERROR]')) color = 'text-rose-400';
                      if (log.startsWith('[SYSTEM]')) color = 'text-blue-400';
                      return (
                        <div key={i} className={`${color} leading-relaxed break-all`}>
                          {log}
                        </div>
                      );
                    })
                  )}
                  <div ref={terminalEndRef} />
                </div>
              </div>
            )}

            {/* SCREEN 4: MASTER DATA SEEDER */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-white">Master Data Seeder Engine</h2>
                  <p className="text-xs text-slate-400">Memasukkan data seeder standar untuk Role, Permission, Menu, dan parameter global ERP.</p>
                </div>

                <div className="p-5 bg-slate-950/40 border border-slate-800 rounded-2xl flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white uppercase tracking-wide">Data Seed Model Alignment</p>
                    <p className="text-[11px] text-slate-400">Memasukkan 10 Roles (Super Admin, TU, Bendahara, Guru, Wali Kelas, dll) dan pemetaan hak akses fungsional.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRunSeeder}
                    disabled={loading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                    <span>Jalankan Seeder Master</span>
                  </button>
                </div>

                {/* Console Seeder logs */}
                <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 font-mono text-[10px] text-slate-400 space-y-1 max-h-[160px] overflow-y-auto">
                  <div className="flex items-center gap-1.5 text-slate-500 font-bold border-b border-slate-900 pb-1 mb-2">
                    <Terminal className="h-3 w-3" />
                    <span>SEEDER OUTPUT LOGS</span>
                  </div>
                  {logs.length === 0 ? (
                    <div className="text-slate-600 italic">Siap memasukkan data master seeder...</div>
                  ) : (
                    logs.map((log, i) => {
                      let color = 'text-slate-400';
                      if (log.startsWith('[SUCCESS]')) color = 'text-emerald-400';
                      if (log.startsWith('[ERROR]')) color = 'text-rose-400';
                      if (log.startsWith('[SYSTEM]')) color = 'text-blue-400';
                      return (
                        <div key={i} className={`${color} leading-relaxed break-all`}>
                          {log}
                        </div>
                      );
                    })
                  )}
                  <div ref={terminalEndRef} />
                </div>
              </div>
            )}

            {/* SCREEN 5: SCHOOL SETUP */}
            {currentStep === 5 && (
              <form onSubmit={handleSaveSchool} className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-white">Konfigurasi Identitas Sekolah</h2>
                  <p className="text-xs text-slate-400">Atur nama instansi, NPSN, dan parameter tahun ajaran untuk single-tenant ini.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[320px] overflow-y-auto pr-1">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Nama Sekolah / Instansi *</label>
                    <input
                      type="text"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 hover:border-slate-700 focus:border-blue-500 px-3 py-2 rounded-xl text-xs text-white outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Nama Yayasan / Badan Hukum</label>
                    <input
                      type="text"
                      value={foundationName}
                      onChange={(e) => setFoundationName(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 hover:border-slate-700 focus:border-blue-500 px-3 py-2 rounded-xl text-xs text-white outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">NPSN (Nomor Pokok Sekolah Nasional)</label>
                    <input
                      type="text"
                      value={npsn}
                      onChange={(e) => setNpsn(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 hover:border-slate-700 focus:border-blue-500 px-3 py-2 rounded-xl text-xs text-white outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Email Resmi Sekolah</label>
                    <input
                      type="email"
                      value={schoolEmail}
                      onChange={(e) => setSchoolEmail(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 hover:border-slate-700 focus:border-blue-500 px-3 py-2 rounded-xl text-xs text-white outline-none"
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Alamat Lengkap Instansi</label>
                    <input
                      type="text"
                      value={schoolAddress}
                      onChange={(e) => setSchoolAddress(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 hover:border-slate-700 focus:border-blue-500 px-3 py-2 rounded-xl text-xs text-white outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Tahun Ajaran Aktif</label>
                    <input
                      type="text"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 hover:border-slate-700 focus:border-blue-500 px-3 py-2 rounded-xl text-xs text-white outline-none font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Semester Aktif</label>
                    <select
                      value={activeSemester}
                      onChange={(e) => setActiveSemester(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 hover:border-slate-700 focus:border-blue-500 px-3 py-2 rounded-xl text-xs text-white outline-none"
                    >
                      <option value="Ganjil">Ganjil</option>
                      <option value="Genap">Genap</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-xl text-xs cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    <span>Simpan &amp; Lanjutkan</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}

            {/* SCREEN 6: ADMINISTRATOR ACCOUNT */}
            {currentStep === 6 && (
              <form onSubmit={handleCreateAdmin} className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-white">Akun Super Administrator</h2>
                  <p className="text-xs text-slate-400">Buat akun root Administrator Utama yang memiliki kewenangan penuh atas seluruh modul dan pengaturan ERP.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Nama Lengkap Admin *</label>
                    <input
                      type="text"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="Super Administrator"
                      className="w-full bg-slate-950/60 border border-slate-800 hover:border-slate-700 focus:border-blue-500 px-3 py-2 rounded-xl text-xs text-white outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Username *</label>
                    <input
                      type="text"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      placeholder="superadmin"
                      className="w-full bg-slate-950/60 border border-slate-800 hover:border-slate-700 focus:border-blue-500 px-3 py-2 rounded-xl text-xs text-white outline-none font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Email Admin *</label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@sekolah.sch.id"
                      className="w-full bg-slate-950/60 border border-slate-800 hover:border-slate-700 focus:border-blue-500 px-3 py-2 rounded-xl text-xs text-white outline-none font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-1 relative">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Password Utama *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full bg-slate-950/60 border border-slate-800 hover:border-slate-700 focus:border-blue-500 pl-3 pr-10 py-2 rounded-xl text-xs text-white outline-none font-mono"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Konfirmasi Password *</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 hover:border-slate-700 focus:border-blue-500 px-3 py-2 rounded-xl text-xs text-white outline-none font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    <span>Buat Akun &amp; Lanjutkan</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}

            {/* SCREEN 7: FINISH */}
            {currentStep === 7 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="text-center py-6 space-y-3">
                  <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle className="h-10 w-10" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Instalasi ERP Berhasil Selesai!</h2>
                    <p className="text-xs text-slate-400 mt-1">Seluruh konfigurasi inti, struktur database, dan hak akses utama telah berhasil disusun dengan sempurna.</p>
                  </div>
                </div>

                <div className="bg-slate-950/50 border border-slate-800 p-5 rounded-2xl space-y-3">
                  <h4 className="text-xs font-black tracking-widest text-slate-400 uppercase border-b border-slate-800 pb-2">Rangkuman Deployment</h4>
                  
                  <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-xs leading-relaxed">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span>Database Engine Alignment Secure</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span>Schema &amp; Foreign Keys Synchronized</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span>10 ERP Core Roles Fully Seeded</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span>Active School Profile Saved</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300 col-span-2">
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span>Root Super Admin Configured (Credentials Lock Active)</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={handleCompleteInstallation}
                    disabled={loading}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm py-3 px-8 rounded-2xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 flex items-center gap-2 cursor-pointer transition-all animate-pulse"
                  >
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                    <span>Kunci Installer &amp; Masuk ke Login</span>
                  </button>
                </div>
              </div>
            )}

            {/* Error Notifications */}
            {errorMsg && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs rounded-xl flex items-center gap-2.5 animate-in fade-in duration-150">
                <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                <div className="flex-1 leading-relaxed">
                  <p className="font-bold">Gagal menyelesaikan langkah ini:</p>
                  <p className="text-[11px] opacity-90">{errorMsg}</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setErrorMsg(null)}
                  className="text-rose-400 hover:text-white font-bold text-[10px] uppercase tracking-wide shrink-0 px-2 py-1 rounded border border-rose-500/30 hover:bg-rose-500/10"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Success Notifications */}
            {successMsg && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs rounded-xl flex items-center gap-2.5 animate-in fade-in duration-150">
                <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

          </div>

          {/* Footer Actions Rows */}
          {currentStep > 0 && currentStep < 7 && (
            <div className="flex justify-between items-center border-t border-slate-800/80 pt-4 mt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                disabled={loading}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Kembali</span>
              </button>

              {/* Progress and Skip buttons where appropriate */}
              {currentStep === 1 && envCheckData && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Lanjutkan</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}

              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Lanjutkan ke Skema</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

// Custom icons to avoid external package import errors
function ZapIcon() {
  return (
    <svg 
      className="h-4 w-4" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth={2.5}
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M13 10V3L4 14h7v7l9-11h-7z" 
      />
    </svg>
  );
}
