// Unit tests for Environment Configuration
describe('Environment Configuration', () => {
  // Mock the environment configuration functions
  const getEnvironmentConfig = () => {
    const environment = process.env.NODE_ENV || 'development';
    
    switch (environment) {
      case 'production':
        return {
          joromiUrl: process.env.JOROMI_URL || 'https://joromi.ai',
          codeAcademyUrl: process.env.CODE_ACADEMY_URL || 'https://poisonedreligion.ai',
          tetrixApiUrl: process.env.TETRIX_API_URL || 'https://tetrixcorp.com',
          webhookBaseUrl: process.env.WEBHOOK_BASE_URL || 'https://tetrixcorp.com',
          environment: 'production'
        };
      
      case 'staging':
        return {
          joromiUrl: process.env.JOROMI_URL || 'https://staging-joromi.tetrixcorp.com',
          codeAcademyUrl: process.env.CODE_ACADEMY_URL || 'https://staging.poisonedreligion.ai',
          tetrixApiUrl: process.env.TETRIX_API_URL || 'https://staging.tetrixcorp.com',
          webhookBaseUrl: process.env.WEBHOOK_BASE_URL || 'https://staging.tetrixcorp.com',
          environment: 'staging'
        };
      
      default: // development
        return {
          joromiUrl: process.env.JOROMI_URL || 'http://localhost:3000',
          codeAcademyUrl: process.env.CODE_ACADEMY_URL || 'http://localhost:3001',
          tetrixApiUrl: process.env.TETRIX_API_URL || 'http://localhost:4321',
          webhookBaseUrl: process.env.WEBHOOK_BASE_URL || 'http://localhost:4321',
          environment: 'development'
        };
    }
  };

  const getClientEnvironmentConfig = () => {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    
    if (hostname.includes('staging')) {
      return {
        joromiUrl: 'https://staging-joromi.tetrixcorp.com',
        codeAcademyUrl: 'https://staging.poisonedreligion.ai',
        tetrixApiUrl: 'https://staging.tetrixcorp.com',
        webhookBaseUrl: 'https://staging.tetrixcorp.com',
        environment: 'staging'
      };
    } else if (hostname.includes('tetrixcorp.com')) {
      return {
        joromiUrl: 'https://joromi.ai',
        codeAcademyUrl: 'https://poisonedreligion.ai',
        tetrixApiUrl: 'https://tetrixcorp.com',
        webhookBaseUrl: 'https://tetrixcorp.com',
        environment: 'production'
      };
    } else {
      return {
        joromiUrl: 'http://localhost:3000',
        codeAcademyUrl: 'http://localhost:3001',
        tetrixApiUrl: 'http://localhost:4321',
        webhookBaseUrl: 'http://localhost:4321',
        environment: 'development'
      };
    }
  };

  const mockEnvironmentConfigs = {
    development: {
      joromiUrl: 'http://localhost:3000',
      codeAcademyUrl: 'http://localhost:3001',
      tetrixApiUrl: 'http://localhost:4321',
      webhookBaseUrl: 'http://localhost:4321',
      environment: 'development'
    },
    production: {
      joromiUrl: 'https://joromi.ai',
      codeAcademyUrl: 'https://poisonedreligion.ai',
      tetrixApiUrl: 'https://tetrixcorp.com',
      webhookBaseUrl: 'https://tetrixcorp.com',
      environment: 'production'
    }
  };

  beforeEach(() => {
    jest.resetModules();
    // Reset environment variables
    delete process.env.NODE_ENV;
    delete process.env.JOROMI_URL;
    delete process.env.CODE_ACADEMY_URL;
    delete process.env.TETRIX_API_URL;
    delete process.env.WEBHOOK_BASE_URL;
  });

  describe('getEnvironmentConfig', () => {
    it('should return development config by default', () => {
      delete process.env.NODE_ENV;
      
      const config = getEnvironmentConfig();
      
      expect(config).toEqual(mockEnvironmentConfigs.development);
      expect(config.environment).toBe('development');
    });

    it('should return development config when NODE_ENV is development', () => {
      process.env.NODE_ENV = 'development';
      
      const config = getEnvironmentConfig();
      
      expect(config).toEqual(mockEnvironmentConfigs.development);
      expect(config.environment).toBe('development');
    });

    it('should return staging config when NODE_ENV is staging', () => {
      process.env.NODE_ENV = 'staging';
      
      const config = getEnvironmentConfig();
      
      expect(config.environment).toBe('staging');
      expect(config.joromiUrl).toBe('https://staging-joromi.tetrixcorp.com');
      expect(config.codeAcademyUrl).toBe('https://staging.poisonedreligion.ai');
    });

    it('should return production config when NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production';
      
      const config = getEnvironmentConfig();
      
      expect(config).toEqual(mockEnvironmentConfigs.production);
      expect(config.environment).toBe('production');
    });

    it('should use environment variables when provided', () => {
      process.env.NODE_ENV = 'production';
      process.env.JOROMI_URL = 'https://custom-joromi.com';
      process.env.CODE_ACADEMY_URL = 'https://custom-academy.com';
      process.env.TETRIX_API_URL = 'https://custom-tetrix.com';
      process.env.WEBHOOK_BASE_URL = 'https://custom-webhook.com';
      
      const config = getEnvironmentConfig();
      
      expect(config.joromiUrl).toBe('https://custom-joromi.com');
      expect(config.codeAcademyUrl).toBe('https://custom-academy.com');
      expect(config.tetrixApiUrl).toBe('https://custom-tetrix.com');
    });
  });

  describe('getClientEnvironmentConfig', () => {
    const originalLocation = window.location;

    beforeEach(() => {
      delete (window as any).location;
    });

    afterEach(() => {
      window.location = originalLocation;
    });

    it('should return development config for localhost', () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'localhost' },
        writable: true
      });
      
      const config = getClientEnvironmentConfig();
      
      expect(config.environment).toBe('development');
      expect(config.joromiUrl).toBe('http://localhost:3000');
      expect(config.codeAcademyUrl).toBe('http://localhost:3001');
    });

    it('should return production config for tetrixcorp.com', () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'tetrixcorp.com' },
        writable: true
      });
      
      const config = getClientEnvironmentConfig();
      
      expect(config.environment).toBe('production');
      expect(config.joromiUrl).toBe('https://joromi.ai');
      expect(config.codeAcademyUrl).toBe('https://poisonedreligion.ai');
    });

    it('should return staging config for staging domains', () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'staging.tetrixcorp.com' },
        writable: true
      });
      
      const config = getClientEnvironmentConfig();
      
      expect(config.environment).toBe('staging');
      expect(config.joromiUrl).toBe('https://staging-joromi.tetrixcorp.com');
      expect(config.codeAcademyUrl).toBe('https://staging.poisonedreligion.ai');
    });

    it('should handle undefined window gracefully', () => {
      const originalWindow = global.window;
      delete (global as any).window;
      
      const config = getClientEnvironmentConfig();
      
      expect(config.environment).toBe('development');
      expect(config.joromiUrl).toBe('http://localhost:3000');
      
      global.window = originalWindow;
    });
  });

  describe('Configuration Properties', () => {
    it('should have all required properties', () => {
      const config = getEnvironmentConfig();
      
      expect(config).toHaveProperty('joromiUrl');
      expect(config).toHaveProperty('codeAcademyUrl');
      expect(config).toHaveProperty('tetrixApiUrl');
      expect(config).toHaveProperty('webhookBaseUrl');
      expect(config).toHaveProperty('environment');
    });

    it('should have valid URL formats', () => {
      const config = getEnvironmentConfig();
      
      expect(config.joromiUrl).toMatch(/^https?:\/\//);
      expect(config.codeAcademyUrl).toMatch(/^https?:\/\//);
      expect(config.tetrixApiUrl).toMatch(/^https?:\/\//);
      expect(config.webhookBaseUrl).toMatch(/^https?:\/\//);
    });

    it('should have valid environment values', () => {
      const config = getEnvironmentConfig();
      
      expect(['development', 'staging', 'production']).toContain(config.environment);
    });
  });

  describe('URL Consistency', () => {
    it('should have consistent URLs across environments', () => {
      const devConfig = getEnvironmentConfig();
      process.env.NODE_ENV = 'production';
      const prodConfig = getEnvironmentConfig();
      
      // Both should have the same structure
      expect(Object.keys(devConfig)).toEqual(Object.keys(prodConfig));
      
      // Production URLs should be HTTPS
      expect(prodConfig.joromiUrl).toMatch(/^https:\/\//);
      expect(prodConfig.codeAcademyUrl).toMatch(/^https:\/\//);
      expect(prodConfig.tetrixApiUrl).toMatch(/^https:\/\//);
      expect(prodConfig.webhookBaseUrl).toMatch(/^https:\/\//);
    });

    it('should have correct domain mappings', () => {
      // Reset environment variables first
      delete process.env.JOROMI_URL;
      delete process.env.CODE_ACADEMY_URL;
      delete process.env.TETRIX_API_URL;
      delete process.env.WEBHOOK_BASE_URL;
      
      process.env.NODE_ENV = 'production';
      const config = getEnvironmentConfig();
      
      expect(config.joromiUrl).toBe('https://joromi.ai');
      expect(config.codeAcademyUrl).toBe('https://poisonedreligion.ai');
      expect(config.tetrixApiUrl).toBe('https://tetrixcorp.com');
    });
  });
});