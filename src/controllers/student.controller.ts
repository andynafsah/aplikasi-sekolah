/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../core/base.controller';
import { verifyJWT, logActivity, DB } from '../../server';
import { StudentService } from '../services/student.service';
import { StudentRepository } from '../repositories/student.repository';
import { BaseRepository } from '../repositories/base.repository';
import { AutoNumberService } from '../services/autonumber.service';
import { BarcodeService } from '../services/barcode.service';
import { DocumentService } from '../services/document.service';
import { StudentMapper } from '../mappers/student.mapper';

export class StudentController extends BaseController {
  private readonly studentService: StudentService;
  private readonly parentAccountRepo: BaseRepository<any>;
  private readonly parentStudentRepo: BaseRepository<any>;
  private readonly feeInvoiceRepo: BaseRepository<any>;
  private readonly feePaymentRepo: BaseRepository<any>;

  constructor() {
    super();
    const studentRepo = new StudentRepository();
    this.studentService = new StudentService(studentRepo);
    this.parentAccountRepo = new BaseRepository<any>('parentAccounts');
    this.parentStudentRepo = new BaseRepository<any>('parentStudents');
    this.feeInvoiceRepo = new BaseRepository<any>('feeInvoices');
    this.feePaymentRepo = new BaseRepository<any>('feePayments');
  }

