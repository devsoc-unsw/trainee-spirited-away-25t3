# Architecture Overview

This document provides an overview of the application architecture and how different components interact.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  - Code Editor (Monaco/CodeMirror)                           │
│  - Output Panel (Right side)                                 │
│  - AI Results Panel                                          │
└───────────────────────┬───────────────────────────────────────┘
                        │ HTTP/REST API
┌───────────────────────▼───────────────────────────────────────┐
│                    Backend (Express.js)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              API Routes Layer                         │   │
│  │  - /api/compiler/*                                   │   │
│  │  - /api/session/*                                    │   │
│  │  - /api/format/*                                     │   │
│  │  - /api/ai/*                                         │   │
│  └───────────────────┬──────────────────────────────────┘   │
│                      │                                        │
│  ┌───────────────────▼──────────────────────────────────┐   │
│  │            Controllers Layer                          │   │
│  │  - Request validation                                 │   │
│  │  - Response formatting                                │   │
│  │  - Error handling                                     │   │
│  └───────────────────┬──────────────────────────────────┘   │
│                      │                                        │
│  ┌───────────────────▼──────────────────────────────────┐   │
│  │            Services Layer                             │   │
│  │  - compiler.service.js    (Code execution)           │   │
│  │  - ai.service.js           (Code fixing)             │   │
│  │  - ai-enhanced.service.js  (Explain/Optimize/Gen)    │   │
│  │  - format.service.js       (Format/Lint)             │   │
│  │  - session.service.js      (Session management)       │   │
│  └───────────────────┬──────────────────────────────────┘   │
│                      │                                        │
│  ┌───────────────────▼──────────────────────────────────┐   │
│  │         External Services                             │   │
│  │  - AI API (OpenAI/Anthropic/etc.)                    │   │
│  │  - Code Execution (Docker/System)                    │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

## Component Details

### Frontend (Client)

**Location**: `client/`

**Technology Stack**:
- React + TypeScript
- Vite (build tool)
- (To be implemented) Monaco Editor or CodeMirror for code editing

**Key Features**:
- Code editor with syntax highlighting
- Language selector
- Run/Compile button
- AI Fix button
- Output panel (right side)
- AI results panel

### Backend (Server)

**Location**: `server/`

**Technology Stack**:
- Express.js
- Node.js (ES Modules)

**Directory Structure**:
```
server/
├── config/           # Configuration management
├── controllers/      # Request handlers (business logic entry points)
├── middleware/       # Express middleware (error handling, validation, rate limiting)
├── routes/           # API route definitions
├── services/         # Business logic (core functionality)
├── utils/            # Utility functions
├── validators/       # Request validation schemas
└── server.js         # Application entry point
```

### API Routes

#### `/api/compiler/*`
- **Purpose**: Core compilation and execution
- **Endpoints**:
  - `GET /languages` - Get supported languages
  - `POST /compile` - Compile and execute code
  - `POST /fix` - Fix code using AI

#### `/api/session/*`
- **Purpose**: Session management for saving/loading code
- **Endpoints**:
  - `POST /` - Create session
  - `GET /:sessionId` - Get session
  - `PUT /:sessionId` - Update session
  - `DELETE /:sessionId` - Delete session

#### `/api/format/*`
- **Purpose**: Code formatting and linting
- **Endpoints**:
  - `POST /format` - Format code
  - `POST /lint` - Lint code

#### `/api/ai/*`
- **Purpose**: Advanced AI features
- **Endpoints**:
  - `POST /explain` - Explain code
  - `POST /optimize` - Optimize code
  - `POST /generate` - Generate code from description

## Data Flow

### Code Execution Flow

```
1. User writes code in editor
   ↓
2. User clicks "Run" button
   ↓
3. Frontend sends POST /api/compiler/compile
   {
     code: "...",
     language: "python"
   }
   ↓
4. Controller validates request
   ↓
5. Service creates temp file and executes code
   ↓
6. Service returns output/error
   ↓
7. Controller formats response
   ↓
8. Frontend displays output in right panel
```

### AI Fix Flow

```
1. User clicks "Fix with AI" button
   ↓
2. Frontend sends POST /api/compiler/fix
   {
     code: "...",
     language: "python",
     issue: "optional description"
   }
   ↓
3. Controller validates request
   ↓
4. AI Service calls external AI API
   ↓
5. AI Service processes response
   ↓
6. Controller returns fixed code + explanation
   ↓
7. Frontend displays in AI results panel
```

## Security Considerations

### Current Implementation
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ Request validation
- ✅ Code execution timeout (5 seconds)
- ✅ CORS configuration
- ✅ Input sanitization (via validators)

### Production Recommendations
- 🔒 Authentication/Authorization
- 🔒 Code execution sandboxing (Docker containers)
- 🔒 Resource limits (CPU, memory)
- 🔒 Network isolation for code execution
- 🔒 Secrets management (AWS Secrets Manager)
- 🔒 HTTPS only
- 🔒 Input validation and sanitization
- 🔒 Output sanitization

## Scalability Considerations

### Current State
- In-memory session storage (suitable for single-server deployments)
- Direct code execution on server (security risk)
- Single server instance

### Production Recommendations
- **Session Storage**: In-memory storage is fine for single-server deployments. For multi-server setups, consider Redis or Database
- **Code Execution**: Docker containers or AWS Lambda
- **Load Balancing**: Multiple server instances (requires shared session storage)
- **Caching**: Redis for frequently accessed data (optional)
- **CDN**: CloudFront for static assets
- **Auto-scaling**: Based on request volume

## Deployment Architecture

See [AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md) for detailed deployment options.

### Recommended: Container-Based
- Frontend: S3 + CloudFront
- Backend API: ECS/Fargate
- Code Execution: Separate ECS tasks (Docker containers)
- Session Storage: In-memory (single instance) or Redis (ElastiCache)/DynamoDB (multi-instance)
- Secrets: AWS Secrets Manager

## Future Enhancements

### Short Term
- [ ] Add more languages (JavaScript, Java, C++)
- [ ] Implement actual code formatters (black, prettier, etc.)
- [ ] Implement actual linters (pylint, eslint, etc.)

### Medium Term
- [ ] Authentication system
- [ ] User accounts and saved projects
- [ ] Code sharing (shareable links)
- [ ] Multi-file project support
- [ ] Execution history

### Long Term
- [ ] Real-time collaboration (WebSockets)
- [ ] Code templates and snippets
- [ ] Integration with version control (Git)
- [ ] Custom execution environments
- [ ] Team workspaces

## Development Workflow

1. **Local Development**
   ```bash
   npm run dev  # Runs both frontend and backend
   ```

2. **Testing**
   - Test API endpoints with Postman/curl
   - Test frontend components
   - Integration testing

3. **Deployment**
   - Build frontend: `cd client && npm run build`
   - Deploy backend: See AWS_DEPLOYMENT.md
   - Set environment variables
   - Configure monitoring

## Dependencies

### Backend
- `express` - Web framework
- `cors` - CORS middleware
- `dotenv` - Environment variables

### Frontend (to be implemented)
- React + TypeScript
- Code editor library (Monaco/CodeMirror)
- HTTP client (fetch/axios)

## Configuration

All configuration is centralized in `server/config/index.js` and can be overridden via environment variables.

Key configuration areas:
- Server port and environment
- CORS settings
- AI API credentials
- Rate limiting
- Compiler settings (timeouts, limits)

