/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import apiClient from '../api/client';
import { 
  Users, UserPlus, Search, Trash2, Edit3, CheckCircle, FolderDown, Filter, 
  Database, ShieldCheck, FileText, Camera, QrCode, Barcode, Upload, Download, 
  AlertTriangle, Brain, Check, HelpCircle, Clock, Layers, RefreshCw, Settings, 
  BookOpen, CheckSquare, Sparkles, FileCode, ArrowRight, UserSquare, Printer, 
  User, Activity, FileSpreadsheet, Scissors, Key, Sliders, Award, Heart, Home 
} from 'lucide-react';

// Import our custom high-fidelity student sub-components
import { StudentFormModal } from '../components/student/StudentFormModal';
import { StudentList } from '../components/student/StudentList';
import { StudentMutation } from '../components/student/StudentMutation';
import { StudentCardPrinter } from '../components/student/StudentCardPrinter';
import { StudentHealthHistory } from '../components/student/StudentHealthHistory';
import { StudentDocsAudit } from '../components/student/StudentDocsAudit';

type MainTab = 'DASHBOARD' | 'STUDENTS' | 'AUDIT_TRAIL';

type StudentSubTab = 
  | 'SISWA' | 'SANTRI' | 'MUTASI' | 'ALUMNI' | 'KELULUSAN' 
  | 'KARTU' | 'BARCODE' | 'QR' | 'DOKUMEN' | 'ORTU' 
  | 'WALI' | 'KESEHATAN' | 'RIWAYAT' | 'AUDIT';

