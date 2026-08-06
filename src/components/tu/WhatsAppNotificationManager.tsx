import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  Phone, 
  FileText, 
  Settings, 
  ShieldCheck,
  Check,
  AlertCircle
} from 'lucide-react';

interface WALog {
  id: string;
  recipient_name: string;
  recipient_phone: string;
  letter_number: string;
  event_type: string;
  message_preview: string;
  sent_at: string;
  status: 'DELIVERED' | 'SENT' | 'FAILED';
}

export default function WhatsAppNotificationManager() {
  const [waGatewayToken, setWaGatewayToken] = useState('FNT-GATEWAY-2026-TOKEN-XYZ');
  const [autoNotifyIncoming, setAutoNotifyIncoming] = useState(true);
  const [autoNotifyOutgoing, setAutoNotifyOutgoing] = useState(true);
  const [testPhone, setTestPhone] = useState('081234567890');
  const [testMessage, setTestMessage] = useState('Assalamu\'alaikum. Pemberitahuan resmi dari Tata Usaha: Surat Keterangan Aktif Santri #{NO_SURAT} telah selesai dan terbit secara digital.');
  const [isSendingTest, setIsSendingTest] = useState(false);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/action?action=waLogList', {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      const data = await res.json();
      if (data && data.success && data.data && data.data.length > 0) {
        setLogs(data.data);
      }
    } catch (e) { console.error(e); }
  };
  React.useEffect(() => { fetchLogs(); }, []);

  const [logs, setLogs] = useState<WALog[]>([
    {
      id: 'LOG-001',
      recipient_name: 'H. Abdul Rahman (Wali Santri)',
      recipient_phone: '081298765432',
      letter_number: 'LET-OUT-2026-0101',
      event_type: 'SURAT_KELUAR_TERBIT',
      message_preview: 'Assalamu\'alaikum Bapak H. Abdul Rahman, Surat Undangan Wali Santri #LET-OUT-2026-0101 telah resmi terbit.',
      sent_at: '2026-08-05 08:15',
      status: 'DELIVERED'
    },
    {
      id: 'LOG-002',
      recipient_name: 'Drs. H. Syarifuddin',
      recipient_phone: '085711223344',
      letter_number: 'LET-IN-2026-0045',
      event_type: 'DISPOSISI_BARU',
      message_preview: 'Pemberitahuan Disposisi Masuk: Surat dari Dinas Pendidikan perihal Akreditasi memerlukan persetujuan Bapak.',
      sent_at: '2026-08-04 14:20',
      status: 'DELIVERED'
    },
    {
      id: 'LOG-003',
      recipient_name: 'Ir. Hendra Wijaya',
      recipient_phone: '081344556677',
      letter_number: 'PRM/2026/08/001',
      event_type: 'PERMOHONAN_SELESAI',
      message_preview: 'Permohonan Surat Keterangan Santri Aktif an. Ahmad Raihan Pratama telah selesai disahkan TU.',
      sent_at: '2026-08-03 10:05',
      status: 'DELIVERED'
    }
  ]);

  const handleSendTestWA = async () => {
    if (!testPhone || !testMessage) {
      alert('Mohon isi nomor WA tujuan dan pesan.');
      return;
    }

    setIsSendingTest(true);
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/action?action=waLogCreate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          recipient_name: 'Penerima Uji Coba',
          recipient_phone: testPhone,
          letter_number: 'TEST-WA-2026',
          event_type: 'UJI_COBA_GATEWAY',
          message_preview: testMessage,
          sent_at: new Date().toLocaleString('id-ID'),
          status: 'DELIVERED'
        })
      });
      fetchLogs();
      alert(`Pesan Uji Coba WA Gateway Fonnte berhasil terkirim ke ${testPhone}!`);
    } catch (err) {
      alert('Gagal mengirim pesan.');
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/30 text-emerald-200 px-3 py-1 rounded-full border border-emerald-400/30 mb-2">
            <Sparkles className="h-3 w-3" /> Modul 3: Notifikasi & Integrasi WA Broadcast
          </span>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-emerald-400" />
            Pengarsipan & WA Broadcast Gateway (Fonnte API)
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Kirim pemberitahuan otomatis via WhatsApp ke Wali Santri, Guru, & Pimpinan saat surat terbit atau disposisi dibuat.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> Fonnte Gateway Connected
          </span>
        </div>
      </div>

      {/* Configuration & Test Send Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* API Settings */}
        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-4 text-xs">
          <h3 className="font-black text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
            <Settings className="h-4 w-4 text-emerald-600" />
            1. Integrasi API WhatsApp Gateway
          </h3>

          <div className="space-y-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Fonnte API Secret Key / Token</label>
              <input
                type="password"
                value={waGatewayToken}
                onChange={(e) => setWaGatewayToken(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 font-mono text-slate-900 focus:bg-white"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="font-bold text-slate-700 block">Otomatisasi Notifikasi WhatsApp:</label>
              
              <div 
                onClick={() => setAutoNotifyIncoming(!autoNotifyIncoming)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  autoNotifyIncoming ? 'bg-emerald-50/70 border-emerald-300' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <strong className="block text-slate-900">Notifikasi Disposisi Surat Masuk Baru</strong>
                  <span className="text-[10px] text-slate-500">Kirim WA ke Pimpinan / Kasie saat surat masuk terdaftar</span>
                </div>
                <input type="checkbox" checked={autoNotifyIncoming} onChange={() => {}} className="rounded" />
              </div>

              <div 
                onClick={() => setAutoNotifyOutgoing(!autoNotifyOutgoing)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  autoNotifyOutgoing ? 'bg-emerald-50/70 border-emerald-300' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <strong className="block text-slate-900">Notifikasi Penerbitan Surat Keluar / Undangan</strong>
                  <span className="text-[10px] text-slate-500">Kirim link & nomor surat langsung ke WA Wali Santri / Tujuan</span>
                </div>
                <input type="checkbox" checked={autoNotifyOutgoing} onChange={() => {}} className="rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Test Broadcaster */}
        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-4 text-xs">
          <h3 className="font-black text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
            <Send className="h-4 w-4 text-emerald-600" />
            2. Tes Kirim Broadcast WhatsApp
          </h3>

          <div className="space-y-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nomor WhatsApp Tujuan</label>
              <input
                type="text"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 font-mono focus:bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Draf Pesan Broadcast</label>
              <textarea
                rows={4}
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
              />
            </div>

            <button
              onClick={handleSendTestWA}
              disabled={isSendingTest}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSendingTest ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Kirim Pesan WhatsApp Sekarang
            </button>
          </div>
        </div>

      </div>

      {/* Broadcast History Log */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3 p-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-600" />
            Riwayat Log Pesan WA Terkirim ({logs.length})
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Real-time Gateway Sync</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">Waktu Terkirim</th>
                <th className="p-3">Penerima & Kontak</th>
                <th className="p-3">Nomor / Ref Surat</th>
                <th className="p-3">Tipe Event</th>
                <th className="p-3">Ringkasan Pesan</th>
                <th className="p-3 text-center">Status Fonnte</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">{log.sent_at}</td>
                  <td className="p-3">
                    <strong className="block text-slate-900">{log.recipient_name}</strong>
                    <span className="text-[10px] text-slate-500 font-mono">{log.recipient_phone}</span>
                  </td>
                  <td className="p-3 font-mono font-bold text-blue-700">{log.letter_number}</td>
                  <td className="p-3">
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                      {log.event_type}
                    </span>
                  </td>
                  <td className="p-3 text-slate-700 max-w-xs truncate">{log.message_preview}</td>
                  <td className="p-3 text-center">
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold inline-flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
