/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Gedung,
  Kamar,
  TempatTidur,
  Student,
  Penempatan,
  Musyrif,
  Perizinan,
  Kunjungan,
  Tahfidz,
  TargetHafalan,
  IbadahLog,
  Pelanggaran,
  Prestasi,
  Pembinaan,
  Laundry,
  BarangTitipan,
  Loker,
  Konsumsi,
  Piket,
  Keamanan,
  AuditLog
} from '../types/boarding';

export const defaultStudents: Student[] = [
  { id: 'st-1', name: 'Muhammad Farhan', nis: '1205', gender: 'PUTRA', class: '10-A Tahfidz' },
  { id: 'st-2', name: 'Ahmad Muzakki', nis: '1209', gender: 'PUTRA', class: '11-B Salaf' },
  { id: 'st-3', name: 'Rizky Ramadhan', nis: '1232', gender: 'PUTRA', class: '12-A Madrasah' },
  { id: 'st-4', name: 'Fatima Azzahra', nis: '2012', gender: 'PUTRI', class: '10-C Putri' },
  { id: 'st-5', name: 'Aisyah Humaira', nis: '2015', gender: 'PUTRI', class: '11-C Putri' },
  { id: 'st-6', name: 'Abdurrahman Wahid', nis: '1215', gender: 'PUTRA', class: '10-B Modern' },
  { id: 'st-7', name: 'Zulkifli Hasan', nis: '1222', gender: 'PUTRA', class: '12-B Salaf' },
  { id: 'st-8', name: 'Siti Aminah', nis: '2028', gender: 'PUTRI', class: '12-C Putri' }
];

export const defaultGedungs: Gedung[] = [
  { id: 'gd-1', code: 'GD-SYAFII', name: 'Gedung Asrama Syafii (Tahfidz)', type: 'PUTRA', capacity: 40 },
  { id: 'gd-2', code: 'GD-GHAZALI', name: 'Gedung Asrama Al-Ghazali (Salaf)', type: 'PUTRA', capacity: 60 },
  { id: 'gd-3', code: 'GD-MARYAM', name: 'Gedung Asrama Maryam (Putri)', type: 'PUTRI', capacity: 50 },
  { id: 'gd-4', code: 'GD-KHADIJAH', name: 'Gedung Asrama Khadijah (Putri)', type: 'PUTRI', capacity: 40 }
];

export const defaultKamars: Kamar[] = [
  { id: 'km-1', code: 'KM-101', name: 'Kamar Abu Bakar', floor: 1, capacity: 10, status: 'TERSEDIA', gedungId: 'gd-1' },
  { id: 'km-2', code: 'KM-102', name: 'Kamar Umar bin Khattab', floor: 1, capacity: 10, status: 'TERSEDIA', gedungId: 'gd-1' },
  { id: 'km-3', code: 'KM-201', name: 'Kamar Utsman bin Affan', floor: 2, capacity: 8, status: 'PENUH', gedungId: 'gd-2' },
  { id: 'km-4', code: 'KM-301', name: 'Kamar Fatimah 1', floor: 3, capacity: 8, status: 'TERSEDIA', gedungId: 'gd-3' },
  { id: 'km-5', code: 'KM-302', name: 'Kamar Fatimah 2', floor: 3, capacity: 8, status: 'PERBAIKAN', gedungId: 'gd-3' }
];

export const defaultTempatTidurs: TempatTidur[] = [
  { id: 'bt-1', kamarId: 'km-1', bedNo: 'Bed A-1', status: 'TERISI' },
  { id: 'bt-2', kamarId: 'km-1', bedNo: 'Bed A-2', status: 'TERISI' },
  { id: 'bt-3', kamarId: 'km-1', bedNo: 'Bed A-3', status: 'TERSEDIA' },
  { id: 'bt-4', kamarId: 'km-1', bedNo: 'Bed A-4', status: 'TERSEDIA' },
  { id: 'bt-5', kamarId: 'km-2', bedNo: 'Bed B-1', status: 'TERISI' },
  { id: 'bt-6', kamarId: 'km-3', bedNo: 'Bed C-1', status: 'TERISI' },
  { id: 'bt-7', kamarId: 'km-4', bedNo: 'Bed F-1', status: 'TERISI' }
];

