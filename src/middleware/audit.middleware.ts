import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { logActivity } from '../../server';

export function auditMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  // Let the request complete, then audit if it succeeded
  res.on('finish', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const user = req.authUser;
      if (!user) return;

      const action = (req.query?.action || req.body?.action || '').toString();
      const method = req.method;
      const url = req.originalUrl;

      let auditType = '';
      let auditDetails = '';

      // Intercept and auto-categorize critical operations
      if (action.toLowerCase().endsWith('delete') || action.toLowerCase().endsWith('destroy') || method === 'DELETE') {
        auditType = 'DELETE_DATA';
        auditDetails = `Menghapus entitas data pada rute [${method}] ${url} - Action: ${action}`;
      } else if (action.toLowerCase().endsWith('import') || url.includes('/import')) {
        auditType = 'IMPORT';
        auditDetails = `Mengimpor kumpulan data via excel/csv - Action: ${action}`;
      } else if (action.toLowerCase().endsWith('export') || url.includes('/export')) {
        auditType = 'EXPORT';
        auditDetails = `Mengekspor laporan/data ke format eksternal - Action: ${action}`;
      } else if (action.toLowerCase().includes('approve') || action.toLowerCase().includes('approval') || url.includes('/approve')) {
        auditType = 'APPROVAL';
        auditDetails = `Menyetujui dokumen atau transaksi finansial/akademik - Action: ${action}`;
      }

      if (auditType) {
        logActivity(
          user.tenant_id,
          user.id,
          user.username,
          user.role,
          auditType,
          'Audit Log Automation',
          auditDetails
        );
      }
    }
  });

  next();
}

export default auditMiddleware;
