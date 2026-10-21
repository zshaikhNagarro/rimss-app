import { authRequestSchema } from '@rimss/shared';
import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import {
  clearAuthCookie,
  hashPassword,
  setAuthCookie,
  signToken,
  verifyPassword,
} from '../auth.js';
import type { UserStore } from '../auth.js';
import { HttpError } from '../errors.js';

export function authRoutes(
  users: UserStore,
  secret: string,
  secureCookie = false,
  maxPerMinute = 10,
): Router {
  const router = Router();
  // Brute-force protection on top of the global limiter.
  router.use(
    '/auth',
    rateLimit({
      windowMs: 60_000,
      limit: maxPerMinute,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
    }),
  );

  router.post('/auth/register', async (req, res) => {
    const { email, password } = authRequestSchema.parse(req.body);
    const user = await users.create(email, await hashPassword(password));
    if (!user) throw new HttpError(409, 'EMAIL_TAKEN', 'Email already registered');
    const token = signToken(user.id, secret);
    setAuthCookie(res, token, secureCookie);
    res.status(201).json({ token, user: { id: user.id, email } });
  });

  router.post('/auth/login', async (req, res) => {
    const { email, password } = authRequestSchema.parse(req.body);
    const user = await users.findByEmail(email);
    // Same error for unknown email and wrong password.
    if (!user || !(await verifyPassword(password, user.passwordHash)))
      throw new HttpError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    const token = signToken(user.id, secret);
    setAuthCookie(res, token, secureCookie);
    res.json({ token, user: { id: user.id, email } });
  });

  router.post('/auth/logout', (_req, res) => {
    clearAuthCookie(res, secureCookie);
    res.status(204).end();
  });

  return router;
}
