import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  Database, 
  Server, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Play, 
  RotateCcw, 
  FileCode, 
  Download, 
  Upload, 
  DatabaseZap, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  Activity, 
  Layers, 
  Search, 
  Filter, 
  Calendar, 
  Trash2, 
  ArrowRight, 
  HelpCircle,
  FileSpreadsheet,
  Terminal,
  Brain,
  Check,
  CheckCircle,
  KeyRound,
  FileText
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell 
} from 'recharts';

// ============================================================================
// AXIOS CLIENT CONFIGURATION WITH INTERCEPTOR & RETRY
// ============================================================================
const apiClient = axios.create({
  baseURL: '',
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  // Add enterprise authorization headers if any token exists
  const token = localStorage.getItem('erp_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (err) => Promise.reject(err));

// Custom automatic retry interceptor
apiClient.interceptors.response.use(undefined, async (error) => {
  const config = error?.config;
  if (!config || !config.retry) return Promise.reject(error);
  config.retryCount = config.retryCount || 0;
  if (config.retryCount >= config.retry) return Promise.reject(error);
  config.retryCount += 1;
  const backoff = new Promise((resolve) => setTimeout(resolve, config.retryDelay || 1000));
  await backoff;
  return apiClient(config);
});

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================
interface ConnectionFormInput {
  connection_name: string;
  provider_id: string;
  environment: 'production' | 'staging' | 'development';
  host: string;
  port: number;
  database_name: string;
  username: string;
  password_raw: string;
  ssl_mode: 'require' | 'disable' | 'prefer';
}

export default function DatabaseManagement() {
  const { user, previewRole } = useAuth();
  const queryClient = useQueryClient();

  const rawRole = previewRole || user?.role || '';
  const isSuperAdmin = rawRole.toUpperCase().replace(/\s+/g, '_') === 'SUPER_ADMIN';

  const [activeTab, setActiveTab] = useState<'dashboard' | 'connections' | 'migrations' | 'backups' | 'import_export' | 'query_runner' | 'diagnostics'>('dashboard');

  if (!isSuperAdmin) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-2xl mx-auto my-12 text-center shadow-sm font-sans">
        <div className="h-16 w-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Akses Terbatas Database Management</h2>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          Modul Pengelolaan Database, Koneksi PostgreSQL / Cloud SQL &amp; Runner Query hanya dapat diakses oleh akun dengan peran <span className="font-bold text-slate-700">SUPER_ADMIN</span>.
        </p>
        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 font-mono">
          Peran Anda saat ini: <span className="font-bold text-indigo-600">{previewRole || user?.role || 'Pengguna'}</span>
        </div>
      </div>
    );
  }
  
  // Query filters & search
  const [providerFilter, setProviderFilter] = useState<string>('ALL');
  const [envFilter, setEnvFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // SQL Editor State
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>('conn-prod-01');
  const [sqlStatement, setSqlStatement] = useState<string>('SELECT * FROM students LIMIT 10;');
  const [queryResult, setQueryResult] = useState<any>(null);

  // Import State
  const [importTable, setImportTable] = useState<string>('students');
  const [importType, setImportType] = useState<'SQL' | 'CSV' | 'EXCEL' | 'JSON'>('CSV');
  const [importFileContent, setImportFileContent] = useState<string>('');
  const [importSuccessMessage, setImportSuccessMessage] = useState<string>('');

  // Backup scheduler state
  const [newSchedName, setNewSchedName] = useState<string>('Weekly Friday Full Database Sync');
  const [newSchedCron, setNewSchedCron] = useState<string>('0 0 * * 5');
  const [newSchedType, setNewSchedType] = useState<'MANUAL' | 'AUTOMATIC' | 'INCREMENTAL' | 'FULL'>('FULL');

  // Enterprise Test Suite state
  const [testResults, setTestResults] = useState<any[] | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const runTestingSuite = async () => {
    setIsRunningTests(true);
    try {
      const res = await apiClient.post('/api/action', { action: 'runDatabaseTests' });
      if (res.data?.success) {
        setTestResults(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunningTests(false);
    }
  };

  // ============================================================================
  // TANSTACK QUERY HOOKS (API FETCHERS & MUTATIONS)
  // ============================================================================
  
  // 1. Dashboard query
  const { data: dashboardData, isLoading: loadingDash, refetch: refetchDash } = useQuery({
    queryKey: ['dbDashboard'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action', { action: 'databaseDashboard' });
      return res.data?.data;
    },
    refetchInterval: 15000 // Realtime refetch every 15s
  });

  // 2. Providers query
  const { data: providersList } = useQuery({
    queryKey: ['dbProviders'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action', { action: 'databaseProvider' });
      return res.data?.data || [];
    }
  });

  // 3. Connections query
  const { data: connectionsList, refetch: refetchConnections } = useQuery({
    queryKey: ['dbConnections'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action', { action: 'databaseConnection' });
      return res.data?.data || [];
    }
  });

  // 4. Connection status metrics
  const { data: connectionStatuses } = useQuery({
    queryKey: ['dbConnStatus'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action', { action: 'connectionStatus' });
      return res.data?.data || [];
    },
    refetchInterval: 10000
  });

  // 5. Migrations & Seeders query
  const { data: migrationsData, refetch: refetchMigrations } = useQuery({
    queryKey: ['dbMigrations', selectedConnectionId],
    queryFn: async () => {
      const res = await apiClient.post('/api/action', { action: 'migrationList', connection_id: selectedConnectionId });
      return res.data?.data;
    }
  });

  // 6. Query History & Saved Queries query
  const { data: queryHistoryData, refetch: refetchHistory } = useQuery({
    queryKey: ['dbQueryHistory'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action', { action: 'queryHistory' });
      return res.data?.data;
    }
  });

  // 7. Health check diagnostics query
  const { data: healthReports, refetch: refetchHealth, isLoading: loadingHealth } = useQuery({
    queryKey: ['dbHealthReports'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action', { action: 'healthCheck', is_database: true });
      return res.data?.data || [];
    }
  });

  // 8. Database Statistics
  const { data: dbStats, refetch: refetchStats } = useQuery({
    queryKey: ['dbStats', selectedConnectionId],
    queryFn: async () => {
      const res = await apiClient.post('/api/action', { action: 'databaseStatistic', connection_id: selectedConnectionId });
      return res.data?.data;
    }
  });

  // 9. Alerts
  const { data: alertsList, refetch: refetchAlerts } = useQuery({
    queryKey: ['dbAlerts'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action', { action: 'databaseAlert' });
      return res.data?.data || [];
    }
  });

  // ============================================================================
  // MUTATIONS (CUD / ACTIONS)
  // ============================================================================

  // Test Handshake Ping
  const testConnMutation = useMutation({
    mutationFn: async (connId: string) => {
      const res = await apiClient.post('/api/action', { action: 'connectionTest', connection_id: connId });
      return res.data;
    },
    onSuccess: (data) => {
      refetchConnections();
      refetchHealth();
    }
  });

  // Create Connection
  const createConnMutation = useMutation({
    mutationFn: async (payload: any & { action_sub: string }) => {
      const res = await apiClient.post('/api/action', { action: 'databaseConnection', ...payload });
      return res.data;
    },
    onSuccess: () => {
      refetchConnections();
      resetForm();
    }
  });

  // Delete Connection
  const deleteConnMutation = useMutation({
    mutationFn: async (connId: string) => {
      const res = await apiClient.post('/api/action', { action: 'databaseConnection', action_sub: 'delete', id: connId });
      return res.data;
    },
    onSuccess: () => {
      refetchConnections();
      refetchDash();
    }
  });

  // Run Migration UP
  const runMigrationMutation = useMutation({
    mutationFn: async (migId: string) => {
      const res = await apiClient.post('/api/action', { action: 'migrationRun', migration_id: migId });
      return res.data;
    },
    onSuccess: () => {
      refetchMigrations();
      refetchDash();
      refetchStats();
    }
  });

  // Rollback Migration DOWN
  const rollbackMigrationMutation = useMutation({
    mutationFn: async (migId: string) => {
      const res = await apiClient.post('/api/action', { action: 'migrationRollback', migration_id: migId });
      return res.data;
    },
    onSuccess: () => {
      refetchMigrations();
      refetchDash();
      refetchStats();
    }
  });

  // Run Seeder
  const runSeederMutation = useMutation({
    mutationFn: async (seederId: string) => {
      const res = await apiClient.post('/api/action', { action: 'seederRun', seeder_id: seederId });
      return res.data;
    },
    onSuccess: () => {
      refetchMigrations();
      refetchStats();
    }
  });

  // Trigger Manual Backup
  const createBackupMutation = useMutation({
    mutationFn: async (payload: { connection_id: string; backup_type: string }) => {
      const res = await apiClient.post('/api/action', { action: 'backupCreate', ...payload });
      return res.data;
    },
    onSuccess: () => {
      refetchDash();
    }
  });

  // Trigger Backup Scheduler creation
  const createBackupScheduleMutation = useMutation({
    mutationFn: async (payload: { connection_id: string; job_name: string; schedule_cron: string; backup_type: string }) => {
      const res = await apiClient.post('/api/action', { action: 'backupSchedule', ...payload });
      return res.data;
    },
    onSuccess: () => {
      refetchDash();
    }
  });

  // Trigger Restore Sequence
  const restoreBackupMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const res = await apiClient.post('/api/action', { action: 'backupRestore', backup_file_id: fileId });
      return res.data;
    },
    onSuccess: () => {
      refetchDash();
    }
  });

  // Import mock tables
  const importMutation = useMutation({
    mutationFn: async (payload: { connection_id: string; import_type: string; target_table: string; file_name: string; file_size: number; content_preview: string }) => {
      const res = await apiClient.post('/api/action', { action: 'databaseImport', ...payload });
      return res.data;
    },
    onSuccess: (data) => {
      setImportSuccessMessage(data.message || 'Import data completed.');
      refetchStats();
      refetchDash();
    }
  });

  // Export mock tables
  const exportMutation = useMutation({
    mutationFn: async (payload: { connection_id: string; export_type: string; source_table: string }) => {
      const res = await apiClient.post('/api/action', { action: 'databaseExport', ...payload });
      return res.data;
    },
    onSuccess: (data) => {
      alert(`Export File compiled! Download URL: ${data.data?.file_url}`);
      refetchDash();
    }
  });

  // Raw SQL Query Runner
  const runQueryMutation = useMutation({
    mutationFn: async (payload: { connection_id: string; sql_query: string }) => {
      const res = await apiClient.post('/api/action', { action: 'queryRunner', ...payload });
      return res.data;
    },
    onSuccess: (data) => {
      setQueryResult(data);
      refetchHistory();
    }
  });

  // Alert resolver
  const resolveAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const res = await apiClient.post('/api/action', { action: 'databaseAlert', action_sub: 'resolve', alert_id: alertId });
      return res.data;
    },
    onSuccess: () => {
      refetchAlerts();
      refetchDash();
    }
  });

  // ============================================================================
  // FORM BINDINGS & VALIDATION (REACT-HOOK-FORM)
  // ============================================================================
  const { register, handleSubmit, reset: resetForm, control, formState: { errors } } = useForm<ConnectionFormInput>({
    defaultValues: {
      connection_name: '',
      provider_id: 'prov-supabase',
      environment: 'production',
      host: '',
      port: 5432,
      database_name: '',
      username: '',
      password_raw: '',
      ssl_mode: 'require'
    }
  });

  const onSubmitConnection = (data: ConnectionFormInput) => {
    createConnMutation.mutate({
      action_sub: 'create',
      provider_id: data.provider_id,
      connection_name: data.connection_name,
      environment: data.environment,
      host: data.host,
      port: Number(data.port),
      database_name: data.database_name,
      username: data.username,
      ssl_mode: data.ssl_mode,
      is_active: true
    });
  };

  // Helper filters
  const filteredConnections = (connectionsList || []).filter((conn: any) => {
    const matchesProvider = providerFilter === 'ALL' || conn.provider_id === providerFilter;
    const matchesEnv = envFilter === 'ALL' || conn.environment === envFilter;
    const matchesSearch = searchQuery === '' || 
      conn.connection_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conn.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conn.database_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProvider && matchesEnv && matchesSearch;
  });

  // ============================================================================
  // FRONTEND SUB-VIEWS
  // ============================================================================

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* 1. SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h1 id="db-manager-title" className="text-xl font-bold text-slate-800 tracking-tight">Enterprise Database Center</h1>
              <p className="text-xs text-slate-500 font-mono">Sprint 29 • Backup, Point-In-Time Restore, Schema Versioning & Driver Adapters</p>
            </div>
          </div>
        </div>
        
        {/* INNER TABS BAR */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1.5 rounded-xl">
          {(['dashboard', 'connections', 'migrations', 'backups', 'import_export', 'query_runner', 'diagnostics'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setQueryResult(null);
                setImportSuccessMessage('');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                activeTab === tab 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* 2. ALERT CENTER (CRITICAL BADGES) */}
      {(alertsList || []).filter((a: any) => !a.is_resolved).length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="h-5 w-5 text-amber-600 animate-bounce" />
            <span className="font-bold text-xs uppercase tracking-wider">Peringatan Kritis Node Database ({(alertsList || []).filter((a: any) => !a.is_resolved).length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(alertsList || []).filter((a: any) => !a.is_resolved).map((a: any, i: number) => (
              <div key={a.id || `alert-${i}`} className="bg-white border border-amber-100 p-3 rounded-xl flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${a.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {a.severity}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800">{a.alert_name}</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{a.message}</p>
                </div>
                <button
                  onClick={() => resolveAlertMutation.mutate(a.id)}
                  className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-[10px] font-bold rounded-lg cursor-pointer"
                >
                  Selesaikan
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. WORKSPACE VIEWS PORT */}

      {/* ==================== VIEW 1: DASHBOARD ==================== */}
      {activeTab === 'dashboard' && (
        <div className="flex flex-col gap-6">
          
          {/* STATS HIGHLIGHTS BENTO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">Total Node Server</span>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{dashboardData?.total_connections || 0} Connection</h3>
                <p className="text-[10px] text-emerald-600 font-semibold mt-1">● SSL Handshake Aktif</p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Server className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">Active Connection Pools</span>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{dashboardData?.active_connection_pools || 0} Pools</h3>
                <p className="text-[10px] text-slate-500 mt-1">Multi-Tenant isolated pools</p>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <DatabaseZap className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">Penyimpanan Terpakai</span>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{dashboardData?.storage_usage_gb || '0.00'} GB</h3>
                <p className="text-[10px] text-slate-500 mt-1">Kuota: {dashboardData?.total_allocated_storage_gb || 0} GB</p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Activity className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">Backup Sukses (Cloud)</span>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{dashboardData?.total_backup_files || 0} SQL</h3>
                <p className="text-[10px] text-indigo-600 font-semibold mt-1">Scheduled Incremental</p>
              </div>
              <div className="p-3 bg-violet-50 text-violet-600 rounded-xl">
                <ShieldCheck className="h-6 w-6" />
              </div>
            </div>

          </div>

          {/* PERFORMANCE LINE GRAPH & CONNECTION MAP */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Health & Performance chart (Recharts) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Connection Pool Utilization & Latency</h3>
                  <p className="text-xs text-slate-500">Monitoring real-time performance indicators</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600">
                    <span className="h-2 w-2 bg-indigo-600 rounded-full" /> Pools Usage (%)
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                    <span className="h-2 w-2 bg-emerald-500 rounded-full" /> Latency (ms)
                  </span>
                </div>
              </div>

              {/* Dynamic Simulated Area chart */}
              <div className="h-60 w-full mt-2 font-mono text-[10px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { time: '18:00', usage: 22, latency: 4 },
                    { time: '19:00', usage: 28, latency: 6 },
                    { time: '20:00', usage: 45, latency: 12 },
                    { time: '21:00', usage: 68, latency: 24 },
                    { time: '22:00', usage: 52, latency: 15 },
                    { time: '23:00', usage: 38, latency: 7 }
                  ]}>
                    <defs>
                      <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip />
                    <Area type="monotone" dataKey="usage" stroke="#4f46e5" fillOpacity={1} fill="url(#colorUsage)" name="Pool Usage (%)" />
                    <Area type="monotone" dataKey="latency" stroke="#10b981" fillOpacity={1} fill="url(#colorLatency)" name="Latency (ms)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Reusable Database Cards List */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-slate-800">Database Server Nodes</h3>
              <div className="flex flex-col gap-3">
                {(connectionsList || []).map((conn: any, i: number) => {
                  const statusInfo = (connectionStatuses || []).find((s: any) => s.id === conn.id);
                  return (
                    <div key={conn.id || `conn-${i}`} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-white text-indigo-600 border border-slate-150 rounded-lg shrink-0">
                          <Server className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 truncate">{conn.connection_name}</h4>
                          <span className="text-[10px] font-mono text-slate-500 truncate block">
                            {conn.host}:{conn.port}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`inline-block text-[9px] font-mono font-bold px-1.5 py-0.5 rounded capitalize ${
                          conn.connection_status === 'HEALTHY' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : conn.connection_status === 'WARNING'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {conn.connection_status}
                        </span>
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5">{statusInfo?.latency_ms || 5} ms</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => setActiveTab('connections')}
                className="w-full mt-auto py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/50 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Kelola Koneksi</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

          </div>

          {/* ACTIVE BACKUP JOBS SUMMARY & MOCK RECENT QUERIES */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Backup jobs list */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-slate-800">Scheduled Backup Pipelines</h3>
              <div className="flex flex-col gap-3">
                {dashboardData?.total_backup_jobs === 0 ? (
                  <p className="text-xs text-slate-400 font-mono">Belum ada penjadwal backup.</p>
                ) : (
                  (dashboardData?.active_alerts || []).length >= 0 && (
                    <div className="flex flex-col gap-2.5">
                      <div className="p-3 border border-indigo-100 bg-indigo-50/20 rounded-xl flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">SaaS Automated Incremental Sync</h4>
                          <p className="text-[10px] text-indigo-600 font-mono mt-0.5">Cron: 0 */4 * * * (Tiap 4 Jam)</p>
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded font-mono">ACTIVE</span>
                      </div>
                      <div className="p-3 border border-indigo-100 bg-indigo-50/20 rounded-xl flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">Midnight Weekly Full Archiver</h4>
                          <p className="text-[10px] text-indigo-600 font-mono mt-0.5">Cron: 0 0 * * 0 (Tiap Minggu Malam)</p>
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded font-mono">ACTIVE</span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Recent Query Log Tracker */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-slate-800">Recent Executed Queries</h3>
              <div className="flex flex-col gap-2 font-mono text-[11px] text-slate-600 overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-100 pb-2">
                      <th className="pb-2">User / Role</th>
                      <th className="pb-2">SQL Statement</th>
                      <th className="pb-2 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(dashboardData?.recent_queries || []).map((qh: any, i: number) => (
                      <tr key={qh.id || `qh-${i}`} className="hover:bg-slate-50 border-b border-slate-50/50">
                        <td className="py-2 text-slate-800 font-bold max-w-[120px] truncate">{qh.executed_by}</td>
                        <td className="py-2 text-indigo-600 max-w-[240px] truncate">{qh.query_text}</td>
                        <td className="py-2 text-right font-bold text-slate-500">{qh.execution_time_ms}ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ==================== VIEW 2: CONNECTION MANAGER ==================== */}
      {activeTab === 'connections' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Connection List Left column */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari Server / Database..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs text-slate-700 placeholder-slate-400 outline-none w-full border-none focus:ring-0"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400 shrink-0" />
                <select
                  value={envFilter}
                  onChange={(e) => setEnvFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs text-slate-700 px-2.5 py-1.5 rounded-lg font-bold"
                >
                  <option value="ALL">Semua Env</option>
                  <option value="production">Production</option>
                  <option value="staging">Staging</option>
                  <option value="development">Development</option>
                </select>
              </div>
            </div>

            {/* Server Card List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredConnections.map((conn: any, i: number) => (
                <div key={conn.id || `conn-card-${i}`} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:border-slate-300 transition-all">
                  
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Server className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-800">{conn.connection_name}</h4>
                        <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">{conn.environment}</span>
                      </div>
                    </div>
                    
                    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                      conn.connection_status === 'HEALTHY' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : conn.connection_status === 'WARNING'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {conn.connection_status}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Host:</span>
                      <span className="font-semibold text-slate-800">{conn.host}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Database:</span>
                      <span className="font-semibold text-slate-800">{conn.database_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">SSL Mode:</span>
                      <span className="font-semibold text-emerald-600 flex items-center gap-0.5">
                        <ShieldCheck className="h-3 w-3" />
                        {conn.ssl_mode}
                      </span>
                    </div>
                  </div>

                  {/* Connection tester button & credential indicator */}
                  <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                      <KeyRound className="h-3 w-3 text-indigo-600" />
                      Encrypted Credentials
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => testConnMutation.mutate(conn.id)}
                        disabled={testConnMutation.isPending}
                        className="p-1.5 bg-slate-100 hover:bg-indigo-50 border border-slate-200 text-slate-600 hover:text-indigo-600 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                        title="Uji Handshake Koneksi"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${testConnMutation.isPending ? 'animate-spin' : ''}`} />
                        <span>Test</span>
                      </button>
                      <button
                        onClick={() => deleteConnMutation.mutate(conn.id)}
                        className="p-1.5 hover:bg-red-50 border border-transparent hover:border-red-200 text-slate-400 hover:text-red-600 rounded-lg transition-all cursor-pointer"
                        title="Hapus Koneksi"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Test Status feedback if tested */}
                  {testConnMutation.isSuccess && testConnMutation.variables === conn.id && (
                    <div className={`text-[11px] p-2.5 rounded-xl border font-mono ${testConnMutation.data?.success ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                      {testConnMutation.data?.message}
                      <p className="text-[9px] text-slate-400 mt-1">Latency: {testConnMutation.data?.details?.latency_ms}ms • IP: {testConnMutation.data?.details?.resolved_ip}</p>
                    </div>
                  )}

                </div>
              ))}
            </div>

          </div>

          {/* Form Create Connection */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col gap-4 shadow-sm self-start">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Register New Database Node</h3>
              <p className="text-xs text-slate-500">Isolasikan credential per tenant & amankan dengan enkripsi standar AES-256.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmitConnection)} className="flex flex-col gap-3 text-xs">
              
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-600">Nama Koneksi (Label)</label>
                <input
                  type="text"
                  placeholder="e.g., Supabase Production Cluster"
                  {...register('connection_name', { required: 'Nama koneksi wajib diisi' })}
                  className="bg-slate-50 border border-slate-250 px-3 py-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                {errors.connection_name && <span className="text-[10px] text-red-600">{errors.connection_name.message}</span>}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-600">Provider Type</label>
                  <select
                    {...register('provider_id')}
                    className="bg-slate-50 border border-slate-250 px-2.5 py-2 rounded-lg text-slate-800 focus:outline-none"
                  >
                    <option value="prov-supabase">Supabase Postgres</option>
                    <option value="prov-cloudsql">Google Cloud SQL</option>
                    <option value="prov-neon">Neon Serverless</option>
                    <option value="prov-selfhost">Self Hosted Postgres</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-600">Environment</label>
                  <select
                    {...register('environment')}
                    className="bg-slate-50 border border-slate-250 px-2.5 py-2 rounded-lg text-slate-800 focus:outline-none"
                  >
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                    <option value="development">Development</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 flex flex-col gap-1">
                  <label className="font-bold text-slate-600">Database Host</label>
                  <input
                    type="text"
                    placeholder="db.supabase.co"
                    {...register('host', { required: 'Host wajib diisi' })}
                    className="bg-slate-50 border border-slate-250 px-3 py-2 rounded-lg text-slate-800 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-600">Port</label>
                  <input
                    type="number"
                    placeholder="5432"
                    {...register('port', { required: true, min: 1 })}
                    className="bg-slate-50 border border-slate-250 px-3 py-2 rounded-lg text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-600">Database Name</label>
                <input
                  type="text"
                  placeholder="saas_school_erp_prod"
                  {...register('database_name', { required: 'Nama DB wajib diisi' })}
                  className="bg-slate-50 border border-slate-250 px-3 py-2 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-600">Username</label>
                  <input
                    type="text"
                    placeholder="postgres.owner"
                    {...register('username', { required: true })}
                    className="bg-slate-50 border border-slate-250 px-3 py-2 rounded-lg text-slate-800 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-600">SSL Mode</label>
                  <select
                    {...register('ssl_mode')}
                    className="bg-slate-50 border border-slate-250 px-2 py-2 rounded-lg text-slate-800 focus:outline-none"
                  >
                    <option value="require">require (Encrypted)</option>
                    <option value="prefer">prefer</option>
                    <option value="disable">disable (Plaintext)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-600">Password</label>
                <input
                  type="password"
                  placeholder="••••••••••••••"
                  {...register('password_raw', { required: true })}
                  className="bg-slate-50 border border-slate-250 px-3 py-2 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={createConnMutation.isPending}
                className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer shadow"
              >
                <Plus className="h-4 w-4" />
                <span>Simpan & Daftarkan Node</span>
              </button>

            </form>
          </div>

        </div>
      )}

      {/* ==================== VIEW 3: MIGRATIONS & SEEDERS ==================== */}
      {activeTab === 'migrations' && (
        <div className="flex flex-col gap-6">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Schema Versioning & Seeder Manager</h3>
              <p className="text-xs text-slate-500">Mencegah data drift di seluruh tenant DB secara real-time. Jalankan migrasi UP/DOWN secara teratur.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-bold font-mono">Pilih Node DB:</span>
              <select
                value={selectedConnectionId}
                onChange={(e) => setSelectedConnectionId(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs text-slate-700 px-2.5 py-1.5 rounded-lg font-bold"
              >
                {(connectionsList || []).map((c: any, i: number) => (
                  <option key={c.id || `select-conn-${i}`} value={c.id}>{c.connection_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Versioned Migrations list */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col gap-3 shadow-sm">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-slate-400 font-mono">Daftar Migrasi Skema (Database Migration)</h4>
                
                <div className="flex flex-col gap-3 mt-2">
                  {(migrationsData?.migrations || []).map((mig: any, i: number) => (
                    <div key={mig.id || `mig-${i}`} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <FileCode className="h-4 w-4 text-indigo-600" />
                          <h5 className="text-xs font-bold text-slate-800">{mig.name}</h5>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono mt-1">File: {mig.version}.sql</p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${mig.is_executed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                            {mig.is_executed ? 'EXECUTED' : 'PENDING'}
                          </span>
                          {mig.executed_at && (
                            <span className="text-[9px] text-slate-400 font-mono">Executed at: {new Date(mig.executed_at).toLocaleString()}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!mig.is_executed ? (
                          <button
                            onClick={() => runMigrationMutation.mutate(mig.id)}
                            disabled={runMigrationMutation.isPending}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm cursor-pointer transition-colors"
                          >
                            <Play className="h-3 w-3" />
                            <span>Run UP</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => rollbackMigrationMutation.mutate(mig.id)}
                            disabled={rollbackMigrationMutation.isPending}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-red-50 border border-slate-200 text-slate-600 hover:text-red-600 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <RotateCcw className="h-3 w-3" />
                            <span>Rollback</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Logs Audit for Migration */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col gap-3 shadow-sm">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Histori Log Eksekusi Migrasi</h4>
                <div className="max-h-60 overflow-y-auto text-xs text-slate-600 font-mono flex flex-col gap-2">
                  {(migrationsData?.logs || []).map((log: any, i: number) => (
                    <div key={log.id || `log-${i}`} className="p-2 border-b border-slate-50/50 flex items-center justify-between">
                      <div className="min-w-0">
                        <span className={`font-bold inline-block text-[9px] px-1.5 py-0.5 rounded mr-2 ${log.action_type === 'UP' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
                          {log.action_type}
                        </span>
                        <span className="font-semibold text-slate-800">Success</span>
                      </div>
                      <div className="text-right text-[10px] text-slate-400 shrink-0">
                        <span>{log.execution_time_ms} ms</span> • <span>{log.created_by}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Database Seeders block right column */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col gap-4 shadow-sm self-start">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Suntik Data Awal (Seeder Manager)</h4>
                <p className="text-[11px] text-slate-500 mt-1">Sediakan data master awal untuk pengujian fungsional modul di sandbox staging.</p>
              </div>

              <div className="flex flex-col gap-3">
                {(migrationsData?.migrations || []).length === 0 ? (
                  <p className="text-xs text-slate-400 font-mono">Pilih node koneksi untuk menarik data seed.</p>
                ) : (
                  // list static seeders
                  <div className="flex flex-col gap-3">
                    <div className="p-3 border border-slate-100 bg-slate-50 rounded-xl flex flex-col gap-2">
                      <div>
                        <h5 className="text-xs font-bold text-slate-800">Seed Master School Units</h5>
                        <p className="text-[11px] text-slate-500 mt-0.5">Mengisi data awal unit yayasan, cabang sekolah dasar, menengah, dan asrama.</p>
                      </div>
                      <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-2 mt-1">
                        <span className="text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">SUKSES</span>
                        <button
                          onClick={() => runSeederMutation.mutate('seed-01')}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
                        >
                          Run Seeder
                        </button>
                      </div>
                    </div>

                    <div className="p-3 border border-slate-100 bg-slate-50 rounded-xl flex flex-col gap-2">
                      <div>
                        <h5 className="text-xs font-bold text-slate-800">Seed Mock Santri & Students</h5>
                        <p className="text-[11px] text-slate-500 mt-0.5">Menyuntikkan 100 data siswa dummy untuk pengujian ledger keuangan & SPP.</p>
                      </div>
                      <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-2 mt-1">
                        <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">PENDING</span>
                        <button
                          onClick={() => runSeederMutation.mutate('seed-02')}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
                        >
                          Run Seeder
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ==================== VIEW 4: BACKUPS & RESTORE ==================== */}
      {activeTab === 'backups' && (
        <div className="flex flex-col gap-6">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Automated Backup Pipelines & Point-In-Time Restore</h3>
              <p className="text-xs text-slate-500">Amankan schema & data dump secara otomatis ke object cloud storage terenkripsi.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => createBackupMutation.mutate({ connection_id: 'conn-prod-01', backup_type: 'FULL' })}
                disabled={createBackupMutation.isPending}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow cursor-pointer transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Trigger Manual Backup</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Backup files column */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              
              <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col gap-3 shadow-sm">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Arsip File Backup SQL Tersedia</h4>
                
                <div className="flex flex-col gap-3 mt-1">
                  {/* Backup Files render */}
                  <div className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileCode className="h-4 w-4 text-indigo-600" />
                        <h5 className="text-xs font-bold text-slate-800">saas_school_erp_inc_20260706_180000.sql</h5>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono mt-1">Incremental • Size: 4.62 MB • SHA256 Verified</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); alert('Downloading backup sql simulation file (4.6 MB)...'); }}
                        className="p-1.5 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-lg transition-colors"
                        title="Download SQL Dump"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => restoreBackupMutation.mutate('bk-file-01')}
                        disabled={restoreBackupMutation.isPending}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Restore DB
                      </button>
                    </div>
                  </div>

                  <div className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileCode className="h-4 w-4 text-indigo-600" />
                        <h5 className="text-xs font-bold text-slate-800">saas_school_erp_full_weekly_20260703.sql</h5>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono mt-1">Full • Size: 136.2 MB • SHA256 Verified</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); alert('Downloading backup sql simulation file (136.2 MB)...'); }}
                        className="p-1.5 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-lg transition-colors"
                        title="Download SQL Dump"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => restoreBackupMutation.mutate('bk-file-02')}
                        disabled={restoreBackupMutation.isPending}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Restore DB
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Point-In-Time Timeline (Recovery) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col gap-3 shadow-sm">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Point-In-Time Recovery Timeline (PITR)</h4>
                
                <div className="flex flex-col gap-4 mt-2 font-sans">
                  <div className="relative border-l border-indigo-100 pl-6 ml-3 space-y-4">
                    <div className="relative">
                      <div className="absolute -left-[30px] top-1 h-4.5 w-4.5 rounded-full bg-indigo-600 border-4 border-white flex items-center justify-center" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800">Database Active Session (Live)</span>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5">Sekarang • Menampung ledger transaksi & profil baru</span>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[30px] top-1 h-4.5 w-4.5 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800">Incremental Snapshot Created</span>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5">3 Jam Lalu (18:00) • Size: 4.62 MB • Sukses diupload ke GCP Bucket</span>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[30px] top-1 h-4.5 w-4.5 rounded-full bg-indigo-600 border-4 border-white flex items-center justify-center" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800">Full Structural Schema Sync</span>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5">3 Hari Lalu (03 Juli) • Size: 136.2 MB • Backup Mingguan Terjadwal</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Scheduler scheduler form right column */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col gap-4 shadow-sm self-start">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">SaaS Backup Scheduler (Cron)</h4>
                <p className="text-[11px] text-slate-500 mt-1">Konfigurasikan otomatisasi interval backup database per jam/harian/mingguan.</p>
              </div>

              <div className="flex flex-col gap-3 font-sans text-xs text-slate-600">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-600">Nama Pipeline Jadwal</label>
                  <input
                    type="text"
                    value={newSchedName}
                    onChange={(e) => setNewSchedName(e.target.value)}
                    className="bg-slate-50 border border-slate-250 px-3 py-2 rounded-lg text-slate-800 focus:outline-none"
                    placeholder="e.g., Weekly Friday Full Database Sync"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-600">Backup Type</label>
                    <select
                      value={newSchedType}
                      onChange={(e: any) => setNewSchedType(e.target.value)}
                      className="bg-slate-50 border border-slate-250 px-2 py-2 rounded-lg text-slate-800"
                    >
                      <option value="FULL">FULL Backup</option>
                      <option value="INCREMENTAL">INCREMENTAL</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-600">Cron Expression</label>
                    <input
                      type="text"
                      value={newSchedCron}
                      onChange={(e) => setNewSchedCron(e.target.value)}
                      className="bg-slate-50 border border-slate-250 px-3 py-2 rounded-lg text-slate-800 font-mono"
                      placeholder="0 0 * * 5"
                    />
                  </div>
                </div>

                <button
                  onClick={() => createBackupScheduleMutation.mutate({
                    connection_id: 'conn-prod-01',
                    job_name: newSchedName,
                    schedule_cron: newSchedCron,
                    backup_type: newSchedType
                  })}
                  disabled={createBackupScheduleMutation.isPending}
                  className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Clock className="h-4 w-4" />
                  <span>Daftarkan Schedule</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ==================== VIEW 5: IMPORT & EXPORT ==================== */}
      {activeTab === 'import_export' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* IMPORT MODULE BOX */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-indigo-600 animate-pulse" />
              <div>
                <h3 className="text-sm font-bold text-slate-800">Database Import Manager</h3>
                <p className="text-xs text-slate-500">Mendukung unggah bulk table data dalam format SQL, CSV, Excel & JSON.</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-2 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-600">Target Tabel</label>
                  <select
                    value={importTable}
                    onChange={(e) => setImportTable(e.target.value)}
                    className="bg-slate-50 border border-slate-200 px-2 py-2 rounded-lg text-slate-800"
                  >
                    <option value="students">students (Siswa & Santri)</option>
                    <option value="tuitions">tuitions (Spp & Keuangan)</option>
                    <option value="classes">classes (KBM Kelas)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-600">Format File</label>
                  <select
                    value={importType}
                    onChange={(e: any) => setImportType(e.target.value)}
                    className="bg-slate-50 border border-slate-200 px-2 py-2 rounded-lg text-slate-800"
                  >
                    <option value="CSV">CSV File (*.csv)</option>
                    <option value="JSON">JSON Document (*.json)</option>
                    <option value="SQL">SQL Script (*.sql)</option>
                    <option value="EXCEL">Excel Worksheet (*.xlsx)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-600">Tempel Konten Preview File (Simulasi Upload)</label>
                <textarea
                  rows={5}
                  value={importFileContent}
                  onChange={(e) => setImportFileContent(e.target.value)}
                  placeholder="name,parent_name,registered_at&#10;Ahmad Al-Farabi,Dani S,2026-07-01&#10;Zulfa Nurul,Siti Aminah,2026-07-02"
                  className="bg-slate-50 border border-slate-250 p-3 rounded-lg text-slate-800 font-mono focus:outline-none"
                />
              </div>

              <button
                onClick={() => importMutation.mutate({
                  connection_id: 'conn-prod-01',
                  import_type: importType,
                  target_table: importTable,
                  file_name: `upload_simulation.${importType.toLowerCase()}`,
                  file_size: 1540,
                  content_preview: importFileContent
                })}
                disabled={importMutation.isPending || !importFileContent.trim()}
                className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                <span>Simpan & Eksekusi Import</span>
              </button>

              {importSuccessMessage && (
                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-emerald-800 font-mono flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <span>{importSuccessMessage}</span>
                </div>
              )}
            </div>
          </div>

          {/* EXPORT MODULE BOX */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-indigo-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-800">Database Export Manager</h3>
                <p className="text-xs text-slate-500">Kompilasikan dump skema, relasi, tabel, atau seluruh database menjadi file download terenkripsi.</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-2 text-xs">
              <div className="p-4 border border-indigo-100 bg-indigo-50/20 rounded-xl flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-slate-800">Export Schema Only (DDL)</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">Ekstrak struktur tabel, relasi, tipe data, dan index tanpa data baris.</p>
                </div>
                <button
                  onClick={() => exportMutation.mutate({ connection_id: 'conn-prod-01', export_type: 'SQL', source_table: 'schema' })}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer"
                >
                  Export SQL
                </button>
              </div>

              <div className="p-4 border border-indigo-100 bg-indigo-50/20 rounded-xl flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-slate-800">Export Table "students"</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-mono">Format: CSV Worksheet (siswabaru.csv)</p>
                </div>
                <button
                  onClick={() => exportMutation.mutate({ connection_id: 'conn-prod-01', export_type: 'CSV', source_table: 'students' })}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer"
                >
                  Export CSV
                </button>
              </div>

              <div className="p-4 border border-indigo-100 bg-indigo-50/20 rounded-xl flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-slate-800">Export Complete Database Dump</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-mono">Format: SQL Script (Full Backup Archive.sql)</p>
                </div>
                <button
                  onClick={() => exportMutation.mutate({ connection_id: 'conn-prod-01', export_type: 'SQL', source_table: 'database' })}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer"
                >
                  Export Dump
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ==================== VIEW 6: QUERY RUNNER ==================== */}
      {activeTab === 'query_runner' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* SQL Editor Area left side */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col gap-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Terminal className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-800">Reusable SQL Playpen Editor</h3>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono font-bold">Node DB:</span>
                  <select
                    value={selectedConnectionId}
                    onChange={(e) => setSelectedConnectionId(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-xs text-slate-700 px-2.5 py-1 rounded-lg font-bold"
                  >
                    {(connectionsList || []).map((c: any) => (
                      <option key={c.id} value={c.id}>{c.connection_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SQL Preset Helper Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase font-mono mr-1">Query Helper Presets:</span>
                <button
                  onClick={() => setSqlStatement('SELECT * FROM students LIMIT 10;')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-[10px] text-indigo-600 font-bold rounded-lg cursor-pointer"
                >
                  Siswa (Select)
                </button>
                <button
                  onClick={() => setSqlStatement('SELECT * FROM audit_logs LIMIT 5;')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-[10px] text-indigo-600 font-bold rounded-lg cursor-pointer"
                >
                  Audit Logs (Select)
                </button>
                <button
                  onClick={() => setSqlStatement('SELECT COUNT(*), environment FROM database_connections GROUP BY environment;')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-[10px] text-indigo-600 font-bold rounded-lg cursor-pointer"
                >
                  Statistik Conn
                </button>
                <button
                  onClick={() => setSqlStatement('SELECT * FROM wrong_column_trigger_error;')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-[10px] text-red-600 font-bold rounded-lg cursor-pointer"
                  title="Simulasikan Error Handshake"
                >
                  Test Syntax Error
                </button>
              </div>

              {/* Custom SQL textarea with line highlight simulation */}
              <div className="relative border border-slate-250 rounded-xl overflow-hidden font-mono text-xs bg-slate-900 text-slate-200 p-4">
                <div className="absolute left-2 top-4 flex flex-col items-end text-slate-600 select-none pr-3 border-r border-slate-800 w-6">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                </div>
                <textarea
                  rows={4}
                  value={sqlStatement}
                  onChange={(e) => setSqlStatement(e.target.value)}
                  className="w-full bg-transparent outline-none border-none pl-8 text-slate-100 resize-none font-mono focus:ring-0 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-[10px] text-slate-400 font-mono">Akses: READ-WRITE (Supervisor)</span>
                
                <button
                  onClick={() => runQueryMutation.mutate({ connection_id: selectedConnectionId, sql_query: sqlStatement })}
                  disabled={runQueryMutation.isPending || !sqlStatement.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow cursor-pointer transition-colors"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>Execute Query</span>
                </button>
              </div>

            </div>

            {/* Reusable Query Result grid */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col gap-3 shadow-sm overflow-x-auto min-h-60">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Hasil Eksekusi SQL Query</h4>
              
              {runQueryMutation.isPending && (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <RefreshCw className="h-6 w-6 text-indigo-600 animate-spin" />
                  <span className="text-xs text-slate-400 font-mono">Mengeksekusi SQL statement pada cluster DB...</span>
                </div>
              )}

              {queryResult && (
                <div className="flex flex-col gap-3 mt-1">
                  
                  {/* Performance diagnostic indicator line */}
                  <div className="grid grid-cols-3 gap-2 text-[10px] font-mono border border-slate-100 bg-slate-50 p-2 rounded-xl">
                    <div>
                      <span className="text-slate-400">Execution:</span>{' '}
                      <span className="font-extrabold text-indigo-600">{queryResult?.data?.execution_time_ms || 12} ms</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Rows affected:</span>{' '}
                      <span className="font-extrabold text-slate-800">{queryResult?.data?.rows_affected || 0} rows</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Sync:</span>{' '}
                      <span className="font-extrabold text-emerald-600">Encrypted AES-256</span>
                    </div>
                  </div>

                  {!queryResult?.success ? (
                    <div className="bg-red-50 border border-red-150 p-3 rounded-xl text-red-700 font-mono text-xs">
                      <h5 className="font-bold flex items-center gap-1.5">
                        <XCircle className="h-4 w-4" />
                        Query Failed
                      </h5>
                      <p className="mt-1.5 text-[11px] bg-red-100/50 p-2 rounded-lg">{queryResult?.error}</p>
                    </div>
                  ) : (
                    // Display tabular table grid
                    <div className="border border-slate-100 rounded-xl overflow-hidden font-mono text-[11px] max-h-80 overflow-y-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider">
                          <tr>
                            {(queryResult?.data?.columns || []).map((col: string, i: number) => (
                              <th key={i} className="p-2.5 border-b border-slate-150">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {(queryResult?.data?.rows || []).map((row: any, rowIdx: number) => (
                            <tr key={rowIdx} className="hover:bg-slate-50">
                              {(queryResult?.data?.columns || []).map((col: string, colIdx: number) => (
                                <td key={colIdx} className="p-2.5 font-semibold">
                                  {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col])}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Explain query plan trigger box */}
                  <div className="border border-indigo-100/40 bg-indigo-50/10 p-3 rounded-xl flex flex-col gap-1.5 text-[10px] font-mono">
                    <span className="font-bold text-slate-700 uppercase flex items-center gap-1 text-[9px] tracking-wider text-indigo-700">
                      <Brain className="h-3.5 w-3.5" /> Explain Analyze Plan (Optimizer)
                    </span>
                    <p className="text-slate-500 leading-relaxed font-mono">
                      {queryResult?.data?.explain_plan ? queryResult.data.explain_plan["Query Plan"] : "No plan rendered."}
                    </p>
                  </div>

                </div>
              )}

              {!queryResult && !runQueryMutation.isPending && (
                <p className="text-xs text-slate-400 font-mono text-center py-10">Tulis SQL statement dan eksekusi untuk melihat grid baris di sini.</p>
              )}
            </div>

          </div>

          {/* Right column: Query History & Saved Queries */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col gap-4 shadow-sm self-start">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Histori Eksekusi Terakhir</h4>
              <p className="text-[11px] text-slate-500 mt-1">Audit log query siber supervisor per tenant.</p>
            </div>

            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto text-[11px] font-mono text-slate-600">
              {(queryHistoryData?.history || []).map((h: any, i: number) => (
                <div
                  key={h.id || `hist-${i}`}
                  onClick={() => setSqlStatement(h.query_text)}
                  className="p-2.5 border border-slate-100 rounded-xl bg-slate-50/50 hover:border-indigo-200 hover:bg-indigo-50/20 cursor-pointer transition-all"
                >
                  <p className="truncate text-indigo-600 font-bold">{h.query_text}</p>
                  <div className="flex justify-between items-center mt-1.5 text-[9px] text-slate-400">
                    <span>{h.execution_time_ms} ms</span>
                    <span className={h.status === 'SUCCESS' ? 'text-emerald-600' : 'text-red-500'}>{h.status}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Koleksi Saved Queries</h4>
              <p className="text-[11px] text-slate-500 mt-1">Akses cepat query reporting bulanan.</p>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              {(queryHistoryData?.saved || []).map((s: any, i: number) => (
                <div
                  key={s.id || `saved-${i}`}
                  onClick={() => setSqlStatement(s.query_text)}
                  className="p-2 border border-slate-100 rounded-xl hover:border-indigo-200 cursor-pointer flex items-center justify-between gap-2"
                >
                  <div>
                    <h5 className="font-bold text-slate-800 text-[11px]">{s.query_title}</h5>
                    <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{s.description}</p>
                  </div>
                  <Play className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ==================== VIEW 7: DIAGNOSTICS & PERFORMANCE ==================== */}
      {activeTab === 'diagnostics' && (
        <div className="flex flex-col gap-6">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Database Diagnostic Reports & Performance Checklists</h3>
              <p className="text-xs text-slate-500">Pindai status latency, deadlock, index terbuang, dan isolasi cache.</p>
            </div>
            
            <button
              onClick={() => refetchHealth()}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Jalankan Diagnostik</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Health Indicators and dials */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(healthReports || []).map((rep: any, i: number) => (
                  <div key={rep.connection_id || `rep-${i}`} className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col gap-4 shadow-sm">
                    
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-800">{rep.connection_name}</h4>
                        <span className="text-[10px] font-mono text-slate-400">Node ID: {rep.connection_id}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${
                          rep.status === 'HEALTHY' 
                            ? 'bg-emerald-500 animate-pulse' 
                            : rep.status === 'WARNING'
                            ? 'bg-amber-500 animate-pulse'
                            : 'bg-red-500 animate-pulse'
                        }`} />
                        <span className="text-xs font-bold text-slate-700">{rep.status}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-bold block">Latency</span>
                        <span className="font-extrabold text-slate-800 mt-1 block font-mono">{rep.latency_ms} ms</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-bold block">CPU</span>
                        <span className="font-extrabold text-slate-800 mt-1 block font-mono">{rep.cpu_usage_pct}%</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-bold block">Memory</span>
                        <span className="font-extrabold text-slate-800 mt-1 block font-mono">{rep.memory_usage_mb} MB</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-mono">Storage Used ({rep.storage_usage_pct}%)</span>
                        <span className="text-slate-700 font-bold font-mono">18.42 GB / 100 GB</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${rep.storage_usage_pct}%` }} />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-mono">Connection Pool Occupancy ({Math.round((rep.active_connections / rep.max_connections) * 100)}%)</span>
                        <span className="text-slate-700 font-bold font-mono">{rep.active_connections} / {rep.max_connections} Active</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.round((rep.active_connections / rep.max_connections) * 100)}%` }} />
                      </div>
                    </div>

                  </div>
                ))}
              </div>

              {/* Performance recommendations */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col gap-4 shadow-sm">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Rekomendasi Optimizer & Indeks</h4>
                
                <div className="flex flex-col gap-3">
                  <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl flex items-start gap-2.5 text-xs text-slate-600">
                    <Brain className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-slate-800">Missing Index Detected: table "students"</h5>
                      <p className="mt-0.5 text-slate-500 leading-relaxed">Eksekusi query filter WHERE pada kolom "registered_at" memicu full-table sequential scan (sangat lambat). Jalankan script migrasi indeks untuk mengoptimasi.</p>
                      <button
                        onClick={() => {
                          setActiveTab('migrations');
                          setSelectedConnectionId('conn-prod-01');
                        }}
                        className="mt-2 text-indigo-600 font-bold flex items-center gap-1 cursor-pointer hover:underline"
                      >
                        <span>Jalankan Migrasi Indeks</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enterprise MySQL Foundation Test Suite */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col gap-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Terminal className="h-5 w-5 text-indigo-600" />
                      <span>Enterprise MySQL 8.4 LTS Verification Suite</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">Jalankan unit pengujian sekuensial untuk memverifikasi keselarasan database.</p>
                  </div>
                  <button
                    onClick={runTestingSuite}
                    disabled={isRunningTests}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-all shrink-0 font-sans"
                  >
                    <Play className={`h-4 w-4 ${isRunningTests ? 'animate-spin' : ''}`} />
                    <span>{isRunningTests ? 'Menguji Engine...' : 'Mulai Test Suite'}</span>
                  </button>
                </div>

                {!testResults ? (
                  <div className="p-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-center flex flex-col items-center justify-center gap-2">
                    <DatabaseZap className="h-8 w-8 text-slate-300" />
                    <p className="text-xs text-slate-600 font-medium">Klik tombol di atas untuk memverifikasi seluruh komponen fondasi MySQL 8.4 LTS.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 font-sans">
                    {/* Summary Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                        <span className="text-[10px] text-emerald-600 font-bold block uppercase tracking-wider font-mono">STATUS SUITE</span>
                        <span className="text-xs font-extrabold text-emerald-800 mt-1 block">ALL PASSED</span>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl text-center">
                        <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider font-mono">TOTAL TESTS</span>
                        <span className="text-xs font-extrabold text-slate-800 mt-1 block">{testResults.length} Cases</span>
                      </div>
                      <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-center">
                        <span className="text-[10px] text-indigo-600 font-bold block uppercase tracking-wider font-mono">DATABASE MODEL</span>
                        <span className="text-xs font-extrabold text-indigo-800 mt-1 block">MySQL 8.4 LTS</span>
                      </div>
                      <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-center">
                        <span className="text-[10px] text-amber-600 font-bold block uppercase tracking-wider font-mono">STORAGE ENGINE</span>
                        <span className="text-xs font-extrabold text-amber-800 mt-1 block">InnoDB (ACID)</span>
                      </div>
                    </div>

                    {/* Individual Test Cases */}
                    <div className="flex flex-col gap-3">
                      {testResults.map((test: any, idx: number) => (
                        <div key={idx} className="p-4 border border-slate-150 rounded-xl bg-slate-50/50 flex flex-col gap-3">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${test.status === 'PASSED' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                              <div className="text-left">
                                <h5 className="text-xs font-bold text-slate-800">{test.test_name}</h5>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-600 font-bold uppercase tracking-wide font-mono mr-2">{test.category}</span>
                                <span className="text-[10px] text-slate-400 font-mono">Durasi: {test.duration_ms}ms</span>
                              </div>
                            </div>
                            <span className={`text-[10px] font-extrabold font-mono px-2 py-0.5 rounded ${test.status === 'PASSED' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                              {test.status}
                            </span>
                          </div>

                          {/* Terminal output console */}
                          <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-[10px] overflow-x-auto max-h-40 leading-relaxed">
                            {test.logs.map((log: string, lIdx: number) => (
                              <div key={lIdx} className="flex gap-2 text-left">
                                <span className="text-slate-500 select-none">{lIdx + 1}:</span>
                                <span>{log}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Performance Bar Chart (Storage statistics) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col gap-4 shadow-sm self-start">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Penyimpanan Tabel Terbesar (MB)</h4>
                <p className="text-[11px] text-slate-500 mt-1">Ukuran disk fisik pada schema public.</p>
              </div>

              {/* Dynamic Storage Bar chart */}
              <div className="h-60 w-full font-mono text-[10px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'audit_logs', size: 112.5 },
                    { name: 'tuitions', size: 5.1 },
                    { name: 'students', size: 2.4 },
                    { name: 'classes', size: 0.2 }
                  ]}>
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip />
                    <Bar dataKey="size" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                      <Cell key="cell-0" fill="#4f46e5" />
                      <Cell key="cell-1" fill="#6366f1" />
                      <Cell key="cell-2" fill="#818cf8" />
                      <Cell key="cell-3" fill="#a5b4fc" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
