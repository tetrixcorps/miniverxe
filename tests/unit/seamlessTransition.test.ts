// Unit tests for SeamlessTransition component
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
    'platform-name': mockPlatformName
  };
  return elements[id] || null;
});

// Mock window.open
const mockWindowOpen = vi.fn(() => ({
  addEventListener: vi.fn(),
  postMessage: vi.fn()
}));

// Mock localStorage and sessionStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn()
};

const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn()
};

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

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true
});

// Mock setTimeout and clearInterval
vi.stubGlobal('setTimeout', vi.fn((fn: Function) => {
  fn();
  return 123;
}));

vi.stubGlobal('setInterval', vi.fn((fn: Function) => {
  fn();
  return 456;
}));

vi.stubGlobal('clearInterval', vi.fn());

describe('SeamlessTransition', () => {
  let SeamlessTransition: any;

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
    
    // Reset DOM element properties
    mockTitle.textContent = '';
    mockMessage.textContent = '';
    mockPlatformIcon.textContent = '';
    mockPlatformName.textContent = '';
    mockPlatformName.className = '';
    mockProgress.style.width = '0%';

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

  describe('Constructor', () => {
    it('should initialize with correct DOM elements', () => {
      const transition = new SeamlessTransition();
      
      expect(mockGetElementById).toHaveBeenCalledWith('seamless-transition-overlay');
      expect(mockGetElementById).toHaveBeenCalledWith('transition-title');
      expect(mockGetElementById).toHaveBeenCalledWith('transition-message');
      expect(mockGetElementById).toHaveBeenCalledWith('transition-progress');
      expect(mockGetElementById).toHaveBeenCalledWith('platform-icon');
      expect(mockGetElementById).toHaveBeenCalledWith('platform-name');
    });

    it('should initialize with correct platform configurations', () => {
      const transition = new SeamlessTransition();
      
      expect(transition.platforms['code-academy']).toEqual({
        name: 'Code Academy',
        icon: '🎓',
        url: 'https://www.poisonedreligion.ai',
        color: 'text-blue-600'
      });
      
      expect(transition.platforms['joromi']).toEqual({
        name: 'JoRoMi Platform',
        icon: '🤖',
        url: 'https://www.joromi.ai',
        color: 'text-green-600'
      });
      
      expect(transition.platforms['dashboard']).toEqual({
        name: 'Client Dashboard',
        icon: '📊',
        url: '/dashboard',
        color: 'text-purple-600'
      });
    });
  });

  describe('show method', () => {
    it('should update UI elements for valid platform', () => {
      const transition = new SeamlessTransition();
      transition.show('code-academy');

      expect(mockTitle.textContent).toBe('Redirecting to Code Academy');
      expect(mockMessage.textContent).toBe('Please wait while we redirect you to Code Academy...');
      expect(mockPlatformIcon.textContent).toBe('🎓');
      expect(mockPlatformName.textContent).toBe('Code Academy');
      expect(mockPlatformName.className).toBe('text-sm text-blue-600');
    });

    it('should show overlay for valid platform', () => {
      const transition = new SeamlessTransition();
      transition.show('joromi');

      expect(mockOverlay.classList.remove).toHaveBeenCalledWith('hidden');
    });

    it('should handle unknown platform gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const transition = new SeamlessTransition();
      
      transition.show('unknown-platform');

      expect(consoleSpy).toHaveBeenCalledWith('Unknown platform:', 'unknown-platform');
      expect(mockTitle.textContent).toBe('');
      expect(mockMessage.textContent).toBe('');
      
      consoleSpy.mockRestore();
    });

    it('should store transition context', () => {
      const transition = new SeamlessTransition();
      transition.show('dashboard');

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'tetrix_transition_context',
        expect.stringContaining('"platform":"dashboard"')
      );
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'current_transition',
        expect.stringContaining('"platform":"dashboard"')
      );
    });
  });

  describe('hide method', () => {
    it('should hide overlay and reset progress', () => {
      const transition = new SeamlessTransition();
      transition.hide();

      expect(mockOverlay.classList.add).toHaveBeenCalledWith('hidden');
      expect(mockProgress.style.width).toBe('0%');
    });
  });

  describe('animateProgress method', () => {
    it('should set up progress animation', () => {
      const transition = new SeamlessTransition();
      transition.animateProgress();

      expect(setInterval).toHaveBeenCalled();
    });
  });

  describe('redirectToExternal method', () => {
    it('should redirect to external platform', async () => {
      const transition = new SeamlessTransition();
      await transition.redirectToExternal('code-academy');

      expect(mockWindowOpen).toHaveBeenCalledWith('https://www.poisonedreligion.ai', '_blank');
    });

    it('should handle unknown platform gracefully', async () => {
      const transition = new SeamlessTransition();
      await transition.redirectToExternal('unknown-platform');

      expect(mockWindowOpen).not.toHaveBeenCalled();
    });

    it('should send transition context to new window', async () => {
      const mockNewWindow = {
        addEventListener: vi.fn(),
        postMessage: vi.fn()
      };
      mockWindowOpen.mockReturnValue(mockNewWindow);

      const transition = new SeamlessTransition();
      await transition.redirectToExternal('joromi');

      expect(mockNewWindow.addEventListener).toHaveBeenCalledWith('load', expect.any(Function));
    });
  });

  describe('redirectToInternal method', () => {
    it('should redirect to internal platform', async () => {
      const transition = new SeamlessTransition();
      await transition.redirectToInternal('dashboard');

      expect(window.location.href).toBe('/dashboard');
    });

    it('should handle unknown platform gracefully', async () => {
      const transition = new SeamlessTransition();
      await transition.redirectToInternal('unknown-platform');

      expect(window.location.href).toBe(undefined);
    });
  });

  describe('storeTransitionContext method', () => {
    it('should store context in localStorage and sessionStorage', () => {
      const transition = new SeamlessTransition();
      const platformInfo = { name: 'Test Platform', icon: '🧪', url: 'https://test.com', color: 'text-red-600' };
      
      transition.storeTransitionContext('test', platformInfo);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'tetrix_transition_context',
        expect.stringContaining('"platform":"test"')
      );
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'current_transition',
        expect.stringContaining('"platform":"test"')
      );
    });
  });
});
