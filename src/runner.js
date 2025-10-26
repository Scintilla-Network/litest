#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pathToFileURL } from 'url';
import { getTestContext, resetTestContext } from './describe.js';
import { TestReporter } from './reporter.js';
import { c } from './colors.js';
import { withTimeout, resetTestTimeout } from './timeout.js';
import { parseArgs, handleCommands } from './cli.js';
import { 
    setCurrentTestId, 
    clearTestHooks, 
    executeOnTestFinishedHooks, 
    executeOnTestFailedHooks,
    resetTestHooks 
} from './test-hooks.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @typedef {import('./describe.js').TestSuite} TestSuite
 * @typedef {import('./describe.js').TestContext} TestContext
 * @typedef {import('./it.js').Test} Test
 */

class TestRunner {
    constructor(options = {}) {
        this.reporter = new TestReporter(options);
    }

    /**
     * Finds all .spec.js files in the current directory and subdirectories
     * @param {string} dir - The directory to search
     * @returns {string[]} Array of spec file paths
     */
    findSpecFiles(dir = process.cwd()) {
        const specFiles = [];
        
        const scanDirectory = (currentDir) => {
            try {
                const files = fs.readdirSync(currentDir);
                
                for (const file of files) {
                    const fullPath = path.join(currentDir, file);
                    const stat = fs.statSync(fullPath);
                    
                    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
                        scanDirectory(fullPath);
                    } else if (file.endsWith('.spec.js')) {
                        specFiles.push(fullPath);
                    }
                }
            } catch (error) {
                console.warn(c.warn(`Warning: Could not read directory ${currentDir}: ${error.message}`));
            }
        };
        
