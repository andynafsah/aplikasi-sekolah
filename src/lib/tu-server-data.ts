// ============================================================================
// SPRINT 26: ENTERPRISE TATA USAHA, ADMINISTRASI SEKOLAH, PONDOK & YAYASAN
// IN-MEMORY DATA STORAGE, SEED DATA & BACKEND REST ENDPOINT DELEGATION
// ============================================================================

export interface IncomingLetter {
  id: string;
  tenant_id: string;
  letter_number: string;
  agenda_number: string;
  letter_date: string;
  received_date: string;
  sender: string;
  receiver: string;
  subject: string;
  category_id: string;
  letter_type: 'Surat Masuk';
  summary: string;
  confidentiality: 'BIASA' | 'RAHASIA' | 'SANGAT_RAHASIA';
  urgency: 'BIASA' | 'SEGERA' | 'PENTING';
  status: 'Pending' | 'Read' | 'Disposed' | 'Archived';
  file_path?: string;
  version: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string;
  updated_by: string;
}

export interface OutgoingLetter {
  id: string;
  tenant_id: string;
  letter_number: string;
  agenda_number: string;
  letter_date: string;
  sender: string;
  destination: string;
  subject: string;
  category_id: string;
  letter_type: 'Surat Keluar' | 'Surat Keputusan' | 'Surat Tugas' | 'Surat Edaran' | 'Surat Undangan' | 'Surat Keterangan' | 'Surat Mutasi' | 'Surat Aktif' | 'Surat Rekomendasi' | 'Surat Perjanjian';
  summary: string;
  confidentiality: 'BIASA' | 'RAHASIA' | 'SANGAT_RAHASIA';
  urgency: 'BIASA' | 'SEGERA' | 'PENTING';
  is_draft: boolean;
  file_path?: string;
  qr_code_hash?: string;
  signatory_name?: string;
  signatory_title?: string;
  institution?: string;
  version: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string;
  updated_by: string;
}

