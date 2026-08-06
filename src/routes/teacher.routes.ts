import { Router } from 'express';
import { TeacherController } from '../controllers/teacher.controller';
import { verifyJWT } from '../../server';

export const teacherRoutes = Router();
const controller = new TeacherController();

teacherRoutes.post('/getTeachers', (req, res, next) => controller.index(req, res, next));
teacherRoutes.post('/createTeacher', (req, res, next) => controller.store(req, res, next));

export async function handleTeacher(
  action: string,
  req: any,
  res: any,
  tenantId: string,
  authUser: any,
  username: string,
  role: string
): Promise<any> {
  return controller.handle(action, req, res, tenantId, authUser, username, role);
}
