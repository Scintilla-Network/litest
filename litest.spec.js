import { describe, it, expect } from './src/index.js';

describe('Litest Framework', () => {
    describe('expect function', () => {
        describe('toEqual matcher', () => {
            it('should pass when values are equal', () => {
                expect([0x12, 0x34]).toEqual([0x12, 0x34]);
                expect({ a: 1, b: 2 }).toEqual({ a: 1, b: 2 });
                expect('hello').toEqual('hello');
                expect(42).toEqual(42);
            });

            it('should fail when values are not equal', () => {
                expect(() => {
                    expect([1, 2]).toEqual([1, 3]);
                }).toThrow('Expected [1,2] to equal [1,3]');
            });

            it('should work with nested objects', () => {
                const obj1 = { 
                    user: { name: 'John', age: 30 }, 
                    items: [1, 2, 3] 
                };
                const obj2 = { 
                    user: { name: 'John', age: 30 }, 
                    items: [1, 2, 3] 
                };
                expect(obj1).toEqual(obj2);
            });
        });

        describe('toBe matcher', () => {
            it('should pass for strict equality', () => {
                expect(42).toBe(42);
                expect('hello').toBe('hello');
                expect(true).toBe(true);
            });

            it('should fail for non-strict equality', () => {
                expect(() => {
                    expect('42').toBe(42);
                }).toThrow('Expected "42" to be 42');
            });
        });

        describe('toBeTruthy matcher', () => {
            it('should pass for truthy values', () => {
                expect(1).toBeTruthy();
                expect('hello').toBeTruthy();
                expect(true).toBeTruthy();
                expect([]).toBeTruthy();
                expect({}).toBeTruthy();
            });

            it('should fail for falsy values', () => {
                expect(() => {
                    expect(0).toBeTruthy();
                }).toThrow('Expected 0 to be truthy');
            });
        });

        describe('toBeFalsy matcher', () => {
            it('should pass for falsy values', () => {
                expect(0).toBeFalsy();
                expect('').toBeFalsy();
                expect(false).toBeFalsy();
                expect(null).toBeFalsy();
                expect(undefined).toBeFalsy();
            });

            it('should fail for truthy values', () => {
                expect(() => {
                    expect(1).toBeFalsy();
                }).toThrow('Expected 1 to be falsy');
            });
        });

        describe('toThrow matcher', () => {
            it('should pass when function throws', () => {
                expect(() => {
                    throw new Error('Input must be valid');
                }).toThrow('Input must be');
            });

            it('should pass when function throws with exact message', () => {
                expect(() => {
                    throw new Error('Exact error message');
                }).toThrow('Exact error message');
            });

            it('should pass when function throws with regex pattern', () => {
                expect(() => {
                    throw new Error('Error: Invalid input provided');
                }).toThrow(/Invalid input/);
            });

            it('should fail when function does not throw', () => {
                expect(() => {
                    expect(() => {
                        return 'no error';
                    }).toThrow();
                }).toThrow('Expected function to throw an error, but it did not');
            });
        });

        describe('toBeNull matcher', () => {
            it('should pass for null values', () => {
                expect(null).toBeNull();
            });

            it('should fail for non-null values', () => {
                expect(() => {
                    expect(undefined).toBeNull();
                }).toThrow('Expected undefined to be null');
            });
        });

        describe('toBeUndefined matcher', () => {
            it('should pass for undefined values', () => {
                expect(undefined).toBeUndefined();
            });

            it('should fail for non-undefined values', () => {
                expect(() => {
                    expect(null).toBeUndefined();
                }).toThrow('Expected null to be undefined');
            });
        });

        describe('negation with .not', () => {
            it('should negate toEqual', () => {
                expect([1, 2]).not.toEqual([1, 3]);
                expect('hello').not.toEqual('world');
            });

            it('should negate toBe', () => {
                expect('42').not.toBe(42);
                expect(true).not.toBe(false);
            });

            it('should negate toBeTruthy', () => {
                expect(0).not.toBeTruthy();
                expect('').not.toBeTruthy();
            });

            it('should negate toBeFalsy', () => {
                expect(1).not.toBeFalsy();
                expect('hello').not.toBeFalsy();
            });

            it('should negate toBeNull', () => {
                expect(undefined).not.toBeNull();
                expect(0).not.toBeNull();
            });

            it('should negate toBeUndefined', () => {
                expect(null).not.toBeUndefined();
                expect(0).not.toBeUndefined();
            });
        });
    });

    describe('test structure', () => {
        describe('nested describe blocks', () => {
            it('should support multiple levels of nesting', () => {
                expect(true).toBe(true);
            });

            describe('deeply nested', () => {
                it('should work at any depth', () => {
                    expect('nested').toEqual('nested');
                });
            });
        });
    });

    describe('array and object comparisons', () => {
        it('should handle complex array comparisons', () => {
            const arr1 = [
                { id: 1, name: 'Alice' },
                { id: 2, name: 'Bob' },
                [1, 2, 3]
            ];
            const arr2 = [
                { id: 1, name: 'Alice' },
                { id: 2, name: 'Bob' },
                [1, 2, 3]
            ];
            expect(arr1).toEqual(arr2);
        });

        it('should handle empty arrays and objects', () => {
            expect([]).toEqual([]);
            expect({}).toEqual({});
        });
    });

    describe('edge cases', () => {
        it('should handle special number values', () => {
            expect(NaN).not.toEqual(NaN); // NaN !== NaN in JavaScript
            expect(Infinity).toEqual(Infinity);
            expect(-Infinity).toEqual(-Infinity);
        });

        it('should handle date objects', () => {
            const date1 = new Date('2023-01-01');
            const date2 = new Date('2023-01-01');
            expect(date1).toEqual(date2);
        });
    });
});

// Test skipping functionality
describe.skip('Skipped test suite', () => {
    it('should not run this test', () => {
        throw new Error('This should not execute');
    });
});

// Individual skipped test
describe('Individual test skipping', () => {
    it.skip('should skip this individual test', () => {
        throw new Error('This should not execute');
    });

    it('should run this test normally', () => {
        expect(true).toBe(true);
    });
});
