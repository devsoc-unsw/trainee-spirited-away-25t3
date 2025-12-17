/**
 * AI Service
 * Handles communication with AI API for code fixing
 * 
 * This service sends code to an AI API (OpenAI, Anthropic, etc.) to fix issues
 * and returns the fixed code along with detailed change information for highlighting.
 */

import { config } from '../config/index.js';

/**
 * Build a well-engineered prompt for the AI API
 * This prompt is designed to get structured responses with detailed change information
 * 
 * @param {string} code - The code to fix
 * @param {string} language - The programming language
 * @param {string} issue - Optional description of the issue
 * @returns {string} The formatted prompt
 */
const buildFixPrompt = (code, language, issue = null) => {
  const issueContext = issue 
    ? `\n\nUser reported issue: ${issue}`
    : '';

  return `You are an expert ${language} code reviewer and fixer. Your task is to analyze the provided code, identify any issues (syntax errors, bugs, style problems, best practice violations), and provide a fixed version.

IMPORTANT: You must respond with a valid JSON object in the following exact format:
{
  "fixedCode": "the complete fixed code here",
  "explanation": "a brief overall explanation of what was fixed",
  "suggestions": ["suggestion 1", "suggestion 2"],
  "changes": [
    {
      "lineStart": 1,
      "lineEnd": 1,
      "charStart": 10,
      "charEnd": 10,
      "oldCode": "original code snippet",
      "newCode": "new code snippet",
      "explanation": "why this change was made",
      "comment": "detailed explanation for tooltip/hover"
    }
  ]
}

Rules:
1. fixedCode: Return the complete fixed code as a single string (preserve line breaks with \\n)
2. explanation: A brief summary (1-2 sentences) of the main fixes
3. suggestions: Array of general improvement suggestions (can be empty)
4. changes: Array of change objects for each modification
   - lineStart/lineEnd: Line numbers (1-indexed) where the change occurs
   - charStart/charEnd: Character positions (0-indexed) within the line
   - oldCode: The original code that was changed
   - newCode: The new code that replaces it
   - explanation: Brief reason for the change
   - comment: Detailed explanation for UI tooltips

Code to fix:${issueContext}

\`\`\`${language}
${code}
\`\`\`

Please analyze this code and return ONLY the JSON response with the fixed code and detailed changes. Do not include any markdown formatting or code blocks around the JSON.`;
};

/**
 * Parse AI response and extract JSON
 * Handles cases where AI wraps JSON in markdown code blocks
 * 
 * @param {string} responseText - Raw response from AI
 * @returns {Object} Parsed JSON object
 */
const parseAIResponse = (responseText) => {
  try {
    // Try to parse directly first
    return JSON.parse(responseText);
  } catch (e) {
    // If that fails, try to extract JSON from markdown code blocks
    const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    
    // Try to find JSON object in the text
    const jsonObjectMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch) {
      return JSON.parse(jsonObjectMatch[0]);
    }
    
    throw new Error('Could not parse AI response as JSON');
  }
};

/**
 * Fix code using AI API
 * @param {string} code - The code to fix
 * @param {string} language - The programming language
 * @param {string} issue - Optional description of the issue
 * @returns {Promise<Object>} AI response with fixed code and detailed changes
 */
export const fixCodeWithAIService = async (code, language, issue = null) => {
  const apiKey = config.ai.apiKey;
  const apiUrl = config.ai.apiUrl;

  // Check if AI API is configured
  if (!apiKey || !apiUrl) {
    console.warn('AI API not configured. Returning original code.');
    return {
      fixedCode: code,
      explanation: 'AI API is not configured. Please set AI_API_KEY and AI_API_URL in your .env file.',
      suggestions: [],
      changes: [],
    };
  }

  try {
    // Build the prompt
    const prompt = buildFixPrompt(code, language, issue);

    // Determine API provider based on URL
    // Support OpenAI-compatible APIs (OpenAI, Anthropic Claude via proxy, etc.)
    const isOpenAIFormat = apiUrl.includes('openai') || apiUrl.includes('api.openai.com');
    
    // Prepare request body based on API format
    let requestBody;
    let headers = {
      'Content-Type': 'application/json',
    };

    if (isOpenAIFormat) {
      // OpenAI format
      headers['Authorization'] = `Bearer ${apiKey}`;
      requestBody = {
        model: 'gpt-4-turbo-preview', // or 'gpt-3.5-turbo' for faster/cheaper
        messages: [
          {
            role: 'system',
            content: 'You are an expert code reviewer and fixer. Always respond with valid JSON in the exact format specified.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent, focused responses
        response_format: { type: 'json_object' }, // Force JSON response
      };
    } else {
      // Generic API format (Anthropic, custom, etc.)
      // Adjust based on your specific API
      headers['Authorization'] = `Bearer ${apiKey}`;
      headers['x-api-key'] = apiKey; // Some APIs use this instead
      
      requestBody = {
        prompt: prompt,
        language: language,
        code: code,
        issue: issue,
        max_tokens: 4000,
        temperature: 0.3,
      };
    }

    // Make API request
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI API error (${response.status}): ${errorText || response.statusText}`);
    }

    const data = await response.json();

    // Extract response based on API format
    let aiResponseText;
    if (isOpenAIFormat) {
      // OpenAI returns: { choices: [{ message: { content: "..." } }] }
      aiResponseText = data.choices?.[0]?.message?.content || data.content || JSON.stringify(data);
    } else {
      // Generic format - adjust based on your API
      aiResponseText = data.response || data.content || data.text || JSON.stringify(data);
    }

    // Parse the AI response
    const parsedResponse = parseAIResponse(aiResponseText);

    // Validate and structure the response
    const result = {
      fixedCode: parsedResponse.fixedCode || code,
      explanation: parsedResponse.explanation || 'Code has been reviewed and fixed.',
      suggestions: Array.isArray(parsedResponse.suggestions) ? parsedResponse.suggestions : [],
      changes: Array.isArray(parsedResponse.changes) ? parsedResponse.changes : [],
    };

    // Validate changes structure
    result.changes = result.changes.map((change, index) => ({
      lineStart: change.lineStart || 1,
      lineEnd: change.lineEnd || change.lineStart || 1,
      charStart: change.charStart || 0,
      charEnd: change.charEnd || change.charStart || 0,
      oldCode: change.oldCode || '',
      newCode: change.newCode || '',
      explanation: change.explanation || `Change ${index + 1}`,
      comment: change.comment || change.explanation || `Change ${index + 1}`,
    }));

    return result;
  } catch (error) {
    console.error('AI API error:', error.message);
    
    // Return original code with error message
    return {
      fixedCode: code,
      explanation: `Failed to fix code: ${error.message}. Please check your AI API configuration.`,
      suggestions: [],
      changes: [],
    };
  }
};

