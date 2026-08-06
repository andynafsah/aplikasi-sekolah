import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Send, 
  Users, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Eye, 
  RefreshCw,
  Search,
  Check,
  ChevronRight,
  Layers
} from 'lucide-react';
import axios from 'axios';

interface MailMergeViewProps {
  templates: any[];
  incomingLetters?: any[];
  outgoingLetters?: any[];
  refetchOutgoing?: () => void;
}

export default function MailMergeView({ templates, refetchOutgoing }: MailMergeViewProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '');
  const [recipientSource, setRecipientSource] = useState<'database_students' | 'database_teachers' | 'custom_csv'>('database_students');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedIndices, setSelectedIndices] = useState<number[]>([0, 1, 2, 3, 4]);
  const [previewIndex, setPreviewIndex] = useState<number>(0);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isSavingBatch, setIsSavingBatch] = useState(false);

  // Mock / Sample Data from Database context
  const studentsDataset = [
    { nis: 'NIS2026001', nama: 'Muhammad Ahmad Syahputra', rombel: 'VII-A', wali: 'H. Abdul Rahman', alamat: 'Jl. Ahmad Yani No. 12, Jakarta', unit: 'SMP Pesantren' },
    { nis: 'NIS2026002', nama: 'Fatimah Az-Zahra', rombel: 'VII-B', wali: 'Drs. H. Syarifuddin', alamat: 'Jl. Merdeka No. 45, Bandung', unit: 'SMP Pesantren' },
    { nis: 'NIS2026003', nama: 'Ahmad Raihan Pratama', rombel: 'VIII-A', wali: 'Ir. Hendra Wijaya', alamat: 'Jl. Gajah Mada No. 88, Surabaya', unit: 'SMA Tahfidz' },
    { nis: 'NIS2026004', nama: 'Aisyah Humaira', rombel: 'VIII-B', wali: 'Bambang Sugianto, S.Pd', alamat: 'Jl. Sudirman No. 102, Semarang', unit: 'SMA Tahfidz' },
    { nis: 'NIS2026005', nama: 'Zaid bin Tsabit', rombel: 'IX-A', wali: 'Hj. Siti Aminah', alamat: 'Jl. Diponegoro No. 34, Surakarta', unit: 'SMP Pesantren' },
    { nis: 'NIS2026006', nama: 'Umar Al-Faruq', rombel: 'IX-B', wali: 'Dr. Usman Harun', alamat: 'Jl. Veteran No. 56, Malang', unit: 'SMA Tahfidz' },
  ];

  const teachersDataset = [
    { nip: 'NIP19850101', nama: 'Ust. H. Abdullah Faqih, M.Pd.', jabatan: 'Guru Al-Quran & Hadits', rombel: 'Halaqah Tahfidz', alamat: 'Komplek Pondok Indah', unit: 'Pesantren Pusat' },
    { nip: 'NIP19880312', nama: 'Ustadzah Nurul Hidayah, S.Ag.', jabatan: 'Guru Bahasa Arab', rombel: 'Kelas VII-X', alamat: 'Jl. Pesantren No. 5', unit: 'SMA Tahfidz' },
    { nip: 'NIP19920722', nama: 'Kiai Ahmad Dahlan, Lc.', jabatan: 'Kepala Pengasuh Asrama', rombel: 'Musyrif Utama', alamat: 'Gedung Asrama Al-Ghazali', unit: 'Pondok Pesantren' },
  ];

  const activeDataset = recipientSource === 'database_teachers' ? teachersDataset : studentsDataset;

  const currentTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0] || {
    name: 'Surat Undangan Wali Murid / Santri',
    code: 'TMP-UNDANG',
    number_format: '{seq}/UND/SMA-UN/VIII/2026',
    letter_type: 'Surat Undangan',
    content_template: `Dengan hormat,\n\nSehubungan dengan pelaksanaan Evaluasi Semester & Program Tahfidz, kami mengundang Bapak/Ibu Wali dari Ananda:\n\nNama Siswa / Santri : {NAMA}\nNo. Induk (NIS)       : {NIS}\nKelas / Rombel       : {ROMBEL}\nAlamat              : {ALAMAT}\n\nUntuk hadir pada Pertemuan Wali Murid yang akan dilaksanakan pada tanggal 20 Agustus 2026.\n\nDemikian surat undangan ini kami sampaikan.`
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('erp_token');
    return { Authorization: `Bearer ${token}` };
  };

  const toggleSelectAll = () => {
    if (selectedIndices.length === activeDataset.length) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(activeDataset.map((_, i) => i));
    }
  };

  const toggleSelect = (idx: number) => {
    if (selectedIndices.includes(idx)) {
      setSelectedIndices(selectedIndices.filter(i => i !== idx));
    } else {
      setSelectedIndices([...selectedIndices, idx]);
    }
  };

  // Replace template placeholders with dynamic recipient data
  const renderMergedContent = (data: any) => {
    let text = currentTemplate.content_template || '';
    text = text.replace(/{NAMA}/g, data.nama || data.name || '-');
    text = text.replace(/{NIS}/g, data.nis || data.nip || '-');
    text = text.replace(/{ROMBEL}/g, data.rombel || data.jabatan || '-');
    text = text.replace(/{WALI}/g, data.wali || '-');
    text = text.replace(/{ALAMAT}/g, data.alamat || '-');
    text = text.replace(/{UNIT}/g, data.unit || '-');
    text = text.replace(/{TANGGAL}/g, new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));
    return text;
  };

  // Export merged database records to CSV
  const handleExportCSV = () => {
    const selectedData = activeDataset.filter((_, idx) => selectedIndices.includes(idx));
    if (selectedData.length === 0) {
      alert('Pilih setidaknya satu penerima untuk diekspor.');
      return;
    }

    const headers = ['No', 'Nomor Surat Tergenerate', 'Nama Penerima', 'NIS/NIP', 'Rombel/Jabatan', 'Alamat', 'Isi Ringkasan'];
    const rows = selectedData.map((item: any, i) => [
      i + 1,
      `LET-OUT-2026-${String(i + 101).padStart(4, '0')}`,
      `"${item.nama}"`,
      `"${item.nis || item.nip || '-'}"`,
      `"${item.rombel || item.jabatan || '-'}"`,
      `"${item.alamat || '-'}"`,
      `"${renderMergedContent(item).replace(/\n/g, ' ')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Mail_Merge_Export_${currentTemplate.code || 'DOC'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Batch save generated outgoing letters into system DB
  const handleSaveToOutgoingDB = async () => {
    const selectedData = activeDataset.filter((_, idx) => selectedIndices.includes(idx));
    if (selectedData.length === 0) {
      alert('Pilih setidaknya satu penerima untuk disimpan.');
      return;
    }

    setIsSavingBatch(true);
    try {
      let count = 0;
      for (const item of selectedData) {
        const mergedText = renderMergedContent(item);
        await axios.post('/api/action?action=outgoingLetterCreate', {
          destination: item.nama,
          subject: `${currentTemplate.name} - ${item.nama}`,
          letter_type: currentTemplate.letter_type || 'Surat Undangan',
          confidentiality: 'BIASA',
          urgency: 'BIASA',
          summary: mergedText,
          is_draft: false
        }, { headers: getAuthHeaders() });
        count++;
      }
      alert(`Berhasil menyimpan ${count} dokumen hasil Mail Merge ke dalam Database Surat Keluar.`);
      if (refetchOutgoing) refetchOutgoing();
    } catch (err) {
      alert('Terjadi kesalahan saat menyimpan ke Database Surat Keluar.');
    } finally {
      setIsSavingBatch(false);
    }
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-blue-500/30 text-blue-200 px-3 py-1 rounded-full border border-blue-400/30 mb-2">
            <Sparkles className="h-3 w-3" /> Fitur Otomatisasi Administrasi TU
          </span>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-emerald-400" />
            Cetak Massal & Mail Merge Dokumentasi
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Gabungkan Template Surat Resmi dengan Database Santri / Siswa & Pegawai secara otomatis tanpa input manual satu per satu.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Ekspor Rekap Excel / CSV
          </button>
          
          <button
            onClick={() => setShowPrintModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            Cetak Massal ({selectedIndices.length})
          </button>
        </div>
      </div>

      {/* Control Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Template & Recipient Data Source Selector */}
        <div className="space-y-5 bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Layers className="h-4 w-4 text-blue-600" />
            1. Konfigurasi Template & Data
          </h3>

          {/* Select Template */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Pilih Template Surat</label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.code})
                </option>
              ))}
              {templates.length === 0 && (
                <option value="">Surat Undangan Wali Murid / Santri (Bawaan)</option>
              )}
            </select>
          </div>

          {/* Data Source Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Sumber Data Penerima</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setRecipientSource('database_students'); setSelectedIndices([0, 1, 2, 3, 4]); }}
                className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition ${
                  recipientSource === 'database_students'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                Data Siswa
              </button>
              
              <button
                type="button"
                onClick={() => { setRecipientSource('database_teachers'); setSelectedIndices([0, 1, 2]); }}
                className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition ${
                  recipientSource === 'database_teachers'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                Data Guru/Pegawai
              </button>
            </div>
          </div>

          {/* Variables Info Box */}
          <div className="p-3.5 bg-indigo-50/70 border border-indigo-150 rounded-xl space-y-2">
            <span className="text-[10px] font-extrabold text-indigo-900 uppercase tracking-wider block">
              Variabel Otomatis yang Terdeteksi:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {['{NAMA}', '{NIS}', '{ROMBEL}', '{WALI}', '{ALAMAT}', '{TANGGAL}'].map(v => (
                <span key={v} className="text-[10px] font-mono bg-white text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-bold shadow-2xs">
                  {v}
                </span>
              ))}
            </div>
          </div>

          {/* Mass Actions */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <button
              onClick={handleSaveToOutgoingDB}
              disabled={isSavingBatch}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSavingBatch ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 text-emerald-400" />}
              Simpan Batch ke Surat Keluar DB
            </button>
          </div>
        </div>

        {/* Center/Right Columns: Recipient List & Live Document Preview */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Recipient Selection Table */}
          <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">2. Daftar Penerima yang Dipilih</h3>
                <p className="text-[11px] text-slate-500">Centang baris penerima yang akan dibuatkan dokumen massal.</p>
              </div>

              <button
                onClick={toggleSelectAll}
                className="text-xs text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
              >
                {selectedIndices.length === activeDataset.length ? 'Batalkan Semua' : 'Pilih Semua'}
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5 text-center w-10">
                      <input
                        type="checkbox"
                        checked={selectedIndices.length === activeDataset.length}
                        onChange={toggleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="p-2.5">Nama Lengkap</th>
                    <th className="p-2.5">NIS / NIP</th>
                    <th className="p-2.5">Rombel / Jabatan</th>
                    <th className="p-2.5 text-center">Aksi Preview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeDataset.map((row: any, i: number) => {
                    const isSelected = selectedIndices.includes(i);
                    const isCurrentPreview = previewIndex === i;
                    return (
                      <tr key={i} className={`hover:bg-slate-50 transition ${isCurrentPreview ? 'bg-blue-50/70 font-medium' : ''}`}>
                        <td className="p-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(i)}
                            className="rounded"
                          />
                        </td>
                        <td className="p-2.5 font-bold text-slate-800">{row.nama}</td>
                        <td className="p-2.5 font-mono text-slate-600">{row.nis || row.nip}</td>
                        <td className="p-2.5 text-slate-600">{row.rombel || row.jabatan}</td>
                        <td className="p-2.5 text-center">
                          <button
                            onClick={() => setPreviewIndex(i)}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold transition ${
                              isCurrentPreview
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            <Eye className="h-3 w-3 inline mr-1" />
                            Prinjau
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Single Live Render Preview Box */}
          <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-600" />
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Prinjau Cetak (Penerima ke-{previewIndex + 1}: {activeDataset[previewIndex]?.nama})
                </h4>
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-mono font-bold">
                Kop Surat Standar Lembaga
              </span>
            </div>

            {/* Simulated Paper Layout */}
            <div className="bg-slate-100 p-4 sm:p-6 rounded-xl border border-slate-200">
              <div className="bg-white border border-slate-300 shadow-lg p-6 sm:p-8 rounded max-w-2xl mx-auto space-y-6 text-slate-900 font-serif leading-relaxed text-xs sm:text-sm">
                
                {/* Formal Header Kop */}
                <div className="border-b-2 border-slate-900 pb-3 text-center space-y-1 font-sans">
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
                    YAYASAN PENDIDIKAN & PONDOK PESANTREN ISLAMI
                  </h3>
                  <p className="text-[11px] font-bold text-slate-700">
                    SEKOLAH MENENGAH PERTAMA & ATAS (SMP - SMA TERPADU)
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Jl. Education Campus No. 01 • Telp: (021) 8899-7766 • Website: www.pesantren-yayasan.sch.id
                  </p>
                </div>

                {/* Letter Metadata */}
                <div className="font-sans text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>Nomor: <strong className="font-mono">LET-OUT-2026-{String(previewIndex + 101).padStart(4, '0')}</strong></span>
                    <span>Tanggal: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div>Hal: <strong>{currentTemplate.name}</strong></div>
                  <div>Lampiran: 1 (Satu) Berkas</div>
                </div>

                {/* Body Content */}
                <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm leading-relaxed text-slate-800 bg-slate-50/50 p-4 rounded-lg border border-slate-150">
                  {renderMergedContent(activeDataset[previewIndex] || {})}
                </div>

                {/* Signature Block */}
                <div className="flex justify-between items-end pt-6 font-sans text-xs">
                  <div className="text-center space-y-1">
                    <div className="h-12 w-12 border border-dashed border-slate-300 rounded flex items-center justify-center text-[9px] text-slate-400 font-mono">
                      [QR VERIFY]
                    </div>
                    <span className="text-[9px] text-slate-400 block font-mono">QR Validasi Lembaga</span>
                  </div>

                  <div className="text-center space-y-12">
                    <p className="font-bold">Kepala Sekolah / Pengasuh Pondok</p>
                    <div>
                      <strong className="block underline text-slate-900 font-bold">Dr. H. Ahmad Musyaffa, M.Ag.</strong>
                      <span className="text-[10px] text-slate-500 block">NIP. 197805122003121001</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Batch Print Preview Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="h-5 w-5 text-emerald-400" />
                <h3 className="font-extrabold text-sm">
                  Prinjau Cetak Massal ({selectedIndices.length} Dokumen Terpilih)
                </h3>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTriggerPrint}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow transition"
                >
                  Buka Dialog Cetak Browser
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-lg"
                >
                  Tutup
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-8 bg-slate-100 flex-1">
              <p className="text-xs text-slate-500 text-center font-mono">
                Setiap dokumen di bawah ini disiapkan dengan pemisah halaman (Page Break) otomatis saat dicetak ke printer / PDF.
              </p>

              {activeDataset.filter((_, idx) => selectedIndices.includes(idx)).map((item: any, i: number) => (
                <div key={i} className="bg-white border border-slate-300 shadow-md p-8 rounded max-w-2xl mx-auto space-y-6 text-slate-900 font-serif leading-relaxed text-xs page-break-after">
                  <div className="border-b-2 border-slate-900 pb-3 text-center space-y-1 font-sans">
                    <h3 className="text-base font-black tracking-tight text-slate-900 uppercase">
                      YAYASAN PENDIDIKAN & PONDOK PESANTREN ISLAMI
                    </h3>
                    <p className="text-[10px] font-bold text-slate-700">
                      SEKOLAH MENENGAH PERTAMA & ATAS (SMP - SMA TERPADU)
                    </p>
                  </div>

                  <div className="font-sans text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Nomor: <strong className="font-mono">LET-OUT-2026-{String(i + 101).padStart(4, '0')}</strong></span>
                      <span>Tanggal: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div>Hal: <strong>{currentTemplate.name}</strong></div>
                  </div>

                  <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-800 bg-slate-50 p-4 rounded border border-slate-200">
                    {renderMergedContent(item)}
                  </div>

                  <div className="flex justify-between items-end pt-6 font-sans text-xs">
                    <div className="text-center space-y-1">
                      <span className="text-[9px] text-slate-400 block font-mono">QR Validasi Lembaga</span>
                    </div>
                    <div className="text-center space-y-10">
                      <p className="font-bold">Kepala Sekolah / Pengasuh</p>
                      <strong className="block underline text-slate-900">Dr. H. Ahmad Musyaffa, M.Ag.</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
