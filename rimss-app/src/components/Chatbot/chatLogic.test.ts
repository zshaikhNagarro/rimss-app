import { beforeEach, describe, expect, it } from 'vitest';
import { appendExchange, greeting, loadMessages, reply, saveMessages } from './chatLogic';

beforeEach(() => localStorage.clear());

describe('reply', () => {
  it('falls back when no keyword matches', () => {
    const r = reply('zzzz qqqq');
    expect(r.text).toBeTruthy();
    expect(r.products).toBeUndefined();
  });

  it('is case-insensitive and can attach products', () => {
    const r = reply('Show me JACKETS');
    expect(r.products?.length).toBeGreaterThan(0);
  });
});

describe('appendExchange', () => {
  it('appends the user message and a bot reply with increasing ids', () => {
    const next = appendExchange(greeting(), 'hello');
    expect(next.map((m) => m.from)).toEqual(['bot', 'user', 'bot']);
    expect(next.map((m) => m.id)).toEqual([1, 2, 3]);
  });

  it('starts ids at 1 for an empty history', () => {
    expect(appendExchange([], 'hi')[0].id).toBe(1);
  });
});

describe('persistence', () => {
  it('round-trips messages', () => {
    const messages = appendExchange(greeting(), 'hello');
    saveMessages(messages);
    expect(loadMessages()).toEqual(messages);
  });

  it('starts fresh when storage is empty or corrupt', () => {
    expect(loadMessages()).toEqual(greeting());
    localStorage.setItem('rimss.chat.v1', '{not json');
    expect(loadMessages()).toEqual(greeting());
  });
});
