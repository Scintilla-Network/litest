// TypeScript declarations for Litest
// Provides type definitions for better IDE support and discoverability

export interface TestOptions {
  timeout?: number;
  retry?: number;
  concurrent?: boolean;
  skip?: boolean;
  only?: boolean;
  todo?: boolean;
  fails?: boolean;
}

export type TestFunction = () => void | Promise<void>;
export type HookFunction = () => void | Promise<void>;

// Main test functions
export function describe(name: string, fn: () => void): void;
export function it(name: string, fn: TestFunction): void;
export function it(name: string, options: TestOptions, fn: TestFunction): void;
export function test(name: string, fn: TestFunction): void;
export function test(name: string, options: TestOptions, fn: TestFunction): void;
export function suite(name: string, fn: () => void): void;

// Test modifiers
export namespace describe {
  function skip(name: string, fn: () => void): void;
  function only(name: string, fn: () => void): void;
  function todo(name: string, fn?: () => void): void;
  function skipIf(condition: boolean): (name: string, fn: () => void) => void;
  function runIf(condition: boolean): (name: string, fn: () => void) => void;
  function each<T>(cases: T[]): (name: string, fn: (...args: any[]) => void) => void;
  function for<T>(cases: T[]): (name: string, fn: (testCase: T) => void) => void;
}

export namespace it {
  function skip(name: string, fn: TestFunction): void;
  function only(name: string, fn: TestFunction): void;
  function todo(name: string, fn?: TestFunction): void;
  function fails(name: string, fn: TestFunction): void;
  function concurrent(name: string, fn: TestFunction): void;
  function skipIf(condition: boolean): (name: string, fn: TestFunction) => void;
  function runIf(condition: boolean): (name: string, fn: TestFunction) => void;
  function each<T>(cases: T[]): (name: string, fn: (...args: any[]) => void) => void;
  function for<T>(cases: T[]): (name: string, fn: (testCase: T) => void) => void;
}

export namespace test {
  function skip(name: string, fn: TestFunction): void;
  function only(name: string, fn: TestFunction): void;
  function todo(name: string, fn?: TestFunction): void;
  function fails(name: string, fn: TestFunction): void;
  function concurrent(name: string, fn: TestFunction): void;
  function skipIf(condition: boolean): (name: string, fn: TestFunction) => void;
  function runIf(condition: boolean): (name: string, fn: TestFunction) => void;
  function each<T>(cases: T[]): (name: string, fn: (...args: any[]) => void) => void;
  function for<T>(cases: T[]): (name: string, fn: (testCase: T) => void) => void;
}

export namespace suite {
  function skip(name: string, fn: () => void): void;
  function only(name: string, fn: () => void): void;
  function todo(name: string, fn?: () => void): void;
  function skipIf(condition: boolean): (name: string, fn: () => void) => void;
  function runIf(condition: boolean): (name: string, fn: () => void) => void;
  function each<T>(cases: T[]): (name: string, fn: (...args: any[]) => void) => void;
  function for<T>(cases: T[]): (name: string, fn: (testCase: T) => void) => void;
}

// Chai-style matchers for 'to' property
export interface ChaiStyleMatchers<T = any> {
  // Basic equality
  equal(expected: T): void;
  be(expected: T): void;
  
  // Deep equality
  readonly deep: {
    equal(expected: T): void;
  };
  
  // Truthiness
  readonly truthy: void;
  readonly falsy: void;
  readonly null: void;
  readonly undefined: void;
  
  // Function matchers
  throw(expected?: string | RegExp): void;
  
  // String matchers
  match(expected: string | RegExp): void;
  
  // Array/object matchers
  contain(expected: any): void;
  
  // Instance matchers
  readonly instanceOf: (expected: Function) => void;
  
  // Property matchers
  readonly have: {
    property(property: string | string[], value?: any): void;
    length(expected: number): void;
  };
  
  // Comparison matchers
  readonly greaterThan: (expected: number) => void;
  readonly greaterThanOrEqual: (expected: number) => void;
  readonly lessThan: (expected: number) => void;
  readonly lessThanOrEqual: (expected: number) => void;
  readonly closeTo: (expected: number, precision?: number) => void;
  readonly instanceOf: (expected: Function) => void;
}

// Expectation interface
export interface Expectation<T = any> {
  readonly not: Expectation<T>;
  readonly to: ChaiStyleMatchers<T>;
  
  // Jest-style matchers
  toEqual(expected: T): void;
  toBe(expected: T): void;
  toBeTruthy(): void;
  toBeFalsy(): void;
  toThrow(expected?: string | RegExp): void;
  toBeNull(): void;
  toBeUndefined(): void;
  toMatch(expected: string | RegExp): void;
  toContain(expected: any): void;
  toHaveProperty(property: string | string[], value?: any): void;
  toHaveLength(expected: number): void;
  toBeGreaterThan(expected: number): void;
  toBeGreaterThanOrEqual(expected: number): void;
  toBeLessThan(expected: number): void;
  toBeLessThanOrEqual(expected: number): void;
  toBeCloseTo(expected: number, precision?: number): void;
  toBeInstanceOf(expected: Function): void;
}

export function expect<T = any>(actual: T): Expectation<T>;

// Lifecycle hooks
export function beforeAll(fn: HookFunction): void;
export function beforeEach(fn: HookFunction): void;
export function afterAll(fn: HookFunction): void;
export function afterEach(fn: HookFunction): void;

// Test hooks
export function onTestFinished(fn: (result: any) => void): void;
export function onTestFailed(fn: (result: any) => void): void;

// Configuration
export function setTestTimeout(timeout: number): void;
