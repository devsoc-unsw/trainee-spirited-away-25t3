/**
 * Logger utility
 * Provides consistent logging across the application
 */

const logLevels = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

export const logger = {
  error: (message, ...args) => {
    console.error(`[${new Date().toISOString()}] [${logLevels.ERROR}]`, message, ...args);
  },
  warn: (message, ...args) => {
    console.warn(`[${new Date().toISOString()}] [${logLevels.WARN}]`, message, ...args);
  },
  info: (message, ...args) => {
    console.log(`[${new Date().toISOString()}] [${logLevels.INFO}]`, message, ...args);
  },
  debug: (message, ...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${new Date().toISOString()}] [${logLevels.DEBUG}]`, message, ...args);
    }
  },
};

