import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Sparkles, 
  Upload, 
  CheckCircle2, 
  Printer, 
  Eye, 
  FileText, 
  Sliders, 
  ShieldCheck,
  Layers,
  Palette,
  Image as ImageIcon,
  Type,
  Maximize2,
  RefreshCw,
  Save,
  Grid
} from 'lucide-react';

interface KopConfig {
  unit_code: string;
  unit_name: string;
  institution_title: string;
  sub_title: string;
  address: string;
  contact_info: string;
  website: string;
  email?: string;
  npsn?: string;
  nsm?: string;
  has_digital_stamp: boolean;
  stamp_text: string;
  header_style: 'classic' | 'modern' | 'minimalist' | 'double-line' | 'thick-thin';
  logo_layout: 'left' | 'dual' | 'center' | 'right';
  logo_size: number;
  font_family: 'Times New Roman' | 'Arial' | 'Calibri' | 'Georgia' | 'Cambria' | 'Tahoma';
  font_size_title: number;
  font_size_subtitle: number;
  font_size_address: number;
  letter_spacing: number;
  line_height: number;
  accent_color: string;
  logo_url_left?: string;
  logo_url_right?: string;
}

export default function DynamicKopAndStampView() {
  const [selectedUnit, setSelectedUnit] = useState<string>('SMP');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [kopConfigs, setKopConfigs] = useState<Record<string, KopConfig>>({
    SMP: {
      unit_code: 'SMP',
      unit_name: 'SMP Islam Terpadu Al-Azhar',
      institution_title: 'YAYASAN PENDIDIKAN ISLAM AL-AZHAR',
      sub_title: 'SEKOLAH MENENGAH PERTAMA (SMP TERPADU)',
      address: 'Jl. Pendidikan No. 45, Komplek Pesantren Terpadu, Depok, Jawa Barat',
      contact_info: 'Telp: (021) 8877-6655 | Email: smp@alazhar-terpadu.sch.id',
      website: 'www.smp-alazhar.sch.id',
      email: 'smp@alazhar-terpadu.sch.id',
      npsn: '20109876',
      nsm: '121231710001',
      has_digital_stamp: true,
      stamp_text: 'STEMPEL RESMI TATA USAHA SMP',
      header_style: 'double-line',
      logo_layout: 'dual',
      logo_size: 64,
      font_family: 'Times New Roman',
      font_size_title: 16,
      font_size_subtitle: 13,
      font_size_address: 10,
      letter_spacing: 0.5,
      line_height: 1.25,
      accent_color: '#0f172a',
      logo_url_left: '/logo-yayasan.png',
      logo_url_right: '/logo-smp.png'
    },
    SMA: {
      unit_code: 'SMA',
      unit_name: 'SMA Tahfidz Al-Qur\'an Al-Azhar',
      institution_title: 'YAYASAN PENDIDIKAN ISLAM AL-AZHAR',
      sub_title: 'SEKOLAH MENENGAH ATAS TAHFIDZ (SMA UNGGULAN)',
      address: 'Jl. Kampus Pesantren No. 88, Gedung Al-Ghazali, Depok, Jawa Barat',
      contact_info: 'Telp: (021) 8877-9900 | Email: sma@alazhar-terpadu.sch.id',
      website: 'www.sma-tahfidz.sch.id',
      email: 'sma@alazhar-terpadu.sch.id',
      npsn: '20109877',
      nsm: '121231710002',
      has_digital_stamp: true,
      stamp_text: 'STEMPEL RESMI SMA TAHFIDZ',
      header_style: 'modern',
      logo_layout: 'left',
      logo_size: 60,
      font_family: 'Arial',
      font_size_title: 15,
      font_size_subtitle: 12,
      font_size_address: 9.5,
      letter_spacing: 0.8,
      line_height: 1.3,
      accent_color: '#1e3a8a',
      logo_url_left: '/logo-sma.png'
    },
    PONPES: {
      unit_code: 'PONPES',
      unit_name: 'Pondok Pesantren Modern Darul Hadits',
      institution_title: 'YAYASAN PENDIDIKAN ISLAM AL-AZHAR',
      sub_title: 'DIREKTORAT PENGASUHAN PONDOK PESANTREN MODERN',
      address: 'Jl. Raya Payakumbuh Km 7, Lima Puluh Kota, Sumatera Barat',
      contact_info: 'Telp: (0752) 12345 | Email: info@darulhadits.org',
      website: 'www.darulhadits.org',
      email: 'info@darulhadits.org',
      npsn: 'PP-510099',
      nsm: '510032710003',
      has_digital_stamp: true,
      stamp_text: 'SEKRETARIAT PUSAT PESANTREN',
      header_style: 'classic',
      logo_layout: 'dual',
      logo_size: 68,
      font_family: 'Times New Roman',
      font_size_title: 17,
      font_size_subtitle: 13,
      font_size_address: 10,
      letter_spacing: 0.5,
      line_height: 1.2,
      accent_color: '#065f46',
      logo_url_left: '/logo-yayasan.png',
      logo_url_right: '/logo-ponpes.png'
    },
    YAYASAN: {
      unit_code: 'YAYASAN',
      unit_name: 'Kantor Pusat Yayasan',
      institution_title: 'YAYASAN PENDIDIKAN ISLAM AL-AZHAR',
      sub_title: 'DIREKTORAT JENDERAL SEKRETARIAT TATA USAHA PUSAT',
      address: 'Jl. Utama Pesantren No. 01, Kebayoran Baru, Jakarta Selatan',
      contact_info: 'Telp: (021) 7200-1122 | Call Center: 0812-9988-7766',
      website: 'www.yayasan-alazhar.or.id',
      email: 'sekretariat@yayasan-alazhar.or.id',
      npsn: 'YYS-00912',
      nsm: '111122223333',
      has_digital_stamp: true,
      stamp_text: 'SEKRETARIAT PUSAT YAYASAN',
      header_style: 'minimalist',
      logo_layout: 'center',
      logo_size: 72,
      font_family: 'Georgia',
      font_size_title: 18,
      font_size_subtitle: 14,
      font_size_address: 10,
      letter_spacing: 1.0,
      line_height: 1.3,
      accent_color: '#0f172a',
      logo_url_left: '/logo-yayasan.png'
    }
  });

  const fetchKopConfigs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/action?action=kopConfigGet', {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      const data = await res.json();
      if (data && data.success && data.data && Object.keys(data.data).length > 0) {
        setKopConfigs(prev => ({ ...prev, ...data.data }));
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchKopConfigs(); }, []);

  const activeConfig = kopConfigs[selectedUnit] || kopConfigs.SMP;

  const handleUpdateConfig = (field: keyof KopConfig, value: any) => {
    setKopConfigs({
      ...kopConfigs,
      [selectedUnit]: {
        ...activeConfig,
        [field]: value
      }
    });
  };

  const handleSaveKop = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/action?action=kopConfigUpdate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(kopConfigs)
      });
      const data = await res.json();
      if (data.success) {
        setSaveMessage(`✓ Pengaturan Kop Surat unit [${activeConfig.unit_name}] berhasil disimpan ke database!`);
      }
    } catch (err: any) {
      setSaveMessage(`❌ Gagal menyimpan: ${err.message}`);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-6 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 px-3 py-1 rounded-full border border-indigo-400/30 mb-2">
            <Sparkles className="h-3 w-3" /> Kop Surat Visual Designer & Brand Engine
          </span>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Building2 className="h-6 w-6 text-indigo-400" />
            Visual Kop Surat & Stempel Digital Designer
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Konfigurasi tata letak kop surat resmi multi-unit: Logo, garis pembatas, font, ukuran kertas, dan stempel verifikasi digital.
          </p>
        </div>

        <button
          onClick={handleSaveKop}
          disabled={isSaving}
          className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
        >
          {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isSaving ? 'Memproses...' : 'Simpan Kop ke Database'}
        </button>
      </div>

      {saveMessage && (
        <div className={`p-3 rounded-xl text-xs font-bold border flex items-center gap-2 ${saveMessage.includes('✓') ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
          {saveMessage}
        </div>
      )}

      {/* Unit Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { code: 'SMP', label: 'Unit SMP Islam Terpadu' },
          { code: 'SMA', label: 'Unit SMA Tahfidz' },
          { code: 'PONPES', label: 'Unit Pondok Pesantren' },
          { code: 'YAYASAN', label: 'Sekretariat Pusat Yayasan' }
        ].map(u => (
          <button
            key={u.code}
            onClick={() => setSelectedUnit(u.code)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer border ${
              selectedUnit === u.code
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {u.label}
          </button>
        ))}
      </div>

      {/* Main Grid Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Form Editor */}
        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-4 text-xs">
          <h3 className="font-black text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
            <Sliders className="h-4 w-4 text-indigo-600" />
            Pengaturan Elemen & Tipografi Kop Surat ({activeConfig.unit_code})
          </h3>

          <div className="space-y-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nama Induk Yayasan / Lembaga</label>
              <input
                type="text"
                value={activeConfig.institution_title}
                onChange={(e) => handleUpdateConfig('institution_title', e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white font-extrabold text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Sub-Judul Unit Pendidikan</label>
              <input
                type="text"
                value={activeConfig.sub_title}
                onChange={(e) => handleUpdateConfig('sub_title', e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Alamat Lengkap</label>
              <input
                type="text"
                value={activeConfig.address}
                onChange={(e) => handleUpdateConfig('address', e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Kontak & Telepon</label>
                <input
                  type="text"
                  value={activeConfig.contact_info}
                  onChange={(e) => handleUpdateConfig('contact_info', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white text-[11px]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Website Resmi</label>
                <input
                  type="text"
                  value={activeConfig.website}
                  onChange={(e) => handleUpdateConfig('website', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white font-mono text-[11px]"
                />
              </div>
            </div>

            {/* Layout Logo & Style */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Posisi & Jumlah Logo</label>
                <select
                  value={activeConfig.logo_layout}
                  onChange={(e) => handleUpdateConfig('logo_layout', e.target.value as any)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 font-bold"
                >
                  <option value="dual">Dua Logo (Kiri Yayasan & Kanan Unit)</option>
                  <option value="left">Satu Logo (Sisi Kiri)</option>
                  <option value="center">Satu Logo (Sisi Tengah Atas)</option>
                  <option value="right">Satu Logo (Sisi Kanan)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Ukuran Logo ({activeConfig.logo_size}px)</label>
                <input
                  type="range"
                  min={40}
                  max={100}
                  value={activeConfig.logo_size}
                  onChange={(e) => handleUpdateConfig('logo_size', Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>

            {/* Typography Controls */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Jenis Font Utama</label>
                <select
                  value={activeConfig.font_family}
                  onChange={(e) => handleUpdateConfig('font_family', e.target.value as any)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 font-bold"
                >
                  <option value="Times New Roman">Times New Roman (Resmi)</option>
                  <option value="Arial">Arial (Clean Modern)</option>
                  <option value="Calibri">Calibri (Standard Office)</option>
                  <option value="Georgia">Georgia (Serif Elegant)</option>
                  <option value="Cambria">Cambria (Formal)</option>
                  <option value="Tahoma">Tahoma (Compact)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Gaya Garis Pembatas</label>
                <select
                  value={activeConfig.header_style}
                  onChange={(e) => handleUpdateConfig('header_style', e.target.value as any)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 font-bold"
                >
                  <option value="double-line">Garis Ganda Tebal (Standard Kedinasan)</option>
                  <option value="classic">Garis Tunggal Tebal</option>
                  <option value="modern">Modern Aksen Warna</option>
                  <option value="minimalist">Minimalis Presisi</option>
                </select>
              </div>
            </div>

            {/* Font Sizes */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-600 text-[11px] block mb-1">Judul ({activeConfig.font_size_title}pt)</label>
                <input
                  type="number"
                  min={12}
                  max={24}
                  value={activeConfig.font_size_title}
                  onChange={(e) => handleUpdateConfig('font_size_title', Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg p-1.5 bg-slate-50 text-center font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-600 text-[11px] block mb-1">Sub-Judul ({activeConfig.font_size_subtitle}pt)</label>
                <input
                  type="number"
                  min={10}
                  max={18}
                  value={activeConfig.font_size_subtitle}
                  onChange={(e) => handleUpdateConfig('font_size_subtitle', Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg p-1.5 bg-slate-50 text-center font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-600 text-[11px] block mb-1">Alamat ({activeConfig.font_size_address}pt)</label>
                <input
                  type="number"
                  min={8}
                  max={14}
                  value={activeConfig.font_size_address}
                  onChange={(e) => handleUpdateConfig('font_size_address', Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg p-1.5 bg-slate-50 text-center font-bold"
                />
              </div>
            </div>

            {/* Stamp Configuration */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <label className="font-bold text-slate-700">Stempel Digital Resmi Watermark</label>
                <button
                  type="button"
                  onClick={() => handleUpdateConfig('has_digital_stamp', !activeConfig.has_digital_stamp)}
                  className={`py-1 px-2.5 rounded-lg text-xs font-bold border flex items-center gap-1 transition ${
                    activeConfig.has_digital_stamp
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                      : 'bg-slate-100 border-slate-300 text-slate-500'
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {activeConfig.has_digital_stamp ? 'Aktif' : 'Nonaktif'}
                </button>
              </div>

              {activeConfig.has_digital_stamp && (
                <div>
                  <label className="font-bold text-slate-600 text-[11px] block mb-1">Teks Lingkaran Stempel</label>
                  <input
                    type="text"
                    value={activeConfig.stamp_text}
                    onChange={(e) => handleUpdateConfig('stamp_text', e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-1.5 bg-slate-50 focus:bg-white font-mono uppercase text-[11px]"
                  />
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Right Live Kop Preview */}
        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-black text-slate-900 text-xs flex items-center gap-2 uppercase tracking-wider">
              <Eye className="h-4 w-4 text-emerald-600" />
              Prinjau Kop Surat Live ({activeConfig.unit_code})
            </h3>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 font-mono font-bold px-2 py-0.5 rounded border border-indigo-200">
              Skala A4 100% • Font: {activeConfig.font_family}
            </span>
          </div>

          <div className="bg-slate-100 p-6 rounded-xl border border-slate-200">
            <div className="bg-white border border-slate-300 shadow-xl p-6 rounded space-y-6 text-slate-900" style={{ fontFamily: activeConfig.font_family }}>
              
              {/* Dynamic Kop Header */}
              <div className={`relative pb-3 ${
                activeConfig.header_style === 'double-line' 
                  ? 'border-b-4 border-double border-slate-900'
                  : activeConfig.header_style === 'classic'
                  ? 'border-b-2 border-slate-900'
                  : activeConfig.header_style === 'modern'
                  ? 'border-b-4 border-indigo-900'
                  : 'border-b border-slate-400'
              }`}>

                {/* Logo Top Layout */}
                {activeConfig.logo_layout === 'center' && (
                  <div className="flex justify-center mb-2">
                    <div className="bg-indigo-900 text-white font-black rounded-full flex items-center justify-center text-xs shadow" style={{ width: activeConfig.logo_size, height: activeConfig.logo_size }}>
                      {activeConfig.unit_code}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3">
                  {/* Left Logo */}
                  {(activeConfig.logo_layout === 'dual' || activeConfig.logo_layout === 'left') && (
                    <div className="shrink-0">
                      <div className="bg-indigo-900 text-white font-black rounded-lg flex items-center justify-center text-xs shadow-sm" style={{ width: activeConfig.logo_size, height: activeConfig.logo_size }}>
                        {activeConfig.unit_code}
                      </div>
                    </div>
                  )}

                  {/* Header Titles */}
                  <div className="text-center flex-1 space-y-0.5">
                    <h2 className="font-black uppercase text-slate-900 leading-tight" style={{ fontSize: `${activeConfig.font_size_title}px`, letterSpacing: `${activeConfig.letter_spacing}px` }}>
                      {activeConfig.institution_title}
                    </h2>
                    <h3 className="font-bold text-indigo-900 uppercase leading-tight" style={{ fontSize: `${activeConfig.font_size_subtitle}px` }}>
                      {activeConfig.sub_title}
                    </h3>
                    <p className="text-slate-600 font-medium leading-tight mt-1" style={{ fontSize: `${activeConfig.font_size_address}px` }}>
                      {activeConfig.address}
                    </p>
                    <p className="text-slate-500 font-mono text-[9px] leading-tight">
                      {activeConfig.contact_info} • {activeConfig.website}
                    </p>
                  </div>

                  {/* Right Logo */}
                  {activeConfig.logo_layout === 'dual' && (
                    <div className="shrink-0">
                      <div className="bg-emerald-800 text-white font-black rounded-lg flex items-center justify-center text-xs shadow-sm" style={{ width: activeConfig.logo_size, height: activeConfig.logo_size }}>
                        LOG
                      </div>
                    </div>
                  )}
                  {activeConfig.logo_layout === 'right' && (
                    <div className="shrink-0">
                      <div className="bg-indigo-900 text-white font-black rounded-lg flex items-center justify-center text-xs shadow-sm" style={{ width: activeConfig.logo_size, height: activeConfig.logo_size }}>
                        {activeConfig.unit_code}
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Sample Letter Body */}
              <div className="space-y-3 py-2 text-xs text-slate-800 leading-relaxed font-serif bg-slate-50/50 p-4 rounded border border-slate-200">
                <div className="flex justify-between font-bold border-b border-slate-200 pb-2">
                  <span>Nomor: B-104/{activeConfig.unit_code}/SK/VII/2026</span>
                  <span>Tanggal: 12 Juli 2026</span>
                </div>
                <p className="pt-2 font-medium">
                  Dengan surat ini, seluruh dokumen resmi yang diterbitkan melalui sistem Tata Usaha secara otomatis menggunakan Kop Surat resmi unit <strong className="text-indigo-900">{activeConfig.unit_name}</strong>.
                </p>
              </div>

              {/* Sample Stamp Watermark & Signature Area */}
              <div className="flex justify-between items-center pt-2">
                {activeConfig.has_digital_stamp ? (
                  <div className="h-20 w-20 border-2 border-emerald-600 rounded-full flex flex-col items-center justify-center text-center p-1 text-emerald-700 font-extrabold uppercase text-[8px] leading-tight rotate-[-12deg] bg-emerald-50/40 shadow-xs">
                    <span>★ {activeConfig.unit_code} ★</span>
                    <span className="text-[7px] leading-none my-0.5">{activeConfig.stamp_text}</span>
                    <span className="text-[6px] font-mono text-emerald-900">VERIFIED TU</span>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-400 italic">Tanpa Stempel Digital</div>
                )}

                <div className="text-center text-xs space-y-6">
                  <span className="text-[11px] font-bold block">Kepala Sekolah / Pengasuh</span>
                  <div className="font-extrabold underline text-slate-900">
                    Ust. H. Abdullah Faqih, M.Pd.
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

