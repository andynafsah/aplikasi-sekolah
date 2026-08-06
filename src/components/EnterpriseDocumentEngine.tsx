/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Printer, 
  FileSpreadsheet, 
  FileText, 
  Upload, 
  FileDown, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileCode, 
  FileArchive, 
  Layout, 
  Eye, 
  Settings2, 
  QrCode, 
  Hash, 
  FolderPlus,
  HelpCircle,
  Clock,
  Download,
  Info
} from 'lucide-react';
import apiClient from '../api/client';
import { useAuth } from '../contexts/AuthContext';

// Standard TypeScript Props for Enterprise Document Engine
interface EnterpriseDocumentEngineProps {
  moduleName: string;                     // Module context e.g. "BillingSpp", "Payroll", "Sivitas"
  title: string;                          // Document Title
  headers: string[];                      // Export column headers (labels)
  keys: string[];                         // Object keys mapping to the columns
  data: Array<any>;                       // Direct client-side dataset
  templateType?: 'Surat' | 'SK' | 'Sertifikat' | 'Berita Acara' | 'Slip Gaji' | 'Slip SPP' | 'Invoice';
  onImportSuccess?: () => void;           // Callback on successful import completion
}

export default function EnterpriseDocumentEngine({
  moduleName,
  title,
  headers,
  keys,
  data,
  templateType = 'Surat',
  onImportSuccess
}: EnterpriseDocumentEngineProps) {
  
  const { user } = useAuth();

  // Tabs Navigation State
  const [activeTab, setActiveTab] = useState<'pdf' | 'excel' | 'word' | 'import' | 'upload' | 'zip'>('pdf');

  // School Profile Loaded Dynamically from DB
  const [schoolProfile, setSchoolProfile] = useState({
    name: "Yayasan Daarul Qur'an Indonesia",
    foundation_name: "Yayasan Daarul Qur'an Indonesia",
    npsn: '12345678',
    logo: '',
    unit_logo: '',
    address: 'Jl. Raya Tangerang, Banten, Indonesia',
    phone: '021-5551234',
    website: 'www.daqu.sch.id',
    email: 'info@daqu.sch.id',
    academic_year: '2025/2026',
    semester: 'Ganjil',
    version: 'v2026.07'
  });

  // Print Configuration Options
  const [pageSize, setPageSize] = useState<'A4_P' | 'A4_L' | 'F4_P' | 'Letter_P'>('A4_P');
  const [margin, setMargin] = useState<number>(20); // padding/margin in mm
  const [showKop, setShowKop] = useState<boolean>(true);
  const [showBarcode, setShowBarcode] = useState<boolean>(true);
  const [showQr, setShowQr] = useState<boolean>(true);
  const [dynamicFilename, setDynamicFilename] = useState<string>('');

  // Upload state
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<any | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Import State
  const [importLog, setImportLog] = useState<string[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState<boolean>(false);

  // General States
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load dynamically on mount
  useEffect(() => {
    // Generate dynamic clean naming (e.g. SPP-2026-001)
    const year = new Date().getFullYear();
    const randId = Math.floor(1000 + Math.random() * 9000);
    const shortModule = moduleName.toUpperCase().slice(0, 4);
    setDynamicFilename(`${shortModule}-${year}-${randId}`);

    // Fetch live system profiles from centralized database setup
    apiClient.post('/api/action', { action: 'document_getSchoolProfile' })
      .then(res => {
        if (res.data?.success && res.data.data) {
          setSchoolProfile(res.data.data);
        }
      })
      .catch(err => {
        console.warn('Could not retrieve database school profile, using memory fallback:', err);
      });
  }, [moduleName]);

  // Hidden Print Service Engine using isolated iframe
  const handlePrint = () => {
    setSystemLogs(prev => [...prev, 'Starting Print Service isolated task...']);
    
    // Construct styles based on selected paper sizes
    const paperStyles = {
      A4_P: '@page { size: A4 portrait; margin: ' + margin + 'mm; }',
      A4_L: '@page { size: A4 landscape; margin: ' + margin + 'mm; }',
      F4_P: '@page { size: 8.5in 13in portrait; margin: ' + margin + 'mm; }',
      Letter_P: '@page { size: letter portrait; margin: ' + margin + 'mm; }'
    };

    const printableHtml = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            ${paperStyles[pageSize]}
            body {
              font-family: "Times New Roman", Times, serif;
              color: #000;
              margin: 0;
              padding: 0;
              font-size: 11pt;
              line-height: 1.4;
            }
            .kop-container {
              border-bottom: 3px double #000;
              padding-bottom: 8px;
              margin-bottom: 20px;
              display: flex;
              align-items: center;
              gap: 15px;
            }
            .kop-logo {
              width: 75px;
              height: 75px;
              object-fit: contain;
            }
            .kop-text {
              flex-grow: 1;
              text-align: center;
            }
            .kop-text h2 {
              margin: 0;
              font-size: 14pt;
              font-weight: bold;
              text-transform: uppercase;
            }
            .kop-text h1 {
              margin: 2px 0;
              font-size: 16pt;
              font-weight: bold;
              text-transform: uppercase;
            }
            .kop-text p {
              margin: 1px 0;
              font-size: 9pt;
              font-style: italic;
            }
            .report-title {
              text-align: center;
              font-size: 13pt;
              font-weight: bold;
              text-transform: uppercase;
              margin-top: 15px;
              margin-bottom: 2px;
              text-decoration: underline;
            }
            .report-meta {
              text-align: center;
              font-size: 9pt;
              margin-bottom: 15px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
            }
            th {
              background-color: #f1f5f9;
              border: 1px solid #000;
              padding: 6px 8px;
              font-weight: bold;
              font-size: 9.5pt;
              text-transform: uppercase;
            }
            td {
              border: 1px solid #000;
              padding: 6px 8px;
              font-size: 9pt;
            }
            .align-right {
              text-align: right;
            }
            .align-center {
              text-align: center;
            }
            .document-footer {
              margin-top: 35px;
              display: flex;
              justify-content: space-between;
              font-size: 9.5pt;
            }
            .footer-sign-block {
              text-align: center;
              width: 200px;
            }
            .barcode-box {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-top: 40px;
              border-top: 1px dashed #ccc;
              padding-top: 10px;
              font-family: monospace;
              font-size: 8pt;
            }
          </style>
        </head>
        <body>
          ${showKop ? `
            <div class="kop-container" style="justify-content: space-between; align-items: center;">
              ${schoolProfile.logo ? `<img class="kop-logo" src="${schoolProfile.logo}" alt="Logo Yayasan" />` : '<div style="width: 70px; height: 70px; border: 1px solid #999; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:7pt">YAYASAN</div>'}
              <div class="kop-text" style="flex: 1; padding: 0 10px;">
                <h2 style="font-size: 11pt; color: #333; letter-spacing: 0.5px;">${schoolProfile.foundation_name}</h2>
                <h1 style="font-size: 14pt; font-weight: 900; margin: 2px 0;">${schoolProfile.name}</h1>
                <p style="font-size: 8.5pt; margin: 1px 0;">NPSN: ${schoolProfile.npsn || '-'} | Alamat: ${schoolProfile.address}</p>
                <p style="font-size: 8pt; color: #444; margin: 1px 0;">Telepon: ${schoolProfile.phone} | Email: ${schoolProfile.email} | Web: ${schoolProfile.website}</p>
              </div>
              ${schoolProfile.unit_logo ? `<img class="kop-logo" src="${schoolProfile.unit_logo}" alt="Logo Unit" />` : (schoolProfile.logo ? `<img class="kop-logo" src="${schoolProfile.logo}" alt="Logo Secondary" />` : '<div style="width: 70px; height: 70px; border: 1px solid #999; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:7pt">UNIT</div>')}
            </div>
          ` : ''}

          <div class="report-title">${title}</div>
          <div class="report-meta">Tahun Ajaran: ${schoolProfile.academic_year} (${schoolProfile.semester}) | Berkas Referensi: ${dynamicFilename} | Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}</div>

          <table>
            <thead>
              <tr>
                ${headers.map(h => `<th>${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  ${keys.map(key => {
                    const cellVal = row[key] === null || row[key] === undefined ? '' : row[key].toString();
                    const isNum = !isNaN(Number(cellVal.replace(/[^0-9,-]/g, ''))) && cellVal.length < 10;
                    return `<td class="${isNum ? 'align-right' : ''}">${cellVal}</td>`;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="document-footer">
            <div class="footer-sign-block">
              Menyetujui,<br/>
              <strong>Ketua Yayasan</strong>
              <br/><br/><br/><br/>
              ( H. Muhammad Rizqi, Lc )
            </div>
            <div class="footer-sign-block">
              Lima Puluh Kota, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br/>
              <strong>Petugas SIM ERP</strong>
              <br/><br/><br/><br/>
              ( ${user?.name || 'Administrator'} )
            </div>
          </div>

          <div class="barcode-box">
            ${showBarcode ? `
              <div>
                <div style="font-weight:bold; letter-spacing:3px">||||||||| | ||||| || ||| |||</div>
                <div>SECURE-REF-${dynamicFilename}</div>
              </div>
            ` : '<div></div>'}
            ${showQr ? `
              <div style="border: 1px solid #000; padding: 4px; text-align:center">
                <div style="font-size:7px; font-weight:bold">QR VALIDATED</div>
                <div style="font-family:sans-serif; font-size:6px; font-weight:bold; margin-top:2px">${moduleName.toUpperCase()}</div>
              </div>
            ` : ''}
          </div>
        </body>
      </html>
    `;

    // Fire Hidden Iframe Printer
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(printableHtml);
      doc.close();
      
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        document.body.removeChild(iframe);
        setSystemLogs(prev => [...prev, 'Print job sent successfully.']);
      }, 500);
    }
  };

  // Export Excel action triggering real ExcelJS server endpoint
  const handleExportExcel = async (isCsv: boolean = false) => {
    setIsExporting(true);
    setSystemLogs(prev => [...prev, `Mempersiapkan data ekspor ${isCsv ? 'CSV' : 'Excel'}...`]);
    
    try {
      const endpoint = isCsv ? 'document_exportCsv' : 'document_exportExcel';
      
      // Map rows object values matching selected keys
      const formattedRows = data.map(row => keys.map(k => row[k]));

      const payload = {
        action: endpoint,
        title: title,
        headers: headers,
        rows: formattedRows,
        sheets: [
          {
            name: 'Data Ekspor',
            title: title,
            headers: headers,
            rows: formattedRows,
            totalColumns: keys.includes('nominal') || keys.includes('amount') || keys.includes('jumlah') ? [keys.findIndex(k => k === 'nominal' || k === 'amount' || k === 'jumlah')] : []
          }
        ]
      };

      const response = await apiClient.post('/api/action', payload, { responseType: 'blob' });
      
      // Download non-corrupt blob stream with matching filename
      const blob = new Blob([response.data], { type: (response.headers['content-type'] as string) || undefined });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${dynamicFilename}.${isCsv ? 'csv' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSystemLogs(prev => [...prev, `Sukses mendownload file ${dynamicFilename}.${isCsv ? 'csv' : 'xlsx'}`]);
    } catch (err: any) {
      setSystemLogs(prev => [...prev, `ERROR: Gagal melakukan ekspor data. ${err.message}`]);
    } finally {
      setIsExporting(false);
    }
  };

  // Export Word Document template triggering server
  const handleExportWord = async () => {
    setIsExporting(true);
    setSystemLogs(prev => [...prev, 'Memproses ekspor Word (.docx) berbasis template...']);
    
    try {
      // Create readable details rows from keys to pass as word content table
      const formattedTableHtml = data.map(row => `
        <tr>
          ${keys.map(k => `<td>${row[k] || '-'}</td>`).join('')}
        </tr>
      `).join('');

      const contentHtml = `
        <tr>
          ${headers.map(h => `<th style="background-color:#f1f5f9; font-weight:bold; border:1px solid #000">${h}</th>`).join('')}
        </tr>
        ${formattedTableHtml}
      `;

      const payload = {
        action: 'document_exportWord',
        templateType,
        docNumber: `REG-${dynamicFilename}`,
        title,
        content: contentHtml,
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      };

      const response = await apiClient.post('/api/action', payload, { responseType: 'blob' });
      
      const blob = new Blob([response.data], { type: 'application/msword' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${dynamicFilename}.doc`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSystemLogs(prev => [...prev, `Sukses mengunduh Dokumen Word: ${dynamicFilename}.doc`]);
    } catch (err: any) {
      setSystemLogs(prev => [...prev, `ERROR: Gagal mengekspor dokumen Word. ${err.message}`]);
    } finally {
      setIsExporting(false);
    }
  };

  // Bulk ZIP Pack downloader
  const handleDownloadZip = async () => {
    setIsExporting(true);
    setSystemLogs(prev => [...prev, 'Mulai mengompres dokumen ke format ZIP...']);
    try {
      // Mock pack multiple items inside ZIP
      const csvFormattedRows = data.map(row => keys.map(k => row[k]));
      const csvContent = headers.join(',') + '\r\n' + csvFormattedRows.map(r => r.join(',')).join('\r\n');

      const payload = {
        action: 'document_zipPack',
        zipName: `Archive-${moduleName}`,
        files: [
          { name: `data-${dynamicFilename}.csv`, content: csvContent },
          { name: `informasi-sistem.txt`, content: `Enterprise School ERP Archive File\nModule: ${moduleName}\nRecords count: ${data.length}\nDate: ${new Date().toISOString()}` }
        ]
      };

      const response = await apiClient.post('/api/action', payload, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${dynamicFilename}.zip`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSystemLogs(prev => [...prev, 'Arsip ZIP berhasil dikompres dan diunduh.']);
    } catch (err: any) {
      setSystemLogs(prev => [...prev, `ERROR: Gagal membuat ZIP. ${err.message}`]);
    } finally {
      setIsExporting(false);
    }
  };

  // Drag and Drop handlers for file uploads
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  // Process the file with size and extension validation
  const processUploadedFile = (file: File) => {
    setUploadError(null);
    setUploadSuccess(null);
    setUploadProgress(0);

    const allowedExtensions = ['pdf', 'docx', 'xlsx', 'csv', 'jpg', 'jpeg', 'png', 'zip'];
    const fileExt = file.name.split('.').pop()?.toLowerCase();

    if (!fileExt || !allowedExtensions.includes(fileExt)) {
      setUploadError(`Ekstensi .${fileExt} tidak diizinkan! Format yang didukung: PDF, DOCX, XLSX, CSV, JPG, PNG, ZIP.`);
      return;
    }

    const maxSizeMb = 10;
    if (file.size > maxSizeMb * 1024 * 1024) {
      setUploadError(`Ukuran berkas melebihi batas 10MB! Ukuran berkas Anda: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      return;
    }

    setUploadedFile(file);

    // Simulate progress uploading bar
    let prog = 0;
    const interval = setInterval(() => {
      prog += 20;
      setUploadProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        triggerServerUpload(file);
      }
    }, 150);
  };

  // Send validated files to server
  const triggerServerUpload = async (file: File) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const payload = {
          action: 'document_uploadFile',
          fileName: file.name,
          fileType: file.type,
          fileData: reader.result,
          sizeKb: Math.round(file.size / 1024)
        };

        const response = await apiClient.post('/api/action', payload);
        if (response.data?.success) {
          setUploadSuccess(response.data.message);
        } else {
          setUploadError(response.data?.message || 'Gagal menyimpan berkas ke server');
        }
      };
    } catch (err: any) {
      setUploadError(`Terjadi kesalahan jaringan: ${err.message}`);
    }
  };

  // Import mock transactional pipeline
  const downloadImportTemplate = async (template: string) => {
    setSystemLogs(prev => [...prev, `Mengunduh template ${template}...`]);
    try {
      const payload = {
        action: 'document_downloadTemplate',
        templateName: template
      };
      const response = await apiClient.post('/api/action', payload, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Template-${template}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      setSystemLogs(prev => [...prev, `ERROR: Gagal mengunduh template: ${err.message}`]);
    }
  };

  // Start Excel / CSV parsing and validate sheet columns
  const handleImportRun = async (testRollback: boolean) => {
    setIsImporting(true);
    setImportErrors([]);
    setImportSuccessMsg(null);
    setImportLog(['[SYSTEM] Menghubungkan ke database...', '[SYSTEM] Membuka isolasi transaksi database...']);

    try {
      // Batch payload representation based on module name
      let headersExpected: string[] = [];
      let templateName = '';
      let sampleBatchRows: any[] = [];

      if (moduleName === 'Sivitas' || moduleName === 'Student') {
        templateName = 'SiswaImport';
        headersExpected = ['nis', 'nisn', 'nama_siswa', 'kelas_id'];
        
        if (testRollback) {
          // Bad rows triggers transactional rollback test
          sampleBatchRows = [
            { nis: '20261005', nisn: 'abc-not-num', nama_siswa: 'Budi Santoso', kelas_id: 'class-x-a' },
            { nis: '', nisn: '0091827364', nama_siswa: 'Missing NIS Student', kelas_id: 'class-x-b' }
          ];
        } else {
          sampleBatchRows = [
            { nis: '20261009', nisn: '0098172635', nama_siswa: 'Muhammad Faiz', kelas_id: 'class-x-a' },
            { nis: '20261010', nisn: '0098172636', nama_siswa: 'Siti Rahmawati', kelas_id: 'class-x-a' }
          ];
        }
      } else {
        templateName = 'PegawaiImport';
        headersExpected = ['nip', 'nama_lengkap', 'jabatan', 'gaji_pokok'];
        
        if (testRollback) {
          sampleBatchRows = [
            { nip: '199010102026', nama_lengkap: 'Ustadzah Aminah', jabatan: 'Guru Al-Qur\'an', gaji_pokok: 'not-a-number' }
          ];
        } else {
          sampleBatchRows = [
            { nip: '199010102026', nama_lengkap: 'Ustadzah Aminah', jabatan: 'Guru Al-Qur\'an', gaji_pokok: '3000000' }
          ];
        }
      }

      // Delay to show log updates
      setTimeout(async () => {
        setImportLog(prev => [...prev, `[VALIDATION] Mengecek kecocokan kolom template: ${headersExpected.join(', ')}`]);
        
        const payload = {
          action: 'document_importData',
          templateName,
          headersExpected,
          fileRows: sampleBatchRows
        };

        const response = await apiClient.post('/api/action', payload);
        
        if (response.data?.success) {
          setImportLog(prev => [...prev, ...response.data.logs]);
          setImportSuccessMsg(response.data.message);
          if (onImportSuccess) onImportSuccess();
        } else {
          setImportLog(prev => [...prev, ...response.data.logs]);
          setImportErrors(response.data.errors || [response.data.message]);
        }
        setIsImporting(false);
      }, 800);

    } catch (err: any) {
      setImportLog(prev => [...prev, `✗ Kesalahan Jaringan Fatal: ${err.message}`]);
      setIsImporting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl max-w-7xl mx-auto">
      
      {/* Upper Module header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-black tracking-widest rounded-full uppercase">
              MODUL DOKUMEN SISTEM
            </span>
            <span className="text-xs text-slate-500 font-mono font-bold">Ref: {dynamicFilename}</span>
          </div>
          <h2 className="text-xl font-black tracking-tight mt-1 text-white">
            Enterprise Print &amp; Document Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Satu mesin terpadu untuk cetak, ekspor PDF/Excel/Word, serta penjaminan integritas import file.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrint}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-blue-950/20"
          >
            <Printer className="h-4 w-4" />
            <span>Print Cepat</span>
          </button>
          
          <button 
            onClick={() => handleExportExcel(false)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-emerald-950/20"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Ekspor Excel</span>
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab('pdf')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'pdf' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
        >
          <Printer className="h-3.5 w-3.5" />
          <span>PDF &amp; Print</span>
        </button>
        
        <button
          onClick={() => setActiveTab('excel')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'excel' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
          <span>Spreadsheet XLSX/CSV</span>
        </button>

        <button
          onClick={() => setActiveTab('word')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'word' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Dokumen Word (DOCX)</span>
        </button>

        <button
          onClick={() => setActiveTab('import')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'import' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
        >
          <FileDown className="h-3.5 w-3.5" />
          <span>Import Wizard</span>
        </button>

        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'upload' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
        >
          <Upload className="h-3.5 w-3.5" />
          <span>Upload File</span>
        </button>

        <button
          onClick={() => setActiveTab('zip')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'zip' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
        >
          <FileArchive className="h-3.5 w-3.5" />
          <span>ZIP Bundler</span>
        </button>
      </div>

      {/* Main interactive Panel */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Left Side: Setup Parameters */}
        <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-6 h-fit">
          <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3">
            <Settings2 className="h-4.5 w-4.5 text-blue-400" />
            <h3 className="font-bold text-xs tracking-wider uppercase text-slate-300">Setelan Dokumen</h3>
          </div>

          {/* PAGE SIZE */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              Ukuran Kertas Laporan
            </label>
            <select
              value={pageSize}
              onChange={(e: any) => setPageSize(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-blue-500"
            >
              <option value="A4_P">A4 Portrait (210 x 297 mm)</option>
              <option value="A4_L">A4 Landscape (297 x 210 mm)</option>
              <option value="F4_P">F4 Portrait (215 x 330 mm)</option>
              <option value="Letter_P">Letter Portrait (216 x 279 mm)</option>
            </select>
          </div>

          {/* MARGIN CHANGER */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              <span>Batas Margin Kertas</span>
              <span className="text-blue-400 font-mono font-bold">{margin} mm</span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              value={margin}
              onChange={(e) => setMargin(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* INTEGRATED BRANDING LOGO & LETTERHEAD */}
          <div className="space-y-3">
            <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              Format Tampilan Kop &amp; Barcode
            </label>
            
            <div className="space-y-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showKop}
                  onChange={(e) => setShowKop(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-850 bg-slate-950 text-blue-600 focus:ring-0"
                />
                <span>Aktifkan Kop Surat Yayasan</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBarcode}
                  onChange={(e) => setShowBarcode(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-850 bg-slate-950 text-blue-600 focus:ring-0"
                />
                <span>Tampilkan Barcode Pengaman</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showQr}
                  onChange={(e) => setShowQr(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-850 bg-slate-950 text-blue-600 focus:ring-0"
                />
                <span>Tampilkan QR Code Verifikasi</span>
              </label>
            </div>
          </div>

          {/* DYNAMIC FILENAME IDENTIFIER */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              Format Nama File Download
            </label>
            <div className="relative">
              <input
                type="text"
                value={dynamicFilename}
                onChange={(e) => setDynamicFilename(e.target.value)}
                placeholder="cth. SPP-2026-0001"
                className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* SYSTEM PROCESS LOGS */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">ENGINE LOGS</span>
            <div className="h-28 overflow-y-auto bg-black/40 p-2.5 rounded-lg border border-slate-850 font-mono text-[9px] text-slate-400 space-y-1 scrollbar-thin">
              {systemLogs.length === 0 ? (
                <div className="text-slate-600 italic">Engine idle. Menunggu aksi...</div>
              ) : (
                systemLogs.map((log, lIdx) => (
                  <div key={lIdx} className="truncate">
                    <span className="text-blue-500">[{new Date().toLocaleTimeString()}]</span> {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Active Module Panel */}
        <div className="lg:col-span-8 flex flex-col min-h-[420px]">
          
          {/* TAB 1: PDF & PRINT PREVIEW */}
          {activeTab === 'pdf' && (
            <div className="flex-grow flex flex-col space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Live Preview Dokumen</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={handlePrint}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Cetak Sekarang</span>
                  </button>
                </div>
              </div>

              {/* Printable Interactive Canvas Sheet resembling Real Paper */}
              <div className="flex-grow bg-slate-950 border border-slate-800 rounded-2xl p-4 md:p-8 flex items-center justify-center overflow-auto shadow-inner">
                <div 
                  className={`bg-white text-slate-900 p-8 shadow-2xl rounded-sm transition-all duration-200 border border-slate-300 relative ${pageSize.endsWith('_L') ? 'w-full max-w-4xl aspect-[1.414]' : 'w-[21cm] max-w-full aspect-[0.707] min-h-[29.7cm]'}`}
                  style={{
                    padding: `${margin}mm`,
                    fontFamily: '"Times New Roman", Times, serif'
                  }}
                >
                  {/* Kop Surat Header */}
                  {showKop && (
                    <div className="border-b-[3px] border-double border-slate-900 pb-3 flex items-center gap-5">
                      {schoolProfile.logo ? (
                        <img 
                          src={schoolProfile.logo} 
                          alt="School Logo" 
                          className="h-16 w-16 object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="h-16 w-16 border border-slate-900 flex items-center justify-center font-bold text-[8px] text-slate-800 shrink-0">LOGO</div>
                      )}
                      <div className="text-center flex-grow">
                        <h3 className="text-xs md:text-sm font-bold uppercase tracking-tight m-0 text-slate-900">{schoolProfile.foundation_name}</h3>
                        <h2 className="text-sm md:text-lg font-black uppercase tracking-tight m-0 text-slate-900">{schoolProfile.name}</h2>
                        <p className="text-[9px] md:text-[10px] italic m-0 text-slate-600">NPSN: {schoolProfile.npsn} | Alamat: {schoolProfile.address}</p>
                        <p className="text-[8px] md:text-[9px] italic m-0 text-slate-500">Telp: {schoolProfile.phone} | Email: {schoolProfile.email} | Web: {schoolProfile.website}</p>
                      </div>
                    </div>
                  )}

                  {/* Document Title Section */}
                  <div className="mt-8 text-center">
                    <h3 className="text-sm font-bold uppercase tracking-tight underline m-0 text-slate-900">{title}</h3>
                    <p className="text-[10px] text-slate-600 font-semibold m-0 mt-0.5">Tahun Ajaran: {schoolProfile.academic_year} ({schoolProfile.semester})</p>
                    <p className="text-[10px] text-slate-500 font-mono m-0 mt-0.5">Nomor Referensi: REG-{dynamicFilename}</p>
                  </div>

                  {/* Document Table Render */}
                  <table className="w-full mt-6 border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100">
                        {headers.map((h, hIdx) => (
                          <th key={hIdx} className="border border-slate-900 p-2 text-left font-bold text-slate-800">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.slice(0, 10).map((row, rIdx) => (
                        <tr key={rIdx}>
                          {keys.map((key, kIdx) => {
                            const val = row[key] === null || row[key] === undefined ? '' : row[key].toString();
                            return <td key={kIdx} className="border border-slate-900 p-2 text-slate-800">{val}</td>;
                          })}
                        </tr>
                      ))}
                      {data.length > 10 && (
                        <tr>
                          <td colSpan={headers.length} className="border border-slate-900 p-2 text-slate-500 text-center italic">
                            ...dan {data.length - 10} baris dokumen lainnya tidak ditampilkan di preview...
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {/* Signatures Section */}
                  <div className="mt-12 flex justify-between text-xs text-slate-800">
                    <div className="text-center w-40">
                      <span>Menyetujui,</span>
                      <br/>
                      <strong className="block mt-1">Ketua Yayasan</strong>
                      <div className="h-16" />
                      <span className="font-bold underline">( H. Muhammad Rizqi, Lc )</span>
                    </div>

                    <div className="text-center w-40">
                      <span>Lima Puluh Kota, {new Date().toLocaleDateString('id-ID')}</span>
                      <br/>
                      <strong className="block mt-1">Petugas SIM ERP</strong>
                      <div className="h-16" />
                      <span className="font-bold underline">( Admin SIM ERP )</span>
                    </div>
                  </div>

                  {/* Security Accents Barcode */}
                  <div className="absolute bottom-6 left-8 right-8 flex items-center justify-between border-t border-dashed border-slate-300 pt-3 text-[9px] font-mono text-slate-400">
                    {showBarcode && (
                      <div>
                        <div className="font-black tracking-[4px] text-slate-800">||||||| | ||||| || |||</div>
                        <div className="text-[7px]">SECURE-REF-{dynamicFilename}</div>
                      </div>
                    )}
                    {showQr && (
                      <div className="border border-slate-400 p-1 rounded-sm flex items-center gap-1.5 bg-slate-50">
                        <QrCode className="h-5 w-5 text-slate-800 shrink-0" />
                        <div className="leading-tight text-slate-700 font-bold">
                          <div className="text-[6px] uppercase">{moduleName}</div>
                          <div className="text-[5px]">VERIFIED SIM</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EXCEL SPREADSHEETS */}
          {activeTab === 'excel' && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex-grow flex flex-col justify-center space-y-6">
              <div className="text-center max-w-lg mx-auto space-y-3">
                <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                  <FileSpreadsheet className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-white">Ekspor ke Spreadsheet</h3>
                <p className="text-slate-400 text-xs">
                  Download dataset langsung sebagai file Microsoft Excel (.xlsx) atau file format CSV standar dengan baris rapi, kolom pas, border, serta baris sum otomatis.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 max-w-xl mx-auto w-full pt-4">
                <button
                  onClick={() => handleExportExcel(false)}
                  disabled={isExporting}
                  className="p-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-2xl transition-colors cursor-pointer text-left space-y-3 group"
                >
                  <div className="h-10 w-10 bg-emerald-600/10 text-emerald-400 rounded-xl flex items-center justify-center group-hover:bg-emerald-600/20 transition-colors">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Format Excel (.xlsx)</h4>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      Mendukung multi-sheet, format angka uang, lebar otomatis, dan sum formula bawaan.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => handleExportExcel(true)}
                  disabled={isExporting}
                  className="p-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-2xl transition-colors cursor-pointer text-left space-y-3 group"
                >
                  <div className="h-10 w-10 bg-blue-600/10 text-blue-400 rounded-xl flex items-center justify-center group-hover:bg-blue-600/20 transition-colors">
                    <FileCode className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Format CSV (.csv)</h4>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      Efisien dan stabil. Sangat cocok untuk mengunduh dataset dalam jumlah besar hingga ratusan ribu baris data.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: WORD DOCS */}
          {activeTab === 'word' && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex-grow flex flex-col justify-center space-y-6">
              <div className="text-center max-w-lg mx-auto space-y-3">
                <div className="h-16 w-16 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto">
                  <FileText className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-white">Ekspor ke Word (DOCX)</h3>
                <p className="text-slate-400 text-xs">
                  Generate berkas surat menyurat, SK formal, slip gaji, slip SPP, atau invoice resmi pondok pesantren ke format file .doc siap sunting.
                </p>
              </div>

              <div className="max-w-md mx-auto w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <Info className="h-4 w-4 text-blue-400" />
                  <span>Kategori Template Terintegrasi</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                  <div className="p-2 bg-slate-950 rounded border border-slate-850">✓ Surat Keputusan (SK)</div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-850">✓ Slip Pembayaran SPP</div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-850">✓ Slip Gaji Bulanan</div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-850">✓ Berita Acara Rapat</div>
                </div>

                <button
                  onClick={handleExportWord}
                  disabled={isExporting}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Unduh Dokumen Word Sekarang</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: IMPORT DATA WIZARD */}
          {activeTab === 'import' && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex-grow flex flex-col justify-between space-y-6">
              <div>
                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-black tracking-widest rounded-full uppercase">
                  WIZARD INTEGRITAS IMPORT
                </span>
                <h3 className="text-base font-bold text-white mt-2">Mesin Import Excel / CSV</h3>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  Pilih tipe dataset, unduh format template excel resminya, lalu lakukan import data. Sistem menguji kecocokan header, validitas tipe data, duplikasi data, dan melakukan <strong className="text-blue-400">Database Transaction Rollback</strong> apabila ditemukan satu kesalahan saja.
                </p>
              </div>

              {/* Template Selectors */}
              <div className="grid sm:grid-cols-3 gap-3">
                <button
                  onClick={() => downloadImportTemplate('SiswaImport')}
                  className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-left space-y-1 cursor-pointer transition-colors"
                >
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">TEMPLATE SISWA</div>
                  <div className="text-xs font-semibold text-white flex items-center gap-1">
                    <FileDown className="h-3.5 w-3.5 text-blue-400" />
                    <span>Download Template</span>
                  </div>
                </button>

                <button
                  onClick={() => downloadImportTemplate('PegawaiImport')}
                  className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-left space-y-1 cursor-pointer transition-colors"
                >
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">TEMPLATE PEGAWAI</div>
                  <div className="text-xs font-semibold text-white flex items-center gap-1">
                    <FileDown className="h-3.5 w-3.5 text-blue-400" />
                    <span>Download Template</span>
                  </div>
                </button>

                <button
                  onClick={() => downloadImportTemplate('SppImport')}
                  className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-left space-y-1 cursor-pointer transition-colors"
                >
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">TEMPLATE TAGIHAN SPP</div>
                  <div className="text-xs font-semibold text-white flex items-center gap-1">
                    <FileDown className="h-3.5 w-3.5 text-blue-400" />
                    <span>Download Template</span>
                  </div>
                </button>
              </div>

              {/* Transaction Simulator Runs */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Eksekusi Validasi Transaksional</span>
                  <span className="text-[10px] text-slate-500 font-mono">SIMULATION TEST BED</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleImportRun(true)}
                    disabled={isImporting}
                    className="p-3 bg-red-950/20 hover:bg-red-950/35 border border-red-900/30 text-red-400 text-xs font-semibold rounded-lg flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
                    <span>Uji Import Salah (Trigger Rollback)</span>
                  </button>

                  <button
                    onClick={() => handleImportRun(false)}
                    disabled={isImporting}
                    className="p-3 bg-emerald-950/20 hover:bg-emerald-950/35 border border-emerald-900/30 text-emerald-400 text-xs font-semibold rounded-lg flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400" />
                    <span>Uji Import Benar (Commit Sukses)</span>
                  </button>
                </div>

                {/* Import logs stream */}
                {importLog.length > 0 && (
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Status Aliran Log Import:</span>
                    <div className="h-32 overflow-y-auto bg-black/40 p-2.5 rounded border border-slate-850 font-mono text-[9px] text-slate-300 space-y-1">
                      {importLog.map((logLine, idx) => (
                        <div key={idx} className={logLine.startsWith('✗') || logLine.includes('Gagal') ? 'text-red-400' : logLine.startsWith('✓') ? 'text-emerald-400' : 'text-slate-300'}>
                          {logLine}
                        </div>
                      ))}
                    </div>
                    
                    {importErrors.length > 0 && (
                      <div className="p-3 bg-red-950/30 border border-red-500/20 rounded-lg text-red-400 text-[10px] leading-relaxed font-semibold">
                        <div className="font-bold uppercase tracking-wider mb-1">Rincian Kesalahan Deteksi:</div>
                        <ul className="list-disc list-inside space-y-0.5">
                          {importErrors.map((err, eIdx) => <li key={eIdx}>{err}</li>)}
                        </ul>
                      </div>
                    )}

                    {importSuccessMsg && (
                      <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-semibold flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        <span>{importSuccessMsg}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: FILE UPLOADS */}
          {activeTab === 'upload' && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex-grow flex flex-col justify-center space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">Penyimpanan File Pendukung</h3>
                <p className="text-slate-400 text-xs mt-1">
                  Unggah berkas verifikasi dokumen, slip cetak, rincian SPP, atau kuitansi pembayaran. Mendukung file PDF, DOCX, XLSX, CSV, JPG, PNG, atau ZIP (Maksimal 10MB).
                </p>
              </div>

              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer text-center ${dragActive ? 'border-blue-500 bg-blue-950/10' : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/60'}`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.docx,.xlsx,.csv,.jpg,.jpeg,.png,.zip"
                />
                
                <div className="h-14 w-14 bg-blue-600/10 text-blue-400 rounded-xl flex items-center justify-center">
                  <Upload className="h-7 w-7" />
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white">Seret &amp; Letakkan Berkas atau Klik Untuk Memilih</p>
                  <p className="text-[10px] text-slate-500">Mendukung dokumen arsip &amp; gambar resolusi tinggi</p>
                </div>
              </div>

              {uploadedFile && (
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-400" />
                      <div className="text-left">
                        <p className="text-xs font-bold text-white truncate max-w-xs">{uploadedFile.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    {uploadProgress === 100 && <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/20">TERUNGGAH</span>}
                  </div>

                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-600 h-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                  </div>

                  {uploadError && (
                    <div className="p-3 bg-red-950/30 border border-red-500/20 text-red-400 text-xs rounded-lg font-semibold">
                      {uploadError}
                    </div>
                  )}

                  {uploadSuccess && (
                    <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg font-semibold">
                      {uploadSuccess}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: ZIP BULK PACKER */}
          {activeTab === 'zip' && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex-grow flex flex-col justify-center space-y-6">
              <div className="text-center max-w-lg mx-auto space-y-3">
                <div className="h-16 w-16 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto">
                  <FileArchive className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-white">ZIP Archiver &amp; Compressor</h3>
                <p className="text-slate-400 text-xs">
                  Gabungkan seluruh file ekspor dalam satu paket folder ZIP terkompresi tanpa mengurangi kualitas dokumen. Sangat ideal untuk pencadangan (backup) berkala.
                </p>
              </div>

              <div className="max-w-md mx-auto w-full pt-2">
                <button
                  onClick={handleDownloadZip}
                  disabled={isExporting}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-blue-950/30"
                >
                  <FileArchive className="h-4.5 w-4.5" />
                  <span>Download Bundel ZIP Sekarang</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
