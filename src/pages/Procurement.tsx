/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Check, 
  X, 
  FileText, 
  Truck, 
  CreditCard, 
  AlertTriangle,
  Download,
  Upload,
  Printer,
  FileSpreadsheet,
  Building2,
  DollarSign,
  UserCheck,
  FileDown
} from 'lucide-react';

interface ProcurementRequest {
  id: string;
  item_name: string;
  quantity: number;
  estimated_cost: number;
  requester: string;
  department: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PO_CREATED' | 'RECEIVED' | 'PAID';
  approved_by?: string;
  notes?: string;
}

interface PurchaseOrder {
  id: string;
  request_id: string;
  po_number: string;
  vendor_id: string;
  vendor_name: string;
  date: string;
  total_amount: number;
  status: 'SENT' | 'DELIVERED' | 'PAID';
}

interface Vendor {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  address: string;
}

export default function Procurement() {
  const queryClient = useQueryClient();
  
  // Tab states
  const [activeSubTab, setActiveSubTab] = useState<'requests' | 'orders' | 'vendors'>('requests');
  const [searchQuery, setSearchQuery] = useState('');

  // Form Modals
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [newRequest, setNewRequest] = useState({
    item_name: '',
    quantity: 1,
    estimated_cost: 100000,
    department: 'Sarpras',
    notes: '',
  });

  const [showPOForm, setShowPOForm] = useState(false);
  const [selectedReqForPO, setSelectedReqForPO] = useState<ProcurementRequest | null>(null);
  const [newPO, setNewPO] = useState({
    vendor_id: 'v-1',
    po_number: '',
  });

  // Vendor Modal Form
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [newVendor, setNewVendor] = useState({
    name: '',
    contact_person: '',
    phone: '',
    address: ''
  });

  // Queries
  const { data: requestsData = [], isLoading: isLoadingRequests } = useQuery<ProcurementRequest[]>({
    queryKey: ['procurementRequestsList'],
    queryFn: async () => {
      try {
        const res = await apiClient.post('/api/action?action=getProcurementRequestsList');
        if (res.data.success && res.data.data) {
          return res.data.data;
        }
      } catch (e) {
        console.warn("API fallback used for procurement requests");
      }
      return defaultRequests;
    }
  });

  const { data: ordersData = [], isLoading: isLoadingOrders } = useQuery<PurchaseOrder[]>({
    queryKey: ['purchaseOrdersList'],
    queryFn: async () => {
      try {
        const res = await apiClient.post('/api/action?action=getPurchaseOrdersList');
        if (res.data.success && res.data.data) {
          return res.data.data;
        }
      } catch (e) {
        console.warn("API fallback used for purchase orders");
      }
      return defaultOrders;
    }
  });

  const { data: vendorsData = [], isLoading: isLoadingVendors } = useQuery<Vendor[]>({
    queryKey: ['vendorsList'],
    queryFn: async () => {
      try {
        const res = await apiClient.post('/api/action?action=getVendorsList');
        if (res.data.success && res.data.data) {
          return res.data.data;
        }
      } catch (e) {
        console.warn("API fallback used for vendors");
      }
      return defaultVendors;
    }
  });

  // Mutations
  const createRequestMutation = useMutation({
    mutationFn: async (payload: typeof newRequest) => {
      return apiClient.post('/api/action?action=createProcurementRequest', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procurementRequestsList'] });
      setShowRequestForm(false);
    }
  });

  const approveRequestMutation = useMutation({
    mutationFn: async (payload: { id: string; status: 'APPROVED' | 'REJECTED' }) => {
      return apiClient.post('/api/action?action=approveProcurementRequest', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procurementRequestsList'] });
    }
  });

  const createPOMutation = useMutation({
    mutationFn: async (payload: { requestId: string; vendorId: string; poNumber: string }) => {
      return apiClient.post('/api/action?action=createPurchaseOrder', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrdersList'] });
      queryClient.invalidateQueries({ queryKey: ['procurementRequestsList'] });
      setShowPOForm(false);
      setSelectedReqForPO(null);
    }
  });

  const deliverPOMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.post('/api/action?action=receivePurchaseOrderItems', { poId: id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrdersList'] });
      queryClient.invalidateQueries({ queryKey: ['procurementRequestsList'] });
    }
  });

  const createVendorMutation = useMutation({
    mutationFn: async (payload: typeof newVendor) => {
      return apiClient.post('/api/action?action=createVendor', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorsList'] });
      setShowVendorForm(false);
    }
  });

  // Actions
  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    createRequestMutation.mutate(newRequest);
  };

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReqForPO) return;
    createPOMutation.mutate({
      requestId: selectedReqForPO.id,
      vendorId: newPO.vendor_id,
      poNumber: newPO.po_number || 'PO-' + Math.floor(100000 + Math.random() * 900000)
    });
  };

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    createVendorMutation.mutate(newVendor);
  };

  const exportToCSV = () => {
    let content = "ID,Nama Barang,Jumlah,Estimasi Biaya,Peminta,Status,Tanggal\n";
    requestsData.forEach(item => {
      content += `"${item.id}","${item.item_name}",${item.quantity},${item.estimated_cost},"${item.requester}","${item.status}","${item.date}"\n`;
    });
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Laporan_Procurement_Requests.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans text-slate-700">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-550/10 rounded-lg text-indigo-600">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                Modul Pengadaan &amp; Pembelian (Enterprise Procurement)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Mengelola Purchase Request, Purchase Order, Pengiriman Barang, Pendaftaran Vendor, dan Audit Persetujuan Direktur Keuangan.
              </p>
            </div>
          </div>
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
            onClick={() => {
              setNewVendor({ name: '', contact_person: '', phone: '', address: '' });
              setShowVendorForm(true);
            }}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Building2 className="h-4 w-4 text-slate-600" />
            <span>Daftar Supplier / Vendor</span>
          </button>
          <button 
            onClick={() => {
              setNewRequest({
                item_name: '',
                quantity: 1,
                estimated_cost: 100000,
                department: 'Sarpras',
                notes: '',
              });
              setShowRequestForm(true);
            }}
            className="px-3.5 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Buat Request Baru</span>
          </button>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Permintaan</p>
            <p className="text-lg font-extrabold text-slate-850">{requestsData.length} Pengajuan</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Butuh Persetujuan</p>
            <p className="text-lg font-extrabold text-amber-600">
              {requestsData.filter(r => r.status === 'PENDING').length} Request
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-lg">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">PO Terkirim / Dikirim</p>
            <p className="text-lg font-extrabold text-sky-600">
              {ordersData.filter(o => o.status === 'SENT').length} PO Active
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Check className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Penerimaan</p>
            <p className="text-lg font-extrabold text-emerald-600">
              {ordersData.filter(o => o.status === 'DELIVERED' || o.status === 'PAID').length} Sukses
            </p>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveSubTab('requests')}
          className={`pb-3 text-sm font-semibold relative cursor-pointer transition-all ${
            activeSubTab === 'requests' ? 'text-indigo-600 border-b-2 border-indigo-500 font-bold' : 'text-slate-450 hover:text-slate-600'
          }`}
        >
          Purchase Request (Permintaan Pengadaan)
        </button>
        <button
          onClick={() => setActiveSubTab('orders')}
          className={`pb-3 text-sm font-semibold relative cursor-pointer transition-all ${
            activeSubTab === 'orders' ? 'text-indigo-600 border-b-2 border-indigo-500 font-bold' : 'text-slate-450 hover:text-slate-600'
          }`}
        >
          Purchase Order (Pesanan Pembelian)
        </button>
        <button
          onClick={() => setActiveSubTab('vendors')}
          className={`pb-3 text-sm font-semibold relative cursor-pointer transition-all ${
            activeSubTab === 'vendors' ? 'text-indigo-600 border-b-2 border-indigo-500 font-bold' : 'text-slate-450 hover:text-slate-600'
          }`}
        >
          Daftar Rekanan Vendor
        </button>
      </div>

      {/* TAB VIEW: 1. PROCUREMENT REQUESTS */}
      {activeSubTab === 'requests' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="p-3.5">Nama Barang / Unit Pengusul</th>
                    <th className="p-3.5">Jumlah Qty</th>
                    <th className="p-3.5">Estimasi Harga Unit</th>
                    <th className="p-3.5">Total Pengajuan</th>
                    <th className="p-3.5">Pengusul / Tanggal</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Aksi Persetujuan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {isLoadingRequests ? (
                    <tr>
                      <td colSpan={7} className="text-center p-8 text-slate-400">Menghubungkan audit log...</td>
                    </tr>
                  ) : requestsData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center p-8 text-slate-400">Belum ada pengajuan pengadaan barang.</td>
                    </tr>
                  ) : requestsData.map(req => (
                    <tr key={req.id} className="hover:bg-slate-50/50">
                      <td className="p-3.5">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{req.item_name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Unit: {req.department}</p>
                        </div>
                      </td>
                      <td className="p-3.5 font-bold text-slate-700">{req.quantity} Pcs</td>
                      <td className="p-3.5 font-semibold text-slate-600">Rp {req.estimated_cost.toLocaleString('id-ID')}</td>
                      <td className="p-3.5 font-extrabold text-slate-800">Rp {(req.quantity * req.estimated_cost).toLocaleString('id-ID')}</td>
                      <td className="p-3.5">
                        <div>
                          <p className="font-semibold text-slate-700">{req.requester}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{req.date}</p>
                        </div>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          req.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          req.status === 'APPROVED' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                          req.status === 'RECEIVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          req.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                          'bg-slate-50 text-slate-600 border border-slate-100'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex justify-end gap-1.5">
                          {req.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => approveRequestMutation.mutate({ id: req.id, status: 'APPROVED' })}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold shadow-sm flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="h-3 w-3" />
                                <span>Setuju</span>
                              </button>
                              <button
                                onClick={() => approveRequestMutation.mutate({ id: req.id, status: 'REJECTED' })}
                                className="px-2 py-1 bg-rose-550/10 hover:bg-rose-600 hover:text-white text-rose-700 rounded text-[10px] font-bold cursor-pointer"
                              >
                                Tolak
                              </button>
                            </>
                          )}
                          {req.status === 'APPROVED' && (
                            <button
                              onClick={() => {
                                setSelectedReqForPO(req);
                                setNewPO({
                                  vendor_id: vendorsData[0]?.id || 'v-1',
                                  po_number: 'PO-' + Math.floor(100000 + Math.random() * 900000)
                                });
                                setShowPOForm(true);
                              }}
                              className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold shadow-sm flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="h-3 w-3" />
                              <span>Buat PO</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB VIEW: 2. PURCHASE ORDERS */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-slate-50">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Daftar Purchase Order &amp; Penerimaan Barang</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="p-3.5">No Purchase Order</th>
                    <th className="p-3.5">Nama Vendor / Rekanan</th>
                    <th className="p-3.5">Tanggal Penerbitan</th>
                    <th className="p-3.5 font-bold">Total Nilai Pembelian</th>
                    <th className="p-3.5 text-center">Status Transaksi</th>
                    <th className="p-3.5 text-right">Aliran Penerimaan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {ordersData.map(po => {
                    return (
                      <tr key={po.id} className="hover:bg-slate-50/50">
                        <td className="p-3.5 font-mono font-bold text-slate-800">{po.po_number}</td>
                        <td className="p-3.5 font-semibold text-slate-700">{po.vendor_name}</td>
                        <td className="p-3.5 text-slate-500">{po.date}</td>
                        <td className="p-3.5 font-extrabold text-indigo-600">Rp {po.total_amount.toLocaleString('id-ID')}</td>
                        <td className="p-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            po.status === 'SENT' ? 'bg-sky-50 text-sky-700 border border-sky-100' :
                            'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}>
                            {po.status === 'SENT' ? 'DIKIRIM / DIPROSES' : 'BARANG DITERIMA'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          {po.status === 'SENT' && (
                            <button
                              onClick={() => deliverPOMutation.mutate(po.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold shadow-sm flex items-center gap-1.5 ml-auto cursor-pointer"
                            >
                              <Truck className="h-3 w-3" />
                              <span>Konfirmasi Penerimaan Barang</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB VIEW: 3. REKANAN VENDORS */}
      {activeSubTab === 'vendors' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-slate-50">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Direktori Vendor Terdaftar</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-150 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="p-3.5">Nama Vendor</th>
                  <th className="p-3.5">Contact Person</th>
                  <th className="p-3.5">Nomor Handphone</th>
                  <th className="p-3.5">Alamat Kantor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {vendorsData.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50/50">
                    <td className="p-3.5 font-bold text-slate-800">{v.name}</td>
                    <td className="p-3.5 font-medium text-slate-700">{v.contact_person}</td>
                    <td className="p-3.5 font-mono text-slate-500">{v.phone}</td>
                    <td className="p-3.5 text-slate-400 max-w-sm truncate">{v.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FORM MODAL: CREATE REQUEST */}
      {showRequestForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">Buat Pengajuan Pengadaan Barang</h3>
              <button 
                onClick={() => setShowRequestForm(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                Tutup
              </button>
            </div>
            <form onSubmit={handleCreateRequest} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Nama Barang / Logistik / Sarpras *</label>
                <input
                  type="text"
                  required
                  value={newRequest.item_name}
                  onChange={(e) => setNewRequest({ ...newRequest, item_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  placeholder="Contoh: Kertas HVS Sidu F4 80g"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Kuantitas / Jumlah *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newRequest.quantity}
                    onChange={(e) => setNewRequest({ ...newRequest, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none font-bold text-slate-850"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Estimasi Harga Unit (Rp) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newRequest.estimated_cost}
                    onChange={(e) => setNewRequest({ ...newRequest, estimated_cost: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none font-bold text-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Unit Pengusul *</label>
                  <select
                    value={newRequest.department}
                    onChange={(e) => setNewRequest({ ...newRequest, department: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-white font-semibold"
                  >
                    <option value="Sarpras">Sarana Prasana</option>
                    <option value="IT">Teknologi Informasi</option>
                    <option value="Perpustakaan">Perpustakaan</option>
                    <option value="Lab IPA">Laboratorium IPA</option>
                    <option value="Asrama">Gedung Asrama</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Keterangan / Alasan Pengadaan *</label>
                <textarea
                  required
                  value={newRequest.notes}
                  onChange={(e) => setNewRequest({ ...newRequest, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none h-20"
                  placeholder="Tulis alasan, contoh: Kertas habis untuk pengerjaan ujian semester ganjil."
                />
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowRequestForm(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-sm"
                >
                  Ajukan Pengadaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FORM MODAL: CREATE PURCHASE ORDER */}
      {showPOForm && selectedReqForPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">Penerbitan Purchase Order (PO)</h3>
              <button 
                onClick={() => {
                  setShowPOForm(false);
                  setSelectedReqForPO(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                Tutup
              </button>
            </div>
            <form onSubmit={handleCreatePO} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                <p className="font-bold text-indigo-950">{selectedReqForPO.item_name}</p>
                <p className="text-[10px] text-indigo-700 mt-1 font-bold">Qty: {selectedReqForPO.quantity} | Total: Rp {(selectedReqForPO.quantity * selectedReqForPO.estimated_cost).toLocaleString('id-ID')}</p>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Pilih Vendor Rekanan *</label>
                <select
                  value={newPO.vendor_id}
                  onChange={(e) => setNewPO({ ...newPO, vendor_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-white font-semibold text-slate-700"
                >
                  {vendorsData.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Nomor Purchase Order (PO) *</label>
                <input
                  type="text"
                  required
                  value={newPO.po_number}
                  onChange={(e) => setNewPO({ ...newPO, po_number: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none font-mono font-bold"
                  placeholder="PO-XXXXXX"
                />
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowPOForm(false);
                    setSelectedReqForPO(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-sm"
                >
                  Kirim PO ke Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FORM MODAL: VENDOR */}
      {showVendorForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">Daftarkan Rekanan Supplier</h3>
              <button 
                onClick={() => setShowVendorForm(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                Tutup
              </button>
            </div>
            <form onSubmit={handleCreateVendor} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Nama Perusahaan / Toko *</label>
                <input
                  type="text"
                  required
                  value={newVendor.name}
                  onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  placeholder="Contoh: PT ATK Indonesia Mandiri"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Nama Penghubung / CP *</label>
                  <input
                    type="text"
                    required
                    value={newVendor.contact_person}
                    onChange={(e) => setNewVendor({ ...newVendor, contact_person: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                    placeholder="Contoh: Muzakki"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Nomor Handphone WA *</label>
                  <input
                    type="text"
                    required
                    value={newVendor.phone}
                    onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none font-mono"
                    placeholder="Contoh: 0812XXXXXXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Alamat Lengkap Kantor *</label>
                <textarea
                  required
                  value={newVendor.address}
                  onChange={(e) => setNewVendor({ ...newVendor, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none h-20"
                  placeholder="Tulis alamat kantor atau gudang supplier..."
                />
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowVendorForm(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-sm"
                >
                  Simpan Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

const defaultRequests: ProcurementRequest[] = [
  { id: 'prq-1', item_name: 'Printer HP LaserJet Pro M404dn', quantity: 2, estimated_cost: 4500000, requester: 'Siti Rahmawati', department: 'Sarpras', date: '2026-07-01', status: 'PENDING' },
  { id: 'prq-2', item_name: 'Kertas HVS Sinar Dunia F4 70gr', quantity: 50, estimated_cost: 55000, requester: 'Ustadz Munir', department: 'Perpustakaan', date: '2026-07-02', status: 'APPROVED' },
  { id: 'prq-3', item_name: 'LCD Proyektor BenQ MX550', quantity: 3, estimated_cost: 6500000, requester: 'Dwi Lestari', department: 'IT', date: '2026-06-28', status: 'RECEIVED' }
];

const defaultOrders: PurchaseOrder[] = [
  { id: 'po-1', request_id: 'prq-2', po_number: 'PO-2026-991', vendor_id: 'v-1', vendor_name: 'Toko ATK Jaya Mulia', date: '2026-07-03', total_amount: 2750000, status: 'SENT' },
  { id: 'po-2', request_id: 'prq-3', po_number: 'PO-2026-990', vendor_id: 'v-2', vendor_name: 'PT Computindo Solusi', date: '2026-06-29', total_amount: 19500000, status: 'DELIVERED' }
];

const defaultVendors: Vendor[] = [
  { id: 'v-1', name: 'Toko ATK Jaya Mulia', contact_person: 'Koh Alim', phone: '08123456789', address: 'Jl. Pemuda No. 45 Semarang' },
  { id: 'v-2', name: 'PT Computindo Solusi', contact_person: 'Andi Wijaya', phone: '08567891234', address: 'Kawasan Ruko Kelapa Gading Blok A-12 Jakarta' }
];
