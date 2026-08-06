import { logger } from './logger';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details: any;

  constructor(message: string, statusCode = 500, isOperational = true, details: any = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * BaseError acts as the core unified exception wrapper
 */
export const BaseError = AppError;
export type BaseError = AppError;


export class ValidationError extends AppError {
  constructor(message = 'Validasi data gagal.', details: any = null) {
    super(message, 400, true, details);
  }
}

export class AuthError extends AppError {
  constructor(message = 'Autentikasi gagal atau tidak memiliki izin akses.', details: any = null) {
    super(message, 401, true, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Akses ditolak untuk resource ini.', details: any = null) {
    super(message, 403, true, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource yang diminta tidak ditemukan.', details: any = null) {
    super(message, 404, true, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Terjadi konflik data atau resource sudah ada.', details: any = null) {
    super(message, 409, true, details);
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Gagal memproses data pada database.', error?: any) {
    super(message, 500, true, error ? { originalError: error.message || error } : null);
  }
}

export interface ErrorResponseShape {
  statusCode: number;
  success: boolean;
  message: string;
  details: any;
  timestamp: string;
}

export class CentralErrorHandler {
  public static handle(error: Error | AppError): ErrorResponseShape {
    let statusCode = 500;
    let message = 'Terjadi kesalahan internal pada server.';
    let details: any = null;

    if (error instanceof AppError) {
      statusCode = error.statusCode;
      message = error.message;
      details = error.details;
      
      if (statusCode >= 500) {
        logger.error(`[AppError] Operational Error: ${message}`, error);
      } else {
        logger.warn(`[AppError] Operational Warning: ${message}`, { details });
      }
    } else {
      // Non-operational error (bug or system failure)
      message = error.message || 'Terjadi kesalahan sistem yang tidak terduga.';
      logger.fatal(`[SystemError] Non-Operational Exception: ${message}`, error);
      
      if (process.env.NODE_ENV === 'development') {
        details = {
          stack: error.stack,
          name: error.name,
        };
      }
    }

    return {
      statusCode,
      success: false,
      message,
      details,
      timestamp: new Date().toISOString(),
    };
  }
}
export default CentralErrorHandler;
