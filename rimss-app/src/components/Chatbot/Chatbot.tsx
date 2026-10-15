import { useEffect, useRef, useState, type SyntheticEvent } from 'react';
import { createPortal } from 'react-dom';
import responses from './responses.json';
import {
  appendExchange,
  greeting,
  loadMessages,
  saveMessages,
  type ChatMessage,
} from './chatLogic';
import './Chatbot.scss';

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages);
  const [draft, setDraft] = useState('');
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    if (open && bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, open]);

  const send = (value: string) => {
    const content = value.trim();
    if (!content) return;
    setMessages((prev) => appendExchange(prev, content));
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
