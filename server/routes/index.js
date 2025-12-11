import express from 'express';
import compilerRoutes from './compiler.routes.js';
import sessionRoutes from './session.routes.js';
import formatRoutes from './format.routes.js';
import aiEnhancedRoutes from './ai-enhanced.routes.js';

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use('/compiler', compilerRoutes);
router.use('/session', sessionRoutes);
router.use('/format', formatRoutes);
router.use('/ai', aiEnhancedRoutes);

export default router;

