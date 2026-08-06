/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Layout, 
  FileText, 
  CreditCard, 
  Layers, 
  QrCode, 
  Stamp, 
  FileSpreadsheet, 
  Image as ImageIcon,
  Tag, 
  UserSquare, 
  Save, 
  RefreshCw, 
  Maximize2, 
  Printer, 
  CheckCircle, 
  Settings2, 
  HelpCircle,
  Eye,
  Bookmark,
  Activity,
  Award,
  Hash,
  Download
} from 'lucide-react';
import apiClient from '../api/client';
import { useAuth } from '../contexts/AuthContext';

import EnterpriseReportPrintEngine from '../components/EnterpriseReportPrintEngine';

// Designers Tabs Enum
type DesignerTab = 
  | 'reports'
  | 'template' 
  | 'idcard' 
  | 'rapor' 
  | 'leger' 
  | 'surat' 
  | 'slip' 
  | 'invoice' 
  | 'label' 
  | 'ujian' 
  | 'ppdb' 
  | 'qr' 
  | 'barcode'
  | 'ocr';

export default function StudioDokumen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<DesignerTab>('reports');
  const [logs, setLogs] = useState<string[]>(['[STUDIO] Inisialisasi Studio Desain Dokumen...']);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // AI Document Classification & OCR Studio state
  const [classificationResult, setClassificationResult] = useState<any>(null);
  const [ocrExtractedData, setOcrExtractedData] = useState<any>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [selectedScanFilename, setSelectedScanFilename] = useState<string>('KTP_Siswa_Ahmad_Fauzi.jpg');

  const runAiClassificationAndOcr = async (fileName: string) => {
    setSelectedScanFilename(fileName);
    setIsClassifying(true);
    setClassificationResult(null);
    setOcrExtractedData(null);
    addLog(`Memulai model klasifikasi gambar AI untuk berkas [${fileName}]...`);

    try {
      const classRes = await apiClient.post('/api/action?action=aiClassifyDocument', {
        file_name: fileName,
        file_type: 'image/jpeg'
      });

      if (classRes.data.success) {
        const clsData = classRes.data.data;
        setClassificationResult(clsData);
        addLog(`✓ Klasifikasi Berhasil: Terdeteksi sebagai [${clsData.predicted_category}] dengan confidence ${clsData.confidence_score}% (${clsData.classification_reason})`);

        addLog(`Meneruskan berkas terklasifikasi ke OCR Engine (${clsData.predicted_category})...`);
        const ocrRes = await apiClient.post('/api/action?action=aiOCR', {
          file_name: fileName,
          file_type: 'image/jpeg',
          doc_category: clsData.predicted_category
        });

        if (ocrRes.data.success) {
          setOcrExtractedData(ocrRes.data.data);
          addLog(`✓ OCR Ekstraksi Selesai untuk ${clsData.predicted_category}. Data terstruktur siap disinkronkan.`);
        }
      }
    } catch (err: any) {
      addLog(`❌ ERROR Klasifikasi/OCR: ${err.message}`);
    } finally {
      setIsClassifying(false);
    }
  };

  // ----------------------------------------------------
  // 1. STATE - TEMPLATE DESIGNER
  // ----------------------------------------------------
  const [templateConfig, setTemplateConfig] = useState({
    fontFamily: 'font-serif',
    headerStyle: 'double-line',
    logoUrl: '/logo.png',
    logoSize: 70,
    showKop: true,
    showWatermark: false,
    watermarkText: 'YAYASAN DARUL HADITS',
    pageNumberStyle: 'bottom-center',
    capUrl: '/stamp-cap.png',
    capPosition: 'right',
    signatureRole: 'Kepala Sekolah',
    signatureName: 'Dr. Ahmad Fauzi, M.Pd',
    signatureDigital: true,
    kopTitle: 'YAYASAN DARUL HADITS LIMA PULUH KOTA',
    kopSubtitle: 'PONDOK PESANTREN MODERN AL-AZHAR',
    kopDetails: 'Alamat: Jl. Raya Payakumbuh Km 7, Sumatera Barat | Telp: (0752) 12345 | Web: www.darulhadits.org'
  });

  // ----------------------------------------------------
  // 2. STATE - ID CARD DESIGNER
  // ----------------------------------------------------
  const [idCardConfig, setIdCardConfig] = useState({
    cardType: 'PELAJAR' as 'PELAJAR' | 'SANTRI' | 'GURU' | 'PEGAWAI' | 'ALUMNI' | 'PERPUSTAKAAN' | 'ASRAMA' | 'UJIAN' | 'PPDB',
    orientation: 'horizontal' as 'horizontal' | 'vertical',
    cardWidth: 86, // in mm
    cardHeight: 54, // in mm
    themeColor: '#2563eb',
    borderColor: '#3b82f6',
    borderWidth: 2,
    bgColor: '#ffffff',
    textColor: '#1e293b',
    borderRadius: 12,
    headerTitle: 'KARTU PELAJAR ELEKTRONIK',
    instName: 'DARUL HADITS AL-AZHAR',
    photoShape: 'square' as 'square' | 'rounded' | 'circle',
    qrX: 72,
    qrY: 10,
    showBarcode: true,
    showSignature: true,
    signRole: 'Kepala Sekolah',
    backgroundImage: '',
    verifiedStamp: true
  });

  // ----------------------------------------------------
  // 3. STATE - RAPOR & LEGER DESIGNER
  // ----------------------------------------------------
  const [raporConfig, setRaporConfig] = useState({
    layoutType: 'A4' as 'A4' | 'F4',
    borderWeight: 'thin' as 'none' | 'thin' | 'double',
    borderColor: '#0f172a',
    showKkm: true,
    showRank: true,
    showAbsence: true,
    showNotes: true,
    signatureDate: 'Payakumbuh, 20 Juni 2026',
    headerAlignment: 'center'
  });

  const [legerConfig, setLegerConfig] = useState({
    orientation: 'landscape' as 'portrait' | 'landscape',
    compactMode: true,
    showAverages: true,
    highlightFails: true,
    failThreshold: 75,
    showAttendance: true,
    freezeColumns: true
  });

  // ----------------------------------------------------
  // 4. STATE - SURAT DESIGNER
  // ----------------------------------------------------
  const [suratConfig, setSuratConfig] = useState({
    docType: 'SK' as 'SK' | 'PENGANTAR' | 'UNDANGAN' | 'MUTASI',
    marginSize: 25,
    showKopSurat: true,
    showReferenceCode: true,
    footerAddress: true,
    digitalSignVerify: true,
    stampCap: 'ORIGINAL' as 'NONE' | 'ORIGINAL' | 'DRAFT'
  });

  // ----------------------------------------------------
  // 5. STATE - SLIP & INVOICE DESIGNER
  // ----------------------------------------------------
  const [slipConfig, setSlipConfig] = useState({
    layoutSize: 'A5' as 'A4' | 'A5' | 'THERMAL',
    showBreakdown: true,
    allowPartialPayment: true,
    signatureName: 'Nurul Hidayah, S.E.',
    signatureRole: 'Bendahara Sekolah',
    footerNotes: 'Terima kasih atas kontribusi Anda membangun pendidikan bangsa.',
    primaryColor: '#059669',
    showQrCode: true
  });

  const [invoiceConfig, setInvoiceConfig] = useState({
    dueDays: 14,
    showTax: false,
    invoicePrefix: 'INV',
    paymentInstruction: 'Transfer Bank Syariah Mandiri (BSM) Rek: 124-009-2103 a.n Yayasan',
    enableLateFee: false,
    lateFeeAmount: 5000
  });

  // ----------------------------------------------------
  // 6. STATE - LABEL DESIGNER
  // ----------------------------------------------------
  const [labelConfig, setLabelConfig] = useState({
    labelWidth: 70, // mm
    labelHeight: 40, // mm
    gridCols: 3,
    gridRows: 5,
    showBorder: true,
    barcodeType: 'CODE128' as 'CODE128' | 'EAN13' | 'EAN8' | 'UPC',
    showLogo: true,
    fontSize: 9
  });

  // ----------------------------------------------------
  // 7. STATE - KARTU UJIAN & PPDB DESIGNER
  // ----------------------------------------------------
  const [ujianConfig, setUjianConfig] = useState({
    layoutPerSheet: 4, // 4 cards in 1 A4
    showPhoto: true,
    showInstructions: true,
    instructionsText: '1. Harap hadir 15 menit sebelum ujian.\n2. Membawa alat tulis sendiri.\n3. Dilarang membawa handphone/gadget.',
    showRoom: true,
    signatureUjian: 'Ketua Panitia Ujian'
  });

  const [ppdbConfig, setPpdbConfig] = useState({
    showRegistrationNo: true,
    showSelectionStatus: true,
    showPaymentStatus: true,
    contactHelpdesk: '0812-3456-7890',
    verifiedStamp: true
  });

  // ----------------------------------------------------
  // 8. STATE - QR & BARCODE DESIGNER
  // ----------------------------------------------------
  const [qrConfig, setQrConfig] = useState({
    qrSize: 150,
    fgColor: '#000000',
    bgColor: '#ffffff',
    centerLogo: true,
    errorCorrection: 'H' as 'L' | 'M' | 'Q' | 'H',
    contentFormat: 'hash' as 'uuid' | 'url' | 'doc_no' | 'hash'
  });

  const [barcodeConfig, setBarcodeConfig] = useState({
    barcodeType: 'CODE128' as 'CODE128' | 'EAN13' | 'EAN8' | 'UPC',
    height: 50,
    widthScale: 2,
    displayValue: true,
    lineColor: '#000000'
  });

  // ----------------------------------------------------
  // PERSIST DESIGNS TO LOCALSTORAGE
  // ----------------------------------------------------
  useEffect(() => {
    // Attempt to load from localStorage on mount
    try {
      const savedTemplate = localStorage.getItem('erp_studio_template');
      if (savedTemplate) setTemplateConfig(JSON.parse(savedTemplate));

      const savedIdCard = localStorage.getItem('erp_studio_idcard');
      if (savedIdCard) setIdCardConfig(JSON.parse(savedIdCard));

      const savedRapor = localStorage.getItem('erp_studio_rapor');
      if (savedRapor) setRaporConfig(JSON.parse(savedRapor));

      const savedLeger = localStorage.getItem('erp_studio_leger');
      if (savedLeger) setLegerConfig(JSON.parse(savedLeger));

      const savedSurat = localStorage.getItem('erp_studio_surat');
      if (savedSurat) setSuratConfig(JSON.parse(savedSurat));

      const savedSlip = localStorage.getItem('erp_studio_slip');
      if (savedSlip) setSlipConfig(JSON.parse(savedSlip));

      const savedLabel = localStorage.getItem('erp_studio_label');
      if (savedLabel) setLabelConfig(JSON.parse(savedLabel));

      const savedUjian = localStorage.getItem('erp_studio_ujian');
      if (savedUjian) setUjianConfig(JSON.parse(savedUjian));

      const savedPpdb = localStorage.getItem('erp_studio_ppdb');
      if (savedPpdb) setPpdbConfig(JSON.parse(savedPpdb));

      const savedQr = localStorage.getItem('erp_studio_qr');
      if (savedQr) setQrConfig(JSON.parse(savedQr));

      const savedBarcode = localStorage.getItem('erp_studio_barcode');
      if (savedBarcode) setBarcodeConfig(JSON.parse(savedBarcode));

      addLog('✓ Berhasil memuat konfigurasi desain yang disimpan.');
    } catch (e) {
      addLog('⚠️ Gagal memuat data dari LocalStorage, menggunakan nilai default.');
    }
  }, []);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 30));
  };

  const saveConfiguration = async () => {
    setIsSaving(true);
    setSaveSuccess(null);
    addLog(`Menyimpan konfigurasi Studio untuk tab [${activeTab.toUpperCase()}]...`);

    try {
      // 1. Save to client side localStorage
      localStorage.setItem('erp_studio_template', JSON.stringify(templateConfig));
      localStorage.setItem('erp_studio_idcard', JSON.stringify(idCardConfig));
      localStorage.setItem('erp_studio_rapor', JSON.stringify(raporConfig));
      localStorage.setItem('erp_studio_leger', JSON.stringify(legerConfig));
      localStorage.setItem('erp_studio_surat', JSON.stringify(suratConfig));
      localStorage.setItem('erp_studio_slip', JSON.stringify(slipConfig));
      localStorage.setItem('erp_studio_invoice', JSON.stringify(invoiceConfig));
      localStorage.setItem('erp_studio_label', JSON.stringify(labelConfig));
      localStorage.setItem('erp_studio_ujian', JSON.stringify(ujianConfig));
      localStorage.setItem('erp_studio_ppdb', JSON.stringify(ppdbConfig));
      localStorage.setItem('erp_studio_qr', JSON.stringify(qrConfig));
      localStorage.setItem('erp_studio_barcode', JSON.stringify(barcodeConfig));

      // 2. Sync to centralized School Profile database if authorized
      const payload = {
        action: 'saveStudioConfiguration',
        activeTab,
        configs: {
          templateConfig,
          idCardConfig,
          raporConfig,
          legerConfig,
          suratConfig,
          slipConfig,
          invoiceConfig,
          labelConfig,
          ujianConfig,
          ppdbConfig,
          qrConfig,
          barcodeConfig
        }
      };

      const response = await apiClient.post('/api/action', payload);
      
      setTimeout(() => {
        setIsSaving(false);
        setSaveSuccess(`Desain ${activeTab.toUpperCase()} berhasil disimpan ke server database dan diaktifkan secara global!`);
        addLog(`✓ SUKSES: Konfigurasi ${activeTab.toUpperCase()} berhasil dikomit ke sistem.`);
      }, 600);

    } catch (err: any) {
      setIsSaving(false);
      addLog(`❌ ERROR: Gagal melakukan sinkronisasi database: ${err.message}`);
    }
  };

  const resetToDefault = () => {
    if (confirm(`Apakah Anda yakin ingin mereset layout ${activeTab.toUpperCase()} ke setelan bawaan?`)) {
      addLog(`Mereset konfigurasi ${activeTab.toUpperCase()} ke setelan bawaan...`);
      // local states resets
      if (activeTab === 'template') {
        setTemplateConfig({
          fontFamily: 'font-serif',
          headerStyle: 'double-line',
          logoUrl: '/logo.png',
          logoSize: 70,
          showKop: true,
          showWatermark: false,
          watermarkText: 'YAYASAN DARUL HADITS',
          pageNumberStyle: 'bottom-center',
          capUrl: '/stamp-cap.png',
          capPosition: 'right',
          signatureRole: 'Kepala Sekolah',
          signatureName: 'Dr. Ahmad Fauzi, M.Pd',
          signatureDigital: true,
          kopTitle: 'YAYASAN DARUL HADITS LIMA PULUH KOTA',
          kopSubtitle: 'PONDOK PESANTREN MODERN AL-AZHAR',
          kopDetails: 'Alamat: Jl. Raya Payakumbuh Km 7, Sumatera Barat | Telp: (0752) 12345 | Web: www.darulhadits.org'
        });
      } else if (activeTab === 'idcard') {
        setIdCardConfig({
          cardType: 'PELAJAR',
          orientation: 'horizontal',
          cardWidth: 86,
          cardHeight: 54,
          themeColor: '#2563eb',
          borderColor: '#3b82f6',
          borderWidth: 2,
          bgColor: '#ffffff',
          textColor: '#1e293b',
          borderRadius: 12,
          headerTitle: 'KARTU PELAJAR ELEKTRONIK',
          instName: 'DARUL HADITS AL-AZHAR',
          photoShape: 'square',
          qrX: 72,
          qrY: 10,
          showBarcode: true,
          showSignature: true,
          signRole: 'Kepala Sekolah',
          backgroundImage: '',
          verifiedStamp: true
        });
      }
      addLog(`✓ Reset selesai.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-extrabold tracking-wider rounded-full uppercase">
              STUDIO DESIGNER ENGINE
            </span>
            <span className="text-xs text-slate-500 font-mono">v2.6 No-Code Tool</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800 mt-1">
            Studio Dokumen &amp; Desain Kartu
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sesuaikan template cetak, kop surat, tata letak kartu pelajar, struk SPP, barcode, dan QR tanpa merubah kode sumber aplikasi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetToDefault}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reset Bawaan</span>
          </button>

          <button
            onClick={saveConfiguration}
            disabled={isSaving}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-blue-900/10"
          >
            {isSaving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>Simpan Desain</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-emerald-800 text-xs font-semibold animate-fade-in">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Main Grid Workspace */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column: Navigation categories */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-4 space-y-1">
          <div className="px-3 pb-3 mb-2 border-b border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori Desain</span>
          </div>

          <button
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${activeTab === 'reports' ? 'bg-emerald-50 text-emerald-700 font-extrabold shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Printer className="h-4 w-4 text-emerald-600" />
            <span>★ Report &amp; Print Engine (Target)</span>
          </button>

          <button
            onClick={() => setActiveTab('template')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${activeTab === 'template' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Layout className="h-4 w-4" />
            <span>1. Template Utama</span>
          </button>

          <button
            onClick={() => setActiveTab('idcard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${activeTab === 'idcard' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <CreditCard className="h-4 w-4" />
            <span>2. Kartu Anggota (ID Card)</span>
          </button>

          <button
            onClick={() => setActiveTab('rapor')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${activeTab === 'rapor' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Bookmark className="h-4 w-4" />
            <span>3. Rapor Akademik</span>
          </button>

          <button
            onClick={() => setActiveTab('leger')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${activeTab === 'leger' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>4. Leger Kelas</span>
          </button>

          <button
            onClick={() => setActiveTab('surat')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${activeTab === 'surat' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <FileText className="h-4 w-4" />
            <span>5. Surat Resmi (SK/Undangan)</span>
          </button>

          <button
            onClick={() => setActiveTab('slip')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${activeTab === 'slip' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Stamp className="h-4 w-4" />
            <span>6. Slip Gaji / Slip SPP</span>
          </button>

          <button
            onClick={() => setActiveTab('invoice')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${activeTab === 'invoice' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <FileText className="h-4 w-4 text-emerald-600" />
            <span>7. Invoice &amp; Tagihan</span>
          </button>

          <button
            onClick={() => setActiveTab('label')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${activeTab === 'label' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Tag className="h-4 w-4" />
            <span>8. Label Buku &amp; Inventaris</span>
          </button>

          <button
            onClick={() => setActiveTab('ujian')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${activeTab === 'ujian' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <UserSquare className="h-4 w-4" />
            <span>9. Kartu Peserta Ujian</span>
          </button>

          <button
            onClick={() => setActiveTab('ppdb')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${activeTab === 'ppdb' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Award className="h-4 w-4" />
            <span>10. Kartu PPDB Seleksi</span>
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${activeTab === 'qr' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <QrCode className="h-4 w-4" />
            <span>11. QR Code Verifikator</span>
          </button>

          <button
            onClick={() => setActiveTab('barcode')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${activeTab === 'barcode' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Hash className="h-4 w-4" />
            <span>12. Barcode Generator</span>
          </button>

          <button
            onClick={() => setActiveTab('ocr')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${activeTab === 'ocr' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Activity className="h-4 w-4" />
            <span>13. AI Klasifikasi &amp; OCR Dokumen</span>
          </button>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <span className="text-[9px] font-black font-mono text-slate-400 tracking-wider">LOG AKTIVITAS STUDIO</span>
            <div className="h-28 overflow-y-auto bg-slate-50 border border-slate-200 rounded-xl p-2.5 mt-1.5 font-mono text-[9px] text-slate-500 space-y-1">
              {logs.map((log, index) => (
                <div key={index} className="truncate">{log}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Center/Right Columns: Interactive Settings & Live Previews */}
        {activeTab === 'reports' ? (
          <div className="lg:col-span-9">
            <EnterpriseReportPrintEngine />
          </div>
        ) : (
          <div className="lg:col-span-9 grid md:grid-cols-12 gap-6">
          
          {/* Controls Sub-Panel (col-span-5) */}
          <div className="md:col-span-5 bg-white border border-slate-200 rounded-3xl p-5 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Settings2 className="h-4.5 w-4.5 text-blue-600" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                Kontrol Parameter Desain
              </h3>
            </div>

            {/* Render controls based on Active Tab */}
            {activeTab === 'template' && (
              <div className="space-y-4 text-xs">
                {/* Font Selector */}
                <div className="space-y-1.5">
                  <label className="block text-slate-600 font-bold">Keluarga Font (Tipografi)</label>
                  <select 
                    value={templateConfig.fontFamily}
                    onChange={(e) => setTemplateConfig({...templateConfig, fontFamily: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2 outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="font-serif">Georgia / Times New Roman (Formal)</option>
                    <option value="font-sans">Inter / Roboto (Modern Minimalist)</option>
                    <option value="font-mono">Fira Code / JetBrains Mono (Tech-Accents)</option>
                  </select>
                </div>

                {/* Kop Surat Header Line Style */}
                <div className="space-y-1.5">
                  <label className="block text-slate-600 font-bold">Garis Kop Surat</label>
                  <select 
                    value={templateConfig.headerStyle}
                    onChange={(e) => setTemplateConfig({...templateConfig, headerStyle: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2 outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="double-line">Double Line (Tebal Tipis)</option>
                    <option value="single-line">Single Line (Garis Tunggal)</option>
                    <option value="dashed">Dashed Line (Garis Putus-putus)</option>
                    <option value="none">Tanpa Garis Pembatas</option>
                  </select>
                </div>

                {/* Kop Surat Text Input */}
                <div className="space-y-2">
                  <label className="block text-slate-600 font-bold">Nama Yayasan &amp; Sekolah</label>
                  <input 
                    type="text" 
                    value={templateConfig.kopTitle}
                    onChange={(e) => setTemplateConfig({...templateConfig, kopTitle: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2 outline-none focus:border-blue-500 font-semibold" 
                    placeholder="Nama Yayasan"
                  />
                  <input 
                    type="text" 
                    value={templateConfig.kopSubtitle}
                    onChange={(e) => setTemplateConfig({...templateConfig, kopSubtitle: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2 outline-none focus:border-blue-500 font-semibold" 
                    placeholder="Nama Sekolah"
                  />
                </div>

                {/* Logo Size */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-600">
                    <span>Ukuran Logo Sekolah</span>
                    <span>{templateConfig.logoSize}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="40" 
                    max="120"
                    value={templateConfig.logoSize}
                    onChange={(e) => setTemplateConfig({...templateConfig, logoSize: Number(e.target.value)})}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Watermark Controls */}
                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={templateConfig.showWatermark}
                      onChange={(e) => setTemplateConfig({...templateConfig, showWatermark: e.target.checked})}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span>Aktifkan Watermark Latar</span>
                  </label>
                  {templateConfig.showWatermark && (
                    <input 
                      type="text" 
                      value={templateConfig.watermarkText}
                      onChange={(e) => setTemplateConfig({...templateConfig, watermarkText: e.target.value})}
                      className="w-full bg-white border border-slate-200 text-xs rounded-xl p-2 outline-none focus:border-blue-500 font-semibold"
                      placeholder="Teks Watermark"
                    />
                  )}
                </div>

                {/* Signature Config */}
                <div className="space-y-2">
                  <label className="block text-slate-600 font-bold">Penandatangan Utama</label>
                  <input 
                    type="text" 
                    value={templateConfig.signatureRole}
                    onChange={(e) => setTemplateConfig({...templateConfig, signatureRole: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2 outline-none" 
                    placeholder="Jabatan"
                  />
                  <input 
                    type="text" 
                    value={templateConfig.signatureName}
                    onChange={(e) => setTemplateConfig({...templateConfig, signatureName: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2 outline-none" 
                    placeholder="Nama Lengkap"
                  />
                </div>
              </div>
            )}

            {activeTab === 'idcard' && (
              <div className="space-y-4 text-xs">
                {/* Orientation Selector */}
                <div className="space-y-1.5">
                  <label className="block text-slate-600 font-bold">Orientasi Kartu</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIdCardConfig({...idCardConfig, orientation: 'horizontal'})}
                      className={`py-2 px-3 border rounded-xl font-bold cursor-pointer transition-all flex items-center justify-center gap-1 ${idCardConfig.orientation === 'horizontal' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                    >
                      <span>↔️ Horizontal</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIdCardConfig({...idCardConfig, orientation: 'vertical'})}
                      className={`py-2 px-3 border rounded-xl font-bold cursor-pointer transition-all flex items-center justify-center gap-1 ${idCardConfig.orientation === 'vertical' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                    >
                      <span>↕️ Vertikal</span>
                    </button>
                  </div>
                </div>

                {/* ID Card Type */}
                <div className="space-y-1.5">
                  <label className="block text-slate-600 font-bold">Jenis Kartu Anggota</label>
                  <select 
                    value={idCardConfig.cardType}
                    onChange={(e) => setIdCardConfig({...idCardConfig, cardType: e.target.value as any})}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2 outline-none font-semibold focus:border-blue-500"
                  >
                    <option value="PELAJAR">Kartu Pelajar</option>
                    <option value="SANTRI">Kartu Santri</option>
                    <option value="GURU">Kartu Guru / Pendidik</option>
                    <option value="PEGAWAI">Kartu Pegawai Yayasan</option>
                    <option value="ALUMNI">Kartu Alumni</option>
                    <option value="PERPUSTAKAAN">Kartu Anggota Perpustakaan</option>
                    <option value="ASRAMA">Kartu Penghuni Asrama</option>
                  </select>
                </div>

                {/* Editable Header Titles */}
                <div className="space-y-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600">Judul Header Kartu</label>
                    <input 
                      type="text" 
                      value={idCardConfig.headerTitle}
                      onChange={(e) => setIdCardConfig({...idCardConfig, headerTitle: e.target.value})}
                      className="w-full bg-white border border-slate-200 text-xs rounded-lg p-1.5 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600">Nama Instansi / Yayasan</label>
                    <input 
                      type="text" 
                      value={idCardConfig.instName}
                      onChange={(e) => setIdCardConfig({...idCardConfig, instName: e.target.value})}
                      className="w-full bg-white border border-slate-200 text-xs rounded-lg p-1.5 font-bold"
                    />
                  </div>
                </div>

                {/* Colors Customization (Border & Background Fill) */}
                <div className="space-y-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <label className="block text-slate-700 font-bold">Warna Bingkai & Background</label>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-semibold text-slate-600">Warna Aksen Top:</span>
                    <input 
                      type="color" 
                      value={idCardConfig.themeColor}
                      onChange={(e) => setIdCardConfig({...idCardConfig, themeColor: e.target.value})}
                      className="h-6 w-10 rounded border cursor-pointer"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-semibold text-slate-600">Warna Garis Bingkai:</span>
                    <input 
                      type="color" 
                      value={idCardConfig.borderColor}
                      onChange={(e) => setIdCardConfig({...idCardConfig, borderColor: e.target.value})}
                      className="h-6 w-10 rounded border cursor-pointer"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-semibold text-slate-600">Warna Isi/Background:</span>
                    <input 
                      type="color" 
                      value={idCardConfig.bgColor}
                      onChange={(e) => setIdCardConfig({...idCardConfig, bgColor: e.target.value})}
                      className="h-6 w-10 rounded border cursor-pointer"
                    />
                  </div>
                </div>

                {/* Photo Shape */}
                <div className="space-y-1.5">
                  <label className="block text-slate-600 font-bold">Bentuk Bingkai Foto</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['square', 'rounded', 'circle'].map(shape => (
                      <button
                        key={shape}
                        type="button"
                        onClick={() => setIdCardConfig({...idCardConfig, photoShape: shape as any})}
                        className={`py-1.5 border rounded-xl text-xs font-bold cursor-pointer transition-all ${idCardConfig.photoShape === shape ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                      >
                        {shape === 'square' ? 'Kotak' : shape === 'rounded' ? 'Rounded' : 'Bulat'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* QR Positioning */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-600">
                    <span>Posisi Horizontal QR Code</span>
                    <span>{idCardConfig.qrX}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="90"
                    value={idCardConfig.qrX}
                    onChange={(e) => setIdCardConfig({...idCardConfig, qrX: Number(e.target.value)})}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Safety checkbox */}
                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={idCardConfig.showBarcode}
                      onChange={(e) => setIdCardConfig({...idCardConfig, showBarcode: e.target.checked})}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span>Tampilkan Barcode Belakang</span>
                  </label>
                  <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={idCardConfig.verifiedStamp}
                      onChange={(e) => setIdCardConfig({...idCardConfig, verifiedStamp: e.target.checked})}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span>Sertakan Stempel Digital</span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'rapor' && (
              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block text-slate-600 font-bold">Ukuran Kertas Rapor</label>
                  <select 
                    value={raporConfig.layoutType}
                    onChange={(e) => setRaporConfig({...raporConfig, layoutType: e.target.value as any})}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2 outline-none font-semibold"
                  >
                    <option value="A4">A4 (Standard Nasional)</option>
                    <option value="F4">F4 Folio (Pesantren)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-600 font-bold">Desain Bingkai Halaman</label>
                  <select 
                    value={raporConfig.borderWeight}
                    onChange={(e) => setRaporConfig({...raporConfig, borderWeight: e.target.value as any})}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2 outline-none font-semibold"
                  >
                    <option value="none">Tanpa Bingkai</option>
                    <option value="thin">Satu Garis Tipis (Modern)</option>
                    <option value="double">Dua Garis Tebal-Tipis (Klasik)</option>
                  </select>
                </div>

                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={raporConfig.showKkm}
                      onChange={(e) => setRaporConfig({...raporConfig, showKkm: e.target.checked})}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span>Tampilkan Nilai KKM Kriteria</span>
                  </label>
                  <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={raporConfig.showRank}
                      onChange={(e) => setRaporConfig({...raporConfig, showRank: e.target.checked})}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span>Tampilkan Peringkat Siswa</span>
                  </label>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-600 font-bold">Lokasi &amp; Tanggal TTD</label>
                  <input 
                    type="text" 
                    value={raporConfig.signatureDate}
                    onChange={(e) => setRaporConfig({...raporConfig, signatureDate: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2 outline-none font-semibold"
                  />
                </div>
              </div>
            )}

            {activeTab === 'leger' && (
              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block text-slate-600 font-bold">Orientasi Halaman Leger</label>
                  <select 
                    value={legerConfig.orientation}
                    onChange={(e) => setLegerConfig({...legerConfig, orientation: e.target.value as any})}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2 outline-none font-semibold"
                  >
                    <option value="landscape">Landscape (Sangat Direkomendasikan)</option>
                    <option value="portrait">Portrait</option>
                  </select>
                </div>

                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={legerConfig.compactMode}
                      onChange={(e) => setLegerConfig({...legerConfig, compactMode: e.target.checked})}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span>Gunakan Mode Padat (Fit 1 Halaman)</span>
                  </label>
                  <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={legerConfig.highlightFails}
                      onChange={(e) => setLegerConfig({...legerConfig, highlightFails: e.target.checked})}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span>Tandai Merah Nilai di Bawah Threshold</span>
                  </label>
                </div>

                {legerConfig.highlightFails && (
                  <div className="space-y-1.5">
                    <label className="block text-slate-600 font-bold">Batas Nilai Lulus (Threshold KKM)</label>
                    <input 
                      type="number" 
                      value={legerConfig.failThreshold}
                      onChange={(e) => setLegerConfig({...legerConfig, failThreshold: Number(e.target.value)})}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2 outline-none font-semibold"
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'surat' && (
              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block text-slate-600 font-bold">Template Jenis Surat Resmi</label>
                  <select 
                    value={suratConfig.docType}
                    onChange={(e) => setSuratConfig({...suratConfig, docType: e.target.value as any})}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2 outline-none font-semibold"
                  >
                    <option value="SK">SK Yayasan / Kepala Sekolah</option>
                    <option value="PENGANTAR">Surat Pengantar Dinas</option>
                    <option value="UNDANGAN">Surat Undangan Rapat Ortu</option>
                    <option value="MUTASI">Surat Keterangan Pindah</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-600 font-bold">Ukuran Batas Margin Halaman</label>
                  <select 
                    value={suratConfig.marginSize}
                    onChange={(e) => setSuratConfig({...suratConfig, marginSize: Number(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2 outline-none font-semibold"
                  >
                    <option value="20">Sempit (2.0 cm)</option>
                    <option value="25">Standar (2.5 cm)</option>
                    <option value="30">Lebar (3.0 cm)</option>
                  </select>
                </div>

                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={suratConfig.showKopSurat}
                      onChange={(e) => setSuratConfig({...suratConfig, showKopSurat: e.target.checked})}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span>Sertakan Kop Surat Terintegrasi</span>
                  </label>
                  <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={suratConfig.digitalSignVerify}
                      onChange={(e) => setSuratConfig({...suratConfig, digitalSignVerify: e.target.checked})}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span>QR Code Link Verifikasi TTD</span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'slip' && (
              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block text-slate-600 font-bold">Ukuran Layout Bukti Bayar</label>
                  <select 
                    value={slipConfig.layoutSize}
                    onChange={(e) => setSlipConfig({...slipConfig, layoutSize: e.target.value as any})}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2 outline-none font-semibold"
                  >
                    <option value="A4">A4 (Satu Cetakan Besar)</option>
                    <option value="A5">A5 Landscape (Setengah Kertas)</option>
                    <option value="THERMAL">Kertas Thermal Kasir (80 mm)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-600 font-bold">Catatan Kaki Struk</label>
                  <textarea 
                    value={slipConfig.footerNotes}
                    onChange={(e) => setSlipConfig({...slipConfig, footerNotes: e.target.value})}
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2 outline-none font-semibold resize-none"
                  />
                </div>

                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={slipConfig.showQrCode}
                      onChange={(e) => setSlipConfig({...slipConfig, showQrCode: e.target.checked})}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span>Sertakan QR Code Verifikasi SPP</span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'invoice' && (
              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block text-slate-600 font-bold font-mono">Batas Tempo Invoice (Hari)</label>
                  <input 
                    type="number" 
                    value={invoiceConfig.dueDays}
                    onChange={(e) => setInvoiceConfig({...invoiceConfig, dueDays: Number(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-600 font-bold">Instruksi Pembayaran Bank</label>
                  <textarea 
                    value={invoiceConfig.paymentInstruction}
                    onChange={(e) => setInvoiceConfig({...invoiceConfig, paymentInstruction: e.target.value})}
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2 outline-none font-semibold resize-none"
                  />
                </div>

                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={invoiceConfig.enableLateFee}
                      onChange={(e) => setInvoiceConfig({...invoiceConfig, enableLateFee: e.target.checked})}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span>Terapkan Denda Telat Bayar</span>
                  </label>
                  {invoiceConfig.enableLateFee && (
                    <input 
                      type="number" 
                      value={invoiceConfig.lateFeeAmount}
                      onChange={(e) => setInvoiceConfig({...invoiceConfig, lateFeeAmount: Number(e.target.value)})}
                      className="w-full bg-white border border-slate-200 text-xs rounded-xl p-2 font-mono mt-1"
                      placeholder="Nominal Denda (Rp)"
                    />
                  )}
                </div>
              </div>
            )}

            {activeTab === 'label' && (
              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block text-slate-600 font-bold">Format Simbologi Barcode</label>
                  <select 
                    value={labelConfig.barcodeType}
                    onChange={(e) => setLabelConfig({...labelConfig, barcodeType: e.target.value as any})}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2 outline-none font-semibold"
                  >
                    <option value="CODE128">Code 128 (Sangat Fleksibel)</option>
                    <option value="EAN13">EAN 13 (Standar Internasional)</option>
                    <option value="EAN8">EAN 8 (Buku &amp; ATK Sempit)</option>
                    <option value="UPC">UPC-A (Standar Industri)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-slate-500 font-bold">Lebar Label (mm)</label>
                    <input 
                      type="number" 
                      value={labelConfig.labelWidth}
                      onChange={(e) => setLabelConfig({...labelConfig, labelWidth: Number(e.target.value)})}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-500 font-bold">Tinggi Label (mm)</label>
                    <input 
                      type="number" 
                      value={labelConfig.labelHeight}
                      onChange={(e) => setLabelConfig({...labelConfig, labelHeight: Number(e.target.value)})}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ujian' && (
              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block text-slate-600 font-bold">Layout Kartu Per-Lembar A4</label>
                  <select 
                    value={ujianConfig.layoutPerSheet}
                    onChange={(e) => setUjianConfig({...ujianConfig, layoutPerSheet: Number(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2 outline-none font-semibold"
                  >
                    <option value="2">2 Kartu per Halaman</option>
                    <option value="4">4 Kartu per Halaman (Rekomendasi)</option>
                    <option value="6">6 Kartu per Halaman (Hemat Kertas)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-600 font-bold">Petunjuk Peserta Ujian</label>
                  <textarea 
                    value={ujianConfig.instructionsText}
                    onChange={(e) => setUjianConfig({...ujianConfig, instructionsText: e.target.value})}
                    rows={4}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2 outline-none font-semibold resize-none"
                  />
                </div>
              </div>
            )}

            {activeTab === 'ppdb' && (
              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block text-slate-600 font-bold">Kontak Layanan Informasi PPDB</label>
                  <input 
                    type="text" 
                    value={ppdbConfig.contactHelpdesk}
                    onChange={(e) => setPpdbConfig({...ppdbConfig, contactHelpdesk: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2 font-mono"
                  />
                </div>

                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={ppdbConfig.verifiedStamp}
                      onChange={(e) => setPpdbConfig({...ppdbConfig, verifiedStamp: e.target.checked})}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span>Sertakan Status Lulus Seleksi</span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'qr' && (
              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block text-slate-600 font-bold">Kategori Data QR Code</label>
                  <select 
                    value={qrConfig.contentFormat}
                    onChange={(e) => setQrConfig({...qrConfig, contentFormat: e.target.value as any})}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2 outline-none font-semibold"
                  >
                    <option value="hash">SHA-256 Hash Dokumen (Sangat Aman)</option>
                    <option value="uuid">Universal Unique ID (UUIDv4)</option>
                    <option value="url">URL Verifikasi Online</option>
                    <option value="doc_no">Nomor Dokumen Serial</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-600 font-bold font-mono">Warna QR Code (Pixel)</label>
                  <input 
                    type="color" 
                    value={qrConfig.fgColor}
                    onChange={(e) => setQrConfig({...qrConfig, fgColor: e.target.value})}
                    className="h-8 w-full rounded border-0 cursor-pointer shrink-0"
                  />
                </div>
              </div>
            )}

            {activeTab === 'barcode' && (
              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block text-slate-600 font-bold">Standar Barcode Simbologi</label>
                  <select 
                    value={barcodeConfig.barcodeType}
                    onChange={(e) => setBarcodeConfig({...barcodeConfig, barcodeType: e.target.value as any})}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2 outline-none font-semibold"
                  >
                    <option value="CODE128">Code 128 (Teks &amp; Angka)</option>
                    <option value="EAN13">EAN 13 (Komoditas Toko)</option>
                    <option value="UPC">UPC-A (Ritel Ekspor)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-600 font-bold">Tinggi Garis Barcode (px)</label>
                  <input 
                    type="range" 
                    min="30" 
                    max="100"
                    value={barcodeConfig.height}
                    onChange={(e) => setBarcodeConfig({...barcodeConfig, height: Number(e.target.value)})}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>
            )}

            {activeTab === 'ocr' && (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-indigo-900 space-y-2">
                  <p className="font-extrabold flex items-center gap-1.5 text-indigo-950">
                    <Activity className="h-4 w-4 text-indigo-600 shrink-0" />
                    <span>AI Model Klasifikasi Citra Dokumen</span>
                  </p>
                  <p className="text-[11px] leading-relaxed text-indigo-900">
                    Sistem secara otomatis mengidentifikasi dan membedakan jenis berkas (KTP, Kartu Keluarga, atau Akta Kelahiran) menggunakan neural vision sebelum meneruskannya ke OCR engine.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-600 font-bold">Pilih Berkas Contoh untuk Diuji:</label>
                  <div className="space-y-2">
                    {[
                      { name: 'KTP_Siswa_Ahmad_Fauzi.jpg', label: '🪪 KTP Elektronik Siswa' },
                      { name: 'KK_Keluarga_Sudirman.png', label: '👨‍👩‍👧‍👦 Kartu Keluarga (KK)' },
                      { name: 'Akta_Kelahiran_Siti.pdf', label: '📜 Akta Kelahiran Anak' }
                    ].map((item) => (
                      <button
                        key={item.name}
                        onClick={() => runAiClassificationAndOcr(item.name)}
                        disabled={isClassifying}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${selectedScanFilename === item.name ? 'bg-indigo-50 border-indigo-300 font-bold text-indigo-900' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'}`}
                      >
                        <span className="truncate">{item.label}</span>
                        {selectedScanFilename === item.name && isClassifying && (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => runAiClassificationAndOcr(selectedScanFilename)}
                  disabled={isClassifying}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isClassifying ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Menjalankan Klasifikasi &amp; OCR...</span>
                    </>
                  ) : (
                    <>
                      <Activity className="h-4 w-4" />
                      <span>Jalankan Klasifikasi AI &amp; OCR</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Live Visual Canvas Preview Panel (col-span-7) */}
          <div className="md:col-span-7 bg-slate-100 border border-slate-200 rounded-3xl p-6 flex flex-col min-h-[480px] shadow-inner relative overflow-hidden">
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-3 mb-5 shrink-0">
              <div className="flex items-center gap-1.5">
                <Eye className="h-4.5 w-4.5 text-slate-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Live Mockup Render</span>
              </div>
              <span className="text-[10px] bg-slate-200 text-slate-700 border border-slate-300 font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                {activeTab}
              </span>
            </div>

            {/* Content area based on Tab */}
            <div className="flex-grow flex items-center justify-center overflow-auto p-2">
              
              {/* RENDER 1: TEMPLATE DESIGNER */}
              {activeTab === 'template' && (
                <div className={`bg-white text-slate-900 border border-slate-300 rounded-sm shadow-xl p-6 w-full max-w-md ${templateConfig.fontFamily}`} style={{ minHeight: '380px' }}>
                  {templateConfig.showKop && (
                    <div className="border-b-2 border-double border-slate-900 pb-2 flex items-center gap-3">
                      <div className="h-10 w-10 bg-slate-100 border border-slate-300 rounded flex items-center justify-center font-bold text-[8px]">LOGO</div>
                      <div className="text-center flex-1 leading-tight">
                        <h4 className="text-[10px] font-bold uppercase m-0">{templateConfig.kopTitle}</h4>
                        <h3 className="text-xs font-extrabold uppercase m-0 text-blue-600">{templateConfig.kopSubtitle}</h3>
                        <p className="text-[7px] italic text-slate-500 m-0">{templateConfig.kopDetails}</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 text-center">
                    <h2 className="text-xs font-bold uppercase tracking-wider underline m-0">SURAT KEPUTUSAN RESMI</h2>
                    <p className="text-[8px] font-mono text-slate-500 m-0 mt-0.5">Nomor: 045/SK-YDH/VI/2026</p>
                  </div>

                  <div className="mt-4 text-[9px] text-justify space-y-2 leading-relaxed">
                    <p>Menimbang bahwa dalam rangka kelancaran proses belajar mengajar di lingkungan Pondok Pesantren, dipandang perlu untuk mengesahkan keputusan kepengurusan ini.</p>
                    <p>Memutuskan menetapkan nama tersebut di bawah ini sebagai pengawas utama akademik.</p>
                  </div>

                  {templateConfig.showWatermark && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none select-none rotate-12">
                      <span className="text-2xl font-black uppercase tracking-widest">{templateConfig.watermarkText}</span>
                    </div>
                  )}

                  <div className="mt-8 flex justify-end">
                    <div className="text-center w-36 text-[8px] leading-tight">
                      <span>Ditetapkan di Payakumbuh</span>
                      <strong className="block mt-1 font-bold">{templateConfig.signatureRole}</strong>
                      {templateConfig.signatureDigital ? (
                        <div className="my-2 border border-blue-100 rounded bg-blue-50/50 p-1 flex items-center justify-center gap-1.5 mx-auto w-24">
                          <QrCode className="h-5 w-5 text-blue-600" />
                          <div className="text-[4px] leading-none font-bold text-blue-800">DIGITAL SIGN SECURE</div>
                        </div>
                      ) : (
                        <div className="h-8" />
                      )}
                      <span className="font-bold underline">{templateConfig.signatureName}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* RENDER 2: ID CARD DESIGNER */}
              {activeTab === 'idcard' && (
                <div 
                  className={`rounded-2xl shadow-xl overflow-hidden text-slate-800 flex flex-col justify-between border-2 relative transition-all ${
                    idCardConfig.orientation === 'horizontal' ? 'w-full max-w-sm h-[210px]' : 'w-[210px] h-[330px]'
                  }`}
                  style={{ 
                    backgroundColor: idCardConfig.bgColor,
                    borderRadius: `${idCardConfig.borderRadius}px`,
                    borderColor: idCardConfig.borderColor || idCardConfig.themeColor
                  }}
                >
                  {/* Top Header branding */}
                  <div className="p-3 flex items-center gap-2" style={{ backgroundColor: idCardConfig.themeColor, color: '#fff' }}>
                    <div className="h-6 w-6 bg-white/20 rounded flex items-center justify-center font-bold text-[7px] text-white shrink-0">LOGO</div>
                    <div className="leading-none">
                      <span className="text-[6px] font-mono tracking-wider font-bold block opacity-90">{idCardConfig.headerTitle}</span>
                      <h4 className="text-[8px] font-black uppercase tracking-tight m-0">{idCardConfig.instName}</h4>
                    </div>
                  </div>

                  {/* Body details */}
                  <div className={`p-3 relative flex-1 flex ${idCardConfig.orientation === 'horizontal' ? 'flex-row gap-3' : 'flex-col items-center gap-2 text-center'}`}>
                    {/* User Photo mock */}
                    <div className="shrink-0 flex flex-col items-center gap-1">
                      <div 
                        className={`h-18 w-14 bg-slate-300 border-2 border-white shadow-md flex items-center justify-center overflow-hidden`}
                        style={{ borderRadius: idCardConfig.photoShape === 'circle' ? '999px' : idCardConfig.photoShape === 'rounded' ? '8px' : '0' }}
                      >
                        <span className="text-[7px] font-bold text-slate-500 font-mono">FOTO 3x4</span>
                      </div>
                      <span className="text-[6px] font-bold font-mono text-slate-500 bg-slate-200 border border-slate-300 px-1 py-0.5 rounded uppercase">
                        {idCardConfig.cardType}
                      </span>
                    </div>

                    {/* Member details info */}
                    <div className={`flex-1 leading-tight flex flex-col justify-center space-y-1 ${idCardConfig.orientation === 'horizontal' ? 'text-left' : 'text-center'}`}>
                      <div>
                        <span className="text-[6px] font-bold text-slate-400 uppercase tracking-widest font-mono">NAMA SISWA / ANGGOTA</span>
                        <h3 className="text-[10.5px] font-black text-slate-900 uppercase truncate">Muhammad Faiz Alfarabi</h3>
                      </div>
                      <div>
                        <span className="text-[6px] font-bold text-slate-400 uppercase tracking-widest font-mono">NIS / NOMOR KARTU</span>
                        <p className="text-[8px] text-slate-700 font-mono font-bold">2026-990123</p>
                      </div>
                      <div>
                        <span className="text-[6px] font-bold text-slate-400 uppercase tracking-widest font-mono">UNIT / KELAS</span>
                        <p className="text-[8px] text-slate-700 font-bold">Kelas X - MA Tahfidz</p>
                      </div>
                    </div>

                    {/* QR position rendering */}
                    {idCardConfig.orientation === 'horizontal' && (
                      <div className="absolute" style={{ right: '12px', top: '15px' }}>
                        <QrCode className="h-8 w-8 text-slate-800 border p-0.5 bg-white rounded-md" />
                      </div>
                    )}
                  </div>

                  {/* Stamp Cap */}
                  {idCardConfig.verifiedStamp && (
                    <div className="absolute right-3 bottom-8 opacity-75 flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 p-0.5 rounded text-[5.5px] font-bold">
                      <CheckCircle className="h-2.5 w-2.5 text-emerald-600 shrink-0" />
                      <span>AKTIF 2026</span>
                    </div>
                  )}

                  {/* Footer Barcode */}
                  {idCardConfig.showBarcode && (
                    <div className="px-3 py-1 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-[6px] font-mono text-slate-500 font-black shrink-0">
                      <span>||||||| | ||||| || ||| ||| | ||</span>
                      <span>SECURE-ID-2026</span>
                    </div>
                  )}
                </div>
              )}

              {/* RENDER 3: RAPOR DESIGNER */}
              {activeTab === 'rapor' && (
                <div className="bg-white text-slate-900 border border-slate-300 rounded-sm shadow-xl p-4 w-full max-w-lg flex flex-col justify-between text-[7px]" style={{ minHeight: '520px' }}>
                  {/* Header */}
                  <div className="text-center leading-tight border-b-2 border-slate-900 pb-2">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <div className="h-8 w-8 bg-emerald-700 text-white font-black rounded flex items-center justify-center text-[10px]">DH</div>
                      <div>
                        <h3 className="text-[10px] font-black uppercase m-0 tracking-wider">PUSAT KEGIATAN BELAJAR MASYARAKAT</h3>
                        <h2 className="text-[11px] font-black uppercase m-0 text-emerald-800">DARUL HADITS LIMA PULUH KOTA</h2>
                      </div>
                    </div>
                    <p className="text-[6px] font-bold text-slate-700 m-0">NPSN : P9984966 | E-mail : pkbmdh50kota@gmail.com</p>
                    <p className="text-[6px] text-slate-600 m-0">Jorong Pakan Sinayan Nagari Bukik Sikumpa Kec. Lareh Sago Halaban</p>
                  </div>

                  {/* Subtitle */}
                  <div className="text-center my-2 leading-tight">
                    <p className="font-extrabold text-[8px] uppercase m-0">LAPORAN PENILAIAN HASIL BELAJAR SISWA</p>
                    <p className="font-bold text-[7px] text-slate-600 m-0">SEMESTER I (SATU) TAHUN PELAJARAN 2025 – 2026</p>
                  </div>

                  {/* Student Info */}
                  <table className="w-full border-collapse border border-slate-900 mb-2 text-[7px]">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-900 text-slate-700 font-bold">
                        <th className="p-1 border-r border-slate-900 text-center">NAMA LENGKAP SISWA</th>
                        <th className="p-1 border-r border-slate-900 text-center">L/P</th>
                        <th className="p-1 border-r border-slate-900 text-center">NISN</th>
                        <th className="p-1 text-center">KELAS</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-1 border-r border-slate-900 font-bold uppercase text-center">HUDZAIFAH EL HABSY</td>
                        <td className="p-1 border-r border-slate-900 text-center">L</td>
                        <td className="p-1 border-r border-slate-900 text-center font-mono">3132407859</td>
                        <td className="p-1 text-center font-bold">6 (ENAM)</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Marks Table */}
                  <table className="w-full border-collapse border border-slate-900 text-[6px]">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-900 font-bold text-center">
                        <th className="p-1 border-r border-slate-900 w-6">NO</th>
                        <th className="p-1 border-r border-slate-900 text-left">MATA PELAJARAN</th>
                        <th className="p-1 border-r border-slate-900 w-10">ANGKA</th>
                        <th className="p-1 border-r border-slate-900 w-24">HURUF</th>
                        <th className="p-1 w-20">DESKRIPSI KEMAMPUAN</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-slate-50 font-bold border-b border-slate-900">
                        <td className="p-1 border-r border-slate-900 text-center">A</td>
                        <td colSpan={4} className="p-1 uppercase">MAPEL WAJIB</td>
                      </tr>
                      {[
                        ['1', 'Pendidikan Agama Islam', '77', 'Tujuh puluh tujuh', 'Cukup'],
                        ['2', 'Pancasila dan Kewarganegaraan', '77', 'Tujuh puluh tujuh', 'Cukup'],
                        ['3', 'Bahasa Indonesia', '78', 'Tujuh puluh delapan', 'Cukup'],
                        ['4', 'Bahasa Inggris', '100', 'Seratus', 'Sangat baik'],
                        ['5', 'Matematika', '75', 'Tujuh puluh lima', 'Cukup'],
                        ['6', 'Ilmu Pengetahuan Alam', '78', 'Tujuh puluh delapan', 'Cukup'],
                        ['7', 'Ilmu Pengetahuan Sosial', '78', 'Tujuh puluh delapan', 'Cukup'],
                        ['8', 'Seni Budaya', '83', 'Delapan puluh tiga', 'Baik'],
                        ['9', 'Penjas Orkes (PJOK)', '84', 'Delapan puluh empat', 'Baik'],
                      ].map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-300">
                          <td className="p-1 border-r border-slate-900 text-center">{row[0]}</td>
                          <td className="p-1 border-r border-slate-900">{row[1]}</td>
                          <td className="p-1 border-r border-slate-900 text-center font-bold">{row[2]}</td>
                          <td className="p-1 border-r border-slate-900">{row[3]}</td>
                          <td className="p-1 text-center font-semibold">{row[4]}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50 font-bold border-b border-slate-900">
                        <td className="p-1 border-r border-slate-900 text-center">B</td>
                        <td colSpan={4} className="p-1 uppercase">PILIHAN</td>
                      </tr>
                      {[
                        ['1', 'Bahasa Arab', '83', 'Delapan puluh tiga', 'Baik'],
                        ['2', 'Koding', '83', 'Delapan puluh tiga', 'Baik'],
                      ].map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-300">
                          <td className="p-1 border-r border-slate-900 text-center">{row[0]}</td>
                          <td className="p-1 border-r border-slate-900">{row[1]}</td>
                          <td className="p-1 border-r border-slate-900 text-center font-bold">{row[2]}</td>
                          <td className="p-1 border-r border-slate-900">{row[3]}</td>
                          <td className="p-1 text-center font-semibold">{row[4]}</td>
                        </tr>
                      ))}
                      <tr className="border-b border-slate-900 font-bold bg-slate-100">
                        <td colSpan={2} className="p-1 border-r border-slate-900 text-right">Jumlah</td>
                        <td className="p-1 border-r border-slate-900 text-center">896</td>
                        <td colSpan={2} className="p-1">Sembilan Ratus Sembilan Puluh Enam</td>
                      </tr>
                      <tr className="border-b border-slate-900 font-bold bg-slate-100">
                        <td colSpan={2} className="p-1 border-r border-slate-900 text-right">Rata - Rata</td>
                        <td className="p-1 border-r border-slate-900 text-center">81,5</td>
                        <td colSpan={2} className="p-1">Delapan Puluh Satu Koma Lima</td>
                      </tr>
                      <tr className="border-b border-slate-900 font-bold bg-slate-100">
                        <td colSpan={2} className="p-1 border-r border-slate-900 text-right">Peringkat Kelas Ke</td>
                        <td className="p-1 border-r border-slate-900 text-center">17</td>
                        <td colSpan={2} className="p-1">Dari 20 Santri</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Behavior & Attendance */}
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <table className="border-collapse border border-slate-900 text-[6px] w-full">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-900 font-bold">
                          <th className="p-1 border-r border-slate-900 text-left">Aspek Prilaku &amp; Kepribadian</th>
                          <th className="p-1 text-center w-8">Nilai</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td className="p-1 border-r border-slate-900">1. Akhlak</td><td className="p-1 text-center font-bold">B</td></tr>
                        <tr><td className="p-1 border-r border-slate-900">2. Kerajinan</td><td className="p-1 text-center font-bold">A</td></tr>
                        <tr><td className="p-1 border-r border-slate-900">3. Kedisiplinan</td><td className="p-1 text-center font-bold">B</td></tr>
                        <tr><td className="p-1 border-r border-slate-900">4. Kebersihan dan Kerapian</td><td className="p-1 text-center font-bold">B</td></tr>
                      </tbody>
                    </table>

                    <table className="border-collapse border border-slate-900 text-[6px] w-full">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-900 font-bold">
                          <th className="p-1 border-r border-slate-900 text-left">Keterangan Absensi</th>
                          <th className="p-1 text-center w-8">Hari</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td className="p-1 border-r border-slate-900">1. Sakit</td><td className="p-1 text-center">0</td></tr>
                        <tr><td className="p-1 border-r border-slate-900">2. Izin</td><td className="p-1 text-center">0</td></tr>
                        <tr><td className="p-1 border-r border-slate-900">3. Tanpa Keterangan</td><td className="p-1 text-center">0</td></tr>
                        <tr className="font-bold bg-slate-50"><td className="p-1 border-r border-slate-900">Jumlah</td><td className="p-1 text-center">0</td></tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Signatures */}
                  <div className="mt-3 flex justify-between text-[6px] font-semibold text-slate-800">
                    <div className="text-center w-24">
                      <span>Mengetahui</span>
                      <div className="font-bold">Orang Tua/Wali</div>
                      <div className="h-7" />
                      <div className="border-b border-slate-500 w-20 mx-auto" />
                    </div>
                    <div className="text-center w-28">
                      <span>Pakan Sinayan, 20 Desember 2025</span>
                      <div className="font-bold">Wali Kelas</div>
                      <div className="h-7" />
                      <div className="font-bold underline">Liana Adhi Pangestu, S.Pd.</div>
                    </div>
                    <div className="text-center w-24">
                      <span>Mengetahui</span>
                      <div className="font-bold">Kepala PKBM</div>
                      <div className="h-7" />
                      <div className="font-bold underline">Yogi Saputra. M</div>
                    </div>
                  </div>
                </div>
              )}

              {/* RENDER 4: LEGER DESIGNER */}
              {activeTab === 'leger' && (
                <div className="bg-white text-slate-900 border border-slate-300 rounded-sm shadow-xl p-4 w-full max-w-md overflow-x-auto">
                  <div className="text-center mb-3">
                    <h3 className="text-[10px] font-bold uppercase m-0">REKAPITULASI LEGER NILAI SISWA</h3>
                    <p className="text-[6px] text-slate-500 font-mono uppercase m-0">Kelas: X-A | TA: 2025-2026 | Threshold Lulus: {legerConfig.failThreshold}</p>
                  </div>

                  <table className="w-full text-[6px] border-collapse border border-slate-900">
                    <thead>
                      <tr className="bg-slate-200 border-b border-slate-900">
                        <th className="p-1 border-r border-slate-900">No</th>
                        <th className="p-1 border-r border-slate-900">Nama Siswa</th>
                        <th className="p-1 border-r border-slate-900">MTK</th>
                        <th className="p-1 border-r border-slate-900">IPA</th>
                        <th className="p-1 border-r border-slate-900">IND</th>
                        <th className="p-1 border-r border-slate-900 font-bold">Rata2</th>
                        <th className="p-1">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-900">
                        <td className="p-1 text-center border-r border-slate-900">1</td>
                        <td className="p-1 border-r border-slate-900 font-bold">Faiz Alfarabi</td>
                        <td className="p-1 text-center border-r border-slate-900">90</td>
                        <td className="p-1 text-center border-r border-slate-900">85</td>
                        <td className="p-1 text-center border-r border-slate-900 font-bold">95</td>
                        <td className="p-1 text-center border-r border-slate-900 font-bold bg-slate-50">90.00</td>
                        <td className="p-1 text-center text-emerald-600 font-bold">LULUS</td>
                      </tr>
                      <tr className="border-b border-slate-900">
                        <td className="p-1 text-center border-r border-slate-900">2</td>
                        <td className="p-1 border-r border-slate-900 font-bold">Budi Santoso</td>
                        <td className="p-1 text-center border-r border-slate-900 bg-red-100 text-red-600 font-bold">60</td>
                        <td className="p-1 text-center border-r border-slate-900">78</td>
                        <td className="p-1 text-center border-r border-slate-900">80</td>
                        <td className="p-1 text-center border-r border-slate-900 font-bold bg-slate-50">72.67</td>
                        <td className="p-1 text-center text-red-600 font-bold">REMEDIAL</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* RENDER 5: SURAT DESIGNER */}
              {activeTab === 'surat' && (
                <div className="bg-white text-slate-900 border border-slate-300 rounded-sm shadow-xl p-5 w-full max-w-sm flex flex-col justify-between" style={{ minHeight: '360px' }}>
                  {suratConfig.showKopSurat && (
                    <div className="border-b border-slate-900 pb-2 text-center leading-tight shrink-0">
                      <h4 className="text-[9px] font-bold uppercase m-0">KOP RESMI DARUL HADITS</h4>
                      <p className="text-[6px] text-slate-500 m-0">Jl. Raya Payakumbuh Km 7 Sumatera Barat</p>
                    </div>
                  )}

                  <div className="my-4 flex-grow text-[8px] space-y-3 leading-relaxed">
                    <div className="text-center font-bold">
                      <p className="m-0 underline">SURAT KETERANGAN RESMI</p>
                      {suratConfig.showReferenceCode && <p className="m-0 font-mono text-[6px] text-slate-500">No: B-029/SK-DIR/VII/2026</p>}
                    </div>

                    <p>Menerangkan dengan sesungguhnya bahwa yang bersangkutan di bawah ini merupakan sivitas aktif di bawah naungan Pondok Pesantren Terpadu.</p>
                    
                    <div className="pl-4 font-semibold">
                      <div>Nama: Muhammad Faiz Alfarabi</div>
                      <div>Jabatan: Guru Tahfidz Al-Qur'an</div>
                    </div>

                    <p>Demikian surat ini dibuat untuk dipergunakan sebagaimana mestinya dengan penuh tanggung jawab.</p>
                  </div>

                  <div className="mt-4 flex justify-end shrink-0">
                    <div className="text-center text-[7px] w-28">
                      <div>Payakumbuh, {new Date().toLocaleDateString('id-ID')}</div>
                      <div className="font-bold my-1">Direktur Pesantren</div>
                      {suratConfig.digitalSignVerify && (
                        <QrCode className="h-6 w-6 mx-auto my-1 text-blue-600 bg-slate-50 p-0.5 border" />
                      )}
                      <div className="font-bold underline">( Ust. Rizqi, Lc )</div>
                    </div>
                  </div>
                </div>
              )}

              {/* RENDER 6: SLIP DESIGNER */}
              {activeTab === 'slip' && (
                <div 
                  className="bg-white text-slate-900 border border-slate-300 rounded-xl shadow-xl p-5 w-full max-w-xs flex flex-col justify-between" 
                  style={{ minHeight: '320px', borderColor: slipConfig.primaryColor }}
                >
                  <div className="text-center border-b border-dashed pb-2">
                    <h4 className="text-[10px] font-bold uppercase m-0" style={{ color: slipConfig.primaryColor }}>BUKTI PEMBAYARAN SPP</h4>
                    <p className="text-[7px] text-slate-500 m-0">Ref ID: TRX-2026-00918</p>
                  </div>

                  <div className="mt-4 space-y-2 text-[8px] leading-tight">
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-slate-500">Siswa / Santri:</span>
                      <span className="font-bold">Ahmad Hilmy Alfarabi</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-slate-500">Kelas / Unit:</span>
                      <span>XII Aliyah Tahfidz</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-slate-500">Bulan / Alokasi:</span>
                      <span>Juli 2026</span>
                    </div>

                    <div className="space-y-1 pt-2">
                      <span className="text-slate-400 text-[6px] font-bold uppercase block">Rincian Komponen</span>
                      <div className="flex justify-between text-slate-700">
                        <span>SPP Bulanan Pokok</span>
                        <span>Rp250.000</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>Uang Makan Asrama</span>
                        <span>Rp500.000</span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-900 border-t pt-1 text-[9px]">
                        <span>TOTAL BAYAR</span>
                        <span style={{ color: slipConfig.primaryColor }}>Rp750.000</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[6px] text-slate-500 text-center italic mt-4">{slipConfig.footerNotes}</p>

                  <div className="mt-4 flex items-center justify-between border-t border-dashed pt-3 shrink-0">
                    {slipConfig.showQrCode ? (
                      <QrCode className="h-8 w-8 text-slate-800" />
                    ) : (
                      <div />
                    )}
                    <div className="text-right text-[6px] leading-tight">
                      <div>Penerima,</div>
                      <div className="font-bold mt-1 underline">{slipConfig.signatureName}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* RENDER 7: INVOICE DESIGNER */}
              {activeTab === 'invoice' && (
                <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-xl p-5 w-full max-w-sm flex flex-col justify-between" style={{ minHeight: '340px' }}>
                  <div className="flex justify-between items-start border-b pb-3 shrink-0">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight m-0">INVOICE PEMBAYARAN</h4>
                      <p className="text-[6px] text-slate-400 font-mono m-0">No: {invoiceConfig.invoicePrefix}-2026-0029</p>
                    </div>
                    <div className="text-right leading-none text-red-600 bg-red-50 font-bold text-[8px] px-2 py-1 rounded">
                      DUE IN {invoiceConfig.dueDays} DAYS
                    </div>
                  </div>

                  <div className="my-4 text-[8px] space-y-2 flex-grow leading-tight">
                    <div className="text-slate-600">
                      <span className="text-[6px] text-slate-400 uppercase tracking-widest block font-bold">DITAGIHKAN KEPADA</span>
                      <strong>Bapak Rachmad Subarjo (Wali Murid)</strong><br />
                      Siswa: Ahmad Hilmy Alfarabi (Kelas XII MA)
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1.5">
                      <span className="text-[6px] text-slate-400 block font-bold">RINCIAN TAGIHAN</span>
                      <div className="flex justify-between text-slate-700">
                        <span>Daftar Ulang Semester Genap</span>
                        <span>Rp1.200.000</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>Seragam &amp; Buku Paket</span>
                        <span>Rp850.000</span>
                      </div>
                      <div className="flex justify-between font-black border-t pt-1 text-[9px] text-slate-900">
                        <span>TOTAL TAGIHAN</span>
                        <span>Rp2.050.000</span>
                      </div>
                    </div>

                    <div className="text-[7px] text-slate-500 bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                      <span className="font-bold text-blue-800 block mb-0.5">Metode Transfer:</span>
                      {invoiceConfig.paymentInstruction}
                    </div>
                  </div>
                </div>
              )}

              {/* RENDER 8: LABEL DESIGNER */}
              {activeTab === 'label' && (
                <div className="bg-white text-slate-900 border border-slate-300 rounded-lg p-4 w-full max-w-xs shadow-md flex flex-col justify-between" style={{ width: `${labelConfig.labelWidth * 3.5}px`, height: `${labelConfig.labelHeight * 3.5}px` }}>
                  <div className="flex justify-between items-center border-b pb-1">
                    <span className="text-[8px] font-bold text-blue-600">PERPUSTAKAAN DARUL HADITS</span>
                    <span className="text-[6px] text-slate-500 font-mono">Buku No #928103</span>
                  </div>

                  <div className="my-2 leading-tight">
                    <h5 className="text-[9px] font-black text-slate-800 m-0 truncate">Tafsir Al-Azhar Jilid 1</h5>
                    <p className="text-[7px] text-slate-500 m-0">Penulis: Prof. Dr. Hamka</p>
                    <p className="text-[6px] font-mono text-slate-400 m-0">Kategori: Tafsir &amp; Ulumul Qur'an</p>
                  </div>

                  <div className="border-t pt-1 flex items-center justify-between font-mono text-[7px] text-slate-400 font-black">
                    <span>||||||| | ||||| || |||</span>
                    <span className="text-[6px]">REF-{labelConfig.barcodeType}</span>
                  </div>
                </div>
              )}

              {/* RENDER 9: KARTU UJIAN DESIGNER */}
              {activeTab === 'ujian' && (
                <div className="bg-white text-slate-900 border border-slate-300 rounded-xl shadow-xl p-4 w-full max-w-xs flex flex-col justify-between" style={{ minHeight: '300px' }}>
                  <div className="text-center border-b pb-2">
                    <h4 className="text-[9px] font-bold uppercase m-0 text-red-600">KARTU PESERTA UJIAN SEMESTER</h4>
                    <p className="text-[6px] text-slate-500 m-0">MA TAHFIDZ DARUL HADITS | TA: 2025/2026</p>
                  </div>

                  <div className="my-3 flex gap-3 text-[8px] leading-tight">
                    {ujianConfig.showPhoto && (
                      <div className="h-16 w-12 bg-slate-200 border flex items-center justify-center text-[6px] text-slate-400 font-bold rounded shrink-0">
                        FOTO 2x3
                      </div>
                    )}
                    <div className="space-y-1">
                      <div>No Peserta: <span className="font-mono font-bold">UJN-2026-9901</span></div>
                      <div>Nama: <span className="font-bold uppercase">Muhammad Faiz</span></div>
                      <div>Kelas / Unit: <span>XII Aliyah Tahfidz</span></div>
                      <div>Ruang Kelas: <span className="font-bold">Gedung Abu Bakar - R.04</span></div>
                    </div>
                  </div>

                  {ujianConfig.showInstructions && (
                    <div className="bg-slate-50 border p-2 rounded-lg text-[6px] text-slate-600 whitespace-pre-line leading-tight">
                      <span className="font-bold block text-slate-700">TATA TERTIB UJIAN:</span>
                      {ujianConfig.instructionsText}
                    </div>
                  )}

                  <div className="mt-4 flex justify-end shrink-0">
                    <div className="text-center text-[7px] w-24">
                      <div>Panitia Pelaksana,</div>
                      <div className="h-6" />
                      <div className="font-bold underline">Ust. Syahrul, S.Pd.</div>
                    </div>
                  </div>
                </div>
              )}

              {/* RENDER 10: KARTU PPDB DESIGNER */}
              {activeTab === 'ppdb' && (
                <div className="bg-white text-slate-900 border border-slate-300 rounded-xl shadow-xl p-4 w-full max-w-xs flex flex-col justify-between" style={{ minHeight: '300px' }}>
                  <div className="text-center border-b pb-2">
                    <h4 className="text-[9px] font-bold uppercase m-0 text-blue-600">KARTU BUKTI PENDAFTARAN PPDB</h4>
                    <p className="text-[6px] text-slate-500 m-0">TAHUN AJARAN BARU 2026/2027</p>
                  </div>

                  <div className="my-4 text-[8px] space-y-1.5 leading-tight">
                    <div>No. Pendaftaran: <span className="font-mono font-bold text-blue-600">PPDB-2026-0029</span></div>
                    <div>Nama Calon Santri: <span className="font-bold uppercase">Hilmy Ahmad Alfarabi</span></div>
                    <div>Sekolah Asal: <span>SMP Negeri 1 Payakumbuh</span></div>
                    <div>Pilihan Program: <span className="font-bold">Pondok Pesantren MA Tahfidz</span></div>
                  </div>

                  {ppdbConfig.verifiedStamp && (
                    <div className="border border-emerald-200 bg-emerald-50 text-emerald-800 p-2 rounded-lg text-center font-bold text-[8px] uppercase tracking-wide flex items-center justify-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>LOLOS SELEKSI BERKAS</span>
                    </div>
                  )}

                  <div className="mt-4 text-[6px] text-slate-400 font-mono text-center border-t border-dashed pt-2">
                    Layanan Informasi PPDB: {ppdbConfig.contactHelpdesk}
                  </div>
                </div>
              )}

              {/* RENDER 11: QR DESIGNER */}
              {activeTab === 'qr' && (
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 text-center space-y-4">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 inline-block">
                    <QrCode 
                      className="h-32 w-32 mx-auto" 
                      style={{ color: qrConfig.fgColor }} 
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[7px] font-black font-mono text-slate-400 block uppercase">ENCODED FORMAT PREVIEW</span>
                    <p className="text-[9px] font-mono font-bold text-slate-700 max-w-xs mx-auto truncate">
                      {qrConfig.contentFormat === 'hash' 
                        ? 'SHA256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
                        : qrConfig.contentFormat === 'uuid'
                        ? 'UUID:f81d4fae-7dec-11d0-a765-00a0c91e6bf6'
                        : 'https://verify.darulhadits.org/doc/9901'
                      }
                    </p>
                  </div>
                </div>
              )}

              {/* RENDER 12: BARCODE DESIGNER */}
              {activeTab === 'barcode' && (
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 text-center space-y-4 w-full max-w-sm">
                  <div className="py-6 px-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center">
                    {/* Simulated barcode bars with standard flexible heights */}
                    <div 
                      className="flex items-center justify-center gap-[2px] overflow-hidden" 
                      style={{ height: `${barcodeConfig.height}px`, color: barcodeConfig.lineColor }}
                    >
                      {[2,4,1,3,1,2,4,2,1,3,2,1,4,2,3,1,2,4,1,3,2,1,4,1,3,2,2].map((w, idx) => (
                        <div 
                          key={idx} 
                          className="bg-current shrink-0" 
                          style={{ width: `${w * barcodeConfig.widthScale / 2}px`, height: '100%' }} 
                        />
                      ))}
                    </div>

                    {barcodeConfig.displayValue && (
                      <span className="text-[9px] font-mono font-black mt-2 tracking-[4px]" style={{ color: barcodeConfig.lineColor }}>
                        *SECURE-99028103*
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[7px] font-black font-mono text-slate-400 block uppercase">BARCODE SYMBOLOGY FORMAT</span>
                    <p className="text-[9px] font-mono font-bold text-slate-700">
                      Standard: {barcodeConfig.barcodeType}
                    </p>
                  </div>
                </div>
              )}

              {/* RENDER 13: AI CLASSIFICATION & OCR STUDIO */}
              {activeTab === 'ocr' && (
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 w-full max-w-md space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">AI NEURAL VISION PIPELINE</span>
                      <h4 className="font-bold text-slate-800 text-sm mt-0.5">{selectedScanFilename}</h4>
                    </div>
                    {classificationResult ? (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-full uppercase">
                        {classificationResult.predicted_category} ({classificationResult.confidence_score}%)
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold text-[10px] rounded-full uppercase">
                        Menunggu Klasifikasi
                      </span>
                    )}
                  </div>

                  {isClassifying && (
                    <div className="py-12 text-center space-y-3">
                      <RefreshCw className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
                      <p className="font-bold text-slate-600">Model AI sedang menganalisis piksel &amp; layout dokumen...</p>
                    </div>
                  )}

                  {!isClassifying && !classificationResult && (
                    <div className="py-10 text-center space-y-2 text-slate-400">
                      <Activity className="h-10 w-10 mx-auto text-slate-300" />
                      <p className="font-medium">Klik tombol "Jalankan Klasifikasi AI &amp; OCR" di panel kiri untuk mulai.</p>
                    </div>
                  )}

                  {!isClassifying && classificationResult && (
                    <div className="space-y-3 animate-fade-in">
                      <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-1">
                        <span className="text-[10px] font-black text-indigo-800 uppercase">HASIL KLASIFIKASI GAMBAR OTOMATIS:</span>
                        <p className="font-bold text-slate-800 text-xs">Kategori Terdeteksi: <span className="text-indigo-600 font-black">{classificationResult.predicted_category}</span></p>
                        <p className="text-[11px] text-slate-600">{classificationResult.classification_reason}</p>
                      </div>

                      {ocrExtractedData && (
                        <div className="space-y-2">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">HASIL EKSTRAKSI OCR ENGINE:</span>
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-[10px] text-slate-700 space-y-1">
                            {Object.entries(ocrExtractedData.structured_fields || {}).map(([key, val]: [string, any]) => (
                              <div key={key} className="flex justify-between border-b border-slate-200/60 pb-1">
                                <span className="text-slate-500 uppercase font-bold">{key}:</span>
                                <span className="font-bold text-slate-900">{String(val)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Bottom Panel Actions */}
            <div className="mt-5 border-t border-slate-200 pt-4 flex items-center justify-between shrink-0">
              <span className="text-[10px] text-slate-500 font-semibold">
                * Perubahan akan otomatis diaplikasikan ke modul cetak aktif.
              </span>
              <button
                onClick={saveConfiguration}
                disabled={isSaving}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Simpan Template</span>
              </button>
            </div>
          </div>

        </div>
        )}

      </div>
    </div>
  );
}
