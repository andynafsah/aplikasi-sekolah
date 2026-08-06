import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  Plus, 
  Clock, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  MapPin, 
  QrCode, 
  Phone, 
  Building,
  Check,
  FileText
} from 'lucide-react';

interface GuestRecord {
  id: string;
  guest_name: string;
  institution: string;
  phone: string;
  identity_number: string;
  purpose: string;
  host_person: string;
  check_in_time: string;
  check_out_time?: string;
  status: 'CHECKED_IN' | 'CHECKED_OUT';
}

interface MeetingAgenda {
  id: string;
  title: string;
  organizer: string;
  room: string;
  date: string;
  time: string;
  attendees_count: number;
}

export default function GuestBookAndAgendaView() {
  const fetchGuests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/action?action=guestList', {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      const data = await res.json();
      if (data && data.success && data.data && data.data.length > 0) {
        setGuests(data.data);
      }
    } catch (e) { console.error(e); }
  };
  const fetchMeetings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/action?action=meetingList', {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      const data = await res.json();
      if (data && data.success && data.data && data.data.length > 0) {
        setMeetings(data.data);
      }
    } catch (e) { console.error(e); }
  };
  React.useEffect(() => {
    fetchGuests();
    fetchMeetings();
  }, []);

  const [guests, setGuests] = useState<GuestRecord[]>([
    {
      id: 'GST-001',
      guest_name: 'Drs. H. Mulyadi, M.Pd.',
      institution: 'Pengawas Kantor Kemenag Kota',
      phone: '081299887711',
      identity_number: '3201998877660001',
      purpose: 'Monitoring Implementasi Kurikulum Merdeka & Tahfidz',
      host_person: 'Dr. H. Ahmad Musyaffa, M.Ag. (Kepala Sekolah)',
      check_in_time: '2026-08-05 08:30',
      status: 'CHECKED_IN'
    },
    {
      id: 'GST-002',
      guest_name: 'Ir. Hendra Sugianto',
      institution: 'PT Telkom Indonesia (Mitra Wi-Fi Pesantren)',
      phone: '085711223399',
      identity_number: '3201112233440002',
      purpose: 'Perawatan Infrastruktur Jaringan & Server TU',
      host_person: 'Kasie TU & IT Support',
      check_in_time: '2026-08-05 09:15',
      check_out_time: '2026-08-05 10:45',
      status: 'CHECKED_OUT'
    }
  ]);

  const [meetings, setMeetings] = useState<MeetingAgenda[]>([
    {
      id: 'MTG-001',
      title: 'Rapat Koordinasi Persiapan Evaluasi Semester',
      organizer: 'Sekretariat TU Utama',
      room: 'Ruang Rapat VIP Gedung Yayasan',
      date: '2026-08-05',
      time: '13:00 - 15:00 WIB',
      attendees_count: 12
    },
    {
      id: 'MTG-002',
      title: 'Audiensi Mitra Beasiswa Pemda & Wali Santri',
      organizer: 'Kepala Sekolah & Pengasuh',
      room: 'Aula Utama Al-Ghazali',
      date: '2026-08-06',
      time: '09:00 - 11:30 WIB',
      attendees_count: 45
    }
  ]);

  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    guest_name: '',
    institution: '',
    phone: '',
    identity_number: '',
    purpose: '',
    host_person: ''
  });

  const handleRegisterGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.guest_name || !formData.purpose) {
      alert('Mohon lengkapi nama tamu dan tujuan kunjungan.');
      return;
    }

    const newGuest: GuestRecord = {
      id: `GST-00${guests.length + 1}`,
      guest_name: formData.guest_name,
      institution: formData.institution || 'Tamu Perorangan',
      phone: formData.phone || '-',
      identity_number: formData.identity_number || '-',
      purpose: formData.purpose,
      host_person: formData.host_person || 'Bagian Tata Usaha',
      check_in_time: new Date().toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }),
      status: 'CHECKED_IN'
    };

    setGuests([newGuest, ...guests]);
    setShowAddGuestModal(false);
    setFormData({ guest_name: '', institution: '', phone: '', identity_number: '', purpose: '', host_person: '' });
    alert('Tamu berhasil dicatat masuk (Check-In) ke Buku Tamu Digital!');
  };

  const handleCheckOut = (guestId: string) => {
    setGuests(guests.map(g => {
      if (g.id === guestId) {
        return {
          ...g,
          status: 'CHECKED_OUT',
          check_out_time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        };
      }
      return g;
    }));
  };

  const filteredGuests = guests.filter(g => 
    g.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.purpose.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-teal-950 text-white p-6 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-teal-500/30 text-teal-200 px-3 py-1 rounded-full border border-teal-400/30 mb-2">
            <Sparkles className="h-3 w-3" /> Modul 5: Digital Front Office
          </span>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-teal-400" />
            Buku Tamu Digital & Agenda Pertemuan TU
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Pencatatan kehadiran tamu instansi / wali, verifikasi identitas, dan penjadwalan penggunaan ruang rapat TU.
          </p>
        </div>

        <button
          onClick={() => setShowAddGuestModal(true)}
          className="px-4 py-2 bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-xs rounded-xl shadow transition flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          Registrasi Tamu Masuk
        </button>
      </div>

      {/* Grid Overview: Agenda Calendar & Guest Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Scheduled Meetings */}
        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <Calendar className="h-4 w-4 text-indigo-600" />
            Agenda Pertemuan & Rapat TU
          </h3>

          <div className="space-y-3">
            {meetings.map((m) => (
              <div key={m.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {m.date} • {m.time}
                </span>
                <strong className="block text-slate-900 text-xs font-extrabold">{m.title}</strong>
                <div className="text-[10px] text-slate-500 space-y-0.5">
                  <p>📍 {m.room}</p>
                  <p>👥 Penyelenggara: {m.organizer} ({m.attendees_count} Peserta)</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Columns: Digital Guestbook Log */}
        <div className="lg:col-span-2 bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-black text-slate-900 text-sm">Log Kehadiran Tamu Hari Ini</h3>
              <p className="text-[11px] text-slate-500">Daftar tamu fisik yang berada di lingkungan pesantren / kantor TU.</p>
            </div>

            <div className="relative w-full sm:w-60">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama tamu / instansi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Nama Tamu & Instansi</th>
                  <th className="p-3">Tujuan / Keperluan</th>
                  <th className="p-3">Diterima Oleh</th>
                  <th className="p-3">Jam Check-In</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGuests.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50 transition">
                    <td className="p-3">
                      <strong className="block text-slate-900">{g.guest_name}</strong>
                      <span className="text-[10px] text-slate-500">{g.institution} • {g.phone}</span>
                    </td>
                    <td className="p-3 text-slate-700 max-w-xs">{g.purpose}</td>
                    <td className="p-3 text-slate-600 font-medium">{g.host_person}</td>
                    <td className="p-3 font-mono text-slate-600 text-[11px]">{g.check_in_time}</td>
                    <td className="p-3 text-center">
                      {g.status === 'CHECKED_IN' ? (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                          Sedang Berkunjung
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                          Selesai Check-Out
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {g.status === 'CHECKED_IN' && (
                        <button
                          onClick={() => handleCheckOut(g.id)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] rounded-lg cursor-pointer"
                        >
                          Check-Out
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Modal Registrasi Tamu */}
      {showAddGuestModal && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 animate-fade-in">
            <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-teal-600" />
              Formulir Buku Tamu Digital
            </h3>

            <form onSubmit={handleRegisterGuest} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Lengkap Tamu</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Drs. H. Mulyadi, M.Pd."
                  value={formData.guest_name}
                  onChange={e => setFormData({ ...formData, guest_name: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Instansi / Asal</label>
                  <input
                    type="text"
                    placeholder="Contoh: Kemenag / Dinas Pendidikan"
                    value={formData.institution}
                    onChange={e => setFormData({ ...formData, institution: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">No. HP / WA</label>
                  <input
                    type="text"
                    placeholder="Contoh: 081234567890"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Pejabat / Staf yang Ditemui</label>
                <input
                  type="text"
                  placeholder="Contoh: Dr. H. Ahmad Musyaffa, M.Ag. (Kepala Sekolah)"
                  value={formData.host_person}
                  onChange={e => setFormData({ ...formData, host_person: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tujuan / Keperluan Kunjungan</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Jelaskan maksud dan tujuan kunjungan..."
                  value={formData.purpose}
                  onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddGuestModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow cursor-pointer"
                >
                  Simpan & Check-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
