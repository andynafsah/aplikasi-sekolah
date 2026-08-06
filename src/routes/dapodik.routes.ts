import { Router } from 'express';
import { DapodikController } from '../controllers/dapodik.controller';
import { verifyJWT } from '../../server';

export const dapodikRoutes = Router();
const controller = new DapodikController();

// Retrieve current settings
dapodikRoutes.get('/settings', (req, res, next) => {
  controller.getSettings(req, res, next);
});

// Update current settings
dapodikRoutes.post('/settings', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const authUser = token ? verifyJWT(token) : null;
  req.body.username = authUser ? (authUser.name || authUser.username) : 'System Administrator';
  controller.updateSettings(req, res, next);
});

// Get all checklist items with live database stats auto-validation
dapodikRoutes.get('/checklists', (req, res, next) => {
  controller.getChecklists(req, res, next);
});

// Update a checklist item
dapodikRoutes.put('/checklists/:id', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const authUser = token ? verifyJWT(token) : null;
  req.body.username = authUser ? (authUser.name || authUser.username) : 'Operator';
  controller.updateChecklist(req, res, next);
});

// Upload attachment
dapodikRoutes.post('/checklists/:id/upload', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const authUser = token ? verifyJWT(token) : null;
  req.body.username = authUser ? (authUser.name || authUser.username) : 'Operator';
  controller.uploadAttachment(req, res, next);
});

// Get history logs
dapodikRoutes.get('/logs/:checklist_num', (req, res, next) => {
  controller.getLogs(req, res, next);
});

export default dapodikRoutes;