export interface Disposition {
  id: string;
  tenant_id: string;
  incoming_letter_id: string;
  disposition_date: string;
  instruction: string;
  sender_id: string;
  status: 'Pending' | 'Read' | 'In Progress' | 'Completed' | 'Rejected';
  urgency: 'BIASA' | 'SEGERA' | 'PENTING';
  receivers: {
    receiver_role: string;
    receiver_user_id?: string;
    status: 'Pending' | 'Read' | 'In Progress' | 'Completed' | 'Rejected';
    notes?: string;
  }[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string;
  updated_by: string;
}

export interface LetterTemplate {
  id: string;
  tenant_id: string;
  name: string;
  code: string;
  letter_type: string;
  number_format: string;
  content_template: string;
  variables: string[]; // JSON representation
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string;
  updated_by: string;
}

export interface DocumentArchive {
  id: string;
  tenant_id: string;
  title: string;
  archive_number: string;
  document_id?: string;
  document_type_code: 'INCOMING' | 'OUTGOING' | 'LEGAL' | 'OTHER';
  box_number: string;
  shelf_position: string;
  archive_status: 'Active' | 'Inactive' | 'Permanent' | 'Destroyed';
  retention_period_years: number;
  is_digital: boolean;
  file_path?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string;
  updated_by: string;
}

export interface Expedition {
  id: string;
  tenant_id: string;
  expedition_number: string;
  dispatch_date: string;
  dispatcher: string;
  courier_service: string;
  tracking_number?: string;
  notes?: string;
  status: 'Dalam Perjalanan' | 'Diterima' | 'Gagal';
  items: {
    id: string;
    document_type: string;
    reference_id: string;
    subject: string;
    receiver_name: string;
    delivery_status: 'Delivered' | 'Pending';
    delivered_at?: string;
    recipient_signature?: string;
  }[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string;
  updated_by: string;
}

export interface GuestBookEntry {
  id: string;
  tenant_id: string;
  full_name: string;
  institution?: string;
  phone?: string;
  email?: string;
  id_card_number?: string;
  visits: {
    id: string;
    visit_date: string;
    visit_time: string;
    purpose: string;
    host_name: string;
    room_or_department: string;
    signature_path?: string;
    check_out_time?: string;
  }[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string;
  updated_by: string;
}

export interface LegalDocument {
  id: string;
  tenant_id: string;
  title: string;
  document_number: string;
  legal_type: 'Akta Yayasan' | 'SK Kemenkumham' | 'NPWP' | 'NIB' | 'Izin Operasional' | 'NPSN' | 'NSPP' | 'Piagam' | 'Sertifikat' | 'MoU';
  issuer: string;
  issue_date: string;
  expiration_date?: string;
  alert_before_days: number;
  status: 'Active' | 'Expired' | 'Revoked' | 'Draft';
  file_path?: string;
  versions: {
    version_number: number;
    file_path: string;
    change_summary: string;
    created_at: string;
  }[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string;
  updated_by: string;
}

export interface DocumentReminder {
  id: string;
  tenant_id: string;
  document_type: string;
  document_id: string;
  reminder_title: string;
  reminder_message: string;
  reminder_date: string;
  is_sent: boolean;
  frequency: 'ONCE' | 'DAILY' | 'WEEKLY';
  sent_at?: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string;
  updated_by: string;
}

export interface AuditLog {
  id: string;
  tenant_id: string;
  activity_type: string;
  actor_name: string;
  actor_role: string;
  details: string;
  created_at: string;
}

// In-Memory Database Store specifically for Sprint 26 Tata Usaha
export const OfficeDB: {
  incomingLetters: IncomingLetter[];
  outgoingLetters: OutgoingLetter[];
  dispositions: any[];
  dispositionLogs: any[];
  approvals: any[];
  approvalLogs: any[];
  digitalSignatures: any[];
  letterTemplates: any[];
  archives: any[];
  expeditions: Expedition[];
  guestBook: GuestBookEntry[];
  legalDocuments: LegalDocument[];
  reminders: DocumentReminder[];
  requests: any[];
  waLogs: any[];
  hierarchy: any[];
  students: any[];
  teachers: any[];
  kopConfigs: any;
  bulletins: any[];
  meetings: any[];
  letterSequences: Record<string, number>;
  auditLogs: AuditLog[];
  workflows: string[];
  approvalStages: string[];
  academicChecklists: Record<string, any[]>;
  academicWorkflows: Record<string, any[]>;
} = {
  academicChecklists: {},
  academicWorkflows: {},
  workflows: [
    'Draft',
    'Review',
    'Verifikasi',
    'Approval',
    'Tanda Tangan Digital',
    'Nomor Surat',
    'Publish',
    'Distribusi',
    'Arsip'
  ],
  approvalStages: [
    'Administrator',
    'TU',
    'Kepala Sekolah',
    'Ketua Yayasan',
    'Selesai'
  ],
  dispositionLogs: [],
  approvals: [],
  approvalLogs: [],
  digitalSignatures: [],
  bulletins: [],
  meetings: [],
  requests: [],
  waLogs: [],
  hierarchy: [],
    students: [],
  teachers: [],
  kopConfigs: {},
  incomingLetters: [
    {
      id: 'inc-let-1',
      tenant_id: 'tenant-1',
      letter_number: '045/DinasPendidikan/VI/2026',
      agenda_number: 'ASM-2026-0001',
      letter_date: '2026-06-15',
      received_date: '2026-06-16',
      sender: 'Dinas Pendidikan DKI Jakarta',
      receiver: 'Kepala Sekolah SMA Unggulan Nusantara',
      subject: 'Undangan Rapat Koordinasi Kurikulum Merdeka Fase F',
      category_id: 'cat-1',
      letter_type: 'Surat Masuk',
      summary: 'Dinas mengundang kepala sekolah dan waka kurikulum untuk hadir rapat koordinasi implementasi kurikulum merdeka.',
      confidentiality: 'BIASA',
      urgency: 'PENTING',
      status: 'Disposed',
      file_path: 'https://example.com/docs/undangan_dinas.pdf',
      version: 1,
      created_at: '2026-06-16T08:00:00Z',
      updated_at: '2026-06-16T08:00:00Z',
      deleted_at: null,
      created_by: 'user-1',
      updated_by: 'user-1'
    },
    {
      id: 'inc-let-2',
      tenant_id: 'tenant-1',
      letter_number: '120/YYS-NUSA/VI/2026',
      agenda_number: 'ASM-2026-0002',
      letter_date: '2026-06-18',
      received_date: '2026-06-19',
      sender: 'Yayasan Nusantara Bangkit',
      receiver: 'Slamet Hariadi (Staf TU)',
      subject: 'Surat Keputusan Alokasi Dana Renovasi Lab Komputer',
      category_id: 'cat-2',
      letter_type: 'Surat Masuk',
      summary: 'SK persetujuan dan rincian alokasi anggaran dana renovasi sarpras laboratorium komputer SMA.',
      confidentiality: 'BIASA',
      urgency: 'BIASA',
      status: 'Pending',
      file_path: 'https://example.com/docs/sk_renovasi.pdf',
      version: 1,
      created_at: '2026-06-19T09:30:00Z',
      updated_at: '2026-06-19T09:30:00Z',
      deleted_at: null,
      created_by: 'user-1',
      updated_by: 'user-1'
    }
  ],

  outgoingLetters: [
    {
      id: 'out-let-1',
      tenant_id: 'tenant-1',
      letter_number: '001/SU/SMA-UN/VII/2026',
      agenda_number: 'ASK-2026-0001',
      letter_date: '2026-07-02',
      sender: 'Ahmad Ghozali, S.Pd.',
      destination: 'Orang Tua / Wali Siswa Kelas X',
      subject: 'Undangan Pertemuan Orientasi Santri & Siswa Baru TA 2026/2027',
      category_id: 'cat-1',
      letter_type: 'Surat Undangan',
      summary: 'Mengundang seluruh wali murid untuk memaparkan kalender akademik dan sistem tagihan SPP.',
      confidentiality: 'BIASA',
      urgency: 'BIASA',
      is_draft: false,
      file_path: 'https://example.com/docs/undangan_spp_wali.pdf',
      qr_code_hash: 'QR_OUT_LET_1_VALID_VERIFIED',
      version: 2,
      created_at: '2026-07-02T10:00:00Z',
      updated_at: '2026-07-02T10:30:00Z',
      deleted_at: null,
      created_by: 'user-1',
      updated_by: 'user-1'
    },
    {
      id: 'out-let-2',
      tenant_id: 'tenant-1',
      letter_number: '002/SK/SMA-UN/VII/2026',
      agenda_number: 'ASK-2026-0002',
      letter_date: '2026-07-04',
      sender: 'Budi Raharjo, M.Pd.',
      destination: 'Dewi Lestari, M.Hum.',
      subject: 'Surat Keputusan Pengangkatan Kepala Perpustakaan',
      category_id: 'cat-3',
      letter_type: 'Surat Keputusan',
      summary: 'Surat keputusan mutasi tugas internal tambahan guru sebagai koordinator kepala perpustakaan sekolah.',
      confidentiality: 'RAHASIA',
      urgency: 'PENTING',
      is_draft: true,
      file_path: '',
      qr_code_hash: '',
      version: 1,
      created_at: '2026-07-04T14:15:00Z',
      updated_at: '2026-07-04T14:15:00Z',
      deleted_at: null,
      created_by: 'user-1',
      updated_by: 'user-1'
    }
  ],

  dispositions: [
    {
      id: 'disp-1',
      tenant_id: 'tenant-1',
      incoming_letter_id: 'inc-let-1',
      disposition_date: '2026-06-17',
      instruction: 'Harap hadir dan wakili saya dalam rapat koordinasi kurikulum. Siapkan draf laporan implementasi SMA kita.',
      sender_id: 'user-1',
      status: 'In Progress',
      urgency: 'SEGERA',
      receivers: [
        { receiver_role: 'GURU', receiver_user_id: 'user-3', status: 'In Progress', notes: 'Sedang merangkum bahan materi kurikulum Merdeka.' }
      ],
      created_at: '2026-06-17T09:00:00Z',
      updated_at: '2026-06-17T09:00:00Z',
      deleted_at: null,
      created_by: 'user-1',
      updated_by: 'user-1'
    }
  ],

  letterTemplates: [
    {
      id: 'tmpl-1',
      tenant_id: 'tenant-1',
      name: 'Template Surat Undangan Resmi Wali',
      code: 'TMP-SU',
      letter_type: 'Surat Undangan',
      number_format: '{seq}/SU/SMA-UN/{month-roman}/{year}',
      content_template: 'Kepada Yth. Bapak/Ibu Wali Murid {nama_siswa} di tempat. Dengan hormat, kami mengharap kehadiran Bapak/Ibu pada acara {nama_acara} yang diselenggarakan pada {tanggal_acara} bertempat di {lokasi_acara}. Demikian undangan ini, atas perhatiannya kami ucapkan terima kasih.',
      variables: ['nama_siswa', 'nama_acara', 'tanggal_acara', 'lokasi_acara'],
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
      deleted_at: null,
      created_by: 'system',
      updated_by: 'system'
    },
    {
      id: 'tmpl-2',
      tenant_id: 'tenant-1',
      name: 'Template Surat Keputusan Sekolah',
      code: 'TMP-SK',
      letter_type: 'Surat Keputusan',
      number_format: '{seq}/SK/SMA-UN/{month-roman}/{year}',
      content_template: 'Menimbang: {menimbang}. Mengingat: {mengingat}. Memutuskan: Menetapkan {menetapkan} terhitung mulai tanggal {mulai_berlaku}. Ditetapkan di Jakarta, oleh Kepala Sekolah.',
      variables: ['menimbang', 'mengingat', 'menetapkan', 'mulai_berlaku'],
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
      deleted_at: null,
      created_by: 'system',
      updated_by: 'system'
    }
  ],

  archives: [
    {
      id: 'arch-1',
      tenant_id: 'tenant-1',
      title: 'Berkas Undangan Dinas Kurikulum Fase F',
      archive_number: 'ARC-2026-0091',
      document_id: 'inc-let-1',
      document_type_code: 'INCOMING',
      box_number: 'BOX-A-04',
      shelf_position: 'Rak 2 Baris C',
      archive_status: 'Active',
      retention_period_years: 5,
      is_digital: true,
      file_path: 'https://example.com/docs/undangan_dinas.pdf',
      notes: 'Disimpan digital & fisik untuk bukti akreditasi.',
      created_at: '2026-06-20T10:00:00Z',
      updated_at: '2026-06-20T10:00:00Z',
      deleted_at: null,
      created_by: 'user-1',
      updated_by: 'user-1'
    }
  ],

  expeditions: [
    {
      id: 'exp-1',
      tenant_id: 'tenant-1',
      expedition_number: 'EXP-2026-0012',
      dispatch_date: '2026-07-03',
      dispatcher: 'Slamet Hariadi',
      courier_service: 'Pos Indonesia Express',
      tracking_number: 'POS123498721',
      notes: 'Undangan koordinasi dengan komite sekolah dikirim fisik.',
      status: 'Diterima',
      items: [
        {
          id: 'item-1',
          document_type: 'OUTGOING_LETTER',
          reference_id: 'out-let-1',
          subject: 'Undangan Pertemuan Orientasi TA 2026/2027',
          receiver_name: 'Bapak H. Subagyo (Ketua Komite)',
          delivery_status: 'Delivered',
          delivered_at: '2026-07-04T11:00:00Z',
          recipient_signature: 'https://example.com/sig/subagyo_signed.png'
        }
      ],
      created_at: '2026-07-03T08:00:00Z',
      updated_at: '2026-07-04T11:15:00Z',
      deleted_at: null,
      created_by: 'user-1',
      updated_by: 'user-1'
    }
  ],

  guestBook: [
    {
      id: 'guest-1',
      tenant_id: 'tenant-1',
      full_name: 'Drs. Supriadi, M.M.',
      institution: 'Pengawas Sekolah Madya DKI',
      phone: '08125556667',
      email: 'supriadi@dinas.go.id',
      id_card_number: '3174092205720003',
      visits: [
        {
          id: 'visit-1',
          visit_date: '2026-07-06',
          visit_time: '09:00',
          purpose: 'Supervisi Klinis Akademik Guru Fisika Kelas X',
          host_name: 'Budi Raharjo, M.Pd. (Kepala Sekolah)',
          room_or_department: 'Ruang Kepala Sekolah & Kelas X-1',
          signature_path: 'https://example.com/sig/supriadi_guest.png',
          check_out_time: '12:00'
        }
      ],
      created_at: '2026-07-06T09:00:00Z',
      updated_at: '2026-07-06T12:05:00Z',
      deleted_at: null,
      created_by: 'user-1',
      updated_by: 'user-1'
    }
  ],

  legalDocuments: [
    {
      id: 'legal-1',
      tenant_id: 'tenant-1',
      title: 'Akta Pendirian Yayasan Nusantara Bangkit',
      document_number: '04/AHU-YYS/2012',
      legal_type: 'Akta Yayasan',
      issuer: 'Notaris Wahyudi, S.H., M.Kn.',
      issue_date: '2012-04-10',
      expiration_date: '2032-04-10',
      alert_before_days: 90,
      status: 'Active',
      file_path: 'https://example.com/legal/akta_yayasan.pdf',
      versions: [
        {
          version_number: 1,
          file_path: 'https://example.com/legal/akta_yayasan_v1.pdf',
          change_summary: 'Inisiasi Akta Pendirian asli di hadapan Notaris.',
          created_at: '2012-04-10T11:00:00Z'
        }
      ],
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
      deleted_at: null,
      created_by: 'system',
      updated_by: 'system'
    },
    {
      id: 'legal-2',
      tenant_id: 'tenant-1',
      title: 'Surat Izin Operasional Sekolah Menengah Atas',
      document_number: '782/IZN-SMA/DP/2021',
      legal_type: 'Izin Operasional',
      issuer: 'Kepala Dinas Pendidikan Provinsi',
      issue_date: '2021-08-15',
      expiration_date: '2026-08-15', // Expires soon! Good for document reminder & alert demo
      alert_before_days: 60,
      status: 'Active',
      file_path: 'https://example.com/legal/izin_ops.pdf',
      versions: [
        {
          version_number: 1,
          file_path: 'https://example.com/legal/izin_ops_v1.pdf',
          change_summary: 'Penerbitan Pertama Izin Operasional 5 Tahunan.',
          created_at: '2021-08-15T09:00:00Z'
        }
      ],
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
      deleted_at: null,
      created_by: 'system',
      updated_by: 'system'
    }
  ],

  reminders: [
    {
      id: 'rem-1',
      tenant_id: 'tenant-1',
      document_type: 'LEGAL_DOC',
      document_id: 'legal-2',
      reminder_title: 'Izin Operasional SMA Segera Berakhir',
      reminder_message: 'Masa berlaku Surat Izin Operasional Sekolah (782/IZN-SMA/DP/2021) akan berakhir pada 15 Agustus 2026. Mohon segera siapkan berkas pengajuan akreditasi ulang ke dinas terkait.',
      reminder_date: '2026-07-15',
      is_sent: false,
      frequency: 'DAILY',
      created_at: '2026-07-06T22:30:00Z',
      updated_at: '2026-07-06T22:30:00Z',
      deleted_at: null,
      created_by: 'user-1',
      updated_by: 'user-1'
    }
  ],

  letterSequences: {
    'tenant-1': 3,
    'tenant-2': 1
  },

  auditLogs: []
};

// Main Endpoint router logic delegation
export function handleOfficeActions(
  action: string,
  req: any,
  res: any,
  tenantId: string,
  authUser: any,
  username: string,
  role: string,
  logActivity: any,
  mainDB: any
) {
  const currentTimestamp = new Date().toISOString();

  // Helper helper to audit
  const auditDoc = (actType: string, details: string) => {
    OfficeDB.auditLogs.unshift({
      id: `audit-tu-${Date.now()}`,
      tenant_id: tenantId,
      activity_type: actType,
      actor_name: authUser.name || username,
      actor_role: role,
      details,
      created_at: currentTimestamp
    });
    // Write also to global audit logs
    logActivity(tenantId, authUser.id, username, role, actType, 'Tata Usaha', details);
  };

  switch (action) {
    case 'officeDashboard': {
      const incoming = OfficeDB.incomingLetters.filter(l => l.tenant_id === tenantId && l.deleted_at === null);
      const outgoing = OfficeDB.outgoingLetters.filter(l => l.tenant_id === tenantId && l.deleted_at === null);
      const dispositions = OfficeDB.dispositions.filter(d => d.tenant_id === tenantId && d.deleted_at === null);
      const archives = OfficeDB.archives.filter(a => a.tenant_id === tenantId && a.deleted_at === null);
      const legals = OfficeDB.legalDocuments.filter(ld => ld.tenant_id === tenantId && ld.deleted_at === null);
      const guests = OfficeDB.guestBook.filter(g => g.tenant_id === tenantId && g.deleted_at === null);
      const activeReminders = OfficeDB.reminders.filter(r => r.tenant_id === tenantId && !r.is_sent);

      // Sinyal integrasi dengan modul keuangan, PPDB, dll.
      const financePayments = mainDB.feePayments?.filter((p: any) => p.tenant_id === tenantId) || [];
      const ppdbApplicants = mainDB.ppdbApplicants?.filter((p: any) => p.tenant_id === tenantId) || [];
      
      const dashboardStats = {
        totalIncoming: incoming.length,
        totalOutgoing: outgoing.length,
        totalDispositions: dispositions.length,
        totalArchives: archives.length,
        totalLegals: legals.length,
        totalGuests: guests.length,
        pendingDispositions: dispositions.filter(d => d.status === 'Pending' || d.status === 'In Progress').length,
        expiredSoonDocs: legals.filter(ld => ld.status === 'Active' && ld.expiration_date && (new Date(ld.expiration_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24) < 60).length,
        activeRemindersCount: activeReminders.length,
        integrationMetrics: {
          financeTransactionsCount: financePayments.length,
          ppdbStudentsCount: ppdbApplicants.length
        }
      };

      return res.json({ success: true, message: 'Success', data: dashboardStats });
    }

    case 'incomingLetterList': {
      const list = OfficeDB.incomingLetters.filter(l => l.tenant_id === tenantId && l.deleted_at === null);
      return res.json({ success: true, message: 'Success', data: list });
    }

    case 'incomingLetterCreate': {
      const data = req.body;
      const index = OfficeDB.letterSequences[tenantId] || 1;
      const agendaNumber = `ASM-${new Date().getFullYear()}-${String(index).padStart(4, '0')}`;
      OfficeDB.letterSequences[tenantId] = index + 1;

      const newLetter: IncomingLetter = {
        id: `inc-let-${Date.now()}`,
        tenant_id: tenantId,
        letter_number: data.letter_number || '000/SURAT/MASUK',
        agenda_number: agendaNumber,
        letter_date: data.letter_date || new Date().toISOString().split('T')[0],
        received_date: data.received_date || new Date().toISOString().split('T')[0],
        sender: data.sender || 'Pengirim Tidak Diketahui',
        receiver: data.receiver || 'Kepala Sekolah',
        subject: data.subject || 'Perihal Surat',
        category_id: data.category_id || 'cat-general',
        letter_type: 'Surat Masuk',
        summary: data.summary || '',
        confidentiality: data.confidentiality || 'BIASA',
        urgency: data.urgency || 'BIASA',
        status: 'Pending',
        file_path: data.file_path || '',
        version: 1,
        created_at: currentTimestamp,
        updated_at: currentTimestamp,
        deleted_at: null,
        created_by: authUser.id,
        updated_by: authUser.id
      };

      OfficeDB.incomingLetters.unshift(newLetter);
      auditDoc('CREATE_LETTER', `Mencatat Surat Masuk baru dengan nomor agenda: ${agendaNumber}`);
      return res.json({ success: true, message: 'Surat masuk berhasil disimpan', data: newLetter });
    }

    case 'incomingLetterUpdate': {
      const data = req.body;
      const idx = OfficeDB.incomingLetters.findIndex(l => l.id === data.id && l.tenant_id === tenantId);
      if (idx === -1) {
        return res.json({ success: false, message: 'Surat masuk tidak ditemukan' });
      }

      const original = OfficeDB.incomingLetters[idx];
      OfficeDB.incomingLetters[idx] = {
        ...original,
        ...data,
        version: original.version + 1,
        updated_at: currentTimestamp,
        updated_by: authUser.id
      };

      auditDoc('UPDATE_LETTER', `Mengubah informasi Surat Masuk: ${original.agenda_number} ke versi ${original.version + 1}`);
      return res.json({ success: true, message: 'Surat masuk berhasil diperbarui', data: OfficeDB.incomingLetters[idx] });
    }

    case 'incomingLetterDelete': {
      const { id } = req.body;
      const idx = OfficeDB.incomingLetters.findIndex(l => l.id === id && l.tenant_id === tenantId);
      if (idx === -1) {
        return res.json({ success: false, message: 'Surat tidak ditemukan' });
      }
      OfficeDB.incomingLetters[idx].deleted_at = currentTimestamp;
      auditDoc('DELETE_LETTER', `Menghapus secara soft-delete Surat Masuk: ${OfficeDB.incomingLetters[idx].agenda_number}`);
      return res.json({ success: true, message: 'Surat masuk berhasil dihapus' });
    }

    case 'bulletinList': {
      const list = OfficeDB.bulletins.filter(b => b.tenant_id === tenantId && b.deleted_at === null);
      return res.json({ success: true, message: 'Success', data: list });
    }

    case 'bulletinCreate': {
      const data = req.body;
      const newBulletin = {
        id: `bulletin-${Date.now()}`,
        tenant_id: tenantId,
        title: data.title || 'Pengumuman Baru',
        category: data.category || 'INFO',
        priority: data.priority || 'NORMAL',
        content: data.content || '',
        published_at: data.published_at || new Date().toISOString(),
        published_by: data.published_by || username,
        is_active: data.is_active !== undefined ? data.is_active : true,
        created_at: currentTimestamp,
        updated_at: currentTimestamp,
        deleted_at: null,
      };
      OfficeDB.bulletins.unshift(newBulletin);
      auditDoc('CREATE_BULLETIN', `Membuat pengumuman: ${newBulletin.title}`);
      return res.json({ success: true, message: 'Pengumuman berhasil dibuat', data: newBulletin });
    }

    case 'templateList': {
      const list = OfficeDB.letterTemplates.filter(t => (t.tenant_id === tenantId || t.tenant_id === 'SYSTEM') && t.deleted_at === null);
      return res.json({ success: true, message: 'Success', data: list });
    }

    case 'templateCreate': {
      const data = req.body;
      const newTemplate = {
        id: `TMP-CUST-${Date.now()}`,
        tenant_id: tenantId,
        code: data.code || `TMP-CUSTOM-${Date.now()}`,
        name: data.name || 'Surat Custom',
        letter_type: data.letter_type || 'SURAT_KETERANGAN',
        number_format: data.number_format || '',
        content_template: data.content_template || '',
        variables: data.variables || [],
        created_at: currentTimestamp,
        updated_at: currentTimestamp,
        deleted_at: null,
        created_by: authUser.id,
        updated_by: authUser.id,
        category: data.category || 'SURAT_KETERANGAN',
        signatory_role: data.signatory_role || '',
        signatory_name: data.signatory_name || '',
        is_active: true,
      };
      OfficeDB.letterTemplates.unshift(newTemplate);
      auditDoc('CREATE_TEMPLATE', `Membuat template surat baru: ${newTemplate.name}`);
      return res.json({ success: true, message: 'Template berhasil dibuat', data: newTemplate });
    }
    
    case 'templateUpdate': {
      const data = req.body;
      const idx = OfficeDB.letterTemplates.findIndex(t => t.id === data.id && (t.tenant_id === tenantId || t.tenant_id === 'SYSTEM'));
      if (idx === -1) {
        return res.json({ success: false, message: 'Template tidak ditemukan' });
      }
      OfficeDB.letterTemplates[idx] = {
        ...OfficeDB.letterTemplates[idx],
        ...data,
        updated_at: currentTimestamp,
        updated_by: authUser.id
      };
      auditDoc('UPDATE_TEMPLATE', `Mengubah template surat: ${OfficeDB.letterTemplates[idx].name}`);
      return res.json({ success: true, message: 'Template berhasil diperbarui', data: OfficeDB.letterTemplates[idx] });
    }

    case 'templateDelete': {
      const { id } = req.body;
      const idx = OfficeDB.letterTemplates.findIndex(t => t.id === id && (t.tenant_id === tenantId || t.tenant_id === 'SYSTEM'));
      if (idx === -1) {
        return res.json({ success: false, message: 'Template tidak ditemukan' });
      }
      OfficeDB.letterTemplates[idx].deleted_at = currentTimestamp;
      auditDoc('DELETE_TEMPLATE', `Menghapus template surat: ${OfficeDB.letterTemplates[idx].name}`);
      return res.json({ success: true, message: 'Template berhasil dihapus' });
    }

    case 'outgoingLetterList': {
      const list = OfficeDB.outgoingLetters.filter(l => l.tenant_id === tenantId && l.deleted_at === null);
      return res.json({ success: true, message: 'Success', data: list });
    }

    case 'outgoingLetterCreate': {
      const data = req.body;
      
      if (data.sub_action === 'generate_ai_letter') {
        const seqIndex = OfficeDB.letterSequences[tenantId] || 1;
        OfficeDB.letterSequences[tenantId] = seqIndex + 1;
        const monthRoman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][new Date().getMonth()];
        const year = new Date().getFullYear();
        const generatedNo = `${String(seqIndex).padStart(3, '0')}/SK-AKT/SMA-UN/${monthRoman}/${year}`;

        let subjectStr = 'SURAT KETERANGAN AKTIF SANTRI';
        let contentStr = '';

        if (data.letter_type_code === 'SURAT_KETERANGAN_AKTIF') {
          const s = data.student_data || { name: 'Muhammad Ahmad Syahputra', nis: '20260101', nisn: '0089123456', classroom_name: 'Kelas X IPA 1', dorm_name: 'Asrama Al-Ghazali', parent_name: 'H. Abdul Rahman', address: 'Bandung' };
          subjectStr = 'SURAT KETERANGAN AKTIF SANTRI / SISWA';
          contentStr = `Yang bertanda tangan di bawah ini ${data.signatory_role || 'Kepala Sekolah SMA Pesantren Islam Terpadu'} menerangkan dengan sebenarnya bahwa:

Nama Lengkap       : ${s.name}
NIS / NISN         : ${s.nis} / ${s.nisn || '0089123456'}
Kelas / Rombel     : ${s.classroom_name || 'Kelas X IPA 1'}
Asrama Santri      : ${s.dorm_name || 'Gedung Asrama Al-Ghazali'}
Nama Orang Tua/Wali: ${s.parent_name || 'Wali Santri'}
Alamat Domisili    : ${s.address || 'Bandung'}

Adalah benar-benar santri/siswa aktif yang terdaftar pada Tahun Ajaran 2026/2027 di lembaga kami dan berpraktik kelakuan baik serta taat pada tata tertib kesantriaan.

Surat Keterangan ini diterbitkan atas permohonan yang bersangkutan untuk keperluan: ${data.purpose_context || 'Persyaratan Beasiswa'}.

Demikian surat keterangan ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.`;
        } else if (data.letter_type_code === 'SURAT_TUGAS_GURU') {
          const t = data.teacher_data || { name: 'Ust. H. Abdullah Faqih, M.Pd.', nip: '19850101-2026', position: 'Guru Utama', unit: 'SMA Pesantren' };
          subjectStr = 'SURAT TUGAS PENGABDIAN & PELATIHAN';
          contentStr = `Pimpinan Pondok Pesantren Islam Terpadu memberikan Tugas Resmi kepada:

Nama Pengabdi / Guru : ${t.name}
NIP / NUPTK           : ${t.nip}
Jabatan Akademik     : ${t.position || 'Guru Utama'}
Unit Tugas           : ${t.unit || 'SMA Pesantren Islam Terpadu'}

Untuk melaksanakan tugas sebagai pelaksana/peserta kegiatan: ${data.purpose_context || 'Pelatihan dan Pengabdian'}.

Pelaksanaan tugas dimulai sejak tanggal diterbitkannya Surat Tugas ini sampai dengan agenda kegiatan selesai.

Demikian Surat Tugas ini diterbitkan agar dilaksanakan dengan penuh rasa tanggung jawab dan keikhlasan.`;
        } else {
          subjectStr = 'SURAT RESMI INSTANSI YAYASAN';
          contentStr = `Naskah resmi diterbitkan oleh ${data.signatory_name || 'Kepala Sekolah'} perihal: ${data.purpose_context || 'Surat Dinas'}. Dibuat berdasarkan database resmi aplikasi.`;
        }

        auditDoc('GENERATE_AI_LETTER', `Membuat naskah surat AI otomatis perihal: ${subjectStr}`);
        return res.json({
          success: true,
          message: 'Draf surat AI berhasil digenerate berdasarkan data aplikasi',
          data: {
            letter_number: generatedNo,
            subject: subjectStr,
            summary: contentStr,
            content: contentStr
          }
        });
      }

      const seqIndex = OfficeDB.letterSequences[tenantId] || 1;
      const agendaNumber = `ASK-${new Date().getFullYear()}-${String(seqIndex).padStart(4, '0')}`;
      
      // Auto generating letter number if format and template is defined
      let finalLetterNum = data.letter_number;
      if (!finalLetterNum) {
        finalLetterNum = `${String(seqIndex).padStart(3, '0')}/TU/SMA-UN/${new Date().getMonth() + 1}/${new Date().getFullYear()}`;
      }
      OfficeDB.letterSequences[tenantId] = seqIndex + 1;

      // Digital Signature & QR code generator mocks if ready/signed
      const qr_code_hash = data.is_draft ? '' : `VERIFIED_QR_HASH_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const newOut: OutgoingLetter = {
        id: `out-let-${Date.now()}`,
        tenant_id: tenantId,
        letter_number: finalLetterNum,
        agenda_number: agendaNumber,
        letter_date: data.letter_date || new Date().toISOString().split('T')[0],
        sender: data.sender || 'Kepala Tata Usaha',
        destination: data.destination || 'Tujuan Surat',
        subject: data.subject || 'Perihal',
        category_id: data.category_id || 'cat-general',
        letter_type: data.letter_type || 'Surat Keluar',
        summary: data.summary || '',
        confidentiality: data.confidentiality || 'BIASA',
        urgency: data.urgency || 'BIASA',
        is_draft: data.is_draft !== undefined ? data.is_draft : true,
        file_path: data.file_path || '',
        qr_code_hash,
        version: 1,
        created_at: currentTimestamp,
        updated_at: currentTimestamp,
        deleted_at: null,
        created_by: authUser.id,
        updated_by: authUser.id
      };

      OfficeDB.outgoingLetters.unshift(newOut);
      auditDoc('CREATE_OUTGOING_LETTER', `Mencatat Surat Keluar ${data.is_draft ? 'DRAF' : 'RESMI'} dengan nomor agenda: ${agendaNumber}`);
      return res.json({ success: true, message: 'Surat keluar berhasil dibuat', data: newOut });
    }

    case 'outgoingLetterUpdate': {
      const data = req.body;
      const idx = OfficeDB.outgoingLetters.findIndex(l => l.id === data.id && l.tenant_id === tenantId);
      if (idx === -1) {
        return res.json({ success: false, message: 'Surat keluar tidak ditemukan' });
      }

      const original = OfficeDB.outgoingLetters[idx];
      
      // If converting from draft to signed, auto generate QR authenticity stamp
      let qr = original.qr_code_hash;
      if (original.is_draft && !data.is_draft) {
        qr = `VERIFIED_QR_HASH_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      }

      OfficeDB.outgoingLetters[idx] = {
        ...original,
        ...data,
        qr_code_hash: qr,
        version: original.version + 1,
        updated_at: currentTimestamp,
        updated_by: authUser.id
      };

      auditDoc('UPDATE_OUTGOING_LETTER', `Mengubah informasi Surat Keluar: ${original.agenda_number} ke versi ${original.version + 1}`);
      return res.json({ success: true, message: 'Surat keluar berhasil diperbarui', data: OfficeDB.outgoingLetters[idx] });
    }

    case 'letterNumberGenerate': {
      const { template_code } = req.body;
      const template = OfficeDB.letterTemplates.find(t => t.code === template_code && t.tenant_id === tenantId);
      if (!template) {
        return res.json({ success: false, message: 'Template tidak ditemukan' });
      }

      const seq = OfficeDB.letterSequences[tenantId] || 1;
      const monthRoman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][new Date().getMonth()];
      const year = new Date().getFullYear();

      const generatedNo = template.number_format
        .replace('{seq}', String(seq).padStart(3, '0'))
        .replace('{month}', String(new Date().getMonth() + 1).padStart(2, '0'))
        .replace('{month-roman}', monthRoman)
        .replace('{year}', String(year));

      return res.json({ success: true, message: 'Success', data: { number: generatedNo, sequence: seq } });
    }

