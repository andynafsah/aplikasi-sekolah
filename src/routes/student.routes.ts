/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { StudentController } from '../controllers/student.controller';
import { verifyJWT } from '../../server';

export const studentRoutes = Router();
const controller = new StudentController();

// Classic endpoint bindings
studentRoutes.post('/getStudents', (req, res, next) => controller.index(req, res, next));
studentRoutes.post('/createStudent', (req, res, next) => controller.store(req, res, next));
studentRoutes.post('/updateStudent', (req, res, next) => controller.update(req, res, next));
studentRoutes.post('/deleteStudent', (req, res, next) => controller.destroy(req, res, next));

// Barcode, QR vectors, and ID Card rendering routes
studentRoutes.get('/barcode/:nis', (req, res) => controller.getBarcode(req, res));
studentRoutes.get('/qrcode/:text', (req, res) => controller.getQRCode(req, res));
studentRoutes.get('/id_card/:nis', (req, res) => controller.getIDCardTemplate(req, res));

studentRoutes.post('/parentPortal', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('parentPortal', req, res, tenantId, authUser, username, role);
});

studentRoutes.post('/parentDashboard', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.body.token;
  const authUser = token ? verifyJWT(token) : null;
  const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
  const username = authUser ? authUser.username : '';
  const role = authUser ? authUser.role : '';
  controller.handle('parentDashboard', req, res, tenantId, authUser, username, role);
});

export async function handleStudent(
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
export default studentRoutes;
