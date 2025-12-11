/**
 * Session Service
 * Handles code session management (in-memory for now, can be extended to use Redis/DB)
 */

// In-memory storage (replace with Redis or database in production)
const sessions = new Map();

/**
 * Create a new code session
 * @param {string} sessionId - Optional session ID, generates one if not provided
 * @param {Object} initialData - Initial session data
 * @returns {Object} Session object
 */
export const createSession = (sessionId = null, initialData = {}) => {
  const id = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const session = {
    id,
    code: initialData.code || '',
    language: initialData.language || 'python',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: initialData.metadata || {},
  };

  sessions.set(id, session);
  return session;
};

/**
 * Get a session by ID
 * @param {string} sessionId - Session ID
 * @returns {Object|null} Session object or null if not found
 */
export const getSession = (sessionId) => {
  return sessions.get(sessionId) || null;
};

/**
 * Update a session
 * @param {string} sessionId - Session ID
 * @param {Object} updates - Fields to update
 * @returns {Object|null} Updated session or null if not found
 */
export const updateSession = (sessionId, updates) => {
  const session = sessions.get(sessionId);
  if (!session) {
    return null;
  }

  const updated = {
    ...session,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  sessions.set(sessionId, updated);
  return updated;
};

/**
 * Delete a session
 * @param {string} sessionId - Session ID
 * @returns {boolean} True if deleted, false if not found
 */
export const deleteSession = (sessionId) => {
  return sessions.delete(sessionId);
};

/**
 * Get all sessions (for debugging/admin purposes)
 * @returns {Array} Array of session objects
 */
export const getAllSessions = () => {
  return Array.from(sessions.values());
};

/**
 * Clean up old sessions (older than specified hours)
 * @param {number} hoursOld - Hours after which sessions are considered old
 * @returns {number} Number of sessions deleted
 */
export const cleanupOldSessions = (hoursOld = 24) => {
  const cutoffTime = Date.now() - hoursOld * 60 * 60 * 1000;
  let deleted = 0;

  for (const [id, session] of sessions.entries()) {
    const sessionTime = new Date(session.createdAt).getTime();
    if (sessionTime < cutoffTime) {
      sessions.delete(id);
      deleted++;
    }
  }

  return deleted;
};

