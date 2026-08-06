/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IStudentRepository } from '../domain/repositories/IStudentRepository';
import { AutoNumberService } from './autonumber.service';
import { StudentValidator } from '../validators/student.validator';
import { StudentMapper } from '../mappers/student.mapper';
import { StudentEnterprise, StudentHistoryRecord, StudentMutation } from '../types/student.types';
import { DB, logActivity } from '../../server';
import { inMemoryDb, PrismaEngine } from '../backend/database/prisma';

export class StudentService {
  constructor(private readonly studentRepository: IStudentRepository) {}

  /**
   * Helper to fetch student history records
   */
  public getHistory(studentId: string): StudentHistoryRecord[] {
    const dbAny = DB as any;
    if (!dbAny.studentHistories) {
      dbAny.studentHistories = [];
    }
    return dbAny.studentHistories.filter((h: any) => h.student_id === studentId);
  }

  /**
   * Helper to write a new history record
   */
  public addHistory(studentId: string, type: StudentHistoryRecord['type'], title: string, description: string, operator: string): StudentHistoryRecord {
    const dbAny = DB as any;
    if (!dbAny.studentHistories) {
      dbAny.studentHistories = [];
    }

    const rec: StudentHistoryRecord = {
      id: `hist-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      student_id: studentId,
      type,
      title,
      description,
      date: new Date().toISOString(),
      operator
    };
    dbAny.studentHistories.push(rec);
    return rec;
  }

  /**
   * Helper to fetch student mutations
   */
  public getMutations(studentId?: string, tenantId?: string): StudentMutation[] {
    const dbAny = DB as any;
    if (!dbAny.studentMutations) {
      dbAny.studentMutations = [];
    }
    let list = dbAny.studentMutations;
    if (studentId) {
      list = list.filter((m: any) => m.student_id === studentId);
    }
    if (tenantId) {
      list = list.filter((m: any) => m.tenant_id === tenantId);
    }
    return list;
  }

  /**
   * Processes a student mutation (e.g. mutasi keluar, masuk, do)
   */
  public async addMutation(
    studentId: string,
    type: StudentMutation['type'],
    sekolahAsalTujuan: string,
    noSurat: string,
    alasan: string,
    operator: string,
    tenantId: string
  ): Promise<StudentMutation> {
    const dbAny = DB as any;
    if (!dbAny.studentMutations) {
      dbAny.studentMutations = [];
    }

    const mutation: StudentMutation & { tenant_id: string } = {
      id: `mut-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      student_id: studentId,
      tenant_id: tenantId,
      type,
      tanggal: new Date().toISOString().substring(0, 10),
      sekolah_asal_tujuan: sekolahAsalTujuan,
      no_surat: noSurat,
      alasan,
      approved_by: operator,
      status: 'APPROVED'
    };
    dbAny.studentMutations.push(mutation);

    // Sync student status in master database
    const student = await this.getStudentById(studentId, tenantId);
    if (student) {
      let nextStatus = student.sekolah?.status || 'AKTIF';
      if (type === 'MUTASI_KELUAR') nextStatus = 'MUTASI';
      if (type === 'DO') nextStatus = 'DO';
      if (type === 'LULUS') nextStatus = 'LULUS';
      if (type === 'ALUMNI_PONDOK') nextStatus = 'ALUMNI';

      if (student.sekolah) {
        student.sekolah.status = nextStatus;
        student.sekolah.tanggal_keluar = mutation.tanggal;
        student.sekolah.alasan_keluar = alasan;
      } else if (student.status_keaktifan) {
        student.status_keaktifan = nextStatus; // Flat fallback
      }

      await this.updateStudent(studentId, student, tenantId);
    }

    this.addHistory(studentId, 'KELAS', 'Proses Mutasi', `Siswa dimutasi dengan status ${type} - No Surat: ${noSurat}`, operator);
    logActivity(tenantId, operator, operator, 'STAFF', 'STUDENT_MUTATION', 'Kesiswaan', `Memproses mutasi ${type} siswa ID: ${studentId}`);

    return mutation;
  }

  /**
   * Retrieves active students for a tenant
   */
  public async getStudents(tenantId: string): Promise<any[]> {
    const all = await this.studentRepository.findAll(tenantId);
    // Return non-deleted students
    return all.filter((s: any) => !s.deleted_at);
  }

  /**
   * Retrieves detailed student info
   */
  public async getStudentById(id: string, tenantId: string): Promise<any | null> {
    return await this.studentRepository.findById(id, tenantId);
  }

