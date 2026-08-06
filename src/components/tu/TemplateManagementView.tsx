import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  Printer, 
  Eye, 
  Search, 
  Check, 
  Sliders, 
  Tag, 
  Building2, 
  Calendar, 
  Users, 
  Layers, 
  CheckCircle2, 
  HelpCircle, 
  Code, 
  Download, 
  RefreshCw,
  Send,
  Zap,
  ArrowRight
} from 'lucide-react';

export interface DocumentTemplateItem {
  id: string;
  code: string;
  name: string;
  category: 'SURAT_DINAS' | 'SURAT_KETERANGAN' | 'SURAT_TUGAS' | 'SURAT_KEPESANTRENAAN' | 'SURAT_KEPUTUSAN';
  number_format: string;
  header_kop_type: 'KOP_UTAMA' | 'KOP_PESANTREN' | 'KOP_SMA' | 'KOP_SMP';
  signatory_role: string;
  signatory_name: string;
  content_template: string;
  variables_used: string[];
  is_active: boolean;
  updated_at: string;
}

const SAMPLE_TEMPLATES: DocumentTemplateItem[] = [
  {
    id: 'TMP-001',
    code: 'TMP-SK-AKTIF',
    name: 'Surat Keterangan Aktif Santri & Siswa',
    category: 'SURAT_KETERANGAN',
    number_format: '{seq}/SK-AKT/SMA-UN/{month}/{year}',
    header_kop_type: 'KOP_UTAMA',
    signatory_role: 'Kepala Sekolah / Pengasuh Pondok',
    signatory_name: 'Drs. H. Ahmad Dahlan, M.Pd.I.',
    content_template: `Yang bertanda tangan di bawah ini Kepala SMA Pesantren Islam Terpadu menerangkan dengan sebenarnya bahwa:

Nama Lengkap       : {NAMA_SANTRI}
NIS / NISN         : {NIS} / {NISN}
Kelas / Rombel     : {ROMBEL_KELAS}
Asrama Santri      : {ASRAMA}
Nama Orang Tua/Wali: {NAMA_WALI}
Alamat Domisili    : {ALAMAT}

Adalah benar-benar santri/siswa aktif yang terdaftar pada Tahun Ajaran 2026/2027 di lembaga kami dan berpraktik kelakuan baik selama berada di lingkungan pesantren.

Surat Keterangan ini diterbitkan untuk keperluan: {KEPERLUAN}.

Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.`,
    variables_used: ['{NAMA_SANTRI}', '{NIS}', '{NISN}', '{ROMBEL_KELAS}', '{ASRAMA}', '{NAMA_WALI}', '{ALAMAT}', '{KEPERLUAN}'],
    is_active: true,
    updated_at: '2026-08-05'
  },
  {
    id: 'TMP-002',
    code: 'TMP-ST-GURU',
    name: 'Surat Tugas Pengabdian & Pelatihan Guru/Ustadz',
    category: 'SURAT_TUGAS',
    number_format: '{seq}/ST-GURU/TU/{month}/{year}',
    header_kop_type: 'KOP_PESANTREN',
    signatory_role: 'Kepala Bagian Tata Usaha & Kepegawaian',
    signatory_name: 'Ust. H. Abdullah Faqih, M.Pd.',
    content_template: `Pimpinan Pondok Pesantren Islam Terpadu memberikan Tugas Resmi kepada:

Nama Pengabdi / Guru : {NAMA_GURU}
NIP / NUPTK           : {NIP}
Jabatan Akademik     : {JABATAN_GURU}
Unit Tugas           : {UNIT_PENDIDIKAN}

Untuk melaksanakan tugas sebagai {TUGAS_PELATIHAN} yang diselenggarakan pada:

Tanggal Pelaksanaan  : {TANGGAL_MULAI} s.d. {TANGGAL_SELESAI}
Tempat / Lokasi      : {LOKASI_TUGAS}

Demikian Surat Tugas ini diterbitkan agar dilaksanakan dengan penuh tanggung jawab dan menyampaikan laporan setelah kegiatan selesai.`,
    variables_used: ['{NAMA_GURU}', '{NIP}', '{JABATAN_GURU}', '{UNIT_PENDIDIKAN}', '{TUGAS_PELATIHAN}', '{TANGGAL_MULAI}', '{TANGGAL_SELESAI}', '{LOKASI_TUGAS}'],
    is_active: true,
    updated_at: '2026-08-04'
  },
  {
    id: 'TMP-003',
    code: 'TMP-IZIN-PULANG',
    name: 'Surat Izin Pulang / Perizinan Khusus Santri',
    category: 'SURAT_KEPESANTRENAAN',
    number_format: '{seq}/IZN-PUL/POSKESTREN/{month}/{year}',
    header_kop_type: 'KOP_PESANTREN',
    signatory_role: 'Kepala Pengasuhan Kesantriaan',
    signatory_name: 'Kiai Ahmad Ridwan, Lc.',
    content_template: `Memberikan Izin Pulang Sementara / Keluar Pesantren kepada:

Nama Santri       : {NAMA_SANTRI}
NIS / Rombel       : {NIS} / {ROMBEL_KELAS}
Kamar / Asrama     : {ASRAMA}
Nama Penjemput     : {NAMA_WALI} (Wali Kandung)

Alasan Perizinan   : {KEPERLUAN}
Masa Izin          : Berlaku mulai tanggal {TANGGAL_MULAI} s.d {TANGGAL_SELESAI}

Catatan: Santri wajib kembali ke asrama tepat waktu sebelum pukul 17:00 WIB dan melapor ke Piket Pengasuhan.`,
    variables_used: ['{NAMA_SANTRI}', '{NIS}', '{ROMBEL_KELAS}', '{ASRAMA}', '{NAMA_WALI}', '{KEPERLUAN}', '{TANGGAL_MULAI}', '{TANGGAL_SELESAI}'],
    is_active: true,
    updated_at: '2026-08-03'
  },
  {
    id: 'TMP-004',
    code: 'TMP-UNDANG-WALI',
    name: 'Surat Undangan Pertemuan Wali Santri',
    category: 'SURAT_DINAS',
    number_format: '{seq}/UND-WALI/SMA-UN/{month}/{year}',
    header_kop_type: 'KOP_UTAMA',
    signatory_role: 'Kepala Sekolah & Sekretaris TU',
    signatory_name: 'Drs. H. Ahmad Dahlan, M.Pd.I.',
    content_template: `Kepada Yth.
Bapak/Ibu Wali dari {NAMA_SANTRI} ({ROMBEL_KELAS})
di Tempat

Assalamu'alaikum Wr. Wb.

Sehubungan dengan agenda evaluasi akademik dan koordinasi kegiatan Tahfidz Qur'an semester ini, kami mengundang Bapak/Ibu Wali Santri untuk hadir pada:

Hari / Tanggal : {TANGGAL_EVENT}
Waktu          : Pukul 08:30 WIB s.d. Selesai
Tempat         : Aula Utama Komplek Pesantren Islam Terpadu
Agenda         : {KEPERLUAN}

Demikian undangan ini kami sampaikan, atas perhatian dan kehadirannya kami ucapkan terima kasih.`,
    variables_used: ['{NAMA_SANTRI}', '{ROMBEL_KELAS}', '{TANGGAL_EVENT}', '{KEPERLUAN}'],
    is_active: true,
    updated_at: '2026-08-01'
  }
];

