import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../core/base.controller';
import { DB, logActivity } from '../../server';

export class TeacherController extends BaseController {

  private ensureTeachers(tenantId: string) {
    if (!DB.teachers) {
      DB.teachers = [];
    }
    if (DB.teachers.length === 0) {
      DB.teachers = [
        {
          id: 'tch-seed-1',
          tenant_id: tenantId,
          name: 'Ustadz Ahmad Mudzakir, M.Pd.',
          nip: '198204122010031002',
          niy: 'NIY.89012301',
          nuptk: '9081230491023',
          nomor_pegawai: 'PEG-0012',
          gender: 'L',
          specialization: 'Sains',
          status: 'AKTIF',
          email: 'ahmad.mudzakir@pondok.id',
          phone: '081234567891',
          unit_kerja: 'MA / SMA',
          jabatan_struktural: 'Kepala Sekolah',
          golongan: 'IV/a',
          status_kepegawaian: 'PNS Diperbantukan',
          pendidikan_terakhir: 'S2 - Manajemen Pendidikan',
          institusi_pendidikan: 'Universitas Indonesia',
          status_dapodik: 'AKTIF',
          status_emis: 'AKTIF',
          created_at: '2026-07-01',
          deleted_at: null
        },
        {
          id: 'tch-seed-2',
          tenant_id: tenantId,
          name: 'Ibu Ratna Sari, S.Si.',
          nip: '198908242015022003',
          niy: 'NIY.89012302',
          nuptk: '5432109876543',
          nomor_pegawai: 'PEG-0043',
          gender: 'P',
          specialization: 'Matematika',
          status: 'AKTIF',
          email: 'ratna.sari@sekolah.id',
          phone: '081298765432',
          unit_kerja: 'SMA',
          jabatan_struktural: 'Wakil Kepala Kurikulum',
          golongan: 'III/b',
          status_kepegawaian: 'GTY',
          pendidikan_terakhir: 'S1 - Matematika',
          institusi_pendidikan: 'Institut Teknologi Bandung',
          status_dapodik: 'AKTIF',
          status_emis: 'AKTIF',
          created_at: '2026-07-01',
          deleted_at: null
        }
      ];
    }
  }

