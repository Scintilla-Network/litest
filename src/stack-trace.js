import path from 'path';
import { c } from './colors.js';

/**
 * Parse and format stack traces for better readability
 */

/**
 * Clean and format a stack trace for display
 * @param {string} stack - The raw stack trace
 * @param {string} testFilePath - Path to the test file (to highlight relevant frames)
 * @returns {string} Formatted stack trace
 */
function formatStackTrace(stack, testFilePath = '') {
    if (!stack) return '';
    
    const lines = stack.split('\n');
    const formattedLines = [];
    let foundRelevantFrame = false;
    
    for (let i = 0; i < lines.length && formattedLines.length < 5; i++) {
        const line = lines[i].trim();
        
        // Skip the error message line
        if (i === 0 && !line.includes('at ')) {
            continue;
        }
        
        // Skip internal Node.js frames unless no relevant frames found
        if (line.includes('node:internal') || 
            line.includes('node_modules') ||
            line.includes('litest/src/') && !line.includes(testFilePath)) {
            if (foundRelevantFrame) continue;
        }
        
        // Format the stack frame
        const formatted = formatStackFrame(line, testFilePath);
        if (formatted) {
            formattedLines.push(`    ${formatted}`);
            if (line.includes(testFilePath) || !line.includes('node:')) {
                foundRelevantFrame = true;
            }
        }
    }
    
    return formattedLines.join('\n');
}

/**
 * Format a single stack frame
 * @param {string} frame - The stack frame line
 * @param {string} testFilePath - Path to the test file
 * @returns {string} Formatted stack frame
 */
function formatStackFrame(frame, testFilePath = '') {
    if (!frame.includes('at ')) return '';
    
    // Extract components from stack frame
    const match = frame.match(/at\s+(.+?)\s+\((.+):(\d+):(\d+)\)/);
    if (!match) {
        // Handle frames without function names: "at file:///path/to/file.js:10:5"
        const simpleMatch = frame.match(/at\s+(.+):(\d+):(\d+)/);
        if (simpleMatch) {
            const [, filePath, line, column] = simpleMatch;
            const fileName = path.basename(filePath);
            const isTestFile = filePath.includes(testFilePath) || fileName.includes('.spec.') || fileName.includes('.test.');
            
            if (isTestFile) {
                // Show full absolute path for test files
                const absolutePath = path.resolve(filePath.replace('file://', ''));
                return `${c.brightBlue(absolutePath)}:${c.yellow(line)}:${c.yellow(column)}`;
            } else {
                return `${c.muted(fileName)}:${c.muted(line)}:${c.muted(column)}`;
            }
        }
        return c.muted(frame.replace('at ', ''));
    }
    
    const [, functionName, filePath, line, column] = match;
    const fileName = path.basename(filePath);
    const isTestFile = filePath.includes(testFilePath) || fileName.includes('.spec.') || fileName.includes('.test.');
    
    if (isTestFile) {
        // Show full absolute path for test files
        const absolutePath = path.resolve(filePath.replace('file://', ''));
        return `${c.brightCyan(functionName)} ${c.brightBlue(absolutePath)}:${c.yellow(line)}:${c.yellow(column)}`;
    } else {
        return `${c.muted(functionName)} ${c.muted(fileName)}:${c.muted(line)}:${c.muted(column)}`;
    }
}

/**
 * Create a user-friendly error message
 * @param {Error} error - The error object
 * @param {string} testName - Name of the test that failed
 * @param {string} testFilePath - Path to the test file
 * @returns {string} Formatted error message
 */
function formatError(error, testName = '', testFilePath = '') {
    const lines = [];
    
    // Add the error message
    if (error.message) {
        lines.push(c.muted(`  ${error.message}`));
    }
    
    // Add formatted stack trace
    if (error.stack) {
        const formattedStack = formatStackTrace(error.stack, testFilePath);
        if (formattedStack) {
            lines.push('');
            lines.push(formattedStack);
        }
    }
    
    return lines.join('\n');
}

/**
 * Extract the most relevant error location from a stack trace
 * @param {string} stack - The stack trace
 * @param {string} testFilePath - Path to the test file
 * @returns {Object|null} Object with file, line, and column information
 */
function extractErrorLocation(stack, testFilePath = '') {
    if (!stack) return null;
    
    const lines = stack.split('\n');
    
    for (const line of lines) {
        if (line.includes(testFilePath)) {
            const match = line.match(/(.+):(\d+):(\d+)/);
            if (match) {
                return {
                    file: match[1],
                    line: parseInt(match[2]),
                    column: parseInt(match[3])
                };
            }
        }
    }
    
    return null;
}

export { formatStackTrace, formatStackFrame, formatError, extractErrorLocation };
