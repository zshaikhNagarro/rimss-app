import { Router } from 'express';

export function healthRoutes(ping?: () => Promise<void>): Router {
  const router = Router();

  router.get('/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

  router.get('/ready', async (_req, res) => {
    try {
      await ping?.();
      res.json({ status: 'ready' });
    } catch {
      res.status(503).json({ error: { code: 'NOT_READY', message: 'Dependency unavailable' } });
    }
  });

  return router;
}