  public async index(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const teachers = DB.teachers.filter(t => t.deleted_at === null);
      return this.success(res, teachers, 'Fetch teachers successfully');
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
    this.ensureTeachers(tenantId);
    switch (action) {
      case 'getTeachers': {
        const teachers = DB.teachers.filter(t => (t.tenant_id === tenantId || !t.tenant_id) && !t.deleted_at);
        return res.json({ success: true, message: 'Success', data: teachers });
      }

      case 'createTeacher': {
        const teacher = {
          ...req.body,
          id: `tch-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          tenant_id: tenantId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
          created_by: authUser.id,
          updated_by: authUser.id
        };
        DB.teachers.push(teacher);
        logActivity(tenantId, authUser.id, username, role, 'INSERT', 'Guru', `Menambahkan guru baru: ${teacher.name}`);
        return res.json({ success: true, message: 'Guru berhasil ditambahkan', data: teacher });
      }

      case 'updateTeacher': {
        const targetId = req.body.id;
        let index = DB.teachers.findIndex(t => (t.id === targetId || t.nip === targetId) && (t.tenant_id === tenantId || !t.tenant_id));
        if (index === -1) {
          index = DB.teachers.findIndex(t => t.id === targetId || t.nip === targetId);
        }
        if (index === -1) {
          return res.status(404).json({ success: false, message: 'Guru tidak ditemukan' });
        }
        DB.teachers[index] = {
          ...DB.teachers[index],
          ...req.body,
          updated_at: new Date().toISOString(),
          updated_by: authUser.id
        };
        logActivity(tenantId, authUser.id, username, role, 'UPDATE', 'Guru', `Mengubah data guru: ${req.body.name}`);
        return res.json({ success: true, message: 'Guru berhasil diperbarui', data: DB.teachers[index] });
      }

      case 'deleteTeacher': {
        const targetId = req.body.id;
        let index = DB.teachers.findIndex(t => (t.id === targetId || t.nip === targetId) && (t.tenant_id === tenantId || !t.tenant_id));
        if (index === -1) {
          index = DB.teachers.findIndex(t => t.id === targetId || t.nip === targetId);
        }
        if (index === -1) {
          return res.status(404).json({ success: false, message: 'Guru tidak ditemukan' });
        }
        const teacherName = DB.teachers[index].name;
        DB.teachers[index].deleted_at = new Date().toISOString();
        DB.teachers.splice(index, 1);
        logActivity(tenantId, authUser.id, username, role, 'DELETE', 'Guru', `Menghapus guru: ${teacherName}`);
        return res.json({ success: true, message: 'Guru berhasil dihapus' });
      }

      case 'importTeachers': {
        const list = req.body.teachers || [];
        const imported: any[] = [];
        for (const item of list) {
          const teacher = {
            ...item,
            id: `tch-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            tenant_id: tenantId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
            created_by: authUser.id,
            updated_by: authUser.id
          };
          DB.teachers.push(teacher);
          imported.push(teacher);
        }
        logActivity(tenantId, authUser.id, username, role, 'IMPORT', 'Guru', `Mengimpor ${imported.length} data guru`);
        return res.json({ success: true, message: `${imported.length} Guru berhasil diimpor`, data: imported });
      }

      case 'exportTeachers': {
        const teachers = DB.teachers.filter(t => t.tenant_id === tenantId && t.deleted_at === null);
        logActivity(tenantId, authUser.id, username, role, 'EXPORT', 'Guru', `Mengekspor data guru`);
        return res.json({ success: true, message: 'Data guru diekspor', data: teachers });
      }

      // =========================================================================
      // PLOTING GURU (TEACHER ASSIGNMENT) ENDPOINTS
      // =========================================================================

      case 'getTeacherAssignments': {
        let list: any[] = [];
        let teachers: any[] = [];
        let classes: any[] = [];
        let subjects: any[] = [];
        let academicYears: any[] = [];
        let semesters: any[] = [];

        try {
          const prismaModule = await import('../backend/database/prisma');
          const prisma = (prismaModule.default || prismaModule) as any;
          list = await prisma.teacherAssignment.findMany({
            where: { deleted_at: null }
          });
          teachers = await prisma.teacher.findMany({ where: { deleted_at: null } });
          classes = await prisma.class.findMany({ where: { deleted_at: null } });
          subjects = await prisma.subject.findMany({ where: { deleted_at: null } });
          academicYears = await prisma.academicYear.findMany({ where: { deleted_at: null } });
          semesters = await prisma.semester.findMany({ where: { deleted_at: null } });
        } catch (e) {
          list = DB.teacherAssignments.filter((a: any) => a.deleted_at === null);
          teachers = DB.teachers.filter((t: any) => t.deleted_at === null);
          classes = DB.classrooms || [];
          subjects = DB.courses || [];
          academicYears = DB.academicYears || [];
          semesters = DB.semesters || [];
        }

        // Map names to assignments
        const mappedList = list.map(item => {
          const teacherObj = teachers.find(t => t.id === item.teacher_id);
          const classObj = classes.find(c => c.id === item.class_id);
          const subjectObj = subjects.find(s => s.id === item.subject_id);
          const ayObj = academicYears.find(ay => ay.id === item.academic_year_id);
          const semObj = semesters.find(sem => sem.id === item.semester_id);

          return {
            ...item,
            teacher_name: teacherObj ? teacherObj.name : 'Guru Tidak Diketahui',
            teacher_nip: teacherObj ? teacherObj.nip : '-',
            class_name: classObj ? classObj.name : 'Kelas Tidak Diketahui',
            subject_name: subjectObj ? subjectObj.name : 'Semua Mapel / Wali Kelas',
            academic_year_name: ayObj ? ayObj.name : 'Tahun Tidak Diketahui',
            semester_name: semObj ? semObj.name : 'Semester Tidak Diketahui'
          };
        });

        return res.json({ success: true, message: 'Success', data: mappedList });
      }

      case 'createTeacherAssignment': {
        const payload = {
          id: `ta-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          teacher_id: req.body.teacher_id,
          unit_id: req.body.unit_id || 'SD',
          academic_year_id: req.body.academic_year_id,
          semester_id: req.body.semester_id,
          class_id: req.body.class_id,
          subject_id: req.body.subject_id || null,
          assignment_type: req.body.assignment_type || 'TEACHER',
          is_homeroom: req.body.is_homeroom || req.body.assignment_type === 'HOMEROOM',
          status: req.body.status || 'ACTIVE',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null
        };

        try {
          const prismaModule = await import('../backend/database/prisma');
          const prisma = (prismaModule.default || prismaModule) as any;
          await prisma.teacherAssignment.create({ data: payload });
        } catch (e) {
          // Fallback handled locally
        }
        DB.teacherAssignments.push(payload);

        logActivity(tenantId, authUser ? authUser.id : 'system', username, role, 'INSERT', 'Ploting Guru', `Menambahkan ploting guru baru`);
        return res.json({ success: true, message: 'Ploting Guru berhasil ditambahkan', data: payload });
      }

      case 'updateTeacherAssignment': {
        const id = req.body.id;
        const index = DB.teacherAssignments.findIndex(a => a.id === id);
        
        const updateData = {
          teacher_id: req.body.teacher_id,
          unit_id: req.body.unit_id,
          academic_year_id: req.body.academic_year_id,
          semester_id: req.body.semester_id,
          class_id: req.body.class_id,
          subject_id: req.body.subject_id || null,
          assignment_type: req.body.assignment_type,
          is_homeroom: req.body.is_homeroom || req.body.assignment_type === 'HOMEROOM',
          status: req.body.status,
          updated_at: new Date().toISOString()
        };

        if (index !== -1) {
          DB.teacherAssignments[index] = { ...DB.teacherAssignments[index], ...updateData };
        }

        try {
          const prismaModule = await import('../backend/database/prisma');
          const prisma = (prismaModule.default || prismaModule) as any;
          await prisma.teacherAssignment.update({
            where: { id },
            data: updateData
          });
        } catch (e) {
          // Fallback handled locally
        }

        logActivity(tenantId, authUser ? authUser.id : 'system', username, role, 'UPDATE', 'Ploting Guru', `Mengubah ploting guru: ${id}`);
        return res.json({ success: true, message: 'Ploting Guru berhasil diperbarui', data: { id, ...updateData } });
      }

      case 'deleteTeacherAssignment': {
        const id = req.body.id;
        const index = DB.teacherAssignments.findIndex(a => a.id === id);
        if (index !== -1) {
          DB.teacherAssignments[index].deleted_at = new Date().toISOString();
        }

        try {
          const prismaModule = await import('../backend/database/prisma');
          const prisma = (prismaModule.default || prismaModule) as any;
          await prisma.teacherAssignment.update({
            where: { id },
            data: { deleted_at: new Date() }
          });
        } catch (e) {
          // Fallback handled locally
        }

        logActivity(tenantId, authUser ? authUser.id : 'system', username, role, 'DELETE', 'Ploting Guru', `Menghapus ploting guru: ${id}`);
        return res.json({ success: true, message: 'Ploting Guru berhasil dihapus' });
      }

      case 'copyAssignmentsAcademicYear':
      case 'copyAssignmentsLastYear': {
        const { source_academic_year_id, target_academic_year_id } = req.body;
        if (!source_academic_year_id || !target_academic_year_id) {
          return res.status(400).json({ success: false, message: 'Source & Target Academic Year ID diperlukan' });
        }

        let sourceList: any[] = [];
        try {
          const prismaModule = await import('../backend/database/prisma');
          const prisma = (prismaModule.default || prismaModule) as any;
          sourceList = await prisma.teacherAssignment.findMany({
            where: { academic_year_id: source_academic_year_id, deleted_at: null }
          });
        } catch (e) {
          sourceList = DB.teacherAssignments.filter(a => a.academic_year_id === source_academic_year_id && a.deleted_at === null);
        }

        const copied: any[] = [];
        for (const item of sourceList) {
          const clone = {
            ...item,
            id: `ta-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            academic_year_id: target_academic_year_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          DB.teacherAssignments.push(clone);
          copied.push(clone);

          try {
            const prismaModule = await import('../backend/database/prisma');
            const prisma = (prismaModule.default || prismaModule) as any;
            await prisma.teacherAssignment.create({ data: clone });
          } catch (e) {}
        }

        logActivity(tenantId, authUser ? authUser.id : 'system', username, role, 'INSERT', 'Ploting Guru', `Menyalin ${copied.length} ploting guru ke Tahun Ajaran baru`);
        return res.json({ success: true, message: `Berhasil menyalin ${copied.length} ploting guru`, data: copied });
      }

      case 'cloneAssignmentsSemester': {
        const { source_semester_id, target_semester_id } = req.body;
        if (!source_semester_id || !target_semester_id) {
          return res.status(400).json({ success: false, message: 'Source & Target Semester ID diperlukan' });
        }

        let sourceList: any[] = [];
        try {
          const prismaModule = await import('../backend/database/prisma');
          const prisma = (prismaModule.default || prismaModule) as any;
          sourceList = await prisma.teacherAssignment.findMany({
            where: { semester_id: source_semester_id, deleted_at: null }
          });
        } catch (e) {
          sourceList = DB.teacherAssignments.filter(a => a.semester_id === source_semester_id && a.deleted_at === null);
        }

        const copied: any[] = [];
        for (const item of sourceList) {
          const clone = {
            ...item,
            id: `ta-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            semester_id: target_semester_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          DB.teacherAssignments.push(clone);
          copied.push(clone);

          try {
            const prismaModule = await import('../backend/database/prisma');
            const prisma = (prismaModule.default || prismaModule) as any;
            await prisma.teacherAssignment.create({ data: clone });
          } catch (e) {}
        }

        logActivity(tenantId, authUser ? authUser.id : 'system', username, role, 'INSERT', 'Ploting Guru', `Menduplikasi ${copied.length} ploting guru ke Semester baru`);
        return res.json({ success: true, message: `Berhasil menduplikasi ${copied.length} ploting guru ke Semester baru`, data: copied });
      }

      case 'bulkAssignAssignments': {
        const { teacher_ids, class_ids, subject_ids, unit_id, academic_year_id, semester_id, assignment_type, status } = req.body;
        if (!teacher_ids || !class_ids || !academic_year_id || !semester_id || !assignment_type) {
          return res.status(400).json({ success: false, message: 'Parameter tidak lengkap untuk Bulk Assign' });
        }

        const created: any[] = [];
        const finalSubjects = (subject_ids && subject_ids.length > 0) ? subject_ids : [null];

        for (const tId of teacher_ids) {
          for (const cId of class_ids) {
            for (const sId of finalSubjects) {
              const payload = {
                id: `ta-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
                teacher_id: tId,
                unit_id: unit_id || 'SD',
                academic_year_id,
                semester_id,
                class_id: cId,
                subject_id: sId,
                assignment_type,
                is_homeroom: assignment_type === 'HOMEROOM',
                status: status || 'ACTIVE',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null
              };
              DB.teacherAssignments.push(payload);
              created.push(payload);

              try {
                const prismaModule = await import('../backend/database/prisma');
                const prisma = (prismaModule.default || prismaModule) as any;
                await prisma.teacherAssignment.create({ data: payload });
              } catch (e) {}
            }
          }
        }

