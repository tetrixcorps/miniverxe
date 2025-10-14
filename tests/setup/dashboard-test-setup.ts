import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.TETRIX_API_URL = 'http://localhost:3000';
process.env.TETRIX_API_KEY = 'test-api-key';

// Mock fetch globally
global.fetch = vi.fn();

// Mock DOM APIs
const mockElement = {
  textContent: '',
  innerHTML: '',
  style: { display: '' },
  classList: {
    add: vi.fn(),
    remove: vi.fn(),
    contains: vi.fn(),
    toggle: vi.fn()
  },
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  querySelector: vi.fn(),
  querySelectorAll: vi.fn(() => []),
  getElementById: vi.fn(),
  scrollTop: 0,
  scrollHeight: 100,
  focus: vi.fn(),
  click: vi.fn()
};

// Mock document
Object.defineProperty(global, 'document', {
  value: {
    getElementById: vi.fn((id: string) => mockElement),
    querySelector: vi.fn(() => mockElement),
    querySelectorAll: vi.fn(() => [mockElement]),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    createElement: vi.fn(() => mockElement),
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn()
    }
  },
  writable: true
});

// Mock window
Object.defineProperty(global, 'window', {
  value: {
    location: { 
      search: '?role=fleet_manager',
      href: 'http://localhost:3000/dashboards/client',
      hostname: 'localhost',
      port: '3000'
    },
    localStorage: {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    },
    sessionStorage: {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    },
    setInterval: vi.fn(() => 1),
    clearInterval: vi.fn(),
    setTimeout: vi.fn((fn) => fn()),
    clearTimeout: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    postMessage: vi.fn(),
    alert: vi.fn(),
    confirm: vi.fn(() => true),
    prompt: vi.fn(() => 'test'),
    open: vi.fn(),
    close: vi.fn(),
    focus: vi.fn(),
    blur: vi.fn(),
    scrollTo: vi.fn(),
    scrollBy: vi.fn(),
    getComputedStyle: vi.fn(() => ({
      getPropertyValue: vi.fn(() => ''),
      setProperty: vi.fn()
    }))
  },
  writable: true
});

// Mock console methods
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn()
};

// Mock performance API
Object.defineProperty(global, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByName: vi.fn(() => []),
    getEntriesByType: vi.fn(() => []),
    clearMarks: vi.fn(),
    clearMeasures: vi.fn()
  },
  writable: true
});

// Mock URL and URLSearchParams
global.URL = class URL {
  constructor(public href: string) {}
  searchParams = new URLSearchParams();
};

global.URLSearchParams = class URLSearchParams {
  private params = new Map<string, string>();

  constructor(init?: string | string[][] | Record<string, string>) {
    if (typeof init === 'string') {
      const pairs = init.split('&');
      pairs.forEach(pair => {
        const [key, value] = pair.split('=');
        if (key) this.params.set(decodeURIComponent(key), decodeURIComponent(value || ''));
      });
    } else if (Array.isArray(init)) {
      init.forEach(([key, value]) => this.params.set(key, value));
    } else if (init) {
      Object.entries(init).forEach(([key, value]) => this.params.set(key, value));
    }
  }

  get(name: string): string | null {
    return this.params.get(name) || null;
  }

  set(name: string, value: string): void {
    this.params.set(name, value);
  }

  has(name: string): boolean {
    return this.params.has(name);
  }

  delete(name: string): void {
    this.params.delete(name);
  }

  toString(): string {
    return Array.from(this.params.entries())
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
  }
};

// Mock Blob
global.Blob = class Blob {
  constructor(public parts: any[], public options: any = {}) {}
  size = 0;
  type = '';
  slice() { return new Blob([], {}); }
  stream() { return new ReadableStream(); }
  text() { return Promise.resolve(''); }
  arrayBuffer() { return Promise.resolve(new ArrayBuffer(0)); }
};

