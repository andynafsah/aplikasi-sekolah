import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../core/base.controller';
import { generateJWT, verifyJWT, logActivity, runAIGateway, DIAG_STATE } from '../../server';
import { PrismaEngine as prisma } from '../backend/database/prisma';

export class ClassController extends BaseController {

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
    switch (action) {
      // 1. Academic Years
      case 'getAcademicYears': {
        const list = await prisma.academicYear.findMany({
          where: { deleted_at: null }
        });
        return res.json({ success: true, message: 'Success', data: list });
      }
      case 'createAcademicYear': {
        const item = await prisma.academicYear.create({
          data: {
            ...req.body,
            status: req.body.status || 'ACTIVE'
          }
        });
        logActivity(tenantId, authUser.id, username, role, 'INSERT', 'Akademik', `Menambahkan tahun ajaran baru: ${item.name}`);
        return res.json({ success: true, data: item });
      }
      case 'updateAcademicYear': {
        const item = await prisma.academicYear.update({
          where: { id: req.body.id },
          data: { ...req.body, updated_at: new Date() }
        });
        return res.json({ success: true, data: item });
      }
      case 'deleteAcademicYear': {
        await prisma.academicYear.update({
          where: { id: req.body.id },
          data: { deleted_at: new Date() }
        });
        return res.json({ success: true });
      }

      // 2. Semesters
      case 'getSemesters': {
        const list = await prisma.semester.findMany({
          where: { deleted_at: null }
        });
        return res.json({ success: true, message: 'Success', data: list });
      }
      case 'createSemester': {
        const item = await prisma.semester.create({
          data: {
            ...req.body,
            status: req.body.status || 'ACTIVE'
          }
        });
        logActivity(tenantId, authUser.id, username, role, 'INSERT', 'Akademik', `Menambahkan semester baru: ${item.name}`);
        return res.json({ success: true, data: item });
      }
      case 'updateSemester': {
        const item = await prisma.semester.update({
          where: { id: req.body.id },
          data: { ...req.body, updated_at: new Date() }
        });
        return res.json({ success: true, data: item });
      }
      case 'deleteSemester': {
        await prisma.semester.update({
          where: { id: req.body.id },
          data: { deleted_at: new Date() }
        });
        return res.json({ success: true });
      }

      // 3. Curriculums
      case 'getCurriculums': {
        const list = await prisma.curriculum.findMany({
          where: { deleted_at: null }
        });
        return res.json({ success: true, message: 'Success', data: list });
      }
      case 'createCurriculum': {
        const item = await prisma.curriculum.create({
          data: { ...req.body }
        });
        logActivity(tenantId, authUser.id, username, role, 'INSERT', 'Akademik', `Menambahkan kurikulum baru: ${item.name}`);
        return res.json({ success: true, data: item });
      }
      case 'updateCurriculum': {
        const item = await prisma.curriculum.update({
          where: { id: req.body.id },
          data: { ...req.body, updated_at: new Date() }
        });
        return res.json({ success: true, data: item });
      }
      case 'deleteCurriculum': {
        await prisma.curriculum.update({
          where: { id: req.body.id },
          data: { deleted_at: new Date() }
        });
        return res.json({ success: true });
      }

      // 4. Program Studi / Jurusan
      case 'getMajors': {
        const list = await prisma.major.findMany({
          where: { deleted_at: null }
        });
        return res.json({ success: true, message: 'Success', data: list });
      }
      case 'createMajor': {
        const item = await prisma.major.create({
          data: { ...req.body }
        });
        logActivity(tenantId, authUser.id, username, role, 'INSERT', 'Akademik', `Menambahkan jurusan baru: ${item.name}`);
        return res.json({ success: true, data: item });
      }
      case 'updateMajor': {
        const item = await prisma.major.update({
          where: { id: req.body.id },
          data: { ...req.body, updated_at: new Date() }
        });
        return res.json({ success: true, data: item });
      }
      case 'deleteMajor': {
        await prisma.major.update({
          where: { id: req.body.id },
          data: { deleted_at: new Date() }
        });
        return res.json({ success: true });
      }

      // 5. Kelas (Classrooms)
      case 'getClassrooms': {
        const classes = await prisma.classroom.findMany({
          where: { deleted_at: null }
        });
        return res.json({ success: true, message: 'Success', data: classes });
      }
      case 'createClassroom': {
        const item = await prisma.classroom.create({
          data: {
            ...req.body,
            status: req.body.status || 'ACTIVE'
          }
        });
        logActivity(tenantId, authUser.id, username, role, 'INSERT', 'Kelas', `Membuat kelas baru: ${item.name}`);
        return res.json({ success: true, message: 'Kelas berhasil dibuat', data: item });
      }
      case 'updateClassroom': {
        const item = await prisma.classroom.update({
          where: { id: req.body.id },
          data: { ...req.body, updated_at: new Date() }
        });
        return res.json({ success: true, message: 'Kelas berhasil diubah', data: item });
      }
      case 'deleteClassroom': {
        await prisma.classroom.update({
          where: { id: req.body.id },
          data: { deleted_at: new Date() }
        });
        return res.json({ success: true });
      }

      // 6. Rombel
      case 'getRombels': {
        const list = await prisma.rombel.findMany({
          where: { deleted_at: null }
        });
        return res.json({ success: true, message: 'Success', data: list });
      }
      case 'createRombel': {
        const item = await prisma.rombel.create({
          data: { ...req.body }
        });
        logActivity(tenantId, authUser.id, username, role, 'INSERT', 'Akademik', `Menambahkan Rombel baru: ${item.name}`);
        return res.json({ success: true, data: item });
      }
      case 'updateRombel': {
        const item = await prisma.rombel.update({
          where: { id: req.body.id },
          data: { ...req.body, updated_at: new Date() }
        });
        return res.json({ success: true, data: item });
      }
      case 'deleteRombel': {
        await prisma.rombel.update({
          where: { id: req.body.id },
          data: { deleted_at: new Date() }
        });
        return res.json({ success: true });
      }

      // 7. Ruangan & Gedung
      case 'getRooms': {
        const list = await prisma.room.findMany({
          where: { deleted_at: null }
        });
        return res.json({ success: true, message: 'Success', data: list });
      }
      case 'createRoom': {
        const item = await prisma.room.create({
          data: { ...req.body }
        });
        logActivity(tenantId, authUser.id, username, role, 'INSERT', 'Akademik', `Menambahkan ruangan baru: ${item.name}`);
        return res.json({ success: true, data: item });
      }
      case 'updateRoom': {
        const item = await prisma.room.update({
          where: { id: req.body.id },
          data: { ...req.body, updated_at: new Date() }
        });
        return res.json({ success: true, data: item });
      }
      case 'deleteRoom': {
        await prisma.room.update({
          where: { id: req.body.id },
          data: { deleted_at: new Date() }
        });
        return res.json({ success: true });
      }

      // 8. Mata Pelajaran (Courses)
      case 'getSubjects': {
        const list = await prisma.subject.findMany({
          where: { deleted_at: null }
        });
        return res.json({ success: true, message: 'Success', data: list });
      }
      case 'createSubject': {
        const item = await prisma.subject.create({
          data: { ...req.body }
        });
        logActivity(tenantId, authUser.id, username, role, 'INSERT', 'Akademik', `Menambahkan mata pelajaran baru: ${item.name}`);
        return res.json({ success: true, data: item });
      }
      case 'updateSubject': {
        const item = await prisma.subject.update({
          where: { id: req.body.id },
          data: { ...req.body, updated_at: new Date() }
        });
        return res.json({ success: true, data: item });
      }
      case 'deleteSubject': {
        await prisma.subject.update({
          where: { id: req.body.id },
          data: { deleted_at: new Date() }
        });
        return res.json({ success: true });
      }

      // 9. Jam Pelajaran (Time Slots)
      case 'getTimeSlots': {
        const list = await prisma.timeSlot.findMany({
          where: { deleted_at: null }
        });
        return res.json({ success: true, message: 'Success', data: list });
      }
      case 'createTimeSlot': {
        const item = await prisma.timeSlot.create({
          data: { ...req.body }
        });
        logActivity(tenantId, authUser.id, username, role, 'INSERT', 'Akademik', `Menambahkan jam pelajaran baru: ${item.name}`);
        return res.json({ success: true, data: item });
      }
      case 'updateTimeSlot': {
        const item = await prisma.timeSlot.update({
          where: { id: req.body.id },
          data: { ...req.body, updated_at: new Date() }
        });
        return res.json({ success: true, data: item });
      }
      case 'deleteTimeSlot': {
        await prisma.timeSlot.update({
          where: { id: req.body.id },
          data: { deleted_at: new Date() }
        });
        return res.json({ success: true });
      }

      // 10. Jadwal KBM (Schedules)
      case 'getSchedules': {
        const list = await prisma.schedule.findMany({
          where: { deleted_at: null }
        });
        return res.json({ success: true, message: 'Success', data: list });
      }
      case 'createSchedule': {
        const item = await prisma.schedule.create({
          data: { ...req.body }
        });
        logActivity(tenantId, authUser.id, username, role, 'INSERT', 'Akademik', `Menambahkan jadwal mengajar`);
        return res.json({ success: true, data: item });
      }
      case 'updateSchedule': {
        const item = await prisma.schedule.update({
          where: { id: req.body.id },
          data: { ...req.body, updated_at: new Date() }
        });
        return res.json({ success: true, data: item });
      }
      case 'deleteSchedule': {
        await prisma.schedule.update({
          where: { id: req.body.id },
          data: { deleted_at: new Date() }
        });
        return res.json({ success: true });
      }

      // 11. Kalender Akademik
      case 'getAcademicCalendars': {
        const list = await prisma.academicCalendar.findMany({
          where: { deleted_at: null }
        });
        return res.json({ success: true, message: 'Success', data: list });
      }
      case 'createAcademicCalendar': {
        const item = await prisma.academicCalendar.create({
          data: { ...req.body }
        });
        logActivity(tenantId, authUser.id, username, role, 'INSERT', 'Akademik', `Menambahkan agenda kalender akademik: ${item.title}`);
        return res.json({ success: true, data: item });
      }
      case 'updateAcademicCalendar': {
        const item = await prisma.academicCalendar.update({
          where: { id: req.body.id },
          data: { ...req.body, updated_at: new Date() }
        });
        return res.json({ success: true, data: item });
      }
      case 'deleteAcademicCalendar': {
        await prisma.academicCalendar.update({
          where: { id: req.body.id },
          data: { deleted_at: new Date() }
        });
        return res.json({ success: true });
      }

      // 12. Agenda Sekolah / Pondok
      case 'getAgendas': {
        const list = await prisma.agenda.findMany({
          where: { deleted_at: null }
        });
        return res.json({ success: true, message: 'Success', data: list });
      }
      case 'createAgenda': {
        const item = await prisma.agenda.create({
          data: { ...req.body }
        });
        logActivity(tenantId, authUser.id, username, role, 'INSERT', 'Akademik', `Menambahkan agenda baru: ${item.topic}`);
        return res.json({ success: true, data: item });
      }
      case 'updateAgenda': {
        const item = await prisma.agenda.update({
          where: { id: req.body.id },
          data: { ...req.body, updated_at: new Date() }
        });
        return res.json({ success: true, data: item });
      }
      case 'deleteAgenda': {
        await prisma.agenda.update({
          where: { id: req.body.id },
          data: { deleted_at: new Date() }
        });
        return res.json({ success: true });
      }

      // 13. Load Mengajar (Teacher Loads)
      case 'getTeacherLoads': {
        const list = await prisma.teacherLoad.findMany({
          where: { deleted_at: null }
        });
        return res.json({ success: true, message: 'Success', data: list });
      }
      case 'createTeacherLoad': {
        const item = await prisma.teacherLoad.create({
          data: { ...req.body }
        });
        logActivity(tenantId, authUser.id, username, role, 'INSERT', 'Akademik', `Menambahkan beban mengajar baru`);
        return res.json({ success: true, data: item });
      }
      case 'updateTeacherLoad': {
        const item = await prisma.teacherLoad.update({
          where: { id: req.body.id },
          data: { ...req.body, updated_at: new Date() }
        });
        return res.json({ success: true, data: item });
      }
      case 'deleteTeacherLoad': {
        await prisma.teacherLoad.update({
          where: { id: req.body.id },
          data: { deleted_at: new Date() }
        });
        return res.json({ success: true });
      }

      // 14. Validation Actions
      case 'validateScheduleConflict': {
        const { day, time_slot_id, teacher_id, room_id, classroom_id, exclude_id } = req.body;
        const list = await prisma.schedule.findMany({
          where: {
            deleted_at: null,
            id: { not: exclude_id }
          }
        });
        
        let conflictType: string | null = null;
        let conflictMessage: string | null = null;

        for (const s of list) {
          if (s.day === day && s.time_slot_id === time_slot_id) {
            if (teacher_id && s.teacher_id === teacher_id) {
              conflictType = 'GURU';
              conflictMessage = `Guru pengampu sudah memiliki jadwal mengajar di kelas lain pada hari dan jam yang sama.`;
              break;
            }
            if (room_id && s.room_id === room_id) {
              conflictType = 'RUANGAN';
              conflictMessage = `Ruangan ini sudah digunakan oleh kelas lain pada hari dan jam yang sama.`;
              break;
            }
            if (classroom_id && s.classroom_id === classroom_id) {
              conflictType = 'KELAS';
              conflictMessage = `Kelas ini sudah memiliki mata pelajaran lain pada hari dan jam yang sama.`;
              break;
            }
          }
        }

        return res.json({ success: true, conflict: conflictType !== null, type: conflictType, message: conflictMessage });
      }

      // 15. Mutation (Mutasi Kelas)
      case 'executeMutation': {
        const { studentIds, action: mutationAction, targetClassId, targetMajorId, notes } = req.body;
        if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
          return res.status(400).json({ success: false, message: 'Daftar siswa wajib diisi' });
        }

        let count = 0;
        for (const stdId of studentIds) {
          const updateData: any = { updated_at: new Date() };
          
          if (mutationAction === 'NAIK_KELAS' || mutationAction === 'PINDAH_ROMBEL') {
            updateData.class_id = targetClassId;
          } else if (mutationAction === 'PINDAH_JURUSAN') {
            updateData.major_id = targetMajorId;
          } else if (mutationAction === 'DROP_OUT') {
            updateData.status = 'KELUAR';
          } else if (mutationAction === 'ALUMNI') {
            updateData.status = 'ALUMNI';
          }

          await prisma.student.update({
            where: { id: stdId },
            data: updateData
          });

          // Log mutation record
          await prisma.studentMutation.create({
            data: {
              student_id: stdId,
              action: mutationAction,
              to_class_id: targetClassId,
              to_major_id: targetMajorId,
              notes: notes
            }
          });
          count++;
        }

        logActivity(tenantId, authUser.id, username, role, 'UPDATE', 'AkademikMutation', `Melakukan mutasi ${mutationAction} pada ${count} siswa. Catatan: ${notes || '-'}`);
        return res.json({ success: true, message: `Berhasil memproses mutasi ${mutationAction} untuk ${count} siswa.` });
      }

