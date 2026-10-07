import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import pino from 'pino';
import type { Logger } from 'pino';
import { pinoHttp } from 'pino-http';

export type { Logger };

// Masks credentials and push-subscription secrets wherever they appear in log objects.
export const REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers["x-api-key"]',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
  'req.body.endpoint',
  'req.body.keys',
  '*.endpoint',
  '*.keys',
  '*.p256dh',
  '*.auth',
  '*.password',
  '*.token',
  '*.apiKey',
];

export const createLogger = (level: string): Logger =>
  pino({ level, redact: { paths: REDACT_PATHS, censor: '[REDACTED]' } });

// Reuses a well-formed inbound x-request-id so traces span proxy and API.
export function requestLogger(logger: Logger) {
  return pinoHttp({
    logger,
    genReqId(req: IncomingMessage, res: ServerResponse) {
      const inbound = req.headers['x-request-id'];
      const id =
        typeof inbound === 'string' && /^[\w.-]{8,64}$/.test(inbound) ? inbound : randomUUID();
      res.setHeader('x-request-id', id);
      return id;
    },
    redact: { paths: REDACT_PATHS, censor: '[REDACTED]' },
  });
}
