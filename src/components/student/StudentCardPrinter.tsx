/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  QrCode, 
  Barcode, 
  Printer, 
  Download, 
  Palette, 
  ShieldCheck, 
  Layout, 
  Edit3, 
  CheckCircle2, 
  Sparkles, 
  Settings2, 
  Image as ImageIcon, 
  Type, 
  RotateCcw,
  Sliders,
  Maximize2,
  FileText
} from 'lucide-react';

interface StudentCardPrinterProps {
  students: any[];
  tenantName?: string;
  subTab: 'KARTU' | 'BARCODE' | 'QR';
}

export function StudentCardPrinter({ students, tenantName, subTab }: StudentCardPrinterProps) {
  const safeStudents = Array.isArray(students) ? students : [];
  const [selectedStudentId, setSelectedStudentId] = useState<string>(safeStudents[0]?.id || 'std-01');
  const selectedStudent = safeStudents.find(s => s.id === selectedStudentId) || safeStudents[0] || {};

  // Active Control Panel Tab
  const [designTab, setDesignTab] = useState<'LAYOUT' | 'WARNA' | 'KONTEN' | 'FOTO_CODE'>('LAYOUT');

  // --- DESIGN CONFIGURATIONS ---
  // 1. Orientation & Dimensions
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  
  // 2. Bingkai (Border) Customization
  const [borderColor, setBorderColor] = useState<string>('#6366f1'); // Hex color
  const [borderWidth, setBorderWidth] = useState<number>(3); // 1-8 px
  const [borderStyle, setBorderStyle] = useState<'solid' | 'dashed' | 'double'>('solid');
  const [borderRadius, setBorderRadius] = useState<number>(20); // 0-32 px

  // 3. Warna Isi & Background Customization
  const [bgType, setBgType] = useState<'gradient' | 'solid' | 'dark_luxury' | 'light_modern'>('dark_luxury');
  const [bgColor1, setBgColor1] = useState<string>('#0f172a');
  const [bgColor2, setBgColor2] = useState<string>('#1e1b4b');
  const [headerBgColor, setHeaderBgColor] = useState<string>('#312e81');
  const [headerTextColor, setHeaderTextColor] = useState<string>('#ffffff');
  const [bodyTextColor, setBodyTextColor] = useState<string>('#f8fafc');
  const [accentColor, setAccentColor] = useState<string>('#818cf8');

  // 4. Editable Card Content & Labels
  const [headerTitle, setHeaderTitle] = useState<string>('KARTU PELAJAR ELEKTRONIK');
  const [institutionName, setInstitutionName] = useState<string>(tenantName || 'YAYASAN PENDIDIKAN AL-IKHLAS');
  const [institutionSubtitle, setInstitutionSubtitle] = useState<string>('SISTEM INTEGRASI KARTU PINTAR SANTRI');
  
  // Editable Field Labels
  const [labelName, setLabelName] = useState<string>('Nama Lengkap');
  const [labelNis, setLabelNis] = useState<string>('NIS / NISN');
  const [labelClass, setLabelClass] = useState<string>('Kelas / Status');
  const [labelExpiry, setLabelExpiry] = useState<string>('Masa Berlaku');
  const [expiryDateText, setExpiryDateText] = useState<string>('30 JUNI 2028');

  // Back Card Content
  const [backTitle, setBackTitle] = useState<string>('SYARAT & KETENTUAN PENGGUNAAN');
  const [rule1, setRule1] = useState<string>('1. Kartu ini sah sebagai alat identifikasi resmi siswa / santri.');
  const [rule2, setRule2] = useState<string>('2. Digunakan untuk akses presensi gate, perpustakaan, & kantin.');
  const [rule3, setRule3] = useState<string>('3. Dilarang merusak, meminjamkan, atau menggandakan tanpa izin.');
  const [rule4, setRule4] = useState<string>('4. Jika hilang, segera melapor ke bagian Tata Usaha Sekolah.');
  const [signatoryRole, setSignatoryRole] = useState<string>('Kepala Sekolah / Mudir');
  const [signatoryName, setSignatoryName] = useState<string>('H. Ahmad Zaki Al-Hafizh, M.Pd');

  // 5. Photo & Code Toggles
  const [photoShape, setPhotoShape] = useState<'rounded' | 'square' | 'circle' | 'oval'>('rounded');
  const [photoBorderColor, setPhotoBorderColor] = useState<string>('#ffffff');
  const [showBarcode, setShowBarcode] = useState<boolean>(true);
  const [showQrCode, setShowQrCode] = useState<boolean>(true);
  const [showStamp, setShowStamp] = useState<boolean>(true);
  const [stampText, setStampText] = useState<string>('TERVERIFIKASI RESMI');

  // 6. Custom Barcode & QR subTab inputs
  const [customBarcodeText, setCustomBarcodeText] = useState<string>('9022-ERP-ENTERPRISE');
  const [customQrText, setCustomQrText] = useState<string>('https://ai.studio/build');

  // Helper values derived from selected student
  const studentName = selectedStudent ? (selectedStudent.name || selectedStudent.identitas?.name || 'Muhammad Ahmad Baihaqi') : 'Muhammad Ahmad Baihaqi';
  const studentNis = selectedStudent ? (selectedStudent.nis || selectedStudent.identitas?.nis || '20260001') : '20260001';
  const studentClass = selectedStudent ? (selectedStudent.kelas || selectedStudent.rombela?.name || 'Kelas X - MA Tahfidz') : 'Kelas X - MA Tahfidz';
  const isSantri = selectedStudent ? (selectedStudent.is_santri === 'YA' || selectedStudent.pondok?.nomor_santri ? true : false) : true;

  // Preset Color & Template Palettes
  const applyPresetTheme = (preset: 'dapodik_kemendikbud' | 'emis_kemenag' | 'pesantren_gold' | 'indigo_dark' | 'emerald_nature' | 'amber_gold' | 'rose_crimson' | 'cyan_tech' | 'light_clean') => {
    switch (preset) {
      case 'dapodik_kemendikbud':
        setBgType('gradient');
        setBgColor1('#032830');
        setBgColor2('#0f172a');
        setHeaderBgColor('#1e3a8a');
        setBorderColor('#2563eb');
        setAccentColor('#38bdf8');
        setBodyTextColor('#f8fafc');
        setHeaderTextColor('#ffffff');
        setHeaderTitle('KARTU TANDA PELAJAR');
        setInstitutionSubtitle('STANDARDISASI DAPODIK KEMENDIKBUD R.I.');
        setLabelNis('NISN / NIK');
        setStampText('VERIFIKASI DAPODIK');
        break;
      case 'emis_kemenag':
        setBgType('gradient');
        setBgColor1('#022c22');
        setBgColor2('#064e3b');
        setHeaderBgColor('#047857');
        setBorderColor('#10b981');
        setAccentColor('#34d399');
        setBodyTextColor('#ecfdf5');
        setHeaderTextColor('#ffffff');
        setHeaderTitle('KARTU SISWA MADRASAH');
        setInstitutionSubtitle('STANDARDISASI EMIS KEMENTERIAN AGAMA R.I.');
        setLabelNis('NSM / NISN');
        setStampText('TERVERIFIKASI EMIS');
        break;
      case 'pesantren_gold':
        setBgType('gradient');
        setBgColor1('#1c1917');
        setBgColor2('#451a03');
        setHeaderBgColor('#78350f');
        setBorderColor('#f59e0b');
        setAccentColor('#fbbf24');
        setBodyTextColor('#fffbeb');
        setHeaderTextColor('#ffffff');
        setHeaderTitle('KARTU SANTRI MUKIM');
        setInstitutionSubtitle('SISTEM PONDOK PESANTREN TERPADU');
        setLabelNis('NIS / NO. SANTRI');
        setStampText('PENGASUH PESANTREN');
        break;
      case 'indigo_dark':
        setBgType('gradient');
        setBgColor1('#0f172a');
        setBgColor2('#1e1b4b');
        setHeaderBgColor('#312e81');
        setBorderColor('#6366f1');
        setAccentColor('#818cf8');
        setBodyTextColor('#f8fafc');
        setHeaderTextColor('#ffffff');
        setHeaderTitle('KARTU PELAJAR ELEKTRONIK');
        setInstitutionSubtitle('SISTEM INTEGRASI KARTU PINTAR SANTRI');
        setLabelNis('NIS / NISN');
        setStampText('TERVERIFIKASI RESMI');
        break;
      case 'emerald_nature':
        setBgType('gradient');
        setBgColor1('#022c22');
        setBgColor2('#064e3b');
        setHeaderBgColor('#047857');
        setBorderColor('#10b981');
        setAccentColor('#34d399');
        setBodyTextColor('#ecfdf5');
        setHeaderTextColor('#ffffff');
        break;
      case 'amber_gold':
        setBgType('gradient');
        setBgColor1('#1c1917');
        setBgColor2('#451a03');
        setHeaderBgColor('#78350f');
        setBorderColor('#f59e0b');
        setAccentColor('#fbbf24');
        setBodyTextColor('#fffbeb');
        setHeaderTextColor('#ffffff');
        break;
      case 'rose_crimson':
        setBgType('gradient');
        setBgColor1('#18181b');
        setBgColor2('#4c0519');
        setHeaderBgColor('#881337');
        setBorderColor('#f43f5e');
        setAccentColor('#fb7185');
        setBodyTextColor('#fff1f2');
        setHeaderTextColor('#ffffff');
        break;
      case 'cyan_tech':
        setBgType('gradient');
        setBgColor1('#083344');
        setBgColor2('#164e63');
        setHeaderBgColor('#0891b2');
        setBorderColor('#06b6d4');
        setAccentColor('#67e8f9');
        setBodyTextColor('#ecfeff');
        setHeaderTextColor('#ffffff');
        break;
      case 'light_clean':
        setBgType('solid');
        setBgColor1('#f8fafc');
        setBgColor2('#ffffff');
        setHeaderBgColor('#1e293b');
        setBorderColor('#0f172a');
        setAccentColor('#2563eb');
        setBodyTextColor('#0f172a');
        setHeaderTextColor('#ffffff');
        break;
    }
  };

  // Inline CSS style generator for Card Container
  const getCardBgStyle = () => {
    if (bgType === 'solid') {
      return { backgroundColor: bgColor1 };
    }
    return {
      backgroundImage: `linear-gradient(135deg, ${bgColor1} 0%, ${bgColor2} 100%)`
    };
  };

  // Helper function to handle window printing
  const handlePrintCard = () => {
    // Primary: direct in-page print targeting #student-card-print-area
    try {
      window.print();
    } catch {
      // Fallback: popup window if available
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const isHoriz = orientation === 'horizontal';
        const cardW = isHoriz ? '85.6mm' : '54mm';
        const cardH = isHoriz ? '54mm' : '85.6mm';
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Cetak Kartu Pelajar - ${studentName}</title>
              <style>
                @page { size: A4 portrait; margin: 10mm; }
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fff; margin: 0; padding: 20px; }
                .print-container { display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; }
                .card-wrapper { width: ${cardW}; height: ${cardH}; border: ${borderWidth}px ${borderStyle} ${borderColor}; border-radius: ${borderRadius}px; background: ${bgType === 'solid' ? bgColor1 : `linear-gradient(135deg, ${bgColor1}, ${bgColor2})`}; color: ${bodyTextColor}; box-sizing: border-box; overflow: hidden; position: relative; page-break-inside: avoid; }
                .header-bar { background-color: ${headerBgColor}; color: ${headerTextColor}; padding: 8px 12px; text-align: center; }
                .header-title { font-size: 8px; font-weight: 800; letter-spacing: 1px; }
                .inst-title { font-size: 10px; font-weight: 900; }
                .body-content { padding: 10px; display: flex; gap: 10px; align-items: center; }
                .student-photo { width: ${isHoriz ? '50px' : '65px'}; height: ${isHoriz ? '60px' : '75px'}; border: 2px solid ${photoBorderColor}; border-radius: ${photoShape === 'circle' ? '50%' : photoShape === 'rounded' ? '8px' : '0'}; object-fit: cover; }
                .info-label { font-size: 7px; opacity: 0.8; text-transform: uppercase; }
                .info-value { font-size: 9px; font-weight: bold; color: ${accentColor}; }
                @media print { .no-print { display: none; } }
              </style>
            </head>
            <body>
              <div class="print-container">
                <div class="card-wrapper">
                  <div class="header-bar">
                    <div class="header-title">${headerTitle}</div>
                    <div class="inst-title">${institutionName}</div>
                  </div>
                  <div class="body-content">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120" class="student-photo" />
                    <div>
                      <div class="info-label">${labelName}</div>
                      <div class="info-value">${studentName}</div>
                      <div class="info-label" style="margin-top: 4px;">${labelNis}</div>
                      <div style="font-size: 9px; font-weight: bold;">${studentNis}</div>
                      <div class="info-label" style="margin-top: 4px;">${labelClass}</div>
                      <div style="font-size: 9px;">${studentClass}</div>
                    </div>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        setTimeout(() => { printWindow.print(); }, 300);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs text-slate-700">
      
      {/* LEFT SIDEBAR: DESIGN EDITOR CONTROL CENTER (5 Cols) */}
      <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span>Studio Desain Kartu Pelajar</span>
            </h3>
            <button
              onClick={() => applyPresetTheme('indigo_dark')}
              title="Reset ke Tema Standar"
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">Custom Orientasi • Warna Bingkai & Isi • Teks Editable</p>
        </div>

        {/* Target Student Selector */}
        <div className="flex flex-col gap-1 bg-slate-50 p-3 rounded-2xl border border-slate-200">
          <label className="font-bold text-slate-700 flex items-center gap-1.5">
            <Sliders className="h-3.5 w-3.5 text-indigo-600" />
            <span>Pilih Target Siswa / Santri</span>
          </label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="bg-white border border-slate-200 p-2 rounded-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.name || s.identitas?.name} ({s.nis || s.identitas?.nis}) - {s.kelas || 'Siswa'}
              </option>
            ))}
          </select>
        </div>

        {subTab === 'KARTU' && (
          <>
            {/* Editor Navigation Tabs */}
            <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-[10.5px]">
              <button
                type="button"
                onClick={() => setDesignTab('LAYOUT')}
                className={`py-1.5 px-2 rounded-xl font-extrabold transition flex items-center justify-center gap-1 ${
                  designTab === 'LAYOUT' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layout className="h-3 w-3" />
                <span>Layout</span>
              </button>
              <button
                type="button"
                onClick={() => setDesignTab('WARNA')}
                className={`py-1.5 px-2 rounded-xl font-extrabold transition flex items-center justify-center gap-1 ${
                  designTab === 'WARNA' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Palette className="h-3 w-3" />
                <span>Warna</span>
              </button>
              <button
                type="button"
                onClick={() => setDesignTab('KONTEN')}
                className={`py-1.5 px-2 rounded-xl font-extrabold transition flex items-center justify-center gap-1 ${
                  designTab === 'KONTEN' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Type className="h-3 w-3" />
                <span>Teks</span>
              </button>
              <button
                type="button"
                onClick={() => setDesignTab('FOTO_CODE')}
                className={`py-1.5 px-2 rounded-xl font-extrabold transition flex items-center justify-center gap-1 ${
                  designTab === 'FOTO_CODE' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ImageIcon className="h-3 w-3" />
                <span>Foto/Kode</span>
              </button>
            </div>

            {/* TAB 1: LAYOUT & ORIENTATION */}
            {designTab === 'LAYOUT' && (
              <div className="space-y-4 font-medium animate-fadeIn">
                {/* Orientation Selector */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">Orientasi Desain Kartu</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOrientation('horizontal')}
                      className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-2 font-bold transition cursor-pointer ${
                        orientation === 'horizontal'
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="w-10 h-6 border-2 border-current rounded flex items-center justify-center text-[8px]">
                        85 × 54
                      </div>
                      <span>↔️ Horizontal (Lanskap)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrientation('vertical')}
                      className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-2 font-bold transition cursor-pointer ${
                        orientation === 'vertical'
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="w-6 h-10 border-2 border-current rounded flex items-center justify-center text-[8px]">
                        54 × 85
                      </div>
                      <span>↕️ Vertikal (Potret)</span>
                    </button>
                  </div>
                </div>

                {/* Border Customization Controls */}
                <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <span className="font-extrabold text-slate-800 text-xs block">Pengaturan Bingkai (Border Kartu)</span>
                  
                  {/* Border Width Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>Ketebalan Bingkai:</span>
                      <span className="font-mono text-indigo-600">{borderWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="8"
                      value={borderWidth}
                      onChange={(e) => setBorderWidth(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  {/* Border Style */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Gaya Garis Bingkai</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['solid', 'dashed', 'double'] as const).map(style => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => setBorderStyle(style)}
                          className={`py-1 rounded-xl font-bold text-[11px] uppercase border transition ${
                            borderStyle === style
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Border Radius Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>Lengkungan Sudut (Radius):</span>
                      <span className="font-mono text-indigo-600">{borderRadius}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="32"
                      value={borderRadius}
                      onChange={(e) => setBorderRadius(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: COLOR & BACKGROUND DESIGN */}
            {designTab === 'WARNA' && (
              <div className="space-y-4 font-medium animate-fadeIn">
                {/* Standard Preset Selector */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block text-xs">Template Standardisasi Nasional</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyPresetTheme('dapodik_kemendikbud')}
                      className="p-2 bg-blue-950 text-blue-300 rounded-xl font-extrabold border border-blue-500/50 text-[10px] hover:scale-95 transition text-center"
                    >
                      Dapodik Kemendikbud
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetTheme('emis_kemenag')}
                      className="p-2 bg-emerald-950 text-emerald-300 rounded-xl font-extrabold border border-emerald-500/50 text-[10px] hover:scale-95 transition text-center"
                    >
                      EMIS Kemenag
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetTheme('pesantren_gold')}
                      className="p-2 bg-amber-950 text-amber-300 rounded-xl font-extrabold border border-amber-500/50 text-[10px] hover:scale-95 transition text-center"
                    >
                      Pondok Pesantren
                    </button>
                  </div>
                </div>

                {/* Preset Theme Quick Picks */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200">
                  <label className="font-bold text-slate-700 block text-xs">Preset Palet Warna</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyPresetTheme('indigo_dark')}
                      className="p-2 bg-slate-900 text-indigo-300 rounded-xl font-bold border border-indigo-500/40 text-[10px] hover:scale-95 transition"
                    >
                      Indigo Dark
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetTheme('emerald_nature')}
                      className="p-2 bg-emerald-950 text-emerald-300 rounded-xl font-bold border border-emerald-500/40 text-[10px] hover:scale-95 transition"
                    >
                      Emerald Islamic
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetTheme('amber_gold')}
                      className="p-2 bg-stone-900 text-amber-400 rounded-xl font-bold border border-amber-500/40 text-[10px] hover:scale-95 transition"
                    >
                      Royal Gold
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetTheme('rose_crimson')}
                      className="p-2 bg-rose-950 text-rose-300 rounded-xl font-bold border border-rose-500/40 text-[10px] hover:scale-95 transition"
                    >
                      Crimson Red
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetTheme('cyan_tech')}
                      className="p-2 bg-cyan-950 text-cyan-300 rounded-xl font-bold border border-cyan-500/40 text-[10px] hover:scale-95 transition"
                    >
                      Cyan Futuristic
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetTheme('light_clean')}
                      className="p-2 bg-slate-100 text-slate-900 rounded-xl font-bold border border-slate-300 text-[10px] hover:scale-95 transition"
                    >
                      Light Minimal
                    </button>
                  </div>
                </div>

                {/* Detailed Color Pickers */}
                <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <span className="font-extrabold text-slate-800 text-xs block">Kustomisasi Warna Bingkai & Background Fill</span>
                  
                  {/* Border Color Picker */}
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Warna Garis Bingkai:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={borderColor}
                        onChange={(e) => setBorderColor(e.target.value)}
                        className="h-7 w-10 rounded border border-slate-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={borderColor}
                        onChange={(e) => setBorderColor(e.target.value)}
                        className="w-20 bg-white border border-slate-200 p-1 text-[11px] font-mono rounded text-center font-bold"
                      />
                    </div>
                  </div>

                  {/* Header Bar Color */}
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Warna Bar Header Top:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={headerBgColor}
                        onChange={(e) => setHeaderBgColor(e.target.value)}
                        className="h-7 w-10 rounded border border-slate-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={headerBgColor}
                        onChange={(e) => setHeaderBgColor(e.target.value)}
                        className="w-20 bg-white border border-slate-200 p-1 text-[11px] font-mono rounded text-center font-bold"
                      />
                    </div>
                  </div>

                  {/* Background Fill Colors */}
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">Warna Background Utama (Isi):</label>
                      <input
                        type="color"
                        value={bgColor1}
                        onChange={(e) => setBgColor1(e.target.value)}
                        className="h-7 w-10 rounded border border-slate-300 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">Warna Gradasi Pasangan:</label>
                      <input
                        type="color"
                        value={bgColor2}
                        onChange={(e) => setBgColor2(e.target.value)}
                        className="h-7 w-10 rounded border border-slate-300 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">Warna Aksen Highlight:</label>
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="h-7 w-10 rounded border border-slate-300 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: EDITABLE CONTENT & LABELS */}
            {designTab === 'KONTEN' && (
              <div className="space-y-3 font-medium animate-fadeIn">
                <span className="font-extrabold text-slate-800 text-xs block">Edit Teks & Label Header Kartu</span>
                
                <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 block">Judul Header Kartu</label>
                    <input
                      type="text"
                      value={headerTitle}
                      onChange={(e) => setHeaderTitle(e.target.value)}
                      className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs font-bold text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 block">Nama Instansi / Yayasan</label>
                    <input
                      type="text"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs font-bold text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 block">Sub-Judul / Tagline Instansi</label>
                    <input
                      type="text"
                      value={institutionSubtitle}
                      onChange={(e) => setInstitutionSubtitle(e.target.value)}
                      className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>

                <span className="font-extrabold text-slate-800 text-xs block mt-3">Edit Label Field Depan Kartu</span>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-[11px]">
                  <div>
                    <label className="font-bold text-slate-600">Label Nama</label>
                    <input
                      type="text"
                      value={labelName}
                      onChange={(e) => setLabelName(e.target.value)}
                      className="w-full bg-white border border-slate-200 p-1.5 rounded-lg font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600">Label NIS</label>
                    <input
                      type="text"
                      value={labelNis}
                      onChange={(e) => setLabelNis(e.target.value)}
                      className="w-full bg-white border border-slate-200 p-1.5 rounded-lg font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600">Label Kelas</label>
                    <input
                      type="text"
                      value={labelClass}
                      onChange={(e) => setLabelClass(e.target.value)}
                      className="w-full bg-white border border-slate-200 p-1.5 rounded-lg font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600">Masa Berlaku</label>
                    <input
                      type="text"
                      value={expiryDateText}
                      onChange={(e) => setExpiryDateText(e.target.value)}
                      className="w-full bg-white border border-slate-200 p-1.5 rounded-lg font-semibold"
                    />
                  </div>
                </div>

                <span className="font-extrabold text-slate-800 text-xs block mt-3">Edit Teks Belakang Kartu</span>
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-[11px]">
                  <label className="font-bold text-slate-600">Judul Ketentuan Belakang</label>
                  <input
                    type="text"
                    value={backTitle}
                    onChange={(e) => setBackTitle(e.target.value)}
                    className="w-full bg-white border border-slate-200 p-1.5 rounded-lg font-bold"
                  />
                  <label className="font-bold text-slate-600 pt-1 block">Aturan / Point 1</label>
                  <input
                    type="text"
                    value={rule1}
                    onChange={(e) => setRule1(e.target.value)}
                    className="w-full bg-white border border-slate-200 p-1.5 rounded-lg"
                  />
                  <label className="font-bold text-slate-600 block">Aturan / Point 2</label>
                  <input
                    type="text"
                    value={rule2}
                    onChange={(e) => setRule2(e.target.value)}
                    className="w-full bg-white border border-slate-200 p-1.5 rounded-lg"
                  />
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="font-bold text-slate-600">Jabatan Penandatangan</label>
                      <input
                        type="text"
                        value={signatoryRole}
                        onChange={(e) => setSignatoryRole(e.target.value)}
                        className="w-full bg-white border border-slate-200 p-1.5 rounded-lg font-semibold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600">Nama Penandatangan</label>
                      <input
                        type="text"
                        value={signatoryName}
                        onChange={(e) => setSignatoryName(e.target.value)}
                        className="w-full bg-white border border-slate-200 p-1.5 rounded-lg font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: PHOTO & BARCODE TOGGLES */}
            {designTab === 'FOTO_CODE' && (
              <div className="space-y-4 font-medium animate-fadeIn">
                {/* Photo Shape Options */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">Bentuk Bingkai Foto Siswa</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['rounded', 'square', 'circle', 'oval'] as const).map(shape => (
                      <button
                        key={shape}
                        type="button"
                        onClick={() => setPhotoShape(shape)}
                        className={`py-2 rounded-xl font-bold text-[10px] capitalize border transition ${
                          photoShape === shape
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {shape === 'rounded' ? 'Rounded' : shape === 'square' ? 'Kotak' : shape === 'circle' ? 'Bulat' : 'Oval'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Code Toggles */}
                <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
                  <span className="font-extrabold text-slate-800 block">Elemen Keamanan & Barcode</span>
                  
                  <label className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200 cursor-pointer font-bold">
                    <span className="flex items-center gap-2">
                      <Barcode className="h-4 w-4 text-indigo-600" />
                      <span>Tampilkan Barcode Vector (Code128)</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={showBarcode}
                      onChange={(e) => setShowBarcode(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200 cursor-pointer font-bold">
                    <span className="flex items-center gap-2">
                      <QrCode className="h-4 w-4 text-indigo-600" />
                      <span>Tampilkan QR Code Verifikasi (ISO)</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={showQrCode}
                      onChange={(e) => setShowQrCode(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200 cursor-pointer font-bold">
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      <span>Tampilkan Stempel Pengesahan Aktif</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={showStamp}
                      onChange={(e) => setShowStamp(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 rounded"
                    />
                  </label>
                </div>
              </div>
            )}
          </>
        )}

        {subTab === 'BARCODE' && (
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-slate-600">Isi Kode Barcode Custom</label>
            <input
              type="text"
              value={customBarcodeText}
              onChange={(e) => setCustomBarcodeText(e.target.value)}
              className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-800 font-mono font-bold"
            />
          </div>
        )}

        {subTab === 'QR' && (
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-slate-600">Isi Teks / URL QR Code Custom</label>
            <input
              type="text"
              value={customQrText}
              onChange={(e) => setCustomQrText(e.target.value)}
              className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-800 font-mono font-bold"
            />
          </div>
        )}

        <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-2xl text-[10.5px] mt-2 flex flex-col gap-1">
          <span className="font-bold text-indigo-900 flex items-center gap-1">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Spesifikasi Kompatibilitas Printer PVC</span>
          </span>
          <p>✔ Ukuran Standar ISO CR80 (85.60 mm × 53.98 mm)</p>
          <p>✔ Support Printer Zebra, Fargo, Datacard, Evolis</p>
        </div>
      </div>

      {/* RIGHT PREVIEW CANVAS (7 Cols) */}
      <div className="lg:col-span-7 flex flex-col items-center justify-start p-6 bg-slate-100/80 border border-slate-200 rounded-3xl shadow-inner min-h-[500px]">
        
        {/* PREVIEW HEADER */}
        <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
          <div>
            <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Maximize2 className="h-3.5 w-3.5 text-indigo-600" />
              <span>Live Visual Canvas Preview</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Mode: {orientation === 'horizontal' ? 'Horizontal (Lanskap 85×54)' : 'Vertikal (Potret 54×85)'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintCard}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow transition cursor-pointer text-xs"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak Kartu (A4/PVC)</span>
            </button>
          </div>
        </div>

        {/* 1. KARTU PELAJAR PREVIEW AREA */}
        {subTab === 'KARTU' && (
          <div id="student-card-print-area" className="flex flex-col items-center gap-8 w-full max-w-xl py-2">
            
            {/* FRONT SIDE CARD (SISI DEPAN) */}
            <div className="flex flex-col items-center gap-1.5 w-full">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest font-mono bg-white px-3 py-0.5 rounded-full border border-slate-200">
                SISI DEPAN (FRONT)
              </span>

              {/* HORIZONTAL MODE CARD */}
              {orientation === 'horizontal' ? (
                <div 
                  className="w-full max-w-[420px] h-[260px] p-4 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between transition-all duration-300"
                  style={{
                    ...getCardBgStyle(),
                    borderWidth: `${borderWidth}px`,
                    borderStyle: borderStyle,
                    borderColor: borderColor,
                    borderRadius: `${borderRadius}px`,
                    color: bodyTextColor
                  }}
                >
                  <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none" />

                  {/* Header Bar */}
                  <div 
                    className="-mx-4 -mt-4 p-3 mb-2 flex items-center justify-between border-b border-white/10 shrink-0"
                    style={{ backgroundColor: headerBgColor, color: headerTextColor }}
                  >
                    <div className="leading-tight">
                      <span className="text-[8.5px] font-black font-mono tracking-widest uppercase block text-indigo-200">{headerTitle}</span>
                      <h4 className="text-xs font-black tracking-tight uppercase m-0 leading-none">{institutionName}</h4>
                      <p className="text-[7.5px] opacity-80 font-mono m-0 mt-0.5">{institutionSubtitle}</p>
                    </div>
                    <div className="p-1.5 bg-white/10 rounded-xl shrink-0">
                      <ShieldCheck className="h-5 w-5 text-indigo-200" />
                    </div>
                  </div>

                  {/* Main Body Details */}
                  <div className="flex items-center gap-3 relative z-10 my-auto">
                    <div className="shrink-0 flex flex-col items-center">
                      <div 
                        className="h-24 w-20 bg-slate-800/50 border-2 overflow-hidden shadow-lg flex items-center justify-center shrink-0"
                        style={{
                          borderColor: photoBorderColor,
                          borderRadius: photoShape === 'circle' ? '9999px' : photoShape === 'rounded' ? '12px' : photoShape === 'oval' ? '50%' : '2px'
                        }}
                      >
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160"
                          alt="Student Portrait"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      {showStamp && (
                        <span className="text-[7px] font-extrabold text-emerald-300 bg-emerald-950/80 border border-emerald-500/50 px-1.5 py-0.5 rounded-md mt-1 tracking-wider uppercase font-mono">
                          {stampText}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 space-y-1.5 leading-tight">
                      <div>
                        <span className="text-[8px] font-bold opacity-75 uppercase tracking-wider font-mono block">{labelName}</span>
                        <h3 className="text-sm font-black truncate max-w-[240px]" style={{ color: accentColor }}>{studentName}</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div>
                          <span className="text-[7.5px] font-bold opacity-75 uppercase font-mono block">{labelNis}</span>
                          <p className="font-extrabold font-mono">{studentNis}</p>
                        </div>
                        <div>
                          <span className="text-[7.5px] font-bold opacity-75 uppercase font-mono block">{labelClass}</span>
                          <p className="font-extrabold truncate">{studentClass}</p>
                        </div>
                      </div>

                      <div>
                        <span className="text-[7.5px] font-bold opacity-75 uppercase font-mono block">{labelExpiry}</span>
                        <span className="inline-block px-2 py-0.5 bg-white/10 text-white border border-white/20 text-[8.5px] font-mono font-bold rounded-md mt-0.5">
                          {expiryDateText} • {isSantri ? 'SANTRI MUKIM' : 'SANTRI REGULER'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Barcode / Code128 */}
                  {showBarcode && (
                    <div className="bg-white/95 text-slate-900 px-3 py-1 rounded-xl flex items-center justify-between gap-3 shadow-md relative z-10 shrink-0">
                      <div className="flex flex-col gap-0.5">
                        <img
                          src={`/api/students/barcode/${studentNis}`}
                          alt="barcode vector"
                          className="h-6 w-36 object-contain"
                          onError={(e: any) => { e.target.style.display = 'none'; }}
                        />
                        <span className="text-[8px] font-mono font-bold text-slate-600 text-center tracking-widest">*{studentNis}*</span>
                      </div>
                      <div className="text-[8px] text-right text-slate-500 font-mono uppercase font-black">
                        SECURE-ID-SOCIETAS
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* VERTICAL MODE CARD (POTRET) */
                <div 
                  className="w-[260px] h-[410px] p-4 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between transition-all duration-300"
                  style={{
                    ...getCardBgStyle(),
                    borderWidth: `${borderWidth}px`,
                    borderStyle: borderStyle,
                    borderColor: borderColor,
                    borderRadius: `${borderRadius}px`,
                    color: bodyTextColor
                  }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />

                  {/* Vertical Header */}
                  <div 
                    className="-mx-4 -mt-4 p-3 text-center border-b border-white/10 shrink-0"
                    style={{ backgroundColor: headerBgColor, color: headerTextColor }}
                  >
                    <span className="text-[8px] font-black font-mono tracking-widest uppercase block text-indigo-200">{headerTitle}</span>
                    <h4 className="text-xs font-black uppercase tracking-tight m-0 mt-0.5 leading-tight">{institutionName}</h4>
                    <p className="text-[7px] opacity-80 font-mono m-0 mt-0.5">{institutionSubtitle}</p>
                  </div>

                  {/* Vertical Photo Center */}
                  <div className="flex flex-col items-center gap-2 my-auto">
                    <div 
                      className="h-28 w-22 bg-slate-800/50 border-2 overflow-hidden shadow-xl flex items-center justify-center shrink-0"
                      style={{
                        borderColor: photoBorderColor,
                        borderRadius: photoShape === 'circle' ? '9999px' : photoShape === 'rounded' ? '14px' : photoShape === 'oval' ? '50%' : '2px'
                      }}
                    >
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160"
                        alt="Student Portrait"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="text-center space-y-1 w-full">
                      <span className="text-[7.5px] font-bold opacity-75 uppercase font-mono block">{labelName}</span>
                      <h3 className="text-xs font-black truncate px-2" style={{ color: accentColor }}>{studentName}</h3>

                      <div className="grid grid-cols-2 gap-1 text-[9.5px] pt-1 border-t border-white/10 mt-1">
                        <div>
                          <span className="text-[7px] font-bold opacity-70 uppercase font-mono block">{labelNis}</span>
                          <p className="font-extrabold font-mono">{studentNis}</p>
                        </div>
                        <div>
                          <span className="text-[7px] font-bold opacity-70 uppercase font-mono block">{labelClass}</span>
                          <p className="font-bold truncate">{studentClass}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vertical Footer Barcode/QR */}
                  {showBarcode && (
                    <div className="bg-white/95 text-slate-900 p-2 rounded-xl flex flex-col items-center justify-center shadow-md relative z-10 shrink-0">
                      <img
                        src={`/api/students/barcode/${studentNis}`}
                        alt="barcode vector"
                        className="h-6 w-44 object-contain"
                        onError={(e: any) => { e.target.style.display = 'none'; }}
                      />
                      <span className="text-[7.5px] font-mono font-bold text-slate-600 tracking-widest mt-0.5">*{studentNis}*</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* BACK SIDE CARD (SISI BELAKANG) */}
            <div className="flex flex-col items-center gap-1.5 w-full">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest font-mono bg-white px-3 py-0.5 rounded-full border border-slate-200">
                SISI BELAKANG (BACK)
              </span>

              {/* HORIZONTAL BACK CARD */}
              {orientation === 'horizontal' ? (
                <div 
                  className="w-full max-w-[420px] h-[260px] p-4 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between transition-all duration-300"
                  style={{
                    ...getCardBgStyle(),
                    borderWidth: `${borderWidth}px`,
                    borderStyle: borderStyle,
                    borderColor: borderColor,
                    borderRadius: `${borderRadius}px`,
                    color: bodyTextColor
                  }}
                >
                  <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none" />

                  {/* Rules Content */}
                  <div className="space-y-1.5 relative z-10">
                    <span className="font-extrabold text-xs uppercase border-b border-white/20 pb-1 block tracking-wider font-mono text-indigo-200">
                      {backTitle}
                    </span>
                    <div className="space-y-1 text-[9px] opacity-85 leading-tight font-mono">
                      <p>{rule1}</p>
                      <p>{rule2}</p>
                      <p>{rule3}</p>
                      <p>{rule4}</p>
                    </div>
                  </div>

                  {/* Signatory & QR Verification */}
                  <div className="flex items-center justify-between relative z-10 pt-2 border-t border-white/10 gap-3">
                    <div className="space-y-0.5">
                      <span className="text-[8px] opacity-75 uppercase font-mono block">{signatoryRole}</span>
                      <p className="text-[10px] font-extrabold" style={{ color: accentColor }}>{signatoryName}</p>
                      <p className="text-[7.5px] opacity-60 font-mono">NIP / NIDN: 198203102008011005</p>
                    </div>

                    {showQrCode && (
                      <div className="bg-white p-1.5 rounded-xl shadow flex items-center gap-2 text-slate-900 shrink-0">
                        <img
                          src={`/api/students/qrcode/${studentNis}`}
                          alt="QR verification"
                          className="h-10 w-10 object-contain"
                          onError={(e: any) => { e.target.style.display = 'none'; }}
                        />
                        <div className="text-[7.5px] font-mono leading-none pr-1">
                          <span className="font-bold block text-slate-800">VERIFIKASI</span>
                          <span className="text-emerald-600 font-bold">SCAN QR</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* VERTICAL BACK CARD */
                <div 
                  className="w-[260px] h-[410px] p-4 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between transition-all duration-300"
                  style={{
                    ...getCardBgStyle(),
                    borderWidth: `${borderWidth}px`,
                    borderStyle: borderStyle,
                    borderColor: borderColor,
                    borderRadius: `${borderRadius}px`,
                    color: bodyTextColor
                  }}
                >
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />

                  {/* Rules Vertical */}
                  <div className="space-y-2 relative z-10">
                    <span className="font-extrabold text-[10.5px] uppercase border-b border-white/20 pb-1 block tracking-wider font-mono text-indigo-200 text-center">
                      {backTitle}
                    </span>
                    <div className="space-y-1.5 text-[8.5px] opacity-85 leading-relaxed font-mono">
                      <p>{rule1}</p>
                      <p>{rule2}</p>
                      <p>{rule3}</p>
                      <p>{rule4}</p>
                    </div>
                  </div>

                  {/* Signatory & QR Vertical */}
                  <div className="space-y-3 relative z-10 pt-2 border-t border-white/10 text-center">
                    {showQrCode && (
                      <div className="bg-white p-2 rounded-2xl shadow inline-flex items-center gap-2 text-slate-900 mx-auto">
                        <img
                          src={`/api/students/qrcode/${studentNis}`}
                          alt="QR verification"
                          className="h-10 w-10 object-contain"
                          onError={(e: any) => { e.target.style.display = 'none'; }}
                        />
                        <span className="text-[8px] font-bold font-mono text-slate-800">SCAN VERIFIKASI QR</span>
                      </div>
                    )}

                    <div>
                      <span className="text-[7.5px] opacity-75 uppercase font-mono block">{signatoryRole}</span>
                      <p className="text-[10px] font-extrabold" style={{ color: accentColor }}>{signatoryName}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* 2. BARCODE SUBTAB PREVIEW */}
        {subTab === 'BARCODE' && (
          <div className="flex flex-col items-center gap-4 my-auto">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">Vector Code128 Barcode Generator</span>
            
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl flex flex-col items-center gap-2">
              <img
                src={`/api/students/barcode/${customBarcodeText}`}
                alt="Barcode generator vector"
                className="max-h-24 w-80 object-contain"
              />
              <span className="text-xs font-mono text-slate-600 tracking-widest font-bold">*{customBarcodeText}*</span>
            </div>

            <p className="text-center text-[11px] text-slate-500 max-w-sm">
              Vector Code128 barcode dioptimalkan untuk pemindaian scanner laser jarak jauh & kamera smartphone.
            </p>
          </div>
        )}

        {/* 3. QR SUBTAB PREVIEW */}
        {subTab === 'QR' && (
          <div className="flex flex-col items-center gap-4 my-auto">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">Vector QR Code (ISO/IEC 18004) Generator</span>
            
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl flex flex-col items-center gap-2">
              <img
                src={`/api/students/qrcode/${encodeURIComponent(customQrText)}`}
                alt="QR code vector"
                className="h-48 w-48 object-contain"
              />
              <span className="text-[10.5px] font-mono text-slate-600 font-bold truncate max-w-[220px]">{customQrText}</span>
            </div>

            <p className="text-center text-[11px] text-slate-500 max-w-sm">
              Payload QR Code terenkripsi dengan koreksi kesalahan 15% (Level M).
            </p>
          </div>
        )}

      </div>

    </div>
  );
}