      // 16. Imports & Bulk Actions
      case 'importAcademic': {
        const { type, list } = req.body;
        if (!type || !list || !Array.isArray(list)) {
          return res.status(400).json({ success: false, message: 'Data tidak valid' });
        }

        let importedCount = 0;
        if (type === 'classrooms') {
          for (const item of list) {
            await prisma.classroom.create({
              data: {
                name: item.name,
                code: item.code || `C-${item.name}-${Date.now()}`,
                major_id: item.major_id || '',
                room_id: item.room_id || '',
                homeroom_teacher_id: item.homeroom_teacher_id || '',
                capacity: parseInt(item.capacity) || 30,
                level: item.level || '10',
                status: 'ACTIVE'
              }
            });
            importedCount++;
          }
        } else if (type === 'subjects') {
          for (const item of list) {
            await prisma.subject.create({
              data: {
                name: item.name,
                code: item.code || `SUB-${Date.now()}`,
                status: 'ACTIVE'
              }
            });
            importedCount++;
          }
        }

        logActivity(tenantId, authUser.id, username, role, 'IMPORT', 'Akademik', `Mengimpor ${importedCount} data ${type}`);
        return res.json({ success: true, message: `Berhasil mengimpor ${importedCount} data ${type}.` });
      }

      // Legacy fallback
      case 'getDorms': {
        return res.json({ success: true, message: 'Success', data: [] });
      }
      case 'getDormRooms': {
        return res.json({ success: true, message: 'Success', data: [] });
      }

