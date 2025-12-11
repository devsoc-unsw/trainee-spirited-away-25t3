/**
 * AI Enhanced Controller
 * Handles additional AI-powered features
 */

import {
  explainCodeService,
  optimizeCodeService,
  generateCodeService,
} from '../services/ai-enhanced.service.js';

/**
 * Explain code using AI
 */
export const explainCode = async (req, res, next) => {
  try {
    const { code, language } = req.body;

    const result = await explainCodeService(code, language);

    res.json({
      success: true,
      data: {
        explanation: result.explanation,
        concepts: result.concepts,
        complexity: result.complexity,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Optimize code using AI
 */
export const optimizeCode = async (req, res, next) => {
  try {
    const { code, language, optimizationType } = req.body;

    const result = await optimizeCodeService(code, language, optimizationType);

    res.json({
      success: true,
      data: {
        optimizedCode: result.optimizedCode,
        explanation: result.explanation,
        improvements: result.improvements,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate code from description
 */
export const generateCode = async (req, res, next) => {
  try {
    const { description, language } = req.body;

    const result = await generateCodeService(description, language);

    res.json({
      success: true,
      data: {
        generatedCode: result.generatedCode,
        explanation: result.explanation,
      },
    });
  } catch (error) {
    next(error);
  }
};

