/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Gedung {
  id: string;
  code: string;
  name: string;
  type: 'PUTRA' | 'PUTRI';
  capacity: number;
}

export interface Kamar {
  id: string;
  code: string;
  name: string;
  floor: number;
  capacity: number;
  status: 'TERSEDIA' | 'PENUH' | 'PERBAIKAN';
  gedungId: string;
}

export interface TempatTidur {
  id: string;
  kamarId: string;
  bedNo: string;
  status: 'TERSEDIA' | 'TERISI';
}

export interface Student {
  id: string;
  name: string;
  nis: string;
  gender: 'PUTRA' | 'PUTRI';
  class: string;
}

export interface Penempatan {
  id: string;
  studentId: string;
  kamarId: string;
  bedId: string;
  entryDate: string;
  exitDate?: string;
}

export interface Musyrif {
  id: string;
  name: string;
  dormId: string;
  roomId?: string;
  shift: 'PAGI' | 'SORE' | 'MALAM' | 'FULLTIME';
  type: 'MUSYRIF' | 'MUSYRIFAH';
}

export interface Perizinan {
  id: string;
  studentId: string;
  type: 'PULANG' | 'BEROBAT' | 'KELUAR' | 'ORTU';
  reason: string;
  dateStart: string;
  dateEnd: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  whatsappSent?: boolean;
}

export interface Kunjungan {
  id: string;
  guestName: string;
  studentId: string;
  relation: string;
  date: string;
  timeIn: string;
  timeOut?: string;
  purpose: string;
}

export interface Tahfidz {
  id: string;
  studentId: string;
  type: 'SETORAN' | 'MURAJAAH';
  juz: number;
  surah: string;
  verseRange: string;
  nilai: 'A' | 'B' | 'C' | 'D';
  pembimbing: string;
  date: string;
}

export interface TargetHafalan {
  id: string;
  studentId: string;
  targetJuz: number;
  achievedJuz: number;
  deadline: string;
}

export interface IbadahLog {
  id: string;
  studentId: string;
  date: string;
  shalatJamaah: {
    subuh: boolean;
    dhuhur: boolean;
    ashar: boolean;
    maghrib: boolean;
    isya: boolean;
  };
  tahajud: boolean;
  dhuha: boolean;
  puasa: 'NONE' | 'SENIN_KAMIS' | 'DAUD' | 'AYYAMUL_BIDH';
  dzikir: boolean;
  kajian: boolean;
}

export interface Pelanggaran {
  id: string;
  studentId: string;
  date: string;
  category: 'RINGAN' | 'SEDANG' | 'BERAT';
  violation: string;
  points: number;
  punishment: string;
}

export interface Prestasi {
  id: string;
  studentId: string;
  date: string;
  category: 'AKADEMIK' | 'TAHFIDZ' | 'OLAHRAGA' | 'LOMBA';
  achievement: string;
  level: string; // e.g. "Nasional", "Kabupaten"
}

export interface Pembinaan {
  id: string;
  studentId: string;
  date: string;
  notes: string;
  counselor: string;
}

export interface Laundry {
  id: string;
  studentId: string;
  dateReceived: string;
  weight: number; // kg
  itemsCount: number;
  status: 'PENERIMAAN' | 'PROSES' | 'SELESAI' | 'PENGAMBILAN';
  dateCompleted?: string;
}

export interface BarangTitipan {
  id: string;
  studentId: string;
  itemName: string;
  category: 'ELEKTRONIK' | 'UANG' | 'DOKUMEN' | 'BERHARGA';
  quantity: string;
  notes: string;
  status: 'DITITIP' | 'DIAMBIL';
  dateReceived: string;
  dateReturned?: string;
}

export interface Loker {
  id: string;
  number: string;
  studentId?: string;
  status: 'KOSONG' | 'TERISI' | 'RUSAK';
}

export interface Konsumsi {
  id: string;
  day: string; // e.g., "Senin", "Selasa"
  mealType: 'PAGI' | 'SIANG' | 'MALAM';
  menu: string;
  dietOption?: string; // e.g., "Alergi Kacang", "Diet Lambung"
}

export interface Piket {
  id: string;
  day: string;
  studentIds: string[];
  area: string; // e.g. "Asrama Syafii Lt. 1"
}

export interface Keamanan {
  id: string;
  type: 'CHECK_IN' | 'CHECK_OUT' | 'PATROLI' | 'INSIDEN';
  timestamp: string;
  officer: string;
  description: string;
  status: 'AMAN' | 'BUTUH_TINDAKAN' | 'SELESAI';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  details: string;
}