        logActivity(tenantId, authUser ? authUser.id : 'system', username, role, 'INSERT', 'Ploting Guru', `Bulk Assign ${created.length} ploting guru`);
        return res.json({ success: true, message: `Berhasil melakukan Bulk Assign sebanyak ${created.length} ploting guru`, data: created });
      }

      case 'importTeacherAssignments': {
        const list = req.body.assignments || [];
        const imported: any[] = [];

        // Transactional rollback simulation:
        // We accumulate the creations. If any database write fails, we do a full rollback.
        try {
          const prismaModule = await import('../backend/database/prisma');
          const prisma = (prismaModule.default || prismaModule) as any;
          
          await prisma.$transaction(async (tx: any) => {
            for (const item of list) {
              const payload = {
                id: `ta-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
                teacher_id: item.teacher_id,
                unit_id: item.unit_id || 'SD',
                academic_year_id: item.academic_year_id,
                semester_id: item.semester_id,
                class_id: item.class_id,
                subject_id: item.subject_id || null,
                assignment_type: item.assignment_type || 'TEACHER',
                is_homeroom: item.is_homeroom || item.assignment_type === 'HOMEROOM',
                status: item.status || 'ACTIVE',
                created_at: new Date(),
                updated_at: new Date()
              };
              await tx.teacherAssignment.create({ data: payload });
              imported.push({ ...payload, created_at: payload.created_at.toISOString(), updated_at: payload.updated_at.toISOString(), deleted_at: null });
            }
          });
        } catch (dbError) {
          // If actual database fails or is offline (diagnostic state), fallback to in-memory transaction.
          // Since it's in-memory, we can validate parameters, and if anything is invalid we throw and do not save!
          imported.length = 0; // reset
          try {
            for (const item of list) {
              if (!item.teacher_id || !item.class_id || !item.academic_year_id || !item.semester_id) {
                throw new Error('Data tidak lengkap (Wajib menyertakan Guru, Kelas, Tahun Ajaran, dan Semester)');
              }
              const payload = {
                id: `ta-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
                teacher_id: item.teacher_id,
                unit_id: item.unit_id || 'SD',
                academic_year_id: item.academic_year_id,
                semester_id: item.semester_id,
                class_id: item.class_id,
                subject_id: item.subject_id || null,
                assignment_type: item.assignment_type || 'TEACHER',
                is_homeroom: item.is_homeroom || item.assignment_type === 'HOMEROOM',
                status: item.status || 'ACTIVE',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null
              };
              imported.push(payload);
            }
          } catch (memError: any) {
            return res.status(400).json({ success: false, message: `Import gagal dan dibatalkan (Rollback otomatis): ${memError.message}` });
          }
        }

        // Apply imported items to DB
        for (const item of imported) {
          DB.teacherAssignments.push(item);
        }

        logActivity(tenantId, authUser ? authUser.id : 'system', username, role, 'IMPORT', 'Ploting Guru', `Mengimpor ${imported.length} data ploting guru`);
        return res.json({ success: true, message: `Berhasil mengimpor ${imported.length} ploting guru`, data: imported });
      }

      case 'getTeacherDashboardData': {
        let teacherObj = DB.teachers.find(t => t.name === authUser?.name || t.email === authUser?.email);
        if (!teacherObj) {
          // If we are admin, let's pick the first teacher as a demo, or use a default
          teacherObj = DB.teachers[0] || { id: 'tch-1', name: authUser?.name || 'Ahmad Ghozali, S.Pd.' };
        }

        const teacherId = teacherObj.id;

        // Fetch assignments
        let assignments: any[] = [];
        try {
          const prismaModule = await import('../backend/database/prisma');
          const prisma = (prismaModule.default || prismaModule) as any;
          assignments = await prisma.teacherAssignment.findMany({
            where: { teacher_id: teacherId, status: 'ACTIVE', deleted_at: null }
          });
        } catch (e) {
          assignments = DB.teacherAssignments.filter(a => a.teacher_id === teacherId && a.status === 'ACTIVE' && a.deleted_at === null);
        }

        // Seeding default assignments if none exist to avoid empty workspaces
        if (assignments.length === 0) {
          assignments = [
            {
              id: 'ta-seed-1',
              teacher_id: teacherId,
              unit_id: 'SD',
              academic_year_id: 'ay-current',
              semester_id: 'sem-current',
              class_id: 'cl-1',
              subject_id: 'crs-2',
              assignment_type: 'HOMEROOM',
              is_homeroom: true,
              status: 'ACTIVE'
            }
          ];
        }

        // Allowed class ids
        const classIds = assignments.map(a => a.class_id);
        const subjectIds = assignments.map(a => a.subject_id).filter(id => id !== null);

        // Fetch filtered student, classes, and schedules list
        let students: any[] = [];
        let classesList: any[] = [];
        let schedules: any[] = [];

        try {
          const prismaModule = await import('../backend/database/prisma');
          const prisma = (prismaModule.default || prismaModule) as any;
          
          students = await prisma.student.findMany({
            where: { class_id: { in: classIds }, deleted_at: null }
          });
          classesList = await prisma.class.findMany({
            where: { id: { in: classIds }, deleted_at: null }
          });
        } catch (e) {
          students = DB.students.filter(s => classIds.includes(s.classroom_id));
          classesList = (DB.classrooms || []).filter(c => classIds.includes(c.id));
        }

        // Map mock schedules & counts if empty
        if (students.length === 0) {
          students = [
            { id: 'std-1', nis: '102401', nisn: '0081234567', name: 'Farhan Ramadhan', gender: 'L', classroom_id: classIds[0] || 'cl-1', status: 'AKTIF' },
            { id: 'std-2', nis: '102402', nisn: '0087654321', name: 'Laila Fitriani', gender: 'P', classroom_id: classIds[0] || 'cl-1', status: 'AKTIF' },
            { id: 'std-3', nis: '102305', nisn: '0071112223', name: 'Rizky Pratama', gender: 'L', classroom_id: classIds[0] || 'cl-1', status: 'AKTIF' },
            { id: 'std-4', nis: '202401', nisn: '0098889991', name: 'Zaid Al-Khair', gender: 'L', classroom_id: classIds[0] || 'cl-1', status: 'AKTIF', is_santri: true },
            { id: 'std-5', nis: '202402', nisn: '0098889992', name: 'Aisyah Humaira', gender: 'P', classroom_id: classIds[0] || 'cl-1', status: 'AKTIF', is_santri: true }
          ];
        }

        // Prepare schedules
        schedules = [
          { id: 'sch-1', classroom_id: classIds[0] || 'cl-1', course_id: subjectIds[0] || 'crs-2', teacher_id: teacherId, day: 'SENIN', start_time: '07:30', end_time: '09:00' },
          { id: 'sch-2', classroom_id: classIds[1] || 'cl-2', course_id: subjectIds[1] || 'crs-3', teacher_id: teacherId, day: 'SELASA', start_time: '08:00', end_time: '09:30' }
        ];

        return res.json({
          success: true,
          data: {
            teacher: teacherObj,
            assignments,
            students,
            classes: classesList,
            schedules,
            stats: {
              classCount: classIds.length,
              studentCount: students.length,
              attendanceCount: students.length * 24 + 4, // simulated accumulated check-ins
              gradeCount: students.length * 15 + 3, // simulated graded items
              hoursPerWeek: assignments.length * 4,
              approvalPendingCount: assignments.some(a => a.is_homeroom) ? 1 : 0
            }
          }
        });
      }

      default:
        return null;
    }
  }
}

