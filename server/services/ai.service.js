/**
 * AI Service
 * Handles communication with AI API for code fixing
 */

import { config } from '../config/index.js';

/**
 * Fix code using AI API
 * @param {string} code - The code to fix
 * @param {string} language - The programming language
 * @param {string} issue - Optional description of the issue
 * @returns {Promise<Object>} AI response with fixed code
 */
export const fixCodeWithAIService = async (code, language, issue = null) => {
  const apiKey = config.ai.apiKey;
  const apiUrl = config.ai.apiUrl;

  if (!apiKey || !apiUrl) {
    throw new Error('AI API configuration is missing. Please set AI_API_KEY and AI_API_URL in your .env file');
  }

  try {
    // TODO: Implement actual AI API call
    // This is a placeholder structure for future implementation
    const prompt = issue
      ? `Fix the following ${language} code. Issue: ${issue}\n\nCode:\n${code}`
      : `Review and fix any issues in the following ${language} code:\n\n${code}`;

    // Example API call structure (replace with actual implementation)
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt,
        language,
        code,
        issue,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Adjust based on your AI API response structure
    return {
      fixedCode: data.fixedCode || code,
      explanation: data.explanation || 'Code has been reviewed and fixed.',
      suggestions: data.suggestions || [],
    };
  } catch (error) {
    // For now, return a mock response if API is not configured
    // Remove this in production once API is set up
    console.warn('AI API not configured or failed:', error.message);
    
    return {
      fixedCode: code, // Return original code if API fails
      explanation: 'AI API is not configured. Please set up your AI_API_KEY and AI_API_URL in the .env file.',
      suggestions: [],
    };
  }
};