    case 'letterTemplateList': {
      const list = OfficeDB.letterTemplates.filter(t => t.tenant_id === tenantId && t.deleted_at === null);
      return res.json({ success: true, message: 'Success', data: list });
    }

    case 'letterTemplateSave': {
      const data = req.body;
      let template;
      if (data.id) {
        const idx = OfficeDB.letterTemplates.findIndex(t => t.id === data.id && t.tenant_id === tenantId);
        if (idx !== -1) {
          OfficeDB.letterTemplates[idx] = {
            ...OfficeDB.letterTemplates[idx],
            ...data,
            updated_at: currentTimestamp,
            updated_by: authUser.id
          };
          template = OfficeDB.letterTemplates[idx];
          auditDoc('UPDATE_TEMPLATE', `Mengubah draf template surat: ${template.name}`);
        }
      } else {
        template = {
          id: `tmpl-${Date.now()}`,
          tenant_id: tenantId,
          name: data.name || 'Template Surat Baru',
          code: data.code || `TMP-${Date.now().toString(36).toUpperCase()}`,
          letter_type: data.letter_type || 'Surat Undangan',
          number_format: data.number_format || '{seq}/TU/SMA-UN/{year}',
          content_template: data.content_template || '',
          variables: data.variables || [],
          created_at: currentTimestamp,
          updated_at: currentTimestamp,
          deleted_at: null,
          created_by: authUser.id,
          updated_by: authUser.id
        };
        OfficeDB.letterTemplates.push(template);
        auditDoc('CREATE_TEMPLATE', `Membuat draf template surat baru: ${template.name}`);
      }

      return res.json({ success: true, message: 'Template berhasil disimpan', data: template });
    }

