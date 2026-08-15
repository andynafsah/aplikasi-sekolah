/**
 * @file migration.routes.ts
 * @description Enterprise Initial Setup & Data Migration Routes (138_ENTERPRISE_DATA_MIGRATION_AND_INITIAL_SETUP)
 */

import { Router, Request, Response } from 'express';
import { MigrationController } from '../controllers/migration.controller';
import { verifyJWT } from '../../server';

export const migrationRoutes = Router();
let _controller: MigrationController | null = null;
function getController(): MigrationController {
  if (!_controller) {
    _controller = new MigrationController();
  }
  return _controller;
}

export async function handleMigration(
  action: string,
  req: Request,
  res: Response,
  tenantId: string,
  authUser: any,
  username: string,
  role: string
): Promise<any> {
  const migrationActions = [
    'getSetupStatus',
    'getSystemHealthCheck',
    'saveSetupStep',
    'previewImportData',
    'executeDataImport',
    'reconcileData',
    'createBaselineBackup',
    'lockSetup',
    'unlockSetup',
    'getSetupReport',
    'runSetupSmokeTest'
  ];

  if (migrationActions.includes(action)) {
    return await getController().handle(action, req, res, tenantId, authUser, username, role);
  }

  return null;
}
