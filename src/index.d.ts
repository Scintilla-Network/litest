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

// Main test functions are declared below with their modifiers

// Test modifiers
export interface DescribeModifiers {
  skip(name: string, fn: () => void): void;
  only(name: string, fn: () => void): void;
  todo(name: string, fn?: () => void): void;
  skipIf(condition: boolean): (name: string, fn: () => void) => void;
  runIf(condition: boolean): (name: string, fn: () => void) => void;
  each<T>(cases: T[]): (name: string, fn: (...args: any[]) => void) => void;
  for<T>(cases: T[]): (name: string, fn: (testCase: T) => void) => void;
}

export interface ItModifiers {
  skip(name: string, fn: TestFunction): void;
  only(name: string, fn: TestFunction): void;
  todo(name: string, fn?: TestFunction): void;
  fails(name: string, fn: TestFunction): void;
  concurrent(name: string, fn: TestFunction): void;
  skipIf(condition: boolean): (name: string, fn: TestFunction) => void;
  runIf(condition: boolean): (name: string, fn: TestFunction) => void;
  each<T>(cases: T[]): (name: string, fn: (...args: any[]) => void) => void;
  for<T>(cases: T[]): (name: string, fn: (testCase: T) => void) => void;
}

export interface TestModifiers {
  skip(name: string, fn: TestFunction): void;
  only(name: string, fn: TestFunction): void;
  todo(name: string, fn?: TestFunction): void;
  fails(name: string, fn: TestFunction): void;
  concurrent(name: string, fn: TestFunction): void;
  skipIf(condition: boolean): (name: string, fn: TestFunction) => void;
  runIf(condition: boolean): (name: string, fn: TestFunction) => void;
  each<T>(cases: T[]): (name: string, fn: (...args: any[]) => void) => void;
  for<T>(cases: T[]): (name: string, fn: (testCase: T) => void) => void;
}

export interface SuiteModifiers {
  skip(name: string, fn: () => void): void;
  only(name: string, fn: () => void): void;
  todo(name: string, fn?: () => void): void;
  skipIf(condition: boolean): (name: string, fn: () => void) => void;
  runIf(condition: boolean): (name: string, fn: () => void) => void;
  each<T>(cases: T[]): (name: string, fn: (...args: any[]) => void) => void;
  for<T>(cases: T[]): (name: string, fn: (testCase: T) => void) => void;
}

export declare const describe: ((name: string, fn: () => void) => void) & DescribeModifiers;
export declare const it: ((name: string, fn: TestFunction) => void) & ItModifiers;
export declare const test: ((name: string, fn: TestFunction) => void) & TestModifiers;
export declare const suite: ((name: string, fn: () => void) => void) & SuiteModifiers;

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
  readonly defined: void;
  
  // Function matchers
  throw(expected?: string | RegExp): void;
  
  // String matchers
  match(expected: string | RegExp): void;
  
  // Array/object matchers
  contain(expected: any): void;
  
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
  toBeDefined(): void;
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
