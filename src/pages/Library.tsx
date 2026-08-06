/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { 
  Book, 
  Search, 
  Filter, 
  Plus, 
  BookOpen, 
  User, 
  Layers, 
  QrCode, 
  Barcode, 
  ArrowLeftRight, 
  Bookmark, 
  Globe, 
  FileText, 
  Video, 
  Music, 
  Trash2, 
  Edit, 
  Check, 
  AlertTriangle,
  Download,
  Upload,
  Printer,
  FileSpreadsheet,
  FileDown
} from 'lucide-react';

// Definitions for local mock & API interaction
interface BookItem {
  id: string;
  title: string;
  isbn: string;
  author: string;
  publisher: string;
  category: string;
  shelf: string;
  stock: number;
  borrowed: number;
  barcode: string;
  qr_code: string;
  status: 'TERSEDIA' | 'DIPINJAM' | 'HABIS' | 'HILANG' | 'RUSAK';
}

interface BorrowRecord {
  id: string;
  book_title: string;
  student_name: string;
  borrow_date: string;
  due_date: string;
  return_date?: string;
  renew_count: number;
  status: 'BORROWED' | 'RETURNED' | 'RENEWED' | 'LOST' | 'DAMAGED';
  fine: number;
}

interface DigitalBook {
  id: string;
  title: string;
  author: string;
  type: 'PDF' | 'EPUB' | 'VIDEO' | 'AUDIO';
  url: string;
  size: string;
}

