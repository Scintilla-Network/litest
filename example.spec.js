import { describe, it, expect } from './src/index.js';

describe('Example Test Suite', () => {
    describe('Basic Math Operations', () => {
        it('should add numbers correctly', () => {
            expect(2 + 2).toEqual(4);
            expect(10 + 5).toBe(15);
        });

        it('should handle multiplication', () => {
            expect(3 * 4).toEqual(12);
            expect(0 * 100).toBe(0);
        });

        it.skip('this test is skipped', () => {
            // This test will be skipped
            expect(false).toBe(true);
        });
    });

    describe('String Operations', () => {
        it('should concatenate strings', () => {
            expect('Hello' + ' ' + 'World').toEqual('Hello World');
        });

        it('should check string properties', () => {
            const str = 'JavaScript';
            expect(str.length).toBe(10);
            expect(str.toUpperCase()).toEqual('JAVASCRIPT');
        });
    });

    describe('Error Handling', () => {
        it('should throw errors when expected', () => {
            expect(() => {
                throw new Error('Something went wrong');
            }).toThrow('Something went wrong');
        });

        it('should handle functions that do not throw', () => {
            expect(() => {
                return 'success';
            }).not.toThrow();
        });
    });

    describe('Truthiness and Falsiness', () => {
        it('should check truthy values', () => {
            expect(1).toBeTruthy();
            expect('hello').toBeTruthy();
            expect(true).toBeTruthy();
            expect([]).toBeTruthy();
            expect({}).toBeTruthy();
        });

        it('should check falsy values', () => {
            expect(0).toBeFalsy();
            expect('').toBeFalsy();
            expect(false).toBeFalsy();
            expect(null).toBeFalsy();
            expect(undefined).toBeFalsy();
        });
    });
});

describe.skip('Skipped Test Suite', () => {
    it('should not run', () => {
        throw new Error('This should never execute');
    });
});
