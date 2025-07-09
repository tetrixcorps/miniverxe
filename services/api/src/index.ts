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

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Production enhancements needed: logging, error handling, security headers, rate limiting

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

// Global error handler should be implemented for production deployment

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API listening on :${PORT}`)); 