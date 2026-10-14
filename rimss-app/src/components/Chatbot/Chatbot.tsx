import { useEffect, useRef, useState, type SyntheticEvent } from 'react';
import { createPortal } from 'react-dom';
import responses from './responses.json';
import './Chatbot.scss';

interface ChatProduct {
  name: string;
  price: number;
  note: string;
}

interface ChatMessage {
  id: number;
  from: 'user' | 'bot';
  text: string;
  products?: ChatProduct[];
}

const STORAGE_KEY = 'rimss.chat.v1';

const greeting = (): ChatMessage[] => [{ id: 1, from: 'bot', text: responses.greeting }];

function loadMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as ChatMessage[]) : null;
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // corrupt or unavailable storage: start fresh
  }
  return greeting();
}

function reply(input: string): Omit<ChatMessage, 'id' | 'from'> {
  const text = input.toLowerCase();
  const intent = responses.intents.find((i) => i.keywords.some((k) => text.includes(k)));
  if (!intent) return { text: responses.fallback };
  if ('type' in intent && intent.type === 'support') return { text: responses.support };
  return {
    text: 'reply' in intent ? (intent.reply as string) : responses.fallback,
    products: 'products' in intent ? (intent.products as ChatProduct[]) : undefined,
  };
}

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages);
  const [draft, setDraft] = useState('');
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // storage full or blocked: chat still works in memory
    }
  }, [messages]);

  useEffect(() => {
    if (open && bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, open]);

  const send = (value: string) => {
    const content = value.trim();
    if (!content) return;
    setMessages((prev) => {
      const nextId = prev.length ? prev.at(-1)!.id + 1 : 1;
      return [
        ...prev,
        { id: nextId, from: 'user', text: content },
        { id: nextId + 1, from: 'bot', ...reply(content) },
      ];
    });
    setDraft('');
  };

  const onSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    send(draft);
  };

  const clear = () => setMessages(greeting());

  return createPortal(
    <div className="chatbot">
      {open && (
        <dialog open className="chatbot__panel" aria-label="Chat assistant">
          <header className="chatbot__header">
            <span>RIMSS Assistant</span>
            <span>
              <button type="button" className="chatbot__link" onClick={clear}>
                Clear
              </button>
              <button
                type="button"
                className="chatbot__close"
                aria-label="Close chat"
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </span>
          </header>
          <div className="chatbot__body" ref={bodyRef} aria-live="polite">
            {messages.map((m) => (
              <div key={m.id} className={`chatbot__msg chatbot__msg--${m.from}`}>
                <p>{m.text}</p>
                {m.products && (
                  <ul className="chatbot__products">
                    {m.products.map((p) => (
                      <li key={p.name}>
                        <strong>{p.name}</strong> - ${p.price}
                        <br />
                        <small>{p.note}</small>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
          <div className="chatbot__chips">
            {responses.suggestions.map((s) => (
              <button key={s} type="button" onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>
          <form className="chatbot__form" onSubmit={onSubmit}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type a message..."
              aria-label="Chat message"
            />
            <button type="submit">Send</button>
          </form>
        </dialog>
      )}
      <button
        type="button"
        className="chatbot__toggle"
        aria-label={open ? 'Close chat' : 'Open chat'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? '×' : 'Chat'}
      </button>
    </div>,
    document.body,
  );
}
