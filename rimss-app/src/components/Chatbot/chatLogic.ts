import type { Lang } from '../../i18n';
import responsesEn from './responses.json';
import responsesEs from './responses.es.json';

export interface ChatProduct {
  name: string;
  price: number;
  note: string;
}

interface Intent {
  keywords: string[];
  type?: string;
  reply?: string;
  products?: ChatProduct[];
}

export interface Responses {
  greeting: string;
  fallback: string;
  support: string;
  suggestions: string[];
  intents: Intent[];
}

const catalogs: Record<Lang, Responses> = { en: responsesEn, es: responsesEs };
export const getResponses = (lang: Lang = 'en'): Responses => catalogs[lang];

export interface ChatMessage {
  id: number;
  from: 'user' | 'bot';
  text: string;
  products?: ChatProduct[];
}

const STORAGE_KEY = 'rimss.chat.v1';

export const greeting = (lang: Lang = 'en'): ChatMessage[] => [
  { id: 1, from: 'bot', text: getResponses(lang).greeting },
];

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

export function reply(input: string, lang: Lang = 'en'): Omit<ChatMessage, 'id' | 'from'> {
  const responses = getResponses(lang);
  const text = input.toLowerCase();
  const intent = responses.intents.find((i) => i.keywords.some((k) => text.includes(k)));
  if (!intent) return { text: responses.fallback };
  if (intent.type === 'support') return { text: responses.support };
  return { text: intent.reply ?? responses.fallback, products: intent.products };
}

export function appendExchange(
  prev: ChatMessage[],
  content: string,
  lang: Lang = 'en',
): ChatMessage[] {
  const nextId = prev.length ? prev.at(-1)!.id + 1 : 1;
  return [
    ...prev,
    { id: nextId, from: 'user', text: content },
    { id: nextId + 1, from: 'bot', ...reply(content, lang) },
  ];
}
