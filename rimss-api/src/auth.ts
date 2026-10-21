import { randomBytes, randomUUID, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { HttpError } from './errors.js';

const scryptAsync = promisify(scrypt) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

export interface User {
  id: string;
  email: string;
  passwordHash: string;
}

export interface UserStore {
  /** Returns undefined when the email is already registered. */
  create(email: string, passwordHash: string): Promise<User | undefined>;
  findByEmail(email: string): Promise<User | undefined>;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, 64);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, 'hex');
  const actual = await scryptAsync(password, Buffer.from(salt, 'hex'), expected.length);
  return timingSafeEqual(actual, expected);
}

export function createMemoryUserStore(): UserStore {
  const byEmail = new Map<string, User>();
  return {
    async create(email, passwordHash) {
      if (byEmail.has(email)) return undefined;
      const user = { id: randomUUID(), email, passwordHash };
      byEmail.set(email, user);
      return user;
    },
    findByEmail: async (email) => byEmail.get(email),
  };
}

export const signToken = (userId: string, secret: string): string =>
  jwt.sign({}, secret, { subject: userId, expiresIn: '1h', algorithm: 'HS256' });

function readUserId(req: Request, secret: string): string | undefined {
  const header = req.header('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : readCookie(req, AUTH_COOKIE);
  if (!token) return undefined;
  try {
    const payload = jwt.verify(token, secret, { algorithms: ['HS256'] });
    return typeof payload === 'object' ? payload.sub : undefined;
  } catch {
    return undefined;
  }
}

export const AUTH_COOKIE = 'rimss_token';

function readCookie(req: Request, name: string): string | undefined {
  for (const part of (req.header('cookie') ?? '').split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return undefined;
}

// httpOnly keeps the token away from page scripts; Lax blocks cross-site POSTs (CSRF).
const cookieOptions = (secure: boolean) =>
  ({ httpOnly: true, sameSite: 'lax', secure, path: '/api' }) as const;

export const setAuthCookie = (res: Response, token: string, secure: boolean) =>
  res.cookie(AUTH_COOKIE, token, { ...cookieOptions(secure), maxAge: 3_600_000 });

export const clearAuthCookie = (res: Response, secure: boolean) =>
  res.clearCookie(AUTH_COOKIE, cookieOptions(secure));

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
  }
}

/** Attaches req.userId when a valid bearer token is present; never rejects. */
export const optionalAuth =
  (secret: string) => (req: Request, _res: Response, next: NextFunction) => {
    req.userId = readUserId(req, secret);
    next();
  };

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.userId) return next(new HttpError(401, 'UNAUTHORIZED', 'Sign in required'));
  next();
}
