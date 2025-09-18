import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

/**
 * Configuration management for litest
 */

/**
 * Default configuration
 */
const defaultConfig = {
    // Test file patterns
    testMatch: ['**/*.spec.js', '**/*.test.js'],
    
    // Directories to ignore
    testIgnore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
    
    // Default timeout for tests (in milliseconds)
    testTimeout: 5000,
    
    // Hook timeout (in milliseconds)
    hookTimeout: 10000,
    
    // Whether to show colors in output
    colors: true,
    
    // Maximum number of concurrent test files
    maxConcurrency: 1,
    
    // Whether to stop on first failure
    bail: false,
    
    // Root directory for tests
    root: process.cwd(),
    
    // Environment variables to set
    env: {}
};

/**
 * Load configuration from file
 * @param {string} configPath - Path to config file
 * @returns {Promise<Object>} Configuration object
 */
async function loadConfig(configPath) {
    try {
        const fullPath = path.resolve(configPath);
        const fileUrl = pathToFileURL(fullPath).href;
        const module = await import(fileUrl);
        return module.default || module;
    } catch (error) {
        if (error.code === 'ENOENT') {
            return null; // Config file doesn't exist
        }
        throw new Error(`Failed to load config from ${configPath}: ${error.message}`);
    }
}

/**
 * Find and load configuration file
 * @param {string} startDir - Directory to start searching from
 * @returns {Promise<Object>} Merged configuration
 */
async function findAndLoadConfig(startDir = process.cwd()) {
    const configFiles = [
        'litest.config.js',
        'litest.config.mjs',
        '.litestrc.js',
        '.litestrc.mjs'
    ];
    
    let currentDir = startDir;
    
    while (currentDir !== path.dirname(currentDir)) {
        for (const configFile of configFiles) {
            const configPath = path.join(currentDir, configFile);
            
            if (fs.existsSync(configPath)) {
                const userConfig = await loadConfig(configPath);
                if (userConfig) {
                    return mergeConfig(defaultConfig, userConfig);
                }
            }
        }
        
        currentDir = path.dirname(currentDir);
    }
    
    return defaultConfig;
}

/**
 * Merge user configuration with defaults
 * @param {Object} defaultConf - Default configuration
 * @param {Object} userConf - User configuration
 * @returns {Object} Merged configuration
 */
function mergeConfig(defaultConf, userConf) {
    const merged = { ...defaultConf };
    
    for (const [key, value] of Object.entries(userConf)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            merged[key] = { ...merged[key], ...value };
        } else {
            merged[key] = value;
        }
    }
    
    return merged;
}

/**
 * Validate configuration
 * @param {Object} config - Configuration to validate
 * @throws {Error} If configuration is invalid
 */
function validateConfig(config) {
    if (!config || typeof config !== 'object') {
        throw new Error('Configuration must be an object');
    }
    
    if (config.testTimeout && (typeof config.testTimeout !== 'number' || config.testTimeout <= 0)) {
        throw new Error('testTimeout must be a positive number');
    }
    
    if (config.hookTimeout && (typeof config.hookTimeout !== 'number' || config.hookTimeout <= 0)) {
        throw new Error('hookTimeout must be a positive number');
    }
    
    if (config.testMatch && !Array.isArray(config.testMatch)) {
        throw new Error('testMatch must be an array of glob patterns');
    }
    
    if (config.testIgnore && !Array.isArray(config.testIgnore)) {
        throw new Error('testIgnore must be an array of glob patterns');
    }
}

/**
 * Create a sample configuration file
 * @param {string} filePath - Path where to create the config file
 */
function createSampleConfig(filePath = 'litest.config.js') {
    const sampleConfig = `export default {
  // Test file patterns
  testMatch: ['**/*.spec.js', '**/*.test.js'],
  
  // Directories to ignore
  testIgnore: ['**/node_modules/**', '**/dist/**'],
  
  // Default timeout for tests (in milliseconds)
  testTimeout: 5000,
  
  // Hook timeout (in milliseconds)  
  hookTimeout: 10000,
  
  // Whether to show colors in output
  colors: true,
  
  // Whether to stop on first failure
  bail: false,
  
  // Environment variables to set
  env: {
    NODE_ENV: 'test'
  }
};
`;
    
    fs.writeFileSync(filePath, sampleConfig);
}

export { 
    defaultConfig, 
    loadConfig, 
    findAndLoadConfig, 
    mergeConfig, 
    validateConfig, 
    createSampleConfig 
};
