export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

const LOG_LEVEL_NAMES = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.FATAL]: 'FATAL',
};

const COLOR_CODES = {
  reset: '\x1b[0m',
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m',  // Green
  warn: '\x1b[33m',  // Yellow
  error: '\x1b[31m', // Red
  fatal: '\x1b[35m', // Magenta
};

export type LogListener = (level: LogLevel, levelName: string, context: string, message: string, meta?: any) => void;

export class Logger {
  private level: LogLevel = LogLevel.INFO;
  private contextName: string;
  private static listeners: Set<LogListener> = new Set();

  constructor(contextName = 'App') {
    this.contextName = contextName;
    
    // Auto-resolve log level from environment
    const envLevel = typeof process !== 'undefined' ? process.env.LOG_LEVEL : 'INFO';
    if (envLevel) {
      const match = Object.entries(LOG_LEVEL_NAMES).find(([_, name]) => name === envLevel.toUpperCase());
      if (match) {
        this.level = Number(match[0]) as LogLevel;
      }
    }
  }

  public setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Registers a global log event listener
   */
  public static subscribe(listener: LogListener): () => void {
    Logger.listeners.add(listener);
    return () => {
      Logger.listeners.delete(listener);
    };
  }

  private notifyListeners(level: LogLevel, message: string, meta?: any): void {
    const levelName = LOG_LEVEL_NAMES[level];
    Logger.listeners.forEach((listener) => {
      try {
        listener(level, levelName, this.contextName, message, meta);
      } catch (err) {
        // Prevent recursive crash
      }
    });
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    const levelName = LOG_LEVEL_NAMES[level];
    
    let color = COLOR_CODES.reset;
    if (level === LogLevel.DEBUG) color = COLOR_CODES.debug;
    else if (level === LogLevel.INFO) color = COLOR_CODES.info;
    else if (level === LogLevel.WARN) color = COLOR_CODES.warn;
    else if (level === LogLevel.ERROR) color = COLOR_CODES.error;
    else if (level === LogLevel.FATAL) color = COLOR_CODES.fatal;

    return `${color}[${timestamp}] [${levelName}] [${this.contextName}]: ${message}${COLOR_CODES.reset}`;
  }

  public debug(message: string, ...meta: any[]): void {
    this.notifyListeners(LogLevel.DEBUG, message, meta);
    if (this.level <= LogLevel.DEBUG) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message), ...meta);
    }
  }

  public info(message: string, ...meta: any[]): void {
    this.notifyListeners(LogLevel.INFO, message, meta);
    if (this.level <= LogLevel.INFO) {
      console.info(this.formatMessage(LogLevel.INFO, message), ...meta);
    }
  }

  public warn(message: string, ...meta: any[]): void {
    this.notifyListeners(LogLevel.WARN, message, meta);
    if (this.level <= LogLevel.WARN) {
      console.warn(this.formatMessage(LogLevel.WARN, message), ...meta);
    }
  }

  public error(message: string, error?: any, ...meta: any[]): void {
    this.notifyListeners(LogLevel.ERROR, message, { error, meta });
    if (this.level <= LogLevel.ERROR) {
      console.error(
        this.formatMessage(LogLevel.ERROR, message),
        error instanceof Error ? { message: error.message, stack: error.stack } : error,
        ...meta
      );
    }
  }

  public fatal(message: string, error?: any, ...meta: any[]): void {
    this.notifyListeners(LogLevel.FATAL, message, { error, meta });
    if (this.level <= LogLevel.FATAL) {
      console.error(
        this.formatMessage(LogLevel.FATAL, message),
        error instanceof Error ? { message: error.message, stack: error.stack } : error,
        ...meta
      );
    }
  }

  public child(context: string): Logger {
    return new Logger(`${this.contextName}::${context}`);
  }
}

export const logger = new Logger('ERP-Foundation');
export default logger;
