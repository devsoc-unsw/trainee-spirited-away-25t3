/**
 * AI Enhanced Validators
 * Validation schemas for AI-enhanced endpoints
 */

export const explainCodeSchema = {
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

    return {
      error: errors.length > 0 ? { details: errors } : null,
    };
  },
};

export const optimizeCodeSchema = {
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

    if (data.optimizationType && typeof data.optimizationType !== 'string') {
      errors.push({
        path: ['optimizationType'],
        message: 'Optimization type must be a string',
      });
    }

    return {
      error: errors.length > 0 ? { details: errors } : null,
    };
  },
};

export const generateCodeSchema = {
  validate: (data) => {
    const errors = [];

    if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
      errors.push({
        path: ['description'],
        message: 'Description is required and must be a non-empty string',
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

