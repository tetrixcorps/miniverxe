import request from 'supertest';
import express from 'express'; // Import express to type 'app'
import cors from 'cors';
import ticketsRouter from './routes/tickets';
import projectsRouter from './routes/projects';
import usersRouter from './routes/users';
import walletRouter from './routes/wallet';
import lsWebhookRouter from './routes/lsWebhook';

// Create a test instance of the app
// We are re-defining the app here to ensure it's a fresh instance for testing
// and to avoid potential issues with the singleton app instance from index.ts
// if it has state that could interfere with tests.
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (_, res) => res.send('ok'));

// Mount routes
app.use('/tickets', ticketsRouter);
app.use('/projects', projectsRouter);
app.use('/users', usersRouter);
app.use('/wallet', walletRouter);
app.use('/ls/webhook', lsWebhookRouter);


describe('API Health Check', () => {
  it('GET /health should respond with 200 and "ok"', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.text).toBe('ok');
  });
});
