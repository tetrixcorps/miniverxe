// Integration tests for complete seamless transition flow
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock DOM elements
const mockOverlay = {
  classList: {
    add: vi.fn(),
    remove: vi.fn()
  }
};

const mockTitle = {
  textContent: ''
};

const mockMessage = {
  textContent: ''
};

const mockProgress = {
  style: {
    width: '0%'
  }
};

const mockPlatformIcon = {
  textContent: ''
};

const mockPlatformName = {
  textContent: '',
  className: ''
};

// Mock DOM methods
const mockGetElementById = vi.fn((id: string) => {
  const elements: { [key: string]: any } = {
    'seamless-transition-overlay': mockOverlay,
    'transition-title': mockTitle,
    'transition-message': mockMessage,
    'transition-progress': mockProgress,
    'platform-icon': mockPlatformIcon,
    'platform-name': mockPlatformName,
    'open-code-academy-modal': { addEventListener: vi.fn(), click: vi.fn() },
    'open-code-academy-modal-mobile': { addEventListener: vi.fn(), click: vi.fn() },
    'joromi-2fa-btn': { addEventListener: vi.fn(), click: vi.fn() },
    'joromi-2fa-btn-mobile': { addEventListener: vi.fn(), click: vi.fn() },
    'client-login-2fa-btn': { addEventListener: vi.fn(), click: vi.fn() },
    'client-login-2fa-btn-mobile': { addEventListener: vi.fn(), click: vi.fn() },
    'mobile-menu': { classList: { add: vi.fn() } },
    'mobile-menu-button': { setAttribute: vi.fn() }
  };
  return elements[id] || null;
});

// Mock window methods
const mockWindowOpen = vi.fn(() => ({
  addEventListener: vi.fn(),
  postMessage: vi.fn()
}));

const mockWindowLocation = {
  href: ''
};

// Mock localStorage and sessionStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn()
};

const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn()
};

// Mock console
const mockConsole = {
  log: vi.fn(),
  error: vi.fn()
};

// Mock setTimeout and setInterval
vi.stubGlobal('setTimeout', vi.fn((fn: Function) => {
  fn();
  return 123;
}));

vi.stubGlobal('setInterval', vi.fn((fn: Function) => {
  fn();
  return 456;
}));

vi.stubGlobal('clearInterval', vi.fn());

// Mock window object
Object.defineProperty(global, 'document', {
  value: {
    getElementById: mockGetElementById
  },
  writable: true
});

Object.defineProperty(global, 'window', {
  value: {
    open: mockWindowOpen,
    location: mockWindowLocation,
    localStorage: mockLocalStorage,
    sessionStorage: mockSessionStorage,
    console: mockConsole
  },
  writable: true
});