// Mock FormData
global.FormData = class FormData {
  private data = new Map<string, any>();

  append(name: string, value: any) {
    this.data.set(name, value);
  }

  get(name: string) {
    return this.data.get(name);
  }

  has(name: string) {
    return this.data.has(name);
  }

  delete(name: string) {
    this.data.delete(name);
  }

  forEach(callback: (value: any, key: string) => void) {
    this.data.forEach(callback);
  }
};

// Mock Headers
global.Headers = class Headers {
  private headers = new Map<string, string>();

  constructor(init?: HeadersInit) {
    if (init) {
      if (Array.isArray(init)) {
        init.forEach(([key, value]) => this.headers.set(key.toLowerCase(), value));
      } else if (init instanceof Headers) {
        init.forEach((value, key) => this.headers.set(key.toLowerCase(), value));
      } else {
        Object.entries(init).forEach(([key, value]) => this.headers.set(key.toLowerCase(), value));
      }
    }
  }

  get(name: string): string | null {
    return this.headers.get(name.toLowerCase()) || null;
  }

  set(name: string, value: string): void {
    this.headers.set(name.toLowerCase(), value);
  }

  has(name: string): boolean {
    return this.headers.has(name.toLowerCase());
  }

  delete(name: string): void {
    this.headers.delete(name.toLowerCase());
  }

  forEach(callback: (value: string, key: string) => void) {
    this.headers.forEach(callback);
  }
};

// Mock Request
global.Request = class Request {
  constructor(
    public url: string,
    public init: RequestInit = {}
  ) {}

  get method() { return this.init.method || 'GET'; }
  get headers() { return new Headers(this.init.headers); }
  get body() { return this.init.body; }
  get signal() { return this.init.signal; }
  get credentials() { return this.init.credentials || 'same-origin'; }
  get cache() { return this.init.cache || 'default'; }
  get redirect() { return this.init.redirect || 'follow'; }
  get referrer() { return this.init.referrer || ''; }
  get referrerPolicy() { return this.init.referrerPolicy || 'no-referrer'; }
  get integrity() { return this.init.integrity || ''; }
  get keepalive() { return this.init.keepalive || false; }

  clone() {
    return new Request(this.url, this.init);
  }
};

// Mock Response
global.Response = class Response {
  constructor(
    public body: BodyInit | null = null,
    public init: ResponseInit = {}
  ) {}

  get status() { return this.init.status || 200; }
  get statusText() { return this.init.statusText || 'OK'; }
  get headers() { return new Headers(this.init.headers); }
  get ok() { return this.status >= 200 && this.status < 300; }
  get type() { return 'basic'; }
  get url() { return ''; }
  get redirected() { return false; }

  clone() {
    return new Response(this.body, this.init);
  }

  async arrayBuffer() {
    return new ArrayBuffer(0);
  }

  async blob() {
    return new Blob([], {});
  }

  async formData() {
    return new FormData();
  }

  async json() {
    return JSON.parse(this.body as string || '{}');
  }

  async text() {
    return this.body as string || '';
  }
};

// Setup and teardown functions
beforeAll(() => {
  // Global setup
  vi.clearAllMocks();
});

afterAll(() => {
  // Global cleanup
  vi.restoreAllMocks();
});

beforeEach(() => {
  // Reset mocks before each test
  vi.clearAllMocks();
  
  // Reset DOM state
  Object.values(mockElement).forEach(prop => {
    if (typeof prop === 'function') {
      prop.mockClear();
    }
  });
  
  // Reset window state
  window.location.search = '?role=fleet_manager';
  window.localStorage.getItem.mockReturnValue(null);
  window.sessionStorage.getItem.mockReturnValue(null);
});

afterEach(() => {
  // Cleanup after each test
  vi.clearAllMocks();
});

// Export mock utilities for use in tests
export const mockElement = mockElement;
export const createMockElement = (overrides: Partial<typeof mockElement> = {}) => ({
  ...mockElement,
  ...overrides
});

export const createMockResponse = (data: any, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const createMockRequest = (url: string, init: RequestInit = {}) => {
  return new Request(url, init);
};
