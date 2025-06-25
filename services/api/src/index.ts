import express from 'express';
import cors from 'cors';
import ticketsRouter from './routes/tickets';
import projectsRouter from './routes/projects';
import usersRouter from './routes/users';
import walletRouter from './routes/wallet';
import lsWebhookRouter from './routes/lsWebhook';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// TODO: Add logging, error handling, security headers, rate limiting

// Health check endpoint
app.get('/health', (_, res) => res.send('ok'));

// Mount routes
app.use('/tickets', ticketsRouter);
app.use('/projects', projectsRouter);
app.use('/users', usersRouter);
app.use('/wallet', walletRouter);
app.use('/ls/webhook', lsWebhookRouter);

// TODO: Add global error handler

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API listening on :${PORT}`)); 