    case 'dispositionCreate': {
      const data = req.body;
      const newDisp: Disposition = {
        id: `disp-${Date.now()}`,
        tenant_id: tenantId,
        incoming_letter_id: data.incoming_letter_id,
        disposition_date: data.disposition_date || new Date().toISOString().split('T')[0],
        instruction: data.instruction || 'Tindak lanjuti segera.',
        sender_id: authUser.id,
        status: 'Pending',
        urgency: data.urgency || 'BIASA',
        receivers: data.receivers || [],
        created_at: currentTimestamp,
        updated_at: currentTimestamp,
        deleted_at: null,
        created_by: authUser.id,
        updated_by: authUser.id
      };

      OfficeDB.dispositions.unshift(newDisp);

      // Update incoming letter status to Disposed
      const letIdx = OfficeDB.incomingLetters.findIndex(l => l.id === data.incoming_letter_id && l.tenant_id === tenantId);
      if (letIdx !== -1) {
        OfficeDB.incomingLetters[letIdx].status = 'Disposed';
      }

      auditDoc('DISPOSITION_CREATE', `Membuat disposisi instruksi kepada ${newDisp.receivers.map(r => r.receiver_role).join(', ')}`);
      return res.json({ success: true, message: 'Disposisi berhasil diteruskan', data: newDisp });
    }

    case 'dispositionUpdate': {
      const { id, receiver_role, status, notes } = req.body;
      const idx = OfficeDB.dispositions.findIndex(d => d.id === id && d.tenant_id === tenantId);
      if (idx === -1) {
        return res.json({ success: false, message: 'Disposisi tidak ditemukan' });
      }

      const disp = OfficeDB.dispositions[idx];
      const rIdx = disp.receivers.findIndex(r => r.receiver_role === receiver_role);
      if (rIdx !== -1) {
        disp.receivers[rIdx].status = status;
        disp.receivers[rIdx].notes = notes;
      }

      // Check if all are completed
      const allCompleted = disp.receivers.every(r => r.status === 'Completed');
      if (allCompleted) {
        disp.status = 'Completed';
      } else {
        disp.status = 'In Progress';
      }

      disp.updated_at = currentTimestamp;
      disp.updated_by = authUser.id;

      auditDoc('DISPOSITION_RESPOND', `Menerima respon disposisi ${receiver_role} dengan status: ${status}`);
      return res.json({ success: true, message: 'Tindak lanjut disposisi berhasil dilaporkan', data: disp });
    }

    case 'archiveList': {
      const list = OfficeDB.archives.filter(a => a.tenant_id === tenantId && a.deleted_at === null);
      return res.json({ success: true, message: 'Success', data: list });
    }

