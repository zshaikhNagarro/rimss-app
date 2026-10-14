import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { Chatbot } from './Chatbot';

const STORAGE_KEY = 'rimss.chat.v1';

const openChat = () => fireEvent.click(screen.getByRole('button', { name: 'Open chat' }));

const sendMessage = (text: string) => {
  fireEvent.change(screen.getByLabelText('Chat message'), { target: { value: text } });
  fireEvent.click(screen.getByRole('button', { name: 'Send' }));
};

beforeEach(() => localStorage.clear());

describe('Chatbot', () => {
  it('is closed by default and opens with a greeting', () => {
    render(<Chatbot />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    openChat();
    expect(screen.getByRole('dialog')).toHaveTextContent("I'm the RIMSS assistant");
  });

  it('recommends products for a matching keyword', () => {
    render(<Chatbot />);
    openChat();
    sendMessage('I need a jacket');
    expect(screen.getByText('Moleskin Field Jacket')).toBeInTheDocument();
  });

  it('shows support details when help is requested', () => {
    render(<Chatbot />);
    openChat();
    sendMessage('I need support');
    expect(screen.getByText(/support@rimss\.example/)).toBeInTheDocument();
  });

  it('falls back when nothing matches', () => {
    render(<Chatbot />);
    openChat();
    sendMessage('zzzz');
    expect(screen.getByText(/not sure I understood/)).toBeInTheDocument();
  });

  it('sends suggestion chips as messages', () => {
    render(<Chatbot />);
    openChat();
    fireEvent.click(screen.getByRole('button', { name: 'Gift ideas' }));
    expect(screen.getByText('Popular gifts:')).toBeInTheDocument();
  });

  it('ignores blank input', () => {
    render(<Chatbot />);
    openChat();
    sendMessage('   ');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toHaveLength(1);
  });

  it('persists the conversation and restores it on remount', () => {
    const { unmount } = render(<Chatbot />);
    openChat();
    sendMessage('shoes');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toHaveLength(3);
    unmount();

    render(<Chatbot />);
    openChat();
    expect(screen.getByText('Leather Chelsea Boots')).toBeInTheDocument();
  });

  it('clears the conversation', () => {
    render(<Chatbot />);
    openChat();
    sendMessage('shoes');
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.queryByText('Leather Chelsea Boots')).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toHaveLength(1);
  });

  it('starts fresh when stored data is corrupt', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    render(<Chatbot />);
    openChat();
    expect(screen.getByRole('dialog')).toHaveTextContent("I'm the RIMSS assistant");
  });
});
