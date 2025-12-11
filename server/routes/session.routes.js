import express from 'express';
import {
  createNewSession,
  getSessionById,
  updateSessionById,
  deleteSessionById,
  getAllSessionsList,
} from '../controllers/session.controller.js';

const router = express.Router();

/**
 * @route   POST /api/session
 * @desc    Create a new code session
 * @access  Public
 */
router.post('/', createNewSession);

/**
 * @route   GET /api/session/:sessionId
 * @desc    Get a session by ID
 * @access  Public
 */
router.get('/:sessionId', getSessionById);

/**
 * @route   PUT /api/session/:sessionId
 * @desc    Update a session
 * @access  Public
 */
router.put('/:sessionId', updateSessionById);

/**
 * @route   DELETE /api/session/:sessionId
 * @desc    Delete a session
 * @access  Public
 */
router.delete('/:sessionId', deleteSessionById);

/**
 * @route   GET /api/session
 * @desc    Get all sessions (for debugging/admin)
 * @access  Public (consider adding auth)
 */
router.get('/', getAllSessionsList);

export default router;

