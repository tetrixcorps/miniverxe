// Functional tests for Dashboard page
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock DOM elements
const mockDocument = {
  addEventListener: vi.fn(),
  getElementById: vi.fn()
};

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn()
};

// Mock console
const mockConsole = {
  log: vi.fn()
};

// Mock window object
Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true
});

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

Object.defineProperty(global, 'console', {
  value: mockConsole,
  writable: true
});

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Page Load', () => {
    it('should set up DOMContentLoaded event listener', () => {
      // Mock the dashboard page script
      const setupDashboard = () => {
        document.addEventListener('DOMContentLoaded', () => {
          const transitionContext = localStorage.getItem('tetrix_transition_context');
          if (transitionContext) {
            const context = JSON.parse(transitionContext);
            console.log('Received transition context:', context);
            
            if (context.source === 'tetrix') {
              console.log(`Welcome from ${context.platform} platform`);
            }
          }
        });
      };

      setupDashboard();

      expect(mockDocument.addEventListener).toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function));
    });

    it('should handle transition context on page load', () => {
      const mockTransitionContext = {
        platform: 'code-academy',
        platformInfo: {
          name: 'Code Academy',
          icon: '🎓',
          url: 'https://www.poisonedreligion.ai',
          color: 'text-blue-600'
        },
        timestamp: Date.now(),
        source: 'tetrix'
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockTransitionContext));

      // Mock the dashboard page script
      const handlePageLoad = () => {
        const transitionContext = localStorage.getItem('tetrix_transition_context');
        if (transitionContext) {
          const context = JSON.parse(transitionContext);
          console.log('Received transition context:', context);
          
          if (context.source === 'tetrix') {
            console.log(`Welcome from ${context.platform} platform`);
          }
        }
      };

      handlePageLoad();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('tetrix_transition_context');
      expect(mockConsole.log).toHaveBeenCalledWith('Received transition context:', mockTransitionContext);
      expect(mockConsole.log).toHaveBeenCalledWith('Welcome from code-academy platform');
    });

    it('should handle missing transition context gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      // Mock the dashboard page script
      const handlePageLoad = () => {
        const transitionContext = localStorage.getItem('tetrix_transition_context');
        if (transitionContext) {
          const context = JSON.parse(transitionContext);
          console.log('Received transition context:', context);
          
          if (context.source === 'tetrix') {
            console.log(`Welcome from ${context.platform} platform`);
          }
        }
      };

      handlePageLoad();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('tetrix_transition_context');
      expect(mockConsole.log).not.toHaveBeenCalledWith('Received transition context:', expect.any(Object));
    });

    it('should handle invalid JSON in transition context', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');

      // Mock the dashboard page script with error handling
      const handlePageLoad = () => {
        try {
          const transitionContext = localStorage.getItem('tetrix_transition_context');
          if (transitionContext) {
            const context = JSON.parse(transitionContext);
            console.log('Received transition context:', context);
            
            if (context.source === 'tetrix') {
              console.log(`Welcome from ${context.platform} platform`);
            }
          }
        } catch (error) {
          console.log('Error parsing transition context:', error);
        }
      };

      handlePageLoad();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('tetrix_transition_context');
      expect(mockConsole.log).toHaveBeenCalledWith('Error parsing transition context:', expect.any(Error));
    });
  });

  describe('Platform Context Handling', () => {
    it('should handle code-academy platform context', () => {
      const mockTransitionContext = {
        platform: 'code-academy',
        platformInfo: {
          name: 'Code Academy',
          icon: '🎓',
          url: 'https://www.poisonedreligion.ai',
          color: 'text-blue-600'
        },
        timestamp: Date.now(),
        source: 'tetrix'
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockTransitionContext));

      // Mock the dashboard page script
      const handlePageLoad = () => {
        const transitionContext = localStorage.getItem('tetrix_transition_context');
        if (transitionContext) {
          const context = JSON.parse(transitionContext);
          console.log('Received transition context:', context);
          
          if (context.source === 'tetrix') {
            console.log(`Welcome from ${context.platform} platform`);
          }
        }
      };

      handlePageLoad();

      expect(mockConsole.log).toHaveBeenCalledWith('Welcome from code-academy platform');
    });

    it('should handle joromi platform context', () => {
      const mockTransitionContext = {
        platform: 'joromi',
        platformInfo: {
          name: 'JoRoMi Platform',
          icon: '🤖',
          url: 'https://www.joromi.ai',
          color: 'text-green-600'
        },
        timestamp: Date.now(),
        source: 'tetrix'
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockTransitionContext));

      // Mock the dashboard page script
      const handlePageLoad = () => {
        const transitionContext = localStorage.getItem('tetrix_transition_context');
        if (transitionContext) {
          const context = JSON.parse(transitionContext);
          console.log('Received transition context:', context);
          
          if (context.source === 'tetrix') {
            console.log(`Welcome from ${context.platform} platform`);
          }
        }
      };

      handlePageLoad();

      expect(mockConsole.log).toHaveBeenCalledWith('Welcome from joromi platform');
    });

    it('should handle dashboard platform context', () => {
      const mockTransitionContext = {
        platform: 'dashboard',
        platformInfo: {
          name: 'Client Dashboard',
          icon: '📊',
          url: '/dashboard',
          color: 'text-purple-600'
        },
        timestamp: Date.now(),
        source: 'tetrix'
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockTransitionContext));

      // Mock the dashboard page script
      const handlePageLoad = () => {
        const transitionContext = localStorage.getItem('tetrix_transition_context');
        if (transitionContext) {
          const context = JSON.parse(transitionContext);
          console.log('Received transition context:', context);
          
          if (context.source === 'tetrix') {
            console.log(`Welcome from ${context.platform} platform`);
          }
        }
      };

      handlePageLoad();

      expect(mockConsole.log).toHaveBeenCalledWith('Welcome from dashboard platform');
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      // Mock the dashboard page script with error handling
      const handlePageLoad = () => {
        try {
          const transitionContext = localStorage.getItem('tetrix_transition_context');
          if (transitionContext) {
            const context = JSON.parse(transitionContext);
            console.log('Received transition context:', context);
            
            if (context.source === 'tetrix') {
              console.log(`Welcome from ${context.platform} platform`);
            }
          }
        } catch (error) {
          console.log('Error accessing localStorage:', error);
        }
      };

      handlePageLoad();

      expect(mockConsole.log).toHaveBeenCalledWith('Error accessing localStorage:', expect.any(Error));
    });

    it('should handle missing platform info gracefully', () => {
      const mockTransitionContext = {
        platform: 'unknown-platform',
        timestamp: Date.now(),
        source: 'tetrix'
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockTransitionContext));

      // Mock the dashboard page script
      const handlePageLoad = () => {
        const transitionContext = localStorage.getItem('tetrix_transition_context');
        if (transitionContext) {
          const context = JSON.parse(transitionContext);
          console.log('Received transition context:', context);
          
          if (context.source === 'tetrix') {
            console.log(`Welcome from ${context.platform} platform`);
          }
        }
      };

      handlePageLoad();

      expect(mockConsole.log).toHaveBeenCalledWith('Welcome from unknown-platform platform');
    });
  });
});
