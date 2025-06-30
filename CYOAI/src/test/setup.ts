// Test setup for Vitest
import '@testing-library/jest-dom'

// Mock global variables from Vite config
Object.defineProperty(globalThis, '__APP_VERSION__', {
  value: '1.0.0',
  writable: true,
  configurable: true,
})

Object.defineProperty(globalThis, '__BUILD_TIME__', {
  value: new Date().toISOString(),
  writable: true,
  configurable: true,
})

// Mock browser APIs
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: () => Promise.resolve({} as MediaStream),
  },
  writable: true,
})
