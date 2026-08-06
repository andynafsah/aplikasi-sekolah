import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Wallet,
  Users,
  Clock,
  Layers,
  Settings,
  FileText,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  QrCode,
  Barcode,
  Download,
  Send,
  Plus,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Edit3,
  ShieldAlert,
  FileSpreadsheet,
  Building,
  HelpCircle,
  UserCheck,
  Search,
  Upload,
  RefreshCw,
  Mail,
  MessageSquare
} from 'lucide-react';

// Submenus for the Payroll page
type PayrollSubTab = 'dashboard' | 'masters' | 'runs' | 'loans_kasbon' | 'thr_taxes' | 'audit_report';

export default function Payroll() {
  const { tenant, user } = useAuth();
  const [subTab, setSubTab] = useState<PayrollSubTab>('dashboard');
  
  // State variables for dynamic data
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('2025-07');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Compensation & Master Data
  const [masters, setMasters] = useState<any[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [kasbons, setKasbons] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  
  // Selected Slip for PDF / digital preview modal
  const [selectedSlip, setSelectedSlip] = useState<any | null>(null);
  
  // Master Setup Forms
  const [isAddingMaster, setIsAddingMaster] = useState(false);
  const [masterForm, setMasterForm] = useState({
    employeeId: '',
    employeeName: '',
    role: 'GURU',
    baseSalary: 4000000,
    dailyAllowance: 25000,
    positionAllowance: 500000,
    familyAllowance: 250000,
    certificationAllowance: 0,
    functionalAllowance: 150000,
    pondokAllowance: 200000,
    bpjsAllowance: 120000,
    taxAllowance: 50000
  });

  // Loan Application Form
  const [isApplyingLoan, setIsApplyingLoan] = useState(false);
  const [loanForm, setLoanForm] = useState({
    employeeId: '',
    employeeName: '',
    amount: 5000000,
    tenor: 10,
    reason: 'Biaya Pendidikan Anak'
  });

  // Kasbon Application Form
  const [isApplyingKasbon, setIsApplyingKasbon] = useState(false);
  const [kasbonForm, setKasbonForm] = useState({
    employeeId: '',
    employeeName: '',
    amount: 500000,
    reason: 'Keperluan medis darurat keluarga'
  });

  // THR Distribution Form
  const [thrForm, setThrForm] = useState({
    type: 'AUTOMATIC' as 'AUTOMATIC' | 'PERCENTAGE' | 'NOMINAL',
    multiplier: 1.0,
    fixedValue: 1500000
  });

  // General Notification Alert Toast
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const showAlert = (text: string, type: 'success' | 'error' = 'success') => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  // 1. Fetch data from endpoints
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      const body = JSON.stringify({ tenant_id: tenant?.id || 'tenant-1', period });

      // Fetch Salary Masters
      const resM = await fetch('/api/payroll/getMasters', { method: 'POST', headers, body });
      const dataM = await resM.json();
      if (dataM.success) setMasters(dataM.data || []);

      // Fetch Calculation Runs for current period
      const resR = await fetch('/api/payroll/getRuns', { method: 'POST', headers, body });
      const dataR = await resR.json();
      if (dataR.success) setRuns(dataR.data || []);

      // Fetch Loans
      const resL = await fetch('/api/payroll/getLoans', { method: 'POST', headers, body });
      const dataL = await resL.json();
      if (dataL.success) setLoans(dataL.data || []);

      // Fetch Kasbons
      const resK = await fetch('/api/payroll/getKasbons', { method: 'POST', headers, body });
      const dataK = await resK.json();
      if (dataK.success) setKasbons(dataK.data || []);

      // Fetch Audit trail logs
      const resA = await fetch('/api/payroll/getAuditLogs', { method: 'POST', headers, body });
      const dataA = await resA.json();
      if (dataA.success) setAuditLogs(dataA.data || []);

    } catch (err: any) {
      console.error('Error loading payroll data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [tenant, period]);

  // 2. Trigger automated calculation engine for period
  const runPayrollCalculation = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payroll/calculatePeriod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: tenant?.id || 'tenant-1', period })
      });
      const resData = await res.json();
      if (resData.success) {
        setRuns(resData.data || []);
        showAlert(`Sukses menghitung & menyinkronkan data presensi & honor mengajar untuk periode ${period}!`);
        // reload logs
        const resA = await fetch('/api/payroll/getAuditLogs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tenant_id: tenant?.id || 'tenant-1' })
        });
        const dataA = await resA.json();
        if (dataA.success) setAuditLogs(dataA.data || []);
      } else {
        showAlert(resData.message || 'Kalkulasi gagal.', 'error');
      }
    } catch (err: any) {
      showAlert(`Koneksi error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 3. Save Salary master configuration
  const handleSaveMaster = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/payroll/saveMaster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenant?.id || 'tenant-1',
          ...masterForm
        })
      });
      const data = await res.json();
      if (data.success) {
        showAlert(`Profil gaji master untuk ${masterForm.employeeName} berhasil disimpan.`);
        setIsAddingMaster(false);
        fetchAllData();
      } else {
        showAlert(data.message, 'error');
      }
    } catch (err: any) {
      showAlert(`Error: ${err.message}`, 'error');
    }
  };

  // 4. Submit Loan Application
  const handleSaveLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    const inst = Math.floor(loanForm.amount / loanForm.tenor);
    const payload = {
      ...loanForm,
      monthlyInstallment: inst
    };
    try {
      const res = await fetch('/api/payroll/submitLoan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenant?.id || 'tenant-1',
          ...payload
        })
      });
      const data = await res.json();
      if (data.success) {
        showAlert('Pengajuan pinjaman pegawai berhasil dikirim ke antrean persetujuan.');
        setIsApplyingLoan(false);
        fetchAllData();
      } else {
        showAlert(data.message, 'error');
      }
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  // 5. Approve loan installment
  const handleApproveLoan = async (id: string, roleLevel: string) => {
    try {
      const res = await fetch('/api/payroll/approveLoan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenant?.id || 'tenant-1',
          id,
          levelRole: roleLevel
        })
      });
      const data = await res.json();
      if (data.success) {
        showAlert('Status persetujuan pinjaman berhasil diperbarui!');
        fetchAllData();
      } else {
        showAlert(data.message, 'error');
      }
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  // 6. Submit Kasbon
  const handleSaveKasbon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/payroll/submitKasbon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenant?.id || 'tenant-1',
          ...kasbonForm
        })
      });
      const data = await res.json();
      if (data.success) {
        showAlert('Kasbon darurat berhasil diajukan!');
        setIsApplyingKasbon(false);
        fetchAllData();
      } else {
        showAlert(data.message, 'error');
      }
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  // 7. Approve Kasbon
  const handleApproveKasbon = async (id: string) => {
    try {
      const res = await fetch('/api/payroll/approveKasbon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenant?.id || 'tenant-1',
          id
        })
      });
      const data = await res.json();
      if (data.success) {
        showAlert('Kasbon disetujui untuk dicairkan oleh Bendahara. Potong Gaji otomatis saat gajian!');
        fetchAllData();
      } else {
        showAlert(data.message, 'error');
      }
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  // 8. Distribute THR
  const handleDistributeThr = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/payroll/distributeThr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenant?.id || 'tenant-1',
          period,
          ...thrForm
        })
      });
      const data = await res.json();
      if (data.success) {
        showAlert(data.message);
        fetchAllData();
      } else {
        showAlert(data.message, 'error');
      }
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  // 9. Hierarchical Multi-Level Approval for Period Runs
  const handleApprovePeriod = async (levelRole: string) => {
    try {
      const res = await fetch('/api/payroll/approvePeriod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenant?.id || 'tenant-1',
          period,
          levelRole
        })
      });
      const data = await res.json();
      if (data.success) {
        showAlert(`Persetujuan tingkat [${levelRole}] berhasil dicatat!`);
        fetchAllData();
      } else {
        showAlert(data.message, 'error');
      }
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  // 10. Mock digital actions
  const triggerDownloadPDF = (slip: any) => {
    showAlert(`Mengunduh PDF Slip Gaji Digital untuk ${slip.employeeName} (${slip.meta.barcodeValue})...`);
  };

  const triggerMockWhatsapp = (slip: any) => {
    showAlert(`Slip Gaji periode ${slip.periodLabel} dikirim langsung ke Nomor WhatsApp ${slip.employeeName} disertai QR Link Slip Digital!`);
  };

  const triggerMockEmail = (slip: any) => {
    showAlert(`Email Slip Gaji PDF terenkripsi digital signature berhasil dikirim ke email staf.`);
  };

  // Compute aggregated values
  const totalPayroll = runs.reduce((sum, r) => sum + r.totals.netSalary, 0);
  const totalTunjangan = runs.reduce((sum, r) => {
    const e = r.earnings.allowances;
    return sum + e.position + e.transport + e.makan + e.family + e.certification + e.functional + e.pondok + e.custom;
  }, 0);
  const totalPotongan = runs.reduce((sum, r) => {
    const d = r.deductions;
    return sum + d.late + d.alfa + d.leave + d.loan + d.kasbon + d.bpjs + d.taxPph21 + d.yayasan + d.custom;
  }, 0);
  const totalBonus = runs.reduce((sum, r) => sum + r.bonuses.annualBonus, 0);
  const totalLembur = runs.reduce((sum, r) => sum + r.earnings.overtimeHonor, 0);
  const totalThr = runs.reduce((sum, r) => sum + r.bonuses.thr, 0);

  // Filtered lists based on search
  const filteredMasters = masters.filter(m =>
    m.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) || m.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRuns = runs.filter(r =>
    r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) || r.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      
      {/* Toast Alert Status Bar */}
      {alertMsg && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border transition-all duration-300 ${
          alertMsg.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {alertMsg.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-emerald-600 animate-bounce" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600 animate-bounce" />
          )}
          <span className="text-xs font-semibold">{alertMsg.text}</span>
        </div>
      )}

      {/* Primary Context Header & Global Control Rails */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">MANAJEMEN PAYROLL & COMPENSATION</h1>
              <p className="text-xs text-slate-500 font-medium">Modul Otomasi Penggajian Enterprise, Honor Mengajar, Lembur, Pinjaman & Kasbon</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Calendar Period Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">Periode</span>
            <input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={fetchAllData}
            disabled={loading}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg cursor-pointer transition-colors"
            title="Muat ulang data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={runPayrollCalculation}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Proses Payroll Engine</span>
          </button>
        </div>
      </div>

      {/* Submenus Navigation Strip */}
      <div className="flex overflow-x-auto gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm shrink-0">
        <button
          onClick={() => setSubTab('dashboard')}
          className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            subTab === 'dashboard' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Dashboard & Ringkasan</span>
        </button>

        <button
          onClick={() => setSubTab('masters')}
          className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            subTab === 'masters' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Konfigurasi Master Gaji</span>
        </button>

        <button
          onClick={() => setSubTab('runs')}
          className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            subTab === 'runs' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Daftar Gaji & Slip Digital</span>
        </button>

        <button
          onClick={() => setSubTab('loans_kasbon')}
          className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            subTab === 'loans_kasbon' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span>Kredit & Kasbon Pegawai</span>
        </button>

        <button
          onClick={() => setSubTab('thr_taxes')}
          className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            subTab === 'thr_taxes' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>THR & Pajak PPh21 / BPJS</span>
        </button>

        <button
          onClick={() => setSubTab('audit_report')}
          className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            subTab === 'audit_report' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          <span>Laporan & Audit Trail</span>
        </button>
      </div>

      {/* SUB-VIEW 1: DASHBOARD & SUMMARY */}
      {subTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Key ERP Analytics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase font-mono">TOTAL NET PAYROLL</span>
              <div className="mt-2">
                <span className="text-lg font-extrabold text-slate-800">Rp {(totalPayroll || 0).toLocaleString('id-ID')}</span>
                <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>Periode Aktif</span>
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase font-mono">TOTAL TUNJANGAN</span>
              <div className="mt-2">
                <span className="text-lg font-extrabold text-slate-800">Rp {(totalTunjangan || 0).toLocaleString('id-ID')}</span>
                <p className="text-[10px] text-slate-500 font-medium mt-1">Sertifikasi, keluarga, pondok, dll</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase font-mono">TOTAL POTONGAN</span>
              <div className="mt-2">
                <span className="text-lg font-extrabold text-slate-800 text-rose-600">Rp {(totalPotongan || 0).toLocaleString('id-ID')}</span>
                <p className="text-[10px] text-slate-500 font-medium mt-1">Terlambat, pinjaman, kasbon</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase font-mono">TOTAL BONUS</span>
              <div className="mt-2">
                <span className="text-lg font-extrabold text-slate-800 text-teal-600">Rp {(totalBonus || 0).toLocaleString('id-ID')}</span>
                <p className="text-[10px] text-slate-500 font-medium mt-1">Bonus tahunan & insentif khusus</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase font-mono">TOTAL LEMBUR</span>
              <div className="mt-2">
                <span className="text-lg font-extrabold text-slate-800">Rp {(totalLembur || 0).toLocaleString('id-ID')}</span>
                <p className="text-[10px] text-slate-500 font-medium mt-1">Dihitung per jam / shift staf</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase font-mono">TOTAL THR</span>
              <div className="mt-2">
                <span className="text-lg font-extrabold text-slate-800 text-violet-600">Rp {(totalThr || 0).toLocaleString('id-ID')}</span>
                <p className="text-[10px] text-slate-500 font-medium mt-1 font-mono">Multiplier Event</p>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Quick Informational / Action Panel */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-md space-y-4">
              <h3 className="text-sm font-bold tracking-wider font-mono uppercase text-blue-400">PAYROLL COMPLIANCE STATUS</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-xs text-white/70">Wajib Pajak (PPh21)</span>
                  <span className="text-xs font-bold bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-500/30">AKTIF / READY</span>
                </div>

                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-xs text-white/70">Subsidi & Iuran BPJS</span>
                  <span className="text-xs font-bold bg-teal-500/20 text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-500/30">AKTIF / READY</span>
                </div>

                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-xs text-white/70">Guru Pengganti Integrasi</span>
                  <span className="text-xs font-bold bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30">AUTO CALC</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/70">Metode Penggajian</span>
                  <span className="text-xs font-bold text-slate-200 font-mono">Single Tenant ERP Enterprise</span>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-[11px] text-white/60 leading-relaxed">
                  Sistem otomatis menarik log data Guru Pengganti dari modul **Smart Attendance** untuk menghitung transfer insentif guru pengganti dan pendebetan sanksi ke rekening guru asli.
                </p>
              </div>
            </div>

            {/* Hierarchical Authorization Pipeline Progress */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 lg:col-span-2">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">ALUR WORKFLOW PERSETUJUAN PERIODE</h3>
              
              {/* Approval status indicators */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
                
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-1">
                  <span className="text-[10px] font-bold text-emerald-700 font-mono block">1. STAFF TU</span>
                  <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded block">DRAFTED</span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-600 font-mono block">2. KEPALA TU</span>
                  <button
                    onClick={() => handleApprovePeriod('KEPALA_TU')}
                    className="w-full text-[10px] bg-blue-600 hover:bg-blue-700 text-white font-bold py-0.5 px-1.5 rounded cursor-pointer"
                  >
                    Setujui
                  </button>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-600 font-mono block">3. BENDAHARA</span>
                  <button
                    onClick={() => handleApprovePeriod('BENDAHARA')}
                    className="w-full text-[10px] bg-blue-600 hover:bg-blue-700 text-white font-bold py-0.5 px-1.5 rounded cursor-pointer"
                  >
                    Setujui
                  </button>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-600 font-mono block">4. KEPALA SEKOLAH</span>
                  <button
                    onClick={() => handleApprovePeriod('KEPALA_SEKOLAH')}
                    className="w-full text-[10px] bg-blue-600 hover:bg-blue-700 text-white font-bold py-0.5 px-1.5 rounded cursor-pointer"
                  >
                    Setujui
                  </button>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-600 font-mono block">5. YAYASAN</span>
                  <button
                    onClick={() => handleApprovePeriod('KETUA_YAYASAN')}
                    className="w-full text-[10px] bg-red-600 hover:bg-red-700 text-white font-bold py-0.5 px-1.5 rounded cursor-pointer"
                  >
                    DISBURSE
                  </button>
                </div>

              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-start gap-2 text-xs text-slate-600">
                <HelpCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                <p>
                  Persetujuan final dari **Ketua Yayasan** secara otomatis mencairkan (disburse) status slip gaji ke status **PAID**, sekaligus mengurangi sisa pinjaman & menutup kasbon darurat aktif secara periodik.
                </p>
              </div>

            </div>

          </div>

          {/* Quick Active Payroll Runs in current month */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">Kalkulasi Gaji Karyawan - {period}</h3>
              <span className="text-xs bg-slate-100 text-slate-600 border px-3 py-1 rounded-full font-mono font-bold">
                {runs.length} Karyawan Terdaftar
              </span>
            </div>

            {runs.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 border border-dashed rounded-xl space-y-2">
                <FileText className="h-8 w-8 text-slate-300 mx-auto" />
                <span className="text-xs font-medium text-slate-400 block">Belum ada kalkulasi payroll untuk bulan {period}.</span>
                <button
                  onClick={runPayrollCalculation}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg cursor-pointer transition-all"
                >
                  Hitung Otomatis Sekarang
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-mono text-[10px] uppercase">
                      <th className="py-2 px-3">Nama Pegawai</th>
                      <th className="py-2 px-3">Role</th>
                      <th className="py-2 px-3">Gaji Pokok</th>
                      <th className="py-2 px-3">Tunjangan</th>
                      <th className="py-2 px-3">Potongan</th>
                      <th className="py-2 px-3">Penerimaan Netto</th>
                      <th className="py-2 px-3">Status Bayar</th>
                      <th className="py-2 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runs.slice(0, 5).map((run: any) => (
                      <tr key={run.id} className="border-b border-slate-100 hover:bg-slate-50 text-slate-700">
                        <td className="py-3 px-3 font-semibold">{run.employeeName}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            run.role === 'GURU' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {run.role}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono">Rp {run.earnings.baseSalary.toLocaleString('id-ID')}</td>
                        <td className="py-3 px-3 font-mono text-emerald-600">+Rp {run.totals.grossEarnings.toLocaleString('id-ID')}</td>
                        <td className="py-3 px-3 font-mono text-rose-600">-Rp {run.totals.totalDeductions.toLocaleString('id-ID')}</td>
                        <td className="py-3 px-3 font-extrabold font-mono text-slate-900">Rp {run.totals.netSalary.toLocaleString('id-ID')}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            run.meta.paymentStatus === 'PAID'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {run.meta.paymentStatus === 'PAID' ? 'TERBAYAR' : 'BELUM DIBAYAR'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setSelectedSlip(run)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
                          >
                            Tampilkan Slip Gaji
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: KONFIGURASI MASTER GAJI */}
      {subTab === 'masters' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">Katalog Master Gaji Pokok & Tunjangan</h2>
              <p className="text-xs text-slate-500">Kustomisasi Gaji Pokok, Tunjangan Fungsional, dan Pondok per Pegawai</p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari karyawan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs w-full focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <button
                onClick={() => setIsAddingMaster(true)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-2 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah Master</span>
              </button>
            </div>
          </div>

          {isAddingMaster && (
            <form onSubmit={handleSaveMaster} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">Form Pengaturan Gaji Pegawai Baru</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">ID Karyawan</label>
                  <input
                    type="text"
                    required
                    placeholder="emp-123"
                    value={masterForm.employeeId}
                    onChange={(e) => setMasterForm({ ...masterForm, employeeId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs font-medium focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Nama Lengkap & Gelar</label>
                  <input
                    type="text"
                    required
                    placeholder="Ustadzah Siti Aminah, S.Pd"
                    value={masterForm.employeeName}
                    onChange={(e) => setMasterForm({ ...masterForm, employeeName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs font-medium focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Tipe Jabatan</label>
                  <select
                    value={masterForm.role}
                    onChange={(e) => setMasterForm({ ...masterForm, role: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs font-medium focus:bg-white focus:outline-none"
                  >
                    <option value="GURU">GURU / USTADZ</option>
                    <option value="PEGAWAI">PEGAWAI / STAF TU</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Gaji Pokok (Bulanan)</label>
                  <input
                    type="number"
                    required
                    value={masterForm.baseSalary}
                    onChange={(e) => setMasterForm({ ...masterForm, baseSalary: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs font-bold text-slate-700 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t pt-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Tunjangan Jabatan</label>
                  <input
                    type="number"
                    value={masterForm.positionAllowance}
                    onChange={(e) => setMasterForm({ ...masterForm, positionAllowance: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs font-medium focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Tunjangan Keluarga</label>
                  <input
                    type="number"
                    value={masterForm.familyAllowance}
                    onChange={(e) => setMasterForm({ ...masterForm, familyAllowance: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs font-medium focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Tunjangan Pondok</label>
                  <input
                    type="number"
                    value={masterForm.pondokAllowance}
                    onChange={(e) => setMasterForm({ ...masterForm, pondokAllowance: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs font-medium focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Subsidi BPJS</label>
                  <input
                    type="number"
                    value={masterForm.bpjsAllowance}
                    onChange={(e) => setMasterForm({ ...masterForm, bpjsAllowance: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs font-medium focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddingMaster(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Simpan Master Gaji
                </button>
              </div>
            </form>
          )}

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-mono text-[10px] uppercase">
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Nama Lengkap</th>
                    <th className="py-3 px-4">Jabatan</th>
                    <th className="py-3 px-4 text-right">Gaji Pokok</th>
                    <th className="py-3 px-4 text-right">Tunjangan Jabatan</th>
                    <th className="py-3 px-4 text-right">Tunjangan Pondok</th>
                    <th className="py-3 px-4 text-right">Tunjangan Keluarga</th>
                    <th className="py-3 px-4 text-right">Subsidi BPJS</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMasters.map((m) => (
                    <tr key={m.employeeId} className="border-b border-slate-100 hover:bg-slate-50 text-slate-700 font-medium">
                      <td className="py-3 px-4 font-mono font-bold text-slate-500">{m.employeeId}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{m.employeeName}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.role === 'GURU' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {m.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold">Rp {m.baseSalary.toLocaleString('id-ID')}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">Rp {m.positionAllowance.toLocaleString('id-ID')}</td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-600">Rp {m.pondokAllowance.toLocaleString('id-ID')}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">Rp {m.familyAllowance.toLocaleString('id-ID')}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">Rp {m.bpjsAllowance.toLocaleString('id-ID')}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setMasterForm({
                              employeeId: m.employeeId,
                              employeeName: m.employeeName,
                              role: m.role,
                              baseSalary: m.baseSalary,
                              dailyAllowance: m.dailyAllowance,
                              positionAllowance: m.positionAllowance,
                              familyAllowance: m.familyAllowance,
                              certificationAllowance: m.certificationAllowance,
                              functionalAllowance: m.functionalAllowance,
                              pondokAllowance: m.pondokAllowance,
                              bpjsAllowance: m.bpjsAllowance,
                              taxAllowance: m.taxAllowance
                            });
                            setIsAddingMaster(true);
                          }}
                          className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-950 cursor-pointer"
                          title="Edit Master"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: DAFTAR GAJI RUNS & SLIP DIGITAL */}
      {subTab === 'runs' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">Lembar Penggajian Pegawai - Periode {period}</h2>
              <p className="text-xs text-slate-500">Kalkulasi Net Take Home Pay, Tunjangan Harian, Potongan Absensi, dan Kasbon / Pinjaman Aktif</p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari slip..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <button
                onClick={runPayrollCalculation}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
              >
                Kalkulasi Ulang
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-mono text-[10px] uppercase">
                    <th className="py-3 px-4">Karyawan</th>
                    <th className="py-3 px-4">Gaji Pokok</th>
                    <th className="py-3 px-4">Honor Mengajar</th>
                    <th className="py-3 px-4">Tunjangan Total</th>
                    <th className="py-3 px-4">Sanksi Absensi</th>
                    <th className="py-3 px-4">Kasbon / Cicilan</th>
                    <th className="py-3 px-4">Pajak PPh21</th>
                    <th className="py-3 px-4 font-bold">Gaji Bersih (Take Home)</th>
                    <th className="py-3 px-4 text-right">Unduh / Kirim</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRuns.map((r) => (
                    <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 text-slate-700">
                      <td className="py-3 px-4">
                        <div>
                          <span className="font-bold text-slate-800 block">{r.employeeName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{r.employeeId} • {r.role}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono">Rp {r.earnings.baseSalary.toLocaleString('id-ID')}</td>
                      <td className="py-3 px-4 font-mono text-blue-600">Rp {(r.earnings.teachingHonor + r.earnings.substituteHonor).toLocaleString('id-ID')}</td>
                      <td className="py-3 px-4 font-mono text-emerald-600">
                        +Rp {(
                          r.earnings.allowances.position +
                          r.earnings.allowances.transport +
                          r.earnings.allowances.makan +
                          r.earnings.allowances.family +
                          r.earnings.allowances.certification +
                          r.earnings.allowances.functional +
                          r.earnings.allowances.pondok
                        ).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 font-mono text-rose-600">
                        -Rp {(r.deductions.late + r.deductions.alfa + r.deductions.leave).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 font-mono text-rose-500">
                        -Rp {(r.deductions.loan + r.deductions.kasbon).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">Rp {r.deductions.taxPph21.toLocaleString('id-ID')}</td>
                      <td className="py-3 px-4 font-extrabold font-mono text-slate-900 bg-slate-50/50">
                        Rp {r.totals.netSalary.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => setSelectedSlip(r)}
                          className="p-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded cursor-pointer"
                          title="Pratinjau Slip Digital"
                        >
                          <QrCode className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => triggerDownloadPDF(r)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded cursor-pointer"
                          title="Unduh Slip PDF"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => triggerMockWhatsapp(r)}
                          className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded cursor-pointer"
                          title="Kirim Slip via WhatsApp"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: PINJAMAN & KASBON PEGAWAI */}
      {subTab === 'loans_kasbon' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Section A: Pinjaman Berjangka */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">Kredit / Pinjaman Koperasi Karyawan</h2>
              <button
                onClick={() => setIsApplyingLoan(true)}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold rounded-lg cursor-pointer"
              >
                + Ajukan Kredit
              </button>
            </div>

            {isApplyingLoan && (
              <form onSubmit={handleSaveLoan} className="bg-slate-50 p-4 rounded-xl border space-y-3">
                <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider font-mono">Pengajuan Kredit Baru</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Karyawan Penerima</label>
                    <select
                      value={loanForm.employeeId}
                      onChange={(e) => {
                        const matched = masters.find(m => m.employeeId === e.target.value);
                        setLoanForm({
                          ...loanForm,
                          employeeId: e.target.value,
                          employeeName: matched ? matched.employeeName : ''
                        });
                      }}
                      className="w-full p-2 bg-white border rounded text-xs"
                      required
                    >
                      <option value="">Pilih Karyawan</option>
                      {masters.map(m => (
                        <option key={m.employeeId} value={m.employeeId}>{m.employeeName}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Nilai Pinjaman (IDR)</label>
                    <input
                      type="number"
                      value={loanForm.amount}
                      onChange={(e) => setLoanForm({ ...loanForm, amount: Number(e.target.value) })}
                      className="w-full p-2 bg-white border rounded text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Tenor Cicilan (Bulan)</label>
                    <input
                      type="number"
                      value={loanForm.tenor}
                      onChange={(e) => setLoanForm({ ...loanForm, tenor: Number(e.target.value) })}
                      className="w-full p-2 bg-white border rounded text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Alasan Keperluan</label>
                    <input
                      type="text"
                      value={loanForm.reason}
                      onChange={(e) => setLoanForm({ ...loanForm, reason: e.target.value })}
                      className="w-full p-2 bg-white border rounded text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsApplyingLoan(false)}
                    className="px-2.5 py-1.5 bg-slate-200 text-slate-600 text-[10px] font-bold rounded cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded cursor-pointer"
                  >
                    Simpan Pengajuan
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 font-mono text-[10px]">
                    <th className="py-2 px-1">Nama</th>
                    <th className="py-2 px-1">Jumlah Pinjaman</th>
                    <th className="py-2 px-1">Cicilan Bulanan</th>
                    <th className="py-2 px-1">Sisa Pinjaman</th>
                    <th className="py-2 px-1">Persetujuan</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-400 text-[11px]">Belum ada data pengajuan kredit aktif.</td>
                    </tr>
                  ) : (
                    loans.map((l: any) => (
                      <tr key={l.id} className="border-b border-slate-50 text-slate-700">
                        <td className="py-3 px-1 font-semibold">{l.employee_name}</td>
                        <td className="py-3 px-1 font-mono">Rp {l.loan_amount.toLocaleString('id-ID')}</td>
                        <td className="py-3 px-1 font-mono text-rose-600">Rp {l.monthly_installment.toLocaleString('id-ID')}/bln</td>
                        <td className="py-3 px-1 font-mono font-bold">Rp {l.remaining_amount.toLocaleString('id-ID')}</td>
                        <td className="py-3 px-1">
                          {l.approval_status === 'APPROVED_YAYASAN' || l.approval_status === 'YAYASAN_APPROVED' ? (
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200">Disetujui</span>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] text-slate-500 italic block">Status: {l.approval_status}</span>
                              <button
                                onClick={() => handleApproveLoan(l.id, 'YAYASAN')}
                                className="bg-slate-900 hover:bg-slate-800 text-white text-[8px] font-bold py-0.5 px-1.5 rounded cursor-pointer"
                              >
                                Approve Yayasan
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section B: Kasbon Darurat */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">Kasbon Darurat (Batal Potong Gaji Otomatis)</h2>
              <button
                onClick={() => setIsApplyingKasbon(true)}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold rounded-lg cursor-pointer"
              >
                + Tarik Kasbon
              </button>
            </div>

            {isApplyingKasbon && (
              <form onSubmit={handleSaveKasbon} className="bg-slate-50 p-4 rounded-xl border space-y-3">
                <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider font-mono">Form Tarik Kasbon Darurat</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Karyawan Penerima</label>
                    <select
                      value={kasbonForm.employeeId}
                      onChange={(e) => {
                        const matched = masters.find(m => m.employeeId === e.target.value);
                        setKasbonForm({
                          ...kasbonForm,
                          employeeId: e.target.value,
                          employeeName: matched ? matched.employeeName : ''
                        });
                      }}
                      className="w-full p-2 bg-white border rounded text-xs"
                      required
                    >
                      <option value="">Pilih Karyawan</option>
                      {masters.map(m => (
                        <option key={m.employeeId} value={m.employeeId}>{m.employeeName}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Jumlah Tarik Kasbon (Maks Rp 2jt)</label>
                    <input
                      type="number"
                      value={kasbonForm.amount}
                      onChange={(e) => setKasbonForm({ ...kasbonForm, amount: Number(e.target.value) })}
                      className="w-full p-2 bg-white border rounded text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Alasan Mendesak</label>
                  <input
                    type="text"
                    value={kasbonForm.reason}
                    onChange={(e) => setKasbonForm({ ...kasbonForm, reason: e.target.value })}
                    className="w-full p-2 bg-white border rounded text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsApplyingKasbon(false)}
                    className="px-2.5 py-1 bg-slate-250 text-slate-600 text-[10px] font-bold rounded cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded cursor-pointer"
                  >
                    Ajukan Kasbon
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 font-mono text-[10px]">
                    <th className="py-2 px-1">Karyawan</th>
                    <th className="py-2 px-1">Jumlah Kasbon</th>
                    <th className="py-2 px-1">Alasan Pengajuan</th>
                    <th className="py-2 px-1">Status</th>
                    <th className="py-2 px-1 text-right">Otorisasi</th>
                  </tr>
                </thead>
                <tbody>
                  {kasbons.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-400 text-[11px]">Belum ada data kasbon darurat aktif.</td>
                    </tr>
                  ) : (
                    kasbons.map((k: any) => (
                      <tr key={k.id} className="border-b border-slate-50 text-slate-700">
                        <td className="py-3 px-1 font-semibold">{k.employee_name}</td>
                        <td className="py-3 px-1 font-mono font-bold text-rose-600">Rp {k.kasbon_amount.toLocaleString('id-ID')}</td>
                        <td className="py-3 px-1 text-slate-500 italic">{k.reason}</td>
                        <td className="py-3 px-1 text-[10px]">
                          <span className={`px-2 py-0.5 rounded-full font-bold border ${
                            k.status === 'APPROVED' 
                              ? 'bg-amber-50 text-amber-700 border-amber-200' 
                              : k.status === 'SETTLED_FROM_SALARY'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-50 text-slate-500'
                          }`}>
                            {k.status === 'APPROVED' ? 'BELUM LUNAS' : k.status === 'SETTLED_FROM_SALARY' ? 'LUNAS GAJIAN' : k.status}
                          </span>
                        </td>
                        <td className="py-3 px-1 text-right">
                          {k.status === 'PENDING' && (
                            <button
                              onClick={() => handleApproveKasbon(k.id)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold rounded cursor-pointer"
                            >
                              Approve Bendahara
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* SUB-VIEW 5: THR & TAXES PPH21 / BPJS */}
      {subTab === 'thr_taxes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Section A: Distribusi Tunjangan Hari Raya (THR) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">Tunjangan Hari Raya (THR) & Bonus Tahunan</h2>
              <p className="text-xs text-slate-500">Mendistribusikan THR secara kolektif dengan formula persentase/gaji pokok</p>
            </div>

            <form onSubmit={handleDistributeThr} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Metode THR</label>
                <select
                  value={thrForm.type}
                  onChange={(e) => setThrForm({ ...thrForm, type: e.target.value as any })}
                  className="w-full p-2.5 bg-white border rounded text-xs focus:outline-none"
                >
                  <option value="AUTOMATIC">OTOMATIS (1x Gaji Pokok)</option>
                  <option value="PERCENTAGE">PERSENTASE GAJI POKOK</option>
                  <option value="NOMINAL">NOMINAL TETAP (FLAT RATE)</option>
                </select>
              </div>

              {thrForm.type === 'PERCENTAGE' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Multiplier / Persentase (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={thrForm.multiplier * 100}
                    onChange={(e) => setThrForm({ ...thrForm, multiplier: Number(e.target.value) / 100 })}
                    className="w-full p-2 bg-white border rounded text-xs font-bold"
                  />
                </div>
              )}

              {thrForm.type === 'NOMINAL' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Nominal Tetap (Rupiah)</label>
                  <input
                    type="number"
                    value={thrForm.fixedValue}
                    onChange={(e) => setThrForm({ ...thrForm, fixedValue: Number(e.target.value) })}
                    className="w-full p-2 bg-white border rounded text-xs font-bold"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
              >
                Distribusikan THR Ke Semua Slip Periode Ini
              </button>
            </form>
          </div>

          {/* Section B: Kebijakan Pajak PPh21 & BPJS Ketenagakerjaan */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">Kebijakan Pajak PPh21 & BPJS</h2>
              <p className="text-xs text-slate-500">Kepatuhan Pajak (Ready PPh21) & BPJS Terintegrasi dengan BPJS Kesehatan</p>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 block mb-1">Pajak Penghasilan (PPh21)</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Perhitungan tarif pajak PPh21 dipotong secara otomatis mengikuti tarif progresif Pasal 17 UU HPP dikurangi PTKP (Penghasilan Tidak Kena Pajak) wajib pajak pribadi sebesar Rp 54.000.000/tahun secara otomatis di sistem backend.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 block mb-1">Simulasi BPJS Kesehatan & Ketenagakerjaan</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Formula BPJS menghitung 4% iuran dibayarkan oleh pemberi kerja (Yayasan) dan 2% dipotong langsung dari Gaji Pokok karyawan secara proporsional.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* SUB-VIEW 6: LAPORAN & AUDIT TRAIL LOGS */}
      {subTab === 'audit_report' && (
        <div className="space-y-6">
          {/* Section A: Ekspor Laporan & Utilitas Data */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">Laporan & Ekspor / Impor Data Gaji</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border text-center space-y-2">
                <FileSpreadsheet className="h-6 w-6 text-emerald-600 mx-auto" />
                <span className="text-xs font-bold block text-slate-700">Ekspor Excel / CSV</span>
                <p className="text-[10px] text-slate-400">Unduh data payroll periodik lengkap dengan rincian per akun bank.</p>
                <button
                  onClick={() => showAlert('Mengekspor laporan payroll ke format Microsoft Excel .xlsx...')}
                  className="px-2.5 py-1 bg-white border hover:bg-slate-100 text-slate-700 text-[10px] font-bold rounded cursor-pointer"
                >
                  Download Excel
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border text-center space-y-2">
                <FileText className="h-6 w-6 text-red-600 mx-auto" />
                <span className="text-xs font-bold block text-slate-700">Ekspor Laporan PDF</span>
                <p className="text-[10px] text-slate-400">Unduh rekapitulasi penggajian bulanan resmi bertanda tangan digital.</p>
                <button
                  onClick={() => showAlert('Mengekspor rekapitulasi gaji bulanan instansi ke file PDF...')}
                  className="px-2.5 py-1 bg-white border hover:bg-slate-100 text-slate-700 text-[10px] font-bold rounded cursor-pointer"
                >
                  Download PDF
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border text-center space-y-2">
                <Upload className="h-6 w-6 text-blue-600 mx-auto" />
                <span className="text-xs font-bold block text-slate-700">Import Master Excel</span>
                <p className="text-[10px] text-slate-400">Unggah template master gaji baru massal secara offline via CSV/Excel.</p>
                <button
                  onClick={() => showAlert('Membuka file dialog pengunggahan master penggajian...')}
                  className="px-2.5 py-1 bg-white border hover:bg-slate-100 text-slate-700 text-[10px] font-bold rounded cursor-pointer"
                >
                  Upload File
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border text-center space-y-2">
                <Clock className="h-6 w-6 text-slate-600 mx-auto" />
                <span className="text-xs font-bold block text-slate-700">Laporan Tahunan</span>
                <p className="text-[10px] text-slate-400">Lihat tren pengeluaran kompensasi sekolah semester / tahunan.</p>
                <button
                  onClick={() => showAlert('Mengambil laporan komparasi pengeluaran APBS Tahunan...')}
                  className="px-2.5 py-1 bg-white border hover:bg-slate-100 text-slate-700 text-[10px] font-bold rounded cursor-pointer"
                >
                  Buka Tren
                </button>
              </div>
            </div>
          </div>

          {/* Section B: Enterprise Compliance Audit Logs Trail */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">Enterprise Compliance Audit Trail (Log Perubahan Gaji)</h2>
            
            <div className="overflow-y-auto max-h-80 border rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-mono text-[10px] uppercase">
                    <th className="py-2.5 px-3">Waktu</th>
                    <th className="py-2.5 px-3">Aktor</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Modul</th>
                    <th className="py-2.5 px-3">Tindakan</th>
                    <th className="py-2.5 px-3">Rincian Perubahan</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.slice().reverse().map((log: any) => (
                    <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50 text-slate-600 font-mono text-[11px]">
                      <td className="py-2.5 px-3 font-semibold text-slate-500">
                        {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-700">{log.actor_name}</td>
                      <td className="py-2.5 px-3 text-slate-500">{log.actor_role}</td>
                      <td className="py-2.5 px-3">{log.module}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          log.action_type === 'CREATE' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          log.action_type === 'UPDATE' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}>
                          {log.action_type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{log.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL WINDOW: DIGITAL SLIP GAJI PREVIEW & VERIFICATION INTERFACE */}
      {selectedSlip && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative border border-slate-200">
            
            {/* Modal Exit */}
            <button
              onClick={() => setSelectedSlip(null)}
              className="absolute right-5 top-5 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              ✕
            </button>

            {/* Slip Header */}
            <div className="border-b border-slate-200 pb-5 text-center space-y-1">
              <span className="text-[10px] bg-blue-100 text-blue-700 border border-blue-200 font-extrabold px-3 py-1 rounded-full font-mono uppercase">
                Digital Pay Slip
              </span>
              <h2 className="text-base font-extrabold text-slate-950 uppercase tracking-tight">{tenant?.name}</h2>
              <p className="text-[11px] text-slate-400">Periode Gaji: {selectedSlip.periodLabel}</p>
            </div>

            {/* Employee metadata */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 font-mono text-[9px] uppercase">NAMA PEGAWAI</span>
                <span className="font-extrabold text-slate-800 block">{selectedSlip.employeeName}</span>
                <span className="text-slate-500 font-mono text-[10px]">ID: {selectedSlip.employeeId}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 font-mono text-[9px] uppercase">JABATAN / UNIT</span>
                <span className="font-bold text-slate-700 block">{selectedSlip.role}</span>
                <span className="text-slate-500 font-mono text-[10px]">Tanggal Bayar: {selectedSlip.meta.paidAt ? new Date(selectedSlip.meta.paidAt).toLocaleDateString('id-ID') : 'Belum Dibayar'}</span>
              </div>
            </div>

            {/* Income & Deductions Breakdown columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              
              {/* Earnings column */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono border-b pb-1 block">A. Penerimaan (Earnings)</span>
                
                <div className="space-y-1.5 font-medium text-slate-700">
                  <div className="flex justify-between">
                    <span>Gaji Pokok</span>
                    <span className="font-mono">Rp {selectedSlip.earnings.baseSalary.toLocaleString('id-ID')}</span>
                  </div>

                  {selectedSlip.earnings.teachingHonor > 0 && (
                    <div className="flex justify-between">
                      <span>Honor Mengajar</span>
                      <span className="font-mono">Rp {selectedSlip.earnings.teachingHonor.toLocaleString('id-ID')}</span>
                    </div>
                  )}

                  {selectedSlip.earnings.substituteHonor > 0 && (
                    <div className="flex justify-between text-blue-600">
                      <span>Subs. Guru Pengganti</span>
                      <span className="font-mono">Rp {selectedSlip.earnings.substituteHonor.toLocaleString('id-ID')}</span>
                    </div>
                  )}

                  {selectedSlip.earnings.overtimeHonor > 0 && (
                    <div className="flex justify-between">
                      <span>Honor Lembur</span>
                      <span className="font-mono">Rp {selectedSlip.earnings.overtimeHonor.toLocaleString('id-ID')}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Tunjangan Jabatan</span>
                    <span className="font-mono">Rp {selectedSlip.earnings.allowances.position.toLocaleString('id-ID')}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Tunjangan Keluarga</span>
                    <span className="font-mono">Rp {selectedSlip.earnings.allowances.family.toLocaleString('id-ID')}</span>
                  </div>

                  <div className="flex justify-between text-emerald-600">
                    <span>Tunjangan Pondok</span>
                    <span className="font-mono">Rp {selectedSlip.earnings.allowances.pondok.toLocaleString('id-ID')}</span>
                  </div>

                  {selectedSlip.bonuses.thr > 0 && (
                    <div className="flex justify-between text-violet-600 font-bold bg-violet-50 px-1 rounded">
                      <span>Tunjangan Hari Raya</span>
                      <span className="font-mono">Rp {selectedSlip.bonuses.thr.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Deductions column */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono border-b pb-1 block">B. Potongan (Deductions)</span>
                
                <div className="space-y-1.5 font-medium text-slate-700">
                  {selectedSlip.deductions.late > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Sanksi Terlambat</span>
                      <span className="font-mono">-Rp {selectedSlip.deductions.late.toLocaleString('id-ID')}</span>
                    </div>
                  )}

                  {selectedSlip.deductions.alfa > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Sanksi Alpha Absen</span>
                      <span className="font-mono">-Rp {selectedSlip.deductions.alfa.toLocaleString('id-ID')}</span>
                    </div>
                  )}

                  {selectedSlip.deductions.loan > 0 && (
                    <div className="flex justify-between text-rose-500">
                      <span>Cicilan Pinjaman</span>
                      <span className="font-mono">-Rp {selectedSlip.deductions.loan.toLocaleString('id-ID')}</span>
                    </div>
                  )}

                  {selectedSlip.deductions.kasbon > 0 && (
                    <div className="flex justify-between text-rose-500">
                      <span>Potongan Kasbon</span>
                      <span className="font-mono">-Rp {selectedSlip.deductions.kasbon.toLocaleString('id-ID')}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Iuran BPJS Karyawan</span>
                    <span className="font-mono">-Rp {selectedSlip.deductions.bpjs.toLocaleString('id-ID')}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Pajak PPh21</span>
                    <span className="font-mono">-Rp {selectedSlip.deductions.taxPph21.toLocaleString('id-ID')}</span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Iuran Sosial Yayasan</span>
                    <span className="font-mono">-Rp {selectedSlip.deductions.yayasan.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Total Balance Calculations */}
            <div className="border-t border-b border-slate-200 py-4 flex justify-between items-center bg-slate-50/50 px-4 rounded-xl">
              <span className="text-xs font-extrabold text-slate-800">SISA PENERIMAAN BERSIH (NET TAKE HOME PAY)</span>
              <span className="text-lg font-extrabold text-slate-900 font-mono">Rp {selectedSlip.totals.netSalary.toLocaleString('id-ID')}</span>
            </div>

            {/* Cryptographic Digital Sign, QR and barcode scanner */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-2 border-t border-dashed">
              <div className="space-y-1.5 text-center md:text-left">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase font-mono block">DIGITAL SIGNATURE & ID VERIFIED</span>
                <span className="text-[9px] text-slate-500 font-mono bg-slate-100 p-1 rounded font-bold">{selectedSlip.meta.digitalSignature}</span>
                <div className="pt-2 flex justify-center md:justify-start gap-1">
                  <button
                    onClick={() => triggerDownloadPDF(selectedSlip)}
                    className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold rounded cursor-pointer transition-colors"
                  >
                    Download PDF
                  </button>
                  <button
                    onClick={() => triggerMockWhatsapp(selectedSlip)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded cursor-pointer transition-colors"
                  >
                    Kirim WhatsApp
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 border p-3 rounded-xl bg-slate-50 shrink-0">
                <div className="text-center space-y-1">
                  <span className="text-[8px] font-bold text-slate-400 block font-mono">SCAN QR VERIFY</span>
                  <div className="bg-slate-200 p-1.5 rounded-lg">
                    <QrCode className="h-10 w-10 text-slate-800" />
                  </div>
                </div>
                <div className="text-center space-y-1 border-l pl-4">
                  <span className="text-[8px] font-bold text-slate-400 block font-mono">SECURITY BARCODE</span>
                  <div className="bg-slate-200 p-1 px-3 rounded-lg flex items-center justify-center">
                    <Barcode className="h-10 w-16 text-slate-800" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
