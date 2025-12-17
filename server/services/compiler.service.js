/**
 * Compiler Service
 * Handles code compilation and execution logic
 * 
 * This service creates temporary files, executes code, and cleans up resources.
 * For production, consider using Docker containers for better security and isolation.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { config } from '../config/index.js';

const execAsync = promisify(exec);

/**
 * Compile and execute code
 * @param {string} code - The code to compile/execute
 * @param {string} language - The programming language
 * @returns {Promise<Object>} Execution result with output, error, and executionTime
 */
export const compileCodeService = async (code, language) => {
  const startTime = Date.now();
  let tempFile = null;

  try {
    // Validate language
    const normalizedLanguage = language?.toLowerCase();
    if (normalizedLanguage !== 'python') {
      throw new Error(`Language ${language} is not supported yet. Supported languages: python`);
    }

    // Validate code length
    if (code.length > config.compiler.maxCodeLength) {
      throw new Error(`Code exceeds maximum length of ${config.compiler.maxCodeLength} characters`);
    }

    // Create temporary file with unique name
    const tempDir = os.tmpdir();
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    tempFile = path.join(tempDir, `code_${timestamp}_${randomSuffix}.py`);

    // Write code to temporary file
    await fs.writeFile(tempFile, code, 'utf8');

    // Execute code based on language
    let command;
    if (normalizedLanguage === 'python') {
      // Use python3 if available, fallback to python
      // On Windows, this will use 'python', on Linux/Mac it will try 'python3' first
      command = `python "${tempFile}" 2>&1`;
    } else {
      throw new Error(`Unsupported language: ${language}`);
    }

    // Execute with timeout
    // Using Promise.race to ensure timeout is enforced
    let stdout = '';
    let stderr = '';
    
    try {
      const result = await Promise.race([
        execAsync(command, { 
          timeout: config.compiler.maxExecutionTime,
          maxBuffer: 1024 * 1024, // 1MB buffer for output
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Execution timeout')), config.compiler.maxExecutionTime)
        ),
      ]);
      
      stdout = result.stdout || '';
      stderr = result.stderr || '';
    } catch (execError) {
      // Handle execution errors (timeout, syntax errors, etc.)
      if (execError.message === 'Execution timeout') {
        throw new Error('Execution timeout');
      }
      // For Python, stderr often contains error messages
      if (execError.stderr) {
        stderr = execError.stderr;
      } else if (execError.message) {
        stderr = execError.message;
      }
    }

    const executionTime = Date.now() - startTime;

    return {
      output: stdout || '',
      error: stderr || null,
      executionTime,
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;

    return {
      output: '',
      error: error.message || 'Execution failed',
      executionTime,
    };
  } finally {
    // Always clean up temporary file, even if there was an error
    if (tempFile) {
      try {
        await fs.unlink(tempFile);
      } catch (cleanupError) {
        // Log but don't throw - cleanup errors shouldn't affect the response
        console.warn(`Failed to cleanup temp file ${tempFile}:`, cleanupError.message);
      }
    }
  }
};