        scanDirectory(dir);
        return specFiles;
    }

    /**
     * Validates and resolves a specific file path
     * @param {string} filePath - The file path to validate
     * @returns {string|null} The resolved path or null if invalid
     */
    validateSpecFile(filePath) {
        try {
            const resolvedPath = path.resolve(filePath);
            const stat = fs.statSync(resolvedPath);
            
            if (stat.isFile() && resolvedPath.endsWith('.spec.js')) {
                return resolvedPath;
            } else if (stat.isFile()) {
                console.error(c.error(`Error: ${filePath} is not a .spec.js file`));
                return null;
            } else {
                console.error(c.error(`Error: ${filePath} is not a file`));
                return null;
            }
        } catch (error) {
            console.error(c.error(`Error: Cannot find file ${filePath}`));
            return null;
        }
    }

    /**
     * Runs a single test
     * @param {Test} test - The test to run
     * @param {string} fullName - The full hierarchical name of the test
     * @returns {Promise<Object>} The test result
     */
    async runTest(test, fullName) {
        const startTime = Date.now();
        
        try {
            this.reporter.onTestStart(fullName);
            
            if (test.skip) {
                return {
                    name: test.name,
                    fullName,
                    status: 'skipped',
                    error: null,
                    duration: 0
                };
            }
            
            await test.fn();
            
            const duration = Date.now() - startTime;
            return {
                name: test.name,
                fullName,
                status: 'passed',
                error: null,
                duration
            };
        } catch (error) {
            const duration = Date.now() - startTime;
            return {
                name: test.name,
                fullName,
                status: 'failed',
                error,
                duration
            };
        }
    }

    /**
     * Runs all tests in a test suite
     * @param {TestSuite} suite - The test suite to run
     * @param {string} parentName - The parent suite name
     * @param {boolean} hasOnlyModifier - Whether any .only modifiers are present
     * @param {Object[]} parentHooks - Accumulated hooks from parent suites
     * @returns {Promise<Object[]>} Array of test results
     */
    async runSuite(suite, parentName = '', hasOnlyModifier = false, parentHooks = { beforeEach: [], afterEach: [] }) {
        const fullSuiteName = parentName ? `${parentName} ${suite.name}` : suite.name;
        const results = [];

        this.reporter.onSuiteStart(fullSuiteName);

        // Check if this suite should be skipped
        if (suite.skip) {
            // Skip all tests in this suite
            for (const test of suite.tests) {
                results.push({
                    name: test.name,
                    fullName: `${fullSuiteName} ${test.name}`,
                    status: 'skipped',
                    error: null,
                    duration: 0
                });
            }
            
            // Skip all nested suites
            for (const nestedSuite of suite.suites) {
                const nestedResults = await this.runSuite(nestedSuite, fullSuiteName, hasOnlyModifier, parentHooks);
                results.push(...nestedResults);
            }
            
            this.reporter.onSuiteEnd(fullSuiteName);
            return results;
        }

        // Check if we should run this suite based on .only modifiers
        const shouldRunSuite = !hasOnlyModifier || suite.only || this.hasOnlyInChildren(suite);
        
        if (!shouldRunSuite) {
            this.reporter.onSuiteEnd(fullSuiteName);
            return results;
        }

        try {
            // Run beforeAll hooks for this suite
            for (const hook of suite.hooks.beforeAll) {
                try {
                    await withTimeout(hook, 10000); // 10 second timeout for hooks
                } catch (hookError) {
                    throw new Error(`beforeAll hook failed: ${hookError.message}`);
                }
            }

            // Accumulate beforeEach and afterEach hooks from parent suites and this suite
            const currentHooks = {
                beforeEach: [...parentHooks.beforeEach, ...suite.hooks.beforeEach],
                afterEach: [...parentHooks.afterEach, ...suite.hooks.afterEach]
            };

            // Run tests in this suite
            for (const test of suite.tests) {
                const shouldRunTest = !hasOnlyModifier || test.only;
                
                if (shouldRunTest) {
                    const result = await this.runTestWithHooks(test, `${fullSuiteName} ${test.name}`, currentHooks);
                    results.push(result);
                    this.reporter.onTestEnd(result);
                }
            }

            // Run nested suites
            for (const nestedSuite of suite.suites) {
                const nestedResults = await this.runSuite(nestedSuite, fullSuiteName, hasOnlyModifier, currentHooks);
                results.push(...nestedResults);
            }

            // Run afterAll hooks for this suite (in reverse order)
            for (let i = suite.hooks.afterAll.length - 1; i >= 0; i--) {
                try {
                    await withTimeout(suite.hooks.afterAll[i], 10000); // 10 second timeout for hooks
                } catch (hookError) {
                    console.warn(c.warn(`afterAll hook failed: ${hookError.message}`));
                }
            }

        } catch (error) {
            // If a beforeAll or afterAll hook fails, mark all tests in this suite as failed
            console.error(`Hook error in suite "${fullSuiteName}": ${error.message}`);
            
            for (const test of suite.tests) {
                if (!hasOnlyModifier || test.only) {
                    results.push({
                        name: test.name,
                        fullName: `${fullSuiteName} ${test.name}`,
                        status: 'failed',
                        error: new Error(`Suite hook failed: ${error.message}`),
                        duration: 0
                    });
                }
            }
        }

        this.reporter.onSuiteEnd(fullSuiteName);
        return results;
    }

    /**
     * Runs a single test with beforeEach and afterEach hooks
     * @param {Test} test - The test to run
     * @param {string} fullName - The full hierarchical name of the test
     * @param {Object} hooks - The accumulated hooks to run
     * @returns {Promise<Object>} The test result
     */
    async runTestWithHooks(test, fullName, hooks) {
        const testId = `${fullName}-${Date.now()}-${Math.random()}`;
        setCurrentTestId(testId);
        
        const startTime = Date.now();
        let result;
        
        try {
            this.reporter.onTestStart(fullName);
            
            if (test.skip) {
                result = {
                    name: test.name,
                    fullName,
                    status: 'skipped',
                    error: null,
                    duration: 0
                };
                return result;
            }

            if (test.todo) {
                result = {
                    name: test.name,
                    fullName,
                    status: 'todo',
                    error: null,
                    duration: 0
                };
                return result;
            }
            
            // Run test with retry logic
            let attempts = 0;
            const maxAttempts = test.retry + 1;
            let lastError;
            
            while (attempts < maxAttempts) {
                attempts++;
                
                try {
                    // Use custom timeout if specified, otherwise use global timeout
                    const testTimeout = test.timeout || undefined;
                    
                    await withTimeout(async () => {
                        // Run beforeEach hooks
                        for (const hook of hooks.beforeEach) {
                            try {
                                await hook();
                            } catch (hookError) {
                                if (hookError.stack) {
                                    const stackLines = hookError.stack.split('\n').slice(0, 3);
                                    stackLines.forEach(line => {
                                        console.error(c.muted(`   ${line.trim()}`));
                                    });
                                }
                                throw new Error(`beforeEach hook failed: ${hookError.message}`);
                            }
                        }
                        
                        // Run the actual test
                        await test.fn();
                        
                        // Run afterEach hooks (in reverse order)
                        for (let i = hooks.afterEach.length - 1; i >= 0; i--) {
                            try {
                                await hooks.afterEach[i]();
                            } catch (hookError) {
                                throw new Error(`afterEach hook failed: ${hookError.message}`);
                            }
                        }
                    }, testTimeout);
                    
                    // Test passed
                    const duration = Date.now() - startTime;
                    
                    // Handle test.fails - if test was expected to fail but passed
                    if (test.fails) {
                        result = {
                            name: test.name,
                            fullName,
                            status: 'failed',
                            error: new Error('Test was expected to fail but passed'),
                            duration
                        };
                    } else {
                        result = {
                            name: test.name,
                            fullName,
                            status: 'passed',
                            error: null,
                            duration
                        };
                    }
                    break;
                    
                } catch (error) {
                    lastError = error;
                    
                    // Try to run afterEach hooks even if test failed
                    if (!error.message.includes('timed out')) {
                        try {
                            for (let i = hooks.afterEach.length - 1; i >= 0; i--) {
                                await hooks.afterEach[i]();
                            }
                        } catch (hookError) {
                            console.warn(c.warn(`afterEach hook failed after test failure: ${hookError.message}`));
                        }
                    }
                    
                    // If this was the last attempt or test.fails
                    if (attempts >= maxAttempts) {
                        const duration = Date.now() - startTime;
                        
                        // Handle test.fails - if test was expected to fail and did fail
                        if (test.fails) {
                            result = {
                                name: test.name,
                                fullName,
                                status: 'passed',
                                error: null,
                                duration
                            };
                        } else {
                            result = {
                                name: test.name,
                                fullName,
                                status: 'failed',
                                error: lastError,
                                duration
                            };
                        }
                        break;
                    }
                }
            }
            
            return result;
            
        } finally {
            // Always execute test hooks
            if (result) {
                try {
                    if (result.status === 'failed') {
                        await executeOnTestFailedHooks(testId, result);
                    }
                    await executeOnTestFinishedHooks(testId, result);
                } catch (hookError) {
                    console.warn(c.warn(`Test hook execution failed: ${hookError.message}`));
                }
            }
            
            // Clean up test hooks
            clearTestHooks(testId);
        }
    }

    /**
     * Checks if a suite has any .only modifiers in its children
     * @param {TestSuite} suite - The test suite to check
     * @returns {boolean}
     */
    hasOnlyInChildren(suite) {
        // Check tests
        for (const test of suite.tests) {
            if (test.only) return true;
        }
        
        // Check nested suites
        for (const nestedSuite of suite.suites) {
            if (nestedSuite.only || this.hasOnlyInChildren(nestedSuite)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Loads and runs a spec file
     * @param {string} filePath - The path to the spec file
     * @param {boolean} showFileHeader - Whether to show the file header
     * @returns {Promise<Object[]>} Array of test results
     */
    async runSpecFile(filePath, showFileHeader = true) {
        // Start file tracking
        this.reporter.onFileStart(filePath);
        
        try {
            // Reset test context and timeout before loading new file
            resetTestContext();
            resetTestTimeout();
            
            // Import the spec file
            const fileUrl = pathToFileURL(path.resolve(filePath)).href;
            await import(fileUrl);
            
            // Get the test context after loading the file
            const context = getTestContext();
            const results = [];
            
            // Run all test suites
            for (const suite of context.suites) {
                const suiteResults = await this.runSuite(suite, '', context.hasOnly, { beforeEach: [], afterEach: [] });
                results.push(...suiteResults);
            }
            
            // End file tracking
            this.reporter.onFileEnd(filePath);
            
            return results;
        } catch (error) {
            console.error(c.error(`❌ Error loading spec file ${filePath}:`));
            
            if (error instanceof SyntaxError) {
                console.error(c.muted(`   Syntax Error: ${error.message}`));
                if (error.stack) {
                    const stackLines = error.stack.split('\n').slice(0, 3);
                    stackLines.forEach(line => {
                        if (line.includes(filePath)) {
                            console.error(c.muted(`   ${line.trim()}`));
                        }
                    });
                }
            } else if (error.code === 'ERR_MODULE_NOT_FOUND') {
                console.error(c.muted(`   Module not found: ${error.message}`));
                console.error(c.muted(`   Make sure all imports are correct and dependencies are installed`));
            } else if (error.message.includes('Cannot resolve module')) {
                console.error(c.muted(`   Import Error: ${error.message}`));
                console.error(c.muted(`   Check your import statements and file paths`));
            } else {
                console.error(c.muted(`   ${error.message}`));
                if (process.env.DEBUG) {
                    console.error(c.muted(`   ${error.stack}`));
                }
            }
            
            // End file tracking even on error
            this.reporter.onFileEnd(filePath);
            
            return [];
        }
    }

    /**
     * Runs tests from specific files or searches for spec files
     * @param {string[]} [filePaths] - Specific file paths to run
     * @param {string} [searchDir] - The directory to search for spec files (if no specific files)
     * @returns {Promise<void>}
     */
    async run(filePaths = [], searchDir = null) {
        this.reporter.onRunStart();
        
        let specFiles = [];
        
        if (filePaths.length > 0) {
            // Validate specific file paths
            for (const filePath of filePaths) {
                const validatedPath = this.validateSpecFile(filePath);
                if (validatedPath) {
                    specFiles.push(validatedPath);
                } else {
                    process.exit(1);
                }
            }
        } else {
            // Search for spec files
            specFiles = this.findSpecFiles(searchDir);
        }
        
        if (specFiles.length === 0) {
            console.log(c.warn('No .spec.js files found.'));
            process.exit(1); // Exit with error code when no tests found
        }
        
        // Set file count for reporter
        this.reporter.setFileCount(specFiles.length);
        
        // Run all spec files
        for (const specFile of specFiles) {
            await this.runSpecFile(specFile, true);
        }
        
        this.reporter.onRunEnd();
    }
}

// CLI entry point
async function runTests(args) {
    const runner = new TestRunner({ verbose: args.verbose });
    
    try {
        if (args.files.length > 0) {
            // Run specific files
            await runner.run(args.files);
        } else if (args.directories.length > 0) {
            // Search in specified directory (use first one)
            await runner.run([], args.directories[0]);
        } else {
            // No arguments - search current directory
            await runner.run([], process.cwd());
        }
        
        // Success - exit with code 0 (will be overridden by reporter if tests failed)
        process.exit(0);
    } catch (error) {
        console.error(c.error('Fatal error:'), error.message);
        if (process.env.DEBUG) {
            console.error(error.stack);
        }
        process.exit(2); // Exit code 2 for fatal errors
    }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    const rawArgs = process.argv.slice(2);
    const args = parseArgs(rawArgs);
    
    // Handle commands that don't require running tests
    if (handleCommands(args)) {
        process.exit(0);
    }
    
    await runTests(args);
} else {
    // Assume we want to check all files in the current directory by calling itself with '.'
    const rawArgs = process.argv.slice(2);
    const args = parseArgs(rawArgs);
    
    // Handle commands that don't require running tests
    if (handleCommands(args)) {
        process.exit(0);
    }
    
    await runTests(args);
}

export { TestRunner };