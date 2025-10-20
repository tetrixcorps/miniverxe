// Graceful shutdown handler for DigitalOcean App Platform
// This ensures in-flight requests are completed before the process exits

interface ShutdownHandler {
  name: string;
  handler: () => Promise<void> | void;
  timeout?: number;
}

class GracefulShutdown {
  private handlers: ShutdownHandler[] = [];
  private isShuttingDown = false;
  private shutdownTimeout = 30000; // 30 seconds default timeout

  constructor() {
    this.setupSignalHandlers();
  }

  // Register a shutdown handler
  register(handler: ShutdownHandler): void {
    this.handlers.push(handler);
  }

  // Setup signal handlers for graceful shutdown
  private setupSignalHandlers(): void {
    // Handle SIGTERM (DigitalOcean App Platform sends this)
    process.on('SIGTERM', () => {
      console.log('Received SIGTERM, starting graceful shutdown...');
      this.shutdown('SIGTERM');
    });

    // Handle SIGINT (Ctrl+C)
    process.on('SIGINT', () => {
      console.log('Received SIGINT, starting graceful shutdown...');
      this.shutdown('SIGINT');
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      this.shutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      this.shutdown('unhandledRejection');
    });
  }

  // Execute graceful shutdown
  private async shutdown(signal: string): Promise<void> {
    if (this.isShuttingDown) {
      console.log('Shutdown already in progress, ignoring signal:', signal);
      return;
    }

    this.isShuttingDown = true;
    console.log(`Graceful shutdown initiated by ${signal}`);

    // Set a timeout to force exit if shutdown takes too long
    const forceExitTimer = setTimeout(() => {
      console.error('Graceful shutdown timeout exceeded, forcing exit');
      process.exit(1);
    }, this.shutdownTimeout);

    try {
      // Execute all registered handlers in parallel
      const handlerPromises = this.handlers.map(async (handler) => {
        const timeout = handler.timeout || 5000; // 5 second default per handler
        
        try {
          console.log(`Executing shutdown handler: ${handler.name}`);
          
          const handlerPromise = Promise.resolve(handler.handler());
          const timeoutPromise = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error(`Handler ${handler.name} timed out`)), timeout)
          );
          
          await Promise.race([handlerPromise, timeoutPromise]);
          console.log(`Shutdown handler completed: ${handler.name}`);
        } catch (error) {
          console.error(`Shutdown handler failed: ${handler.name}`, error);
        }
      });

      await Promise.allSettled(handlerPromises);
      
      clearTimeout(forceExitTimer);
      console.log('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      console.error('Error during graceful shutdown:', error);
      clearTimeout(forceExitTimer);
      process.exit(1);
    }
  }

  // Set the shutdown timeout
  setTimeout(timeout: number): void {
    this.shutdownTimeout = timeout;
  }

  // Check if shutdown is in progress
  isShuttingDownInProgress(): boolean {
    return this.isShuttingDown;
  }
}

// Create singleton instance
export const gracefulShutdown = new GracefulShutdown();

// Default handlers for common cleanup tasks
gracefulShutdown.register({
  name: 'health-check-cleanup',
  handler: () => {
    console.log('Cleaning up health check resources...');
    // Add any health check cleanup here
  },
  timeout: 2000
});

gracefulShutdown.register({
  name: 'database-cleanup',
  handler: () => {
    console.log('Closing database connections...');
    // Add database cleanup here if needed
  },
  timeout: 5000
});

gracefulShutdown.register({
  name: 'api-cleanup',
  handler: () => {
    console.log('Cleaning up API resources...');
    // Add API cleanup here if needed
  },
  timeout: 3000
});

// Export the class for custom handlers
export { GracefulShutdown };
export type { ShutdownHandler };
