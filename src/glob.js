import fs from 'fs';
import path from 'path';

/**
 * Simple glob pattern matching (no external dependencies)
 * Supports basic patterns like *.spec.js, star-star/*.spec.js
 */

/**
 * Convert a glob pattern to a regular expression
 * @param {string} pattern - The glob pattern
 * @returns {RegExp} Regular expression that matches the pattern
 */
function globToRegex(pattern) {
    // Escape special regex characters except * and ?
    let regexPattern = pattern
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\*\*/g, '___DOUBLESTAR___')
        .replace(/\*/g, '[^/]*')
        .replace(/\?/g, '[^/]')
        .replace(/___DOUBLESTAR___/g, '.*');
    
    return new RegExp(`^${regexPattern}$`);
}

/**
 * Check if a file path matches a glob pattern
 * @param {string} filePath - The file path to test
 * @param {string} pattern - The glob pattern
 * @returns {boolean} True if the path matches the pattern
 */
function matchGlob(filePath, pattern) {
    const regex = globToRegex(pattern);
    return regex.test(filePath);
}

/**
 * Find files matching a glob pattern
 * @param {string} pattern - The glob pattern (e.g., "*.spec.js", "src/star-star/*.spec.js")
 * @param {string} baseDir - The base directory to search from
 * @returns {string[]} Array of matching file paths
 */
function findFiles(pattern, baseDir = process.cwd()) {
    const matchedFiles = [];
    
    // If pattern doesn't contain wildcards, treat it as a literal path
    if (!pattern.includes('*') && !pattern.includes('?')) {
        const fullPath = path.resolve(baseDir, pattern);
        try {
            if (fs.statSync(fullPath).isFile()) {
                return [fullPath];
            }
        } catch (error) {
            return [];
        }
    }
    
    // For glob patterns, scan the directory tree
    const scanDirectory = (currentDir, relativePath = '') => {
        try {
            const files = fs.readdirSync(currentDir);
            
            for (const file of files) {
                const fullPath = path.join(currentDir, file);
                const relativeFilePath = path.join(relativePath, file);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    // Skip hidden directories and node_modules
                    if (!file.startsWith('.') && file !== 'node_modules') {
                        scanDirectory(fullPath, relativeFilePath);
                    }
                } else if (stat.isFile()) {
                    // Check if file matches the pattern
                    if (matchGlob(relativeFilePath, pattern) || matchGlob(file, pattern)) {
                        matchedFiles.push(fullPath);
                    }
                }
            }
        } catch (error) {
            // Ignore directories we can't read
        }
    };
    
    scanDirectory(baseDir);
    return matchedFiles;
}

/**
 * Expand glob patterns to file paths
 * @param {string[]} patterns - Array of glob patterns
 * @param {string} baseDir - Base directory to search from
 * @returns {string[]} Array of resolved file paths
 */
function expandGlobs(patterns, baseDir = process.cwd()) {
    const allFiles = new Set();
    
    for (const pattern of patterns) {
        const matchedFiles = findFiles(pattern, baseDir);
        matchedFiles.forEach(file => allFiles.add(file));
    }
    
    return Array.from(allFiles).sort();
}

export { globToRegex, matchGlob, findFiles, expandGlobs };
