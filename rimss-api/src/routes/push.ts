import { pushBroadcastSchema, pushSubscriptionSchema } from '@rimss/shared';
import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin } from '../middleware.js';
import type { PushService } from '../push.js';

export function pushRoutes(push: PushService, adminApiKey?: string): Router {
  const router = Router();

  router.get('/push/public-key', (_req, res) => res.json({ publicKey: push.publicKey }));

  router.post('/push/subscribe', async (req, res) => {
    const sub = pushSubscriptionSchema.parse(req.body);
    await push.subscribe({
      endpoint: sub.endpoint,
      expirationTime: sub.expirationTime ?? null,
      keys: sub.keys,
    });
    res.status(201).json({ ok: true });
  });

  router.post('/push/unsubscribe', async (req, res) => {
    const { endpoint } = z.object({ endpoint: z.string().min(1) }).parse(req.body);
    await push.unsubscribe(endpoint);
    res.json({ ok: true });
  });

  router.post('/push/send', requireAdmin(adminApiKey), async (req, res) => {
    const payload = pushBroadcastSchema.parse(req.body ?? {});
    res.json({ sent: await push.broadcast(payload) });
  });

  return router;
}
