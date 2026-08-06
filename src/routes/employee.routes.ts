import { Router } from 'express';
import { EmployeeController } from '../controllers/employee.controller';
import { verifyJWT } from '../../server';

export const employeeRoutes = Router();
const controller = new EmployeeController();


export async function handleEmployee(
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
