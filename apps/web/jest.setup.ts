import '@testing-library/jest-dom';
// Polyfills for react-router / ra-core in Jest
import { TextEncoder, TextDecoder } from 'util';

// @ts-ignore
global.TextEncoder = TextEncoder as any;
// @ts-ignore
global.TextDecoder = TextDecoder as any;

// Polyfill ResizeObserver for jsdom environment (required for Radix UI components)
// @ts-ignore
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Polyfill IntersectionObserver for jsdom environment
// @ts-ignore
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Polyfill window.matchMedia for jsdom environment
if (typeof window !== 'undefined' && !('matchMedia' in window)) {
  // @ts-ignore
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated API
    removeListener: jest.fn(), // deprecated API
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
}

// Polyfill requestAnimationFrame
if (typeof window !== 'undefined' && !window.requestAnimationFrame) {
  window.requestAnimationFrame = jest.fn((cb) => {
    setTimeout(cb, 0);
    return 0;
  });
  window.cancelAnimationFrame = jest.fn();
}

// Suppress console warnings for cleaner test output
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (
        args[0].includes('Warning: Function components cannot be given refs') ||
        args[0].includes('Warning: Failed prop type') ||
        args[0].includes('Warning: React.createElement') ||
        args[0].includes('Warning: validateDOMNesting') ||
        args[0].includes('Warning: Each child in a list should have a unique "key" prop') ||
        args[0].includes('Warning: An update to') ||
        args[0].includes('inside a test was not wrapped in act')
      )
    ) {
      return; // Suppress these warnings
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (
        args[0].includes('Warning:') ||
        args[0].includes('Select is changing from uncontrolled to controlled') ||
        args[0].includes('Components should not switch from controlled to uncontrolled')
      )
    ) {
      return; // Suppress warnings
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});