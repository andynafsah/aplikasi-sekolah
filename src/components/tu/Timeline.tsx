import React from 'react';
import { Clock, ShieldCheck, CheckSquare, Edit3, Trash2, ArrowRight } from 'lucide-react';

interface TimelineProps {
  logs: any[];
}

export default function Timeline({ logs = [] }: TimelineProps) {
  if (logs.length === 0) {
    return (
      <div className="bg-white p-6 border border-slate-200 rounded-xl text-center text-slate-400 text-xs italic">
        Belum ada log aktivitas penelusuran draf atau penandatanganan hari ini.
      </div>
    );
  }

  const iconColors = {
    CREATE_LETTER: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    CREATE_OUTGOING_LETTER: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    UPDATE_LETTER: 'bg-blue-50 text-blue-600 border-blue-200',
    UPDATE_OUTGOING_LETTER: 'bg-blue-50 text-blue-600 border-blue-200',
    DISPOSITION_CREATE: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    DISPOSITION_RESPOND: 'bg-amber-50 text-amber-600 border-amber-200',
    QR_VERIFIED: 'bg-purple-50 text-purple-600 border-purple-200',
    LEGAL_CREATE: 'bg-teal-50 text-teal-600 border-teal-200',
    LEGAL_UPDATE: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    GUEST_CHECKIN: 'bg-slate-100 text-slate-700 border-slate-200',
    GUEST_CHECKOUT: 'bg-slate-100 text-slate-500 border-slate-200'
  };

  return (
    <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <Clock className="h-4.5 w-4.5 text-blue-600" />
          Audit Trail Aktivitas Surat & Dokumen
        </h4>
        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">
          SISTEM KEAMANAN LENGKAP
        </span>
      </div>

      <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-5 py-2">
        {logs.map((log, index) => {
          const colorClass = (iconColors as any)[log.activity_type] || 'bg-slate-50 text-slate-600 border-slate-200';
          return (
            <div key={log.id || index} className="relative group">
              
              {/* Floating bullet */}
              <div className={`absolute -left-10 top-0.5 rounded-full border h-7.5 w-7.5 flex items-center justify-center text-[10px] font-bold ${colorClass}`}>
                {index + 1}
              </div>

              {/* Log body */}
              <div className="space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-xs font-bold text-slate-800 leading-none">
                    {log.details}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                  <span className="font-bold text-slate-700">{log.actor_name}</span>
                  <span className="text-slate-300">|</span>
                  <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded text-[9px] font-bold uppercase">{log.actor_role}</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
