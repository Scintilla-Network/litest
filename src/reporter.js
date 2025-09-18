import { c, colorSymbol } from './colors.js';
import { formatError } from './stack-trace.js';

/**
 * @typedef {Object} TestResult
 * @property {string} name - The name of the test
 * @property {string} status - The status (passed, failed, skipped, pending)
 * @property {Error|null} error - The error if the test failed
 * @property {number} duration - The duration in milliseconds
 * @property {string} fullName - The full hierarchical name of the test
 */

/**
 * @typedef {Object} TestStats
 * @property {number} total - Total number of tests
 * @property {number} passed - Number of passed tests
 * @property {number} failed - Number of failed tests
 * @property {number} skipped - Number of skipped tests
 * @property {number} pending - Number of pending tests
 * @property {number} todo - Number of todo tests
 * @property {number} duration - Total duration in milliseconds
 */

class TestReporter {
    constructor() {
        /** @type {TestResult[]} */
        this.results = [];
        /** @type {TestStats} */
        this.stats = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            pending: 0,
            todo: 0,
            duration: 0
        };
        this.startTime = 0;
    }

    /**
     * Called when test run starts
     */
    onRunStart() {
        this.startTime = Date.now();
        console.log(c.bold('🚀 Running tests...\n'));
    }

    /**
     * Called when test run ends
     */
    onRunEnd() {
        this.stats.duration = Date.now() - this.startTime;
        this.printSummary();
    }

    /**
     * Called when a test starts
     * @param {string} fullName - The full name of the test
     */
    onTestStart(fullName) {
        // Optional: could print test start info in verbose mode
    }

    /**
     * Called when a test ends
     * @param {TestResult} result - The test result
     */
    onTestEnd(result) {
        this.results.push(result);
        this.stats.total++;
        this.stats[result.status]++;

        const statusSymbol = this.getStatusSymbol(result.status);
        const duration = result.duration > 0 ? c.time(` ${result.duration}ms`) : '';
        
        if (result.status === 'failed') {
            console.log(`${statusSymbol} ${result.fullName}${duration}`);
            const formattedError = formatError(result.error, result.name, result.filePath);
            console.log(formattedError);
            console.log('');
        } else if (result.status === 'skipped') {
            console.log(`${statusSymbol} ${c.muted(result.fullName)}`);
        } else if (result.status === 'todo') {
            console.log(`${statusSymbol} ${c.yellow(result.fullName)} ${c.muted('(todo)')}`);
        } else {
            console.log(`${statusSymbol} ${result.fullName}${duration}`);
        }
    }

    /**
     * Gets the symbol for a test status
     * @param {string} status - The test status
     * @returns {string}
     */
    getStatusSymbol(status) {
        switch (status) {
            case 'passed': return c.green('✓');
            case 'failed': return c.red('✗');
            case 'skipped': return c.cyan('↓');
            case 'todo': return c.yellow('○');
            case 'pending': return c.muted('○');
            default: return c.muted('?');
        }
    }

    /**
     * Prints the test run summary
     */
    printSummary() {
        console.log('');
        
        const testFiles = this.getUniqueFileCount();
        console.log(c.bold(`Test Files  ${c.number(testFiles)} passed (${testFiles})`));
        
        let testsLine = `Tests  ${c.number(this.stats.passed)} passed`;
        if (this.stats.skipped > 0) {
            testsLine += ` | ${c.number(this.stats.skipped)} skipped`;
        }
        testsLine += ` (${c.number(this.stats.total)})`;
        console.log(c.bold(`     ${testsLine}`));
        
        const durationFormatted = this.formatDuration(this.stats.duration);
        console.log(c.muted(`Duration  ${durationFormatted}`));
        
        if (this.stats.failed > 0) {
            console.log('');
            console.log(c.red('❌ Some tests failed!'));
            process.exit(1);
        } else {
            console.log('');
            console.log(c.green('🎉 All tests passed!'));
        }
    }

    /**
     * Format duration in a human-readable way
     * @param {number} ms - Duration in milliseconds
     * @returns {string}
     */
    formatDuration(ms) {
        if (ms < 1000) {
            return `${ms}ms`;
        } else if (ms < 60000) {
            return `${(ms / 1000).toFixed(2)}s`;
        } else {
            const minutes = Math.floor(ms / 60000);
            const seconds = ((ms % 60000) / 1000).toFixed(2);
            return `${minutes}m ${seconds}s`;
        }
    }

    /**
     * Set the file count for better reporting
     * @param {number} count - Number of test files
     */
    setFileCount(count) {
        this.fileCount = count;
    }

    /**
     * Get file count, with fallback
     * @returns {number}
     */
    getUniqueFileCount() {
        return this.fileCount || 1;
    }

    /**
     * Called when a test suite starts
     * @param {string} suiteName - The name of the test suite
     */
    onSuiteStart(suiteName) {
        // Optional: could print suite start info
    }

    /**
     * Called when a test suite ends
     * @param {string} suiteName - The name of the test suite
     */
    onSuiteEnd(suiteName) {
        // Optional: could print suite end info
    }
}

export { TestReporter };
