# API Documentation

Complete API reference for the Online Compiler application.

## Base URL

- **Development**: `http://localhost:5000/api`
- **Production**: (To be configured based on deployment)

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message here"
}
```

---

## Health Check

### GET `/health`
Server health check endpoint (bypasses rate limiting).

**Response:**
```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

### GET `/api/health`
API health check endpoint.

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Compiler APIs

### GET `/api/compiler/languages`
Get list of supported programming languages.

**Response:**
```json
{
  "success": true,
  "data": {
    "languages": [
      {
        "id": "python",
        "name": "Python",
        "version": "3.x",
        "extension": ".py"
      }
    ]
  }
}
```

### POST `/api/compiler/compile`
Compile and execute code.

**Request Body:**
```json
{
  "code": "print('Hello, World!')",
  "language": "python"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "output": "Hello, World!\n",
    "error": null,
    "executionTime": 123
  }
}
```

**Error Response:**
```json
{
  "success": true,
  "data": {
    "output": "",
    "error": "Execution timeout",
    "executionTime": 5000
  }
}
```

### POST `/api/compiler/fix`
Fix code using AI API.

**Request Body:**
```json
{
  "code": "def hello()\n    print('Hello')",
  "language": "python",
  "issue": "Syntax error" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "fixedCode": "def hello():\n    print('Hello')",
    "explanation": "Added missing colon after function definition",
    "suggestions": [
      "Consider adding docstrings",
      "Follow PEP 8 style guidelines"
    ]
  }
}
```

---

## Session APIs

Manage code sessions for saving/loading code state.

### POST `/api/session`
Create a new code session.

**Request Body:**
```json
{
  "sessionId": "optional-custom-id", // optional, auto-generated if not provided
  "code": "print('Hello')",
  "language": "python",
  "metadata": {} // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "session_1234567890_abc123",
      "code": "print('Hello')",
      "language": "python",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "metadata": {}
    }
  }
}
```

### GET `/api/session/:sessionId`
Get a session by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "session_1234567890_abc123",
      "code": "print('Hello')",
      "language": "python",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "metadata": {}
    }
  }
}
```

### PUT `/api/session/:sessionId`
Update a session.

**Request Body:**
```json
{
  "code": "print('Updated code')",
  "language": "python",
  "metadata": { "theme": "dark" }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "session_1234567890_abc123",
      "code": "print('Updated code')",
      "language": "python",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:01:00.000Z",
      "metadata": { "theme": "dark" }
    }
  }
}
```

### DELETE `/api/session/:sessionId`
Delete a session.

**Response:**
```json
{
  "success": true,
  "message": "Session deleted successfully"
}
```

### GET `/api/session`
Get all sessions (for debugging/admin purposes).

**Response:**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "session_1234567890_abc123",
        "code": "print('Hello')",
        "language": "python",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "metadata": {}
      }
    ],
    "count": 1
  }
}
```

---

## Format APIs (Optional)

### POST `/api/format/format`
Format code based on language.

**Request Body:**
```json
{
  "code": "def hello():\n    print('Hello')",
  "language": "python"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "formattedCode": "def hello():\n    print('Hello')",
    "message": "Code formatted successfully"
  }
}
```

### POST `/api/format/lint`
Lint code (check for errors without executing).

**Request Body:**
```json
{
  "code": "def hello():\n    print('Hello')",
  "language": "python"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "issues": [
      {
        "line": 1,
        "column": 1,
        "severity": "warning",
        "message": "Missing docstring"
      }
    ],
    "message": "1 issue(s) found"
  }
}
```

---

## AI Enhanced APIs (Optional)

### POST `/api/ai/explain`
Explain code using AI.

**Request Body:**
```json
{
  "code": "def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)",
  "language": "python"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "explanation": "This function calculates the nth Fibonacci number using recursion...",
    "concepts": ["recursion", "base case", "mathematical sequence"],
    "complexity": "O(2^n)"
  }
}
```

### POST `/api/ai/optimize`
Optimize code using AI.

**Request Body:**
```json
{
  "code": "def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)",
  "language": "python",
  "optimizationType": "performance" // optional: "performance", "readability", etc.
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "optimizedCode": "def fibonacci(n):\n    a, b = 0, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a",
    "explanation": "Converted recursive solution to iterative for better performance",
    "improvements": [
      "Reduced time complexity from O(2^n) to O(n)",
      "Eliminated stack overflow risk for large n"
    ]
  }
}
```

### POST `/api/ai/generate`
Generate code from description using AI.

**Request Body:**
```json
{
  "description": "Create a function that calculates the factorial of a number",
  "language": "python"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "generatedCode": "def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)",
    "explanation": "Generated recursive factorial function"
  }
}
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

### Validation Error Example
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "path": ["code"],
      "message": "Code is required and must be a non-empty string"
    }
  ]
}
```

---

## Rate Limiting

All API endpoints (except `/health`) are rate-limited:
- **Window**: 15 minutes
- **Max Requests**: 100 requests per window per IP

When rate limit is exceeded, you'll receive:
- **Status Code**: `429`
- **Response**:
```json
{
  "success": false,
  "message": "Too many requests, please try again later"
}
```

---

## Notes

1. **Session Storage**: Currently uses in-memory storage. For production, consider using Redis or a database.
2. **Code Execution**: Code execution has a timeout of 5 seconds by default.
3. **AI API**: Requires `AI_API_KEY` and `AI_API_URL` to be set in environment variables.
4. **CORS**: Configured to allow requests from the frontend origin specified in `CORS_ORIGIN`.

---

## Future Enhancements

- Authentication/Authorization
- Persistent session storage (database/Redis)
- Multi-file project support
- Code sharing (shareable links)
- Execution history
- WebSocket support for real-time collaboration
- Additional language support (JavaScript, Java, C++, etc.)

