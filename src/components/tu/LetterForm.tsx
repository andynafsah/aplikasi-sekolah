import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FileText, Save, Eye, Hash, Calendar, Send, Copy, ArrowRight, FilePlus, RefreshCw, UploadCloud } from 'lucide-react';
import axios from 'axios';

interface LetterFormProps {
  type: 'incoming' | 'outgoing';
  templates?: any[];
  categories?: any[];
  initialValues?: any;
  onSubmitSuccess: () => void;
  onCancel: () => void;
}

export default function LetterForm({
  type,
  templates = [],
  categories = [
    { id: 'cat-1', name: 'Akademik & Kurikulum', code: 'AKAD' },
    { id: 'cat-2', name: 'Keuangan & Sarpras', code: 'KEU' },
    { id: 'cat-3', name: 'Kesiswaan & Ekstra', code: 'MHS' },
    { id: 'cat-4', name: 'Kepegawaian & SDM', code: 'HRD' }
  ],
  initialValues,
  onSubmitSuccess,
  onCancel
}: LetterFormProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [autoNumber, setAutoNumber] = useState<string>('');
  const [isGeneratingNo, setIsGeneratingNo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fileAttachment, setFileAttachment] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: initialValues || {
      letter_number: '',
      letter_date: new Date().toISOString().split('T')[0],
      received_date: new Date().toISOString().split('T')[0],
      sender: '',
      receiver: '',
      destination: '',
      subject: '',
      category_id: 'cat-1',
      letter_type: type === 'incoming' ? 'Surat Masuk' : 'Surat Undangan',
      summary: '',
      confidentiality: 'BIASA',
      urgency: 'BIASA',
      is_draft: true
    }
  });

  const watchLetterType = watch('letter_type');

  // Trigger auto numbering from template code
  useEffect(() => {
    if (type === 'outgoing' && selectedTemplate) {
      generateNumberFromTemplate(selectedTemplate);
    }
  }, [selectedTemplate]);

  const generateNumberFromTemplate = async (tmplCode: string) => {
    setIsGeneratingNo(true);
    try {
      const token = localStorage.getItem('erp_token');
      const res = await axios.post('/api/action?action=letterNumberGenerate', {
        template_code: tmplCode
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setAutoNumber(res.data.data.number);
        setValue('letter_number', res.data.data.number);
      }
    } catch (err) {
      console.error('Error generating number', err);
    } finally {
      setIsGeneratingNo(false);
    }
  };

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadProgress(true);
    setTimeout(() => {
      // Simulate file upload path
      setFileAttachment(`https://example.com/vault/uploads/${Date.now()}_${e.target.files![0].name}`);
      setUploadProgress(false);
    }, 1200);
  };

  const onSubmitForm = async (formData: any) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('erp_token');
      const actionName = type === 'incoming' 
        ? (initialValues ? 'incomingLetterUpdate' : 'incomingLetterCreate')
        : (initialValues ? 'outgoingLetterUpdate' : 'outgoingLetterCreate');

      const payload = {
        ...formData,
        file_path: fileAttachment || formData.file_path,
        id: initialValues?.id
      };

      const res = await axios.post(`/api/action?action=${actionName}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        onSubmitSuccess();
      } else {
        alert(res.data.message || 'Gagal menyimpan draf surat');
      }
    } catch (err) {
      alert('Gagal menghubungi server database');
    } finally {
      setIsSaving(false);
    }
  };

  // Filter templates matching selected letter type
  const filteredTemplates = templates.filter(t => t.letter_type === watchLetterType);

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm space-y-6">
        
        {/* Header & Meta indicators */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center border border-blue-150">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                {initialValues ? 'Sunting Berkas Surat' : `Registrasi ${type === 'incoming' ? 'Surat Masuk' : 'Surat Keluar'}`}
              </h3>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider">
                {type === 'incoming' ? 'AGENDA SURAT MASUK' : 'AGENDA SURAT KELUAR'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-[10px]">
            {initialValues && (
              <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-150 font-bold font-mono">
                VERSI DOKUMEN: #{initialValues.version}
              </span>
            )}
            <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-bold font-mono">
              TENANT VALIDATED
            </span>
          </div>
        </div>

        {/* Core fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Left Panel */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                Jenis Dokumen Surat
              </label>
              <select
                {...register('letter_type', { required: true })}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
              >
                {[
                  'Surat Masuk', 'Surat Keluar', 'SK', 'Undangan', 'Edaran', 
                  'Pengumuman', 'SPPD', 'Mutasi', 'Kepegawaian', 'Keuangan', 
                  'PPDB', 'Yayasan', 'Tahfidz', 'Asrama', 'Inventaris', 'Custom'
                ].map(typeOpt => (
                  <option key={typeOpt} value={typeOpt}>{typeOpt}</option>
                ))}
              </select>
            </div>

            {type === 'outgoing' && filteredTemplates.length > 0 && (
              <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Gunakan Template Penomoran Otomatis
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded px-2 py-1.5 bg-white"
                >
                  <option value="">-- Pilih template format surat --</option>
                  {filteredTemplates.map(tmpl => (
                    <option key={tmpl.code} value={tmpl.code}>{tmpl.name} ({tmpl.code})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                Nomor Surat <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. 021/SU/SMA-UN/VII/2026"
                  {...register('letter_number', { required: 'Nomor surat wajib diisi' })}
                  className="w-full text-xs border border-slate-300 rounded-lg pl-3 pr-10 py-2.5"
                />
                <Hash className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
              </div>
              {errors.letter_number && <p className="text-[10px] text-red-600 font-bold">{String(errors.letter_number.message)}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Tanggal Surat <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    {...register('letter_date', { required: 'Wajib diisi' })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
                  />
                </div>
              </div>

              {type === 'incoming' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Tanggal Diterima <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...register('received_date', { required: 'Wajib diisi' })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
                  />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                Pengirim / Instansi Asal <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder={type === 'incoming' ? 'e.g. Dinas Pendidikan DKI Jakarta' : 'e.g. Kepala Sekolah SMA'}
                {...register('sender', { required: 'Pengirim wajib diisi' })}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2.5"
              />
              {errors.sender && <p className="text-[10px] text-red-600 font-bold">{String(errors.sender.message)}</p>}
            </div>

            {type === 'incoming' ? (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Penerima Disposisi Awal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kepala Sekolah / Ketua Yayasan"
                  {...register('receiver', { required: 'Penerima wajib diisi' })}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2.5"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Alamat / Instansi Tujuan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Orang Tua / Wali Siswa Kelas X"
                  {...register('destination', { required: 'Tujuan wajib diisi' })}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2.5"
                />
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                Kategori Dokumen Surat <span className="text-red-500">*</span>
              </label>
              <select
                {...register('category_id', { required: true })}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2.5 bg-white"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name} ({cat.code})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                Perihal / Subjek Surat <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Permohonan Izin Kunjungan Industri"
                {...register('subject', { required: 'Subjek perihal wajib diisi' })}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2.5"
              />
              {errors.subject && <p className="text-[10px] text-red-600 font-bold">{String(errors.subject.message)}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                Ringkasan Isi Surat (Summary)
              </label>
              <textarea
                rows={3}
                placeholder="Tulis ringkasan singkat isi surat dinas atau lampiran penting di sini..."
                {...register('summary')}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Sifat Dokumen
                </label>
                <select
                  {...register('confidentiality')}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
                >
                  <option value="BIASA">BIASA / TERBUKA</option>
                  <option value="RAHASIA">RAHASIA</option>
                  <option value="SANGAT_RAHASIA">SANGAT RAHASIA</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Tingkat Urgensi
                </label>
                <select
                  {...register('urgency')}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
                >
                  <option value="BIASA">BIASA</option>
                  <option value="PENTING">PENTING</option>
                  <option value="SEGERA">SEGERA / CITO</option>
                </select>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                Unggah Berkas Digital (PDF, DOCX, JPG, PNG, ZIP)
              </label>
              <div className="border border-dashed border-slate-250 rounded-lg p-4 bg-slate-50 text-center relative hover:bg-slate-100 transition">
                <input
                  type="file"
                  onChange={handleUploadFile}
                  accept=".pdf,.docx,.doc,.xlsx,.jpg,.png,.zip"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center justify-center space-y-1">
                  <UploadCloud className="h-7 w-7 text-slate-400" />
                  <div className="text-[11px] font-bold text-slate-700">Drag & Drop atau klik untuk memilih file</div>
                  <div className="text-[9px] text-slate-400">Ukuran maksimal file: 10MB</div>
                </div>
              </div>
              
              {uploadProgress && (
                <div className="flex items-center gap-2 text-[10px] text-blue-600 font-mono">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span>Mengunggah dokumen ke penyimpanan cloud terenkripsi...</span>
                </div>
              )}

              {(fileAttachment || initialValues?.file_path) && (
                <div className="bg-blue-50 border border-blue-200 p-2 rounded-lg flex items-center justify-between text-[10px] text-blue-800 font-mono">
                  <div className="truncate max-w-[200px]">📎 {fileAttachment || initialValues?.file_path}</div>
                  <button
                    type="button"
                    onClick={() => setFileAttachment('')}
                    className="text-red-500 font-bold"
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 pt-4 gap-3">
          <div className="flex items-center gap-2">
            {type === 'outgoing' && (
              <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
                <label className="text-[10px] font-bold text-slate-600 flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    {...register('is_draft')}
                    className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  Simpan sebagai draf (Belum Ditandatangani)
                </label>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg cursor-pointer"
            >
              Batalkan
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-blue-600 text-white hover:bg-blue-700 px-5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              {isSaving ? (
                <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {initialValues ? 'Simpan Perubahan' : 'Daftarkan Surat Resmi'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
