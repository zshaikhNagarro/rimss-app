import responses from './responses.json';

export interface ChatProduct {
  name: string;
  price: number;
  note: string;
}

export interface ChatMessage {
  id: number;
  from: 'user' | 'bot';
  text: string;
  products?: ChatProduct[];
}

const STORAGE_KEY = 'rimss.chat.v1';

export const greeting = (): ChatMessage[] => [{ id: 1, from: 'bot', text: responses.greeting }];

export function loadMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as ChatMessage[]) : null;
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // corrupt or unavailable storage: start fresh
  }
  return greeting();
}

export function saveMessages(messages: ChatMessage[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // storage full or blocked: chat still works in memory
  }
}

export function reply(input: string): Omit<ChatMessage, 'id' | 'from'> {
  const text = input.toLowerCase();
  const intent = responses.intents.find((i) => i.keywords.some((k) => text.includes(k)));
  if (!intent) return { text: responses.fallback };
  if ('type' in intent && intent.type === 'support') return { text: responses.support };
  return {
    text: 'reply' in intent ? (intent.reply as string) : responses.fallback,
    products: 'products' in intent ? (intent.products as ChatProduct[]) : undefined,
  };
}

export function appendExchange(prev: ChatMessage[], content: string): ChatMessage[] {
  const nextId = prev.length ? prev.at(-1)!.id + 1 : 1;
  return [
    ...prev,
    { id: nextId, from: 'user', text: content },
    { id: nextId + 1, from: 'bot', ...reply(content) },
  ];
}