describe('Seamless Transition Flow Integration', () => {
  let SeamlessTransition: any;
  let eventListeners: { [key: string]: Function } = {};

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset DOM element properties
    mockTitle.textContent = '';
    mockMessage.textContent = '';
    mockPlatformIcon.textContent = '';
    mockPlatformName.textContent = '';
    mockPlatformName.className = '';
    mockProgress.style.width = '0%';

    // Mock event listeners
    eventListeners = {};
    const buttons = [
      'open-code-academy-modal',
      'open-code-academy-modal-mobile',
      'joromi-2fa-btn',
      'joromi-2fa-btn-mobile',
      'client-login-2fa-btn',
      'client-login-2fa-btn-mobile'
    ];

    buttons.forEach(buttonId => {
      const button = mockGetElementById(buttonId);
      if (button) {
        button.addEventListener.mockImplementation((event: string, callback: Function) => {
          eventListeners[`${buttonId}-${event}`] = callback;
        });
      }
    });

    // Mock the SeamlessTransition class
    SeamlessTransition = class {
      private overlay: HTMLElement | null;
      private title: HTMLElement | null;
      private message: HTMLElement | null;
      private progress: HTMLElement | null;
      private platformIcon: HTMLElement | null;
      private platformName: HTMLElement | null;
      private platforms: any;

      constructor() {
        this.overlay = mockGetElementById('seamless-transition-overlay');
        this.title = mockGetElementById('transition-title');
        this.message = mockGetElementById('transition-message');
        this.progress = mockGetElementById('transition-progress');
        this.platformIcon = mockGetElementById('platform-icon');
        this.platformName = mockGetElementById('platform-name');
        
        this.platforms = {
          'code-academy': {
            name: 'Code Academy',
            icon: '🎓',
            url: 'https://www.poisonedreligion.ai',
            color: 'text-blue-600'
          },
          'joromi': {
            name: 'JoRoMi Platform',
            icon: '🤖',
            url: 'https://www.joromi.ai',
            color: 'text-green-600'
          },
          'dashboard': {
            name: 'Client Dashboard',
            icon: '📊',
            url: '/dashboard',
            color: 'text-purple-600'
          }
        };
      }

      show(platform: string) {
        const platformInfo = this.platforms[platform];
        if (!platformInfo) {
          console.error('Unknown platform:', platform);
          return;
        }

        if (this.title) this.title.textContent = `Redirecting to ${platformInfo.name}`;
        if (this.message) this.message.textContent = `Please wait while we redirect you to ${platformInfo.name}...`;
        if (this.platformIcon) this.platformIcon.textContent = platformInfo.icon;
        if (this.platformName) {
          this.platformName.textContent = platformInfo.name;
          this.platformName.className = `text-sm ${platformInfo.color}`;
        }

        if (this.overlay) this.overlay.classList.remove('hidden');
        this.animateProgress();
        this.storeTransitionContext(platform, platformInfo);
      }

      hide() {
        if (this.overlay) this.overlay.classList.add('hidden');
        if (this.progress) this.progress.style.width = '0%';
      }

      animateProgress() {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 15;
          if (progress > 100) {
            progress = 100;
            clearInterval(interval);
          }
          if (this.progress) this.progress.style.width = `${progress}%`;
        }, 100);
      }

      storeTransitionContext(platform: string, platformInfo: any) {
        const transitionContext = {
          platform,
          platformInfo,
          timestamp: Date.now(),
          source: 'tetrix'
        };
        
        localStorage.setItem('tetrix_transition_context', JSON.stringify(transitionContext));
        sessionStorage.setItem('current_transition', JSON.stringify(transitionContext));
      }

      async redirectToExternal(platform: string) {
        const platformInfo = this.platforms[platform];
        if (!platformInfo) return;

        this.show(platform);
        await new Promise(resolve => setTimeout(resolve, 2000));

        const newWindow = window.open(platformInfo.url, '_blank');
        
        if (newWindow) {
          newWindow.addEventListener('load', () => {
            newWindow.postMessage({
              type: 'TETRIX_TRANSITION_CONTEXT',
              data: {
                source: 'tetrix',
                platform,
                timestamp: Date.now()
              }
            }, platformInfo.url);
          });
        }

        setTimeout(() => {
          this.hide();
        }, 500);
      }

      async redirectToInternal(platform: string) {
        const platformInfo = this.platforms[platform];
        if (!platformInfo) return;

        this.show(platform);
        await new Promise(resolve => setTimeout(resolve, 1500));
        window.location.href = platformInfo.url;
      }
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Complete Code Academy Flow', () => {
    it('should handle complete Code Academy redirect flow', async () => {
      const seamlessTransition = new SeamlessTransition();
      
      // Mock global functions
      (window as any).redirectToExternal = (platform: string) => {
        seamlessTransition.redirectToExternal(platform);
      };

      // Simulate button click
      const codeAcademyBtn = mockGetElementById('open-code-academy-modal');
      const clickHandler = eventListeners['open-code-academy-modal-click'];
      
      expect(clickHandler).toBeDefined();

      const mockEvent = {
        preventDefault: vi.fn()
      };

      // Call the event handler
      clickHandler(mockEvent);

      // Verify the flow
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockTitle.textContent).toBe('Redirecting to Code Academy');
      expect(mockMessage.textContent).toBe('Please wait while we redirect you to Code Academy...');
      expect(mockPlatformIcon.textContent).toBe('🎓');
      expect(mockPlatformName.textContent).toBe('Code Academy');
      expect(mockPlatformName.className).toBe('text-sm text-blue-600');
      expect(mockOverlay.classList.remove).toHaveBeenCalledWith('hidden');
      expect(mockWindowOpen).toHaveBeenCalledWith('https://www.poisonedreligion.ai', '_blank');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'tetrix_transition_context',
        expect.stringContaining('"platform":"code-academy"')
      );
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'current_transition',
        expect.stringContaining('"platform":"code-academy"')
      );
    });
  });

  describe('Complete JoRoMi Flow', () => {
    it('should handle complete JoRoMi redirect flow', async () => {
      const seamlessTransition = new SeamlessTransition();
      
      // Mock global functions
      (window as any).redirectToExternal = (platform: string) => {
        seamlessTransition.redirectToExternal(platform);
      };

      // Simulate button click
      const joromiBtn = mockGetElementById('joromi-2fa-btn');
      const clickHandler = eventListeners['joromi-2fa-btn-click'];
      
      expect(clickHandler).toBeDefined();

      const mockEvent = {
        preventDefault: vi.fn()
      };

      // Call the event handler
      clickHandler(mockEvent);

      // Verify the flow
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockTitle.textContent).toBe('Redirecting to JoRoMi Platform');
      expect(mockMessage.textContent).toBe('Please wait while we redirect you to JoRoMi Platform...');
      expect(mockPlatformIcon.textContent).toBe('🤖');
      expect(mockPlatformName.textContent).toBe('JoRoMi Platform');
      expect(mockPlatformName.className).toBe('text-sm text-green-600');
      expect(mockOverlay.classList.remove).toHaveBeenCalledWith('hidden');
      expect(mockWindowOpen).toHaveBeenCalledWith('https://www.joromi.ai', '_blank');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'tetrix_transition_context',
        expect.stringContaining('"platform":"joromi"')
      );
    });
  });

  describe('Complete Client Login Flow', () => {
    it('should handle complete Client Login redirect flow', async () => {
      const seamlessTransition = new SeamlessTransition();
      
      // Mock global functions
      (window as any).redirectToInternal = (platform: string) => {
        seamlessTransition.redirectToInternal(platform);
      };

      // Simulate button click
      const clientLoginBtn = mockGetElementById('client-login-2fa-btn');
      const clickHandler = eventListeners['client-login-2fa-btn-click'];
      
      expect(clickHandler).toBeDefined();

      const mockEvent = {
        preventDefault: vi.fn()
      };

      // Call the event handler
      clickHandler(mockEvent);

      // Verify the flow
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockTitle.textContent).toBe('Redirecting to Client Dashboard');
      expect(mockMessage.textContent).toBe('Please wait while we redirect you to Client Dashboard...');
      expect(mockPlatformIcon.textContent).toBe('📊');
      expect(mockPlatformName.textContent).toBe('Client Dashboard');
      expect(mockPlatformName.className).toBe('text-sm text-purple-600');
      expect(mockOverlay.classList.remove).toHaveBeenCalledWith('hidden');
      expect(mockWindowLocation.href).toBe('/dashboard');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'tetrix_transition_context',
        expect.stringContaining('"platform":"dashboard"')
      );
    });
  });

  describe('Cross-Platform Communication', () => {
    it('should handle cross-platform message communication', () => {
      const mockNewWindow = {
        addEventListener: vi.fn(),
        postMessage: vi.fn()
      };
      mockWindowOpen.mockReturnValue(mockNewWindow);

      const seamlessTransition = new SeamlessTransition();
      
      // Mock global functions
      (window as any).redirectToExternal = (platform: string) => {
        seamlessTransition.redirectToExternal(platform);
      };

      // Simulate button click
      const codeAcademyBtn = mockGetElementById('open-code-academy-modal');
      const clickHandler = eventListeners['open-code-academy-modal-click'];
      
      const mockEvent = {
        preventDefault: vi.fn()
      };

      clickHandler(mockEvent);

      // Verify cross-platform communication setup
      expect(mockNewWindow.addEventListener).toHaveBeenCalledWith('load', expect.any(Function));
      
      // Simulate window load event
      const loadHandler = mockNewWindow.addEventListener.mock.calls[0][1];
      loadHandler();

      expect(mockNewWindow.postMessage).toHaveBeenCalledWith({
        type: 'TETRIX_TRANSITION_CONTEXT',
        data: {
          source: 'tetrix',
          platform: 'code-academy',
          timestamp: expect.any(Number)
        }
      }, 'https://www.poisonedreligion.ai');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing DOM elements gracefully', () => {
      mockGetElementById.mockReturnValue(null);

      const seamlessTransition = new SeamlessTransition();
      
      // Should not throw errors
      expect(() => {
        seamlessTransition.show('code-academy');
      }).not.toThrow();
    });

    it('should handle unknown platform gracefully', () => {
      const seamlessTransition = new SeamlessTransition();
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      seamlessTransition.show('unknown-platform');
      
      expect(consoleSpy).toHaveBeenCalledWith('Unknown platform:', 'unknown-platform');
      
      consoleSpy.mockRestore();
    });

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      const seamlessTransition = new SeamlessTransition();
      
      // Should not throw errors
      expect(() => {
        seamlessTransition.storeTransitionContext('test', { name: 'Test' });
      }).not.toThrow();
    });
  });

  describe('Mobile Button Flow', () => {
    it('should handle mobile Code Academy button flow', () => {
      const seamlessTransition = new SeamlessTransition();
      
      // Mock global functions
      (window as any).redirectToExternal = (platform: string) => {
        seamlessTransition.redirectToExternal(platform);
      };

      // Simulate mobile button click
      const codeAcademyBtnMobile = mockGetElementById('open-code-academy-modal-mobile');
      const clickHandler = eventListeners['open-code-academy-modal-mobile-click'];
      
      expect(clickHandler).toBeDefined();

      const mockEvent = {
        preventDefault: vi.fn()
      };

      clickHandler(mockEvent);

      // Verify the flow
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockTitle.textContent).toBe('Redirecting to Code Academy');
      expect(mockWindowOpen).toHaveBeenCalledWith('https://www.poisonedreligion.ai', '_blank');
    });
  });
});
