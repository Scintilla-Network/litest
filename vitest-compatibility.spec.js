import { 
    describe, 
    it, 
    test, 
    suite,
    expect, 
    beforeAll, 
    beforeEach, 
    afterAll, 
    afterEach,
    onTestFinished,
    onTestFailed,
    setTestTimeout
} from './src/index.js';

describe('Vitest Compatibility Features', () => {
    beforeAll(() => {
        console.log('🚀 Starting Vitest compatibility tests');
    });

    afterAll(() => {
        console.log('✅ Vitest compatibility tests completed');
    });

    describe('Test Modifiers', () => {
        it('should support basic test', () => {
            expect(true).toBe(true);
        });

        test('should support test alias', () => {
            expect('test alias').toEqual('test alias');
        });

        it.todo('should support todo tests');

        it.skip('should support skipped tests', () => {
            throw new Error('This should not run');
        });

        // Conditional tests based on environment
        const isCI = process.env.CI === 'true';
        
        it.skipIf(isCI)('should skip in CI environment', () => {
            expect('local only').toBeTruthy();
        });

        it.runIf(!isCI)('should run in local environment', () => {
            expect('not in CI').toBeTruthy();
        });
    });

    describe('Parameterized Tests', () => {
        // Test with array of arrays
        it.each([
            [1, 2, 3],
            [2, 3, 5],
            [3, 4, 7]
        ])('should add %i + %i = %i', (a, b, expected) => {
            expect(a + b).toBe(expected);
        });

        // Test with array of objects (using it.for)
        it.for([
            { input: 'hello', expected: 5 },
            { input: 'world', expected: 5 },
            { input: 'test', expected: 4 }
        ])('should calculate length of $input', ({ input, expected }) => {
            expect(input.length).toBe(expected);
        });
    });

    describe('Enhanced Expect Matchers', () => {
        it('should support string matching', () => {
            expect('hello world').toMatch(/world/);
            expect('hello world').toMatch('world');
            expect('hello world').not.toMatch('goodbye');
        });

        it('should support array/string contains', () => {
            expect([1, 2, 3]).toContain(2);
            expect('hello world').toContain('world');
            expect([1, 2, 3]).not.toContain(4);
        });

        it('should support property checking', () => {
            const obj = { 
                user: { 
                    name: 'John', 
                    age: 30,
                    profile: { active: true }
                }
            };
            
            expect(obj).toHaveProperty('user.name', 'John');
            expect(obj).toHaveProperty('user.profile.active', true);
            expect(obj).toHaveProperty(['user', 'age'], 30);
        });

        it('should support length checking', () => {
            expect([1, 2, 3]).toHaveLength(3);
            expect('hello').toHaveLength(5);
            expect([]).toHaveLength(0);
        });

        it('should support numeric comparisons', () => {
            expect(10).toBeGreaterThan(5);
            expect(10).toBeGreaterThanOrEqual(10);
            expect(5).toBeLessThan(10);
            expect(5).toBeLessThanOrEqual(5);
            expect(0.1 + 0.2).toBeCloseTo(0.3, 1);
        });
    });

    describe('Test Hooks', () => {
        it('should support onTestFinished hook', () => {
            let cleanupCalled = false;
            
            onTestFinished(() => {
                cleanupCalled = true;
            });
            
            expect(true).toBe(true);
            // Note: cleanup will be called after this test completes
        });

        it('should support onTestFailed hook', () => {
            onTestFailed((result) => {
                console.log('This test failed:', result.name);
            });
            
            expect(true).toBe(true); // This won't trigger onTestFailed
        });
    });

    describe('Test Configuration', () => {
        // Test with custom timeout
        it('should support custom timeout', { timeout: 1000 }, async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
            expect(true).toBe(true);
        });

        // Test with retry
        it('should support retry', { retry: 2 }, () => {
            // This test will pass on first try
            expect(Math.random()).toBeGreaterThan(0);
        });

        it('should support multiple options', { timeout: 2000, retry: 1 }, () => {
            expect('configured test').toBeTruthy();
        });
    });

    describe('Suite Modifiers', () => {
        describe.each([
            { framework: 'litest', version: '1.0.0' },
            { framework: 'vitest', version: '3.x' }
        ])('Framework: $framework', ({ framework, version }) => {
            it(`should work with ${framework} v${version}`, () => {
                expect(framework).toBeTruthy();
                expect(version).toBeTruthy();
            });
        });

        describe.todo('Future feature suite');

        describe.skip('Skipped suite', () => {
            it('should not run', () => {
                throw new Error('This should not execute');
            });
        });
    });

    describe('Complex Scenarios', () => {
        let database;
        
        beforeAll(async () => {
            // Simulate database setup
            database = { users: [], connected: true };
        });

        beforeEach(() => {
            database.users = []; // Clear users before each test
        });

        afterEach(() => {
            // Cleanup after each test
        });

        afterAll(() => {
            database.connected = false;
        });

        it('should handle async database operations', async () => {
            // Simulate async database operation
            await new Promise(resolve => setTimeout(resolve, 10));
            
            database.users.push({ id: 1, name: 'John' });
            
            expect(database.users).toHaveLength(1);
            expect(database.users[0]).toHaveProperty('name', 'John');
        });

        it('should validate complex objects', () => {
            const user = {
                id: 1,
                name: 'Jane',
                email: 'jane@example.com',
                profile: {
                    age: 25,
                    preferences: {
                        theme: 'dark',
                        notifications: true
                    }
                },
                tags: ['admin', 'verified']
            };

            expect(user).toHaveProperty('profile.preferences.theme', 'dark');
            expect(user.tags).toContain('admin');
            expect(user.profile.age).toBeGreaterThan(18);
            expect(user.email).toMatch(/@/);
        });
    });
});

// Demonstrate suite alias
suite('Suite Alias Demo', () => {
    test('should work with suite alias', () => {
        expect('suite alias works').toBeTruthy();
    });
});

// Test timeout configuration
describe('Timeout Configuration', () => {
    setTestTimeout(2000); // 2 second timeout for this suite
    
    it('should respect suite timeout', async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        expect(true).toBe(true);
    });
});
