/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'OWNER' 
  | 'ADMINISTRATOR' 
  | 'KEPALA_SEKOLAH' 
  | 'GURU' 
  | 'WALI_KELAS' 
  | 'BENDAHARA' 
  | 'TU' 
  | 'SANTRI' 
  | 'ORANG_TUA' 
  | 'YAYASAN';

export interface BaseEntity {
  id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string;
  updated_by: string;
}

export interface Tenant extends BaseEntity {
  name: string;
  subdomain: string;
  type: 'SEKOLAH' | 'PONDOK' | 'KEDUA';
  status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL';
  logo_url?: string;
  address?: string;
  phone?: string;
  nama_yayasan?: string;
  nama_sekolah?: string;
}

export interface User extends BaseEntity {
  email: string;
  name: string;
  username: string;
  role: UserRole;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface AcademicYear extends BaseEntity {
  year: string; // e.g., "2025/2026"
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Semester extends BaseEntity {
  academic_year_id: string;
  name: string; // "Ganjil" | "Genap"
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Major extends BaseEntity {
  name: string; // e.g., "MIPA", "IPS", "Tahfidz"
  code: string;
}

export interface Classroom extends BaseEntity {
  name: string; // e.g., "X-A", "XI-Tahfidz-1"
  major_id?: string;
  room_id: string;
  homeroom_teacher_id: string;
}

export interface Room extends BaseEntity {
  name: string; // e.g., "Ruang Kelas 10", "Lab Kimia"
  code: string;
  capacity: number;
}

export interface Student extends BaseEntity {
  user_id?: string;
  nis: string;
  nisn?: string;
  name: string;
  gender: 'L' | 'P';
  classroom_id: string;
  status: 'AKTIF' | 'ALUMNI' | 'PINDAH';
  is_santri: boolean;
  dorm_room_id?: string;
  parent_id?: string;
}

export interface Teacher extends BaseEntity {
  user_id?: string;
  nip: string;
  name: string;
  gender: 'L' | 'P';
  specialization?: string;
  status: 'AKTIF' | 'CUTI' | 'NON_AKTIF';
}

export interface Employee extends BaseEntity {
  user_id?: string;
  nik: string;
  name: string;
  role_title: string; // e.g., "Staf TU", "Pustakawan"
}

export interface Parent extends BaseEntity {
  user_id?: string;
  name: string;
  phone: string;
  address?: string;
}

export interface Course extends BaseEntity {
  name: string; // e.g., "Matematika", "Fiqih", "Nahwu"
  code: string;
  kkm: number;
}

export interface Schedule extends BaseEntity {
  classroom_id: string;
  course_id: string;
  teacher_id: string;
  day: 'SENIN' | 'SELASA' | 'RABU' | 'KAMIS' | 'JUMAT' | 'SABTU';
  start_time: string; // e.g. "07:30"
  end_time: string; // e.g. "09:00"
}

export interface Attendance extends BaseEntity {
  student_id: string;
  date: string;
  status: 'HADIR' | 'SAKIT' | 'IZIN' | 'ALFA';
  notes?: string;
}

export interface Grade extends BaseEntity {
  student_id: string;
  course_id: string;
  semester_id: string;
  cognitive_score: number; // Nilai Pengetahuan
  psychomotor_score: number; // Nilai Keterampilan
  attitude_score: 'A' | 'B' | 'C' | 'D';
}

export interface Dorm extends BaseEntity {
  name: string; // e.g., "Asrama Al-Ghazali"
  gender_target: 'L' | 'P';
  warden_name?: string;
}

export interface DormRoom extends BaseEntity {
  dorm_id: string;
  number: string;
  capacity: number;
  current_occupants: number;
}

export interface FeeType extends BaseEntity {
  name: string; // e.g., "SPP Bulanan", "Uang Gedung"
  amount: number;
  frequency: 'ONCE' | 'MONTHLY';
}

export interface FeeInvoice extends BaseEntity {
  student_id: string;
  fee_type_id: string;
  due_date: string;
  amount: number;
  amount_paid: number;
  status: 'UNPAID' | 'PARTIAL' | 'PAID';
}

export interface FeePayment extends BaseEntity {
  invoice_id: string;
  payment_date: string;
  amount: number;
  payment_method: 'CASH' | 'TRANSFER' | 'VA';
  recorded_by: string;
}

export interface CashTransaction extends BaseEntity {
  date: string;
  type: 'IN' | 'OUT';
  amount: number;
  description: string;
  category: string; // e.g., "Operasional", "SPP", "Gaji"
}

export interface LedgerEntry extends BaseEntity {
  date: string;
  account_code: string; // e.g., "11101" (Kas)
  account_name: string;
  debit: number;
  credit: number;
  description: string;
}

export interface Book extends BaseEntity {
  title: string;
  isbn?: string;
  author: string;
  publisher?: string;
  stock: number;
  borrowed: number;
}

export interface InventoryItem extends BaseEntity {
  name: string;
  code: string;
  condition: 'BAIK' | 'RUSAK_RINGAN' | 'RUSAK_BERAT';
  quantity: number;
  location?: string;
}

export interface Infraction extends BaseEntity {
  student_id: string;
  date: string;
  title: string;
  points: number;
  action_taken?: string;
}

export interface Achievement extends BaseEntity {
  student_id: string;
  date: string;
  title: string;
  level: 'SEKOLAH' | 'KABUPATEN' | 'PROVINSI' | 'NASIONAL' | 'INTERNASIONAL';
}

export interface LeavePermission extends BaseEntity {
  student_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface DocumentFile extends BaseEntity {
  name: string;
  category: 'AKADEMIK' | 'KEUANGAN' | 'LEGAL' | 'SURAT';
  file_url: string;
  uploaded_by: string;
}

export interface AuditLog {
  id: string;
  tenant_id: string;
  timestamp: string;
  user_id: string;
  username: string;
  role: string;
  action: string; // "LOGIN", "INSERT", "UPDATE", "DELETE", "EXPORT"
  module_name: string; // e.g., "Siswa", "SPP"
  details: string;
  ip_address?: string;
}

// --- SPRINT 2 SaaS INTERFACES ---

export interface SaaSPlan {
  id: string;
  nama_plan: string;
  harga: number;
  maksimal_siswa: number;
  maksimal_guru: number;
  maksimal_storage: number;
  fitur: string[];
  aktif: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SaaSSubscription extends BaseEntity {
  plan_id: string;
  start_date: string;
  end_date: string;
  status: 'ACTIVE' | 'EXPIRED' | 'PENDING_PAYMENT' | 'CANCELLED' | 'TRIAL';
}

export interface SchoolProfile extends BaseEntity {
  nama_yayasan?: string;
  nama_sekolah: string;
  npsn?: string;
  nsm?: string;
  akreditasi?: 'A' | 'B' | 'C' | 'TT' | 'UNGGUL';
  nomor_izin?: string;
  tanggal_berdiri?: string;
  email?: string;
  website?: string;
  telepon?: string;
  whatsapp?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  alamat: string;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  kelurahan?: string;
  kode_pos?: string;
  latitude?: number;
  longitude?: number;
}

export interface SchoolUnit extends BaseEntity {
  school_id: string;
  nama_unit: string;
  kode: string;
  jenjang: string;
  kepala_unit?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface TenantDomain extends BaseEntity {
  subdomain: string;
  custom_domain?: string;
  ssl_status: 'PENDING' | 'ACTIVE' | 'FAILED';
  verified: boolean;
}

export interface TenantSetting extends BaseEntity {
  timezone: string;
  bahasa: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL';
}

export interface Branding extends BaseEntity {
  logo?: string;
  logo_mini?: string;
  favicon?: string;
  primary_color: string;
  secondary_color: string;
  sidebar_color: string;
  background_login?: string;
  footer?: string;
  copyright: string;
}

export interface SetupWizard extends BaseEntity {
  current_step: number;
  completed: boolean;
  wizard_data: any;
}

// --- SPRINT 17 ADMISSION & PPDB INTERFACES ---
export interface AdmissionSettings extends BaseEntity {
  auto_generate_student_id: boolean;
  student_id_format: string;
  require_all_documents: boolean;
  form_fee: number;
  re_registration_fee: number;
  announcement_status: 'OPENED' | 'CLOSED';
}

export interface AdmissionPeriod extends BaseEntity {
  name: string;
  start_date: string;
  end_date: string;
  status: 'ACTIVE' | 'INACTIVE';
  description?: string;
}

export interface AdmissionWave extends BaseEntity {
  period_id: string;
  name: string;
  start_date: string;
  end_date: string;
  quota: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface AdmissionProgram extends BaseEntity {
  name: string;
  code: string;
  quota: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface AdmissionFormTemplate extends BaseEntity {
  program_id?: string;
  name: string;
  description?: string;
}

export interface AdmissionFormField extends BaseEntity {
  template_id: string;
  field_name: string;
  field_label: string;
  field_type: 'TEXT' | 'NUMBER' | 'SELECT' | 'DATE' | 'FILE';
  required: boolean;
  options?: string[]; // e.g., ["IPA", "IPS"] for select fields
  sort_order: number;
}

export interface AdmissionApplication extends BaseEntity {
  period_id: string;
  wave_id: string;
  program_id: string;
  registration_number: string;
  full_name: string;
  nickname?: string;
  gender: 'L' | 'P';
  birth_place: string;
  birth_date: string;
  nisn?: string;
  nik: string;
  phone: string;
  email?: string;
  previous_school?: string;
  status: 'SUBMITTED' | 'VERIFIED' | 'EXAM_COMPLETED' | 'PASSED' | 'RE_REGISTERED' | 'REJECTED' | 'WAITING_LIST';
  custom_form_values?: Record<string, any>;
}

export interface AdmissionGuardian extends BaseEntity {
  application_id: string;
  father_name?: string;
  father_nik?: string;
  father_education?: string;
  father_occupation?: string;
  father_income?: string;
  mother_name?: string;
  mother_nik?: string;
  mother_education?: string;
  mother_occupation?: string;
  mother_income?: string;
  guardian_name?: string;
  guardian_phone?: string;
}

export interface AdmissionAddress extends BaseEntity {
  application_id: string;
  province: string;
  regency: string;
  district: string;
  village: string;
  rt_rw?: string;
  address_line: string;
  postal_code?: string;
  distance_km?: number;
}

export interface AdmissionDocument extends BaseEntity {
  application_id: string;
  requirement_id: string;
  name: string;
  file_url: string;
  file_size_kb?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejection_reason?: string | null;
}

export interface AdmissionVerification extends BaseEntity {
  application_id: string;
  verified_by: string;
  status: 'APPROVED' | 'REJECTED';
  notes?: string;
  verification_date: string;
}

export interface AdmissionExamSchedule extends BaseEntity {
  wave_id: string;
  subject_name: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  room_name?: string;
  capacity?: number;
}

export interface AdmissionExamResult extends BaseEntity {
  application_id: string;
  schedule_id?: string;
  subject_name: string;
  score: number;
  notes?: string;
}

export interface AdmissionInterview extends BaseEntity {
  application_id: string;
  interviewer_name: string;
  interview_date: string;
  score: number;
  notes?: string;
}

export interface AdmissionMedicalCheck extends BaseEntity {
  application_id: string;
  doctor_name: string;
  check_date: string;
  blood_type?: string;
  height_cm?: number;
  weight_kg?: number;
  color_blindness?: boolean;
  score: number;
  notes?: string;
}

export interface AdmissionTahfidzTest extends BaseEntity {
  application_id: string;
  tester_name: string;
  test_date: string;
  juz_memorized: number;
  fluency_score: number;
  tajweed_score: number;
  score: number;
  notes?: string;
}

export interface AdmissionScore extends BaseEntity {
  application_id: string;
  academic_score: number;
  interview_score: number;
  medical_score: number;
  tahfidz_score: number;
  distance_score: number;
  overall_score: number;
}

export interface AdmissionRanking extends BaseEntity {
  period_id: string;
  wave_id: string;
  program_id: string;
  application_id: string;
  rank_index: number;
  overall_score: number;
}

export interface AdmissionResult extends BaseEntity {
  application_id: string;
  status: 'Lulus' | 'Cadangan' | 'Tidak Lulus';
  notes?: string;
  announcement_date: string;
}

export interface AdmissionWaitingList extends BaseEntity {
  application_id: string;
  priority_index: number;
  status: 'WAITING' | 'CALLED' | 'EXPIRED';
  notes?: string;
}

export interface AdmissionReRegistration extends BaseEntity {
  application_id: string;
  re_registration_date: string;
  payment_status: 'UNPAID' | 'PAID';
  verified_by: string;
  notes?: string;
}

export interface AdmissionStudentGeneration extends BaseEntity {
  application_id: string;
  student_id: string; // generated NIS
  generated_at: string;
  status: 'PENDING' | 'COMPLETED';
}

export interface AdmissionPaymentLink extends BaseEntity {
  application_id: string;
  payment_type: 'Formulir' | 'Daftar Ulang';
  amount: number;
  payment_gateway_url: string;
  va_number: string;
  status: 'UNPAID' | 'PENDING' | 'PAID' | 'EXPIRED';
  paid_at?: string | null;
}

// --- SPRINT 20 VIRTUAL CLASSROOM & LIVE MEETING INTERFACES ---
export interface VirtualClassroom extends BaseEntity {
  name: string;
  subject_id: string;
  class_id: string;
  teacher_id: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
}

export interface VirtualClassMember extends BaseEntity {
  virtual_classroom_id: string;
  user_id: string;
  role: 'Teacher' | 'Student' | 'Parent' | 'Guest' | 'Employee';
  status: 'ACTIVE' | 'SUSPENDED' | 'LEFT';
}

export interface MeetingProvider extends BaseEntity {
  name: 'Google Meet' | 'Zoom' | 'Jitsi' | 'Microsoft Teams' | 'Custom WebRTC';
  code: string;
  api_key?: string;
  api_secret?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface MeetingRoom extends BaseEntity {
  name: string;
  provider_id: string;
  external_room_id?: string;
  join_url: string;
  status: 'IDLE' | 'ACTIVE' | 'CLOSED';
}

export interface MeetingSchedule extends BaseEntity {
  virtual_classroom_id?: string;
  room_id?: string;
  title: string;
  meeting_type: 'Class' | 'Webinar' | 'Training' | 'Meeting' | 'Interview';
  host_id: string;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
}

export interface MeetingSession extends BaseEntity {
  schedule_id: string;
  actual_start_time?: string;
  actual_end_time?: string;
  recording_status: 'NONE' | 'ONGOING' | 'COMPLETED' | 'FAILED';
  status: 'ACTIVE' | 'CLOSED';
}

export interface MeetingParticipant extends BaseEntity {
  session_id: string;
  user_id?: string;
  name: string;
  role: 'Teacher' | 'Student' | 'Parent' | 'Guest' | 'Employee';
  joined_at: string;
  left_at?: string;
  status: 'JOINED' | 'LEFT' | 'BLOCKED';
}

export interface MeetingAttendance extends BaseEntity {
  session_id: string;
  participant_id: string;
  user_id?: string;
  status: 'Present' | 'Late' | 'Left Early' | 'Absent';
  join_duration_minutes: number;
  synced_to_academic: boolean;
}

export interface MeetingChatMessage extends BaseEntity {
  session_id: string;
  sender_id?: string;
  sender_name: string;
  sender_role: 'Teacher' | 'Student' | 'Parent' | 'Guest' | 'Employee';
  message: string;
  sent_at: string;
}

export interface MeetingPoll extends BaseEntity {
  session_id: string;
  question: string;
  poll_type: 'Single Choice' | 'Multiple Choice' | 'Rating';
  options: string[];
  status: 'OPEN' | 'CLOSED';
}

export interface MeetingPollAnswer extends BaseEntity {
  poll_id: string;
  user_id: string;
  answer: string;
  answered_at: string;
}

export interface MeetingQuiz extends BaseEntity {
  session_id: string;
  title: string;
  quiz_type: 'Multiple Choice' | 'Essay' | 'True False';
  questions: any[];
  duration_minutes?: number;
  status: 'OPEN' | 'CLOSED';
}

export interface MeetingQuizAnswer extends BaseEntity {
  quiz_id: string;
  user_id: string;
  score: number;
  answers: any;
  submitted_at: string;
}

export interface MeetingWhiteboard extends BaseEntity {
  session_id: string;
  elements: any[];
  status: 'ACTIVE' | 'READ_ONLY' | 'CLOSED';
}

export interface MeetingRecording extends BaseEntity {
  session_id: string;
  storage_type: 'Cloud' | 'Local' | 'Object Storage';
  file_name: string;
  file_url: string;
  file_size_mb: number;
  duration_seconds: number;
  status: 'PROCESSING' | 'AVAILABLE' | 'ARCHIVED' | 'DELETED';
}

export interface MeetingBreakoutRoom extends BaseEntity {
  session_id: string;
  name: string;
  join_url: string;
  status: 'ACTIVE' | 'CLOSED';
}

export interface MeetingBreakoutMember extends BaseEntity {
  breakout_room_id: string;
  participant_id: string;
  joined_at: string;
  left_at?: string;
}

export interface MeetingWaitingRoom extends BaseEntity {
  session_id: string;
  user_id?: string;
  name: string;
  role: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requested_at: string;
}

export interface MeetingRaiseHand extends BaseEntity {
  session_id: string;
  participant_id: string;
  status: 'RAISED' | 'LOWERED';
  raised_at: string;
  lowered_at?: string;
}

export interface MeetingScreenShare extends BaseEntity {
  session_id: string;
  participant_id: string;
  is_sharing: boolean;
  started_at: string;
  ended_at?: string;
}

export interface MeetingStatistics extends BaseEntity {
  session_id: string;
  peak_participants: number;
  average_duration_minutes: number;
  attendance_rate_percent: number;
  total_chat_messages: number;
  total_polls_run: number;
  total_quizzes_run: number;
}

export interface MeetingSettings extends BaseEntity {
  schedule_id: string;
  allow_guest_access: boolean;
  allow_whiteboard: boolean;
  allow_chat: boolean;
  allow_screen_share: boolean;
  require_waiting_room: boolean;
  mute_on_entry: boolean;
}

export interface MeetingIntegration extends BaseEntity {
  provider_code: string;
  auth_payload: any;
  status: string;
}

export interface MeetingGuestAccess extends BaseEntity {
  session_id: string;
  guest_token: string;
  guest_name: string;
  status: 'ALLOWED' | 'BLOCKED';
}

export interface MeetingNotification extends BaseEntity {
  user_id: string;
  title: string;
  message: string;
  type: 'INFO' | 'REMINDER' | 'ALARM';
  is_read: boolean;
}

export interface MeetingIncident extends BaseEntity {
  session_id: string;
  reporter_id: string;
  incident_type: string;
  description: string;
  resolved_at?: string;
}

// --- SPRINT 21 AI-POWERED SMART EDUCATION & INSTITUTIONAL COPILOT HUB ---
export interface AIProvider extends BaseEntity {
  name: 'Google Gemini' | 'OpenAI' | 'Anthropic Claude' | 'DeepSeek' | 'OpenRouter' | 'Azure OpenAI' | 'AWS Bedrock' | 'Ollama' | 'Custom Provider';
  code: string;
  api_endpoint?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface AIProviderModel extends BaseEntity {
  provider_id: string;
  name: 'Gemini' | 'GPT' | 'Claude' | 'DeepSeek' | 'Llama' | 'Mistral' | 'Qwen' | 'Custom';
  model_code: string;
  context_window?: number;
  input_token_cost_per_m?: number;
  output_token_cost_per_m?: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface AIAPIKey extends BaseEntity {
  provider_id: string;
  encrypted_key: string;
  key_hint?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
}

export interface AIPromptCategory extends BaseEntity {
  name: string;
  description?: string;
}

export interface AIPrompt extends BaseEntity {
  category_id: string;
  title: string;
  description?: string;
  system_prompt: string;
  user_template?: string;
  variables: string[]; // dynamic placeholders
  is_public: boolean;
}

export interface AIPromptVersion extends BaseEntity {
  prompt_id: string;
  version_number: number;
  system_prompt: string;
  user_template?: string;
  change_note?: string;
}

export interface AIConversation extends BaseEntity {
  user_id: string;
  title: string;
  assistant_type: 'Teacher' | 'Student' | 'Parent' | 'Finance' | 'HR' | 'Administrator' | 'Boarding' | 'Library' | 'Academic';
  provider_id: string;
  model_id: string;
  pinned: boolean;
}

export interface AIMessage extends BaseEntity {
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  token_count: number;
  cost: number;
}

export interface AIContext extends BaseEntity {
  conversation_id: string;
  context_type: 'StudentProfile' | 'GradeBook' | 'LMS_Progress' | 'Attendance' | 'BillingStatus' | 'PPDB_Details' | 'SystemLogs';
  metadata: any;
}

export interface AIMemoryProfile extends BaseEntity {
  user_id: string;
  memory_key: string;
  memory_value: string;
  importance_score: number;
}

export interface AIKnowledgeSource extends BaseEntity {
  title: string;
  source_type: 'PDF' | 'DOCX' | 'Image' | 'Audio' | 'Video' | 'URL' | 'CustomText';
  file_url?: string;
  content_extracted?: string;
  vector_status?: 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED';
  status: 'ACTIVE' | 'INACTIVE';
}

export interface AIDocumentGenerator extends BaseEntity {
  name: string;
  doc_type: 'Letter' | 'Certificate' | 'Report' | 'Announcement' | 'Lesson Plan' | 'Exam';
  prompt_template: string;
  style_settings?: any;
}

export interface AIGeneratedDocument extends BaseEntity {
  generator_id?: string;
  title: string;
  content: string;
  pdf_url?: string;
  token_usage_total: number;
}

export interface AIQuestionGenerator extends BaseEntity {
  title: string;
  subject: string;
  education_level: string;
  question_type: 'Essay' | 'Multiple Choice' | 'True False' | 'Case Study';
  quantity: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'HOTS';
}

export interface AIGeneratedQuestion extends BaseEntity {
  generator_id: string;
  question_text: string;
  options?: string[];
  correct_answer?: string;
  explanation?: string;
  cognitive_level?: string;
}

export interface AILessonPlanner extends BaseEntity {
  title: string;
  subject: string;
  grade_level: string;
  duration_minutes: number;
  curriculum: string;
}

export interface AIGeneratedLesson extends BaseEntity {
  planner_id: string;
  objectives: string;
  materials?: string;
  activities: { step: number; title: string; duration_minutes: number; detail: string }[];
  assessment?: string;
  content_raw: string;
}

export interface AIReportGenerator extends BaseEntity {
  name: string;
  report_source: 'Grade Book' | 'Report Card' | 'PPDB' | 'CBT' | 'LMS' | 'Virtual Classroom' | 'Finance Ledger';
  schedule_cron?: string;
}

export interface AIReportSummary extends BaseEntity {
  generator_id?: string;
  title: string;
  summary_markdown: string;
  data_snapshot: any;
  action_items?: string[];
}

export interface AITranslationJob extends BaseEntity {
  source_language: 'Indonesia' | 'English' | 'Arabic' | 'Japanese';
  target_language: 'Indonesia' | 'English' | 'Arabic' | 'Japanese';
  original_text: string;
  translated_text?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
}

export interface AIOCRJob extends BaseEntity {
  file_name: string;
  file_url: string;
  file_type: 'PDF' | 'Image';
  extracted_text?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
}

export interface AISpeechJob extends BaseEntity {
  job_type: 'TTS' | 'STT';
  file_name?: string;
  file_url?: string;
  input_text?: string;
  voice_name?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
}

export interface AIUsageLog extends BaseEntity {
  user_id: string;
  endpoint: string;
  provider: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  estimated_cost: number;
  status: string;
}

export interface AITokenUsage extends BaseEntity {
  user_id: string;
  prompt_tokens_total: number;
  completion_tokens_total: number;
  total_tokens_spent: number;
}

export interface AICostTracking extends BaseEntity {
  total_spent_usd: number;
  monthly_budget_limit: number;
  alert_threshold_percent: number;
}

export interface AIFeedback extends BaseEntity {
  message_id: string;
  rating: number;
  comments?: string;
}

export interface AISettings extends BaseEntity {
  default_provider_id?: string;
  default_model_id?: string;
  system_safety_filter: 'STANDARD' | 'STRICT' | 'LAX';
  enable_cache: boolean;
  enable_audit_log: boolean;
}



