# Litest

A dependency-free test framework that provides full Vitest API compatibility.  
Designed as a secure replacement for Vitest to reduce risk of supply chain attacks while maintaining as much feature parity as possible for common use cases.

## Why use Litest?

Litest is born upon the realisation that most of the dependencies in Scintilla Network's node_modules were from vitest - this including some ^ dependencies for even stuff like coloring in the terminal seems highly excessive.
Hence, Litest was born.

## Features

### Core Testing API
- ✅ **Familiar API** - Similar `describe`, `it`, `test`, `suite`, `expect` compatibility
- ✅ **Nested test suites** - Support for deeply nested describe blocks
- ✅ **Expect matchers** - 15+ expectation matchers including `toEqual`, `toBe`, `toMatch`, `toContain`, `toHaveProperty`, etc.
- ✅ **Test aliases** - Support for `test` (alias for `it`) and `suite` (alias for `describe`)

### Test Modifiers & Control Flow
- ✅ **Basic modifiers** - `.only`, `.skip`, `.todo`, `.fails`
- ✅ **Conditional tests** - `.skipIf()`, `.runIf()` for environment-based testing
- ✅ **Parameterized testing** - `.each()` and `.for()` for data-driven tests
- ✅ **Test configuration** - Custom timeout, retry, and concurrent options

### Lifecycle & Hooks
- ✅ **Lifecycle hooks** - `beforeAll`, `beforeEach`, `afterAll`, `afterEach`
- ✅ **Test hooks** - `onTestFinished`, `onTestFailed` for cleanup and debugging
- ✅ **Hook inheritance** - hook execution across nested suites

### Miscellaneous Features
- ✅ **Error handling** - Professional error reporting with stack traces
- ✅ **File execution** - Run individual spec files, directories, or glob patterns
- ✅ **Zero dependencies** - Pure JavaScript implementation with built-in utilities, no external dependencies, ES Modules support


Note: Some features are not implemented yet, ultra early stage of development. Feel free to contribute. Please open an issue if you find a bug or have a feature request.

## Installation

```bash
npm install --save-dev @scintilla-network/litest
```

Or for global installation (I would not recommend this):

```bash
npm install -g @scintilla-network/litest
```

## Usage

### Basic Test Structure

```javascript
import { describe, it, expect, beforeAll, beforeEach, afterAll, afterEach } from '@scintilla-network/litest';

describe('My Test Suite', () => {
    beforeAll(() => {
        // Setup before all tests in this suite
        console.log('Setting up test suite');
    });

    beforeEach(() => {
        // Setup before each test
        console.log('Setting up individual test');
    });

    afterEach(() => {
        // Cleanup after each test
        console.log('Cleaning up after test');
    });

    afterAll(() => {
        // Cleanup after all tests in this suite
        console.log('Tearing down test suite');
    });

    describe('nested functionality', () => {
        it('should work correctly', () => {
            expect(2 + 2).toEqual(4);
        });

        it('should handle edge cases', () => {
            expect(() => {
                throw new Error('Input must be valid');
            }).toThrow('Input must be');
        });
    });
});
```

### Advanced Test Features

#### Test Modifiers and Configuration

```javascript
import { describe, it, test, expect } from '@scintilla-network/litest';

describe('Advanced Features', () => {
    // Test aliases
    test('using test alias', () => {
        expect('test alias').toEqual('test alias');
    });
    
    // Test modifiers
    it.todo('implement this feature later'); // Marks test as todo
    
    it.fails('this test is expected to fail', () => {
        throw new Error('Expected failure');
    });
    
    // Conditional testing
    const isCI = process.env.CI === 'true';
    it.skipIf(isCI)('skip in CI environment', () => {
        // Only runs locally
    });
    
    it.runIf(!isCI)('run only locally', () => {
        // Only runs when not in CI
    });
    
    // Test configuration with options
    it('custom timeout', { timeout: 5000 }, async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
    });
    
    it('with retry', { retry: 3 }, () => {
        // Will retry up to 3 times if it fails
        expect(Math.random()).toBeGreaterThan(0.1);
    });
    
    // Multiple options
    it('full configuration', { timeout: 10000, retry: 2 }, async () => {
        await someAsyncOperation();
    });
});
```

#### Parameterized Testing

```javascript
describe('Parameterized Tests', () => {
    // Using it.each with arrays
    it.each([
        [1, 2, 3],
        [2, 3, 5], 
        [3, 4, 7]
    ])('should add %i + %i = %i', (a, b, expected) => {
        expect(a + b).toBe(expected);
    });
    
    // Using it.for
    it.for([
        { input: 'hello', expected: 5 },
        { input: 'world', expected: 5 }
    ])('should calculate length of $input', ({ input, expected }) => {
        expect(input.length).toBe(expected);
    });

describe.each([
        { framework: 'litest', version: '1.0.0' },
        { framework: 'vitest', version: '3.x' }
    ])('Framework: $framework', ({ framework, version }) => {
        it(`should work with ${framework} v${version}`, () => {
            expect(framework).toBeTruthy();
            expect(version).toBeTruthy();
        });
    });
});
```