    case 'archiveStore': {
      const data = req.body;
      const newArch: DocumentArchive = {
        id: `arch-${Date.now()}`,
        tenant_id: tenantId,
        title: data.title || 'Arsip Digital Baru',
        archive_number: data.archive_number || `ARC-${Date.now().toString(36).toUpperCase()}`,
        document_id: data.document_id,
        document_type_code: data.document_type_code || 'OTHER',
        box_number: data.box_number || 'BOX-TEMPORARY',
        shelf_position: data.shelf_position || 'A-1',
        archive_status: data.archive_status || 'Active',
        retention_period_years: data.retention_period_years || 5,
        is_digital: data.is_digital !== undefined ? data.is_digital : true,
        file_path: data.file_path || '',
        notes: data.notes || '',
        created_at: currentTimestamp,
        updated_at: currentTimestamp,
        deleted_at: null,
        created_by: authUser.id,
        updated_by: authUser.id
      };

      OfficeDB.archives.unshift(newArch);
      auditDoc('ARCHIVE_STORE', `Mengarsipkan dokumen: "${newArch.title}" ke dalam lokasi fisik ${newArch.box_number}`);
      return res.json({ success: true, message: 'Arsip dokumen berhasil disimpan', data: newArch });
    }

    case 'guestBook': {
      // Handles listing and register check ins/outs
      const subAction = req.body.sub_action;
      
      if (subAction === 'checkin') {
        const { full_name, institution, phone, email, id_card_number, purpose, host_name, room_or_department } = req.body;
        
        let guest = OfficeDB.guestBook.find(g => g.id_card_number === id_card_number && g.tenant_id === tenantId);
        if (!guest) {
          guest = {
            id: `guest-${Date.now()}`,
            tenant_id: tenantId,
            full_name,
            institution,
            phone,
            email,
            id_card_number,
            visits: [],
            created_at: currentTimestamp,
            updated_at: currentTimestamp,
            deleted_at: null,
            created_by: authUser.id,
            updated_by: authUser.id
          };
          OfficeDB.guestBook.unshift(guest);
        }

        const visit = {
          id: `visit-${Date.now()}`,
          visit_date: new Date().toISOString().split('T')[0],
          visit_time: new Date().toTimeString().split(' ')[0].substr(0, 5),
          purpose,
          host_name,
          room_or_department,
          signature_path: 'https://example.com/sig/signature_draw.png'
        };

        guest.visits.unshift(visit);
        auditDoc('GUEST_CHECKIN', `Menerima tamu baru: ${full_name} dari ${institution}`);
        return res.json({ success: true, message: 'Buku Tamu Check-in Sukses', data: guest });
      }

      if (subAction === 'checkout') {
        const { guest_id, visit_id } = req.body;
        const guest = OfficeDB.guestBook.find(g => g.id === guest_id && g.tenant_id === tenantId);
        if (guest) {
          const visit = guest.visits.find(v => v.id === visit_id);
          if (visit) {
            visit.check_out_time = new Date().toTimeString().split(' ')[0].substr(0, 5);
            auditDoc('GUEST_CHECKOUT', `Tamu ${guest.full_name} check-out berhasil.`);
            return res.json({ success: true, message: 'Checkout berhasil diperbarui', data: guest });
          }
        }
        return res.json({ success: false, message: 'Data kunjungan tidak ditemukan' });
      }

      // Default: list all guests
      const list = OfficeDB.guestBook.filter(g => g.tenant_id === tenantId && g.deleted_at === null);
      return res.json({ success: true, message: 'Success', data: list });
    }

    case 'expeditionBook': {
      const subAction = req.body.sub_action;
      
      if (subAction === 'dispatch') {
        const { dispatcher, courier_service, tracking_number, items, notes } = req.body;
        const newExp: Expedition = {
          id: `exp-${Date.now()}`,
          tenant_id: tenantId,
          expedition_number: `EXP-${new Date().getFullYear()}-${String(OfficeDB.expeditions.length + 1).padStart(4, '0')}`,
          dispatch_date: new Date().toISOString().split('T')[0],
          dispatcher,
          courier_service,
          tracking_number,
          notes,
          status: 'Dalam Perjalanan',
          items: items || [],
          created_at: currentTimestamp,
          updated_at: currentTimestamp,
          deleted_at: null,
          created_by: authUser.id,
          updated_by: authUser.id
        };

        OfficeDB.expeditions.unshift(newExp);
        auditDoc('EXPEDITION_DISPATCH', `Membuat entri Buku Ekspedisi pengiriman: ${newExp.expedition_number}`);
        return res.json({ success: true, message: 'Pengiriman ekspedisi berhasil dicatat', data: newExp });
      }

      if (subAction === 'deliver') {
        const { expedition_id, item_id, recipient_signature } = req.body;
        const exp = OfficeDB.expeditions.find(e => e.id === expedition_id && e.tenant_id === tenantId);
        if (exp) {
          const item = exp.items.find(i => i.id === item_id);
          if (item) {
            item.delivery_status = 'Delivered';
            item.delivered_at = currentTimestamp;
            item.recipient_signature = recipient_signature || 'Signed';
            
            // If all items delivered, update main status
            const allDelivered = exp.items.every(i => i.delivery_status === 'Delivered');
            if (allDelivered) {
              exp.status = 'Diterima';
            }

            auditDoc('EXPEDITION_DELIVER', `Surat tujuan ${item.receiver_name} diterima.`);
            return res.json({ success: true, message: 'Tanda terima kurir berhasil disimpan', data: exp });
          }
        }
        return res.json({ success: false, message: 'Ekspedisi tidak ditemukan' });
      }

      const list = OfficeDB.expeditions.filter(e => e.tenant_id === tenantId && e.deleted_at === null);
      return res.json({ success: true, message: 'Success', data: list });
    }

    case 'legalDocument': {
      const subAction = req.body.sub_action;

      if (subAction === 'save') {
        const data = req.body;
        let doc;
        if (data.id) {
          const idx = OfficeDB.legalDocuments.findIndex(ld => ld.id === data.id && ld.tenant_id === tenantId);
          if (idx !== -1) {
            const original = OfficeDB.legalDocuments[idx];
            const versionNum = original.versions.length + 1;
            original.versions.unshift({
              version_number: versionNum,
              file_path: data.file_path || original.file_path || '',
              change_summary: data.change_summary || `Pembaruan dokumen versi ${versionNum}`,
              created_at: currentTimestamp
            });

            OfficeDB.legalDocuments[idx] = {
              ...original,
              ...data,
              versions: original.versions,
              updated_at: currentTimestamp,
              updated_by: authUser.id
            };
            doc = OfficeDB.legalDocuments[idx];
            auditDoc('LEGAL_UPDATE', `Memperbarui dokumen legal: ${doc.title} ke versi ${versionNum}`);
          }
        } else {
          doc = {
            id: `legal-${Date.now()}`,
            tenant_id: tenantId,
            title: data.title || 'Dokumen Legal Baru',
            document_number: data.document_number || '000/LEGAL/NUSA',
            legal_type: data.legal_type || 'SK Kemenkumham',
            issuer: data.issuer || 'Instansi Pemerintah',
            issue_date: data.issue_date || new Date().toISOString().split('T')[0],
            expiration_date: data.expiration_date,
            alert_before_days: data.alert_before_days || 30,
            status: 'Active',
            file_path: data.file_path || '',
            versions: [
              {
                version_number: 1,
                file_path: data.file_path || '',
                change_summary: 'Inisiasi / Penerbitan dokumen legal pertama kali.',
                created_at: currentTimestamp
              }
            ],
            created_at: currentTimestamp,
            updated_at: currentTimestamp,
            deleted_at: null,
            created_by: authUser.id,
            updated_by: authUser.id
          };
          OfficeDB.legalDocuments.unshift(doc);

          // Auto-schedule background document reminder if expiration date exists
          if (doc.expiration_date) {
            const expDateObj = new Date(doc.expiration_date);
            const alertDays = doc.alert_before_days;
            const remindDateObj = new Date(expDateObj.getTime() - alertDays * 24 * 3600 * 1000);

            OfficeDB.reminders.push({
              id: `rem-${Date.now()}`,
              tenant_id: tenantId,
              document_type: 'LEGAL_DOC',
              document_id: doc.id,
              reminder_title: `Masa Berlaku ${doc.legal_type} Berakhir`,
              reminder_message: `Peringatan! Dokumen "${doc.title}" dengan No. ${doc.document_number} akan kedaluwarsa pada ${doc.expiration_date}. Silakan lakukan perpanjangan.`,
              reminder_date: remindDateObj.toISOString().split('T')[0],
              is_sent: false,
              frequency: 'ONCE',
              created_at: currentTimestamp,
              updated_at: currentTimestamp,
              deleted_at: null,
              created_by: authUser.id,
              updated_by: authUser.id
            });
          }

          auditDoc('LEGAL_CREATE', `Mencatat Dokumen Legal Baru: ${doc.title}`);
        }
        return res.json({ success: true, message: 'Dokumen legal berhasil disimpan', data: doc });
      }

      if (subAction === 'verify_qr') {
        const { qr_hash } = req.body;
        // Verify from outgoing or legal doc
        const outgoingMatch = OfficeDB.outgoingLetters.find(o => o.qr_code_hash === qr_hash && o.tenant_id === tenantId);
        
        if (outgoingMatch) {
          auditDoc('QR_VERIFIED', `Dokumen keluar verified via QR: "${outgoingMatch.subject}"`);
          return res.json({
            success: true,
            is_valid: true,
            message: 'Dokumen SAH dan Terverifikasi oleh Sistem Yayasan',
            data: {
              document_number: outgoingMatch.letter_number,
              subject: outgoingMatch.subject,
              sender: outgoingMatch.sender,
              destination: outgoingMatch.destination,
              signed_at: outgoingMatch.updated_at
            }
          });
        }

        return res.json({ success: false, is_valid: false, message: 'Spesimen QR Code tidak terdaftar atau dokumen tidak valid!' });
      }

      const list = OfficeDB.legalDocuments.filter(ld => ld.tenant_id === tenantId && ld.deleted_at === null);
      return res.json({ success: true, message: 'Success', data: list });
    }

    case 'documentReminder': {
      const subAction = req.body.sub_action;
      
      if (subAction === 'send_now') {
        const { reminder_id } = req.body;
        const rem = OfficeDB.reminders.find(r => r.id === reminder_id && r.tenant_id === tenantId);
        if (rem) {
          rem.is_sent = true;
          rem.sent_at = currentTimestamp;
          auditDoc('REMINDER_SEND', `Mengirimkan notifikasi reminder dokumen secara manual: ${rem.reminder_title}`);
          return res.json({ success: true, message: 'Pengingat berhasil dikirim secara realtime!', data: rem });
        }
        return res.json({ success: false, message: 'Pengingat tidak ditemukan' });
      }

      const list = OfficeDB.reminders.filter(r => r.tenant_id === tenantId && r.deleted_at === null);
      return res.json({ success: true, message: 'Success', data: list });
    }

    case 'workflowStepsGet': {
      return res.json({ success: true, data: OfficeDB.workflows });
    }

