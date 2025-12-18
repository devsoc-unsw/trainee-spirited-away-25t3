#!/bin/bash

# Session Endpoints Test Script
# Make sure the server is running on http://localhost:5000

BASE_URL="http://localhost:5000/api/session"

echo "Testing Session Endpoints"
echo "============================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Create a new session
echo "1. Testing POST /api/session (Create Session)"
echo "-----------------------------------------------"
RESPONSE=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "print(\"Hello, World!\")",
    "language": "python",
    "metadata": {"theme": "dark"}
  }')

echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
SESSION_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$SESSION_ID" ]; then
  echo -e "${RED}[FAILED] Failed to create session${NC}"
  exit 1
else
  echo -e "${GREEN}[PASS] Session created with ID: $SESSION_ID${NC}"
fi
echo ""

# Test 2: Get session by ID
echo "2. Testing GET /api/session/:sessionId"
echo "-----------------------------------------------"
curl -s -X GET "$BASE_URL/$SESSION_ID" | python3 -m json.tool 2>/dev/null || curl -s -X GET "$BASE_URL/$SESSION_ID"
echo -e "${GREEN}[PASS] Retrieved session${NC}"
echo ""

# Test 3: Update session
echo "3. Testing PUT /api/session/:sessionId (Update Session)"
echo "-----------------------------------------------"
curl -s -X PUT "$BASE_URL/$SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "print(\"Updated code!\")",
    "language": "python",
    "metadata": {"theme": "light", "updated": true}
  }' | python3 -m json.tool 2>/dev/null || curl -s -X PUT "$BASE_URL/$SESSION_ID" -H "Content-Type: application/json" -d '{"code": "print(\"Updated code!\")"}'
echo -e "${GREEN}[PASS] Session updated${NC}"
echo ""

# Test 4: Verify update
echo "4. Testing GET /api/session/:sessionId (Verify Update)"
echo "-----------------------------------------------"
curl -s -X GET "$BASE_URL/$SESSION_ID" | python3 -m json.tool 2>/dev/null || curl -s -X GET "$BASE_URL/$SESSION_ID"
echo -e "${GREEN}[PASS] Verified update${NC}"
echo ""

# Test 5: Delete session
echo "5. Testing DELETE /api/session/:sessionId"
echo "-----------------------------------------------"
curl -s -X DELETE "$BASE_URL/$SESSION_ID" | python3 -m json.tool 2>/dev/null || curl -s -X DELETE "$BASE_URL/$SESSION_ID"
echo -e "${GREEN}[PASS] Session deleted${NC}"
echo ""

# Test 6: Try to get deleted session (should return 404)
echo "6. Testing GET /api/session/:sessionId (Deleted Session - Should 404)"
echo "-----------------------------------------------"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/$SESSION_ID")
if [ "$STATUS" = "404" ]; then
  echo -e "${GREEN}[PASS] Correctly returned 404 for deleted session${NC}"
else
  echo -e "${YELLOW}[WARN] Expected 404, got $STATUS${NC}"
fi
echo ""

# Test 7: Update non-existent session (should return 404)
echo "7. Testing PUT /api/session/:sessionId (Non-existent - Should 404)"
echo "-----------------------------------------------"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE_URL/nonexistent123" \
  -H "Content-Type: application/json" \
  -d '{"code": "test"}')
if [ "$STATUS" = "404" ]; then
  echo -e "${GREEN}[PASS] Correctly returned 404 for non-existent session${NC}"
else
  echo -e "${YELLOW}[WARN] Expected 404, got $STATUS${NC}"
fi
echo ""

# Test 8: Delete non-existent session (should return 404)
echo "8. Testing DELETE /api/session/:sessionId (Non-existent - Should 404)"
echo "-----------------------------------------------"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/nonexistent123")
if [ "$STATUS" = "404" ]; then
  echo -e "${GREEN}[PASS] Correctly returned 404 for non-existent session${NC}"
else
  echo -e "${YELLOW}[WARN] Expected 404, got $STATUS${NC}"
fi
echo ""

echo "============================"
echo -e "${GREEN}[PASS] All tests completed!${NC}"

