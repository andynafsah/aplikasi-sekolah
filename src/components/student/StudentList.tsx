/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, UserPlus, Filter, Edit3, Trash2, ShieldAlert, BadgeInfo, FileText, CheckCircle, Printer, Download, BookOpen, CheckSquare, Square, FileSpreadsheet } from 'lucide-react';

interface StudentListProps {
  students: any[];
  isSantriOnly: boolean;
  onEdit: (student: any) => void;
  onDelete: (id: string) => void;
  onOpenForm: () => void;
  onManageDocs: (id: string) => void;
  onPrintBiodata: (student: any) => void;
  onPrintAllBiodata?: (selectedList?: any[]) => void;
  onDownloadCSV?: (selectedList?: any[]) => void;
}

export function StudentList({ 
  students, 
  isSantriOnly, 
  onEdit, 
  onDelete, 
  onOpenForm, 
  onManageDocs, 
  onPrintBiodata,
  onPrintAllBiodata,
  onDownloadCSV
}: StudentListProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [genderFilter, setGenderFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [kelasFilter, setKelasFilter] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deletingStudent, setDeletingStudent] = useState<any | null>(null);

  // Filtering Logic
  const filteredStudents = students.filter(s => {
    if (s.deleted_at || s.status === 'DIHAPUS' || s.sekolah?.status === 'DIHAPUS') return false;

    const isSantriVal = s.is_santri === 'YA' || (s.pondok?.nomor_santri ? true : false);
    if (isSantriOnly && !isSantriVal) return false;

    const matchesSearch = 
      (s.name || s.identitas?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.nis || s.identitas?.nis || '').includes(searchQuery) ||
      (s.nisn || s.identitas?.nisn || '').includes(searchQuery) ||
      (s.nik || s.kependudukan?.nik || '').includes(searchQuery);

    const matchesGender = genderFilter === 'ALL' || (s.gender || s.identitas?.gender) === genderFilter;
    const matchesStatus = statusFilter === 'ALL' || (s.status_keaktifan || s.sekolah?.status) === statusFilter;
    const matchesKelas = kelasFilter === 'ALL' || (s.kelas || s.sekolah?.kelas) === kelasFilter;

    return matchesSearch && matchesGender && matchesStatus && matchesKelas;
  });

  // Checkbox helpers
  const isAllSelected = filteredStudents.length > 0 && filteredStudents.every(s => selectedIds.includes(s.id));
  
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map(s => s.id));
    }
  };

  const toggleSelectStudent = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const getSelectedStudentsList = () => {
    if (selectedIds.length === 0) return filteredStudents;
    return filteredStudents.filter(s => selectedIds.includes(s.id));
  };

  // Calculate completeness score (DAPODIK)
  const getCompleteness = (s: any) => {
    const fields = [
      s.name || s.identitas?.name,
      s.nis || s.identitas?.nis,
      s.nisn || s.identitas?.nisn,
      s.nik || s.kependudukan?.nik,
      s.tempat_lahir || s.identitas?.tempat_lahir,
      s.tgl_lahir || s.identitas?.tgl_lahir,
      s.nama_ayah || s.orang_tua?.ayah?.nama,
      s.nama_ibu || s.orang_tua?.ibu?.nama,
      s.dusun || s.kependudukan?.dusun,
      s.desa || s.kependudukan?.desa
    ];
    const filled = fields.filter(f => f && f !== '').length;
    return Math.round((filled / fields.length) * 100);
  };

  return (
    <div className="flex flex-col gap-4 text-xs">
      
      {/* Buku Induk & Mass Actions Bar */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4.5 rounded-3xl shadow-md border border-blue-800/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/20 border border-blue-400/30 rounded-2xl shrink-0">
            <BookOpen className="h-6 w-6 text-blue-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold tracking-tight">Pencetakan & Export Buku Induk Siswa</h3>
              <span className="bg-blue-500/30 text-blue-200 border border-blue-400/30 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold">
                {selectedIds.length > 0 ? `${selectedIds.length} Terpilih` : `${filteredStudents.length} Total Filtered`}
              </span>
            </div>
            <p className="text-[11px] text-blue-200/80 mt-0.5">
              Cetak berkas biodata resmi lengkap dengan Kop Surat & Tanda Tangan, atau unduh format Excel/CSV.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {onPrintAllBiodata && (
            <button
              onClick={() => onPrintAllBiodata(getSelectedStudentsList())}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-sm cursor-pointer border border-blue-400/40 text-xs"
            >
              <Printer className="h-4 w-4" />
              <span>
                Cetak Buku Induk {selectedIds.length > 0 ? `(${selectedIds.length})` : `Semua (${filteredStudents.length})`}
              </span>
            </button>
          )}

          {onDownloadCSV && (
            <button
              onClick={() => onDownloadCSV(getSelectedStudentsList())}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-sm cursor-pointer border border-emerald-400/40 text-xs"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>
                Download CSV {selectedIds.length > 0 ? `(${selectedIds.length})` : `All`}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 w-full xl:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, NIS, NISN, NIK kependudukan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-medium"
          />
        </div>

        {/* Filters & Trigger Form */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full xl:w-auto">
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 bg-transparent sm:bg-slate-50 border-none sm:border sm:border-slate-200 p-0 sm:p-1 rounded-xl w-full sm:w-auto">
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full sm:w-auto bg-slate-50 sm:bg-transparent border border-slate-200 sm:border-none text-xs font-bold text-slate-700 focus:outline-none px-3 py-2.5 sm:py-1 rounded-xl cursor-pointer"
            >
              <option value="ALL">Gender</option>
              <option value="L">Laki-Laki (L)</option>
              <option value="P">Perempuan (P)</option>
            </select>
            <div className="hidden sm:block w-[1px] h-4 bg-slate-200" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto bg-slate-50 sm:bg-transparent border border-slate-200 sm:border-none text-xs font-bold text-slate-700 focus:outline-none px-3 py-2.5 sm:py-1 rounded-xl cursor-pointer"
            >
              <option value="ALL">Status</option>
              <option value="AKTIF">AKTIF</option>
              <option value="PINDAH">PINDAH</option>
              <option value="ALUMNI">ALUMNI</option>
              <option value="LULUS">LULUS</option>
            </select>
            <div className="hidden sm:block w-[1px] h-4 bg-slate-200" />
            <select
              value={kelasFilter}
              onChange={(e) => setKelasFilter(e.target.value)}
              className="w-full sm:w-auto bg-slate-50 sm:bg-transparent border border-slate-200 sm:border-none text-xs font-bold text-slate-700 focus:outline-none px-3 py-2.5 sm:py-1 rounded-xl cursor-pointer"
            >
              <option value="ALL">Kelas</option>
              <option value="VII-A">Kelas VII-A</option>
              <option value="VIII-B">Kelas VIII-B</option>
              <option value="IX-A">Kelas IX-A</option>
              <option value="X-A">Kelas X-A</option>
              <option value="XI-B">Kelas XI-B</option>
            </select>
          </div>

          <button
            onClick={onOpenForm}
            className="flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-sm w-full sm:w-auto shrink-0"
          >
            <UserPlus className="h-4 w-4" />
            <span className="whitespace-nowrap">{isSantriOnly ? 'Tambah Santri' : 'Pendaftaran DAPODIK'}</span>
          </button>
        </div>
      </div>

      {/* Grid List Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-150 bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider font-mono">
                <th className="p-4.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    title="Pilih Semua Siswa"
                  />
                </th>
                <th className="p-4.5">Identitas Peserta Didik</th>
                <th className="p-4.5">Alamat Kependudukan</th>
                {isSantriOnly ? (
                  <th className="p-4.5">Ploting Pondok & Asrama</th>
                ) : (
                  <th className="p-4.5">Sekolah & Kurikulum</th>
                )}
                <th className="p-4.5">Keluarga & Wali</th>
                <th className="p-4.5 text-center">Completeness</th>
                <th className="p-4.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
              {filteredStudents.map((std: any) => {
                const compl = getCompleteness(std);
                const name = std.name || std.identitas?.name || 'Tanpa Nama';
                const nis = std.nis || std.identitas?.nis || 'N/A';
                const nisn = std.nisn || std.identitas?.nisn || 'N/A';
                const status = std.status_keaktifan || std.sekolah?.status || 'AKTIF';
                const isSantri = std.is_santri === 'YA' || (std.pondok?.nomor_santri ? true : false);
                const isSelected = selectedIds.includes(std.id);

                return (
                  <tr key={std.id} className={`hover:bg-slate-50/50 transition-all ${isSelected ? 'bg-blue-50/40' : ''}`}>
                    <td className="p-4.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectStudent(std.id)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="p-4.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-800 text-[12px]">{name}</span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                          <span>NIS: {nis}</span>
                          <span>•</span>
                          <span>NISN: {nisn}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            status === 'AKTIF' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {status}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700`}>
                            {isSantri ? 'SANTRI MUKIM' : 'REGULER'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-800">{std.dusun || std.kependudukan?.dusun || '-'}, {std.desa || std.kependudukan?.desa || '-'}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {std.kecamatan || std.kependudukan?.kecamatan || '-'}, {std.kabupaten || std.kependudukan?.kabupaten || '-'}
                        </span>
                      </div>
                    </td>
                    
                    {/* Conditional rendering for Santri vs Siswa */}
                    {isSantriOnly ? (
                      <td className="p-4.5">
                        <div className="flex flex-col gap-1 text-[11px]">
                          <p className="text-slate-800"><span className="font-bold">Asrama:</span> {std.asrama || std.pondok?.asrama || '-'}</p>
                          <p className="text-slate-500"><span className="font-bold">Kamar:</span> {std.kamar || std.pondok?.kamar || '-'} ({std.musyrif || std.pondok?.musyrif || '-'})</p>
                          <p className="text-[10px] text-slate-400 font-mono">Santri ID: {std.pondok?.nomor_santri || 'SANTRI-9022'}</p>
                        </div>
                      </td>
                    ) : (
                      <td className="p-4.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-slate-800 font-bold">Kelas: {std.kelas || std.sekolah?.kelas || 'VII-A'}</span>
                          <span className="text-[10px] text-slate-500">Rombel: {std.rombel || std.sekolah?.rombel || 'VII-A'}</span>
                          <span className="text-[10px] text-slate-400">Peminatan: {std.jurusan || std.sekolah?.jurusan || 'Umum'}</span>
                        </div>
                      </td>
                    )}

                    <td className="p-4.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-800"><span className="text-slate-400">A:</span> {std.nama_ayah || std.orang_tua?.ayah?.nama || '-'}</span>
                        <span className="text-slate-800"><span className="text-slate-400">I:</span> {std.nama_ibu || std.orang_tua?.ibu?.nama || '-'}</span>
                      </div>
                    </td>

                    <td className="p-4.5 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${compl >= 90 ? 'bg-emerald-500' : compl >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${compl}%` }}
                          />
                        </div>
                        <span className={`px-1.5 py-0.5 rounded-full font-bold font-mono text-[9px] ${
                          compl >= 90 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {compl}% Complete
                        </span>
                      </div>
                    </td>

                    <td className="p-4.5 text-center">
                      <div className="flex items-center justify-center gap-2 text-slate-400">
                        <button onClick={() => onPrintBiodata(std)} className="p-1.5 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer" title="Cetak Lembar Biodata Induk">
                          <Printer className="h-4 w-4" />
                        </button>
                        <button onClick={() => onEdit(std)} className="p-1.5 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer" title="Edit Biodata">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button onClick={() => onManageDocs(std.id)} className="p-1.5 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer" title="Dokumen">
                          <FileText className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeletingStudent(std)} className="p-1.5 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer" title="Hapus">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-mono">
                    Tidak ada data kesiswaan yang cocok dengan saringan filter aktif.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deletingStudent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="p-3 bg-red-50 rounded-xl">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Hapus Data Siswa</h3>
                <p className="text-xs text-slate-500">Konfirmasi tindakan hapus data kesiswaan</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Apakah Anda yakin ingin menghapus siswa <strong className="text-slate-900">{deletingStudent.name || deletingStudent.identitas?.name || 'Siswa'}</strong>? Data yang dihapus tidak akan ditampilkan lagi di daftar kesiswaan.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingStudent(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetId = deletingStudent.id || deletingStudent.identitas?.nis || deletingStudent.nis;
                  onDelete(targetId);
                  setDeletingStudent(null);
                }}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-600/20 transition-all cursor-pointer"
              >
                Ya, Hapus Siswa
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
