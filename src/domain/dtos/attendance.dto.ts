export interface CheckInDTO {
  personId: string;
  name: string;
  role: 'SISWA' | 'SANTRI' | 'GURU' | 'PEGAWAI';
  type: 'MASUK' | 'PULANG' | 'SHALAT' | 'TAHFIDZ' | 'ASRAMA' | 'LEMBUR';
  method: 'MANUAL' | 'QR' | 'BARCODE' | 'GPS' | 'SMART_CARD' | 'RFID' | 'FINGERPRINT' | 'FACE_RECOGNITION' | 'NFC' | 'BEACON';
  status?: 'HADIR' | 'TERLAMBAT' | 'IZIN' | 'SAKIT' | 'ALFA' | 'WFH' | 'TUGAS_LUAR' | 'DINAS' | 'CUTI';
  lat?: number;
  lng?: number;
  qrToken?: string;
  barcodeData?: string;
  timestamp?: string;
  details?: string;
  offlineQueueId?: string;
}

export interface AttendanceRuleDTO {
  id?: string;
  lateGracePeriod: number; // in minutes
  rules: {
    minRange: number; // e.g., 0
    maxRange: number; // e.g., 5
    deductionType: 'PERCENTAGE' | 'NOMINAL' | 'PER_MINUTE' | 'PER_HOUR' | 'PER_DAY';
    deductionValue: number;
  }[];
}

export interface ReplacementTeacherDTO {
  id?: string;
  originalTeacherId: string;
  substituteTeacherId: string;
  courseId: string;
  classroomId: string;
  date: string;
  timeSlot: string;
  hourlyHonor: number;
}
