/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Shield,
  Key,
  Webhook,
  RefreshCw,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Activity,
  Plus,
  Radio,
  Search,
  Copy,
  Lock,
  ExternalLink,
  Sliders,
  Database,
  ArrowLeftRight,
  Server,
  Layers,
  FileSpreadsheet,
  Trash2,
  RotateCw,
  Terminal,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';
import apiClient from '../api/client';

export function EnterpriseIntegrationApiGatewayEngine() {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'apikeys' | 'webhooks' | 'sync' | 'academic'>('overview');
  const [loading, setLoading] = useState<boolean>(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [configs, setConfigs] = useState<any[]>([]);
  const [academicBridge, setAcademicBridge] = useState<any>(null);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);
  const [syncJobs, setSyncJobs] = useState<any[]>([]);
  const [syncConflicts, setSyncConflicts] = useState<any[]>([]);

  // Modals & Action States
  const [createKeyModalOpen, setCreateKeyModalOpen] = useState<boolean>(false);
  const [newKeyData, setNewKeyData] = useState<{ client_name: string; scopes: string[]; rate_limit_rpm: number; expiry_days: number }>({
    client_name: '',
    scopes: ['students.read', 'attendance.read'],
    rate_limit_rpm: 300,
    expiry_days: 365
  });
  const [generatedSecretKey, setGeneratedSecretKey] = useState<string | null>(null);

  const [createWebhookModalOpen, setCreateWebhookModalOpen] = useState<boolean>(false);
  const [newWebhookData, setNewWebhookData] = useState<{ name: string; endpoint_url: string; events: string[] }>({
    name: '',
    endpoint_url: '',
    events: ['attendance.recorded']
  });

  const [triggerSyncModalOpen, setTriggerSyncModalOpen] = useState<boolean>(false);
  const [syncData, setSyncData] = useState<{ entity_type: string; direction: string; source_of_truth: string }>({
    entity_type: 'Student',
    direction: 'PULL',
    source_of_truth: 'Management System ERP'
  });

  const [testResultMsg, setTestResultMsg] = useState<string | null>(null);

  useEffect(() => {
    loadGatewayData();
  }, []);

  const loadGatewayData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const results = await Promise.allSettled([
        apiClient.post('/api/action', { action: 'getIntegrationDashboard' }),
        apiClient.post('/api/action', { action: 'getApiKeys' }),
        apiClient.post('/api/action', { action: 'getWebhooks' }),
        apiClient.post('/api/action', { action: 'getSyncDashboard' })
      ]);

      const [dashResult, keysResult, whResult, syncResult] = results;

      if (dashResult.status === 'fulfilled' && dashResult.value?.data?.data) {
        const d = dashResult.value.data.data;
        setMetrics(d.metrics);
        setConfigs(d.configs || []);
        setAcademicBridge(d.academic_bridge || null);
      }
      if (keysResult.status === 'fulfilled' && keysResult.value?.data?.data) {
        setApiKeys(keysResult.value.data.data);
      }
      if (whResult.status === 'fulfilled' && whResult.value?.data?.data) {
        const w = whResult.value.data.data;
        setWebhooks(w.webhooks || []);
        setWebhookLogs(w.logs || []);
      }
      if (syncResult.status === 'fulfilled' && syncResult.value?.data?.data) {
        const s = syncResult.value.data.data;
        setSyncJobs(s.jobs || []);
        setSyncConflicts(s.conflicts || []);
      }
    } catch (err) {
      console.error('Gagal memuat data API Gateway:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestIntegration = async (integrationId: string) => {
    try {
      const res = await apiClient.post('/api/action', { action: 'testIntegrationConnection', integration_id: integrationId });
      setTestResultMsg(res.data?.message || 'Pengujian koneksi berhasil.');
      loadGatewayData(true);
      setTimeout(() => setTestResultMsg(null), 5000);
    } catch (err: any) {
      setTestResultMsg(`Gagal menguji koneksi: ${err.message}`);
    }
  };

  const handleCreateApiKey = async () => {
    if (!newKeyData.client_name.trim()) return;
    try {
      const res = await apiClient.post('/api/action', {
        action: 'createApiKey',
        client_name: newKeyData.client_name,
        scopes: newKeyData.scopes,
        rate_limit_rpm: newKeyData.rate_limit_rpm,
        expiry_days: newKeyData.expiry_days
      });
      if (res.data?.success) {
        setGeneratedSecretKey(res.data.data.full_secret_key);
        loadGatewayData(true);
      }
    } catch (err) {
      console.error('Gagal membuat API Key:', err);
    }
  };

  const handleRotateApiKey = async (keyId: string) => {
    if (!confirm('Apakah Anda yakin ingin merotasi API Key ini? Kunci rahasia lama akan langsung dibatalkan.')) return;
    try {
      const res = await apiClient.post('/api/action', { action: 'rotateApiKey', key_id: keyId });
      if (res.data?.success) {
        alert(`API Key berhasil dirotasi! Secret baru: ${res.data.data.new_secret_key}`);
        loadGatewayData(true);
      }
    } catch (err) {
      console.error('Gagal merotasi API Key:', err);
    }
  };

  const handleRevokeApiKey = async (keyId: string) => {
    if (!confirm('Apakah Anda yakin ingin mencabut (Revoke) API Key ini secara permanen?')) return;
    try {
      await apiClient.post('/api/action', { action: 'revokeApiKey', key_id: keyId });
      loadGatewayData(true);
    } catch (err) {
      console.error('Gagal mencabut API Key:', err);
    }
  };

  const handleSaveWebhook = async () => {
    if (!newWebhookData.endpoint_url.trim()) return;
    try {
      await apiClient.post('/api/action', {
        action: 'saveWebhook',
        name: newWebhookData.name || 'Webhook Listener',
        endpoint_url: newWebhookData.endpoint_url,
        events: newWebhookData.events
      });
      setCreateWebhookModalOpen(false);
      setNewWebhookData({ name: '', endpoint_url: '', events: ['attendance.recorded'] });
      loadGatewayData(true);
    } catch (err) {
      console.error('Gagal menyimpan Webhook:', err);
    }
  };

  const handleTestWebhook = async (webhookId: string) => {
    try {
      const res = await apiClient.post('/api/action', { action: 'testWebhookDelivery', webhook_id: webhookId });
      setTestResultMsg(res.data?.message || 'Simulasi pengiriman webhook sukses.');
      loadGatewayData(true);
      setTimeout(() => setTestResultMsg(null), 5000);
    } catch (err: any) {
      setTestResultMsg(`Gagal menguji webhook: ${err.message}`);
    }
  };

  const handleTriggerSync = async () => {
    try {
      const res = await apiClient.post('/api/action', {
        action: 'triggerSyncJob',
        entity_type: syncData.entity_type,
        direction: syncData.direction,
        source_of_truth: syncData.source_of_truth
      });
      setTriggerSyncModalOpen(false);
      setTestResultMsg(res.data?.message || 'Sinkronisasi berhasil dijalankan.');
      loadGatewayData(true);
      setTimeout(() => setTestResultMsg(null), 5000);
    } catch (err: any) {
      setTestResultMsg(`Gagal sinkronisasi: ${err.message}`);
    }
  };

  const handleResolveConflict = async (conflictId: string, strategy: 'SOURCE_WINS' | 'TARGET_WINS') => {
    try {
      await apiClient.post('/api/action', { action: 'resolveSyncConflict', conflict_id: conflictId, resolution_strategy: strategy });
      loadGatewayData(true);
    } catch (err) {
      console.error('Gagal menyelesaikan konflik:', err);
    }
  };

  return (
    <div className="w-full bg-slate-50 min-h-[80vh] p-6 font-sans">
      
      {/* HEADER BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                Enterprise Integration &amp; API Gateway Engine
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  v1.0.0
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Pusat manajemen REST API v1, Webhook HMAC, Kredensial Klien, Idempotensi, Sinkronisasi Data &amp; Bridging Leger Akademik
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadGatewayData(false)}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5 border border-slate-200 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            Segarkan State
          </button>
        </div>
      </div>

      {/* ALERT MESSAGE BANNER */}
      {testResultMsg && (
        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0" />
          <span>{testResultMsg}</span>
        </div>
      )}

      {/* SUB TAB NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto scrollbar-none">
        {[
          { id: 'overview', name: 'Ringkasan & Health Gateway', icon: Activity },
          { id: 'apikeys', name: 'API Keys & Kredensial', icon: Key },
          { id: 'webhooks', name: 'Webhook Engine & Events', icon: Webhook },
          { id: 'sync', name: 'Sinkronisasi Data & Konflik', icon: ArrowLeftRight },
          { id: 'academic', name: 'Bridging Akademik (Leger/KBM)', icon: FileSpreadsheet }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & HEALTH */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Integrasi Aktif</span>
              <div className="text-2xl font-extrabold text-slate-800 mt-1">{metrics?.active_integrations || 0}</div>
              <div className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Terhubung Sempurna
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">API Key Klien</span>
              <div className="text-2xl font-extrabold text-slate-800 mt-1">{metrics?.active_api_keys || 0}</div>
              <div className="text-[10px] text-slate-500 font-medium mt-1">Terverifikasi HMAC</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Webhook Listeners</span>
              <div className="text-2xl font-extrabold text-slate-800 mt-1">{metrics?.active_webhooks || 0}</div>
              <div className="text-[10px] text-indigo-600 font-bold mt-1">Realtime Event Bus</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Rate Limit Usage</span>
              <div className="text-2xl font-extrabold text-slate-800 mt-1">{metrics?.rate_limit_usage_pct || 0}%</div>
              <div className="text-[10px] text-slate-500 font-medium mt-1">Batas Aman Rate Limiter</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Circuit Breakers</span>
              <div className="text-2xl font-extrabold text-slate-800 mt-1">{metrics?.circuit_breakers_open || 0} OPEN</div>
              <div className="text-[10px] text-emerald-600 font-bold mt-1">Circuit Closed (Normal)</div>
            </div>
          </div>

          {/* INTEGRATIONS CONFIG TABLE */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Daftar Service &amp; Gateway Integrasi Eksternal</h3>
                <p className="text-xs text-slate-500">Service gateway terdaftar untuk ekosistem pembayaran, komunikasi, dan leger</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 text-[11px] font-extrabold uppercase border-b border-slate-200">
                    <th className="p-3.5">Nama Integration</th>
                    <th className="p-3.5">Penyedia / Category</th>
                    <th className="p-3.5">Base URL</th>
                    <th className="p-3.5">Auth Type</th>
                    <th className="p-3.5">Environment</th>
                    <th className="p-3.5">Circuit Status</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {configs.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 font-bold text-slate-900">
                        {item.name}
                        <div className="text-[10px] font-mono text-slate-400">{item.id}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold">{item.provider}</div>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-600 truncate max-w-xs">{item.base_url}</td>
                      <td className="p-3.5 font-semibold text-slate-700">{item.auth_type}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {item.environment}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          item.circuit_status === 'CLOSED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {item.circuit_status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleTestIntegration(item.id)}
                          className="px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition cursor-pointer"
                        >
                          Uji Ping
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

      {/* TAB 2: API KEYS & CREDENTIALS */}
      {activeSubTab === 'apikeys' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Manajemen API Key &amp; Service Account</h3>
              <p className="text-xs text-slate-500">Kelola kunci akses terenkripsi, cakupan permission (scopes), dan rate limiter RPM</p>
            </div>
            <button
              type="button"
              onClick={() => { setGeneratedSecretKey(null); setCreateKeyModalOpen(true); }}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Buat API Key Baru
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 text-[11px] font-extrabold uppercase border-b border-slate-200">
                    <th className="p-3.5">Klien / Aplikasi</th>
                    <th className="p-3.5">Masked Key</th>
                    <th className="p-3.5">Cakupan Scope</th>
                    <th className="p-3.5">Rate Limit</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Aksi Rotasi / Revoke</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {apiKeys.map(k => (
                    <tr key={k.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 font-bold text-slate-900">
                        {k.client_name}
                        <div className="text-[10px] text-slate-400 font-normal">Dibuat oleh: {k.created_by}</div>
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">{k.api_key_masked}</td>
                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1">
                          {k.scopes?.map((sc: string) => (
                            <span key={sc} className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded text-[10px] font-mono font-bold">
                              {sc}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3.5 font-bold text-slate-700">{k.rate_limit_rpm} RPM</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          k.status === 'ACTIVE' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {k.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        {k.status === 'ACTIVE' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleRotateApiKey(k.id)}
                              className="px-2.5 py-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition cursor-pointer"
                            >
                              Rotasi
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRevokeApiKey(k.id)}
                              className="px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition cursor-pointer"
                            >
                              Revoke
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WEBHOOK ENGINE */}
      {activeSubTab === 'webhooks' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Webhook Engine &amp; HMAC Signature Verification</h3>
              <p className="text-xs text-slate-500">Pengiriman event otomatis (attendance, payment, student) dengan idempotensi key</p>
            </div>
            <button
              type="button"
              onClick={() => setCreateWebhookModalOpen(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Registrasi Webhook
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* REGISTERED WEBHOOKS LIST */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Webhook Listeners Terdaftar</h4>
              <div className="space-y-3">
                {webhooks.map(w => (
                  <div key={w.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{w.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {w.status}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-600 truncate">{w.endpoint_url}</div>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex flex-wrap gap-1">
                        {w.events?.map((ev: string) => (
                          <span key={ev} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-[10px] font-bold">
                            {ev}
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleTestWebhook(w.id)}
                        className="px-2.5 py-1 text-[10px] font-bold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-lg transition cursor-pointer"
                      >
                        Uji Event
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WEBHOOK LOGS */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Log Pengiriman Webhook Terakhir</h4>
              <div className="space-y-3">
                {webhookLogs.map(log => (
                  <div key={log.id} className="p-3 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-emerald-400 font-bold">{log.event_type}</span>
                      <span className="text-slate-400">{log.duration_ms}ms</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Event ID: {log.event_id}</div>
                    <div className="text-[10px] text-slate-400">Correlation ID: {log.correlation_id}</div>
                    <div className="text-[10px] text-emerald-300">HTTP Status: {log.response_status} OK</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DATA SYNC & CONFLICT RESOLUTION */}
      {activeSubTab === 'sync' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Sinkronisasi Data &amp; Conflict Resolution Panel</h3>
              <p className="text-xs text-slate-500">Pusat penentuan Source of Truth dan penyelesaian benturan data otomatis maupun manual</p>
            </div>
            <button
              type="button"
              onClick={() => setTriggerSyncModalOpen(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" /> Jalankan Sinkronisasi Manual
            </button>
          </div>

          {/* SYNC CONFLICTS SECTION */}
          {syncConflicts.length > 0 && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span>Terdeteksi {syncConflicts.length} Benturan Data (Conflict) Membutuhkan Keputusan</span>
              </div>

              {syncConflicts.map(c => (
                <div key={c.id} className="bg-white border border-amber-200 rounded-xl p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>Entitas: {c.entity_type} (Internal ID: {c.internal_id})</span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] uppercase font-extrabold">
                      {c.conflict_status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="font-bold text-slate-700 text-[11px] mb-1">Data Internal ERP (Source):</div>
                      <pre className="text-[10px] text-slate-600 whitespace-pre-wrap">{JSON.stringify(c.source_data, null, 2)}</pre>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="font-bold text-slate-700 text-[11px] mb-1">Data Eksternal (Target):</div>
                      <pre className="text-[10px] text-slate-600 whitespace-pre-wrap">{JSON.stringify(c.target_data, null, 2)}</pre>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleResolveConflict(c.id, 'SOURCE_WINS')}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition cursor-pointer"
                    >
                      Pilih Data Internal (Source Wins)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResolveConflict(c.id, 'TARGET_WINS')}
                      className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition cursor-pointer"
                    >
                      Pilih Data Eksternal (Target Wins)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SYNC JOBS HISTORY TABLE */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Riwayat Job Sinkronisasi</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 text-[11px] font-extrabold uppercase border-b border-slate-200">
                    <th className="p-3.5">System Target</th>
                    <th className="p-3.5">Entitas</th>
                    <th className="p-3.5">Arah Sync</th>
                    <th className="p-3.5">Source of Truth</th>
                    <th className="p-3.5">Records Processed</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {syncJobs.map(job => (
                    <tr key={job.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 font-bold text-slate-900">{job.integration_name}</td>
                      <td className="p-3.5 font-semibold text-slate-800">{job.entity_type}</td>
                      <td className="p-3.5 font-mono text-slate-600">{job.direction}</td>
                      <td className="p-3.5 font-medium text-slate-700">{job.source_of_truth}</td>
                      <td className="p-3.5 font-bold text-indigo-600">{job.records_processed} Records</td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {job.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: BRIDGING AKADEMIK (LEGER/KBM) */}
      {activeSubTab === 'academic' && (
        <div className="space-y-6">
          <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-md space-y-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-6 w-6 text-indigo-300" />
              <h3 className="text-base font-extrabold tracking-tight">KBM, Leger Nilai &amp; Rapor Akademik Eksternal Bridge</h3>
            </div>
            <p className="text-xs text-indigo-200 leading-relaxed max-w-3xl">
              Prinsip Arsitektur Utama (Rule 36-38): Sistem Manajemen ERP Sekolah/Pesantren **TIDAK BUKAN** source of truth untuk KBM/Leger. Aplikasi KBM/Leger tetap terpisah. ERP membaca data melalui REST API Read-Through tanpa duplikasi database akademik.
            </p>
          </div>

          {academicBridge && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-900">{academicBridge.external_system_name}</span>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                  {academicBridge.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-slate-400 block text-[10px] font-bold">API BASE URL:</span>
                  <span className="font-mono font-bold text-slate-800">{academicBridge.base_url}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-slate-400 block text-[10px] font-bold">KELAS TERSINKRON:</span>
                  <span className="font-bold text-indigo-600">{academicBridge.classes_synced} Rombel Akademik</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-slate-400 block text-[10px] font-bold">MATA PELAJARAN:</span>
                  <span className="font-bold text-slate-800">{academicBridge.subjects_count} Mapel Terdaftar</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed font-mono">
                {academicBridge.notes}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CREATE API KEY MODAL */}
      {createKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900">Buat API Key Access Klien Baru</h3>
            
            {generatedSecretKey ? (
              <div className="space-y-3 bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                <div className="text-xs font-bold text-emerald-800">API Key Berhasil Dibuat!</div>
                <p className="text-[11px] text-emerald-700">Simpan Kunci Rahasia ini di tempat aman. Kunci ini tidak dapat ditampilkan kembali!</p>
                <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-lg break-all select-all">
                  {generatedSecretKey}
                </div>
                <button
                  type="button"
                  onClick={() => setCreateKeyModalOpen(false)}
                  className="w-full py-2 bg-emerald-700 text-white font-bold text-xs rounded-lg cursor-pointer"
                >
                  Selesai &amp; Tutup
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Klien / Aplikasi Eksternal</label>
                  <input
                    type="text"
                    value={newKeyData.client_name}
                    onChange={(e) => setNewKeyData({ ...newKeyData, client_name: e.target.value })}
                    placeholder="misal: Mobile Parent Portal App"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rate Limit (Requests / Minute)</label>
                  <input
                    type="number"
                    value={newKeyData.rate_limit_rpm}
                    onChange={(e) => setNewKeyData({ ...newKeyData, rate_limit_rpm: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCreateKeyModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateApiKey}
                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
                  >
                    Generate Secret Key
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE WEBHOOK MODAL */}
      {createWebhookModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900">Registrasi Webhook Endpoint Baru</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Webhook Listener</label>
                <input
                  type="text"
                  value={newWebhookData.name}
                  onChange={(e) => setNewWebhookData({ ...newWebhookData, name: e.target.value })}
                  placeholder="misal: N8N Attendance Event Bus"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">URL Endpoint Target (HTTP/HTTPS)</label>
                <input
                  type="text"
                  value={newWebhookData.endpoint_url}
                  onChange={(e) => setNewWebhookData({ ...newWebhookData, endpoint_url: e.target.value })}
                  placeholder="https://n8n.yourdomain.com/webhook/..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateWebhookModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveWebhook}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
                >
                  Simpan Webhook
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TRIGGER SYNC MODAL */}
      {triggerSyncModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900">Jalankan Job Sinkronisasi Manual</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Entitas Target</label>
                <select
                  value={syncData.entity_type}
                  onChange={(e) => setSyncData({ ...syncData, entity_type: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Student">Siswa (Student)</option>
                  <option value="Employee">Pegawai (Employee)</option>
                  <option value="Attendance">Presensi (Attendance)</option>
                  <option value="Leger">Leger Akademik (Leger)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Arah Sinkronisasi (Direction)</label>
                <select
                  value={syncData.direction}
                  onChange={(e) => setSyncData({ ...syncData, direction: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="PULL">PULL (Tarik Data dari Sistem Eksternal)</option>
                  <option value="PUSH">PUSH (Kirim Data ke Sistem Eksternal)</option>
                  <option value="BIDIRECTIONAL">BIDIRECTIONAL (Dua Arah)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTriggerSyncModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleTriggerSync}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
                >
                  Jalankan Sync
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