  /**
   * Creates a student with nested details, auto numbers, and validator constraints
   */
  public async createStudent(data: any, tenantId: string, operatorId = 'system'): Promise<any> {
    // Normalise to full nested Enterprise structure if flat
    let enterprise: StudentEnterprise;
    if (data.identitas) {
      enterprise = {
        ...data,
        id: data.id || `std-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        tenant_id: tenantId,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        created_by: operatorId,
        updated_by: operatorId
      };
    } else {
      enterprise = StudentMapper.flatToEnterprise(data, tenantId, operatorId);
    }

    // Auto Numbering generation if fields are blank
    if (!enterprise.identitas.nis || enterprise.identitas.nis.trim() === '') {
      enterprise.identitas.nis = AutoNumberService.generate(tenantId, 'NIS');
    }
    if (!enterprise.pondok.nomor_santri || enterprise.pondok.nomor_santri.trim() === '') {
      enterprise.pondok.nomor_santri = AutoNumberService.generate(tenantId, 'SANTRI');
    }
    if (!enterprise.identitas.nomor_emis || enterprise.identitas.nomor_emis.trim() === '') {
      enterprise.identitas.nomor_emis = AutoNumberService.generate(tenantId, 'EMIS');
    }

    // Recalculate BMI
    enterprise.kesehatan.bmi = StudentValidator.calculateBMI(
      Number(enterprise.kesehatan.tinggi || 155),
      Number(enterprise.kesehatan.berat || 45)
    );

    // Generate static image reference links
    enterprise.barcode_url = `/api/students/barcode/${enterprise.identitas.nis}`;
    enterprise.qrcode_url = `/api/students/qrcode/${enterprise.identitas.nis}`;
    enterprise.id_card_url = `/api/students/id_card/${enterprise.identitas.nis}`;

    // Validate
    const validationResult = StudentValidator.validate(enterprise);
    if (!validationResult.isValid) {
      throw new Error(`Validasi gagal: ${validationResult.errors.join(', ')}`);
    }

    const created = await this.studentRepository.create(enterprise, tenantId);

    // Log registration history
    this.addHistory(created.id, 'LOGIN', 'Registrasi Master', `Siswa berhasil didaftarkan di sistem oleh ${operatorId}`, operatorId);
    this.addHistory(created.id, 'KESEHATAN', 'Pemeriksaan Awal', `Tinggi: ${enterprise.kesehatan.tinggi}cm, Berat: ${enterprise.kesehatan.berat}kg, BMI: ${enterprise.kesehatan.bmi}`, operatorId);

    return created;
  }

  /**
   * Updates an existing student
   */
  public async updateStudent(id: string, data: any, tenantId: string, operatorId = 'system'): Promise<any | null> {
    const existing = await this.studentRepository.findById(id, tenantId);
    if (!existing) return null;

    // Detect if nested structure
    let updatedPayload: any;
    if (data.identitas) {
      updatedPayload = {
        ...data,
        updated_at: new Date().toISOString(),
        updated_by: operatorId
      };
      
      // Recalculate BMI
      if (updatedPayload.kesehatan) {
        updatedPayload.kesehatan.bmi = StudentValidator.calculateBMI(
          Number(updatedPayload.kesehatan.tinggi || 155),
          Number(updatedPayload.kesehatan.berat || 45)
        );
      }
    } else {
      // Map flat edits to our enterprise nested structures
      const normalized = StudentMapper.flatToEnterprise({ ...existing, ...data }, tenantId, operatorId);
      updatedPayload = {
        ...normalized,
        id,
        updated_at: new Date().toISOString(),
        updated_by: operatorId
      };
    }

    const result = await this.studentRepository.update(id, updatedPayload, tenantId);

    // Track a record inside history
    this.addHistory(id, 'DOKUMEN', 'Pembaruan Profil', `Data biodata kesiswaan diperbarui oleh ${operatorId}`, operatorId);

    return result;
  }

  /**
   * Deletes a student (handles hard delete, soft delete, and in-memory cleanups)
   */
  public async deleteStudent(id: string, tenantId: string): Promise<boolean> {
    if (!id) return false;

    const targetIds = new Set<string>();
    targetIds.add(id);

    // Collect all matching IDs and identifiers from repository & cache
    try {
      const all = await this.studentRepository.findAll(tenantId);
      all.forEach((s: any) => {
        if (
          s.id === id ||
          s.nis === id ||
          s.nisn === id ||
          s.identitas?.nis === id ||
          s.identitas?.nisn === id ||
          s.sekolah?.ppdb_no === id
        ) {
          if (s.id) targetIds.add(s.id);
          if (s.nis) targetIds.add(s.nis);
          if (s.identitas?.nis) targetIds.add(s.identitas.nis);
        }
      });
    } catch (e) {}

    if (inMemoryDb && Array.isArray(inMemoryDb.student)) {
      inMemoryDb.student.forEach((s: any) => {
        if (
          s.id === id ||
          s.nis === id ||
          s.nisn === id ||
          s.identitas?.nis === id ||
          s.identitas?.nisn === id
        ) {
          if (s.id) targetIds.add(s.id);
          if (s.nis) targetIds.add(s.nis);
          if (s.identitas?.nis) targetIds.add(s.identitas.nis);
        }
      });
    }

    const dbAny = DB as any;
    if (dbAny && Array.isArray(dbAny.students)) {
      dbAny.students.forEach((s: any) => {
        if (
          s.id === id ||
          s.nis === id ||
          s.nisn === id ||
          s.identitas?.nis === id ||
          s.identitas?.nisn === id
        ) {
          if (s.id) targetIds.add(s.id);
          if (s.nis) targetIds.add(s.nis);
          if (s.identitas?.nis) targetIds.add(s.identitas.nis);
        }
      });
    }

    const now = new Date();

    // 1. Mark soft delete on all target IDs via repository
    for (const tid of Array.from(targetIds)) {
      try {
        await this.studentRepository.softDelete(tid, tenantId);
      } catch (e) {}
      try {
        await this.studentRepository.update(tid, { deleted_at: now, status: 'DIHAPUS' } as any, tenantId);
      } catch (e) {}
    }

    // 2. Direct Prisma updateMany for database table if active
    try {
      const idList = Array.from(targetIds);
      await PrismaEngine.student.updateMany({
        where: {
          OR: [
            { id: { in: idList } },
            { nis: { in: idList } }
          ]
        },
        data: {
          deleted_at: now,
          status: 'DIHAPUS'
        }
      });
    } catch (e) {}

    // 3. Attempt physical hard delete for each ID
    for (const tid of Array.from(targetIds)) {
      try {
        await this.studentRepository.delete(tid, tenantId);
      } catch (e) {}
    }

    // 4. Clean up inMemoryDb.student array in-place
    try {
      if (inMemoryDb && Array.isArray(inMemoryDb.student)) {
        const remaining = inMemoryDb.student.filter((s: any) =>
          !targetIds.has(s.id) &&
          !targetIds.has(s.nis) &&
          !targetIds.has(s.nisn) &&
          !targetIds.has(s.identitas?.nis) &&
          !targetIds.has(s.identitas?.nisn) &&
          s.id !== id &&
          s.nis !== id &&
          s.identitas?.nis !== id
        );
        inMemoryDb.student.length = 0;
        inMemoryDb.student.push(...remaining);
      }
    } catch (e) {}

    // 5. Clean up global DB.students array in-place
    try {
      if (dbAny && Array.isArray(dbAny.students)) {
        const remaining = dbAny.students.filter((s: any) =>
          !targetIds.has(s.id) &&
          !targetIds.has(s.nis) &&
          !targetIds.has(s.nisn) &&
          !targetIds.has(s.identitas?.nis) &&
          !targetIds.has(s.identitas?.nisn) &&
          s.id !== id &&
          s.nis !== id &&
          s.identitas?.nis !== id
        );
        dbAny.students.length = 0;
        dbAny.students.push(...remaining);
      }
    } catch (e) {}

    return true;
  }

  /**
   * Search student indices
   */
  public async searchStudents(query: string, tenantId: string): Promise<any[]> {
    const students = await this.studentRepository.findAll(tenantId);
    const q = query.toLowerCase().trim();
    if (!q) return students;

    return students.filter(s => {
      const iden = s.identitas || {};
      const kepen = s.kependudukan || {};
      const ortu = s.orang_tua || { ayah: {}, ibu: {} };

      return (
        s.name?.toLowerCase().includes(q) ||
        iden.name?.toLowerCase().includes(q) ||
        iden.nis?.toLowerCase().includes(q) ||
        iden.nisn?.toLowerCase().includes(q) ||
        kepen.nik?.toLowerCase().includes(q) ||
        kepen.nomor_kk?.toLowerCase().includes(q) ||
        ortu.ayah?.no_hp?.includes(q) ||
        ortu.ibu?.no_hp?.includes(q)
      );
    });
  }
}
export default StudentService;