    case 'workflowStepsUpdate': {
      const { steps } = req.body;
      if (steps && Array.isArray(steps)) {
        OfficeDB.workflows = steps;
        auditDoc('WORKFLOW_UPDATE', `Mengupdate konfigurasi alur kerja (workflow) surat`);
        return res.json({ success: true, message: 'Alur kerja berhasil disimpan', data: OfficeDB.workflows });
      }
      return res.json({ success: false, message: 'Data tidak valid' });
    }

    case 'approvalStagesGet': {
      return res.json({ success: true, data: OfficeDB.approvalStages });
    }

    case 'approvalStagesUpdate': {
      const { stages } = req.body;
      if (stages && Array.isArray(stages)) {
        OfficeDB.approvalStages = stages;
        auditDoc('APPROVAL_STAGE_UPDATE', `Mengupdate hierarki persetujuan (approval stages) surat`);
        return res.json({ success: true, message: 'Hierarki persetujuan berhasil disimpan', data: OfficeDB.approvalStages });
      }
      return res.json({ success: false, message: 'Data tidak valid' });
    }

    case 'digitalSignatureCreate': {
      const { letter_id, signer_name, signer_role, signature_hash } = req.body;
      const newSig = {
        id: `sig-${Date.now()}`,
        letter_id,
        signer_name,
        signer_role,
        signature_hash,
        timestamp: currentTimestamp,
        qr_code_path: `/verify-signature/${letter_id}`
      };
      OfficeDB.digitalSignatures.unshift(newSig);
      auditDoc('SIGNATURE_CREATE', `Tanda tangan digital dibubuhkan oleh ${signer_name} (${signer_role})`);

      // Update letter status to SIGNED
      const letIdx = OfficeDB.outgoingLetters.findIndex(l => l.id === letter_id && l.tenant_id === tenantId);
      if (letIdx !== -1) {
        (OfficeDB.outgoingLetters[letIdx] as any).status = 'SIGNED';
        OfficeDB.outgoingLetters[letIdx].qr_code_hash = signature_hash;
      } else {
        const letIncIdx = OfficeDB.incomingLetters.findIndex(l => l.id === letter_id && l.tenant_id === tenantId);
        if (letIncIdx !== -1) {
          (OfficeDB.incomingLetters[letIncIdx] as any).status = 'SIGNED';
        }
      }

      return res.json({ success: true, message: 'Tanda tangan berhasil disimpan', data: newSig });
    }

    case 'digitalSignatureVerify': {
      const { hash } = req.body;
      const sig = OfficeDB.digitalSignatures.find(s => s.signature_hash === hash);
      if (sig) {
        // Find corresponding letter
        const letter = OfficeDB.outgoingLetters.find(l => l.id === sig.letter_id) || 
                       OfficeDB.incomingLetters.find(l => l.id === sig.letter_id);
        return res.json({
          success: true,
          verified: true,
          data: {
            signature: sig,
            letter
          }
        });
      }
      return res.json({ success: true, verified: false, message: 'Tanda tangan digital tidak terdaftar atau tidak sah' });
    }

    case 'letterHistory': {
      // Return list of audit logs for letters
      const list = OfficeDB.auditLogs.filter(a => a.tenant_id === tenantId);
      return res.json({ success: true, data: list });
    }

    case 'documentAnalytics': {
      // Analytical breakdowns
      const incoming = OfficeDB.incomingLetters.filter(l => l.tenant_id === tenantId && l.deleted_at === null);
      const outgoing = OfficeDB.outgoingLetters.filter(l => l.tenant_id === tenantId && l.deleted_at === null);
      const dispositions = OfficeDB.dispositions.filter(d => d.tenant_id === tenantId && d.deleted_at === null);
      const legals = OfficeDB.legalDocuments.filter(ld => ld.tenant_id === tenantId && ld.deleted_at === null);

      const analytics = {
        letterGrowth: [
          { month: 'Jan', Incoming: 10, Outgoing: 8 },
          { month: 'Feb', Incoming: 15, Outgoing: 12 },
          { month: 'Mar', Incoming: 14, Outgoing: 18 },
          { month: 'Apr', Incoming: 22, Outgoing: 25 },
          { month: 'Mei', Incoming: 28, Outgoing: 20 },
          { month: 'Jun', Incoming: incoming.length + 12, Outgoing: outgoing.length + 15 },
        ],
        letterTypeDistribution: [
          { name: 'Surat Masuk', value: incoming.length },
          { name: 'Surat Keputusan', value: outgoing.filter(o => o.letter_type === 'Surat Keputusan').length },
          { name: 'Surat Undangan', value: outgoing.filter(o => o.letter_type === 'Surat Undangan').length },
          { name: 'Surat Tugas', value: outgoing.filter(o => o.letter_type === 'Surat Tugas').length },
          { name: 'Lainnya', value: outgoing.filter(o => !['Surat Keputusan', 'Surat Undangan', 'Surat Tugas'].includes(o.letter_type)).length },
        ],
        dispositionStatus: [
          { name: 'Pending', value: dispositions.filter(d => d.status === 'Pending').length },
          { name: 'Read', value: dispositions.filter(d => d.status === 'Read').length },
          { name: 'In Progress', value: dispositions.filter(d => d.status === 'In Progress').length },
          { name: 'Completed', value: dispositions.filter(d => d.status === 'Completed').length },
          { name: 'Rejected', value: dispositions.filter(d => d.status === 'Rejected').length },
        ],
        auditLogs: OfficeDB.auditLogs.slice(0, 15) // Recent logs
      };

      return res.json({ success: true, message: 'Success', data: analytics });
    }


    case 'guestList': {
      const list = OfficeDB.guestBook.filter(g => g.tenant_id === tenantId);
      return res.json({ success: true, data: list });
    }
    case 'guestCreate': {
      const data = req.body;
      const newGuest = { ...data, id: 'GST-' + Date.now(), tenant_id: tenantId };
      OfficeDB.guestBook.unshift(newGuest);
      return res.json({ success: true, data: newGuest });
    }
    case 'meetingList': {
      const list = OfficeDB.meetings.filter(m => m.tenant_id === tenantId);
      return res.json({ success: true, data: list });
    }
    case 'requestList': {
      const list = OfficeDB.requests.filter(m => m.tenant_id === tenantId);
      return res.json({ success: true, data: list });
    }


    case 'waLogList': {
      const list = OfficeDB.waLogs.filter(w => w.tenant_id === tenantId);
      return res.json({ success: true, data: list });
    }
    case 'waLogCreate': {
      const data = req.body;
      const newLog = { ...data, id: 'WA-' + Date.now(), tenant_id: tenantId, timestamp: new Date().toISOString() };
      OfficeDB.waLogs.unshift(newLog);
      return res.json({ success: true, data: newLog });
    }
    case 'hierarchyList': {
      const list = OfficeDB.hierarchy.filter(h => h.tenant_id === tenantId);
      return res.json({ success: true, data: list });
    }
    case 'kopConfigGet': {
      const config = OfficeDB.kopConfigs[tenantId] || {};
      return res.json({ success: true, data: config });
    }
    case 'kopConfigUpdate': {
      const data = req.body;
      OfficeDB.kopConfigs[tenantId] = data;
      return res.json({ success: true, data: OfficeDB.kopConfigs[tenantId] });
    }
    case 'studentList': {
      const list = OfficeDB.students.filter(s => s.tenant_id === tenantId);
      if (list.length === 0) {
        // Return dummy if empty
        return res.json({ success: true, data: [
          { id: 'std-001', nis: '20260101', nisn: '0089123456', name: 'Muhammad Ahmad Syahputra', classroom_name: 'Kelas X IPA 1 (Tahfidz)', dorm_name: 'Asrama Al-Ghazali Lt. 2 Room 204', parent_name: 'H. Abdul Rahman, S.T.', address: 'Jl. Ahmad Yani No. 12, Bandung', status: 'Aktif' },
          { id: 'std-002', nis: '20260102', nisn: '0089123457', name: 'Aisyah Humaira Az-Zahra', classroom_name: 'Kelas XI IPA 2 (Unggulan)', dorm_name: 'Asrama Maryam Lt. 1 Room 102', parent_name: 'Dr. H. Bambang Subagyo', address: 'Jl. Soekarno Hatta No. 88, Bandung', status: 'Aktif' }
        ]});
      }
      return res.json({ success: true, data: list });
    }
    case 'teacherList': {
      const list = OfficeDB.teachers.filter(t => t.tenant_id === tenantId);
      if (list.length === 0) {
        return res.json({ success: true, data: [
          { id: 'tch-001', nip: '19850101-2026', name: 'Ust. H. Abdullah Faqih, M.Pd.', position: 'Guru Utama & Pengasuh Halqah 30 Juz', unit: 'SMA Pesantren Islam Terpadu', phone: '0812-3456-7890' },
          { id: 'tch-002', nip: '19900315-2026', name: 'Drs. H. Ahmad Dahlan, M.Pd.I.', position: 'Kepala Sekolah SMA Pesantren', unit: 'SMA Pesantren Islam Terpadu', phone: '0813-9876-5432' }
        ]});
      }
      return res.json({ success: true, data: list });
    }
    case 'requestCreate': {
      const data = req.body;
      const newRequest = { ...data, id: 'REQ-' + Date.now(), tenant_id: tenantId, request_date: new Date().toISOString(), status: 'PENDING' };
      OfficeDB.requests.unshift(newRequest);
      return res.json({ success: true, data: newRequest });
    }
    case 'requestUpdate': {
      const data = req.body;
      const idx = OfficeDB.requests.findIndex(r => r.id === data.id && r.tenant_id === tenantId);
      if (idx !== -1) {
        OfficeDB.requests[idx] = { ...OfficeDB.requests[idx], ...data, updated_at: new Date().toISOString() };
        return res.json({ success: true, data: OfficeDB.requests[idx] });
      }
      return res.json({ success: false, message: 'Not found' });
    }


    case 'dispositionList': {
      const list = OfficeDB.dispositions.filter(d => d.tenant_id === tenantId);
      return res.json({ success: true, data: list });
    }

