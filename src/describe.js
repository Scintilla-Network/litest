/**
 * @typedef {Object} TestSuite
 * @property {string} name - The name of the test suite
 * @property {Function[]} tests - Array of test functions
 * @property {TestSuite[]} suites - Array of nested test suites
 * @property {boolean} only - Whether this suite should be the only one to run
 * @property {boolean} skip - Whether this suite should be skipped
 * @property {Object} hooks - Lifecycle hooks for this suite
 * @property {Function[]} hooks.beforeAll - Functions to run before all tests in this suite
 * @property {Function[]} hooks.beforeEach - Functions to run before each test in this suite
 * @property {Function[]} hooks.afterAll - Functions to run after all tests in this suite
 * @property {Function[]} hooks.afterEach - Functions to run after each test in this suite
 */

/**
 * @typedef {Object} TestContext
 * @property {TestSuite[]} suites - Array of test suites
 * @property {TestSuite|null} currentSuite - Currently active test suite
 * @property {boolean} hasOnly - Whether any .only modifiers are present
 */

/** @type {TestContext} */
const testContext = {
    suites: [],
    currentSuite: null,
    hasOnly: false
};

/**
 * Creates a test suite
 * @param {string} name - The name of the test suite
 * @param {Function} fn - The function containing the tests
 */
function describe(name, fn) {
    const suite = {
        name,
        tests: [],
        suites: [],
        only: false,
        skip: false,
        hooks: {
            beforeAll: [],
            beforeEach: [],
            afterAll: [],
            afterEach: []
        }
    };

    const parentSuite = testContext.currentSuite;
    
    if (parentSuite) {
        parentSuite.suites.push(suite);
    } else {
        testContext.suites.push(suite);
    }

    testContext.currentSuite = suite;
    fn();
    testContext.currentSuite = parentSuite;
}

/**
 * Creates a test suite that should be the only one to run
 * @param {string} name - The name of the test suite
 * @param {Function} fn - The function containing the tests
 */
describe.only = function(name, fn) {
    testContext.hasOnly = true;
    const suite = {
        name,
        tests: [],
        suites: [],
        only: true,
        skip: false,
        hooks: {
            beforeAll: [],
            beforeEach: [],
            afterAll: [],
            afterEach: []
        }
    };

    const parentSuite = testContext.currentSuite;
    
    if (parentSuite) {
        parentSuite.suites.push(suite);
    } else {
        testContext.suites.push(suite);
    }

    testContext.currentSuite = suite;
    fn();
    testContext.currentSuite = parentSuite;
};

/**
 * Creates a test suite that should be skipped
 * @param {string} name - The name of the test suite
 * @param {Function} fn - The function containing the tests
 */
describe.skip = function(name, fn) {
    const suite = {
        name,
        tests: [],
        suites: [],
        only: false,
        skip: true,
        hooks: {
            beforeAll: [],
            beforeEach: [],
            afterAll: [],
            afterEach: []
        }
    };

    const parentSuite = testContext.currentSuite;
    
    if (parentSuite) {
        parentSuite.suites.push(suite);
    } else {
        testContext.suites.push(suite);
    }

    testContext.currentSuite = suite;
    fn();
    testContext.currentSuite = parentSuite;
};

/**
 * Creates a test suite that should skip if condition is true
 * @param {boolean} condition - Condition to check
 * @returns {Function} Describe function
 */
describe.skipIf = function(condition) {
    return function(name, fn) {
        if (condition) {
            return describe.skip(name, fn);
        } else {
            return describe(name, fn);
        }
    };
};

/**
 * Creates a test suite that should run only if condition is true
 * @param {boolean} condition - Condition to check
 * @returns {Function} Describe function
 */
describe.runIf = function(condition) {
    return function(name, fn) {
        if (!condition) {
            return describe.skip(name, fn);
        } else {
            return describe(name, fn);
        }
    };
};

/**
 * Creates a test suite that is a todo (not implemented yet)
 * @param {string} name - The name of the test suite
 * @param {Function} [fn] - Optional function containing the tests
 */
describe.todo = function(name, fn) {
    console.log(`📝 TODO: ${name}`);
    // Don't execute the suite, just log it
    if (fn) {
        // Create empty suite for structure
        describe.skip(name, () => {});
    }
};

/**
 * Creates parameterized test suites using each data set
 * @param {Array|Object} cases - Test cases data
 * @returns {Function} Describe function
 */
describe.each = function(cases) {
    return function(name, fn) {
        if (Array.isArray(cases)) {
            cases.forEach((testCase, index) => {
                const suiteName = typeof name === 'function' 
                    ? name(...(Array.isArray(testCase) ? testCase : [testCase]))
                    : name.replace(/%[sdio%]/g, (match) => {
                        if (Array.isArray(testCase)) {
                            const value = testCase.shift();
                            return String(value);
                        }
                        return String(testCase);
                    });
                
                describe(suiteName || `${name} [${index}]`, () => {
                    return Array.isArray(testCase) ? fn(...testCase) : fn(testCase);
                });
            });
        } else if (typeof cases === 'object') {
            Object.entries(cases).forEach(([key, value]) => {
                const suiteName = name.replace('%s', key);
                describe(suiteName, () => fn(value));
            });
        }
    };
};

/**
 * Creates parameterized test suites using for syntax
 * @param {Array} cases - Test cases data
 * @returns {Function} Describe function
 */
describe.for = function(cases) {
    return function(name, fn) {
        if (!Array.isArray(cases)) {
            throw new Error('describe.for expects an array of test cases');
        }
        
        cases.forEach((testCase, index) => {
            const suiteName = typeof name === 'function' 
                ? name(testCase)
                : name.replace(/%[sdio%]/g, () => String(testCase));
            
            describe(suiteName || `${name} [${index}]`, () => fn(testCase));
        });
    };
};

/**
 * Gets the current test context
 * @returns {TestContext}
 */
function getTestContext() {
    return testContext;
}

/**
 * Resets the test context
 */
function resetTestContext() {
    testContext.suites = [];
    testContext.currentSuite = null;
    testContext.hasOnly = false;
}

export { describe, getTestContext, resetTestContext };
