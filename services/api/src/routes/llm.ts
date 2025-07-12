import express from 'express';
import axios from 'axios';
import { rateLimitLLM } from '../middleware/rateLimitLLM';
import http from 'http';
import https from 'https';

const router = express.Router();

// Helper: Stream proxy to Ollama
async function proxyStreamToOllama(
  req: express.Request,
  res: express.Response,
  ollamaPath: string
) {
  const isSecure = ollamaPath.startsWith('https://');
  const client = isSecure ? https : http;
  const url = new URL(ollamaPath);

  const ollamaReq = client.request(
    {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    },
    ollamaRes => {
      res.status(ollamaRes.statusCode || 200);
      Object.entries(ollamaRes.headers).forEach(([k, v]) => {
        if (k.toLowerCase() === 'transfer-encoding') return; // skip
        res.setHeader(k, v as string);
      });
      ollamaRes.pipe(res);
    }
  );
  ollamaReq.on('error', err => {
    res.status(500).json({ error: 'Failed to connect to LLM service.' });
  });
  ollamaReq.write(JSON.stringify(req.body));
  ollamaReq.end();
}

// Proxy POST /llm to Ollama API (http://localhost:11434)
router.post('/', rateLimitLLM, async (req, res) => {
  try {
    const stream = req.body.stream === true;
    if (stream) {
      // Stream response from Ollama to client
      await proxyStreamToOllama(req, res, 'http://localhost:11434/api/generate');
      return;
    }
    // Non-streaming: use axios for simple proxy
    const ollamaRes = await axios.post('http://localhost:11434/api/generate', req.body, {
      headers: { 'Content-Type': 'application/json' },
    });
    res.status(ollamaRes.status).json(ollamaRes.data);
  } catch (err: any) {
    if (err.response) {
      res.status(err.response.status).json(err.response.data);
    } else {
      res.status(500).json({ error: 'Failed to connect to LLM service.' });
    }
  }
});

// TODO: Add more endpoints as needed (e.g., GET /llm/models)

export default router; 