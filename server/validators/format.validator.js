/**
 * Format Validators
 * Validation schemas for format endpoints
 */

export const formatCodeSchema = {
  validate: (data) => {
    const errors = [];

    if (!data.code || typeof data.code !== 'string') {
      errors.push({
        path: ['code'],
        message: 'Code is required and must be a string',
      });
    }

    if (!data.language || typeof data.language !== 'string') {
      errors.push({
        path: ['language'],
        message: 'Language is required and must be a string',
      });
    }

    return {
      error: errors.length > 0 ? { details: errors } : null,
    };
  },
};

export const lintCodeSchema = {
  validate: (data) => {
    const errors = [];

    if (!data.code || typeof data.code !== 'string') {
      errors.push({
        path: ['code'],
        message: 'Code is required and must be a string',
      });
    }

    if (!data.language || typeof data.language !== 'string') {
      errors.push({
        path: ['language'],
        message: 'Language is required and must be a string',
      });
    }

    return {
      error: errors.length > 0 ? { details: errors } : null,
    };
  },
};

