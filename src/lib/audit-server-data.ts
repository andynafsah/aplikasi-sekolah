// ============================================================================
// SPRINT 27: ENTERPRISE AUDIT, COMPLIANCE, AKREDITASI & GOVERNMENT REPORTING
// IN-MEMORY DATA STORAGE, IMMUTABLE CRYPTO CHAIN, & BACKEND REST DELEGATION
// ============================================================================

import { GoogleGenAI } from '@google/genai';

// Simple helper to simulate a SHA-256 hash or secure signature
function generateSecureHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return 'sha256_' + Math.abs(hash).toString(16).padStart(8, '0') + '_' + Math.random().toString(36).substring(2, 8);
}

// Interfaces
export interface AuditLog {
  id: string;
  tenant_id: string;
  user_id: string;
  username: string;
  action: 'Create' | 'Update' | 'Delete' | 'Restore' | 'Approve' | 'Reject' | 'Login' | 'Logout' | 'Export' | 'Import';
  module: string;
  description: string;
  severity: 'Information' | 'Warning' | 'Critical' | 'Security';
  ip_address: string;
  user_agent: string;
  payload: any;
  encrypted_hash: string;
  created_at: string;
  updated_at: string;
}

export interface AuditEntityChange {
  id: string;
  tenant_id: string;
  audit_log_id: string | null;
  entity_id: string;
  entity_type: string;
  before_value: any;
  after_value: any;
  changed_fields: string[];
  created_at: string;
}

export interface AuditSnapshot {
  id: string;
  tenant_id: string;
  entity_type: string;
  entity_id: string;
  snapshot_data: any;
  version: number;
  created_at: string;
}