      case 'virtualClassroomList': {
        const list = await prisma.virtualClassroom.findMany({
          where: { deleted_at: null }
        });
        
        const enriched = await Promise.all(list.map(async (vc: any) => {
          const course = await prisma.subject.findUnique({ where: { id: vc.subject_id } });
          const teacher = await prisma.teacher.findUnique({ where: { id: vc.teacher_id } });
          const cls = await prisma.classroom.findUnique({ where: { id: vc.class_id } });
          const membersCount = await prisma.virtualClassMember.count({
            where: { virtual_classroom_id: vc.id, deleted_at: null }
          });
          return {
            ...vc,
            course_name: course ? course.name : 'Mata Pelajaran',
            course_code: course ? course.code : 'SUB',
            teacher_name: teacher ? teacher.name : 'Guru Pengampu',
            classroom_name: cls ? cls.name : 'Semua Kelas',
            members_count: membersCount
          };
        }));
  
        return res.json({ success: true, message: 'Success', data: enriched });
      }

      case 'virtualClassroomCreate': {
        const { name, subject_id, class_id, teacher_id, description } = req.body;
        if (!name || !subject_id || !class_id || !teacher_id) {
          return res.status(400).json({ success: false, message: 'Nama, Mata Pelajaran, Kelas, dan Guru wajib diisi' });
        }
  
        const newClassroom = await prisma.virtualClassroom.create({
          data: {
            name,
            subject_id,
            class_id,
            teacher_id,
            description: description || '',
            status: 'ACTIVE'
          }
        });
  
        await prisma.virtualClassMember.create({
          data: {
            virtual_classroom_id: newClassroom.id,
            user_id: teacher_id,
            role: 'Teacher',
            status: 'ACTIVE'
          }
        });
  
        const studentsInClass = await prisma.student.findMany({
          where: { class_id: class_id, deleted_at: null }
        });

        for (const std of studentsInClass) {
          await prisma.virtualClassMember.create({
            data: {
              virtual_classroom_id: newClassroom.id,
              user_id: std.id,
              role: 'Student',
              status: 'ACTIVE'
            }
          });
        }
  
        logActivity(tenantId, authUser.id, authUser.username, authUser.role, 'CREATE', 'Virtual Classroom', `Membuat Virtual Classroom "${name}"`);
        return res.json({ success: true, message: 'Virtual classroom berhasil dibuat', data: newClassroom });
      }

      default:
        return null;
    }
  }
}
