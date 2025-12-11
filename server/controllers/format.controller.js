/**
 * Format Controller
 * Handles code formatting and linting operations
 */

import { formatCodeService, lintCodeService } from '../services/format.service.js';

/**
 * Format code
 */
export const formatCode = async (req, res, next) => {
  try {
    const { code, language } = req.body;

    const result = await formatCodeService(code, language);

    res.json({
      success: result.success,
      data: {
        formattedCode: result.formattedCode,
        message: result.message,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lint code
 */
export const lintCode = async (req, res, next) => {
  try {
    const { code, language } = req.body;

    const result = await lintCodeService(code, language);

    res.json({
      success: result.success,
      data: {
        issues: result.issues,
        message: result.message,
      },
    });
  } catch (error) {
    next(error);
  }
};

