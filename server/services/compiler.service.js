/**
 * Compiler Service
 * Handles code compilation and execution logic
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import { config } from '../config/index.js';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Compile and execute code
 * @param {string} code - The code to compile/execute
 * @param {string} language - The programming language
 * @returns {Promise<Object>} Execution result
 */
export const compileCodeService = async (code, language) => {
  const startTime = Date.now();

  try {
    // Validate language
    if (language !== 'python') {
      throw new Error(`Language ${language} is not supported yet`);
    }

    // Create temporary file
    const tempDir = os.tmpdir();
    const tempFile = path.join(tempDir, `code_${Date.now()}.py`);

    // Write code to temporary file
    await fs.writeFile(tempFile, code);

    // Execute code based on language
    let command;
    if (language === 'python') {
      command = `python "${tempFile}"`;
    }

    // Execute with timeout
    const { stdout, stderr } = await Promise.race([
      execAsync(command, { timeout: config.compiler.maxExecutionTime }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Execution timeout')), config.compiler.maxExecutionTime)
      ),
    ]);

    // Clean up temporary file
    await fs.unlink(tempFile).catch(() => {});

    const executionTime = Date.now() - startTime;

    return {
      output: stdout || '',
      error: stderr || null,
      executionTime,
    };
  } catch (error) {
    // Clean up temporary file in case of error
    const tempDir = os.tmpdir();
    const tempFile = path.join(tempDir, `code_${Date.now()}.py`);
    await fs.unlink(tempFile).catch(() => {});

    const executionTime = Date.now() - startTime;

    return {
      output: '',
      error: error.message || 'Execution failed',
      executionTime,
    };
  }
};

