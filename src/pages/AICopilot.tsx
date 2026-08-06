/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { 
  Sparkles, 
  MessageSquare, 
  Bot, 
  Settings, 
  TrendingUp, 
  AlertTriangle, 
  BookOpen, 
  FileText, 
  HelpCircle, 
  Plus, 
  ArrowRight, 
  Check, 
  Globe, 
  ScanLine, 
  Mic, 
  Volume2, 
  RefreshCw, 
  DollarSign, 
  Layers, 
  ShieldAlert, 
  CheckCircle2, 
  Calendar, 
  ChevronRight, 
  Play, 
  Sliders, 
  PieChart as PieIcon, 
  ArrowRightLeft,
  User,
  Clock,
  ExternalLink,
  ChevronDown,
  Info,
  GraduationCap
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
  Cell,
  PieChart,
  Pie
} from 'recharts';

export default function AICopilot() {
  const { tenant, user, previewRole } = useAuth();
  const queryClient = useQueryClient();
  const isPondok = tenant?.type === 'PONDOK' || tenant?.type === 'KEDUA';

  // Role Normalization for AI Copilot
  const rawRole = previewRole || user?.role || '';
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

  const activeRole = normalizeRole(rawRole);
  const isSuperAdmin = activeRole === 'SUPER_ADMIN' || activeRole === 'OWNER_YAYASAN';

  // Default assistant selector helper
  const getDefaultAssistant = () => {
    if (activeRole === 'GURU' || activeRole === 'WALI_KELAS') return 'Teacher';
    if (activeRole === 'SANTRI') return 'Student';
    if (activeRole === 'WALI_SANTRI') return 'Parent';
    if (activeRole === 'BENDAHARA_SEKOLAH') return 'Finance';
    if (activeRole === 'OPERATOR_SEKOLAH' || activeRole === 'ADMIN_TU') return 'Administrator';
    return 'Teacher';
  };

  // State Management
  const [activeTab, setActiveTab] = useState<'chat' | 'generators' | 'utilities' | 'gateway'>('chat');
  
  // Chat States
  const [selectedAssistant, setSelectedAssistant] = useState<'Teacher' | 'Student' | 'Parent' | 'Finance' | 'Administrator'>(getDefaultAssistant());
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatProviderId, setChatProviderId] = useState('');
  const [chatModelId, setChatModelId] = useState('');

  // Lesson Planner States
  const [lpTitle, setLpTitle] = useState('Usaha dan Energi Mekanik');
  const [lpSubject, setLpSubject] = useState('Fisika');
  const [lpGrade, setLpGrade] = useState('Kelas X');
  const [lpDuration, setLpDuration] = useState('90');
  const [lpCurriculum, setLpCurriculum] = useState('Kurikulum Merdeka');
  const [lpResult, setLpResult] = useState<any>(null);

  // Question Generator States
  const [qTitle, setQTitle] = useState('Kinematika Gerak Lurus');
  const [qSubject, setQSubject] = useState('Fisika');
  const [qLevel, setQLevel] = useState('SMA');
  const [qType, setQType] = useState<'Essay' | 'Multiple Choice' | 'True False' | 'Case Study'>('Multiple Choice');
  const [qQty, setQQty] = useState('3');
  const [qDifficulty, setQDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD' | 'HOTS'>('HOTS');
  const [qResult, setQResult] = useState<any>(null);

  // Document Generator States
  const [docName, setDocName] = useState('Surat Undangan Rapat Komite');
  const [docType, setDocType] = useState<'Letter' | 'Certificate' | 'Report' | 'Announcement'>('Letter');
  const [docTemplate, setDocTemplate] = useState('Mengundang wali murid musyawarah program asrama tahfidz baru.');
  const [docResult, setDocResult] = useState<any>(null);

  // Report Summary States
  const [repName, setRepName] = useState('Rekap Kehadiran Guru & Santri');
  const [repSource, setRepSource] = useState<'Grade Book' | 'Report Card' | 'PPDB' | 'CBT' | 'LMS' | 'Virtual Classroom' | 'Finance Ledger'>('LMS');
  const [repResult, setRepResult] = useState<any>(null);

  // Utility: Translation States
  const [trSourceLang, setTrSourceLang] = useState<'Indonesia' | 'English' | 'Arabic' | 'Japanese'>('Indonesia');
  const [trTargetLang, setTrTargetLang] = useState<'Indonesia' | 'English' | 'Arabic' | 'Japanese'>('English');
  const [trOriginalText, setTrOriginalText] = useState('Kami berkomitmen melahirkan generasi mandiri yang unggul dalam sains dan mulia dalam akhlak.');
  const [trResultText, setTrResultText] = useState('');

  // Utility: OCR States
  const [ocrFileName, setOcrFileName] = useState('Nota_Kertas_Ujian_A4.jpg');
  const [ocrResultText, setOcrResultText] = useState('');

  // Utility: Speech States
  const [speechJobType, setSpeechJobType] = useState<'TTS' | 'STT'>('TTS');
  const [speechText, setSpeechText] = useState('Selamat pagi bapak dan ibu sekalian. Selamat datang di Portal AI Sekolah.');
  const [speechVoice, setSpeechVoice] = useState('Zephyr (Standard Female)');
  const [speechResultUrl, setSpeechResultUrl] = useState('');
  const [sttStatus, setSttStatus] = useState<'idle' | 'recording' | 'processing'>('idle');

  // Gateway Settings States
  const [setProviderId, setSetProviderId] = useState('');
  const [setModelId, setSetModelId] = useState('');
  const [setSafety, setSetSafety] = useState<'STANDARD' | 'STRICT' | 'LAX'>('STANDARD');
  const [setCache, setSetCache] = useState(true);
  const [setAudit, setSetAudit] = useState(true);
  const [setBudgetLimit, setSetBudgetLimit] = useState('150');
  const [setAlertPercent, setSetAlertPercent] = useState('80');

  // Load Database Lists
  const { data: analytics, refetch: refetchAnalytics } = useQuery({
    queryKey: ['aiAnalytics'],
    queryFn: async () => {
      const res = await axios.post('/api/action?action=aiAnalytics', {});
      return res.data?.data;
    }
  });

  const { data: providers } = useQuery({
    queryKey: ['aiProviders'],
    queryFn: async () => {
      const res = await axios.post('/api/action?action=aiProviderList', {});
      return res.data?.data;
    }
  });

  const { data: models } = useQuery({
    queryKey: ['aiModels'],
    queryFn: async () => {
      const res = await axios.post('/api/action?action=aiModelList', {});
      return res.data?.data;
    }
  });

  const { data: conversations, refetch: refetchConversations } = useQuery({
    queryKey: ['aiConversations'],
    queryFn: async () => {
      const res = await axios.post('/api/action?action=aiChat', {});
      return res.data?.data;
    }
  });

  const { data: messages, refetch: refetchMessages } = useQuery({
    queryKey: ['aiMessages', activeConvId],
    queryFn: async () => {
      if (!activeConvId) return [];
      const res = await axios.post('/api/action?action=aiChat', { conversation_id: activeConvId });
      return res.data?.data;
    },
    enabled: !!activeConvId
  });

  // Default Selects
  useEffect(() => {
    if (providers?.length && !chatProviderId) {
      setChatProviderId(providers[0].id);
      setSetProviderId(providers[0].id);
    }
  }, [providers]);

  useEffect(() => {
    if (models?.length && !chatModelId) {
      setChatModelId(models[0].id);
      setSetModelId(models[0].id);
    }
  }, [models]);

  useEffect(() => {
    if (analytics?.cost) {
      setSetBudgetLimit(String(analytics.cost.monthly_budget_limit || 150));
      setSetAlertPercent(String(analytics.cost.alert_threshold_percent || 80));
    }
  }, [analytics]);

  // Mutations
  const chatMutation = useMutation({
    mutationFn: async (payload: { conversation_id: string | null; message: string; assistant_type: string; provider_id: string; model_id: string }) => {
      const res = await axios.post('/api/action?action=aiChat', payload);
      return res.data;
    },
    onSuccess: (data) => {
      setChatMessage('');
      refetchConversations();
      refetchAnalytics();
      if (!activeConvId && data?.data?.conversation?.id) {
        setActiveConvId(data.data.conversation.id);
      } else {
        refetchMessages();
      }
    }
  });

  const lpMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axios.post('/api/action?action=aiLessonPlanner', payload);
      return res.data?.data;
    },
    onSuccess: (data) => {
      setLpResult(data);
      refetchAnalytics();
    }
  });

  const qMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axios.post('/api/action?action=aiQuestionGenerator', payload);
      return res.data?.data;
    },
    onSuccess: (data) => {
      setQResult(data);
      refetchAnalytics();
    }
  });

  const docMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axios.post('/api/action?action=aiDocumentGenerator', payload);
      return res.data?.data;
    },
    onSuccess: (data) => {
      setDocResult(data);
      refetchAnalytics();
    }
  });

  const repMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axios.post('/api/action?action=aiReportSummary', payload);
      return res.data?.data;
    },
    onSuccess: (data) => {
      setRepResult(data);
      refetchAnalytics();
    }
  });

  const transMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axios.post('/api/action?action=aiTranslation', payload);
      return res.data?.data;
    },
    onSuccess: (data) => {
      setTrResultText(data?.translated_text || '');
      refetchAnalytics();
    }
  });

  const ocrMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axios.post('/api/action?action=aiOCR', payload);
      return res.data?.data;
    },
    onSuccess: (data) => {
      setOcrResultText(data?.extracted_text || '');
      refetchAnalytics();
    }
  });

  const speechMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axios.post('/api/action?action=aiSpeech', payload);
      return res.data?.data;
    },
    onSuccess: (data) => {
      if (speechJobType === 'TTS') {
        setSpeechResultUrl(data?.file_url || '');
      } else {
        setSpeechText(data?.input_text || '');
      }
      refetchAnalytics();
    }
  });

  const configMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axios.post('/api/action?action=aiConfigSave', payload);
      return res.data;
    },
    onSuccess: () => {
      refetchAnalytics();
      alert('Konfigurasi berhasil disimpan!');
    }
  });

  const handleSendChatMessage = () => {
    if (!chatMessage.trim()) return;
    chatMutation.mutate({
      conversation_id: activeConvId,
      message: chatMessage,
      assistant_type: selectedAssistant,
      provider_id: chatProviderId,
      model_id: chatModelId
    });
  };

  // Recharts Processors
  const pieData = [
    { name: 'Teacher', value: analytics?.logs?.filter((l: any) => l.endpoint === 'aiTeacherAssistant' || l.endpoint === 'aiLessonPlanner').length || 1, color: '#3b82f6' },
    { name: 'Student', value: analytics?.logs?.filter((l: any) => l.endpoint === 'aiStudentAssistant' || l.endpoint === 'aiQuestionGenerator').length || 2, color: '#10b981' },
    { name: 'Parent', value: analytics?.logs?.filter((l: any) => l.endpoint === 'aiParentAssistant').length || 1, color: '#f59e0b' },
    { name: 'Finance & Admin', value: analytics?.logs?.filter((l: any) => l.endpoint === 'aiFinanceAssistant' || l.endpoint === 'aiDocumentGenerator' || l.endpoint === 'aiReportSummary').length || 1, color: '#ec4899' },
  ];

  const barData = analytics?.logs?.slice(-6).map((l: any, i: number) => ({
    name: `L-${i+1}`,
    tokens: l.total_tokens || 350,
    cost: parseFloat((l.estimated_cost * 1000).toFixed(4))
  })) || [
    { name: 'A-1', tokens: 120, cost: 0.1 },
    { name: 'A-2', tokens: 420, cost: 0.35 },
    { name: 'A-3', tokens: 280, cost: 0.22 },
  ];

  // Accent Color Theme based on tenant type
  const themeAccent = isPondok ? 'teal' : 'blue';
  const textAccent = isPondok ? 'text-teal-600' : 'text-blue-600';
  const bgAccent = isPondok ? 'bg-teal-600' : 'bg-blue-600';
  const bgAccentHover = isPondok ? 'hover:bg-teal-700' : 'hover:bg-blue-700';
  const bgAccentLight = isPondok ? 'bg-teal-50' : 'bg-blue-50';
  const borderAccent = isPondok ? 'border-teal-200' : 'border-blue-200';
  const ringAccent = isPondok ? 'focus:ring-teal-500' : 'focus:ring-blue-500';

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${bgAccentLight} ${textAccent}`}>
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">AI Copilot & Smart Gateway</h1>
            <p className="text-slate-500 text-xs">Platform Integrasi Kecerdasan Buatan Multi-Role & Multi-Provider Instansi (Sprint 21)</p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 self-stretch md:self-auto overflow-x-auto">
          <button 
            onClick={() => setActiveTab('chat')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'chat' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Asisten Chat</span>
          </button>
          <button 
            onClick={() => setActiveTab('generators')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'generators' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Modul & Soal</span>
          </button>
          <button 
            onClick={() => setActiveTab('utilities')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'utilities' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <ArrowRightLeft className="h-4 w-4" />
            <span>AI Utility</span>
          </button>
          {isSuperAdmin && (
            <button 
              onClick={() => setActiveTab('gateway')} 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'gateway' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Settings className="h-4 w-4" />
              <span>Gateway & Cost</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Switcher */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[600px]">
          
          {/* Chat Sidebar: Session listing & Assistant Roles */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Assistant Roles Selection */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Bot className="h-4 w-4 text-slate-400" />
                <span>Asisten Multi-Role</span>
              </h3>
              <div className="flex flex-col gap-1.5">
                {[
                  { id: 'Teacher', name: 'Asisten Guru', desc: 'Materi, RPP, kisi-kisi' },
                  { id: 'Student', name: 'Asisten Siswa', desc: 'Tutor, ringkasan, latihan' },
                  { id: 'Parent', name: 'Asisten Orang Tua', desc: 'Konsultan santri, tips' },
                  { id: 'Finance', name: 'Asisten Keuangan', desc: 'Arus kas, budget sekolah' },
                  { id: 'Administrator', name: 'Asisten Admin', desc: 'Surat dinas, notulensi' }
                ].map((as) => (
                  <button
                    key={as.id}
                    onClick={() => {
                      setSelectedAssistant(as.id as any);
                      setActiveConvId(null);
                    }}
                    className={`w-full flex flex-col items-start px-3.5 py-2.5 rounded-xl border text-left transition-all group ${
                      selectedAssistant === as.id && !activeConvId
                        ? `bg-slate-50 ${borderAccent} border-2`
                        : 'bg-white border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`text-xs font-bold ${selectedAssistant === as.id && !activeConvId ? textAccent : 'text-slate-700'}`}>{as.name}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{as.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Past Conversations List */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex-1 flex flex-col gap-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sesi Aktif Terakhir</h3>
              <div className="flex-1 overflow-y-auto max-h-[300px] flex flex-col gap-1.5 pr-1">
                {conversations?.map((conv: any) => (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setActiveConvId(conv.id);
                      setSelectedAssistant(conv.assistant_type);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all ${
                      activeConvId === conv.id 
                        ? `${bgAccentLight} ${textAccent} font-semibold` 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <MessageSquare className="h-4 w-4 shrink-0" />
                    <div className="overflow-hidden">
                      <p className="text-xs truncate">{conv.title}</p>
                      <p className="text-[9px] text-slate-400 font-mono">Role: {conv.assistant_type}</p>
                    </div>
                  </button>
                ))}
                {conversations?.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-6 font-mono">Belum ada sesi percakapan.</p>
                )}
              </div>
              
              <button 
                onClick={() => setActiveConvId(null)} 
                className={`w-full py-2 border border-dashed ${borderAccent} ${textAccent} ${bgAccentLight} hover:bg-opacity-80 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all`}
              >
                <Plus className="h-4 w-4" />
                <span>Mulai Obrolan Baru</span>
              </button>
            </div>
          </div>

          {/* Active Chat Interface */}
          <div className="lg:col-span-3 flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden h-[600px]">
            
            {/* Chat Top Bar */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className={`h-2.5 w-2.5 rounded-full bg-emerald-500`} />
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    {activeConvId ? 'Sesi Obrolan Terbuka' : `Mulai Obrolan: ${selectedAssistant === 'Teacher' ? 'Asisten Guru' : selectedAssistant === 'Student' ? 'Asisten Siswa' : selectedAssistant === 'Parent' ? 'Asisten Orang Tua' : selectedAssistant === 'Finance' ? 'Asisten Keuangan' : 'Asisten Admin'}`}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">Routing Adapter: AI Gateway Smart Routing Mode</p>
                </div>
              </div>

              {/* Provider Selection for Chat */}
              <div className="flex items-center gap-2">
                <select 
                  value={chatProviderId} 
                  onChange={(e) => setChatProviderId(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg text-[10px] px-2 py-1 font-semibold text-slate-600 focus:outline-none"
                >
                  {providers?.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <select 
                  value={chatModelId} 
                  onChange={(e) => setChatModelId(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg text-[10px] px-2 py-1 font-semibold text-slate-600 focus:outline-none"
                >
                  {models?.filter((m: any) => m.provider_id === chatProviderId)?.map((m: any) => (
                    <option key={m.id} value={m.id}>{m.model_code}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Chat Output Area */}
            <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 bg-[#f8fafc]/50">
              
              {/* Initial Welcomer message if no conversation is loaded */}
              {!activeConvId && (
                <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto gap-3">
                  <div className={`p-4 rounded-full ${bgAccentLight} ${textAccent}`}>
                    <Bot className="h-8 w-8 animate-bounce" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700">Hubungkan Otomatisasi dengan {selectedAssistant === 'Teacher' ? 'Asisten Guru' : selectedAssistant === 'Student' ? 'Tutor Siswa' : selectedAssistant === 'Parent' ? 'Asisten Wali Murid' : selectedAssistant === 'Finance' ? 'Asisten Keuangan' : 'Asisten Admin'}</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">Masukkan instruksi awal, pertanyaan akademis, penyusunan rencana materi, atau rekap draf administrasi sekolah untuk mulai berdiskusi secara real-time.</p>
                </div>
              )}

              {activeConvId && messages?.map((msg: any) => (
                <div 
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold ${msg.role === 'user' ? 'bg-indigo-600' : bgAccent}`}>
                    {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`p-4 rounded-2xl text-xs flex flex-col gap-1.5 ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 rounded-tl-none shadow-sm text-slate-700'}`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    <span className={`text-[8px] self-end font-mono ${msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {msg.role === 'assistant' ? `Est. Cost: $${parseFloat(msg.cost || 0).toFixed(6)} | Token: ${msg.token_count}` : `Token: ${msg.token_count}`}
                    </span>
                  </div>
                </div>
              ))}

              {chatMutation.isPending && (
                <div className="flex gap-3 max-w-[80%] self-start animate-pulse">
                  <div className={`h-8 w-8 rounded-full ${bgAccent} flex items-center justify-center text-white text-xs`}>
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none text-xs text-slate-400 font-mono">
                    Memproses tanggapan dari AI Gateway Adapter...
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input Bottom Bar */}
            <div className="p-4 border-t border-slate-100 flex gap-2 bg-white">
              <input
                type="text"
                placeholder="Tulis instruksi atau koordinasi akademik di sini..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs focus:outline-none focus:border-slate-300 focus:bg-white"
              />
              <button
                onClick={handleSendChatMessage}
                disabled={chatMutation.isPending || !chatMessage.trim()}
                className={`px-5 py-3 ${bgAccent} ${bgAccentHover} text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50`}
              >
                <span>Kirim</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'generators' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Form selectors left side */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Lesson Planner Form */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              <h3 className={`text-sm font-bold flex items-center gap-2 ${textAccent}`}>
                <BookOpen className="h-4 w-4" />
                <span>Pembuat RPP (Kurikulum Merdeka)</span>
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Materi Pokok / Judul</label>
                  <input type="text" value={lpTitle} onChange={(e) => setLpTitle(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mata Pelajaran</label>
                  <input type="text" value={lpSubject} onChange={(e) => setLpSubject(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tingkatan / Kelas</label>
                  <input type="text" value={lpGrade} onChange={(e) => setLpGrade(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Durasi (Menit)</label>
                  <input type="number" value={lpDuration} onChange={(e) => setLpDuration(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sistem Kurikulum</label>
                  <select value={lpCurriculum} onChange={(e) => setLpCurriculum(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50">
                    <option value="Kurikulum Merdeka">Kurikulum Merdeka</option>
                    <option value="Kurikulum 2013">K-13 Revisi</option>
                    <option value="KTSP 2006">KTSP</option>
                  </select>
                </div>
              </div>
              <button
                onClick={() => lpMutation.mutate({ title: lpTitle, subject: lpSubject, grade_level: lpGrade, duration_minutes: lpDuration, curriculum: lpCurriculum })}
                disabled={lpMutation.isPending}
                className={`w-full py-2.5 ${bgAccent} ${bgAccentHover} text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50`}
              >
                {lpMutation.isPending ? 'Menyusun RPP...' : 'Generate RPP Kurikulum Merdeka'}
              </button>
            </div>

            {/* HOTS Question Generator Form */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              <h3 className={`text-sm font-bold flex items-center gap-2 text-indigo-600`}>
                <HelpCircle className="h-4 w-4" />
                <span>Pembuat Kuis & Soal HOTS</span>
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Topik Soal / KD</label>
                  <input type="text" value={qTitle} onChange={(e) => setQTitle(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mata Pelajaran</label>
                  <input type="text" value={qSubject} onChange={(e) => setQSubject(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Jenjang Pendidikan</label>
                  <input type="text" value={qLevel} onChange={(e) => setQLevel(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tipe Asesmen</label>
                  <select value={qType} onChange={(e: any) => setQType(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50">
                    <option value="Multiple Choice">Pilihan Ganda</option>
                    <option value="Essay">Esai Terbuka</option>
                    <option value="True False">Benar / Salah</option>
                    <option value="Case Study">Studi Kasus</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kesulitan</label>
                  <select value={qDifficulty} onChange={(e: any) => setQDifficulty(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50">
                    <option value="EASY">Mudah</option>
                    <option value="MEDIUM">Sedang</option>
                    <option value="HARD">Sukar</option>
                    <option value="HOTS">HOTS (Analitis Tinggi)</option>
                  </select>
                </div>
              </div>
              <button
                onClick={() => qMutation.mutate({ title: qTitle, subject: qSubject, education_level: qLevel, question_type: qType, quantity: qQty, difficulty: qDifficulty })}
                disabled={qMutation.isPending}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {qMutation.isPending ? 'Menghasilkan Soal...' : 'Generate Soal HOTS & Jawaban'}
              </button>
            </div>

            {/* Document and Report Generator forms */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-slate-400" />
                <span>Administrasi & Laporan</span>
              </h3>
              
              <div className="flex flex-col gap-3">
                {/* Official Letter Form */}
                <div className="border border-slate-100 p-3 rounded-xl bg-slate-50/50 flex flex-col gap-2.5">
                  <p className="text-[10px] font-bold text-slate-700">1. Generator Surat Dinas & SK</p>
                  <div className="text-xs flex flex-col gap-1.5">
                    <input type="text" value={docName} onChange={(e) => setDocName(e.target.value)} placeholder="Nama Surat" className="border border-slate-200 rounded px-2 py-1 bg-white" />
                    <textarea value={docTemplate} onChange={(e) => setDocTemplate(e.target.value)} placeholder="Tujuan / Isi ringkas" rows={2} className="border border-slate-200 rounded px-2 py-1 bg-white" />
                  </div>
                  <button 
                    onClick={() => docMutation.mutate({ name: docName, doc_type: docType, prompt_template: docTemplate })}
                    disabled={docMutation.isPending}
                    className="py-1.5 bg-slate-700 hover:bg-slate-800 text-white text-[10px] font-bold rounded transition-all disabled:opacity-50"
                  >
                    Generate Surat Dinas Resmi
                  </button>
                </div>

                {/* Analytical Report Card Form */}
                <div className="border border-slate-100 p-3 rounded-xl bg-slate-50/50 flex flex-col gap-2.5">
                  <p className="text-[10px] font-bold text-slate-700">2. Analis Rapor & Rekapitulasi Rapat</p>
                  <div className="text-xs flex flex-col gap-1.5">
                    <input type="text" value={repName} onChange={(e) => setRepName(e.target.value)} placeholder="Nama Laporan" className="border border-slate-200 rounded px-2 py-1 bg-white" />
                    <select value={repSource} onChange={(e: any) => setRepSource(e.target.value)} className="border border-slate-200 rounded px-2 py-1 bg-white">
                      <option value="Grade Book">Buku Nilai (Grade Book)</option>
                      <option value="Report Card">Rapor Semester</option>
                      <option value="LMS">Progres Belajar LMS</option>
                      <option value="Finance Ledger">Ledger Pembayaran SPP</option>
                    </select>
                  </div>
                  <button 
                    onClick={() => repMutation.mutate({ name: repName, report_source: repSource })}
                    disabled={repMutation.isPending}
                    className="py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded transition-all disabled:opacity-50"
                  >
                    Summarize Snapshot Data
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Render Result Screen right side */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Display Board Area */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-h-[500px] flex flex-col gap-4">
              
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Dokumen Hasil Generasi AI</h3>
                  <p className="text-[10px] text-slate-400 font-mono">Output Format: Standardized Academic Markdown</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-[9px] bg-slate-100 border text-slate-500 font-bold px-2 py-1 rounded">
                    Auto-Save Active
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[600px] bg-slate-50/50 border border-slate-100 rounded-xl p-5 text-slate-700 leading-relaxed text-xs">
                
                {/* Default display if nothing generated */}
                {!lpResult && !qResult && !docResult && !repResult && (
                  <div className="flex flex-col items-center justify-center h-full text-center py-16 gap-3">
                    <FileText className="h-10 w-10 text-slate-300 shrink-0" />
                    <h4 className="text-xs font-bold text-slate-500">Menunggu Input Generasi</h4>
                    <p className="text-slate-400 text-[11px] max-w-sm">Pilih dan isi formulir modul di sebelah kiri, lalu tekan tombol Generate untuk memproyeksikan dokumen administrasi ke papan hasil ini.</p>
                  </div>
                )}

                {/* Lesson Planner Output Display */}
                {lpResult && (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    <div className={`p-4 border rounded-xl ${bgAccentLight} ${borderAccent} flex items-center justify-between`}>
                      <div>
                        <p className="font-extrabold text-slate-800">{lpResult.planner?.title}</p>
                        <p className="text-[10px] text-slate-500">Mata Pelajaran: {lpResult.planner?.subject} | Kurikulum: {lpResult.planner?.curriculum}</p>
                      </div>
                      <span className={`text-[10px] ${bgAccent} text-white font-bold px-3 py-1 rounded-full`}>{lpResult.planner?.grade_level}</span>
                    </div>

                    <div className="flex flex-col gap-3">
                      <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Timeline Pembelajaran ({lpResult.planner?.duration_minutes} Menit)</p>
                      <div className="relative border-l border-slate-200 ml-2 pl-4 space-y-4">
                        {lpResult.lesson?.activities?.map((act: any) => (
                          <div key={act.step} className="relative">
                            <div className={`absolute -left-[21px] top-1.5 h-3 w-3 rounded-full border-2 border-white ${bgAccent}`} />
                            <div className="bg-white border rounded-lg p-3 shadow-sm">
                              <p className="font-bold text-slate-800 flex justify-between">
                                <span>{act.title}</span>
                                <span className={`text-[10px] ${textAccent} font-mono`}>{act.duration_minutes} Menit</span>
                              </p>
                              <p className="text-slate-500 text-[11px] mt-1">{act.detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-4 mt-2">
                      <h4 className="font-bold text-slate-800 text-sm mb-2">Modul Lengkap (Markdown)</h4>
                      <pre className="whitespace-pre-wrap font-sans leading-relaxed text-slate-600 bg-white p-4 border rounded-xl">{lpResult.lesson?.content_raw}</pre>
                    </div>
                  </div>
                )}

                {/* Question Generator Output Display */}
                {qResult && (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    <div className="p-4 border border-indigo-150 rounded-xl bg-indigo-50/30">
                      <p className="font-extrabold text-slate-800">{qResult.qgen?.title}</p>
                      <p className="text-[10px] text-slate-500">Subjek: {qResult.qgen?.subject} | Difficulty: {qResult.qgen?.difficulty}</p>
                    </div>

                    <div className="space-y-4">
                      {qResult.questions?.map((q: any, i: number) => (
                        <div key={q.id} className="bg-white border rounded-xl p-4 shadow-sm flex flex-col gap-2">
                          <p className="font-bold text-slate-800 flex items-start gap-1">
                            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0">Soal {i+1}</span>
                            <span>{q.question_text}</span>
                          </p>
                          
                          {/* Options if MC */}
                          {q.options && (
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              {q.options.map((opt: string) => (
                                <div key={opt} className={`p-2 border rounded-lg text-[11px] ${opt === q.correct_answer ? 'border-emerald-200 bg-emerald-50/50 text-emerald-800 font-bold' : 'border-slate-150 text-slate-600'}`}>
                                  {opt}
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="bg-slate-50 p-2.5 rounded-lg border text-[11px] text-slate-500 mt-2">
                            <p className="font-bold text-slate-700 flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Pembahasan (HOTS Cognitive {q.cognitive_level || 'C3'}):</span>
                            </p>
                            <p className="mt-1">{q.explanation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Official Letter Output Display */}
                {docResult && (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    <div className="bg-white border border-slate-200 p-8 rounded-xl shadow-sm text-slate-700 max-w-2xl mx-auto space-y-6">
                      {/* Kop Surat Header */}
                      <div className="text-center border-b-2 border-slate-800 pb-3 flex flex-col items-center">
                        <GraduationCap className="h-8 w-8 text-slate-800" />
                        <h2 className="font-extrabold text-sm uppercase tracking-wider text-slate-800">Pondok Pesantren & Sekolah Unggulan Nusantara</h2>
                        <p className="text-[9px] text-slate-500 font-serif">Alamat: Jl. Raya Pendidikan No. 45, Jakarta Selatan | Telp: (021) 459-0021</p>
                      </div>
                      
                      {/* Body */}
                      <div className="whitespace-pre-wrap font-serif text-[11px] leading-relaxed">
                        {docResult.document?.content}
                      </div>
                    </div>
                  </div>
                )}

                {/* Analytical Report Summary Output Display */}
                {repResult && (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex justify-between items-center">
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-xs">{repResult.summary?.title}</h4>
                        <p className="text-[10px] text-slate-500">Source: {repResult.generator?.report_source} Snapshot</p>
                      </div>
                      <span className="text-[9px] bg-emerald-600 text-white font-bold px-2.5 py-0.5 rounded font-mono">SNAPSHOT ANALYZED</span>
                    </div>

                    <div className="bg-white border p-4 rounded-xl flex flex-col gap-3">
                      <p className="font-extrabold text-slate-700 uppercase text-[10px] tracking-wide">Rekomendasi Tindakan (Action Items)</p>
                      <ul className="space-y-1.5 pl-4 list-disc text-slate-600 text-[11px]">
                        {repResult.summary?.action_items?.map((item: string, idx: number) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="whitespace-pre-wrap font-mono text-[10px] bg-slate-900 text-emerald-400 p-4 rounded-xl leading-relaxed">
                      {repResult.summary?.summary_markdown}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'utilities' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Translation Module */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <h3 className={`text-sm font-bold flex items-center gap-2 ${textAccent}`}>
              <Globe className="h-4 w-4" />
              <span>AI Multi-Lingual Translator</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 mb-1">DARI BAHASA</label>
                <select value={trSourceLang} onChange={(e: any) => setTrSourceLang(e.target.value)} className="w-full border rounded p-1.5 bg-slate-50 font-semibold">
                  <option value="Indonesia">Bahasa Indonesia</option>
                  <option value="English">English</option>
                  <option value="Arabic">العربية (Arabic)</option>
                  <option value="Japanese">日本語 (Japanese)</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-500 mb-1">KE BAHASA</label>
                <select value={trTargetLang} onChange={(e: any) => setTrTargetLang(e.target.value)} className="w-full border rounded p-1.5 bg-slate-50 font-semibold">
                  <option value="English">English</option>
                  <option value="Indonesia">Bahasa Indonesia</option>
                  <option value="Arabic">العربية (Arabic)</option>
                  <option value="Japanese">日本語 (Japanese)</option>
                </select>
              </div>
            </div>

            <div className="text-xs flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Input Kalimat / Naskah</label>
              <textarea 
                value={trOriginalText} 
                onChange={(e) => setTrOriginalText(e.target.value)} 
                rows={4} 
                className="w-full border rounded-xl p-3 bg-slate-50"
              />
            </div>

            <button 
              onClick={() => transMutation.mutate({ source_language: trSourceLang, target_language: trTargetLang, original_text: trOriginalText })}
              disabled={transMutation.isPending}
              className={`w-full py-2 ${bgAccent} ${bgAccentHover} text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-all disabled:opacity-50`}
            >
              {transMutation.isPending ? 'Menerjemahkan...' : 'Proses Terjemahan'}
            </button>

            {trResultText && (
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <p className="font-bold text-slate-700 uppercase text-[9px] mb-1">Hasil Terjemahan:</p>
                <p className="text-slate-800 leading-relaxed italic">{trResultText}</p>
              </div>
            )}
          </div>

          {/* OCR Document Reader */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-bold flex items-center gap-2 text-indigo-600">
              <ScanLine className="h-4 w-4" />
              <span>AI OCR (Ekstraksi Berkas Sekolah)</span>
            </h3>

            <div className="text-xs flex flex-col gap-3">
              <p className="text-slate-400 text-[11px]">Simulasikan pengunggahan dokumen pendaftaran siswa baru (PPDB) atau kwitansi ATK operasional untuk diringkas teksnya secara otomatis oleh OCR.</p>
              
              <div className="border border-dashed border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col items-center justify-center text-center gap-1">
                <FileText className="h-6 w-6 text-slate-400" />
                <span className="font-bold text-slate-700 text-[11px] mt-1">{ocrFileName}</span>
                <span className="text-[9px] text-slate-400">File size: 1.4 MB | Format: JPG</span>
              </div>
            </div>

            <button 
              onClick={() => ocrMutation.mutate({ file_name: ocrFileName, file_url: '/demo/ocr.jpg', file_type: 'Image' })}
              disabled={ocrMutation.isPending}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-all disabled:opacity-50"
            >
              {ocrMutation.isPending ? 'Mengekstrak Teks...' : 'Ekstrak Dokumen via AI OCR'}
            </button>

            {ocrResultText && (
              <div className="bg-slate-900 text-emerald-400 p-3.5 rounded-xl font-mono text-[10px] leading-relaxed">
                <p className="text-slate-400 border-b border-slate-800 pb-1.5 mb-1.5 text-[9px] uppercase tracking-wide font-sans font-bold">Hasil Pembacaan Dokumen:</p>
                {ocrResultText}
              </div>
            )}
          </div>

          {/* Speech Ready (TTS/STT) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-bold flex items-center gap-2 text-emerald-600">
              <Volume2 className="h-4 w-4" />
              <span>AI Speech (TTS & STT Engine)</span>
            </h3>

            <div className="flex bg-slate-150 p-1 rounded-lg border text-xs">
              <button 
                onClick={() => setSpeechJobType('TTS')}
                className={`flex-1 py-1 rounded font-bold text-center ${speechJobType === 'TTS' ? 'bg-white text-slate-800' : 'text-slate-500'}`}
              >
                Text-to-Speech
              </button>
              <button 
                onClick={() => setSpeechJobType('STT')}
                className={`flex-1 py-1 rounded font-bold text-center ${speechJobType === 'STT' ? 'bg-white text-slate-800' : 'text-slate-500'}`}
              >
                Speech-to-Text
              </button>
            </div>

            {speechJobType === 'TTS' ? (
              <div className="text-xs flex flex-col gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 mb-1 uppercase">Pilih Suara Narator</label>
                  <select value={speechVoice} onChange={(e) => setSpeechVoice(e.target.value)} className="w-full border rounded p-1.5 bg-slate-50 font-semibold">
                    <option value="Zephyr (Standard Female)">Zephyr (Standard Female)</option>
                    <option value="Triton (Deep Male)">Triton (Deep Male)</option>
                    <option value="Lyra (Expressive Indonesian)">Lyra (Expressive Indonesian)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 mb-1 uppercase">Teks untuk Disuarakan</label>
                  <textarea value={speechText} onChange={(e) => setSpeechText(e.target.value)} rows={3} className="w-full border rounded-xl p-2 bg-slate-50" />
                </div>

                <button 
                  onClick={() => speechMutation.mutate({ job_type: 'TTS', input_text: speechText, voice_name: speechVoice })}
                  disabled={speechMutation.isPending}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-all disabled:opacity-50"
                >
                  {speechMutation.isPending ? 'Sintesis Audio...' : 'Generate Suara AI'}
                </button>

                {speechResultUrl && (
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-emerald-800 text-[11px] flex items-center gap-1">
                        <Volume2 className="h-3.5 w-3.5 shrink-0" />
                        <span>Sintesis Berhasil</span>
                      </p>
                      <p className="text-[10px] text-emerald-600">File: {speechVoice.split(' ')[0].toLowerCase()}_speech.mp3</p>
                    </div>
                    <button onClick={() => alert('Audio Playback: Memutar suara AI...')} className="p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700">
                      <Play className="h-4 w-4 fill-white" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs flex flex-col gap-4">
                <p className="text-slate-400 text-[11px]">Transkripsikan rekaman pidato, briefing guru, atau setoran hafalan santri dari berkas audio menjadi draf teks.</p>
                
                <div className="border border-dashed border-slate-200 rounded-xl p-6 bg-slate-50/50 flex flex-col items-center justify-center text-center gap-3">
                  <Mic className="h-8 w-8 text-slate-400 animate-pulse" />
                  <div>
                    <span className="font-bold text-slate-700 block text-[11px]">Mulai Merekam Pembicaraan</span>
                    <span className="text-[9px] text-slate-400">Gunakan mic internal perangkat Anda</span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setSttStatus('processing');
                    setTimeout(() => {
                      speechMutation.mutate({ job_type: 'STT', file_url: '/demo/voice_briefing.wav' });
                      setSttStatus('idle');
                    }, 1500);
                  }}
                  disabled={sttStatus !== 'idle'}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-all disabled:opacity-50"
                >
                  {sttStatus === 'processing' ? 'Menganalisis Gelombang Audio...' : 'Simulasikan Rekam & Transkrip'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'gateway' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* AI Gateway Analytics Card Left side */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Visual Charts panel */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Metrik Penggunaan Token & Cost Gateway</h3>
                  <p className="text-[10px] text-slate-400 font-mono">Telemetry Logs: Active API Integrations</p>
                </div>
                <div className="flex gap-1">
                  <span className="text-[9px] bg-slate-100 border text-slate-600 font-bold px-2 py-0.5 rounded font-mono">USD</span>
                </div>
              </div>

              {/* Recharts BarChart integration */}
              <div className="h-[200px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    <Bar dataKey="cost" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                      {barData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#6366f1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Summary telemetry boxes */}
              <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4 mt-2 text-center text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Total Spent</p>
                  <p className={`text-base font-extrabold ${textAccent} font-mono mt-0.5`}>${analytics?.cost?.total_spent_usd || '12.45'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Limit Anggaran</p>
                  <p className="text-base font-extrabold text-slate-700 font-mono mt-0.5">${analytics?.cost?.monthly_budget_limit || '150.00'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Total Tokens</p>
                  <p className="text-base font-extrabold text-slate-700 font-mono mt-0.5">{analytics?.tokenUsage?.total_tokens_spent || '6,100'}</p>
                </div>
              </div>
            </div>

            {/* Provider and Adapter List */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              <h3 className="text-sm font-bold text-slate-800">Daftar Provider & Adapter Hub (Adapter Pattern)</h3>
              
              <div className="flex flex-col gap-3">
                {providers?.map((p: any) => (
                  <div key={p.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg bg-white border text-slate-600`}>
                        <Bot className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                          <span>{p.name}</span>
                          <span className="text-[9px] bg-indigo-100 text-indigo-700 font-mono px-1.5 py-0.5 rounded uppercase font-bold">Adapter Active</span>
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">{p.api_endpoint}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Active Models badge */}
                      <span className="text-[10px] text-slate-500 font-bold bg-white px-2 py-1 border rounded-lg">
                        {models?.filter((m: any) => m.provider_id === p.id).length} Active Models
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${p.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        <span className="text-xs font-semibold text-slate-600">{p.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Configuration Form Right side */}
          <div className="flex flex-col gap-6">
            
            {/* Safety & Budget Form limit */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-slate-400" />
                <span>Pengaturan Batas & Proteksi</span>
              </h3>

              <div className="text-xs flex flex-col gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Penyaring Keamanan (Safety Filter)</label>
                  <select value={setSafety} onChange={(e: any) => setSetSafety(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 font-semibold text-slate-700">
                    <option value="STANDARD">Penyaringan Standar (Rekomendasi)</option>
                    <option value="STRICT">Ketat (Saring Isu Sensitif)</option>
                    <option value="LAX">Lax (Longgar / Fleksibel)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Batas Anggaran Bulanan (USD Limit)</label>
                  <input type="number" value={setBudgetLimit} onChange={(e) => setSetBudgetLimit(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 font-mono" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Peringatan Kuota Anggaran (%)</label>
                  <input type="number" value={setAlertPercent} onChange={(e) => setSetAlertPercent(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 font-mono" />
                </div>

                <div className="flex items-center gap-4 py-1.5 border-t border-b border-slate-100 my-1">
                  <label className="flex items-center gap-2 select-none font-bold text-[10px] text-slate-500 uppercase cursor-pointer">
                    <input type="checkbox" checked={setCache} onChange={(e) => setSetCache(e.target.checked)} className="rounded text-indigo-600 focus:ring-0 cursor-pointer" />
                    <span>Aktifkan Cache AI Response</span>
                  </label>
                  <label className="flex items-center gap-2 select-none font-bold text-[10px] text-slate-500 uppercase cursor-pointer">
                    <input type="checkbox" checked={setAudit} onChange={(e) => setSetAudit(e.target.checked)} className="rounded text-indigo-600 focus:ring-0 cursor-pointer" />
                    <span>Audit Log Aktivitas</span>
                  </label>
                </div>
              </div>

              <button
                onClick={() => configMutation.mutate({ default_provider_id: setProviderId, default_model_id: setModelId, system_safety_filter: setSafety, enable_cache: setCache, enable_audit_log: setAudit, monthly_budget_limit: setBudgetLimit, alert_threshold_percent: setAlertPercent })}
                disabled={configMutation.isPending}
                className={`w-full py-2.5 ${bgAccent} ${bgAccentHover} text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-all disabled:opacity-50`}
              >
                {configMutation.isPending ? 'Menyimpan...' : 'Simpan Batas Anggaran'}
              </button>
            </div>

            {/* Audit Logs History */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex-1 flex flex-col gap-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Log Audit Aktivitas AI</h3>
              
              <div className="flex-1 overflow-y-auto max-h-[250px] flex flex-col gap-2">
                {analytics?.logs?.map((l: any) => (
                  <div key={l.id} className="border-b border-slate-100 pb-2 text-[10px] text-slate-500 leading-normal font-mono flex flex-col gap-0.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-700">{l.endpoint}</span>
                      <span className="text-slate-400">{new Date(l.created_at).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Model: {l.model}</span>
                      <span className="font-bold text-slate-600">${parseFloat(l.estimated_cost || 0).toFixed(5)}</span>
                    </div>
                  </div>
                ))}
                {analytics?.logs?.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-8 font-mono">Belum ada log transaksi.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
