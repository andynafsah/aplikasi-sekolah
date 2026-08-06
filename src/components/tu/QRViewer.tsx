import React, { useState } from 'react';
import { QrCode, Search, ShieldCheck, ShieldAlert, Check, FileCheck, HelpCircle } from 'lucide-react';
import axios from 'axios';

interface QRViewerProps {
  onVerified?: (data: any) => void;
}

export default function QRViewer({ onVerified }: QRViewerProps) {
  const [qrHash, setQrHash] = useState('');
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrHash.trim()) return;

    setIsVerifying(true);
    setErrorMsg('');
    setVerificationResult(null);

    try {
      const token = localStorage.getItem('erp_token');
      const response = await axios.post('/api/action?action=legalDocument', {
        sub_action: 'verify_qr',
        qr_hash: qrHash.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success && response.data.is_valid) {
        setVerificationResult(response.data.data);
        if (onVerified) onVerified(response.data.data);
      } else {
        setErrorMsg(response.data.message || 'Spesimen QR tidak sah atau palsu.');
      }
    } catch (err) {
      setErrorMsg('Gagal terhubung ke server verifikasi blockchain / certificate authority.');
    } finally {
      setIsVerifying(false);
    }
  };

  const loadSampleHash = () => {
    setQrHash('QR_OUT_LET_1_VALID_VERIFIED');
  };

  return (
    <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <QrCode className="h-4 w-4 text-indigo-600" />
          QR Document Authenticator
        </h4>
        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
          Blockchain Integrity
        </span>
      </div>

      <p className="text-[11px] text-slate-500 leading-relaxed">
        Setiap dokumen resmi yang dikeluarkan Tata Usaha dibekali tanda tangan digital & QR Code pengaman. Scan atau masukkan hash untuk mengecek keaslian dokumen.
      </p>

      {/* Verification Form */}
      <form onSubmit={handleVerify} className="space-y-3">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Hash / Serial QR Code
          </label>
          <div className="relative">
            <input
              type="text"
              value={qrHash}
              onChange={(e) => setQrHash(e.target.value)}
              placeholder="Masukkan hash atau scan nomor QR..."
              className="w-full text-xs border border-slate-300 rounded-lg pl-3 pr-10 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={isVerifying}
              className="absolute right-2 top-1.5 p-1 text-slate-400 hover:text-indigo-600 cursor-pointer"
            >
              {isVerifying ? (
                <div className="h-4 w-4 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center text-[10px]">
          <button
            type="button"
            onClick={loadSampleHash}
            className="text-indigo-600 hover:underline font-bold"
          >
            Gunakan Contoh Hash Surat Valid
          </button>
          <span className="text-slate-400">Verifikasi instan 0.1 detik</span>
        </div>
      </form>

      {/* Results panel */}
      {verificationResult && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg space-y-3 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-emerald-100 border border-emerald-200 rounded-full">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-emerald-800">DOKUMEN ASLI & SAH</h5>
              <p className="text-[10px] text-emerald-600">Verifikasi Sertifikasi Elektronik Sukses</p>
            </div>
          </div>

          <div className="border-t border-emerald-200 pt-2.5 grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <span className="text-slate-500">Nomor Surat:</span>
              <div className="font-mono font-bold text-slate-800">{verificationResult.document_number}</div>
            </div>
            <div>
              <span className="text-slate-500">Tanggal Tanda Tangan:</span>
              <div className="font-bold text-slate-800">{new Date(verificationResult.signed_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500">Perihal:</span>
              <div className="font-bold text-slate-800">{verificationResult.subject}</div>
            </div>
            <div>
              <span className="text-slate-500">Penandatangan:</span>
              <div className="font-bold text-slate-800">{verificationResult.sender}</div>
            </div>
            <div>
              <span className="text-slate-500">Tujuan:</span>
              <div className="font-bold text-slate-800">{verificationResult.destination}</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-100/55 p-1.5 rounded text-[9px] text-emerald-800 font-mono">
            <FileCheck className="h-3.5 w-3.5 shrink-0 text-emerald-700" />
            <span>ID Sidik Jari Digital terenkripsi di server pusat.</span>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 p-3.5 rounded-lg space-y-2 animate-fade-in">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4.5 w-4.5 text-red-600" />
            <h5 className="text-xs font-bold text-red-800">DOKUMEN TIDAK VALID / PALSU</h5>
          </div>
          <p className="text-[10px] text-red-600 leading-normal">
            {errorMsg} Sistem mendeteksi nomor hash ini tidak terdaftar pada buku agenda keluar, atau arsip digital draf. Mohon laporkan ke Kepala Tata Usaha.
          </p>
        </div>
      )}
    </div>
  );
}
