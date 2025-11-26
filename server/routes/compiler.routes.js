import express from 'express';
import {
  compileCode,
  fixCodeWithAI,
  getSupportedLanguages,
} from '../controllers/compiler.controller.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { compileSchema, fixCodeSchema } from '../validators/compiler.validator.js';

const router = express.Router();

/**
 * @route   GET /api/compiler/languages
 * @desc    Get list of supported programming languages
 * @access  Public
 */
router.get('/languages', getSupportedLanguages);

/**
 * @route   POST /api/compiler/compile
 * @desc    Compile and execute code
 * @access  Public
 */
router.post('/compile', validateRequest(compileSchema), compileCode);

/**
 * @route   POST /api/compiler/fix
 * @desc    Send code to AI API to fix/improve it
 * @access  Public
 */
router.post('/fix', validateRequest(fixCodeSchema), fixCodeWithAI);

export default router;

