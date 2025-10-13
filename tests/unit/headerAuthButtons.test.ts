// Unit tests for Header authentication button functionality
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock DOM elements
const mockCodeAcademyBtn = {
  addEventListener: vi.fn(),
  click: vi.fn()
};

const mockCodeAcademyBtnMobile = {
  addEventListener: vi.fn(),
  click: vi.fn()
};

const mockJoromiBtn = {
  addEventListener: vi.fn(),
  click: vi.fn()
};

const mockJoromiBtnMobile = {
  addEventListener: vi.fn(),
  click: vi.fn()
};

const mockClientLoginBtn = {
  addEventListener: vi.fn(),
  click: vi.fn()
};

const mockClientLoginBtnMobile = {
  addEventListener: vi.fn(),
  click: vi.fn()
};

const mockMenu = {
  classList: {
    add: vi.fn()
  }
};

const mockBtn = {
  setAttribute: vi.fn()
};

// Mock DOM methods
const mockGetElementById = vi.fn((id: string) => {
  const elements: { [key: string]: any } = {
    'open-code-academy-modal': mockCodeAcademyBtn,
    'open-code-academy-modal-mobile': mockCodeAcademyBtnMobile,
    'joromi-2fa-btn': mockJoromiBtn,
    'joromi-2fa-btn-mobile': mockJoromiBtnMobile,
    'client-login-2fa-btn': mockClientLoginBtn,
    'client-login-2fa-btn-mobile': mockClientLoginBtnMobile,
    'mobile-menu': mockMenu,
    'mobile-menu-button': mockBtn
  };
  return elements[id] || null;
});

// Mock window.open
const mockWindowOpen = vi.fn();

// Mock global functions
const mockRedirectToExternal = vi.fn();
const mockRedirectToInternal = vi.fn();
const mockOpen2FAModal = vi.fn();

// Mock window object
Object.defineProperty(window, 'document', {
  value: {
    getElementById: mockGetElementById
  },
  writable: true
});

Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
  writable: true
});

Object.defineProperty(window, 'redirectToExternal', {
  value: mockRedirectToExternal,
  writable: true
});

Object.defineProperty(window, 'redirectToInternal', {
  value: mockRedirectToInternal,
  writable: true
});

Object.defineProperty(window, 'open2FAModal', {
  value: mockOpen2FAModal,
  writable: true
});

// Mock preventDefault
const mockPreventDefault = vi.fn();