  /**
   * Universal endpoint handler
   */
  public async handle(
    action: string,
    req: any,
    res: any,
    tenantId: string,
    authUser: any,
    username: string,
    role: string
  ): Promise<any> {
    try {
      const operator = authUser ? authUser.username : 'system';

      switch (action) {
        // ==========================================
        // 1. MASTER STUDENT CRUD
        // ==========================================
        case 'getStudents': {
          const list = await this.studentService.getStudents(tenantId);
          return res.json({ success: true, data: list });
        }

        case 'createStudent': {
          const student = await this.studentService.createStudent(req.body, tenantId, operator);
          logActivity(tenantId, authUser ? authUser.id : 'system', username, role, 'INSERT', 'Master Siswa', `Menambahkan siswa baru: ${student.identitas?.name || student.name}`);
          return res.json({ success: true, message: 'Siswa berhasil ditambahkan', data: student });
        }

        case 'updateStudent': {
          const id = req.body.id;
          const updated = await this.studentService.updateStudent(id, req.body, tenantId, operator);
          if (!updated) {
            return res.json({ success: false, message: 'Siswa tidak ditemukan' });
          }
          logActivity(tenantId, authUser ? authUser.id : 'system', username, role, 'UPDATE', 'Master Siswa', `Mengubah biodata siswa: ${updated.identitas?.name || updated.name}`);
          return res.json({ success: true, message: 'Siswa berhasil diperbarui', data: updated });
        }

        case 'deleteStudent': {
          const id = req.body?.id || req.query?.id || req.body?.student_id || req.body?.data?.id;
          if (!id) {
            return res.json({ success: false, message: 'ID siswa tidak ditemukan dalam request' });
          }
          await this.studentService.deleteStudent(id.toString(), tenantId);
          logActivity(tenantId, authUser ? authUser.id : 'system', username, role, 'DELETE', 'Master Siswa', `Menghapus siswa dengan ID: ${id}`);
          return res.json({ success: true, message: 'Siswa berhasil dihapus dari database' });
        }

        case 'searchStudents': {
          const query = req.body.q || req.query.q || '';
          const results = await this.studentService.searchStudents(query.toString(), tenantId);
          return res.json({ success: true, data: results });
        }

        // ==========================================
        // 2. AUTO NUMBER CONFIG
        // ==========================================
        case 'getAutoNumberConfig': {
          const cfg = AutoNumberService.getConfig(tenantId);
          return res.json({ success: true, data: cfg });
        }

        case 'saveAutoNumberConfig': {
          AutoNumberService.saveConfig(tenantId, req.body);
          logActivity(tenantId, authUser ? authUser.id : 'system', username, role, 'UPDATE', 'Konfigurasi Sistem', 'Memperbarui pola Auto Numbering Kesiswaan');
          return res.json({ success: true, message: 'Format nomor otomatis berhasil disimpan' });
        }

        // ==========================================
        // 3. DOCUMENT CONTROL
        // ==========================================
        case 'getStudentDocuments': {
          const { student_id } = req.body;
          const docs = DocumentService.getByStudent(student_id);
          return res.json({ success: true, data: docs });
        }

        case 'uploadStudentDocument': {
          const { student_id, category, fileType, fileName, fileSize } = req.body;
          const doc = DocumentService.addDocument(student_id, category, fileType, fileName, fileSize, operator, tenantId);
          this.studentService.addHistory(student_id, 'DOKUMEN', 'Unggah Dokumen', `Mengunggah berkas ${category}: ${fileName}`, operator);
          return res.json({ success: true, message: 'Dokumen berhasil diunggah', data: doc });
        }

        case 'replaceStudentDocument': {
          const { doc_id, fileName, fileSize, comment } = req.body;
          const doc = DocumentService.replaceDocument(doc_id, fileName, fileSize, operator, comment, tenantId);
          if (!doc) {
            return res.json({ success: false, message: 'Arsip dokumen tidak ditemukan' });
          }
          this.studentService.addHistory(doc.student_id, 'DOKUMEN', 'Pembaruan Dokumen', `Memperbarui arsip ${doc.category} ke Versi ${doc.currentVersion}`, operator);
          return res.json({ success: true, message: 'Versi berkas berhasil diperbarui', data: doc });
        }

        case 'logDocumentAccess': {
          const { doc_id, action } = req.body; // 'PREVIEW' or 'DOWNLOAD'
          DocumentService.logAuditAccess(doc_id, action, operator);
          return res.json({ success: true });
        }

        // ==========================================
        // 4. STUDENT MUTATION & HISTORIES
        // ==========================================
        case 'getStudentHistories': {
          const { student_id } = req.body;
          const list = this.studentService.getHistory(student_id);
          return res.json({ success: true, data: list });
        }

        case 'getMutationsList': {
          const list = this.studentService.getMutations(undefined, tenantId);
          return res.json({ success: true, data: list });
        }

        case 'processMutation': {
          const { student_id, type, sekolah_asal_tujuan, no_surat, alasan } = req.body;
          const mut = await this.studentService.addMutation(student_id, type, sekolah_asal_tujuan, no_surat, alasan, operator, tenantId);
          return res.json({ success: true, message: `Sukses memproses mutasi siswa: ${type}`, data: mut });
        }

        // ==========================================
        // 5. BULK IMPORT & EXPORT
        // ==========================================
        case 'exportStudents': {
          const format = req.body.format || 'JSON'; // JSON, EXCEL, CSV, DAPODIK, EMIS
          const list = await this.studentService.getStudents(tenantId);
          
          let reportData: any;
          if (format === 'DAPODIK') {
            reportData = list.map(s => StudentMapper.toDapodik(s));
          } else if (format === 'EMIS') {
            reportData = list.map(s => StudentMapper.toEmis(s));
          } else {
            reportData = list.map(s => StudentMapper.enterpriseToFlat(s));
          }

          logActivity(tenantId, authUser ? authUser.id : 'system', username, role, 'EXPORT', 'Master Siswa', `Mengekspor rekapitulasi data siswa format: ${format}`);
          return res.json({
            success: true,
            format,
            timestamp: new Date().toISOString(),
            total: list.length,
            data: reportData
          });
        }

        case 'importStudents': {
          const { format, rows } = req.body; // format: 'DAPODIK', 'EMIS', 'STANDARD'
          if (!rows || !Array.isArray(rows)) {
            return res.json({ success: false, message: 'Format baris data tidak valid' });
          }

          const importedList: any[] = [];
          for (const row of rows) {
            try {
              const mapped = StudentMapper.flatToEnterprise(row, tenantId, operator);
              const created = await this.studentService.createStudent(mapped, tenantId, operator);
              importedList.push(created);
            } catch (err: any) {
              // Gracefully continue but log error details
              console.error('Error importing row:', err.message);
            }
          }

          logActivity(tenantId, authUser ? authUser.id : 'system', username, role, 'IMPORT', 'Master Siswa', `Mengimpor ${importedList.length} siswa baru via unggahan file ${format}`);
          return res.json({
            success: true,
            message: `Berhasil mengimpor ${importedList.length} siswa dari total ${rows.length} baris data.`,
            importedCount: importedList.length
          });
        }

        // ==========================================
        // BACKWARD COMPATIBLE ACTIONS (PARENT PORTAL)
        // ==========================================
        case 'parentPortal': {
          const tId = req.body.tenant_id || tenantId;
          const { subAction, email, password, name, phone, parent_id, invoice_id, amount_paid } = req.body;
          const now = new Date().toISOString();

          if (subAction === 'list_parents') {
            const parents = await this.parentAccountRepo.findAll(tId);
            return res.json({ success: true, data: parents });
          }

          if (subAction === 'save_parent') {
            let saved: any;
            if (parent_id) {
              const existing = await this.parentAccountRepo.findById(parent_id, tId);
              if (existing) {
                saved = await this.parentAccountRepo.update(parent_id, {
                  name, email, phone, status: 'ACTIVE',
                  updated_by: authUser ? authUser.id : 'system'
                }, tId);
              }
            }
            if (!saved) {
              saved = await this.parentAccountRepo.create({
                id: parent_id || `parent-${Date.now()}`,
                email, username: username || email.split('@')[0], password: password || 'password123',
                name, phone, status: 'ACTIVE',
                created_by: authUser ? authUser.id : 'system',
                updated_by: authUser ? authUser.id : 'system'
              }, tId);
            }
            return res.json({ success: true, message: 'Parent Account saved', data: saved });
          }

          if (subAction === 'link_student') {
            const { parent_id, student_id, relationship } = req.body;
            const link = await this.parentStudentRepo.create({
              id: `pstd-${Date.now()}`,
              parent_id,
              student_id,
              relationship: relationship || 'Ayah',
              is_primary: true,
              created_by: authUser ? authUser.id : 'system',
              updated_by: authUser ? authUser.id : 'system'
            }, tId);
            return res.json({ success: true, message: 'Student linked successfully', data: link });
          }

          if (subAction === 'simulate_payment') {
            const inv = await this.feeInvoiceRepo.findById(invoice_id, tId);
            if (!inv) {
              return res.status(404).json({ success: false, message: 'Invoice tidak ditemukan' });
            }

            await this.feeInvoiceRepo.update(invoice_id, { status: 'PAID' }, tId);

            const payment = await this.feePaymentRepo.create({
              id: `fpay-${Date.now()}`,
              invoice_id,
              amount: amount_paid || inv.amount,
              payment_date: now.substring(0, 10),
              payment_method: 'GATEWAY_SIMULATION',
              reference_no: `TX-${Date.now()}`,
              status: 'SUCCESS',
              recorded_by: 'parent_portal',
              created_by: 'parent_portal',
              updated_by: 'system'
            }, tId);

            return res.json({ success: true, message: 'Pembayaran tagihan disimulasikan berhasil!', data: payment });
          }

          return res.status(400).json({ success: false, message: 'Invalid subAction' });
        }

        case 'parentDashboard': {
          const tId = req.body.tenant_id || tenantId;
          const { parent_email } = req.body;

          const parents = await this.parentAccountRepo.findAll(tId);
          const parent = parents.find((p: any) => p.email === parent_email);
          if (!parent) {
            return res.status(404).json({ success: false, message: 'Parent account not found' });
          }

          const childLinksAll = await this.parentStudentRepo.findAll(tId);
          const childLinks = childLinksAll.filter((ps: any) => ps.parent_id === parent.id);
          const studentIds = childLinks.map((cl: any) => cl.student_id);

          const allStudents = await this.studentService.getStudents(tId);
          const studentsList = allStudents.filter((s: any) => studentIds.includes(s.id));

          const attendancesRepo = new BaseRepository<any>('attendances');
          const allAttendances = await attendancesRepo.findAll(tId);
          const attendances = allAttendances.filter((a: any) => studentIds.includes(a.student_id));

          const gradesRepo = new BaseRepository<any>('grades');
          const allGrades = await gradesRepo.findAll(tId);
          const grades = allGrades.filter((g: any) => studentIds.includes(g.student_id));

          const allInvoices = await this.feeInvoiceRepo.findAll(tId);
          const invoices = allInvoices.filter((i: any) => studentIds.includes(i.student_id));

          return res.json({
            success: true,
            message: 'Parent Portal data fetched',
            data: {
              parent,
              students: studentsList,
              attendances,
              grades,
              invoices
            }
          });
        }

        default:
          return null;
      }
    } catch (err: any) {
      console.error(err);
      const isValidationError = err?.message?.includes('Validasi gagal');
      return res.status(isValidationError ? 400 : 500).json({ 
        success: false, 
        message: err?.message || 'Kesalahan sistem kesiswaan internal' 
      });
    }
  }

