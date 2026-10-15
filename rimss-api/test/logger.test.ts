import { Writable } from 'node:stream';
import pino from 'pino';
import { describe, expect, it } from 'vitest';
import { REDACT_PATHS } from '../src/logger.js';

describe('log redaction', () => {
  it('masks credentials and push-subscription secrets', () => {
    let out = '';
    const stream = new Writable({
      write(chunk, _enc, cb) {
        out += chunk.toString();
        cb();
      },
    });
    const log = pino({ redact: { paths: REDACT_PATHS, censor: '[REDACTED]' } }, stream);

    log.info({
      req: { headers: { authorization: 'Bearer secret', cookie: 'sid=1' } },
      sub: { endpoint: 'https://push.example/abc', keys: { p256dh: 'pk', auth: 'ak' } },
      user: { password: 'hunter2' },
      ok: 'visible',
    });

    expect(out).not.toMatch(/Bearer secret|sid=1|push\.example|hunter2|"pk"|"ak"/);
    expect(out).toContain('[REDACTED]');
    expect(out).toContain('visible');
  });
});
