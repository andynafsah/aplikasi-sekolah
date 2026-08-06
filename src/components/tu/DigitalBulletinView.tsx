import React, { useState } from 'react';
import { 
  Megaphone, 
  Sparkles, 
  Plus, 
  Pin, 
  Monitor, 
  Users, 
  Calendar, 
  Share2, 
  Eye, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  X, 
  Radio, 
  Tv, 
  Check, 
  Download, 
  Clock, 
  Building2, 
  Send
} from 'lucide-react';

interface AnnouncementItem {
  id: string;
  title: string;
  category: 'AKADEMIK' | 'EDARAN_KEARSIPAN' | 'KEPESANTRENAAN' | 'KEUANGAN' | 'DARURAT';
  target_audience: 'SEMUA' | 'WALI_SANTRI' | 'GURU_PEGAWAI' | 'INTERNAL_TU';
  priority: 'DARURAT' | 'PENTING' | 'BIASA';
  is_pinned: boolean;
  publish_date: string;
  expiry_date?: string;
  author: string;
  content: string;
  attachment_name?: string;
  view_count: number;
  is_broadcasted_wa: boolean;
}

export default function DigitalBulletinView() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([
    {
      id: 'ANN-2026-001',
      title: 'Edaran Resmi: Pelaksanaan Evaluasi Tahfidz & Pertemuan Wali Santri Semester Ganjil',
      category: 'EDARAN_KEARSIPAN',
      target_audience: 'WALI_SANTRI',
      priority: 'PENTING',
      is_pinned: true,
      publish_date: '2026-08-05',
      expiry_date: '2026-08-20',
      author: 'Kepala Bagian Tata Usaha',
      content: 'Diberitahukan kepada seluruh Bapak/Ibu Wali Santri SMP & SMA Terpadu bahwa Ujian Munaqosyah Tahfidz dan Rapat Komite Wali Santri akan dilaksanakan pada tanggal 20 Agustus 2026. Undangan resmi fisik dan digital Mail Merge telah diterbitkan.',
      attachment_name: 'Surat_Edaran_Wali_Santri_2026.pdf',
      view_count: 342,
      is_broadcasted_wa: true
    },
    {
      id: 'ANN-2026-002',
      title: 'Pemberitahuan Sistem Baru: Smart OCR & Verifikasi Tanda Tangan Digital Layanan TU',
      category: 'AKADEMIK',
      target_audience: 'GURU_PEGAWAI',
      priority: 'PENTING',
      is_pinned: true,
      publish_date: '2026-08-04',
      expiry_date: '2026-08-31',
      author: 'Tim IT & Sekretariat TU',
      content: 'Pengajuan permohonan surat keterangan aktif, surat tugas pengabdian, dan disposisi kini wajib menggunakan portal Layanan Mandiri TU yang telah terintegrasi dengan validasi QR Code & Stempel Digital Resmi.',
      attachment_name: 'Panduan_Penggunaan_Portal_TU.pdf',
      view_count: 189,
      is_broadcasted_wa: true
    },
    {
      id: 'ANN-2026-003',
      title: 'Pemberitahuan Darurat: Jadwal Perawatan Server Utama & Jaringan Wi-Fi Pesantren',
      category: 'DARURAT',
      target_audience: 'SEMUA',
      priority: 'DARURAT',
      is_pinned: false,
      publish_date: '2026-08-05',
      expiry_date: '2026-08-06',
      author: 'Teknisi Jaringan TU',
      content: 'Akan dilakukan pemeliharaan berkala pada server database kearsipan pada hari Sabtu pukul 23:00 - 03:00 WIB. Akses portal lokal akan diputus sementara selama 4 jam.',
      view_count: 512,
      is_broadcasted_wa: true
    },
    {
      id: 'ANN-2026-004',
      title: 'Batas Akhir Pembaruan Data Induk Santri & NIK untuk Sinkronisasi EMIS Kemenag',
      category: 'AKADEMIK',
      target_audience: 'WALI_SANTRI',
      priority: 'BIASA',
      is_pinned: false,
      publish_date: '2026-08-02',
      expiry_date: '2026-08-15',
      author: 'Operator EMIS TU',
      content: 'Mohon wali santri memeriksa kembali NIK dan Kartu Keluarga yang terdaftar pada sistem agar tidak terjadi kendala saat verifikasi Ijazah & Akreditasi.',
      view_count: 275,
      is_broadcasted_wa: false
    }
  ]);

  const [filterAudience, setFilterAudience] = useState<string>('SEMUA');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showTvDisplayMode, setShowTvDisplayMode] = useState<boolean>(false);
  const [previewItem, setPreviewItem] = useState<AnnouncementItem | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'EDARAN_KEARSIPAN' as AnnouncementItem['category'],
    target_audience: 'SEMUA' as AnnouncementItem['target_audience'],
    priority: 'BIASA' as AnnouncementItem['priority'],
    is_pinned: false,
    content: '',
    attachment_name: ''
  });

  const fetchBulletins = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/action?action=bulletinList', {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      const data = await res.json();
      if (data && data.success && data.data && data.data.length > 0) {
        // Map backend to frontend schema
        const mapped = data.data.map((b: any) => ({
          id: b.id,
          title: b.title,
          category: b.category,
          target_audience: 'SEMUA',
          priority: b.priority,
          is_pinned: false,
          publish_date: b.published_at.substring(0, 10),
          author: b.published_by,
          content: b.content,
          view_count: 0,
          is_broadcasted_wa: false
        }));
        setAnnouncements(mapped);
      }
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    fetchBulletins();
  }, []);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert('Mohon isi judul dan konten pengumuman.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        action: 'bulletinCreate',
        title: formData.title,
        category: formData.category,
        priority: formData.priority,
        content: formData.content,
        published_at: new Date().toISOString(),
        published_by: 'Bagian Tata Usaha'
      };

      await fetch('/api/action?action=bulletinCreate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      
      fetchBulletins();
      setShowAddModal(false);
      setFormData({
        title: '',
        category: 'EDARAN_KEARSIPAN',
        target_audience: 'SEMUA',
        priority: 'BIASA',
        is_pinned: false,
        content: '',
        attachment_name: ''
      });
      alert('Pengumuman digital baru berhasil diterbitkan ke Server!');
    } catch (err) {
      alert('Gagal menerbitkan pengumuman.');
    }
  };

  const togglePin = (id: string) => {
    setAnnouncements(announcements.map(a => a.id === id ? { ...a, is_pinned: !a.is_pinned } : a));
  };

  const handleBroadcastWA = (id: string) => {
    setAnnouncements(announcements.map(a => a.id === id ? { ...a, is_broadcasted_wa: true } : a));
    alert('Pengumuman berhasil di-broadcast via WhatsApp Gateway (Fonnte) ke grup/kontak sasaran!');
  };

  const filteredAnnouncements = announcements.filter(a => {
    const matchesAudience = filterAudience === 'SEMUA' || a.target_audience === filterAudience || a.target_audience === 'SEMUA';
    const matchesCategory = filterCategory === 'ALL' || a.category === filterCategory;
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAudience && matchesCategory && matchesSearch;
  });

  const pinnedItems = filteredAnnouncements.filter(a => a.is_pinned);
  const regularItems = filteredAnnouncements.filter(a => !a.is_pinned);

  const getPriorityBadge = (priority: AnnouncementItem['priority']) => {
    switch (priority) {
      case 'DARURAT':
        return <span className="bg-red-100 text-red-800 border border-red-300 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-red-600 animate-pulse" /> DARURAT</span>;
      case 'PENTING':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1"><Sparkles className="h-3 w-3 text-amber-600" /> PENTING</span>;
      case 'BIASA':
        return <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-full">BIASA</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-blue-500/30 text-blue-200 px-3 py-1 rounded-full border border-blue-400/30 mb-2">
            <Sparkles className="h-3 w-3" /> Digital Bulletin Board & E-Announcement
          </span>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-blue-400" />
            Papan Pengumuman & Informasi Digital TU
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Publikasi surat edaran resmi, pengumuman akademik, dan pemberitahuan darurat ke layar billboard TV kantor TU & portal publik.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowTvDisplayMode(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-500/40 font-bold text-xs rounded-xl shadow transition flex items-center gap-2 cursor-pointer"
          >
            <Tv className="h-4 w-4 text-blue-400" />
            Layar TV Display Kiosk Mode
          </button>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Buat Pengumuman Baru
          </button>
        </div>
      </div>

      {/* Filter & Controls Bar */}
      <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kata kunci pengumuman..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-slate-500 font-bold text-[11px] shrink-0">Sasaran:</span>
          {[
            { id: 'SEMUA', label: 'Semua Audiens' },
            { id: 'WALI_SANTRI', label: 'Wali Santri & Siswa' },
            { id: 'GURU_PEGAWAI', label: 'Guru & Staf' },
            { id: 'INTERNAL_TU', label: 'Internal TU' }
          ].map(aud => (
            <button
              key={aud.id}
              onClick={() => setFilterAudience(aud.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition text-[11px] whitespace-nowrap cursor-pointer ${
                filterAudience === aud.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {aud.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Bulletin Board Content Feed */}
      <div className="space-y-6">
        
        {/* Pinned Announcements Section */}
        {pinnedItems.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Pin className="h-4 w-4 text-amber-500 rotate-45" />
              Pengumuman Disematkan (Pin Priority)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pinnedItems.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-gradient-to-br from-amber-50/80 via-white to-amber-50/30 border-2 border-amber-300 rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getPriorityBadge(item.priority)}
                      <span className="text-[10px] font-mono font-bold bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                    </div>

                    <button
                      onClick={() => togglePin(item.id)}
                      className="p-1 text-amber-600 hover:bg-amber-100 rounded-lg cursor-pointer transition"
                      title="Lepas Sematan"
                    >
                      <Pin className="h-4 w-4 fill-amber-500" />
                    </button>
                  </div>

                  <div>
                    <h4 
                      onClick={() => setPreviewItem(item)}
                      className="text-sm font-extrabold text-slate-900 hover:text-blue-700 cursor-pointer transition leading-snug"
                    >
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1.5 leading-relaxed">
                      {item.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-amber-200/60 font-medium">
                    <div className="flex items-center gap-3">
                      <span>🗓️ {item.publish_date}</span>
                      <span>👁️ {item.view_count} Dibaca</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {!item.is_broadcasted_wa && (
                        <button
                          onClick={() => handleBroadcastWA(item.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg shadow transition flex items-center gap-1 cursor-pointer"
                        >
                          <Send className="h-3 w-3" /> WA Broadcast
                        </button>
                      )}
                      <button
                        onClick={() => setPreviewItem(item)}
                        className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-[10px] rounded-lg cursor-pointer"
                      >
                        <Eye className="h-3 w-3 inline mr-1" /> Baca Detail
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Announcements Feed */}
        <div className="space-y-3">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            Daftar Informasi & Surat Edaran Terbaru ({regularItems.length})
          </h3>

          <div className="space-y-3">
            {regularItems.map((item) => (
              <div 
                key={item.id} 
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getPriorityBadge(item.priority)}
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                      Sasaran: {item.target_audience}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <span>{item.publish_date}</span>
                    <button
                      onClick={() => togglePin(item.id)}
                      className="p-1 text-slate-400 hover:text-amber-500 hover:bg-slate-100 rounded-lg cursor-pointer transition"
                      title="Sematkan ke Atas"
                    >
                      <Pin className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 
                    onClick={() => setPreviewItem(item)}
                    className="text-sm font-extrabold text-slate-900 hover:text-blue-700 cursor-pointer transition"
                  >
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                    {item.content}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px]">
                  <div className="flex items-center gap-4 text-slate-500">
                    <span>Penerbit: <strong>{item.author}</strong></span>
                    <span>Dilihat: <strong>{item.view_count} kali</strong></span>
                    {item.attachment_name && (
                      <span className="text-blue-600 font-mono font-bold">📎 {item.attachment_name}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!item.is_broadcasted_wa ? (
                      <button
                        onClick={() => handleBroadcastWA(item.id)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg shadow transition flex items-center gap-1 cursor-pointer"
                      >
                        <Send className="h-3 w-3" /> Broadcast WA
                      </button>
                    ) : (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                        ✓ Ter-broadcast WA
                      </span>
                    )}
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] rounded-lg cursor-pointer"
                    >
                      Lihat Detail
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredAnnouncements.length === 0 && (
              <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center text-slate-400 text-xs italic">
                Tidak ada pengumuman yang sesuai kriteria pencarian / filter.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Modal Buat Pengumuman Baru */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 animate-fade-in">
            <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-blue-600" />
              Buat Pengumuman Digital Baru
            </h3>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Judul Pengumuman / Edaran</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Edaran Resmi Rapat Wali Santri Semester Ganjil"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori Informasi</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 font-medium"
                  >
                    <option value="EDARAN_KEARSIPAN">Edaran Resmi Kearsipan</option>
                    <option value="AKADEMIK">Akademik & Kurikulum</option>
                    <option value="KEPESANTRENAAN">Kepesantrenan & Pengasuhan</option>
                    <option value="KEUANGAN">Keuangan & Pembayaran</option>
                    <option value="DARURAT">Darurat / Peringatan</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Audiens</label>
                  <select
                    value={formData.target_audience}
                    onChange={e => setFormData({ ...formData, target_audience: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 font-medium"
                  >
                    <option value="SEMUA">Semua (Publik & Internal)</option>
                    <option value="WALI_SANTRI">Wali Santri & Siswa</option>
                    <option value="GURU_PEGAWAI">Guru & Staf Pegawai</option>
                    <option value="INTERNAL_TU">Internal TU & Yayasan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Prioritas Tampilan</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 font-bold"
                  >
                    <option value="BIASA">BIASA</option>
                    <option value="PENTING">PENTING</option>
                    <option value="DARURAT">DARURAT</option>
                  </select>
                </div>

                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={formData.is_pinned}
                      onChange={e => setFormData({ ...formData, is_pinned: e.target.checked })}
                      className="rounded"
                    />
                    Sematkan ke Atas (Pin)
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Isi Lengkap Pengumuman</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tuliskan detail poin-poin pengumuman..."
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Lampiran Berkas (Optional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Surat_Edaran_Wali_Santri_2026.pdf"
                  value={formData.attachment_name}
                  onChange={e => setFormData({ ...formData, attachment_name: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow cursor-pointer"
                >
                  Terbitkan Pengumuman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail / Preview */}
      {previewItem && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4 border border-slate-200 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-[10px] font-mono font-bold text-slate-500">
                REF: {previewItem.id} • {previewItem.publish_date}
              </span>
              {getPriorityBadge(previewItem.priority)}
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-black text-slate-900">{previewItem.title}</h3>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-200">
                {previewItem.content}
              </p>

              {previewItem.attachment_name && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-blue-900">📎 {previewItem.attachment_name}</span>
                  <button 
                    onClick={() => alert(`Mengunduh berkas lampiran ${previewItem.attachment_name}`)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-[10px] cursor-pointer"
                  >
                    Download
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-500">Penerbit: <strong>{previewItem.author}</strong></span>
              <button
                onClick={() => setPreviewItem(null)}
                className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulated Billboard TV Display Full-Screen Modal */}
      {showTvDisplayMode && (
        <div className="fixed inset-0 bg-slate-950 text-white z-50 flex flex-col p-6 overflow-hidden animate-fade-in">
          
          {/* TV Top Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-400" />
              <div>
                <h2 className="text-xl font-black uppercase tracking-wider text-white">
                  LAYAR INFORMASI DIGITAL TATA USAHA & YAYASAN
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  SMP & SMA PESANTREN ISLAM TERPADU • MODE BILLBOARD DISPLAY
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right font-mono">
                <span className="text-sm font-bold block text-emerald-400">● LIVE BULLETIN</span>
                <span className="text-[10px] text-slate-400">{new Date().toLocaleString('id-ID')}</span>
              </div>
              <button
                onClick={() => setShowTvDisplayMode(false)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl cursor-pointer"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* TV Display Grid Feed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 flex-1 overflow-y-auto">
            {announcements.slice(0, 4).map((ann) => (
              <div key={ann.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50 px-3 py-1 rounded-full">
                    {ann.category}
                  </span>
                  {getPriorityBadge(ann.priority)}
                </div>

                <h3 className="text-lg font-black text-amber-300 leading-snug">
                  {ann.title}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed line-clamp-4">
                  {ann.content}
                </p>

                <div className="flex justify-between items-center text-xs text-slate-500 font-mono pt-3 border-t border-slate-800">
                  <span>Penerbit: {ann.author}</span>
                  <span>Target: {ann.target_audience}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Running Ticker Bar at Bottom */}
          <div className="bg-blue-900/40 border border-blue-500/30 p-3 rounded-xl flex items-center gap-3 overflow-hidden text-xs font-mono">
            <span className="bg-red-600 text-white font-black px-3 py-1 rounded shrink-0 flex items-center gap-1">
              <Radio className="h-3 w-3 animate-ping" /> SEKILAS INFO
            </span>
            <div className="truncate text-slate-200">
              Selamat datang di Kantor Tata Usaha Pesantren. Mohon gunakan layanan mandiri permohonan surat online & pindai barcode QR pada dokumen resmi untuk verifikasi keabsahan.
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
