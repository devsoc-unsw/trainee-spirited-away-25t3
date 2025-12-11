/**
 * Session Controller
 * Handles session-related operations
 */

import {
  createSession,
  getSession,
  updateSession,
  deleteSession,
  getAllSessions,
} from '../services/session.service.js';

/**
 * Create a new session
 */
export const createNewSession = async (req, res, next) => {
  try {
    const { sessionId, code, language, metadata } = req.body;

    const session = createSession(sessionId, {
      code: code || '',
      language: language || 'python',
      metadata: metadata || {},
    });

    res.json({
      success: true,
      data: {
        session,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a session by ID
 */
export const getSessionById = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const session = getSession(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    res.json({
      success: true,
      data: {
        session,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a session
 */
export const updateSessionById = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { code, language, metadata } = req.body;

    const updates = {};
    if (code !== undefined) updates.code = code;
    if (language !== undefined) updates.language = language;
    if (metadata !== undefined) updates.metadata = metadata;

    const session = updateSession(sessionId, updates);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    res.json({
      success: true,
      data: {
        session,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a session
 */
export const deleteSessionById = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const deleted = deleteSession(sessionId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    res.json({
      success: true,
      message: 'Session deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all sessions (for debugging/admin - consider adding auth)
 */
export const getAllSessionsList = async (req, res, next) => {
  try {
    const sessions = getAllSessions();

    res.json({
      success: true,
      data: {
        sessions,
        count: sessions.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

