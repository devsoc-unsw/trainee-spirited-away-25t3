# Project Setup Guide

This is an online compiler application with React.js + TypeScript frontend and Express.js backend.

## Project Structure

```
trainee-spirited-away-25t3/
├── client/              # React + TypeScript frontend (Vite)
│   ├── src/
│   └── package.json
├── server/              # Express.js backend
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Custom middleware
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   ├── validators/     # Request validation
│   ├── server.js       # Main server file
│   └── package.json
└── package.json        # Root package.json (runs both)
```

## Initial Setup

1. **Install all dependencies:**
   ```bash
   npm run install-all
   ```

2. **Set up environment variables:**
   - Create a `.env` file in the `server/` directory
   - Copy the structure from `server/.env.example`:
     ```env
     PORT=5000
     NODE_ENV=development
     AI_API_KEY=your_ai_api_key_here
     AI_API_URL=https://api.example.com/v1
     CORS_ORIGIN=http://localhost:5173
     ```

## Running the Application

### Development Mode (runs both frontend and backend)
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:5173 (Vite default port)
- Backend: http://localhost:5000

### Running Separately

**Frontend only:**
```bash
cd client
npm run dev
```

**Backend only:**
```bash
cd server
npm run dev
```

## Backend API Endpoints

For complete API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

### Health Check
- `GET /health` - Server health check
- `GET /api/health` - API health check

### Compiler Endpoints
- `GET /api/compiler/languages` - Get supported programming languages
- `POST /api/compiler/compile` - Compile and execute code
- `POST /api/compiler/fix` - Fix code using AI API

### Session Endpoints
- `POST /api/session` - Create a new code session
- `GET /api/session/:sessionId` - Get a session by ID
- `PUT /api/session/:sessionId` - Update a session
- `DELETE /api/session/:sessionId` - Delete a session
- `GET /api/session` - Get all sessions (debugging/admin)

### Format Endpoints (optional)
- `POST /api/format/format` - Format code based on language
- `POST /api/format/lint` - Lint code (check for errors without executing)

### AI Enhanced Endpoints (optional)
- `POST /api/ai/explain` - Explain code using AI
- `POST /api/ai/optimize` - Optimize code using AI
- `POST /api/ai/generate` - Generate code from description using AI

## Documentation

- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API reference with request/response examples
- **[AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md)** - Guide for deploying to AWS, including architecture recommendations and security considerations
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture overview and component details


