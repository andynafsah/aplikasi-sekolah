import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  X, 
  CheckCircle2, 
  Filter, 
  Database,
  FileText,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

interface ArchiveReportExportModalProps {
  archives: any[];
  incomingLetters?: any[];
  outgoingLetters?: any[];
  legals?: any[];
  onClose: () => void;
}

export default function ArchiveReportExportModal({
  archives,
  incomingLetters = [],
  outgoingLetters = [],
  legals = [],
  onClose
}: ArchiveReportExportModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [showPdfPreview, setShowPdfPreview] = useState<boolean>(false);

  // Filter archives based on selections
  const filteredArchives = archives.filter((item: any) => {
    const matchesCat = selectedCategory === 'ALL' || item.document_type_code === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
    const itemYear = (item.created_at || '').substring(0, 4);
    const matchesYear = selectedYear === 'ALL' || itemYear === selectedYear || itemYear === '';
    return matchesCat && matchesStatus && matchesYear;
  });

  // Calculate statistics for report header
  const totalCount = filteredArchives.length;
  const activeCount = filteredArchives.filter((a: any) => a.status === 'ACTIVE' || !a.status).length;
  const permanentCount = filteredArchives.filter((a: any) => a.status === 'PERMANENT').length;
  const disposeCount = filteredArchives.filter((a: any) => a.status === 'PENDING_DISPOSAL').length;

  // Handle Excel / CSV Export
  const handleExportCSV = () => {
    const headers = [
      'No',
      'Kode / Nomor Arsip',
      'Judul Berkas / Dokumen',
      'Kategori',
      'Nomor Box Fisik',
      'Posisi Rak Gudang',
      'Masa Retensi (Tahun)',
      'Tanggal Indeks',
      'Status Retensi'
    ];

    const rows = filteredArchives.map((item: any, i: number) => [
      i + 1,
      `"${item.archive_number || item.document_number || `ARC-2026-${i + 1}`}"`,
      `"${item.title || item.subject || 'Berkas Arsip'}"`,
      `"${item.document_type_code || 'UMUM'}"`,
      `"${item.box_number || 'BOX-A-01'}"`,
      `"${item.shelf_position || 'Rak 1'}"`,
      item.retention_period_years || 5,
      `"${item.created_at ? item.created_at.substring(0, 10) : new Date().toISOString().substring(0, 10)}"`,
      `"${item.status || 'ACTIVE'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Rekap_Kearsipan_${selectedCategory}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-400" />
            <div>
              <h3 className="font-extrabold text-sm">Ekspor & Rekap Laporan Kearsipan Digital</h3>
              <p className="text-[10px] text-slate-300">Generasi Berkas PDF Laporan Resmi & Spreadsheet Matrix (.CSV)</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Controls Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-600 uppercase">Kategori Berkas</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-medium"
            >
              <option value="ALL">Semua Kategori Arsip</option>
              <option value="INCOMING">Surat Masuk</option>
              <option value="OUTGOING">Surat Keluar</option>
              <option value="LEGAL">Dokumen Legalitas & Izin</option>
              <option value="OTHER">Fisik Box Gudang / Umum</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-600 uppercase">Status Retensi Arsip</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-medium"
            >
              <option value="ALL">Semua Status Retensi</option>
              <option value="ACTIVE">Aktif (Masa Simpan)</option>
              <option value="PERMANENT">Arsip Permanen</option>
              <option value="PENDING_DISPOSAL">Siap Pemusnahan Berkas</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-600 uppercase">Tahun Berkas</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-medium"
            >
              <option value="ALL">Semua Tahun</option>
              <option value="2026">2026 (Tahun Berjalan)</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

        </div>

        {/* Action Buttons Header */}
        <div className="px-5 py-3 bg-white border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            Ditemukan <strong className="text-blue-700 font-extrabold">{totalCount}</strong> item berkas arsip terindeks.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Ekspor Excel (.CSV)
            </button>

            <button
              onClick={() => setShowPdfPreview(!showPdfPreview)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg shadow transition flex items-center gap-1.5 cursor-pointer border ${
                showPdfPreview 
                  ? 'bg-blue-700 text-white border-blue-700' 
                  : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'
              }`}
            >
              <Printer className="h-4 w-4" />
              {showPdfPreview ? 'Tutup Prinjau PDF' : 'Prinjau PDF Resmi'}
            </button>
          </div>
        </div>

        {/* Modal Body / Report Display */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100">
          
          {showPdfPreview ? (
            /* Official Printable PDF Report Layout */
            <div id="printable-archive-report" className="bg-white border border-slate-300 shadow-xl p-8 rounded max-w-3xl mx-auto space-y-6 text-slate-900 font-sans">
              
              {/* Header Kop */}
              <div className="border-b-2 border-slate-900 pb-3 text-center space-y-1">
                <h2 className="text-base font-black tracking-tight uppercase">
                  YAYASAN PENDIDIKAN & PONDOK PESANTREN ISLAMI
                </h2>
                <h3 className="text-xs font-bold text-slate-700 uppercase">
                  BAGIAN TATA USAHA & ARSIPARIS DIGITAL LEMBAGA
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">
                  LAPORAN REKAPITULASI DOKUMEN & INDEKSASI FISIK GUDANG ARSIP
                </p>
              </div>

              {/* Summary Metrics Matrix */}
              <div className="grid grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center text-xs">
                <div>
                  <span className="text-[9px] text-slate-500 font-bold block uppercase">Total Berkas</span>
                  <strong className="text-sm text-slate-900 font-black">{totalCount}</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-bold block uppercase">Arsip Aktif</span>
                  <strong className="text-sm text-emerald-700 font-black">{activeCount}</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-bold block uppercase">Permanen</span>
                  <strong className="text-sm text-blue-700 font-black">{permanentCount}</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-bold block uppercase">Siap Pemusnahan</span>
                  <strong className="text-sm text-amber-700 font-black">{disposeCount}</strong>
                </div>
              </div>

              {/* Data Table */}
              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[9px]">
                    <tr>
                      <th className="p-2 w-8 text-center">No</th>
                      <th className="p-2">Kode Arsip</th>
                      <th className="p-2">Judul Berkas</th>
                      <th className="p-2">Lokasi Box / Rak</th>
                      <th className="p-2">Retensi</th>
                      <th className="p-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredArchives.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 text-center font-mono">{idx + 1}</td>
                        <td className="p-2 font-mono font-bold text-blue-800">
                          {item.archive_number || item.document_number || `ARC-2026-${idx + 1}`}
                        </td>
                        <td className="p-2 font-medium text-slate-800">{item.title || item.subject}</td>
                        <td className="p-2 font-mono text-slate-600">
                          {item.box_number || 'BOX-A-01'} ({item.shelf_position || 'Rak 1'})
                        </td>
                        <td className="p-2">{item.retention_period_years || 5} Thn</td>
                        <td className="p-2 text-center">
                          <span className="text-[9px] bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded font-mono font-bold">
                            {item.status || 'ACTIVE'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="flex justify-between items-end pt-8 text-xs font-sans">
                <div className="text-center space-y-1">
                  <span className="text-[10px] text-slate-400 block font-mono">Diverifikasi Sistem ANRI</span>
                  <div className="h-10 w-24 border border-dashed border-slate-300 rounded flex items-center justify-center text-[8px] text-slate-400 font-mono">
                    [DIGITAL STAMP]
                  </div>
                </div>

                <div className="text-center space-y-12">
                  <p className="font-bold">Kepala Bagian Tata Usaha</p>
                  <div>
                    <strong className="block underline text-slate-900 font-bold">Dra. Hj. Nurjanah, M.Pd.</strong>
                    <span className="text-[10px] text-slate-500 block">NIP. 198204152006042003</span>
                  </div>
                </div>
              </div>

              <div className="text-center pt-4">
                <button
                  onClick={handleTriggerPrint}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
                >
                  Cetak / Simpan Sebagai PDF
                </button>
              </div>

            </div>
          ) : (
            /* Direct Data Table Overview */
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">No</th>
                    <th className="p-3">Kode / Nomor Arsip</th>
                    <th className="p-3">Judul Berkas</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Lokasi Fisik Box</th>
                    <th className="p-3">Masa Retensi</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredArchives.map((arch: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-mono font-bold text-blue-700">
                        {arch.archive_number || arch.document_number || `ARC-2026-${idx + 1}`}
                      </td>
                      <td className="p-3 font-bold text-slate-800">{arch.title || arch.subject}</td>
                      <td className="p-3">
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                          {arch.document_type_code || 'UMUM'}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-600">
                        {arch.box_number || 'BOX-A-01'} • {arch.shelf_position || 'Rak 1'}
                      </td>
                      <td className="p-3 font-medium text-slate-700">{arch.retention_period_years || 5} Tahun</td>
                      <td className="p-3 text-center">
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                          {arch.status || 'ACTIVE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredArchives.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-400 italic text-xs">
                        Tidak ada berkas arsip yang sesuai dengan kriteria filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}
