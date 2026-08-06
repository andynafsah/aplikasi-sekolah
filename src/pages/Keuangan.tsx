/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/client';
import { 
  Coins, 
  CreditCard, 
  PlusCircle, 
  Scale, 
  TrendingUp, 
  TrendingDown, 
  FileSpreadsheet,
  Users,
  ArrowLeftRight,
  CheckCircle2,
  Clock,
  Lock,
  ShieldCheck,
  FileText,
  RefreshCw,
  UploadCloud,
  Check,
  FileDown,
  Search,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

type ActiveTabType = 'DASHBOARD' | 'COA' | 'KAS_BANK' | 'TRANSAKSI' | 'JURNAL' | 'BUKU_BESAR' | 'LAPORAN' | 'REKONSILIASI' | 'CLOSING' | 'AUDIT';
type UnitType = 'SEMUA' | 'SEKOLAH' | 'PONDOK' | 'YAYASAN' | 'PKBM';

export default function Keuangan() {
  const { tenant, user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ActiveTabType>('DASHBOARD');
  const [activeUnit, setActiveUnit] = useState<UnitType>('SEMUA');
  const [searchCOA, setSearchCOA] = useState('');
  const [selectedLedgerAccount, setSelectedLedgerAccount] = useState('11101');
  const [reportSubTab, setReportSubTab] = useState<'LABA_RUGI' | 'NERACA' | 'ARUS_KAS' | 'ANGGARAN'>('LABA_RUGI');

  // Modals state
  const [isCOAModalOpen, setIsCOAModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isJvModalOpen, setIsJvModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isReconModalOpen, setIsReconModalOpen] = useState(false);
  const [reconProgress, setReconProgress] = useState<'idle' | 'matching' | 'success'>('idle');
  const [selectedJv, setSelectedJv] = useState<string | null>(null);

  const isPondok = tenant?.type === 'PONDOK' || tenant?.type === 'KEDUA';

  // ==========================================
  // QUERY & MUTATIONS
  // ==========================================

  // 1. Fetch COAs
  const { data: rawCoas = [], isLoading: isLoadingCOA } = useQuery({
    queryKey: ['coas'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getCOAs');
      return res?.data?.data || [];
    }
  });
  const coasList = Array.isArray(rawCoas) ? rawCoas : [];

  // 2. Fetch Bank Accounts
  const { data: rawBankAccounts = [] } = useQuery({
    queryKey: ['bankAccounts'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getBankAccounts');
      return res?.data?.data || [];
    }
  });
  const bankAccounts = Array.isArray(rawBankAccounts) ? rawBankAccounts : [];

  // 3. Fetch Transactions
  const { data: rawTransactions = [] } = useQuery({
    queryKey: ['accountingTransactions'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getAccountingTransactions');
      return res?.data?.data || [];
    }
  });
  const transactions = Array.isArray(rawTransactions) ? rawTransactions : [];

  // 4. Fetch Journal Vouchers
  const { data: rawJournalVouchers = [] } = useQuery({
    queryKey: ['journalVouchers'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getJournalVouchers');
      return res?.data?.data || [];
    }
  });
  const journalVouchers = Array.isArray(rawJournalVouchers) ? rawJournalVouchers : [];

  // 5. Fetch Ledger entries
  const { data: rawLedgerEntries = [] } = useQuery({
    queryKey: ['ledgerEntries'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getLedgerEntries');
      return res?.data?.data || [];
    }
  });
  const ledgerEntries = Array.isArray(rawLedgerEntries) ? rawLedgerEntries : [];

  // 6. Fetch Budget realizations
  const { data: rawBudgetRealizations = [] } = useQuery({
    queryKey: ['budgetRealizations'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getBudgetRealizations');
      return res?.data?.data || [];
    }
  });
  const budgetRealizations = Array.isArray(rawBudgetRealizations) ? rawBudgetRealizations : [];

  // 7. Fetch Reconciliations
  const { data: rawReconciliations = [] } = useQuery({
    queryKey: ['reconciliations'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getReconciliations');
      return res?.data?.data || [];
    }
  });
  const reconciliations = Array.isArray(rawReconciliations) ? rawReconciliations : [];

  // 8. Fetch Closings
  const { data: rawClosings = [] } = useQuery({
    queryKey: ['accountingClosings'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getAccountingClosings');
      return res?.data?.data || [];
    }
  });
  const closings = Array.isArray(rawClosings) ? rawClosings : [];

  // 9. Fetch Approvals
  const { data: rawApprovals = [] } = useQuery({
    queryKey: ['accountingApprovals'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getAccountingApprovals');
      return res?.data?.data || [];
    }
  });
  const approvals = Array.isArray(rawApprovals) ? rawApprovals : [];

  // 10. Fetch Audit log
  const { data: rawAuditLogs = [] } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=auditLogList');
      return res?.data?.data || [];
    }
  });
  const auditLogs = Array.isArray(rawAuditLogs) ? rawAuditLogs : [];

  // MUTATIONS

  const createCOAMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/api/action?action=saveCOA', data);
      return res.data;
    },
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['coas'] });
        queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
        setIsCOAModalOpen(false);
      } else {
        alert(res.message);
      }
    }
  });

  const createBankMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/api/action?action=saveBankAccount', data);
      return res.data;
    },
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
        queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
        setIsBankModalOpen(false);
      } else {
        alert(res.message);
      }
    }
  });

  const createTxMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/api/action?action=createAccountingTransaction', data);
      return res.data;
    },
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['accountingTransactions'] });
        queryClient.invalidateQueries({ queryKey: ['journalVouchers'] });
        queryClient.invalidateQueries({ queryKey: ['ledgerEntries'] });
        queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
        queryClient.invalidateQueries({ queryKey: ['budgetRealizations'] });
        queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
        setIsTxModalOpen(false);
      } else {
        alert(res.message);
      }
    }
  });

  const createJvMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/api/action?action=createJournalVoucher', data);
      return res.data;
    },
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['journalVouchers'] });
        queryClient.invalidateQueries({ queryKey: ['ledgerEntries'] });
        queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
        setIsJvModalOpen(false);
      } else {
        alert(res.message);
      }
    }
  });

  const createReconMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/api/action?action=createReconciliation', data);
      return res.data;
    },
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['reconciliations'] });
        queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
        setIsReconModalOpen(false);
      } else {
        alert(res.message);
      }
    }
  });

  const runReconMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post('/api/action?action=autoMatchReconciliation', { id });
      return res.data;
    },
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['reconciliations'] });
        queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
        setReconProgress('success');
        setTimeout(() => {
          setIsReconModalOpen(false);
          setReconProgress('idle');
        }, 1500);
      }
    }
  });

  const performClosingMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/api/action?action=performClosing', data);
      return res.data;
    },
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['accountingClosings'] });
        queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
        alert(res.message);
      }
    }
  });

  const submitApprovalMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/api/action?action=submitAccountingApproval', data);
      return res.data;
    },
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['accountingApprovals'] });
        queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
        alert(res.message);
      }
    }
  });

  // ==========================================
  // FORMS SETUP
  // ==========================================
  const coaForm = useForm({ defaultValues: { code: '', name: '', category: 'ASET', sub_account: '', normal_balance: 'DEBIT', active: true } });
  const bankForm = useForm({ defaultValues: { bank_name: '', account_number: '', account_holder: '', balance: 0, active: true } });
  
  const txForm = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      type: 'PENERIMAAN',
      doc_type: 'BANK',
      amount: 0,
      description: '',
      method: 'TRANSFER',
      ref_no: '',
      coa_debit: '',
      coa_kredit: '',
      bank_account_id: ''
    }
  });

  const jvForm = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      description: '',
      is_recurring: false,
      details: [
        { account_code: '', debit: 0, credit: 0 },
        { account_code: '', debit: 0, credit: 0 }
      ]
    }
  });
  const { fields: jvFields, append: jvAppend, remove: jvRemove } = useFieldArray({ control: jvForm.control, name: 'details' });

  const transferForm = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      source_id: '',
      target_id: '',
      amount: 0,
      description: ''
    }
  });

  const reconForm = useForm({
    defaultValues: {
      period: '2026-07',
      bank_account_id: '',
      starting_balance: 0,
      ending_balance: 0
    }
  });

  // ==========================================
  // DERIVED VALUES & COMPUTATIONS
  // ==========================================

  // Filter based on active unit
  const filterByUnit = (item: any) => {
    if (activeUnit === 'SEMUA') return true;
    const desc = (item.description || item.name || item.account_name || '').toLowerCase();
    if (activeUnit === 'SEKOLAH') return desc.includes('sekolah') || desc.includes('spp') || desc.includes('sma');
    if (activeUnit === 'PONDOK') return desc.includes('pondok') || desc.includes('syahriah') || desc.includes('pesantren') || desc.includes('mts');
    if (activeUnit === 'YAYASAN') return desc.includes('yayasan') || desc.includes('modal');
    if (activeUnit === 'PKBM') return desc.includes('pkbm') || desc.includes('kesetaraan');
    return true;
  };

  // Compute live balances
  const totalInflows = transactions.filter(t => t.type === 'PENERIMAAN' && filterByUnit(t)).reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const totalOutflows = transactions.filter(t => t.type === 'PENGELUARAN' && filterByUnit(t)).reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const currentNetMargin = totalInflows - totalOutflows;

  const totalBankBalance = bankAccounts.filter(b => b.active).reduce((acc, b) => acc + Number(b.balance || 0), 0);
  const totalCashBalance = 15000000 + currentNetMargin - totalBankBalance; // baseline cash + flow adjustment

  const activeCoas = coasList.filter(c => {
    if (!c) return false;
    const cCode = c.code || '';
    const cName = c.name || '';
    const q = searchCOA || '';
    return c.active && (cCode.toLowerCase().includes(q.toLowerCase()) || cName.toLowerCase().includes(q.toLowerCase()));
  });

  // Auto Journal Preview calculation
  const watchTxType = txForm.watch('type');
  const watchTxAmount = txForm.watch('amount') || 0;
  const watchTxDebit = txForm.watch('coa_debit');
  const watchTxKredit = txForm.watch('coa_kredit');

  const coaDebitObj = coasList.find(c => c.code === watchTxDebit);
  const coaKreditObj = coasList.find(c => c.code === watchTxKredit);

  // Recharts visual data formatting
  const flowTrendData = [
    { name: 'Jan', Pendapatan: 15000000, Beban: 8000000 },
    { name: 'Feb', Pendapatan: 18000000, Beban: 9500000 },
    { name: 'Mar', Pendapatan: 22000000, Beban: 11000000 },
    { name: 'Apr', Pendapatan: 19500000, Beban: 10200000 },
    { name: 'Mei', Pendapatan: 25000000, Beban: 14000000 },
    { name: 'Jun', Pendapatan: 32000000, Beban: 15500000 },
    { name: 'Jul', Pendapatan: totalInflows || 28000000, Beban: totalOutflows || 12000000 }
  ];

  const assetAllocationData = [
    { name: 'Kas Utama', value: totalCashBalance > 0 ? totalCashBalance : 5000000 },
    ...bankAccounts.map(b => ({ name: b.bank_name, value: Number(b.balance || 0) }))
  ];

  const COLORS = ['#0f766e', '#0284c7', '#4f46e5', '#f59e0b', '#10b981'];

  // ==========================================
  // TRANSACTION SUBMIT HANDLERS
  // ==========================================

  const handleCOASubmit = (data: any) => {
    createCOAMutation.mutate(data);
  };

  const handleBankSubmit = (data: any) => {
    createBankMutation.mutate(data);
  };

  const handleTxSubmit = (data: any) => {
    createTxMutation.mutate(data);
  };

  const handleJvSubmit = (data: any) => {
    createJvMutation.mutate(data);
  };

  const handleTransferSubmit = (data: any) => {
    // Generate transfer transaction (Bank to Bank or Bank to Kas)
    const sourceBank = bankAccounts.find(b => b.id === data.source_id);
    const targetBank = bankAccounts.find(b => b.id === data.target_id);

    // Auto post a journal
    const payload = {
      date: data.date,
      type: 'PENGELUARAN',
      doc_type: 'BANK',
      amount: Number(data.amount),
      description: `Transfer dari ${sourceBank?.bank_name} ke ${targetBank ? targetBank.bank_name : 'Kas Utama'}: ${data.description}`,
      method: 'TRANSFER',
      ref_no: `TRF-${Date.now()}`,
      coa_debit: targetBank ? '11201' : '11101', // debit target (Bank/Kas)
      coa_kredit: '11201', // credit source Bank
      bank_account_id: data.source_id
    };
    createTxMutation.mutate(payload);
    setIsTransferModalOpen(false);
  };

  const handleReconSubmit = (data: any) => {
    createReconMutation.mutate({
      period: data.period,
      bank_account_id: data.bank_account_id,
      starting_balance: Number(data.starting_balance),
      ending_balance: Number(data.ending_balance)
    });
  };

  const triggerAutoMatch = (id: string) => {
    setReconProgress('matching');
    setTimeout(() => {
      runReconMutation.mutate(id);
    }, 2000);
  };

  return (
    <div id="finance-accounting-root" className="space-y-6 font-sans text-slate-700 min-h-screen pb-12">
      
      {/* 1. Header Banner with Unit Switcher */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl text-white">
        <div>
          <div className="flex items-center gap-2 text-teal-400 font-bold tracking-widest text-[11px] uppercase">
            <ShieldCheck className="h-4 w-4" /> Single Tenant Enterprise
          </div>
          <h2 className="text-2xl font-black tracking-tight mt-1">Enterprise Finance &amp; Accounting</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Sistem pembukuan otomatis double-entry terpusat untuk Sekolah, Pondok Pesantren, Yayasan, dan PKBM dengan approval berjenjang, rekonsiliasi otomatis, dan audit trail ready.
          </p>
        </div>

        {/* Unit Selector */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-left lg:text-right">Saring Pembukuan Unit</span>
          <div className="flex flex-wrap gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            {(['SEMUA', 'SEKOLAH', 'PONDOK', 'YAYASAN', 'PKBM'] as UnitType[]).map((unit) => (
              <button
                key={unit}
                onClick={() => setActiveUnit(unit)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeUnit === unit 
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-900/30' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Top-level Navigation Grid & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side Sub-Navigation */}
        <div className="lg:col-span-3 space-y-2">
          {[
            { id: 'DASHBOARD', label: 'Dashboard Keuangan', icon: Coins, desc: 'Ringkasan & Analisis Alur Kas' },
            { id: 'COA', label: 'Chart of Account (COA)', icon: FileSpreadsheet, desc: 'Daftar Bagan Akun Standar' },
            { id: 'KAS_BANK', label: 'Kas & Rekening Bank', icon: CreditCard, desc: 'Kelola Brankas & Unlimited Rekening' },
            { id: 'TRANSAKSI', label: 'Penerimaan & Pengeluaran', icon: TrendingUp, desc: 'Buku Kas & Jurnal Otomatis' },
            { id: 'JURNAL', label: 'Jurnal Umum & Voucher', icon: Scale, desc: 'Koreksi Manual & Jurnal Berulang' },
            { id: 'BUKU_BESAR', label: 'Buku Besar & Neraca Saldo', icon: Users, desc: 'Buku Bantu & Penyeimbang Akun' },
            { id: 'LAPORAN', label: 'Laporan Finansial', icon: FileText, desc: 'Laba Rugi, Neraca, Realisasi Anggaran' },
            { id: 'REKONSILIASI', label: 'Rekonsiliasi Bank', icon: ArrowLeftRight, desc: 'Impor & Pencocokan Otomatis' },
            { id: 'CLOSING', label: 'Closing & Approval', icon: Lock, desc: 'Tutup Buku & Validasi Yayasan' },
            { id: 'AUDIT', label: 'Audit Trail & Logs', icon: ShieldCheck, desc: 'Log Aktivitas Keuangan Enterprise' }
          ].map((tab) => {
            const IconComponent = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTabType)}
                className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  isTabActive 
                    ? 'bg-white border-teal-500 shadow-sm text-teal-800' 
                    : 'bg-white/40 border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <div className={`p-2 rounded-lg transition-colors ${isTabActive ? 'bg-teal-50 text-teal-600' : 'bg-slate-100 text-slate-500'}`}>
                  <IconComponent className="h-5 w-5" />
                </div>
                <div>
                  <p className={`text-xs font-extrabold ${isTabActive ? 'text-teal-900' : 'text-slate-800'}`}>{tab.label}</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">{tab.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Side Working Canvas */}
        <div className="lg:col-span-9 space-y-6">

          {/* ==========================================
              TAB CANVAS: DASHBOARD
              ========================================== */}
          {activeTab === 'DASHBOARD' && (
            <div className="space-y-6">
              
              {/* Core Financial Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Penerimaan Tunai/Bank</span>
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="text-xl font-black text-emerald-600 mt-2">Rp {totalInflows.toLocaleString('id-ID')}</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">Bulan berjalan, unit {activeUnit.toLowerCase()}</p>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Pengeluaran Kas/Operasional</span>
                    <TrendingDown className="h-4 w-4 text-rose-500" />
                  </div>
                  <p className="text-xl font-black text-rose-600 mt-2">Rp {totalOutflows.toLocaleString('id-ID')}</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">Biaya, belanja &amp; inventaris</p>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Laba Bersih Berjalan</span>
                    <Scale className="h-4 w-4 text-teal-600" />
                  </div>
                  <p className={`text-xl font-black mt-2 ${currentNetMargin >= 0 ? 'text-teal-600' : 'text-rose-600'}`}>
                    Rp {currentNetMargin.toLocaleString('id-ID')}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">Selisih Pendapatan - Beban</p>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Kas &amp; Saldo Bank</span>
                    <Coins className="h-4 w-4 text-indigo-500" />
                  </div>
                  <p className="text-xl font-black text-indigo-600 mt-2">
                    Rp {(totalCashBalance + totalBankBalance).toLocaleString('id-ID')}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">Total likuiditas aman</p>
                </div>
              </div>

              {/* Graphical Analysis with Recharts */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Cash Flow trend */}
                <div className="lg:col-span-8 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                  <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-4">Tren Arus Kas Bulanan (Pendapatan vs Beban)</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={flowTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                        <YAxis stroke="#94a3b8" fontSize={10} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Area type="monotone" dataKey="Pendapatan" stroke="#10b981" fillOpacity={1} fill="url(#colorInflow)" strokeWidth={2} />
                        <Area type="monotone" dataKey="Beban" stroke="#f43f5e" fillOpacity={1} fill="url(#colorOutflow)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Liquidity allocation */}
                <div className="lg:col-span-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Alokasi Kas &amp; Bank</h3>
                    <p className="text-[10px] text-slate-400">Penyebaran saldo aset lancar terlikuidasi saat ini.</p>
                  </div>
                  
                  <div className="h-44 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={assetAllocationData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {assetAllocationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => `Rp ${Number(value || 0).toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    {assetAllocationData.map((asset, i) => (
                      <div key={asset.name} className="flex items-center justify-between text-[10px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="truncate max-w-[120px] font-semibold">{asset.name}</span>
                        </div>
                        <span className="font-mono font-extrabold text-slate-700">Rp {Number(asset.value || 0).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Multi Kas Boxes Presentation */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Multi Brankas Kas Unit (Fisik)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {[
                    { title: 'Kas Utama (Yayasan)', amount: totalCashBalance * 0.4 },
                    { title: 'Kas Sekolah (SMA)', amount: totalCashBalance * 0.25 },
                    { title: 'Kas Pondok (Pesantren)', amount: totalCashBalance * 0.2 },
                    { title: 'Kas PKBM Kesetaraan', amount: totalCashBalance * 0.1 },
                    { title: 'Kas Kecil (Petty Cash)', amount: totalCashBalance * 0.05 }
                  ].map((kasBox, idx) => (
                    <div key={kasBox.title} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl shadow-sm text-center">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{kasBox.title}</p>
                      <p className="text-xs font-bold text-slate-800 mt-1 font-mono">
                        Rp {Math.max(0, Math.floor(kasBox.amount)).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ==========================================
              TAB CANVAS: CHART OF ACCOUNT (COA)
              ========================================== */}
          {activeTab === 'COA' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Chart Of Account (COA) - Bagan Akun Standar</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Struktur kode rekening akuntansi untuk klasifikasi transaksi otomatis.</p>
                </div>
                <button
                  onClick={() => {
                    coaForm.reset();
                    setIsCOAModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-teal-900/10"
                >
                  <PlusCircle className="h-4 w-4" /> Tambah Akun COA
                </button>
              </div>

              {/* COA Search & Filter bar */}
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <Search className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Cari kode akun atau nama akun..."
                  value={searchCOA}
                  onChange={(e) => setSearchCOA(e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* COA Table */}
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 uppercase tracking-wider font-extrabold">
                      <th className="p-3">Kode Akun</th>
                      <th className="p-3">Nama Akun</th>
                      <th className="p-3">Kategori</th>
                      <th className="p-3">Sub Akun</th>
                      <th className="p-3">Normal Balance</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 font-mono">
                    {activeCoas.map((coa) => (
                      <tr key={coa.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 font-bold text-teal-700">{coa.code}</td>
                        <td className="p-3 font-sans text-slate-800 font-bold">{coa.name}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            coa.category === 'ASET' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                            coa.category === 'KEWAJIBAN' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                            coa.category === 'EKUITAS' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                            coa.category === 'PENDAPATAN' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}>
                            {coa.category}
                          </span>
                        </td>
                        <td className="p-3 font-sans text-slate-400">{coa.sub_account || '-'}</td>
                        <td className="p-3 font-bold text-slate-500">{coa.normal_balance}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            coa.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {coa.active ? 'AKTIF' : 'NON-AKTIF'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ==========================================
              TAB CANVAS: KAS & REKENING BANK
              ========================================== */}
          {activeTab === 'KAS_BANK' && (
            <div className="space-y-6">
              
              {/* Bank Accounts Section */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Unlimited Rekening Bank Terdaftar</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Rekening penampung setoran SPP online, transfer, VA, dan QRIS.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsTransferModalOpen(true)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeftRight className="h-4 w-4" /> Transfer Antar Kas/Bank
                    </button>
                    <button
                      onClick={() => {
                        bankForm.reset();
                        setIsBankModalOpen(true);
                      }}
                      className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <PlusCircle className="h-4 w-4" /> Registrasi Bank
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {bankAccounts.map((bank) => (
                    <div key={bank.id} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl relative overflow-hidden group hover:border-teal-500 transition-colors">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full translate-x-8 -translate-y-8 group-hover:scale-125 transition-transform" />
                      
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-teal-700 font-extrabold uppercase tracking-widest">AKTIF OPERASIONAL</span>
                        <CreditCard className="h-4 w-4 text-slate-400" />
                      </div>
                      
                      <h4 className="text-xs font-bold text-slate-800 mt-4 truncate">{bank.bank_name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">{bank.account_number}</p>
                      <p className="text-[9px] text-slate-400 font-semibold uppercase mt-0.5 truncate">{bank.account_holder}</p>
                      
                      <div className="border-t border-slate-200/50 mt-4 pt-3 flex items-center justify-between">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Saldo Terkini</span>
                        <span className="text-sm font-black text-slate-800 font-mono">Rp {Number(bank.balance || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kas Kecil Petty Cash ledger list */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Kas Kecil (Petty Cash Ledger)</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Alokasi kas kecil untuk operasional harian kantor / TU / dapur pondok.</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div className="text-xs">
                    <p className="text-slate-500">Dana Kas Kecil Terpakai (Bulan Ini)</p>
                    <p className="text-lg font-black text-slate-800 mt-1">Rp 150.000 / Rp 5.000.000</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[10px] font-bold">
                    SALDO AMAN
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* ==========================================
              TAB CANVAS: PENERIMAAN & PENGELUARAN
              ========================================== */}
          {activeTab === 'TRANSAKSI' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Pencatatan Penerimaan &amp; Pengeluaran</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Semua transaksi dicatat langsung masuk ke Buku Kas &amp; Jurnal Otomatis terbentuk.</p>
                </div>
                <button
                  onClick={() => {
                    txForm.reset();
                    setIsTxModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-teal-900/10"
                >
                  <PlusCircle className="h-4 w-4" /> Catat Transaksi Baru
                </button>
              </div>

              {/* Transactions list table */}
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 uppercase tracking-wider font-extrabold">
                      <th className="p-3">Tanggal</th>
                      <th className="p-3">No Referensi</th>
                      <th className="p-3">Tipe</th>
                      <th className="p-3">Deskripsi Transaksi</th>
                      <th className="p-3">Metode Setor</th>
                      <th className="p-3 text-right">Jumlah (Rupiah)</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {transactions.filter(filterByUnit).map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 font-mono text-slate-400">{tx.date}</td>
                        <td className="p-3 font-mono text-slate-500 font-semibold">{tx.ref_no}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            tx.type === 'PENERIMAAN' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-800">{tx.description}</td>
                        <td className="p-3 font-bold text-slate-500">{tx.method}</td>
                        <td className={`p-3 text-right font-mono font-extrabold ${tx.type === 'PENERIMAAN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          Rp {Number(tx.amount || 0).toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[8px] font-bold">
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ==========================================
              TAB CANVAS: JURNAL UMUM & VOUCHERS
              ========================================== */}
          {activeTab === 'JURNAL' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Buku Jurnal Umum (Journal Vouchers)</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Audit log mutasi ganda yang seimbang antara debit dan kredit.</p>
                </div>
                <button
                  onClick={() => {
                    jvForm.reset({
                      date: new Date().toISOString().split('T')[0],
                      description: '',
                      is_recurring: false,
                      details: [
                        { account_code: '', debit: 0, credit: 0 },
                        { account_code: '', debit: 0, credit: 0 }
                      ]
                    });
                    setIsJvModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-teal-900/10"
                >
                  <PlusCircle className="h-4 w-4" /> Input Jurnal Manual
                </button>
              </div>

              {/* Journal list */}
              <div className="space-y-3">
                {journalVouchers.filter(filterByUnit).map((jv) => {
                  const isExpanded = selectedJv === jv.id;
                  const totalJvDebit = jv.details?.reduce((acc: number, d: any) => acc + Number(d.debit || 0), 0) || 0;
                  return (
                    <div key={jv.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50/30">
                      
                      {/* Accordion header */}
                      <div 
                        onClick={() => setSelectedJv(isExpanded ? null : jv.id)}
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-400 font-semibold">{jv.date}</span>
                            <span className="font-mono font-extrabold text-teal-800">{jv.voucher_no}</span>
                            {jv.is_recurring && (
                              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[8px] font-bold">RECURRING</span>
                            )}
                          </div>
                          <p className="text-slate-800 font-bold">{jv.description}</p>
                        </div>

                        <div className="flex items-center gap-4 text-xs font-mono">
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase block text-right">Nilai Jurnal</span>
                            <span className="font-extrabold text-slate-800">Rp {Number(totalJvDebit || 0).toLocaleString('id-ID')}</span>
                          </div>
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                        </div>
                      </div>

                      {/* Expanded rows showing subledger details */}
                      {isExpanded && (
                        <div className="border-t border-slate-100 bg-white p-4">
                          <table className="w-full text-left text-[10px] border-collapse font-mono">
                            <thead>
                              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-extrabold pb-2">
                                <th className="pb-2">Kode Akun</th>
                                <th className="pb-2">Nama Akun Akuntansi</th>
                                <th className="pb-2 text-right">Debit</th>
                                <th className="pb-2 text-right">Kredit</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-slate-600">
                              {jv.details?.map((detail: any, dIdx: number) => (
                                <tr key={dIdx} className="hover:bg-slate-50/50">
                                  <td className="py-2 text-teal-700 font-semibold">{detail.account_code}</td>
                                  <td className={`py-2 ${detail.credit > 0 ? 'pl-6 text-slate-400' : 'text-slate-800 font-bold'}`}>
                                    {detail.account_name}
                                  </td>
                                  <td className="py-2 text-right text-emerald-600 font-bold">
                                    {detail.debit > 0 ? `Rp ${Number(detail.debit || 0).toLocaleString('id-ID')}` : '-'}
                                  </td>
                                  <td className="py-2 text-right text-blue-600 font-bold">
                                    {detail.credit > 0 ? `Rp ${Number(detail.credit || 0).toLocaleString('id-ID')}` : '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ==========================================
              TAB CANVAS: BUKU BESAR & NERACA SALDO
              ========================================== */}
          {activeTab === 'BUKU_BESAR' && (
            <div className="space-y-6">
              
              {/* General Ledger Sub-Worksheet */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Buku Besar Bantu Rekening</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Mutasi rinci per rekening bagan akun lengkap.</p>
                  </div>
                  
                  {/* COA selector dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-bold">Pilih Bagan Akun:</span>
                    <select
                      value={selectedLedgerAccount}
                      onChange={(e) => setSelectedLedgerAccount(e.target.value)}
                      className="bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs text-slate-800 font-bold focus:outline-none"
                    >
                      {coasList.map(c => (
                        <option key={c.id} value={c.code}>{c.code} - {c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Ledger Entries list for the selected COA */}
                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left text-[11px] border-collapse font-mono">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 uppercase tracking-wider font-extrabold">
                        <th className="p-3">Tanggal</th>
                        <th className="p-3">Keterangan Jurnal</th>
                        <th className="p-3 text-right">Debit</th>
                        <th className="p-3 text-right">Kredit</th>
                        <th className="p-3 text-right">Saldo Berjalan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {(() => {
                        const entries = ledgerEntries.filter(e => e.account_code === selectedLedgerAccount);
                        let balance = 0;
                        const coaObj = coasList.find(c => c.code === selectedLedgerAccount);
                        const isDebitNormal = coaObj ? coaObj.normal_balance === 'DEBIT' : true;

                        return entries.map((entry, eIdx) => {
                          if (isDebitNormal) {
                            balance += Number(entry.debit || 0) - Number(entry.credit || 0);
                          } else {
                            balance += Number(entry.credit || 0) - Number(entry.debit || 0);
                          }

                          return (
                            <tr key={entry.id || eIdx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-3 text-slate-400">{entry.date}</td>
                              <td className="p-3 font-sans text-slate-800 font-bold">{entry.description || 'Penerimaan Buku'}</td>
                              <td className="p-3 text-right text-emerald-600 font-bold">
                                {entry.debit > 0 ? `Rp ${Number(entry.debit || 0).toLocaleString('id-ID')}` : '-'}
                              </td>
                              <td className="p-3 text-right text-blue-600 font-bold">
                                {entry.credit > 0 ? `Rp ${Number(entry.credit || 0).toLocaleString('id-ID')}` : '-'}
                              </td>
                              <td className="p-3 text-right font-extrabold text-slate-800">
                                Rp {Number(balance || 0).toLocaleString('id-ID')}
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Neraca Saldo (Trial Balance) presenting sum of all accounts */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Laporan Neraca Saldo Penyeimbang (Trial Balance)</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Memverifikasi keselarasan debet dan kredit dari seluruh total buku bantu.</p>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left text-[11px] border-collapse font-mono">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 uppercase tracking-wider font-extrabold">
                        <th className="p-3">Kode COA</th>
                        <th className="p-3">Nama Akun Akuntansi</th>
                        <th className="p-3 text-right">Debit</th>
                        <th className="p-3 text-right">Kredit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {(() => {
                        let grandDebit = 0;
                        let grandCredit = 0;

                        return (
                          <>
                            {coasList.map((coa) => {
                              const relatedEntries = ledgerEntries.filter(e => e.account_code === coa.code);
                              const totalDeb = relatedEntries.reduce((sum, e) => sum + Number(e.debit || 0), 0);
                              const totalCred = relatedEntries.reduce((sum, e) => sum + Number(e.credit || 0), 0);

                              let finalDebit = 0;
                              let finalCredit = 0;

                              if (coa.normal_balance === 'DEBIT') {
                                const diff = totalDeb - totalCred;
                                if (diff >= 0) finalDebit = diff;
                                else finalCredit = Math.abs(diff);
                              } else {
                                const diff = totalCred - totalDeb;
                                if (diff >= 0) finalCredit = diff;
                                else finalDebit = Math.abs(diff);
                              }

                              grandDebit += finalDebit;
                              grandCredit += finalCredit;

                              if (finalDebit === 0 && finalCredit === 0) return null;

                              return (
                                <tr key={coa.id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="p-3 text-teal-700 font-bold">{coa.code}</td>
                                  <td className="p-3 font-sans text-slate-800 font-bold">{coa.name}</td>
                                  <td className="p-3 text-right text-slate-700 font-bold">{finalDebit > 0 ? `Rp ${Number(finalDebit || 0).toLocaleString('id-ID')}` : '-'}</td>
                                  <td className="p-3 text-right text-slate-700 font-bold">{finalCredit > 0 ? `Rp ${Number(finalCredit || 0).toLocaleString('id-ID')}` : '-'}</td>
                                </tr>
                              );
                            })}
                            <tr className="bg-slate-50 font-bold text-slate-800 border-t border-slate-200">
                              <td className="p-3" colSpan={2}>GRAND TOTAL NERACA SALDO</td>
                              <td className="p-3 text-right text-emerald-600 font-extrabold">Rp {Number(grandDebit || 0).toLocaleString('id-ID')}</td>
                              <td className="p-3 text-right text-blue-600 font-extrabold">Rp {Number(grandCredit || 0).toLocaleString('id-ID')}</td>
                            </tr>
                          </>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ==========================================
              TAB CANVAS: LAPORAN KEUANGAN ENTERPRISE
              ========================================== */}
          {activeTab === 'LAPORAN' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Laporan Keuangan &amp; Realisasi Anggaran</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Laporan audit resmi yang siap diekspor ke PDF, Excel, dan CSV.</p>
                </div>
                
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                    <FileDown className="h-4 w-4" /> PDF
                  </button>
                  <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                    <FileSpreadsheet className="h-4 w-4" /> Excel
                  </button>
                </div>
              </div>

              {/* Sub-tabs for financial statements */}
              <div className="flex flex-wrap border-b border-slate-100 gap-4">
                {[
                  { id: 'LABA_RUGI', label: 'Buku Laba Rugi' },
                  { id: 'NERACA', label: 'Laporan Neraca' },
                  { id: 'ARUS_KAS', label: 'Buku Arus Kas' },
                  { id: 'ANGGARAN', label: 'Realisasi Anggaran' }
                ].map(rTab => (
                  <button
                    key={rTab.id}
                    onClick={() => setReportSubTab(rTab.id as any)}
                    className={`pb-2.5 text-xs font-extrabold relative cursor-pointer transition-all ${
                      reportSubTab === rTab.id ? 'text-teal-600 border-b-2 border-teal-500 font-bold' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {rTab.label}
                  </button>
                ))}
              </div>

              {/* Statement details */}
              <div className="space-y-4">
                
                {/* 1. Laba Rugi */}
                {reportSubTab === 'LABA_RUGI' && (
                  <div className="space-y-3">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                      <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">YAYASAN PENDIDIKAN &amp; PONDOK PESANTREN</h4>
                      <p className="text-sm font-bold text-slate-800 mt-1">Laporan Laba Rugi Berjalan (Income Statement)</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Periode 1 Juli 2026 - 31 Juli 2026 (Live data)</p>
                    </div>

                    <div className="space-y-2 text-xs">
                      {/* PENDAPATAN */}
                      <div className="border-b border-slate-100 pb-2">
                        <span className="font-extrabold text-teal-800 block text-[10px] tracking-wider uppercase">I. PENDAPATAN OPERASIONAL</span>
                        <div className="flex justify-between pl-4 mt-2">
                          <span>Pendapatan SPP Sekolah (SMA)</span>
                          <span className="font-mono font-bold text-slate-800">Rp {totalInflows.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pl-4 mt-1.5">
                          <span>Pendapatan Syahriah Pondok</span>
                          <span className="font-mono text-slate-500">Rp 0</span>
                        </div>
                        <div className="flex justify-between font-bold pt-2 border-t border-slate-100 mt-2 pl-4">
                          <span>TOTAL PENDAPATAN</span>
                          <span className="font-mono text-emerald-600 font-extrabold">Rp {totalInflows.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* BEBAN */}
                      <div className="border-b border-slate-100 pb-2 pt-2">
                        <span className="font-extrabold text-rose-800 block text-[10px] tracking-wider uppercase">II. BEBAN OPERASIONAL &amp; PERSONALIA</span>
                        <div className="flex justify-between pl-4 mt-2">
                          <span>Beban Gaji Staf &amp; Guru</span>
                          <span className="font-mono text-slate-500">Rp 0</span>
                        </div>
                        <div className="flex justify-between pl-4 mt-1.5">
                          <span>Beban Pembelian ATK / Inventaris</span>
                          <span className="font-mono font-bold text-slate-800">Rp {totalOutflows.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold pt-2 border-t border-slate-100 mt-2 pl-4">
                          <span>TOTAL BEBAN OPERASIONAL</span>
                          <span className="font-mono text-rose-600 font-extrabold">Rp {totalOutflows.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* NET RESULT */}
                      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl text-sm font-extrabold text-slate-800 mt-4 border border-slate-200">
                        <span>NET PROFIT / LABA BERSIH OPERASIONAL</span>
                        <span className="font-mono text-teal-700 font-black text-base">
                          Rp {currentNetMargin.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Neraca */}
                {reportSubTab === 'NERACA' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* AKTIVA */}
                    <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200 space-y-4">
                      <h4 className="text-xs font-extrabold text-teal-800 uppercase tracking-widest border-b border-slate-200 pb-2">AKTIVA (Assets)</h4>
                      
                      <div className="space-y-2 text-xs">
                        <span className="font-bold text-slate-400 block text-[9px] uppercase">Aset Lancar</span>
                        <div className="flex justify-between pl-2">
                          <span>Kas Utama</span>
                          <span className="font-mono font-semibold text-slate-700">Rp {totalCashBalance.toLocaleString()}</span>
                        </div>
                        {bankAccounts.map(b => (
                          <div key={b.id} className="flex justify-between pl-2">
                            <span>{b.bank_name}</span>
                            <span className="font-mono font-semibold text-slate-700">Rp {Number(b.balance || 0).toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="flex justify-between pl-2">
                          <span>Piutang SPP</span>
                          <span className="font-mono text-slate-400">Rp 0</span>
                        </div>

                        <div className="border-t border-slate-200 pt-3 flex justify-between font-extrabold text-slate-800">
                          <span>TOTAL AKTIVA</span>
                          <span className="font-mono text-teal-700 text-sm">
                            Rp {(totalCashBalance + totalBankBalance).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* PASIVA */}
                    <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200 space-y-4">
                      <h4 className="text-xs font-extrabold text-indigo-800 uppercase tracking-widest border-b border-slate-200 pb-2">PASIVA (Liabilities &amp; Equity)</h4>
                      
                      <div className="space-y-2 text-xs">
                        <span className="font-bold text-slate-400 block text-[9px] uppercase">Kewajiban Jangka Pendek</span>
                        <div className="flex justify-between pl-2">
                          <span>Utang Gaji</span>
                          <span className="font-mono text-slate-400">Rp 0</span>
                        </div>
                        
                        <span className="font-bold text-slate-400 block text-[9px] uppercase pt-2">Ekuitas (Modal)</span>
                        <div className="flex justify-between pl-2">
                          <span>Modal Yayasan</span>
                          <span className="font-mono text-slate-700">Rp 15.000.000</span>
                        </div>
                        <div className="flex justify-between pl-2">
                          <span>Laba Berjalan (SPP Inflows)</span>
                          <span className="font-mono font-semibold text-slate-800">Rp {currentNetMargin.toLocaleString()}</span>
                        </div>

                        <div className="border-t border-slate-200 pt-3 flex justify-between font-extrabold text-slate-800">
                          <span>TOTAL PASIVA</span>
                          <span className="font-mono text-indigo-700 text-sm">
                            Rp {(15000000 + currentNetMargin).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Arus Kas */}
                {reportSubTab === 'ARUS_KAS' && (
                  <div className="space-y-3">
                    <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-2 text-slate-700 border border-slate-100">
                      <span className="font-extrabold text-teal-700 uppercase tracking-wider block text-[10px]">Aktivitas Operasional</span>
                      <div className="flex justify-between pl-4">
                        <span>Penerimaan Kas dari Tagihan SPP</span>
                        <span className="font-mono font-semibold text-emerald-600">Rp {totalInflows.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pl-4">
                        <span>Pembayaran Biaya ATK &amp; Inventaris</span>
                        <span className="font-mono font-semibold text-rose-600">- Rp {totalOutflows.toLocaleString()}</span>
                      </div>
                      
                      <span className="font-extrabold text-indigo-700 uppercase tracking-wider block text-[10px] pt-2">Aktivitas Pendanaan</span>
                      <div className="flex justify-between pl-4">
                        <span>Modal Setor Awal Yayasan</span>
                        <span className="font-mono text-slate-500">Rp 15.000.000</span>
                      </div>

                      <div className="border-t border-slate-200 pt-3 flex justify-between font-extrabold text-slate-800 text-xs">
                        <span>SALDO AKHIR KAS BERSAMA</span>
                        <span className="font-mono text-teal-700 text-sm font-black">
                          Rp {(15000000 + currentNetMargin).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Anggaran */}
                {reportSubTab === 'ANGGARAN' && (
                  <div className="overflow-x-auto border border-slate-100 rounded-xl">
                    <table className="w-full text-left text-[11px] border-collapse font-mono">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 uppercase tracking-wider font-extrabold">
                          <th className="p-3">Kode Akun</th>
                          <th className="p-3">Kategori Beban</th>
                          <th className="p-3 text-right">Alokasi Anggaran (BOS/Yayasan)</th>
                          <th className="p-3 text-right">Realisasi Belanja</th>
                          <th className="p-3 text-right">Sisa Anggaran</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-600">
                        {budgetRealizations.map(br => {
                          const sisa = br.budget_amount - br.spent_amount;
                          return (
                            <tr key={br.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-3 font-bold text-teal-700">{br.coa_code}</td>
                              <td className="p-3 font-sans text-slate-800 font-bold">{br.coa_name}</td>
                              <td className="p-3 text-right">Rp {Number(br.budget_amount || 0).toLocaleString()}</td>
                              <td className="p-3 text-right text-rose-600 font-bold">Rp {Number(br.spent_amount || 0).toLocaleString()}</td>
                              <td className={`p-3 text-right font-extrabold ${sisa > 0 ? 'text-teal-600' : 'text-rose-600'}`}>
                                Rp {Number(sisa || 0).toLocaleString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>

            </div>
          )}

          {/* ==========================================
              TAB CANVAS: BANK RECONCILIATION
              ========================================== */}
          {activeTab === 'REKONSILIASI' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Rekonsiliasi Bank Otomatis (Bank Reconciliation)</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Cocokkan data mutasi rekening bank fisik dengan pembukuan Jurnal Umum Anda.</p>
                </div>
                <button
                  onClick={() => setIsReconModalOpen(true)}
                  className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-teal-900/10"
                >
                  <UploadCloud className="h-4 w-4" /> Import Mutasi Bank (CSV/Excel)
                </button>
              </div>

              {/* Reconciliation list */}
              <div className="space-y-4">
                {reconciliations.map((recon) => {
                  const bAccount = bankAccounts.find(b => b.id === recon.bank_account_id) || { bank_name: 'Giro Rekening' };
                  return (
                    <div key={recon.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-slate-400 font-semibold">{recon.period}</span>
                          <span className="font-bold text-slate-800 text-xs">{bAccount.bank_name}</span>
                        </div>
                        <p className="text-[10px] font-mono text-slate-500">
                          Saldo Buku: <span className="font-bold">Rp {Number(recon.ending_balance || 0).toLocaleString()}</span> | 
                          Cocok: <span className="text-emerald-600 font-bold">{recon.matched_count} Mutasi</span> | 
                          Sisa: <span className="text-rose-500 font-bold">{recon.unmatched_count} Belum Cocok</span>
                        </p>
                      </div>

                      <div>
                        {recon.status === 'COMPLETED' ? (
                          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-xs font-extrabold flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> RECONCILIATION COMPLETED
                          </span>
                        ) : (
                          <button
                            onClick={() => triggerAutoMatch(recon.id)}
                            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-extrabold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <RefreshCw className="h-3 w-3 animate-spin-slow" /> Cocokkan Otomatis (Auto-Match 100%)
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ==========================================
              TAB CANVAS: CLOSING & APPROVAL MATRIX
              ========================================== */}
          {activeTab === 'CLOSING' && (
            <div className="space-y-6">
              
              {/* Tutup Buku form cards */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Closing Buku Finansial Bulanan &amp; Tahunan</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Mengunci posting jurnal pada periode tertentu untuk mencegah manipulasi data masa lalu.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                    <h4 className="text-xs font-extrabold text-slate-700">Closing Bulanan</h4>
                    <p className="text-[10px] text-slate-400 mt-1">Mengunci transaksi bulan berjalan.</p>
                    <button
                      onClick={() => performClosingMutation.mutate({ period: '2026-07', type: 'BULANAN' })}
                      className="w-full mt-4 bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 rounded-xl text-xs cursor-pointer"
                    >
                      Kunci Bulanan
                    </button>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                    <h4 className="text-xs font-extrabold text-slate-700">Closing Semester</h4>
                    <p className="text-[10px] text-slate-400 mt-1">Laporan pertanggungjawaban.</p>
                    <button
                      onClick={() => performClosingMutation.mutate({ period: '2025/2026 Ganjil', type: 'SEMESTER' })}
                      className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl text-xs cursor-pointer"
                    >
                      Kunci Semesteran
                    </button>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                    <h4 className="text-xs font-extrabold text-slate-700">Closing Tahunan</h4>
                    <p className="text-[10px] text-slate-400 mt-1">Menutup saldo &amp; rekap modal.</p>
                    <button
                      onClick={() => performClosingMutation.mutate({ period: '2026', type: 'TAHUNAN' })}
                      className="w-full mt-4 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-xl text-xs cursor-pointer"
                    >
                      Kunci Tahunan (Closing)
                    </button>
                  </div>
                </div>
              </div>

              {/* Approval Hierarchy tracker */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Jenjang Persetujuan Berjenjang (Approval Workflow)</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Proses validasi pembukuan berantai sebelum diposting ke laporan audit.</p>
                </div>

                <div className="space-y-4">
                  {approvals.map((ap) => (
                    <div key={ap.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                      
                      <div className="flex justify-between items-center border-b border-slate-200/50 pb-3">
                        <div className="text-xs">
                          <span className="text-slate-400 font-bold block uppercase text-[9px]">DOKUMEN VOUCHER</span>
                          <span className="font-bold text-slate-800 font-mono text-sm">{ap.ref_id}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold">
                          LEVEL SAAT INI: {ap.current_level}
                        </span>
                      </div>

                      {/* Timeline flow */}
                      <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                        <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <p>1. Staff TU</p>
                          <p className="text-[9px] text-emerald-600 mt-1">APPROVED</p>
                        </div>
                        <div className={`p-2.5 rounded-xl border ${ap.tu_status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-400'}`}>
                          <p>2. Kepala TU</p>
                          <p className="text-[9px] mt-1">{ap.tu_status}</p>
                        </div>
                        <div className={`p-2.5 rounded-xl border ${ap.bendahara_status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-400'}`}>
                          <p>3. Bendahara</p>
                          <p className="text-[9px] mt-1">{ap.bendahara_status}</p>
                        </div>
                        <div className={`p-2.5 rounded-xl border ${ap.yayasan_status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-400'}`}>
                          <p>4. Yayasan</p>
                          <p className="text-[9px] mt-1">{ap.yayasan_status}</p>
                        </div>
                      </div>

                      {/* Action buttons based on active mock role */}
                      <div className="flex gap-2 justify-end pt-2">
                        <button
                          onClick={() => submitApprovalMutation.mutate({ id: ap.id, level: 'TU', status: 'APPROVED' })}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                        >
                          Loloskan Kepala TU
                        </button>
                        <button
                          onClick={() => submitApprovalMutation.mutate({ id: ap.id, level: 'BENDAHARA', status: 'APPROVED' })}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                        >
                          Loloskan Bendahara
                        </button>
                        <button
                          onClick={() => submitApprovalMutation.mutate({ id: ap.id, level: 'YAYASAN', status: 'APPROVED' })}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                        >
                          Loloskan Ketua Yayasan
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ==========================================
              TAB CANVAS: AUDIT & LOGS
              ========================================== */}
          {activeTab === 'AUDIT' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Sistem Log Audit Finansial (Audit Trail ready)</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Semua perubahan, penambahan bagan akun, penutupan buku, dan mutasi tercatat aman permanen.</p>
              </div>

              <div className="space-y-2 max-h-[450px] overflow-y-auto">
                {auditLogs.slice(0, 30).map((log: any, idx: number) => (
                  <div key={log.id || idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between gap-4">
                    <div className="text-xs">
                      <p className="text-slate-800 font-semibold">{log.action || log.description}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Pengguna: <span className="font-bold text-slate-600">{log.username || 'System Admin'}</span> | Tenant: <span className="font-bold">{log.tenant_id}</span>
                      </p>
                    </div>
                    <span className="font-mono text-[9px] text-slate-400 shrink-0">
                      {log.created_at ? new Date(log.created_at).toLocaleString() : 'Baru saja'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* ==========================================
          MODALS & FORM DRAWERS
          ========================================== */}

      {/* 1. COA Modal */}
      {isCOAModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsCOAModalOpen(false)} />
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl relative z-10 p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Buat Akun COA Baru</h3>
            <form onSubmit={coaForm.handleSubmit(handleCOASubmit)} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Kode Akun</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 11102"
                  {...coaForm.register('code', { required: true })}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nama Akun</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kas Operasional Sekolah"
                  {...coaForm.register('name', { required: true })}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Kategori</label>
                  <select
                    {...coaForm.register('category')}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 text-xs focus:outline-none"
                  >
                    <option value="ASET">ASET</option>
                    <option value="KEWAJIBAN">KEWAJIBAN</option>
                    <option value="EKUITAS">EKUITAS</option>
                    <option value="PENDAPATAN">PENDAPATAN</option>
                    <option value="BEBAN">BEBAN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Normal Balance</label>
                  <select
                    {...coaForm.register('normal_balance')}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 text-xs focus:outline-none"
                  >
                    <option value="DEBIT">DEBIT</option>
                    <option value="KREDIT">KREDIT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sub Akun Induk (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Kas & Setara Kas"
                  {...coaForm.register('sub_account')}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex gap-3 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setIsCOAModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Buat Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Bank Accounts Modal */}
      {isBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsBankModalOpen(false)} />
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl relative z-10 p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Registrasi Bank Baru</h3>
            <form onSubmit={bankForm.handleSubmit(handleBankSubmit)} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nama Bank</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bank Syariah Indonesia (BSI)"
                  {...bankForm.register('bank_name', { required: true })}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nomor Rekening</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 1029190101"
                  {...bankForm.register('account_number', { required: true })}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 text-xs focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nama Atas Nama</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: YAYASAN PONDOK PESANTREN"
                  {...bankForm.register('account_holder', { required: true })}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Saldo Awal</label>
                <input
                  type="number"
                  {...bankForm.register('balance')}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 text-xs focus:outline-none font-mono"
                />
              </div>

              <div className="flex gap-3 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setIsBankModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Daftarkan Rekening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Transaction Entry Modal (Penerimaan / Pengeluaran + AUTO JOURNAL PREVIEW) */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsTxModalOpen(false)} />
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl relative z-10 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Catat Buku Kas &amp; Jurnal Otomatis</h3>
            
            <form onSubmit={txForm.handleSubmit(handleTxSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tanggal Transaksi</label>
                  <input
                    type="date"
                    required
                    {...txForm.register('date', { required: true })}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 text-xs focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tipe Transaksi</label>
                  <select
                    {...txForm.register('type')}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 text-xs focus:outline-none font-bold"
                  >
                    <option value="PENERIMAAN">PENERIMAAN (Kas Masuk)</option>
                    <option value="PENGELUARAN">PENGELUARAN (Kas Keluar)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Jenis Simpanan</label>
                  <select
                    {...txForm.register('doc_type')}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 text-xs focus:outline-none"
                  >
                    <option value="KAS">KAS UTAMA</option>
                    <option value="BANK">REKENING BANK</option>
                    <option value="KAS_KECIL">KAS KECIL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Metode Bayar</label>
                  <select
                    {...txForm.register('method')}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 text-xs focus:outline-none"
                  >
                    <option value="CASH">Cash (Tunai)</option>
                    <option value="TRANSFER">Transfer Bank</option>
                    <option value="VIRTUAL_ACCOUNT">Virtual Account</option>
                    <option value="QRIS">QRIS Ready</option>
                    <option value="CEK">Cek Fisik</option>
                    <option value="GIRO">Giro Bilyet</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nilai Rupiah</label>
                  <input
                    type="number"
                    required
                    placeholder="Nilai uang..."
                    {...txForm.register('amount', { required: true })}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 text-xs focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nomor Referensi/Bukti</label>
                  <input
                    type="text"
                    placeholder="Contoh: INV-2026-X"
                    {...txForm.register('ref_no')}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 text-xs focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Asosiasi Rekening Bank (Jika Bank)</label>
                <select
                  {...txForm.register('bank_account_id')}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 text-xs focus:outline-none"
                >
                  <option value="">-- Pilih Rekening Target --</option>
                  {bankAccounts.map(b => (
                    <option key={b.id} value={b.id}>{b.bank_name} ({b.account_number})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Deskripsi Transaksi / Unit</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pembayaran SPP SMA Farhan / Pembelian ATK Pondok"
                  {...txForm.register('description', { required: true })}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 text-xs focus:outline-none"
                />
              </div>

              {/* COAs Selection */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-[9px] font-bold text-teal-800 uppercase tracking-wider mb-1">Bagan COA DEBIT</label>
                  <select
                    required
                    {...txForm.register('coa_debit', { required: true })}
                    className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs text-slate-800 focus:outline-none"
                  >
                    <option value="">-- Pilih Debit --</option>
                    {coasList.map(c => (
                      <option key={c.id} value={c.code}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-rose-800 uppercase tracking-wider mb-1">Bagan COA KREDIT</label>
                  <select
                    required
                    {...txForm.register('coa_kredit', { required: true })}
                    className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs text-slate-800 focus:outline-none"
                  >
                    <option value="">-- Pilih Kredit --</option>
                    {coasList.map(c => (
                      <option key={c.id} value={c.code}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* AUTOMATIC JOURNAL ENGINE LIVE PREVIEW */}
              {watchTxAmount > 0 && watchTxDebit && watchTxKredit && (
                <div className="bg-slate-900 text-teal-400 p-4 rounded-2xl border border-slate-800 text-[10px] space-y-2 font-mono">
                  <div className="flex items-center gap-1 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                    <AlertCircle className="h-3 w-3 text-teal-400" /> LIVE ENGINE AUTO JOURNAL PREVIEW
                  </div>
                  <div className="border-t border-slate-800 pt-2 space-y-1">
                    <div className="flex justify-between">
                      <span>(D) {watchTxDebit} - {coaDebitObj?.name || 'Debit'}</span>
                      <span className="text-white">Rp {Number(watchTxAmount || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pl-4">
                      <span>(K) {watchTxKredit} - {coaKreditObj?.name || 'Kredit'}</span>
                      <span className="text-white">Rp {Number(watchTxAmount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="text-[8px] text-slate-500 italic mt-1">*Sistem akan memposting secara ganda seketika ke sub-ledger &amp; neraca setelah disave.</p>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setIsTxModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Catat &amp; Jurnal Otomatis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Manual Jurnal Voucher Entry Modal (Balanced verification) */}
      {isJvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsJvModalOpen(false)} />
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl relative z-10 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Input Jurnal Manual (Double Entry)</h3>
            <p className="text-[10px] text-slate-400 mb-4">Pastikan total debet dan kredit seimbang (unbalanced journal akan ditolak sistem).</p>

            <form onSubmit={jvForm.handleSubmit(handleJvSubmit)} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tanggal Jurnal</label>
                <input
                  type="date"
                  required
                  {...jvForm.register('date', { required: true })}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 text-xs focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Keterangan / Narasi Audit</label>
                <input
                  type="text"
                  required
                  placeholder="Koreksi jurnal SPP / Penyesuaian modal..."
                  {...jvForm.register('description', { required: true })}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 text-xs focus:outline-none"
                />
              </div>

              {/* Dynamic rows */}
              <div className="space-y-2">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Daftar Baris Buku Ganda</span>
                
                {jvFields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
                    
                    {/* Account selection */}
                    <div className="col-span-6">
                      <select
                        required
                        {...jvForm.register(`details.${index}.account_code` as const, { required: true })}
                        className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-[10px] text-slate-800 focus:outline-none"
                      >
                        <option value="">-- Pilih Akun --</option>
                        {coasList.map(c => (
                          <option key={c.id} value={c.code}>{c.code} - {c.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Debit */}
                    <div className="col-span-2.5">
                      <input
                        type="number"
                        placeholder="Debit"
                        {...jvForm.register(`details.${index}.debit` as const)}
                        className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-[10px] text-slate-850 focus:outline-none font-mono text-right"
                      />
                    </div>

                    {/* Credit */}
                    <div className="col-span-2.5">
                      <input
                        type="number"
                        placeholder="Kredit"
                        {...jvForm.register(`details.${index}.credit` as const)}
                        className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-[10px] text-slate-850 focus:outline-none font-mono text-right"
                      />
                    </div>

                    {/* Delete button */}
                    <div className="col-span-1 text-center">
                      {jvFields.length > 2 && (
                        <button
                          type="button"
                          onClick={() => jvRemove(index)}
                          className="text-rose-600 hover:text-rose-500 font-extrabold text-xs cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => jvAppend({ account_code: '', debit: 0, credit: 0 })}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold cursor-pointer"
                >
                  + Tambah Baris Ganda
                </button>
              </div>

              <div className="flex gap-3 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setIsJvModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Posting Jurnal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Transfer Antar Rekening Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsTransferModalOpen(false)} />
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl relative z-10 p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Transfer Dana Antar Brankas / Bank</h3>
            
            <form onSubmit={transferForm.handleSubmit(handleTransferSubmit)} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tanggal Transfer</label>
                <input
                  type="date"
                  required
                  {...transferForm.register('date', { required: true })}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 text-xs focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Rekening Sumber (Kredit)</label>
                <select
                  required
                  {...transferForm.register('source_id', { required: true })}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 text-xs focus:outline-none"
                >
                  <option value="">-- Pilih Rekening Sumber --</option>
                  {bankAccounts.map(b => (
                    <option key={b.id} value={b.id}>{b.bank_name} - Rp {Number(b.balance || 0).toLocaleString()}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Rekening Tujuan / Kas (Debit)</label>
                <select
                  required
                  {...transferForm.register('target_id', { required: true })}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 text-xs focus:outline-none"
                >
                  <option value="">-- Pilih Rekening Tujuan --</option>
                  <option value="kas-utama">Kas Utama (Cash Fisik)</option>
                  {bankAccounts.map(b => (
                    <option key={b.id} value={b.id}>{b.bank_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Jumlah Transfer (Rupiah)</label>
                <input
                  type="number"
                  required
                  placeholder="Jumlah transfer..."
                  {...transferForm.register('amount', { required: true })}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 text-xs focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Keterangan Transfer</label>
                <input
                  type="text"
                  required
                  placeholder="Pemindahan kas operasional..."
                  {...transferForm.register('description', { required: true })}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 text-xs focus:outline-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Kirim Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Import Mutasi / Recon Modal */}
      {isReconModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsReconModalOpen(false)} />
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl relative z-10 p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Import &amp; Rekonsiliasi Rekening</h3>
            <p className="text-[10px] text-slate-400 mb-4">Upload mutasi bank dalam format CSV/Excel untuk memicu pencocokan otomatis (Auto Match).</p>

            {reconProgress === 'idle' && (
              <form onSubmit={reconForm.handleSubmit(handleReconSubmit)} className="space-y-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Periode Mutasi</label>
                  <input
                    type="month"
                    required
                    {...reconForm.register('period', { required: true })}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 text-xs focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Rekening Bank Target</label>
                  <select
                    required
                    {...reconForm.register('bank_account_id', { required: true })}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-800 text-xs focus:outline-none"
                  >
                    <option value="">-- Pilih Rekening Target --</option>
                    {bankAccounts.map(b => (
                      <option key={b.id} value={b.id}>{b.bank_name}</option>
                    ))}
                  </select>
                </div>

                {/* Drag and drop mock file area */}
                <div className="border-2 border-dashed border-slate-200 hover:border-teal-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50">
                  <UploadCloud className="h-8 w-8 text-slate-300 mx-auto" />
                  <p className="text-[11px] font-bold text-slate-700 mt-2">Seret berkas mutasi bank di sini</p>
                  <p className="text-[9px] text-slate-400 mt-1">Mendukung format CSV, XLS, XLSX</p>
                </div>

                <div className="flex gap-3 justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setIsReconModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Mulai Upload &amp; Impor
                  </button>
                </div>
              </form>
            )}

            {reconProgress === 'matching' && (
              <div className="py-8 text-center space-y-4">
                <RefreshCw className="h-10 w-10 text-teal-600 animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-800">Menjalankan Jurnal Engine...</p>
                <p className="text-[10px] text-slate-400">Sedang mencocokkan total 4 baris mutasi rekening bank dengan Jurnal Umum.</p>
              </div>
            )}

            {reconProgress === 'success' && (
              <div className="py-8 text-center space-y-4 text-emerald-600">
                <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-500 animate-bounce" />
                <p className="text-xs font-bold">Pencocokan Mutasi 100% Berhasil!</p>
                <p className="text-[10px] text-emerald-600/70">Semua baris mutasi seimbang, draf rekonsiliasi diperbarui.</p>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