const AVAILABLE_VARIABLES = [
  { tag: '{NAMA_SANTRI}', label: 'Nama Santri / Siswa', category: 'Santri' },
  { tag: '{NIS}', label: 'Nomor Induk Santri', category: 'Santri' },
  { tag: '{NISN}', label: 'NISN Nasional', category: 'Santri' },
  { tag: '{ROMBEL_KELAS}', label: 'Kelas / Rombel', category: 'Santri' },
  { tag: '{ASRAMA}', label: 'Nama Kamar / Asrama', category: 'Santri' },
  { tag: '{NAMA_WALI}', label: 'Nama Orang Tua / Wali', category: 'Santri' },
  { tag: '{ALAMAT}', label: 'Alamat Domisili', category: 'Santri' },
  { tag: '{NAMA_GURU}', label: 'Nama Guru / Ustadz', category: 'Kepegawaian' },
  { tag: '{NIP}', label: 'NIP / NUPTK', category: 'Kepegawaian' },
  { tag: '{JABATAN_GURU}', label: 'Jabatan Guru', category: 'Kepegawaian' },
  { tag: '{UNIT_PENDIDIKAN}', label: 'Unit (SMP/SMA/Pesantren)', category: 'Lembaga' },
  { tag: '{NOMOR_SURAT}', label: 'Nomor Surat Terbit', category: 'Surat' },
  { tag: '{TANGGAL_SURAT}', label: 'Tanggal Terbit Surat', category: 'Surat' },
  { tag: '{KEPERLUAN}', label: 'Keperluan / Perihal', category: 'Surat' },
  { tag: '{TANGGAL_MULAI}', label: 'Tanggal Mulai', category: 'Waktu' },
  { tag: '{TANGGAL_SELESAI}', label: 'Tanggal Selesai', category: 'Waktu' },
  { tag: '{LOKASI_TUGAS}', label: 'Lokasi / Tempat Tugas', category: 'Umum' },
];