#### Test Hooks for Cleanup


```javascript
import { onTestFinished, onTestFailed } from '@scintilla-network/litest';

describe('Test Hooks', () => {
    it('should cleanup resources', () => {
        const resource = createResource();
        
        // Always runs after test completion
        onTestFinished(() => {
            resource.cleanup();
        });
        
        // Only runs if test fails
        onTestFailed((result) => {
            console.log('Test failed:', result.name);
            debugResource(resource);
        });
        
        expect(resource.isActive).toBe(true);
    });
});
```

#### Expect Matchers

```javascript
describe('Matchers', () => {
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
                profile: { active: true }
            }
        };
        
        expect(obj).toHaveProperty('user.name', 'John');
        expect(obj).toHaveProperty('user.profile.active', true);
        expect(obj).toHaveProperty(['user', 'name'], 'John');
    });

    it('should support numeric comparisons', () => {
        expect(10).toBeGreaterThan(5);
        expect(10).toBeGreaterThanOrEqual(10);
        expect(5).toBeLessThan(10);
        expect(5).toBeLessThanOrEqual(5);
        expect(0.1 + 0.2).toBeCloseTo(0.3, 1);
    });

    it('should support length checking', () => {
        expect([1, 2, 3]).toHaveLength(3);
        expect('hello').toHaveLength(5);
        expect([]).toHaveLength(0);
    });
});
```

### Running Tests

Create test files with `.spec.js` extension and run:

```bash
# Run all tests in current directory
npm test

# Run specific test file
npm test path/to/test.spec.js

# Run tests in specific directory
npm test path/to/tests/

# Using global installation
litest
litest path/to/test.spec.js
litest path/to/tests/

# Or directly with node
node src/runner.js
node src/runner.js path/to/test.spec.js
```

### Available Matchers

#### Equality Matchers
- `toEqual(expected)` - Deep equality comparison
- `toBe(expected)` - Strict equality (===)

#### Truthiness Matchers
- `toBeTruthy()` - Checks if value is truthy
- `toBeFalsy()` - Checks if value is falsy
- `toBeNull()` - Checks if value is null
- `toBeUndefined()` - Checks if value is undefined

#### Error Matchers
- `toThrow()` - Checks if function throws any error
- `toThrow(message)` - Checks if function throws error containing message
- `toThrow(/pattern/)` - Checks if function throws error matching regex

#### Negation
All matchers support negation with `.not`:

```javascript
expect(value).not.toEqual(otherValue);
expect(fn).not.toThrow();
```

### Lifecycle Hooks

Litest supports four lifecycle hooks that allow you to run setup and teardown code:

#### beforeAll
Runs once before all tests in a describe block:

```javascript
describe('Database Tests', () => {
    beforeAll(() => {
        // Connect to database
        database.connect();
    });
    
    // ... tests
});
```

#### beforeEach
Runs before each individual test:

```javascript
describe('User Tests', () => {
    beforeEach(() => {
        // Reset user state before each test
        currentUser = null;
    });
    
    // ... tests
});
```

#### afterEach
Runs after each individual test:

```javascript
describe('API Tests', () => {
    afterEach(() => {
        // Clean up API calls
        mockServer.reset();
    });
    
    // ... tests
});
```

#### afterAll
Runs once after all tests in a describe block:

```javascript
describe('Integration Tests', () => {
    afterAll(() => {
        // Disconnect from services
        database.disconnect();
    });
    
    // ... tests
});
```

#### Hook Inheritance
Hooks are inherited by nested describe blocks:

```javascript
describe('Parent Suite', () => {
    beforeEach(() => {
        console.log('Parent beforeEach');
    });
    
    describe('Child Suite', () => {
        beforeEach(() => {
            console.log('Child beforeEach');
        });
        
        it('test', () => {
            // Both parent and child beforeEach will run
            // Output: "Parent beforeEach", "Child beforeEach"
        });
    });
});
```

#### Hook Execution Order
- `beforeAll` hooks run from outermost to innermost
- `beforeEach` hooks run from outermost to innermost
- `afterEach` hooks run from innermost to outermost
- `afterAll` hooks run from innermost to outermost

### Test Timeouts

Litest includes built-in timeout support to prevent tests from hanging indefinitely.

#### Default Timeout
Tests have a default timeout of 5 seconds (5000ms).

#### Setting Custom Timeouts
Use `setTestTimeout()` to configure timeout for tests in the current suite:

```javascript
import { describe, it, expect, setTestTimeout } from '@scintilla-network/litest';

describe('API Tests', () => {
    // Set timeout to 10 seconds for slow API calls
    setTestTimeout(10000);
    
    it('should handle slow API response', async () => {
        const response = await slowApiCall();
        expect(response).toBeTruthy();
    });
});

describe('Fast Unit Tests', () => {
    // Set shorter timeout for unit tests
    setTestTimeout(1000);
    
    it('should calculate quickly', () => {
        expect(2 + 2).toBe(4);
    });
});
```

