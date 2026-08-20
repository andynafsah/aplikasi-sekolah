/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, CreditCard, Plus, Edit, Trash2, Search, Filter, 
  Download, Send, CheckCircle, AlertTriangle, RefreshCw, X, 
  Receipt, DollarSign, Users, Award, Bell, MessageSquare, 
  ArrowDownLeft, ArrowUpRight, Scale, Info, Check, ShieldCheck,
  Layers, Printer
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell 
} from 'recharts';
import EnterpriseDocumentEngine from '../components/EnterpriseDocumentEngine';

export default function BillingSpp() {
  const { tenant, token } = useAuth();
  
  // Tab states: DASHBOARD, INVOICES, MASTER_TARIF, TABUNGAN, REKONSILIASI, CICILAN_REFUND, APPROVALS, GATEWAY, NOTIFIKASI
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'INVOICES' | 'MASTER_TARIF' | 'TABUNGAN' | 'REKONSILIASI' | 'CICILAN_REFUND' | 'APPROVALS' | 'GATEWAY' | 'NOTIFIKASI'>('DASHBOARD');
  
  // Master sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<'TARIF' | 'AUTO_RULES' | 'DISKON' | 'DENDA' | 'REKENING'>('TARIF');

  // Data States
  const [invoices, setInvoices] = useState<any[]>([]);
  const [feeTypes, setFeeTypes] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [savings, setSavings] = useState<any[]>([]);
  const [savingsTxs, setSavingsTxs] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  
  // New Master Data States
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [fines, setFines] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [virtualAccounts, setVirtualAccounts] = useState<any[]>([]);
  const [autoBillingRules, setAutoBillingRules] = useState<any[]>([]);

  // Advanced Billing Engines States
  const [gatewayConfig, setGatewayConfig] = useState<any>({
    activeGateway: 'XENDIT',
    midtransClientKey: 'SB-Mid-client-XXXXX',
    xenditPublicKey: 'xnd_public_XXXXX',
    duitkuMerchantCode: 'DXXXXX',
    tripayApiKey: 'TXXXXX',
    sandboxMode: true
  });
  const [installments, setInstallments] = useState<any[]>([]);
  const [refunds, setRefunds] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [bankMutations, setBankMutations] = useState<any[]>([]);

  // Modals / Inputs
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [selectedInvoiceForInstallment, setSelectedInvoiceForInstallment] = useState<any>(null);
  const [installmentCount, setInstallmentCount] = useState(3);

  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedPaymentForRefund, setSelectedPaymentForRefund] = useState<any>(null);
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundReason, setRefundReason] = useState('');

  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalType, setApprovalType] = useState('DISCOUNT');
  const [approvalInvoiceId, setApprovalInvoiceId] = useState('');
  const [approvalAmount, setApprovalAmount] = useState(0);
  const [approvalReason, setApprovalReason] = useState('');

  // Bulk Invoice Selection State
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);

  // Loading & Sync States
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Search & Filter States
  const [invSearch, setInvSearch] = useState('');
  const [invStatusFilter, setInvStatusFilter] = useState('ALL');
  const [invClassFilter, setInvClassFilter] = useState('ALL');
  const [savSearch, setSavSearch] = useState('');

  // Modals States
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showDocEngine, setShowDocEngine] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  
  // New Modals States
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showFineModal, setShowFineModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showVaModal, setShowVaModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);

  // Form Fields / Temp States
  const [editingType, setEditingType] = useState<any>(null);
  const [editingDiscount, setEditingDiscount] = useState<any>(null);
  const [editingFine, setEditingFine] = useState<any>(null);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  // Generate Tagihan Form
  const [genTarget, setGenTarget] = useState<'ALL' | 'CLASS' | 'SINGLE'>('ALL');
  const [genFeeType, setGenFeeType] = useState('');
  const [genClassId, setGenClassId] = useState('');
  const [genStudentId, setGenStudentId] = useState('');
  const [genDueDate, setGenDueDate] = useState('');
  const [genCustomAmount, setGenCustomAmount] = useState('');
  const [genDesc, setGenDesc] = useState('');

  // Master Jenis Tagihan Form
  const [typeName, setTypeName] = useState('');
  const [typeAmount, setTypeAmount] = useState('');
  const [typeFrequency, setTypeFrequency] = useState<'MONTHLY' | 'ONE_TIME'>('MONTHLY');
  const [typeCode, setTypeCode] = useState('');
  const [typeMandatory, setTypeMandatory] = useState(true);

  // New Forms Fields
  // 1. Discount Form
  const [discName, setDiscName] = useState('');
  const [discCode, setDiscCode] = useState('');
  const [discType, setDiscType] = useState<'FIXED' | 'PERCENTAGE'>('FIXED');
  const [discAmount, setDiscAmount] = useState('');
  const [discDesc, setDiscDesc] = useState('');

  // 2. Fine Form
  const [fnName, setFnName] = useState('');
  const [fnCode, setFnCode] = useState('');
  const [fnType, setFnType] = useState<'FIXED' | 'PERCENTAGE'>('FIXED');
  const [fnAmount, setFnAmount] = useState('');
  const [fnGrace, setFnGrace] = useState('');
  const [fnDesc, setFnDesc] = useState('');

  // 3. Bank Account Form
  const [bnkName, setBnkName] = useState('');
  const [bnkNumber, setBnkNumber] = useState('');
  const [bnkHolder, setBnkHolder] = useState('');
  const [bnkBranch, setBnkBranch] = useState('');

  // 4. Virtual Account Form
  const [vaStudentId, setVaStudentId] = useState('');
  const [vaBankName, setVaBankName] = useState('Bank Muamalat');
  const [vaType, setVaType] = useState('SPP');
  const [vaNumber, setVaNumber] = useState('');

  // 5. Auto Billing Rule Form
  const [ruleName, setRuleName] = useState('');
  const [ruleEvent, setRuleEvent] = useState('NEW_STUDENT');
  const [ruleFeeTypeId, setRuleFeeTypeId] = useState('');
  const [ruleDesc, setRuleDesc] = useState('');

  // Pembayaran Manual / Kasir Form
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<'CASH' | 'TRANSFER' | 'TABUNGAN' | 'EDC'>('CASH');

  // Adjusment Diskon, Denda, Beasiswa Form
  const [adjDiscount, setAdjDiscount] = useState('');
  const [adjFine, setAdjFine] = useState('');
  const [adjScholarship, setAdjScholarship] = useState('');
  const [adjDesc, setAdjDesc] = useState('');

  // Tabungan Form
  const [savStudentId, setSavStudentId] = useState('');
  const [savType, setSavType] = useState<'DEPOSIT' | 'WITHDRAWAL'>('DEPOSIT');
  const [savAmount, setSavAmount] = useState('');
  const [savDesc, setSavDesc] = useState('');

  // Show Toast Helper
  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // API Call Dispatcher
  const apiDispatch = async (action: string, payload: any = {}) => {
    try {
      const res = await fetch('/api/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action, ...payload })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Error executing request');
      }
      return json.data;
    } catch (err: any) {
      console.error(err);
      triggerToast(err.message || 'Koneksi gagal', 'error');
      return null;
    }
  };

  // Load all initial data
  const loadData = async () => {
    setLoading(true);
    
    // Load Students & Classrooms from Sivitas and Academic
    const stds = await apiDispatch('getStudents');
    if (stds) setStudents(stds);

    const classes = await apiDispatch('getClassrooms');
    if (classes) setClassrooms(classes);

    // Load Billing specific data
    const types = await apiDispatch('getFeeTypes');
    if (types) setFeeTypes(types);

    const invs = await apiDispatch('getFeeInvoices');
    if (invs) setInvoices(invs);

    const savs = await apiDispatch('getStudentSavings');
    if (savs) setSavings(savs);

    const txs = await apiDispatch('getSavingsTransactions');
    if (txs) setSavingsTxs(txs);

    const notifs = await apiDispatch('getSentNotifications');
    if (notifs) setNotifications(notifs);

    // Load New Master Data
    const discs = await apiDispatch('getFeeDiscounts');
    if (discs) setDiscounts(discs);

    const fns = await apiDispatch('getFeeFines');
    if (fns) setFines(fns);

    const accounts = await apiDispatch('getBankAccounts');
    if (accounts) setBankAccounts(accounts);

    const vas = await apiDispatch('getVirtualAccounts');
    if (vas) setVirtualAccounts(vas);

    const rules = await apiDispatch('getAutoBillingRules');
    if (rules) setAutoBillingRules(rules);

    // Load Advanced Billing data
    const gw = await apiDispatch('getGatewayConfig');
    if (gw) setGatewayConfig(gw);

    const insts = await apiDispatch('getInstallmentSchedules');
    if (insts) setInstallments(insts);

    const refs = await apiDispatch('getRefunds');
    if (refs) setRefunds(refs);

    const apps = await apiDispatch('getApprovals');
    if (apps) setApprovals(apps);

    const muts = await apiDispatch('getBankMutations');
    if (muts) setBankMutations(muts);

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- ACTIONS HANDLERS ---

  // 1. Create / Update Master Tarif
  const handleSaveType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeName || !typeAmount) {
      triggerToast('Nama dan Nominal wajib diisi', 'error');
      return;
    }
    setActionLoading(true);
    
    if (editingType) {
      const updated = await apiDispatch('updateFeeType', {
        id: editingType.id,
        name: typeName,
        amount: Number(typeAmount),
        frequency: typeFrequency,
        code: typeCode,
        is_mandatory: typeMandatory
      });
      if (updated) {
        triggerToast('Tarif tagihan berhasil diperbarui');
        setShowTypeModal(false);
        loadData();
      }
    } else {
      const added = await apiDispatch('createFeeType', {
        name: typeName,
        amount: Number(typeAmount),
        frequency: typeFrequency,
        code: typeCode,
        is_mandatory: typeMandatory
      });
      if (added) {
        triggerToast('Tarif tagihan baru sukses ditambahkan');
        setShowTypeModal(false);
        loadData();
      }
    }
    setActionLoading(false);
  };

  // Open Edit Master Tarif Modal
  const openEditType = (type: any) => {
    setEditingType(type);
    setTypeName(type.name);
    setTypeAmount(type.amount);
    setTypeFrequency(type.frequency);
    setTypeCode(type.code || '');
    setTypeMandatory(type.is_mandatory !== false);
    setShowTypeModal(true);
  };

  // Delete Master Tarif
  const handleDeleteType = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus jenis tarif tagihan ini?')) return;
    setActionLoading(true);
    const success = await apiDispatch('deleteFeeType', { id });
    if (success) {
      triggerToast('Tarif tagihan berhasil dihapus');
      loadData();
    }
    setActionLoading(false);
  };

  // --- NEW MASTER CRUD HANDLERS ---
  
  // 1. DISCOUNTS
  const handleSaveDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discName || !discAmount) {
      triggerToast('Nama dan Nominal/Persen wajib diisi', 'error');
      return;
    }
    setActionLoading(true);
    if (editingDiscount) {
      const updated = await apiDispatch('updateFeeDiscount', {
        id: editingDiscount.id,
        name: discName,
        code: discCode,
        type: discType,
        amount: Number(discAmount),
        description: discDesc
      });
      if (updated) {
        triggerToast('Potongan/Diskon berhasil diperbarui');
        setShowDiscountModal(false);
        loadData();
      }
    } else {
      const added = await apiDispatch('createFeeDiscount', {
        name: discName,
        code: discCode,
        type: discType,
        amount: Number(discAmount),
        description: discDesc
      });
      if (added) {
        triggerToast('Potongan/Diskon baru sukses ditambahkan');
        setShowDiscountModal(false);
        loadData();
      }
    }
    setActionLoading(false);
  };

  const openAddDiscount = () => {
    setEditingDiscount(null);
    setDiscName('');
    setDiscCode('');
    setDiscType('FIXED');
    setDiscAmount('');
    setDiscDesc('');
    setShowDiscountModal(true);
  };

  const openEditDiscount = (disc: any) => {
    setEditingDiscount(disc);
    setDiscName(disc.name);
    setDiscCode(disc.code || '');
    setDiscType(disc.type || 'FIXED');
    setDiscAmount(String(disc.amount));
    setDiscDesc(disc.description || '');
    setShowDiscountModal(true);
  };

  const handleDeleteDiscount = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus diskon ini?')) return;
    setActionLoading(true);
    const success = await apiDispatch('deleteFeeDiscount', { id });
    if (success) {
      triggerToast('Diskon berhasil dihapus');
      loadData();
    }
    setActionLoading(false);
  };

  // 2. FINES
  const handleSaveFine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fnName || !fnAmount) {
      triggerToast('Nama dan Nominal wajib diisi', 'error');
      return;
    }
    setActionLoading(true);
    if (editingFine) {
      const updated = await apiDispatch('updateFeeFine', {
        id: editingFine.id,
        name: fnName,
        code: fnCode,
        type: fnType,
        amount: Number(fnAmount),
        grace_period: Number(fnGrace || 0),
        description: fnDesc
      });
      if (updated) {
        triggerToast('Aturan denda berhasil diperbarui');
        setShowFineModal(false);
        loadData();
      }
    } else {
      const added = await apiDispatch('createFeeFine', {
        name: fnName,
        code: fnCode,
        type: fnType,
        amount: Number(fnAmount),
        grace_period: Number(fnGrace || 0),
        description: fnDesc
      });
      if (added) {
        triggerToast('Aturan denda baru sukses ditambahkan');
        setShowFineModal(false);
        loadData();
      }
    }
    setActionLoading(false);
  };

  const openAddFine = () => {
    setEditingFine(null);
    setFnName('');
    setFnCode('');
    setFnType('FIXED');
    setFnAmount('');
    setFnGrace('5');
    setFnDesc('');
    setShowFineModal(true);
  };

  const openEditFine = (fine: any) => {
    setEditingFine(fine);
    setFnName(fine.name);
    setFnCode(fine.code || '');
    setFnType(fine.type || 'FIXED');
    setFnAmount(String(fine.amount));
    setFnGrace(String(fine.grace_period || 0));
    setFnDesc(fine.description || '');
    setShowFineModal(true);
  };

  const handleDeleteFine = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus aturan denda ini?')) return;
    setActionLoading(true);
    const success = await apiDispatch('deleteFeeFine', { id });
    if (success) {
      triggerToast('Aturan denda berhasil dihapus');
      loadData();
    }
    setActionLoading(false);
  };

  // 3. BANK ACCOUNTS
  const handleSaveBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bnkName || !bnkNumber || !bnkHolder) {
      triggerToast('Nama Bank, No Rekening, dan Pemilik wajib diisi', 'error');
      return;
    }
    setActionLoading(true);
    if (editingAccount) {
      const updated = await apiDispatch('updateBankAccount', {
        id: editingAccount.id,
        bank_name: bnkName,
        account_number: bnkNumber,
        holder_name: bnkHolder,
        branch: bnkBranch
      });
      if (updated) {
        triggerToast('Rekening bank berhasil diperbarui');
        setShowAccountModal(false);
        loadData();
      }
    } else {
      const added = await apiDispatch('createBankAccount', {
        bank_name: bnkName,
        account_number: bnkNumber,
        holder_name: bnkHolder,
        branch: bnkBranch
      });
      if (added) {
        triggerToast('Rekening bank baru sukses didaftarkan');
        setShowAccountModal(false);
        loadData();
      }
    }
    setActionLoading(false);
  };

  const openAddAccount = () => {
    setEditingAccount(null);
    setBnkName('');
    setBnkNumber('');
    setBnkHolder('');
    setBnkBranch('');
    setShowAccountModal(true);
  };

  const openEditAccount = (acc: any) => {
    setEditingAccount(acc);
    setBnkName(acc.bank_name);
    setBnkNumber(acc.account_number);
    setBnkHolder(acc.holder_name);
    setBnkBranch(acc.branch || '');
    setShowAccountModal(true);
  };

  const handleDeleteAccount = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus rekening bank ini?')) return;
    setActionLoading(true);
    const success = await apiDispatch('deleteBankAccount', { id });
    if (success) {
      triggerToast('Rekening bank berhasil dinonaktifkan');
      loadData();
    }
    setActionLoading(false);
  };

  // 4. VIRTUAL ACCOUNTS
  const handleSaveVa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaStudentId) {
      triggerToast('Pilih Siswa terlebih dahulu', 'error');
      return;
    }
    setActionLoading(true);
    const added = await apiDispatch('createVirtualAccount', {
      student_id: vaStudentId,
      bank_name: vaBankName,
      type: vaType,
      va_number: vaNumber || undefined
    });
    if (added) {
      triggerToast('Virtual Account sukses di-generate');
      setShowVaModal(false);
      setVaStudentId('');
      setVaNumber('');
      loadData();
    }
    setActionLoading(false);
  };

  const handleDeleteVa = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus Virtual Account ini?')) return;
    setActionLoading(true);
    const success = await apiDispatch('deleteVirtualAccount', { id });
    if (success) {
      triggerToast('Virtual Account berhasil dihapus');
      loadData();
    }
    setActionLoading(false);
  };

  // 5. AUTO BILLING RULES
  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName || !ruleFeeTypeId) {
      triggerToast('Nama Aturan dan Jenis Tagihan wajib diisi', 'error');
      return;
    }
    setActionLoading(true);
    if (editingRule) {
      const updated = await apiDispatch('updateAutoBillingRule', {
        id: editingRule.id,
        name: ruleName,
        trigger_event: ruleEvent,
        fee_type_id: ruleFeeTypeId,
        description: ruleDesc
      });
      if (updated) {
        triggerToast('Aturan auto-billing berhasil diperbarui');
        setShowRuleModal(false);
        loadData();
      }
    } else {
      const added = await apiDispatch('createAutoBillingRule', {
        name: ruleName,
        trigger_event: ruleEvent,
        fee_type_id: ruleFeeTypeId,
        description: ruleDesc
      });
      if (added) {
        triggerToast('Aturan auto-billing sukses didaftarkan');
        setShowRuleModal(false);
        loadData();
      }
    }
    setActionLoading(false);
  };

  const openAddRule = () => {
    setEditingRule(null);
    setRuleName('');
    setRuleEvent('NEW_STUDENT');
    setRuleFeeTypeId('');
    setRuleDesc('');
    setShowRuleModal(true);
  };

  const openEditRule = (rule: any) => {
    setEditingRule(rule);
    setRuleName(rule.name);
    setRuleEvent(rule.trigger_event);
    setRuleFeeTypeId(rule.fee_type_id);
    setRuleDesc(rule.description || '');
    setShowRuleModal(true);
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus aturan auto-billing ini?')) return;
    setActionLoading(true);
    const success = await apiDispatch('deleteAutoBillingRule', { id });
    if (success) {
      triggerToast('Aturan auto-billing berhasil dihapus');
      loadData();
    }
    setActionLoading(false);
  };

  // Trigger Simule Auto-Billing Event
  const handleSimulateAutoBilling = async (event: string) => {
    setActionLoading(true);
    const res = await apiDispatch('simulateAutoBillingEvent', { event });
    if (res) {
      triggerToast(res.message || `Sukses mengeksekusi aturan auto-billing untuk event ${event}`, 'info');
      loadData();
    }
    setActionLoading(false);
  };

  // --- BULK ACTION HANDLERS ---
  const handleToggleSelectAllInvoices = (filtered: any[]) => {
    const visibleIds = filtered.map(f => f.id);
    const allSelected = visibleIds.every(id => selectedInvoiceIds.includes(id));
    if (allSelected) {
      setSelectedInvoiceIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedInvoiceIds(prev => {
        const union = new Set([...prev, ...visibleIds]);
        return Array.from(union);
      });
    }
  };

  const handleToggleSelectInvoice = (id: string) => {
    setSelectedInvoiceIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleBulkDeleteInvoices = async () => {
    if (selectedInvoiceIds.length === 0) return;
    if (!confirm(`Apakah Anda yakin ingin menghapus ${selectedInvoiceIds.length} tagihan terpilih secara massal?`)) return;
    setActionLoading(true);
    const res = await apiDispatch('bulkDeleteInvoices', { ids: selectedInvoiceIds });
    if (res) {
      triggerToast(res.message || 'Sukses menghapus massal tagihan');
      setSelectedInvoiceIds([]);
      loadData();
    }
    setActionLoading(false);
  };

  const handleBulkReminderInvoices = async () => {
    if (selectedInvoiceIds.length === 0) return;
    setActionLoading(true);
    const res = await apiDispatch('bulkReminderInvoices', { ids: selectedInvoiceIds });
    if (res) {
      triggerToast(res.message || 'Sukses mengirim pengingat tagihan secara massal', 'success');
      setSelectedInvoiceIds([]);
      loadData();
    }
    setActionLoading(false);
  };

  // 2. Billing Engine - Mass Generate
  const handleGenerateInvoices = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genFeeType) {
      triggerToast('Pilih Jenis Tagihan terlebih dahulu', 'error');
      return;
    }
    setActionLoading(true);

    const result = await apiDispatch('generateInvoices', {
      fee_type_id: genFeeType,
      target_type: genTarget,
      student_id: genTarget === 'SINGLE' ? genStudentId : undefined,
      classroom_id: genTarget === 'CLASS' ? genClassId : undefined,
      due_date: genDueDate || undefined,
      custom_amount: genCustomAmount ? Number(genCustomAmount) : undefined,
      description: genDesc || undefined
    });

    if (result) {
      triggerToast(result.message || 'Proses generate tagihan selesai');
      setShowGenerateModal(false);
      
      // Reset form
      setGenFeeType('');
      setGenClassId('');
      setGenStudentId('');
      setGenCustomAmount('');
      setGenDesc('');
      
      loadData();
    }
    setActionLoading(false);
  };

  // 3. Record Kasir / Pembayaran Manual
  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || !payAmount) return;
    setActionLoading(true);

    const result = await apiDispatch('createFeePayment', {
      invoice_id: selectedInvoice.id,
      amount: Number(payAmount),
      payment_method: payMethod
    });

    if (result) {
      triggerToast('Pembayaran berhasil dicatat & Kas Buku diperbarui');
      setShowPayModal(false);
      setPayAmount('');
      loadData();
    }
    setActionLoading(false);
  };

  // 4. Update Invoice adjustments (Diskon, Denda, Beasiswa)
  const handleSaveAdjustments = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setActionLoading(true);

    const result = await apiDispatch('updateFeeInvoice', {
      id: selectedInvoice.id,
      discount_amount: adjDiscount ? Number(adjDiscount) : 0,
      fine_amount: adjFine ? Number(adjFine) : 0,
      scholarship_amount: adjScholarship ? Number(adjScholarship) : 0,
      description: adjDesc || undefined
    });

    if (result) {
      triggerToast('Diskon, denda, atau beasiswa berhasil disinkronkan');
      setShowAdjustmentModal(false);
      loadData();
    }
    setActionLoading(false);
  };

  // 5. Delete Invoice Row
  const handleDeleteInvoice = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus tagihan siswa ini?')) return;
    setActionLoading(true);
    const success = await apiDispatch('deleteFeeInvoice', { id });
    if (success) {
      triggerToast('Tagihan berhasil dibatalkan');
      loadData();
    }
    setActionLoading(false);
  };

  // 6. Student Savings Setor/Tarik (Tabungan)
  const handleSavingsTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!savStudentId || !savAmount) {
      triggerToast('Lengkapi data siswa dan nominal', 'error');
      return;
    }
    setActionLoading(true);

    const result = await apiDispatch('createSavingsTransaction', {
      student_id: savStudentId,
      type: savType,
      amount: Number(savAmount),
      description: savDesc || undefined
    });

    if (result) {
      triggerToast('Transaksi tabungan berhasil dibukukan');
      setShowSavingsModal(false);
      setSavAmount('');
      setSavDesc('');
      loadData();
    }
    setActionLoading(false);
  };

  // 7. Simulated Payment Gateway (QRIS or Virtual Account Webhook Call)
  const handleSimulateGateway = async (invoiceId: string, gateway: 'QRIS' | 'VA') => {
    setActionLoading(true);
    triggerToast(`Menghubungi simulated gateway ${gateway}...`, 'info');
    
    const result = await apiDispatch('simulateGatewayPayment', {
      invoice_id: invoiceId,
      gateway
    });

    if (result) {
      triggerToast(result.message || 'Pembayaran gateway sukses disinkronisasikan!');
      loadData();
    }
    setActionLoading(false);
  };

  // 8. WhatsApp / Email Reminder Dispatcher
  const handleSendReminder = async (invoiceId: string, method: 'WHATSAPP' | 'EMAIL') => {
    setActionLoading(true);
    const result = await apiDispatch('sendBillingNotification', {
      invoice_id: invoiceId,
      method
    });
    if (result) {
      triggerToast(`Notifikasi dikirim via ${method}!`);
      loadData();
    }
    setActionLoading(false);
  };

  // View Kwitansi/Receipt Popup
  const openReceipt = (invoice: any) => {
    setSelectedReceipt(invoice);
    setShowReceiptModal(true);
  };

  // --- STATS CALCULATIONS ---
  const totalInvoiced = invoices.reduce((acc, i) => acc + (i.amount + (i.fine_amount || 0) - (i.discount_amount || 0) - (i.scholarship_amount || 0)), 0);
  const totalPaid = invoices.reduce((acc, i) => acc + (i.amount_paid || 0), 0);
  const totalPiutang = Math.max(0, totalInvoiced - totalPaid);
  const collectionRate = totalInvoiced > 0 ? ((totalPaid / totalInvoiced) * 100).toFixed(1) : '0';

  const outstandingInvoicesCount = invoices.filter(i => i.status !== 'PAID').length;
  const activeTarifCount = feeTypes.length;
  const totalSavingsBalance = savings.reduce((acc, s) => acc + (s.balance || 0), 0);

  // --- CHART DATA GENERATION ---
  // Distribution of fee types in invoices
  const feeTypeMap: { [key: string]: number } = {};
  invoices.forEach(inv => {
    const key = inv.fee_name || 'Lainnya';
    feeTypeMap[key] = (feeTypeMap[key] || 0) + (inv.amount_paid || 0);
  });
  const pieChartData = Object.keys(feeTypeMap).map(key => ({
    name: key,
    value: feeTypeMap[key]
  }));

  // Monthly collection rate progress
  const monthlyData = [
    { name: 'Januari', Tagihan: 85000000, Realisasi: 78000000 },
    { name: 'Februari', Tagihan: 90000000, Realisasi: 84000000 },
    { name: 'Maret', Tagihan: 95000000, Realisasi: 89000000 },
    { name: 'April', Tagihan: 92000000, Realisasi: 88500000 },
    { name: 'Mei', Tagihan: 110000000, Realisasi: 104000000 },
    { name: 'Juni', Tagihan: 105000000, Realisasi: 98000000 },
    { name: 'Juli (Berjalan)', Tagihan: totalInvoiced || 12000000, Realisasi: totalPaid || 6500000 }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

  // Filtering invoices logic
  const filteredInvoices = invoices.filter(inv => {
    if (!inv) return false;
    const sName = inv.student_name || '';
    const sNis = inv.student_nis || '';
    const sId = inv.id || '';
    const sFee = inv.fee_name || '';
    const q = invSearch || '';

    const matchSearch = 
      sName.toLowerCase().includes(q.toLowerCase()) ||
      sNis.toLowerCase().includes(q.toLowerCase()) ||
      sId.toLowerCase().includes(q.toLowerCase()) ||
      sFee.toLowerCase().includes(q.toLowerCase());

    const matchStatus = 
      invStatusFilter === 'ALL' || 
      inv.status === invStatusFilter;

    const matchClass = 
      invClassFilter === 'ALL' || 
      inv.class_id === invClassFilter;

    return matchSearch && matchStatus && matchClass;
  });

  // Filtering savings logic
  const filteredSavings = savings.filter(s => {
    if (!s) return false;
    const sName = s.student_name || '';
    const sNis = s.student_nis || '';
    const q = savSearch || '';
    return sName.toLowerCase().includes(q.toLowerCase()) ||
           sNis.toLowerCase().includes(q.toLowerCase());
  });

  return (
    <div id="billing-spp-module" className="flex-1 p-6 overflow-y-auto bg-slate-50 min-h-screen relative font-sans">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl border text-sm font-medium ${
              toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-emerald-100' :
              toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800 shadow-rose-100' :
              'bg-blue-50 border-blue-200 text-blue-800 shadow-blue-100'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />}
            {toast.type === 'error' && <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />}
            {toast.type === 'info' && <Info className="h-5 w-5 text-blue-600 shrink-0" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] bg-blue-600 text-white font-mono font-bold tracking-widest px-2 py-0.5 rounded-full uppercase">CORE 14 • FINANCE</span>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-2 tracking-tight">Student Billing & SPP Engine</h1>
          <p className="text-xs text-slate-500 mt-1">Sistem Pengelolaan Tagihan Siswa, SPP Otomatis, Tabungan Santri, dan Integrasi Gateway.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:justify-end">
          <button 
            onClick={loadData}
            disabled={loading}
            className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition text-slate-600 disabled:opacity-50 shrink-0"
            title="Refresh Data"
          >
            <RefreshCw className={`h-4.5 w-4.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
          
          <button 
            onClick={() => {
              setEditingType(null);
              setTypeName('');
              setTypeAmount('');
              setTypeFrequency('MONTHLY');
              setTypeCode('');
              setTypeMandatory(true);
              setShowTypeModal(true);
            }}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm transition flex-1 sm:flex-initial"
          >
            <Plus className="h-4 w-4" />
            <span className="whitespace-nowrap">Tarif Baru</span>
          </button>

          <button 
            onClick={() => {
              setGenTarget('ALL');
              setGenDueDate(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
              setShowGenerateModal(true);
            }}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition flex-1 sm:flex-initial"
          >
            <Wallet className="h-4 w-4" />
            <span className="whitespace-nowrap">Generate Tagihan</span>
          </button>

          <button 
            onClick={() => setShowDocEngine(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition w-full sm:w-auto"
          >
            <Printer className="h-4 w-4" />
            <span className="whitespace-nowrap">Enterprise Doc Engine</span>
          </button>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-8 border-b border-slate-200 scrollbar-thin">
        {[
          { id: 'DASHBOARD', name: 'Dashboard Billing', icon: Layers },
          { id: 'INVOICES', name: 'Daftar Tagihan (SPP)', icon: Receipt },
          { id: 'MASTER_TARIF', name: 'Master Tarif & Jenis', icon: Scale },
          { id: 'TABUNGAN', name: 'Tabungan Siswa/Santri', icon: Wallet },
          { id: 'REKONSILIASI', name: 'Rekonsiliasi Bank', icon: RefreshCw },
          { id: 'CICILAN_REFUND', name: 'Cicilan & Refund', icon: CreditCard },
          { id: 'APPROVALS', name: 'Persetujuan Keuangan', icon: ShieldCheck },
          { id: 'GATEWAY', name: 'Pengaturan Gateway', icon: CreditCard },
          { id: 'NOTIFIKASI', name: 'Log Notifikasi', icon: Bell }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-all duration-200 ${
                isActive 
                  ? 'border-blue-600 text-blue-600 font-semibold' 
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* --- RENDER CONTENT --- */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center">
          <div className="h-10 w-10 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mb-4" />
          <span className="text-slate-500 text-xs font-mono">Sinkronisasi Billing Engine...</span>
        </div>
      ) : (
        <>
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'DASHBOARD' && (
            <div className="space-y-6">
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block font-mono">TOTAL DI-TAGIHKAN</span>
                    <span className="text-lg md:text-xl font-bold text-slate-800">Rp {totalInvoiced.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block font-mono">REALISASI TERBAYAR</span>
                    <span className="text-lg md:text-xl font-bold text-slate-800">Rp {totalPaid.toLocaleString('id-ID')}</span>
                    <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded ml-1 font-mono">{collectionRate}%</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block font-mono">TOTAL PIUTANG</span>
                    <span className="text-lg md:text-xl font-bold text-slate-800 text-amber-600">Rp {totalPiutang.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                    <Wallet className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block font-mono">SALDO TABUNGAN</span>
                    <span className="text-lg md:text-xl font-bold text-slate-800">Rp {totalSavingsBalance.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Collection Trend */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-800">Tren Tagihan & Realisasi Pembayaran</h3>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">Periode Bulanan</span>
                  </div>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                        <YAxis fontSize={11} stroke="#94a3b8" tickFormatter={(v) => `${v / 1000000}M`} />
                        <Tooltip formatter={(v) => `Rp ${Number(v).toLocaleString('id-ID')}`} />
                        <Legend verticalAlign="top" height={36} iconSize={10} fontSize={12} />
                        <Bar dataKey="Tagihan" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Realisasi" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Collection distribution */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-1">Distribusi Realisasi Keuangan</h3>
                    <p className="text-[11px] text-slate-400">Pecahan arus masuk terbayar berdasarkan kategori jenis tagihan.</p>
                  </div>
                  <div className="h-56 w-full flex items-center justify-center">
                    {pieChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v) => `Rp ${Number(v).toLocaleString('id-ID')}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-xs text-slate-400 text-center font-mono py-8">Belum ada data realisasi masuk</div>
                    )}
                  </div>
                  <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                    {pieChartData.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="text-slate-600 truncate max-w-[130px]">{item.name}</span>
                        </div>
                        <span className="font-bold text-slate-700 font-mono">Rp {item.value.toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions & Integration Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Integration status */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">STATUS KONEKTIVITAS GATEWAY</h4>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold px-2 py-0.5 rounded font-mono uppercase">ONLINE</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4.5 w-4.5 text-blue-600" />
                        <div>
                          <p className="font-semibold text-slate-800">Midtrans & Xendit Engine</p>
                          <p className="text-[10px] text-slate-400">Virtual Account multi-bank & E-wallet integration.</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-blue-600 font-mono">TERHUBUNG</span>
                    </div>

                    <div className="flex items-center justify-between text-xs p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4.5 w-4.5 text-emerald-600" />
                        <div>
                          <p className="font-semibold text-slate-800">WhatsApp Notification Engine</p>
                          <p className="text-[10px] text-slate-400">Notifikasi otomatis jatuh tempo ke wali murid.</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 font-mono">AKTIF (MOCK)</span>
                    </div>

                    <div className="flex items-center justify-between text-xs p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Award className="h-4.5 w-4.5 text-purple-600" />
                        <div>
                          <p className="font-semibold text-slate-800">Buku Besar & Akuntansi ERP</p>
                          <p className="text-[10px] text-slate-400">Jurnal otomatis saat pembayaran di-posting.</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-purple-600 font-mono">SINKRON</span>
                    </div>
                  </div>
                </div>

                {/* Audit & Compliance summary */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono mb-2">RINGKASAN INTEGRITAS BILLING</h4>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">Setiap invoice billing memiliki referensi audit yang tak terputus. Pembayaran kasir manual, autodebet tabungan, maupun webhook payment gateway secara otomatis membukukan Debit-Kredit di Buku Besar Akuntansi, mencegah kebocoran dana yayasan.</p>
                  </div>
                  <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-emerald-800">Jurnal Otomatis Aktif</h5>
                      <p className="text-[11px] text-emerald-600/90 mt-0.5 leading-relaxed">Kas Operasional (Debit) & Pendapatan SPP (Kredit) diposting instan real-time per transaksi pembayaran sukses.</p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: INVOICES LIST & ACTIONS */}
          {activeTab === 'INVOICES' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
              
              {/* Filter controls */}
              <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/40">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari Siswa, NIS, ID, Jenis..."
                    value={invSearch}
                    onChange={(e) => setInvSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
                    <Filter className="h-3.5 w-3.5" />
                    <span>Filter:</span>
                  </div>

                  <select
                    value={invStatusFilter}
                    onChange={(e) => setInvStatusFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none bg-white text-slate-700"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="UNPAID">BELUM BAYAR</option>
                    <option value="PARTIAL">DICICIL (SEBAGIAN)</option>
                    <option value="PAID">LUNAS</option>
                  </select>

                  <select
                    value={invClassFilter}
                    onChange={(e) => setInvClassFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none bg-white text-slate-700"
                  >
                    <option value="ALL">Semua Kelas</option>
                    {classrooms.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>

                  <span className="text-[11px] font-semibold text-slate-400 ml-auto font-mono shrink-0">
                    {filteredInvoices.length} baris
                  </span>
                </div>
              </div>

              {/* Bulk Actions Bar if any selected */}
              {selectedInvoiceIds.length > 0 && (
                <div className="mx-5 my-3 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-xs font-semibold text-blue-800">
                      Terpilih {selectedInvoiceIds.length} tagihan untuk operasi massal
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleBulkReminderInvoices}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Kirim Pengingat Massal
                    </button>
                    <button
                      onClick={handleBulkDeleteInvoices}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Hapus Massal
                    </button>
                    <button
                      onClick={() => setSelectedInvoiceIds([])}
                      className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}

              {/* Invoices Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 text-[10px] font-bold text-slate-400 tracking-wider uppercase border-b border-slate-100">
                      <th className="py-3.5 px-5 text-center w-12">
                        <input
                          type="checkbox"
                          checked={filteredInvoices.length > 0 && filteredInvoices.every(inv => selectedInvoiceIds.includes(inv.id))}
                          onChange={() => handleToggleSelectAllInvoices(filteredInvoices)}
                          className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer h-4 w-4"
                        />
                      </th>
                      <th className="py-3.5 px-5 font-mono">Invoice ID</th>
                      <th className="py-3.5 px-5">Siswa (NIS)</th>
                      <th className="py-3.5 px-5">Tarif Tagihan</th>
                      <th className="py-3.5 px-5 text-right">Nominal Dasar</th>
                      <th className="py-3.5 px-5 text-right">Diskon/Beasiswa</th>
                      <th className="py-3.5 px-5 text-right">Denda</th>
                      <th className="py-3.5 px-5 text-right">Net Harus Dibayar</th>
                      <th className="py-3.5 px-5 text-right">Terbayar</th>
                      <th className="py-3.5 px-5">Status</th>
                      <th className="py-3.5 px-5 text-center">Aksi / Gateway Direct</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredInvoices.length > 0 ? (
                      filteredInvoices.map(inv => {
                        const totalAdj = (inv.discount_amount || 0) + (inv.scholarship_amount || 0);
                        const netAmount = Math.max(0, inv.amount + (inv.fine_amount || 0) - totalAdj);
                        const isPaid = inv.status === 'PAID';
                        const isPartial = inv.status === 'PARTIAL';

                        return (
                          <tr key={inv.id} className="hover:bg-slate-50/60 transition duration-150">
                            <td className="py-4 px-5 text-center w-12">
                              <input
                                type="checkbox"
                                checked={selectedInvoiceIds.includes(inv.id)}
                                onChange={() => handleToggleSelectInvoice(inv.id)}
                                className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer h-4 w-4"
                              />
                            </td>
                            <td className="py-4 px-5 font-mono text-slate-500 font-medium">#{inv.id.split('-').slice(0, 3).join('-')}</td>
                            <td className="py-4 px-5">
                              <div>
                                <span className="font-semibold text-slate-800 block">{inv.student_name}</span>
                                <span className="text-[10px] text-slate-400 font-mono font-medium">NIS: {inv.student_nis || 'No NIS'}</span>
                              </div>
                            </td>
                            <td className="py-4 px-5">
                              <div>
                                <span className="font-semibold text-slate-700">{inv.fee_name}</span>
                                <span className="text-[10px] text-slate-400 block font-mono">Jatuh Tempo: {inv.due_date}</span>
                              </div>
                            </td>
                            <td className="py-4 px-5 text-right font-mono text-slate-600">Rp {inv.amount.toLocaleString('id-ID')}</td>
                            <td className="py-4 px-5 text-right font-mono text-rose-500">
                              {totalAdj > 0 ? `-Rp ${totalAdj.toLocaleString('id-ID')}` : '0'}
                            </td>
                            <td className="py-4 px-5 text-right font-mono text-amber-600">
                              {inv.fine_amount > 0 ? `+Rp ${inv.fine_amount.toLocaleString('id-ID')}` : '0'}
                            </td>
                            <td className="py-4 px-5 text-right font-mono font-bold text-slate-800">Rp {netAmount.toLocaleString('id-ID')}</td>
                            <td className="py-4 px-5 text-right font-mono text-emerald-600 font-semibold">Rp {(inv.amount_paid || 0).toLocaleString('id-ID')}</td>
                            <td className="py-4 px-5">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono tracking-wide ${
                                isPaid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                isPartial ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}>
                                {inv.status}
                              </span>
                            </td>
                            <td className="py-4 px-5">
                              <div className="flex flex-wrap items-center justify-center gap-1.5">
                                {/* Simulated webhooks */}
                                {!isPaid && (
                                  <>
                                    <button
                                      onClick={() => handleSimulateGateway(inv.id, 'QRIS')}
                                      className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-[10px] font-bold text-purple-700 rounded-lg border border-purple-200 transition"
                                      title="Simulasi Webhook Callback QRIS"
                                    >
                                      QRIS Webhook
                                    </button>
                                    <button
                                      onClick={() => handleSimulateGateway(inv.id, 'VA')}
                                      className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-[10px] font-bold text-blue-700 rounded-lg border border-blue-200 transition"
                                      title="Simulasi Webhook Callback Virtual Account"
                                    >
                                      VA Webhook
                                    </button>
                                  </>
                                )}

                                {/* Manual Payment Kasir */}
                                {!isPaid && (
                                  <button
                                    onClick={() => {
                                      setSelectedInvoice(inv);
                                      setPayAmount(String(netAmount - (inv.amount_paid || 0)));
                                      setPayMethod('CASH');
                                      setShowPayModal(true);
                                    }}
                                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition"
                                    title="Kasir - Pembayaran Manual"
                                  >
                                    <Receipt className="h-4 w-4" />
                                  </button>
                                )}

                                {/* Diskon/Denda Adjustment */}
                                <button
                                  onClick={() => {
                                    setSelectedInvoice(inv);
                                    setAdjDiscount(String(inv.discount_amount || ''));
                                    setAdjFine(String(inv.fine_amount || ''));
                                    setAdjScholarship(String(inv.scholarship_amount || ''));
                                    setAdjDesc(inv.description || '');
                                    setShowAdjustmentModal(true);
                                  }}
                                  className="p-1 text-slate-500 hover:bg-slate-100 rounded transition"
                                  title="Potongan / Beasiswa / Denda"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>

                                {/* Print Kwitansi if paid */}
                                {inv.amount_paid > 0 && (
                                  <button
                                    onClick={() => openReceipt(inv)}
                                    className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition"
                                    title="Cetak Kwitansi Pembayaran"
                                  >
                                    <Download className="h-4 w-4" />
                                  </button>
                                )}

                                {/* Reminder trigger */}
                                {!isPaid && (
                                  <button
                                    onClick={() => handleSendReminder(inv.id, 'WHATSAPP')}
                                    className="p-1 text-teal-600 hover:bg-teal-50 rounded transition"
                                    title="Kirim Pengingat WhatsApp"
                                  >
                                    <Send className="h-4 w-4" />
                                  </button>
                                )}

                                {/* Delete billing row */}
                                <button
                                  onClick={() => handleDeleteInvoice(inv.id)}
                                  className="p-1 text-rose-500 hover:bg-rose-50 rounded transition"
                                  title="Hapus Tagihan"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={10} className="py-12 text-center text-slate-400 font-mono text-xs">
                          Tidak ada tagihan yang cocok dengan filter pencarian
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 3: MASTER TARIF & JENIS TAGIHAN */}
          {activeTab === 'MASTER_TARIF' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Master Pengaturan & Aturan Billing Engine</h3>
                  <p className="text-xs text-slate-400 mt-1">Konfigurasi tarif dasar, aturan otomatisasi, diskon, denda denda keterlambatan, dan Virtual Account.</p>
                </div>
                
                {/* Master Sub-Tabs */}
                <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100/80 rounded-xl">
                  {(['TARIF', 'AUTO_RULES', 'DISKON', 'DENDA', 'REKENING'] as const).map(sub => {
                    const label = sub === 'TARIF' ? 'Tarif SPP' :
                                  sub === 'AUTO_RULES' ? 'Auto-Billing' :
                                  sub === 'DISKON' ? 'Diskon & Beasiswa' :
                                  sub === 'DENDA' ? 'Aturan Denda' : 'Rekening & VA';
                    const active = activeSubTab === sub;
                    return (
                      <button
                        key={sub}
                        onClick={() => setActiveSubTab(sub)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          active ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SUB TAB 1: TARIF TAGIHAN */}
              {activeSubTab === 'TARIF' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 font-mono">{feeTypes.length} Jenis Tarif Terdaftar</span>
                    <button
                      onClick={() => {
                        setEditingType(null);
                        setTypeName('');
                        setTypeAmount('');
                        setTypeFrequency('MONTHLY');
                        setTypeCode('');
                        setTypeMandatory(true);
                        setShowTypeModal(true);
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      Tambah Tarif Baru
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {feeTypes.map(type => {
                      return (
                        <div key={type.id} className="p-5 border border-slate-200 rounded-2xl shadow-xs flex flex-col justify-between hover:border-slate-300 transition duration-150 bg-slate-50/20">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="text-[10px] font-mono bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded uppercase">
                                  {type.frequency}
                                </span>
                                <h4 className="font-bold text-slate-800 mt-1.5">{type.name}</h4>
                              </div>
                              <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full border ${
                                type.is_mandatory !== false 
                                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                  : 'bg-slate-50 text-slate-500 border-slate-200'
                              }`}>
                                {type.is_mandatory !== false ? 'Wajib' : 'Sukarela'}
                              </span>
                            </div>
                            <div className="pt-2">
                              <span className="text-[10px] text-slate-400 block font-mono">NOMINAL DASAR</span>
                              <span className="text-xl font-extrabold text-slate-800">Rp {type.amount.toLocaleString('id-ID')}</span>
                            </div>
                            {type.code && (
                              <div className="text-[10px] text-slate-400 font-mono">
                                KODE TAGIHAN: <span className="font-semibold text-slate-600">{type.code}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3 mt-4">
                            <button
                              onClick={() => openEditType(type)}
                              className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition"
                              title="Edit Tarif"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteType(type.id)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                              title="Hapus Jenis Tagihan"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SUB TAB 2: AUTO BILLING RULES */}
              {activeSubTab === 'AUTO_RULES' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Aturan Auto-Billing (Event-Driven Generator)</h4>
                      <p className="text-xs text-slate-400 mt-1">Sistem akan men-generate tagihan secara otomatis kepada siswa saat event terpilih terpicu.</p>
                    </div>
                    <button
                      onClick={openAddRule}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      Tambah Aturan Auto-Billing
                    </button>
                  </div>

                  {/* Simulator Trigger Buttons */}
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-amber-800">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span className="text-xs font-bold">Simulator Event-Trigger Auto-Billing</span>
                    </div>
                    <p className="text-[11px] text-amber-700">Simulasikan event sistem sekolah untuk memicu aturan pembuatan tagihan/invoice otomatis kepada seluruh siswa terkait secara massal.</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => handleSimulateAutoBilling('NEW_STUDENT')}
                        className="px-3 py-1.5 bg-white hover:bg-amber-100/50 text-amber-800 text-xs font-bold rounded-xl border border-amber-200 transition cursor-pointer"
                      >
                        Simulasikan Siswa Baru Mendaftar
                      </button>
                      <button
                        onClick={() => handleSimulateAutoBilling('ACADEMIC_YEAR_START')}
                        className="px-3 py-1.5 bg-white hover:bg-amber-100/50 text-amber-800 text-xs font-bold rounded-xl border border-amber-200 transition cursor-pointer"
                      >
                        Simulasikan Tahun Ajaran Baru Dimulai
                      </button>
                      <button
                        onClick={() => handleSimulateAutoBilling('GRADUATION')}
                        className="px-3 py-1.5 bg-white hover:bg-amber-100/50 text-amber-800 text-xs font-bold rounded-xl border border-amber-200 transition cursor-pointer"
                      >
                        Simulasikan Kelulusan (Generate Tagihan Wisuda)
                      </button>
                    </div>
                  </div>

                  <div className="border border-slate-100 rounded-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                          <th className="py-3 px-4">Nama Aturan</th>
                          <th className="py-3 px-4">Event Pemicu</th>
                          <th className="py-3 px-4">Jenis Tagihan Otomatis</th>
                          <th className="py-3 px-4">Deskripsi</th>
                          <th className="py-3 px-4 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {autoBillingRules.length > 0 ? (
                          autoBillingRules.map(rule => {
                            const matchedType = feeTypes.find(f => f.id === rule.fee_type_id);
                            return (
                              <tr key={rule.id} className="hover:bg-slate-50/50">
                                <td className="py-3.5 px-4 font-bold text-slate-800">{rule.name}</td>
                                <td className="py-3.5 px-4">
                                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md font-mono uppercase">
                                    {rule.trigger_event}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 font-semibold text-slate-600">
                                  {matchedType ? matchedType.name : 'Unknown Fee Type'}
                                </td>
                                <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">{rule.description || '-'}</td>
                                <td className="py-3.5 px-4 text-center">
                                  <div className="flex justify-center gap-1.5">
                                    <button
                                      onClick={() => openEditRule(rule)}
                                      className="p-1 text-slate-500 hover:bg-slate-100 rounded-md cursor-pointer"
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteRule(rule.id)}
                                      className="p-1 text-rose-500 hover:bg-rose-50 rounded-md cursor-pointer"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-400">Belum ada aturan auto-billing yang didefinisikan.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SUB TAB 3: DISKON & BEASISWA */}
              {activeSubTab === 'DISKON' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Master Skema Potongan / Beasiswa (Fee Discounts)</h4>
                      <p className="text-xs text-slate-400 mt-1">Daftar potongan harga atau beasiswa yang dapat diajukan kepada tagihan siswa/santri.</p>
                    </div>
                    <button
                      onClick={openAddDiscount}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      Tambah Potongan Baru
                    </button>
                  </div>

                  <div className="border border-slate-100 rounded-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                          <th className="py-3 px-4">Nama Skema</th>
                          <th className="py-3 px-4">Kode Diskon</th>
                          <th className="py-3 px-4">Tipe Potongan</th>
                          <th className="py-3 px-4 text-right">Besaran Potongan</th>
                          <th className="py-3 px-4">Keterangan</th>
                          <th className="py-3 px-4 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {discounts.length > 0 ? (
                          discounts.map(disc => (
                            <tr key={disc.id} className="hover:bg-slate-50/50">
                              <td className="py-3.5 px-4 font-bold text-slate-800">{disc.name}</td>
                              <td className="py-3.5 px-4 font-mono text-slate-500">{disc.code || '-'}</td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                                  disc.type === 'PERCENTAGE' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
                                }`}>
                                  {disc.type === 'PERCENTAGE' ? 'Persentase' : 'Nominal Tetap'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right font-bold font-mono">
                                {disc.type === 'PERCENTAGE' ? `${disc.amount}%` : `Rp ${disc.amount.toLocaleString('id-ID')}`}
                              </td>
                              <td className="py-3.5 px-4 text-slate-400">{disc.description || '-'}</td>
                              <td className="py-3.5 px-4 text-center">
                                <div className="flex justify-center gap-1.5">
                                  <button
                                    onClick={() => openEditDiscount(disc)}
                                    className="p-1 text-slate-500 hover:bg-slate-100 rounded-md cursor-pointer"
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteDiscount(disc.id)}
                                    className="p-1 text-rose-500 hover:bg-rose-50 rounded-md cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400">Belum ada skema potongan/diskon terdaftar.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SUB TAB 4: ATURAN DENDA KETERLAMBATAN */}
              {activeSubTab === 'DENDA' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Aturan Denda & Sanksi Keterlambatan (Fee Fines)</h4>
                      <p className="text-xs text-slate-400 mt-1">Konfigurasi denda kumulatif otomatis jika pembayaran SPP melewati masa tenggang jatuh tempo.</p>
                    </div>
                    <button
                      onClick={openAddFine}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      Tambah Aturan Denda
                    </button>
                  </div>

                  <div className="border border-slate-100 rounded-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                          <th className="py-3 px-4">Nama Denda</th>
                          <th className="py-3 px-4">Kode</th>
                          <th className="py-3 px-4">Tipe Denda</th>
                          <th className="py-3 px-4 text-right">Besaran Denda</th>
                          <th className="py-3 px-4 text-center">Grace Period (Hari)</th>
                          <th className="py-3 px-4">Keterangan</th>
                          <th className="py-3 px-4 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {fines.length > 0 ? (
                          fines.map(fine => (
                            <tr key={fine.id} className="hover:bg-slate-50/50">
                              <td className="py-3.5 px-4 font-bold text-slate-800">{fine.name}</td>
                              <td className="py-3.5 px-4 font-mono text-slate-500">{fine.code || '-'}</td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                                  fine.type === 'PERCENTAGE' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'
                                }`}>
                                  {fine.type === 'PERCENTAGE' ? 'Persentase' : 'Nominal Tetap'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right font-bold font-mono">
                                {fine.type === 'PERCENTAGE' ? `${fine.amount}%` : `Rp ${fine.amount.toLocaleString('id-ID')}`}
                              </td>
                              <td className="py-3.5 px-4 text-center font-bold font-mono text-slate-600">{fine.grace_period || 0} Hari</td>
                              <td className="py-3.5 px-4 text-slate-400">{fine.description || '-'}</td>
                              <td className="py-3.5 px-4 text-center">
                                <div className="flex justify-center gap-1.5">
                                  <button
                                    onClick={() => openEditFine(fine)}
                                    className="p-1 text-slate-500 hover:bg-slate-100 rounded-md cursor-pointer"
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteFine(fine.id)}
                                    className="p-1 text-rose-500 hover:bg-rose-50 rounded-md cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-400">Belum ada aturan denda terdaftar.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SUB TAB 5: BANK REKENING & GENERATE VIRTUAL ACCOUNTS */}
              {activeSubTab === 'REKENING' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Bank Accounts */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Rekening Bank Sekolah</h4>
                      <button
                        onClick={openAddAccount}
                        className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                        Tambah Rekening
                      </button>
                    </div>

                    <div className="border border-slate-100 rounded-2xl overflow-hidden">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="bg-slate-50">
                          <tr className="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                            <th className="py-2.5 px-4">Nama Bank</th>
                            <th className="py-2.5 px-4">No. Rekening</th>
                            <th className="py-2.5 px-4">Pemilik</th>
                            <th className="py-2.5 px-4 text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {bankAccounts.length > 0 ? (
                            bankAccounts.map(acc => (
                              <tr key={acc.id} className="hover:bg-slate-50/50">
                                <td className="py-3 px-4 font-bold text-slate-800">{acc.bank_name}</td>
                                <td className="py-3 px-4 font-mono font-semibold text-slate-600">{acc.account_number}</td>
                                <td className="py-3 px-4 text-slate-500">{acc.holder_name}</td>
                                <td className="py-3 px-4 text-center">
                                  <div className="flex justify-center gap-1.5">
                                    <button
                                      onClick={() => openEditAccount(acc)}
                                      className="p-1 text-slate-500 hover:bg-slate-100 rounded-md cursor-pointer"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteAccount(acc.id)}
                                      className="p-1 text-rose-500 hover:bg-rose-50 rounded-md cursor-pointer"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="py-6 text-center text-slate-400">Belum ada rekening bank.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Generated Virtual Accounts */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Integrasi Siswa Virtual Accounts</h4>
                      <button
                        onClick={() => {
                          setVaStudentId('');
                          setVaNumber(String(Math.floor(1000000000 + Math.random() * 9000000000)));
                          setVaBankName('Bank Muamalat');
                          setVaType('SPP');
                          setShowVaModal(true);
                        }}
                        className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                        Generate VA Baru
                      </button>
                    </div>

                    <div className="border border-slate-100 rounded-2xl overflow-hidden">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="bg-slate-50">
                          <tr className="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                            <th className="py-2.5 px-4">Siswa</th>
                            <th className="py-2.5 px-4">Bank</th>
                            <th className="py-2.5 px-4">VA Number</th>
                            <th className="py-2.5 px-4">Peruntukan</th>
                            <th className="py-2.5 px-4 text-center">Hapus</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {virtualAccounts.length > 0 ? (
                            virtualAccounts.map(va => {
                              const std = students.find(s => s.id === va.student_id);
                              return (
                                <tr key={va.id} className="hover:bg-slate-50/50">
                                  <td className="py-3 px-4">
                                    <span className="font-semibold text-slate-800 block">{std ? std.name : 'Unknown Siswa'}</span>
                                    <span className="text-[9px] text-slate-400 font-mono">NIS: {std ? std.nis : '-'}</span>
                                  </td>
                                  <td className="py-3 px-4 text-slate-600">{va.bank_name}</td>
                                  <td className="py-3 px-4 font-mono font-bold text-indigo-600">{va.va_number}</td>
                                  <td className="py-3 px-4">
                                    <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-bold rounded">
                                      {va.type || 'SPP'}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <button
                                      onClick={() => handleDeleteVa(va.id)}
                                      className="p-1 text-rose-500 hover:bg-rose-50 rounded-md cursor-pointer"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={5} className="py-6 text-center text-slate-400">Belum ada Virtual Account di-generate.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TABUNGAN SISWA/SANTRI */}
          {activeTab === 'TABUNGAN' && (
            <div className="space-y-6">
              
              {/* Tabungan balance ledger and search */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">Buku Tabungan Santri / Siswa (Syariah Ledger)</h3>
                    <p className="text-xs text-slate-400">Pencatatan setoran, penarikan, dan autodebet tabungan santri untuk pembayaran SPP/Kegiatan.</p>
                  </div>
                  <button
                    onClick={() => {
                      setSavStudentId('');
                      setSavAmount('');
                      setSavType('DEPOSIT');
                      setSavDesc('');
                      setShowSavingsModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
                  >
                    <Plus className="h-4 w-4" />
                    Setor / Tarik Tabungan
                  </button>
                </div>

                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari siswa tabungan..."
                    value={savSearch}
                    onChange={(e) => setSavSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Balance List table */}
                  <div className="border border-slate-100 rounded-2xl overflow-hidden max-h-[380px] overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                          <th className="py-2.5 px-4">Siswa (NIS)</th>
                          <th className="py-2.5 px-4 text-right">Saldo Tabungan</th>
                          <th className="py-2.5 px-4 text-center">Aksi Cepat</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs divide-y divide-slate-50">
                        {filteredSavings.length > 0 ? (
                          filteredSavings.map(s => (
                            <tr key={s.id} className="hover:bg-slate-50/50">
                              <td className="py-3 px-4">
                                <div>
                                  <span className="font-semibold text-slate-800 block">{s.student_name}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">NIS: {s.student_nis}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                                Rp {s.balance.toLocaleString('id-ID')}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <button
                                  onClick={() => {
                                    setSavStudentId(s.student_id);
                                    setSavAmount('');
                                    setSavType('DEPOSIT');
                                    setSavDesc('Setoran tabungan via kasir');
                                    setShowSavingsModal(true);
                                  }}
                                  className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-[10px] text-emerald-700 font-semibold rounded-lg border border-emerald-200 transition"
                                >
                                  Transaksi
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="py-12 text-center text-slate-400 font-mono text-xs">Belum ada data tabungan terdaftar</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Savings transaction activity log */}
                  <div className="border border-slate-100 rounded-2xl p-4 flex flex-col justify-between bg-slate-50/20">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono mb-3">RIWAYAT MUTASI TERAKHIR</h4>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {savingsTxs.map(tx => {
                        const isDeposit = tx.type === 'DEPOSIT';
                        return (
                          <div key={tx.id} className="p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-between text-xs hover:border-slate-200 transition">
                            <div className="flex items-center gap-2.5">
                              <div className={`p-2 rounded-lg ${isDeposit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                {isDeposit ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                              </div>
                              <div>
                                <span className="font-semibold text-slate-800 block">{tx.student_name}</span>
                                <span className="text-[10px] text-slate-400 block font-mono">{tx.date} • {tx.description}</span>
                              </div>
                            </div>
                            <span className={`font-mono font-bold ${isDeposit ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {isDeposit ? '+' : '-'}Rp {tx.amount.toLocaleString('id-ID')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* TAB 5: LOG NOTIFIKASI REMINDER */}
          {activeTab === 'NOTIFIKASI' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Log Pengiriman Pengingat Tagihan SPP</h3>
                <p className="text-xs text-slate-400 mt-1">Status dan riwayat pengiriman pesan jatuh tempo otomatis dan manual ke wali murid via SMS/WA/Email.</p>
              </div>

              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                      <th className="py-3.5 px-5">Waktu</th>
                      <th className="py-3.5 px-5">Siswa (NIS)</th>
                      <th className="py-3.5 px-5">Saluran</th>
                      <th className="py-3.5 px-5">Kontak Target</th>
                      <th className="py-3.5 px-5">Isi Pesan</th>
                      <th className="py-3.5 px-5">Status Pengiriman</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-slate-100">
                    {notifications.map(n => (
                      <tr key={n.id} className="hover:bg-slate-50/40">
                        <td className="py-4 px-5 font-mono text-slate-500">{new Date(n.sent_at).toLocaleString('id-ID')}</td>
                        <td className="py-4 px-5 font-semibold text-slate-800">{n.student_name} ({n.student_nis})</td>
                        <td className="py-4 px-5">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-mono font-bold text-[10px]">
                            {n.type}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-slate-600 font-mono">{n.phone || n.email}</td>
                        <td className="py-4 px-5 text-slate-500 max-w-xs truncate" title={n.message}>{n.message}</td>
                        <td className="py-4 px-5">
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded font-mono">
                            {n.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: REKONSILIASI BANK */}
          {activeTab === 'REKONSILIASI' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">Auto Bank Reconciliation Engine</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Cocokkan mutasi rekening bank dengan tagihan dan virtual account secara otomatis menggunakan algoritma pencocokan nominal & nomor VA.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        setActionLoading(true);
                        const demoMutations = [
                          { date: '2026-07-25', description: 'CR VA9880010098123458 RAFI ALDI', amount: 350000, reference_no: 'TX-MUAMALAT-71850', va_number: '9880010098123458' },
                          { date: '2026-07-26', description: 'CR TRANSFER ANTAR BANK SITI', amount: 450000, reference_no: 'TX-MUTASI-00991', va_number: null }
                        ];
                        const res = await apiDispatch('importBankMutation', { mutations: demoMutations });
                        if (res) {
                          triggerToast('Berhasil mensimulasikan upload mutasi bank!', 'success');
                          loadData();
                        }
                        setActionLoading(false);
                      }}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                    >
                      <Plus className="h-4 w-4" />
                      Simulasikan Mutasi
                    </button>
                    <button
                      onClick={async () => {
                        setActionLoading(true);
                        const res = await apiDispatch('autoReconcile');
                        if (res) {
                          triggerToast(res.message || 'Rekonsiliasi selesai!', 'success');
                          loadData();
                        }
                        setActionLoading(false);
                      }}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition shadow-sm flex items-center gap-1.5"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Jalankan Rekonsiliasi Otomatis
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-bold text-slate-400 tracking-wider font-mono">
                        <th className="py-3 px-4">TANGGAL</th>
                        <th className="py-3 px-4">REFF / VA</th>
                        <th className="py-3 px-4">DESKRIPSI MUTASI</th>
                        <th className="py-3 px-4 text-right">NOMINAL</th>
                        <th className="py-3 px-4 text-center">STATUS</th>
                        <th className="py-3 px-4">MATCHED INVOICE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                      {bankMutations.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-slate-400 font-mono text-[11px]">
                            Belum ada mutasi terunggah. Silakan simulasikan mutasi masuk.
                          </td>
                        </tr>
                      ) : (
                        bankMutations.map((m: any) => (
                          <tr key={m.id} className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px]">{m.date}</td>
                            <td className="py-3 px-4 font-mono font-medium">
                              {m.va_number ? (
                                <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold">{m.va_number}</span>
                              ) : (
                                <span className="text-slate-400">{m.reference_no}</span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-700">{m.description}</td>
                            <td className="py-3 px-4 text-right font-bold text-emerald-600 font-mono">
                              Rp {m.amount.toLocaleString('id-ID')}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {m.matched ? (
                                <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[10px] font-bold">MATCHED</span>
                              ) : (
                                <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full text-[10px] font-bold">UNMATCHED</span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-mono text-[11px] text-blue-600 font-bold">
                              {m.matched_invoice_id || '-'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CICILAN & REFUND */}
          {activeTab === 'CICILAN_REFUND' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
              {/* SECTION 1: INSTALLMENTS */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Installment Engine (Schedules & Cicilan)</h3>
                  <p className="text-xs text-slate-400 mt-1">Pecah tagihan net santri ke dalam skema angsuran terjadwal bulanan.</p>
                </div>

                <div className="bg-slate-50/75 p-4 rounded-xl border border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold text-slate-600">Simulasikan Cicilan Baru</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Pilih Tagihan Belum Lunas</label>
                      <select
                        id="installment-invoice-select"
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">-- Pilih Tagihan --</option>
                        {invoices.filter(i => i.status !== 'PAID').map((i: any) => (
                          <option key={i.id} value={i.id}>
                            #{i.id} - Rp {i.amount.toLocaleString('id-ID')} ({i.fee_name})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Jumlah Termin Cicilan</label>
                      <select
                        id="installment-count-select"
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="2">2 Kali Cicilan</option>
                        <option value="3">3 Kali Cicilan (Rekomendasi)</option>
                        <option value="4">4 Kali Cicilan</option>
                        <option value="6">6 Kali Cicilan</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      const invId = (document.getElementById('installment-invoice-select') as HTMLSelectElement)?.value;
                      const count = (document.getElementById('installment-count-select') as HTMLSelectElement)?.value;
                      if (!invId) return triggerToast('Pilih tagihan terlebih dahulu', 'error');

                      setActionLoading(true);
                      const res = await apiDispatch('createInstallmentPlan', {
                        invoice_id: invId,
                        installments_count: count
                      });
                      if (res) {
                        triggerToast('Skema cicilan terjadwal berhasil dibuat!', 'success');
                        loadData();
                      }
                      setActionLoading(false);
                    }}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition shadow-sm"
                  >
                    Terapkan Skema Angsuran
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-bold text-slate-400 tracking-wider font-mono">
                        <th className="py-3 px-4">TAGIHAN</th>
                        <th className="py-3 px-4">TERMIN</th>
                        <th className="py-3 px-4">JATUH TEMPO</th>
                        <th className="py-3 px-4 text-right">NOMINAL</th>
                        <th className="py-3 px-4 text-center">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                      {installments.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-slate-400 font-mono text-[11px]">
                            Belum ada tagihan bermetode cicilan.
                          </td>
                        </tr>
                      ) : (
                        installments.map((i: any) => (
                          <tr key={i.id} className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-mono font-bold text-[11px]">#{i.invoice_id}</td>
                            <td className="py-3 px-4 font-semibold">Ke-{i.installment_no}</td>
                            <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{i.due_date}</td>
                            <td className="py-3 px-4 text-right font-bold font-mono">Rp {i.amount.toLocaleString('id-ID')}</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                i.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                              }`}>{i.status}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 2: REFUNDS */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Refund Engine (Pengembalian Dana)</h3>
                  <p className="text-xs text-slate-400 mt-1">Batalkan pembayaran atau lakukan pengembalian kelebihan bayar secara formal.</p>
                </div>

                <div className="bg-slate-50/75 p-4 rounded-xl border border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold text-slate-600">Ajukan Refund Baru</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Pilih Transaksi Pembayaran</label>
                      <select
                        id="refund-payment-select"
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">-- Pilih Pembayaran --</option>
                        {invoices.filter(i => i.amount_paid > 0).map((i: any) => (
                          <option key={i.id} value={i.id}>
                            #{i.id} - Bayar Rp {i.amount_paid.toLocaleString('id-ID')} ({i.student_name})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Nominal Refund</label>
                      <input
                        id="refund-amount-input"
                        type="number"
                        placeholder="Contoh: 100000"
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Alasan Pengembalian Dana</label>
                    <input
                      id="refund-reason-input"
                      type="text"
                      placeholder="Masukkan alasan refund..."
                      className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={async () => {
                      const pId = (document.getElementById('refund-payment-select') as HTMLSelectElement)?.value;
                      const amt = (document.getElementById('refund-amount-input') as HTMLInputElement)?.value;
                      const rsn = (document.getElementById('refund-reason-input') as HTMLInputElement)?.value;
                      if (!pId || !amt) return triggerToast('Pembayaran dan nominal wajib ditentukan', 'error');

                      setActionLoading(true);
                      const res = await apiDispatch('requestRefund', {
                        payment_id: pId,
                        refund_amount: amt,
                        reason: rsn
                      });
                      if (res) {
                        triggerToast('Pengajuan refund berhasil didaftarkan dan menunggu persetujuan', 'success');
                        loadData();
                      }
                      setActionLoading(false);
                    }}
                    className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition shadow-sm"
                  >
                    Ajukan Pengembalian (Refund)
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-bold text-slate-400 tracking-wider font-mono">
                        <th className="py-3 px-4">ID REFUND</th>
                        <th className="py-3 px-4">ALASAN</th>
                        <th className="py-3 px-4 text-right">NOMINAL</th>
                        <th className="py-3 px-4 text-center">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                      {refunds.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-8 text-slate-400 font-mono text-[11px]">
                            Belum ada riwayat pengembalian dana.
                          </td>
                        </tr>
                      ) : (
                        refunds.map((r: any) => (
                          <tr key={r.id} className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-mono font-bold text-[11px]">{r.id}</td>
                            <td className="py-3 px-4 text-slate-500 truncate max-w-[120px]">{r.reason}</td>
                            <td className="py-3 px-4 text-right font-bold text-rose-600 font-mono font-bold">
                              Rp {r.amount.toLocaleString('id-ID')}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                r.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' :
                                r.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'
                              }`}>{r.status}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PERSETUJUAN WORKFLOW */}
          {activeTab === 'APPROVALS' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Multi-Stage Approval Workflows</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Seluruh perubahan sensitif (Diskon, Pembatalan, Penghapusan Denda, dan Refund) harus melalui persetujuan hierarki formal: Staff &rarr; Bendahara &rarr; Kepala Sekolah &rarr; Yayasan.
                  </p>
                </div>

                <div className="mt-6 overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-bold text-slate-400 tracking-wider font-mono">
                        <th className="py-3 px-4">JENIS</th>
                        <th className="py-3 px-4">INFO PENGAJUAN</th>
                        <th className="py-3 px-4">PEMOHON</th>
                        <th className="py-3 px-4 text-center">TAHAP SEKARANG</th>
                        <th className="py-3 px-4 text-center">STATUS</th>
                        <th className="py-3 px-4 text-right">AKSI VERIFIKASI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                      {approvals.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-slate-400 font-mono text-[11px]">
                            Belum ada permohonan persetujuan aktif.
                          </td>
                        </tr>
                      ) : (
                        approvals.map((a: any) => (
                          <tr key={a.id} className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-bold font-mono text-blue-600 text-[11px]">{a.type}</td>
                            <td className="py-3 px-4">
                              <span className="font-semibold text-slate-800 block">{a.title}</span>
                              <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{a.description}</span>
                            </td>
                            <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{a.requested_by}</td>
                            <td className="py-3 px-4 text-center">
                              <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                                {a.stage}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                a.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' :
                                a.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                              }`}>{a.status}</span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              {a.status === 'PENDING' ? (
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={async () => {
                                      setActionLoading(true);
                                      const res = await apiDispatch('actionApproval', { id: a.id, status: 'APPROVED' });
                                      if (res) {
                                        triggerToast(res.message || 'Disetujui!', 'success');
                                        loadData();
                                      }
                                      setActionLoading(false);
                                    }}
                                    className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition"
                                    title="Setujui Pengajuan"
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={async () => {
                                      const reason = prompt('Masukkan alasan penolakan:');
                                      if (reason === null) return;
                                      setActionLoading(true);
                                      const res = await apiDispatch('actionApproval', { id: a.id, status: 'REJECTED', reject_reason: reason });
                                      if (res) {
                                        triggerToast('Pengajuan ditolak', 'info');
                                        loadData();
                                      }
                                      setActionLoading(false);
                                    }}
                                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                                    title="Tolak Pengajuan"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-slate-400 font-mono text-[10px]">Tinjauan Selesai</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SETTING PAYMENT GATEWAY */}
          {activeTab === 'GATEWAY' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs max-w-2xl">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Payment Gateway Provider Management</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Pilih gerbang pembayaran aktif dan konfigurasi credentials API bank untuk otomasi virtual account multi-bank santri.
                  </p>
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Active Payment Gateway Provider</label>
                    <select
                      id="gateway-provider-select"
                      defaultValue={gatewayConfig?.activeGateway || 'XENDIT'}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-1 focus:ring-blue-500 font-medium"
                    >
                      <option value="XENDIT">Xendit Indonesia (Terintegrasi VA Bersama)</option>
                      <option value="MIDTRANS">Midtrans GoPay (Rekomendasi Ritel)</option>
                      <option value="DUITKU">Duitku (Pilihan Biaya Rendah)</option>
                      <option value="TRIPAY">Tripay (Payment Gateway Aggregator)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-mono font-medium text-slate-400 block mb-1">MIDTRANS CLIENT KEY</label>
                      <input
                        id="midtrans-client-key"
                        type="text"
                        defaultValue={gatewayConfig?.midtransClientKey || 'SB-Mid-client-XXXXX'}
                        className="w-full text-xs bg-white border border-slate-200 rounded-xl p-3 focus:ring-1 focus:ring-blue-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono font-medium text-slate-400 block mb-1">XENDIT PUBLIC KEY</label>
                      <input
                        id="xendit-public-key"
                        type="text"
                        defaultValue={gatewayConfig?.xenditPublicKey || 'xnd_public_XXXXX'}
                        className="w-full text-xs bg-white border border-slate-200 rounded-xl p-3 focus:ring-1 focus:ring-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-mono font-medium text-slate-400 block mb-1">DUITKU MERCHANT CODE</label>
                      <input
                        id="duitku-merchant"
                        type="text"
                        defaultValue={gatewayConfig?.duitkuMerchantCode || 'DXXXXX'}
                        className="w-full text-xs bg-white border border-slate-200 rounded-xl p-3 focus:ring-1 focus:ring-blue-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono font-medium text-slate-400 block mb-1">TRIPAY API KEY</label>
                      <input
                        id="tripay-key"
                        type="text"
                        defaultValue={gatewayConfig?.tripayApiKey || 'TXXXXX'}
                        className="w-full text-xs bg-white border border-slate-200 rounded-xl p-3 focus:ring-1 focus:ring-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 py-2">
                    <input
                      id="sandbox-mode-chk"
                      type="checkbox"
                      defaultChecked={gatewayConfig?.sandboxMode !== false}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="sandbox-mode-chk" className="text-xs font-medium text-slate-600">
                      Aktifkan Sandbox Mode (Lingkungan Pengujian Tanpa Uang Sungguhan)
                    </label>
                  </div>

                  <button
                    onClick={async () => {
                      const provider = (document.getElementById('gateway-provider-select') as HTMLSelectElement)?.value;
                      const midtrans = (document.getElementById('midtrans-client-key') as HTMLInputElement)?.value;
                      const xendit = (document.getElementById('xendit-public-key') as HTMLInputElement)?.value;
                      const dcode = (document.getElementById('duitku-merchant') as HTMLInputElement)?.value;
                      const tkey = (document.getElementById('tripay-key') as HTMLInputElement)?.value;
                      const sand = (document.getElementById('sandbox-mode-chk') as HTMLInputElement)?.checked;

                      setActionLoading(true);
                      const res = await apiDispatch('updateGatewayConfig', {
                        activeGateway: provider,
                        midtransClientKey: midtrans,
                        xenditPublicKey: xendit,
                        duitkuMerchantCode: dcode,
                        tripayApiKey: tkey,
                        sandboxMode: sand
                      });
                      if (res) {
                        triggerToast('Konfigurasi Payment Gateway berhasil disimpan!', 'success');
                        loadData();
                      }
                      setActionLoading(false);
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-sm"
                  >
                    Simpan Pengaturan Gateway
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* --- ALL MODAL DIALOGS (PORTAL VIEW) --- */}

      {/* MODAL 0: ENTERPRISE DOCUMENT ENGINE */}
      {showDocEngine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden my-8"
          >
            <div className="px-6 py-4.5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Printer className="h-4 w-4 text-blue-400" />
                <span>Enterprise Document Engine - Billing SPP</span>
              </h3>
              <button onClick={() => setShowDocEngine(false)} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[80vh] scrollbar-thin">
              <EnterpriseDocumentEngine
                moduleName="BillingSpp"
                title="Laporan Pembayaran SPP Bulanan Pondok Pesantren"
                headers={['ID Tagihan', 'Nama Siswa', 'NIS', 'Jenis Tagihan', 'Tarif Dasar', 'Total Tagihan', 'Terbayar', 'Status']}
                keys={['id', 'student_name', 'student_nis', 'fee_name', 'amount', 'amount', 'amount_paid', 'status']}
                data={invoices}
                templateType="Slip SPP"
                onImportSuccess={() => {
                  loadData();
                }}
              />
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL 1: MASS GENERATE BILLING */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden"
          >
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">Generate Tagihan Masif (Billing Engine)</h3>
              <button onClick={() => setShowGenerateModal(false)} className="p-1 hover:bg-slate-200 rounded-lg">
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleGenerateInvoices} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">TARGET PENERIMA</label>
                  <select
                    value={genTarget}
                    onChange={(e: any) => setGenTarget(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="ALL">Semua Siswa Aktif</option>
                    <option value="CLASS">Per Kelas Spesifik</option>
                    <option value="SINGLE">Satu Siswa Saja</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">JENIS TAGIHAN TARIF</label>
                  <select
                    value={genFeeType}
                    onChange={(e) => setGenFeeType(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">-- Pilih Jenis --</option>
                    {feeTypes.map(ft => (
                      <option key={ft.id} value={ft.id}>{ft.name} (Rp {ft.amount.toLocaleString('id-ID')})</option>
                    ))}
                  </select>
                </div>
              </div>

              {genTarget === 'CLASS' && (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">PILIH KELAS TARGET</label>
                  <select
                    value={genClassId}
                    onChange={(e) => setGenClassId(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2"
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {classrooms.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {genTarget === 'SINGLE' && (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">PILIH SISWA TARGET</label>
                  <select
                    value={genStudentId}
                    onChange={(e) => setGenStudentId(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2"
                  >
                    <option value="">-- Pilih Siswa --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.nis})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">BATAS JATUH TEMPO (DUE DATE)</label>
                  <input
                    type="date"
                    value={genDueDate}
                    onChange={(e) => setGenDueDate(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">NOMINAL KUSTOM (OPSIONAL)</label>
                  <input
                    type="number"
                    placeholder="Kosongkan jika ingin pakai default tarif"
                    value={genCustomAmount}
                    onChange={(e) => setGenCustomAmount(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">KETERANGAN / DESKRIPSI</label>
                <textarea
                  placeholder="Contoh: Tagihan SPP bulan Juli 2026..."
                  value={genDesc}
                  onChange={(e) => setGenDesc(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-4 justify-end border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 text-xs border border-slate-200 hover:bg-slate-100 font-semibold rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition disabled:opacity-50"
                >
                  {actionLoading ? 'Memproses...' : 'Mulai Generate'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT MASTER TARIF */}
      {showTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden"
          >
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">
                {editingType ? 'Edit Jenis Tarif Tagihan' : 'Tambah Jenis Tarif Baru'}
              </h3>
              <button onClick={() => setShowTypeModal(false)} className="p-1 hover:bg-slate-200 rounded-lg">
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleSaveType} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">NAMA TAGIHAN</label>
                <input
                  type="text"
                  placeholder="Contoh: SPP Bulanan Kelas XII, Buku Semester 1"
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">NOMINAL TARIF DEFAULT (RP)</label>
                <input
                  type="number"
                  placeholder="Contoh: 500000"
                  value={typeAmount}
                  onChange={(e) => setTypeAmount(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">KODE TAGIHAN</label>
                  <input
                    type="text"
                    placeholder="Contoh: KODE-SPP"
                    value={typeCode}
                    onChange={(e) => setTypeCode(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none font-mono focus:ring-2"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">FREKUENSI PENAGIHAN</label>
                  <select
                    value={typeFrequency}
                    onChange={(e: any) => setTypeFrequency(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2"
                  >
                    <option value="MONTHLY">Bulanan (Siklikal)</option>
                    <option value="ONE_TIME">Sekali Bayar (Inisial)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2.5 py-1.5">
                <input
                  type="checkbox"
                  id="typeMandatory"
                  checked={typeMandatory}
                  onChange={(e) => setTypeMandatory(e.target.checked)}
                  className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <label htmlFor="typeMandatory" className="text-xs font-semibold text-slate-600 select-none">
                  Bersifat Wajib bagi semua siswa sasaran
                </label>
              </div>

              <div className="flex items-center gap-2 pt-4 justify-end border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTypeModal(false)}
                  className="px-4 py-2 text-xs border border-slate-200 hover:bg-slate-100 font-semibold rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition disabled:opacity-50"
                >
                  {actionLoading ? 'Menyimpan...' : 'Simpan Tarif'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 3: RECORD PAYMENT (KASIR MANUAL) */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden"
          >
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">Input Pembayaran Manual (Kasir Sekolah)</h3>
              <button onClick={() => setShowPayModal(false)} className="p-1 hover:bg-slate-200 rounded-lg">
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleCreatePayment} className="p-6 space-y-4">
              {selectedInvoice && (
                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-2xl text-xs space-y-1.5">
                  <p className="text-slate-500">
                    Siswa: <span className="font-bold text-slate-800">{selectedInvoice.student_name}</span>
                  </p>
                  <p className="text-slate-500">
                    Tagihan: <span className="font-bold text-slate-800">{selectedInvoice.fee_name}</span>
                  </p>
                  <p className="text-slate-500">
                    Batas Waktu: <span className="font-bold text-slate-800">{selectedInvoice.due_date}</span>
                  </p>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">METODE PEMBAYARAN</label>
                <select
                  value={payMethod}
                  onChange={(e: any) => setPayMethod(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2"
                >
                  <option value="CASH">Tunai / Cash (Kas Operasional)</option>
                  <option value="TRANSFER">Transfer Manual Bank</option>
                  <option value="TABUNGAN">Autodebet dari Tabungan Santri</option>
                  <option value="EDC">Kartu Kredit/EDC</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">NOMINAL DISETORKAN (RP)</label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none font-mono focus:ring-2"
                />
              </div>

              <div className="flex items-center gap-2 pt-4 justify-end border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 text-xs border border-slate-200 hover:bg-slate-100 font-semibold rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition disabled:opacity-50"
                >
                  {actionLoading ? 'Membukukan...' : 'Posting Pembayaran'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 4: DISKON, DENDA, BEASISWA ADJUSTMENT */}
      {showAdjustmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden"
          >
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">Penyesuaian (Diskon, Denda, Beasiswa)</h3>
              <button onClick={() => setShowAdjustmentModal(false)} className="p-1 hover:bg-slate-200 rounded-lg">
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleSaveAdjustments} className="p-6 space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">POTONGAN / DISKON (RP)</label>
                  <input
                    type="number"
                    placeholder="Contoh: 50000"
                    value={adjDiscount}
                    onChange={(e) => setAdjDiscount(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl font-mono focus:ring-2"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">ALOKASI BEASISWA (RP)</label>
                  <input
                    type="number"
                    placeholder="Contoh: 150000"
                    value={adjScholarship}
                    onChange={(e) => setAdjScholarship(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl font-mono focus:ring-2"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">DENDA KETERLAMBATAN (RP)</label>
                  <input
                    type="number"
                    placeholder="Contoh: 10000"
                    value={adjFine}
                    onChange={(e) => setAdjFine(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl font-mono focus:ring-2"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">CATATAN / ALASAN PENYESUAIAN</label>
                  <textarea
                    placeholder="Beasiswa prestasi dwi wulan, denda terlambat 5 hari, dsb..."
                    value={adjDesc}
                    onChange={(e) => setAdjDesc(e.target.value)}
                    rows={2}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl resize-none focus:ring-2"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 justify-end border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAdjustmentModal(false)}
                  className="px-4 py-2 text-xs border border-slate-200 hover:bg-slate-100 font-semibold rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition disabled:opacity-50"
                >
                  {actionLoading ? 'Sinkronisasi...' : 'Terapkan Mutasi'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 5: DEPOSIT / WITHDRAWAL SAVINGS (TABUNGAN) */}
      {showSavingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden"
          >
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">Transaksi Tabungan Santri / Siswa</h3>
              <button onClick={() => setShowSavingsModal(false)} className="p-1 hover:bg-slate-200 rounded-lg">
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleSavingsTransaction} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">PILIH SISWA/SANTRI</label>
                <select
                  value={savStudentId}
                  onChange={(e) => setSavStudentId(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.nis})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">TIPE MUTASI</label>
                  <select
                    value={savType}
                    onChange={(e: any) => setSavType(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2"
                  >
                    <option value="DEPOSIT">Setoran (Deposit)</option>
                    <option value="WITHDRAWAL">Penarikan (Withdrawal)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">NOMINAL (RP)</label>
                  <input
                    type="number"
                    value={savAmount}
                    onChange={(e) => setSavAmount(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none font-mono focus:ring-2"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">KETERANGAN</label>
                <input
                  type="text"
                  placeholder="Setoran tabungan harian, Penarikan spp..."
                  value={savDesc}
                  onChange={(e) => setSavDesc(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2"
                />
              </div>

              <div className="flex items-center gap-2 pt-4 justify-end border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSavingsModal(false)}
                  className="px-4 py-2 text-xs border border-slate-200 hover:bg-slate-100 font-semibold rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition disabled:opacity-50"
                >
                  {actionLoading ? 'Menyimpan...' : 'Eksekusi Tabungan'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 6: DIGITAL RECEIPT / KWITANSI */}
      {showReceiptModal && selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden"
          >
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">Kwitansi Digital Pendidikan</h3>
              <button onClick={() => setShowReceiptModal(false)} className="p-1 hover:bg-slate-200 rounded-lg">
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            
            <div id="printable-receipt" className="p-8 space-y-6">
              
              {/* Kwitansi Header */}
              <div className="text-center border-b border-dashed border-slate-200 pb-5">
                <h2 className="text-sm font-bold text-slate-800 tracking-wider uppercase font-mono">{tenant?.name || 'YAYASAN KESEJAHTERAAN SEKOLAH'}</h2>
                <p className="text-[10px] text-slate-400 font-mono mt-1">{tenant?.address || 'Jl. Pendidikan No. 10'}</p>
                <span className="inline-block mt-4 text-[10px] font-mono bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                  KWITANSI DIGITAL RESMI
                </span>
              </div>

              {/* Kwitansi Details */}
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-mono">NOMOR KWITANSI</span>
                  <span className="font-bold text-slate-800 font-mono">#KW-{selectedReceipt.id.substring(4, 12).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-mono">TANGGAL POSTING</span>
                  <span className="font-bold text-slate-800 font-mono">{new Date().toISOString().split('T')[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-mono">NAMA SISWA / SANTRI</span>
                  <span className="font-bold text-slate-800">{selectedReceipt.student_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-mono">NOMOR INDUK SISWA (NIS)</span>
                  <span className="font-bold text-slate-800 font-mono">{selectedReceipt.student_nis || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-mono">UNTUK PEMBAYARAN</span>
                  <span className="font-bold text-slate-800">{selectedReceipt.fee_name}</span>
                </div>

                <div className="pt-4 border-t border-dashed border-slate-100 flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-800 font-mono">JUMLAH DITERIMA</span>
                  <span className="text-lg font-black text-emerald-600 font-mono">
                    Rp {selectedReceipt.amount_paid.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Digital Stamp / Signature */}
              <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <ShieldCheck className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 block font-mono">VERIFIED SECURE</span>
                    <span className="text-[9px] text-slate-400 block font-mono">SECURE BLOCKCHAIN-HASH</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-slate-400 uppercase font-mono">BENDAHARA YAYASAN</p>
                  <p className="text-xs font-bold text-slate-700 mt-3 underline">Sistem Keuangan Otomatis</p>
                </div>
              </div>

              {/* Print Footer Button */}
              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition shadow-sm"
                >
                  <Download className="h-4 w-4" />
                  Cetak Kwitansi / Simpan PDF
                </button>
              </div>

            </div>
          </motion.div>
        </div>
      )}

      {/* NEW MODAL: DISCOUNTS */}
      {showDiscountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden"
          >
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">
                {editingDiscount ? 'Edit Skema Potongan' : 'Tambah Skema Potongan Baru'}
              </h3>
              <button onClick={() => setShowDiscountModal(false)} className="p-1 hover:bg-slate-200 rounded-lg cursor-pointer">
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleSaveDiscount} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">NAMA SKEMA POTONGAN</label>
                <input
                  type="text"
                  placeholder="Contoh: Beasiswa Prestasi, Diskon Guru"
                  value={discName}
                  onChange={(e) => setDiscName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">KODE POTONGAN</label>
                  <input
                    type="text"
                    placeholder="Contoh: BEASISWA-100"
                    value={discCode}
                    onChange={(e) => setDiscCode(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">TIPE POTONGAN</label>
                  <select
                    value={discType}
                    onChange={(e: any) => setDiscType(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="FIXED">Nominal Tetap (Rp)</option>
                    <option value="PERCENTAGE">Persentase (%)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">BESARAN POTONGAN</label>
                <input
                  type="number"
                  placeholder="Contoh: 100000 atau 100"
                  value={discAmount}
                  onChange={(e) => setDiscAmount(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none font-mono focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">KETERANGAN</label>
                <textarea
                  placeholder="Deskripsikan penerima atau kriteria potongan ini..."
                  value={discDesc}
                  onChange={(e) => setDiscDesc(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-4 justify-end border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDiscountModal(false)}
                  className="px-4 py-2 text-xs border border-slate-200 hover:bg-slate-100 font-semibold rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? 'Menyimpan...' : 'Simpan Potongan'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* NEW MODAL: FINES */}
      {showFineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden"
          >
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">
                {editingFine ? 'Edit Aturan Denda' : 'Tambah Aturan Denda Baru'}
              </h3>
              <button onClick={() => setShowFineModal(false)} className="p-1 hover:bg-slate-200 rounded-lg cursor-pointer">
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleSaveFine} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">NAMA DENDA</label>
                <input
                  type="text"
                  placeholder="Contoh: Denda Keterlambatan SPP bulanan"
                  value={fnName}
                  onChange={(e) => setFnName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">KODE DENDA</label>
                  <input
                    type="text"
                    placeholder="Contoh: FINE-SPP"
                    value={fnCode}
                    onChange={(e) => setFnCode(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">TIPE DENDA</label>
                  <select
                    value={fnType}
                    onChange={(e: any) => setFnType(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="FIXED">Nominal Tetap (Rp)</option>
                    <option value="PERCENTAGE">Persentase (%)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">BESARAN DENDA</label>
                  <input
                    type="number"
                    placeholder="Contoh: 10000"
                    value={fnAmount}
                    onChange={(e) => setFnAmount(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none font-mono focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">GRACE PERIOD (HARI)</label>
                  <input
                    type="number"
                    placeholder="Masa tenggang dalam hari"
                    value={fnGrace}
                    onChange={(e) => setFnGrace(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">DESKRIPSI / KETERANGAN</label>
                <textarea
                  placeholder="Keterangan denda ini akan dicantumkan di invoice santri yang telat..."
                  value={fnDesc}
                  onChange={(e) => setFnDesc(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-4 justify-end border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFineModal(false)}
                  className="px-4 py-2 text-xs border border-slate-200 hover:bg-slate-100 font-semibold rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? 'Menyimpan...' : 'Simpan Denda'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* NEW MODAL: BANK ACCOUNTS */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden"
          >
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">
                {editingAccount ? 'Edit Rekening Bank' : 'Tambah Rekening Bank Baru'}
              </h3>
              <button onClick={() => setShowAccountModal(false)} className="p-1 hover:bg-slate-200 rounded-lg cursor-pointer">
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleSaveBankAccount} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">NAMA BANK</label>
                <input
                  type="text"
                  placeholder="Contoh: Bank Syariah Indonesia, BCA Syariah"
                  value={bnkName}
                  onChange={(e) => setBnkName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">NOMOR REKENING</label>
                <input
                  type="text"
                  placeholder="Contoh: 7123456789"
                  value={bnkNumber}
                  onChange={(e) => setBnkNumber(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none font-mono focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">NAMA PEMILIK (ATAS NAMA)</label>
                <input
                  type="text"
                  placeholder="Contoh: YAYASAN SEKOLAH BARU"
                  value={bnkHolder}
                  onChange={(e) => setBnkHolder(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">KANTOR CABANG (OPSIONAL)</label>
                <input
                  type="text"
                  placeholder="Contoh: Cabang Jakarta Pusat"
                  value={bnkBranch}
                  onChange={(e) => setBnkBranch(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-4 justify-end border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAccountModal(false)}
                  className="px-4 py-2 text-xs border border-slate-200 hover:bg-slate-100 font-semibold rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? 'Menyimpan...' : 'Simpan Rekening'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* NEW MODAL: VIRTUAL ACCOUNTS */}
      {showVaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden"
          >
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">Generate Virtual Account Siswa</h3>
              <button onClick={() => setShowVaModal(false)} className="p-1 hover:bg-slate-200 rounded-lg cursor-pointer">
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleSaveVa} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">PILIH SISWA</label>
                <select
                  value={vaStudentId}
                  onChange={(e) => setVaStudentId(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                >
                  <option value="">-- Pilih Siswa --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (NIS: {s.nis || '-'})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">NAMA BANK VA</label>
                  <select
                    value={vaBankName}
                    onChange={(e) => setVaBankName(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Bank Muamalat">Bank Muamalat</option>
                    <option value="BSI (Bank Syariah Indonesia)">BSI</option>
                    <option value="BCA Syariah">BCA Syariah</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">PERUNTUKAN / TIPE</label>
                  <select
                    value={vaType}
                    onChange={(e) => setVaType(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="SPP">Pembayaran SPP</option>
                    <option value="UANG_PANGKAL">Uang Pangkal / Pendaftaran</option>
                    <option value="KEGIATAN">Uang Kegiatan / Wisuda</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">SIMULASI NOMOR VA (TER-GENERATE OTOMATIS)</label>
                <input
                  type="text"
                  value={vaNumber}
                  onChange={(e) => setVaNumber(e.target.value)}
                  placeholder="Terisi otomatis..."
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none font-mono focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-4 justify-end border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowVaModal(false)}
                  className="px-4 py-2 text-xs border border-slate-200 hover:bg-slate-100 font-semibold rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? 'Meng-generate...' : 'Simpan & Aktivasi VA'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* NEW MODAL: AUTO BILLING RULES */}
      {showRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden"
          >
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">
                {editingRule ? 'Edit Aturan Auto-Billing' : 'Tambah Aturan Auto-Billing'}
              </h3>
              <button onClick={() => setShowRuleModal(false)} className="p-1 hover:bg-slate-200 rounded-lg cursor-pointer">
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleSaveRule} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">NAMA ATURAN OTOMATISASI</label>
                <input
                  type="text"
                  placeholder="Contoh: Auto Tagihan Santri Baru"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">EVENT PEMICU (TRIGGER)</label>
                  <select
                    value={ruleEvent}
                    onChange={(e) => setRuleEvent(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="NEW_STUDENT">Siswa Baru Terdaftar</option>
                    <option value="ACADEMIC_YEAR_START">Tahun Ajaran Baru Dimulai</option>
                    <option value="GRADUATION">Kelulusan Siswa</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">JENIS TAGIHAN YG DI-GENERATE</label>
                  <select
                    value={ruleFeeTypeId}
                    onChange={(e) => setRuleFeeTypeId(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                    required
                  >
                    <option value="">-- Pilih Tarif SPP --</option>
                    {feeTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">DESKRIPSI ATURAN</label>
                <textarea
                  placeholder="Keterangan bagaimana aturan ini dijalankan oleh scheduler..."
                  value={ruleDesc}
                  onChange={(e) => setRuleDesc(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-4 justify-end border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRuleModal(false)}
                  className="px-4 py-2 text-xs border border-slate-200 hover:bg-slate-100 font-semibold rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? 'Menyimpan...' : 'Simpan Aturan'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
