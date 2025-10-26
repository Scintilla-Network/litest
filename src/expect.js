import { stringify } from './stringify.js';
/**
 * @typedef {Object} Expectation
 * @property {*} actual - The actual value being tested
 * @property {boolean} not - Whether the expectation should be negated
 */

/**
 * Creates an expectation for a value
 * @param {*} actual - The actual value to test
 * @param {boolean} isNegated - Whether the expectation is negated
 * @returns {Expectation}
 */
function expect(actual, isNegated = false) {
    const expectation = {
        actual,
        not: isNegated,

        /**
         * Negates the expectation
         * @returns {Expectation}
         */
        get not() {
            return expect(this.actual, true);
        },

        /**
         * Chai-style syntax support
         * @returns {Object} Object with chai-style matchers
         */
        get to() {
            const self = this;
            return {
                // Equality matchers
                equal(expected) {
                    return self.toEqual(expected);
                },
                
                // Simple be matcher (for backwards compatibility) with extended properties
                get be() {
                    const beFunction = (expected) => self.toBe(expected);
                    
                    // Add properties to the function
                    beFunction.greaterThan = (expected) => self.toBeGreaterThan(expected);
                    beFunction.greaterThanOrEqual = (expected) => self.toBeGreaterThanOrEqual(expected);
                    beFunction.lessThan = (expected) => self.toBeLessThan(expected);
                    beFunction.lessThanOrEqual = (expected) => self.toBeLessThanOrEqual(expected);
                    beFunction.closeTo = (expected, precision) => self.toBeCloseTo(expected, precision);
                    beFunction.instanceOf = (expected) => self.toBeInstanceOf(expected);
                    // Define getters for immediate execution
                    Object.defineProperty(beFunction, 'truthy', {
                        get: () => self.toBeTruthy()
                    });
                    Object.defineProperty(beFunction, 'falsy', {
                        get: () => self.toBeFalsy()
                    });
                    Object.defineProperty(beFunction, 'null', {
                        get: () => self.toBeNull()
                    });
                    Object.defineProperty(beFunction, 'undefined', {
                        get: () => self.toBeUndefined()
                    });
                    Object.defineProperty(beFunction, 'defined', {
                        get: () => self.toBeDefined()
                    });
                    
                    return beFunction;
                },
                
                // Deep equality support
                get deep() {
                    return {
                        equal(expected) {
                            return self.toEqual(expected);
                        }
                    };
                },
                
                // Truthiness matchers
                get truthy() {
                    return self.toBeTruthy();
                },
                get falsy() {
                    return self.toBeFalsy();
                },
                
                // Null/undefined matchers
                get null() {
                    return self.toBeNull();
                },
                get undefined() {
                    return self.toBeUndefined();
                },
                get defined() {
                    return self.toBeDefined();
                },
                
                // Function matchers
                throw(expectedMessage) {
                    return self.toThrow(expectedMessage);
                },
                
                // String matchers
                match(expected) {
                    return self.toMatch(expected);
                },
                
                // Array/object matchers
                contain(expected) {
                    return self.toContain(expected);
                },
                
                // Instance matchers
                get instanceOf() {
                    return (expected) => self.toBeInstanceOf(expected);
                },
                
                // Property matchers
                have: {
                    property(property, value) {
                        return self.toHaveProperty(property, value);
                    },
                    length(expected) {
                        return self.toHaveLength(expected);
                    }
                }
            };
        },

        /**
         * Checks if the actual value equals the expected value
         * @param {*} expected - The expected value
         */
        toEqual(expected) {
            const isEqual = deepEqual(this.actual, expected);
            const shouldPass = isNegated ? !isEqual : isEqual;
            
            if (!shouldPass) {
                const message = isNegated 
                    ? `Expected ${stringify(this.actual)} not to equal ${stringify(expected)}`
                    : `Expected ${stringify(this.actual)} to equal ${stringify(expected)}`;
                throw new Error(message);
            }
        },

        /**
         * Checks if the actual value is strictly equal to the expected value
         * @param {*} expected - The expected value
         */
        toBe(expected) {
            const isEqual = this.actual === expected;
            const shouldPass = isNegated ? !isEqual : isEqual;
            
            if (!shouldPass) {
                const message = isNegated 
                    ? `Expected ${stringify(this.actual)} not to be ${stringify(expected)}`
                    : `Expected ${stringify(this.actual)} to be ${stringify(expected)}`;
                throw new Error(message);
            }
        },

        /**
         * Checks if the actual value is truthy
         */
        toBeTruthy() {
            const isTruthy = !!this.actual;
            const shouldPass = isNegated ? !isTruthy : isTruthy;
            
            if (!shouldPass) {
                const message = isNegated 
                    ? `Expected ${stringify(this.actual)} not to be truthy`
                    : `Expected ${stringify(this.actual)} to be truthy`;
                throw new Error(message);
            }
        },

        /**
         * Checks if the actual value is falsy
         */
        toBeFalsy() {
            const isFalsy = !this.actual;
            const shouldPass = isNegated ? !isFalsy : isFalsy;
            
            if (!shouldPass) {
                const message = isNegated 
                    ? `Expected ${stringify(this.actual)} not to be falsy`
                    : `Expected ${stringify(this.actual)} to be falsy`;
                throw new Error(message);
            }
        },

        /**
         * Checks if the actual function throws an error
         * @param {string|RegExp} [expectedMessage] - The expected error message or pattern
         */
        toThrow(expectedMessage) {
            if (typeof this.actual !== 'function') {
                throw new Error('Expected value must be a function when using toThrow');
            }

            let threwError = false;
            let actualError = null;

            try {
                this.actual();
            } catch (error) {
                threwError = true;
                actualError = error;
            }

            const shouldThrow = !isNegated;
            
            if (shouldThrow && !threwError) {
                throw new Error('Expected function to throw an error, but it did not');
            }
            
            if (!shouldThrow && threwError) {
                throw new Error(`Expected function not to throw an error, but it threw: ${actualError.message}`);
            }

            if (shouldThrow && threwError && expectedMessage) {
                const actualMessage = actualError.message;
                let messageMatches = false;

                if (typeof expectedMessage === 'string') {
                    messageMatches = actualMessage.includes(expectedMessage);
                } else if (expectedMessage instanceof RegExp) {
                    messageMatches = expectedMessage.test(actualMessage);
                }

                if (!messageMatches) {
                    throw new Error(`Expected error message to match ${expectedMessage}, but got: ${actualMessage}`);
                }
            }
        },

        /**
         * Checks if the actual value is null
         */
        toBeNull() {
            const isNull = this.actual === null;
            const shouldPass = isNegated ? !isNull : isNull;
            
            if (!shouldPass) {
                const message = isNegated 
                    ? `Expected ${stringify(this.actual)} not to be null`
                    : `Expected ${stringify(this.actual)} to be null`;
                throw new Error(message);
            }
        },

        /**
         * Checks if the actual value is undefined
         */
        toBeUndefined() {
            const isUndefined = this.actual === undefined;
            const shouldPass = isNegated ? !isUndefined : isUndefined;
            
            if (!shouldPass) {
                const message = isNegated 
                    ? `Expected ${stringify(this.actual)} not to be undefined`
                    : `Expected ${stringify(this.actual)} to be undefined`;
                throw new Error(message);
            }
        },

        /**
         * Checks if the actual value is defined (not undefined)
         */
        toBeDefined() {
            const isDefined = this.actual !== undefined;
            const shouldPass = isNegated ? !isDefined : isDefined;
            
            if (!shouldPass) {
                const message = isNegated 
                    ? `Expected ${stringify(this.actual)} not to be defined`
                    : `Expected ${stringify(this.actual)} to be defined`;
                throw new Error(message);
            }
        },

        /**
         * Checks if the actual value matches a regular expression or string
         * @param {RegExp|string} expected - The pattern to match
         */
        toMatch(expected) {
            if (typeof this.actual !== 'string') {
                throw new Error('toMatch requires a string value');
            }
            
            let matches = false;
            if (expected instanceof RegExp) {
                matches = expected.test(this.actual);
            } else if (typeof expected === 'string') {
                matches = this.actual.includes(expected);
            } else {
                throw new Error('toMatch requires a RegExp or string pattern');
            }
            
            const shouldPass = isNegated ? !matches : matches;
            
            if (!shouldPass) {
                const message = isNegated 
                    ? `Expected "${this.actual}" not to match ${expected}`
                    : `Expected "${this.actual}" to match ${expected}`;
                throw new Error(message);
            }
        },

        /**
         * Checks if the actual array/string contains the expected value
         * @param {*} expected - The value to look for
         */
        toContain(expected) {
            let contains = false;
            
            if (typeof this.actual === 'string') {
                contains = this.actual.includes(expected);
            } else if (Array.isArray(this.actual)) {
                contains = this.actual.includes(expected);
            } else {
                throw new Error('toContain requires an array or string');
            }
            
            const shouldPass = isNegated ? !contains : contains;
            
            if (!shouldPass) {
                const message = isNegated 
                    ? `Expected ${stringify(this.actual)} not to contain ${stringify(expected)}`
                    : `Expected ${stringify(this.actual)} to contain ${stringify(expected)}`;
                throw new Error(message);
            }
        },

        /**
         * Checks if the actual object has the specified property
         * @param {string|string[]} property - Property path (can be nested with dots or array)
         * @param {*} [value] - Expected value of the property
         */
        toHaveProperty(property, value) {
            if (this.actual === null || this.actual === undefined) {
                throw new Error('toHaveProperty cannot be used on null or undefined');
            }
            
            const propertyPath = Array.isArray(property) ? property : property.split('.');
            let current = this.actual;
            let hasProperty = true;
            
            for (const key of propertyPath) {
                if (current === null || current === undefined || !(key in current)) {
                    hasProperty = false;
                    break;
                }
                current = current[key];
            }
            
            // Check if we should also validate the value
            if (hasProperty && value !== undefined) {
                hasProperty = deepEqual(current, value);
            }
            
            const shouldPass = isNegated ? !hasProperty : hasProperty;
            
            if (!shouldPass) {
                const propertyStr = Array.isArray(property) ? property.join('.') : property;
                let message;
                
                if (value !== undefined) {
                    message = isNegated 
                        ? `Expected object not to have property "${propertyStr}" with value ${stringify(value)}`
                        : `Expected object to have property "${propertyStr}" with value ${stringify(value)}`;
                } else {
                    message = isNegated 
                        ? `Expected object not to have property "${propertyStr}"`
                        : `Expected object to have property "${propertyStr}"`;
                }
                
                throw new Error(message);
            }
        },

        /**
         * Checks if the actual array has the expected length
         * @param {number} expected - Expected length
         */
        toHaveLength(expected) {
            if (typeof expected !== 'number') {
                throw new Error('toHaveLength requires a number');
            }
            
            let actualLength;
            if (Array.isArray(this.actual) || typeof this.actual === 'string') {
                actualLength = this.actual.length;
            } else if (this.actual && typeof this.actual.length === 'number') {
                actualLength = this.actual.length;
            } else {
                throw new Error('toHaveLength requires an array, string, or object with length property');
            }
            
            const hasCorrectLength = actualLength === expected;
            const shouldPass = isNegated ? !hasCorrectLength : hasCorrectLength;
            
            if (!shouldPass) {
                const message = isNegated 
                    ? `Expected length not to be ${expected}, but got ${actualLength}`
                    : `Expected length to be ${expected}, but got ${actualLength}`;
                throw new Error(message);
            }
        },

        /**
         * Checks if the actual number is greater than expected
         * @param {number} expected - The number to compare against
         */
        toBeGreaterThan(expected) {
            if (typeof this.actual !== 'number' || typeof expected !== 'number') {
                throw new Error('toBeGreaterThan requires numbers');
            }
            
            const isGreater = this.actual > expected;
            const shouldPass = isNegated ? !isGreater : isGreater;
            
            if (!shouldPass) {
                const message = isNegated 
                    ? `Expected ${this.actual} not to be greater than ${expected}`
                    : `Expected ${this.actual} to be greater than ${expected}`;
                throw new Error(message);
            }
        },

        /**
         * Checks if the actual number is greater than or equal to expected
         * @param {number} expected - The number to compare against
         */
        toBeGreaterThanOrEqual(expected) {
            if (typeof this.actual !== 'number' || typeof expected !== 'number') {
                throw new Error('toBeGreaterThanOrEqual requires numbers');
            }
            
            const isGreaterOrEqual = this.actual >= expected;
            const shouldPass = isNegated ? !isGreaterOrEqual : isGreaterOrEqual;
            
            if (!shouldPass) {
                const message = isNegated 
                    ? `Expected ${this.actual} not to be greater than or equal to ${expected}`
                    : `Expected ${this.actual} to be greater than or equal to ${expected}`;
                throw new Error(message);
            }
        },

        /**
         * Checks if the actual number is less than expected
         * @param {number} expected - The number to compare against
         */
        toBeLessThan(expected) {
            if (typeof this.actual !== 'number' || typeof expected !== 'number') {
                throw new Error('toBeLessThan requires numbers');
            }
            
            const isLess = this.actual < expected;
            const shouldPass = isNegated ? !isLess : isLess;
            
            if (!shouldPass) {
                const message = isNegated 
                    ? `Expected ${this.actual} not to be less than ${expected}`
                    : `Expected ${this.actual} to be less than ${expected}`;
                throw new Error(message);
            }
        },

        /**
         * Checks if the actual number is less than or equal to expected
         * @param {number} expected - The number to compare against
         */
        toBeLessThanOrEqual(expected) {
            if (typeof this.actual !== 'number' || typeof expected !== 'number') {
                throw new Error('toBeLessThanOrEqual requires numbers');
            }
            
            const isLessOrEqual = this.actual <= expected;
            const shouldPass = isNegated ? !isLessOrEqual : isLessOrEqual;
            
            if (!shouldPass) {
                const message = isNegated 
                    ? `Expected ${this.actual} not to be less than or equal to ${expected}`
                    : `Expected ${this.actual} to be less than or equal to ${expected}`;
                throw new Error(message);
            }
        },

        /**
         * Checks if the actual number is close to expected within precision
         * @param {number} expected - The expected number
         * @param {number} [precision=2] - Number of decimal places to check
         */
        toBeCloseTo(expected, precision = 2) {
            if (typeof this.actual !== 'number' || typeof expected !== 'number') {
                throw new Error('toBeCloseTo requires numbers');
            }
            
            const multiplier = Math.pow(10, precision);
            const actualRounded = Math.round(this.actual * multiplier) / multiplier;
            const expectedRounded = Math.round(expected * multiplier) / multiplier;
            
            const isClose = actualRounded === expectedRounded;
            const shouldPass = isNegated ? !isClose : isClose;
            
            if (!shouldPass) {
                const message = isNegated 
                    ? `Expected ${this.actual} not to be close to ${expected} (precision: ${precision})`
                    : `Expected ${this.actual} to be close to ${expected} (precision: ${precision})`;
                throw new Error(message);
            }
        },

        /**
         * Checks if the actual value is an instance of the expected constructor
         * @param {Function} expected - The expected constructor/class
         */
        toBeInstanceOf(expected) {
            if (typeof expected !== 'function') {
                throw new Error('toBeInstanceOf requires a constructor function');
            }
            
            let isInstance = this.actual instanceof expected;
            
            // Handle primitive types that need special checking
            if (!isInstance) {
                if (expected === String && typeof this.actual === 'string') {
                    isInstance = true;
                } else if (expected === Number && typeof this.actual === 'number') {
                    isInstance = true;
                } else if (expected === Boolean && typeof this.actual === 'boolean') {
                    isInstance = true;
                }
            }
            
            const shouldPass = isNegated ? !isInstance : isInstance;
            
            if (!shouldPass) {
                const actualType = this.actual?.constructor?.name || typeof this.actual;
                const expectedType = expected.name || 'Unknown';
                const message = isNegated 
                    ? `Expected ${actualType} not to be an instance of ${expectedType}`
                    : `Expected ${actualType} to be an instance of ${expectedType}`;
                throw new Error(message);
            }
        }
    };

    return expectation;
}

/**
 * Deep equality check for objects and arrays
 * @param {*} a - First value
 * @param {*} b - Second value
 * @returns {boolean}
 */
function deepEqual(a, b) {
    if (a === b) return true;
    
    if (a == null || b == null) return false;
    
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (!deepEqual(a[i], b[i])) return false;
        }
        return true;
    }
    
    if (typeof a === 'object' && typeof b === 'object') {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        
        if (keysA.length !== keysB.length) return false;
        
        for (const key of keysA) {
            if (!keysB.includes(key)) return false;
            if (!deepEqual(a[key], b[key])) return false;
        }
        return true;
    }
    
    return false;
}

export { expect };