#### Timeout Behavior
- Timeouts apply to the entire test execution including hooks
- When a test times out, it fails with a timeout error message
- Each test file starts with the default timeout (5000ms)
- Timeout settings are scoped to the suite where `setTestTimeout()` is called
- Child suites inherit timeout from parent suites

### Test Modifiers

#### Skip Tests
```javascript
describe.skip('skipped suite', () => {
    // This entire suite will be skipped
});

it.skip('skipped test', () => {
    // This individual test will be skipped
});
```

#### Only Run Specific Tests
```javascript
describe.only('only this suite', () => {
    // Only this suite will run
});

it.only('only this test', () => {
    // Only this test will run
});
```

## Example

```javascript
import { describe, it, expect } from '@scintilla-network/litest';

describe('Array Operations', () => {
    describe('push method', () => {
        it('should add element to end of array', () => {
            const arr = [1, 2, 3];
            arr.push(4);
            expect(arr).toEqual([1, 2, 3, 4]);
            expect(arr.length).toBe(4);
        });

        it('should return new length', () => {
            const arr = ['a', 'b'];
            const newLength = arr.push('c');
            expect(newLength).toBe(3);
        });
    });

    describe('error handling', () => {
        it('should throw when accessing invalid index', () => {
            expect(() => {
                const arr = [1, 2, 3];
                if (arr[10] === undefined) {
                    throw new Error('Index out of bounds');
                }
            }).toThrow('Index out of bounds');
        });
    });
});
```

## CLI Options

The runner automatically finds all `.spec.js` files in your project directory and subdirectories.

```bash
# Run tests in current directory
litest

# Run tests in specific directory
litest path/to/tests
```

## Output Format

Litest provides output similar to Vitest:

```
🚀 Running tests...

example.spec.js
✓ Example Test Suite Basic Math should add correctly
✓ Example Test Suite Basic Math should multiply correctly 2ms
↓ Example Test Suite Basic Math skipped test
✗ Example Test Suite Errors should handle failures 5ms
  Expected 1 to equal 2
    at Object.toEqual (file:///path/to/test.js:10:20)

Test Files  1 passed (1)
     Tests  2 passed | 1 skipped (4)
Duration  15ms

❌ Some tests failed!
```

## Migration from Vitest

Litest provides API compatibility with Vitest for common use cases. Migration should be as simple as:

### Update Dependencies

```bash
# Remove Vitest
npm uninstall vitest

# Install Litest
npm install --save-dev @scintilla-network/litest
```

### Update Import Statements

```javascript
// Before (Vitest)
import { describe, it, test, expect, beforeAll, beforeEach, afterAll, afterEach } from 'vitest';

// After (Litest) - exact same API
import { describe, it, test, expect, beforeAll, beforeEach, afterAll, afterEach } from '@scintilla-network/litest';
```

### Supported Vitest Features

✅ **Fully Compatible:**
- `describe`, `it`, `test`, `suite` with all modifiers (`.skip`, `.only`, `.todo`, `.fails`)
- `expect` with 15+ matchers (`toEqual`, `toBe`, `toMatch`, `toContain`, `toHaveProperty`, etc.)
- Lifecycle hooks (`beforeAll`, `beforeEach`, `afterAll`, `afterEach`)
- Test hooks (`onTestFinished`, `onTestFailed`)
- Parameterized testing (`.each()`, `.for()`)
- Conditional testing (`.skipIf()`, `.runIf()`)
- Test configuration (`timeout`, `retry`)

⚠️ **Not Implemented (Yet):**
- `vi` mocking utilities
- `expect.extend()` custom matchers
- Coverage reporting (placeholder exists)
- Watch mode (placeholder exists)
- Snapshot testing

### Example Migration

```javascript
// This Vitest test file works unchanged with Litest
import { describe, it, expect, beforeAll, afterAll } from '@scintilla-network/litest'; // Changed from 'vitest'

describe('User Service', () => {
  let userService;

  beforeAll(() => {
    userService = new UserService();
  });

  afterAll(() => {
    userService.cleanup();
  });

  it.each([
    { name: 'John', age: 30, valid: true },
    { name: 'Jane', age: 25, valid: true },
    { name: '', age: 20, valid: false }
  ])('should validate user: $name', ({ name, age, valid }) => {
    const user = { name, age };
    expect(userService.isValid(user)).toBe(valid);
  });

  it('should handle async operations', async () => {
    const user = await userService.createUser('Alice', 28);
    expect(user).toHaveProperty('id');
    expect(user.name).toBe('Alice');
  });
});
```

## Package.json Integration

Add to your `package.json`:

```json
{
  "scripts": {
    "test": "litest"
  }
}
```

## License

MIT

## Contributing

This is a simple, focused test framework. Contributions are welcome for bug fixes and small improvements that maintain the simplicity and ease of maintenance. Please open an issue if you find a bug or have a feature request.
