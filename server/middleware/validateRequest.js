/**
 * Request validation middleware
 * Validates request body, query, and params
 * Supports both Joi schemas and custom validator objects
 */

export const validateRequest = (schema) => {
  return (req, res, next) => {
    let validationResult;

    // Check if it's a custom validator (has validate method that returns {error})
    if (schema.validate && typeof schema.validate === 'function') {
      validationResult = schema.validate(req.body);
    } else if (schema.validate && typeof schema.validate === 'function') {
      // Joi schema (has validate method)
      validationResult = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
    } else {
      // Assume it's a Joi schema
      validationResult = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
    }

    const { error } = validationResult;

    if (error) {
      let errors;

      // Handle custom validator format
      if (error.details && Array.isArray(error.details)) {
        errors = error.details.map((detail) => {
          const path = detail.path || [];
          return {
            field: Array.isArray(path) ? path.join('.') : path,
            message: detail.message,
          };
        });
      } else if (Array.isArray(error.details)) {
        // Custom validator format
        errors = error.details.map((detail) => ({
          field: Array.isArray(detail.path) ? detail.path.join('.') : detail.path,
          message: detail.message,
        }));
      } else {
        errors = [{ field: 'unknown', message: 'Validation failed' }];
      }

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    next();
  };
};

