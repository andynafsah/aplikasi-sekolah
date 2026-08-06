import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  BarChart3, 
  Database, 
  RefreshCw, 
  TrendingUp, 
  Brain, 
  ShieldAlert, 
  BookOpen, 
  Clock, 
  Filter, 
  Search, 
  Download, 
  Share2, 
  CalendarDays, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Plus, 
  Sliders, 
  Compass, 
  GitBranch, 
  Eye, 
  Sparkles,
  Play,
  Settings,
  HelpCircle,
  FileText
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar 
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import {
  useExecutiveCockpitQuery,
  useEtlJobsQuery,
  useEtlHistoryQuery,
  useEtlRunMutation,
  useDataMartsQuery,
  useDataMartRefreshMutation,
  useForecastsQuery,
  useForecastGenerateMutation,
  usePredictionsQuery,
  useAiRecommendationsQuery,
  useKpiSnapshotsQuery,
  useQualityChecksQuery,
  useMetadataCatalogQuery,
  useDashboardSharesQuery,
  useCreateDashboardShareMutation
} from '../lib/bi-api';

type BI_TAB = 'cockpit' | 'warehouse' | 'etl' | 'marts' | 'forecast' | 'prediction' | 'kpis' | 'catalog' | 'quality' | 'ai';

interface ScheduleFormInput {
  jobId: string;
  frequency: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  time: string;
  incrementalLoad: boolean;
}

interface ShareFormInput {
  title: string;
  accessLevel: 'READ_ONLY' | 'EDITABLE';
  expirationDate: string;
}