export default function Library() {
  const queryClient = useQueryClient();
  
  // States
  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'borrowing' | 'digital'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Scanners simulated states
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [scannedResult, setScannedResult] = useState('');

  // Bulk import state
  const [showImportModal, setShowImportModal] = useState(false);

  // Forms states
  const [showBookForm, setShowBookForm] = useState(false);
  const [editingBook, setEditingBook] = useState<BookItem | null>(null);
  const [newBook, setNewBook] = useState({
    title: '',
    isbn: '',
    author: '',
    publisher: '',
    category: 'Sains',
    shelf: 'Rak A-1',
    stock: 5,
    barcode: '',
    qr_code: '',
  });

  const [showBorrowForm, setShowBorrowForm] = useState(false);
  const [newBorrow, setNewBorrow] = useState({
    book_id: '',
    student_name: '',
    due_days: 7,
  });

  // Queries (TanStack Query)
  const { data: booksData = [], isLoading: isLoadingBooks } = useQuery<BookItem[]>({
    queryKey: ['libraryBooks'],
    queryFn: async () => {
      // Direct call to action or mock fallback
      try {
        const res = await apiClient.post('/api/action?action=getBooks');
        if (res.data.success && res.data.data) {
          return res.data.data.map((b: any) => ({
            id: b.id,
            title: b.title,
            isbn: b.isbn || '978-602-' + Math.floor(Math.random() * 10000),
            author: b.author || 'Penulisan',
            publisher: b.publisher || 'Penerbitan',
            category: b.category || ['Sains', 'Agama', 'Bahasa', 'Sastra', 'Filsafat'][Math.floor(Math.random() * 5)],
            shelf: b.shelf || 'Rak ' + String.fromCharCode(65 + Math.floor(Math.random() * 6)) + '-' + (Math.floor(Math.random() * 5) + 1),
            stock: b.stock || 5,
            borrowed: b.borrowed || 0,
            barcode: b.barcode || '885' + Math.floor(10000000 + Math.random() * 90000000),
            qr_code: b.qr_code || 'QR-' + Math.floor(100000 + Math.random() * 900000),
            status: (b.stock || 5) <= (b.borrowed || 0) ? 'HABIS' : 'TERSEDIA'
          }));
        }
      } catch (e) {
        console.warn("API fallback to localized data");
      }
      return defaultBooks;
    }
  });

  const { data: borrowingsData = [] } = useQuery<BorrowRecord[]>({
    queryKey: ['libraryBorrowings'],
    queryFn: async () => {
      return defaultBorrowings;
    }
  });

  const { data: digitalBooksData = [] } = useQuery<DigitalBook[]>({
    queryKey: ['digitalBooks'],
    queryFn: async () => {
      return defaultDigitalBooks;
    }
  });

  // Mutations
  const createBookMutation = useMutation({
    mutationFn: async (payload: any) => {
      // Simulating save
      return payload;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['libraryBooks'] });
      setShowBookForm(false);
      setNewBook({
        title: '',
        isbn: '',
        author: '',
        publisher: '',
        category: 'Sains',
        shelf: 'Rak A-1',
        stock: 5,
        barcode: '',
        qr_code: '',
      });
    }
  });

  const borrowBookMutation = useMutation({
    mutationFn: async (payload: any) => {
      return payload;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['libraryBorrowings'] });
      queryClient.invalidateQueries({ queryKey: ['libraryBooks'] });
      setShowBorrowForm(false);
    }
  });

  // Actions
  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    const barcodeVal = newBook.barcode || '885' + Math.floor(10000000 + Math.random() * 90000000);
    const qrVal = newBook.qr_code || 'QR-' + Math.floor(100000 + Math.random() * 900000);
    
    if (editingBook) {
      // update
      const updatedList = booksData.map(b => b.id === editingBook.id ? { ...b, ...newBook, barcode: barcodeVal, qr_code: qrVal } : b);
      queryClient.setQueryData(['libraryBooks'], updatedList);
      setEditingBook(null);
    } else {
      // create
      const bookToAdd: BookItem = {
        id: `bk-${Date.now()}`,
        ...newBook,
        barcode: barcodeVal,
        qr_code: qrVal,
        borrowed: 0,
        status: 'TERSEDIA'
      };
      queryClient.setQueryData(['libraryBooks'], [bookToAdd, ...booksData]);
    }
    setShowBookForm(false);
  };

  const handleCreateBorrow = (e: React.FormEvent) => {
    e.preventDefault();
    const book = booksData.find(b => b.id === newBorrow.book_id);
    if (!book || book.stock <= book.borrowed) return;

    const borrowRecord: BorrowRecord = {
      id: `brw-${Date.now()}`,
      book_title: book.title,
      student_name: newBorrow.student_name,
      borrow_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + newBorrow.due_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      renew_count: 0,
      status: 'BORROWED',
      fine: 0,
    };

    // Update state cache
    queryClient.setQueryData(['libraryBorrowings'], [borrowRecord, ...borrowingsData]);
    queryClient.setQueryData(['libraryBooks'], booksData.map(b => b.id === book.id ? { ...b, borrowed: b.borrowed + 1 } : b));
    setShowBorrowForm(false);
  };

  const handleReturn = (id: string, status: 'RETURNED' | 'LOST' | 'DAMAGED') => {
    const record = borrowingsData.find(r => r.id === id);
    if (!record) return;

    const fineAmount = status === 'LOST' ? 100000 : status === 'DAMAGED' ? 50000 : 0;

    const updatedBorrowings = borrowingsData.map(r => r.id === id ? { 
      ...r, 
      status, 
      return_date: new Date().toISOString().split('T')[0],
      fine: r.fine + fineAmount
    } : r);

    queryClient.setQueryData(['libraryBorrowings'], updatedBorrowings);
    
    // Increment stock back if returned safely
    if (status === 'RETURNED') {
      const bItem = booksData.find(b => b.title === record.book_title);
      if (bItem) {
        queryClient.setQueryData(['libraryBooks'], booksData.map(b => b.id === bItem.id ? { ...b, borrowed: Math.max(0, b.borrowed - 1) } : b));
      }
    }
  };

  const handleRenew = (id: string) => {
    const updated = borrowingsData.map(r => {
      if (r.id === id && r.status === 'BORROWED') {
        const curDueDate = new Date(r.due_date);
        const newDueDate = new Date(curDueDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        return { ...r, due_date: newDueDate, renew_count: r.renew_count + 1, status: 'RENEWED' as const };
      }
      return r;
    });
    queryClient.setQueryData(['libraryBorrowings'], updated);
  };

  // Export actions
  const exportToCSV = () => {
    let content = "ID,Judul Buku,ISBN,Penulis,Penerbit,Kategori,Rak,Stok,Dipinjam,Barcode,QR,Status\n";
    booksData.forEach(b => {
      content += `"${b.id}","${b.title}","${b.isbn}","${b.author}","${b.publisher}","${b.category}","${b.shelf}",${b.stock},${b.borrowed},"${b.barcode}","${b.qr_code}","${b.status}"\n`;
    });
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Laporan_Perpustakaan_Katalog.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split("\n");
      const imported: BookItem[] = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const cols = lines[i].split(",").map(c => c.replace(/"/g, ''));
        if (cols.length >= 6) {
          imported.push({
            id: `bk-imp-${Date.now()}-${i}`,
            title: cols[1] || 'Buku Impor',
            isbn: cols[2] || 'ISBN-999',
            author: cols[3] || 'Penulis Impor',
            publisher: cols[4] || 'Penerbit Impor',
            category: cols[5] || 'Umum',
            shelf: cols[6] || 'Rak Impor',
            stock: parseInt(cols[7]) || 5,
            borrowed: 0,
            barcode: cols[9] || '885' + Math.floor(Math.random() * 1000000),
            qr_code: cols[10] || 'QR-' + Math.floor(Math.random() * 100000),
            status: 'TERSEDIA'
          });
        }
      }
      queryClient.setQueryData(['libraryBooks'], [...imported, ...booksData]);
      setShowImportModal(false);
      alert(`${imported.length} buku berhasil diimport!`);
    };
    reader.readAsText(file);
  };

  // Filter & Search Logic
  const filteredBooks = booksData.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.isbn.includes(searchQuery) ||
                          b.barcode.includes(searchQuery);
    const matchesCategory = categoryFilter === 'ALL' || b.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 font-sans text-slate-700">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <span>Sistem Informasi Perpustakaan (Library Management)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">Mengelola sirkulasi buku, katalog fisik dan digital, peminjaman, denda takzir, hingga tracking RFID/Barcode.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={exportToCSV}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            <span>Ekspor CSV</span>
          </button>
          <button 
            onClick={() => setShowImportModal(true)}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5 text-blue-600" />
            <span>Impor Buku</span>
          </button>
          <button 
            onClick={() => {
              setEditingBook(null);
              setNewBook({
                title: '',
                isbn: '',
                author: '',
                publisher: '',
                category: 'Sains',
                shelf: 'Rak A-1',
                stock: 5,
                barcode: '',
                qr_code: '',
              });
              setShowBookForm(true);
            }}
            className="px-3.5 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Buku</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveSubTab('catalog')}
          className={`pb-3 text-sm font-semibold relative cursor-pointer transition-all ${
            activeSubTab === 'catalog' ? 'text-blue-600 border-b-2 border-blue-500 font-bold' : 'text-slate-450 hover:text-slate-600'
          }`}
        >
          Katalog Buku Fisik
        </button>
        <button
          onClick={() => setActiveSubTab('borrowing')}
          className={`pb-3 text-sm font-semibold relative cursor-pointer transition-all ${
            activeSubTab === 'borrowing' ? 'text-blue-600 border-b-2 border-blue-500 font-bold' : 'text-slate-450 hover:text-slate-600'
          }`}
        >
          Sirkulasi Peminjaman &amp; Pengembalian
        </button>
        <button
          onClick={() => setActiveSubTab('digital')}
          className={`pb-3 text-sm font-semibold relative cursor-pointer transition-all ${
            activeSubTab === 'digital' ? 'text-blue-600 border-b-2 border-blue-500 font-bold' : 'text-slate-450 hover:text-slate-600'
          }`}
        >
          Perpustakaan Digital (E-Book &amp; Media)
        </button>
      </div>

      {/* MAIN VIEWPORT */}
      {activeSubTab === 'catalog' && (
        <div className="space-y-4">
          
          {/* Filters & Interactive Search Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari judul, penulis, ISBN, barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-250 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none transition-colors"
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-250 rounded-lg text-xs font-semibold text-slate-600"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="Sains">Sains &amp; Tech</option>
                <option value="Agama">Kitab Agama</option>
                <option value="Bahasa">Bahasa &amp; Kamus</option>
                <option value="Sastra">Sastra &amp; Novel</option>
                <option value="Filsafat">Filsafat &amp; Umum</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-250 rounded-lg text-xs font-semibold text-slate-600"
              >
                <option value="ALL">Semua Status</option>
                <option value="TERSEDIA">Tersedia</option>
                <option value="DIPINJAM">Dipinjam</option>
                <option value="HABIS">Stok Habis</option>
              </select>

              {/* QR and Barcode Quick Scan Buttons */}
              <button 
                onClick={() => {
                  setIsQrScannerOpen(true);
                  setIsBarcodeScannerOpen(false);
                }}
                className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700 flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                title="Scan QR Code Buku"
              >
                <QrCode className="h-4 w-4 text-blue-600" />
                <span className="hidden sm:inline">Scan QR</span>
              </button>

              <button 
                onClick={() => {
                  setIsBarcodeScannerOpen(true);
                  setIsQrScannerOpen(false);
                }}
                className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700 flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                title="Scan Barcode ISBN"
              >
                <Barcode className="h-4 w-4 text-teal-600" />
                <span className="hidden sm:inline">Scan Barcode</span>
              </button>
            </div>
          </div>

          {/* Simulated Scanners Output Panel */}
          {(isQrScannerOpen || isBarcodeScannerOpen) && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Simulasi Kamera Scanner Actived</span>
                </h4>
                <button 
                  onClick={() => {
                    setIsQrScannerOpen(false);
                    setIsBarcodeScannerOpen(false);
                    setScannedResult('');
                  }}
                  className="text-amber-800 hover:text-amber-900 font-bold text-xs"
                >
                  Tutup
                </button>
              </div>
              <p className="text-xs text-amber-700">Arahkan barcode/QR ke arah kamera sensor. Klik salah satu buku di bawah ini untuk mensimulasikan pemindaian cepat.</p>
              
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Kode Scanned" 
                  value={scannedResult}
                  onChange={(e) => setScannedResult(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs w-48 font-mono"
                />
                <button
                  onClick={() => {
                    setSearchQuery(scannedResult);
                    setIsQrScannerOpen(false);
                    setIsBarcodeScannerOpen(false);
                  }}
                  className="px-3 py-1.5 bg-amber-600 text-white font-bold rounded-lg text-xs hover:bg-amber-700"
                >
                  Terapkan Pencarian
                </button>
              </div>
            </div>
          )}

          {/* Catalog Grid Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="p-3.5">Buku &amp; Karya</th>
                    <th className="p-3.5">ISBN / Barcode</th>
                    <th className="p-3.5">Kategori &amp; Rak</th>
                    <th className="p-3.5 text-center">Stok / Dipinjam</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {filteredBooks.map(b => (
                    <tr 
                      key={b.id} 
                      className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                      onClick={() => {
                        if (isQrScannerOpen) setScannedResult(b.qr_code);
                        if (isBarcodeScannerOpen) setScannedResult(b.barcode);
                      }}
                    >
                      <td className="p-3.5">
                        <div>
                          <p className="font-bold text-slate-800 text-sm hover:text-blue-600">{b.title}</p>
                          <p className="text-[10px] text-slate-400">Karya: {b.author} • Penerbit: {b.publisher}</p>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-mono text-[10px]">
                          <p>ISBN: {b.isbn}</p>
                          <p className="text-slate-400">BC: {b.barcode}</p>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="flex flex-col gap-1">
                          <span className="px-2 py-0.5 bg-slate-100 border text-slate-600 rounded text-[9px] font-bold w-fit">{b.category}</span>
                          <span className="text-[10px] font-semibold text-slate-500">{b.shelf}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-center">
                        <p className="font-bold text-slate-800">{b.stock - b.borrowed} / {b.stock}</p>
                        <span className="text-[10px] text-slate-400">Tersedia untuk dipinjam</span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          b.status === 'TERSEDIA' ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' :
                          b.status === 'HABIS' ? 'bg-red-50 border border-red-100 text-red-700' : 'bg-amber-50 border border-amber-100 text-amber-700'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => {
                              setNewBorrow({ book_id: b.id, student_name: '', due_days: 7 });
                              setShowBorrowForm(true);
                            }}
                            disabled={b.stock <= b.borrowed}
                            className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-100 rounded text-[10px] font-bold transition-all disabled:opacity-50"
                          >
                            Pinjamkan
                          </button>
                          <button 
                            onClick={() => {
                              setEditingBook(b);
                              setNewBook({
                                title: b.title || '',
                                isbn: b.isbn || '',
                                author: b.author || '',
                                publisher: b.publisher || '',
                                category: b.category || 'Sains',
                                shelf: b.shelf || 'Rak A-1',
                                stock: b.stock ?? 5,
                                barcode: b.barcode || '',
                                qr_code: b.qr_code || ''
                              });
                              setShowBookForm(true);
                            }}
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredBooks.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center p-8 text-slate-400 font-medium">Buku tidak ditemukan.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CIRCULATION VIEW */}
      {activeSubTab === 'borrowing' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800">Daftar Sirkulasi Aktif</h3>
            <button 
              onClick={() => {
                if (booksData.length === 0) return alert("Belum ada buku untuk dipinjam");
                setNewBorrow({ book_id: booksData[0].id, student_name: '', due_days: 7 });
                setShowBorrowForm(true);
              }}
              className="px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <ArrowLeftRight className="h-4 w-4" />
              <span>Peminjaman Baru</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="p-3.5">Nama Peminjam</th>
                    <th className="p-3.5">Judul Buku</th>
                    <th className="p-3.5">Tanggal Pinjam</th>
                    <th className="p-3.5">Jatuh Tempo</th>
                    <th className="p-3.5 text-center">Denda Takzir</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Opsi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {borrowingsData.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5 font-bold text-slate-800">{r.student_name}</td>
                      <td className="p-3.5 font-semibold">{r.book_title}</td>
                      <td className="p-3.5 font-mono text-slate-400">{r.borrow_date}</td>
                      <td className="p-3.5 font-mono text-slate-400">{r.due_date}</td>
                      <td className="p-3.5 text-center text-red-600 font-bold font-mono">
                        {r.fine > 0 ? `Rp ${r.fine.toLocaleString('id-ID')}` : '-'}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          r.status === 'BORROWED' ? 'bg-blue-50 border border-blue-100 text-blue-700' :
                          r.status === 'RETURNED' ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' :
                          r.status === 'LOST' ? 'bg-red-50 border border-red-100 text-red-700' : 'bg-amber-50 border border-amber-100 text-amber-700'
                        }`}>
                          {r.status === 'BORROWED' ? 'AKTIF' : r.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {r.status === 'BORROWED' || r.status === 'RENEWED' ? (
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleRenew(r.id)}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-[10px] font-bold rounded"
                              title="Perpanjang 7 Hari"
                            >
                              Renew ({r.renew_count})
                            </button>
                            <button
                              onClick={() => handleReturn(r.id, 'RETURNED')}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-150 text-emerald-700 text-[10px] font-bold rounded"
                            >
                              Kembalikan
                            </button>
                            <button
                              onClick={() => handleReturn(r.id, 'LOST')}
                              className="px-2 py-1 bg-red-50 hover:bg-red-600 hover:text-white border border-red-150 text-red-700 text-[10px] font-bold rounded"
                              title="Laporkan Hilang"
                            >
                              Hilang
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[10px] font-mono">Arsip Selesai</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DIGITAL LIBRARY */}
      {activeSubTab === 'digital' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Koleksi Media &amp; PDF</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {digitalBooksData.map(db => (
                <div key={db.id} className="bg-white border border-slate-200 p-4 rounded-xl flex gap-3 shadow-sm hover:border-slate-300 transition-colors">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg h-fit">
                    {db.type === 'PDF' && <FileDown className="h-5 w-5" />}
                    {db.type === 'EPUB' && <Bookmark className="h-5 w-5" />}
                    {db.type === 'VIDEO' && <Video className="h-5 w-5" />}
                    {db.type === 'AUDIO' && <Music className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 truncate">{db.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Oleh: {db.author} • {db.size}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 border rounded text-[8px] font-mono font-bold">{db.type}</span>
                      <a 
                        href={db.url}
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                      >
                        Buka Dokumen
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm h-fit">
            <h3 className="text-sm font-bold text-slate-800">Upload E-Book Baru</h3>
            <p className="text-[11px] text-slate-400">Unggah file materi PDF, EPUB, rekaman audio dars, atau video kajian pesantren.</p>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-blue-400 transition-all cursor-pointer">
              <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <span className="text-xs font-semibold text-blue-600 block">Klik atau Seret File</span>
              <span className="text-[10px] text-slate-400">PDF, EPUB, MP3, MP4 s.d. 50MB</span>
            </div>
          </div>
        </div>
      )}

      {/* FORM MODAL: BOOK CREATE / EDIT */}
      {showBookForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">
                {editingBook ? 'Edit Informasi Buku' : 'Tambah Katalog Buku Baru'}
              </h3>
              <button 
                onClick={() => setShowBookForm(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                Tutup
              </button>
            </div>
            <form onSubmit={handleSaveBook} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-slate-600 font-bold mb-1">Judul Buku *</label>
                  <input
                    type="text"
                    required
                    value={newBook.title || ''}
                    onChange={(e) => setNewBook({...newBook, title: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Contoh: Tafsir Jalalain Jilid 1"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Penulis / Pengarang *</label>
                  <input
                    type="text"
                    required
                    value={newBook.author || ''}
                    onChange={(e) => setNewBook({...newBook, author: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Imam Jalaluddin"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Penerbit</label>
                  <input
                    type="text"
                    value={newBook.publisher || ''}
                    onChange={(e) => setNewBook({...newBook, publisher: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Darul Kutub"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">ISBN</label>
                  <input
                    type="text"
                    value={newBook.isbn || ''}
                    onChange={(e) => setNewBook({...newBook, isbn: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="978-..."
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Kategori</label>
                  <select
                    value={newBook.category || 'Sains'}
                    onChange={(e) => setNewBook({...newBook, category: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="Sains">Sains &amp; Tech</option>
                    <option value="Agama">Kitab Agama</option>
                    <option value="Bahasa">Bahasa &amp; Kamus</option>
                    <option value="Sastra">Sastra &amp; Novel</option>
                    <option value="Filsafat">Filsafat &amp; Umum</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Lokasi Rak</label>
                  <input
                    type="text"
                    value={newBook.shelf || ''}
                    onChange={(e) => setNewBook({...newBook, shelf: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Rak A-1"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Jumlah Eksemplar *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newBook.stock ?? 5}
                    onChange={(e) => setNewBook({...newBook, stock: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowBookForm(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-sm"
                >
                  Simpan Buku
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FORM MODAL: BORROW */}
      {showBorrowForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">Formulir Sirkulasi Peminjaman</h3>
              <button 
                onClick={() => setShowBorrowForm(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                Tutup
              </button>
            </div>
            <form onSubmit={handleCreateBorrow} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Pilih Buku *</label>
                <select
                  value={newBorrow.book_id}
                  onChange={(e) => setNewBorrow({...newBorrow, book_id: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                >
                  {booksData.filter(b => b.stock > b.borrowed).map(b => (
                    <option key={b.id} value={b.id}>{b.title} (Sisa: {b.stock - b.borrowed} eks)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Nama Peminjam (Siswa / Santri) *</label>
                <input
                  type="text"
                  required
                  value={newBorrow.student_name}
                  onChange={(e) => setNewBorrow({...newBorrow, student_name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Nama Lengkap Siswa"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Durasi Peminjaman (Hari)</label>
                <select
                  value={newBorrow.due_days}
                  onChange={(e) => setNewBorrow({...newBorrow, due_days: parseInt(e.target.value) || 7})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value={3}>3 Hari (Koleksi Khusus)</option>
                  <option value={7}>7 Hari (Standar)</option>
                  <option value={14}>14 Hari (Dosen/Ustadz)</option>
                </select>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowBorrowForm(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-sm"
                >
                  Proses Pinjam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL IMPORT */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">Impor Katalog via CSV / Excel</h3>
              <button 
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                Tutup
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-500">Silakan unduh template CSV kami untuk memastikan struktur kolom sesuai sebelum mengunggah berkas.</p>
              
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-bold text-blue-800">Template Impor Buku</p>
                  <p className="text-[10px] text-blue-500">Struktur header: ID, Judul, ISBN, Penulis, Penerbit, Kategori, Rak, Stok</p>
                </div>
                <button 
                  onClick={() => {
                    const csvContent = "ID,Judul,ISBN,Penulis,Penerbit,Kategori,Rak,Stok\nbk-101,Hadits Arbain,978-1,Imam Nawawi,Gema Insani,Agama,Rak B-2,10";
                    const blob = new Blob([csvContent], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = "Template_Library_Import.csv";
                    a.click();
                  }}
                  className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold"
                >
                  Template
                </button>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Pilih File CSV</label>
                <input 
                  type="file" 
                  accept=".csv"
                  onChange={handleImportCSV}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Fallback Mock Data
const defaultBooks: BookItem[] = [
  { id: 'bk-1', title: 'Kitab Shahih Bukhari Jilid I', isbn: '978-602-12-1', author: 'Imam Al-Bukhari', publisher: 'Darul Kutub Al-Ilmiyah', category: 'Agama', shelf: 'Rak A-2', stock: 10, borrowed: 2, barcode: '885002138901', qr_code: 'QR-BUK01', status: 'TERSEDIA' },
  { id: 'bk-2', title: 'Matan Al-Jurumiyah', isbn: '978-602-12-2', author: 'Syeikh Ash-Shonhaji', publisher: 'Darul Ihsan', category: 'Agama', shelf: 'Rak A-3', stock: 40, borrowed: 10, barcode: '885002138902', qr_code: 'QR-JUR02', status: 'TERSEDIA' },
  { id: 'bk-3', title: 'Kimia Dasar Prinsip dan Terapan', isbn: '978-979-011-2', author: 'Petrucci', publisher: 'Erlangga', category: 'Sains', shelf: 'Rak C-1', stock: 8, borrowed: 8, barcode: '885002138903', qr_code: 'QR-KIM03', status: 'HABIS' },
  { id: 'bk-4', title: 'Laskar Pelangi', isbn: '978-979-306-2', author: 'Andrea Hirata', publisher: 'Bentang Pustaka', category: 'Sastra', shelf: 'Rak D-2', stock: 5, borrowed: 1, barcode: '885002138904', qr_code: 'QR-LAS04', status: 'TERSEDIA' },
  { id: 'bk-5', title: 'Kamus Besar Bahasa Indonesia V', isbn: '978-602-220-1', author: 'Tim Balai Pustaka', publisher: 'Balai Pustaka', category: 'Bahasa', shelf: 'Rak B-1', stock: 12, borrowed: 0, barcode: '885002138905', qr_code: 'QR-KBB05', status: 'TERSEDIA' }
];

const defaultBorrowings: BorrowRecord[] = [
  { id: 'brw-1', book_title: 'Kitab Shahih Bukhari Jilid I', student_name: 'Zaid Al-Khair', borrow_date: '2026-06-28', due_date: '2026-07-05', renew_count: 0, status: 'BORROWED', fine: 0 },
  { id: 'brw-2', book_title: 'Matan Al-Jurumiyah', student_name: 'Aisyah Humaira', borrow_date: '2026-06-15', due_date: '2026-06-22', return_date: '2026-06-22', renew_count: 1, status: 'RETURNED', fine: 0 },
  { id: 'brw-3', book_title: 'Kimia Dasar Prinsip dan Terapan', student_name: 'Farhan Ramadhan', borrow_date: '2026-06-10', due_date: '2026-06-17', renew_count: 0, status: 'LOST', fine: 100000 }
];

const defaultDigitalBooks: DigitalBook[] = [
  { id: 'db-1', title: 'Tafsir Ibnu Katsir Lengkap.pdf', author: 'Ibnu Katsir', type: 'PDF', url: '#', size: '18.4 MB' },
  { id: 'db-2', title: 'Al-Khulasoh Alfiyah Ibn Malik.epub', author: 'Syeikh Muhammad Al-Andalusi', type: 'EPUB', url: '#', size: '3.1 MB' },
  { id: 'db-3', title: 'Video Praktek Manasik Haji MTs.mp4', author: 'Divisi Humas', type: 'VIDEO', url: '#', size: '142 MB' },
  { id: 'db-4', title: 'Audio Murrotal Juz 30 Syeikh Mishary.mp3', author: 'Kurnia Media', type: 'AUDIO', url: '#', size: '45.2 MB' }
];
