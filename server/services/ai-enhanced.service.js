/**
 * AI Enhanced Service
 * Additional AI-powered features beyond code fixing
 */

import { config } from '../config/index.js';

/**
 * Explain code using AI
 * @param {string} code - The code to explain
 * @param {string} language - The programming language
 * @returns {Promise<Object>} Explanation result
 */
export const explainCodeService = async (code, language) => {
  const apiKey = config.ai.apiKey;
  const apiUrl = config.ai.apiUrl;

  if (!apiKey || !apiUrl) {
    throw new Error('AI API configuration is missing');
  }

  try {
    const prompt = `Explain the following ${language} code in detail, including what it does, how it works, and any important concepts:\n\n${code}`;

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
        task: 'explain',
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      explanation: data.explanation || 'Explanation not available',
      concepts: data.concepts || [],
      complexity: data.complexity || 'unknown',
    };
  } catch (error) {
    console.warn('AI API not configured or failed:', error.message);
    return {
      explanation: 'AI API is not configured. Please set up your AI_API_KEY and AI_API_URL in the .env file.',
      concepts: [],
      complexity: 'unknown',
    };
  }
};

/**
 * Optimize code using AI
 * @param {string} code - The code to optimize
 * @param {string} language - The programming language
 * @param {string} optimizationType - Type of optimization (performance, readability, etc.)
 * @returns {Promise<Object>} Optimization result
 */
export const optimizeCodeService = async (code, language, optimizationType = 'performance') => {
  const apiKey = config.ai.apiKey;
  const apiUrl = config.ai.apiUrl;

  if (!apiKey || !apiUrl) {
    throw new Error('AI API configuration is missing');
  }

  try {
    const prompt = `Optimize the following ${language} code for ${optimizationType}. Provide the optimized code and explain the improvements:\n\n${code}`;

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
        task: 'optimize',
        optimizationType,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      optimizedCode: data.optimizedCode || code,
      explanation: data.explanation || 'Code has been optimized.',
      improvements: data.improvements || [],
    };
  } catch (error) {
    console.warn('AI API not configured or failed:', error.message);
    return {
      optimizedCode: code,
      explanation: 'AI API is not configured. Please set up your AI_API_KEY and AI_API_URL in the .env file.',
      improvements: [],
    };
  }
};

/**
 * Generate code from description
 * @param {string} description - Description of what code should do
 * @param {string} language - The programming language
 * @returns {Promise<Object>} Generated code result
 */
export const generateCodeService = async (description, language) => {
  const apiKey = config.ai.apiKey;
  const apiUrl = config.ai.apiUrl;

  if (!apiKey || !apiUrl) {
    throw new Error('AI API configuration is missing');
  }

  try {
    const prompt = `Generate ${language} code based on the following description:\n\n${description}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt,
        language,
        task: 'generate',
        description,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      generatedCode: data.code || data.generatedCode || '',
      explanation: data.explanation || 'Code generated successfully.',
    };
  } catch (error) {
    console.warn('AI API not configured or failed:', error.message);
    return {
      generatedCode: '',
      explanation: 'AI API is not configured. Please set up your AI_API_KEY and AI_API_URL in the .env file.',
    };
  }
};

