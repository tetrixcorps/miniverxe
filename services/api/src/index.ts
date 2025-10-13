import express from 'express';
import cors from 'cors';
import ticketsRouter from './routes/tickets';
import projectsRouter from './routes/projects';
import usersRouter from './routes/users';
import walletRouter from './routes/wallet';
import lsWebhookRouter from './routes/lsWebhook';
import dataLabelingRouter from './routes/data-labeling';
import dataAnnotatorRouter from './routes/data-annotator';
import academyRouter from './routes/academy';
import authRouter from './routes/auth';
import contactRouter from './routes/contact';
import analyticsRouter from './routes/analytics';
import { securityMiddleware, errorHandler, validateRequest, sanitizeInput, logger } from './middleware/security';

const app = express();

// Security middleware (must be first)
securityMiddleware(app);

// CORS configuration for cross-platform management
app.use(cors({
  origin: [
    'https://tetrixcorp.com',
    'https://joromi.ai', 
    'https://iot.tetrixcorp.com',
    'https://api.tetrixcorp.com',
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000', 'http://localhost:5173'] : [])
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token']
}));

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input validation and sanitization
app.use(validateRequest);
app.use(sanitizeInput);

// Health check endpoint
app.get('/health', (_, res) => res.send('ok'));

// Mount routes
app.use('/tickets', ticketsRouter);
app.use('/projects', projectsRouter);
app.use('/users', usersRouter);
app.use('/wallet', walletRouter);
app.use('/ls/webhook', lsWebhookRouter);
app.use('/data-labeling', dataLabelingRouter);
app.use('/data-annotator', dataAnnotatorRouter);
app.use('/academy', academyRouter);
app.use('/auth', authRouter);
app.use('/contact', contactRouter);
app.use('/api', analyticsRouter); // This provides /api/metrics endpoint

// Global error handler
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  logger.warn('404 - Route not found:', {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  res.status(404).json({
    error: 'Route not found',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  logger.info(`TETRIX API Server started on port ${PORT}`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
}); 