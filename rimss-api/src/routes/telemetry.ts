import fs from 'node:fs';
import express, { Router } from 'express';
import { z } from 'zod';

const MAX_EVENTS = 1000;

const eventSchema = z.object({
  type: z.enum(['error', 'http_retry', 'analytics']),
  message: z.string().max(500),
  context: z.record(z.string(), z.unknown()).optional(),
  route: z.string().max(200).optional(),
  ts: z.number().optional(),
});

// Stores the most recent events in a local JSON file (no external telemetry backend).
export function telemetryRoutes(file: string): Router {
  const router = Router();

  // sendBeacon posts text/plain, which the global JSON parser skips.
  router.post(
    '/telemetry',
    express.json({ type: ['application/json', 'text/plain'], limit: '10kb' }),
    (req, res) => {
      const event = eventSchema.parse(req.body);
      let events: unknown[] = [];
      try {
        events = JSON.parse(fs.readFileSync(file, 'utf8'));
      } catch {
        // Missing or corrupt file: start fresh.
      }
      events.push({ ...event, receivedAt: new Date().toISOString() });
      fs.writeFileSync(file, JSON.stringify(events.slice(-MAX_EVENTS), null, 2));
      res.status(204).end();
    },
  );

  return router;
}
