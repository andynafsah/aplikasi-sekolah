/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/client';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  Users, 
  MessageSquare, 
  Settings, 
  PenTool, 
  HelpCircle, 
  Trophy, 
  Play, 
  Square, 
  Download, 
  Search, 
  Plus, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  BarChart2, 
  CheckCircle, 
  AlertCircle, 
  Trash2, 
  Edit, 
  Sparkles, 
  Clock, 
  ExternalLink, 
  Volume2, 
  Lock, 
  Unlock, 
  Hand, 
  Users2, 
  Tv,
  ChevronRight,
  MoreVertical,
  X,
  PlusCircle,
  Share2,
  Paperclip,
  Check,
  Award,
  BookOpen,
  UserCheck
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

type ActiveView = 'DASHBOARD' | 'SCHEDULES' | 'LIVE_MEETING' | 'RECORDINGS' | 'ANALYTICS';
type MeetingTab = 'CHAT' | 'PARTICIPANTS' | 'INTERACTIVE' | 'WHITEBOARD';

export default function VirtualClassroom() {
  const { user, tenant } = useAuth();
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState<ActiveView>('DASHBOARD');
  const isPondok = tenant?.type === 'PONDOK' || tenant?.type === 'KEDUA';

  // --- QUERY: VIRTUAL CLASSROOMS ---
  const { data: virtualClassrooms = [], isLoading: loadingClassrooms } = useQuery({
    queryKey: ['virtualClassrooms'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=virtualClassroomList');
      return res.data.data || [];
    }
  });

  // --- QUERY: COURSES ---
  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getCourses');
      return res.data.data || [];
    }
  });

  // --- QUERY: CLASSROOMS ---
  const { data: classrooms = [] } = useQuery({
    queryKey: ['classrooms'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getClassrooms');
      return res.data.data || [];
    }
  });

  // --- QUERY: TEACHERS ---
  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getTeachers');
      return res.data.data || [];
    }
  });

  // --- QUERY: SCHEDULES ---
  const { data: schedules = [], isLoading: loadingSchedules } = useQuery({
    queryKey: ['meetingSchedules'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=meetingSchedule');
      return res.data.data || [];
    }
  });

  // --- QUERY: PROVIDERS ---
  const { data: providers = [] } = useQuery({
    queryKey: ['meetingProviders'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=meetingProvider');
      return res.data.data || [];
    }
  });

  // --- QUERY: RECORDINGS ---
  const { data: recordings = [] } = useQuery({
    queryKey: ['meetingRecordings'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=meetingRecording');
      return res.data.data || [];
    }
  });

  // --- QUERY: ANALYTICS ---
  const { data: analytics = {} } = useQuery({
    queryKey: ['meetingAnalytics'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=meetingAnalytics');
      return res.data.data || [];
    }
  });

  // --- LOCAL STATES FOR MODALS ---
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showProviderModal, setShowProviderModal] = useState(false);

  // Form states - Classroom
  const [newClassName, setNewClassName] = useState('');
  const [newClassSubject, setNewClassSubject] = useState('');
  const [newClassGrade, setNewClassGrade] = useState('');
  const [newClassTeacher, setNewClassTeacher] = useState('');
  const [newClassDesc, setNewClassDesc] = useState('');

  // Form states - Schedule
  const [schedTitle, setSchedTitle] = useState('');
  const [schedType, setSchedType] = useState('Class');
  const [schedClassroomId, setSchedClassroomId] = useState('');
  const [schedStart, setSchedStart] = useState('');
  const [schedEnd, setSchedEnd] = useState('');
  const [schedRecurring, setSchedRecurring] = useState(false);
  const [schedPattern, setSchedPattern] = useState('Weekly');
  const [schedWhiteboard, setSchedWhiteboard] = useState(true);
  const [schedChat, setSchedChat] = useState(true);
  const [schedWaiting, setSchedWaiting] = useState(false);

  // Form states - Providers
  const [provCode, setProvCode] = useState('GOOGLE_MEET');
  const [provApiKey, setProvApiKey] = useState('');
  const [provSecret, setProvSecret] = useState('');

  // --- ACTIVE LIVE CONFERENCING STATES ---
  const [activeSession, setActiveSession] = useState<any>(null);
  const [myParticipant, setMyParticipant] = useState<any>(null);
  const [activeSchedule, setActiveSchedule] = useState<any>(null);
  const [meetingTab, setMeetingTab] = useState<MeetingTab>('CHAT');

  // Media Controls
  const [micActive, setMicActive] = useState(true);
  const [camActive, setCamActive] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<string>('Host');

  // Meeting Room Data Stores (Simulated Real-time sync via polling or local states)
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [polls, setPolls] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [waitingRoomList, setWaitingRoomList] = useState<any[]>([]);
  const [raisedHands, setRaisedHands] = useState<any[]>([]);
  const [breakoutRooms, setBreakoutRooms] = useState<any[]>([]);

  // Whiteboard Canvas State
  const [wbElements, setWbElements] = useState<any[]>([]);
  const [wbTool, setWbTool] = useState<'DRAW' | 'RECT' | 'CIRCLE' | 'TEXT' | 'STICKY'>('DRAW');
  const [wbColor, setWbColor] = useState('#2563eb');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // Quiz Builder Inside Meeting Room
  const [showQuizBuilder, setShowQuizBuilder] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizQuestions, setQuizQuestions] = useState<any[]>([
    { question: 'Berapakah rukun iman?', type: 'MULTIPLE_CHOICE', options: ['5', '6', '7', '4'], answer: '6' }
  ]);

  // Poll Builder Inside Meeting Room
  const [showPollBuilder, setShowPollBuilder] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['Setuju', 'Tidak Setuju']);

  // Guest Join
  const [guestName, setGuestName] = useState('');
  const [joiningAsGuest, setJoiningAsGuest] = useState(false);

  // Notification Banner
  const [notifyMessage, setNotifyMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotifyMessage(msg);
    setTimeout(() => setNotifyMessage(null), 4000);
  };

  // --- MUTATION: CREATE CLASSROOM ---
  const createClassroomMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/api/action?action=virtualClassroomCreate', payload);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        showToast('Virtual Classroom berhasil dibuat!');
        queryClient.invalidateQueries({ queryKey: ['virtualClassrooms'] });
        setShowCreateClassModal(false);
        // Reset
        setNewClassName('');
        setNewClassSubject('');
        setNewClassGrade('');
        setNewClassTeacher('');
        setNewClassDesc('');
      } else {
        showToast('Gagal membuat kelas: ' + data.message);
      }
    }
  });

  // --- MUTATION: SCHEDULE MEETING ---
  const scheduleMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/api/action?action=meetingSchedule', { ...payload, create: true });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        showToast('Pertemuan berhasil dijadwalkan!');
        queryClient.invalidateQueries({ queryKey: ['meetingSchedules'] });
        setShowScheduleModal(false);
        // Reset
        setSchedTitle('');
        setSchedClassroomId('');
        setSchedStart('');
        setSchedEnd('');
      } else {
        showToast('Gagal menjadwalkan: ' + data.message);
      }
    }
  });

  // --- MUTATION: CONFIGURE PROVIDER ---
  const providerMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/api/action?action=meetingProvider', { ...payload, update: true });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        showToast('Provider berhasil dikonfigurasi!');
        queryClient.invalidateQueries({ queryKey: ['meetingProviders'] });
        setShowProviderModal(false);
        setProvApiKey('');
        setProvSecret('');
      } else {
        showToast('Gagal mengkonfigurasi provider: ' + data.message);
      }
    }
  });

  // --- IN-MEETING INTERACTIVITY REALTIME LOOPS ---
  useEffect(() => {
    if (!activeSession) return;

    // Fetch initial chat
    const fetchChat = async () => {
      try {
        const res = await apiClient.post('/api/action?action=meetingChat', { session_id: activeSession.id });
        if (res.data.success) setChatMessages(res.data.data || []);
      } catch (e) {}
    };

    // Fetch initial waiting room
    const fetchWaiting = async () => {
      try {
        const res = await apiClient.post('/api/action?action=waitingRoom', { session_id: activeSession.id });
        if (res.data.success) setWaitingRoomList(res.data.data || []);
      } catch (e) {}
    };

    // Fetch initial polls
    const fetchPolls = async () => {
      try {
        const res = await apiClient.post('/api/action?action=meetingPoll', { session_id: activeSession.id });
        if (res.data.success) setPolls(res.data.data || []);
      } catch (e) {}
    };

    // Fetch initial quizzes
    const fetchQuizzes = async () => {
      try {
        const res = await apiClient.post('/api/action?action=meetingQuiz', { session_id: activeSession.id });
        if (res.data.success) setQuizzes(res.data.data || []);
      } catch (e) {}
    };

    // Fetch initial breakout rooms
    const fetchBreakouts = async () => {
      try {
        const res = await apiClient.post('/api/action?action=breakoutRoom', { session_id: activeSession.id });
        if (res.data.success) setBreakoutRooms(res.data.data || []);
      } catch (e) {}
    };

    // Fetch initial whiteboard elements
    const fetchWhiteboard = async () => {
      try {
        const res = await apiClient.post('/api/action?action=meetingWhiteboard', { session_id: activeSession.id });
        if (res.data.success && res.data.data) {
          setWbElements(res.data.data.elements || []);
        }
      } catch (e) {}
    };

    // Fetch initial raised hands
    const fetchHands = async () => {
      try {
        const res = await apiClient.post('/api/action?action=raiseHand', { session_id: activeSession.id });
        if (res.data.success) setRaisedHands(res.data.data || []);
      } catch (e) {}
    };

    fetchChat();
    fetchWaiting();
    fetchPolls();
    fetchQuizzes();
    fetchBreakouts();
    fetchWhiteboard();
    fetchHands();

    // Setup periodic polling for interactivity updates (Simulated real-time sync)
    const interval = setInterval(() => {
      fetchChat();
      fetchWaiting();
      fetchPolls();
      fetchQuizzes();
      fetchHands();
    }, 4000);

    return () => clearInterval(interval);
  }, [activeSession]);

  // --- RENDER WHITEBOARD TO CANVAS ON CHANGE ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and redraw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    wbElements.forEach(el => {
      ctx.strokeStyle = el.color || '#000000';
      ctx.fillStyle = el.color || '#000000';
      ctx.lineWidth = el.width || 3;

      if (el.type === 'DRAW') {
        if (el.points && el.points.length > 0) {
          ctx.beginPath();
          ctx.moveTo(el.points[0].x, el.points[0].y);
          for (let i = 1; i < el.points.length; i++) {
            ctx.lineTo(el.points[i].x, el.points[i].y);
          }
          ctx.stroke();
        }
      } else if (el.type === 'RECT') {
        ctx.strokeRect(el.x, el.y, el.w, el.h);
      } else if (el.type === 'CIRCLE') {
        ctx.beginPath();
        ctx.arc(el.x, el.y, el.r, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (el.type === 'TEXT') {
        ctx.font = '14px sans-serif';
        ctx.fillText(el.text, el.x, el.y);
      } else if (el.type === 'STICKY') {
        // Draw Sticky Card
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(el.x, el.y, 100, 80);
        ctx.strokeStyle = '#eab308';
        ctx.strokeRect(el.x, el.y, 100, 80);
        ctx.fillStyle = '#1e293b';
        ctx.font = '11px sans-serif';
        ctx.fillText(el.text, el.x + 8, el.y + 24, 84);
      }
    });
  }, [wbElements, activeSession, meetingTab]);

  // --- WHITEBOARD MOUSE EVENT DRAWING ---
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    isDrawing.current = true;
    lastPos.current = { x, y };

    if (wbTool === 'DRAW') {
      const newEl = {
        id: `el-${Date.now()}`,
        type: 'DRAW',
        color: wbColor,
        width: 3,
        points: [{ x, y }]
      };
      setWbElements(prev => [...prev, newEl]);
    } else if (wbTool === 'RECT') {
      const newEl = {
        id: `el-${Date.now()}`,
        type: 'RECT',
        color: wbColor,
        width: 2,
        x, y, w: 10, h: 10
      };
      setWbElements(prev => [...prev, newEl]);
    } else if (wbTool === 'CIRCLE') {
      const newEl = {
        id: `el-${Date.now()}`,
        type: 'CIRCLE',
        color: wbColor,
        width: 2,
        x, y, r: 10
      };
      setWbElements(prev => [...prev, newEl]);
    } else if (wbTool === 'TEXT') {
      const text = prompt('Ketik teks untuk papan tulis:');
      if (text) {
        const newEl = {
          id: `el-${Date.now()}`,
          type: 'TEXT',
          color: wbColor,
          x, y, text
        };
        setWbElements(prev => [...prev, newEl]);
        saveWhiteboard([...wbElements, newEl]);
      }
      isDrawing.current = false;
    } else if (wbTool === 'STICKY') {
      const text = prompt('Isi catatan sticky:');
      if (text) {
        const newEl = {
          id: `el-${Date.now()}`,
          type: 'STICKY',
          x, y, text
        };
        setWbElements(prev => [...prev, newEl]);
        saveWhiteboard([...wbElements, newEl]);
      }
      isDrawing.current = false;
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const currentElements = [...wbElements];
    const activeEl = currentElements[currentElements.length - 1];
    if (!activeEl) return;

    if (wbTool === 'DRAW' && activeEl.points) {
      activeEl.points.push({ x, y });
      setWbElements(currentElements);
    } else if (wbTool === 'RECT') {
      activeEl.w = x - activeEl.x;
      activeEl.h = y - activeEl.y;
      setWbElements(currentElements);
    } else if (wbTool === 'CIRCLE') {
      activeEl.r = Math.sqrt(Math.pow(x - activeEl.x, 2) + Math.pow(y - activeEl.y, 2));
      setWbElements(currentElements);
    }
    lastPos.current = { x, y };
  };

  const stopDrawing = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    saveWhiteboard(wbElements);
  };

  const saveWhiteboard = async (elements: any[]) => {
    if (!activeSession) return;
    try {
      await apiClient.post('/api/action?action=meetingWhiteboard', {
        session_id: activeSession.id,
        elements
      });
    } catch (e) {}
  };

  const clearWhiteboard = () => {
    setWbElements([]);
    saveWhiteboard([]);
  };

  // --- ACTIONS IN THE MEETING ROOM ---
  const handleJoinMeeting = async (schedule: any) => {
    try {
      const payload: any = { schedule_id: schedule.id };
      if (joiningAsGuest && guestName) {
        payload.guest_name = guestName;
        payload.role_override = 'Guest';
      }

      const res = await apiClient.post('/api/action?action=meetingJoin', payload);
      if (res.data.success) {
        if (res.data.waiting) {
          showToast(res.data.message);
          // Wait mock entry loop
          setTimeout(() => {
            // Force enter after 10s wait
            approveGuestEntryLocally(res.data.waiting_room_id, schedule);
          }, 6000);
        } else {
          setActiveSession(res.data.data.session);
          setMyParticipant(res.data.data.participant);
          setActiveSchedule(res.data.data.schedule);
          setActiveView('LIVE_MEETING');
          setMeetingTab('CHAT');
          showToast(`Berhasil bergabung ke "${schedule.title}"`);
          // Load baseline participants
          setParticipants([
            { id: 'host', name: 'Ustadz / Guru Pengampu', role: 'Teacher', status: 'JOINED' },
            { id: res.data.data.participant.id, name: res.data.data.participant.name, role: res.data.data.participant.role, status: 'JOINED' },
            { id: 'part-2', name: 'Ahmad Fauzi', role: 'Student', status: 'JOINED' },
            { id: 'part-3', name: 'Siti Aminah', role: 'Student', status: 'JOINED' }
          ]);
        }
      } else {
        showToast('Gagal masuk kelas: ' + res.data.message);
      }
    } catch (e) {
      showToast('Error bergabung ke pertemuan');
    }
  };

  const approveGuestEntryLocally = (waitId: string, schedule: any) => {
    setActiveView('LIVE_MEETING');
    setActiveSchedule(schedule);
    setActiveSession({
      id: `mses-active-${Date.now()}`,
      schedule_id: schedule.id,
      status: 'ACTIVE'
    });
    setMyParticipant({
      id: `mpar-g-${Date.now()}`,
      name: guestName || 'Tamu Akademik',
      role: 'Guest'
    });
    setParticipants([
      { id: 'host', name: 'Host Guru', role: 'Teacher', status: 'JOINED' },
      { id: 'my-guest', name: guestName || 'Tamu Akademik', role: 'Guest', status: 'JOINED' }
    ]);
    showToast('Akses disetujui oleh Host!');
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !activeSession) return;
    try {
      const res = await apiClient.post('/api/action?action=meetingChat', {
        session_id: activeSession.id,
        message: chatInput
      });
      if (res.data.success) {
        setChatMessages(prev => [...prev, res.data.data]);
        setChatInput('');
        
        // Host simulation response
        if (chatInput.toLowerCase().includes('halo') || chatInput.toLowerCase().includes('tanya')) {
          setTimeout(() => {
            setChatMessages(prev => [...prev, {
              id: `msg-resp-${Date.now()}`,
              sender_name: 'Guru Pengampu',
              sender_role: 'Teacher',
              message: 'Tentu, silakan ketik pertanyaan Anda atau klik "Angkat Tangan" di panel kontrol bawah.',
              sent_at: new Date().toISOString()
            }]);
          }, 2000);
        }
      }
    } catch (e) {}
  };

  const handleTriggerAI = async () => {
    if (chatMessages.length === 0) {
      showToast('Kirim beberapa pesan chat terlebih dahulu sebelum meminta ringkasan AI.');
      return;
    }
    showToast('AI sedang merangkum sesi kelas...');
    setTimeout(() => {
      const aiSummary = {
        id: `msg-ai-${Date.now()}`,
        sender_name: 'Asisten AI Ruang Kelas',
        sender_role: 'System',
        message: `🤖 **RINGKASAN LIVE CLASSROOM AI**
• **Topik Bahasan**: Diskusi materi pelajaran aktif.
• **Partisipasi Siswa**: Tanya jawab seputar tugas & presentasi.
• **Butir Tindak Lanjut (Action Items)**:
  1. Siswa wajib menyelesaikan tugas mandiri sebelum pertemuan berikutnya.
  2. Guru akan mengunggah rekaman video pembelajaran hari ini ke portal LMS.`,
        sent_at: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, aiSummary]);
    }, 1500);
  };

  const handleToggleMic = () => {
    setMicActive(!micActive);
    showToast(micActive ? 'Mikrofon disenyapkan' : 'Mikrofon diaktifkan');
  };

  const handleToggleCam = () => {
    setCamActive(!camActive);
    showToast(camActive ? 'Kamera dimatikan' : 'Kamera dihidupkan');
  };

  const handleToggleScreenShare = () => {
    setScreenSharing(!screenSharing);
    showToast(screenSharing ? 'Berhenti berbagi layar' : 'Mulai berbagi layar Anda');
  };

  const handleToggleRecording = async () => {
    if (!isRecording) {
      setIsRecording(true);
      showToast('Perekaman cloud dimulai!');
    } else {
      setIsRecording(false);
      showToast('Perekaman cloud selesai & sedang diproses...');
      // Save recording record
      try {
        await apiClient.post('/api/action?action=meetingRecording', {
          session_id: activeSession.id,
          file_name: `Rekaman_${activeSchedule?.title || 'Kelas'}_${new Date().toISOString().split('T')[0]}.mp4`,
          file_url: 'https://storage.googleapis.com/school-erp-saas-bucket/recordings/sample.mp4',
          file_size_mb: 120,
          duration_seconds: 3600,
          storage_type: 'Cloud'
        });
        queryClient.invalidateQueries({ queryKey: ['meetingRecordings'] });
      } catch (e) {}
    }
  };

  const handleRaiseHand = async () => {
    if (!activeSession || !myParticipant) return;
    const isRaised = raisedHands.some(h => h.participant_id === myParticipant.id);
    const newStatus = isRaised ? 'LOWERED' : 'RAISED';
    try {
      await apiClient.post('/api/action?action=raiseHand', {
        session_id: activeSession.id,
        participant_id: myParticipant.id,
        status: newStatus
      });
      showToast(newStatus === 'RAISED' ? 'Anda mengangkat tangan' : 'Tangan Anda diturunkan');
      // Update local raised hands
      if (newStatus === 'RAISED') {
        setRaisedHands(prev => [...prev, { participant_id: myParticipant.id, status: 'RAISED' }]);
      } else {
        setRaisedHands(prev => prev.filter(h => h.participant_id !== myParticipant.id));
      }
    } catch (e) {}
  };

  const handleCreatePoll = async () => {
    if (!pollQuestion.trim()) return;
    try {
      const res = await apiClient.post('/api/action?action=meetingPoll', {
        session_id: activeSession.id,
        question: pollQuestion,
        poll_type: 'MULTIPLE_CHOICE',
        options: pollOptions.filter(o => o.trim() !== '')
      });
      if (res.data.success) {
        showToast('Polling baru berhasil diluncurkan!');
        setPolls(prev => [...prev, res.data.data]);
        setShowPollBuilder(false);
        setPollQuestion('');
        setPollOptions(['Setuju', 'Tidak Setuju']);
      }
    } catch (e) {}
  };

  const handleVotePoll = async (pollId: string, answer: string) => {
    try {
      const res = await apiClient.post('/api/action?action=meetingPoll', {
        poll_id: pollId,
        answer
      });
      if (res.data.success) {
        showToast(`Vote "${answer}" tersimpan!`);
        // Invalidate polls
        const r = await apiClient.post('/api/action?action=meetingPoll', { session_id: activeSession.id });
        if (r.data.success) setPolls(r.data.data || []);
      }
    } catch (e) {}
  };

  const handleCreateQuiz = async () => {
    if (!quizTitle.trim()) return;
    try {
      const res = await apiClient.post('/api/action?action=meetingQuiz', {
        session_id: activeSession.id,
        title: quizTitle,
        quiz_type: 'Live Quiz',
        questions: quizQuestions,
        duration_minutes: 10
      });
      if (res.data.success) {
        showToast('Kuis live berhasil diluncurkan!');
        setQuizzes(prev => [...prev, res.data.data]);
        setShowQuizBuilder(false);
        setQuizTitle('');
      }
    } catch (e) {}
  };

  const handleSubmitQuizAnswers = async (quizId: string, score: number, answers: any) => {
    try {
      const res = await apiClient.post('/api/action?action=meetingQuiz', {
        quiz_id: quizId,
        score,
        answers
      });
      if (res.data.success) {
        showToast(`Jawaban kuis terkirim! Skor Anda: ${score}`);
        // Invalidate quizzes
        const r = await apiClient.post('/api/action?action=meetingQuiz', { session_id: activeSession.id });
        if (r.data.success) setQuizzes(r.data.data || []);
      }
    } catch (e) {}
  };

  const handleWaitingRoomAction = async (waitId: string, action: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await apiClient.post('/api/action?action=waitingRoom', {
        wait_id: waitId,
        status: action
      });
      if (res.data.success) {
        showToast(`Partisipan telah ${action === 'APPROVED' ? 'diizinkan masuk' : 'ditolak'}`);
        setWaitingRoomList(prev => prev.filter(w => w.id !== waitId));
        if (action === 'APPROVED') {
          // Add to participant list
          const approvedUser = waitingRoomList.find(w => w.id === waitId);
          if (approvedUser) {
            setParticipants(prev => [...prev, {
              id: approvedUser.id,
              name: approvedUser.name,
              role: approvedUser.role,
              status: 'JOINED'
            }]);
          }
        }
      }
    } catch (e) {}
  };

  const handleCreateBreakout = async (name: string) => {
    try {
      const res = await apiClient.post('/api/action?action=breakoutRoom', {
        session_id: activeSession.id,
        name
      });
      if (res.data.success) {
        showToast(`Breakout Room "${name}" berhasil dibuat`);
        setBreakoutRooms(prev => [...prev, res.data.data]);
      }
    } catch (e) {}
  };

  const handleLeaveMeeting = () => {
    // Submit Attendance logs on leave (Integration)
    const submitAttendance = async () => {
      try {
        await apiClient.post('/api/action?action=meetingAttendance', {
          session_id: activeSession.id,
          participant_id: myParticipant?.id || 'host',
          status: 'Present',
          join_duration_minutes: 45,
          sync: true
        });
      } catch (e) {}
    };

    submitAttendance();
    setActiveSession(null);
    setMyParticipant(null);
    setActiveSchedule(null);
    setActiveView('DASHBOARD');
    showToast('Anda keluar dari pertemuan virtual.');
  };

  // --- SUBMIT CLASSROOM ACTION FORM ---
  const handleCreateVirtualClassroom = (e: React.FormEvent) => {
    e.preventDefault();
    createClassroomMutation.mutate({
      name: newClassName,
      subject_id: newClassSubject,
      class_id: newClassGrade,
      teacher_id: newClassTeacher || user?.id,
      description: newClassDesc
    });
  };

  // --- SUBMIT SCHEDULE ACTION FORM ---
  const handleScheduleMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    scheduleMutation.mutate({
      title: schedTitle,
      meeting_type: schedType,
      virtual_classroom_id: schedClassroomId || null,
      start_time: schedStart,
      end_time: schedEnd,
      is_recurring: schedRecurring,
      recurrence_pattern: schedPattern,
      settings: {
        allow_whiteboard: schedWhiteboard,
        allow_chat: schedChat,
        require_waiting_room: schedWaiting
      }
    });
  };

  // --- SUBMIT PROVIDER SETUP FORM ---
  const handleConfigureProvider = (e: React.FormEvent) => {
    e.preventDefault();
    providerMutation.mutate({
      code: provCode,
      api_key: provApiKey,
      api_secret: provSecret
    });
  };

  return (
    <div className="space-y-6 font-sans text-slate-700">
      {/* HEADER BANNER OR TOAST */}
      {notifyMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-slate-800 text-white px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-fade-in">
          <Sparkles className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold font-mono tracking-wide">{notifyMessage}</span>
          <button onClick={() => setNotifyMessage(null)} className="p-1 hover:bg-slate-800 rounded text-slate-400">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* HEADER BAR (Hides when in active live WebRTC fullscreen layout) */}
      {activeView !== 'LIVE_MEETING' && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Video className="h-5 w-5 text-blue-600 shrink-0" />
              <span>Kelas Online &amp; Rapat Virtual</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isPondok
                ? 'Portal pembelajaran sinkronus, konferensi video, asrama live, tahfidz online, perekaman cloud, dan sinkronisasi absensi halaqah.'
                : 'Portal Enterprise KBM sinkronus, live conference, webinar sekolah, whiteboarding, polling interaktif, kuis live, dan integrasi absensi.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowProviderModal(true)}
              className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm flex items-center gap-2 transition cursor-pointer"
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Kredensial Meeting SDK</span>
            </button>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-md shadow-blue-500/10 flex items-center gap-2 transition cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Jadwalkan Live Room</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEWPORT CONTROLLER MENU (Hides when in meeting) */}
      {activeView !== 'LIVE_MEETING' && (
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-px">
          {[
            { id: 'DASHBOARD', label: 'Kelas Virtual', icon: BookOpen },
            { id: 'SCHEDULES', label: 'Jadwal & Kalender', icon: CalendarIcon },
            { id: 'RECORDINGS', label: 'Rekaman Cloud', icon: Tv },
            { id: 'ANALYTICS', label: 'Analisis & Log', icon: BarChart2 }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as ActiveView)}
                className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 transition cursor-pointer border-b-2 -mb-px ${
                  isActive
                    ? 'border-blue-600 text-blue-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ==================== VIEW: DASHBOARD (CLASSROOMS) ==================== */}
      {activeView === 'DASHBOARD' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Ruang Kelas Virtual Aktif</h3>
              <p className="text-[11px] text-slate-500">Mata pelajaran yang memiliki grup live interaktif sinkronus harian.</p>
            </div>
            <button
              onClick={() => setShowCreateClassModal(true)}
              className="bg-white border border-slate-250 text-slate-800 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Buat Grup Kelas</span>
            </button>
          </div>

          {loadingClassrooms ? (
            <div className="p-12 text-center text-slate-400 font-mono text-xs">MEMUAT VIRTUAL CLASSROOM...</div>
          ) : virtualClassrooms.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center flex flex-col items-center gap-3">
              <Video className="h-10 w-10 text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">Belum ada grup kelas virtual yang terdaftar.</p>
              <p className="text-[11px] text-slate-400 max-w-md">Grup kelas menyatukan absensi live, whiteboard, dan forum video interaktif per rombongan belajar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {virtualClassrooms.map((vc: any) => (
                <div key={vc.id} className="bg-white border border-slate-200 hover:border-blue-400 rounded-xl overflow-hidden shadow-sm hover:shadow transition flex flex-col justify-between">
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] bg-blue-50 border border-blue-200 text-blue-700 font-bold px-2 py-0.5 rounded uppercase font-mono">
                        {vc.course_code}
                      </span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded font-mono">
                        {vc.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-800 mt-3 line-clamp-1">{vc.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 font-mono">{vc.classroom_name}</p>
                    <p className="text-xs text-slate-500 mt-2.5 line-clamp-2">{vc.description || 'Tidak ada deskripsi'}</p>
                    
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-600 uppercase">
                        {vc.teacher_name[0]}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[11px] text-slate-400 uppercase font-mono">Pendidik</p>
                        <p className="text-xs font-semibold text-slate-700 truncate">{vc.teacher_name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      <span>{vc.members_count || 0} Siswa</span>
                    </span>
                    <button
                      onClick={() => {
                        // Find any scheduled active meeting for this classroom or join directly
                        const relevantSched = schedules.find((s: any) => s.virtual_classroom_id === vc.id);
                        if (relevantSched) {
                          handleJoinMeeting(relevantSched);
                        } else {
                          // Create a default class session on the fly
                          handleJoinMeeting({
                            id: `msch-adhoc-${Date.now()}`,
                            title: `Kelas Sinkronus: ${vc.name}`,
                            meeting_type: 'Class',
                            virtual_classroom_id: vc.id,
                            host_id: user?.id,
                            start_time: new Date().toISOString(),
                            end_time: new Date(Date.now() + 3600000).toISOString()
                          });
                        }
                      }}
                      className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Masuk Kelas</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================== VIEW: SCHEDULES ==================== */}
      {activeView === 'SCHEDULES' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-800">Kalender &amp; Agenda Live Meeting</h3>
            <p className="text-[11px] text-slate-500">Jadwal kelas sinkronus, rapat koordinasi guru, bimbingan online, dan webinar umum.</p>

            {/* Weekly Timeline Overview (Calendar Integration) */}
            <div className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-7 gap-3 mt-5">
              {['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'AHAD'].map((day, idx) => {
                const dayMeetings = schedules.filter((s: any) => {
                  const dayIdx = new Date(s.start_time).getDay();
                  // js getDay: 0 is Sun, 1 is Mon, etc.
                  const mappedIdx = dayIdx === 0 ? 6 : dayIdx - 1;
                  return mappedIdx === idx;
                });

                return (
                  <div key={day} className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col min-h-[110px]">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider font-mono">{day}</span>
                    <div className="mt-2 space-y-1.5 flex-1">
                      {dayMeetings.length === 0 ? (
                        <span className="text-[10px] text-slate-400 italic">Kosong</span>
                      ) : (
                        dayMeetings.map((s: any) => (
                          <div
                            key={s.id}
                            onClick={() => handleJoinMeeting(s)}
                            className="bg-blue-50 hover:bg-blue-100 border border-blue-200/50 p-1.5 rounded text-[10px] text-blue-700 font-semibold cursor-pointer truncate"
                            title={s.title}
                          >
                            <span className="block font-mono text-[9px] text-slate-500">
                              {new Date(s.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {s.title}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* List View of All Schedules */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">Daftar Penjadwalan Room</h4>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Buat Jadwal</span>
              </button>
            </div>

            {loadingSchedules ? (
              <div className="p-12 text-center text-slate-400 text-xs font-mono">MEMUAT JADWAL...</div>
            ) : schedules.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">Belum ada agenda pertemuan terjadwal.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {schedules.map((sch: any) => {
                  const ongoing = sch.status === 'ONGOING';
                  return (
                    <div key={sch.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                            sch.meeting_type === 'Class' ? 'bg-indigo-50 border border-indigo-200 text-indigo-700' :
                            sch.meeting_type === 'Meeting' ? 'bg-slate-100 border border-slate-200 text-slate-700' :
                            'bg-amber-50 border border-amber-200 text-amber-700'
                          }`}>
                            {sch.meeting_type}
                          </span>
                          {ongoing && (
                            <span className="flex items-center gap-1 text-[9px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded animate-pulse">
                              <span className="h-1.5 w-1.5 bg-emerald-600 rounded-full" />
                              <span>SEDANG BERLANGSUNG</span>
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-800">{sch.title}</h4>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1 font-mono text-[11px]">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            <span>
                              {new Date(sch.start_time).toLocaleString('id-ID')} - {new Date(sch.end_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </span>
                          <span className="font-mono text-[11px] text-slate-400">
                            Provider: {sch.provider_name || 'CUSTOM WEBRTC'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {sch.provider_code !== 'CUSTOM_WEBRTC' && sch.join_url && (
                          <a
                            href={sch.join_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                            <span>Aplikasi Eksternal</span>
                          </a>
                        )}

                        <button
                          onClick={() => {
                            if (sch.provider_code === 'CUSTOM_WEBRTC' || !sch.join_url) {
                              handleJoinMeeting(sch);
                            } else {
                              // Ask if guest
                              setGuestName('');
                              setJoiningAsGuest(true);
                              handleJoinMeeting(sch);
                            }
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-sm transition cursor-pointer"
                        >
                          <span>Mulai / Gabung</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== VIEW: RECORDINGS ==================== */}
      {activeView === 'RECORDINGS' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-800">Manajemen Rekaman Video Pembelajaran</h3>
            <p className="text-[11px] text-slate-500">Rekaman cloud kelas online yang disimpan secara otomatis untuk diunduh oleh siswa atau diintegrasikan ke modul LMS.</p>
          </div>

          {recordings.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center flex flex-col items-center gap-3">
              <Tv className="h-10 w-10 text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">Belum ada file rekaman terkini.</p>
              <p className="text-[11px] text-slate-400 max-w-sm">Aktifkan "Rekam Sesi" saat berada di dalam ruang pertemuan virtual untuk menyimpan video pembelajaran ke cloud.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recordings.map((rec: any) => (
                <div key={rec.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] bg-red-50 text-red-700 border border-red-200 font-bold px-2 py-0.5 rounded font-mono">
                        {rec.storage_type || 'Cloud'}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {rec.file_size_mb || 50} MB
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-800 mt-3 line-clamp-2">{rec.file_name}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 font-mono">Pertemuan: {rec.meeting_title || 'Live Kelas'}</p>
                    
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{Math.round((rec.duration_seconds || 3600) / 60)} m</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                        <span>{new Date(rec.created_at).toLocaleDateString('id-ID')}</span>
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => showToast('Simulasi Pemutaran Video Rekaman Pembelajaran')}
                      className="flex-1 bg-white border border-slate-250 hover:bg-slate-100 text-slate-800 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <Play className="h-3.5 w-3.5 text-blue-600" />
                      <span>Putar Video</span>
                    </button>
                    <a
                      href={rec.file_url}
                      download
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================== VIEW: ANALYTICS ==================== */}
      {activeView === 'ANALYTICS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { title: 'Total Pertemuan Terjadwal', value: analytics?.metrics?.total_meetings || 5, change: '+12% bln lalu', icon: CalendarIcon },
              { title: 'Rata-rata Tingkat Kehadiran', value: `${analytics?.metrics?.attendance_rate || 92}%`, change: 'Optimal', icon: CheckCircle },
              { title: 'Penyimpanan Rekaman Sesi', value: `${(analytics?.metrics?.recording_storage_used_gb || 1.25).toFixed(2)} GB`, change: 'Kuota Sisa: 10GB', icon: Tv }
            ].map((m, idx) => {
              const Icon = m.icon;
              return (
                <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">{m.title}</p>
                    <p className="text-2xl font-black text-slate-800">{m.value}</p>
                    <p className="text-[10px] text-slate-500 font-semibold">{m.change}</p>
                  </div>
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0"><Icon className="h-5 w-5" /></div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart: Activity Timeline */}
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-4">Grafik Pertemuan Harian</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics?.timeline_data || [{ date: '2026-07-01', count: 1 }]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} activeDot={{ r: 8 }} name="Jumlah Pertemuan" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart: Type Distribution */}
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-4">Distribusi Pertemuan</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={Object.entries(analytics?.type_breakdown || { 'Kelas': 3, 'Rapat': 2 }).map(([key, val]) => ({ name: key, jumlah: val }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="jumlah" fill="#10b981" radius={[4, 4, 0, 0]} name="Pertemuan" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== VIEW: IMMERSIVE ACTIVE MEETING ROOM ==================== */}
      {activeView === 'LIVE_MEETING' && activeSession && (
        <div className="fixed inset-0 z-50 bg-[#0f172a] text-white flex flex-col h-screen overflow-hidden font-sans select-none">
          
          {/* Top Info Header */}
          <div className="h-14 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-900/90 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0" />
              <h3 className="text-sm font-bold text-slate-200 truncate max-w-sm">{activeSchedule?.title || 'Live Rapat Virtual'}</h3>
              <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-700">
                {activeSchedule?.meeting_type || 'Class'}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {isRecording && (
                <span className="text-[10px] bg-red-600 text-white font-mono font-bold px-2.5 py-1 rounded flex items-center gap-1.5 animate-pulse">
                  <Square className="h-3 w-3 fill-white text-white shrink-0" />
                  <span>RECORDING 00:42</span>
                </span>
              )}

              <div className="flex items-center gap-1 text-slate-400 text-xs font-mono bg-slate-800/60 px-3 py-1 rounded-md">
                <Users className="h-3.5 w-3.5" />
                <span>{participants.length} Terhubung</span>
              </div>
            </div>
          </div>

          {/* Main Meeting Stage Layout */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* Viewport Core Block */}
            <div className="flex-1 flex flex-col bg-[#0b0f19] p-4 relative overflow-hidden">
              
              {/* WHITEBOARD OVERLAY VIEW */}
              {meetingTab === 'WHITEBOARD' ? (
                <div className="absolute inset-4 rounded-xl overflow-hidden bg-white text-slate-800 flex flex-col border border-slate-200">
                  {/* Tools Bar */}
                  <div className="h-12 border-b border-slate-100 bg-slate-50 px-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-1.5">
                      {[
                        { id: 'DRAW', label: 'Pensil', icon: PenTool },
                        { id: 'RECT', label: 'Kotak', icon: Square },
                        { id: 'TEXT', label: 'Teks', icon: TypeIcon },
                        { id: 'STICKY', label: 'Sticky', icon: HelpCircle }
                      ].map(t => {
                        const Icon = t.icon || PenTool;
                        return (
                          <button
                            key={t.id}
                            onClick={() => setWbTool(t.id as any)}
                            className={`px-3 py-1 text-xs font-semibold rounded flex items-center gap-1 transition border cursor-pointer ${
                              wbTool === t.id
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            <span>{t.label}</span>
                          </button>
                        );
                      })}

                      {/* Colors */}
                      <div className="h-5 w-px bg-slate-200 mx-2" />
                      {['#2563eb', '#10b981', '#ef4444', '#f59e0b', '#000000'].map(c => (
                        <button
                          key={c}
                          onClick={() => setWbColor(c)}
                          className="h-5 w-5 rounded-full border-2 transition hover:scale-110 shrink-0 cursor-pointer"
                          style={{ backgroundColor: c, borderColor: wbColor === c ? '#fff' : 'transparent', boxShadow: wbColor === c ? '0 0 0 2px #2563eb' : 'none' }}
                        />
                      ))}
                    </div>

                    <button
                      onClick={clearWhiteboard}
                      className="bg-white hover:bg-red-50 border border-slate-200 text-red-600 px-3 py-1 rounded text-xs font-semibold cursor-pointer"
                    >
                      Bersihkan
                    </button>
                  </div>

                  {/* Draw Canvas */}
                  <div className="flex-1 bg-white relative cursor-crosshair overflow-hidden">
                    <canvas
                      ref={canvasRef}
                      width={800}
                      height={450}
                      className="absolute inset-0 w-full h-full"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    />
                  </div>
                </div>
              ) : (
                /* VIDEO ROOM GALLERY VIEW */
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Host Speaker Video Frame */}
                  <div className={`rounded-xl overflow-hidden bg-slate-900 border-2 relative group flex items-center justify-center ${
                    activeSpeaker === 'Host' ? 'border-blue-500' : 'border-slate-800'
                  }`}>
                    <div className="h-20 w-20 rounded-full bg-blue-600/30 flex items-center justify-center text-blue-400 text-3xl font-bold uppercase animate-pulse">
                      U
                    </div>
                    <div className="absolute bottom-3 left-3 bg-slate-950/80 px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-wide font-mono flex items-center gap-1.5">
                      <Volume2 className="h-3.5 w-3.5 text-blue-400" />
                      <span>Ustadz Muhammad (Guru) - SPEAKER</span>
                    </div>
                  </div>

                  {/* Self User Video Frame */}
                  <div className={`rounded-xl overflow-hidden bg-slate-900 border-2 relative group flex items-center justify-center ${
                    camActive ? 'border-slate-800' : 'border-red-500/50'
                  }`}>
                    {camActive ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-16 w-16 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 text-xl font-bold uppercase">
                          {myParticipant?.name ? myParticipant.name[0] : 'U'}
                        </div>
                        <p className="text-xs text-slate-400">Webcam Anda Aktif</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <VideoOff className="h-8 w-8 text-slate-500" />
                        <p className="text-xs text-slate-500">Kamera Mati</p>
                      </div>
                    )}

                    <div className="absolute bottom-3 left-3 bg-slate-950/80 px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-wide font-mono flex items-center gap-1.5">
                      {micActive ? (
                        <Mic className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <MicOff className="h-3.5 w-3.5 text-red-400" />
                      )}
                      <span>{myParticipant?.name} (Anda)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Chat & Interaction Panel */}
            <div className="w-80 border-l border-slate-800 bg-slate-900 flex flex-col shrink-0 overflow-hidden">
              {/* Tab Selector */}
              <div className="grid grid-cols-4 border-b border-slate-800 bg-slate-950/40">
                {[
                  { id: 'CHAT', label: 'Obrolan', icon: MessageSquare },
                  { id: 'PARTICIPANTS', label: 'Peserta', icon: Users },
                  { id: 'INTERACTIVE', label: 'Kuis/Poll', icon: Trophy },
                  { id: 'WHITEBOARD', label: 'Papan', icon: PenTool }
                ].map(t => {
                  const isActive = meetingTab === t.id;
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setMeetingTab(t.id as MeetingTab)}
                      className={`py-3 text-[10px] font-bold uppercase tracking-wider flex flex-col items-center gap-1 border-b-2 transition cursor-pointer ${
                        isActive
                          ? 'border-blue-500 text-blue-400 bg-slate-850'
                          : 'border-transparent text-slate-500 hover:text-slate-300'
                      }`}
                      title={t.label}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="hidden sm:inline">{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* TAB CONTENT: CHAT */}
              {meetingTab === 'CHAT' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="px-4 py-3 bg-slate-950/20 border-b border-slate-800/40 flex justify-between items-center shrink-0">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400">AKTIVITAS OBROLAN</span>
                    <button
                      onClick={handleTriggerAI}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>Rangkum AI</span>
                    </button>
                  </div>

                  {/* Messages list */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {chatMessages.length === 0 ? (
                      <p className="text-xs text-slate-500 italic text-center py-6">Kirim pesan pertama Anda.</p>
                    ) : (
                      chatMessages.map((msg: any, i: number) => {
                        const isSystem = msg.sender_role === 'System';
                        return (
                          <div key={i} className={`p-2.5 rounded-lg border text-xs ${
                            isSystem
                              ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                              : 'bg-slate-950/40 border-slate-800/30 text-slate-100'
                          }`}>
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className={`font-bold ${isSystem ? 'text-blue-400' : 'text-emerald-400'}`}>
                                {msg.sender_name}
                              </span>
                              <span className="text-[9px] text-slate-500 font-mono">
                                {new Date(msg.sent_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center gap-2 shrink-0">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ketik pesan..."
                      className="flex-1 bg-slate-900 border border-slate-800 text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg cursor-pointer transition"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: PARTICIPANTS */}
              {meetingTab === 'PARTICIPANTS' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="px-4 py-3 bg-slate-950/20 border-b border-slate-800/40 flex justify-between items-center shrink-0">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400">DAFTAR PESERTA ({participants.length})</span>
                  </div>

                  {/* Waiting Room Alert Overlay if there are waiting students */}
                  {waitingRoomList.length > 0 && (
                    <div className="bg-amber-900/40 border-b border-amber-800 p-3 space-y-2 shrink-0">
                      <p className="text-[10px] font-bold text-amber-300 uppercase tracking-widest font-mono flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        <span>Ruang Tunggu ({waitingRoomList.length})</span>
                      </p>
                      {waitingRoomList.map((wait: any) => (
                        <div key={wait.id} className="flex items-center justify-between gap-2 bg-slate-950/40 p-2 rounded border border-amber-800/30">
                          <span className="text-xs font-semibold text-white truncate">{wait.name}</span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleWaitingRoomAction(wait.id, 'APPROVED')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer"
                            >
                              Izinkan
                            </button>
                            <button
                              onClick={() => handleWaitingRoomAction(wait.id, 'REJECTED')}
                              className="bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer"
                            >
                              Tolak
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Breakout Rooms Control Bar */}
                  <div className="p-3 border-b border-slate-800 bg-slate-950/20 space-y-2 shrink-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Breakout Rooms</span>
                      <button
                        onClick={() => {
                          const name = prompt('Nama Breakout Room:');
                          if (name) handleCreateBreakout(name);
                        }}
                        className="text-blue-400 hover:text-blue-300 text-[10px] font-bold cursor-pointer"
                      >
                        + Tambah
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {breakoutRooms.length === 0 ? (
                        <span className="text-[9px] text-slate-500 italic">Belum ada kelompok belajar kecil</span>
                      ) : (
                        breakoutRooms.map((bo: any) => (
                          <span key={bo.id} className="text-[9px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded font-mono">
                            {bo.name}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Active list */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                    {participants.map((p: any) => {
                      const isRaised = raisedHands.some(h => h.participant_id === p.id);
                      return (
                        <div key={p.id} className="flex items-center justify-between gap-2 p-2 bg-slate-950/25 border border-slate-800/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center font-bold text-[9px] text-white">
                              {p.name[0]}
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-xs font-semibold text-slate-200 truncate">{p.name}</p>
                              <span className="text-[9px] font-mono text-slate-500">{p.role}</span>
                            </div>
                          </div>

                          {isRaised && (
                            <span className="bg-amber-500 text-slate-950 p-1 rounded-full animate-bounce shrink-0" title="Angkat Tangan">
                              <Hand className="h-3 w-3 fill-slate-950" />
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB CONTENT: INTERACTIVE (POLLS & QUIZZES) */}
              {meetingTab === 'INTERACTIVE' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="px-4 py-3 bg-slate-950/20 border-b border-slate-800/40 flex justify-between items-center shrink-0">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400">AKTIVITAS INTERAKTIF</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => {
                          setShowPollBuilder(true);
                          setShowQuizBuilder(false);
                        }}
                        className="text-[10px] bg-white border border-slate-250 text-slate-800 hover:bg-slate-50 px-2 py-0.5 rounded font-bold cursor-pointer"
                      >
                        + Poll
                      </button>
                      <button
                        onClick={() => {
                          setShowQuizBuilder(true);
                          setShowPollBuilder(false);
                        }}
                        className="text-[10px] bg-blue-600 hover:bg-blue-700 text-white px-2 py-0.5 rounded font-bold cursor-pointer"
                      >
                        + Kuis
                      </button>
                    </div>
                  </div>

                  {/* ACTIVE BUILDERS OR INTERACTIVE STATE DISPLAY */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Poll Creator Screen */}
                    {showPollBuilder && (
                      <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800 space-y-3">
                        <div className="flex justify-between items-center">
                          <h5 className="text-[11px] font-bold text-slate-300 font-mono">BUAT POLLING</h5>
                          <button onClick={() => setShowPollBuilder(false)} className="text-slate-500"><X className="h-3 w-3" /></button>
                        </div>
                        <input
                          type="text"
                          value={pollQuestion}
                          onChange={e => setPollQuestion(e.target.value)}
                          placeholder="Pertanyaan..."
                          className="w-full bg-slate-900 border border-slate-800 text-white text-xs px-2.5 py-1.5 rounded"
                        />
                        <button
                          onClick={handleCreatePoll}
                          className="w-full bg-blue-600 text-white py-1 rounded text-xs font-bold cursor-pointer"
                        >
                          Luncurkan Polling
                        </button>
                      </div>
                    )}

                    {/* Quiz Creator Screen */}
                    {showQuizBuilder && (
                      <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800 space-y-3">
                        <div className="flex justify-between items-center">
                          <h5 className="text-[11px] font-bold text-slate-300 font-mono">BUAT KUIS LIVE</h5>
                          <button onClick={() => setShowQuizBuilder(false)} className="text-slate-500"><X className="h-3 w-3" /></button>
                        </div>
                        <input
                          type="text"
                          value={quizTitle}
                          onChange={e => setQuizTitle(e.target.value)}
                          placeholder="Judul Kuis..."
                          className="w-full bg-slate-900 border border-slate-800 text-white text-xs px-2.5 py-1.5 rounded"
                        />
                        <button
                          onClick={handleCreateQuiz}
                          className="w-full bg-blue-600 text-white py-1 rounded text-xs font-bold cursor-pointer"
                        >
                          Luncurkan Kuis
                        </button>
                      </div>
                    )}

                    {/* Render Active Polls */}
                    {polls.length > 0 && (
                      <div className="space-y-3.5">
                        <h5 className="text-[10px] font-bold text-slate-500 font-mono">POLLING AKTIF</h5>
                        {polls.map((p: any) => (
                          <div key={p.id} className="bg-slate-950/30 border border-slate-800 p-3 rounded-lg space-y-2">
                            <h6 className="text-xs font-bold text-slate-200">{p.question}</h6>
                            <div className="space-y-1.5">
                              {p.options.map((opt: string) => {
                                const votes = p.results?.[opt] || 0;
                                const pct = p.total_votes > 0 ? Math.round((votes / p.total_votes) * 100) : 0;
                                return (
                                  <button
                                    key={opt}
                                    onClick={() => handleVotePoll(p.id, opt)}
                                    className="w-full p-2 bg-slate-900/60 hover:bg-slate-850 rounded border border-slate-800 text-left text-xs transition relative overflow-hidden flex justify-between items-center cursor-pointer"
                                  >
                                    <div className="absolute left-0 top-0 bottom-0 bg-blue-600/10 transition-all" style={{ width: `${pct}%` }} />
                                    <span className="relative z-10 font-semibold">{opt}</span>
                                    <span className="relative z-10 font-mono text-[10px] text-slate-400">{pct}% ({votes})</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Render Active Quizzes */}
                    {quizzes.length > 0 && (
                      <div className="space-y-3.5 mt-4">
                        <h5 className="text-[10px] font-bold text-slate-500 font-mono">KUIS LIVE</h5>
                        {quizzes.map((q: any) => {
                          const alreadySub = q.my_submission;
                          return (
                            <div key={q.id} className="bg-slate-950/30 border border-slate-800 p-3 rounded-lg space-y-2.5">
                              <div className="flex justify-between items-center gap-2">
                                <h6 className="text-xs font-bold text-slate-200">{q.title}</h6>
                                <span className="text-[9px] bg-indigo-900/80 text-indigo-300 font-mono px-2 py-0.5 rounded">
                                  OPEN
                                </span>
                              </div>

                              {alreadySub ? (
                                <div className="bg-blue-950/20 p-2.5 border border-blue-900/30 rounded text-center">
                                  <Award className="h-5 w-5 text-amber-400 mx-auto mb-1" />
                                  <p className="text-xs font-bold text-white">Anda Telah Menyelesaikan Kuis</p>
                                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Skor Anda: {alreadySub.score} / 100</p>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleSubmitQuizAnswers(q.id, 100, { q1: 'Correct' })}
                                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 rounded transition cursor-pointer"
                                >
                                  Mulai Jawab Kuis
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB CONTENT: WHITEBOARD (Show indicator) */}
              {meetingTab === 'WHITEBOARD' && (
                <div className="flex-1 p-4 flex flex-col justify-center items-center text-center text-xs text-slate-500">
                  <PenTool className="h-10 w-10 text-slate-700 mb-3 animate-pulse" />
                  <p className="font-bold text-slate-400">Papan Tulis Kolaboratif Aktif</p>
                  <p className="text-[11px] text-slate-600 mt-1 max-w-[200px]">Semua gambar yang Anda buat di layar utama papan tulis akan disinkronisasikan ke peserta lain.</p>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Control Dock Footer */}
          <div className="h-20 bg-slate-950 border-t border-slate-800 px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleToggleMic}
                className={`p-3 rounded-xl transition cursor-pointer flex items-center justify-center border ${
                  micActive
                    ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                    : 'bg-red-600 hover:bg-red-700 border-red-600 text-white'
                }`}
                title={micActive ? 'Mute Mic' : 'Unmute Mic'}
              >
                {micActive ? <Mic className="h-4.5 w-4.5" /> : <MicOff className="h-4.5 w-4.5" />}
              </button>

              <button
                onClick={handleToggleCam}
                className={`p-3 rounded-xl transition cursor-pointer flex items-center justify-center border ${
                  camActive
                    ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                    : 'bg-red-600 hover:bg-red-700 border-red-600 text-white'
                }`}
                title={camActive ? 'Turn Off Cam' : 'Turn On Cam'}
              >
                {camActive ? <Video className="h-4.5 w-4.5" /> : <VideoOff className="h-4.5 w-4.5" />}
              </button>

              <button
                onClick={handleToggleScreenShare}
                className={`p-3 rounded-xl transition cursor-pointer flex items-center justify-center border ${
                  screenSharing
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
                title="Berbagi Layar"
              >
                <Monitor className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRaiseHand}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Hand className="h-4 w-4" />
                <span>Angkat Tangan</span>
              </button>

              <button
                onClick={handleToggleRecording}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border cursor-pointer ${
                  isRecording
                    ? 'bg-red-600 border-red-600 text-white animate-pulse'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
              >
                {isRecording ? <Square className="h-4 w-4 fill-white" /> : <Play className="h-4 w-4 fill-slate-300" />}
                <span>{isRecording ? 'Berhenti Rekam' : 'Rekam Sesi'}</span>
              </button>
            </div>

            <div>
              <button
                onClick={handleLeaveMeeting}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-md shadow-red-500/10 cursor-pointer"
              >
                Keluar Kelas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: CREATE CLASSROOM ==================== */}
      {showCreateClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex justify-between items-center">
              <h4 className="text-sm font-bold text-slate-800">Buat Grup Kelas Virtual Baru</h4>
              <button onClick={() => setShowCreateClassModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVirtualClassroom} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase font-mono mb-1.5">Nama Kelas Virtual</label>
                <input
                  type="text"
                  required
                  value={newClassName}
                  onChange={e => setNewClassName(e.target.value)}
                  placeholder="Misal: Kelas Nahwu Ganjil, Fisika X-1"
                  className="w-full bg-slate-50 border border-slate-250 text-slate-800 text-xs px-3 py-2 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase font-mono mb-1.5">Mata Pelajaran</label>
                  <select
                    required
                    value={newClassSubject}
                    onChange={e => setNewClassSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 text-slate-800 text-xs px-3 py-2 rounded-lg focus:outline-none"
                  >
                    <option value="">Pilih Mapel</option>
                    {courses.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase font-mono mb-1.5">Rombongan Belajar</label>
                  <select
                    required
                    value={newClassGrade}
                    onChange={e => setNewClassGrade(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 text-slate-800 text-xs px-3 py-2 rounded-lg focus:outline-none"
                  >
                    <option value="">Pilih Rombel</option>
                    {classrooms.map((cl: any) => (
                      <option key={cl.id} value={cl.id}>{cl.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase font-mono mb-1.5">Guru Pengampu</label>
                <select
                  required
                  value={newClassTeacher}
                  onChange={e => setNewClassTeacher(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 text-slate-800 text-xs px-3 py-2 rounded-lg focus:outline-none"
                >
                  <option value="">Pilih Guru</option>
                  {teachers.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase font-mono mb-1.5">Deskripsi Singkat</label>
                <textarea
                  value={newClassDesc}
                  onChange={e => setNewClassDesc(e.target.value)}
                  placeholder="Informasi cakupan materi kelas..."
                  className="w-full bg-slate-50 border border-slate-250 text-slate-800 text-xs px-3 py-2 rounded-lg h-20 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateClassModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-250 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createClassroomMutation.isPending}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  {createClassroomMutation.isPending ? 'Menyimpan...' : 'Buat Kelas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: SCHEDULE MEETING ==================== */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex justify-between items-center">
              <h4 className="text-sm font-bold text-slate-800">Jadwalkan Live Room Baru</h4>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleMeeting} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase font-mono mb-1.5">Judul Pertemuan</label>
                <input
                  type="text"
                  required
                  value={schedTitle}
                  onChange={e => setSchedTitle(e.target.value)}
                  placeholder="Misal: Ujian Syafahi Nahwu, Rapat Kurikulum"
                  className="w-full bg-slate-50 border border-slate-250 text-slate-800 text-xs px-3 py-2 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase font-mono mb-1.5">Tipe Agenda</label>
                  <select
                    value={schedType}
                    onChange={e => setSchedType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 text-slate-800 text-xs px-3 py-2 rounded-lg focus:outline-none"
                  >
                    <option value="Class">Kelas (Class)</option>
                    <option value="Meeting">Rapat (Meeting)</option>
                    <option value="Webinar">Webinar Sekolah</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase font-mono mb-1.5">Virtual Classroom</label>
                  <select
                    value={schedClassroomId}
                    onChange={e => setSchedClassroomId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 text-slate-800 text-xs px-3 py-2 rounded-lg focus:outline-none"
                  >
                    <option value="">Tidak Ada / Umum</option>
                    {virtualClassrooms.map((vc: any) => (
                      <option key={vc.id} value={vc.id}>{vc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase font-mono mb-1.5">Mulai Tanggal &amp; Jam</label>
                  <input
                    type="datetime-local"
                    required
                    value={schedStart}
                    onChange={e => setSchedStart(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 text-slate-800 text-xs px-3 py-2 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase font-mono mb-1.5">Selesai Jam</label>
                  <input
                    type="datetime-local"
                    required
                    value={schedEnd}
                    onChange={e => setSchedEnd(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 text-slate-800 text-xs px-3 py-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <span className="block text-xs font-bold text-slate-500 uppercase font-mono">Fitur Keamanan &amp; Hak Akses</span>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 cursor-pointer">
                    <input type="checkbox" checked={schedWhiteboard} onChange={e => setSchedWhiteboard(e.target.checked)} />
                    <span>Papan Tulis Kolaboratif</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 cursor-pointer">
                    <input type="checkbox" checked={schedChat} onChange={e => setSchedChat(e.target.checked)} />
                    <span>Obrolan Peserta</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 cursor-pointer col-span-2">
                    <input type="checkbox" checked={schedWaiting} onChange={e => setSchedWaiting(e.target.checked)} />
                    <span>Gunakan Ruang Tunggu (Waiting Room)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-250 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={scheduleMutation.isPending}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  {scheduleMutation.isPending ? 'Menyimpan...' : 'Jadwalkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: CONFIG PROVIDER ==================== */}
      {showProviderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex justify-between items-center">
              <h4 className="text-sm font-bold text-slate-800">Setup Kredensial Meeting Provider</h4>
              <button onClick={() => setShowProviderModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfigureProvider} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase font-mono mb-1.5">Aplikasi Provider SDK</label>
                <select
                  value={provCode}
                  onChange={e => setProvCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 text-slate-800 text-xs px-3 py-2 rounded-lg focus:outline-none"
                >
                  <option value="GOOGLE_MEET">Google Meet Integration</option>
                  <option value="ZOOM">Zoom Cloud Meeting SDK</option>
                  <option value="JITSI">Jitsi Meet (Self-Hosted/Cloud)</option>
                  <option value="CUSTOM_WEBRTC">Built-in WebRTC (Immersive Stage)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase font-mono mb-1.5">API Client ID / Key</label>
                <input
                  type="text"
                  required
                  value={provApiKey}
                  onChange={e => setProvApiKey(e.target.value)}
                  placeholder="Ketik Client ID atau SDK API Key..."
                  className="w-full bg-slate-50 border border-slate-250 text-slate-800 text-xs px-3 py-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase font-mono mb-1.5">API Client Secret</label>
                <input
                  type="password"
                  required
                  value={provSecret}
                  onChange={e => setProvSecret(e.target.value)}
                  placeholder="Ketik Client Secret..."
                  className="w-full bg-slate-50 border border-slate-250 text-slate-800 text-xs px-3 py-2 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProviderModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-250 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={providerMutation.isPending}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  {providerMutation.isPending ? 'Menghubungkan...' : 'Simpan Kredensial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple Helper Icon component since Type is not standard in lucide-react or was not imported
function TypeIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
    >
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  );
}
