import '@testing-library/jest-dom';
// Polyfills for react-router / ra-core in Jest
import { TextEncoder, TextDecoder } from 'util';
// @ts-ignore
global.TextEncoder = TextEncoder as any;
// @ts-ignore
global.TextDecoder = TextDecoder as any;

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