import express from 'express';
import { explainCode, optimizeCode, generateCode } from '../controllers/ai-enhanced.controller.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  explainCodeSchema,
  optimizeCodeSchema,
  generateCodeSchema,
} from '../validators/ai-enhanced.validator.js';

const router = express.Router();

/**
 * @route   POST /api/ai/explain
 * @desc    Explain code using AI
 * @access  Public
 */
router.post('/explain', validateRequest(explainCodeSchema), explainCode);

/**
 * @route   POST /api/ai/optimize
 * @desc    Optimize code using AI
 * @access  Public
 */
router.post('/optimize', validateRequest(optimizeCodeSchema), optimizeCode);

/**
 * @route   POST /api/ai/generate
 * @desc    Generate code from description using AI
 * @access  Public
 */
router.post('/generate', validateRequest(generateCodeSchema), generateCode);

export default router;

