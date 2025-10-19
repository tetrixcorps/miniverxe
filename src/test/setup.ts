/**
 * Test Setup File for Vitest
 * Configures global test environment and mocks
 */

import { vi } from 'vitest';

// Mock global objects
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn()
  },
  writable: true
});

Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn()
  },
  writable: true
});

// Mock fetch globally
global.fetch = vi.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
};

// Mock navigator
Object.defineProperty(navigator, 'userAgent', {
  value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  writable: true
});

// Mock window methods
Object.defineProperty(window, 'prompt', {
  value: vi.fn(),
  writable: true
});

Object.defineProperty(window, 'confirm', {
  value: vi.fn(),
  writable: true
});

Object.defineProperty(window, 'alert', {
  value: vi.fn(),
  writable: true
});

// Mock setTimeout and setInterval
vi.stubGlobal('setTimeout', vi.fn((fn) => {
  fn();
  return 1;
}));

vi.stubGlobal('setInterval', vi.fn((fn) => {
  fn();
  return 1;
}));

vi.stubGlobal('clearTimeout', vi.fn());
vi.stubGlobal('clearInterval', vi.fn());

// Mock URL constructor
global.URL = class URL {
  constructor(public href: string) {}
  toString() {
    return this.href;
  }
} as any;

// Mock Response constructor
global.Response = class Response {
  constructor(
    public body: any,
    public init: { status?: number; headers?: Record<string, string> } = {}
  ) {}
  
  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
  }
  
  async text() {
    return typeof this.body === 'string' ? this.body : JSON.stringify(this.body);
  }
  
  get status() {
    return this.init.status || 200;
  }
  
  get ok() {
    return this.status >= 200 && this.status < 300;
  }
  
  get headers() {
    return {
      get: (name: string) => this.init.headers?.[name.toLowerCase()],
      entries: () => Object.entries(this.init.headers || {}),
      has: (name: string) => name.toLowerCase() in (this.init.headers || {})
    };
  }
} as any;

// Mock Headers constructor
global.Headers = class Headers {
  private headers: Record<string, string> = {};
  
  constructor(init?: HeadersInit) {
    if (init) {
      if (Array.isArray(init)) {
        init.forEach(([key, value]) => {
          this.headers[key.toLowerCase()] = value;
        });
      } else if (typeof init === 'object') {
        Object.entries(init).forEach(([key, value]) => {
          this.headers[key.toLowerCase()] = value;
        });
      }
    }
  }
  
  get(name: string) {
    return this.headers[name.toLowerCase()];
  }
  
  set(name: string, value: string) {
    this.headers[name.toLowerCase()] = value;
  }
  
  has(name: string) {
    return name.toLowerCase() in this.headers;
  }
  
  delete(name: string) {
    delete this.headers[name.toLowerCase()];
  }
  
  entries() {
    return Object.entries(this.headers);
  }
  
  keys() {
    return Object.keys(this.headers);
  }
  
  values() {
    return Object.values(this.headers);
  }
} as any;

// Mock document methods
const mockGetElementById = vi.fn();
const mockQuerySelector = vi.fn();
const mockQuerySelectorAll = vi.fn();

Object.defineProperty(document, 'getElementById', {
  value: mockGetElementById,
  writable: true
});

Object.defineProperty(document, 'querySelector', {
  value: mockQuerySelector,
  writable: true
});

Object.defineProperty(document, 'querySelectorAll', {
  value: mockQuerySelectorAll,
  writable: true
});

// Mock document.createElement
const mockCreateElement = vi.fn((tagName: string) => {
  const element = {
    tagName: tagName.toUpperCase(),
    innerHTML: '',
    textContent: '',
    value: '',
    disabled: false,
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn(),
      toggle: vi.fn(),
      item: vi.fn(),
      toString: vi.fn(() => '')
    },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    appendChild: vi.fn(),
    removeChild: vi.fn(),
    setAttribute: vi.fn(),
    getAttribute: vi.fn(),
    hasAttribute: vi.fn(),
    removeAttribute: vi.fn(),
    focus: vi.fn(),
    blur: vi.fn(),
    click: vi.fn(),
    style: {}
  };
  
  return element;
});

Object.defineProperty(document, 'createElement', {
  value: mockCreateElement,
  writable: true
});

// Mock document.body
Object.defineProperty(document, 'body', {
  value: {
    style: {},
    appendChild: vi.fn(),
    removeChild: vi.fn(),
    querySelector: vi.fn(),
    querySelectorAll: vi.fn()
  },
  writable: true
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: '',
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn()
  },
  writable: true
});

// Mock window.open
Object.defineProperty(window, 'open', {
  value: vi.fn(),
  writable: true
});

// Mock window.history
Object.defineProperty(window, 'history', {
  value: {
    pushState: vi.fn(),
    replaceState: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn()
  },
  writable: true
});

// Mock crypto for generating random values
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: vi.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
    randomUUID: vi.fn(() => 'mock-uuid-' + Math.random().toString(36).substr(2, 9))
  },
  writable: true
});

// Mock Math.random for consistent testing
const mockMath = Object.create(global.Math);
mockMath.random = vi.fn(() => 0.5);
global.Math = mockMath;

// Mock Date.now for consistent timestamps
const mockDateNow = vi.fn(() => 1640995200000); // 2022-01-01T00:00:00.000Z
global.Date.now = mockDateNow;

// Mock performance.now
Object.defineProperty(global, 'performance', {
  value: {
    now: vi.fn(() => Date.now())
  },
  writable: true
});

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});
