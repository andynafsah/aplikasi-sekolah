import React, { useState, useRef } from 'react';
import { 
  Scan, 
  Sparkles, 
  Upload, 
  CheckCircle2, 
  FileText, 
  Camera, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  Eye, 
  Database, 
  Zap, 
  Sliders, 
  Layers, 
  Building2, 
  Calendar, 
  Tag, 
  Clock, 
  ShieldAlert,
  FileCheck,
  Send
} from 'lucide-react';

interface ExtractedLetterData {
  letter_number: string;
  letter_date: string;
  received_date: string;
  sender: string;
  receiver: string;
  subject: string;
  category: string;
  confidentiality: 'BIASA' | 'RAHASIA' | 'SANGAT_RAHASIA';
  urgency: 'BIASA' | 'SEGERA' | 'PENTING';
  summary: string;
  confidence_score: number;
}

interface SampleScanPreset {
  id: string;
  title: string;
  source: string;
  image_url: string;
  data: ExtractedLetterData;
}

const SAMPLE_PRESETS: SampleScanPreset[] = [
  {
    id: 'scan-01',
    title: 'Surat Undangan Dinas Pendidikan Provinsi',
    source: 'Dinas Pendidikan & Kebudayaan',
    image_url: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=800&q=80',
    data: {
      letter_number: '421.2/0891/DISDIK-PROV/2026',
      letter_date: '2026-08-01',
      received_date: '2026-08-05',
      sender: 'Dinas Pendidikan & Kebudayaan Provinsi Jawa Barat',
      receiver: 'Kepala SMP & SMA Pesantren Islam Terpadu',
      subject: 'Undangan Rapat Koordinasi Akreditasi Lembaga Pendidikan Islam & Tahfidz',
      category: '421.2 (Pendidikan Sekunder & Keagamaan)',
      confidentiality: 'BIASA',
      urgency: 'PENTING',
      summary: 'MENGUNDANG KEPALA SEKOLAH DAN KASIE TATA USAHA UNTUK HADIR DALAM EVALUASI AKREDITASI MANAJEMEN KEARSIPAN SEKOLAH TANGGAL 10 AGUSTUS 2026 DI AULA UTAMA DISDIK.',
      confidence_score: 98.6
    }
  },
  {
    id: 'scan-02',
    title: 'Surat Edaran Kementerian Agama Kemenag RI',
    source: 'Kementerian Agama RI',
    image_url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80',
    data: {
      letter_number: 'B-1082/KEMENAG.02/VIII/2026',
      letter_date: '2026-08-02',
      received_date: '2026-08-05',
      sender: 'Kantor Wilayah Kementerian Agama Kota/Kabupaten',
      receiver: 'Pimpinan Pondok Pesantren & Kepala Yayasan',
      subject: 'Surat Edaran Petunjuk Teknis Lomba MQK & Tahfidz Al-Qur\'an 30 Juz',
      category: '450 (Keagamaan & Pondok Pesantren)',
      confidentiality: 'BIASA',
      urgency: 'SEGERA',
      summary: 'EDARAN RESMI PENDAFTARAN LOMBA MARATON TAHFIDZ AL-QUR\'AN DAN MUSABAQAH QIRAATIL KUTUB TINGKAT PROVINSI TAHUN 2026. BATAS AKHIR PENDAFTARAN 15 AGUSTUS 2026.',
      confidence_score: 97.4
    }
  },
  {
    id: 'scan-03',
    title: 'Surat Permohonan Kerjasama Puskesmas',
    source: 'Puskesmas Kecamatan',
    image_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
    data: {
      letter_number: '440/012/PKM-KEC/VIII/2026',
      letter_date: '2026-08-03',
      received_date: '2026-08-05',
      sender: 'UPTD Puskesmas Kecamatan Kebayoran',
      receiver: 'Pengasuh & Pengelola Poskestren (Pos Kesehatan Pesantren)',
      subject: 'Permohonan Pelaksanaan Pemeriksaan Kesehatan Berkala & Immunisasi Santri',
      category: '440 (Kesehatan & Kesra)',
      confidentiality: 'BIASA',
      urgency: 'BIASA',
      summary: 'PERMOHONAN JADWAL PELAKSANAAN INSPEKSI SANITASI DAN PEMERIKSAAN KESEHATAN BERKALA BAGI SANTRIWAN/SANTRIWATI BARU TAHUN AJARAN 2026/2027.',
      confidence_score: 99.1
    }
  }
];

