import { Logger, logger } from '../core/logger';
import { AppError, DatabaseError } from '../core/error-handler';

export abstract class BaseService {
  protected readonly log: Logger;

  constructor(serviceName: string) {
    this.log = logger.child(serviceName);
  }

  /**
   * Safe execution wrapper that handles operational/system exceptions automatically.
   */
  protected async executeSafe<T>(
    operationName: string,
    action: () => Promise<T>
  ): Promise<T> {
    this.log.debug(`Executing transaction operation: ${operationName}`);
    try {
      return await action();
    } catch (error: any) {
      this.log.error(`Failed to execute operation [${operationName}]: ${error.message}`, error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      // Catch native/Prisma database conflicts or integrity exceptions
      if (error.code && typeof error.code === 'string' && error.code.startsWith('P')) {
        throw new DatabaseError(`Gagal melakukan operasi data di database [${operationName}].`, error);
      }

      throw new AppError(
        error.message || `Gagal menyelesaikan aksi ${operationName}.`,
        500,
        true,
        { originalError: error }
      );
    }
  }

  /**
   * Helper to ensure tenant-scoping exists for user requests
   */
  protected ensureTenant(tenantId?: string): string {
    if (!tenantId) {
      throw new AppError('Tenant ID tidak disediakan. Konteks multi-tenant wajib diatur.', 400);
    }
    return tenantId;
  }
}
export default BaseService;