export const defaultPenempatans: Penempatan[] = [
  { id: 'pn-1', studentId: 'st-1', kamarId: 'km-1', bedId: 'bt-1', entryDate: '2026-01-05' },
  { id: 'pn-2', studentId: 'st-2', kamarId: 'km-1', bedId: 'bt-2', entryDate: '2026-01-06' },
  { id: 'pn-3', studentId: 'st-3', kamarId: 'km-2', bedId: 'bt-5', entryDate: '2026-01-05' },
  { id: 'pn-4', studentId: 'st-4', kamarId: 'km-4', bedId: 'bt-7', entryDate: '2026-01-10' }
];

export const defaultMusyriifs: Musyrif[] = [
  { id: 'my-1', name: 'Ustadz Ahmad Fauzi', dormId: 'gd-1', shift: 'FULLTIME', type: 'MUSYRIF' },
  { id: 'my-2', name: 'Ustadz Hilman Sauri', dormId: 'gd-2', shift: 'SORE', type: 'MUSYRIF' },
  { id: 'my-3', name: 'Ustazah Lailatul Fitri', dormId: 'gd-3', shift: 'FULLTIME', type: 'MUSYRIFAH' },
  { id: 'my-4', name: 'Ustazah Khodijah Hasan', dormId: 'gd-4', shift: 'PAGI', type: 'MUSYRIFAH' }
];

export const defaultPerizinans: Perizinan[] = [
  { id: 'pz-1', studentId: 'st-2', type: 'PULANG', reason: 'Acara Pernikahan Kakak Kandung', dateStart: '2026-07-10', dateEnd: '2026-07-13', status: 'APPROVED', approvedBy: 'Ustadz Ahmad Fauzi', whatsappSent: true },
  { id: 'pz-2', studentId: 'st-3', type: 'BEROBAT', reason: 'Rujukan ke RS Paru karena Asma Kambuh', dateStart: '2026-07-09', dateEnd: '2026-07-09', status: 'PENDING' },
  { id: 'pz-3', studentId: 'st-1', type: 'KELUAR', reason: 'Membeli kitab rujukan di Gramedia', dateStart: '2026-07-08', dateEnd: '2026-07-08', status: 'APPROVED', approvedBy: 'Ustadz Ahmad Fauzi', whatsappSent: true },
  { id: 'pz-4', studentId: 'st-5', type: 'ORTU', reason: 'Dijenguk dan dibawa keluar asrama sebentar', dateStart: '2026-07-07', dateEnd: '2026-07-07', status: 'APPROVED', approvedBy: 'Ustazah Lailatul Fitri', whatsappSent: true }
];

export const defaultKunjungans: Kunjungan[] = [
  { id: 'kj-1', guestName: 'Drs. H. Sulaiman', studentId: 'st-2', relation: 'Orang Tua (Ayah)', date: '2026-07-03', timeIn: '13:30', timeOut: '16:00', purpose: 'Menengok santri, mengantar bekal perlengkapan mandi' },
  { id: 'kj-2', guestName: 'Ibu Fatimah Zahra', studentId: 'st-4', relation: 'Orang Tua (Ibu)', date: '2026-07-08', timeIn: '10:00', purpose: 'Membawakan makanan khas daerah' }
];

export const defaultTahfidzLogs: Tahfidz[] = [
  { id: 'tf-1', studentId: 'st-1', type: 'SETORAN', juz: 30, surah: 'An-Naba', verseRange: '1-40', nilai: 'A', pembimbing: 'Ustadz Ahmad Fauzi', date: '2026-07-08' },
  { id: 'tf-2', studentId: 'st-1', type: 'MURAJAAH', juz: 29, surah: 'Al-Mulk', verseRange: '1-30', nilai: 'B', pembimbing: 'Ustadz Ahmad Fauzi', date: '2026-07-07' },
  { id: 'tf-3', studentId: 'st-4', type: 'SETORAN', juz: 1, surah: 'Al-Baqarah', verseRange: '1-141', nilai: 'A', pembimbing: 'Ustazah Lailatul Fitri', date: '2026-07-08' },
  { id: 'tf-4', studentId: 'st-6', type: 'SETORAN', juz: 30, surah: 'An-Naziat', verseRange: '1-46', nilai: 'C', pembimbing: 'Ustadz Ahmad Fauzi', date: '2026-07-08' }
];

