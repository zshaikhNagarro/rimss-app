# ADR 0008: Rule-based, client-side chatbot

Status: accepted

## Context

Shoppers need quick help and product suggestions. An LLM backend would add cost, latency, privacy exposure and an external dependency.

## Decision

- `components/Chatbot` answers locally by matching keywords from `responses.json` (intents with replies, product suggestions, a support intent and a fallback). No network calls.
- Conversation history is kept in `localStorage` (`rimss.chat.v1`); corrupt or blocked storage falls back to a fresh greeting and in-memory chat.
- The widget renders in a portal so it is independent of module layout.
- Content changes are data-only edits to `responses.json`.

## Consequences

- Works offline and sends no user text to any server.
- Understanding is limited to configured keywords; replacing it with a service later only needs to change `reply()`.
- Product suggestions in `responses.json` are static and must be kept in sync with the catalog.
