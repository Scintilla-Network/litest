import { getTestContext } from './describe.js';

/**
 * @typedef {Object} Hook
 * @property {Function} fn - The hook function
 * @property {string} type - The type of hook (beforeAll, beforeEach, afterAll, afterEach)
 */

/**
 * Registers a hook to run before all tests in the current suite
 * @param {Function} fn - The function to run before all tests
 */
function beforeAll(fn) {
    const context = getTestContext();
    
    if (!context.currentSuite) {
        throw new Error('Lifecycle hooks must be defined within a describe block');
    }

    if (!context.currentSuite.hooks) {
        context.currentSuite.hooks = {
            beforeAll: [],
            beforeEach: [],
            afterAll: [],
            afterEach: []
        };
    }

    context.currentSuite.hooks.beforeAll.push(fn);
}

/**
 * Registers a hook to run before each test in the current suite
 * @param {Function} fn - The function to run before each test
 */
function beforeEach(fn) {
    const context = getTestContext();
    
    if (!context.currentSuite) {
        throw new Error('Lifecycle hooks must be defined within a describe block');
    }

    if (!context.currentSuite.hooks) {
        context.currentSuite.hooks = {
            beforeAll: [],
            beforeEach: [],
            afterAll: [],
            afterEach: []
        };
    }

    context.currentSuite.hooks.beforeEach.push(fn);
}

/**
 * Registers a hook to run after all tests in the current suite
 * @param {Function} fn - The function to run after all tests
 */
function afterAll(fn) {
    const context = getTestContext();
    
    if (!context.currentSuite) {
        throw new Error('Lifecycle hooks must be defined within a describe block');
    }

    if (!context.currentSuite.hooks) {
        context.currentSuite.hooks = {
            beforeAll: [],
            beforeEach: [],
            afterAll: [],
            afterEach: []
        };
    }

    context.currentSuite.hooks.afterAll.push(fn);
}

/**
 * Registers a hook to run after each test in the current suite
 * @param {Function} fn - The function to run after each test
 */
function afterEach(fn) {
    const context = getTestContext();
    
    if (!context.currentSuite) {
        throw new Error('Lifecycle hooks must be defined within a describe block');
    }

    if (!context.currentSuite.hooks) {
        context.currentSuite.hooks = {
            beforeAll: [],
            beforeEach: [],
            afterAll: [],
            afterEach: []
        };
    }

    context.currentSuite.hooks.afterEach.push(fn);
}

export { beforeAll, beforeEach, afterAll, afterEach };
