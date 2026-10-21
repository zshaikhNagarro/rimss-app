import { useEffect, useRef, useState, type SyntheticEvent } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '../../i18n';
import { trackEvent } from '../../services/telemetry';
import { Button, Input } from '../ui';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import {
  appendExchange,
  getResponses,
  greeting,
  loadMessages,
  saveMessages,
  type ChatMessage,
} from './chatLogic';
import './Chatbot.scss';

export function Chatbot() {
  const { t, lang } = useI18n();
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

  useEscapeKey(() => setOpen(false), open);

  const send = (value: string) => {
    const content = value.trim();
    if (!content) return;
    trackEvent('chatbot_message');
    setMessages((prev) => appendExchange(prev, content, lang));
    setDraft('');
  };

  const onSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    send(draft);
  };

  const clear = () => {
    trackEvent('chatbot_clear');
    setMessages(greeting(lang));
  };

  return createPortal(
    <div className="chatbot">
      {open && (
        <dialog open className="chatbot__panel" aria-label={t('chat.panelLabel')}>
          <header className="chatbot__header">
            <span>{t('chat.assistant')}</span>
            <span>
              <Button variant="ghost" size="sm" className="chatbot__link" onClick={clear}>
                {t('chat.clear')}
              </Button>
              <Button
                variant="icon"
                className="chatbot__close"
                aria-label={t('chat.close')}
                onClick={() => setOpen(false)}
              >
                ×
              </Button>
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
            {getResponses(lang).suggestions.map((s) => (
              <Button key={s} variant="outline" size="sm" onClick={() => send(s)}>
                {s}
              </Button>
            ))}
          </div>
          <form className="chatbot__form" onSubmit={onSubmit}>
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t('chat.placeholder')}
              aria-label={t('chat.message')}
            />
            <Button type="submit">{t('chat.send')}</Button>
          </form>
        </dialog>
      )}
      <Button
        className="chatbot__toggle"
        aria-label={open ? t('chat.close') : t('chat.open')}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? '×' : t('chat.toggle')}
      </Button>
    </div>,
    document.body,
  );
}
