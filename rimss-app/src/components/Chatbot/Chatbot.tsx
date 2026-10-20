import { useEffect, useRef, useState, type SyntheticEvent } from 'react';
import { createPortal } from 'react-dom';
import responses from './responses.json';
import { useI18n } from '../../i18n';
import {
  appendExchange,
  greeting,
  loadMessages,
  saveMessages,
  type ChatMessage,
} from './chatLogic';
import './Chatbot.scss';

export function Chatbot() {
  const { t } = useI18n();
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
        <dialog open className="chatbot__panel" aria-label={t('chat.panelLabel')}>
          <header className="chatbot__header">
            <span>{t('chat.assistant')}</span>
            <span>
              <button type="button" className="chatbot__link" onClick={clear}>
                {t('chat.clear')}
              </button>
              <button
                type="button"
                className="chatbot__close"
                aria-label={t('chat.close')}
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
              placeholder={t('chat.placeholder')}
              aria-label={t('chat.message')}
            />
            <button type="submit">{t('chat.send')}</button>
          </form>
        </dialog>
      )}
      <button
        type="button"
        className="chatbot__toggle"
        aria-label={open ? t('chat.close') : t('chat.open')}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? '×' : t('chat.toggle')}
      </button>
    </div>,
    document.body,
  );
}