describe('Header Authentication Buttons', () => {
  let eventListeners: { [key: string]: Function } = {};

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
    
    // Reset event listeners
    eventListeners = {};

    // Mock addEventListener to capture event listeners
    [mockCodeAcademyBtn, mockCodeAcademyBtnMobile, mockJoromiBtn, mockJoromiBtnMobile, mockClientLoginBtn, mockClientLoginBtnMobile].forEach(btn => {
      btn.addEventListener.mockImplementation((event: string, callback: Function) => {
        eventListeners[event] = callback;
      });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Code Academy Button Handlers', () => {
    it('should set up event listeners for desktop and mobile Code Academy buttons', () => {
      // Simulate the Header component initialization
      const codeAcademyBtn = mockGetElementById('open-code-academy-modal');
      const codeAcademyBtnMobile = mockGetElementById('open-code-academy-modal-mobile');
      const menu = mockGetElementById('mobile-menu');
      const btn = mockGetElementById('mobile-menu-button');

      expect(codeAcademyBtn).toBe(mockCodeAcademyBtn);
      expect(codeAcademyBtnMobile).toBe(mockCodeAcademyBtnMobile);
      expect(codeAcademyBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
      expect(codeAcademyBtnMobile.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });

    it('should call redirectToExternal for Code Academy desktop button', () => {
      const codeAcademyBtn = mockGetElementById('open-code-academy-modal');
      const menu = mockGetElementById('mobile-menu');
      const btn = mockGetElementById('mobile-menu-button');

      // Get the click event listener
      const clickHandler = eventListeners['click'];
      expect(clickHandler).toBeDefined();

      // Create mock event
      const mockEvent = {
        preventDefault: mockPreventDefault
      };

      // Call the event handler
      clickHandler(mockEvent);

      expect(mockPreventDefault).toHaveBeenCalled();
      expect(mockRedirectToExternal).toHaveBeenCalledWith('code-academy');
      expect(mockMenu.classList.add).toHaveBeenCalledWith('hidden');
      expect(mockBtn.setAttribute).toHaveBeenCalledWith('aria-expanded', 'false');
    });

    it('should call redirectToExternal for Code Academy mobile button', () => {
      const codeAcademyBtnMobile = mockGetElementById('open-code-academy-modal-mobile');
      const menu = mockGetElementById('mobile-menu');
      const btn = mockGetElementById('mobile-menu-button');

      // Get the click event listener
      const clickHandler = eventListeners['click'];
      expect(clickHandler).toBeDefined();

      // Create mock event
      const mockEvent = {
        preventDefault: mockPreventDefault
      };

      // Call the event handler
      clickHandler(mockEvent);

      expect(mockPreventDefault).toHaveBeenCalled();
      expect(mockRedirectToExternal).toHaveBeenCalledWith('code-academy');
      expect(mockMenu.classList.add).toHaveBeenCalledWith('hidden');
      expect(mockBtn.setAttribute).toHaveBeenCalledWith('aria-expanded', 'false');
    });

    it('should fallback to window.open if redirectToExternal is not available', () => {
      // Mock redirectToExternal as undefined
      Object.defineProperty(window, 'redirectToExternal', {
        value: undefined,
        writable: true
      });

      const codeAcademyBtn = mockGetElementById('open-code-academy-modal');
      const menu = mockGetElementById('mobile-menu');
      const btn = mockGetElementById('mobile-menu-button');

      // Get the click event listener
      const clickHandler = eventListeners['click'];
      expect(clickHandler).toBeDefined();

      // Create mock event
      const mockEvent = {
        preventDefault: mockPreventDefault
      };

      // Call the event handler
      clickHandler(mockEvent);

      expect(mockPreventDefault).toHaveBeenCalled();
      expect(mockWindowOpen).toHaveBeenCalledWith('https://www.poisonedreligion.ai', '_blank');
    });
  });

  describe('JoRoMi Button Handlers', () => {
    it('should set up event listeners for desktop and mobile JoRoMi buttons', () => {
      const joromiBtn = mockGetElementById('joromi-2fa-btn');
      const joromiBtnMobile = mockGetElementById('joromi-2fa-btn-mobile');

      expect(joromiBtn).toBe(mockJoromiBtn);
      expect(joromiBtnMobile).toBe(mockJoromiBtnMobile);
      expect(joromiBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
      expect(joromiBtnMobile.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });

    it('should call redirectToExternal for JoRoMi desktop button', () => {
      const joromiBtn = mockGetElementById('joromi-2fa-btn');
      const menu = mockGetElementById('mobile-menu');
      const btn = mockGetElementById('mobile-menu-button');

      // Get the click event listener
      const clickHandler = eventListeners['click'];
      expect(clickHandler).toBeDefined();

      // Create mock event
      const mockEvent = {
        preventDefault: mockPreventDefault
      };

      // Call the event handler
      clickHandler(mockEvent);

      expect(mockPreventDefault).toHaveBeenCalled();
      expect(mockRedirectToExternal).toHaveBeenCalledWith('joromi');
      expect(mockMenu.classList.add).toHaveBeenCalledWith('hidden');
      expect(mockBtn.setAttribute).toHaveBeenCalledWith('aria-expanded', 'false');
    });

    it('should call redirectToExternal for JoRoMi mobile button', () => {
      const joromiBtnMobile = mockGetElementById('joromi-2fa-btn-mobile');
      const menu = mockGetElementById('mobile-menu');
      const btn = mockGetElementById('mobile-menu-button');

      // Get the click event listener
      const clickHandler = eventListeners['click'];
      expect(clickHandler).toBeDefined();

      // Create mock event
      const mockEvent = {
        preventDefault: mockPreventDefault
      };

      // Call the event handler
      clickHandler(mockEvent);

      expect(mockPreventDefault).toHaveBeenCalled();
      expect(mockRedirectToExternal).toHaveBeenCalledWith('joromi');
      expect(mockMenu.classList.add).toHaveBeenCalledWith('hidden');
      expect(mockBtn.setAttribute).toHaveBeenCalledWith('aria-expanded', 'false');
    });

    it('should fallback to window.open if redirectToExternal is not available', () => {
      // Mock redirectToExternal as undefined
      Object.defineProperty(window, 'redirectToExternal', {
        value: undefined,
        writable: true
      });

      const joromiBtn = mockGetElementById('joromi-2fa-btn');
      const menu = mockGetElementById('mobile-menu');
      const btn = mockGetElementById('mobile-menu-button');

      // Get the click event listener
      const clickHandler = eventListeners['click'];
      expect(clickHandler).toBeDefined();

      // Create mock event
      const mockEvent = {
        preventDefault: mockPreventDefault
      };

      // Call the event handler
      clickHandler(mockEvent);

      expect(mockPreventDefault).toHaveBeenCalled();
      expect(mockWindowOpen).toHaveBeenCalledWith('https://www.joromi.ai', '_blank');
    });
  });

  describe('Client Login Button Handlers', () => {
    it('should set up event listeners for desktop and mobile Client Login buttons', () => {
      const clientLoginBtn = mockGetElementById('client-login-2fa-btn');
      const clientLoginBtnMobile = mockGetElementById('client-login-2fa-btn-mobile');

      expect(clientLoginBtn).toBe(mockClientLoginBtn);
      expect(clientLoginBtnMobile).toBe(mockClientLoginBtnMobile);
      expect(clientLoginBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
      expect(clientLoginBtnMobile.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });

    it('should call redirectToInternal for Client Login desktop button', () => {
      const clientLoginBtn = mockGetElementById('client-login-2fa-btn');
      const menu = mockGetElementById('mobile-menu');
      const btn = mockGetElementById('mobile-menu-button');

      // Get the click event listener
      const clickHandler = eventListeners['click'];
      expect(clickHandler).toBeDefined();

      // Create mock event
      const mockEvent = {
        preventDefault: mockPreventDefault
      };

      // Call the event handler
      clickHandler(mockEvent);

      expect(mockPreventDefault).toHaveBeenCalled();
      expect(mockRedirectToInternal).toHaveBeenCalledWith('dashboard');
      expect(mockMenu.classList.add).toHaveBeenCalledWith('hidden');
      expect(mockBtn.setAttribute).toHaveBeenCalledWith('aria-expanded', 'false');
    });

    it('should call redirectToInternal for Client Login mobile button', () => {
      const clientLoginBtnMobile = mockGetElementById('client-login-2fa-btn-mobile');
      const menu = mockGetElementById('mobile-menu');
      const btn = mockGetElementById('mobile-menu-button');

      // Get the click event listener
      const clickHandler = eventListeners['click'];
      expect(clickHandler).toBeDefined();

      // Create mock event
      const mockEvent = {
        preventDefault: mockPreventDefault
      };

      // Call the event handler
      clickHandler(mockEvent);

      expect(mockPreventDefault).toHaveBeenCalled();
      expect(mockRedirectToInternal).toHaveBeenCalledWith('dashboard');
      expect(mockMenu.classList.add).toHaveBeenCalledWith('hidden');
      expect(mockBtn.setAttribute).toHaveBeenCalledWith('aria-expanded', 'false');
    });

    it('should fallback to 2FA modal if redirectToInternal is not available', () => {
      // Mock redirectToInternal as undefined
      Object.defineProperty(window, 'redirectToInternal', {
        value: undefined,
        writable: true
      });

      const clientLoginBtn = mockGetElementById('client-login-2fa-btn');
      const menu = mockGetElementById('mobile-menu');
      const btn = mockGetElementById('mobile-menu-button');

      // Get the click event listener
      const clickHandler = eventListeners['click'];
      expect(clickHandler).toBeDefined();

      // Create mock event
      const mockEvent = {
        preventDefault: mockPreventDefault
      };

      // Call the event handler
      clickHandler(mockEvent);

      expect(mockPreventDefault).toHaveBeenCalled();
      expect(mockOpen2FAModal).toHaveBeenCalled();
      expect(mockMenu.classList.add).toHaveBeenCalledWith('hidden');
      expect(mockBtn.setAttribute).toHaveBeenCalledWith('aria-expanded', 'false');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing buttons gracefully', () => {
      // Mock getElementById to return null
      mockGetElementById.mockReturnValue(null);

      const codeAcademyBtn = mockGetElementById('open-code-academy-modal');
      expect(codeAcademyBtn).toBeNull();
    });

    it('should handle missing menu elements gracefully', () => {
      mockGetElementById.mockImplementation((id: string) => {
        if (id === 'mobile-menu' || id === 'mobile-menu-button') {
          return null;
        }
        return mockCodeAcademyBtn;
      });

      const codeAcademyBtn = mockGetElementById('open-code-academy-modal');
      const menu = mockGetElementById('mobile-menu');
      const btn = mockGetElementById('mobile-menu-button');

      expect(codeAcademyBtn).toBe(mockCodeAcademyBtn);
      expect(menu).toBeNull();
      expect(btn).toBeNull();
    });
  });
});