  // =======================================================
  // HTTP ENDPOINTS HANDLERS
  // =======================================================
  public async index(req: Request, res: Response, next: NextFunction): Promise<any> {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : (req.body.token || '');
    const authUser = verifyJWT(token);
    if (!authUser) return this.badRequest(res, 'Sesi tidak valid');
    const students = await this.studentService.getStudents(authUser.tenant_id);
    return this.success(res, students, 'Siswa fetched successfully');
  }

  public async store(req: Request, res: Response, next: NextFunction): Promise<any> {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : (req.body.token || '');
    const authUser = verifyJWT(token);
    if (!authUser) return this.badRequest(res, 'Sesi tidak valid');
    try {
      const student = await this.studentService.createStudent(req.body, authUser.tenant_id, authUser.username);
      return this.created(res, student, 'Siswa baru ditambahkan');
    } catch (e: any) {
      return this.badRequest(res, e.message);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction): Promise<any> {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : (req.body.token || '');
    const authUser = verifyJWT(token);
    if (!authUser) return this.badRequest(res, 'Sesi tidak valid');
    try {
      const id = req.body.id;
      const updated = await this.studentService.updateStudent(id, req.body, authUser.tenant_id, authUser.username);
      if (!updated) return this.notFound(res, 'Siswa tidak ditemukan');
      return this.success(res, updated, 'Siswa diperbarui');
    } catch (e: any) {
      return this.badRequest(res, e.message);
    }
  }

  public async destroy(req: Request, res: Response, next: NextFunction): Promise<any> {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : (req.body.token || '');
    const authUser = verifyJWT(token);
    if (!authUser) return this.badRequest(res, 'Sesi tidak valid');
    const ok = await this.studentService.deleteStudent(req.body.id, authUser.tenant_id);
    if (!ok) return this.notFound(res, 'Siswa tidak ditemukan');
    return this.success(res, null, 'Siswa dihapus');
  }

  /**
   * Barcode image compiler (Serves vector SVGs directly to browser)
   */
  public async getBarcode(req: Request, res: Response): Promise<any> {
    const { nis } = req.params;
    const svg = BarcodeService.generateCode128SVG(nis);
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.send(svg);
  }

  /**
   * QR image compiler (Serves vector SVGs directly to browser)
   */
  public async getQRCode(req: Request, res: Response): Promise<any> {
    const { text } = req.params;
    const svg = BarcodeService.generateQRCodeSVG(text);
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.send(svg);
  }

  /**
   * ID Card Generator HTML dynamic template
   */
  public async getIDCardTemplate(req: Request, res: Response): Promise<any> {
    const { nis } = req.params;
    const dbAny = DB as any;
    if (!dbAny.students) dbAny.students = [];

    // Find student
    const student = dbAny.students.find((s: any) => {
      const iden = s.identitas || {};
      return iden.nis === nis || s.nis === nis;
    });

    const name = student ? (student.identitas?.name || student.name) : 'Siswa Contoh';
    const kelas = student ? (student.sekolah?.kelas || student.kelas || 'VII-A') : 'VII-A';
    const status = student ? (student.sekolah?.status || 'AKTIF') : 'AKTIF';
    const barcodeSVG = BarcodeService.generateCode128SVG(nis);
    const qrSVG = BarcodeService.generateQRCodeSVG(`https://school.erp/verify/${nis}`);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Kartu Pelajar - ${name}</title>
        <style>
          body {
            margin: 0;
            padding: 20px;
            background-color: #f1f5f9;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          .card-container {
            width: 350px;
            height: 520px;
            background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%);
            border-radius: 16px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            color: white;
            position: relative;
            overflow: hidden;
            border: 2px solid #3b82f6;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
            box-sizing: border-box;
          }
          .card-header {
            width: 100%;
            text-align: center;
            border-b: 1px solid rgba(255,255,255,0.15);
            padding-bottom: 12px;
            margin-bottom: 15px;
          }
          .school-title {
            font-size: 14px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 0;
            color: #60a5fa;
          }
          .school-subtitle {
            font-size: 9px;
            margin: 3px 0 0 0;
            color: #94a3b8;
          }
          .photo-frame {
            width: 110px;
            height: 140px;
            border-radius: 8px;
            border: 3px solid #60a5fa;
            background-image: url('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');
            background-size: cover;
            background-position: center;
            margin-bottom: 15px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          }
          .student-name {
            font-size: 16px;
            font-weight: bold;
            margin: 0 0 5px 0;
            text-align: center;
            color: #ffffff;
            letter-spacing: 0.5px;
          }
          .student-nis {
            font-size: 12px;
            font-family: monospace;
            background: rgba(59, 130, 246, 0.25);
            border: 1px solid rgba(59, 130, 246, 0.4);
            padding: 3px 10px;
            border-radius: 10px;
            margin-bottom: 15px;
            color: #93c5fd;
          }
          .meta-grid {
            width: 100%;
            background: rgba(255,255,255,0.05);
            border-radius: 8px;
            padding: 10px;
            box-sizing: border-box;
            font-size: 11px;
            margin-bottom: 15px;
          }
          .meta-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
          }
          .meta-row:last-child {
            margin-bottom: 0;
          }
          .label {
            color: #94a3b8;
          }
          .value {
            font-weight: bold;
            color: #e2e8f0;
          }
          .barcode-area {
            width: 150px;
            height: 40px;
            background: white;
            border-radius: 4px;
            padding: 3px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .qr-watermark {
            position: absolute;
            bottom: 15px;
            right: 15px;
            width: 45px;
            height: 45px;
            background: white;
            border-radius: 4px;
            padding: 2px;
          }
        </style>
      </head>
      <body>
        <div class="card-container">
          <div class="card-header">
            <h2 class="school-title">KARTU IDENTITAS PELAJAR</h2>
            <div class="school-subtitle">ERP Sekolah & Pondok Pesantren Enterprise</div>
          </div>
          <div class="photo-frame"></div>
          <h3 class="student-name">${name}</h3>
          <div class="student-nis">${nis}</div>
          
          <div class="meta-grid">
            <div class="meta-row">
              <span class="label">Kelas / Rombel</span>
              <span class="value">${kelas}</span>
            </div>
            <div class="meta-row">
              <span class="label">Status Mukim</span>
              <span class="value">MUKIM</span>
            </div>
            <div class="meta-row">
              <span class="label">Status Keanggotaan</span>
              <span class="value" style="color: #4ade80;">${status}</span>
            </div>
          </div>

          <div class="barcode-area">
            ${barcodeSVG}
          </div>

          <div class="qr-watermark">
            ${qrSVG}
          </div>
        </div>
      </body>
      </html>
    `;
    return res.send(html);
  }
}
export default StudentController;
