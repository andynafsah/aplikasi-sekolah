import React from 'react';
import { Archive, MapPin, Database, Calendar, Eye, Download, Info } from 'lucide-react';

interface ArchiveCardProps {
  key?: any;
  archive: any;
  onViewDocument?: (docId: string, docTypeCode: string) => void;
}

export default function ArchiveCard({ archive, onViewDocument }: ArchiveCardProps) {
  if (!archive) return null;

  // Archive status colors
  const statusColors = {
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Inactive: 'bg-amber-50 text-amber-700 border-amber-200',
    Permanent: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Destroyed: 'bg-red-50 text-red-700 border-red-200'
  };

  const status = archive.archive_status as 'Active' | 'Inactive' | 'Permanent' | 'Destroyed';

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition flex flex-col justify-between">
      
      {/* Top Section */}
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
            <Archive className="h-3 w-3 text-slate-400 shrink-0" />
            <span>NO ARSIP: {archive.archive_number}</span>
          </div>
          <span className={`text-[9px] font-extrabold uppercase tracking-wider border px-2 py-0.5 rounded-full ${statusColors[status] || statusColors.Active}`}>
            {archive.archive_status}
          </span>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-800 line-clamp-1 leading-snug">
            {archive.title}
          </h4>
          <p className="text-[10px] text-slate-400 font-mono tracking-wide mt-0.5">
            DOKUMEN: {archive.document_type_code}
          </p>
        </div>

        {/* Location layout */}
        <div className="bg-slate-50 border border-slate-150 rounded-lg p-2.5 space-y-1.5 text-[10px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
            <span>Fisik: <strong className="text-slate-700">{archive.box_number}</strong> ({archive.shelf_position})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            <span>Format: <strong className="text-slate-700">{archive.is_digital ? 'Digital + Fisik' : 'Hanya Fisik'}</strong></span>
          </div>
        </div>
      </div>

      {/* Bottom info banner */}
      <div className="bg-slate-50 border-t border-slate-100 px-4 py-2.5 flex items-center justify-between text-[10px] text-slate-500">
        <div className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>Retensi: <strong>{archive.retention_period_years} Tahun</strong></span>
        </div>

        {archive.file_path && (
          <a
            href={archive.file_path}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:underline font-bold"
          >
            Unduh Draf
          </a>
        )}
      </div>

    </div>
  );
}
