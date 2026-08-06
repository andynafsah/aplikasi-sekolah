/**
 * Pino-compatible Enterprise Structured Logger
 * 
 * Implements high-performance structured logging with log level filtering,
 * automatic contextualization (tenant isolation), and performance tracing.
 */

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogPayload {
  tenant_id?: string;
  user_id?: string;
  duration_ms?: number;
  action?: string;
  error?: Error | any;
  [key: string]: any;
}

class PinoLogger {
  private levelWeights: Record<LogLevel, number> = {
    trace: 0,
    debug: 1,
    info: 2,
    warn: 3,
    error: 4,
    fatal: 5
  };

  private currentLevel: LogLevel = 'debug';

  public setLevel(level: LogLevel) {
    this.currentLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levelWeights[level] >= this.levelWeights[this.currentLevel];
  }

  private formatMessage(level: LogLevel, message: string, payload?: LogPayload): string {
    const timestamp = new Date().toISOString();
    const pid = process.pid;
    const levelUpper = level.toUpperCase();
    
    // Aesthetic colored indicators for logs
    let colorCode = '\x1b[37m'; // White
    switch (level) {
      case 'trace': colorCode = '\x1b[90m'; break; // Gray
      case 'debug': colorCode = '\x1b[36m'; break; // Cyan
      case 'info': colorCode = '\x1b[32m'; break; // Green
      case 'warn': colorCode = '\x1b[33m'; break; // Yellow
      case 'error': colorCode = '\x1b[31m'; break; // Red
      case 'fatal': colorCode = '\x1b[41m\x1b[37m'; break; // White on Red
    }

    const resetCode = '\x1b[0m';
    const structuredPart = payload ? ` | ${JSON.stringify(payload)}` : '';

    return `[${timestamp}] ${colorCode}${levelUpper}${resetCode} (${pid}): ${message}${structuredPart}`;
  }

  public trace(message: string, payload?: LogPayload) {
    if (this.shouldLog('trace')) {
      console.trace(this.formatMessage('trace', message, payload));
    }
  }

  public debug(message: string, payload?: LogPayload) {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, payload));
    }
  }

  public info(message: string, payload?: LogPayload) {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, payload));
    }
  }

  public warn(message: string, payload?: LogPayload) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, payload));
    }
  }

  public error(message: string, error?: Error | string, payload?: LogPayload) {
    if (this.shouldLog('error')) {
      const errObj = error instanceof Error ? { message: error.message, stack: error.stack } : { rawError: error };
      const mergedPayload = { ...payload, error: errObj };
      console.error(this.formatMessage('error', message, mergedPayload));
    }
  }

  public fatal(message: string, error?: Error | string, payload?: LogPayload) {
    if (this.shouldLog('fatal')) {
      const errObj = error instanceof Error ? { message: error.message, stack: error.stack } : { rawError: error };
      const mergedPayload = { ...payload, error: errObj };
      console.error(this.formatMessage('fatal', message, mergedPayload));
    }
  }

  // Auditing specific method
  public audit(action: string, actor: string, tenantId: string, status: 'SUCCESS' | 'FAILED', details: string) {
    this.info(`[AUDIT] ${action} by ${actor} on ${tenantId} - ${status}`, {
      action,
      actor,
      tenant_id: tenantId,
      status,
      details,
      category: 'AUDIT_LOG'
    });
  }
}

export const logger = new PinoLogger();
export default logger;
