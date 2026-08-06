import React, { useState } from 'react';
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
  Palette
} from 'lucide-react';

interface KopConfig {
  unit_code: string;
  unit_name: string;
  institution_title: string;
  sub_title: string;
  address: string;
  contact_info: string;
  website: string;
  has_digital_stamp: boolean;
  stamp_text: string;
  header_style: 'classic' | 'modern' | 'minimalist';
  accent_color: string;
}

export default function DynamicKopAndStampView() {
  const [selectedUnit, setSelectedUnit] = useState<string>('SMP');

  const fetchKopConfigs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/action?action=kopConfigGet', {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      const data = await res.json();
      if (data && data.success && data.data && Object.keys(data.data).length > 0) {
        setKopConfigs(data.data);
      }
    } catch (e) { console.error(e); }
  };
  React.useEffect(() => { fetchKopConfigs(); }, []);

  const [kopConfigs, setKopConfigs] = useState<Record<string, KopConfig>>({
    SMP: {
      unit_code: 'SMP',
      unit_name: 'SMP Pesantren Islam Terpadu',
      institution_title: 'YAYASAN PENDIDIKAN ISLAM AL-IKHLAS',
      sub_title: 'SEKOLAH MENENGAH PERTAMA (SMP TERPADU)',
      address: 'Jl. Pendidikan No. 45, Komplek Pesantren Terpadu',
      contact_info: 'Telp: (021) 8877-6655 | Email: smp@pesantren-yab.sch.id',
      website: 'www.smp-pesantren.sch.id',
      has_digital_stamp: true,
      stamp_text: 'STEMPEL RESMI TATA USAHA SMP',
      header_style: 'classic',
      accent_color: '#0f172a'
    },
    SMA: {
      unit_code: 'SMA',
      unit_name: 'SMA Tahfidz Al-Qur\'an',
      institution_title: 'YAYASAN PENDIDIKAN ISLAM AL-IKHLAS',
      sub_title: 'SEKOLAH MENENGAH ATAS TAHFIDZ (SMA UNGGULAN)',
      address: 'Jl. Kampus Pesantren No. 88, Gedung Al-Ghazali',
      contact_info: 'Telp: (021) 8877-9900 | Email: sma@pesantren-yab.sch.id',
      website: 'www.sma-tahfidz.sch.id',
      has_digital_stamp: true,
      stamp_text: 'STEMPEL RESMI SMA TAHFIDZ',
      header_style: 'modern',
      accent_color: '#1e3a8a'
    },
    YAYASAN: {
      unit_code: 'YAYASAN',
      unit_name: 'Kantor Pusat Yayasan',
      institution_title: 'YAYASAN PENDIDIKAN & PONDOK PESANTREN ISLAMI',
      sub_title: 'DIREKTORAT JENDERAL SEKRETARIAT TATA USAHA PUSAT',
      address: 'Jl. Utama Pesantren No. 01, Kebayoran Baru, Jakarta',
      contact_info: 'Telp: (021) 7200-1122 | Call Center: 0812-9988-7766',
      website: 'www.yayasan-pesantren.or.id',
      has_digital_stamp: true,
      stamp_text: 'SEKRETARIAT PUSAT YAYASAN',
      header_style: 'minimalist',
      accent_color: '#065f46'
    }
  });

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

  const handleSaveKop = () => {
    alert(`Pengaturan Kop Surat & Stempel Digital untuk unit ${activeConfig.unit_name} berhasil disimpan!`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-6 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 px-3 py-1 rounded-full border border-indigo-400/30 mb-2">
            <Sparkles className="h-3 w-3" /> Modul 2: Layout & Branding Surat
          </span>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Building2 className="h-6 w-6 text-indigo-400" />
            Builder Kop Surat & Stempel Digital Resmi
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Konfigurasi tata letak kop surat resmi, stempel digital watermark, dan logo resmi sesuai unit pendidikan masing-masing.
          </p>
        </div>

        <button
          onClick={handleSaveKop}
          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center gap-2 cursor-pointer shrink-0"
        >
          <CheckCircle2 className="h-4 w-4" />
          Simpan Konfigurasi Kop
        </button>
      </div>

      {/* Unit Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { code: 'SMP', label: 'Unit SMP Pesantren' },
          { code: 'SMA', label: 'Unit SMA Tahfidz' },
          { code: 'YAYASAN', label: 'Sekretariat Utama Yayasan' }
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
            Pengaturan Elemen Kop Surat
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

            {/* Header Style & Colors */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Gaya Garis Pembatas Kop</label>
                <select
                  value={activeConfig.header_style}
                  onChange={(e) => handleUpdateConfig('header_style', e.target.value as any)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 font-bold"
                >
                  <option value="classic">Klasik (Garis Ganda Tebal)</option>
                  <option value="modern">Modern (Aksen Gradien / Warna)</option>
                  <option value="minimalist">Minimalis (Garis Tipis Presisi)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Stempel Digital Resmi</label>
                <button
                  type="button"
                  onClick={() => handleUpdateConfig('has_digital_stamp', !activeConfig.has_digital_stamp)}
                  className={`w-full py-2 px-3 rounded-xl font-bold border flex items-center justify-center gap-2 transition ${
                    activeConfig.has_digital_stamp
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                      : 'bg-slate-100 border-slate-300 text-slate-500'
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  {activeConfig.has_digital_stamp ? 'Stempel Aktif' : 'Stempel Nonaktif'}
                </button>
              </div>
            </div>

            {activeConfig.has_digital_stamp && (
              <div>
                <label className="font-bold text-slate-700 block mb-1">Teks Lingkaran Stempel</label>
                <input
                  type="text"
                  value={activeConfig.stamp_text}
                  onChange={(e) => handleUpdateConfig('stamp_text', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white font-mono uppercase text-[11px]"
                />
              </div>
            )}

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
              Skala A4 100%
            </span>
          </div>

          <div className="bg-slate-100 p-6 rounded-xl border border-slate-200">
            <div className="bg-white border border-slate-300 shadow-lg p-6 rounded space-y-6 text-slate-900 font-sans">
              
              {/* Dynamic Kop Header */}
              <div className={`text-center space-y-1 pb-3 ${
                activeConfig.header_style === 'classic' 
                  ? 'border-b-4 border-double border-slate-900'
                  : activeConfig.header_style === 'modern'
                  ? 'border-b-4 border-indigo-900'
                  : 'border-b border-slate-400'
              }`}>
                <h2 className="text-base font-black tracking-tight uppercase text-slate-900">
                  {activeConfig.institution_title}
                </h2>
                <h3 className="text-xs font-bold text-indigo-900 uppercase">
                  {activeConfig.sub_title}
                </h3>
                <p className="text-[10px] text-slate-600 font-medium">
                  {activeConfig.address}
                </p>
                <p className="text-[9px] text-slate-500 font-mono">
                  {activeConfig.contact_info} • {activeConfig.website}
                </p>
              </div>

              {/* Sample Body text */}
              <div className="space-y-3 py-4 text-xs text-slate-700 leading-relaxed font-serif italic bg-slate-50/50 p-4 rounded border border-slate-150">
                <p>[Area Isi Surat Resmi Terintegrasi]</p>
                <p>Dengan surat ini, seluruh dokumen yang diterbitkan melalui Tata Usaha otomatis menyertakan identitas Kop Surat ini sesuai unit masing-masing.</p>
              </div>

              {/* Sample Stamp Watermark & Signature Area */}
              <div className="flex justify-between items-center pt-4">
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
                  <span className="text-[11px] font-bold block">Kepala Pengasuh / Sekolah</span>
                  <div className="font-extrabold underline text-slate-900">
                    Dr. H. Ahmad Musyaffa, M.Ag.
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
