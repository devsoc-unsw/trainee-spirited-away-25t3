import express from 'express';
import compilerRoutes from './compiler.routes.js';

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

export default router;