interface TemplateManagementViewProps {
  onNavigateToMailMerge?: (templateId: string) => void;
}

export default function TemplateManagementView({ onNavigateToMailMerge }: TemplateManagementViewProps) {
  const [templates, setTemplates] = useState<DocumentTemplateItem[]>(SAMPLE_TEMPLATES);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingTemplate, setEditingTemplate] = useState<DocumentTemplateItem | null>(null);
  const [showEditorModal, setShowEditorModal] = useState<boolean>(false);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [previewTemplateItem, setPreviewTemplateItem] = useState<DocumentTemplateItem | null>(null);

  // Sample data substitution preview
  const sampleValues: Record<string, string> = {
    '{NAMA_SANTRI}': 'Muhammad Ahmad Syahputra',
    '{NIS}': 'NIS-2026-0891',
    '{NISN}': '0089123456',
    '{ROMBEL_KELAS}': 'Kelas X IPA 1 (Tahfidz)',
    '{ASRAMA}': 'Gedung Asrama Al-Ghazali Lt. 2 Room 204',
    '{NAMA_WALI}': 'H. Abdul Rahman, S.T.',
    '{ALAMAT}': 'Jl. Ahmad Yani No. 12, Komplek Mulia, Bandung',
    '{NAMA_GURU}': 'Ust. H. Abdullah Faqih, M.Pd.',
    '{NIP}': 'NIP-19850101-2026',
    '{JABATAN_GURU}': 'Guru Utama & Pengasuh Halqah 30 Juz',
    '{UNIT_PENDIDIKAN}': 'SMA Pesantren Islam Terpadu',
    '{NOMOR_SURAT}': '045/SK-AKT/SMA-UN/VIII/2026',
    '{TANGGAL_SURAT}': '05 Agustus 2026',
    '{KEPERLUAN}': 'Persyaratan Pendaftaran Beasiswa Tahfidz Perguruan Tinggi',
    '{TANGGAL_MULAI}': '10 Agustus 2026',
    '{TANGGAL_SELESAI}': '15 Agustus 2026',
    '{LOKASI_TUGAS}': 'Aula Kanwil Kemenag Provinsi',
    '{TUGAS_PELATIHAN}': 'Peserta Workshop Manajemen Tata Usaha Digital 2026',
    '{TANGGAL_EVENT}': 'Sabtu, 20 Agustus 2026'
  };

  const handleOpenNewTemplate = () => {
    const newT: DocumentTemplateItem = {
      id: `TMP-00${templates.length + 1}`,
      code: `TMP-CUSTOM-0${templates.length + 1}`,
      name: 'Surat Keterangan Baru / Custom',
      category: 'SURAT_KETERANGAN',
      number_format: '{seq}/SK/TU/{month}/{year}',
      header_kop_type: 'KOP_UTAMA',
      signatory_role: 'Kepala Sekolah',
      signatory_name: 'Drs. H. Ahmad Dahlan, M.Pd.I.',
      content_template: 'Yang bertanda tangan di bawah ini menerangkan bahwa:\n\nNama : {NAMA_SANTRI}\nNIS  : {NIS}\n\nBahwa nama tersebut benar santri terdaftar.\n\nDemikian surat ini dibuat.',
      variables_used: ['{NAMA_SANTRI}', '{NIS}'],
      is_active: true,
      updated_at: new Date().toISOString().substring(0, 10)
    };
    setEditingTemplate(newT);
    setShowEditorModal(true);
  };

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/action?action=templateList', {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      const data = await res.json();
      if (data && data.success && data.data && data.data.length > 0) {
        setTemplates(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;

    try {
      const token = localStorage.getItem('token');
      const existingIdx = templates.findIndex(t => t.id === editingTemplate.id);
      const actionType = existingIdx >= 0 ? 'templateUpdate' : 'templateCreate';
      
      const res = await fetch(`/api/action?action=${actionType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(editingTemplate)
      });
      const data = await res.json();
      
      if (data.success) {
        fetchTemplates();
        setShowEditorModal(false);
        setEditingTemplate(null);
        alert('Template dokumen berhasil disimpan ke server!');
      } else {
        alert('Gagal menyimpan template');
      }
    } catch (e) {
      alert('Gagal menyimpan template.');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus template surat ini?')) {
      try {
        const token = localStorage.getItem('token');
        await fetch('/api/action?action=templateDelete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ id })
        });
        fetchTemplates();
        alert('Template berhasil dihapus dari server!');
      } catch (e) {
        alert('Gagal menghapus template');
      }
    }
  };

  const insertVariableToEditor = (varTag: string) => {
    if (!editingTemplate) return;
    setEditingTemplate({
      ...editingTemplate,
      content_template: editingTemplate.content_template + ' ' + varTag,
      variables_used: Array.from(new Set([...editingTemplate.variables_used, varTag]))
    });
  };

  const renderTemplateWithSampleData = (rawText: string) => {
    let text = rawText;
    Object.keys(sampleValues).forEach(key => {
      text = text.replaceAll(key, sampleValues[key]);
    });
    return text;
  };

  const filteredTemplates = templates.filter(t => {
    const matchesCategory = selectedCategory === 'ALL' || t.category === selectedCategory;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-6 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-blue-500/30 text-blue-200 px-3 py-1 rounded-full border border-blue-400/30 mb-2">
            <Sparkles className="h-3 w-3" /> Document Template Engine v2.6
          </span>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-400" />
            Manajer Template Dokumen Tata Usaha (School & Pesantren)
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Kelola format surat dinas, surat keterangan aktif, surat tugas pengabdian, dan surat edaran dengan dukungan variabel dinamis untuk cetak massal.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleOpenNewTemplate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Buat Template Baru
          </button>
        </div>
      </div>

      {/* Categories & Search Filter */}
      <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kode atau nama template..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'ALL', label: 'Semua Template' },
            { id: 'SURAT_KETERANGAN', label: 'Surat Keterangan' },
            { id: 'SURAT_TUGAS', label: 'Surat Tugas' },
            { id: 'SURAT_KEPESANTRENAAN', label: 'Kepesantrenan' },
            { id: 'SURAT_DINAS', label: 'Surat Dinas & Undangan' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition text-[11px] whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Template Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
        {filteredTemplates.map((template) => (
          <div 
            key={template.id} 
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full inline-block">
                    {template.code}
                  </span>
                  <h3 className="text-sm font-black text-slate-900 leading-snug">
                    {template.name}
                  </h3>
                </div>

                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full shrink-0">
                  {template.category.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-600 font-mono text-[11px]">
                  <Tag className="h-3.5 w-3.5 text-slate-400" />
                  <span>Format Penomoran: <strong>{template.number_format}</strong></span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 font-mono text-[11px]">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Pratinjau Isi Format Template:</span>
                  <p className="text-slate-700 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                    {template.content_template}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[10px] text-slate-400 font-bold mr-1 self-center">Variabel:</span>
                  {template.variables_used.map((v, idx) => (
                    <span key={idx} className="bg-amber-50 text-amber-800 border border-amber-200 font-mono text-[10px] font-bold px-2 py-0.2 rounded">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <span>Diperbarui: {template.updated_at}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setPreviewTemplateItem(template);
                    setShowPreviewModal(true);
                  }}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-[11px] cursor-pointer flex items-center gap-1"
                >
                  <Eye className="h-3.5 w-3.5" /> Preview
                </button>

                <button
                  onClick={() => {
                    setEditingTemplate(template);
                    setShowEditorModal(true);
                  }}
                  className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold rounded-xl text-[11px] cursor-pointer flex items-center gap-1"
                >
                  <Edit3 className="h-3.5 w-3.5" /> Edit
                </button>

                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-xl cursor-pointer"
                  title="Hapus Template"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Editor Modal */}
      {showEditorModal && editingTemplate && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 space-y-4 border border-slate-200 max-h-[90vh] overflow-y-auto animate-fade-in text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-blue-600" />
                Desain & Editor Template Surat ({editingTemplate.code})
              </h3>
              <button
                onClick={() => setShowEditorModal(false)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kode Unique Template</label>
                  <input
                    type="text"
                    required
                    value={editingTemplate.code}
                    onChange={e => setEditingTemplate({ ...editingTemplate, code: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Template Surat</label>
                  <input
                    type="text"
                    required
                    value={editingTemplate.name}
                    onChange={e => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori Dokumen</label>
                  <select
                    value={editingTemplate.category}
                    onChange={e => setEditingTemplate({ ...editingTemplate, category: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 font-bold"
                  >
                    <option value="SURAT_KETERANGAN">SURAT KETERANGAN</option>
                    <option value="SURAT_TUGAS">SURAT TUGAS</option>
                    <option value="SURAT_KEPESANTRENAAN">SURAT KEPESANTRENAAN</option>
                    <option value="SURAT_DINAS">SURAT DINAS & UNDANGAN</option>
                    <option value="SURAT_KEPUTUSAN">SURAT KEPUTUSAN (SK)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Format Penomoran Surat Otomatis</label>
                  <input
                    type="text"
                    value={editingTemplate.number_format}
                    onChange={e => setEditingTemplate({ ...editingTemplate, number_format: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 font-mono text-blue-800 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Penandatangan Resmi (Role & Nama)</label>
                  <input
                    type="text"
                    value={editingTemplate.signatory_name}
                    onChange={e => setEditingTemplate({ ...editingTemplate, signatory_name: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 font-bold"
                  />
                </div>
              </div>

              {/* Dynamic Variables Quick-Inserter Bar */}
              <div className="bg-amber-50 p-3.5 border border-amber-200 rounded-2xl space-y-2">
                <span className="font-extrabold text-amber-900 text-xs flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-amber-600" />
                  Klik Tag Variabel Dinamis untuk disisipkan otomatis ke draf isi surat:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1">
                  {AVAILABLE_VARIABLES.map((v) => (
                    <button
                      key={v.tag}
                      type="button"
                      onClick={() => insertVariableToEditor(v.tag)}
                      className="bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>+ {v.tag}</span>
                      <span className="text-[8px] text-amber-700 font-sans">({v.label})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Template Textarea */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Formulasi Isi & Struktur Paragraf Surat</label>
                <textarea
                  rows={8}
                  required
                  value={editingTemplate.content_template}
                  onChange={e => setEditingTemplate({ ...editingTemplate, content_template: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white font-mono leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditorModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl shadow cursor-pointer"
                >
                  Simpan Perubahan Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewTemplateItem && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 border border-slate-200 max-h-[90vh] overflow-y-auto animate-fade-in text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">{previewTemplateItem.name}</h3>
                <span className="text-[10px] font-mono text-slate-500">Pratinjau Hasil Substitusi Variabel Sampel</span>
              </div>
              
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-3 py-1 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>

            {/* Simulated Official Letter Render Paper */}
            <div className="p-8 bg-white border-2 border-slate-300 rounded-xl shadow-inner space-y-6 font-serif">
              {/* Header Kop */}
              <div className="border-b-4 border-double border-slate-900 pb-4 text-center space-y-1 font-sans">
                <h2 className="text-base font-black uppercase tracking-wider text-slate-900">
                  YAYASAN & PONDOK PESANTREN ISLAM TERPADU
                </h2>
                <h3 className="text-sm font-bold uppercase text-blue-950">
                  SMA & SMP PESANTREN UNGGULAN
                </h3>
                <p className="text-[10px] text-slate-600 font-mono">
                  Jl. Raya Pesantren No. 45 Kopo Bandung • Email: tu@pesantren-terpadu.sch.id
                </p>
              </div>

              {/* Title & Number */}
              <div className="text-center space-y-1 font-sans">
                <h4 className="text-sm font-black uppercase underline tracking-widest text-slate-900">
                  {previewTemplateItem.name}
                </h4>
                <p className="text-[11px] font-mono font-bold text-slate-700">
                  Nomor: {previewTemplateItem.number_format.replace('{seq}', '089').replace('{month}', 'VIII').replace('{year}', '2026')}
                </p>
              </div>

              {/* Body Content with Substituted Values */}
              <div className="text-xs text-slate-900 leading-relaxed whitespace-pre-wrap font-sans">
                {renderTemplateWithSampleData(previewTemplateItem.content_template)}
              </div>

              {/* Footer Signatory Block */}
              <div className="flex justify-between items-end pt-8 font-sans">
                <div className="text-[9px] font-mono text-slate-400">
                  <span>QR Authenticated • Verification Code: QR-SEC-8912</span>
                </div>

                <div className="text-center space-y-12">
                  <div>
                    <p className="text-xs text-slate-700">Bandung, 05 Agustus 2026</p>
                    <p className="text-xs font-bold text-slate-900">{previewTemplateItem.signatory_role}</p>
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-xs font-black underline text-slate-900">{previewTemplateItem.signatory_name}</p>
                    <p className="text-[9px] font-mono text-slate-500">NIP / NIK Resmi Lembaga</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                ✓ Siap digunakan untuk Cetak Massal (Mail Merge)
              </span>

              <button
                onClick={() => {
                  alert(`Format template ${previewTemplateItem.name} siap dicetak!`);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="h-4 w-4" /> Cetak Dokumen Ini
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
