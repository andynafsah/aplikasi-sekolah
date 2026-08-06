/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type StudentStatus = 'AKTIF' | 'MUTASI' | 'KELUAR' | 'LULUS' | 'ALUMNI' | 'DO' | 'MENINGGAL';

export interface StudentIdentitas {
  nis: string;
  nisn: string;
  nomor_induk_pondok: string;
  nomor_emis: string;
  nomor_dapodik: string;
  name: string; // Nama Lengkap
  nama_arab?: string;
  nama_panggilan?: string;
  tempat_lahir: string;
  tgl_lahir: string;
  gender: 'L' | 'P';
  agama: string;
  kewarganegaraan: string;
  anak_ke: number;
  jumlah_saudara: number;
  status_anak?: string; // Kandung, Tiri, dsb.
  bahasa?: string;
  golongan_darah: string;
}

export interface StudentKependudukan {
  nik: string;
  nomor_kk: string;
  no_akta: string;
  tanggal_akta?: string;
  alamat: string;
  rt: string;
  rw: string;
  dusun: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kode_pos: string;
  latitude?: string;
  longitude?: string;
}

export interface StudentSekolah {
  tahun_masuk: string;
  ppdb_no?: string;
  status: StudentStatus;
  kelas: string;
  rombel: string;
  jurusan: string;
  semester: string;
  tahun_ajaran: string;
  tanggal_keluar?: string;
  alasan_keluar?: string;
}

export interface StudentPondok {
  nomor_santri: string;
  asrama?: string;
  kamar?: string;
  musyrif?: string;
  musyrifah?: string;
  status_mukim: 'MUKIM' | 'NON_MUKIM';
  tanggal_masuk_pondok?: string;
}

export interface ParentDetail {
  nama: string;
  nik: string;
  pendidikan: string;
  pekerjaan: string;
  penghasilan: string;
  no_hp: string;
  whatsapp: string;
  email: string;
  alamat: string;
}

export interface StudentOrangTua {
  ayah: ParentDetail;
  ibu: ParentDetail;
  wali?: ParentDetail;
}

export interface StudentKesehatan {
  tinggi: number; // cm
  berat: number;  // kg
  bmi: number;    // Calculated height/weight index
  riwayat_penyakit?: string;
  alergi?: string;
  disabilitas?: string;
  bpjs?: string;
  golongan_darah: string;
}

export interface StudentSosial {
  kip?: string;
  pkh?: string;
  pip?: string;
  bos?: string;
  beasiswa?: string;
  status_ekonomi?: string; // Pra-Sejahtera, Sejahtera, dsb.
}

export interface DocumentVersion {
  version: number;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  uploadedBy: string;
  comment?: string;
}

export interface StudentDocument {
  id: string;
  student_id: string;
  category: 'FOTO_RESMI' | 'KTP' | 'KK' | 'AKTA' | 'IJAZAH' | 'RAPOR' | 'SURAT_PINDAH' | 'SURAT_SEHAT' | 'SURAT_VAKSIN' | 'DOKUMEN_PONDOK' | 'OTHER';
  fileType: 'PDF' | 'WORD' | 'EXCEL' | 'ZIP' | 'IMAGE';
  currentVersion: number;
  fileName: string;
  size: string;
  path: string;
  versions: DocumentVersion[];
  auditLogs: {
    timestamp: string;
    action: string;
    user: string;
    details: string;
  }[];
}

export interface StudentMutation {
  id: string;
  student_id: string;
  type: 'MUTASI_MASUK' | 'MUTASI_KELUAR' | 'LULUS' | 'DO' | 'ALUMNI_PONDOK';
  tanggal: string;
  sekolah_asal_tujuan: string;
  no_surat: string;
  alasan: string;
  approved_by: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface StudentHistoryRecord {
  id: string;
  student_id: string;
  type: 'KELAS' | 'ASRAMA' | 'SPP' | 'DOKUMEN' | 'PELANGGARAN' | 'PRESTASI' | 'KESEHATAN' | 'LOGIN';
  title: string;
  description: string;
  date: string;
  operator: string;
}

export interface StudentEnterprise {
  id: string;
  tenant_id: string;
  identitas: StudentIdentitas;
  kependudukan: StudentKependudukan;
  sekolah: StudentSekolah;
  pondok: StudentPondok;
  orang_tua: StudentOrangTua;
  kesehatan: StudentKesehatan;
  sosial: StudentSosial;
  barcode_url: string;
  qrcode_url: string;
  id_card_url: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string;
  updated_by: string;
}