export const defaultTargetHafalan: TargetHafalan[] = [
  { id: 'th-1', studentId: 'st-1', targetJuz: 30, achievedJuz: 29, deadline: '2026-12-31' },
  { id: 'th-2', studentId: 'st-4', targetJuz: 5, achievedJuz: 2, deadline: '2026-10-15' },
  { id: 'th-3', studentId: 'st-6', targetJuz: 30, achievedJuz: 15, deadline: '2026-12-20' }
];

export const defaultIbadahLogs: IbadahLog[] = [
  {
    id: 'ib-1',
    studentId: 'st-1',
    date: '2026-07-08',
    shalatJamaah: { subuh: true, dhuhur: true, ashar: true, maghrib: true, isya: true },
    tahajud: true,
    dhuha: true,
    puasa: 'NONE',
    dzikir: true,
    kajian: true
  },
  {
    id: 'ib-2',
    studentId: 'st-2',
    date: '2026-07-08',
    shalatJamaah: { subuh: true, dhuhur: false, ashar: true, maghrib: true, isya: true },
    tahajud: false,
    dhuha: true,
    puasa: 'SENIN_KAMIS',
    dzikir: true,
    kajian: true
  },
  {
    id: 'ib-3',
    studentId: 'st-4',
    date: '2026-07-08',
    shalatJamaah: { subuh: true, dhuhur: true, ashar: true, maghrib: true, isya: true },
    tahajud: true,
    dhuha: false,
    puasa: 'NONE',
    dzikir: true,
    kajian: true
  }
];

export const defaultPelanggarans: Pelanggaran[] = [
  { id: 'pl-1', studentId: 'st-2', date: '2026-07-02', category: 'RINGAN', violation: 'Terlambat shalat subuh berjamaah di masjid utama', points: 5, punishment: 'Menulis istighfar 100 kali' },
  { id: 'pl-2', studentId: 'st-3', date: '2026-07-01', category: 'BERAT', violation: 'Membawa gawai (smartphone) tanpa izin pembimbing asrama', points: 50, punishment: 'Penyitaan gawai & pemanggilan orang tua santri' },
  { id: 'pl-3', studentId: 'st-7', date: '2026-07-05', category: 'SEDANG', violation: 'Keluar area pesantren tanpa membawa kartu izin tertulis', points: 15, punishment: 'Membersihkan koridor asrama selama 3 hari' }
];

export const defaultPrestasils: Prestasi[] = [
  { id: 'pr-1', studentId: 'st-1', date: '2026-06-15', category: 'TAHFIDZ', achievement: 'Juara 1 MHQ 10 Juz Putra', level: 'Provinsi Jawa Barat' },
  { id: 'pr-2', studentId: 'st-5', date: '2026-06-20', category: 'AKADEMIK', achievement: 'Medali Emas Olimpiade Matematika Santri', level: 'Nasional (Pospeda)' },
  { id: 'pr-3', studentId: 'st-6', date: '2026-07-01', category: 'LOMBA', achievement: 'Juara 2 Pidato Bahasa Arab', level: 'Kabupaten Sukabumi' }
];

export const defaultPembinaans: Pembinaan[] = [
  { id: 'pb-1', studentId: 'st-3', date: '2026-07-04', notes: 'Santri diberikan konseling motivasi perihal kedisiplinan asrama pasca sanksi penyitaan gawai.', counselor: 'Ustadz Ahmad Fauzi' }
];

export const defaultLaundries: Laundry[] = [
  { id: 'ld-1', studentId: 'st-1', dateReceived: '2026-07-07', weight: 3.2, itemsCount: 12, status: 'SELESAI', dateCompleted: '2026-07-08' },
  { id: 'ld-2', studentId: 'st-2', dateReceived: '2026-07-08', weight: 4.5, itemsCount: 15, status: 'PROSES' },
  { id: 'ld-3', studentId: 'st-4', dateReceived: '2026-07-08', weight: 2.1, itemsCount: 8, status: 'PENERIMAAN' }
];

