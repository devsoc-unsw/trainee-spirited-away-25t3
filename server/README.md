# Backend Server

Express.js backend server for the online compiler application.

## Project Structure

```
server/
├── controllers/       # Request handlers (business logic)
│   └── compiler.controller.js
├── middleware/        # Custom middleware
│   ├── errorHandler.js
│   ├── rateLimiter.js
│   └── validateRequest.js
├── routes/           # API route definitions
│   ├── index.js
│   └── compiler.routes.js
├── services/         # Business logic and external API calls
│   ├── ai.service.js
│   └── compiler.service.js
├── utils/            # Utility functions
│   ├── constants.js
│   └── logger.js
├── validators/       # Request validation schemas
│   └── compiler.validator.js
├── server.js         # Main server file
└── package.json
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the server directory (copy from `.env.example`):
```env
PORT=5000
NODE_ENV=development
AI_API_KEY=your_ai_api_key_here
AI_API_URL=https://api.example.com/v1
CORS_ORIGIN=http://localhost:5173
```

3. Run the development server:
```bash
npm run dev
```

## API Endpoints

### Health Check
- `GET /health` - Server health check

### Compiler Routes
- `GET /api/compiler/languages` - Get supported programming languages
- `POST /api/compiler/compile` - Compile and execute code
- `POST /api/compiler/fix` - Fix code using AI API

## Features

- ✅ Express.js with ES6 modules
- ✅ Error handling middleware
- ✅ Request validation
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Structured project layout
- ✅ Code execution service (Python)
- ✅ AI API integration scaffolding

## Future Enhancements

- Add Joi for better validation
- Implement database for code history
- Add user authentication
- Support for more programming languages
- Code syntax highlighting
- Real-time code execution status

