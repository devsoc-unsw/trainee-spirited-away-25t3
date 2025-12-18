import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { config } from './config/index.js';

const app = express();
const PORT = config.server.port;
const NODE_ENV = config.server.nodeEnv;

// Trust proxy (important for rate limiting and getting correct IP)
app.set('trust proxy', 1);

// CORS configuration
const corsOptions = {
  origin: config.cors.origin,
  credentials: config.cors.credentials,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Limit JSON payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (development only)
if (NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}
// Rate limiting (apply to all routes)
app.use(rateLimiter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Online Compiler API',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        api: '/api',
        compiler: '/api/compiler',
        session: '/api/session',
        format: '/api/format',
        ai: '/api/ai',
      },
    },
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});


// API routes
app.use('/api', routes);

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${NODE_ENV}`);
  console.log(`🔗 API available at http://localhost:${PORT}/api`);
});