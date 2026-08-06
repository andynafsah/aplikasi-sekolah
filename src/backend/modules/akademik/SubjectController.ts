import { PrismaEngine } from '../../database/prisma';
import { logger } from '../../config/logger';

export class SubjectController {
  public async handleGetCategories(tenantId: string) {
    try {
      const categories = await PrismaEngine.subjectCategory.findMany({
        where: { tenant_id: tenantId, deleted_at: null },
        orderBy: { order: 'asc' }
      });
      return { success: true, data: categories };
    } catch (err: any) {
      logger.error('Error fetching subject categories', err);
      return { success: false, message: err.message };
    }
  }

  public async handleCreateCategory(tenantId: string, payload: any) {
    try {
      const category = await PrismaEngine.subjectCategory.create({
        data: { ...payload, tenant_id: tenantId }
      });
      return { success: true, data: category };
    } catch (err: any) {
      logger.error('Error creating subject category', err);
      return { success: false, message: err.message };
    }
  }

  public async handleUpdateCategory(tenantId: string, payload: any) {
    try {
      const { id, ...data } = payload;
      const category = await PrismaEngine.subjectCategory.update({
        where: { id },
        data
      });
      return { success: true, data: category };
    } catch (err: any) {
      logger.error('Error updating subject category', err);
      return { success: false, message: err.message };
    }
  }

  public async handleDeleteCategory(tenantId: string, payload: any) {
    try {
      const { id } = payload;
      await PrismaEngine.subjectCategory.update({
        where: { id },
        data: { deleted_at: new Date() }
      });
      return { success: true, message: 'Category deleted successfully' };
    } catch (err: any) {
      logger.error('Error deleting subject category', err);
      return { success: false, message: err.message };
    }
  }

  // --- CURRICULUM MANAGEMENT ---
  public async handleGetCurriculums(tenantId: string) {
    try {
      const curriculums = await PrismaEngine.curriculum.findMany({
        where: { tenant_id: tenantId, deleted_at: null },
        orderBy: { created_at: 'desc' }
      });
      return { success: true, data: curriculums };
    } catch (err: any) {
      logger.error('Error fetching curriculums', err);
      return { success: false, message: err.message };
    }
  }

  public async handleCreateCurriculum(tenantId: string, payload: any) {
    try {
      const curriculum = await PrismaEngine.curriculum.create({
        data: { ...payload, tenant_id: tenantId }
      });
      return { success: true, data: curriculum };
    } catch (err: any) {
      logger.error('Error creating curriculum', err);
      return { success: false, message: err.message };
    }
  }

  public async handleUpdateCurriculum(tenantId: string, payload: any) {
    try {
      const { id, ...data } = payload;
      const curriculum = await PrismaEngine.curriculum.update({
        where: { id },
        data
      });
      return { success: true, data: curriculum };
    } catch (err: any) {
      logger.error('Error updating curriculum', err);
      return { success: false, message: err.message };
    }
  }

  public async handleDeleteCurriculum(tenantId: string, payload: any) {
    try {
      const { id } = payload;
      await PrismaEngine.curriculum.update({
        where: { id },
        data: { deleted_at: new Date() }
      });
      return { success: true, message: 'Curriculum deleted successfully' };
    } catch (err: any) {
      logger.error('Error deleting curriculum', err);
      return { success: false, message: err.message };
    }
  }

  public async handleGetSubjects(tenantId: string, payload: any = {}) {
    try {
      const { category_id, status, search, role, teacher_id } = payload;
      const where: any = { tenant_id: tenantId, deleted_at: null };
      
      if (category_id) where.category_id = category_id;
      if (status) where.status = status;
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { code: { contains: search } }
        ];
      }

      // If user is a Guru, filter by TeacherAssignment
      if (role === 'GURU' && teacher_id) {
        const assignments = await PrismaEngine.teacherAssignment.findMany({
          where: { teacher_id, tenant_id: tenantId, deleted_at: null }
        });
        const subjectIds = assignments.map((a: any) => a.subject_id).filter(Boolean);
        where.id = { in: subjectIds };
      }

      const subjects = await PrismaEngine.subject.findMany({
        where,
        include: { category: true, curriculum: true },
        orderBy: { order: 'asc' }
      });
      return { success: true, data: subjects };
    } catch (err: any) {
      logger.error('Error fetching subjects', err);
      return { success: false, message: err.message };
    }
  }

  public async handleCreateSubject(tenantId: string, payload: any) {
    try {
      const subject = await PrismaEngine.subject.create({
        data: { ...payload, tenant_id: tenantId }
      });
      return { success: true, data: subject };
    } catch (err: any) {
      logger.error('Error creating subject', err);
      return { success: false, message: err.message };
    }
  }

  public async handleUpdateSubject(tenantId: string, payload: any) {
    try {
      const { id, ...data } = payload;
      const subject = await PrismaEngine.subject.update({
        where: { id },
        data
      });
      return { success: true, data: subject };
    } catch (err: any) {
      logger.error('Error updating subject', err);
      return { success: false, message: err.message };
    }
  }

  public async handleDeleteSubject(tenantId: string, payload: any) {
    try {
      const { id } = payload;
      await PrismaEngine.subject.update({
        where: { id },
        data: { deleted_at: new Date() }
      });
      return { success: true, message: 'Subject deleted successfully' };
    } catch (err: any) {
      logger.error('Error deleting subject', err);
      return { success: false, message: err.message };
    }
  }
}
