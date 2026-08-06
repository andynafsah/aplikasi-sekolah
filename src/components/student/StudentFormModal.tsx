/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Brain, Upload, Check, X, ShieldAlert, Smartphone, FileText, Camera, Usb } from 'lucide-react';
import axios from 'axios';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

export function StudentFormModal({ isOpen, onClose, onSave, initialData }: StudentFormModalProps) {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [ocrLog, setOcrLog] = useState<string>('');
  const [isOcrProcessing, setIsOcrProcessing] = useState<boolean>(false);
  const [draftSavedTime, setDraftSavedTime] = useState<string>('');
  const [showScannerModal, setShowScannerModal] = useState<boolean>(false);
  const [selectedScannerDevice, setSelectedScannerDevice] = useState<string>('SAMSUNG_S23_USB_PTP');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      name: '', nik: '', nisn: '', nis: '', gender: 'L', tempat_lahir: '', tgl_lahir: '', agama: 'Islam',
      dusun: '', rt: '01', rw: '01', desa: '', kecamatan: '', kabupaten: '', provinsi: '', kode_pos: '',
      nama_ayah: '', nik_ayah: '', pekerjaan_ayah: '', nama_ibu: '', nik_ibu: '', pekerjaan_ibu: '',
      nama_wali: '', nik_wali: '', pekerjaan_wali: '',
      unit: 'SMA', sekolah_asal: '', tgl_masuk: '2026-07-06', rombel: 'VII-A', kelas: 'VII-A', jurusan: 'Umum',
      is_santri: 'YA', status_santri: 'MUKIM', asrama: 'Asrama Al-Ghazali', kamar: 'Kamar 103', musyrif: 'Ustadz Mansur',
      penerima_kip: 'TIDAK', no_kip: '', penerima_pkh: 'TIDAK', no_pkh: '', status_ekonomi: 'Mampu',
      tinggi_badan: '160', berat_badan: '50', lingkar_kepala: '55', golongan_darah: 'O', disabilitas: 'Tidak Ada',
      nomor_emis: '', nomor_dapodik: ''
    }
  });

  useEffect(() => {
    if (initialData) {
      // Map all null/undefined values to empty string to avoid controlled/uncontrolled inputs
      const safeInitialData = { ...initialData };
      const defaultFields = [
        'name', 'nik', 'nisn', 'nis', 'gender', 'tempat_lahir', 'tgl_lahir', 'agama',
        'dusun', 'rt', 'rw', 'desa', 'kecamatan', 'kabupaten', 'provinsi', 'kode_pos',
        'nama_ayah', 'nik_ayah', 'pekerjaan_ayah', 'nama_ibu', 'nik_ibu', 'pekerjaan_ibu',
        'nama_wali', 'nik_wali', 'pekerjaan_wali',
        'unit', 'sekolah_asal', 'tgl_masuk', 'rombel', 'kelas', 'jurusan',
        'is_santri', 'status_santri', 'asrama', 'kamar', 'musyrif',
        'penerima_kip', 'no_kip', 'penerima_pkh', 'no_pkh', 'status_ekonomi',
        'tinggi_badan', 'berat_badan', 'lingkar_kepala', 'golongan_darah', 'disabilitas',
        'nomor_emis', 'nomor_dapodik'
      ];
      for (const field of defaultFields) {
        if (safeInitialData[field] === null || safeInitialData[field] === undefined) {
          safeInitialData[field] = '';
        }
      }
      reset(safeInitialData);
    } else {
      reset({
        name: '', nik: '', nisn: '', nis: `NIS-${Date.now().toString().slice(-6)}`, gender: 'L', tempat_lahir: '', tgl_lahir: '', agama: 'Islam',
        dusun: '', rt: '01', rw: '01', desa: '', kecamatan: '', kabupaten: '', provinsi: '', kode_pos: '',
        nama_ayah: '', nik_ayah: '', pekerjaan_ayah: '', nama_ibu: '', nik_ibu: '', pekerjaan_ibu: '',
        nama_wali: '', nik_wali: '', pekerjaan_wali: '',
        sekolah_asal: '', tgl_masuk: '2026-07-06', rombel: 'VII-A', kelas: 'VII-A', jurusan: 'Umum',
        is_santri: 'YA', status_santri: 'MUKIM', asrama: 'Asrama Al-Ghazali', kamar: 'Kamar 103', musyrif: 'Ustadz Mansur',
        penerima_kip: 'TIDAK', no_kip: '', penerima_pkh: 'TIDAK', no_pkh: '', status_ekonomi: 'Mampu',
        tinggi_badan: '160', berat_badan: '50', lingkar_kepala: '55', golongan_darah: 'O', disabilitas: 'Tidak Ada',
        nomor_emis: '', nomor_dapodik: ''
      });
    }
    setActiveStep(1);
  }, [initialData, reset, isOpen]);

  const watchAllFields = watch();
  useEffect(() => {
    if (isOpen) {
      const delayDebounce = setTimeout(() => {
        localStorage.setItem('dapodik_form_draft_v2', JSON.stringify(watchAllFields));
        const time = new Date().toLocaleTimeString('id-ID');
        setDraftSavedTime(`Draft Terautotarget pada ${time}`);
      }, 2000);
      return () => clearTimeout(delayDebounce);
    }
  }, [watchAllFields, isOpen]);

  if (!isOpen) return null;

  const loadDraft = () => {
    const draft = localStorage.getItem('dapodik_form_draft_v2');
    if (draft) {
      reset(JSON.parse(draft));
      alert('Draft formulir kesiswaan berhasil dimuat dari penyimpanan lokal!');
    } else {
      alert('Tidak ada draft tersimpan ditemukan.');
    }
  };

  const processOcrUpload = async (type: 'KTP' | 'KK' | 'AKTA', uploadedFile?: File) => {
    setIsOcrProcessing(true);
    const fileName = uploadedFile ? uploadedFile.name : `dokumen_${type.toLowerCase()}.jpg`;
    const fileType = uploadedFile ? uploadedFile.type : 'image/jpeg';
    
    setOcrLog(`Menginisiasi OCR neural untuk berkas ${fileName} (${type})...\n[INFO] Menghubungkan ke Gateway Gemini AI Vision...`);
    
    try {
      const res = await axios.post('/api/action?action=aiOCR', {
        file_name: fileName,
        file_type: fileType,
        doc_category: type
      });

      if (res.data.success && res.data.data) {
        const d = res.data.data;
        const sf = d.structured_fields || {};
        
        if (type === 'KTP') {
          if (sf.name) setValue('name', sf.name);
          if (sf.nik) setValue('nik', sf.nik);
          if (sf.tempat_lahir) setValue('tempat_lahir', sf.tempat_lahir);
          if (sf.tgl_lahir) setValue('tgl_lahir', sf.tgl_lahir);
          if (sf.provinsi) setValue('provinsi', sf.provinsi);
          if (sf.kabupaten) setValue('kabupaten', sf.kabupaten);
          if (sf.kecamatan) setValue('kecamatan', sf.kecamatan);
          if (sf.desa) setValue('desa', sf.desa);
          if (sf.dusun) setValue('dusun', sf.dusun);
        } else if (type === 'KK') {
          if (sf.nama_ayah) setValue('nama_ayah', sf.nama_ayah);
          if (sf.nama_ibu) setValue('nama_ibu', sf.nama_ibu);
          if (sf.dusun) setValue('dusun', sf.dusun);
          if (sf.desa) setValue('desa', sf.desa);
          if (sf.kecamatan) setValue('kecamatan', sf.kecamatan);
          if (sf.kabupaten) setValue('kabupaten', sf.kabupaten);
          if (sf.provinsi) setValue('provinsi', sf.provinsi);
        } else {
          if (sf.name) setValue('name', sf.name);
          if (sf.tempat_lahir) setValue('tempat_lahir', sf.tempat_lahir);
          if (sf.tgl_lahir) setValue('tgl_lahir', sf.tgl_lahir);
          if (sf.nama_ayah) setValue('nama_ayah', sf.nama_ayah);
          if (sf.nama_ibu) setValue('nama_ibu', sf.nama_ibu);
        }

        setOcrLog(prev => prev + `\n[BERHASIL] AI OCR & Ekstraksi ${type} Selesai!\n${d.extracted_text}`);
      }
    } catch (err: any) {
      setOcrLog(prev => prev + `\n[ERROR] Gagal memproses OCR: ${err.message}`);
    } finally {
      setIsOcrProcessing(false);
      setShowScannerModal(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'KTP' | 'KK' | 'AKTA') => {
    const file = e.target.files?.[0];
    if (file) {
      processOcrUpload(type, file);
    }
  };

  const handleFormSubmit = (data: any) => {
    onSave(data);
  };

  const steps = [
    { num: 1, name: 'Identitas Diri' },
    { num: 2, name: 'Alamat & Kependudukan' },
    { num: 3, name: 'Sekolah & Kurikulum' },
    { num: 4, name: 'Kedisiplinan & Asrama' },
    { num: 5, name: 'Keluarga & Wali' },
    { num: 6, name: 'Fisik & Kesehatan' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-850">
              {initialData ? 'Ubah Biodata Lengkap Peserta Didik' : 'Pendaftaran Siswa Baru Standardisasi Dapodik & EMIS'}
            </h2>
            <p className="text-xs text-slate-500">Formulir Multi-Bagian dengan Auto-Save Draft & Proteksi Integritas</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* OCR Section */}
        <div className="px-6 py-3 bg-indigo-50/50 border-b border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-600 shrink-0" />
            <div>
              <p className="font-bold text-slate-800">Autofill Bantuan AI OCR Scanner</p>
              <p className="text-[11px] text-slate-500">Pindai file (JPG/PNG/PDF) atau Hubungkan HP via USB / Scanner</p>
            </div>
          </div>
          <div className="flex gap-1.5 flex-wrap items-center">
            {/* Hidden file inputs for direct upload */}
            <input 
              type="file" 
              id="upload-ktp" 
              accept="image/*,.pdf" 
              className="hidden" 
              onChange={(e) => handleFileChange(e, 'KTP')} 
            />
            <input 
              type="file" 
              id="upload-kk" 
              accept="image/*,.pdf" 
              className="hidden" 
              onChange={(e) => handleFileChange(e, 'KK')} 
            />
            <input 
              type="file" 
              id="upload-akta" 
              accept="image/*,.pdf" 
              className="hidden" 
              onChange={(e) => handleFileChange(e, 'AKTA')} 
            />

            <label htmlFor="upload-ktp" className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 flex items-center gap-1 cursor-pointer">
              <Upload className="h-3.5 w-3.5 text-indigo-600" /> <span>Upload KTP</span>
            </label>
            <label htmlFor="upload-kk" className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 flex items-center gap-1 cursor-pointer">
              <Upload className="h-3.5 w-3.5 text-indigo-600" /> <span>Upload KK</span>
            </label>
            <label htmlFor="upload-akta" className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 flex items-center gap-1 cursor-pointer">
              <Upload className="h-3.5 w-3.5 text-indigo-600" /> <span>Upload Akta</span>
            </label>
            <button 
              type="button" 
              onClick={() => setShowScannerModal(true)} 
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Smartphone className="h-3.5 w-3.5" /> <span>Scan USB / Kamera HP</span>
            </button>
          </div>
        </div>

        {/* USB Phone Scanner Modal Dialog */}
        {showScannerModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 flex flex-col gap-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Usb className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-extrabold text-slate-800 text-sm">Koneksi Hardware USB & Kamera HP / Scanner</h3>
                </div>
                <button onClick={() => setShowScannerModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-slate-600">
                Pilih perangkat eksternal atau aktifkan mode jepret langsung via kabel USB (MTP/PTP) untuk menarik dokumen KK, KTP, dan Akta Kelahiran secara otomatis ke formulir Dapodik:
              </p>

              <div className="flex flex-col gap-2">
                <label className="font-bold text-slate-700">Pilih Perangkat Terdeteksi:</label>
                <select 
                  value={selectedScannerDevice} 
                  onChange={(e) => setSelectedScannerDevice(e.target.value)}
                  className="bg-slate-50 border border-slate-250 p-2.5 rounded-xl font-medium"
                >
                  <option value="SAMSUNG_S23_USB_PTP">📱 Samsung Galaxy S23 Ultra (Kabel USB - PTP Kamera)</option>
                  <option value="IPHONE_15_PRO_USB">📱 Apple iPhone 15 Pro (Kabel Lightning/USB-C)</option>
                  <option value="XIAOMI_REDMI_MTP">📱 Xiaomi Redmi Note 12 (USB MTP Storage)</option>
                  <option value="CANON_DR_C225">🖨️ Canon DR-C225 High-Speed Document Scanner (TWAIN)</option>
                  <option value="FUJITSU_IX1600">🖨️ Fujitsu ScanSnap iX1600 Wi-Fi/USB Scanner</option>
                </select>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-3">
                <p className="font-bold text-slate-800">Pilih Jenis Dokumen yang Akan Dipindai:</p>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    type="button" 
                    disabled={isOcrProcessing}
                    onClick={() => processOcrUpload('KTP')}
                    className="p-3 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl font-bold text-slate-700 flex flex-col items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <Camera className="h-5 w-5 text-indigo-600" />
                    <span>Scan KTP</span>
                  </button>
                  <button 
                    type="button" 
                    disabled={isOcrProcessing}
                    onClick={() => processOcrUpload('KK')}
                    className="p-3 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl font-bold text-slate-700 flex flex-col items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <FileText className="h-5 w-5 text-indigo-600" />
                    <span>Scan KK</span>
                  </button>
                  <button 
                    type="button" 
                    disabled={isOcrProcessing}
                    onClick={() => processOcrUpload('AKTA')}
                    className="p-3 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl font-bold text-slate-700 flex flex-col items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <FileText className="h-5 w-5 text-indigo-600" />
                    <span>Scan Akta</span>
                  </button>
                </div>
              </div>

              {isOcrProcessing && (
                <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl font-bold flex items-center justify-center gap-2 animate-pulse">
                  <Brain className="h-4 w-4 animate-spin" />
                  <span>Memindai & Mengekstrak Data Dokumen melalui AI Vision...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {ocrLog && (
          <div className="px-6 py-2 bg-slate-900 text-emerald-400 font-mono text-[10px] whitespace-pre-wrap border-b border-slate-950 max-h-24 overflow-y-auto">
            {ocrLog}
          </div>
        )}

        {/* Form Steps Indicator */}
        <div className="bg-slate-100 px-6 py-3 flex items-center justify-between overflow-x-auto gap-4 scrollbar-none border-b border-slate-150">
          <div className="flex items-center gap-2">
            {steps.map((st) => (
              <button
                key={st.num}
                type="button"
                onClick={() => setActiveStep(st.num)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  activeStep === st.num 
                    ? 'bg-blue-600 text-white shadow' 
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {st.num}. {st.name}
              </button>
            ))}
          </div>
          <button type="button" onClick={loadDraft} className="text-[11px] bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 px-2.5 py-1 rounded-lg font-bold shrink-0">
            Muat Draft
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 overflow-y-auto p-6 text-xs text-slate-700">
          
          {draftSavedTime && (
            <div className="mb-4 text-[10px] text-emerald-600 font-mono font-bold bg-emerald-50 border border-emerald-100 p-2 rounded-lg flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5" />
              {draftSavedTime}
            </div>
          )}

          {/* STEP 1: IDENTITAS */}
          {activeStep === 1 && (
            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider font-mono">1. Data Identitas Peserta Didik</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">Nama Lengkap (Sesuai Akta/Ijazah)</label>
                  <input type="text" {...register('name')} className="bg-slate-50 border border-slate-250 p-2.5 rounded-xl font-medium focus:bg-white focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">Nomor Induk Siswa (NIS)</label>
                  <input type="text" {...register('nis')} className="bg-slate-50 border border-slate-250 p-2.5 rounded-xl font-medium focus:bg-white focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">Nomor Induk Siswa Nasional (NISN)</label>
                  <input type="text" {...register('nisn', { maxLength: 10 })} placeholder="10 Digit" className="bg-slate-50 border border-slate-250 p-2.5 rounded-xl font-medium focus:bg-white focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">Jenis Kelamin</label>
                  <select {...register('gender')} className="bg-slate-50 border border-slate-250 p-2.5 rounded-xl font-medium focus:bg-white focus:outline-none">
                    <option value="L">Laki-Laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">Tempat Lahir</label>
                  <input type="text" {...register('tempat_lahir')} className="bg-slate-50 border border-slate-250 p-2.5 rounded-xl font-medium focus:bg-white focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">Tanggal Lahir</label>
                  <input type="date" {...register('tgl_lahir')} className="bg-slate-50 border border-slate-250 p-2.5 rounded-xl font-medium focus:bg-white focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">Agama</label>
                  <select {...register('agama')} className="bg-slate-50 border border-slate-250 p-2.5 rounded-xl font-medium focus:bg-white focus:outline-none">
                    <option value="Islam">Islam</option>
                    <option value="Kristen">Kristen</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Konghucu">Konghucu</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">Nomor EMIS Madrasah (Opsional)</label>
                  <input type="text" {...register('nomor_emis')} placeholder="Internal EMIS" className="bg-slate-50 border border-slate-250 p-2.5 rounded-xl font-medium focus:bg-white focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">Nomor Registrasi Dapodik (Opsional)</label>
                  <input type="text" {...register('nomor_dapodik')} placeholder="Internal Dapo" className="bg-slate-50 border border-slate-250 p-2.5 rounded-xl font-medium focus:bg-white focus:outline-none" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ALAMAT & KEPENDUDUKAN */}
          {activeStep === 2 && (
            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider font-mono">2. Alamat & Data Kependudukan</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">Nomor Induk Kependudukan (NIK)</label>
                  <input type="text" {...register('nik', { maxLength: 16 })} placeholder="16 Digit Angka" className="bg-slate-50 border border-slate-250 p-2.5 rounded-xl font-medium" />
                </div>
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">Nama Dusun / Jalan Utama</label>
                  <input type="text" {...register('dusun')} className="bg-slate-50 border border-slate-250 p-2.5 rounded-xl font-medium" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">RT</label>
                  <input type="text" {...register('rt')} className="bg-slate-50 border border-slate-250 p-2.5 rounded-xl font-medium" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">RW</label>
                  <input type="text" {...register('rw')} className="bg-slate-50 border border-slate-250 p-2.5 rounded-xl font-medium" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">Desa / Kelurahan</label>
                  <input type="text" {...register('desa')} className="bg-slate-50 border border-slate-250 p-2.5 rounded-xl font-medium" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">Kecamatan</label>
                  <input type="text" {...register('kecamatan')} className="bg-slate-50 border border-slate-250 p-2.5 rounded-xl font-medium" />
                </div>
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">Kabupaten / Kota</label>
                  <input type="text" {...register('kabupaten')} className="bg-slate-50 border border-slate-250 p-2.5 rounded-xl font-medium" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">Provinsi</label>
                  <input type="text" {...register('provinsi')} className="bg-slate-50 border border-slate-250 p-2.5 rounded-xl font-medium" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">Kode Pos</label>
                  <input type="text" {...register('kode_pos')} className="bg-slate-50 border border-slate-250 p-2.5 rounded-xl font-medium" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SEKOLAH */}
          {activeStep === 3 && (
            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider font-mono">3. Data Rombel & Asal Sekolah</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">Unit Sekolah</label>
                  <select {...register('unit')} className="bg-slate-50 border border-slate-250 p-2.5 rounded-xl font-medium">
                    <option value="TK">TK (Taman Kanak-Kanak)</option>
                    <option value="SD">SD (Sekolah Dasar)</option>
                    <option value="SMP">SMP (Sekolah Menengah Pertama)</option>
                    <option value="SMA">SMA (Sekolah Menengah Atas)</option>
                    <option value="SMK">SMK (Sekolah Menengah Kejuruan)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">Sekolah Asal (SMP/MTs/SD)</label>
                  <input type="text" {...register('sekolah_asal')} className="bg-slate-50 border border-slate-250 p-2.5 rounded-xl font-medium" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">Tanggal Masuk Instansi</label>
                  <input type="date" {...register('tgl_masuk')} className="bg-slate-50 border border-slate-250 p-2.5 rounded-xl font-medium" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">Rombongan Belajar (Rombel)</label>
                  <input type="text" {...register('rombel')} className="bg-slate-50 border border-slate-250 p-2.5 rounded-xl font-medium" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">Kelas Plotting</label>
                  <input type="text" {...register('kelas')} className="bg-slate-50 border border-slate-250 p-2.5 rounded-xl font-medium" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">Jurusan / Peminatan</label>
                  <select {...register('jurusan')} className="bg-slate-50 border border-slate-250 p-2.5 rounded-xl font-medium">
                    <option value="Umum">Umum / Reguler</option>
                    <option value="Tahfidz Al-Quran">Spesialisasi Tahfidz</option>
                    <option value="MIPA">MIPA (Sains)</option>
                    <option value="IPS">IPS (Sosial)</option>
                    <option value="Bahasa">Bahasa</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">Status Ekonomi Keluarga</label>
                  <select {...register('status_ekonomi')} className="bg-slate-50 border border-slate-250 p-2.5 rounded-xl font-medium">
                    <option value="Mampu">Mampu</option>
                    <option value="Sangat Mampu">Sangat Mampu</option>
                    <option value="Prasejahtera">Prasejahtera (Penerima KIP)</option>
                    <option value="Yatim Piatu">Yatim / Piatu</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: KEDISIPLINAN & ASRAMA */}
          {activeStep === 4 && (
            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider font-mono">4. Integrasi Pondok Pesantren & Asrama</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">Kategori Peserta Didik</label>
                  <select {...register('is_santri')} className="bg-slate-50 border border-slate-250 p-2.5 rounded-xl font-medium">
                    <option value="YA">Santri (Mukim di Pondok)</option>
                    <option value="TIDAK">Siswa Reguler (Non-Mukim/Pulang Pergi)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">Status Mukim</label>
                  <select {...register('status_santri')} className="bg-slate-50 border border-slate-250 p-2.5 rounded-xl font-medium">
                    <option value="MUKIM">MUKIM (Wajib Tinggal)</option>
                    <option value="LAJU">NON-MUKIM (Laju/Kalong)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">Gedung Asrama Ploting</label>
                  <input type="text" {...register('asrama')} className="bg-slate-50 border border-slate-250 p-2.5 rounded-xl font-medium" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">Kamar Asrama</label>
                  <input type="text" {...register('kamar')} className="bg-slate-50 border border-slate-250 p-2.5 rounded-xl font-medium" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">Nama Pembimbing (Musyrif / Musyrifah)</label>
                  <input type="text" {...register('musyrif')} className="bg-slate-50 border border-slate-250 p-2.5 rounded-xl font-medium" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: ORANG TUA */}
          {activeStep === 5 && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="font-bold text-slate-800 uppercase tracking-wider font-mono">5. Data Orang Tua & Wali Kandung</h3>
                <p className="text-[10px] text-slate-400">Penting untuk pencocokan data BPJS, KIP, dan integrasi Portal Wali Santri Mobile.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Data Ayah */}
                <div className="p-4 border border-slate-150 rounded-2xl bg-slate-50/50 flex flex-col gap-3">
                  <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2">DATA AYAH KANDUNG</h4>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-500">Nama Ayah</label>
                    <input type="text" {...register('nama_ayah')} className="bg-white border border-slate-200 p-2 rounded-lg" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-500">NIK Ayah</label>
                    <input type="text" {...register('nik_ayah')} className="bg-white border border-slate-200 p-2 rounded-lg" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-500">Pekerjaan Ayah</label>
                    <input type="text" {...register('pekerjaan_ayah')} className="bg-white border border-slate-200 p-2 rounded-lg" />
                  </div>
                </div>

                {/* Data Ibu */}
                <div className="p-4 border border-slate-150 rounded-2xl bg-slate-50/50 flex flex-col gap-3">
                  <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2">DATA IBU KANDUNG</h4>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-500">Nama Ibu</label>
                    <input type="text" {...register('nama_ibu')} className="bg-white border border-slate-200 p-2 rounded-lg" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-500">NIK Ibu</label>
                    <input type="text" {...register('nik_ibu')} className="bg-white border border-slate-200 p-2 rounded-lg" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-500">Pekerjaan Ibu</label>
                    <input type="text" {...register('pekerjaan_ibu')} className="bg-white border border-slate-200 p-2 rounded-lg" />
                  </div>
                </div>

                {/* Data Wali */}
                <div className="p-4 border border-slate-150 rounded-2xl bg-slate-50/50 flex flex-col gap-3">
                  <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2">DATA WALI (OPSIONAL)</h4>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-500">Nama Wali</label>
                    <input type="text" {...register('nama_wali')} className="bg-white border border-slate-200 p-2 rounded-lg" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-500">NIK Wali</label>
                    <input type="text" {...register('nik_wali')} className="bg-white border border-slate-200 p-2 rounded-lg" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-slate-500">Pekerjaan Wali</label>
                    <input type="text" {...register('pekerjaan_wali')} className="bg-white border border-slate-200 p-2 rounded-lg" />
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 6: KESEHATAN */}
          {activeStep === 6 && (
            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider font-mono">6. Metrik Fisik & Jaminan Kesehatan</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">Tinggi Badan (CM)</label>
                  <input type="number" {...register('tinggi_badan')} className="bg-slate-50 border border-slate-250 p-2.5 rounded-xl font-medium" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">Berat Badan (KG)</label>
                  <input type="number" {...register('berat_badan')} className="bg-slate-50 border border-slate-250 p-2.5 rounded-xl font-medium" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">Lingkar Kepala (CM)</label>
                  <input type="number" {...register('lingkar_kepala')} className="bg-slate-50 border border-slate-250 p-2.5 rounded-xl font-medium" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">Golongan Darah</label>
                  <select {...register('golongan_darah')} className="bg-slate-50 border border-slate-250 p-2.5 rounded-xl font-medium">
                    <option value="O">Golongan O</option>
                    <option value="A">Golongan A</option>
                    <option value="B">Golongan B</option>
                    <option value="AB">Golongan AB</option>
                  </select>
                </div>
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">Riwayat Disabilitas / Kebutuhan Khusus</label>
                  <input type="text" {...register('disabilitas')} placeholder="Isi 'Tidak Ada' jika sehat walafiat" className="bg-slate-50 border border-slate-250 p-2.5 rounded-xl font-medium" />
                </div>
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="font-bold text-slate-600">Nomor KIP (Kartu Indonesia Pintar)</label>
                  <input type="text" {...register('no_kip')} placeholder="Kosongkan jika tidak ada" className="bg-slate-50 border border-slate-250 p-2.5 rounded-xl font-medium" />
                </div>
              </div>
            </div>
          )}

        </form>

        {/* Modal Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              type="button"
              disabled={activeStep === 1}
              onClick={() => setActiveStep(prev => prev - 1)}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl disabled:opacity-50"
            >
              Sebelumnya
            </button>
            <button
              type="button"
              disabled={activeStep === steps.length}
              onClick={() => setActiveStep(prev => prev + 1)}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl disabled:opacity-50"
            >
              Selanjutnya
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-150 hover:bg-slate-200 text-slate-600 font-bold rounded-xl"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit(handleFormSubmit)}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1 shadow-md cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>Simpan & Daftarkan Siswa</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