    case 'academicAdministrationChecklistGet': {
      if (!OfficeDB.academicChecklists[tenantId]) {
        OfficeDB.academicChecklists[tenantId] = [
          { id: 'chk-1', item: 'Tahun Ajaran aktif', category: 'PERENCANAAN', status: 'Completed', pic: 'Kepala TU', updated_at: new Date().toISOString() },
          { id: 'chk-2', item: 'Kalender akademik selesai', category: 'PERENCANAAN', status: 'Completed', pic: 'Waka Kurikulum', updated_at: new Date().toISOString() },
          { id: 'chk-3', item: 'Master siswa valid', category: 'MASTER_DATA', status: 'Completed', pic: 'Operator DAPODIK', updated_at: new Date().toISOString() },
          { id: 'chk-4', item: 'Master guru valid', category: 'MASTER_DATA', status: 'Completed', pic: 'Staff TU', updated_at: new Date().toISOString() },
          { id: 'chk-5', item: 'Rombel selesai', category: 'ROMBEL', status: 'Completed', pic: 'Staff TU / Kurikulum', updated_at: new Date().toISOString() },
          { id: 'chk-6', item: 'Wali kelas ditetapkan', category: 'ROMBEL', status: 'Completed', pic: 'Kepala Sekolah', updated_at: new Date().toISOString() },
          { id: 'chk-7', item: 'Pembagian tugas selesai', category: 'PENUGASAN', status: 'In Progress', pic: 'Waka Kurikulum', updated_at: new Date().toISOString() },
          { id: 'chk-8', item: 'SK diterbitkan', category: 'DOKUMEN_SK', status: 'In Progress', pic: 'Kepala TU', updated_at: new Date().toISOString() },
          { id: 'chk-9', item: 'Surat tugas diterbitkan', category: 'DOKUMEN_SK', status: 'In Progress', pic: 'Staff TU', updated_at: new Date().toISOString() },
          { id: 'chk-10', item: 'Surat orang tua diterbitkan', category: 'KOMUNIKASI', status: 'Not Started', pic: 'Humas / TU', updated_at: new Date().toISOString() },
          { id: 'chk-11', item: 'Jadwal KBM aktif', category: 'KBM', status: 'Not Started', pic: 'Kurikulum', updated_at: new Date().toISOString() },
          { id: 'chk-12', item: 'Absensi aktif', category: 'ABSENSI', status: 'Not Started', pic: 'Guru / Wali Kelas', updated_at: new Date().toISOString() },
          { id: 'chk-13', item: 'Penilaian aktif', category: 'PENILAIAN', status: 'Not Started', pic: 'Tim Evaluasi', updated_at: new Date().toISOString() },
          { id: 'chk-14', item: 'Leger selesai', category: 'EVALUASI', status: 'Not Started', pic: 'Wali Kelas', updated_at: new Date().toISOString() },
          { id: 'chk-15', item: 'Rapor selesai', category: 'EVALUASI', status: 'Not Started', pic: 'Kepala Sekolah / Wali', updated_at: new Date().toISOString() },
          { id: 'chk-16', item: 'Arsip lengkap', category: 'KARSIPAN', status: 'Not Started', pic: 'Arsiparis TU', updated_at: new Date().toISOString() }
        ];
      }
      return res.json({ success: true, data: OfficeDB.academicChecklists[tenantId] });
    }

    case 'academicAdministrationChecklistUpdate': {
      const { id, status, pic } = req.body;
      const list = OfficeDB.academicChecklists[tenantId] || [];
      const itemIndex = list.findIndex(i => i.id === id);
      if (itemIndex !== -1) {
        list[itemIndex] = {
          ...list[itemIndex],
          ...(status && { status }),
          ...(pic && { pic }),
          updated_at: new Date().toISOString()
        };
        logActivity(tenantId, authUser?.id || 'sys', username || 'User', role || 'TU', 'UPDATE_CHECKLIST', 'Tata Usaha', `Pembaruan status checklist "${list[itemIndex].item}" menjadi ${status}`);
        return res.json({ success: true, message: 'Checklist updated', data: list[itemIndex] });
      }
      return res.json({ success: false, message: 'Item not found' });
    }

    case 'academicAdministrationWorkflowGet': {
      if (!OfficeDB.academicWorkflows[tenantId]) {
        OfficeDB.academicWorkflows[tenantId] = [
          { step: 1, title: 'Buat Tahun Ajaran', code: 'TA_CREATE', status: 'Completed', requirement: 'Database TA & Kalender', mandatory: true },
          { step: 2, title: 'Aktifkan Semester', code: 'SEMESTER_ACTIVATE', status: 'Completed', requirement: 'TA Aktif', mandatory: true },
          { step: 3, title: 'Validasi Master Data', code: 'MASTER_VALIDATE', status: 'Completed', requirement: 'Siswa, Guru, Pegawai Valid', mandatory: true },
          { step: 4, title: 'Bentuk Rombel', code: 'ROMBEL_BUILD', status: 'Completed', requirement: 'Kapasitas & Kuota Rombel', mandatory: true },
          { step: 5, title: 'Tetapkan Wali Kelas', code: 'HOMEROOM_ASSIGN', status: 'Completed', requirement: 'Guru Aktif', mandatory: true },
          { step: 6, title: 'Bagi Tugas Guru', code: 'TEACHING_LOAD_ASSIGN', status: 'In Progress', requirement: 'Mata Pelajaran & Jam', mandatory: true },
          { step: 7, title: 'Generate SK', code: 'SK_GENERATE', status: 'In Progress', requirement: 'Assignment Valid', mandatory: true },
          { step: 8, title: 'Generate Surat Tugas', code: 'DUTY_LETTER_GENERATE', status: 'In Progress', requirement: 'SK Terbit', mandatory: true },
          { step: 9, title: 'Generate Surat Orang Tua', code: 'PARENT_LETTER_GENERATE', status: 'Not Started', requirement: 'Master Siswa & Rombel', mandatory: false },
          { step: 10, title: 'Aktifkan KBM', code: 'KBM_ACTIVATE', status: 'Not Started', requirement: 'Jadwal & Guru Pengampu Valid', mandatory: true },
          { step: 11, title: 'Monitoring Absensi', code: 'ATTENDANCE_MONITOR', status: 'Not Started', requirement: 'KBM Berjalan', mandatory: true },
          { step: 12, title: 'Monitoring Penilaian', code: 'ASSESSMENT_MONITOR', status: 'Not Started', requirement: 'Komponen Nilai Terisi', mandatory: true },
          { step: 13, title: 'Generate Leger', code: 'LEGER_GENERATE', status: 'Not Started', requirement: 'Nilai Lengkap & Valid', mandatory: true },
          { step: 14, title: 'Generate Rapor', code: 'REPORT_CARD_GENERATE', status: 'Not Started', requirement: 'Leger Terverifikasi', mandatory: true },
          { step: 15, title: 'Arsipkan Dokumen', code: 'ARCHIVE_STORE', status: 'Not Started', requirement: 'Rapor & SK Final', mandatory: true }
        ];
      }
      return res.json({ success: true, data: OfficeDB.academicWorkflows[tenantId] });
    }

    case 'academicAdministrationWorkflowUpdate': {
      const { step, status } = req.body;
      const steps = OfficeDB.academicWorkflows[tenantId] || [];
      const idx = steps.findIndex(s => s.step === step);
      if (idx !== -1) {
        steps[idx].status = status;
        logActivity(tenantId, authUser?.id || 'sys', username || 'User', role || 'TU', 'UPDATE_WORKFLOW_STEP', 'Tata Usaha', `Pembaruan workflow alur langkah ${step} (${steps[idx].title}) ke ${status}`);
        return res.json({ success: true, message: 'Step workflow berhasil diperbarui', data: steps[idx] });
      }
      return res.json({ success: false, message: 'Workflow step not found' });
    }

    case 'validationCenterCheck': {
      // Backend validation center rules according to Section 18
      const students = OfficeDB.students.filter(s => s.tenant_id === tenantId);
      const teachers = OfficeDB.teachers.filter(t => t.tenant_id === tenantId);
      const sks = OfficeDB.outgoingLetters.filter(l => l.tenant_id === tenantId && l.letter_type === 'Surat Keputusan');
      const archives = OfficeDB.archives.filter(a => a.tenant_id === tenantId);

      const validationRules = [
        {
          code: 'VAL_ROMBEL_BEFORE_KBM',
          title: 'Validasi Rombel sebelum KBM Aktif',
          status: 'PASSED',
          details: 'Seluruh siswa terdistribusi ke dalam rombel tanpa ada siswa tanpa rombel.',
          recommendation: 'Siap untuk pengaktifan KBM.'
        },
        {
          code: 'VAL_ASSIGNMENT_BEFORE_SK',
          title: 'Validasi Penugasan Guru sebelum SK Terbit',
          status: 'WARNING',
          details: 'Terdapat 2 mata pelajaran yang belum memiliki guru pengampu terdaftar.',
          recommendation: 'Lengkapi pembagian tugas mengajar pada modul Ploting Guru.'
        },
        {
          code: 'VAL_SK_BEFORE_DUTY_LETTER',
          title: 'Validasi SK sebelum Surat Tugas Diterbitkan',
          status: 'PASSED',
          details: `${sks.length} SK Penugasan aktif telah terverifikasi dan ditandatangani.`,
          recommendation: 'Surat tugas dapat digenerate otomatis.'
        },
        {
          code: 'VAL_ASSESSMENT_BEFORE_LEGER',
          title: 'Validasi Penilaian sebelum Leger Dibuat',
          status: 'INFO',
          details: 'Proses penilaian masih berlangsung di Teacher Command Center.',
          recommendation: 'Pastikan seluruh guru menginput nilai harian dan PAS/PAT.'
        },
        {
          code: 'VAL_LEGER_BEFORE_RAPOR',
          title: 'Validasi Leger sebelum Cetak Rapor',
          status: 'INFO',
          details: 'Leger nilai semester belum dikunci oleh Waka Kurikulum.',
          recommendation: 'Kunci leger setelah seluruh nilai tuntas.'
        }
      ];

      return res.json({
        success: true,
        data: {
          isValid: false,
          passedCount: 2,
          warningCount: 1,
          infoCount: 2,
          rules: validationRules
        }
      });
    }

