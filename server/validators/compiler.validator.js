/**
 * Compiler Validators
 * Joi schemas for request validation
 * 
 * Note: Install joi package: npm install joi
 * For now, using a simple validation structure
 */

// Simple validation function (replace with Joi when installed)
export const compileSchema = {
  validate: (data) => {
    const errors = [];

    if (!data.code || typeof data.code !== 'string' || data.code.trim().length === 0) {
      errors.push({
        path: ['code'],
        message: 'Code is required and must be a non-empty string',
      });
    }

    if (!data.language || typeof data.language !== 'string') {
      errors.push({
        path: ['language'],
        message: 'Language is required and must be a string',
      });
    }

    if (data.language && !['python'].includes(data.language.toLowerCase())) {
      errors.push({
        path: ['language'],
        message: 'Language must be one of: python',
      });
    }

    return {
      error: errors.length > 0 ? { details: errors } : null,
    };
  },
};

export const fixCodeSchema = {
  validate: (data) => {
    const errors = [];

    if (!data.code || typeof data.code !== 'string' || data.code.trim().length === 0) {
      errors.push({
        path: ['code'],
        message: 'Code is required and must be a non-empty string',
      });
    }

    if (!data.language || typeof data.language !== 'string') {
      errors.push({
        path: ['language'],
        message: 'Language is required and must be a string',
      });
    }

    if (data.issue && typeof data.issue !== 'string') {
      errors.push({
        path: ['issue'],
        message: 'Issue must be a string',
      });
    }

    return {
      error: errors.length > 0 ? { details: errors } : null,
    };
  },
};

