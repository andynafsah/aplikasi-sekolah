/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import {
  Smartphone,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Send,
  Trash2,
  Settings,
  Sliders,
  Play,
  Clock,
  Search,
  Filter,
  Layers,
  ChevronRight,
  Info,
  Calendar,
  Sparkles,
  User,
  QrCode,
  Camera,
  FileText,
  UploadCloud,
  Fingerprint,
  Wifi,
  WifiOff,
  Bell,
  Activity,
  Download,
  Copy,
  Terminal,
  Database,
  Code,
  ShieldCheck,
  CreditCard,
  MapPin,
  FileSpreadsheet,
  AlertCircle,
  BookOpen,
  Award,
  Video,
  DollarSign,
  Briefcase,
  Users,
  LineChart,
  Moon,
  Sun,
  Layout,
  RefreshCcw,
  Zap
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
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function MobilePlatform() {
  const { tenant, user } = useAuth();
  const isPondok = tenant?.type === 'PONDOK' || tenant?.type === 'KEDUA';

  // State Management for Mobile Simulator
  const [phoneTheme, setPhoneTheme] = useState<'light' | 'dark'>('light');
  const [phoneRole, setPhoneRole] = useState<'student' | 'parent' | 'teacher' | 'employee' | 'executive'>('student');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [pinCode, setPinCode] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; body: string; time: string; read: boolean }>>([
    { id: '1', title: 'Tugas Baru Fisika', body: 'Ustadz Jaelani memposting tugas KBM-7. Sifat: Wajib.', time: '09:00', read: false },
    { id: '2', title: 'Pengumuman Liburan', body: 'Libur semester genap asrama dimulai tgl 12 Juli.', time: 'Kemarin', read: true }
  ]);
  const [activeNotificationToast, setActiveNotificationToast] = useState<string | null>(null);

  // Scanner Simulator State
  const [scannerActive, setScannerActive] = useState<boolean>(false);
  const [scannerType, setScannerType] = useState<'qr' | 'barcode' | 'document'>('qr');
  const [scanResult, setScanResult] = useState<string | null>(null);

  // Upload Simulator State
  const [uploadActive, setUploadActive] = useState<boolean>(false);
  const [uploadType, setUploadType] = useState<'camera' | 'gallery' | 'pdf' | 'video'>('camera');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; type: string; size: string }>>([]);

  // Offline Mode Queue Storage
  const [offlineQueue, setOfflineQueue] = useState<Array<{ id: string; module: string; action: string; payload: any; timestamp: string }>>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncLogs, setSyncLogs] = useState<Array<string>>([]);

  // Draft inputs for offline queue
  const [draftAttendanceStatus, setDraftAttendanceStatus] = useState<string>('HADIR');
  const [draftStudentId, setDraftStudentId] = useState<string>('std-1');
  const [draftGradeScore, setDraftGradeScore] = useState<string>('85');
  const [draftGradeSubject, setDraftGradeSubject] = useState<string>('Matematika');

  // Push sender controls
  const [pushTitleInput, setPushTitleInput] = useState('Peringatan Presensi!');
  const [pushBodyInput, setPushBodyInput] = useState('Harap lakukan tap-in presensi asrama sebelum jam 21:00 WIB.');

  // Deep linking simulate input
  const [deepLinkInput, setDeepLinkInput] = useState('schoolapp://payment/inv-101');

  // Educational/Documentation Active Tab
  const [docTab, setDocTab] = useState<'sql' | 'gas' | 'api' | 'reactnative'>('sql');

  // Crash log simulated database
  const [crashLogs, setCrashLogs] = useState<Array<{ id: string; device: string; os: string; error: string; time: string; status: string }>>([
    { id: 'CR-908', device: 'Xiaomi Poco F5', os: 'Android 14', error: 'NullPointerException: Attempt to invoke virtual method on a null object reference at ExpoCamera.onScan', time: '2026-07-04 10:20:15', status: 'UNRESOLVED' },
    { id: 'CR-742', device: 'iPhone 15 Pro', os: 'iOS 17.4', error: 'OutOfMemoryError: RefCountedImageCache exceeded limits when buffering raw documents', time: '2026-07-03 14:11:02', status: 'RESOLVED' }
  ]);

  // Simulation parameters & triggers
  const triggerPushNotification = (title: string, body: string) => {
    const newNotif = {
      id: `push-${Date.now()}`,
      title,
      body,
      time: 'Baru Saja',
      read: false
    };
    setNotifications([newNotif, ...notifications]);
    setActiveNotificationToast(title + ": " + body);
    setTimeout(() => setActiveNotificationToast(null), 5000);
  };

  const handleDeepLinkSimulate = (link: string) => {
    alert(`Deep Link Diaktifkan: ${link}\nNavigasi internal router dialihkan secara terproteksi.`);
    if (link.includes('payment')) {
      setActiveTab('finance');
    } else if (link.includes('attendance')) {
      setActiveTab('attendance');
    } else {
      setActiveTab('home');
    }
  };

  const addOfflineQueue = (module: string, action: string, payload: any) => {
    const newItem = {
      id: `queue-${Date.now()}`,
      module,
      action,
      payload,
      timestamp: new Date().toLocaleTimeString()
    };
    setOfflineQueue([...offlineQueue, newItem]);
    triggerPushNotification('Draft Tersimpan Offline', `${module} disimpan dalam antrean sinkronisasi lokal.`);
  };

  const startSyncJob = () => {
    if (offlineQueue.length === 0) {
      alert('Antrean offline kosong. Buat transaksi offline terlebih dahulu.');
      return;
    }
    if (!isOnline) {
      alert('Tidak dapat mensinkronkan. Hubungkan kembali jaringan internet simulator (Online).');
      return;
    }

    setIsSyncing(true);
    setSyncLogs(['[START] Memulai Sinkronisasi Latar Belakang (Sync Job)...']);

    setTimeout(() => {
      setSyncLogs(prev => [...prev, '[AUTH] Memverifikasi JWT & Refresh Token perangkat...', '[TENANT] Validasi kecocokan Tenant ID: OK.']);
    }, 800);

    setTimeout(() => {
      setSyncLogs(prev => [...prev, `[QUEUE] Mengirim ${offlineQueue.length} data antrean offline ke server Supabase...`]);
    }, 1600);

    setTimeout(() => {
      setSyncLogs(prev => [
        ...prev,
        ...offlineQueue.map(q => `[SUCCESS] Berhasil sinkronisasi ${q.module} [${q.action}] - Payload terproses ke Database Utama.`)
      ]);
      setOfflineQueue([]);
    }, 2800);

    setTimeout(() => {
      setSyncLogs(prev => [...prev, '[CACHE] Memperbarui local SQLite cache...', '[DONE] Sinkronisasi Selesai Seluruhnya!']);
      setIsSyncing(false);
      triggerPushNotification('Sinkronisasi Selesai', 'Seluruh data offline berhasil diselaraskan ke cloud.');
    }, 3800);
  };

  const handleSimulateScan = () => {
    setScannerActive(true);
    setScanResult(null);
    setTimeout(() => {
      let result = '';
      if (scannerType === 'qr') {
        result = 'STUDENT-ID-2026-X_A_UN_12';
      } else if (scannerType === 'barcode') {
        result = 'BOOK-ISBN-97860205241';
      } else {
        result = 'DOC-SCAN-IJAZAH-SANTRI-JPG';
      }
      setScanResult(result);
      setScannerActive(false);

      if (isOnline) {
        triggerPushNotification('Scanner Sukses', `Hasil Scan: ${result}`);
      } else {
        addOfflineQueue('SCANNER', 'RECORD_SCAN', { code: result });
      }
    }, 3000);
  };

  const handleSimulateUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadActive(true);
    setUploadProgress(10);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadActive(false);
          const newFile = {
            name: `${uploadType.toUpperCase()}_UPLOAD_${Math.floor(Math.random() * 9000 + 1000)}.${uploadType === 'pdf' ? 'pdf' : uploadType === 'video' ? 'mp4' : 'jpg'}`,
            type: uploadType.toUpperCase(),
            size: `${(Math.random() * 4 + 1).toFixed(1)} MB`
          };
          setUploadedFiles([newFile, ...uploadedFiles]);
          triggerPushNotification('Upload Berhasil', `${newFile.name} siap dikaitkan ke sistem.`);
          return 100;
        }
        return prev + 30;
      });
    }, 600);
  };

  // Recharts Data preparation
  const usageChartData = [
    { date: '29 Juni', 'Android Users': 420, 'iOS Users': 180, 'PWA Hits': 90 },
    { date: '30 Juni', 'Android Users': 480, 'iOS Users': 195, 'PWA Hits': 110 },
    { date: '01 Juli', 'Android Users': 510, 'iOS Users': 210, 'PWA Hits': 140 },
    { date: '02 Juli', 'Android Users': 590, 'iOS Users': 240, 'PWA Hits': 180 },
    { date: '03 Juli', 'Android Users': 620, 'iOS Users': 250, 'PWA Hits': 210 },
    { date: '04 Juli', 'Android Users': 680, 'iOS Users': 290, 'PWA Hits': 250 }
  ];

  const syncStatusData = [
    { name: 'Siswa', Success: 120, Failed: 0 },
    { name: 'Kehadiran', Success: 450, Failed: 4 },
    { name: 'Nilai', Success: 180, Failed: 1 },
    { name: 'Keuangan', Success: 90, Failed: 0 }
  ];

  const deviceDistributionData = [
    { name: 'Android Mobile', value: 65, color: '#10b981' },
    { name: 'iOS App (Apple)', value: 25, color: '#3b82f6' },
    { name: 'PWA Mobile Web', value: 10, color: '#f59e0b' }
  ];

  const sqlCode = `-- ======================================================
-- ENTERPRISE MOBILE PLATFORM SUPABASE SQL SCHEMA (SPRINT 23)
-- Fully compliant with primary keys, foreign keys, unique constraint, Check, indexes & Soft delete
-- ======================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Mobile Installations Table
CREATE TABLE mobile_installations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(50) NOT NULL,
  device_uuid VARCHAR(100) UNIQUE NOT NULL,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('ANDROID', 'IOS', 'PWA')),
  os_version VARCHAR(20),
  app_version VARCHAR(20) NOT NULL,
  device_model VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_by UUID,
  updated_by UUID
);

-- 2. Mobile Devices Table
CREATE TABLE mobile_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(50) NOT NULL,
  installation_id UUID REFERENCES mobile_installations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  device_name VARCHAR(100),
  push_token_registered BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_by UUID,
  updated_by UUID
);

-- 3. Mobile Push Tokens Table
CREATE TABLE mobile_push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(50) NOT NULL,
  device_uuid VARCHAR(100) NOT NULL,
  token TEXT NOT NULL,
  provider VARCHAR(20) NOT NULL CHECK (provider IN ('EXPO', 'FCM', 'APNS')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_by UUID,
  updated_by UUID,
  UNIQUE(device_uuid, token)
);

-- 4. Mobile Sessions Table (JWT, Refresh Token, Biometric authentication security logs)
CREATE TABLE mobile_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(50) NOT NULL,
  device_uuid VARCHAR(100) NOT NULL,
  user_id UUID NOT NULL,
  refresh_token_hash TEXT NOT NULL,
  biometric_token_hash TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_by UUID,
  updated_by UUID
);

-- 5. Mobile Settings Table
CREATE TABLE mobile_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(50) NOT NULL,
  user_id UUID UNIQUE NOT NULL,
  theme_preference VARCHAR(10) DEFAULT 'LIGHT' CHECK (theme_preference IN ('LIGHT', 'DARK', 'SYSTEM')),
  biometric_login_enabled BOOLEAN DEFAULT FALSE,
  pin_code_hash VARCHAR(100),
  push_notification_enabled BOOLEAN DEFAULT TRUE,
  local_sync_interval_mins INT DEFAULT 15 CHECK (local_sync_interval_mins >= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_by UUID,
  updated_by UUID
);

-- 6. Mobile Sync Jobs Table
CREATE TABLE mobile_sync_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(50) NOT NULL,
  device_uuid VARCHAR(100) NOT NULL,
  user_id UUID NOT NULL,
  job_status VARCHAR(20) DEFAULT 'PENDING' CHECK (job_status IN ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED')),
  payload_size_kb INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_by UUID,
  updated_by UUID
);

-- 7. Mobile Sync Logs Table
CREATE TABLE mobile_sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(50) NOT NULL,
  sync_job_id UUID REFERENCES mobile_sync_jobs(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  log_detail TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_by UUID,
  updated_by UUID
);

-- 8. Mobile Offline Queue Table
CREATE TABLE mobile_offline_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(50) NOT NULL,
  user_id UUID NOT NULL,
  module_name VARCHAR(50) NOT NULL CHECK (module_name IN ('ATTENDANCE', 'GRADE_BOOK', 'FINANCE', 'CBT', 'LMS', 'PROFILE')),
  action_type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  retry_count INT DEFAULT 0,
  sync_error_message TEXT,
  is_processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_by UUID,
  updated_by UUID
);

-- 9. Mobile Cache Table
CREATE TABLE mobile_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(50) NOT NULL,
  user_id UUID NOT NULL,
  cache_key VARCHAR(100) NOT NULL,
  cache_data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_by UUID,
  updated_by UUID,
  UNIQUE(user_id, cache_key)
);

-- 10. Mobile Widgets Table
CREATE TABLE mobile_widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(50) NOT NULL,
  user_id UUID NOT NULL,
  widget_type VARCHAR(30) NOT NULL,
  layout_position INT NOT NULL,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_by UUID,
  updated_by UUID
);

-- 11. Mobile Updates Table
CREATE TABLE mobile_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(50) NOT NULL,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('ANDROID', 'IOS', 'ALL')),
  force_update BOOLEAN DEFAULT FALSE,
  latest_version VARCHAR(20) NOT NULL,
  release_notes TEXT,
  download_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_by UUID,
  updated_by UUID
);

-- 12. Mobile Feedbacks Table
CREATE TABLE mobile_feedbacks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(50) NOT NULL,
  user_id UUID NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_by UUID,
  updated_by UUID
);

-- 13. Mobile Crash Logs Table
CREATE TABLE mobile_crash_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(50) NOT NULL,
  device_uuid VARCHAR(100) NOT NULL,
  os_version VARCHAR(20),
  app_version VARCHAR(20) NOT NULL,
  stack_trace TEXT NOT NULL,
  resolved_status VARCHAR(20) DEFAULT 'UNRESOLVED' CHECK (resolved_status IN ('UNRESOLVED', 'RESOLVED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_by UUID,
  updated_by UUID
);

-- 14. Mobile Biometric Settings Table
CREATE TABLE mobile_biometric_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(50) NOT NULL,
  device_uuid VARCHAR(100) NOT NULL,
  biometric_type VARCHAR(20) CHECK (biometric_type IN ('FINGERPRINT', 'FACE_ID', 'TOUCH_ID')),
  public_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_by UUID,
  updated_by UUID
);

-- 15. Mobile Deep Links Table
CREATE TABLE mobile_deep_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(50) NOT NULL,
  link_pattern VARCHAR(255) NOT NULL,
  target_screen VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_by UUID,
  updated_by UUID
);

-- 16. Mobile Usage Statistics Table
CREATE TABLE mobile_usage_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(50) NOT NULL,
  user_id UUID NOT NULL,
  screen_name VARCHAR(100) NOT NULL,
  duration_seconds INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_by UUID,
  updated_by UUID
);

-- 17. Mobile Permissions Table
CREATE TABLE mobile_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(50) NOT NULL,
  device_uuid VARCHAR(100) NOT NULL,
  permission_type VARCHAR(50) NOT NULL CHECK (permission_type IN ('CAMERA', 'NOTIFICATIONS', 'LOCATION', 'BIOMETRICS', 'FILE_SYSTEM')),
  is_granted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_by UUID,
  updated_by UUID
);

-- 18. Mobile Feature Flags Table
CREATE TABLE mobile_feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(50) NOT NULL,
  flag_key VARCHAR(100) UNIQUE NOT NULL,
  is_enabled BOOLEAN DEFAULT FALSE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_by UUID,
  updated_by UUID
);

-- 19. Mobile Announcements Table (Local cached announcements)
CREATE TABLE mobile_announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(50) NOT NULL,
  title VARCHAR(150) NOT NULL,
  content TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_by UUID,
  updated_by UUID
);

-- 20. Mobile Versions Table
CREATE TABLE mobile_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(50) NOT NULL,
  version_code INT NOT NULL,
  version_name VARCHAR(20) NOT NULL,
  min_sdk_supported VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_by UUID,
  updated_by UUID
);

-- ======================================================
-- INDEXES FOR HIGH-PERFORMANCE DISPATCH & FETCH
-- ======================================================
CREATE INDEX idx_mobile_installations_uuid ON mobile_installations(device_uuid);
CREATE INDEX idx_mobile_devices_user ON mobile_devices(user_id);
CREATE INDEX idx_mobile_push_tokens_device ON mobile_push_tokens(device_uuid);
CREATE INDEX idx_mobile_sessions_token ON mobile_sessions(refresh_token_hash);
CREATE INDEX idx_mobile_offline_queue_user_processed ON mobile_offline_queue(user_id, is_processed);
CREATE INDEX idx_mobile_cache_key ON mobile_cache(user_id, cache_key);
CREATE INDEX idx_mobile_crash_logs_status ON mobile_crash_logs(resolved_status);
CREATE INDEX idx_mobile_sync_jobs_status ON mobile_sync_jobs(job_status);
`;

  const gasCode = `/**
 * ======================================================
 * GOOGLE APPS SCRIPT WEBHOOK ENDPOINT Blueprints (Sprint 23)
 * Handles REST payloads directly interfacing with Google Sheets Database
 * ======================================================
 */

function doPost(e) {
  var response;
  try {
    var jsonString = e.postData.contents;
    var requestData = JSON.parse(jsonString);
    var action = requestData.action;
    var tenantId = requestData.tenant_id;
    
    // Switch between requested Sprint 23 Mobile Endpoints
    switch(action) {
      case 'mobileLogin':
        response = handleMobileLogin(requestData, tenantId);
        break;
      case 'mobileRefresh':
        response = handleMobileRefresh(requestData, tenantId);
        break;
      case 'mobileLogout':
        response = handleMobileLogout(requestData, tenantId);
        break;
      case 'mobileDashboard':
        response = handleMobileDashboard(requestData, tenantId);
        break;
      case 'mobileSync':
        response = handleMobileSync(requestData, tenantId);
        break;
      case 'mobileOfflineQueue':
        response = handleMobileOfflineQueue(requestData, tenantId);
        break;
      case 'mobilePushToken':
        response = handleMobilePushToken(requestData, tenantId);
        break;
      case 'mobileNotification':
        response = handleMobileNotification(requestData, tenantId);
        break;
      case 'mobileProfile':
        response = handleMobileProfile(requestData, tenantId);
        break;
      case 'mobileSettings':
        response = handleMobileSettings(requestData, tenantId);
        break;
      case 'mobileAnalytics':
        response = handleMobileAnalytics(requestData, tenantId);
        break;
      case 'mobileVersion':
        response = handleMobileVersion(requestData, tenantId);
        break;
      case 'mobileUpdate':
        response = handleMobileUpdate(requestData, tenantId);
        break;
      default:
        response = { success: false, error: "Action NOT recognized or supported in Sprint 23 API." };
    }
  } catch (err) {
    response = { success: false, error: err.toString() };
  }
  
  return ContentService.createTextOutput(JSON.stringify(response))
                       .setMimeType(ContentService.MimeType.JSON);
}

function handleMobileLogin(data, tenantId) {
  // Validate credentials & return JWT and Refresh Token
  if(data.username && data.password) {
    return {
      success: true,
      data: {
        token: "jwt_token_payload_secret_sha256_••••••••",
        refreshToken: "refresh_token_payload_secret_sha256_••••••••",
        expiresIn: 3600,
        user: {
          id: "usr-" + Date.now(),
          name: data.username,
          role: data.role || "STUDENT",
          tenant_id: tenantId
        }
      }
    };
  }
  return { success: false, error: "Invalid username or password credentials." };
}

function handleMobileRefresh(data, tenantId) {
  if (data.refreshToken) {
    return {
      success: true,
      data: {
        token: "jwt_token_refreshed_payload_sha256_••••••••",
        refreshToken: "refresh_token_refreshed_payload_sha256_••••••••"
      }
    };
  }
  return { success: false, error: "Refresh token is invalid or expired." };
}

function handleMobileLogout(data, tenantId) {
  return { success: true, message: "Logged out mobile session successfully and cleared push registration." };
}

function handleMobileDashboard(data, tenantId) {
  return {
    success: true,
    data: {
      tenant_name: "SMA Nusantara Enterprise",
      today_attendance: { present: 450, absent: 5, late: 12 },
      finance_summary: { active_invoices_unpaid: 32, paid_today: 18 },
      recent_announcements: [
        { title: "Liburan Semester Genap", date: "2026-07-01", body: "Asrama tutup tgl 12." }
      ]
    }
  };
}

function handleMobileSync(data, tenantId) {
  var logs = [];
  var items = data.sync_items || [];
  for (var i = 0; i < items.length; i++) {
    logs.push("Berhasil sync item: " + items[i].id + " ke database Supabase");
  }
  return {
    success: true,
    processed_count: items.length,
    sync_logs: logs,
    timestamp: new Date().toISOString()
  };
}

function handleMobileOfflineQueue(data, tenantId) {
  return { success: true, message: "Antrean offline berhasil disimpan di buffer antrean server." };
}

function handleMobilePushToken(data, tenantId) {
  return { success: true, message: "Device push token registered/updated successfully inside mobile_push_tokens." };
}

function handleMobileNotification(data, tenantId) {
  return { success: true, message: "Push notification triggered successfully on device via Expo/APNS." };
}

function handleMobileProfile(data, tenantId) {
  return {
    success: true,
    data: {
      name: "Andi Wijaya",
      nis: "NISN-26019",
      class: "X-A Unggulan",
      boarding_room: "Kamar Abu Bakar 04",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb"
    }
  };
}

function handleMobileSettings(data, tenantId) {
  return { success: true, message: "Aplikasi mobile settings berhasil disimpan ke mobile_settings." };
}

function handleMobileAnalytics(data, tenantId) {
  return { success: true, count_logged: 1, message: "Analytics events recorded successfully in mobile_usage_statistics." };
}

function handleMobileVersion(data, tenantId) {
  return {
    success: true,
    data: {
      version_code: 104,
      version_name: "v2.4.0",
      update_required: false,
      update_recommended: true
    }
  };
}

function handleMobileUpdate(data, tenantId) {
  return { success: true, message: "Update checked. Device running latest certified build." };
}
`;

  const apiDocs = `{
  "api_specification": {
    "version": "v2.4.0",
    "base_url": "https://ais-dev.run.app/api/v2/mobile",
    "headers": {
      "Authorization": "Bearer <JWT_TOKEN>",
      "X-Tenant-ID": "tenant-nusantara"
    },
    "endpoints": [
      {
        "route": "/auth/login",
        "method": "POST",
        "desc": "Autentikasi awal perangkat mobile, mendukung standard login, PIN, atau Biometric signature",
        "request": {
          "username": "budi_wali",
          "password": "hashed_password_or_token",
          "biometric_signature": "pubkey_encrypted_payload",
          "device_uuid": "f29-019a-98bb"
        },
        "response": {
          "success": true,
          "token": "jwt_header_payload_signature",
          "refreshToken": "refresh_token_payload",
          "user_id": "usr-881",
          "role": "PARENT"
        }
      },
      {
        "route": "/sync/push-queue",
        "method": "POST",
        "desc": "Flush dan sinkronisasi antrean transaksi yang dibuat selama perangkat offline",
        "request": {
          "device_uuid": "f29-019a-98bb",
          "queue": [
            {
              "id": "queue-1725",
              "module": "ATTENDANCE",
              "action": "CHECK_IN",
              "payload": {
                "student_id": "std-09",
                "timestamp": "2026-07-04T07:31:00Z",
                "status": "HADIR"
              }
            }
          ]
        },
        "response": {
          "success": true,
          "synchronized_ids": ["queue-1725"],
          "updated_records_count": 1
        }
      },
      {
        "route": "/push-token/register",
        "method": "POST",
        "desc": "Registrasi Push Token Expo / FCM / Apple APNS untuk pengiriman push realtime",
        "request": {
          "device_uuid": "f29-019a-98bb",
          "token": "ExponentPushToken[Xg9••••••••]",
          "provider": "EXPO"
        },
        "response": {
          "success": true,
          "message": "Push token registered inside mobile_push_tokens"
        }
      },
      {
        "route": "/crashes/log",
        "method": "POST",
        "desc": "Melaporkan exception atau crash runtime dari aplikasi React Native",
        "request": {
          "device_uuid": "f29-019a-98bb",
          "os": "Android 14",
          "app_version": "v2.4.0",
          "stack_trace": "Fatal error in core engine..."
        },
        "response": {
          "success": true,
          "log_id": "CR-776"
        }
      }
    ]
  }
}`;

  const reactNativeCode = `/**
 * ======================================================
 * EXPO ROUTER & SECURE STORE REACT NATIVE BLUEPRINT
 * Shared client-side services, Offline Storage with SQLite, & Biometric auth hooks
 * ======================================================
 */

// 1. Reusable Shared Secure Storage Service
export const MobileSecurity = {
  async saveTokens(accessToken: string, refreshToken: string) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
    }
  },
  
  async getAccessToken() {
    return await SecureStore.getItemAsync('access_token');
  },
  
  async authenticateBiometrics() {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) return { success: false, error: "Hardware biometric tidak tersedia" };
    
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!isEnrolled) return { success: false, error: "Sidik jari / Face ID belum didaftarkan" };
    
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Autentikasi Keamanan Sekolah ERP',
      fallbackLabel: 'Gunakan PIN Kode'
    });
    
    return result;
  }
};

// 2. Push Notification Setup Hook
export function usePushNotificationSetup() {
  useEffect(() => {
    async function registerForPush() {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return;
      
      const tokenData = await Notifications.getExpoPushTokenAsync();
      console.log("Device Push Token:", tokenData.data);
      
      // Register token to Supabase Rest API
      await axios.post('https://ais-dev.run.app/api/v2/mobile/push-token/register', {
        token: tokenData.data,
        provider: 'EXPO',
        device_uuid: 'unique-hw-uuid-190'
      });
    }
    
    registerForPush();
  }, []);
}

// 3. Main Expo Protected Route Layout
export default function MobileAppRoot() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  usePushNotificationSetup();

  async function handleBiometricLogin() {
    const auth = await MobileSecurity.authenticateBiometrics();
    if (auth.success) {
      setIsAuthenticated(true);
    } else {
      Alert.alert("Akses Ditolak", auth.error || "Gagal verifikasi biometrik.");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SMA Nusantara Mobile App</Text>
      {isAuthenticated ? (
        <View style={styles.dashboard}>
          <Text style={styles.subtitle}>Selamat Datang di Portal Terpadu!</Text>
          <Text style={styles.info}>Koneksi Secure SSL • Synced Offline Cache ready</Text>
        </View>
      ) : (
        <View style={styles.loginForm}>
          <Text style={styles.label}>Pilih Metode Autentikasi:</Text>
          <Button title="Login dengan Biometrik (FaceID/Fingerprint)" onPress={handleBiometricLogin} color="#10b981" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a', padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  subtitle: { fontSize: 16, color: '#10b981', marginBottom: 10 },
  info: { fontSize: 12, color: '#94a3b8' },
  loginForm: { width: '100%', gap: 12 },
  label: { color: '#94a3b8', marginBottom: 10, textAlign: 'center' }
});
`;

  return (
    <div className="space-y-6 font-sans pb-16">
      
      {/* Top Hero Overview Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 p-6 md:p-8 rounded-2xl shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Smartphone className="h-44 w-44 text-white animate-pulse" />
        </div>
        <div className="relative z-10 max-w-4xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-semibold font-mono uppercase tracking-wider">
            <Sparkles className="h-3 w-3" /> Sprint 23 Complete
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-none">
            Enterprise Mobile Platform Panel
          </h1>
          <p className="text-indigo-200 text-sm md:text-base max-w-2xl font-light">
            Solusi portal multi-peran (Siswa, Orang Tua, Guru, Staff, Eksekutif) yang kompatibel dengan Android, iOS, dan PWA. Mendukung sinkronisasi latar belakang offline, autentikasi biometrik, scanner QR/Barcode, dan push notification real-time.
          </p>
        </div>
      </div>

      {/* THREE SECTION WORKSPACE GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* SECTION 1: THE INTERACTIVE MOBILE SMARTPHONE SIMULATOR (4 Columns) */}
        <div className="xl:col-span-5 flex flex-col items-center">
          
          {/* Phone Frame wrapper */}
          <div className="relative w-full max-w-[370px] bg-slate-950 p-4 rounded-[45px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] border-4 border-slate-800 ring-12 ring-slate-900/50">
            {/* Camera Speaker Notch */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-32 h-5 bg-slate-950 rounded-full z-30 flex items-center justify-between px-4">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500/80" />
              <div className="h-1 w-12 rounded-full bg-slate-800" />
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/80" />
            </div>

            {/* Notification push popup toast on top of phone */}
            {activeNotificationToast && (
              <div className="absolute top-12 left-6 right-6 bg-slate-900/95 border border-indigo-500/40 backdrop-blur-md p-3 rounded-xl shadow-xl z-50 text-white flex items-start gap-2.5 animate-slide-down">
                <Bell className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-[11px] font-bold text-indigo-300">Push Notification Received</p>
                  <p className="text-[10px] text-slate-200 line-clamp-2 leading-tight mt-0.5">{activeNotificationToast}</p>
                </div>
              </div>
            )}

            {/* Screen Area */}
            <div className={`w-full aspect-[9/19] rounded-[36px] overflow-hidden relative flex flex-col ${
              phoneTheme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
            }`}>
              
              {/* Phone Status Bar */}
              <div className="h-10 shrink-0 px-6 pt-3 flex items-center justify-between text-[11px] font-bold font-mono z-20">
                <span>09:41 AM</span>
                <div className="flex items-center gap-1.5">
                  {isOnline ? (
                    <Wifi className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <WifiOff className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
                  )}
                  <span className={`text-[9px] px-1 py-0.5 rounded ${isOnline ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    {isOnline ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>
              </div>

              {/* Protected Routing Lock Screen if not logged in */}
              {!isLoggedIn ? (
                <div className="flex-1 flex flex-col justify-between p-6 pt-12 z-10">
                  <div className="space-y-2 text-center mt-6">
                    <div className="h-14 w-14 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg">
                      <Smartphone className="h-7 w-7" />
                    </div>
                    <h3 className="font-extrabold text-lg tracking-tight">SMA Nusantara Mobile</h3>
                    <p className="text-[11px] text-slate-400 font-medium">Enterprise Multitenant Auth v2.4</p>
                  </div>

                  <div className="space-y-4">
                    {/* PIN / Password inputs */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Masukkan PIN Akses Anda</label>
                      <input
                        type="password"
                        placeholder="••••"
                        maxLength={4}
                        value={pinCode}
                        onChange={(e) => setPinCode(e.target.value)}
                        className="w-full text-center text-lg tracking-widest p-2 bg-slate-500/10 border rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          if (pinCode === '1234' || pinCode === '') {
                            setIsLoggedIn(true);
                            setPinCode('');
                            triggerPushNotification('Login Berhasil', 'Autentikasi dengan token JWT & PIN sukses.');
                          } else {
                            alert('PIN salah! Simulasikan dengan PIN default "1234" atau biarkan kosong.');
                          }
                        }}
                        className="w-full py-2.5 bg-indigo-600 text-white font-extrabold text-xs rounded-xl shadow-md"
                      >
                        Autentikasi Sekarang
                      </button>

                      {biometricEnabled && (
                        <button
                          onClick={() => {
                            setIsLoggedIn(true);
                            triggerPushNotification('Biometric Pass', 'Akses diijinkan melalui Sidik Jari (Biometrics ID).');
                          }}
                          className="w-full py-2 bg-slate-500/10 hover:bg-slate-500/20 text-xs font-bold rounded-xl flex items-center justify-center gap-2 border"
                        >
                          <Fingerprint className="h-4 w-4 text-emerald-500" /> Log In with Fingerprint
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="text-center text-[10px] text-slate-500 font-mono">
                    Secured by Expo Secure Store
                  </div>
                </div>
              ) : (
                
                // ---------------- ACTIVE APP SCREEN ----------------
                <div className="flex-1 flex flex-col justify-between overflow-hidden relative">
                  
                  {/* APP TITLE BAR */}
                  <div className="px-5 py-2.5 border-b border-slate-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-[10px] font-bold font-mono tracking-wider uppercase">
                        {phoneRole.toUpperCase()} APP
                      </span>
                    </div>
                    <button
                      onClick={() => setIsLoggedIn(false)}
                      className="text-[9px] bg-slate-500/10 px-2 py-0.5 rounded font-bold"
                    >
                      LOGOUT
                    </button>
                  </div>

                  {/* MAIN PHONE SCROLL CONTENT */}
                  <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                    
                    {/* Simulator active scanning mode view */}
                    {scannerActive ? (
                      <div className="p-4 bg-slate-900 text-white rounded-xl text-center space-y-3 border-2 border-indigo-500 animate-pulse">
                        <QrCode className="h-10 w-10 mx-auto text-indigo-400" />
                        <div className="space-y-1">
                          <p className="text-xs font-extrabold">Simulasi {scannerType.toUpperCase()} Scanner Aktif</p>
                          <p className="text-[10px] text-slate-400">Membaca feed kamera mobile...</p>
                        </div>
                        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden relative">
                          <div className="h-full bg-indigo-500 w-1/2 animate-shimmer" />
                        </div>
                      </div>
                    ) : scanResult ? (
                      <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 rounded-xl text-xs space-y-1">
                        <p className="font-bold">✓ Scan Terbaca:</p>
                        <p className="font-mono text-[10px] break-all bg-emerald-500/5 p-1 rounded border border-emerald-500/20">{scanResult}</p>
                        <button onClick={() => setScanResult(null)} className="text-[9px] text-emerald-700 underline font-semibold mt-1">Scan Ulang</button>
                      </div>
                    ) : null}

                    {/* Simulator active uploading mode view */}
                    {uploadActive ? (
                      <div className="p-4 bg-slate-950 text-white rounded-xl text-center space-y-2 border">
                        <UploadCloud className="h-8 w-8 mx-auto text-blue-400 animate-bounce" />
                        <p className="text-[11px] font-bold">Uploading {uploadType.toUpperCase()} file to CDN...</p>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      </div>
                    ) : null}

                    {/* APP TAB SCREEN ROUTING VIEW */}
                    {activeTab === 'home' && (
                      <div className="space-y-4 animate-fade-in text-left">
                        
                        {/* 1. STUDENT MOBILE ROLE HOME */}
                        {phoneRole === 'student' && (
                          <div className="space-y-3">
                            <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-sm space-y-1">
                              <p className="text-[10px] text-indigo-100 font-mono">SELAMAT DATANG SISWA</p>
                              <h4 className="text-sm font-extrabold">Farhan Ramadhan</h4>
                              <p className="text-[10px] text-indigo-200">NISN: 240188 • Kelas X-A Unggulan</p>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div className="p-3 bg-slate-500/5 rounded-xl border border-slate-500/10 space-y-1">
                                <span className="text-[9px] text-slate-400 font-bold uppercase">Kehadiran</span>
                                <p className="text-xs font-black text-emerald-500">98% HADIR</p>
                              </div>
                              <div className="p-3 bg-slate-500/5 rounded-xl border border-slate-500/10 space-y-1">
                                <span className="text-[9px] text-slate-400 font-bold uppercase">Nilai Rata-rata</span>
                                <p className="text-xs font-black text-indigo-500">88.5 / A</p>
                              </div>
                            </div>

                            <div className="p-3 bg-indigo-500/10 rounded-xl space-y-2 text-xs">
                              <h5 className="font-extrabold flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5 text-indigo-500" /> Modul LMS Aktif</h5>
                              <div className="p-2 bg-white/60 dark:bg-slate-900/40 rounded border space-y-1">
                                <p className="font-bold text-[11px]">KBM-7: Pengenalan Vektor Fisika</p>
                                <p className="text-[10px] text-slate-400">Due: Hari ini 23:59</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 2. PARENT MOBILE ROLE HOME */}
                        {phoneRole === 'parent' && (
                          <div className="space-y-3">
                            <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-sm space-y-1">
                              <p className="text-[10px] text-emerald-100 font-mono">PORTAL ORANG TUA</p>
                              <h4 className="text-sm font-extrabold">Bapak Ahmad Subarjo</h4>
                              <p className="text-[10px] text-emerald-200">Menghubungkan 1 Siswa Aktif</p>
                            </div>

                            {/* Linked students list */}
                            <div className="p-3 bg-slate-500/5 rounded-xl border border-slate-500/10 flex items-center justify-between text-xs">
                              <div>
                                <p className="font-bold">Farhan Ramadhan</p>
                                <p className="text-[10px] text-slate-400">NIS: 240188 • Asrama Kamar 4</p>
                              </div>
                              <span className="text-[9px] bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full font-bold">Anak</span>
                            </div>

                            {/* SPP Payment widget */}
                            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-xs space-y-1.5">
                              <div className="flex justify-between items-center">
                                <span className="font-extrabold text-amber-800">Tagihan SPP Belum Lunas</span>
                                <span className="text-[9px] bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded">UNPAID</span>
                              </div>
                              <p className="text-[11px] text-slate-600">Bulan: Juli 2026 • Rp 450.000</p>
                              <button
                                onClick={() => setActiveTab('finance')}
                                className="w-full py-1.5 bg-amber-500 text-white font-black text-[10px] rounded"
                              >
                                BAYAR VIA VA SEKARANG
                              </button>
                            </div>
                          </div>
                        )}

                        {/* 3. TEACHER MOBILE ROLE HOME */}
                        {phoneRole === 'teacher' && (
                          <div className="space-y-3">
                            <div className="p-4 bg-teal-600 text-white rounded-2xl shadow-sm space-y-1">
                              <p className="text-[10px] text-teal-100 font-mono">PORTAL USTADZ / GURU</p>
                              <h4 className="text-sm font-extrabold">Ustadz Jaelani Al-Fatih</h4>
                              <p className="text-[10px] text-teal-200 font-mono">ID: TCH-9092</p>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => {
                                  setScannerType('qr');
                                  handleSimulateScan();
                                }}
                                className="p-3 bg-slate-500/5 rounded-xl border hover:bg-slate-500/10 text-center flex flex-col items-center gap-1.5"
                              >
                                <QrCode className="h-5 w-5 text-teal-600" />
                                <span className="text-[10px] font-bold">Input Absensi Siswa</span>
                              </button>
                              
                              <button
                                onClick={() => setActiveTab('grades')}
                                className="p-3 bg-slate-500/5 rounded-xl border hover:bg-slate-500/10 text-center flex flex-col items-center gap-1.5"
                              >
                                <Award className="h-5 w-5 text-indigo-600" />
                                <span className="text-[10px] font-bold">Input Nilai KBM</span>
                              </button>
                            </div>

                            <div className="p-3 bg-slate-500/5 rounded-xl border text-xs text-slate-500">
                              <p className="font-bold text-slate-700">Wali Kelas: Kelas X-A</p>
                              <p className="text-[10px]">Total Santri/Siswa Wali: 32 Anak</p>
                            </div>
                          </div>
                        )}

                        {/* 4. EMPLOYEE MOBILE ROLE HOME */}
                        {phoneRole === 'employee' && (
                          <div className="space-y-3">
                            <div className="p-4 bg-slate-800 text-white rounded-2xl shadow-sm space-y-1">
                              <p className="text-[10px] text-slate-300 font-mono">EMPLOYEE WORKFLOW</p>
                              <h4 className="text-sm font-extrabold">Hasan Basri (Logistik)</h4>
                              <p className="text-[10px] text-slate-400">Operational & Asset Team</p>
                            </div>

                            {/* Camera Selfie Check in */}
                            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-xs space-y-2">
                              <p className="font-bold text-blue-800">Presensi Kerja Harian (Staff Selfie)</p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setUploadType('camera');
                                    setUploadActive(true);
                                    let prog = 0;
                                    const inter = setInterval(() => {
                                      prog += 20;
                                      setUploadProgress(prog);
                                      if (prog >= 100) {
                                        clearInterval(inter);
                                        setUploadActive(false);
                                        triggerPushNotification('Selfie Absensi', 'Wajah terverifikasi GPS OK.');
                                      }
                                    }, 400);
                                  }}
                                  className="flex-1 py-1.5 bg-blue-600 text-white font-bold rounded flex items-center justify-center gap-1 text-[10px]"
                                >
                                  <Camera className="h-3.5 w-3.5" /> Ambil Selfie
                                </button>
                                <button
                                  onClick={() => {
                                    setUploadType('gallery');
                                    setUploadActive(true);
                                    let prog = 0;
                                    const inter = setInterval(() => {
                                      prog += 25;
                                      setUploadProgress(prog);
                                      if (prog >= 100) {
                                        clearInterval(inter);
                                        setUploadActive(false);
                                        triggerPushNotification('Slip Gaji Terunduh', 'Slip Gaji bulan Juni tersimpan offline.');
                                      }
                                    }, 300);
                                  }}
                                  className="py-1.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded text-[10px]"
                                >
                                  Unduh Slip Gaji
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 5. EXECUTIVE MOBILE ROLE HOME */}
                        {phoneRole === 'executive' && (
                          <div className="space-y-3">
                            <div className="p-4 bg-gradient-to-r from-purple-800 to-indigo-900 text-white rounded-2xl shadow-sm space-y-1">
                              <p className="text-[10px] text-purple-200 font-mono">DASHBOARD EKSEKUTIF</p>
                              <h4 className="text-sm font-extrabold">Kyai Haji Syarifuddin</h4>
                              <p className="text-[10px] text-purple-300">Ketua Yayasan / Principal</p>
                            </div>

                            <div className="p-3 bg-indigo-500/10 rounded-xl space-y-2 text-xs">
                              <h5 className="font-extrabold text-indigo-700">Ringkasan Anggaran Yayasan</h5>
                              <div className="grid grid-cols-2 gap-2 text-center text-[10px] bg-white/40 dark:bg-slate-900/40 p-2 rounded">
                                <div className="border-r">
                                  <p className="text-slate-400">Spp Terbayar</p>
                                  <p className="font-black text-slate-800">Rp 148,2 M</p>
                                </div>
                                <div>
                                  <p className="text-slate-400">Unit Cabang</p>
                                  <p className="font-black text-slate-800">12 Cabang</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ANNOUNCEMENT LISTING SIMULATION */}
                        <div className="space-y-2 text-xs">
                          <h5 className="font-extrabold text-slate-400 uppercase tracking-wider text-[9px]">Pengumuman Terkini</h5>
                          <div className="space-y-2">
                            {notifications.map((n) => (
                              <div key={n.id} className="p-2.5 bg-slate-500/5 hover:bg-slate-500/10 rounded-xl border border-slate-500/10 text-left">
                                <div className="flex justify-between items-center mb-1">
                                  <p className="font-bold text-[11px] text-slate-700 dark:text-slate-200">{n.title}</p>
                                  <span className="text-[9px] text-slate-400 font-mono">{n.time}</span>
                                </div>
                                <p className="text-[10px] text-slate-500 leading-normal">{n.body}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    )}

                    {/* ATTENDANCE WORKFLOW IN SIMULATOR */}
                    {activeTab === 'attendance' && (
                      <div className="space-y-4 animate-fade-in text-left text-xs">
                        <div className="flex items-center gap-1.5 pb-2 border-b">
                          <Calendar className="h-4 w-4 text-emerald-500" />
                          <h4 className="font-extrabold text-slate-800 dark:text-slate-100">Presensi & Check-in</h4>
                        </div>

                        {/* Online/Offline Attendance submission */}
                        <div className="p-3 bg-slate-500/5 rounded-xl space-y-3">
                          <p className="font-semibold text-slate-700">Scan Kartu Pelajar (Pindai via HP Guru & Karyawan):</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] text-slate-400 font-bold block mb-1">ID Siswa</label>
                              <select
                                value={draftStudentId}
                                onChange={(e) => setDraftStudentId(e.target.value)}
                                className="w-full text-[10px] p-2 bg-slate-500/10 border rounded"
                              >
                                <option value="std-1">Farhan Ramadhan</option>
                                <option value="std-2">Laila Fitriani</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-400 font-bold block mb-1">Status Hadir</label>
                              <select
                                value={draftAttendanceStatus}
                                onChange={(e) => setDraftAttendanceStatus(e.target.value)}
                                className="w-full text-[10px] p-2 bg-slate-500/10 border rounded"
                              >
                                <option value="HADIR">Hadir</option>
                                <option value="IZIN">Izin</option>
                                <option value="ALFA">Alfa</option>
                              </select>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              if (isOnline) {
                                triggerPushNotification('Presensi Tercatat', `Siswa ${draftStudentId} tercatat ${draftAttendanceStatus} langsung di Supabase.`);
                              } else {
                                addOfflineQueue('ATTENDANCE', 'RECORD_ATTENDANCE', {
                                  student_id: draftStudentId,
                                  status: draftAttendanceStatus,
                                  date: new Date().toLocaleDateString()
                                });
                              }
                            }}
                            className="w-full py-2 bg-emerald-600 text-white font-extrabold text-[10px] rounded"
                          >
                            {isOnline ? 'Kirim Presensi (Online)' : 'Simpan Draft (Offline)'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ACADEMIC GRADE WORKFLOW IN SIMULATOR */}
                    {activeTab === 'grades' && (
                      <div className="space-y-4 animate-fade-in text-left text-xs">
                        <div className="flex items-center gap-1.5 pb-2 border-b">
                          <Award className="h-4 w-4 text-indigo-500" />
                          <h4 className="font-extrabold text-slate-800 dark:text-slate-100">Input Nilai Akademik</h4>
                        </div>

                        <div className="p-3 bg-slate-500/5 rounded-xl space-y-3">
                          <p className="font-semibold text-slate-700">Simulasikan Input Nilai KBM:</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] text-slate-400 font-bold block mb-1">Mata Pelajaran</label>
                              <input
                                type="text"
                                value={draftGradeSubject}
                                onChange={(e) => setDraftGradeSubject(e.target.value)}
                                className="w-full text-[10px] p-2 bg-slate-500/10 border rounded"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-400 font-bold block mb-1">Skor Nilai</label>
                              <input
                                type="number"
                                value={draftGradeScore}
                                onChange={(e) => setDraftGradeScore(e.target.value)}
                                className="w-full text-[10px] p-2 bg-slate-500/10 border rounded"
                              />
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              if (isOnline) {
                                triggerPushNotification('Nilai Diupdate', `Nilai ${draftGradeSubject} siswa sukses diposting: ${draftGradeScore}.`);
                              } else {
                                addOfflineQueue('GRADE_BOOK', 'POST_SCORE', {
                                  subject: draftGradeSubject,
                                  score: draftGradeScore,
                                  posted_at: new Date().toISOString()
                                });
                              }
                            }}
                            className="w-full py-2 bg-indigo-600 text-white font-extrabold text-[10px] rounded"
                          >
                            {isOnline ? 'Posting Nilai (Online)' : 'Simpan Draft Nilai (Offline)'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* FINANCE IN SIMULATOR */}
                    {activeTab === 'finance' && (
                      <div className="space-y-4 animate-fade-in text-left text-xs">
                        <div className="flex items-center gap-1.5 pb-2 border-b">
                          <DollarSign className="h-4 w-4 text-amber-500" />
                          <h4 className="font-extrabold text-slate-800 dark:text-slate-100">Administrasi & SPP</h4>
                        </div>

                        <div className="p-3.5 bg-amber-500/10 rounded-xl space-y-2 border border-amber-500/30">
                          <div className="flex justify-between items-center">
                            <span className="font-bold">SPP Bulan Juli 2026</span>
                            <span className="text-[9px] bg-rose-600 text-white px-2 py-0.5 rounded font-bold">UNPAID</span>
                          </div>
                          <p className="text-[10px] text-slate-600">Virtual Account: 9888-0812-3456-780</p>
                          <p className="font-black text-amber-800 text-sm">Rp 450.000</p>

                          <button
                            onClick={() => {
                              if (!isOnline) {
                                addOfflineQueue('FINANCE', 'QUEUE_PAYMENT_SLIP', { invoice: 'inv-juli', amount: 450000 });
                              } else {
                                alert('Melakukan handshake ke API Midtrans / Virtual Account BNI...');
                                triggerPushNotification('Pembayaran Berhasil', 'SPP Juli Lunas. Bukti slip pembayaran dikirim ke email orang tua.');
                              }
                            }}
                            className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] rounded-lg cursor-pointer"
                          >
                            {isOnline ? 'Bayar Instan VA (Online)' : 'Bayar Offline (Queue Slip)'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* SETTINGS IN SIMULATOR */}
                    {activeTab === 'settings' && (
                      <div className="space-y-4 animate-fade-in text-left text-xs">
                        <div className="flex items-center gap-1.5 pb-2 border-b">
                          <Settings className="h-4 w-4" />
                          <h4 className="font-extrabold">Pengaturan Aplikasi</h4>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2.5 bg-slate-500/5 rounded-lg">
                            <div>
                              <p className="font-bold text-[11px]">Tema Aplikasi</p>
                              <p className="text-[9px] text-slate-400">Pilih light / dark mode</p>
                            </div>
                            <button
                              onClick={() => setPhoneTheme(phoneTheme === 'light' ? 'dark' : 'light')}
                              className="p-1 bg-slate-500/10 hover:bg-slate-500/20 rounded"
                            >
                              {phoneTheme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-amber-500" />}
                            </button>
                          </div>

                          <div className="flex items-center justify-between p-2.5 bg-slate-500/5 rounded-lg">
                            <div>
                              <p className="font-bold text-[11px]">Autentikasi Biometrik</p>
                              <p className="text-[9px] text-slate-400">Izinkan login sidik jari</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={biometricEnabled}
                              onChange={(e) => setBiometricEnabled(e.target.checked)}
                              className="h-4 w-4 text-indigo-600 focus:ring-0 rounded"
                            />
                          </div>

                          <div className="p-2.5 bg-indigo-500/10 text-indigo-800 rounded-lg text-[10px] space-y-1">
                            <p className="font-bold">Kapasitas Cache Offline SQLite:</p>
                            <p>Tersimpan: 12.4 MB / Limit: 256 MB</p>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* REUSABLE BOTTOM NAVIGATION BAR */}
                  <div className="border-t border-slate-500/10 px-2 py-1.5 flex items-center justify-around bg-slate-500/5 backdrop-blur-md z-10">
                    <button
                      onClick={() => setActiveTab('home')}
                      className={`flex flex-col items-center gap-0.5 text-[9px] font-bold ${
                        activeTab === 'home' ? 'text-indigo-600' : 'text-slate-400'
                      }`}
                    >
                      <Layout className="h-4 w-4" />
                      <span>Beranda</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('attendance')}
                      className={`flex flex-col items-center gap-0.5 text-[9px] font-bold ${
                        activeTab === 'attendance' ? 'text-indigo-600' : 'text-slate-400'
                      }`}
                    >
                      <Calendar className="h-4 w-4" />
                      <span>Absensi</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('grades')}
                      className={`flex flex-col items-center gap-0.5 text-[9px] font-bold ${
                        activeTab === 'grades' ? 'text-indigo-600' : 'text-slate-400'
                      }`}
                    >
                      <Award className="h-4 w-4" />
                      <span>Nilai</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('finance')}
                      className={`flex flex-col items-center gap-0.5 text-[9px] font-bold ${
                        activeTab === 'finance' ? 'text-indigo-600' : 'text-slate-400'
                      }`}
                    >
                      <DollarSign className="h-4 w-4" />
                      <span>Spp</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('settings')}
                      className={`flex flex-col items-center gap-0.5 text-[9px] font-bold ${
                        activeTab === 'settings' ? 'text-indigo-600' : 'text-slate-400'
                      }`}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Setting</span>
                    </button>
                  </div>

                </div>
              )}

            </div>
          </div>

        </div>

        {/* SECTION 2: SIMULATOR CONTROLS & TEST TOOLS (7 Columns) */}
        <div className="xl:col-span-7 space-y-6">
          
          {/* Hardware & Network controls wrapper */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <Sliders className="h-4 w-4 text-indigo-600" /> Simulator Controls & Outbound Testing
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Role switcher & internet state */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Pilih Role Aplikasi Mobile:</label>
                  <select
                    value={phoneRole}
                    onChange={(e) => {
                      setPhoneRole(e.target.value as any);
                      setActiveTab('home');
                    }}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  >
                    <option value="student">Student Mobile App (Siswa)</option>
                    <option value="parent">Parent Mobile App (Orang Tua)</option>
                    <option value="teacher">Teacher Mobile App (Ustadz/Guru)</option>
                    <option value="employee">Employee Mobile App (Staff/Karyawan)</option>
                    <option value="executive">Executive Boarding (Kyai/Yayasan)</option>
                  </select>
                </div>

                {/* Network connectivity switcher */}
                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border">
                  <div>
                    <span className="text-xs font-bold text-slate-800">Status Jaringan Mobile</span>
                    <p className="text-[10px] text-slate-400">Simulasikan offline mode asrama</p>
                  </div>
                  <button
                    onClick={() => setIsOnline(!isOnline)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold shadow-sm transition cursor-pointer ${
                      isOnline ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                    }`}
                  >
                    {isOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
                    {isOnline ? 'CONNECTED' : 'OFFLINE MODE'}
                  </button>
                </div>
              </div>

              {/* Hardware simulations (Scanner & File upload) */}
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 border rounded-xl space-y-2">
                  <span className="text-xs font-bold text-slate-800 block">Simulasi Hardware Scanner</span>
                  <div className="flex gap-1">
                    <select
                      value={scannerType}
                      onChange={(e) => setScannerType(e.target.value as any)}
                      className="text-xs p-1.5 bg-white border rounded"
                    >
                      <option value="qr">QR Code</option>
                      <option value="barcode">Barcode</option>
                      <option value="document">Doc Scan</option>
                    </select>
                    <button
                      onClick={handleSimulateScan}
                      disabled={scannerActive}
                      className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px] rounded flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <QrCode className="h-3.5 w-3.5" /> Ambil Scan
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border rounded-xl space-y-2">
                  <span className="text-xs font-bold text-slate-800 block">Simulasi Upload File / Attachment</span>
                  <form onSubmit={handleSimulateUpload} className="flex gap-1">
                    <select
                      value={uploadType}
                      onChange={(e) => setUploadType(e.target.value as any)}
                      className="text-xs p-1.5 bg-white border rounded"
                    >
                      <option value="camera">Kamera</option>
                      <option value="gallery">Galeri</option>
                      <option value="pdf">PDF File</option>
                      <option value="video">Video</option>
                    </select>
                    <button
                      type="submit"
                      disabled={uploadActive}
                      className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] rounded flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <UploadCloud className="h-3.5 w-3.5" /> Upload File
                    </button>
                  </form>
                </div>
              </div>

            </div>

            {/* Offline queue sync status pane */}
            <div className="p-4 bg-slate-900 text-slate-100 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-extrabold text-indigo-300 flex items-center gap-1">
                  <Terminal className="h-4 w-4" /> Database Queue Sinkronisasi Offline (SQLite Buffer)
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded">
                  Pending: {offlineQueue.length} Items
                </span>
              </div>

              {offlineQueue.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Antrean SQLite kosong. Matikan koneksi internet (Offline), lalu submit presensi/nilai pada simulator HP untuk melihat penumpukan antrean.</p>
              ) : (
                <div className="space-y-2 max-h-[120px] overflow-y-auto">
                  {offlineQueue.map((item) => (
                    <div key={item.id} className="p-2 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono flex justify-between items-center">
                      <div>
                        <strong className="text-emerald-400">[{item.module}]</strong> {item.action} - {JSON.stringify(item.payload)}
                      </div>
                      <span className="text-[9px] text-slate-400">{item.timestamp}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={startSyncJob}
                  disabled={isSyncing}
                  className="flex-1 py-2 bg-indigo-600 text-white font-black text-xs rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 cursor-pointer shadow"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Memproses Background Sync...' : 'Sinkronisasikan Draft Offline ke Cloud'}
                </button>
                <button
                  onClick={() => setOfflineQueue([])}
                  className="px-3 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-lg hover:bg-slate-700"
                >
                  Clear Queue
                </button>
              </div>

              {syncLogs.length > 0 && (
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800 text-[10px] font-mono text-emerald-400 space-y-1 max-h-[110px] overflow-y-auto">
                  {syncLogs.map((log, lIdx) => (
                    <p key={lIdx}>{log}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Simulated Push Dispatcher from School Administration Panel */}
            <div className="pt-4 border-t space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Kirim Real-time Push Notification (Console Admin)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Judul Push</label>
                  <input
                    type="text"
                    value={pushTitleInput}
                    onChange={(e) => setPushTitleInput(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Isi Pesan Push</label>
                  <input
                    type="text"
                    value={pushBodyInput}
                    onChange={(e) => setPushBodyInput(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border rounded-lg"
                  />
                </div>
              </div>
              <button
                onClick={() => triggerPushNotification(pushTitleInput, pushBodyInput)}
                className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" /> Kirim Push Notification Instan
              </button>
            </div>

            {/* Deep link simulator input */}
            <div className="pt-4 border-t space-y-2">
              <label className="text-[11px] font-bold text-slate-500 block">Simulasikan Deep Linking (Deep Link Action)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={deepLinkInput}
                  onChange={(e) => setDeepLinkInput(e.target.value)}
                  className="flex-1 text-xs p-2.5 bg-slate-50 border rounded-lg font-mono text-indigo-700"
                />
                <button
                  onClick={() => handleDeepLinkSimulate(deepLinkInput)}
                  className="px-4 py-2 bg-slate-800 text-white font-bold text-xs rounded-lg hover:bg-slate-900 cursor-pointer"
                >
                  Trigger Link
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* SECTION 3: SAAS MOBILE ANALYTICS & MONITORING CHART HUB (Recharts) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <h3 className="font-extrabold text-slate-800 text-sm">SaaS Mobile Usage, Installation, & Crash Analytics</h3>
          <p className="text-xs text-slate-400">Data telemetri langsung dari instalasi Google Play Store dan Apple App Store</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Active users graph */}
          <div className="space-y-2 border p-4 rounded-xl">
            <span className="text-[11px] font-bold text-slate-400 uppercase font-mono block">Aktif User Harian (Daily Active Users)</span>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={usageChartData}>
                  <defs>
                    <linearGradient id="colorAnd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="Android Users" stroke="#10b981" fillOpacity={1} fill="url(#colorAnd)" strokeWidth={2} />
                  <Area type="monotone" dataKey="iOS Users" stroke="#3b82f6" strokeWidth={2} fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sync status metrics */}
          <div className="space-y-2 border p-4 rounded-xl">
            <span className="text-[11px] font-bold text-slate-400 uppercase font-mono block">Sync Queue Volume Sukses</span>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={syncStatusData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="Success" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Failed" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Device OS distribution */}
          <div className="space-y-2 border p-4 rounded-xl flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase font-mono block">Distribusi OS Perangkat Aktif</span>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {deviceDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-around text-[10px] font-bold">
              {deviceDistributionData.map((entry) => (
                <span key={entry.name} style={{ color: entry.color }}>{entry.name} ({entry.value}%)</span>
              ))}
            </div>
          </div>

        </div>

        {/* Real-time crash telemetry logs */}
        <div className="pt-4 border-t space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-rose-500" /> Log Kerusakan Aplikasi Real-time (SaaS Crash Logs)
            </span>
          </div>

          <div className="space-y-2">
            {crashLogs.map((log) => (
              <div key={log.id} className="p-3 bg-rose-50/40 border border-rose-100 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold font-mono text-rose-700 bg-rose-100 px-2 py-0.5 rounded">{log.id}</span>
                    <strong className="text-xs text-slate-800">{log.device} ({log.os})</strong>
                    <span className="text-[10px] text-slate-400 font-mono">{log.time}</span>
                  </div>
                  <p className="text-[10px] font-mono text-slate-500 break-all bg-white p-2 border rounded">{log.error}</p>
                </div>
                <div>
                  <button
                    onClick={() => {
                      setCrashLogs(prev => prev.map(c => c.id === log.id ? { ...c, status: 'RESOLVED' } : c));
                      alert('Sistem mencatat bug teresolusi pada branch release utama.');
                    }}
                    disabled={log.status === 'RESOLVED'}
                    className={`px-3 py-1.5 rounded text-[10px] font-bold ${
                      log.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-600 text-white hover:bg-rose-700 cursor-pointer shadow-sm'
                    }`}
                  >
                    {log.status === 'RESOLVED' ? 'RESOLVED' : 'TANDAI SELESAI'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* DOCUMENTATION, REST CODES, SQL SUPABASE AND GOOGLE APPS SCRIPT (GAS) TAB PANEL */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        
        {/* Navigation Tabs for Documentation */}
        <div className="flex flex-wrap gap-1.5 pb-2 border-b">
          <button
            onClick={() => setDocTab('sql')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition ${
              docTab === 'sql' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Database className="h-3.5 w-3.5" /> Database SQL Supabase DDL
          </button>
          
          <button
            onClick={() => setDocTab('gas')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition ${
              docTab === 'gas' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Code className="h-3.5 w-3.5" /> Google Apps Script (GAS) Code
          </button>

          <button
            onClick={() => setDocTab('api')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition ${
              docTab === 'api' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Info className="h-3.5 w-3.5" /> REST API Documentation
          </button>

          <button
            onClick={() => setDocTab('reactnative')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition ${
              docTab === 'reactnative' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" /> React Native & Expo Boilerplate
          </button>
        </div>

        {/* SQL Tab Content */}
        {docTab === 'sql' && (
          <div className="space-y-4 animate-fade-in text-left">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xs font-extrabold text-slate-800 uppercase">Skema Tabel Supabase PostgreSQL</h4>
                <p className="text-[10px] text-slate-400">Total 20 Tabel Relasional Terverifikasi & Terindex Cepat</p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(sqlCode);
                  alert('Supabase SQL copied to clipboard!');
                }}
                className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded border"
              >
                <Copy className="h-3 w-3" /> Copy SQL DDL
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto max-h-[450px] leading-relaxed">
              {sqlCode}
            </pre>
          </div>
        )}

        {/* GAS Tab Content */}
        {docTab === 'gas' && (
          <div className="space-y-4 animate-fade-in text-left">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xs font-extrabold text-slate-800 uppercase">Google Apps Script Webhook Endpoint</h4>
                <p className="text-[10px] text-slate-400">Endpoint penanganan JSON untuk 13 action mobile integration</p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(gasCode);
                  alert('GAS Webhook code copied to clipboard!');
                }}
                className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded border"
              >
                <Copy className="h-3 w-3" /> Copy Script
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-indigo-300 font-mono text-xs rounded-xl overflow-x-auto max-h-[450px] leading-relaxed">
              {gasCode}
            </pre>
          </div>
        )}

        {/* API Tab Content */}
        {docTab === 'api' && (
          <div className="space-y-4 animate-fade-in text-left">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xs font-extrabold text-slate-800 uppercase">REST API RESTful JSON Blueprint Specs</h4>
                <p className="text-[10px] text-slate-400">Spesifikasi request dan response API mobile endpoint</p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(apiDocs);
                  alert('REST API specification copied to clipboard!');
                }}
                className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded border"
              >
                <Copy className="h-3 w-3" /> Copy JSON Spec
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-slate-200 font-mono text-xs rounded-xl overflow-x-auto max-h-[450px] leading-relaxed">
              {apiDocs}
            </pre>
          </div>
        )}

        {/* React Native Tab Content */}
        {docTab === 'reactnative' && (
          <div className="space-y-4 animate-fade-in text-left">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xs font-extrabold text-slate-800 uppercase">Expo SDK & Router Boilerplate</h4>
                <p className="text-[10px] text-slate-400">Aplikasi React Native Client-Side Secure Authentication, Push Notification & SQLite Cache</p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(reactNativeCode);
                  alert('React Native code copied to clipboard!');
                }}
                className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded border"
              >
                <Copy className="h-3 w-3" /> Copy Code
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-amber-200 font-mono text-xs rounded-xl overflow-x-auto max-h-[450px] leading-relaxed">
              {reactNativeCode}
            </pre>
          </div>
        )}

      </div>

    </div>
  );
}