export const defaultBarangTitipans: BarangTitipan[] = [
  { id: 'bt-01', studentId: 'st-3', itemName: 'Laptop Asus Core i5', category: 'ELEKTRONIK', quantity: '1 Unit', notes: 'Guna kepentingan KBM Madrasah, wajib diserahkan tiap malam', status: 'DITITIP', dateReceived: '2026-07-01' },
  { id: 'bt-02', studentId: 'st-2', itemName: 'Uang Saku Bulanan', category: 'UANG', quantity: 'Rp 500.000', notes: 'Dititipkan untuk dicairkan mingguan maksimal Rp 100k', status: 'DITITIP', dateReceived: '2026-07-01' },
  { id: 'bt-03', studentId: 'st-1', itemName: 'Ijazah SMP Asli & SKHUN', category: 'DOKUMEN', quantity: '1 Map', notes: 'Titip berkas pendaftaran ujian nasional', status: 'DIAMBIL', dateReceived: '2026-06-20', dateReturned: '2026-07-05' }
];

export const defaultLokers: Loker[] = [
  { id: 'lk-1', number: 'L-101', studentId: 'st-1', status: 'TERISI' },
  { id: 'lk-2', number: 'L-102', studentId: 'st-2', status: 'TERISI' },
  { id: 'lk-3', number: 'L-103', status: undefined, status_2: 'KOSONG' } as any,
  { id: 'lk-4', number: 'L-150', studentId: undefined, status: 'RUSAK' }
];

export const defaultKonsumsis: Konsumsi[] = [
  { id: 'ks-1', day: 'Senin', mealType: 'PAGI', menu: 'Nasi Kuning + Telur Balado + Teh Hangat' },
  { id: 'ks-2', day: 'Senin', mealType: 'SIANG', menu: 'Nasi Putih + Sayur Asem + Ayam Goreng Lengkuas + Tempe' },
  { id: 'ks-3', day: 'Senin', mealType: 'MALAM', menu: 'Nasi Putih + Capcay Bakso + Lele Goreng' },
  { id: 'ks-4', day: 'Selasa', mealType: 'PAGI', menu: 'Bubur Ayam Jakarta + Kerupuk + Air Mineral' },
  { id: 'ks-5', day: 'Selasa', mealType: 'SIANG', menu: 'Nasi Putih + Sup Sayur + Daging Sapi Lada Hitam' },
  { id: 'ks-6', day: 'Selasa', mealType: 'MALAM', menu: 'Nasi Putih + Telur Dadar Padang + Sambal Hijau' }
];

export const defaultPikets: Piket[] = [
  { id: 'pk-1', day: 'Senin', studentIds: ['st-1', 'st-2', 'st-6'], area: 'Masjid Jami Pesantren' },
  { id: 'pk-2', day: 'Selasa', studentIds: ['st-3', 'st-7'], area: 'Koridor Asrama Syafii Lt. 1 & 2' }
];

export const defaultKeamanans: Keamanan[] = [
  { id: 'km-01', type: 'PATROLI', timestamp: '2026-07-08T23:30:00', officer: 'Pak Bambang (Chief Security)', description: 'Patroli malam sekeliling pagar asrama putra. Kondisi aman terkendali, pintu gerbang utama telah dikunci.', status: 'AMAN' },
  { id: 'km-02', type: 'INSIDEN', timestamp: '2026-07-08T14:15:00', officer: 'Pak Joko (Security)', description: 'Terjadi pemadaman listrik lokal di area asrama putri Maryam, teknisi sedang menangani.', status: 'BUTUH_TINDAKAN' }
];

export const defaultAuditLogs: AuditLog[] = [
  { id: 'au-1', timestamp: '2026-07-09T01:10:00Z', user: 'nafsahku@gmail.com', action: 'CREATE', module: 'ASRAMA', details: 'Membuat alokasi kamar baru Umar bin Khattab' },
  { id: 'au-2', timestamp: '2026-07-09T01:25:00Z', user: 'nafsahku@gmail.com', action: 'APPROVE', module: 'PERIZINAN', details: 'Menyetujui izin pulang santri Ahmad Muzakki' },
  { id: 'au-3', timestamp: '2026-07-09T01:30:00Z', user: 'nafsahku@gmail.com', action: 'SETORAN_TAHFIDZ', module: 'TAHFIDZ', details: 'Mencatat setoran hafalan Juz 30 santri M. Farhan' }
];
