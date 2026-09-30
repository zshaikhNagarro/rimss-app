import { timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { HttpError } from './errors.js';

export function requireAdmin(adminKey?: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!adminKey)
      return next(new HttpError(503, 'ADMIN_DISABLED', 'ADMIN_API_KEY is not configured'));
    const given = Buffer.from(String(req.header('x-api-key') ?? ''));
    const expected = Buffer.from(adminKey);
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
      return next(new HttpError(401, 'UNAUTHORIZED', 'Invalid API key'));
    }
    next();
  };
}
