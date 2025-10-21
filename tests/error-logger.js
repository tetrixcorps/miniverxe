// Comprehensive Error Logger for Authentication Testing
class AuthErrorLogger {
  constructor() {
    this.logs = [];
    this.errors = [];
    this.warnings = [];
    this.verboseLogs = [];
    this.startTime = Date.now();
    
    this.setupConsoleCapture();
    this.setupErrorHandlers();
    this.setupPerformanceMonitoring();
  }
  
  setupConsoleCapture() {
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info
    };
    
    const captureLog = (level, args) => {
      const message = Array.from(args).map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      const logEntry = {
        level,
        message,
        timestamp: new Date().toISOString(),
        elapsed: Date.now() - this.startTime,
        stack: new Error().stack
      };
      
      this.logs.push(logEntry);
      
      // Categorize logs
      if (level === 'error') {
        this.errors.push(logEntry);
      } else if (level === 'warn') {
        this.warnings.push(logEntry);
      } else if (message.includes('[VERBOSE]')) {
        this.verboseLogs.push(logEntry);
      }
      
      // Call original console method
      originalConsole[level].apply(console, args);
    };
    
    console.log = (...args) => captureLog('log', args);
    console.error = (...args) => captureLog('error', args);
    console.warn = (...args) => captureLog('warn', args);
    console.info = (...args) => captureLog('info', args);
  }
  
  setupErrorHandlers() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.logs.push({
        level: 'error',
        message: `Global Error: ${event.error?.message || event.message}`,
        timestamp: new Date().toISOString(),
        elapsed: Date.now() - this.startTime,
        stack: event.error?.stack,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.logs.push({
        level: 'error',
        message: `Unhandled Promise Rejection: ${event.reason}`,
        timestamp: new Date().toISOString(),
        elapsed: Date.now() - this.startTime,
        stack: event.reason?.stack
      });
    });
  }
  
  setupPerformanceMonitoring() {
    // Monitor script loading
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'script') {
          this.logs.push({
            level: 'info',
            message: `Script loaded: ${entry.name} (${entry.duration}ms)`,
            timestamp: new Date().toISOString(),
            elapsed: Date.now() - this.startTime,
            duration: entry.duration,
            scriptName: entry.name
          });
        }
      }
    });
    
    observer.observe({ entryTypes: ['script', 'navigation'] });
  }
  
  getLogs() {
    return {
      all: this.logs,
      errors: this.errors,
      warnings: this.warnings,
      verbose: this.verboseLogs,
      summary: {
        total: this.logs.length,
        errors: this.errors.length,
        warnings: this.warnings.length,
        verbose: this.verboseLogs.length,
        duration: Date.now() - this.startTime
      }
    };
  }
  
  exportLogs() {
    const data = {
      logs: this.getLogs(),
      environment: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        readyState: document.readyState,
        windowKeys: Object.keys(window).length,
        scripts: Array.from(document.querySelectorAll('script')).map(s => ({
          src: s.src,
          type: s.type,
          async: s.async,
          defer: s.defer
        }))
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auth-error-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  analyzeErrors() {
    const analysis = {
      criticalErrors: this.errors.filter(e => 
        e.message.includes('not available') || 
        e.message.includes('failed') ||
        e.message.includes('blocked')
      ),
      timingIssues: this.verboseLogs.filter(v => 
        v.message.includes('waiting') || 
        v.message.includes('attempt')
      ),
      functionAvailability: {
        openIndustryAuthModal: typeof window.openIndustryAuthModal,
        openClientLogin: typeof window.openClientLogin,
        tetrixAuthContext: typeof window.tetrixAuthContext
      }
    };
    
    return analysis;
  }
}

// Initialize global error logger
window.authErrorLogger = new AuthErrorLogger();

// Export for use in tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthErrorLogger;
}
