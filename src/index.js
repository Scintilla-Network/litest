/**
 * Litest - A professional test framework inspired by Vitest
 * 
 * Provides a complete testing solution with:
 * - Familiar describe/it/expect API
 * - Lifecycle hooks (beforeAll, beforeEach, afterAll, afterEach)
 * - Configurable timeouts
 * - Beautiful colorized output
 * - Glob pattern matching
 * - Professional error reporting
 * 
 * @example Basic Usage
 * ```javascript
 * import { describe, it, expect, beforeAll, setTestTimeout } from 'litest';
 * 
 * describe('My Test Suite', () => {
 *   beforeAll(() => {
 *     // Setup before all tests
 *   });
 *   
 *   setTestTimeout(10000); // 10 second timeout
 *   
 *   it('should work correctly', () => {
 *     expect(2 + 2).toEqual(4);
 *   });
 *   
 *   it('should handle async operations', async () => {
 *     const result = await someAsyncFunction();
 *     expect(result).toBeTruthy();
 *   });
 * });
 * ```
 * 
 * @version 1.0.0
 * @author Alex Werner
 * @license MIT
 */

import { describe } from './describe.js';
import { it } from './it.js';
import { expect } from './expect.js';
import { beforeAll, beforeEach, afterAll, afterEach } from './hooks.js';
import { setTestTimeout } from './timeout.js';
import { onTestFinished, onTestFailed } from './test-hooks.js';

// Create test alias for it
const test = it;

// Add all modifiers to test as well
test.skip = it.skip;
test.only = it.only;
test.todo = it.todo;
test.fails = it.fails;
test.concurrent = it.concurrent;
test.skipIf = it.skipIf;
test.runIf = it.runIf;
test.each = it.each;
test.for = it.for;

// Create suite alias for describe
const suite = describe;

// Add all modifiers to suite as well
suite.skip = describe.skip;
suite.only = describe.only;
suite.todo = describe.todo;
suite.skipIf = describe.skipIf;
suite.runIf = describe.runIf;
suite.each = describe.each;
suite.for = describe.for;

export { 
    // Main API
    describe,
    it,
    test,
    suite,
    expect,
    
    // Lifecycle hooks
    beforeAll,
    beforeEach,
    afterAll,
    afterEach,
    
    // Test hooks
    onTestFinished,
    onTestFailed,
    
    // Configuration
    setTestTimeout
};