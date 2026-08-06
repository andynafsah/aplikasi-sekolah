import { IApiResponse, IPaginatedResult } from '../application/dto.base';
import { CentralErrorHandler } from '../core/error-handler';
import { Logger, logger } from '../core/logger';

export abstract class BaseController {
  protected readonly log: Logger;

  constructor(controllerName: string) {
    this.log = logger.child(controllerName);
  }

  /**
   * Helper to format standard JSON success responses.
   */
  protected sendSuccess<T>(
    data: T,
    message = 'Operasi berhasil diselesaikan.',
    statusCode = 200
  ): IApiResponse<T> {
    return {
      statusCode,
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Helper to format standard resource creation responses (201 Created).
   */
  protected sendCreated<T>(
    data: T,
    message = 'Resource baru berhasil dibuat.'
  ): IApiResponse<T> {
    return this.sendSuccess(data, message, 201);
  }

  /**
   * Helper to format standardized paginated result wrappers.
   */
  protected sendPaginated<T>(
    result: IPaginatedResult<T>,
    message = 'Data berhasil diambil.'
  ): IApiResponse<T[]> {
    return {
      statusCode: 200,
      success: true,
      message,
      data: result.data,
      meta: result.meta,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Safe route controller handler wrapper.
   * Isolates async exceptions and passes them through the CentralErrorHandler.
   */
  protected async handleRequest<T>(
    handler: () => Promise<IApiResponse<T>>
  ): Promise<IApiResponse<T> | any> {
    try {
      return await handler();
    } catch (error: any) {
      this.log.error(`Request exception intercepted: ${error.message}`, error);
      return CentralErrorHandler.handle(error);
    }
  }
}
export default BaseController;
