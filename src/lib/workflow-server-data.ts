// ============================================================================
// ENTERPRISE NOTIFICATION, WORKFLOW & MULTI-TIER APPROVAL ENGINE (ENGINE 148)
// BACKEND IN-MEMORY DATA STORAGE, STATE MACHINE & ACTION HANDLERS
// ============================================================================

import { appendAuditLog } from './audit-server-data';

export interface WorkflowCategory {
  id: string;
  name: string;
  code: string;
  description: string;
  icon: string;
  color: string;
  created_at: string;
}

export interface WorkflowTemplate {
  id: string;
  category_id: string;
  name: string;
  description: string;
  trigger_event: string;
  recommended_roles: string[];
  default_steps: {
    step_order: number;
    step_name: string;
    approver_role: string;
    sla_hours: number;
    is_mandatory: boolean;
  }[];
  sample_nodes: any[];
  nodes?: any[];
}

export interface WorkflowStep {
  step_order: number;
  step_name: string;
  approver_role: string;
  approver_user_id?: string;
  sla_hours: number;
  is_mandatory: boolean;
  auto_escalate_to?: string;
}

export interface WorkflowDefinition {
  id: string;
  tenant_id: string;
  category_id: string;
  name: string;
  code: string;
  description: string;
  trigger_event: string;
  threshold_rules?: {
    min_amount?: number;
    max_amount?: number;
    target_roles: string[];
  }[];
  steps: WorkflowStep[];
  nodes?: any[];
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface WorkflowInstance {
  id: string;
  tenant_id: string;
  workflow_id: string;
  workflow_name: string;
  category_id: string;
  title: string;
  reference_type: 'LEAVE_PERMISSION' | 'FINANCIAL_VOUCHER' | 'ASSET_MOVEMENT' | 'OFFICIAL_DOCUMENT' | 'ATTENDANCE_CORRECTION' | 'CUSTOM';
  reference_id: string;
  requester_id: string;
  requester_name: string;
  requester_role: string;
  current_step_order: number;
  total_steps: number;
  current_status: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'REVISED' | 'CANCELLED';
  amount?: number;
  variables: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface WorkflowTask {
  id: string;
  tenant_id: string;
  instance_id: string;
  workflow_name: string;
  title: string;
  step_order: number;
  task_name: string;
  assigned_role: string;
  assigned_user_id?: string;
  assigned_user_name?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISED' | 'SKIPPED';
  action_by_id?: string;
  action_by_name?: string;
  action_at?: string;
  notes?: string;
  sla_deadline?: string;
  is_escalated: boolean;
  variables?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface N8nIntegration {
  id: string;
  tenant_id: string;
  name: string;
  webhook_url: string;
  auth_header?: string;
  event_trigger: string;
  is_active: boolean;
  last_triggered_at?: string;
  success_count: number;
  error_count: number;
  created_at: string;
}

// In-Memory Database for Workflow State
export const WORKFLOW_DB = {
  categories: [
    {
      id: 'cat-perizinan',
      name: 'Perizinan Santri & Pegawai',
      code: 'LEAVE_PERMISSION',
      description: 'Alur persetujuan izin keluar, pulang santri, cuti guru, dan dinas luar.',
      icon: 'UserCheck',
      color: 'emerald',
      created_at: '2026-01-01T08:00:00.000Z'
    },
    {
      id: 'cat-keuangan',
      name: 'Pengajuan Dana & Kas',
      code: 'FINANCE_DISBURSEMENT',
      description: 'Alur multi-tier maker-checker-approver untuk pencairan dana, voucher, dan reimbursement.',
      icon: 'Shield',
      color: 'amber',
      created_at: '2026-01-01T08:00:00.000Z'
    },
    {
      id: 'cat-aset',
      name: 'Inventaris & Sarpras',
      code: 'ASSET_MANAGEMENT',
      description: 'Alur persetujuan pengadaan barang, peminjaman aset, mutasi, dan penghapusan inventaris.',
      icon: 'Layers',
      color: 'blue',
      created_at: '2026-01-01T08:00:00.000Z'
    },
    {
      id: 'cat-persuratan',
      name: 'Dokumen & Surat Resmi',
      code: 'OFFICIAL_LETTER',
      description: 'Alur verifikasi draf surat dinas, disposisi pimpinan, dan penerbitan Surat Keputusan (SK).',
      icon: 'FileText',
      color: 'indigo',
      created_at: '2026-01-01T08:00:00.000Z'
    },
    {
      id: 'cat-presensi',
      name: 'Presensi & Kepegawaian',
      code: 'ATTENDANCE_CORRECTION',
      description: 'Alur persetujuan klaim lupa absen, dinas luar kota, dan koreksi log kehadiran.',
      icon: 'Clock',
      color: 'purple',
      created_at: '2026-01-01T08:00:00.000Z'
    }
  ] as WorkflowCategory[],

  templates: [
    {
      id: 'tpl-izin-santri',
      category_id: 'cat-perizinan',
      name: 'Alur Izin Pulang Santri (2-Tahap)',
      description: 'Persetujuan izin bermalam santri melibatkan Wali Asrama lalu Pengasuh Pondok.',
      trigger_event: 'STUDENT_LEAVE_REQUESTED',
      recommended_roles: ['WALI_ASRAMA', 'KEPALA_SEKOLAH', 'PENGASUH_PONDOK'],
      default_steps: [
        { step_order: 1, step_name: 'Verifikasi Wali Asrama & Pembimbing', approver_role: 'WALI_ASRAMA', sla_hours: 12, is_mandatory: true },
        { step_order: 2, step_name: 'Persetujuan Pengasuh Pondok / Mudir', approver_role: 'KEPALA_SEKOLAH', sla_hours: 24, is_mandatory: true }
      ],
      nodes: [
        { id: 'n1', type: 'trigger', label: 'Form Izin Masuk', assignee: 'SANTRI' },
        { id: 'n2', type: 'approval', label: 'Wali Asrama Review', assignee: 'WALI_ASRAMA' },
        { id: 'n3', type: 'condition', label: 'Durasi > 2 Hari?', assignee: 'WALI_ASRAMA' },
        { id: 'n4', type: 'approval', label: 'Mudir / Pengasuh Approval', assignee: 'KEPALA_SEKOLAH' },
        { id: 'n5', type: 'notification', label: 'Kirim WA ke Orang Tua & Satpam', action: 'SEND_WA_PARENT' }
      ],
      sample_nodes: [
        { id: 'n1', type: 'trigger', label: 'Form Izin Masuk', assignee: 'SANTRI' },
        { id: 'n2', type: 'approval', label: 'Wali Asrama Review', assignee: 'WALI_ASRAMA' },
        { id: 'n3', type: 'condition', label: 'Durasi > 2 Hari?', assignee: 'WALI_ASRAMA' },
        { id: 'n4', type: 'approval', label: 'Mudir / Pengasuh Approval', assignee: 'KEPALA_SEKOLAH' },
        { id: 'n5', type: 'notification', label: 'Kirim WA ke Orang Tua & Satpam', action: 'SEND_WA_PARENT' }
      ]
    },
    {
      id: 'tpl-pengajuan-dana',
      category_id: 'cat-keuangan',
      name: 'Pencairan Kas Multi-Tier Berjenjang',
      description: 'Pencairan dana dengan threshold limit: Bendahara (< Rp 1jt), Kepala Sekolah (< Rp 10jt), Yayasan (> Rp 10jt).',
      trigger_event: 'FINANCIAL_VOUCHER_SUBMITTED',
      recommended_roles: ['BENDAHARA', 'KEPALA_SEKOLAH', 'SUPER_ADMIN'],
      default_steps: [
        { step_order: 1, step_name: 'Pemeriksaan Berkas & Verifikasi Saldo', approver_role: 'BENDAHARA', sla_hours: 8, is_mandatory: true },
        { step_order: 2, step_name: 'Otorisasi Kepala Sekolah', approver_role: 'KEPALA_SEKOLAH', sla_hours: 24, is_mandatory: true },
        { step_order: 3, step_name: 'Ratifikasi Ketua Yayasan', approver_role: 'SUPER_ADMIN', sla_hours: 48, is_mandatory: false }
      ],
      nodes: [
        { id: 'n1', type: 'trigger', label: 'Voucher Diajukan', assignee: 'GURU' },
        { id: 'n2', type: 'approval', label: 'Bendahara Verifikasi', assignee: 'BENDAHARA' },
        { id: 'n3', type: 'condition', label: 'Nominal > Rp 1.000.000?', assignee: 'BENDAHARA' },
        { id: 'n4', type: 'approval', label: 'Kepala Sekolah Otorisasi', assignee: 'KEPALA_SEKOLAH' },
        { id: 'n5', type: 'notification', label: 'Notifikasi Siap Cair ke Pemohon', action: 'TRIGGER_N8N' }
      ],
      sample_nodes: [
        { id: 'n1', type: 'trigger', label: 'Voucher Diajukan', assignee: 'GURU' },
        { id: 'n2', type: 'approval', label: 'Bendahara Verifikasi', assignee: 'BENDAHARA' },
        { id: 'n3', type: 'condition', label: 'Nominal > Rp 1.000.000?', assignee: 'BENDAHARA' },
        { id: 'n4', type: 'approval', label: 'Kepala Sekolah Otorisasi', assignee: 'KEPALA_SEKOLAH' },
        { id: 'n5', type: 'notification', label: 'Notifikasi Siap Cair ke Pemohon', action: 'TRIGGER_N8N' }
      ]
    },
    {
      id: 'tpl-disposisi-surat',
      category_id: 'cat-persuratan',
      name: 'Disposisi & Validasi Surat Keluar',
      description: 'Verifikasi draf naskah dinas oleh Kepala Tata Usaha sebelum penandatanganan Kepala Sekolah.',
      trigger_event: 'OFFICIAL_LETTER_DRAFTED',
      recommended_roles: ['TU', 'KEPALA_SEKOLAH'],
      default_steps: [
        { step_order: 1, step_name: 'Koreksi Naskah & Penomoran TU', approver_role: 'TU', sla_hours: 6, is_mandatory: true },
        { step_order: 2, step_name: 'Tanda Tangan Elektronik Kepala Sekolah', approver_role: 'KEPALA_SEKOLAH', sla_hours: 24, is_mandatory: true }
      ],
      nodes: [
        { id: 'n1', type: 'trigger', label: 'Draf Surat Masuk/Keluar', assignee: 'TU' },
        { id: 'n2', type: 'approval', label: 'Verifikasi Tata Usaha', assignee: 'TU' },
        { id: 'n3', type: 'approval', label: 'TTE Kepala Sekolah', assignee: 'KEPALA_SEKOLAH' },
        { id: 'n4', type: 'notification', label: 'Arsip & Kirim Salinan', action: 'TRIGGER_N8N' }
      ],
      sample_nodes: [
        { id: 'n1', type: 'trigger', label: 'Draf Surat Masuk/Keluar', assignee: 'TU' },
        { id: 'n2', type: 'approval', label: 'Verifikasi Tata Usaha', assignee: 'TU' },
        { id: 'n3', type: 'approval', label: 'TTE Kepala Sekolah', assignee: 'KEPALA_SEKOLAH' },
        { id: 'n4', type: 'notification', label: 'Arsip & Kirim Salinan', action: 'TRIGGER_N8N' }
      ]
    }
  ] as WorkflowTemplate[],

  definitions: [
    {
      id: 'wf-def-1',
      tenant_id: 'tenant-main',
      category_id: 'cat-perizinan',
      name: 'Alur Izin Santri Bermalam Standar',
      code: 'WF_LEAVE_SANTRI',
      description: 'Verifikasi izin meninggalkan pondok lebih dari 24 jam.',
      trigger_event: 'STUDENT_LEAVE_REQUESTED',
      steps: [
        { step_order: 1, step_name: 'Pemeriksaan Wali Asrama & Catatan Tahfidz', approver_role: 'WALI_ASRAMA', sla_hours: 12, is_mandatory: true },
        { step_order: 2, step_name: 'Pengesahan Mudir / Pengasuh Pondok', approver_role: 'KEPALA_SEKOLAH', sla_hours: 24, is_mandatory: true }
      ],
      nodes: [
        { id: '1', type: 'trigger', label: 'Pengajuan Izin Masuk' },
        { id: '2', type: 'approval', label: 'Review Wali Asrama' },
        { id: '3', type: 'approval', label: 'Persetujuan Mudir' },
        { id: '4', type: 'notification', label: 'WhatsApp Notifikasi Orang Tua & Security' }
      ],
      is_active: true,
      version: 1,
      created_at: '2026-01-10T10:00:00.000Z',
      updated_at: '2026-01-10T10:00:00.000Z',
      created_by: 'SUPER_ADMIN'
    },
    {
      id: 'wf-def-2',
      tenant_id: 'tenant-main',
      category_id: 'cat-keuangan',
      name: 'Otorisasi Pencairan Kas Operasional Sekolah',
      code: 'WF_FINANCE_DISBURSEMENT',
      description: 'Alur verifikasi anggaran belanja operasional satuan pendidikan.',
      trigger_event: 'FINANCIAL_VOUCHER_SUBMITTED',
      steps: [
        { step_order: 1, step_name: 'Verifikasi Kelengkapan Bukti & Ketersediaan Pagu', approver_role: 'BENDAHARA', sla_hours: 8, is_mandatory: true },
        { step_order: 2, step_name: 'Otorisasi Pengeluaran Kepala Sekolah', approver_role: 'KEPALA_SEKOLAH', sla_hours: 24, is_mandatory: true }
      ],
      nodes: [
        { id: '1', type: 'trigger', label: 'Pengajuan Voucher' },
        { id: '2', type: 'approval', label: 'Bendahara Cek Pagu' },
        { id: '3', type: 'approval', label: 'Otorisasi Kepsek' },
        { id: '4', type: 'action', label: 'Cairkan Kas & Kirim Bukti' }
      ],
      is_active: true,
      version: 1,
      created_at: '2026-01-15T11:00:00.000Z',
      updated_at: '2026-01-15T11:00:00.000Z',
      created_by: 'SUPER_ADMIN'
    },
    {
      id: 'wf-def-3',
      tenant_id: 'tenant-main',
      category_id: 'cat-persuratan',
      name: 'Penerbitan Surat Keputusan & Rekomendasi',
      code: 'WF_OFFICIAL_LETTER',
      description: 'Alur verifikasi legalitas dokumen dan tanda tangan resmi.',
      trigger_event: 'OFFICIAL_LETTER_DRAFTED',
      steps: [
        { step_order: 1, step_name: 'Pemeriksaan Format & Penomoran TU', approver_role: 'TU', sla_hours: 6, is_mandatory: true },
        { step_order: 2, step_name: 'Tanda Tangan Kepala Sekolah', approver_role: 'KEPALA_SEKOLAH', sla_hours: 24, is_mandatory: true }
      ],
      nodes: [
        { id: '1', type: 'trigger', label: 'Draf Dokumen' },
        { id: '2', type: 'approval', label: 'Verifikasi TU' },
        { id: '3', type: 'approval', label: 'TTE Kepsek' },
        { id: '4', type: 'action', label: 'Publikasi & Cetak' }
      ],
      is_active: true,
      version: 1,
      created_at: '2026-01-20T09:00:00.000Z',
      updated_at: '2026-01-20T09:00:00.000Z',
      created_by: 'SUPER_ADMIN'
    }
  ] as WorkflowDefinition[],

  instances: [
    {
      id: 'inst-101',
      tenant_id: 'tenant-main',
      workflow_id: 'wf-def-1',
      workflow_name: 'Alur Izin Santri Bermalam Standar',
      category_id: 'cat-perizinan',
      title: 'Izin Pulang Santri - Farhan Ramadhan (Keperluan Khitan Adik)',
      status: 'RUNNING',
      current_step_id: '1',
      reference_type: 'LEAVE_PERMISSION',
      reference_id: 'perm-8821',
      requester_id: 'usr-parent-1',
      requester_name: 'Ahmad Subarjo (Wali Farhan)',
      requester_role: 'WALI_SANTRI',
      current_step_order: 1,
      total_steps: 2,
      current_status: 'PENDING',
      variables: {
        student_name: 'Farhan Ramadhan (Kelas 10A)',
        reason: 'Acara tasyakuran khitanan adik kandung di Bandung',
        start_date: '2026-08-25',
        end_date: '2026-08-27',
        contact_person: '081234567890'
      },
      created_at: '2026-08-19T08:30:00.000Z',
      updated_at: '2026-08-19T08:30:00.000Z'
    },
    {
      id: 'inst-102',
      tenant_id: 'tenant-main',
      workflow_id: 'wf-def-2',
      workflow_name: 'Otorisasi Pencairan Kas Operasional Sekolah',
      category_id: 'cat-keuangan',
      title: 'Pengadaan Modul Praktikum Laboratorium IPA Semester Ganjil',
      status: 'RUNNING',
      current_step_id: '2',
      reference_type: 'FINANCIAL_VOUCHER',
      reference_id: 'vch-2026-091',
      requester_id: 'usr-guru-1',
      requester_name: 'Ustadzah Aminah S.Pd',
      requester_role: 'GURU',
      current_step_order: 2,
      total_steps: 2,
      current_status: 'IN_REVIEW',
      amount: 3850000,
      variables: {
        student_name: 'Ustadzah Aminah S.Pd (Pengusul)',
        reason: 'Reagen Kimia Dasar & Alat Ukur Mikroskopis (BOS-IPA)',
        item_summary: 'Reagen Kimia Dasar & Alat Ukur Mikroskopis',
        vendor: 'CV Berkah Laboratoria',
        budget_code: 'BOS-5.2.2.01.002',
        nominal: 'Rp 3.850.000'
      },
      created_at: '2026-08-18T14:15:00.000Z',
      updated_at: '2026-08-19T07:45:00.000Z'
    },
    {
      id: 'inst-103',
      tenant_id: 'tenant-main',
      workflow_id: 'wf-def-3',
      workflow_name: 'Penerbitan Surat Keputusan & Rekomendasi',
      category_id: 'cat-persuratan',
      title: 'Surat Tugas Delegasi Olimpiade Sains Nasional (OSN) Tingkat Provinsi',
      status: 'COMPLETED',
      current_step_id: '3',
      reference_type: 'OFFICIAL_DOCUMENT',
      reference_id: 'doc-st-042',
      requester_id: 'usr-tu-1',
      requester_name: 'Staf Tata Usaha',
      requester_role: 'TU',
      current_step_order: 2,
      total_steps: 2,
      current_status: 'APPROVED',
      variables: {
        student_name: 'Delegasi Siswa OSN Jabar',
        reason: 'Tugas Kompetisi OSN Tingkat Provinsi Jawa Barat',
        participants: '3 Siswa Berprestasi & 1 Guru Pembimbing',
        destination: 'Gedung LPMP Provinsi Jawa Barat',
        event_date: '2026-09-02'
      },
      created_at: '2026-08-17T09:00:00.000Z',
      updated_at: '2026-08-18T11:20:00.000Z'
    }
  ] as any[],

  tasks: [
    {
      id: 'tsk-001',
      tenant_id: 'tenant-main',
      instance_id: 'inst-101',
      instance_title: 'Izin Pulang Santri - Farhan Ramadhan',
      workflow_name: 'Alur Izin Santri Bermalam Standar',
      title: 'Izin Pulang Santri - Farhan Ramadhan',
      label: 'Pemeriksaan Wali Asrama & Catatan Tahfidz',
      step_order: 1,
      step_id: 'step-1',
      task_name: 'Pemeriksaan Wali Asrama & Catatan Tahfidz',
      assignee_role: 'WALI_ASRAMA',
      assigned_role: 'WALI_ASRAMA',
      assigned_user_name: 'Ustadz Hasan (Wali Asrama Putra)',
      status: 'PENDING',
      sla_deadline: '2026-08-20T08:30:00.000Z',
      is_escalated: false,
      variables: {
        student_name: 'Farhan Ramadhan (Kelas 10A)',
        reason: 'Acara tasyakuran khitanan adik kandung di Bandung',
        start_date: '2026-08-25',
        end_date: '2026-08-27'
      },
      created_at: '2026-08-19T08:30:00.000Z',
      updated_at: '2026-08-19T08:30:00.000Z'
    },
    {
      id: 'tsk-002',
      tenant_id: 'tenant-main',
      instance_id: 'inst-102',
      instance_title: 'Pengadaan Modul Praktikum Laboratorium IPA',
      workflow_name: 'Otorisasi Pencairan Kas Operasional Sekolah',
      title: 'Pengadaan Modul Praktikum Laboratorium IPA',
      label: 'Verifikasi Kelengkapan Bukti & Ketersediaan Pagu',
      step_order: 1,
      step_id: 'step-1',
      task_name: 'Verifikasi Kelengkapan Bukti & Ketersediaan Pagu',
      assignee_role: 'BENDAHARA',
      assigned_role: 'BENDAHARA',
      assigned_user_name: 'Bendahara Keuangan Sekolah',
      status: 'APPROVED',
      action_by_id: 'usr-bendahara',
      action_by_name: 'Hj. Siti Mariam S.E.',
      action_at: '2026-08-19T07:45:00.000Z',
      processed_at: '2026-08-19T07:45:00.000Z',
      notes: 'Berkas RAB lengkap dan pagu BOS IPA masih mencukupi.',
      sla_deadline: '2026-08-18T22:15:00.000Z',
      is_escalated: false,
      variables: {
        student_name: 'Ustadzah Aminah S.Pd',
        reason: 'Pengadaan Reagen Kimia & Alat Laboratorium',
        nominal: 'Rp 3.850.000',
        vendor: 'CV Berkah Laboratoria',
        start_date: '2026-08-18',
        end_date: '2026-08-25'
      },
      created_at: '2026-08-18T14:15:00.000Z',
      updated_at: '2026-08-19T07:45:00.000Z'
    },
    {
      id: 'tsk-003',
      tenant_id: 'tenant-main',
      instance_id: 'inst-102',
      instance_title: 'Pengadaan Modul Praktikum Laboratorium IPA',
      workflow_name: 'Otorisasi Pencairan Kas Operasional Sekolah',
      title: 'Pengadaan Modul Praktikum Laboratorium IPA',
      label: 'Otorisasi Pengeluaran Kepala Sekolah',
      step_order: 2,
      step_id: 'step-2',
      task_name: 'Otorisasi Pengeluaran Kepala Sekolah',
      assignee_role: 'KEPALA_SEKOLAH',
      assigned_role: 'KEPALA_SEKOLAH',
      assigned_user_name: 'Dr. H. Abdullah M.Pd (Kepala Sekolah)',
      status: 'PENDING',
      sla_deadline: '2026-08-20T07:45:00.000Z',
      is_escalated: false,
      variables: {
        student_name: 'Ustadzah Aminah S.Pd',
        reason: 'Pengadaan Reagen Kimia & Alat Laboratorium',
        nominal: 'Rp 3.850.000',
        vendor: 'CV Berkah Laboratoria',
        start_date: '2026-08-18',
        end_date: '2026-08-25'
      },
      created_at: '2026-08-19T07:45:00.000Z',
      updated_at: '2026-08-19T07:45:00.000Z'
    },
    {
      id: 'tsk-004',
      tenant_id: 'tenant-main',
      instance_id: 'inst-103',
      instance_title: 'Surat Tugas Delegasi OSN',
      workflow_name: 'Penerbitan Surat Keputusan & Rekomendasi',
      title: 'Surat Tugas Delegasi Olimpiade Sains Nasional (OSN)',
      label: 'Tanda Tangan Kepala Sekolah',
      step_order: 2,
      step_id: 'step-2',
      task_name: 'Tanda Tangan Kepala Sekolah',
      assignee_role: 'KEPALA_SEKOLAH',
      assigned_role: 'KEPALA_SEKOLAH',
      assigned_user_name: 'Dr. H. Abdullah M.Pd (Kepala Sekolah)',
      status: 'APPROVED',
      action_by_id: 'usr-kepsek',
      action_by_name: 'Dr. H. Abdullah M.Pd',
      action_at: '2026-08-18T11:20:00.000Z',
      processed_at: '2026-08-18T11:20:00.000Z',
      notes: 'Disetujui untuk mewakili sekolah di OSN Tingkat Provinsi.',
      sla_deadline: '2026-08-18T09:00:00.000Z',
      is_escalated: false,
      variables: {
        student_name: '3 Siswa Delegasi',
        reason: 'Surat Tugas Resmi OSN Tingkat Provinsi',
        participants: '3 Siswa Berprestasi',
        start_date: '2026-09-02',
        end_date: '2026-09-04'
      },
      created_at: '2026-08-17T09:00:00.000Z',
      updated_at: '2026-08-18T11:20:00.000Z'
    }
  ] as any[],

  n8nIntegrations: [
    {
      id: 'n8n-1',
      tenant_id: 'tenant-main',
      name: 'n8n Webhook: WhatsApp Gateway Notification Relay',
      webhook_url: 'https://n8n.internal.school.id/webhook/wa-workflow-notification',
      auth_header: 'Bearer n8n_sec_workflow_gateway_2026',
      auth_token: 'Bearer n8n_sec_workflow_gateway_2026',
      event_trigger: 'WORKFLOW_STATUS_CHANGED',
      event_triggers: ['WORKFLOW_STATUS_CHANGED', 'LEAVE_PERMISSION_APPROVED'],
      is_active: true,
      last_triggered_at: '2026-08-19T07:45:00.000Z',
      success_count: 142,
      error_count: 0,
      created_at: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'n8n-2',
      tenant_id: 'tenant-main',
      name: 'n8n Webhook: Google Drive Backup & Archiving',
      webhook_url: 'https://n8n.internal.school.id/webhook/drive-doc-backup',
      auth_header: 'Bearer n8n_sec_drive_backup_2026',
      auth_token: 'Bearer n8n_sec_drive_backup_2026',
      event_trigger: 'DOCUMENT_APPROVED',
      event_triggers: ['DOCUMENT_APPROVED', 'STUDENT_REGISTER'],
      is_active: true,
      last_triggered_at: '2026-08-18T11:20:00.000Z',
      success_count: 89,
      error_count: 1,
      created_at: '2026-01-01T00:00:00.000Z'
    }
  ] as any[]
};

// ============================================================================
// ACTION HANDLER IMPLEMENTATION
// ============================================================================

export async function handleWorkflowActions(
  action: string,
  req: any,
  res: any,
  tenantId: string,
  authUser: any,
  username: string,
  role: string,
  logActivity: any,
  DB: any
): Promise<any> {
  const tId = req.body?.tenant_id || tenantId || 'tenant-main';

  switch (action) {
    // ------------------------------------------------------------------------
    // 1. GET WORKFLOW CATEGORIES
    // ------------------------------------------------------------------------
    case 'getWorkflowCategories': {
      return res.json({
        success: true,
        data: WORKFLOW_DB.categories
      });
    }

    // ------------------------------------------------------------------------
    // 2. GET WORKFLOW TEMPLATES
    // ------------------------------------------------------------------------
    case 'getWorkflowTemplates': {
      return res.json({
        success: true,
        data: WORKFLOW_DB.templates
      });
    }

    // ------------------------------------------------------------------------
    // 3. GET WORKFLOW DEFINITIONS
    // ------------------------------------------------------------------------
    case 'getWorkflowDefinitions': {
      const definitions = WORKFLOW_DB.definitions.filter(
        d => d.tenant_id === tId || d.tenant_id === 'tenant-main'
      );
      return res.json({
        success: true,
        data: definitions
      });
    }

    // ------------------------------------------------------------------------
    // 4. SAVE WORKFLOW DEFINITION (CREATE OR UPDATE)
    // ------------------------------------------------------------------------
    case 'saveWorkflowDefinition': {
      const { id, category_id, name, description, trigger_event, steps, nodes, is_active } = req.body;
      const now = new Date().toISOString();

      if (id) {
        const existingIdx = WORKFLOW_DB.definitions.findIndex(d => d.id === id);
        if (existingIdx !== -1) {
          WORKFLOW_DB.definitions[existingIdx] = {
            ...WORKFLOW_DB.definitions[existingIdx],
            category_id: category_id || WORKFLOW_DB.definitions[existingIdx].category_id,
            name: name || WORKFLOW_DB.definitions[existingIdx].name,
            description: description !== undefined ? description : WORKFLOW_DB.definitions[existingIdx].description,
            trigger_event: trigger_event || WORKFLOW_DB.definitions[existingIdx].trigger_event,
            steps: steps || WORKFLOW_DB.definitions[existingIdx].steps,
            nodes: nodes || WORKFLOW_DB.definitions[existingIdx].nodes,
            is_active: is_active !== undefined ? is_active : WORKFLOW_DB.definitions[existingIdx].is_active,
            version: WORKFLOW_DB.definitions[existingIdx].version + 1,
            updated_at: now
          };

          appendAuditLog(
            tId,
            authUser?.id || 'admin',
            username || 'Administrator',
            'Update',
            'WORKFLOW_ENGINE',
            `Memperbarui definisi alur kerja "${name || WORKFLOW_DB.definitions[existingIdx].name}" (v${WORKFLOW_DB.definitions[existingIdx].version})`,
            'Information',
            req.ip || '127.0.0.1',
            req.headers?.['user-agent'] || 'ERP-Client',
            { definition_id: id }
          );

          return res.json({
            success: true,
            message: 'Definisi alur kerja berhasil diperbarui',
            data: WORKFLOW_DB.definitions[existingIdx]
          });
        }
      }

      // Create new definition
      const newDef: WorkflowDefinition = {
        id: id || `wf-def-${Date.now()}`,
        tenant_id: tId,
        category_id: category_id || 'cat-perizinan',
        name: name || 'Alur Kerja Baru',
        code: `WF_${Date.now().toString(36).toUpperCase()}`,
        description: description || '',
        trigger_event: trigger_event || 'CUSTOM_EVENT',
        steps: steps || [
          { step_order: 1, step_name: 'Verifikasi Awal', approver_role: 'TU', sla_hours: 24, is_mandatory: true },
          { step_order: 2, step_name: 'Persetujuan Pimpinan', approver_role: 'KEPALA_SEKOLAH', sla_hours: 48, is_mandatory: true }
        ],
        nodes: nodes || [],
        is_active: is_active !== undefined ? is_active : true,
        version: 1,
        created_at: now,
        updated_at: now,
        created_by: username || 'SUPER_ADMIN'
      };

      WORKFLOW_DB.definitions.push(newDef);

      appendAuditLog(
        tId,
        authUser?.id || 'admin',
        username || 'Administrator',
        'Create',
        'WORKFLOW_ENGINE',
        `Membuat definisi alur kerja baru "${newDef.name}"`,
        'Information',
        req.ip || '127.0.0.1',
        req.headers?.['user-agent'] || 'ERP-Client',
        { definition_id: newDef.id }
      );

      return res.json({
        success: true,
        message: 'Alur kerja baru berhasil disimpan',
        data: newDef
      });
    }

    // ------------------------------------------------------------------------
    // 5. DELETE WORKFLOW DEFINITION
    // ------------------------------------------------------------------------
    case 'deleteWorkflowDefinition': {
      const { id } = req.body;
      const idx = WORKFLOW_DB.definitions.findIndex(d => d.id === id);
      if (idx !== -1) {
        const deletedName = WORKFLOW_DB.definitions[idx].name;
        WORKFLOW_DB.definitions.splice(idx, 1);

        appendAuditLog(
          tId,
          authUser?.id || 'admin',
          username || 'Administrator',
          'Delete',
          'WORKFLOW_ENGINE',
          `Menghapus definisi alur kerja "${deletedName}"`,
          'Warning',
          req.ip || '127.0.0.1',
          req.headers?.['user-agent'] || 'ERP-Client',
          { definition_id: id }
        );

        return res.json({
          success: true,
          message: 'Alur kerja berhasil dihapus'
        });
      }
      return res.status(404).json({
        success: false,
        message: 'Alur kerja tidak ditemukan'
      });
    }

    // ------------------------------------------------------------------------
    // 6. GET WORKFLOW INSTANCES (RUNNING & COMPLETED)
    // ------------------------------------------------------------------------
    case 'getWorkflowInstances': {
      const instances = WORKFLOW_DB.instances.filter(
        i => i.tenant_id === tId || i.tenant_id === 'tenant-main'
      );
      return res.json({
        success: true,
        data: instances
      });
    }

    // ------------------------------------------------------------------------
    // 7. CREATE WORKFLOW INSTANCE (LAUNCH RUN)
    // ------------------------------------------------------------------------
    case 'createWorkflowInstance': {
      const { workflow_id, title, variables, reference_type, reference_id, amount } = req.body;
      const now = new Date().toISOString();

      const def = WORKFLOW_DB.definitions.find(d => d.id === workflow_id);
      if (!def) {
        return res.status(404).json({
          success: false,
          message: 'Definisi alur kerja tidak ditemukan'
        });
      }

      const instanceId = `inst-${Date.now()}`;
      const firstStep = def.steps && def.steps.length > 0 ? def.steps[0] : { step_order: 1, step_name: 'Verifikasi Awal', approver_role: 'KEPALA_SEKOLAH' };

      const newInstance: WorkflowInstance = {
        id: instanceId,
        tenant_id: tId,
        workflow_id: def.id,
        workflow_name: def.name,
        category_id: def.category_id,
        title: title || `${def.name} - ${new Date().toLocaleDateString('id-ID')}`,
        reference_type: reference_type || 'LEAVE_PERMISSION',
        reference_id: reference_id || `ref-${Date.now()}`,
        requester_id: authUser?.id || 'usr-req',
        requester_name: username || 'Pengguna Sistem',
        requester_role: role || 'GURU',
        current_step_order: 1,
        total_steps: def.steps ? def.steps.length : 1,
        current_status: 'PENDING',
        amount: amount ? Number(amount) : undefined,
        variables: variables || {},
        created_at: now,
        updated_at: now
      };

      WORKFLOW_DB.instances.unshift(newInstance);

      // Create Initial Task for Step 1
      const firstTask: WorkflowTask = {
        id: `tsk-${Date.now()}`,
        tenant_id: tId,
        instance_id: instanceId,
        workflow_name: def.name,
        title: newInstance.title,
        step_order: 1,
        task_name: firstStep.step_name,
        assigned_role: firstStep.approver_role,
        assigned_user_name: `Approver Role: ${firstStep.approver_role}`,
        status: 'PENDING',
        sla_deadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        is_escalated: false,
        variables: variables || {},
        created_at: now,
        updated_at: now
      };

      WORKFLOW_DB.tasks.unshift(firstTask);

      // Log to Audit Trail
      appendAuditLog(
        tId,
        authUser?.id || 'usr-req',
        username || 'Pengguna',
        'Create',
        'WORKFLOW_ENGINE',
        `Memulai eksekusi alur kerja "${newInstance.title}" (Step 1: ${firstStep.step_name})`,
        'Information',
        req.ip || '127.0.0.1',
        req.headers?.['user-agent'] || 'ERP-Client',
        { instance_id: instanceId, workflow_id: def.id }
      );

      return res.json({
        success: true,
        message: 'Alur kerja berhasil dijalankan (Instance Active)',
        data: newInstance
      });
    }

    // ------------------------------------------------------------------------
    // 8. GET WORKFLOW TASKS (APPROVAL INBOX)
    // ------------------------------------------------------------------------
    case 'getWorkflowTasks': {
      const tasks = WORKFLOW_DB.tasks.filter(
        t => t.tenant_id === tId || t.tenant_id === 'tenant-main'
      );
      return res.json({
        success: true,
        data: tasks
      });
    }

    // ------------------------------------------------------------------------
    // 9. PROCESS WORKFLOW TASK (APPROVE / REJECT / REVISE)
    // ------------------------------------------------------------------------
    case 'processWorkflowTask': {
      const { task_id, approval_status, notes } = req.body;
      const now = new Date().toISOString();

      const task = WORKFLOW_DB.tasks.find(t => t.id === task_id);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Tugas persetujuan tidak ditemukan'
        });
      }

      task.status = approval_status || 'APPROVED';
      task.action_by_id = authUser?.id || 'usr-current';
      task.action_by_name = username || 'Pejabat Berwenang';
      task.action_at = now;
      task.notes = notes || '';
      task.updated_at = now;

      const instance = WORKFLOW_DB.instances.find(i => i.id === task.instance_id);
      const def = instance ? WORKFLOW_DB.definitions.find(d => d.id === instance.workflow_id) : null;

      if (instance && def) {
        instance.updated_at = now;

        if (approval_status === 'REJECTED') {
          instance.current_status = 'REJECTED';
        } else if (approval_status === 'APPROVED') {
          const nextStepOrder = task.step_order + 1;
          const nextStep = def.steps.find(s => s.step_order === nextStepOrder);

          if (nextStep) {
            // Move to next step
            instance.current_step_order = nextStepOrder;
            instance.current_status = 'IN_REVIEW';

            // Create Next Task
            const nextTask: WorkflowTask = {
              id: `tsk-${Date.now()}`,
              tenant_id: tId,
              instance_id: instance.id,
              workflow_name: instance.workflow_name,
              title: instance.title,
              step_order: nextStepOrder,
              task_name: nextStep.step_name,
              assigned_role: nextStep.approver_role,
              assigned_user_name: `Approver: ${nextStep.approver_role}`,
              status: 'PENDING',
              sla_deadline: new Date(Date.now() + (nextStep.sla_hours || 24) * 3600 * 1000).toISOString(),
              is_escalated: false,
              variables: instance.variables,
              created_at: now,
              updated_at: now
            };
            WORKFLOW_DB.tasks.unshift(nextTask);
          } else {
            // Final Approval Reached
            instance.current_status = 'APPROVED';
          }
        }
      }

      appendAuditLog(
        tId,
        authUser?.id || 'usr-current',
        username || 'Approver',
        approval_status === 'APPROVED' ? 'Approve' : 'Reject',
        'WORKFLOW_ENGINE',
        `Memproses tugas "${task.task_name}" status: ${approval_status} pada "${instance?.title || task.title}". Catatan: "${notes || '-'}"`,
        approval_status === 'APPROVED' ? 'Information' : 'Warning',
        req.ip || '127.0.0.1',
        req.headers?.['user-agent'] || 'ERP-Client',
        { task_id, approval_status, notes }
      );

      return res.json({
        success: true,
        message: `Tindakan ${approval_status === 'APPROVED' ? 'Persetujuan' : 'Penolakan'} berhasil diproses.`,
        data: { task, instance }
      });
    }

    // ------------------------------------------------------------------------
    // 10. N8N INTEGRATION ACTIONS
    // ------------------------------------------------------------------------
    case 'getN8nIntegrations': {
      return res.json({
        success: true,
        data: WORKFLOW_DB.n8nIntegrations
      });
    }

    case 'saveN8nIntegration': {
      const { id, name, webhook_url, auth_header, event_trigger, is_active } = req.body;
      const now = new Date().toISOString();

      if (id) {
        const idx = WORKFLOW_DB.n8nIntegrations.findIndex(n => n.id === id);
        if (idx !== -1) {
          WORKFLOW_DB.n8nIntegrations[idx] = {
            ...WORKFLOW_DB.n8nIntegrations[idx],
            name: name || WORKFLOW_DB.n8nIntegrations[idx].name,
            webhook_url: webhook_url || WORKFLOW_DB.n8nIntegrations[idx].webhook_url,
            auth_header: auth_header || WORKFLOW_DB.n8nIntegrations[idx].auth_header,
            event_trigger: event_trigger || WORKFLOW_DB.n8nIntegrations[idx].event_trigger,
            is_active: is_active !== undefined ? is_active : WORKFLOW_DB.n8nIntegrations[idx].is_active
          };
          return res.json({
            success: true,
            message: 'Integrasi n8n berhasil diperbarui',
            data: WORKFLOW_DB.n8nIntegrations[idx]
          });
        }
      }

      const newN8n: N8nIntegration = {
        id: `n8n-${Date.now()}`,
        tenant_id: tId,
        name: name || 'n8n Automation Webhook',
        webhook_url: webhook_url || 'https://n8n.internal.school.id/webhook/custom',
        auth_header: auth_header || '',
        event_trigger: event_trigger || 'WORKFLOW_EVENT',
        is_active: is_active !== undefined ? is_active : true,
        success_count: 0,
        error_count: 0,
        created_at: now
      };

      WORKFLOW_DB.n8nIntegrations.push(newN8n);

      return res.json({
        success: true,
        message: 'Integrasi webhook n8n berhasil ditambahkan',
        data: newN8n
      });
    }

    case 'triggerN8nSimulator': {
      const { id, test_payload } = req.body;
      const integration = WORKFLOW_DB.n8nIntegrations.find(n => n.id === id);
      if (!integration) {
        return res.status(404).json({ success: false, message: 'Integrasi n8n tidak ditemukan' });
      }

      integration.last_triggered_at = new Date().toISOString();
      integration.success_count += 1;

      return res.json({
        success: true,
        message: `Simulasi pengiriman payload webhook ke ${integration.name} berhasil! Status HTTP 200 OK diterima dari node n8n.`,
        data: {
          webhook_url: integration.webhook_url,
          sent_payload: test_payload || { event: integration.event_trigger, timestamp: integration.last_triggered_at }
        }
      });
    }

    default:
      return null;
  }
}
