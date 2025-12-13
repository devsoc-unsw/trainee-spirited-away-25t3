/**
 * Compiler Controller
 * Handles all compiler-related operations
 */

import { compileCodeService } from '../services/compiler.service.js';
import { fixCodeWithAIService } from '../services/ai.service.js';

/**
 * Get supported programming languages
 */
export const getSupportedLanguages = async (req, res, next) => {
  try {
    const languages = [
      {
        id: 'python',
        name: 'Python',
        version: '3.x',
        extension: '.py',
      },
      // Add more languages in the future
      // {
      //   id: 'javascript',
      //   name: 'JavaScript',
      //   version: 'ES6+',
      //   extension: '.js',
      // },
    ];

    res.json({
      success: true,
      data: {
        languages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Compile and execute code
 */
export const compileCode = async (req, res, next) => {
  try {
    const { code, language } = req.body;

    // Compile and execute the code
    const result = await compileCodeService(code, language);

    res.json({
      success: true,
      data: {
        output: result.output,
        error: result.error,
        executionTime: result.executionTime,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fix code using AI API
 */
export const fixCodeWithAI = async (req, res, next) => {
  try {
    const { code, language, issue } = req.body;

    // Send code to AI API for fixing
    const result = await fixCodeWithAIService(code, language, issue);

    res.json({
      success: true,
      data: {
        fixedCode: result.fixedCode,
        explanation: result.explanation,
        suggestions: result.suggestions,
        // Detailed changes array for highlighting changed sections
        // Frontend can use this to highlight code sections and show comments on hover
        changes: result.changes || [],
      },
    });
  } catch (error) {
    next(error);
  }
};

