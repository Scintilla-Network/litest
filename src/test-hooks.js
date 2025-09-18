/**
 * Test execution hooks - onTestFinished, onTestFailed
 * These hooks run during test execution for cleanup and debugging
 */

/**
 * Global registry for test hooks
 */
const testHooksRegistry = {
    onTestFinished: new Map(),
    onTestFailed: new Map(),
    currentTestId: null
};

/**
 * Set the current test ID (used internally by the test runner)
 * @param {string} testId - Unique test identifier
 */
function setCurrentTestId(testId) {
    testHooksRegistry.currentTestId = testId;
    
    // Initialize hook arrays for this test if they don't exist
    if (!testHooksRegistry.onTestFinished.has(testId)) {
        testHooksRegistry.onTestFinished.set(testId, []);
    }
    if (!testHooksRegistry.onTestFailed.has(testId)) {
        testHooksRegistry.onTestFailed.set(testId, []);
    }
}

/**
 * Clear hooks for a specific test (cleanup)
 * @param {string} testId - Test identifier to clean up
 */
function clearTestHooks(testId) {
    testHooksRegistry.onTestFinished.delete(testId);
    testHooksRegistry.onTestFailed.delete(testId);
}

/**
 * Get the current test ID
 * @returns {string|null} Current test ID
 */
function getCurrentTestId() {
    return testHooksRegistry.currentTestId;
}

/**
 * Register a hook to run after the test finishes (success or failure)
 * @param {Function} fn - Function to run after test completion
 * @throws {Error} If called outside of a test
 */
function onTestFinished(fn) {
    const testId = getCurrentTestId();
    if (!testId) {
        throw new Error('onTestFinished can only be called during test execution');
    }
    
    const hooks = testHooksRegistry.onTestFinished.get(testId) || [];
    hooks.push(fn);
    testHooksRegistry.onTestFinished.set(testId, hooks);
}

/**
 * Register a hook to run only when the test fails
 * @param {Function} fn - Function to run on test failure
 * @throws {Error} If called outside of a test
 */
function onTestFailed(fn) {
    const testId = getCurrentTestId();
    if (!testId) {
        throw new Error('onTestFailed can only be called during test execution');
    }
    
    const hooks = testHooksRegistry.onTestFailed.get(testId) || [];
    hooks.push(fn);
    testHooksRegistry.onTestFailed.set(testId, hooks);
}

/**
 * Execute onTestFinished hooks for a test
 * @param {string} testId - Test identifier
 * @param {Object} testResult - Test result object
 */
async function executeOnTestFinishedHooks(testId, testResult) {
    const hooks = testHooksRegistry.onTestFinished.get(testId) || [];
    
    // Execute hooks in reverse order (LIFO - Last In, First Out)
    for (let i = hooks.length - 1; i >= 0; i--) {
        try {
            await hooks[i](testResult);
        } catch (error) {
            console.warn(`onTestFinished hook failed: ${error.message}`);
        }
    }
}

/**
 * Execute onTestFailed hooks for a test
 * @param {string} testId - Test identifier
 * @param {Object} testResult - Test result object
 */
async function executeOnTestFailedHooks(testId, testResult) {
    const hooks = testHooksRegistry.onTestFailed.get(testId) || [];
    
    // Execute hooks in reverse order (LIFO - Last In, First Out)
    for (let i = hooks.length - 1; i >= 0; i--) {
        try {
            await hooks[i](testResult);
        } catch (error) {
            console.warn(`onTestFailed hook failed: ${error.message}`);
        }
    }
}

/**
 * Get all registered hooks for a test (for debugging)
 * @param {string} testId - Test identifier
 * @returns {Object} Object with onTestFinished and onTestFailed arrays
 */
function getTestHooks(testId) {
    return {
        onTestFinished: testHooksRegistry.onTestFinished.get(testId) || [],
        onTestFailed: testHooksRegistry.onTestFailed.get(testId) || []
    };
}

/**
 * Reset all test hooks (used for cleanup between test runs)
 */
function resetTestHooks() {
    testHooksRegistry.onTestFinished.clear();
    testHooksRegistry.onTestFailed.clear();
    testHooksRegistry.currentTestId = null;
}

export {
    onTestFinished,
    onTestFailed,
    setCurrentTestId,
    clearTestHooks,
    getCurrentTestId,
    executeOnTestFinishedHooks,
    executeOnTestFailedHooks,
    getTestHooks,
    resetTestHooks
};
