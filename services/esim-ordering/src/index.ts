import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import ordersRouter from './controllers/orders';
import esimRouter from './controllers/esim';
import plansRouter from './controllers/plans';
import paymentsRouter from './controllers/payments';
import webhooksRouter from './controllers/webhooks';

const app = express();
const PORT = process.env.PORT || 4001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration for cross-platform management
app.use(cors({
  origin: [
    'https://tetrixcorp.com',
    'https://joromi.ai',
    'https://iot.tetrixcorp.com',
    'https://api.tetrixcorp.com',
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000', 'http://localhost:4001'] : [])
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Key']
}));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (_, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'tetrix-esim-ordering',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Status endpoint
app.get('/status', (_, res) => {
  res.status(200).json({
    service: 'tetrix-esim-ordering',
    status: 'operational',
    endpoints: {
      orders: '/orders',
      esim: '/esim',
      plans: '/plans',
      payments: '/payments',
      webhooks: '/webhooks'
    },
    capabilities: {
      orderManagement: true,
      esimProvisioning: true,
      planManagement: true,
      paymentProcessing: true,
      webhookSupport: true
    }
  });
});

// Mount routes
app.use('/orders', ordersRouter);
app.use('/esim', esimRouter);
app.use('/plans', plansRouter);
app.use('/payments', paymentsRouter);
app.use('/webhooks', webhooksRouter);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 TETRIX eSIM Ordering Service running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 Status: http://localhost:${PORT}/status`);
});

export default app;