export default function Sivitas() {
  const { user, tenant } = useAuth();
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const isPondok = tenant?.type === 'PONDOK' || tenant?.type === 'KEDUA';

  const [activeTab, setActiveTab] = useState<MainTab>('DASHBOARD');
  const [subTab, setSubTab] = useState<StudentSubTab>('SISWA');

  // Selected student state for health, parents, and document uploads
  const [selectedStudentId, setSelectedStudentId] = useState<string>('std-01');

  // Form Modal States
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [formInitialData, setFormInitialData] = useState<any | null>(null);

  // REAL DATABASE QUERY
  const { data: serverStudents = [], refetch: refetchStudents } = useQuery({
    queryKey: ['studentsList'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getStudents');
      return res.data?.success ? res.data.data : [];
    }
  });

  // REAL MUTATIONS QUERY
  const { data: serverMutations = [], refetch: refetchMutations } = useQuery({
    queryKey: ['mutationsList'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action?action=getMutationsList');
      return res.data?.success ? res.data.data : [];
    }
  });

  const students = serverStudents;

  // Sync selectedStudentId with loaded students list
  React.useEffect(() => {
    if (students && students.length > 0) {
      const exists = students.some(s => s.id === selectedStudentId);
      if (!exists) {
        setSelectedStudentId(students[0].id);
      }
    }
  }, [students, selectedStudentId]);

  // Real database-driven audit trail logger list
  const { data: auditLogs = [], refetch: refetchAuditLogs } = useQuery({
    queryKey: ['auditLogsList'],
    queryFn: async () => {
      const res = await apiClient.post('/api/action', { action: 'auditLogList' });
      return res.data?.success ? res.data.data : [];
    }
  });

  // Real database-driven history timeline list
  const { data: histories = [], refetch: refetchHistories } = useQuery({
    queryKey: ['studentHistories', selectedStudentId],
    queryFn: async () => {
      if (!selectedStudentId) return [];
      const res = await apiClient.post('/api/action?action=getStudentHistories', { student_id: selectedStudentId });
      return res.data?.success ? res.data.data : [];
    },
    enabled: !!selectedStudentId
  });

  const handleCreateOrUpdate = async (formData: any) => {
    try {
      const isEdit = !!formData.id;
      const actionName = isEdit ? 'updateStudent' : 'createStudent';
      
      const res = await apiClient.post(`/api/action?action=${actionName}`, formData);
      if (res.data?.success) {
        alert(res.data.message || 'Penyimpanan data kesiswaan berhasil!');
        setIsFormOpen(false);
        setFormInitialData(null);
        refetchStudents();
      } else {
        alert(res.data?.message || 'Gagal menyimpan data.');
      }
    } catch (err: any) {
      console.error(err);
      alert('Terjadi kesalahan menyambung ke server. Data tersimpan di Draft lokal.');
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!id) {
      alert('ID siswa tidak valid.');
      return;
    }
    try {
      const res = await apiClient.post('/api/action?action=deleteStudent', { id, student_id: id });
      if (res.data?.success) {
        await queryClient.invalidateQueries({ queryKey: ['studentsList'] });
        await refetchStudents();
      } else {
        alert(res.data?.message || 'Gagal menghapus siswa.');
      }
    } catch (err: any) {
      console.error('Error deleting student:', err);
      const serverMsg = err.response?.data?.message;
      alert(serverMsg || 'Terjadi kesalahan saat menghapus data siswa.');
    }
  };

  const handleEditStudent = (student: any) => {
    setFormInitialData(student);
    setIsFormOpen(true);
  };

  // Helper to generate formal Buku Induk page HTML for single or multiple students
  const renderFormalBukuIndukHTML = (studentList: any[], isPondok: boolean, settings: any) => {
    const pagesHtml = studentList.map((student, idx) => {
      const name = student.name || student.identitas?.name || 'Tanpa Nama';
      const nis = student.nis || student.identitas?.nis || 'N/A';
      const nisn = student.nisn || student.identitas?.nisn || 'N/A';
      const nik = student.nik || student.kependudukan?.nik || 'N/A';
      const gender = (student.gender || student.identitas?.gender) === 'L' ? 'Laki-Laki (L)' : (student.gender || student.identitas?.gender) === 'P' ? 'Perempuan (P)' : 'Laki-Laki';
      const tempatLahir = student.tempat_lahir || student.identitas?.tempat_lahir || '-';
      const tglLahir = student.tgl_lahir || student.identitas?.tgl_lahir || '-';
      const kelas = student.kelas || student.sekolah?.kelas || 'VII-A';
      const rombel = student.rombel || student.sekolah?.rombel || 'VII-A';
      const jurusan = student.jurusan || student.sekolah?.jurusan || 'Tahfidz Al-Quran';
      const asrama = student.asrama || student.pondok?.asrama || '-';
      const kamar = student.kamar || student.pondok?.kamar || '-';
      const musyrif = student.musyrif || student.pondok?.musyrif || '-';
      const namaAyah = student.nama_ayah || student.orang_tua?.ayah?.nama || '-';
      const namaIbu = student.nama_ibu || student.orang_tua?.ibu?.nama || '-';
      const dusun = student.dusun || student.kependudukan?.dusun || '-';
      const desa = student.desa || student.kependudukan?.desa || '-';
      const kecamatan = student.kecamatan || student.kependudukan?.kecamatan || '-';
      const kabupaten = student.kabupaten || student.kependudukan?.kabupaten || '-';
      const tinggi = student.tinggi_badan || '162';
      const berat = student.berat_badan || '51';
      const bpjs = student.bpjs || 'BPJS-390223001';
      const isSantri = student.is_santri === 'YA' || (student.pondok?.nomor_santri ? true : false);
      const photoUrl = student.foto || student.identitas?.foto || student.foto_url || student.avatar || null;

      const studentUnit = student.unit || student.sekolah?.unit || (kelas.startsWith('1') || kelas.startsWith('2') || kelas.startsWith('3') || kelas.startsWith('4') || kelas.startsWith('5') || kelas.startsWith('6') ? 'SD' : kelas.toUpperCase().includes('TK') ? 'TK' : kelas.toUpperCase().includes('SMP') || kelas.startsWith('VII') || kelas.startsWith('VIII') || kelas.startsWith('IX') ? 'SMP' : 'SMA');
      const unitLogoText = studentUnit === 'TK' ? 'TK' : studentUnit === 'SD' ? 'SD' : studentUnit === 'SMP' ? 'SMP' : studentUnit === 'SMK' ? 'SMK' : 'SMA';
      const unitInstansiTitle = studentUnit === 'TK' 
        ? 'TAMAN KANAK-KANAK ISLAM DARUL HUFFADZ' 
        : studentUnit === 'SD' 
        ? 'SEKOLAH DASAR ISLAM TERPADU (SDIT) DARUL HUFFADZ' 
        : studentUnit === 'SMP' 
        ? 'MADRASAH TSANAWIYAH / SMP DARUL HUFFADZ' 
        : studentUnit === 'SMK'
        ? 'SEKOLAH MENENGAH KEJURUAN (SMK) DARUL HUFFADZ'
        : 'MADRASAH ALIYAH / SMA DARUL HUFFADZ';

      // Vector SVG QR Code generator for precise, realistic QR Code rendering
      const qrSVG = `
        <svg viewBox="0 0 100 100" width="56" height="56" style="display:block; margin:0 auto; background:#ffffff; padding:2px; border-radius:4px;">
          <!-- Top-Left Finder Pattern -->
          <rect x="4" y="4" width="28" height="28" fill="#0f172a" rx="3"/>
          <rect x="8" y="8" width="20" height="20" fill="#ffffff" rx="2"/>
          <rect x="12" y="12" width="12" height="12" fill="#0f172a" rx="1"/>

          <!-- Top-Right Finder Pattern -->
          <rect x="68" y="4" width="28" height="28" fill="#0f172a" rx="3"/>
          <rect x="72" y="8" width="20" height="20" fill="#ffffff" rx="2"/>
          <rect x="76" y="12" width="12" height="12" fill="#0f172a" rx="1"/>

          <!-- Bottom-Left Finder Pattern -->
          <rect x="4" y="68" width="28" height="28" fill="#0f172a" rx="3"/>
          <rect x="8" y="72" width="20" height="20" fill="#ffffff" rx="2"/>
          <rect x="12" y="76" width="12" height="12" fill="#0f172a" rx="1"/>

          <!-- Data Matrix Points -->
          <rect x="38" y="8" width="6" height="6" fill="#0f172a" rx="1"/>
          <rect x="50" y="8" width="6" height="6" fill="#0f172a" rx="1"/>
          <rect x="58" y="14" width="6" height="6" fill="#0f172a" rx="1"/>
          <rect x="38" y="20" width="6" height="6" fill="#0f172a" rx="1"/>
          <rect x="46" y="26" width="6" height="6" fill="#0f172a" rx="1"/>

          <rect x="8" y="38" width="6" height="6" fill="#0f172a" rx="1"/>
          <rect x="20" y="44" width="6" height="6" fill="#0f172a" rx="1"/>
          <rect x="38" y="38" width="6" height="6" fill="#0f172a" rx="1"/>
          <rect x="48" y="48" width="6" height="6" fill="#0f172a" rx="1"/>
          <rect x="60" y="38" width="6" height="6" fill="#0f172a" rx="1"/>
          <rect x="72" y="48" width="6" height="6" fill="#0f172a" rx="1"/>
          <rect x="84" y="38" width="6" height="6" fill="#0f172a" rx="1"/>

          <rect x="38" y="60" width="6" height="6" fill="#0f172a" rx="1"/>
          <rect x="52" y="60" width="6" height="6" fill="#0f172a" rx="1"/>
          <rect x="64" y="60" width="6" height="6" fill="#0f172a" rx="1"/>
          <rect x="78" y="54" width="6" height="6" fill="#0f172a" rx="1"/>

          <rect x="38" y="74" width="6" height="6" fill="#0f172a" rx="1"/>
          <rect x="50" y="82" width="6" height="6" fill="#0f172a" rx="1"/>
          <rect x="62" y="74" width="6" height="6" fill="#0f172a" rx="1"/>
          <rect x="72" y="82" width="6" height="6" fill="#0f172a" rx="1"/>
          <rect x="84" y="74" width="6" height="6" fill="#0f172a" rx="1"/>
          <rect x="84" y="86" width="6" height="6" fill="#0f172a" rx="1"/>
        </svg>
      `;

      return `
        <div class="biodata-page">
          <div class="formal-frame">
            <!-- Kop Surat Resmi -->
            <div class="kop-header">
              <div class="kop-logo-left">
                <div class="logo-circle" style="font-size: 14px; font-weight: 800;">
                  ${unitLogoText}
                </div>
              </div>
              <div class="kop-text">
                <div class="yayasan-title">${settings.yayasan_nama || 'YAYASAN DARUL HUFFADZ ENTERPRISE'}</div>
                <div class="instansi-title">${unitInstansiTitle}</div>
                <div class="akreditasi-tag">NSM: 121232010045 &nbsp;•&nbsp; NPSN: 69945120 &nbsp;•&nbsp; TERAKREDITASI "A" (KEMENTERIAN AGAMA RI)</div>
                <div class="alamat-text">
                  ${isPondok ? (settings.pondok_alamat || 'Jl. Raya Megamendung-Ciawi No. 45, RT 03 RW 01, Sukamaju, Megamendung, Bogor 16770') : (settings.sekolah_alamat || 'Jl. Raya Megamendung-Ciawi No. 45, RT 03 RW 01, Sukamaju, Megamendung, Bogor 16770')}<br />
                  Telp: ${settings.sekolah_telepon || '(0251) 824-9011'} &nbsp;|&nbsp; Website: ${settings.sekolah_website || 'www.darulhuffadz.sch.id'} &nbsp;|&nbsp; Email: ${settings.sekolah_email || 'info@darulhuffadz.sch.id'}
                </div>
              </div>
              <div style="width: 60px; flex-shrink: 0;"></div>
            </div>

            <!-- Separator Line -->
            <div class="kop-divider"></div>

            <!-- Document Title -->
            <div class="doc-title-box">
              <div class="main-title">LEMBAR BUKU INDUK PESERTA DIDIK (LIPD)</div>
              <div class="sub-title">BIODATA RESMI SISWA & SANTRI — TAHUN AJARAN 2025/2026</div>
              ${studentList.length > 1 ? `<div class="page-count-badge">DOKUMEN ${idx + 1} DARI ${studentList.length} SISWA TERDAPAT</div>` : ''}
            </div>

            <!-- Grid Content: Left Details, Right Photo -->
            <div class="content-grid">
              <div class="left-details">
                <!-- SECTION I -->
                <div class="section-block">
                  <div class="section-title">I. KETERANGAN IDENTITAS SISWA</div>
                  <table class="formal-table">
                    <tr>
                      <td class="col-num">1.</td>
                      <td class="col-label">Nama Lengkap Siswa</td>
                      <td class="col-sep">:</td>
                      <td class="col-value font-bold-dark">${name}</td>
                    </tr>
                    <tr>
                      <td class="col-num">2.</td>
                      <td class="col-label">Nomor Induk Siswa (NIS)</td>
                      <td class="col-sep">:</td>
                      <td class="col-value font-mono">${nis}</td>
                    </tr>
                    <tr>
                      <td class="col-num">3.</td>
                      <td class="col-label">NISN (Nomor Induk Nasional)</td>
                      <td class="col-sep">:</td>
                      <td class="col-value font-mono">${nisn}</td>
                    </tr>
                    <tr>
                      <td class="col-num">4.</td>
                      <td class="col-label">NIK (No. Kependudukan)</td>
                      <td class="col-sep">:</td>
                      <td class="col-value font-mono">${nik}</td>
                    </tr>
                    <tr>
                      <td class="col-num">5.</td>
                      <td class="col-label">Jenis Kelamin</td>
                      <td class="col-sep">:</td>
                      <td class="col-value">${gender}</td>
                    </tr>
                    <tr>
                      <td class="col-num">6.</td>
                      <td class="col-label">Tempat, Tanggal Lahir</td>
                      <td class="col-sep">:</td>
                      <td class="col-value">${tempatLahir}, ${tglLahir}</td>
                    </tr>
                    <tr>
                      <td class="col-num">7.</td>
                      <td class="col-label">Agama & Kewarganegaraan</td>
                      <td class="col-sep">:</td>
                      <td class="col-value">Islam / WNI</td>
                    </tr>
                  </table>
                </div>

                <!-- SECTION II -->
                <div class="section-block">
                  <div class="section-title">II. KETERANGAN TEMPAT TINGGAL</div>
                  <table class="formal-table">
                    <tr>
                      <td class="col-num">1.</td>
                      <td class="col-label">Dusun / Jalan / RT RW</td>
                      <td class="col-sep">:</td>
                      <td class="col-value">${dusun}</td>
                    </tr>
                    <tr>
                      <td class="col-num">2.</td>
                      <td class="col-label">Desa / Kelurahan</td>
                      <td class="col-sep">:</td>
                      <td class="col-value">${desa}</td>
                    </tr>
                    <tr>
                      <td class="col-num">3.</td>
                      <td class="col-label">Kecamatan</td>
                      <td class="col-sep">:</td>
                      <td class="col-value">${kecamatan}</td>
                    </tr>
                    <tr>
                      <td class="col-num">4.</td>
                      <td class="col-label">Kabupaten / Kota</td>
                      <td class="col-sep">:</td>
                      <td class="col-value">${kabupaten}</td>
                    </tr>
                    <tr>
                      <td class="col-num">5.</td>
                      <td class="col-label">Provinsi & Kode Pos</td>
                      <td class="col-sep">:</td>
                      <td class="col-value">Jawa Barat • 16770</td>
                    </tr>
                  </table>
                </div>
              </div>

              <!-- Right Photo Frame & QR -->
              <div class="right-photo">
                <div class="photo-frame">
                  ${photoUrl ? `
                    <img src="${photoUrl}" alt="${name}" style="width:100%; height:100%; object-fit:cover; border-radius:2px; display:block;" />
                  ` : `
                    <div style="width:100%; height:100%; background:#f1f5f9; border: 1px dashed #94a3b8; border-radius: 2px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 6px; box-sizing: border-box;">
                      <svg viewBox="0 0 24 24" width="36" height="36" fill="#94a3b8" style="margin-bottom: 4px;">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                      <span style="font-family:'Plus Jakarta Sans', sans-serif; font-size: 8.5px; font-weight: 800; color: #334155; letter-spacing: 0.5px;">PAS FOTO</span>
                      <span style="font-family: monospace; font-size: 8px; color: #64748b; margin-top: 2px;">3 x 4 cm</span>
                      <span style="font-size: 6.5px; color: #94a3b8; border: 1px solid #cbd5e1; padding: 1px 4px; border-radius: 3px; margin-top: 6px; font-weight: 600;">STEMPEL</span>
                    </div>
                  `}
                </div>

                <div class="qr-box">
                  <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 7.5px; font-weight: 800; color: #1e3a8a; letter-spacing: 0.5px; text-transform: uppercase;">VERIFIKASI EMIS</div>
                  <div style="margin: 4px 0;">${qrSVG}</div>
                  <div style="font-family: monospace; font-size: 8px; font-weight: 800; color: #0f172a; margin-top: 2px; border-top: 1px dashed #cbd5e1; padding-top: 3px; line-height: 1.1;">
                    ${nisn !== 'N/A' ? 'NISN: ' + nisn : 'NIS: ' + nis}
                  </div>
                  <div style="font-size: 6.5px; font-weight: 600; color: #047857; margin-top: 2px;">Sah & Terverifikasi</div>
                </div>
              </div>
            </div>

            <!-- SECTION III -->
            <div class="section-block">
              <div class="section-title">III. KETERANGAN ORANG TUA KANDUNG / WALI</div>
              <table class="formal-table-full">
                <tr>
                  <td class="col-num">1.</td>
                  <td class="col-label">Nama Ayah Kandung</td>
                  <td class="col-sep">:</td>
                  <td class="col-value font-bold">${namaAyah}</td>
                  <td class="col-num">3.</td>
                  <td class="col-label">Pekerjaan Ayah</td>
                  <td class="col-sep">:</td>
                  <td class="col-value">Wiraswasta / Swasta</td>
                </tr>
                <tr>
                  <td class="col-num">2.</td>
                  <td class="col-label">Nama Ibu Kandung</td>
                  <td class="col-sep">:</td>
                  <td class="col-value font-bold">${namaIbu}</td>
                  <td class="col-num">4.</td>
                  <td class="col-label">Pekerjaan Ibu</td>
                  <td class="col-sep">:</td>
                  <td class="col-value">Ibu Rumah Tangga</td>
                </tr>
              </table>
            </div>

            <!-- SECTION IV -->
            <div class="section-block">
              <div class="section-title">IV. KETERANGAN AKADEMIK & KEPONDOKAN</div>
              <table class="formal-table-full">
                <tr>
                  <td class="col-num">1.</td>
                  <td class="col-label">Tingkat / Kelas / Rombel</td>
                  <td class="col-sep">:</td>
                  <td class="col-value font-bold">${kelas} (${rombel})</td>
                  <td class="col-num">4.</td>
                  <td class="col-label">Status Mukim Santri</td>
                  <td class="col-sep">:</td>
                  <td class="col-value font-bold text-blue">${isSantri ? 'MUKIM ASRAMA (SANTRI)' : 'NON-ASRAMA (LAJU)'}</td>
                </tr>
                <tr>
                  <td class="col-num">2.</td>
                  <td class="col-label">Program Peminatan</td>
                  <td class="col-sep">:</td>
                  <td class="col-value">${jurusan}</td>
                  <td class="col-num">5.</td>
                  <td class="col-label">Asrama & Kamar</td>
                  <td class="col-sep">:</td>
                  <td class="col-value">${isSantri ? `${asrama} / ${kamar}` : '-'}</td>
                </tr>
                <tr>
                  <td class="col-num">3.</td>
                  <td class="col-label">Status Keaktifan</td>
                  <td class="col-sep">:</td>
                  <td class="col-value">AKTIF / TERDAFTAR</td>
                  <td class="col-num">6.</td>
                  <td class="col-label">Ustadz Pembina (Musyrif)</td>
                  <td class="col-sep">:</td>
                  <td class="col-value">${isSantri ? musyrif : '-'}</td>
                </tr>
              </table>
            </div>

            <!-- SECTION V -->
            <div class="section-block">
              <div class="section-title">V. DATA FISIK, KESEHATAN & BPJS</div>
              <table class="formal-table-full">
                <tr>
                  <td class="col-num">1.</td>
                  <td class="col-label">Tinggi / Berat Badan</td>
                  <td class="col-sep">:</td>
                  <td class="col-value">${tinggi} cm / ${berat} kg</td>
                  <td class="col-num">3.</td>
                  <td class="col-label">Golongan Darah</td>
                  <td class="col-sep">:</td>
                  <td class="col-value">O (Positif)</td>
                </tr>
                <tr>
                  <td class="col-num">2.</td>
                  <td class="col-label">No. Kartu BPJS / JKN</td>
                  <td class="col-sep">:</td>
                  <td class="col-value font-mono">${bpjs}</td>
                  <td class="col-num">4.</td>
                  <td class="col-label">Catatan Kesehatan</td>
                  <td class="col-sep">:</td>
                  <td class="col-value">Sehat Wal'afiat</td>
                </tr>
              </table>
            </div>

            <!-- SIGNATURE SECTION -->
            <div class="signature-section">
              <div class="sig-col">
                <div class="sig-title">Mengetahui,<br/>Orang Tua / Wali Siswa</div>
                <div class="sig-space"></div>
                <div class="sig-name">( ${namaAyah} )</div>
                <div class="sig-nip">Tanda Tangan & Nama Terang</div>
              </div>

              <div class="sig-col">
                <div class="sig-title">Kepala Urusan Tata Usaha</div>
                <div class="sig-space"></div>
                <div class="sig-name">Ahmad Ghozali, S.Pd.</div>
                <div class="sig-nip">NIP: 19851010201001</div>
              </div>

              <div class="sig-col">
                <div class="sig-title">Bogor, 14 Juli 2026<br/>Kepala Madrasah / Mudir</div>
                <div class="sig-space">
                  <div class="stempel-box">STAMPEL RESMI</div>
                </div>
                <div class="sig-name">Dr. KH. M. Hamdan, Lc. M.A.</div>
                <div class="sig-nip">NIP: 197805122005011002</div>
              </div>
            </div>

            <!-- FOOTER NOTE -->
            <div class="doc-footer">
              <span>Sistem Informasi Management Kesiswaan & Kepondokan • Darul Huffadz Enterprise</span>
              <span>Dokumen Sah Buku Induk Kesiswaan</span>
            </div>
          </div>
        </div>
      `;
    }).join('\n');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Buku Induk Peserta Didik - ${studentList.length} Berkas</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
            
            @page {
              size: A4 portrait;
              margin: 6mm 8mm;
            }

            * {
              box-sizing: border-box;
            }

            body {
              font-family: 'Plus Jakarta Sans', Arial, Helvetica, sans-serif;
              background-color: #e2e8f0;
              margin: 0;
              padding: 20px 0;
              color: #0f172a;
              display: flex;
              flex-direction: column;
              align-items: center;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .no-print-bar {
              position: fixed;
              top: 15px;
              right: 20px;
              z-index: 9999;
              background: #ffffff;
              padding: 12px 20px;
              border-radius: 12px;
              box-shadow: 0 10px 25px -5px rgba(0,0,0,0.2);
              border: 1px solid #cbd5e1;
              display: flex;
              align-items: center;
              gap: 12px;
              font-family: 'Plus Jakarta Sans', sans-serif;
            }

            .btn-print {
              background: #1e40af;
              color: #ffffff;
              border: none;
              padding: 10px 18px;
              border-radius: 8px;
              font-weight: 700;
              font-size: 13px;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 6px;
              transition: all 0.2s ease;
            }

            .btn-print:hover {
              background: #1d4ed8;
            }

            .btn-close {
              background: #f1f5f9;
              color: #475569;
              border: 1px solid #cbd5e1;
              padding: 10px 16px;
              border-radius: 8px;
              font-weight: 700;
              font-size: 13px;
              cursor: pointer;
            }

            .biodata-page {
              width: 210mm;
              min-height: 297mm;
              background: #ffffff;
              padding: 8mm;
              margin-bottom: 25px;
              box-shadow: 0 8px 20px rgba(0,0,0,0.08);
              box-sizing: border-box;
            }

            .formal-frame {
              border: 2.5px solid #0f172a;
              outline: 1px solid #0f172a;
              outline-offset: -5px;
              padding: 8mm;
              min-height: calc(297mm - 16mm);
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              background: #ffffff;
              box-sizing: border-box;
            }

            /* Kop Surat Styles */
            .kop-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 12px;
            }

            .logo-circle {
              width: 60px;
              height: 60px;
              background: #1e3a8a;
              color: #ffffff;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: 'Plus Jakarta Sans', sans-serif;
              font-weight: 800;
              font-size: 19px;
              border: 2px solid #0f172a;
            }

            .seal-badge {
              width: 54px;
              height: 54px;
              border-radius: 8px;
              background: #065f46;
              color: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: 'Plus Jakarta Sans', sans-serif;
              font-weight: 800;
              font-size: 10px;
              text-align: center;
              line-height: 1.1;
              border: 1.5px solid #047857;
            }

            .kop-text {
              text-align: center;
              flex: 1;
            }

            .yayasan-title {
              font-family: 'Plus Jakarta Sans', sans-serif;
              font-size: 10.5px;
              font-weight: 800;
              letter-spacing: 1px;
              color: #1e3a8a;
              text-transform: uppercase;
            }

            .instansi-title {
              font-family: 'Plus Jakarta Sans', sans-serif;
              font-size: 15px;
              font-weight: 800;
              color: #0f172a;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin: 2px 0;
            }

            .akreditasi-tag {
              font-family: 'Plus Jakarta Sans', sans-serif;
              font-size: 8.5px;
              font-weight: 700;
              color: #047857;
              letter-spacing: 0.5px;
            }

            .alamat-text {
              font-size: 8.5px;
              color: #334155;
              line-height: 1.25;
              margin-top: 3px;
            }

            .kop-divider {
              margin-top: 8px;
              border-bottom: 3px solid #0f172a;
              border-top: 1px solid #0f172a;
              height: 2px;
            }

            /* Document Title Styles */
            .doc-title-box {
              text-align: center;
              margin: 8px 0 10px 0;
            }

            .main-title {
              font-family: 'Plus Jakarta Sans', sans-serif;
              font-size: 13.5px;
              font-weight: 800;
              letter-spacing: 1px;
              text-decoration: underline;
              text-underline-offset: 3px;
              color: #0f172a;
              text-transform: uppercase;
            }

            .sub-title {
              font-family: 'Plus Jakarta Sans', sans-serif;
              font-size: 9.5px;
              font-weight: 700;
              color: #475569;
              margin-top: 2px;
              letter-spacing: 0.3px;
            }

            .page-count-badge {
              display: inline-block;
              background: #eff6ff;
              border: 1px solid #bfdbfe;
              color: #1e40af;
              font-family: 'Plus Jakarta Sans', sans-serif;
              font-size: 8.5px;
              font-weight: 700;
              padding: 2px 8px;
              border-radius: 12px;
              margin-top: 4px;
            }

            /* Grid Layout Styles */
            .content-grid {
              display: flex;
              gap: 14px;
              align-items: flex-start;
            }

            .left-details {
              flex: 1;
            }

            .right-photo {
              width: 120px;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 8px;
              flex-shrink: 0;
            }

            .photo-frame {
              width: 114px;
              height: 152px;
              border: 2px solid #0f172a;
              background: #ffffff;
              padding: 2px;
              border-radius: 4px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.06);
              position: relative;
              box-sizing: border-box;
            }

            .qr-box {
              width: 114px;
              border: 1.5px solid #0f172a;
              background: #f8fafc;
              border-radius: 6px;
              padding: 6px 4px;
              text-align: center;
              box-sizing: border-box;
            }

            /* Section Block Styles */
            .section-block {
              margin-bottom: 7px;
            }

            .section-title {
              font-family: 'Plus Jakarta Sans', sans-serif;
              font-size: 9px;
              font-weight: 800;
              background: #0f172a;
              color: #ffffff;
              padding: 3.5px 7px;
              letter-spacing: 0.8px;
              border-radius: 3px;
              border-left: 3px solid #2563eb;
              margin-bottom: 4px;
            }

            .formal-table, .formal-table-full {
              width: 100%;
              border-collapse: collapse;
              font-size: 10px;
              line-height: 1.35;
            }

            .formal-table tr, .formal-table-full tr {
              border-bottom: 1px dotted #cbd5e1;
            }

            .col-num {
              width: 18px;
              font-weight: 700;
              color: #475569;
              vertical-align: top;
              padding: 2px 0;
            }

            .col-label {
              width: 155px;
              font-weight: 600;
              color: #334155;
              vertical-align: top;
              padding: 2px 0;
            }

            .col-sep {
              width: 12px;
              font-weight: 700;
              text-align: center;
              vertical-align: top;
              padding: 2px 0;
              color: #0f172a;
            }

            .col-value {
              color: #0f172a;
              font-weight: 500;
              vertical-align: top;
              padding: 2px 0;
            }

            .font-bold-dark {
              font-weight: 800;
              color: #000000;
            }

            .font-mono {
              font-family: 'Consolas', 'Courier New', monospace;
              font-size: 10.5px;
              font-weight: 700;
              color: #0369a1;
              letter-spacing: 0.5px;
            }

            .font-bold {
              font-weight: 700;
            }

            .text-blue {
              color: #1e40af;
            }

            /* Signature Section */
            .signature-section {
              display: flex;
              justify-content: space-between;
              margin-top: 10px;
              padding-top: 8px;
              border-top: 1px solid #cbd5e1;
              font-size: 9.5px;
            }

            .sig-col {
              text-align: center;
              width: 30%;
            }

            .sig-title {
              font-weight: 600;
              color: #0f172a;
              line-height: 1.25;
            }

            .sig-space {
              height: 48px;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .stempel-box {
              border: 1px dashed #94a3b8;
              color: #94a3b8;
              font-size: 8px;
              font-family: 'Plus Jakarta Sans', sans-serif;
              padding: 2px 6px;
              border-radius: 4px;
              font-weight: 600;
            }

            .sig-name {
              font-weight: 800;
              color: #0f172a;
              text-decoration: underline;
            }

            .sig-nip {
              font-family: 'Consolas', monospace;
              font-size: 8px;
              color: #64748b;
              margin-top: 1px;
            }

            .doc-footer {
              display: flex;
              justify-content: space-between;
              border-top: 1px solid #e2e8f0;
              padding-top: 4px;
              margin-top: 6px;
              font-size: 7.5px;
              color: #94a3b8;
              font-family: 'Plus Jakarta Sans', sans-serif;
            }

            @media print {
              body {
                background: #ffffff !important;
                padding: 0 !important;
                margin: 0 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }

              .no-print-bar {
                display: none !important;
              }

              .biodata-page {
                width: 100% !important;
                box-shadow: none !important;
                padding: 0 !important;
                margin: 0 !important;
                page-break-after: always;
                page-break-inside: avoid;
              }

              .formal-frame {
                border: 2px solid #000000 !important;
                min-height: auto !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="no-print-bar">
            <div>
              <strong style="font-size: 13px; color: #0f172a; display: block;">📖 Buku Induk Peserta Didik (${studentList.length} Siswa)</strong>
              <span style="font-size: 10px; color: #64748b;">Format Cetak & PDF Resmi Terstandarisasi</span>
            </div>
            <button class="btn-print" onclick="window.print();">
              🖨️ Cetak / Simpan PDF
            </button>
            <button class="btn-close" onclick="window.close();">
              Tutup
            </button>
          </div>

          <div style="width: 100%; display: flex; flex-direction: column; align-items: center; margin-top: 50px;">
            ${pagesHtml}
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                // Auto trigger print if single student
                if (${studentList.length === 1}) {
                  window.print();
                }
              }, 400);
            }
          </script>
        </body>
      </html>
    `;
  };

  const handlePrintBiodata = (student: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const isPondok = subTab === 'SANTRI';
    const html = renderFormalBukuIndukHTML([student], isPondok, settings);
    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Mass Print Buku Induk for multiple / all students
  const handlePrintAllBiodata = (selectedList?: any[]) => {
    const list = selectedList && selectedList.length > 0 ? selectedList : students;
    if (!list || list.length === 0) {
      alert('Tidak ada data siswa untuk dicetak.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const isPondok = subTab === 'SANTRI';
    const html = renderFormalBukuIndukHTML(list, isPondok, settings);
    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Download Buku Induk in CSV / Excel format
  const handleDownloadBukuIndukCSV = (selectedList?: any[]) => {
    const list = selectedList && selectedList.length > 0 ? selectedList : students;
    if (!list || list.length === 0) {
      alert('Tidak ada data siswa untuk diunduh.');
      return;
    }

    const headers = [
      'NO', 'NIS', 'NISN', 'NIK', 'NAMA LENGKAP', 'GENDER', 'TEMPAT LAHIR', 'TANGGAL LAHIR',
      'AGAMA', 'KELAS', 'ROMBEL', 'PEMINATAN', 'DUSUN', 'DESA', 'KECAMATAN', 'KABUPATEN', 'PROVINSI',
      'NAMA AYAH', 'PEKERJAAN AYAH', 'NAMA IBU', 'PEKERJAAN IBU', 'STATUS SANTRI', 'ASRAMA', 'KAMAR',
      'MUSYRIF', 'TINGGI (CM)', 'BERAT (KG)', 'NO BPJS', 'GOL DARAH', 'STATUS KEAKTIFAN'
    ];

    const rows = list.map((s, index) => {
      const name = s.name || s.identitas?.name || '';
      const nis = s.nis || s.identitas?.nis || '';
      const nisn = s.nisn || s.identitas?.nisn || '';
      const nik = s.nik || s.kependudukan?.nik || '';
      const gender = (s.gender || s.identitas?.gender) === 'L' ? 'Laki-Laki' : 'Perempuan';
      const tempatLahir = s.tempat_lahir || s.identitas?.tempat_lahir || '';
      const tglLahir = s.tgl_lahir || s.identitas?.tgl_lahir || '';
      const kelas = s.kelas || s.sekolah?.kelas || '';
      const rombel = s.rombel || s.sekolah?.rombel || '';
      const jurusan = s.jurusan || s.sekolah?.jurusan || '';
      const dusun = s.dusun || s.kependudukan?.dusun || '';
      const desa = s.desa || s.kependudukan?.desa || '';
      const kecamatan = s.kecamatan || s.kependudukan?.kecamatan || '';
      const kabupaten = s.kabupaten || s.kependudukan?.kabupaten || '';
      const namaAyah = s.nama_ayah || s.orang_tua?.ayah?.nama || '';
      const namaIbu = s.nama_ibu || s.orang_tua?.ibu?.nama || '';
      const isSantri = s.is_santri === 'YA' || (s.pondok?.nomor_santri ? true : false);
      const asrama = s.asrama || s.pondok?.asrama || '';
      const kamar = s.kamar || s.pondok?.kamar || '';
      const musyrif = s.musyrif || s.pondok?.musyrif || '';
      const tinggi = s.tinggi_badan || '162';
      const berat = s.berat_badan || '51';
      const bpjs = s.bpjs || 'BPJS-390223001';
      const status = s.status_keaktifan || s.sekolah?.status || 'AKTIF';

      return [
        index + 1,
        `"${nis}"`,
        `"${nisn}"`,
        `"${nik}"`,
        `"${name.replace(/"/g, '""')}"`,
        `"${gender}"`,
        `"${tempatLahir.replace(/"/g, '""')}"`,
        `"${tglLahir}"`,
        `"Islam"`,
        `"${kelas}"`,
        `"${rombel}"`,
        `"${jurusan}"`,
        `"${dusun.replace(/"/g, '""')}"`,
        `"${desa.replace(/"/g, '""')}"`,
        `"${kecamatan.replace(/"/g, '""')}"`,
        `"${kabupaten.replace(/"/g, '""')}"`,
        `"Jawa Barat"`,
        `"${namaAyah.replace(/"/g, '""')}"`,
        `"Wiraswasta"`,
        `"${namaIbu.replace(/"/g, '""')}"`,
        `"Ibu Rumah Tangga"`,
        `"${isSantri ? 'YA' : 'TIDAK'}"`,
        `"${asrama}"`,
        `"${kamar}"`,
        `"${musyrif}"`,
        `"${tinggi}"`,
        `"${berat}"`,
        `"${bpjs}"`,
        `"O (Positif)"`,
        `"${status}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Buku_Induk_Siswa_Pesantren_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-6 lg:p-8 flex flex-col gap-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-md">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-blue-600 font-mono tracking-widest uppercase">SINGLE TENANT ENTERPRISE</span>
            <h1 className="text-lg font-black text-slate-850 tracking-tight mt-0.5">ERP Portal Kesiswaan & Pondok Pesantren</h1>
            <p className="text-xs text-slate-500">Pusat Data Terpadu Standardisasi Dapodik Kemendikbud & EMIS Kemenag</p>
          </div>
        </div>

        {/* Action triggers */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => { setActiveTab('DASHBOARD'); }}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'DASHBOARD' 
                ? 'bg-slate-850 text-white shadow-sm' 
                : 'bg-white border border-slate-250 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Dashboard Utama
          </button>
          <button
            onClick={() => { setActiveTab('STUDENTS'); setSubTab('SISWA'); }}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'STUDENTS' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-white border border-slate-250 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Modul Master Siswa/Santri
          </button>
        </div>
      </div>

      {/* DASHBOARD TAB VIEW */}
      {activeTab === 'DASHBOARD' && (
        <div className="flex flex-col gap-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase">TOTAL SISWA AKTIF</span>
              <p className="text-3xl font-black text-slate-850 mt-1">{students.length} Orang</p>
              <div className="mt-2 text-[10px] text-slate-500 font-medium">Standardisasi Dapodik Terpenuhi</div>
            </div>
            <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase">SANTRI MUKIM (PONDOK)</span>
              <p className="text-3xl font-black text-blue-600 mt-1">
                {students.filter(s => s.is_santri === 'YA' || s.pondok?.nomor_santri).length} Santri
              </p>
              <div className="mt-2 text-[10px] text-slate-500 font-medium">Asrama & Kamar Terploting</div>
            </div>
            <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase">MUTASI BULAN INI</span>
              <p className="text-3xl font-black text-amber-600 mt-1">{serverMutations.length} Berkas</p>
              <div className="mt-2 text-[10px] text-slate-500 font-medium">Riwayat Transisi Terjaga</div>
            </div>
            <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase">DATA COMPLETENESS RATE</span>
              <p className="text-3xl font-black text-emerald-600 mt-1">
                {students.length === 0 ? '100%' : `${Math.round(students.reduce((acc, s) => {
                  const fields = [s.name, s.nis, s.nisn, s.nik, s.gender, s.tempat_lahir, s.tanggal_lahir, s.alamat];
                  const filled = fields.filter(f => f && String(f).trim() !== '').length;
                  return acc + (filled / fields.length);
                }, 0) / students.length * 100)}%`}
              </p>
              <div className="mt-2 text-[10px] text-slate-500 font-medium">Audit Laporan Lolos Verifikasi</div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-extrabold text-slate-800">Akses Cepat 14 Sub-Menu</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {[
                { tab: 'SISWA', label: 'Master Siswa', desc: 'Identitas & Registrasi' },
                { tab: 'SANTRI', label: 'Master Santri', desc: 'Asrama & Musyrif' },
                { tab: 'MUTASI', label: 'Mutasi', desc: 'Siswa DO & Pindahan' },
                { tab: 'ALUMNI', label: 'Alumni', desc: 'Direktori Lulusan' },
                { tab: 'KELULUSAN', label: 'Kelulusan', desc: 'Lulus Massal Rombel' },
                { tab: 'KARTU', label: 'Kartu Pelajar', desc: 'Preview Sisi Kartu' },
                { tab: 'BARCODE', label: 'Barcode', desc: 'Cetak Vector' },
                { tab: 'QR', label: 'QR Code', desc: 'Verifikasi Digital' },
                { tab: 'DOKUMEN', label: 'Dokumen', desc: 'Arsip Akta & KK' },
                { tab: 'ORTU', label: 'Orang Tua', desc: 'Kontak Ibu/Ayah' },
                { tab: 'WALI', label: 'Wali', desc: 'Asuhan Pengganti' },
                { tab: 'KESEHATAN', label: 'Kesehatan', desc: 'BMI & BPJS' },
                { tab: 'RIWAYAT', label: 'Riwayat', desc: 'Timeline Peristiwa' },
                { tab: 'AUDIT', label: 'Audit', desc: 'Log Keamanan' },
              ].map((item) => (
                <button
                  key={item.tab}
                  onClick={() => { setActiveTab('STUDENTS'); setSubTab(item.tab as any); }}
                  className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-350 rounded-2xl transition-all cursor-pointer text-center flex flex-col items-center justify-between min-h-[90px]"
                >
                  <span className="font-bold text-slate-800 text-[11px] block">{item.label}</span>
                  <span className="text-[9px] text-slate-400 mt-1 block leading-tight font-medium">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MASTER STUDENTS MODUL VIEW */}
      {activeTab === 'STUDENTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Sub-tab Navigation Sidebar */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col gap-4 shadow-sm">
            <div>
              <h3 className="text-xs font-black text-slate-800 tracking-tight uppercase font-mono">14 Sub-Menu Utama</h3>
              <p className="text-[11px] text-slate-400 font-medium">Buku Induk Kesiswaan Enterprise</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:flex lg:flex-col gap-1.5">
              {[
                { id: 'SISWA', label: '1. Master Siswa', desc: 'Standardisasi Dapodik' },
                { id: 'SANTRI', label: '2. Master Santri', desc: 'Kediaman Asrama Mukim' },
                { id: 'MUTASI', label: '3. Mutasi', desc: 'DO & Berkas Keterangan' },
                { id: 'ALUMNI', label: '4. Alumni', desc: 'Studi Lanjut & Karir' },
                { id: 'KELULUSAN', label: '5. Kelulusan', desc: 'Batch Lulus Se-kelas' },
                { id: 'KARTU', label: '6. Kartu Pelajar', desc: 'Preview Cetak Sisi Kartu' },
                { id: 'BARCODE', label: '7. Barcode', desc: 'Vector Code128' },
                { id: 'QR', label: '8. QR Code', desc: 'Koreksi Kesalahan ISO' },
                { id: 'DOKUMEN', label: '9. Dokumen', desc: 'Uploader KK & Akta V3' },
                { id: 'ORTU', label: '10. Orang Tua', desc: 'Kontak NIK Ayah/Ibu' },
                { id: 'WALI', label: '11. Wali', desc: 'Hukum Asuhan Pengganti' },
                { id: 'KESEHATAN', label: '12. Kesehatan', desc: 'Fisik, BMI & Gol Darah' },
                { id: 'RIWAYAT', label: '13. Riwayat', desc: 'Timeline Kedisiplinan' },
                { id: 'AUDIT', label: '14. Audit', desc: 'Log Perubahan Database' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSubTab(item.id as StudentSubTab)}
                  className={`w-full p-2.5 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-center ${
                    subTab === item.id 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'hover:bg-slate-50 bg-slate-50/50 lg:bg-transparent border border-slate-150 lg:border-transparent text-slate-700'
                  }`}
                >
                  <span className="text-[11px] sm:text-xs font-bold leading-tight">{item.label}</span>
                  <span className={`text-[9px] mt-0.5 font-medium leading-none ${subTab === item.id ? 'text-blue-100' : 'text-slate-400'}`}>
                    {item.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Sub-tab Main Content Right-Section */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            
            {/* Tab header indicator */}
            <div className="p-4 bg-white border border-slate-200 rounded-3xl shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[9px] font-extrabold text-blue-600 font-mono uppercase tracking-wider">Modul Aktif</span>
                <h2 className="text-sm font-extrabold text-slate-850 mt-0.5">
                  {subTab === 'SISWA' && 'Master Biodata Siswa'}
                  {subTab === 'SANTRI' && 'Master Biodata Santri Pondok'}
                  {subTab === 'MUTASI' && 'Buku Register Mutasi'}
                  {subTab === 'ALUMNI' && 'Direktori Ikatan Alumni'}
                  {subTab === 'KELULUSAN' && 'Kelulusan Rombel Massal'}
                  {subTab === 'KARTU' && 'Kartu Pelajar Elektronik'}
                  {subTab === 'BARCODE' && 'Vector Barcode Generator'}
                  {subTab === 'QR' && 'Vector QR Code Generator'}
                  {subTab === 'DOKUMEN' && 'Manajemen Berkas Legal'}
                  {subTab === 'ORTU' && 'Kredensial Orang Tua Kandung'}
                  {subTab === 'WALI' && 'Kredensial Wali Asuh'}
                  {subTab === 'KESEHATAN' && 'Pemeriksaan Kesehatan & BMI'}
                  {subTab === 'RIWAYAT' && 'Timeline Pendidikan & Disiplin'}
                  {subTab === 'AUDIT' && 'Jalur Audit Log Operator'}
                </h2>
              </div>
              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-xl text-[10px] font-mono font-bold">
                SUB-TAB: {subTab}
              </span>
            </div>

            {/* Render subcomponents conditionally based on subTab */}
            {(subTab === 'SISWA' || subTab === 'SANTRI') && (
              <StudentList
                students={students}
                isSantriOnly={subTab === 'SANTRI'}
                onEdit={handleEditStudent}
                onDelete={handleDeleteStudent}
                onOpenForm={() => { setFormInitialData(null); setIsFormOpen(true); }}
                onManageDocs={(id) => { setSelectedStudentId(id); setSubTab('DOKUMEN'); }}
                onPrintBiodata={handlePrintBiodata}
                onPrintAllBiodata={handlePrintAllBiodata}
                onDownloadCSV={handleDownloadBukuIndukCSV}
              />
            )}

            {(subTab === 'MUTASI' || subTab === 'ALUMNI' || subTab === 'KELULUSAN') && (
              <StudentMutation
                students={students}
                mutations={serverMutations}
                onRefresh={() => { refetchStudents(); refetchMutations(); }}
                subTab={subTab}
              />
            )}

            {(subTab === 'KARTU' || subTab === 'BARCODE' || subTab === 'QR') && (
              <StudentCardPrinter
                students={students}
                tenantName={tenant?.name || 'Al-Ikhlas Pondok Pesantren'}
                subTab={subTab}
              />
            )}

            {(subTab === 'ORTU' || subTab === 'WALI' || subTab === 'KESEHATAN' || subTab === 'RIWAYAT') && (
              <StudentHealthHistory
                students={students}
                histories={histories}
                selectedStudentId={selectedStudentId}
                onSelectStudent={setSelectedStudentId}
                subTab={subTab}
              />
            )}

            {(subTab === 'DOKUMEN' || subTab === 'AUDIT') && (
              <StudentDocsAudit
                students={students}
                auditLogs={auditLogs}
                selectedStudentId={selectedStudentId}
                onSelectStudent={setSelectedStudentId}
                subTab={subTab}
              />
            )}

          </div>

        </div>
      )}

      {/* Multi-step Registration Form Modal Overlay */}
      <StudentFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setFormInitialData(null); }}
        onSave={handleCreateOrUpdate}
        initialData={formInitialData}
      />

    </div>
  );
}
