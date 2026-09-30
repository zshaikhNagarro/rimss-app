import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import pino from 'pino';
import type { Logger } from 'pino';
import { pinoHttp } from 'pino-http';

export type { Logger };

export const createLogger = (level: string): Logger => pino({ level });

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
    redact: ['req.headers.authorization', 'req.headers["x-api-key"]', 'req.headers.cookie'],
  });
}
