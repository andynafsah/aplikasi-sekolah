import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../core/base.controller';
import { DB, generateJWT, verifyJWT, logActivity, runAIGateway, DIAG_STATE } from '../../server';
import { AutoNumberService } from '../services/autonumber.service';

export class PaymentController extends BaseController {

  public async index(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.success(res, [], 'Index method');
    } catch (error) {
      next(error);
    }
  }

  public async show(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.success(res, null, 'Show method');
    } catch (error) {
      next(error);
    }
  }

  public async store(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.created(res, null, 'Store method');
    } catch (error) {
      next(error);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.updated(res, null, 'Update method');
    } catch (error) {
      next(error);
    }
  }

  public async destroy(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.deleted(res, 'Destroy method');
    } catch (error) {
      next(error);
    }
  }

  public async search(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.success(res, [], 'Search method');
    } catch (error) {
      next(error);
    }
  }

  public async export(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.success(res, { url: '#' }, 'Export method');
    } catch (error) {
      next(error);
    }
  }

  public async import(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.success(res, null, 'Import method');
    } catch (error) {
      next(error);
    }
  }


  public async handle(
  action: string,
  req: any,
  res: any,
  tenantId: string,
  authUser: any,
  username: string,
  role: string
): Promise<any> {
  // Ensure custom collections are initialized dynamically
  if (!(DB as any).studentSavings) {
    (DB as any).studentSavings = [
      { id: 'sav-1', tenant_id: 'tenant-1', student_id: 'stud-1', balance: 1250000 },
      { id: 'sav-2', tenant_id: 'tenant-1', student_id: 'stud-2', balance: 350000 },
      { id: 'sav-3', tenant_id: 'tenant-2', student_id: 'stud-4', balance: 5000000 }
    ];
  }
  if (!(DB as any).savingsTransactions) {
    (DB as any).savingsTransactions = [
      { id: 'savtx-1', tenant_id: 'tenant-1', student_id: 'stud-1', date: '2026-07-01', type: 'DEPOSIT', amount: 1250000, description: 'Setoran tabungan awal siswa', recorded_by: 'bendahara_sma', created_at: new Date().toISOString() },
      { id: 'savtx-2', tenant_id: 'tenant-1', student_id: 'stud-2', date: '2026-07-02', type: 'DEPOSIT', amount: 350000, description: 'Setoran tabungan harian', recorded_by: 'bendahara_sma', created_at: new Date().toISOString() },
      { id: 'savtx-3', tenant_id: 'tenant-2', student_id: 'stud-4', date: '2026-07-03', type: 'DEPOSIT', amount: 5000000, description: 'Setoran tabungan syariah santri', recorded_by: 'bendahara_daarul', created_at: new Date().toISOString() }
    ];
  }
  if (!(DB as any).billingNotifications) {
    (DB as any).billingNotifications = [
      { id: 'ntf-1', tenant_id: 'tenant-1', student_id: 'stud-1', type: 'WHATSAPP', phone: '08123456789', message: 'Tagihan SPP Ahmad Fauzi sebesar Rp 500.000 jatuh tempo pada 2026-07-10. Harap segera melakukan pembayaran.', status: 'SENT', sent_at: '2026-07-02T08:00:00Z' },
      { id: 'ntf-2', tenant_id: 'tenant-1', student_id: 'stud-2', type: 'EMAIL', email: 'laila@gmail.com', message: 'Tagihan SPP Siti Aminah sebesar Rp 500.000 jatuh tempo pada 2026-07-10. Harap segera melakukan pembayaran.', status: 'SENT', sent_at: '2026-07-02T08:15:00Z' }
    ];
  }
  if (!DB.feeTypes || DB.feeTypes.length === 0) {
    DB.feeTypes = [
      { id: 'ft-spp', tenant_id: 'tenant-1', name: 'SPP Bulanan Aliyah', amount: 500000, frequency: 'MONTHLY', code: 'SPP-AL', is_mandatory: true, category: 'SPP', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
      { id: 'ft-dsp', tenant_id: 'tenant-1', name: 'Gedung & Sarana Pembangunan', amount: 3500000, frequency: 'ONE_TIME', code: 'DSP-BUILD', is_mandatory: true, category: 'DSP', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
      { id: 'ft-seragam', tenant_id: 'tenant-1', name: 'Paket Seragam Utama', amount: 1200000, frequency: 'ONE_TIME', code: 'SRG-MAIN', is_mandatory: true, category: 'Seragam', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
      { id: 'ft-buku', tenant_id: 'tenant-1', name: 'Buku Paket K13 Ganjil', amount: 850000, frequency: 'SEMESTERLY', code: 'BKP-G10', is_mandatory: true, category: 'Buku', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
      { id: 'ft-asrama', tenant_id: 'tenant-1', name: 'Iuran Asrama Putra', amount: 1500000, frequency: 'MONTHLY', code: 'ASR-PTRA', is_mandatory: false, category: 'Asrama', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null }
    ];
  }
  if (!DB.feeInvoices || DB.feeInvoices.length === 0) {
    DB.feeInvoices = [
      { id: 'INV-2026-0001', tenant_id: 'tenant-1', student_id: 'stud-1', fee_type_id: 'ft-spp', amount: 500000, amount_paid: 500000, status: 'PAID', discount_amount: 0, fine_amount: 0, scholarship_amount: 0, due_date: '2026-07-10', description: 'SPP Bulanan Ahmad Fauzi Juli 2026', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
      { id: 'INV-2026-0002', tenant_id: 'tenant-1', student_id: 'stud-2', fee_type_id: 'ft-spp', amount: 500000, amount_paid: 200000, status: 'PARTIAL', discount_amount: 50000, fine_amount: 0, scholarship_amount: 0, due_date: '2026-07-10', description: 'SPP Bulanan Siti Aminah Juli 2026', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
      { id: 'INV-2026-0003', tenant_id: 'tenant-1', student_id: 'stud-3', fee_type_id: 'ft-spp', amount: 500000, amount_paid: 0, status: 'UNPAID', discount_amount: 0, fine_amount: 25000, scholarship_amount: 100000, due_date: '2026-07-10', description: 'SPP Bulanan Budi Santoso Juli 2026', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
      { id: 'INV-2026-0004', tenant_id: 'tenant-1', student_id: 'stud-1', fee_type_id: 'ft-dsp', amount: 3500000, amount_paid: 0, status: 'UNPAID', discount_amount: 500000, fine_amount: 0, scholarship_amount: 0, due_date: '2026-08-01', description: 'Uang Pembangunan Ahmad Fauzi', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null }
    ];
  }
  if (!(DB as any).feeDiscounts) {
    (DB as any).feeDiscounts = [
      { id: 'fd-prestasi', tenant_id: 'tenant-1', name: 'Diskon Prestasi Akademik', code: 'DISC-ACAD', type: 'FIXED', amount: 200000, description: 'Potongan tetap untuk siswa berprestasi', created_at: new Date().toISOString(), deleted_at: null },
      { id: 'fd-beasiswa-yatim', tenant_id: 'tenant-1', name: 'Beasiswa Santri Yatim Piatu', code: 'SCH-YATIM', type: 'PERCENTAGE', amount: 100, description: 'Potongan penuh untuk santri yatim', created_at: new Date().toISOString(), deleted_at: null }
    ];
  }
  if (!(DB as any).feeFines) {
    (DB as any).feeFines = [
      { id: 'ff-late', tenant_id: 'tenant-1', name: 'Denda Keterlambatan SPP', code: 'FINE-SPP', type: 'FIXED', amount: 25000, description: 'Denda flat bulanan bila melewati jatuh tempo', grace_period: 5, created_at: new Date().toISOString(), deleted_at: null }
    ];
  }
  if (!DB.bankAccounts || DB.bankAccounts.length === 0) {
    DB.bankAccounts = [
      { id: 'bank-1', tenant_id: 'tenant-1', account_number: '124-555-8890', bank_name: 'Bank Muamalat Syariah', holder_name: 'Bendahara Madrasah Aliyah', branch: 'Surabaya Sudirman', status: 'ACTIVE', created_at: new Date().toISOString(), deleted_at: null },
      { id: 'bank-2', tenant_id: 'tenant-1', account_number: '788-002-3341', bank_name: 'Bank Syariah Indonesia (BSI)', holder_name: 'Yayasan Bina Ummah', branch: 'Sidoarjo Kota', status: 'ACTIVE', created_at: new Date().toISOString(), deleted_at: null }
    ];
  }
  if (!(DB as any).virtualAccounts) {
    (DB as any).virtualAccounts = [
      { id: 'va-1', tenant_id: 'tenant-1', student_id: 'stud-1', va_number: '9880010098123456', bank_name: 'Bank Muamalat', type: 'SPP', status: 'ACTIVE', created_at: new Date().toISOString() },
      { id: 'va-2', tenant_id: 'tenant-1', student_id: 'stud-2', va_number: '9880010098123457', bank_name: 'Bank Muamalat', type: 'SPP', status: 'ACTIVE', created_at: new Date().toISOString() },
      { id: 'va-3', tenant_id: 'tenant-1', student_id: 'stud-3', va_number: '9880010098123458', bank_name: 'Bank Muamalat', type: 'SPP', status: 'ACTIVE', created_at: new Date().toISOString() }
    ];
  }
  if (!(DB as any).autoBillingRules) {
    (DB as any).autoBillingRules = [
      { id: 'abr-1', tenant_id: 'tenant-1', name: 'Aturan Seragam Baru Santri', trigger_event: 'NEW_STUDENT', fee_type_id: 'ft-seragam', is_active: true, description: 'Otomatis generate tagihan seragam saat santri baru diterima', created_at: new Date().toISOString() },
      { id: 'abr-2', tenant_id: 'tenant-1', name: 'Buku Paket Awal Semester', trigger_event: 'NEW_SEMESTER', fee_type_id: 'ft-buku', is_active: true, description: 'Otomatis generate tagihan buku paket ketika semester ganjil dimulai', created_at: new Date().toISOString() }
    ];
  }

  switch (action) {
    case 'getFeeInvoices': {
      const invoices = DB.feeInvoices.filter(i => i.tenant_id === tenantId && i.deleted_at === null);
      const enrichedInvoices = invoices.map(inv => {
        const student = DB.students.find(s => s.id === inv.student_id);
        const feeType = DB.feeTypes.find(f => f.id === inv.fee_type_id);
        
        // Safety parsing of discount/fine/scholarship to guarantee correct net calculations
        const disc = Number((inv as any).discount_amount || 0);
        const fine = Number((inv as any).fine_amount || 0);
        const schol = Number((inv as any).scholarship_amount || 0);
        const netAmount = Math.max(0, inv.amount + fine - disc - schol);

        return {
          ...inv,
          student_name: student ? student.name : 'Siswa Tidak Dikenal',
          student_nis: student ? student.nis : '',
          class_id: student ? student.classroom_id : '',
          fee_name: feeType ? feeType.name : 'Tagihan Kustom',
          fee_frequency: feeType ? feeType.frequency : 'ONE_TIME',
          discount_amount: disc,
          fine_amount: fine,
          scholarship_amount: schol,
          net_amount: netAmount
        };
      });
      return res.json({ success: true, message: 'Success', data: enrichedInvoices });
    }

    case 'getFeePayments': {
      const payments = DB.feePayments.filter(p => p.tenant_id === tenantId && p.deleted_at === null);
      const enrichedPayments = payments.map(p => {
        const inv = DB.feeInvoices.find(i => i.id === p.invoice_id);
        const student = inv ? DB.students.find(s => s.id === inv.student_id) : null;
        const feeType = inv ? DB.feeTypes.find(f => f.id === inv.fee_type_id) : null;
        return {
          ...p,
          student_name: student ? student.name : 'Siswa Tidak Dikenal',
          student_nis: student ? student.nis : '',
          fee_name: feeType ? feeType.name : 'Tagihan Kustom',
          due_date: inv ? inv.due_date : ''
        };
      });
      return res.json({ success: true, message: 'Success', data: enrichedPayments });
    }

    case 'createFeePayment': {
      const { invoice_id, amount, payment_method, gateway_reference, is_tabungan_withdrawal } = req.body;
      const invoiceIndex = DB.feeInvoices.findIndex(i => i.id === invoice_id && i.tenant_id === tenantId);
      if (invoiceIndex === -1) return res.json({ success: false, message: 'Tagihan tidak ditemukan' });
      
      const invoice = DB.feeInvoices[invoiceIndex];

      // Calculate Net Remaining Due
      const disc = Number((invoice as any).discount_amount || 0);
      const fine = Number((invoice as any).fine_amount || 0);
      const schol = Number((invoice as any).scholarship_amount || 0);
      const netAmount = Math.max(0, invoice.amount + fine - disc - schol);
      const remainingAmount = Math.max(0, netAmount - invoice.amount_paid);

      const payVal = Number(amount);
      if (payVal <= 0) {
        return res.json({ success: false, message: 'Nominal pembayaran harus lebih besar dari 0' });
      }

      // Handle Savings (Tabungan) Payment Method Withdrawal check
      if (payment_method === 'TABUNGAN' || is_tabungan_withdrawal) {
        const savingsIdx = (DB as any).studentSavings.findIndex((s: any) => s.student_id === invoice.student_id && s.tenant_id === tenantId);
        if (savingsIdx === -1 || (DB as any).studentSavings[savingsIdx].balance < payVal) {
          return res.json({ success: false, message: 'Saldo tabungan siswa tidak mencukupi untuk melakukan pembayaran ini' });
        }
        // Deduct from savings
        (DB as any).studentSavings[savingsIdx].balance -= payVal;
        
        // Add savings withdrawal transaction
        const savingsTx = {
          id: `savtx-${Date.now()}`,
          tenant_id: tenantId,
          student_id: invoice.student_id,
          date: new Date().toISOString().split('T')[0],
          type: 'WITHDRAWAL',
          amount: payVal,
          description: `Penarikan otomatis untuk pembayaran tagihan #${invoice_id}`,
          recorded_by: username || 'Kasir Otomatis',
          created_at: new Date().toISOString()
        };
        (DB as any).savingsTransactions.push(savingsTx);
      }

      const newPaid = invoice.amount_paid + payVal;
      let newStatus = 'PARTIAL';
      if (newPaid >= netAmount) {
        newStatus = 'PAID';
      }

      // Update Invoice
      DB.feeInvoices[invoiceIndex] = {
        ...invoice,
        amount_paid: newPaid,
        status: newStatus as any,
        updated_at: new Date().toISOString(),
        updated_by: authUser?.id || 'system'
      };

      // Add Payment Receipt
      const paymentId = AutoNumberService.generateNextNumber(tenantId, 'PAY');
      const payment = {
        id: paymentId,
        tenant_id: tenantId,
        invoice_id,
        payment_date: new Date().toISOString().split('T')[0],
        amount: payVal,
        payment_method: payment_method || 'CASH',
        recorded_by: username || 'Kasir',
        gateway_reference: gateway_reference || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        created_by: authUser?.id || 'system',
        updated_by: authUser?.id || 'system'
      };
      DB.feePayments.push(payment);

      // Auto Journal Voucher Generation for double entry alignment
      const jvId = `jv-${Date.now()}`;
      const jvNo = AutoNumberService.generateNextNumber(tenantId, 'JV');
      if (!DB.journalVouchers) DB.journalVouchers = [];
      if (!DB.journalDetails) DB.journalDetails = [];

      DB.journalVouchers.push({
        id: jvId,
        tenant_id: tenantId,
        date: new Date().toISOString().split('T')[0],
        voucher_no: jvNo,
        description: `Auto Journal - Penerimaan Pembayaran SPP #${invoice_id}`,
        is_recurring: false,
        status: 'POSTED',
        approved_by: username || 'system',
        created_at: new Date().toISOString()
      });

      DB.journalDetails.push(
        { id: `jd-${Date.now()}-dr`, journal_voucher_id: jvId, tenant_id: tenantId, account_code: '11101', account_name: 'Kas Utama', debit: payVal, credit: 0 },
        { id: `jd-${Date.now()}-cr`, journal_voucher_id: jvId, tenant_id: tenantId, account_code: '41101', account_name: 'Pendapatan SPP Sekolah', debit: 0, credit: payVal }
      );

      // Add Cash Book entry (Buku Kas)
      const cashEntry = {
        id: `csh-${Date.now()}`,
        tenant_id: tenantId,
        date: new Date().toISOString().split('T')[0],
        type: 'IN' as const,
        amount: payVal,
        description: `Pembayaran tagihan SPP/Pendidikan dari tagihan #${invoice_id} [Metode: ${payment_method}]`,
        category: 'SPP',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        created_by: authUser?.id || 'system',
        updated_by: authUser?.id || 'system'
      };
      DB.cashTransactions.push(cashEntry);

      // Add Ledger Debit/Credit for accounting synchronization
      const ledgerDebit = {
        id: `led-${Date.now()}-dr`,
        tenant_id: tenantId,
        date: new Date().toISOString().split('T')[0],
        account_code: '11101',
        account_name: 'Kas Utama',
        debit: payVal,
        credit: 0,
        description: `Penerimaan Pembayaran Tagihan SPP #${invoice_id}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        created_by: authUser?.id || 'system',
        updated_by: authUser?.id || 'system'
      };
      const ledgerCredit = {
        id: `led-${Date.now()}-cr`,
        tenant_id: tenantId,
        date: new Date().toISOString().split('T')[0],
        account_code: '41101',
        account_name: 'Pendapatan SPP Sekolah',
        debit: 0,
        credit: payVal,
        description: `Pencatatan Pendapatan SPP #${invoice_id}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        created_by: authUser?.id || 'system',
        updated_by: authUser?.id || 'system'
      };
      DB.ledgerEntries.push(ledgerDebit, ledgerCredit);

      logActivity(tenantId, authUser?.id || 'system', username || 'system', role || 'STAFF', 'INSERT', 'Keuangan', `Menerima pembayaran tagihan #${invoice_id}: Rp ${payVal.toLocaleString('id-ID')} via ${payment_method}`);
      return res.json({ success: true, message: 'Pembayaran sukses dicatat & Kas-Buku disinkronkan', data: payment });
    }

    // --- FEE TYPES / TARIF (MASTER) CRUD ---
    case 'getFeeTypes': {
      const types = DB.feeTypes.filter(f => f.tenant_id === tenantId && f.deleted_at === null);
      return res.json({ success: true, message: 'Success', data: types });
    }

    case 'createFeeType': {
      const { name, amount, frequency, code, is_mandatory } = req.body;
      const newType: any = {
        id: `ft-${Date.now()}`,
        tenant_id: tenantId,
        name,
        amount: Number(amount || 0),
        frequency: frequency || 'MONTHLY',
        code: code || `FT-${Date.now().toString().substring(8)}`,
        is_mandatory: is_mandatory !== false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        created_by: authUser?.id || 'system',
        updated_by: authUser?.id || 'system'
      };
      DB.feeTypes.push(newType as any);
      logActivity(tenantId, authUser?.id || 'system', username || 'system', role || 'STAFF', 'INSERT', 'Billing Master', `Membuat jenis tagihan baru: ${name} - Rp ${Number(amount).toLocaleString('id-ID')}`);
      return res.json({ success: true, message: 'Jenis tagihan baru berhasil ditambahkan', data: newType });
    }

    case 'updateFeeType': {
      const { id, name, amount, frequency, code, is_mandatory } = req.body;
      const idx = DB.feeTypes.findIndex(f => f.id === id && f.tenant_id === tenantId);
      if (idx === -1) return res.json({ success: false, message: 'Jenis tagihan tidak ditemukan' });

      (DB.feeTypes as any)[idx] = {
        ...DB.feeTypes[idx],
        name: name || DB.feeTypes[idx].name,
        amount: amount !== undefined ? Number(amount) : DB.feeTypes[idx].amount,
        frequency: frequency || DB.feeTypes[idx].frequency,
        code: code || (DB.feeTypes[idx] as any).code,
        is_mandatory: is_mandatory !== undefined ? is_mandatory : (DB.feeTypes[idx] as any).is_mandatory,
        updated_at: new Date().toISOString(),
        updated_by: authUser?.id || 'system'
      };

      logActivity(tenantId, authUser?.id || 'system', username || 'system', role || 'STAFF', 'UPDATE', 'Billing Master', `Memperbarui jenis tagihan ID ${id}: ${name}`);
      return res.json({ success: true, message: 'Jenis tagihan berhasil diperbarui', data: DB.feeTypes[idx] });
    }

    case 'deleteFeeType': {
      const { id } = req.body;
      const idx = DB.feeTypes.findIndex(f => f.id === id && f.tenant_id === tenantId);
      if (idx === -1) return res.json({ success: false, message: 'Jenis tagihan tidak ditemukan' });

      DB.feeTypes[idx].deleted_at = new Date().toISOString() as any;
      logActivity(tenantId, authUser?.id || 'system', username || 'system', role || 'STAFF', 'DELETE', 'Billing Master', `Menghapus jenis tagihan ID ${id}`);
      return res.json({ success: true, message: 'Jenis tagihan berhasil dihapus' });
    }

    // --- DISCOUNTS CRUD ---
    case 'getFeeDiscounts': {
      const discounts = ((DB as any).feeDiscounts || []).filter((d: any) => d.tenant_id === tenantId && d.deleted_at === null);
      return res.json({ success: true, message: 'Success', data: discounts });
    }
    case 'createFeeDiscount': {
      const { name, code, type, amount, description } = req.body;
      const newDiscount = {
        id: `fd-${Date.now()}`,
        tenant_id: tenantId,
        name,
        code: code || `DISC-${Date.now().toString().substring(8)}`,
        type: type || 'FIXED',
        amount: Number(amount || 0),
        description: description || '',
        created_at: new Date().toISOString(),
        deleted_at: null
      };
      if (!(DB as any).feeDiscounts) (DB as any).feeDiscounts = [];
      (DB as any).feeDiscounts.push(newDiscount);
      logActivity(tenantId, authUser?.id || 'system', username || 'system', role || 'STAFF', 'INSERT', 'Billing Master', `Membuat master potongan/diskon baru: ${name}`);
      return res.json({ success: true, message: 'Diskon baru berhasil ditambahkan', data: newDiscount });
    }
    case 'updateFeeDiscount': {
      const { id, name, code, type, amount, description } = req.body;
      const idx = ((DB as any).feeDiscounts || []).findIndex((d: any) => d.id === id && d.tenant_id === tenantId);
      if (idx === -1) return res.json({ success: false, message: 'Diskon tidak ditemukan' });
      (DB as any).feeDiscounts[idx] = {
        ...(DB as any).feeDiscounts[idx],
        name: name || (DB as any).feeDiscounts[idx].name,
        code: code || (DB as any).feeDiscounts[idx].code,
        type: type || (DB as any).feeDiscounts[idx].type,
        amount: amount !== undefined ? Number(amount) : (DB as any).feeDiscounts[idx].amount,
        description: description !== undefined ? description : (DB as any).feeDiscounts[idx].description,
        updated_at: new Date().toISOString()
      };
      logActivity(tenantId, authUser?.id || 'system', username || 'system', role || 'STAFF', 'UPDATE', 'Billing Master', `Memperbarui diskon ID ${id}: ${name}`);
      return res.json({ success: true, message: 'Diskon berhasil diperbarui', data: (DB as any).feeDiscounts[idx] });
    }
    case 'deleteFeeDiscount': {
      const { id } = req.body;
      const idx = ((DB as any).feeDiscounts || []).findIndex((d: any) => d.id === id && d.tenant_id === tenantId);
      if (idx === -1) return res.json({ success: false, message: 'Diskon tidak ditemukan' });
      (DB as any).feeDiscounts[idx].deleted_at = new Date().toISOString();
      logActivity(tenantId, authUser?.id || 'system', username || 'system', role || 'STAFF', 'DELETE', 'Billing Master', `Menghapus diskon ID ${id}`);
      return res.json({ success: true, message: 'Diskon berhasil dihapus' });
    }

    // --- FINES CRUD ---
    case 'getFeeFines': {
      const fines = ((DB as any).feeFines || []).filter((f: any) => f.tenant_id === tenantId && f.deleted_at === null);
      return res.json({ success: true, message: 'Success', data: fines });
    }
    case 'createFeeFine': {
      const { name, code, type, amount, grace_period, description } = req.body;
      const newFine = {
        id: `ff-${Date.now()}`,
        tenant_id: tenantId,
        name,
        code: code || `FINE-${Date.now().toString().substring(8)}`,
        type: type || 'FIXED',
        amount: Number(amount || 0),
        grace_period: Number(grace_period || 0),
        description: description || '',
        created_at: new Date().toISOString(),
        deleted_at: null
      };
      if (!(DB as any).feeFines) (DB as any).feeFines = [];
      (DB as any).feeFines.push(newFine);
      logActivity(tenantId, authUser?.id || 'system', username || 'system', role || 'STAFF', 'INSERT', 'Billing Master', `Membuat master denda baru: ${name}`);
      return res.json({ success: true, message: 'Denda baru berhasil ditambahkan', data: newFine });
    }
    case 'updateFeeFine': {
      const { id, name, code, type, amount, grace_period, description } = req.body;
      const idx = ((DB as any).feeFines || []).findIndex((f: any) => f.id === id && f.tenant_id === tenantId);
      if (idx === -1) return res.json({ success: false, message: 'Denda tidak ditemukan' });
      (DB as any).feeFines[idx] = {
        ...(DB as any).feeFines[idx],
        name: name || (DB as any).feeFines[idx].name,
        code: code || (DB as any).feeFines[idx].code,
        type: type || (DB as any).feeFines[idx].type,
        amount: amount !== undefined ? Number(amount) : (DB as any).feeFines[idx].amount,
        grace_period: grace_period !== undefined ? Number(grace_period) : (DB as any).feeFines[idx].grace_period,
        description: description !== undefined ? description : (DB as any).feeFines[idx].description,
        updated_at: new Date().toISOString()
      };
      logActivity(tenantId, authUser?.id || 'system', username || 'system', role || 'STAFF', 'UPDATE', 'Billing Master', `Memperbarui denda ID ${id}: ${name}`);
      return res.json({ success: true, message: 'Denda berhasil diperbarui', data: (DB as any).feeFines[idx] });
    }
    case 'deleteFeeFine': {
      const { id } = req.body;
      const idx = ((DB as any).feeFines || []).findIndex((f: any) => f.id === id && f.tenant_id === tenantId);
      if (idx === -1) return res.json({ success: false, message: 'Denda tidak ditemukan' });
      (DB as any).feeFines[idx].deleted_at = new Date().toISOString();
      logActivity(tenantId, authUser?.id || 'system', username || 'system', role || 'STAFF', 'DELETE', 'Billing Master', `Menghapus denda ID ${id}`);
      return res.json({ success: true, message: 'Denda berhasil dihapus' });
    }

    // --- BANK ACCOUNTS / REKENING CRUD ---
    case 'getBankAccounts': {
      const accounts = (DB.bankAccounts || []).filter((b: any) => b.tenant_id === tenantId && b.deleted_at === null);
      return res.json({ success: true, message: 'Success', data: accounts });
    }
    case 'createBankAccount': {
      const { bank_name, account_number, holder_name, branch } = req.body;
      const newAccount = {
        id: `bank-${Date.now()}`,
        tenant_id: tenantId,
        bank_name,
        account_number,
        holder_name,
        branch: branch || '',
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        deleted_at: null
      };
      if (!DB.bankAccounts) DB.bankAccounts = [];
      DB.bankAccounts.push(newAccount as any);
      logActivity(tenantId, authUser?.id || 'system', username || 'system', role || 'STAFF', 'INSERT', 'Billing Master', `Membuat rekening bank baru: ${bank_name} ${account_number}`);
      return res.json({ success: true, message: 'Rekening baru berhasil didaftarkan', data: newAccount });
    }
    case 'updateBankAccount': {
      const { id, bank_name, account_number, holder_name, branch, status } = req.body;
      const idx = (DB.bankAccounts || []).findIndex((b: any) => b.id === id && b.tenant_id === tenantId);
      if (idx === -1) return res.json({ success: false, message: 'Rekening tidak ditemukan' });
      DB.bankAccounts[idx] = {
        ...DB.bankAccounts[idx],
        bank_name: bank_name || DB.bankAccounts[idx].bank_name,
        account_number: account_number || DB.bankAccounts[idx].account_number,
        holder_name: holder_name || DB.bankAccounts[idx].holder_name,
        branch: branch !== undefined ? branch : DB.bankAccounts[idx].branch,
        status: status || DB.bankAccounts[idx].status,
        updated_at: new Date().toISOString() as any
      };
      logActivity(tenantId, authUser?.id || 'system', username || 'system', role || 'STAFF', 'UPDATE', 'Billing Master', `Memperbarui rekening bank ID ${id}`);
      return res.json({ success: true, message: 'Rekening berhasil diperbarui', data: DB.bankAccounts[idx] });
    }
    case 'deleteBankAccount': {
      const { id } = req.body;
      const idx = (DB.bankAccounts || []).findIndex((b: any) => b.id === id && b.tenant_id === tenantId);
      if (idx === -1) return res.json({ success: false, message: 'Rekening tidak ditemukan' });
      DB.bankAccounts[idx].deleted_at = new Date().toISOString() as any;
      logActivity(tenantId, authUser?.id || 'system', username || 'system', role || 'STAFF', 'DELETE', 'Billing Master', `Menghapus rekening bank ID ${id}`);
      return res.json({ success: true, message: 'Rekening berhasil dinonaktifkan/dihapus' });
    }

    // --- VIRTUAL ACCOUNTS CRUD ---
    case 'getVirtualAccounts': {
      const list = ((DB as any).virtualAccounts || []).filter((v: any) => v.tenant_id === tenantId);
      const enriched = list.map((v: any) => {
        const student = DB.students.find(s => s.id === v.student_id);
        return {
          ...v,
          student_name: student ? student.name : 'Unknown Siswa',
          student_nis: student ? student.nisn : 'No NIS'
        };
      });
      return res.json({ success: true, message: 'Success', data: enriched });
    }
    case 'createVirtualAccount': {
      const { student_id, bank_name, type, va_number } = req.body;
      const student = DB.students.find(s => s.id === student_id);
      if (!student) return res.json({ success: false, message: 'Siswa tidak ditemukan' });

      const newVa = {
        id: `va-${Date.now()}`,
        tenant_id: tenantId,
        student_id,
        va_number: va_number || `988${String(Date.now()).substring(5)}`,
        bank_name: bank_name || 'Bank Muamalat',
        type: type || 'SPP',
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      };
      if (!(DB as any).virtualAccounts) (DB as any).virtualAccounts = [];
      (DB as any).virtualAccounts.push(newVa);
      logActivity(tenantId, authUser?.id || 'system', username || 'system', role || 'STAFF', 'INSERT', 'Billing Master', `Membuat Virtual Account baru untuk ${student.name}`);
      return res.json({ success: true, message: 'Virtual Account baru berhasil didaftarkan', data: newVa });
    }
    case 'deleteVirtualAccount': {
      const { id } = req.body;
      const idx = ((DB as any).virtualAccounts || []).findIndex((v: any) => v.id === id && v.tenant_id === tenantId);
      if (idx === -1) return res.json({ success: false, message: 'Virtual Account tidak ditemukan' });
      ((DB as any).virtualAccounts as any).splice(idx, 1);
      logActivity(tenantId, authUser?.id || 'system', username || 'system', role || 'STAFF', 'DELETE', 'Billing Master', `Menghapus Virtual Account ID ${id}`);
      return res.json({ success: true, message: 'Virtual Account berhasil dihapus' });
    }

    // --- AUTO BILLING RULES CRUD ---
    case 'getAutoBillingRules': {
      const rules = ((DB as any).autoBillingRules || []).filter((r: any) => r.tenant_id === tenantId);
      const enriched = rules.map((r: any) => {
        const feeType = DB.feeTypes.find(f => f.id === r.fee_type_id);
        return {
          ...r,
          fee_name: feeType ? feeType.name : 'Unknown Tarif',
          fee_amount: feeType ? feeType.amount : 0
        };
      });
      return res.json({ success: true, message: 'Success', data: enriched });
    }
    case 'createAutoBillingRule': {
      const { name, trigger_event, fee_type_id, description } = req.body;
      const newRule = {
        id: `abr-${Date.now()}`,
        tenant_id: tenantId,
        name,
        trigger_event,
        fee_type_id,
        is_active: true,
        description: description || '',
        created_at: new Date().toISOString()
      };
      if (!(DB as any).autoBillingRules) (DB as any).autoBillingRules = [];
      (DB as any).autoBillingRules.push(newRule);
      logActivity(tenantId, authUser?.id || 'system', username || 'system', role || 'STAFF', 'INSERT', 'Billing Master', `Membuat aturan auto-billing baru: ${name}`);
      return res.json({ success: true, message: 'Aturan auto-billing berhasil didaftarkan', data: newRule });
    }
    case 'updateAutoBillingRule': {
      const { id, name, trigger_event, fee_type_id, description, is_active } = req.body;
      const idx = ((DB as any).autoBillingRules || []).findIndex((r: any) => r.id === id && r.tenant_id === tenantId);
      if (idx === -1) return res.json({ success: false, message: 'Aturan tidak ditemukan' });
      (DB as any).autoBillingRules[idx] = {
        ...(DB as any).autoBillingRules[idx],
        name: name || (DB as any).autoBillingRules[idx].name,
        trigger_event: trigger_event || (DB as any).autoBillingRules[idx].trigger_event,
        fee_type_id: fee_type_id || (DB as any).autoBillingRules[idx].fee_type_id,
        description: description !== undefined ? description : (DB as any).autoBillingRules[idx].description,
        is_active: is_active !== undefined ? is_active : (DB as any).autoBillingRules[idx].is_active,
        updated_at: new Date().toISOString()
      };
      logActivity(tenantId, authUser?.id || 'system', username || 'system', role || 'STAFF', 'UPDATE', 'Billing Master', `Memperbarui aturan auto-billing ID ${id}`);
      return res.json({ success: true, message: 'Aturan auto-billing berhasil diperbarui', data: (DB as any).autoBillingRules[idx] });
    }
    case 'deleteAutoBillingRule': {
      const { id } = req.body;
      const idx = ((DB as any).autoBillingRules || []).findIndex((r: any) => r.id === id && r.tenant_id === tenantId);
      if (idx === -1) return res.json({ success: false, message: 'Aturan tidak ditemukan' });
      ((DB as any).autoBillingRules as any).splice(idx, 1);
      logActivity(tenantId, authUser?.id || 'system', username || 'system', role || 'STAFF', 'DELETE', 'Billing Master', `Menghapus aturan auto-billing ID ${id}`);
      return res.json({ success: true, message: 'Aturan auto-billing berhasil dihapus' });
    }

    // --- BULK OPERATIONS FOR INVOICES ---
    case 'bulkDeleteInvoices': {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) return res.json({ success: false, message: 'Daftar ID tidak valid' });
      let deleted = 0;
      ids.forEach(id => {
        const idx = DB.feeInvoices.findIndex(inv => inv.id === id && inv.tenant_id === tenantId);
        if (idx !== -1) {
          DB.feeInvoices[idx].deleted_at = new Date().toISOString() as any;
          deleted++;
        }
      });
      logActivity(tenantId, authUser?.id || 'system', username || 'system', role || 'STAFF', 'DELETE', 'Keuangan', `Menghapus massal ${deleted} tagihan`);
      return res.json({ success: true, message: `${deleted} tagihan berhasil dihapus secara massal` });
    }
    case 'bulkReminderInvoices': {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) return res.json({ success: false, message: 'Daftar ID tidak valid' });
      let remindersSent = 0;
      ids.forEach(id => {
        const inv = DB.feeInvoices.find(i => i.id === id && i.tenant_id === tenantId);
        if (inv && inv.status !== 'PAID' && inv.deleted_at === null) {
          const student = DB.students.find(s => s.id === inv.student_id);
          const phone = student?.phone || '08123456789';
          const msg = `PENGINGAT RESMI TAGIHAN: Tagihan SPP ${student?.name || 'Siswa'} sebesar Rp ${inv.amount.toLocaleString('id-ID')} jatuh tempo pada ${inv.due_date}. Harap segera melakukan pembayaran melalui VA atau Kasir Sekolah.`;
          
          if (!(DB as any).billingNotifications) (DB as any).billingNotifications = [];
          (DB as any).billingNotifications.push({
            id: `ntf-${Date.now()}-${remindersSent}`,
            tenant_id: tenantId,
            student_id: inv.student_id,
            type: 'WHATSAPP',
            phone,
            message: msg,
            status: 'SENT',
            sent_at: new Date().toISOString()
          });
          remindersSent++;
        }
      });
      logActivity(tenantId, authUser?.id || 'system', username || 'system', role || 'STAFF', 'INSERT', 'Billing Engine', `Mengirimkan ${remindersSent} pengingat tagihan massal via WhatsApp`);
      return res.json({ success: true, message: `${remindersSent} pengingat WhatsApp berhasil dikirim secara massal` });
    }

    // --- SIMULATE AUTOMATIC EVENTS FOR AUTO-BILLING RULE-ENGINE ---
    case 'simulateAutoBillingEvent': {
      const { event, student_id } = req.body;
      const activeRules = ((DB as any).autoBillingRules || []).filter((r: any) => r.tenant_id === tenantId && r.trigger_event === event && r.is_active === true);
      if (activeRules.length === 0) {
        return res.json({ success: false, message: `Tidak ada aturan auto-billing aktif untuk event: ${event}` });
      }

      let generated = 0;
      let targetStudents = DB.students.filter(s => s.tenant_id === tenantId && s.status === 'AKTIF' && s.deleted_at === null);
      if (student_id) {
        targetStudents = targetStudents.filter(s => s.id === student_id);
      }

      activeRules.forEach((rule: any) => {
        const feeType = DB.feeTypes.find(f => f.id === rule.fee_type_id);
        if (feeType) {
          targetStudents.forEach(student => {
            const exists = DB.feeInvoices.some(inv => 
              inv.student_id === student.id && 
              inv.fee_type_id === rule.fee_type_id && 
              inv.deleted_at === null
            );
            if (!exists) {
              const newInvoice = {
                id: `INV-AUTO-${Date.now()}-${generated}`,
                tenant_id: tenantId,
                student_id: student.id,
                fee_type_id: rule.fee_type_id,
                amount: feeType.amount,
                amount_paid: 0,
                status: 'UNPAID' as const,
                discount_amount: 0,
                fine_amount: 0,
                scholarship_amount: 0,
                due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                description: `Sistem Otomatis: ${rule.name} [Pemicu: Event ${event}]`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null,
                created_by: 'system_daemon',
                updated_by: 'system_daemon'
              };
              DB.feeInvoices.push(newInvoice);
              generated++;
            }
          });
        }
      });

      logActivity(tenantId, 'system', 'Billing Rule-Engine', 'System', 'INSERT', 'Billing Engine', `Auto-billing rules triggered for event ${event}: Berhasil membuat ${generated} tagihan baru.`);
      return res.json({ success: true, message: `Auto-billing Rule Engine sukses mengeksekusi event ${event}! Membuat ${generated} tagihan otomatis.` });
    }

    // --- BILLING ENGINE (GENERATE INVOICES) ---
    case 'generateInvoices': {
      const { fee_type_id, target_type, student_id, classroom_id, academic_year, due_date, custom_amount, description } = req.body;
      
      const feeType = DB.feeTypes.find(f => f.id === fee_type_id && f.tenant_id === tenantId);
      if (!feeType) {
        return res.json({ success: false, message: 'Jenis tagihan tarif tidak ditemukan' });
      }

      const billAmount = custom_amount !== undefined ? Number(custom_amount) : feeType.amount;
      const limitDueDate = due_date || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // default 15 days
      
      // Select target students
      let targetStudents = DB.students.filter(s => s.tenant_id === tenantId && s.status === 'AKTIF' && s.deleted_at === null);
      
      if (target_type === 'SINGLE') {
        targetStudents = targetStudents.filter(s => s.id === student_id);
      } else if (target_type === 'CLASS') {
        targetStudents = targetStudents.filter(s => s.classroom_id === classroom_id);
      } else if (target_type === 'ACADEMIC_YEAR' || target_type === 'ANGKATAN') {
        // Mock academic year match based on student nis/id pattern or classroom info
        // Let's assume matching classroom prefix or let all match if not filtered
        if (academic_year) {
          // just mock filtering
          targetStudents = targetStudents.slice(0, 3);
        }
      }

      if (targetStudents.length === 0) {
        return res.json({ success: false, message: 'Tidak ada siswa aktif yang cocok dengan kriteria target' });
      }

      let generatedCount = 0;
      let alreadyExistsCount = 0;

      targetStudents.forEach(student => {
        // Check if invoice already exists for this student and this fee type within the same month/due date (for MONTHLY)
        const exists = DB.feeInvoices.some(inv => 
          inv.student_id === student.id && 
          inv.fee_type_id === fee_type_id && 
          inv.due_date.substring(0, 7) === limitDueDate.substring(0, 7) &&
          inv.deleted_at === null
        );

        if (exists && feeType.frequency === 'MONTHLY') {
          alreadyExistsCount++;
          return;
        }

        const newInvoice = {
          id: AutoNumberService.generateNextNumber(tenantId, 'INV'),
          tenant_id: tenantId,
          student_id: student.id,
          fee_type_id,
          due_date: limitDueDate,
          amount: billAmount,
          amount_paid: 0,
          status: 'UNPAID' as const,
          discount_amount: 0,
          fine_amount: 0,
          scholarship_amount: 0,
          description: description || `Tagihan ${feeType.name} periode ${limitDueDate.substring(0, 7)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
          created_by: authUser?.id || 'system',
          updated_by: authUser?.id || 'system'
        };

        DB.feeInvoices.push(newInvoice);
        generatedCount++;
      });

      logActivity(tenantId, authUser?.id || 'system', username || 'system', role || 'STAFF', 'INSERT', 'Billing Engine', `Menghasilkan ${generatedCount} tagihan ${feeType.name} [Target: ${target_type}]`);
      return res.json({
        success: true,
        message: `Selesai memproses! ${generatedCount} tagihan berhasil di-generate. ${alreadyExistsCount} tagihan dilewati karena sudah ada pada bulan yang sama.`,
        data: { generated: generatedCount, skipped: alreadyExistsCount }
      });
    }

    // --- APPLY DISCOUNT, FINES, SCHOLARSHIPS & UPDATE INVOICES ---
    case 'updateFeeInvoice': {
      const { id, discount_amount, fine_amount, scholarship_amount, due_date, status, description } = req.body;
      const idx = DB.feeInvoices.findIndex(i => i.id === id && i.tenant_id === tenantId);
      if (idx === -1) return res.json({ success: false, message: 'Tagihan tidak ditemukan' });

      const invoice = DB.feeInvoices[idx];
      
      const newDisc = discount_amount !== undefined ? Number(discount_amount) : Number((invoice as any).discount_amount || 0);
      const newFine = fine_amount !== undefined ? Number(fine_amount) : Number((invoice as any).fine_amount || 0);
      const newSchol = scholarship_amount !== undefined ? Number(scholarship_amount) : Number((invoice as any).scholarship_amount || 0);
      
      const netAmount = Math.max(0, invoice.amount + newFine - newDisc - newSchol);
      
      let newStatus = status || invoice.status;
      if (invoice.amount_paid >= netAmount && netAmount > 0) {
        newStatus = 'PAID';
      } else if (invoice.amount_paid > 0 && invoice.amount_paid < netAmount) {
        newStatus = 'PARTIAL';
      } else if (invoice.amount_paid === 0) {
        newStatus = 'UNPAID';
      }

      DB.feeInvoices[idx] = {
        ...invoice,
        due_date: due_date || invoice.due_date,
        status: newStatus,
        discount_amount: newDisc,
        fine_amount: newFine,
        scholarship_amount: newSchol,
        description: description || (invoice as any).description,
        updated_at: new Date().toISOString(),
        updated_by: authUser?.id || 'system'
      } as any;

      logActivity(tenantId, authUser?.id || 'system', username || 'system', role || 'STAFF', 'UPDATE', 'Billing Engine', `Mengubah rincian tagihan ID ${id}: Diskon Rp ${newDisc}, Denda Rp ${newFine}, Beasiswa Rp ${newSchol}`);
      return res.json({ success: true, message: 'Tagihan berhasil diperbarui', data: DB.feeInvoices[idx] });
    }

    case 'deleteFeeInvoice': {
      const { id } = req.body;
      const idx = DB.feeInvoices.findIndex(i => i.id === id && i.tenant_id === tenantId);
      if (idx === -1) return res.json({ success: false, message: 'Tagihan tidak ditemukan' });

      DB.feeInvoices[idx].deleted_at = new Date().toISOString() as any;
      logActivity(tenantId, authUser?.id || 'system', username || 'system', role || 'STAFF', 'DELETE', 'Billing Engine', `Menghapus tagihan ID ${id}`);
      return res.json({ success: true, message: 'Tagihan berhasil dihapus' });
    }

    // --- STUDENT SAVINGS (TABUNGAN) ---
    case 'getStudentSavings': {
      const savings = (DB as any).studentSavings.filter((s: any) => s.tenant_id === tenantId);
      const enrichedSavings = savings.map((sav: any) => {
        const student = DB.students.find(s => s.id === sav.student_id);
        return {
          ...sav,
          student_name: student ? student.name : 'Siswa Tidak Dikenal',
          student_nis: student ? student.nis : '',
          class_id: student ? student.classroom_id : ''
        };
      });
      return res.json({ success: true, message: 'Success', data: enrichedSavings });
    }

    case 'getSavingsTransactions': {
      const txs = (DB as any).savingsTransactions.filter((s: any) => s.tenant_id === tenantId);
      const enrichedTxs = txs.map((tx: any) => {
        const student = DB.students.find(s => s.id === tx.student_id);
        return {
          ...tx,
          student_name: student ? student.name : 'Siswa Tidak Dikenal',
          student_nis: student ? student.nis : ''
        };
      });
      return res.json({ success: true, message: 'Success', data: enrichedTxs });
    }

    case 'createSavingsTransaction': {
      const { student_id, type, amount, description } = req.body;
      const valAmount = Number(amount);
      if (valAmount <= 0) return res.json({ success: false, message: 'Nominal transaksi harus lebih besar dari 0' });

      const student = DB.students.find(s => s.id === student_id && s.tenant_id === tenantId);
      if (!student) return res.json({ success: false, message: 'Siswa tidak ditemukan' });

      let savingsIdx = (DB as any).studentSavings.findIndex((s: any) => s.student_id === student_id && s.tenant_id === tenantId);
      if (savingsIdx === -1) {
        // Initialize new savings account
        const newSavObj = {
          id: `sav-${Date.now()}`,
          tenant_id: tenantId,
          student_id,
          balance: 0
        };
        (DB as any).studentSavings.push(newSavObj);
        savingsIdx = (DB as any).studentSavings.length - 1;
      }

      if (type === 'WITHDRAWAL') {
        if ((DB as any).studentSavings[savingsIdx].balance < valAmount) {
          return res.json({ success: false, message: 'Penarikan gagal, saldo tabungan tidak mencukupi' });
        }
        (DB as any).studentSavings[savingsIdx].balance -= valAmount;
      } else {
        (DB as any).studentSavings[savingsIdx].balance += valAmount;
      }

      const tx = {
        id: `savtx-${Date.now()}`,
        tenant_id: tenantId,
        student_id,
        date: new Date().toISOString().split('T')[0],
        type,
        amount: valAmount,
        description: description || `${type === 'DEPOSIT' ? 'Setoran' : 'Penarikan'} Tabungan Siswa`,
        recorded_by: username || 'Bendahara',
        created_at: new Date().toISOString()
      };
      (DB as any).savingsTransactions.push(tx);

      // Bookkeeping side-effects for general ledger
      if (type === 'DEPOSIT') {
        const ledgerDr = {
          id: `led-${Date.now()}-dr`,
          tenant_id: tenantId,
          date: new Date().toISOString().split('T')[0],
          account_code: '11101',
          account_name: 'Kas Utama',
          debit: valAmount,
          credit: 0,
          description: `Penerimaan Setoran Tabungan Siswa: ${student.name}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
          created_by: authUser?.id || 'system',
          updated_by: authUser?.id || 'system'
        };
        const ledgerCr = {
          id: `led-${Date.now()}-cr`,
          tenant_id: tenantId,
          date: new Date().toISOString().split('T')[0],
          account_code: '21101', // treated as custom Liability/Trust-funds
          account_name: 'Utang Tabungan Santri/Siswa',
          debit: 0,
          credit: valAmount,
          description: `Penerimaan Setoran Tabungan Siswa: ${student.name}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
          created_by: authUser?.id || 'system',
          updated_by: authUser?.id || 'system'
        };
        DB.ledgerEntries.push(ledgerDr, ledgerCr);
      }

      logActivity(tenantId, authUser?.id || 'system', username || 'system', role || 'STAFF', 'INSERT', 'Student Savings', `Mencatat ${type === 'DEPOSIT' ? 'Setoran' : 'Penarikan'} Tabungan Rp ${valAmount.toLocaleString('id-ID')} untuk ${student.name}`);
      return res.json({ success: true, message: 'Transaksi tabungan berhasil dicatat', data: tx });
    }

    // --- NOTIFICATION ENGINE ---
    case 'sendBillingNotification': {
      const { invoice_id, method } = req.body;
      const invoice = DB.feeInvoices.find(i => i.id === invoice_id && i.tenant_id === tenantId);
      if (!invoice) return res.json({ success: false, message: 'Tagihan tidak ditemukan' });

      const student = DB.students.find(s => s.id === invoice.student_id);
      const feeType = DB.feeTypes.find(f => f.id === invoice.fee_type_id);
      
      const targetContact = method === 'WHATSAPP' ? '08123456789' : 'orangtua@sekolah.sch.id';
      const msg = `Yth. Orang tua dari ${student ? student.name : 'Siswa'}. Diingatkan bahwa tagihan ${feeType ? feeType.name : 'Pendidikan'} sebesar Rp ${invoice.amount.toLocaleString('id-ID')} akan jatuh tempo pada ${invoice.due_date}. Silakan selesaikan pembayaran melalui Virtual Account atau QRIS di portal Anda. Terima kasih.`;

      const notification = {
        id: `ntf-${Date.now()}`,
        tenant_id: tenantId,
        student_id: invoice.student_id,
        type: method || 'WHATSAPP',
        phone: method === 'WHATSAPP' ? targetContact : null,
        email: method === 'EMAIL' ? targetContact : null,
        message: msg,
        status: 'SENT',
        sent_at: new Date().toISOString()
      };
      (DB as any).billingNotifications.push(notification);

      logActivity(tenantId, authUser?.id || 'system', username || 'system', role || 'STAFF', 'INSERT', 'Notification Engine', `Mengirim pengingat tagihan #${invoice_id} via ${method}`);
      return res.json({ success: true, message: `Notifikasi pengingat berhasil dikirim melalui ${method}!` });
    }

    case 'getSentNotifications': {
      const notifs = (DB as any).billingNotifications.filter((n: any) => n.tenant_id === tenantId);
      const enrichedNotifs = notifs.map((n: any) => {
        const student = DB.students.find(s => s.id === n.student_id);
        return {
          ...n,
          student_name: student ? student.name : 'Siswa Tidak Dikenal',
          student_nis: student ? student.nis : ''
        };
      });
      return res.json({ success: true, message: 'Success', data: enrichedNotifs });
    }

    // --- PAYMENT GATEWAY SIMULATION & CALLBACKS ---
    case 'simulateGatewayPayment': {
      const { invoice_id, gateway } = req.body;
      const invoiceIndex = DB.feeInvoices.findIndex(i => i.id === invoice_id && i.tenant_id === tenantId);
      if (invoiceIndex === -1) return res.json({ success: false, message: 'Tagihan tidak ditemukan' });

      const invoice = DB.feeInvoices[invoiceIndex];
      const disc = Number((invoice as any).discount_amount || 0);
      const fine = Number((invoice as any).fine_amount || 0);
      const schol = Number((invoice as any).scholarship_amount || 0);
      const netAmount = Math.max(0, invoice.amount + fine - disc - schol);
      const remainingAmount = Math.max(0, netAmount - invoice.amount_paid);

      if (remainingAmount <= 0) {
        return res.json({ success: false, message: 'Tagihan ini sudah lunas' });
      }

      // Simulate webhook / callback execution from Midtrans / Xendit / Tripay / Duitku
      const gatewayRef = `GW-${gateway || 'XENDIT'}-${Date.now().toString().substring(6)}`;
      
      // Update Invoice
      DB.feeInvoices[invoiceIndex] = {
        ...invoice,
        amount_paid: netAmount,
        status: 'PAID' as const,
        updated_at: new Date().toISOString(),
        updated_by: 'system'
      };

      // Create Payment Receipt
      const payment = {
        id: `pay-${Date.now()}`,
        tenant_id: tenantId,
        invoice_id,
        payment_date: new Date().toISOString().split('T')[0],
        amount: remainingAmount,
        payment_method: gateway === 'QRIS' ? 'QRIS' : 'VIRTUAL_ACCOUNT',
        recorded_by: `${gateway || 'XENDIT'} webhook`,
        gateway_reference: gatewayRef,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        created_by: 'system',
        updated_by: 'system'
      };
      DB.feePayments.push(payment);

      // Bookkeeping entry in Cash book
      DB.cashTransactions.push({
        id: `csh-${Date.now()}`,
        tenant_id: tenantId,
        date: new Date().toISOString().split('T')[0],
        type: 'IN',
        amount: remainingAmount,
        description: `Pembayaran Pendidikan Otomatis Webhook ${gateway} untuk tagihan #${invoice_id}`,
        category: 'SPP',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        created_by: 'system',
        updated_by: 'system'
      });

      // General Ledger entries
      DB.ledgerEntries.push(
        {
          id: `led-${Date.now()}-dr`,
          tenant_id: tenantId,
          date: new Date().toISOString().split('T')[0],
          account_code: '11202', // Bank Muamalat SPP
          account_name: 'Bank Muamalat - SPP',
          debit: remainingAmount,
          credit: 0,
          description: `Setoran VA/QRIS Gateways [Ref: ${gatewayRef}]`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
          created_by: 'system',
          updated_by: 'system'
        },
        {
          id: `led-${Date.now()}-cr`,
          tenant_id: tenantId,
          date: new Date().toISOString().split('T')[0],
          account_code: '41101',
          account_name: 'Pendapatan SPP Sekolah',
          debit: 0,
          credit: remainingAmount,
          description: `Penerimaan Pendapatan SPP Otomatis [Ref: ${gatewayRef}]`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
          created_by: 'system',
          updated_by: 'system'
        }
      );

      logActivity(tenantId, 'system', `${gateway || 'XENDIT'} Webhook`, 'System', 'INSERT', 'Payment Gateway Webhook', `Sukses sinkronisasi transaksi gateway Rp ${remainingAmount.toLocaleString('id-ID')} untuk tagihan #${invoice_id}`);
      return res.json({ success: true, message: `Webhook ${gateway} berhasil memproses pembayaran sebesar Rp ${remainingAmount.toLocaleString('id-ID')} secara real-time!`, data: payment });
    }

    case 'paymentLink': {
      const tId = req.body.tenant_id || tenantId;
      const { application_id, payment_type, id } = req.body;

      if (id) {
        const pIdx = DB.admissionPaymentLinks.findIndex(p => p.id === id);
        if (pIdx !== -1) {
          DB.admissionPaymentLinks[pIdx].status = 'PAID';
          DB.admissionPaymentLinks[pIdx].paid_at = new Date().toISOString();
          DB.admissionPaymentLinks[pIdx].updated_at = new Date().toISOString();

          const payObj = DB.admissionPaymentLinks[pIdx];

          if (payObj.payment_type === 'Daftar Ulang') {
            const exIdx = DB.admissionReRegistrations.findIndex(r => r.application_id === payObj.application_id);
            if (exIdx === -1) {
              DB.admissionReRegistrations.push({
                id: `arereg-${Date.now()}`,
                tenant_id: tId,
                application_id: payObj.application_id,
                re_registration_date: new Date().toISOString(),
                payment_status: 'PAID',
                verified_by: 'Sistem Pembayaran VA',
                notes: 'Daftar ulang berhasil divalidasi via VA Payment.',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null,
                created_by: 'system',
                updated_by: 'system'
              });
            } else {
              DB.admissionReRegistrations[exIdx].payment_status = 'PAID';
              DB.admissionReRegistrations[exIdx].verified_by = 'Sistem Pembayaran VA';
            }

            const appIdx = DB.admissionApplications.findIndex(a => a.id === payObj.application_id);
            if (appIdx !== -1) {
              DB.admissionApplications[appIdx].status = 'RE_REGISTERED';
              DB.admissionApplications[appIdx].updated_at = new Date().toISOString();
            }
          }

          logActivity(tId, 'system', 'Virtual Account Core', 'System', 'UPDATE', 'PPDB VA Payment', `Pembayaran Virtual Account Rp ${payObj.amount} untuk ${payObj.payment_type} pendaftar ID ${payObj.application_id} sukses`);
          return res.json({ success: true, message: 'Pembayaran tagihan VA berhasil diproses', data: DB.admissionPaymentLinks[pIdx] });
        }
      }

      if (application_id && payment_type) {
        const exIdx = DB.admissionPaymentLinks.findIndex(p => p.application_id === application_id && p.payment_type === payment_type && p.deleted_at === null);
        if (exIdx !== -1) {
          return res.json({ success: true, message: 'VA pembayaran sudah dibuat', data: DB.admissionPaymentLinks[exIdx] });
        }

        const settings = DB.admissionSettings.find(s => s.tenant_id === tId && s.deleted_at === null);
        const amount = payment_type === 'Formulir' ? (settings ? settings.form_fee : 150000) : (settings ? settings.re_registration_fee : 2500000);

        const newPay = {
          id: `apay-${Date.now()}`,
          tenant_id: tId,
          application_id,
          payment_type,
          amount,
          payment_gateway_url: `https://demo-va.payment.net/ppdb/pay/apay-${Date.now()}`,
          va_number: `988${String(Date.now()).substring(5)}`,
          status: 'UNPAID',
          paid_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
          created_by: authUser?.id || 'system',
          updated_by: authUser?.id || 'system'
        };
        DB.admissionPaymentLinks.push(newPay);
        return res.json({ success: true, message: 'Virtual Account tagihan pendaftaran berhasil dibuat', data: newPay });
      }

      const list = DB.admissionPaymentLinks.filter(p => p.tenant_id === tId && p.deleted_at === null);
      return res.json({ success: true, message: 'Success', data: list });
    }

    // --- PAYMENT GATEWAY CONFIGS ---
    case 'getGatewayConfig': {
      if (!(DB as any).gatewayConfigs) {
        (DB as any).gatewayConfigs = {
          activeGateway: 'XENDIT',
          midtransClientKey: 'SB-Mid-client-XXXXX',
          xenditPublicKey: 'xnd_public_XXXXX',
          duitkuMerchantCode: 'DXXXXX',
          tripayApiKey: 'TXXXXX',
          sandboxMode: true
        };
      }
      return res.json({ success: true, data: (DB as any).gatewayConfigs });
    }

    case 'updateGatewayConfig': {
      const { activeGateway, midtransClientKey, xenditPublicKey, duitkuMerchantCode, tripayApiKey, sandboxMode } = req.body;
      (DB as any).gatewayConfigs = {
        activeGateway: activeGateway || 'XENDIT',
        midtransClientKey: midtransClientKey || '',
        xenditPublicKey: xenditPublicKey || '',
        duitkuMerchantCode: duitkuMerchantCode || '',
        tripayApiKey: tripayApiKey || '',
        sandboxMode: sandboxMode !== undefined ? sandboxMode : true
      };
      logActivity(tenantId, authUser?.id || 'system', username || 'system', role || 'STAFF', 'UPDATE', 'Gateway Settings', `Mengubah gerbang pembayaran aktif ke ${(DB as any).gatewayConfigs.activeGateway}`);
      return res.json({ success: true, message: 'Konfigurasi Payment Gateway berhasil diperbarui', data: (DB as any).gatewayConfigs });
    }

    // --- INSTALLMENT PLAN ENGINE ---
    case 'getInstallmentSchedules': {
      if (!(DB as any).installmentSchedules) (DB as any).installmentSchedules = [];
      const list = (DB as any).installmentSchedules.filter((i: any) => i.tenant_id === tenantId);
      return res.json({ success: true, data: list });
    }

    case 'createInstallmentPlan': {
      const { invoice_id, installments_count, due_dates, amounts } = req.body;
      const invoiceIndex = DB.feeInvoices.findIndex(i => i.id === invoice_id && i.tenant_id === tenantId);
      if (invoiceIndex === -1) return res.json({ success: false, message: 'Tagihan tidak ditemukan' });
      const invoice = DB.feeInvoices[invoiceIndex];

      if (!(DB as any).installmentSchedules) (DB as any).installmentSchedules = [];

      // Break invoice into installments
      const count = Number(installments_count) || 3;
      const schedules = [];
      for (let i = 0; i < count; i++) {
        const sch = {
          id: `sch-${invoice_id}-${i+1}-${Date.now()}`,
          tenant_id: tenantId,
          invoice_id,
          installment_no: i + 1,
          due_date: due_dates?.[i] || new Date(Date.now() + (i + 1) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          amount: Number(amounts?.[i]) || (invoice.amount / count),
          amount_paid: 0,
          status: 'UNPAID',
          fine_amount: 0,
          created_at: new Date().toISOString()
        };
        schedules.push(sch);
        (DB as any).installmentSchedules.push(sch);
      }

      // Mark original invoice as PARTIAL / UNDER INSTALLMENTS
      invoice.status = 'PARTIAL';
      invoice.description = `${invoice.description} (Membayar dengan ${count} kali cicilan)`;
      
      logActivity(tenantId, authUser?.id || 'system', username || 'system', role || 'STAFF', 'INSERT', 'Installment Engine', `Membuat skema ${count} kali cicilan untuk tagihan #${invoice_id}`);
      return res.json({ success: true, message: `Skema ${count} kali cicilan berhasil dibuat!`, data: schedules });
    }

    // --- REFUND ENGINE ---
    case 'getRefunds': {
      if (!(DB as any).refunds) (DB as any).refunds = [];
      const list = (DB as any).refunds.filter((r: any) => r.tenant_id === tenantId);
      return res.json({ success: true, data: list });
    }

    case 'requestRefund': {
      const { payment_id, refund_amount, reason } = req.body;
      const paymentIndex = DB.feePayments.findIndex(p => p.id === payment_id && p.tenant_id === tenantId);
      if (paymentIndex === -1) return res.json({ success: false, message: 'Pembayaran tidak ditemukan' });
      const payment = DB.feePayments[paymentIndex];

      if (Number(refund_amount) > payment.amount) {
        return res.json({ success: false, message: 'Nominal refund melebihi jumlah pembayaran asli' });
      }

      const refReq = {
        id: `ref-${Date.now()}`,
        tenant_id: tenantId,
        payment_id,
        invoice_id: payment.invoice_id,
        amount: Number(refund_amount),
        reason: reason || 'Koreksi kelebihan bayar',
        status: 'PENDING',
        created_by: authUser?.id || 'system',
        created_at: new Date().toISOString()
      };

      if (!(DB as any).refunds) (DB as any).refunds = [];
      (DB as any).refunds.push(refReq);

      // Create a pending approval workflow auto-routing
      if (!(DB as any).billingApprovals) (DB as any).billingApprovals = [];
      (DB as any).billingApprovals.push({
        id: `appr-${Date.now()}`,
        tenant_id: tenantId,
        type: 'REFUND',
        reference_id: refReq.id,
        title: `Permohonan Refund Rp ${Number(refund_amount).toLocaleString('id-ID')}`,
        description: `Wali murid mengajukan refund transaksi #${payment_id} dengan alasan: ${reason}`,
        requested_by: username || 'system',
        stage: 'BENDAHARA', // Workflow: STAFF -> BENDAHARA -> KEPALA_SEKOLAH -> YAYASAN
        status: 'PENDING',
        created_at: new Date().toISOString()
      });

      logActivity(tenantId, authUser?.id || 'system', username || 'system', role || 'STAFF', 'INSERT', 'Refund Engine', `Mengajukan refund untuk transaksi #${payment_id} sebesar Rp ${refund_amount}`);
      return res.json({ success: true, message: 'Permohonan refund berhasil dikirim dan menunggu persetujuan berjenjang', data: refReq });
    }

    // --- APPROVAL WORKFLOWS ---
    case 'getApprovals': {
      if (!(DB as any).billingApprovals) (DB as any).billingApprovals = [];
      const list = (DB as any).billingApprovals.filter((a: any) => a.tenant_id === tenantId);
      return res.json({ success: true, data: list });
    }

    case 'actionApproval': {
      const { id, status, reject_reason } = req.body;
      if (!(DB as any).billingApprovals) (DB as any).billingApprovals = [];
      const appIndex = (DB as any).billingApprovals.findIndex((a: any) => a.id === id && a.tenant_id === tenantId);
      if (appIndex === -1) return res.json({ success: false, message: 'Data approval tidak ditemukan' });

      const approval = (DB as any).billingApprovals[appIndex];
      approval.reviewed_by = username;
      approval.reviewed_at = new Date().toISOString();
      if (reject_reason) approval.reject_reason = reject_reason;

      // Handle transition workflow stages if approved: BENDAHARA -> KEPALA_SEKOLAH -> YAYASAN
      if (status === 'APPROVED') {
        if (approval.stage === 'BENDAHARA') {
          approval.stage = 'KEPALA_SEKOLAH';
          approval.status = 'PENDING'; // Keep pending for next stage
          logActivity(tenantId, authUser?.id || 'system', username || 'system', role || 'STAFF', 'UPDATE', 'Approval Workflow', `Persetujuan tahap Bendahara disetujui, diteruskan ke Kepala Sekolah`);
          return res.json({ success: true, message: 'Disetujui di tingkat Bendahara! Berkas diteruskan ke Kepala Sekolah.', data: approval });
        } else if (approval.stage === 'KEPALA_SEKOLAH') {
          approval.stage = 'YAYASAN';
          approval.status = 'PENDING'; // Keep pending for next stage
          logActivity(tenantId, authUser?.id || 'system', username || 'system', role || 'STAFF', 'UPDATE', 'Approval Workflow', `Persetujuan tahap Kepala Sekolah disetujui, diteruskan ke Yayasan`);
          return res.json({ success: true, message: 'Disetujui di tingkat Kepala Sekolah! Berkas diteruskan ke Yayasan.', data: approval });
        } else if (approval.stage === 'YAYASAN') {
          // Fully Approved! Run original action
          approval.status = 'APPROVED';
          
          if (approval.type === 'REFUND') {
            const refund = (DB as any).refunds.find((r: any) => r.id === approval.reference_id);
            if (refund) {
              refund.status = 'APPROVED';
              refund.processed_at = new Date().toISOString();

              // Auto Accounting Adjustment for Refund
              // Deduct invoice amount_paid
              const invoiceIdx = DB.feeInvoices.findIndex(inv => inv.id === refund.invoice_id);
              if (invoiceIdx !== -1) {
                const invoice = DB.feeInvoices[invoiceIdx];
                invoice.amount_paid = Math.max(0, invoice.amount_paid - refund.amount);
                invoice.status = 'PARTIAL';
              }

              // Add Cash transaction OUT
              DB.cashTransactions.push({
                id: `csh-ref-${Date.now()}`,
                tenant_id: tenantId,
                date: new Date().toISOString().split('T')[0],
                type: 'OUT',
                amount: refund.amount,
                description: `Refund Dana Pendidikan kepada siswa (Ref: #${refund.id})`,
                category: 'SPP',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null,
                created_by: 'system',
                updated_by: 'system'
              });

              // General Ledger Reversal Entry
              DB.ledgerEntries.push(
                {
                  id: `led-ref-${Date.now()}-dr`,
                  tenant_id: tenantId,
                  date: new Date().toISOString().split('T')[0],
                  account_code: '41101',
                  account_name: 'Pendapatan SPP Sekolah',
                  debit: refund.amount, // debiting revenue (reversing income)
                  credit: 0,
                  description: `Koreksi Pendapatan - Pengembalian Dana (Refund #${refund.id})`,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  deleted_at: null,
                  created_by: 'system',
                  updated_by: 'system'
                },
                {
                  id: `led-ref-${Date.now()}-cr`,
                  tenant_id: tenantId,
                  date: new Date().toISOString().split('T')[0],
                  account_code: '11202',
                  account_name: 'Bank Muamalat - SPP',
                  debit: 0,
                  credit: refund.amount, // crediting assets (releasing cash)
                  description: `Pengeluaran Kas/Bank - Pengembalian Dana (Refund #${refund.id})`,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  deleted_at: null,
                  created_by: 'system',
                  updated_by: 'system'
                }
              );
            }
          } else if (approval.type === 'DISCOUNT') {
            // Apply approved discount to invoice
            const payload = approval.payload || {};
            const invIndex = DB.feeInvoices.findIndex(i => i.id === payload.invoice_id);
            if (invIndex !== -1) {
              DB.feeInvoices[invIndex].discount_amount = Number(payload.amount);
              DB.feeInvoices[invIndex].description += ` (Potongan disetujui: ${payload.discount_name})`;
            }
          } else if (approval.type === 'FINE_WAIVER') {
            const payload = approval.payload || {};
            const invIndex = DB.feeInvoices.findIndex(i => i.id === payload.invoice_id);
            if (invIndex !== -1) {
              DB.feeInvoices[invIndex].fine_amount = 0;
              DB.feeInvoices[invIndex].description += ` (Penghapusan denda disetujui)`;
            }
          } else if (approval.type === 'CANCEL_BILLING') {
            const payload = approval.payload || {};
            const invIndex = DB.feeInvoices.findIndex(i => i.id === payload.invoice_id);
            if (invIndex !== -1) {
              DB.feeInvoices[invIndex].deleted_at = new Date().toISOString();
            }
          }

          logActivity(tenantId, authUser?.id || 'system', username || 'system', role || 'STAFF', 'UPDATE', 'Approval Workflow', `Persetujuan sepenuhnya DISETUJUI oleh tingkat Yayasan`);
          return res.json({ success: true, message: 'Persetujuan sepenuhnya disetujui oleh tingkat Yayasan! Aksi otomatis telah dieksekusi.', data: approval });
        }
      } else {
        // Approval REJECTED
        if (approval.type === 'REFUND') {
          const refund = (DB as any).refunds.find((r: any) => r.id === approval.reference_id);
          if (refund) refund.status = 'REJECTED';
        }
        logActivity(tenantId, authUser?.id || 'system', username || 'system', role || 'STAFF', 'UPDATE', 'Approval Workflow', `Persetujuan DITOLAK di tingkat ${approval.stage}`);
        return res.json({ success: true, message: `Pengajuan ditolak pada tahap ${approval.stage}`, data: approval });
      }
    }

    case 'createApprovalRequest': {
      const { type, invoice_id, amount, discount_name, reason } = req.body;
      const invoice = DB.feeInvoices.find(i => i.id === invoice_id && i.tenant_id === tenantId);
      if (!invoice) return res.json({ success: false, message: 'Tagihan tidak ditemukan' });

      if (!(DB as any).billingApprovals) (DB as any).billingApprovals = [];

      const newAppr = {
        id: `appr-${Date.now()}`,
        tenant_id: tenantId,
        type, // DISCOUNT, FINE_WAIVER, CANCEL_BILLING, SCHOLARSHIP
        reference_id: invoice_id,
        title: type === 'DISCOUNT' ? `Diskon Potongan - ${discount_name}` : `Pembatalan/Penghapusan - ${type}`,
        description: `Pengajuan ${type} untuk tagihan ${invoice_id}. Alasan: ${reason || '-'}`,
        requested_by: username || 'system',
        stage: 'BENDAHARA', // Starts at BENDAHARA
        status: 'PENDING',
        payload: { invoice_id, amount, discount_name },
        created_at: new Date().toISOString()
      };

      (DB as any).billingApprovals.push(newAppr);
      logActivity(tenantId, authUser?.id || 'system', username || 'system', role || 'STAFF', 'INSERT', 'Approval Workflow', `Membuat pengajuan persetujuan ${type} untuk tagihan #${invoice_id}`);
      return res.json({ success: true, message: 'Pengajuan persetujuan berhasil dibuat, diteruskan ke tingkat Bendahara.', data: newAppr });
    }

    // --- AUTO BANK RECONCILIATION ENGINE ---
    case 'getBankMutations': {
      if (!(DB as any).bankMutations) {
        (DB as any).bankMutations = [
          { id: 'mut-1', tenant_id: tenantId, date: '2026-07-20', description: 'CR VA9880010098123456 AHMAD FAUZI', amount: 500000, reference_no: 'TX-MUAMALAT-71829', matched: true, matched_invoice_id: 'INV-2026-0001', va_number: '9880010098123456' },
          { id: 'mut-2', tenant_id: tenantId, date: '2026-07-21', description: 'CR TRANSFER ANTAR BANK LAILA', amount: 150000, reference_no: 'TX-MUTASI-00122', matched: false, matched_invoice_id: null, va_number: null },
          { id: 'mut-3', tenant_id: tenantId, date: '2026-07-22', description: 'CR VA9880010098123457 LAILA AMINAH', amount: 200000, reference_no: 'TX-MUAMALAT-71830', matched: true, matched_invoice_id: 'INV-2026-0002', va_number: '9880010098123457' }
        ];
      }
      const list = (DB as any).bankMutations.filter((m: any) => m.tenant_id === tenantId);
      return res.json({ success: true, data: list });
    }

    case 'importBankMutation': {
      const { mutations } = req.body;
      if (!(DB as any).bankMutations) (DB as any).bankMutations = [];

      const parsed = (mutations || []).map((m: any, index: number) => ({
        id: `mut-uploaded-${index}-${Date.now()}`,
        tenant_id: tenantId,
        date: m.date || new Date().toISOString().split('T')[0],
        description: m.description || 'Setoran / Mutasi Masuk',
        amount: Number(m.amount),
        reference_no: m.reference_no || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
        matched: false,
        matched_invoice_id: null,
        va_number: m.va_number || null
      }));

      (DB as any).bankMutations.push(...parsed);
      logActivity(tenantId, authUser?.id || 'system', username || 'system', role || 'STAFF', 'INSERT', 'Reconciliation', `Mengimpor ${parsed.length} data mutasi rekening bank`);
      return res.json({ success: true, message: `Berhasil mengimpor ${parsed.length} transaksi mutasi bank!`, data: parsed });
    }

    case 'autoReconcile': {
      if (!(DB as any).bankMutations) (DB as any).bankMutations = [];
      const list = (DB as any).bankMutations.filter((m: any) => m.tenant_id === tenantId && !m.matched);
      let matchedCount = 0;

      for (const mut of list) {
        let matchedInvoice = null;

        if (mut.va_number) {
          const va = ((DB as any).virtualAccounts || []).find((v: any) => v.va_number === mut.va_number && v.tenant_id === tenantId);
          if (va) {
            const invoices = DB.feeInvoices.filter(i => i.student_id === va.student_id && i.status !== 'PAID');
            for (const inv of invoices) {
              const disc = Number((inv as any).discount_amount || 0);
              const fine = Number((inv as any).fine_amount || 0);
              const schol = Number((inv as any).scholarship_amount || 0);
              const netAmount = Math.max(0, inv.amount + fine - disc - schol);
              const remainingAmount = Math.max(0, netAmount - inv.amount_paid);

              if (remainingAmount === mut.amount) {
                matchedInvoice = inv;
                break;
              }
            }
          }
        }

        if (!matchedInvoice) {
          const unpaidInvoices = DB.feeInvoices.filter(i => i.tenant_id === tenantId && i.status !== 'PAID');
          for (const inv of unpaidInvoices) {
            const disc = Number((inv as any).discount_amount || 0);
            const fine = Number((inv as any).fine_amount || 0);
            const schol = Number((inv as any).scholarship_amount || 0);
            const netAmount = Math.max(0, inv.amount + fine - disc - schol);
            const remainingAmount = Math.max(0, netAmount - inv.amount_paid);

            if (remainingAmount === mut.amount) {
              matchedInvoice = inv;
              break;
            }
          }
        }

        if (matchedInvoice) {
          mut.matched = true;
          mut.matched_invoice_id = matchedInvoice.id;
          matchedCount++;

          matchedInvoice.amount_paid += mut.amount;
          matchedInvoice.status = 'PAID';
          matchedInvoice.updated_at = new Date().toISOString();

          DB.feePayments.push({
            id: `pay-rec-${Date.now()}-${matchedCount}`,
            tenant_id: tenantId,
            invoice_id: matchedInvoice.id,
            payment_date: new Date().toISOString().split('T')[0],
            amount: mut.amount,
            payment_method: mut.va_number ? 'VIRTUAL_ACCOUNT' : 'BANK_TRANSFER',
            recorded_by: 'Auto Bank Reconciliation',
            gateway_reference: mut.reference_no,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
            created_by: 'system',
            updated_by: 'system'
          });

          DB.cashTransactions.push({
            id: `csh-rec-${Date.now()}-${matchedCount}`,
            tenant_id: tenantId,
            date: new Date().toISOString().split('T')[0],
            type: 'IN',
            amount: mut.amount,
            description: `Penerimaan Rekonsiliasi Otomatis (VA: ${mut.va_number || 'Umum'}, Ref: ${mut.reference_no})`,
            category: 'SPP',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
            created_by: 'system',
            updated_by: 'system'
          });

          DB.ledgerEntries.push(
            {
              id: `led-rec-${Date.now()}-dr-${matchedCount}`,
              tenant_id: tenantId,
              date: new Date().toISOString().split('T')[0],
              account_code: '11202',
              account_name: 'Bank Muamalat - SPP',
              debit: mut.amount,
              credit: 0,
              description: `Penerimaan Kas - Rekonsiliasi VA [Ref: ${mut.reference_no}]`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              deleted_at: null,
              created_by: 'system',
              updated_by: 'system'
            },
            {
              id: `led-rec-${Date.now()}-cr-${matchedCount}`,
              tenant_id: tenantId,
              date: new Date().toISOString().split('T')[0],
              account_code: '41101',
              account_name: 'Pendapatan SPP Sekolah',
              debit: 0,
              credit: mut.amount,
              description: `Pendapatan SPP Otomatis [Ref: ${mut.reference_no}]`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              deleted_at: null,
              created_by: 'system',
              updated_by: 'system'
            }
          );
        }
      }

      logActivity(tenantId, authUser?.id || 'system', username || 'system', role || 'STAFF', 'UPDATE', 'Reconciliation', `Melakukan pencocokan otomatis, berhasil mencocokkan ${matchedCount} transaksi mutasi`);
      return res.json({ success: true, message: `Rekonsiliasi selesai! ${matchedCount} transaksi berhasil dicocokkan otomatis secara real-time.` });
    }

    default:
      return null;
  }
}
}
