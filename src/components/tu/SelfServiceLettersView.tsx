import React, { useState } from 'react';
import { 
  FileCheck, 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search, 
  User, 
  Send, 
  Download, 
  FileText, 
  Sparkles, 
  Eye, 
  Upload,
  Layers,
  Check
} from 'lucide-react';

interface LetterRequest {
  id: string;
  request_number: string;
  applicant_name: string;
  applicant_role: 'SISWA' | 'WALI_SANTRI' | 'GURU' | 'STAF';
  applicant_identifier: string; // NIS or NIP
  letter_type: string;
  purpose: string;
  unit: string;
  status: 'SUBMITTED' | 'PROCESSING_TU' | 'APPROVED_HEAD' | 'COMPLETED' | 'REJECTED';
  request_date: string;
  completion_date?: string;
  notes?: string;
}

export default function SelfServiceLettersView() {
  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/action?action=requestList', {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      const data = await res.json();
      if (data && data.success && data.data && data.data.length > 0) {
        setRequests(data.data);
      }
    } catch (e) { console.error(e); }
  };
  React.useEffect(() => { fetchRequests(); }, []);

  const [requests, setRequests] = useState<LetterRequest[]>([
    {
      id: 'REQ-001',
      request_number: 'PRM/2026/08/001',
      applicant_name: 'Muhammad Ahmad Syahputra',
      applicant_role: 'SISWA',
      applicant_identifier: 'NIS2026001',
      letter_type: 'Surat Keterangan Santri Aktif Mukim',
      purpose: 'Persyaratan Beasiswa Tahfidz Pemda',
      unit: 'SMP Pesantren',
      status: 'APPROVED_HEAD',
      request_date: '2026-08-01',
      notes: 'Dokumen telah ditandatangani Kepala Pengasuh secara digital'
    },
    {
      id: 'REQ-002',
      request_number: 'PRM/2026/08/002',
      applicant_name: 'Ust. H. Abdullah Faqih, M.Pd.',
      applicant_role: 'GURU',
      applicant_identifier: 'NIP19850101',
      letter_type: 'Surat Tugas Penelitian & Pengabdian',
      purpose: 'Pengajuan Sertifikasi Dosen / Pendidik',
      unit: 'SMA Tahfidz',
      status: 'PROCESSING_TU',
      request_date: '2026-08-03'
    },
    {
      id: 'REQ-003',
      request_number: 'PRM/2026/08/003',
      applicant_name: 'Drs. H. Syarifuddin (Wali Fatimah)',
      applicant_role: 'WALI_SANTRI',
      applicant_identifier: 'NIS2026002',
      letter_type: 'Surat Permohonan Cuti Berobat Santri',
      purpose: 'Izin Perawatan Kesehatan di Rumah Sakit',
      unit: 'SMP Pesantren',
      status: 'SUBMITTED',
      request_date: '2026-08-04'
    }
  ]);

  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [previewRequest, setPreviewRequest] = useState<LetterRequest | null>(null);

  const [formData, setFormData] = useState({
    applicant_name: '',
    applicant_role: 'SISWA' as 'SISWA' | 'WALI_SANTRI' | 'GURU' | 'STAF',
    applicant_identifier: '',
    letter_type: 'Surat Keterangan Santri Aktif Mukim',
    purpose: '',
    unit: 'SMP Pesantren'
  });

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.applicant_name || !formData.purpose) {
      alert('Mohon lengkapi nama pemohon dan tujuan permohonan.');
      return;
    }

    const newReq: LetterRequest = {
      id: `REQ-00${requests.length + 1}`,
      request_number: `PRM/2026/08/00${requests.length + 1}`,
      applicant_name: formData.applicant_name,
      applicant_role: formData.applicant_role,
      applicant_identifier: formData.applicant_identifier || 'NIS2026999',
      letter_type: formData.letter_type,
      purpose: formData.purpose,
      unit: formData.unit,
      status: 'SUBMITTED',
      request_date: new Date().toISOString().substring(0, 10)
    };

    setRequests([newReq, ...requests]);
    setShowNewRequestModal(false);
    setFormData({
      applicant_name: '',
      applicant_role: 'SISWA',
      applicant_identifier: '',
      letter_type: 'Surat Keterangan Santri Aktif Mukim',
      purpose: '',
      unit: 'SMP Pesantren'
    });
    alert('Permohonan surat berhasil dikirim! Petugas TU akan segera memverifikasi.');
  };

  const handleUpdateStatus = (id: string, newStatus: LetterRequest['status']) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const filteredRequests = requests.filter(r => {
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    const matchesSearch = r.applicant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.letter_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.request_number.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: LetterRequest['status']) => {
    switch (status) {
      case 'SUBMITTED':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-max"><Clock className="h-3 w-3" /> Diajukan Pemohon</span>;
      case 'PROCESSING_TU':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-max"><Sparkles className="h-3 w-3" /> Diproses Verifikasi TU</span>;
      case 'APPROVED_HEAD':
        return <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-max"><FileCheck className="h-3 w-3" /> Disetujui Pimpinan</span>;
      case 'COMPLETED':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-max"><CheckCircle2 className="h-3 w-3" /> Selesai & Terbit</span>;
      case 'REJECTED':
        return <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-max"><XCircle className="h-3 w-3" /> Ditolak / Dibatalkan</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/30 text-emerald-200 px-3 py-1 rounded-full border border-emerald-400/30 mb-2">
            <Sparkles className="h-3 w-3" /> Modul 1: Portal Layanan Mandiri
          </span>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <FileCheck className="h-6 w-6 text-emerald-400" />
            Layanan Permohonan Surat Online
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Permohonan surat keterangan mandiri oleh Siswa, Wali Santri, & Pegawai dengan alur verifikasi digital TU otomatis.
          </p>
        </div>

        <button
          onClick={() => setShowNewRequestModal(true)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow transition flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          Buat Permohonan Baru
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari pemohon, NIS/NIP, jenis surat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-slate-500 font-bold text-[11px] shrink-0">Filter Status:</span>
          {['ALL', 'SUBMITTED', 'PROCESSING_TU', 'APPROVED_HEAD', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl font-bold transition text-[11px] whitespace-nowrap cursor-pointer ${
                filterStatus === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'Semua' : st === 'SUBMITTED' ? 'Diajukan' : st === 'PROCESSING_TU' ? 'Diproses TU' : st === 'APPROVED_HEAD' ? 'Disetujui' : 'Selesai'}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3.5">No. Registrasi</th>
                <th className="p-3.5">Pemohon & Indeks</th>
                <th className="p-3.5">Jenis Surat Dituju</th>
                <th className="p-3.5">Unit / Lembaga</th>
                <th className="p-3.5">Tanggal Masuk</th>
                <th className="p-3.5">Status Alur</th>
                <th className="p-3.5 text-center">Aksi Petugas TU</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3.5 font-mono font-bold text-blue-700">{req.request_number}</td>
                  <td className="p-3.5">
                    <strong className="block text-slate-900">{req.applicant_name}</strong>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {req.applicant_role} • {req.applicant_identifier}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="font-bold text-slate-800 block">{req.letter_type}</span>
                    <span className="text-[10px] text-slate-500 italic">{req.purpose}</span>
                  </td>
                  <td className="p-3.5 font-medium text-slate-700">{req.unit}</td>
                  <td className="p-3.5 font-mono text-slate-600">{req.request_date}</td>
                  <td className="p-3.5">{getStatusBadge(req.status)}</td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {req.status === 'SUBMITTED' && (
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'PROCESSING_TU')}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] rounded-lg shadow cursor-pointer"
                        >
                          Verifikasi TU
                        </button>
                      )}
                      {req.status === 'PROCESSING_TU' && (
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'APPROVED_HEAD')}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg shadow cursor-pointer"
                        >
                          Kirim Pimpinan
                        </button>
                      )}
                      {req.status === 'APPROVED_HEAD' && (
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'COMPLETED')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg shadow cursor-pointer"
                        >
                          Terbitkan (PDF)
                        </button>
                      )}
                      <button
                        onClick={() => setPreviewRequest(req)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg cursor-pointer"
                      >
                        <Eye className="h-3 w-3 inline" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                    Belum ada permohonan surat online yang sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Permohonan Baru */}
      {showNewRequestModal && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 animate-fade-in">
            <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-600" />
              Formulir Permohonan Surat Online
            </h3>

            <form onSubmit={handleCreateRequest} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Peran Pemohon</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['SISWA', 'WALI_SANTRI', 'GURU'] as const).map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormData({ ...formData, applicant_role: role })}
                      className={`py-1.5 px-2 rounded-lg font-bold border transition ${
                        formData.applicant_role === role
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {role === 'SISWA' ? 'Siswa/Santri' : role === 'WALI_SANTRI' ? 'Wali Santri' : 'Guru / Staf'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Pemohon / Santri</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Ahmad Syahputra"
                  value={formData.applicant_name}
                  onChange={e => setFormData({ ...formData, applicant_name: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">NIS / NIP</label>
                  <input
                    type="text"
                    placeholder="Contoh: NIS2026001"
                    value={formData.applicant_identifier}
                    onChange={e => setFormData({ ...formData, applicant_identifier: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unit Pendidikan</label>
                  <select
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white font-medium"
                  >
                    <option value="SMP Pesantren">SMP Pesantren</option>
                    <option value="SMA Tahfidz">SMA Tahfidz</option>
                    <option value="Yayasan Utama">Yayasan Utama</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Jenis Surat yang Dimohon</label>
                <select
                  value={formData.letter_type}
                  onChange={e => setFormData({ ...formData, letter_type: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white font-medium"
                >
                  <option value="Surat Keterangan Santri Aktif Mukim">Surat Keterangan Santri Aktif Mukim</option>
                  <option value="Surat Permohonan Cuti Berobat Santri">Surat Permohonan Cuti Berobat Santri</option>
                  <option value="Surat Rekomendasi Beasiswa">Surat Rekomendasi Beasiswa</option>
                  <option value="Surat Keterangan Kelakuan Baik">Surat Keterangan Kelakuan Baik</option>
                  <option value="Surat Tugas Research / Pengabdian">Surat Tugas Research / Pengabdian</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Keperluan & Alasan Permohonan</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Jelaskan alasan pengajuan permohonan surat ini..."
                  value={formData.purpose}
                  onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewRequestModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow cursor-pointer"
                >
                  Kirim Permohonan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail / Preview */}
      {previewRequest && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">Detail Permohonan #{previewRequest.request_number}</h3>
              {getStatusBadge(previewRequest.status)}
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Informasi Pemohon</p>
                <p className="font-extrabold text-slate-900 text-sm">{previewRequest.applicant_name}</p>
                <p className="text-slate-600 font-mono">{previewRequest.applicant_role} • {previewRequest.applicant_identifier} ({previewRequest.unit})</p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Jenis Surat</p>
                <p className="font-bold text-slate-800">{previewRequest.letter_type}</p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Tujuan / Keperluan</p>
                <p className="text-slate-700 bg-amber-50/60 p-2.5 rounded-lg border border-amber-100 italic">{previewRequest.purpose}</p>
              </div>

              {previewRequest.notes && (
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Catatan Verifikasi</p>
                  <p className="text-slate-700 text-[11px]">{previewRequest.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setPreviewRequest(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
