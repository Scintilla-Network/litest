/**
 * Test timeout utilities
 */

/**
 * Default timeout for tests in milliseconds
 */
const DEFAULT_TIMEOUT = 5000; // 5 seconds

/**
 * Global timeout configuration
 */
let globalTimeout = DEFAULT_TIMEOUT;

/**
 * Set the global timeout for all tests
 * @param {number} timeout - Timeout in milliseconds
 */
function setTestTimeout(timeout) {
    if (typeof timeout !== 'number' || timeout <= 0) {
        throw new Error('Timeout must be a positive number');
    }
    globalTimeout = timeout;
}

/**
 * Get the current global timeout
 * @returns {number} Current timeout in milliseconds
 */
function getTestTimeout() {
    return globalTimeout;
}

/**
 * Reset timeout to default
 */
function resetTestTimeout() {
    globalTimeout = DEFAULT_TIMEOUT;
}

/**
 * Run a function with a timeout
 * @param {Function} fn - The function to run
 * @param {number} [timeout] - Timeout in milliseconds (uses global if not provided)
 * @returns {Promise} Promise that resolves/rejects based on function or timeout
 */
function withTimeout(fn, timeout = globalTimeout) {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error(`Test timed out after ${timeout}ms`));
        }, timeout);

        Promise.resolve()
            .then(() => fn())
            .then(result => {
                clearTimeout(timeoutId);
                resolve(result);
            })
            .catch(error => {
                clearTimeout(timeoutId);
                reject(error);
            });
    });
}

export { 
    DEFAULT_TIMEOUT,
    setTestTimeout, 
    getTestTimeout, 
    resetTestTimeout, 
    withTimeout 
};
