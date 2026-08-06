import React from 'react';
import { FileText, Shield, User, MapPin, Eye, Calendar, Clock, Download, CheckCircle, ShieldCheck } from 'lucide-react';

interface DocumentViewerProps {
  document: any;
  onClose: () => void;
}

export default function DocumentViewer({ document, onClose }: DocumentViewerProps) {
  if (!document) return null;

  const isIncoming = document.letter_type === 'Surat Masuk';

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      
      {/* Top Banner */}
      <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-2.5">
          <FileText className="h-5 w-5 text-blue-400" />
          <div>
            <h4 className="text-xs font-bold font-mono tracking-widest text-slate-400">DETAIL BERKAS DIGITAL</h4>
            <p className="text-sm font-bold tracking-tight">{document.subject}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white text-xs font-bold bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer"
        >
          Tutup Detail
        </button>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Document Content and Specs */}
        <div className="md:col-span-2 space-y-5">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-4">
            <div className="text-center space-y-1.5 border-b border-slate-200 pb-3">
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded font-mono uppercase tracking-wider">
                {document.letter_type}
              </span>
              <h2 className="text-sm font-extrabold text-slate-800 uppercase font-mono tracking-tight">
                {document.letter_number}
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">NOMOR AGENDA: {document.agenda_number}</p>
            </div>

            {/* Simulated letter preview */}
            <div className="bg-white p-5 border border-slate-200 rounded shadow-inner min-h-[220px] font-sans text-[11px] text-slate-700 leading-relaxed space-y-3">
              <div className="flex justify-between text-[10px] text-slate-400 border-b border-slate-100 pb-2">
                <div>Tanggal: {document.letter_date}</div>
                <div>Sifat: {document.confidentiality}</div>
              </div>
              
              <div className="space-y-1">
                <div><strong>Dari:</strong> {document.sender}</div>
                <div><strong>Kepada / Penerima:</strong> {isIncoming ? document.receiver : document.destination}</div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <strong className="text-slate-850">Ringkasan Surat:</strong>
                <p className="mt-1 italic bg-slate-50 p-2.5 rounded border border-slate-150 text-slate-600 leading-normal">
                  {document.summary || 'Tidak ada ringkasan teks. Berkas dilampirkan dalam format asli digital scan.'}
                </p>
              </div>

              {document.qr_code_hash && (
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="h-14 w-14 bg-slate-100 border border-slate-200 rounded flex items-center justify-center font-mono text-[8px] text-slate-500 font-bold p-1">
                    [QR SEAL]
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" /> SECURE DIGITAL SIGNATURE
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono break-all max-w-[300px]">
                      Hash: {document.qr_code_hash}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action trigger to view file */}
          {document.file_path && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5 flex items-center justify-between text-xs text-blue-800">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span>Dokumen pendukung terlampir: <strong>{document.file_path.split('/').pop()}</strong></span>
              </div>
              <a
                href={document.file_path}
                target="_blank"
                rel="noreferrer"
                className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded text-[10px] font-bold tracking-wider uppercase transition flex items-center gap-1 cursor-pointer"
              >
                <Download className="h-3 w-3" /> Unduh Berkas
              </a>
            </div>
          )}
        </div>

        {/* Right 1 Column: Metadata, Versioning, and Logs */}
        <div className="space-y-4">
          
          {/* Metadata Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <h5 className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest border-b border-slate-200 pb-1.5 flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-blue-500" />
              Meta Keamanan
            </h5>
            
            <div className="space-y-2.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Kerhasiaan:</span>
                <span className={`font-bold ${document.confidentiality === 'BIASA' ? 'text-slate-700' : 'text-amber-600'}`}>
                  {document.confidentiality}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Urgensi:</span>
                <span className={`font-bold ${document.urgency === 'BIASA' ? 'text-slate-700' : 'text-red-600'}`}>
                  {document.urgency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status Alur:</span>
                <span className="font-bold text-slate-800 bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px]">
                  {document.status}
                </span>
              </div>
            </div>
          </div>

          {/* Versions History Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <h5 className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest border-b border-slate-200 pb-1.5 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-indigo-500" />
              Riwayat Revisi (Versioning)
            </h5>
            
            <div className="space-y-3">
              <div className="border-l-2 border-indigo-500 pl-3 space-y-1">
                <div className="text-[10px] font-bold text-indigo-700">Versi Terbaru v{document.version}</div>
                <div className="text-[9px] text-slate-400 font-mono">Diedit pada: {new Date(document.updated_at).toLocaleDateString('id-ID')}</div>
                <div className="text-[9px] text-slate-500 italic">Disimpan aman dalam server multi-tenant.</div>
              </div>

              {document.version > 1 && (
                <div className="border-l-2 border-slate-300 pl-3 space-y-1 opacity-70">
                  <div className="text-[10px] font-bold text-slate-700">Versi Awal v1</div>
                  <div className="text-[9px] text-slate-400 font-mono">Dibuat pada: {new Date(document.created_at).toLocaleDateString('id-ID')}</div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
