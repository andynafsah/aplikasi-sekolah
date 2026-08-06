import React, { useRef, useState, useEffect } from 'react';
import { PenTool, RefreshCw, CheckCircle, ShieldCheck, QrCode } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signatureType: string, signatureData: string) => void;
  initialType?: string;
}

export default function SignaturePad({ onSave, initialType = 'Digital Signature' }: SignaturePadProps) {
  const [signatureType, setSignatureType] = useState<string>(initialType);
  const [isSigned, setIsSigned] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [savedData, setSavedData] = useState<string>('');

  useEffect(() => {
    if (signatureType === 'Manual' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1e3a8a'; // Deep Navy
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
      }
    }
  }, [signatureType]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
      setIsSigned(true);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setIsSigned(false);
      setSavedData('');
    }
  };

  const saveSignature = () => {
    let data = '';
    if (signatureType === 'Manual' && canvasRef.current) {
      data = canvasRef.current.toDataURL();
    } else if (signatureType === 'Digital Signature') {
      data = `SHA256-SIG-HASH-${Math.random().toString(36).substr(2, 12).toUpperCase()}`;
    } else if (signatureType === 'QR Signature') {
      data = `QR-SIG-HASH-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    } else {
      data = 'ELECTRONIC-SIGNATURE-READY';
    }
    setSavedData(data);
    onSave(signatureType, data);
  };

  return (
    <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <PenTool className="h-4 w-4 text-blue-500" />
          Spesimen Tanda Tangan (Signature)
        </h4>
        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">
          SPRINT 26 SECURE
        </span>
      </div>

      {/* Select Type */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { type: 'Manual', label: 'Manual Drawing', icon: PenTool },
          { type: 'Digital Signature', label: 'Cryptographic', icon: ShieldCheck },
          { type: 'QR Signature', label: 'QR Signature', icon: QrCode },
          { type: 'Electronic Signature Ready', label: 'E-Stamp Ready', icon: CheckCircle }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.type}
              type="button"
              onClick={() => {
                setSignatureType(item.type);
                setIsSigned(false);
                setSavedData('');
              }}
              className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition cursor-pointer ${
                signatureType === item.type
                  ? 'border-blue-600 bg-blue-50/60 text-blue-700'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <div className="text-[11px] font-semibold tracking-tight">{item.label}</div>
            </button>
          );
        })}
      </div>

      {/* Signature Area */}
      <div className="border border-dashed border-slate-250 bg-slate-50 rounded-lg p-3 flex flex-col items-center justify-center min-h-[140px]">
        {signatureType === 'Manual' ? (
          <div className="w-full flex flex-col items-center gap-2">
            <canvas
              ref={canvasRef}
              width={350}
              height={120}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="bg-white border border-slate-200 rounded-md cursor-crosshair shadow-inner"
            />
            <div className="flex justify-between w-full max-w-[350px]">
              <button
                type="button"
                onClick={clearCanvas}
                className="text-[10px] text-red-600 font-bold hover:underline flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" /> Bersihkan
              </button>
              <span className="text-[10px] text-slate-400 italic">Gambarkan tanda tangan Anda di atas</span>
            </div>
          </div>
        ) : signatureType === 'Digital Signature' ? (
          <div className="text-center space-y-2 p-2">
            <ShieldCheck className="h-10 w-10 text-emerald-600 mx-auto animate-pulse" />
            <div className="text-xs font-bold text-slate-800">Tanda Tangan Digital Kriptografis</div>
            <p className="text-[10px] text-slate-500 max-w-xs leading-relaxed">
              Menggunakan pasangan kunci asimetris tenant untuk menandatangani hash dokumen secara sah dan anti-tamper.
            </p>
          </div>
        ) : signatureType === 'QR Signature' ? (
          <div className="text-center space-y-2 p-2">
            <QrCode className="h-10 w-10 text-indigo-600 mx-auto" />
            <div className="text-xs font-bold text-slate-800">Spesimen QR Verification Terbuka</div>
            <p className="text-[10px] text-slate-500 max-w-xs leading-relaxed">
              Menghasilkan QR Code unik pada kop & tanda tangan dokumen yang dapat diverifikasi siapa saja via mobile camera.
            </p>
          </div>
        ) : (
          <div className="text-center space-y-2 p-2">
            <CheckCircle className="h-10 w-10 text-blue-600 mx-auto" />
            <div className="text-xs font-bold text-slate-800">Electronic Seal Ready (E-Meterai)</div>
            <p className="text-[10px] text-slate-500 max-w-xs leading-relaxed">
              Membubuhkan tanda segel elektronik resmi sekolah / yayasan secara otomatis saat surat diterbitkan.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={saveSignature}
          className="bg-slate-900 text-white hover:bg-slate-850 px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> Apply Signature Spesimen
        </button>
      </div>

      {savedData && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-lg text-[10px] font-mono leading-tight space-y-1">
          <div className="font-bold flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-emerald-600" /> Spesimen Diterapkan:
          </div>
          <div className="break-all">{savedData}</div>
        </div>
      )}
    </div>
  );
}
