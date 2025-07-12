# Open WebUI Integration Guide

## Overview
This document describes how Open WebUI (an LLM chat interface) is integrated into the Tetrix application for both Data Annotators and Code Academy users. The integration provides a seamless, in-app, draggable chat window for LLM access, with rate limiting and admin controls.

---

## Architecture
- **Ollama** runs as a Docker container, exposing its API on port 11434 and managing its own models.
- **Open WebUI** runs as a Docker container, proxied to `/llm` in the frontend via Vite dev server, and configured to use Ollama via `OLLAMA_BASE_URL`.
- **Backend**: A secure, rate-limited `/llm` endpoint proxies requests to Ollama, enforcing per-user limits.
- **Frontend**: A "Chat with LLM" button is available on both dashboards. Clicking it opens a draggable window with the LLM chat (via iframe).

---

## Setup Instructions

### 1. Docker Compose
Add the following services to your `docker-compose.yml`:

```yaml
  ollama:
    image: ollama/ollama:latest
    restart: always
    ports:
      - "11434:11434"
    volumes:
      - ollama-data:/root/.ollama
    environment:
      - OLLAMA_MODELS=/root/.ollama/models

  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    restart: always
    ports:
      - "3000:8080"
    volumes:
      - open-webui-data:/app/backend/data
    extra_hosts:
      - "host.docker.internal:host-gateway"
    environment:
      - OLLAMA_BASE_URL=http://host.docker.internal:11434

volumes:
  open-webui-data:
  ollama-data:
```

Start with:
```bash
docker compose up -d
```

### 2. Vite Proxy
Add to `apps/web/vite.config.ts`:
```js
  server: {
    port: 5173,
    proxy: {
      '/llm': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/llm/, ''),
      },
    },
  },
```

---

## Backend LLM Proxy Endpoint
- Implemented in `services/api/src/routes/llm.ts` and registered in `services/api/src/index.ts`.
- **POST /llm**: Proxies requests to Ollama's `/api/generate` endpoint, applying per-user rate limiting.
- Uses the `rateLimitLLM` middleware for 10 requests/day/user (Super Admins exempt).

### Example Request
```bash
curl -X POST http://localhost:4000/llm \
  -H "Content-Type: application/json" \
  -d '{"model": "llama2", "prompt": "Hello, world!"}'
```

### Troubleshooting
- If you receive a 429 error, you have hit the daily request limit.
- If you receive a 500 error, ensure the Ollama container is running and accessible at `localhost:11434`.

---

## Frontend Usage
- The "Chat with LLM" button appears for all authenticated users on both dashboards.
- Clicking the button opens a draggable, resizable window with the LLM chat (iframe to `/llm`).
- The window can be moved, closed, and will not disrupt the user's workflow.

---

## Rate Limiting (Backend)
- Each user is limited to **10 LLM chat requests per day**.
- Super Admins are exempt and can grant more requests to users.
- Rate limiting is enforced via middleware (`services/api/src/middleware/rateLimitLLM.ts`).
- For production, use Redis or a database to persist request counts and reset daily.

### Example Middleware Usage
```ts
import { rateLimitLLM } from './middleware/rateLimitLLM';
app.post('/llm', authMiddleware, rateLimitLLM, (req, res) => { /* ... */ });
```

---

## Admin Controls
- Super Admins can reset or increment user request counts (admin endpoint to be implemented).
- For production, automate daily resets via cron or scheduled job.

---

## Developer Notes
- The draggable window is implemented in `apps/web/src/components/ui/DraggableWindow.tsx`.
- The chat button and window are integrated in both dashboard pages.
- The Open WebUI is accessed via iframe at `/llm` (proxied to Docker container).
- For custom theming, see Open WebUI documentation.

---

## Troubleshooting
- If the chat window does not load, ensure the Docker container is running and Vite proxy is configured.
- If users hit the rate limit unexpectedly, check backend persistence and time zone handling.
- If LLM responses fail, ensure Ollama is running and reachable from both the backend and Open WebUI containers.

---

## References
- [Open WebUI Documentation](https://github.com/open-webui/open-webui)
- [Ollama Documentation](https://github.com/jmorganca/ollama)
- [Express Rate Limiting](https://www.npmjs.com/package/express-rate-limit)

---

## Context7 MCP & Taskmanager MCP
- All architectural decisions and activities are logged for traceability and best practices.
- Follow context7 MCP for modular, maintainable, and secure integration. 