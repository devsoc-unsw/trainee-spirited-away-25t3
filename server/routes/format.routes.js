import express from 'express';
import { formatCode, lintCode } from '../controllers/format.controller.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { formatCodeSchema, lintCodeSchema } from '../validators/format.validator.js';

const router = express.Router();

/**
 * @route   POST /api/format/format
 * @desc    Format code based on language
 * @access  Public
 */
router.post('/format', validateRequest(formatCodeSchema), formatCode);

/**
 * @route   POST /api/format/lint
 * @desc    Lint code (check for errors without executing)
 * @access  Public
 */
router.post('/lint', validateRequest(lintCodeSchema), lintCode);

export default router;

