import { getTestContext } from './describe.js';

/**
 * @typedef {Object} Test
 * @property {string} name - The name of the test
 * @property {Function} fn - The test function
 * @property {boolean} only - Whether this test should be the only one to run
 * @property {boolean} skip - Whether this test should be skipped
 * @property {boolean} todo - Whether this test is a todo (not implemented)
 * @property {boolean} fails - Whether this test is expected to fail
 * @property {boolean} concurrent - Whether this test can run concurrently
 * @property {string} status - The status of the test (pending, running, passed, failed, skipped, todo)
 * @property {Error|null} error - The error if the test failed
 * @property {number} duration - The duration of the test in milliseconds
 * @property {number} timeout - Custom timeout for this test
 * @property {number} retry - Number of retries for this test
 * @property {Object} context - Test context and fixtures
 */

/**
 * Creates a test
 * @param {string} name - The name of the test
 * @param {Function|Object} fnOrOptions - The test function or options object
 * @param {Function} [fn] - The test function if options provided
 */
function it(name, fnOrOptions, fn) {
    const context = getTestContext();
    
    if (!context.currentSuite) {
        throw new Error('Tests must be defined within a describe block');
    }

    let testFn, options = {};
    
    // Handle both it(name, fn) and it(name, options, fn) syntax
    if (typeof fnOrOptions === 'function') {
        testFn = fnOrOptions;
    } else if (typeof fnOrOptions === 'object' && fn) {
        options = fnOrOptions;
        testFn = fn;
    } else {
        throw new Error('Test function is required');
    }

    const test = {
        name,
        fn: testFn,
        only: options.only || false,
        skip: options.skip || false,
        todo: options.todo || false,
        fails: options.fails || false,
        concurrent: options.concurrent || false,
        timeout: options.timeout,
        retry: options.retry || 0,
        status: options.todo ? 'todo' : 'pending',
        error: null,
        duration: 0,
        context: {}
    };

    context.currentSuite.tests.push(test);
}

/**
 * Creates a test that should be the only one to run
 * @param {string} name - The name of the test
 * @param {Function} fn - The test function
 */
it.only = function(name, fn) {
    const context = getTestContext();
    context.hasOnly = true;
    
    if (!context.currentSuite) {
        throw new Error('Tests must be defined within a describe block');
    }

    const test = {
        name,
        fn,
        only: true,
        skip: false,
        status: 'pending',
        error: null,
        duration: 0
    };

    context.currentSuite.tests.push(test);
};

/**
 * Creates a test that should be skipped
 * @param {string} name - The name of the test
 * @param {Function} fn - The test function
 */
it.skip = function(name, fn) {
    return it(name, { skip: true }, fn || (() => {}));
};

/**
 * Creates a test that is a todo (not implemented yet)
 * @param {string} name - The name of the test
 * @param {Function} [fn] - Optional test function
 */
it.todo = function(name, fn) {
    return it(name, { todo: true }, fn || (() => {}));
};

/**
 * Creates a test that is expected to fail
 * @param {string} name - The name of the test
 * @param {Function} fn - The test function
 */
it.fails = function(name, fn) {
    return it(name, { fails: true }, fn);
};

/**
 * Creates a test that can run concurrently
 * @param {string} name - The name of the test
 * @param {Function} fn - The test function
 */
it.concurrent = function(name, fn) {
    return it(name, { concurrent: true }, fn);
};

/**
 * Creates a test that should skip if condition is true
 * @param {boolean} condition - Condition to check
 * @returns {Function} Test function
 */
it.skipIf = function(condition) {
    return function(name, fn) {
        return it(name, { skip: condition }, fn);
    };
};

/**
 * Creates a test that should run only if condition is true
 * @param {boolean} condition - Condition to check
 * @returns {Function} Test function
 */
it.runIf = function(condition) {
    return function(name, fn) {
        return it(name, { skip: !condition }, fn);
    };
};

/**
 * Creates parameterized tests using each data set
 * @param {Array|Object} cases - Test cases data
 * @returns {Function} Test function
 */
it.each = function(cases) {
    return function(name, fn) {
        if (Array.isArray(cases)) {
            cases.forEach((testCase, index) => {
                // Create a copy of the test case to avoid modifying the original
                const testCaseCopy = Array.isArray(testCase) ? [...testCase] : testCase;
                
                const testName = typeof name === 'function' 
                    ? name(...(Array.isArray(testCase) ? testCase : [testCase]))
                    : name.replace(/%[sdio%]/g, (match) => {
                        if (Array.isArray(testCase)) {
                            const value = testCaseCopy.shift();
                            return String(value);
                        }
                        return String(testCase);
                    });
                
                it(testName || `${name} [${index}]`, () => {
                    return Array.isArray(testCase) ? fn(...testCase) : fn(testCase);
                });
            });
        } else if (typeof cases === 'object') {
            Object.entries(cases).forEach(([key, value]) => {
                const testName = name.replace('%s', key);
                it(testName, () => fn(value));
            });
        }
    };
};

/**
 * Creates parameterized tests using for syntax (doesn't spread arrays)
 * @param {Array} cases - Test cases data
 * @returns {Function} Test function
 */
it.for = function(cases) {
    return function(name, fn) {
        if (!Array.isArray(cases)) {
            throw new Error('it.for expects an array of test cases');
        }
        
        cases.forEach((testCase, index) => {
            const testName = typeof name === 'function' 
                ? name(testCase)
                : name.replace(/%[sdio%]/g, () => String(testCase));
            
            it(testName || `${name} [${index}]`, () => fn(testCase));
        });
    };
};

export { it };
