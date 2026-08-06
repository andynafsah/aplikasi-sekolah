export interface Student {
  id: string;
  nis: string;
  nisn: string;
  name: string;
  gender: 'L' | 'P';
  classroom_id: string;
  status: string;
  is_santri: boolean;
  dorm_room_id?: string;
}

export interface Teacher {
  id: string;
  nip: string;
  name: string;
  specialization: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  kkm: number;
}

export interface Schedule {
  id: string;
  classroom_id: string;
  course_id: string;
  teacher_id: string;
  day: string;
  start_time: string;
  end_time: string;
}

export interface AttendanceRecord {
  studentId: string;
  name: string;
  nis: string;
  gender: 'L' | 'P';
  status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALFA';
  notes: string;
}

export interface JournalRecord {
  id: string;
  date: string;
  classId: string;
  className: string;
  subjectName: string;
  topic: string;
  hours: string;
  challenges: string;
  solutions: string;
  status: 'Draft' | 'Terverifikasi';
}

export interface LessonPlan {
  id: string;
  topic: string;
  classId: string;
  duration: number;
  objectives: string[];
  activities: string[];
  assessments: string;
  p3_dimensions: string[];
}

export interface GradeRecord {
  studentId: string;
  name: string;
  formative1: number;
  formative2: number;
  summative: number;
  pts: number;
  pas: number;
  praktik: number;
  p5_status: 'BB' | 'MB' | 'BSH' | 'SB';
  sikap_spiritual: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang';
  sikap_sosial: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang';
  ekskul_name: string;
  ekskul_grade: 'A' | 'B' | 'C' | 'D';
  ekskul_notes: string;
  catatan: string;
}

export interface TahfidzRecord {
  studentId: string;
  name: string;
  juz: number;
  lastSurah: string;
  lastVerse: string;
  memorizationLevel: 'Sangat Lancar' | 'Lancar' | 'Cukup' | 'Kurang';
  setoranHistory: {
    id: string;
    date: string;
    surahName: string;
    fromVerse: number;
    toVerse: number;
    status: string;
    tester: string;
  }[];
}