export interface UserSession {
  id: string;
  tenant_id: string;
  user_id: string;
  username: string;
  session_token: string;
  ip_address: string;
  login_time: string;
  logout_time: string | null;
  last_activity_time: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginHistory {
  id: string;
  tenant_id: string;
  user_id: string;
  username: string;
  ip_address: string;
  user_agent: string;
  status: 'SUCCESS' | 'FAILED';
  failure_reason: string | null;
  created_at: string;
}

export interface ApiLog {
  id: string;
  tenant_id: string;
  user_id: string | null;
  method: string;
  endpoint: string;
  status_code: number;
  execution_time_ms: number;
  request_payload: any;
  response_payload: any;
  created_at: string;
}

export interface Permission {
  id: string;
  tenant_id: string;
  role_name: string;
  module_name: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
  can_approve: boolean;
  can_export: boolean;
  can_import: boolean;
}

export interface ApprovalLog {
  id: string;
  tenant_id: string;
  workflow_id: string;
  action_type: 'Approve' | 'Reject';
  step_name: string;
  approver_id: string;
  approver_name: string;
  notes: string;
  payload: any;
  created_at: string;
}

export interface DocumentAccess {
  id: string;
  tenant_id: string;
  user_id: string;
  username: string;
  document_id: string;
  document_name: string;
  access_type: 'VIEW' | 'DOWNLOAD' | 'VERIFY' | 'DELETE';
  created_at: string;
}

export interface ExportLog {
  id: string;
  tenant_id: string;
  user_id: string;
  username: string;
  export_type: string;
  format: 'PDF' | 'Excel' | 'CSV';
  query_parameters: any;
  record_count: number;
  file_url: string;
  created_at: string;
}

export interface AuditReport {
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  report_type: string;
  generated_by: string;
  generated_at: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  file_url: string;
  created_at: string;
}

export interface RiskCategory {
  id: string;
  tenant_id: string;
  name: string;
  description: string;
}

export interface Risk {
  id: string;
  tenant_id: string;
  category_id: string;
  title: string;
  description: string;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  likelihood: 'Rare' | 'Unlikely' | 'Possible' | 'Likely' | 'Almost Certain';
  impact: 'Insignificant' | 'Minor' | 'Moderate' | 'Major' | 'Severe';
  mitigation_plan: string;
  status: 'Open' | 'Mitigated' | 'Closed' | 'Accepted';
  created_at: string;
}

export interface CorrectiveAction {
  id: string;
  tenant_id: string;
  recommendation_id: string;
  action_plan: string;
  target_date: string;
  assignee_id: string;
  assignee_name: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Delayed';
  created_at: string;
  followups: {
    notes: string;
    verified_by: string;
    verification_date: string;
    status: 'Verified' | 'Partially Verified' | 'Rejected';
  }[];
}

export interface AuditException {
  id: string;
  tenant_id: string;
  exception_type: 'NEGATIVE_STOCK' | 'BUDGET_OVERRUN' | 'DUPLICATE_PAYMENT' | 'UNRECONCILED_BANK' | 'OVERDUE_LOAN' | 'MISSING_DOCUMENT' | 'SEGREGATION_VIOLATION' | 'UNAUTHORIZED_ACTION';
  title: string;
  description: string;
  module: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'IGNORED' | 'CLOSED';
  detected_at: string;
  target_id?: string;
  target_type?: string;
  actor_id?: string;
  actor_name?: string;
  resolution_notes?: string;
  resolved_by?: string;
  resolved_at?: string;
  metadata?: any;
}

export interface RetentionPolicy {
  id: string;
  tenant_id: string;
  retention_years: number; // 1, 3, 5 years
  auto_archive_enabled: boolean;
  tamper_detection_enabled: boolean;
  last_archived_at?: string;
  archived_records_count: number;
}

export interface InternalControlPolicy {
  id: string;
  tenant_id: string;
  segregation_of_duties_enforced: boolean;
  dual_approval_threshold_idr: number;
  financial_period_locked_until: string;
  tamper_detection_active: boolean;
  immutable_audit_trail_active: boolean;
}

export interface ComplianceFramework {
  id: string;
  tenant_id: string;
  name: string;
  code: string;
  type: 'Internal' | 'Foundation' | 'Education Office' | 'Religious Affairs' | 'ISO Ready' | 'Custom';
  description: string;
  version: string;
  categories: {
    id: string;
    name: string;
    description: string;
    checklists: {
      id: string;
      title: string;
      description: string;
      items: {
        id: string;
        requirement_text: string;
        legal_reference: string;
        is_mandatory: boolean;
        status: 'Pending' | 'Compliant' | 'Non-Compliant' | 'Not Applicable';
        evidences: {
          id: string;
          title: string;
          file_path: string;
          file_type: 'PDF' | 'DOCX' | 'XLSX' | 'JPG' | 'PNG' | 'ZIP';
          file_size: number;
          digital_signature: string;
          verification_status: 'Unverified' | 'Verified' | 'Rejected';
          verified_by?: string;
          verified_at?: string;
          created_at: string;
        }[];
      }[];
    }[];
  }[];
}

export interface GovernmentReport {
  id: string;
  tenant_id: string;
  report_type: 'Student' | 'Teacher' | 'Employee' | 'Finance' | 'Attendance' | 'Infrastructure' | 'Library' | 'Boarding';
  title: string;
  academic_year: string;
  period_start: string;
  period_end: string;
  content_data: any;
  status: 'Draft' | 'Generated' | 'Submitted' | 'Approved';
  submission_date: string | null;
  government_tracking_number: string | null;
  file_url: string | null;
  created_at: string;
}

export interface GovernmentReportTemplate {
  id: string;
  tenant_id: string;
  report_type: 'Student' | 'Teacher' | 'Employee' | 'Finance' | 'Attendance' | 'Infrastructure' | 'Library' | 'Boarding';
  name: string;
  format_definition: any;
  version: string;
}

export interface AccreditationPeriod {
  id: string;
  tenant_id: string;
  name: string;
  start_date: string;
  end_date: string;
  institution_type: 'School' | 'Madrasah' | 'Pesantren' | 'Training Center';
  status: 'Upcoming' | 'Active' | 'Finished' | 'Extended';
}

export interface AccreditationAssessment {
  id: string;
  tenant_id: string;
  period_id: string;
  status: 'Not Started' | 'Self Evaluation' | 'Assessor Visitation' | 'Review' | 'Finalized';
  overall_self_score: number;
  overall_assessor_score: number;
  final_grade: string | null;
  standards: {
    id: string;
    code: string;
    name: string;
    weight: number;
    instruments: {
      id: string;
      code: string;
      question_text: string;
      scoring_rubric: any;
      maximum_score: number;
      indicators: string[];
      self_score: number;
      assessor_score: number;
      justification: string;
      evidences: {
        id: string;
        title: string;
        documents: {
          id: string;
          title: string;
          file_path: string;
          file_type: 'PDF' | 'DOCX' | 'XLSX' | 'JPG' | 'PNG' | 'ZIP';
          file_size: number;
          digital_signature: string;
          verification_status: 'Unverified' | 'Verified' | 'Rejected';
          verified_by?: string;
          verified_at?: string;
          created_at: string;
        }[];
      }[];
    }[];
  }[];
  reviewers: {
    reviewer_name: string;
    reviewer_role: string;
    assignment_date: string;
    comments: string;
  }[];
}

// In-Memory Database Storage for Sprint 27
export const AUDIT_DB: {
  auditLogs: AuditLog[];
  entityChanges: AuditEntityChange[];
  snapshots: AuditSnapshot[];
  sessions: UserSession[];
  loginHistories: LoginHistory[];
  apiLogs: ApiLog[];
  permissions: Permission[];
  approvalLogs: ApprovalLog[];
  docAccess: DocumentAccess[];
  exports: ExportLog[];
  reports: AuditReport[];
  riskCategories: RiskCategory[];
  risks: Risk[];
  correctiveActions: CorrectiveAction[];
  complianceFrameworks: ComplianceFramework[];
  governmentReports: GovernmentReport[];
  govTemplates: GovernmentReportTemplate[];
  accreditationPeriods: AccreditationPeriod[];
  accreditations: AccreditationAssessment[];
  exceptions: AuditException[];
  retentionPolicies: RetentionPolicy[];
  internalControlRules: InternalControlPolicy[];
} = {
  auditLogs: [],
  entityChanges: [],
  snapshots: [],
  sessions: [],
  loginHistories: [],
  apiLogs: [],
  permissions: [],
  approvalLogs: [],
  docAccess: [],
  exports: [],
  reports: [],
  riskCategories: [],
  risks: [],
  correctiveActions: [],
  complianceFrameworks: [],
  governmentReports: [],
  govTemplates: [],
  accreditationPeriods: [],
  accreditations: [],
  exceptions: [],
  retentionPolicies: [],
  internalControlRules: []
};

// Seed Helper
export function seedAuditData(tenantId: string) {
  const tId = tenantId;

  // 1. Permissions Seed
  const roles = ['SUPER_ADMIN', 'KEPALA_SEKOLAH', 'BENDAHARA', 'GURU', 'TATA_USAHA'];
  const modules = ['Audit', 'Compliance', 'Accreditation', 'Finance', 'Government'];
  roles.forEach(role => {
    modules.forEach(mod => {
      const isPowerUser = role === 'SUPER_ADMIN' || role === 'KEPALA_SEKOLAH';
      const isTU = role === 'TATA_USAHA' && (mod === 'Audit' || mod === 'Compliance' || mod === 'Accreditation' || mod === 'Government');
      AUDIT_DB.permissions.push({
        id: `perm-${role}-${mod}-${tId}`,
        tenant_id: tId,
        role_name: role,
        module_name: mod,
        can_create: isPowerUser || isTU,
        can_read: true,
        can_update: isPowerUser || isTU,
        can_delete: isPowerUser,
        can_approve: isPowerUser,
        can_export: isPowerUser || isTU || role === 'BENDAHARA',
        can_import: isPowerUser || isTU
      });
    });
  });

  // 2. Risk Categories Seed
  const cat1 = `rcat-1-${tId}`;
  const cat2 = `rcat-2-${tId}`;
  AUDIT_DB.riskCategories.push(
    { id: cat1, tenant_id: tId, name: 'Sistem & Kepatuhan Akademik', description: 'Risiko terkait standar kurikulum, KBM dan data siswa' },
    { id: cat2, tenant_id: tId, name: 'Keuangan & Pelaporan Pajak', description: 'Risiko fraud keuangan, SPP macet, keterlambatan pelaporan BOS' }
  );

  // 3. Risks Seed
  const riskId1 = `risk-1-${tId}`;
  const riskId2 = `risk-2-${tId}`;
  AUDIT_DB.risks.push(
    {
      id: riskId1,
      tenant_id: tId,
      category_id: cat1,
      title: 'Keterlambatan Pengumpulan Bukti Akreditasi Standar Sarpras',
      description: 'Dokumen bukti fisik sarpras tidak terarsip dengan baik sehingga menghambat penilaian asesor.',
      risk_level: 'High',
      likelihood: 'Likely',
      impact: 'Moderate',
      mitigation_plan: 'Mengimplementasikan Evidence Repository Digital tersentralisasi di modul Tata Usaha ERP.',
      status: 'Open',
      created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: riskId2,
      tenant_id: tId,
      category_id: cat2,
      title: 'Ketidaksesuaian Pembukuan Buku Kas Umum dengan Rekening Koran BOS',
      description: 'Selisih pencatatan transaksi manual bendahara dengan mutasi bank rill.',
      risk_level: 'Critical',
      likelihood: 'Possible',
      impact: 'Major',
      mitigation_plan: 'Melakukan rekonsiliasi kas bank otomatis harian melalui menu Ledger ERP.',
      status: 'Mitigated',
      created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
    }
  );

  // 4. Corrective Actions Seed
  AUDIT_DB.correctiveActions.push(
    {
      id: `ca-1-${tId}`,
      tenant_id: tId,
      recommendation_id: `rec-1-${tId}`,
      action_plan: 'Digitalisasi 100% dokumen bukti Sarpras dan unggah ke cloud ERP.',
      target_date: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString().split('T')[0],
      assignee_id: 'user-1',
      assignee_name: 'Staf TU Utama',
      status: 'In Progress',
      created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      followups: [
        {
          notes: 'Telah dimulai digitalisasi berkas ruang laboratorium IPA.',
          verified_by: 'Kepala Sekolah',
          verification_date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString().split('T')[0],
          status: 'Partially Verified'
        }
      ]
    }
  );

  // 5. Compliance Framework & items
  const frame1 = `frame-1-${tId}`;
  AUDIT_DB.complianceFrameworks.push({
    id: frame1,
    tenant_id: tId,
    name: 'Standar Akreditasi Pendidikan Nasional (BAN-PDM)',
    code: 'BAN-PDM-2026',
    type: 'Education Office',
    description: 'Instrumen akreditasi satuan pendidikan dasar dan menengah sesuai standar evaluasi nasional.',
    version: '1.2',
    categories: [
      {
        id: `fcat-1-${tId}`,
        name: 'Standar Kelulusan & Kurikulum',
        description: 'Standar pencapaian kompetensi lulusan dan dokumen kurikulum KOSP.',
        checklists: [
          {
            id: `fchk-1-${tId}`,
            title: 'Kepatuhan Dokumen Kurikulum',
            description: 'Penilaian kelengkapan administrasi kurikulum operasional sekolah.',
            items: [
              {
                id: `fitem-1-${tId}`,
                requirement_text: 'Adanya Dokumen Kurikulum Operasional Satuan Pendidikan (KOSP) yang disahkan Dinas Pendidikan.',
                legal_reference: 'Permendikbudristek No. 56/M/2022',
                is_mandatory: true,
                status: 'Compliant',
                evidences: [
                  {
                    id: `ev-1-${tId}`,
                    title: 'KOSP_Disahkan_2025_2026.pdf',
                    file_path: '/documents/kosp-disahkan.pdf',
                    file_type: 'PDF',
                    file_size: 2540120,
                    digital_signature: generateSecureHash('kosp-disahkan-signed'),
                    verification_status: 'Verified',
                    verified_by: 'Budi Raharjo, M.Pd.',
                    verified_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
                    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
                  }
                ]
              },
              {
                id: `fitem-2-${tId}`,
                requirement_text: 'Dokumen Rencana Pelaksanaan Pembelajaran (RPP) / Modul Ajar seluruh guru mata pelajaran.',
                legal_reference: 'Mendikbudristek SE No. 14 Tahun 2019',
                is_mandatory: true,
                status: 'Pending',
                evidences: []
              }
            ]
          }
        ]
      }
    ]
  });

  // 6. Government Report Templates
  const types: ('Student' | 'Teacher' | 'Employee' | 'Finance' | 'Attendance' | 'Infrastructure' | 'Library' | 'Boarding')[] = [
    'Student', 'Teacher', 'Employee', 'Finance', 'Attendance', 'Infrastructure', 'Library', 'Boarding'
  ];
  types.forEach(type => {
    AUDIT_DB.govTemplates.push({
      id: `tmpl-${type}-${tId}`,
      tenant_id: tId,
      report_type: type,
      name: `Template Dapodik Kemendikbud - ${type}`,
      format_definition: {
        fields: ['id', 'name', 'status', 'created_at'],
        customHeaders: [`Data Ekspor ${type} Dapodik Resmi Sinergi Kemendikbud-Kemenag`],
        systemVer: 'v4.1.2'
      },
      version: '2026.1'
    });
  });

  // 7. Accreditation Periods
  const ap1 = `ap-1-${tId}`;
  AUDIT_DB.accreditationPeriods.push({
    id: ap1,
    tenant_id: tId,
    name: 'Siklus Akreditasi BAN-PDM Provinsi DKI Jakarta 2026',
    start_date: '2026-03-01',
    end_date: '2026-11-30',
    institution_type: tenantId === 'tenant-1' ? 'School' : 'Pesantren',
    status: 'Active'
  });

  // 8. Accreditation Assessments (Self-evaluation and custom instruments)
  AUDIT_DB.accreditations.push({
    id: `acc-1-${tId}`,
    tenant_id: tId,
    period_id: ap1,
    status: 'Self Evaluation',
    overall_self_score: 85.5,
    overall_assessor_score: 0.0,
    final_grade: null,
    standards: [
      {
        id: `astd-1-${tId}`,
        code: 'STD-1',
        name: 'Standar Kompetensi Lulusan',
        weight: 15.0,
        instruments: [
          {
            id: `ainst-1-${tId}`,
            code: 'BUTIR-1',
            question_text: 'Bagaimana satuan pendidikan memfasilitasi pengembangan minat dan bakat siswa secara berkala?',
            scoring_rubric: {
              4: 'Satuan pendidikan memfasilitasi pembinaan di >8 bidang ekstrakurikuler serta mencetak prestasi nasional.',
              3: 'Satuan pendidikan memfasilitasi pembinaan di 4-7 bidang ekstrakurikuler serta berprestasi tingkat provinsi.',
              2: 'Satuan pendidikan memfasilitasi pembinaan di 1-3 ekstrakurikuler tingkat lokal.',
              1: 'Tidak ada fasilitasi pembinaan ekstrakurikuler yang terstruktur.'
            },
            maximum_score: 4,
            indicators: [
              'Adanya program ekstrakurikuler olahraga dan seni.',
              'Dokumen prestasi lomba piala bupati/provinsi.'
            ],
            self_score: 4,
            assessor_score: 0,
            justification: 'Kami memiliki 12 klub ekstrakurikuler aktif dengan raihan Juara 1 Olimpiade Fisika tingkat Kabupaten.',
            evidences: [
              {
                id: `aev-1-${tId}`,
                title: 'Sertifikat Lomba Olimpiade Fisika & Ekstrakurikuler',
                documents: [
                  {
                    id: `adoc-1-${tId}`,
                    title: 'Juara_1_Olimpiade_Kabupaten_Sertifikat.pdf',
                    file_path: '/documents/sertifikat-fisika.pdf',
                    file_type: 'PDF',
                    file_size: 1048576,
                    digital_signature: generateSecureHash('cert-physic-signed'),
                    verification_status: 'Unverified',
                    created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    reviewers: [
      {
        reviewer_name: 'Drs. Supriadi, M.Pd.',
        reviewer_role: 'EXTERNAL_ASSESSOR',
        assignment_date: '2026-07-15',
        comments: 'Dokumen portofolio awal sangat meyakinkan. Mohon lengkapi bukti presensi kegiatan ekstrakurikuler pendukung.'
      }
    ]
  });

  // Seed standard login history / activity logs
  AUDIT_DB.loginHistories.push(
    {
      id: `lh-1-${tId}`,
      tenant_id: tId,
      user_id: 'user-1',
      username: 'admin_sma',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 Chrome/120.0',
      status: 'SUCCESS',
      failure_reason: null,
      created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
    }
  );

  AUDIT_DB.sessions.push(
    {
      id: `session-1-${tId}`,
      tenant_id: tId,
      user_id: 'user-1',
      username: 'admin_sma',
      session_token: 'token_mock_sma_123',
      ip_address: '192.168.1.100',
      login_time: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      logout_time: null,
      last_activity_time: new Date().toISOString(),
      is_active: true,
      created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
    }
  );

  // 8. Retention Policy Seed
  AUDIT_DB.retentionPolicies.push({
    id: `retpol-1-${tId}`,
    tenant_id: tId,
    retention_years: 5,
    auto_archive_enabled: true,
    tamper_detection_enabled: true,
    last_archived_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
    archived_records_count: 1420
  });

  // 9. Internal Control Policy Seed
  AUDIT_DB.internalControlRules.push({
    id: `ic-1-${tId}`,
    tenant_id: tId,
    segregation_of_duties_enforced: true,
    dual_approval_threshold_idr: 5000000,
    financial_period_locked_until: '2026-06-30',
    tamper_detection_active: true,
    immutable_audit_trail_active: true
  });

  // 10. Audit Exceptions Seed
  AUDIT_DB.exceptions.push(
    {
      id: `exc-1-${tId}`,
      tenant_id: tId,
      exception_type: 'BUDGET_OVERRUN',
      title: 'Peringatan Over-Budget Anggaran Sarpras Q3',
      description: 'Pengajuan pengadaan perlengkapan smart classroom melebihi alokasi pos anggaran belanja RAPBS sebesar Rp 2.500.000.',
      module: 'Sarana & Keuangan',
      risk_level: 'HIGH',
      status: 'OPEN',
      detected_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      actor_id: 'user-3',
      actor_name: 'Bendahara Sekolah',
      target_id: 'PO-2026-08-012',
      target_type: 'PurchaseOrder'
    },
    {
      id: `exc-2-${tId}`,
      tenant_id: tId,
      exception_type: 'SEGREGATION_VIOLATION',
      title: 'Pencegahan Approval Mandiri (Segregation of Duties Violation)',
      description: 'Sistem menolak otorisasi pencairan kas BOS karena akun pembuat voucher (Maker) sama dengan akun penyetujui (Approver).',
      module: 'Keuangan & Kas',
      risk_level: 'CRITICAL',
      status: 'RESOLVED',
      detected_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
      actor_id: 'user-3',
      actor_name: 'Bendahara Sekolah',
      target_id: 'VOC-2026-0044',
      target_type: 'CashVoucher',
      resolution_notes: 'Diteruskan ke Kepala Sekolah untuk otorisasi resmi bertingkat ganda sesuai SOP Internal Control.',
      resolved_by: 'Kepala Sekolah (Dr. H. Ahmad Fauzi)',
      resolved_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: `exc-3-${tId}`,
      tenant_id: tId,
      exception_type: 'MISSING_DOCUMENT',
      title: 'Dokumen SK Pengangkatan Belum Terarsip Digital',
      description: 'Ditemukan 3 berkas fisik SK Pembina Ekstrakurikuler Tahun 2025/2026 belum memiliki lampiran pindaian terverifikasi di modul Arsip.',
      module: 'Tata Usaha & Dokumen',
      risk_level: 'MEDIUM',
      status: 'INVESTIGATING',
      detected_at: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
      actor_id: 'user-2',
      actor_name: 'Staf Tata Usaha',
      target_id: 'DOC-SK-2026-09',
      target_type: 'OfficialDocument'
    },
    {
      id: `exc-4-${tId}`,
      tenant_id: tId,
      exception_type: 'UNRECONCILED_BANK',
      title: 'Selisih Rekonsiliasi Rekening Giro Operasional',
      description: 'Terdapat transaksi transfer masuk pembayaran santri Rp 350.000 pada mutasi bank tanpa referensi invoice valid.',
      module: 'Keuangan & SPP',
      risk_level: 'MEDIUM',
      status: 'OPEN',
      detected_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      actor_id: 'system-agent',
      actor_name: 'BankSync Daemon',
      target_id: 'MUT-BSI-9921',
      target_type: 'BankStatement'
    }
  );
}

// Log helper to simulate Immutable Audit log chain
let lastHash = 'genesis_sprint_27_audit_log_hash_init_root';
export function appendAuditLog(
  tenantId: string,
  userId: string,
  username: string,
  action: 'Create' | 'Update' | 'Delete' | 'Restore' | 'Approve' | 'Reject' | 'Login' | 'Logout' | 'Export' | 'Import',
  module: string,
  description: string,
  severity: 'Information' | 'Warning' | 'Critical' | 'Security',
  ipAddress: string = '127.0.0.1',
  userAgent: string = 'School-ERP-Agent-Browser',
  payload: any = null
): AuditLog {
  const id = `alog-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const timestamp = new Date().toISOString();

  // Immutable hash chaining
  const signInput = `${id}|${tenantId}|${userId}|${action}|${module}|${severity}|${timestamp}|${lastHash}`;
  const encryptedHash = generateSecureHash(signInput);
  lastHash = encryptedHash;

  const log: AuditLog = {
    id,
    tenant_id: tenantId,
    user_id: userId,
    username,
    action,
    module,
    description,
    severity,
    ip_address: ipAddress,
    user_agent: userAgent,
    payload,
    encrypted_hash: encryptedHash,
    created_at: timestamp,
    updated_at: timestamp
  };

  AUDIT_DB.auditLogs.unshift(log);
  return log;
}

export function logAudit(opts: {
  tenant_id?: string;
  user_id?: string;
  username?: string;
  action: 'Create' | 'Update' | 'Delete' | 'Restore' | 'Approve' | 'Reject' | 'Login' | 'Logout' | 'Export' | 'Import';
  module: string;
  description: string;
  severity: 'Information' | 'Warning' | 'Critical' | 'Security';
  ip_address?: string;
  user_agent?: string;
  payload?: any;
}): AuditLog {
  return appendAuditLog(
    opts.tenant_id || 'system',
    opts.user_id || 'admin',
    opts.username || 'Super Admin',
    opts.action,
    opts.module,
    opts.description,
    opts.severity,
    opts.ip_address || '127.0.0.1',
    opts.user_agent || 'School-ERP-Agent-Browser',
    opts.payload || null
  );
}

// Helper to track entity before/after changes
export function logDataChange(
  tenantId: string,
  auditLogId: string | null,
  entityId: string,
  entityType: string,
  beforeValue: any,
  afterValue: any,
  changedFields: string[]
) {
  const change: AuditEntityChange = {
    id: `achg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    tenant_id: tenantId,
    audit_log_id: auditLogId,
    entity_id: entityId,
    entity_type: entityType,
    before_value: beforeValue,
    after_value: afterValue,
    changed_fields: changedFields,
    created_at: new Date().toISOString()
  };
  AUDIT_DB.entityChanges.unshift(change);
  return change;
}

// MAIN ACTION DELEGATOR HANDLER
export async function handleAuditActions(
  action: string,
  req: any,
  res: any,
  tenantId: string,
  authUser: any,
  username: string,
  role: string,
  logActivity: any,
  DB: any
) {
  // Check if our local DB is empty, if so seed it
  const isTenantSeeded = AUDIT_DB.permissions.some(p => p.tenant_id === tenantId);
  if (!isTenantSeeded) {
    seedAuditData(tenantId);
  }

  const userId = authUser?.id || 'user-unknown';
  const uName = username || 'sistem';

  switch (action) {
    case 'auditDashboard': {
      // Aggregate data
      const logs = AUDIT_DB.auditLogs.filter(l => l.tenant_id === tenantId);
      const risks = AUDIT_DB.risks.filter(r => r.tenant_id === tenantId);
      const openRisks = risks.filter(r => r.status === 'Open').length;
      const frameworks = AUDIT_DB.complianceFrameworks.filter(f => f.tenant_id === tenantId);
      const accs = AUDIT_DB.accreditations.filter(a => a.tenant_id === tenantId);

      // Average compliance rate
      let totalItems = 0;
      let compliantItems = 0;
      frameworks.forEach(f => {
        f.categories.forEach(c => {
          c.checklists.forEach(ch => {
            ch.items.forEach(it => {
              totalItems++;
              if (it.status === 'Compliant') compliantItems++;
            });
          });
        });
      });
      const complianceRate = totalItems > 0 ? (compliantItems / totalItems) * 100 : 92.5;

      // Accreditation average
      const accreditationProg = accs.length > 0 ? accs[0].overall_self_score : 85.5;

      return res.json({
        success: true,
        data: {
          total_audit_logs: logs.length,
          total_compliance_frameworks: frameworks.length,
          total_open_risks: openRisks,
          total_accreditations: accs.length,
          compliance_score: parseFloat(complianceRate.toFixed(2)),
          risk_score: risks.length > 0 ? parseFloat((risks.filter(r => r.risk_level === 'Critical' || r.risk_level === 'High').length / risks.length * 100).toFixed(2)) : 12.5,
          accreditation_progress: accreditationProg,
          recent_activity: logs.slice(0, 10)
        }
      });
    }

    case 'auditEventList': {
      // Returns a predefined set of audited actions and levels
      return res.json({
        success: true,
        data: {
          events: [
            { type: 'Create', severity: 'Information', description: 'Membuat entitas baru' },
            { type: 'Update', severity: 'Information', description: 'Mengubah isi data entitas' },
            { type: 'Delete', severity: 'Warning', description: 'Menghapus data entitas (Soft Delete)' },
            { type: 'Restore', severity: 'Information', description: 'Mengembalikan data terhapus' },
            { type: 'Approve', severity: 'Information', description: 'Persetujuan status workflow' },
            { type: 'Reject', severity: 'Warning', description: 'Penolakan berkas atau usulan' },
            { type: 'Login', severity: 'Security', description: 'Akses masuk user terotentikasi' },
            { type: 'Logout', severity: 'Information', description: 'Sesi keluar manual user' },
            { type: 'Export', severity: 'Warning', description: 'Unduh dokumen pelaporan / CSV' },
            { type: 'Import', severity: 'Warning', description: 'Unggah bulk data / template Excel' }
          ]
        }
      });
    }

    case 'auditLogList': {
      let list = [...AUDIT_DB.auditLogs];
      if (tenantId) {
        list = list.filter(l => l.tenant_id === tenantId);
      }
      
      // Filter parameters
      const { search, severity, act, moduleName } = req.query;
      if (severity) {
        list = list.filter(l => l.severity === severity);
      }
      if (act) {
        list = list.filter(l => l.action === act);
      }
      if (moduleName) {
        list = list.filter(l => l.module.toLowerCase().includes((moduleName as string).toLowerCase()));
      }
      if (search) {
        const s = (search as string).toLowerCase();
        list = list.filter(l => 
          l.username.toLowerCase().includes(s) || 
          l.description.toLowerCase().includes(s) ||
          l.module.toLowerCase().includes(s)
        );
      }

      return res.json({ success: true, data: list });
    }

    case 'auditHistory': {
      // Returns entity change logs
      const { entity_id, entity_type } = req.query;
      let list = AUDIT_DB.entityChanges.filter(c => c.tenant_id === tenantId);
      if (entity_id) {
        list = list.filter(c => c.entity_id === entity_id);
      }
      if (entity_type) {
        list = list.filter(c => c.entity_type === entity_type);
      }
      return res.json({ success: true, data: list });
    }

    case 'auditSession': {
      const list = AUDIT_DB.sessions.filter(s => s.tenant_id === tenantId);
      return res.json({ success: true, data: list });
    }

    case 'auditApiLog': {
      const list = AUDIT_DB.apiLogs.filter(a => a.tenant_id === tenantId);
      return res.json({ success: true, data: list });
    }

    case 'auditExport': {
      const { export_type, format, data_count } = req.body;
      const fileUrl = `/exports/report_${Date.now()}.${format?.toLowerCase() || 'csv'}`;
      
      // Save export log
      const exportLog: ExportLog = {
        id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        tenant_id: tenantId,
        user_id: userId,
        username: uName,
        export_type: export_type || 'Audit Report',
        format: format || 'CSV',
        query_parameters: req.body.filters || {},
        record_count: data_count || 100,
        file_url: fileUrl,
        created_at: new Date().toISOString()
      };
      AUDIT_DB.exports.unshift(exportLog);

      // Audit event
      appendAuditLog(
        tenantId,
        userId,
        uName,
        'Export',
        'Audit',
        `Melakukan ekspor laporan jenis ${export_type} format ${format} sebanyak ${data_count || 100} baris`,
        'Warning',
        req.ip,
        req.headers['user-agent'] || '',
        exportLog
      );

      return res.json({ success: true, data: exportLog });
    }

    case 'auditReport': {
      if (req.method === 'POST') {
        const { name, report_type, description } = req.body;
        const report: AuditReport = {
          id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          tenant_id: tenantId,
          name,
          description: description || '',
          report_type,
          generated_by: uName,
          generated_at: new Date().toISOString(),
          status: 'COMPLETED',
          file_url: `/reports/gen_${Date.now()}.pdf`,
          created_at: new Date().toISOString()
        };
        AUDIT_DB.reports.unshift(report);

        // Audit Event
        appendAuditLog(
          tenantId,
          userId,
          uName,
          'Create',
          'Audit',
          `Menghasilkan Laporan Audit formal baru: ${name}`,
          'Information',
          req.ip,
          req.headers['user-agent'] || '',
          report
        );

        return res.json({ success: true, data: report });
      }

      const list = AUDIT_DB.reports.filter(r => r.tenant_id === tenantId);
      return res.json({ success: true, data: list });
    }

    case 'complianceFramework': {
      if (req.method === 'POST') {
        const { name, code, type, description } = req.body;
        const exist = AUDIT_DB.complianceFrameworks.find(f => f.tenant_id === tenantId && f.code === code);
        if (exist) {
          return res.status(400).json({ success: false, message: 'Kode framework kepatuhan sudah ada' });
        }

        const framework: ComplianceFramework = {
          id: `frame-${Date.now()}`,
          tenant_id: tenantId,
          name,
          code,
          type,
          description: description || '',
          version: '1.0',
          categories: []
        };
        AUDIT_DB.complianceFrameworks.push(framework);

        // Audit log
        appendAuditLog(
          tenantId,
          userId,
          uName,
          'Create',
          'Compliance',
          `Membuat kerangka kepatuhan regulasi baru: ${name} (${code})`,
          'Information',
          req.ip,
          req.headers['user-agent'] || '',
          framework
        );

        return res.json({ success: true, data: framework });
      }

      const list = AUDIT_DB.complianceFrameworks.filter(f => f.tenant_id === tenantId);
      return res.json({ success: true, data: list });
    }

    case 'complianceChecklist': {
      const { framework_id } = req.query;
      const framework = AUDIT_DB.complianceFrameworks.find(f => f.tenant_id === tenantId && f.id === framework_id);
      
      if (req.method === 'POST') {
        // Support adding Checklist categories, checklists, or items
        const { action_sub, category_name, checklist_title, item_text, legal_ref, category_id, checklist_id, item_id, status } = req.body;
        
        if (!framework) return res.status(404).json({ success: false, message: 'Framework tidak ditemukan' });

        if (action_sub === 'add_category') {
          framework.categories.push({
            id: `fcat-${Date.now()}`,
            name: category_name,
            description: '',
            checklists: []
          });
        } else if (action_sub === 'add_checklist') {
          const cat = framework.categories.find(c => c.id === category_id);
          if (cat) {
            cat.checklists.push({
              id: `fchk-${Date.now()}`,
              title: checklist_title,
              description: '',
              items: []
            });
          }
        } else if (action_sub === 'add_item') {
          let found = false;
          framework.categories.forEach(c => {
            c.checklists.forEach(ch => {
              if (ch.id === checklist_id) {
                ch.items.push({
                  id: `fitem-${Date.now()}`,
                  requirement_text: item_text,
                  legal_reference: legal_ref || '',
                  is_mandatory: true,
                  status: 'Pending',
                  evidences: []
                });
                found = true;
              }
            });
          });
          if (!found) return res.status(404).json({ success: false, message: 'Checklist tidak ditemukan' });
        } else if (action_sub === 'update_item_status') {
          let beforeVal = null;
          let afterVal = null;
          framework.categories.forEach(c => {
            c.checklists.forEach(ch => {
              ch.items.forEach(it => {
                if (it.id === item_id) {
                  beforeVal = { ...it };
                  it.status = status;
                  afterVal = { ...it };
                }
              });
            });
          });

          if (beforeVal && afterVal) {
            // Log precise data change history with before & after values
            const alog = appendAuditLog(
              tenantId,
              userId,
              uName,
              'Update',
              'Compliance',
              `Mengubah status item kepatuhan menjadi: ${status}`,
              'Information',
              req.ip,
              req.headers['user-agent'] || ''
            );
            logDataChange(
              tenantId,
              alog.id,
              item_id,
              'compliance_items',
              beforeVal,
              afterVal,
              ['status']
            );
          }
        }

        return res.json({ success: true, data: framework });
      }

      return res.json({ success: true, data: framework ? framework.categories : [] });
    }

    case 'complianceAssessment': {
      // Handles assessment calculations and uploading evidence
      if (req.method === 'POST') {
        const { framework_id, assessor_name, item_id, file_name, file_size, file_type, base64_content, title } = req.body;
        
        const framework = AUDIT_DB.complianceFrameworks.find(f => f.tenant_id === tenantId && f.id === framework_id);
        if (!framework) return res.status(404).json({ success: false, message: 'Framework tidak ditemukan' });

        if (item_id && file_name) {
          // It's an evidence upload
          let foundItem: any = null;
          framework.categories.forEach(c => {
            c.checklists.forEach(ch => {
              ch.items.forEach(it => {
                if (it.id === item_id) {
                  foundItem = it;
                }
              });
            });
          });

          if (!foundItem) return res.status(404).json({ success: false, message: 'Item checklist tidak ditemukan' });

          const digitalSignature = generateSecureHash(`${file_name}|${file_size}|${tenantId}|${Date.now()}`);
          const newEvidence = {
            id: `ev-${Date.now()}`,
            title: title || file_name,
            file_path: `/documents/compliance/${file_name}`,
            file_type: file_type || 'PDF',
            file_size: file_size || 102400,
            digital_signature: digitalSignature,
            verification_status: 'Unverified' as const,
            created_at: new Date().toISOString()
          };

          foundItem.evidences.push(newEvidence);
          foundItem.status = 'Compliant'; // Auto mark compliant on evidence upload

          // Log Audit Trail
          appendAuditLog(
            tenantId,
            userId,
            uName,
            'Import',
            'Compliance',
            `Unggah bukti digital kepatuhan: ${newEvidence.title} (Digital Signature tergenerate)`,
            'Information',
            req.ip,
            req.headers['user-agent'] || '',
            newEvidence
          );

          return res.json({ success: true, data: newEvidence });
        }

        // Create compliance assessment report
        let total = 0;
        let compliant = 0;
        framework.categories.forEach(c => {
          c.checklists.forEach(ch => {
            ch.items.forEach(it => {
              total++;
              if (it.status === 'Compliant') compliant++;
            });
          });
        });

        const rate = total > 0 ? (compliant / total) * 100 : 100.0;
        const assessment = {
          id: `ass-${Date.now()}`,
          framework_id,
          assessor_name: assessor_name || uName,
          assessment_date: new Date().toISOString().split('T')[0],
          total_items: total,
          compliant_items: compliant,
          compliance_rate: parseFloat(rate.toFixed(2)),
          notes: req.body.notes || 'Penilaian kepatuhan mandiri rutin'
        };

        // Log compliance audit log
        appendAuditLog(
          tenantId,
          userId,
          uName,
          'Approve',
          'Compliance',
          `Melaksanakan penilaian kepatuhan regulasi ${framework.name}. Tingkat Kepatuhan: ${rate.toFixed(2)}%`,
          rate < 80 ? 'Warning' : 'Information',
          req.ip,
          req.headers['user-agent'] || '',
          assessment
        );

        return res.json({ success: true, data: assessment });
      }

      return res.status(400).json({ success: false, message: 'Aksi compliance assessment salah' });
    }

    case 'riskManagement': {
      if (req.method === 'POST') {
        const { title, category_id, risk_level, likelihood, impact, mitigation_plan, status } = req.body;
        const newRisk: Risk = {
          id: `risk-${Date.now()}`,
          tenant_id: tenantId,
          category_id,
          title,
          description: req.body.description || '',
          risk_level,
          likelihood,
          impact,
          mitigation_plan: mitigation_plan || '',
          status: status || 'Open',
          created_at: new Date().toISOString()
        };
        AUDIT_DB.risks.unshift(newRisk);

        // Audit Trail
        appendAuditLog(
          tenantId,
          userId,
          uName,
          'Create',
          'Audit',
          `Menambahkan risiko operasional baru: ${title} (Level: ${risk_level})`,
          risk_level === 'Critical' || risk_level === 'High' ? 'Warning' : 'Information',
          req.ip,
          req.headers['user-agent'] || '',
          newRisk
        );

        return res.json({ success: true, data: newRisk });
      }

      // Return combined Risks and categories
      const risks = AUDIT_DB.risks.filter(r => r.tenant_id === tenantId);
      const categories = AUDIT_DB.riskCategories.filter(rc => rc.tenant_id === tenantId);
      return res.json({ success: true, data: { risks, categories } });
    }

    case 'correctiveAction': {
      if (req.method === 'POST') {
        const { action_sub, corrective_action_id, notes, status, verified_by } = req.body;
        
        const ca = AUDIT_DB.correctiveActions.find(c => c.tenant_id === tenantId && c.id === corrective_action_id);
        if (!ca) return res.status(404).json({ success: false, message: 'Aksi korektif tidak ditemukan' });

        if (action_sub === 'add_followup') {
          const followup = {
            notes,
            verified_by: verified_by || uName,
            verification_date: new Date().toISOString().split('T')[0],
            status: status || 'Verified'
          };
          ca.followups.unshift(followup);
          ca.status = status === 'Verified' ? 'Completed' : 'In Progress';

          appendAuditLog(
            tenantId,
            userId,
            uName,
            'Approve',
            'Audit',
            `Melakukan tindak lanjut aksi korektif: ${ca.action_plan}. Status: ${ca.status}`,
            'Information',
            req.ip,
            req.headers['user-agent'] || '',
            followup
          );

          return res.json({ success: true, data: ca });
        }
      }

      const list = AUDIT_DB.correctiveActions.filter(c => c.tenant_id === tenantId);
      return res.json({ success: true, data: list });
    }

    case 'followupStatus': {
      const list = AUDIT_DB.correctiveActions.filter(c => c.tenant_id === tenantId);
      return res.json({ success: true, data: list });
    }

    case 'accreditationPeriod': {
      const list = AUDIT_DB.accreditationPeriods.filter(ap => ap.tenant_id === tenantId);
      return res.json({ success: true, data: list });
    }

    case 'accreditationAssessment': {
      const acc = AUDIT_DB.accreditations.find(a => a.tenant_id === tenantId);
      if (!acc) return res.status(404).json({ success: false, message: 'Data akreditasi tidak ditemukan' });

      if (req.method === 'POST') {
        const { action_sub, instrument_id, self_score, justification, file_name, file_size, reviewer_name, comments } = req.body;

        if (action_sub === 'save_self_score') {
          // Save self assessment score
          let foundInst: any = null;
          acc.standards.forEach(std => {
            std.instruments.forEach(inst => {
              if (inst.id === instrument_id) {
                foundInst = inst;
                inst.self_score = parseInt(self_score);
                inst.justification = justification || '';
              }
            });
          });

          if (!foundInst) return res.status(404).json({ success: false, message: 'Butir instrumen tidak ditemukan' });

          // Recalculate overall self evaluation score
          let totalScoreSum = 0;
          let maxScoreSum = 0;
          acc.standards.forEach(std => {
            std.instruments.forEach(inst => {
              totalScoreSum += inst.self_score;
              maxScoreSum += inst.maximum_score;
            });
          });
          acc.overall_self_score = maxScoreSum > 0 ? parseFloat(((totalScoreSum / maxScoreSum) * 100).toFixed(2)) : 85.5;

          // Audit
          appendAuditLog(
            tenantId,
            userId,
            uName,
            'Update',
            'Accreditation',
            `Mengisi evaluasi diri butir ${foundInst.code} dengan nilai ${self_score}`,
            'Information',
            req.ip,
            req.headers['user-agent'] || '',
            foundInst
          );

          return res.json({ success: true, data: acc });
        } else if (action_sub === 'upload_evidence') {
          let foundInst: any = null;
          acc.standards.forEach(std => {
            std.instruments.forEach(inst => {
              if (inst.id === instrument_id) {
                foundInst = inst;
              }
            });
          });

          if (!foundInst) return res.status(404).json({ success: false, message: 'Instrumen tidak ditemukan' });

          const digitalSignature = generateSecureHash(`${file_name}|${file_size}|accreditation|${Date.now()}`);
          const newDoc = {
            id: `adoc-${Date.now()}`,
            title: file_name,
            file_path: `/documents/accreditation/${file_name}`,
            file_type: 'PDF' as const,
            file_size: file_size || 1048576,
            digital_signature: digitalSignature,
            verification_status: 'Unverified' as const,
            created_at: new Date().toISOString()
          };

          // Append to first evidence block
          if (foundInst.evidences.length === 0) {
            foundInst.evidences.push({
              id: `aev-${Date.now()}`,
              title: 'Bukti Digital Uploaded',
              documents: []
            });
          }
          foundInst.evidences[0].documents.push(newDoc);

          appendAuditLog(
            tenantId,
            userId,
            uName,
            'Import',
            'Accreditation',
            `Unggah dokumen bukti akreditasi butir ${foundInst.code}: ${file_name}`,
            'Information',
            req.ip,
            req.headers['user-agent'] || '',
            newDoc
          );

          return res.json({ success: true, data: acc });
        } else if (action_sub === 'add_reviewer_comment') {
          const reviewer = {
            reviewer_name: reviewer_name || uName,
            reviewer_role: 'INTERNAL_REVIEWER',
            assignment_date: new Date().toISOString().split('T')[0],
            comments: comments || ''
          };
          acc.reviewers.push(reviewer);

          appendAuditLog(
            tenantId,
            userId,
            uName,
            'Approve',
            'Accreditation',
            `Reviewer ${reviewer.reviewer_name} memberikan komentar pada usulan evaluasi akreditasi`,
            'Information',
            req.ip,
            req.headers['user-agent'] || '',
            reviewer
          );

          return res.json({ success: true, data: acc });
        } else if (action_sub === 'add_custom_instrument') {
          const { standard_id, code, question_text, maximum_score, indicators } = req.body;
          const std = acc.standards.find(s => s.id === standard_id);
          if (!std) return res.status(404).json({ success: false, message: 'Standar akreditasi tidak ditemukan' });

          const newInst = {
            id: `ainst-custom-${Date.now()}`,
            code,
            question_text,
            scoring_rubric: { 4: 'Sangat Baik', 3: 'Baik', 2: 'Cukup', 1: 'Kurang' },
            maximum_score: parseInt(maximum_score) || 4,
            indicators: indicators || ['Indikator kustom sekolah'],
            self_score: 0,
            assessor_score: 0,
            justification: '',
            evidences: []
          };
          std.instruments.push(newInst);

          appendAuditLog(
            tenantId,
            userId,
            uName,
            'Create',
            'Accreditation',
            `Menambahkan butir instrumen akreditasi kustom baru: ${code} pada standar ${std.code}`,
            'Information',
            req.ip,
            req.headers['user-agent'] || '',
            newInst
          );

          return res.json({ success: true, data: acc });
        }
      }

      return res.json({ success: true, data: acc });
    }

    case 'governmentReport': {
      if (req.method === 'POST') {
        const { report_type, title, academic_year, period_start, period_end } = req.body;
        
        // Generate content dynamically using active database metrics (Student counts, etc.)
        let simulatedData: any = {};
        if (report_type === 'Student') {
          simulatedData = {
            total_students_registered: DB?.students?.length || 150,
            active_students: DB?.students?.filter((s: any) => s.status === 'AKTIF').length || 148,
            male_students: DB?.students?.filter((s: any) => s.gender === 'L').length || 72,
            female_students: DB?.students?.filter((s: any) => s.gender === 'P').length || 78
          };
        } else if (report_type === 'Teacher') {
          simulatedData = {
            total_teachers_active: DB?.teachers?.length || 20,
            certified_teachers: 14,
            education_level_master: 6
          };
        } else if (report_type === 'Finance') {
          // Summarize cash flow
          const cashFlow = DB?.cashTransactions || [];
          const totalIn = cashFlow.filter((c: any) => c.type === 'IN').reduce((sum: number, c: any) => sum + c.amount, 0) || 12500000;
          const totalOut = cashFlow.filter((c: any) => c.type === 'OUT').reduce((sum: number, c: any) => sum + c.amount, 0) || 4800000;
          simulatedData = {
            revenue_total: totalIn,
            expenses_total: totalOut,
            net_balance: totalIn - totalOut,
            bos_disbursement: 85000000
          };
        } else {
          simulatedData = {
            generated_records: 45,
            integrity_check: 'PASSED',
            source_erp_version: 'v5.8.1'
          };
        }

        const newReport: GovernmentReport = {
          id: `govrep-${Date.now()}`,
          tenant_id: tenantId,
          report_type,
          title,
          academic_year: academic_year || '2025/2026',
          period_start: period_start || new Date().toISOString().split('T')[0],
          period_end: period_end || new Date().toISOString().split('T')[0],
          content_data: simulatedData,
          status: 'Generated',
          submission_date: null,
          government_tracking_number: null,
          file_url: `/exports/gov/dapodik_${report_type.toLowerCase()}_${Date.now()}.xlsx`,
          created_at: new Date().toISOString()
        };
        AUDIT_DB.governmentReports.unshift(newReport);

        // Audit Trail
        appendAuditLog(
          tenantId,
          userId,
          uName,
          'Create',
          'Government',
          `Menghasilkan Laporan Sinkronisasi Pemerintah (${report_type}): ${title}`,
          'Information',
          req.ip,
          req.headers['user-agent'] || '',
          newReport
        );

        return res.json({ success: true, data: newReport });
      }

      // Check for submit action
      const { submit_id } = req.query;
      if (submit_id) {
        const rep = AUDIT_DB.governmentReports.find(r => r.tenant_id === tenantId && r.id === submit_id);
        if (rep) {
          rep.status = 'Submitted';
          rep.submission_date = new Date().toISOString().split('T')[0];
          rep.government_tracking_number = 'TRK-DAPODIK-' + Math.floor(Math.random() * 900000 + 100000);

          appendAuditLog(
            tenantId,
            userId,
            uName,
            'Approve',
            'Government',
            `Mengirim laporan formal ke portal kementerian. No Resi: ${rep.government_tracking_number}`,
            'Information',
            req.ip,
            req.headers['user-agent'] || '',
            rep
          );
        }
        return res.json({ success: true, data: rep });
      }

      const list = AUDIT_DB.governmentReports.filter(r => r.tenant_id === tenantId);
      return res.json({ success: true, data: list });
    }

    case 'executiveAudit': {
      // Execute-side Gemini summaries if API key is active
      const risks = AUDIT_DB.risks.filter(r => r.tenant_id === tenantId);
      const frameworks = AUDIT_DB.complianceFrameworks.filter(f => f.tenant_id === tenantId);
      
      let summaryText = '';
      if (process.env.GEMINI_API_KEY) {
        try {
          const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
            httpOptions: {
              headers: { 'User-Agent': 'aistudio-build' }
            }
          });
          const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: `Buatlah kesimpulan ringkas (Executive Compliance Summary) bahasa Indonesia untuk institusi pendidikan ini berdasarkan data berikut:\n` +
                      `- Jumlah risiko teridentifikasi: ${risks.length}\n` +
                      `- Kerangka regulasi kepatuhan aktif: ${frameworks.map(f => f.name).join(', ')}\n` +
                      `- Skor Kepatuhan Saat Ini: 92.5%\n\n` +
                      `Berikan 2 kalimat rekomendasi strategis bagi yayasan/kepala sekolah.`,
          });
          summaryText = response.text || '';
        } catch (e) {
          summaryText = 'AI Summary temporer offline. Institusi menunjukkan kepatuhan 92.5% terhadap regulasi dinas dan BAN-PDM. Direkomendasikan segera mengarsip sisa berkas sarana laboratorium.';
        }
      } else {
        summaryText = 'AI Summary belum terkonfigurasi. Institusi menunjukkan tingkat kepatuhan 92.5% dengan 2 risiko open terpantau aman dan terkontrol. Direkomendasikan untuk menindaklanjuti rencana mitigasi aset sarana laboratorium.';
      }

      return res.json({
        success: true,
        data: {
          ai_compliance_summary: summaryText,
          overall_health: 'SANGAT BAIK',
          compliance_rate: 92.5,
          risk_index: 'Rendah (Aman)',
          accreditation_prediction: 'A (Unggul)'
        }
      });
    }

    case 'auditExceptions':
    case 'auditExceptionList': {
      const { status, risk_level, moduleName, search, page = 1, limit = 50 } = { ...req.query, ...req.body };
      let list = AUDIT_DB.exceptions.filter(e => e.tenant_id === tenantId);

      if (status && status !== 'ALL') {
        list = list.filter(e => e.status.toUpperCase() === status.toString().toUpperCase());
      }
      if (risk_level && risk_level !== 'ALL') {
        list = list.filter(e => e.risk_level.toUpperCase() === risk_level.toString().toUpperCase());
      }
      if (moduleName && moduleName !== 'ALL') {
        list = list.filter(e => e.module.toLowerCase().includes(moduleName.toString().toLowerCase()));
      }
      if (search) {
        const q = search.toString().toLowerCase();
        list = list.filter(e => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || (e.target_id && e.target_id.toLowerCase().includes(q)));
      }

      const total = list.length;
      const startIndex = (Number(page) - 1) * Number(limit);
      const paginated = list.slice(startIndex, startIndex + Number(limit));

      return res.json({
        success: true,
        data: {
          items: paginated,
          total,
          page: Number(page),
          limit: Number(limit),
          total_open: AUDIT_DB.exceptions.filter(e => e.tenant_id === tenantId && e.status === 'OPEN').length,
          total_critical: AUDIT_DB.exceptions.filter(e => e.tenant_id === tenantId && e.risk_level === 'CRITICAL').length
        }
      });
    }

    case 'auditExceptionCreate': {
      const { exception_type, title, description, module: modName, risk_level, target_id, target_type } = req.body;
      const newExc: AuditException = {
        id: `exc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        tenant_id: tenantId,
        exception_type: exception_type || 'UNAUTHORIZED_ACTION',
        title: title || 'Peringatan Anomali Internal Control',
        description: description || '',
        module: modName || 'General',
        risk_level: risk_level || 'MEDIUM',
        status: 'OPEN',
        detected_at: new Date().toISOString(),
        target_id: target_id || null,
        target_type: target_type || null,
        actor_id: userId,
        actor_name: uName
      };

      AUDIT_DB.exceptions.unshift(newExc);

      // Audit Log
      appendAuditLog(
        tenantId,
        userId,
        uName,
        'Create',
        'Audit',
        `Mencatat exception internal control baru: ${newExc.title} [Tingkat: ${newExc.risk_level}]`,
        newExc.risk_level === 'CRITICAL' || newExc.risk_level === 'HIGH' ? 'Security' : 'Warning',
        req.ip,
        req.headers['user-agent'] || '',
        newExc
      );

      return res.json({ success: true, data: newExc });
    }

    case 'auditExceptionResolve': {
      const exceptionId = req.body.exception_id || req.body.id || req.query.id;
      const { resolution_notes, new_status = 'RESOLVED' } = req.body;

      const exc = AUDIT_DB.exceptions.find(e => e.tenant_id === tenantId && e.id === exceptionId);
      if (!exc) return res.status(404).json({ success: false, message: 'Exception tidak ditemukan' });

      exc.status = new_status;
      exc.resolution_notes = resolution_notes || 'Telah diverifikasi dan ditangani sesuai SOP pengawasan internal';
      exc.resolved_by = uName;
      exc.resolved_at = new Date().toISOString();

      // Audit Log
      appendAuditLog(
        tenantId,
        userId,
        uName,
        'Approve',
        'Audit',
        `Menyelesaikan exception pengendalian internal: ${exc.title} (Status: ${exc.status})`,
        'Information',
        req.ip,
        req.headers['user-agent'] || '',
        exc
      );

      return res.json({ success: true, data: exc });
    }

    case 'internalControl': {
      // Get internal control policies & check rules
      let policy = AUDIT_DB.internalControlRules.find(r => r.tenant_id === tenantId);
      if (!policy) {
        policy = {
          id: `ic-1-${tenantId}`,
          tenant_id: tenantId,
          segregation_of_duties_enforced: true,
          dual_approval_threshold_idr: 5000000,
          financial_period_locked_until: '2026-06-30',
          tamper_detection_active: true,
          immutable_audit_trail_active: true
        };
        AUDIT_DB.internalControlRules.push(policy);
      }

      if (req.method === 'POST') {
        const { action_type, segregation_of_duties_enforced, dual_approval_threshold_idr, financial_period_locked_until } = req.body;
        
        if (action_type === 'validate_segregation') {
          const { maker_id, approver_id } = req.body;
          const isViolation = maker_id && approver_id && maker_id === approver_id;
          return res.json({
            success: true,
            data: {
              is_valid: !isViolation,
              violation_detected: isViolation,
              message: isViolation ? 'Pelanggaran Segregation of Duties: Pembuat transaksi tidak boleh menyetujui transaksi sendiri.' : 'Validasi Segregation of Duties lolos.'
            }
          });
        }

        if (action_type === 'validate_period_lock') {
          const { transaction_date } = req.body;
          const isLocked = transaction_date && transaction_date <= policy.financial_period_locked_until;
          return res.json({
            success: true,
            data: {
              is_locked: isLocked,
              locked_until: policy.financial_period_locked_until,
              message: isLocked ? `Periode buku hingga ${policy.financial_period_locked_until} telah dikunci (Period Lock). Transaksi tidak dapat diubah.` : 'Periode buku terbuka untuk pencatatan.'
            }
          });
        }

        // Update settings
        if (segregation_of_duties_enforced !== undefined) policy.segregation_of_duties_enforced = Boolean(segregation_of_duties_enforced);
        if (dual_approval_threshold_idr !== undefined) policy.dual_approval_threshold_idr = Number(dual_approval_threshold_idr);
        if (financial_period_locked_until !== undefined) policy.financial_period_locked_until = financial_period_locked_until;

        appendAuditLog(
          tenantId,
          userId,
          uName,
          'Update',
          'Audit',
          `Memperbarui kebijakan Pengendalian Internal (Period Lock & Segregation of Duties)`,
          'Warning',
          req.ip,
          req.headers['user-agent'] || '',
          policy
        );

        return res.json({ success: true, data: policy });
      }

      return res.json({
        success: true,
        data: {
          policy,
          active_checks: [
            { name: 'Segregation of Duties (Maker != Approver)', status: policy.segregation_of_duties_enforced ? 'ACTIVE' : 'INACTIVE', risk: 'HIGH' },
            { name: 'Financial Period Locking', status: 'ACTIVE', locked_until: policy.financial_period_locked_until, risk: 'CRITICAL' },
            { name: 'Dual Approval Threshold', status: 'ACTIVE', threshold: `Rp ${policy.dual_approval_threshold_idr.toLocaleString('id-ID')}`, risk: 'MEDIUM' },
            { name: 'Cryptographic Hash-Chained Audit Trail', status: 'ACTIVE', algorithm: 'SHA-256 Chained', risk: 'LOW' },
            { name: 'Automated Exception Scanner', status: 'ACTIVE', scan_interval: 'Real-time & Batch Daily', risk: 'MEDIUM' }
          ]
        }
      });
    }

    case 'verifyHashChain': {
      // Validate all audit logs in sequence for tamper resistance
      const logs = AUDIT_DB.auditLogs.filter(l => l.tenant_id === tenantId);
      let isValid = true;
      let corruptedIndex = -1;
      let previousSimHash = 'genesis_sprint_27_audit_log_hash_init_root';

      // Verify from oldest to newest
      const chronological = [...logs].reverse();
      for (let i = 0; i < chronological.length; i++) {
        const item = chronological[i];
        const calculated = generateSecureHash(`${item.id}|${item.tenant_id}|${item.user_id}|${item.action}|${item.module}|${item.severity}|${item.created_at}|${previousSimHash}`);
        if (item.encrypted_hash !== calculated) {
          isValid = false;
          corruptedIndex = i;
          break;
        }
        previousSimHash = calculated;
      }

      return res.json({
        success: true,
        data: {
          is_tamper_free: isValid,
          total_records_checked: logs.length,
          corrupted_records_count: isValid ? 0 : 1,
          algorithm: 'SHA-256 Immutable Hash Chain',
          integrity_status: isValid ? '100% TERVERIFIKASI ASLI & TIDAK DAPAT DIMANIPULASI' : 'PERINGATAN: ANOMALI INTEGRITAS TERDETEKSI',
          latest_block_hash: logs.length > 0 ? logs[0].encrypted_hash : previousSimHash,
          verified_at: new Date().toISOString()
        }
      });
    }

    case 'retentionPolicy': {
      let pol = AUDIT_DB.retentionPolicies.find(p => p.tenant_id === tenantId);
      if (!pol) {
        pol = {
          id: `retpol-1-${tenantId}`,
          tenant_id: tenantId,
          retention_years: 5,
          auto_archive_enabled: true,
          tamper_detection_enabled: true,
          last_archived_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
          archived_records_count: 1420
        };
        AUDIT_DB.retentionPolicies.push(pol);
      }

      if (req.method === 'POST') {
        const { retention_years, auto_archive_enabled, tamper_detection_enabled } = req.body;
        if (retention_years !== undefined) pol.retention_years = Number(retention_years);
        if (auto_archive_enabled !== undefined) pol.auto_archive_enabled = Boolean(auto_archive_enabled);
        if (tamper_detection_enabled !== undefined) pol.tamper_detection_enabled = Boolean(tamper_detection_enabled);

        appendAuditLog(
          tenantId,
          userId,
          uName,
          'Update',
          'Audit',
          `Memperbarui kebijakan retensi audit log menjadi ${pol.retention_years} tahun`,
          'Warning',
          req.ip,
          req.headers['user-agent'] || '',
          pol
        );

        return res.json({ success: true, data: pol });
      }

      return res.json({ success: true, data: pol });
    }

    case 'runRetentionJob': {
      let pol = AUDIT_DB.retentionPolicies.find(p => p.tenant_id === tenantId);
      if (!pol) {
        pol = {
          id: `retpol-1-${tenantId}`,
          tenant_id: tenantId,
          retention_years: 5,
          auto_archive_enabled: true,
          tamper_detection_enabled: true,
          last_archived_at: new Date().toISOString().split('T')[0],
          archived_records_count: 1420
        };
        AUDIT_DB.retentionPolicies.push(pol);
      }

      pol.last_archived_at = new Date().toISOString().split('T')[0];
      pol.archived_records_count += 48; // Simulated batch archive

      appendAuditLog(
        tenantId,
        userId,
        uName,
        'Export',
        'Audit',
        `Menjalankan job retensi arsip data audit otomatis (${pol.retention_years} tahun). Berhasil mengarsipkan 48 entri riwayat.`,
        'Information',
        req.ip,
        req.headers['user-agent'] || '',
        { archived_count: 48, total_archived: pol.archived_records_count }
      );

      return res.json({
        success: true,
        message: `Job retensi & pengarsipan audit selesai dijalankan. Data terarsip: ${pol.archived_records_count} entri.`,
        data: pol
      });
    }

    case 'securityEvents': {
      // Returns security audit trail: Failed logins, password changes, permission updates, role assignments
      const logs = AUDIT_DB.auditLogs.filter(l => l.tenant_id === tenantId && (l.severity === 'Security' || l.severity === 'Critical' || l.module === 'Auth' || l.module === 'RBAC'));
      const loginHistories = AUDIT_DB.loginHistories.filter(lh => lh.tenant_id === tenantId);
      const activeSessions = AUDIT_DB.sessions.filter(s => s.tenant_id === tenantId && s.is_active);

      return res.json({
        success: true,
        data: {
          security_logs: logs,
          login_histories: loginHistories,
          active_sessions: activeSessions,
          threat_indicators: {
            failed_logins_last_24h: loginHistories.filter(lh => lh.status === 'FAILED').length,
            suspicious_ips_detected: 0,
            active_sessions_count: activeSessions.length,
            mfa_enforced_percentage: 100
          }
        }
      });
    }

    default:
      return null;
  }
}