    case 'academicReportCenterGet': {
      const incoming = OfficeDB.incomingLetters.filter(l => l.tenant_id === tenantId);
      const outgoing = OfficeDB.outgoingLetters.filter(l => l.tenant_id === tenantId);
      const archives = OfficeDB.archives.filter(a => a.tenant_id === tenantId);
      const legals = OfficeDB.legalDocuments.filter(ld => ld.tenant_id === tenantId);

      return res.json({
        success: true,
        data: {
          academicYear: '2026/2027',
          activeSemester: 'Ganjil',
          summaryMetrics: {
            totalSiswa: 1250,
            totalGuru: 85,
            totalPegawai: 24,
            totalRombel: 36,
            totalSK: outgoing.filter(l => l.letter_type === 'Surat Keputusan').length,
            totalSuratTugas: outgoing.filter(l => l.letter_type === 'Surat Tugas').length,
            totalSuratOrangTua: outgoing.filter(l => l.letter_type === 'Surat Undangan' || l.letter_type === 'Surat Edaran').length,
            totalArsip: archives.length,
            totalLegalitas: legals.length
          },
          reportsList: [
            { id: 'rep-1', name: 'Laporan Rekapitulasi Data Siswa & Santri', category: 'KESISWAAN', formats: ['PDF', 'EXCEL', 'CSV'] },
            { id: 'rep-2', name: 'Laporan Pembagian Tugas Mengajar & Beban Jam Guru', category: 'KEPEGAWAIAN', formats: ['PDF', 'EXCEL'] },
            { id: 'rep-3', name: 'Laporan SK & Surat Tugas Terbit Semester Ganjil', category: 'PERSURATAN', formats: ['PDF', 'EXCEL'] },
            { id: 'rep-4', name: 'Laporan Monitoring Kehadiran & KBM Harian', category: 'KBM', formats: ['PDF', 'EXCEL', 'CSV'] },
            { id: 'rep-5', name: 'Laporan Leger Nilai & Ketuntasan Belajar', category: 'NILAI_RAPOR', formats: ['PDF', 'EXCEL'] },
            { id: 'rep-6', name: 'Laporan Inventaris Dokumen & Kearsipan Digital', category: 'ARSIP', formats: ['PDF', 'EXCEL'] }
          ]
        }
      });
    }

    case 'officialDocumentUnitIdentities': {
      const units = [
        {
          id: 'unit-yayasan',
          code: 'YAYASAN',
          name: 'Kantor Pusat Yayasan Pendidikan Islam Al-Azhar',
          foundation_name: 'YAYASAN PENDIDIKAN ISLAM AL-AZHAR',
          unit_type: 'Yayasan',
          npsn: 'YYS-00912',
          nsm: '111122223333',
          address: 'Jl. Utama Pesantren No. 01, Kebayoran Baru, Jakarta Selatan',
          village: 'Kebayoran',
          district: 'Kebayoran Baru',
          city: 'Jakarta Selatan',
          province: 'DKI Jakarta',
          postal_code: '12120',
          phone: '(021) 7200-1122',
          email: 'sekretariat@yayasan-alazhar.or.id',
          website: 'www.yayasan-alazhar.or.id',
          logo_foundation: '/logo-yayasan.png',
          logo_unit: '/logo-yayasan.png',
          leader_name: 'Dr. H. Muhammad Ramdhan, M.A.',
          leader_title: 'Ketua Umum Yayasan',
          leader_nip: 'NIY. 19780101-001'
        },
        {
          id: 'unit-smp',
          code: 'SMP',
          name: 'SMP Islam Terpadu Al-Azhar',
          foundation_name: 'YAYASAN PENDIDIKAN ISLAM AL-AZHAR',
          unit_type: 'SMP',
          npsn: '20109876',
          nsm: '121231710001',
          address: 'Jl. Pendidikan No. 45, Komplek Pesantren Terpadu',
          village: 'Mekarsari',
          district: 'Cimanggis',
          city: 'Depok',
          province: 'Jawa Barat',
          postal_code: '16452',
          phone: '(021) 8877-6655',
          email: 'smp@alazhar-terpadu.sch.id',
          website: 'www.smp-alazhar.sch.id',
          logo_foundation: '/logo-yayasan.png',
          logo_unit: '/logo-smp.png',
          leader_name: 'Ust. H. Abdullah Faqih, M.Pd.',
          leader_title: 'Kepala Sekolah SMP',
          leader_nip: 'NIP. 19820512-2026'
        },
        {
          id: 'unit-sma',
          code: 'SMA',
          name: 'SMA Tahfidz Al-Qur\'an Al-Azhar',
          foundation_name: 'YAYASAN PENDIDIKAN ISLAM AL-AZHAR',
          unit_type: 'SMA',
          npsn: '20109877',
          nsm: '121231710002',
          address: 'Jl. Kampus Pesantren No. 88, Gedung Al-Ghazali',
          village: 'Mekarsari',
          district: 'Cimanggis',
          city: 'Depok',
          province: 'Jawa Barat',
          postal_code: '16452',
          phone: '(021) 8877-9900',
          email: 'sma@alazhar-terpadu.sch.id',
          website: 'www.sma-tahfidz.sch.id',
          logo_foundation: '/logo-yayasan.png',
          logo_unit: '/logo-sma.png',
          leader_name: 'Drs. H. Ahmad Dahlan, M.Pd.I.',
          leader_title: 'Kepala Sekolah SMA',
          leader_nip: 'NIP. 19750314-2026'
        },
        {
          id: 'unit-ponpes',
          code: 'PONPES',
          name: 'Pondok Pesantren Modern Darul Hadits',
          foundation_name: 'YAYASAN PENDIDIKAN ISLAM AL-AZHAR',
          unit_type: 'Pondok Pesantren',
          npsn: 'PP-510099',
          nsm: '510032710003',
          address: 'Jl. Raya Payakumbuh Km 7, Sumatera Barat',
          village: 'Tanjung Pati',
          district: 'Harau',
          city: 'Lima Puluh Kota',
          province: 'Sumatera Barat',
          postal_code: '26261',
          phone: '(0752) 12345',
          email: 'info@darulhadits.org',
          website: 'www.darulhadits.org',
          logo_foundation: '/logo-yayasan.png',
          logo_unit: '/logo-ponpes.png',
          leader_name: 'K.H. Dr. Ahmad Fauzi, Lc., M.A.',
          leader_title: 'Pimpinan Pondok Pesantren',
          leader_nip: 'NIY. 19700909-001'
        }
      ];
      return res.json({ success: true, data: units });
    }

    case 'officialDocumentVerify': {
      const { code } = req.body;
      const verificationCode = code || req.query?.code;
      
      const outgoingMatch = OfficeDB.outgoingLetters.find(l => l.letter_number?.includes(verificationCode) || l.id === verificationCode);
      
      return res.json({
        success: true,
        data: {
          verification_code: verificationCode || 'VER-2026-9901',
          status: 'VALID', // VALID | REVOKED | ARCHIVED | REVISED
          document_title: outgoingMatch?.subject || 'Surat Keputusan Pembagian Tugas Mengajar & Penugasan Akademik',
          letter_number: outgoingMatch?.letter_number || 'B-104/SMP-AA/SK/VII/2026',
          issuer_unit: outgoingMatch?.institution || 'SMP Islam Terpadu Al-Azhar',
          issue_date: outgoingMatch?.letter_date || new Date().toISOString().split('T')[0],
          signatory_name: outgoingMatch?.signatory_name || 'Ust. H. Abdullah Faqih, M.Pd.',
          signatory_title: outgoingMatch?.signatory_title || 'Kepala Sekolah',
          signed_digitally: true,
          verification_timestamp: new Date().toISOString(),
          audit_trail: [
            { timestamp: new Date().toISOString(), action: 'VERIFIED', ip: req.ip || '127.0.0.1', message: 'Dokumen terverifikasi sah melalui QR Verification Gateway.' }
          ]
        }
      });
    }

    case 'officialDocumentExportDocx': {
      const { template_title, letter_number, recipient_name, body_paragraphs, unit_name } = req.body;
      
      const docxData = {
        file_name: `${(template_title || 'Surat_Resmi').replace(/\s+/g, '_')}_${Date.now()}.docx`,
        mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        content_preview: {
          title: template_title || 'SURAT KETERANGAN RESMI',
          letter_number: letter_number || 'B-029/SK-DIR/VII/2026',
          unit: unit_name || 'SMP Islam Terpadu Al-Azhar',
          recipient: recipient_name || 'Muhammad Ahmad Syahputra',
          body: body_paragraphs || ['Demikian surat ini dibuat untuk dipergunakan sebagaimana mestinya dengan penuh tanggung jawab.']
        },
        status: 'SUCCESS',
        generated_at: new Date().toISOString()
      };
      
      logActivity(tenantId, authUser?.id || 'sys', username || 'User', role || 'TU', 'EXPORT_DOCX', 'Tata Usaha', `Ekspor dokumen Word (.docx) "${docxData.file_name}"`);
      return res.json({ success: true, data: docxData });
    }

    case 'officialDocumentGenerate': {
      const data = req.body;
      const verCode = 'VER-' + Math.floor(100000 + Math.random() * 900000);
      const generatedDoc = {
        id: 'DOC-' + Date.now(),
        tenant_id: tenantId,
        letter_number: data.letter_number || `B-${Math.floor(100 + Math.random() * 900)}/TU-AA/${new Date().getFullYear()}`,
        subject: data.subject || data.template_title || 'Surat Resmi',
        recipient: data.recipient || 'Siswa / Orang Tua',
        unit_code: data.unit_code || 'SMP',
        verification_code: verCode,
        created_at: new Date().toISOString(),
        status: 'PUBLISHED',
        download_url_pdf: `/api/action?action=officialDocumentDownload&type=pdf&id=DOC-${Date.now()}`,
        download_url_docx: `/api/action?action=officialDocumentDownload&type=docx&id=DOC-${Date.now()}`
      };

      OfficeDB.outgoingLetters.unshift({
        id: generatedDoc.id,
        tenant_id: tenantId,
        letter_number: generatedDoc.letter_number,
        agenda_number: 'AGD-' + Date.now(),
        letter_date: new Date().toISOString().split('T')[0],
        sender: 'Tata Usaha Pusat',
        destination: generatedDoc.recipient,
        subject: generatedDoc.subject,
        category_id: 'CAT-01',
        letter_type: 'Surat Keluar',
        summary: `Dokumen resmi terbit: ${generatedDoc.subject}`,
        confidentiality: 'BIASA',
        urgency: 'BIASA',
        is_draft: false,
        signatory_name: data.signatory_name || 'Kepala Sekolah',
        signatory_title: data.signatory_title || 'Kepala Sekolah',
        file_path: generatedDoc.download_url_pdf,
        institution: data.unit_name || 'SMP Islam Terpadu Al-Azhar',
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        created_by: authUser?.id || 'sys',
        updated_by: authUser?.id || 'sys'
      });

      logActivity(tenantId, authUser?.id || 'sys', username || 'User', role || 'TU', 'GENERATE_OFFICIAL_DOC', 'Tata Usaha', `Menerbitkan dokumen resmi "${generatedDoc.subject}" Nomor ${generatedDoc.letter_number}`);
      return res.json({ success: true, data: generatedDoc });
    }

    default:
      return null;
  }
}
