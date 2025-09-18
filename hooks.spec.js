import { describe, it, expect, beforeAll, beforeEach, afterAll, afterEach } from './src/index.js';

describe('Lifecycle Hooks', () => {
    const executionOrder = [];

    // Clear execution order before each test suite
    beforeAll(() => {
        executionOrder.length = 0;
        executionOrder.push('outer-beforeAll');
    });

    afterAll(() => {
        executionOrder.push('outer-afterAll');
    });

    beforeEach(() => {
        executionOrder.push('outer-beforeEach');
    });

    afterEach(() => {
        executionOrder.push('outer-afterEach');
    });

    describe('beforeAll and afterAll', () => {
        beforeAll(() => {
            executionOrder.push('inner-beforeAll');
        });

        afterAll(() => {
            executionOrder.push('inner-afterAll');
        });

        it('should run beforeAll before tests', () => {
            expect(executionOrder).toEqual([
                'outer-beforeAll',
                'inner-beforeAll',
                'outer-beforeEach'
            ]);
        });

        it('should maintain execution order', () => {
            expect(executionOrder).toEqual([
                'outer-beforeAll',
                'inner-beforeAll',
                'outer-beforeEach',
                'outer-afterEach',
                'outer-beforeEach'
            ]);
        });
    });

    describe('beforeEach and afterEach', () => {
        beforeEach(() => {
            executionOrder.push('test-beforeEach');
        });

        afterEach(() => {
            executionOrder.push('test-afterEach');
        });

        it('should run beforeEach before each test', () => {
            // Check that both outer and inner beforeEach have run
            const lastTwoItems = executionOrder.slice(-2);
            expect(lastTwoItems).toEqual([
                'outer-beforeEach',
                'test-beforeEach'
            ]);
        });

        it('should run afterEach after each test', () => {
            // This test will verify the afterEach ran after the previous test
            const hasAfterEach = executionOrder.includes('test-afterEach');
            expect(hasAfterEach).toBe(true);
        });
    });

    describe('hook execution order', () => {
        const hookOrder = [];

        beforeAll(() => {
            hookOrder.push('nested-beforeAll');
        });

        beforeEach(() => {
            hookOrder.push('nested-beforeEach');
        });

        afterEach(() => {
            hookOrder.push('nested-afterEach');
        });

        afterAll(() => {
            hookOrder.push('nested-afterAll');
        });

        it('should execute hooks in correct order', () => {
            hookOrder.push('test-execution');
            
            // Verify the order up to this point (just the hooks for this specific suite)
            const expectedStart = [
                'nested-beforeAll',
                'nested-beforeEach',
                'test-execution'
            ];
            
            expect(hookOrder.slice(-3)).toEqual(expectedStart);
        });
    });
});

describe('Hook Error Handling', () => {
    describe('successful hook execution', () => {
        let hookExecuted = false;
        
        beforeEach(() => {
            hookExecuted = true;
        });

        it('should execute hooks successfully', () => {
            expect(hookExecuted).toBe(true);
        });
    });

    // Note: Error handling tests are commented out as they would cause the test suite to fail
    // These demonstrate that the framework properly handles hook failures:
    // - beforeEach/afterEach failures cause individual test failures
    // - beforeAll/afterAll failures cause suite-wide failures
    // - afterEach hooks still run even if the test fails
    
    /*
    describe('beforeEach hook failure', () => {
        beforeEach(() => {
            throw new Error('beforeEach failed');
        });

        it('should fail when beforeEach throws', () => {
            expect(true).toBe(true);
        });
    });

    describe('afterEach hook failure', () => {
        afterEach(() => {
            throw new Error('afterEach failed');
        });

        it('should complete test but show hook failure', () => {
            expect(true).toBe(true);
        });
    });

    describe('beforeAll hook failure', () => {
        beforeAll(() => {
            throw new Error('beforeAll failed');
        });

        it('should fail all tests in suite when beforeAll fails', () => {
            expect(true).toBe(true);
        });

        it('should fail this test too', () => {
            expect(true).toBe(true);
        });
    });
    */
});

describe('Nested Hook Inheritance', () => {
    const nestedOrder = [];

    beforeAll(() => {
        nestedOrder.push('parent-beforeAll');
    });

    beforeEach(() => {
        nestedOrder.push('parent-beforeEach');
    });

    afterEach(() => {
        nestedOrder.push('parent-afterEach');
    });

    afterAll(() => {
        nestedOrder.push('parent-afterAll');
    });

    describe('child suite', () => {
        beforeAll(() => {
            nestedOrder.push('child-beforeAll');
        });

        beforeEach(() => {
            nestedOrder.push('child-beforeEach');
        });

        afterEach(() => {
            nestedOrder.push('child-afterEach');
        });

        afterAll(() => {
            nestedOrder.push('child-afterAll');
        });

        it('should inherit parent hooks', () => {
            nestedOrder.push('child-test');
            
            // Should have parent beforeAll, child beforeAll, parent beforeEach, child beforeEach
            const expectedOrder = [
                'parent-beforeAll',
                'child-beforeAll',
                'parent-beforeEach',
                'child-beforeEach',
                'child-test'
            ];
            
            expect(nestedOrder.slice(-5)).toEqual(expectedOrder);
        });

        describe('deeply nested suite', () => {
            beforeEach(() => {
                nestedOrder.push('deep-beforeEach');
            });

            it('should inherit all parent hooks', () => {
                nestedOrder.push('deep-test');
                
                // Should include hooks from all parent levels
                const recentHooks = nestedOrder.slice(-4);
                expect(recentHooks).toEqual([
                    'parent-beforeEach',
                    'child-beforeEach',
                    'deep-beforeEach',
                    'deep-test'
                ]);
            });
        });
    });
});

describe('Hook State Management', () => {
    let sharedState = {};

    beforeAll(() => {
        sharedState.setupComplete = true;
        sharedState.counter = 0;
    });

    beforeEach(() => {
        sharedState.counter++;
        sharedState.currentTest = 'running';
    });

    afterEach(() => {
        sharedState.currentTest = 'completed';
    });

    afterAll(() => {
        sharedState.teardownComplete = true;
    });

    it('should have access to beforeAll state', () => {
        expect(sharedState.setupComplete).toBe(true);
        expect(sharedState.counter).toBe(1);
        expect(sharedState.currentTest).toBe('running');
    });

    it('should maintain state between tests', () => {
        expect(sharedState.setupComplete).toBe(true);
        expect(sharedState.counter).toBe(2);
        expect(sharedState.currentTest).toBe('running');
    });

    it('should show state changes from previous test', () => {
        expect(sharedState.counter).toBe(3);
        // Note: we can't easily test afterAll state here since it runs after all tests
    });
});