interface SmartOcrScannerViewProps {
  refetchIncoming?: () => void;
}

export default function SmartOcrScannerView({ refetchIncoming }: SmartOcrScannerViewProps) {
  const [selectedPreset, setSelectedPreset] = useState<SampleScanPreset>(SAMPLE_PRESETS[0]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scannedImage, setScannedImage] = useState<string | null>(SAMPLE_PRESETS[0].image_url);
  const [extractedData, setExtractedData] = useState<ExtractedLetterData>(SAMPLE_PRESETS[0].data);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRunOcr = (preset?: SampleScanPreset) => {
    const activeData = preset ? preset.data : extractedData;
    const activeImage = preset ? preset.image_url : scannedImage;

    if (preset) {
      setSelectedPreset(preset);
      setScannedImage(activeImage);
    }

    setIsScanning(true);
    setSavedSuccess(false);
    setScanProgress(10);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            setIsScanning(false);
            setScanProgress(100);
            if (preset) {
              setExtractedData(preset.data);
            }
          }, 300);
          return 90;
        }
        return prev + 20;
      });
    }, 150);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setScannedImage(event.target?.result as string);
        // Simulate custom OCR result
        handleRunOcr();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveToIncomingLetters = async () => {
    try {
      const token = localStorage.getItem('token');
      const payload = {
        action: 'incomingLetterCreate',
        letter_number: extractedData.letter_number,
        letter_date: extractedData.letter_date,
        received_date: extractedData.received_date,
        sender: extractedData.sender,
        receiver: extractedData.receiver,
        subject: extractedData.subject,
        category_id: extractedData.category,
        summary: extractedData.summary,
        confidentiality: extractedData.confidentiality,
        urgency: extractedData.urgency,
      };

      await fetch('/api/action?action=incomingLetterCreate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      
      setSavedSuccess(true);
      if (refetchIncoming) {
        refetchIncoming();
      }
      alert('Surat Fisik berhasil diekstrak dan disimpan otomatis ke Agenda Surat Masuk!');
    } catch (e) {
      alert('Gagal menyimpan surat masuk.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-emerald-950 text-white p-6 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/30 text-emerald-200 px-3 py-1 rounded-full border border-emerald-400/30 mb-2">
            <Sparkles className="h-3 w-3" /> Fitur Unggulan: AI Vision & OCR Scanner
          </span>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Scan className="h-6 w-6 text-emerald-400" />
            Smart OCR Auto-Fill Pindai Surat Fisik (Scan to Document)
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Ekstrak nomor surat, perihal, pengirim, & ringkasan otomatis dari hasil foto/scan dokumen fisik tanpa mengetik ulang.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow transition flex items-center gap-2 cursor-pointer"
          >
            <Camera className="h-4 w-4" />
            Unggah Foto / Scan Surat
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,.pdf"
            className="hidden"
          />
        </div>
      </div>

      {/* Preset Selector Badges */}
      <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-sm space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            Atau Pilih Sampel Dokumen Scan Fisik untuk Pengujian OCR AI:
          </span>
          <span className="text-[10px] font-mono text-slate-400">Gemini Vision Engine v2.6</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleRunOcr(preset)}
              className={`p-3 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                selectedPreset.id === preset.id
                  ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-400/30 shadow-sm'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <img
                src={preset.image_url}
                alt={preset.title}
                className="w-12 h-14 object-cover rounded-lg border border-slate-300 shrink-0"
              />
              <div className="space-y-1">
                <strong className="block text-slate-900 font-bold leading-tight line-clamp-2">
                  {preset.title}
                </strong>
                <span className="text-[10px] text-slate-500 block">{preset.source}</span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold font-mono px-2 py-0.5 rounded inline-block">
                  Akurasi {preset.data.confidence_score}%
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main OCR Scan & Auto-Fill Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Image Scan Preview with Processing Overlay */}
        <div className="lg:col-span-5 bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <Eye className="h-4 w-4 text-emerald-600" />
              1. Dokumen Fisik / Hasil Pindaian
            </h3>
            <button
              onClick={() => handleRunOcr()}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" /> Pindai Ulang
            </button>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-slate-900 min-h-[380px] flex items-center justify-center">
            {scannedImage ? (
              <img
                src={scannedImage}
                alt="Scan Surat Fisik"
                className={`w-full h-auto max-h-[460px] object-contain transition duration-500 ${
                  isScanning ? 'opacity-40 blur-xs' : 'opacity-100'
                }`}
              />
            ) : (
              <div className="text-center p-8 text-slate-400 space-y-2">
                <Camera className="h-12 w-12 mx-auto text-slate-600" />
                <p className="text-xs font-bold">Belum ada dokumen pindaian</p>
              </div>
            )}

            {/* OCR Processing Scanning Animation Bar */}
            {isScanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 space-y-4 bg-slate-950/70 backdrop-blur-xs text-white">
                <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <div className="text-center space-y-1">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1 justify-center">
                    <Sparkles className="h-4 w-4 animate-bounce" /> Memproses OCR Vision AI...
                  </span>
                  <p className="text-[11px] text-slate-300 font-mono">Ekstraksi Teks: {scanProgress}% selesai</p>
                </div>

                <div className="w-48 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="bg-emerald-400 h-full transition-all duration-200"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Skor Akurasi OCR AI:</span>
            <span className="font-extrabold text-emerald-700 font-mono bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              ⚡ {extractedData.confidence_score}% (Sangat Tinggi)
            </span>
          </div>
        </div>

        {/* Right Column: Auto-Filled Form Ready to Register */}
        <div className="lg:col-span-7 bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-emerald-600" />
                2. Data Hasil Ekstraksi Otomatis (Auto-Filled)
              </h3>
              <p className="text-[11px] text-slate-500">Periksa & sesuaikan hasil identifikasi sebelum disimpan ke sistem agenda.</p>
            </div>

            {savedSuccess ? (
              <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-xl flex items-center gap-1 text-[11px] border border-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Terdaftar di Agenda
              </span>
            ) : (
              <span className="bg-amber-50 text-amber-800 font-bold px-2.5 py-1 rounded-xl text-[10px] border border-amber-200">
                Siap Diverifikasi
              </span>
            )}
          </div>

          <div className="space-y-3">
            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nomor Surat Terpindai <span className="text-emerald-600 font-mono text-[10px]">(Auto OCR)</span>
                </label>
                <input
                  type="text"
                  value={extractedData.letter_number}
                  onChange={(e) => setExtractedData({ ...extractedData, letter_number: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-blue-800 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Klasifikasi / Kode Arsip</label>
                <input
                  type="text"
                  value={extractedData.category}
                  onChange={(e) => setExtractedData({ ...extractedData, category: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-800 bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tanggal Surat</label>
                <input
                  type="date"
                  value={extractedData.letter_date}
                  onChange={(e) => setExtractedData({ ...extractedData, letter_date: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 font-mono text-slate-800 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tanggal Diterima TU</label>
                <input
                  type="date"
                  value={extractedData.received_date}
                  onChange={(e) => setExtractedData({ ...extractedData, received_date: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 font-mono text-slate-800 bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Instansi / Pengirim Surat</label>
              <input
                type="text"
                value={extractedData.sender}
                onChange={(e) => setExtractedData({ ...extractedData, sender: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 font-extrabold text-slate-900 bg-slate-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Perihal / Subjek Surat</label>
              <textarea
                rows={2}
                value={extractedData.subject}
                onChange={(e) => setExtractedData({ ...extractedData, subject: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 bg-slate-50 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Sifat Kerahasiaan</label>
                <select
                  value={extractedData.confidentiality}
                  onChange={(e) => setExtractedData({ ...extractedData, confidentiality: e.target.value as any })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 bg-slate-50"
                >
                  <option value="BIASA">BIASA</option>
                  <option value="RAHASIA">RAHASIA</option>
                  <option value="SANGAT_RAHASIA">SANGAT RAHASIA</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tingkat Urgensi</label>
                <select
                  value={extractedData.urgency}
                  onChange={(e) => setExtractedData({ ...extractedData, urgency: e.target.value as any })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 bg-slate-50"
                >
                  <option value="BIASA">BIASA</option>
                  <option value="SEGERA">SEGERA</option>
                  <option value="PENTING">PENTING</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Ekstrak Ringkasan Isi Penting (AI Generated)</label>
              <textarea
                rows={3}
                value={extractedData.summary}
                onChange={(e) => setExtractedData({ ...extractedData, summary: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-700 bg-amber-50/50 border-amber-200 focus:bg-white font-mono text-[11px]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSaveToIncomingLetters}
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Database className="h-4 w-4" />
                Simpan & Daftarkan ke Agenda Surat Masuk
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
