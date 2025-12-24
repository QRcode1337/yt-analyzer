/**
 * Centralized logging utility with structured logging support
 * Provides consistent error tracking and debugging capabilities
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  [key: string]: any
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` | ${JSON.stringify(context)}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
  }

  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context))
    }
  }

  info(message: string, context?: LogContext) {
    console.info(this.formatMessage('info', message, context))
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatMessage('warn', message, context))
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
    }
    console.error(this.formatMessage('error', message, errorContext))
  }

  /**
   * Log API request/response for debugging
   */
  apiLog(
    method: string,
    endpoint: string,
    status: number,
    duration?: number
  ) {
    const level = status >= 400 ? 'error' : 'info'
    const message = `${method} ${endpoint} - ${status}`
    const context = duration ? { duration: `${duration}ms` } : undefined

    if (level === 'error') {
      this.error(message, undefined, context)
    } else {
      this.info(message, context)
    }
  }

  /**
   * Log database operations
   */
  dbLog(operation: string, table: string, duration?: number, error?: Error) {
    if (error) {
      this.error(`DB ${operation} failed on ${table}`, error)
    } else if (this.isDevelopment) {
      this.debug(`DB ${operation} on ${table}`, duration ? { duration: `${duration}ms` } : undefined)
    }
  }
}

export const logger = new Logger()