export default function BusinessIntelligence() {
  const { tenant } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<BI_TAB>('cockpit');
  
  // Dynamic search & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTenant, setFilterTenant] = useState('current');
  const [filterPeriod, setFilterPeriod] = useState('Q3-2026');
  const [filterUnit, setFilterUnit] = useState('all');
  const [filterDept, setFilterDept] = useState('all');
  const [filterAcadYear, setFilterAcadYear] = useState('2025/2026');

  // Selected Table inside DW tab
  const [selectedDwTable, setSelectedDwTable] = useState<string>('dw_fact_academic');

  // React Hook Form setups
  const { register: regSchedule, handleSubmit: handleScheduleSubmit, reset: resetSchedule, formState: { errors: schedErrors } } = useForm<ScheduleFormInput>({
    defaultValues: {
      incrementalLoad: true,
      frequency: 'DAILY'
    }
  });

  const { register: regShare, handleSubmit: handleShareSubmit, reset: resetShare, formState: { errors: shareErrors } } = useForm<ShareFormInput>({
    defaultValues: {
      accessLevel: 'READ_ONLY',
      expirationDate: '2026-12-31'
    }
  });

  // Query States from TanStack Query
  const { data: cockpitData, isLoading: isCockpitLoading } = useExecutiveCockpitQuery();
  const { data: etlJobs, isLoading: isEtlJobsLoading } = useEtlJobsQuery();
  const { data: etlHistory, isLoading: isEtlHistLoading } = useEtlHistoryQuery();
  const { data: dataMarts, isLoading: isMartsLoading } = useDataMartsQuery();
  const { data: forecasts, isLoading: isForecastsLoading } = useForecastsQuery();
  const { data: predictions, isLoading: isPredictionsLoading } = usePredictionsQuery();
  const { data: recommendations, isLoading: isRecommendationsLoading } = useAiRecommendationsQuery();
  const { data: kpiSnapshots, isLoading: isKpisLoading } = useKpiSnapshotsQuery();
  const { data: qualityChecks, isLoading: isQualityLoading } = useQualityChecksQuery();
  const { data: metadataCatalog, isLoading: isCatalogLoading } = useMetadataCatalogQuery();
  const { data: dashboardShares, isLoading: isSharesLoading } = useDashboardSharesQuery();

  // Mutations
  const etlRunMutation = useEtlRunMutation();
  const dataMartRefreshMutation = useDataMartRefreshMutation();
  const forecastGenerateMutation = useForecastGenerateMutation();
  const createShareMutation = useCreateDashboardShareMutation();

  // Form Submission Handlers
  const onScheduleSubmit = (data: ScheduleFormInput) => {
    alert(`Konfigurasi Scheduler Berhasil Disimpan!\n\nETL Job ID: ${data.jobId}\nFrekuensi: ${data.frequency}\nWaktu: ${data.time}\nIncremental: ${data.incrementalLoad ? 'Ya' : 'Tidak'}`);
    resetSchedule();
  };

  const onShareSubmit = (data: ShareFormInput) => {
    createShareMutation.mutate({
      title: data.title,
      expiration_date: new Date(data.expirationDate).toISOString(),
      access_level: data.accessLevel
    }, {
      onSuccess: () => {
        resetShare();
        alert('Tautan Berbagi Dashboard Berhasil Dibuat!');
      }
    });
  };

  const runEtlJob = (jobId: string) => {
    etlRunMutation.mutate(jobId, {
      onSuccess: (data) => {
        alert(`ETL Sukses!\n${data.logs}`);
      }
    });
  };

  const refreshMart = (martId: string) => {
    dataMartRefreshMutation.mutate(martId, {
      onSuccess: () => {
        alert('Data Mart Berhasil Di-refresh ke Data Warehouse!');
      }
    });
  };

  const triggerForecast = (category: string) => {
    forecastGenerateMutation.mutate(category, {
      onSuccess: () => {
        alert(`Kalkulasi model peramalan ARIMA untuk "${category}" berhasil di-refresh.`);
      }
    });
  };

  // Export handlers
  const handleExport = (format: 'PDF' | 'EXCEL' | 'CSV' | 'REPORT') => {
    alert(`File laporan ${format} sedang di-generate & diekspor untuk periode ${filterPeriod}. Silakan cek folder unduhan Anda.`);
  };

  // Interactive local states
  const [kpiThresholds, setKpiThresholds] = useState<Record<string, number>>({
    revenue: 90,
    collection: 95,
    attendance: 94,
    graduation: 100,
    retention: 98,
    dropout: 1,
    teacher: 85,
    student: 80
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Page Header banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
            <BarChart3 className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Enterprise Data Warehouse & BI</h1>
            <p className="text-xs text-slate-500">Pusat visualisasi eksekutif, Olap Cube, analisis prediktif, & pengambil keputusan bertenaga AI.</p>
          </div>
        </div>

        {/* Global Action Tools */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => handleExport('REPORT')}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileText className="h-4 w-4" />
            <span>Executive Report</span>
          </button>
          <button 
            onClick={() => handleExport('PDF')}
            className="px-3.5 py-2 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 rounded-lg border border-red-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>PDF Dashboard</span>
          </button>
        </div>
      </div>

      {/* OLAP Interactive Filters Panel */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 grid grid-cols-2 md:grid-cols-6 gap-4">
        
        {/* Filter Tenant */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Compass className="h-3 w-3" /> Tenant Scope</label>
          <select 
            value={filterTenant} 
            onChange={(e) => setFilterTenant(e.target.value)}
            className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="current">Current Tenant ({tenant?.name?.substr(0, 12)}...)</option>
            <option value="global">Consolidated Global (SaaS level)</option>
          </select>
        </div>

        {/* Filter Period */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Clock className="h-3 w-3" /> Analisis Periode</label>
          <select 
            value={filterPeriod} 
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="July-2026">Juli 2026 (Sekarang)</option>
            <option value="Q3-2026">Q3 2026 (Proyeksi)</option>
            <option value="TA-2025/2026">TA 2025/2026 (Full)</option>
          </select>
        </div>

        {/* Filter Unit */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><GitBranch className="h-3 w-3" /> Unit / Cabang</label>
          <select 
            value={filterUnit} 
            onChange={(e) => setFilterUnit(e.target.value)}
            className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="all">Semua Unit (Consolidated)</option>
            <option value="SMA">SMA Unggulan</option>
            <option value="SMP">SMP Unggulan</option>
            <option value="Pondok_Putra">Asrama Putra</option>
            <option value="Pondok_Putri">Asrama Putri</option>
          </select>
        </div>

        {/* Filter Department */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Settings className="h-3 w-3" /> Departemen</label>
          <select 
            value={filterDept} 
            onChange={(e) => setFilterDept(e.target.value)}
            className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="all">Semua Bidang / Keilmuan</option>
            <option value="MIPA">MIPA (Sains & Mat)</option>
            <option value="IPS">IPS (Sosial & Hum)</option>
            <option value="AGAMA">Agama / Pondok</option>
          </select>
        </div>

        {/* Filter Academic Year */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><CalendarDays className="h-3 w-3" /> Tahun Akademik</label>
          <select 
            value={filterAcadYear} 
            onChange={(e) => setFilterAcadYear(e.target.value)}
            className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="2025/2026">2025/2026 (Aktif)</option>
            <option value="2026/2027">2026/2027 (PPDB)</option>
          </select>
        </div>

        {/* Global Search Bar */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Search className="h-3 w-3" /> Cari BI Data</label>
          <div className="relative">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari dashboard, kpi, pred..."
              className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 p-2.5 pl-8 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-3.5" />
          </div>
        </div>

      </div>

      {/* Sub Tab Navigation bar */}
      <div className="bg-slate-200/60 p-1.5 rounded-xl flex flex-wrap gap-1 border border-slate-300/40">
        {[
          { id: 'cockpit', name: 'Executive Cockpit', icon: Compass },
          { id: 'warehouse', name: 'Data Warehouse', icon: Database },
          { id: 'etl', name: 'ETL Engine', icon: Clock },
          { id: 'marts', name: 'Data Mart', icon: GitBranch },
          { id: 'forecast', name: 'Forecast Engine', icon: TrendingUp },
          { id: 'prediction', name: 'Predictive Model', icon: Brain },
          { id: 'kpis', name: 'KPI Dashboard', icon: Sliders },
          { id: 'catalog', name: 'Metadata Catalog', icon: FileText },
          { id: 'quality', name: 'Data Quality', icon: ShieldAlert },
          { id: 'ai', name: 'AI Decision Support', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as BI_TAB);
                setSearchQuery('');
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents Viewport */}
      <div className="min-h-[500px]">

        {/* 1. EXECUTIVE COCKPIT VIEW */}
        {activeSubTab === 'cockpit' && (
          <div className="space-y-6">
            
            {/* Reusable Executive Summary Card */}
            <div className="bg-gradient-to-r from-blue-750 to-indigo-900 rounded-2xl p-6 text-white shadow-sm border border-blue-900/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pointer-events-none">
                <Compass className="h-64 w-64 -mr-16 -mt-8" />
              </div>
              <div className="space-y-2 relative z-10">
                <div className="inline-block bg-blue-500/30 border border-blue-400/30 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
                  Enterprise Data Engine Live
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight">Kabin Kontrol Yayasan & Eksekutif</h2>
                <p className="text-xs text-slate-200/90 max-w-xl">
                  Satu sumber kebenaran tunggal (**Single Source of Truth**) yang mengonsolidasikan seluruh data transaksi sekolah secara otomatis, menyajikan visualisasi data mart, laju koleksi SPP, ketahanan absensi, & audit mutu akademik.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 space-y-3 shrink-0 relative z-10 w-full md:w-auto">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">DW Status Overview</h4>
                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div>
                    <span className="text-slate-300 block text-[9px] uppercase font-bold">Marts Ready</span>
                    <span className="text-base font-bold text-emerald-300">● {cockpitData?.summary?.martsReady || 8} Marts</span>
                  </div>
                  <div>
                    <span className="text-slate-300 block text-[9px] uppercase font-bold">Data Quality</span>
                    <span className="text-base font-bold text-teal-300">✓ {cockpitData?.summary?.qualityCheckStatus || 'PASSED'}</span>
                  </div>
                  <div>
                    <span className="text-slate-300 block text-[9px] uppercase font-bold">Consolidation</span>
                    <span className="text-base font-bold text-blue-300">Incremental</span>
                  </div>
                  <div>
                    <span className="text-slate-300 block text-[9px] uppercase font-bold">Sync Cycle</span>
                    <span className="text-base font-bold text-amber-300">Auto 30s</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reusable KPI Widgets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {cockpitData?.metrics && Object.entries(cockpitData.metrics).map(([key, metric]: [string, any]) => {
                const isExcellent = metric.status === 'EXCELLENT';
                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                return (
                  <div key={key} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</span>
                      <span className={`text-[9px] px-2 py-0.5 font-bold rounded-full ${
                        isExcellent ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}>
                        {metric.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-slate-800 tracking-tight font-mono">
                        {metric.unit === 'IDR' ? `Rp ${(metric.value / 1000000).toFixed(1)}M` : `${metric.value}${metric.unit}`}
                      </h3>
                      <p className="text-[10px] text-slate-400">
                        Target Batas: {metric.unit === 'IDR' ? `Rp ${(metric.target / 1000000).toFixed(1)}M` : `${metric.target}${metric.unit}`}
                      </p>
                    </div>

                    {/* Mini Sparkline Visualization */}
                    <div className="h-6 mt-4 opacity-75">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                          { val: metric.value * 0.9 },
                          { val: metric.value * 0.95 },
                          { val: metric.value * 0.92 },
                          { val: metric.value * 0.98 },
                          { val: metric.value }
                        ]}>
                          <Area type="monotone" dataKey="val" stroke={isExcellent ? '#10b981' : '#2563eb'} fill={isExcellent ? '#d1fae5' : '#dbeafe'} strokeWidth={1.5} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Trends, BI Charts & Benchmark Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Core Revenue Trend Chart */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                  <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <TrendingUp className="h-4.5 w-4.5 text-blue-500" />
                    <span>Laju Arus Kas & Revenue Consolidated (SPP, Gedung, PPDB)</span>
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">Model: ARIMA Holt-Winters</span>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { name: 'Mei', Historis: 390, Proyeksi: null, Target: 400 },
                      { name: 'Juni', Historis: 420, Proyeksi: null, Target: 450 },
                      { name: 'Juli', Historis: 450, Proyeksi: 450, Target: 500 },
                      { name: 'Agt (F)', Historis: null, Proyeksi: 495, Target: 520 },
                      { name: 'Sep (F)', Historis: null, Proyeksi: 530, Target: 550 },
                      { name: 'Okt (F)', Historis: null, Proyeksi: 580, Target: 600 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <Tooltip />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Area type="monotone" dataKey="Historis" stroke="#2563eb" fill="#dbeafe" strokeWidth={2} />
                      <Area type="monotone" dataKey="Proyeksi" stroke="#f59e0b" fill="#fef3c7" strokeWidth={2} strokeDasharray="5 5" />
                      <Line type="monotone" dataKey="Target" stroke="#10b981" strokeWidth={1} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Benchmark comparison & Anomaly Alerts */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
                <div className="border-b pb-3 border-slate-100">
                  <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <GitBranch className="h-4.5 w-4.5 text-indigo-500" />
                    <span>Perbandingan Benchmark Antar Unit</span>
                  </h3>
                </div>

                <div className="space-y-4">
                  {[
                    { unit: 'SMA Unggulan', performance: 92.5, revenue: 240, status: 'TOP' },
                    { unit: 'SMP Unggulan', performance: 86.2, revenue: 160, status: 'STABLE' },
                    { unit: 'SD Terpadu', performance: 81.0, revenue: 95, status: 'STABLE' },
                    { unit: 'Asrama Putra', performance: 79.4, revenue: 80, status: 'WATCH' },
                  ].map((unitData, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">{unitData.unit}</span>
                        <span className="font-mono font-bold text-slate-600">{unitData.performance}% Perf</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            unitData.status === 'TOP' ? 'bg-emerald-500' : unitData.status === 'STABLE' ? 'bg-blue-500' : 'bg-amber-500'
                          }`} 
                          style={{ width: `${unitData.performance}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-red-50 border border-red-100 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-700">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>Sinyal Anomali Terdeteksi (Ready)</span>
                  </div>
                  <p className="text-[10px] text-red-600">
                    Terdapat penurunan abnormal tingkat kehadiran santri asrama putra sebesar 4.2% pada minggu ke-4 Juni. Sangat direkomendasikan audit asrama proaktif.
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* 2. DATA WAREHOUSE INTEGRITY VIEW */}
        {activeSubTab === 'warehouse' && (
          <div className="space-y-6">
            
            {/* Star Schema Architectural Diagram */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800 space-y-4">
              <div className="border-b pb-3 border-slate-800 flex justify-between items-center">
                <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
                  <Database className="h-4.5 w-4.5" />
                  <span>Star Schema & Multi-Tenant Warehouse Map</span>
                </h3>
                <span className="text-[10px] bg-slate-800 border border-slate-700 px-2 py-0.5 rounded font-mono text-slate-300">
                  Consolidated Model
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-xs">
                
                {/* Left Side: Dimension Tables */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-blue-400 uppercase tracking-wider text-[10px]">Dimension Tables</h4>
                  <div className="space-y-1.5 text-slate-300 font-mono text-[11px]">
                    <div className="p-1.5 bg-slate-900 border border-slate-800/80 rounded">dw_dim_date</div>
                    <div className="p-1.5 bg-slate-900 border border-slate-800/80 rounded">dw_dim_student</div>
                    <div className="p-1.5 bg-slate-900 border border-slate-800/80 rounded">dw_dim_teacher</div>
                    <div className="p-1.5 bg-slate-900 border border-slate-800/80 rounded">dw_dim_class</div>
                    <div className="p-1.5 bg-slate-900 border border-slate-800/80 rounded">dw_dim_subject</div>
                    <div className="p-1.5 bg-slate-900 border border-slate-800/80 rounded">dw_dim_department</div>
                    <div className="p-1.5 bg-slate-900 border border-slate-800/80 rounded">dw_dim_unit</div>
                    <div className="p-1.5 bg-slate-900 border border-slate-800/80 rounded">dw_dim_payment</div>
                    <div className="p-1.5 bg-slate-900 border border-slate-800/80 rounded">dw_dim_employee</div>
                  </div>
                </div>

                {/* Center: Fact Tables */}
                <div className="bg-indigo-950/40 p-4 rounded-xl border border-indigo-900/60 space-y-2 md:col-span-2">
                  <h4 className="font-bold text-indigo-400 uppercase tracking-wider text-[10px]">Fact Tables (Aggregates & Transactions)</h4>
                  <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono text-[11px]">
                    <button 
                      onClick={() => setSelectedDwTable('dw_fact_academic')}
                      className={`p-1.5 rounded border text-left flex items-center justify-between ${
                        selectedDwTable === 'dw_fact_academic' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <span>dw_fact_academic</span>
                      <Eye className="h-3 w-3" />
                    </button>
                    <button 
                      onClick={() => setSelectedDwTable('dw_fact_finance')}
                      className={`p-1.5 rounded border text-left flex items-center justify-between ${
                        selectedDwTable === 'dw_fact_finance' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <span>dw_fact_finance</span>
                      <Eye className="h-3 w-3" />
                    </button>
                    <button 
                      onClick={() => setSelectedDwTable('dw_fact_attendance')}
                      className={`p-1.5 rounded border text-left flex items-center justify-between ${
                        selectedDwTable === 'dw_fact_attendance' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <span>dw_fact_attendance</span>
                      <Eye className="h-3 w-3" />
                    </button>
                    <button 
                      onClick={() => setSelectedDwTable('dw_fact_payroll')}
                      className={`p-1.5 rounded border text-left flex items-center justify-between ${
                        selectedDwTable === 'dw_fact_payroll' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <span>dw_fact_payroll</span>
                      <Eye className="h-3 w-3" />
                    </button>
                    <button 
                      onClick={() => setSelectedDwTable('dw_fact_library')}
                      className={`p-1.5 rounded border text-left flex items-center justify-between ${
                        selectedDwTable === 'dw_fact_library' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <span>dw_fact_library</span>
                      <Eye className="h-3 w-3" />
                    </button>
                    <button 
                      onClick={() => setSelectedDwTable('dw_fact_inventory')}
                      className={`p-1.5 rounded border text-left flex items-center justify-between ${
                        selectedDwTable === 'dw_fact_inventory' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <span>dw_fact_inventory</span>
                      <Eye className="h-3 w-3" />
                    </button>
                    <button 
                      onClick={() => setSelectedDwTable('dw_fact_ppdb')}
                      className={`p-1.5 rounded border text-left flex items-center justify-between ${
                        selectedDwTable === 'dw_fact_ppdb' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <span>dw_fact_ppdb</span>
                      <Eye className="h-3 w-3" />
                    </button>
                    <div className="p-1.5 bg-slate-900/40 border border-slate-800/40 rounded text-left text-slate-500">dw_fact_lms (Ready)</div>
                    <div className="p-1.5 bg-slate-900/40 border border-slate-800/40 rounded text-left text-slate-500">dw_fact_cbt (Ready)</div>
                    <div className="p-1.5 bg-slate-900/40 border border-slate-800/40 rounded text-left text-slate-500">dw_fact_boarding (Ready)</div>
                  </div>
                </div>

              </div>
            </div>

            {/* Warehouse Table Viewer */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-700">
                    Melihat Tabel Warehouse: <span className="text-blue-600 font-mono">{selectedDwTable}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {selectedDwTable === 'dw_fact_academic' ? 'Menyimpan aggregasi IPK, tingkat kehadiran, & kelayakan kelulusan siswa.'
                    : selectedDwTable === 'dw_fact_finance' ? 'Menyimpan rekapitulasi nominal penagihan, pembayaran, & laju kolektivitas kas.'
                    : selectedDwTable === 'dw_fact_attendance' ? 'Menyimpan summary absensi harian ter-rekap untuk dashboard.'
                    : 'Menyimpan aggregasi data transaksional termutakhir.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleExport('CSV')}
                    className="px-2.5 py-1.5 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>CSV</span>
                  </button>
                  <button 
                    onClick={() => handleExport('EXCEL')}
                    className="px-2.5 py-1.5 text-[11px] font-bold bg-green-50 hover:bg-green-100 text-green-700 rounded-lg border border-green-200 flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Excel</span>
                  </button>
                </div>
              </div>

              {/* Data Rows */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
                    {selectedDwTable === 'dw_fact_academic' ? (
                      <tr>
                        <th className="p-3">Fact ID</th>
                        <th className="p-3">Dim Student ID</th>
                        <th className="p-3">Dim Class ID</th>
                        <th className="p-3">IPK Rata-Rata</th>
                        <th className="p-3">Rate Kehadiran</th>
                        <th className="p-3">Tingkat Kelulusan</th>
                        <th className="p-3">Created At</th>
                      </tr>
                    ) : selectedDwTable === 'dw_fact_finance' ? (
                      <tr>
                        <th className="p-3">Fact ID</th>
                        <th className="p-3">Dim Date ID</th>
                        <th className="p-3">Dim Payment ID</th>
                        <th className="p-3">Billing Target</th>
                        <th className="p-3">Collected Amount</th>
                        <th className="p-3">Collection Rate</th>
                        <th className="p-3">Transaction Count</th>
                      </tr>
                    ) : (
                      <tr>
                        <th className="p-3">Fact ID</th>
                        <th className="p-3">Unit / Code</th>
                        <th className="p-3">Jumlah Record</th>
                        <th className="p-3">Keandalan</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Created At</th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {selectedDwTable === 'dw_fact_academic' ? (
                      <>
                        <tr className="hover:bg-slate-50/50">
                          <td className="p-3 font-semibold text-slate-700">fact-acad-1</td>
                          <td className="p-3">dim-std-1 (Ahmad Fauzi)</td>
                          <td className="p-3">dim-cls-1</td>
                          <td className="p-3 text-blue-650 font-bold">85.5</td>
                          <td className="p-3">98.0%</td>
                          <td className="p-3 text-emerald-600 font-bold">READY (100%)</td>
                          <td className="p-3 text-slate-400">2026-07-01</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50">
                          <td className="p-3 font-semibold text-slate-700">fact-acad-2</td>
                          <td className="p-3">dim-std-2 (Zulkifli Hasan)</td>
                          <td className="p-3">dim-cls-1</td>
                          <td className="p-3 text-blue-650 font-bold">78.0</td>
                          <td className="p-3">92.5%</td>
                          <td className="p-3 text-emerald-600 font-bold">READY (100%)</td>
                          <td className="p-3 text-slate-400">2026-07-01</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50">
                          <td className="p-3 font-semibold text-slate-700">fact-acad-3</td>
                          <td className="p-3">dim-std-3 (Siti Aminah)</td>
                          <td className="p-3">dim-cls-2</td>
                          <td className="p-3 text-blue-650 font-bold">91.2</td>
                          <td className="p-3">99.1%</td>
                          <td className="p-3 text-emerald-600 font-bold">READY (100%)</td>
                          <td className="p-3 text-slate-400">2026-07-02</td>
                        </tr>
                      </>
                    ) : selectedDwTable === 'dw_fact_finance' ? (
                      <>
                        <tr className="hover:bg-slate-50/50">
                          <td className="p-3 font-semibold text-slate-700">fact-fin-1</td>
                          <td className="p-3">date-1 (2026-07-01)</td>
                          <td className="p-3">dim-pay-1 (SPP)</td>
                          <td className="p-3">Rp 150.000.000</td>
                          <td className="p-3 text-emerald-600 font-bold">Rp 142.000.000</td>
                          <td className="p-3 text-blue-600 font-bold">94.6%</td>
                          <td className="p-3">142 trx</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50">
                          <td className="p-3 font-semibold text-slate-700">fact-fin-2</td>
                          <td className="p-3">date-2 (2026-07-02)</td>
                          <td className="p-3">dim-pay-1 (SPP)</td>
                          <td className="p-3">Rp 150.000.000</td>
                          <td className="p-3 text-emerald-600 font-bold">Rp 145.000.000</td>
                          <td className="p-3 text-blue-600 font-bold">96.6%</td>
                          <td className="p-3">145 trx</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50">
                          <td className="p-3 font-semibold text-slate-700">fact-fin-3</td>
                          <td className="p-3">date-3 (2026-07-03)</td>
                          <td className="p-3">dim-pay-2 (Uang Gedung)</td>
                          <td className="p-3">Rp 80.000.000</td>
                          <td className="p-3 text-emerald-600 font-bold">Rp 72.000.000</td>
                          <td className="p-3 text-blue-600 font-bold">90.0%</td>
                          <td className="p-3">36 trx</td>
                        </tr>
                      </>
                    ) : (
                      <tr className="hover:bg-slate-50/50 text-slate-500">
                        <td className="p-3">fact-gen-1</td>
                        <td className="p-3">SMA / GENERAL</td>
                        <td className="p-3">4,250 rows</td>
                        <td className="p-3">99.8% Perfect</td>
                        <td className="p-3 font-bold text-emerald-600">PASSED</td>
                        <td className="p-3">2026-07-04</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        )}

        {/* 3. ETL ENGINE WORKSPACE */}
        {activeSubTab === 'etl' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left side: List of Jobs with manual trigger */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
                <div className="border-b pb-3 border-slate-100 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                    <RefreshCw className="h-4.5 w-4.5 text-blue-500" />
                    <span>Layanan ETL Incremental Terjadwal</span>
                  </h3>
                  <span className="text-[9px] bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    CDC & Log Sync
                  </span>
                </div>

                <div className="space-y-4">
                  {etlJobs && etlJobs.map((job: any) => (
                    <div key={job.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">{job.name}</span>
                          <span className="text-[9px] px-1.5 py-0.5 bg-slate-200 text-slate-600 font-mono rounded">
                            {job.target_table}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Frekuensi: {job.frequency} | Terakhir Jalan: {new Date(job.last_run_at).toLocaleTimeString()} ({job.last_run_status})
                        </p>
                      </div>

                      <button
                        onClick={() => runEtlJob(job.id)}
                        disabled={etlRunMutation.isPending}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Run Incremental</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Incremental Schedule Builder Form (Validation & React Hook Form) */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
                <div className="border-b pb-3 border-slate-100">
                  <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                    <Settings className="h-4.5 w-4.5 text-indigo-500" />
                    <span>Schedule Builder & Rule Configuration</span>
                  </h3>
                </div>

                <form onSubmit={handleScheduleSubmit(onScheduleSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Select ETL Job */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Target ETL Job</label>
                    <select
                      {...regSchedule('jobId', { required: 'Pilih target pekerjaan' })}
                      className="w-full text-xs bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="">-- Pilih Pekerjaan --</option>
                      {etlJobs?.map((job: any) => (
                        <option key={job.id} value={job.id}>{job.name}</option>
                      ))}
                    </select>
                    {schedErrors.jobId && <span className="text-[10px] text-red-500 font-medium">{schedErrors.jobId.message}</span>}
                  </div>

                  {/* Frequency selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Frekuensi Sinkronisasi</label>
                    <select
                      {...regSchedule('frequency', { required: 'Frekuensi wajib dipilih' })}
                      className="w-full text-xs bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="HOURLY">Tiap Jam (Hourly)</option>
                      <option value="DAILY">Harian (Daily)</option>
                      <option value="WEEKLY">Mingguan (Weekly)</option>
                      <option value="MONTHLY">Bulanan (Monthly)</option>
                    </select>
                  </div>

                  {/* Execution time */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Waktu Eksekusi (WIB)</label>
                    <input
                      type="time"
                      {...regSchedule('time', { required: 'Waktu eksekusi wajib diatur' })}
                      className="w-full text-xs bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    {schedErrors.time && <span className="text-[10px] text-red-500 font-medium">{schedErrors.time.message}</span>}
                  </div>

                  {/* Incremental Toggle */}
                  <div className="flex items-center gap-3 pt-5">
                    <input
                      type="checkbox"
                      id="incrementalLoad"
                      {...regSchedule('incrementalLoad')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                    />
                    <label htmlFor="incrementalLoad" className="text-xs font-bold text-slate-600 cursor-pointer">
                      Gunakan CDC (Incremental Sync)
                    </label>
                  </div>

                  <div className="sm:col-span-2 pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Simpan Jadwal Baru</span>
                    </button>
                  </div>

                </form>
              </div>

            </div>

            {/* Right side: Reusable ETL Timeline & Exec history logs */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4 h-fit">
              <div className="border-b pb-3 border-slate-100">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <Clock className="h-4.5 w-4.5 text-indigo-500" />
                  <span>Timeline Ekstraksi Historis (Reusable)</span>
                </h3>
              </div>

              <div className="space-y-4">
                {etlHistory && etlHistory.map((hist: any, index: number) => {
                  const isSuccess = hist.status === 'SUCCESS';
                  return (
                    <div key={hist.id} className="relative pl-6 border-l-2 border-blue-100/80 pb-4 last:pb-0">
                      
                      {/* Timeline dot */}
                      <div className={`absolute -left-1.5 top-1.5 h-3 w-3 rounded-full ${
                        isSuccess ? 'bg-blue-600' : 'bg-red-500'
                      }`} />

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-700">
                            {hist.job_id === 'etl-job-1' ? 'Academic Fact Extractor' : hist.job_id === 'etl-job-2' ? 'Financial Transaction Sync' : 'Attendance Consolidation'}
                          </span>
                          <span className="text-slate-400 font-mono text-[10px]">
                            {new Date(hist.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {hist.logs}
                        </p>
                        <div className="text-[9px] font-mono font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                          <span>Berhasil: {hist.rows_inserted} baris | Durasi: {hist.duration_ms}ms</span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* 4. DATA MART SUMMARY VIEW */}
        {activeSubTab === 'marts' && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 border rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-indigo-600 shrink-0" />
                <span className="text-xs text-slate-600 font-medium">
                  Seluruh Dashboard utama membaca data langsung dari **Data Mart**, mencegah degradasi performa pada tabel operasional transaksi berat.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dataMarts && dataMarts.map((mart: any) => (
                <div key={mart.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono px-2 py-0.5 rounded font-bold">
                        {mart.code}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                        <Database className="h-3 w-3" /> {mart.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-800">{mart.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 min-h-[2.5rem]">{mart.description}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-100/60 mt-4 flex items-center justify-between">
                    <div className="font-mono text-xs text-slate-600">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Rows Loaded</span>
                      <span className="font-bold text-slate-700">{(mart.total_rows).toLocaleString()} baris</span>
                    </div>

                    <button
                      onClick={() => refreshMart(mart.id)}
                      disabled={dataMartRefreshMutation.isPending}
                      className="p-1.5 hover:bg-slate-150 text-indigo-600 rounded-lg border border-slate-200 transition-all cursor-pointer flex items-center gap-1"
                      title="Refresh Mart"
                    >
                      <RefreshCw className={`h-4 w-4 ${dataMartRefreshMutation.isPending ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* 5. FORECAST ENGINE VIEW */}
        {activeSubTab === 'forecast' && (
          <div className="space-y-6">
            
            {/* Forecast Model details */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              <div className="md:col-span-3 space-y-2">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <TrendingUp className="h-4.5 w-4.5 text-blue-500" />
                  <span>Proyeksi Trend & Peramalan (Forecast Engine)</span>
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Gunakan model time-series ARIMA (Autoregressive Integrated Moving Average) untuk memproyeksikan target penerimaan kas SPP, perputaran stok inventaris logistik, laju PPDB, serta absensi berkala dalam 3 bulan mendatang.
                </p>
              </div>

              <div className="flex justify-end gap-2 shrink-0">
                {['Revenue', 'Cashflow', 'Enrollment', 'Attendance', 'Inventory'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => triggerForecast(cat)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-750 text-[10px] font-bold rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  >
                    Recalc {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Reusable Forecast Chart component */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Big trend visualizer chart */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                  <span className="text-xs font-bold text-slate-700">Grafik Peramalan ARIMA 3-Bulan (Reusable Forecast Chart)</span>
                  <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">95% Confidence Interval Enabled</span>
                </div>

                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { bulan: 'April', Historis: 360, Proyeksi: null, LowerBound: null, UpperBound: null },
                      { bulan: 'Mei', Historis: 390, Proyeksi: null, LowerBound: null, UpperBound: null },
                      { bulan: 'Juni', Historis: 420, Proyeksi: null, LowerBound: null, UpperBound: null },
                      { bulan: 'Juli (Now)', Historis: 450, Proyeksi: 450, LowerBound: 430, UpperBound: 470 },
                      { bulan: 'Agustus (F)', Historis: null, Proyeksi: 495, LowerBound: 460, UpperBound: 530 },
                      { bulan: 'September (F)', Historis: null, Proyeksi: 520, LowerBound: 480, UpperBound: 560 },
                      { bulan: 'Oktober (F)', Historis: null, Proyeksi: 565, LowerBound: 510, UpperBound: 620 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="bulan" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <Tooltip />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Line type="monotone" dataKey="Historis" stroke="#2563eb" strokeWidth={3} activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="Proyeksi" stroke="#f59e0b" strokeWidth={3} strokeDasharray="5 5" />
                      <Line type="monotone" dataKey="LowerBound" stroke="#94a3b8" strokeWidth={1} strokeDasharray="2 2" legendType="none" />
                      <Line type="monotone" dataKey="UpperBound" stroke="#94a3b8" strokeWidth={1} strokeDasharray="2 2" legendType="none" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Confidence Rates & Export panel */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
                <div className="border-b pb-3 border-slate-100">
                  <h3 className="text-sm font-bold text-slate-700">Laju Keandalan Model Prediktif</h3>
                </div>

                <div className="space-y-4 font-mono text-xs">
                  {forecasts && forecasts.map((fore: any) => (
                    <div key={fore.id} className="p-3 bg-slate-50 border border-slate-200/50 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{fore.category} Forecast</span>
                        <span className="text-amber-600 font-bold">{fore.confidence_rate}% Confidence</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Hari Ini: {fore.current_value.toLocaleString()}</span>
                        <span>F: {Math.floor(fore.forecasted_value).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleExport('EXCEL')}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Ekspor Laporan Forecast (Excel)</span>
                </button>
              </div>

            </div>

          </div>
        )}

        {/* 6. PREDICTIVE CLASSIFIER MODEL VIEW */}
        {activeSubTab === 'prediction' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* At-risk student classifier */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
              <div className="border-b pb-3 border-slate-100 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Brain className="h-4.5 w-4.5 text-blue-500" />
                  <span>Model Deteksi Dini Siswa Berisiko Putus Sekolah (Dropout Risk)</span>
                </h3>
                <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2.5 py-0.5 rounded border border-red-200 animate-pulse">
                  ALERTS ON
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[9px] tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="p-3">Nama Siswa</th>
                      <th className="p-3">Rata IPK</th>
                      <th className="p-3">Presensi Rate</th>
                      <th className="p-3">Late SPP Freq</th>
                      <th className="p-3">Skor Risiko</th>
                      <th className="p-3">Status Deteksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3 font-semibold text-slate-800">Ahmad Fauzi</td>
                      <td className="p-3">2.1 GPA</td>
                      <td className="p-3 text-amber-600 font-bold">74.5%</td>
                      <td className="p-3 text-red-600 font-bold">3 kali lewati tempo</td>
                      <td className="p-3 text-red-600 font-extrabold">87.5% Risk</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 border border-red-200 rounded text-[9px] font-bold">
                          HIGH_RISK_DROPOUT
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3 font-semibold text-slate-800">Zulkifli Hasan</td>
                      <td className="p-3 font-bold text-slate-600">3.0 GPA</td>
                      <td className="p-3">92.5%</td>
                      <td className="p-3 text-slate-500">0 kali</td>
                      <td className="p-3 text-blue-600 font-bold">15.4% Risk</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[9px]">
                          STABLE
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3 font-semibold text-slate-800">Siti Aminah</td>
                      <td className="p-3 font-bold text-slate-600">3.8 GPA</td>
                      <td className="p-3 text-emerald-600 font-bold">99.1%</td>
                      <td className="p-3 text-slate-500">0 kali</td>
                      <td className="p-3 text-emerald-600 font-bold">2.1% Risk</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-[9px] font-bold">
                          EXCELLENT
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Classification explanation drawer */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
              <div className="border-b pb-3 border-slate-100">
                <h3 className="text-sm font-bold text-slate-700">Variabel Penilai AI Classifier</h3>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-3 text-xs">
                <div className="flex items-center gap-1.5 text-blue-800 font-bold">
                  <Info className="h-4.5 w-4.5 shrink-0 text-blue-600" />
                  <span>Kalkulasi Input Variabel</span>
                </div>
                <p className="text-slate-650 leading-relaxed text-[11px]">
                  Model klasifikasi mengevaluasi korelasi silang antara nilai harian LMS, persentase keterlambatan pembayaran SPP di modul Keuangan, dan status presensi di modul Akademik untuk melahirkan nilai probabilitas kelangsungan studi yang presisi.
                </p>
                <div className="border-t border-blue-200/50 pt-3 space-y-2 text-[10px] text-blue-700 font-mono">
                  <div className="flex justify-between">
                    <span>GPA Weight (IPK):</span>
                    <span className="font-bold">40%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Attendance Weight (Presensi):</span>
                    <span className="font-bold">35%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delinquency Weight (Keuangan):</span>
                    <span className="font-bold">25%</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* 7. KPI SLIDERS & BENCHMARK VIEW */}
        {activeSubTab === 'kpis' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* KPI sliders with thresholds */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-5">
              <div className="border-b pb-3 border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Sliders className="h-4.5 w-4.5 text-blue-500" />
                  <span>Atur Ambang Target Kinerja Utama (Sliders & Thresholds)</span>
                </h3>
              </div>

              <div className="space-y-6">
                {[
                  { key: 'revenue', label: 'Batas Koleksi Kas SPP mingguan', unit: '%', min: 80, max: 100 },
                  { key: 'attendance', label: 'Kehadiran Minimum Siswa', unit: '%', min: 90, max: 100 },
                  { key: 'student', label: 'Rata-rata Nilai Kelulusan Akademis', unit: 'Pts', min: 75, max: 95 },
                  { key: 'dropout', label: 'Maksimum Laju Dropout (Alarm)', unit: '%', min: 0.5, max: 5 },
                ].map((slider) => (
                  <div key={slider.key} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{slider.label}</span>
                      <span className="font-mono font-bold text-blue-600">Target: {kpiThresholds[slider.key]}{slider.unit}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] text-slate-400 font-mono font-bold">{slider.min}{slider.unit}</span>
                      <input
                        type="range"
                        min={slider.min}
                        max={slider.max}
                        step={slider.key === 'dropout' ? 0.1 : 1}
                        value={kpiThresholds[slider.key]}
                        onChange={(e) => setKpiThresholds({ ...kpiThresholds, [slider.key]: parseFloat(e.target.value) })}
                        className="flex-1 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <span className="text-[10px] text-slate-400 font-mono font-bold">{slider.max}{slider.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance grading & KPI reports */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
              <div className="border-b pb-3 border-slate-100">
                <h3 className="text-sm font-bold text-slate-700">Analisis Deviasi Target KPI</h3>
              </div>

              <div className="space-y-4 font-mono text-xs">
                {[
                  { name: 'SPP Collection Rate', status: 'MATCH', deviasi: '+0.2%' },
                  { name: 'Siswa Attendance Minimum', status: 'MATCH', deviasi: '+0.8%' },
                  { name: 'Capaian Akademis Kelas X', status: 'WARNING', deviasi: '-2.5%' },
                  { name: 'Safety Dropout Level', status: 'MATCH', deviasi: '-0.2%' },
                ].map((kpi, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200/50 rounded-xl flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-700 block text-xs">{kpi.name}</span>
                      <span className="text-[9px] text-slate-400 font-mono">Deviasi Target: {kpi.deviasi}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      kpi.status === 'MATCH' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}>
                      {kpi.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* 8. METADATA CATALOG VIEW */}
        {activeSubTab === 'catalog' && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
            <div className="border-b pb-3 border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-700">Katalog Kamus Data & Metadata Catalog</h3>
                <p className="text-xs text-slate-400">Deskripsi teknis jenis kolom, tipe data SQL, logical keys, & kepemilikan bisnis.</p>
              </div>

              <div className="relative shrink-0 w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Cari kolom, tabel, tipe..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 p-2 pl-8 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[9px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="p-3">Nama Tabel</th>
                    <th className="p-3">Nama Kolom</th>
                    <th className="p-3">Tipe Data SQL</th>
                    <th className="p-3">Fungsi / Deskripsi Bisnis</th>
                    <th className="p-3">Kategori modul</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px] text-slate-700">
                  {metadataCatalog && metadataCatalog
                    .filter((col: any) => col.table_name.toLowerCase().includes(searchQuery.toLowerCase()) || col.column_name.toLowerCase().includes(searchQuery.toLowerCase()) || col.description.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((col: any) => (
                      <tr key={col.id} className="hover:bg-slate-50/50">
                        <td className="p-3 text-blue-650 font-bold">{col.table_name}</td>
                        <td className="p-3 font-semibold text-slate-800">{col.column_name}</td>
                        <td className="p-3 text-indigo-600">{col.data_type}</td>
                        <td className="p-3 text-slate-500 font-sans">{col.description}</td>
                        <td className="p-3">
                          <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded text-[9px]">
                            {col.category}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 9. DATA QUALITY CONTROL VIEW */}
        {activeSubTab === 'quality' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Reusable Data Quality check cards */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
                <div className="border-b pb-3 border-slate-100">
                  <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                    <ShieldAlert className="h-4.5 w-4.5 text-blue-500" />
                    <span>Kartu Pemeriksaan Validitas Data (Reusable Data Quality Card)</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {qualityChecks && qualityChecks.map((chk: any) => {
                    const isPassed = chk.status === 'PASSED';
                    return (
                      <div key={chk.id} className="p-4 bg-slate-50 border rounded-2xl space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 truncate">{chk.rule_name}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            isPassed ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                          }`}>
                            {chk.status}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 line-clamp-2 min-h-[2rem] font-sans">
                          {chk.message}
                        </p>

                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-mono">
                          <span className="text-slate-400">Tabel: {chk.entity}</span>
                          <span className="text-slate-450">Tingkat: {chk.severity}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quality audits trail */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
              <div className="border-b pb-3 border-slate-100">
                <h3 className="text-sm font-bold text-slate-700">Audit Penjaga Integritas Data</h3>
              </div>

              <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center gap-1 text-amber-800 font-bold">
                  <AlertTriangle className="h-4.5 w-4.5 text-amber-600" />
                  <span>Aturan Keutuhan Data</span>
                </div>
                <p className="text-slate-650 leading-relaxed text-[11px]">
                  Sistem DW menggunakan **Primary & Foreign Key Integrity Constraints** yang ketat pada tabel `dw_fact_academic` dan `dw_fact_finance` guna mematikan nihilnya record yatim-piatu (orphaned records) yang tidak memiliki keterkaitan dengan tabel dimensi utama.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* 10. AI DECISION RECOMMENDATION VIEW */}
        {activeSubTab === 'ai' && (
          <div className="space-y-6">
            
            {/* Recommendation model trigger */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="h-4.5 w-4.5 text-blue-500" />
                  <span>AI Decision Support System (Google Gemini Adapter)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Adaptor AI membaca laju metrics pada Data Mart guna melahirkan rekomendasi taktis serta dampak estimasi keberhasilan program sekolah.
                </p>
              </div>

              <button 
                onClick={() => alert('Gemini menganalisa Financial & Academic Mart terkini... Laporan rekomendasi berhasil di-refresh!')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>Analisa Mart Baru (Gemini)</span>
              </button>
            </div>

            {/* Reusable AI Recommendation Card grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations && recommendations.map((rec: any) => {
                const isHigh = rec.impact_level === 'HIGH';
                return (
                  <div key={rec.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-all">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 font-mono px-2 py-0.5 rounded font-bold uppercase">
                          Modul: {rec.module}
                        </span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          isHigh ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}>
                          Dampak {rec.impact_level}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-800 leading-snug">{rec.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-sans">{rec.recommendation}</p>
                    </div>

                    <div className="pt-4 border-t border-slate-100/60 mt-4 flex items-center justify-between text-xs font-mono font-bold">
                      <span className="text-slate-400">Status: {rec.status}</span>
                      <button 
                        onClick={() => alert(`Rencana tindakan AI untuk "${rec.title}" ditandai untuk dieksekusi di sprint depan.`)}
                        className="text-blue-600 hover:text-blue-800 cursor-pointer text-xs"
                      >
                        Sambut AI Action
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

      </div>

      {/* Reusable Dashboard Share Builder */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
        <div className="border-b pb-3 border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
            <Share2 className="h-4.5 w-4.5 text-blue-500" />
            <span>Bagikan Dashboard Eksekutif (Reusable Dashboard Share Card)</span>
          </h3>
          <span className="text-[10px] text-slate-400">Generasikan tautan audit publik</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Share Builder form */}
          <div className="lg:col-span-1 p-4 bg-slate-50 rounded-2xl border border-slate-200/50 space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Builder Tautan Berbagi</h4>
            
            <form onSubmit={handleShareSubmit(onShareSubmit)} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] text-slate-500 font-bold mb-1">Judul Lap. Yayasan</label>
                <input
                  type="text"
                  placeholder="e.g. Audit Keuangan TA Ganjil"
                  {...regShare('title', { required: 'Judul laporan wajib diisi' })}
                  className="w-full bg-white border border-slate-200 p-2 rounded-lg focus:outline-none focus:border-blue-500"
                />
                {shareErrors.title && <span className="text-[10px] text-red-500 font-medium">{shareErrors.title.message}</span>}
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 font-bold mb-1">Hak Akses Publik</label>
                <select
                  {...regShare('accessLevel')}
                  className="w-full bg-white border border-slate-200 p-2 rounded-lg focus:outline-none focus:border-blue-500 text-xs"
                >
                  <option value="READ_ONLY">Hanya Baca (Read Only)</option>
                  <option value="EDITABLE">Dapat Diedit (BPM Workflow Approval)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 font-bold mb-1">Masa Kedaluwarsa Link</label>
                <input
                  type="date"
                  {...regShare('expirationDate')}
                  className="w-full bg-white border border-slate-200 p-2 rounded-lg focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Generasikan Link</span>
              </button>
            </form>
          </div>

          {/* Active Shares view list */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Tautan Berbagi yang Sedang Aktif</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dashboardShares && dashboardShares.map((sh: any) => (
                <div key={sh.id} className="p-3.5 bg-white border border-slate-200/80 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 truncate block max-w-[70%]">{sh.title}</span>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-bold font-mono">
                      {sh.access_level}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 font-mono">
                    Token: <span className="text-blue-600 font-bold">{sh.share_token}</span> | Diakses: {sh.views_count} kali
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-450">
                    <span>Exp: {new Date(sh.expiration_date).toLocaleDateString()}</span>
                    <button 
                      onClick={() => alert(`Copied public link: https://schoolerpsaas.com/share/${sh.share_token}`)}
                      className="text-indigo-600 font-bold hover:text-indigo-800 flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Copy URL</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
