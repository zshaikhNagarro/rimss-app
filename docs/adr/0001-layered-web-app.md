# ADR 0001: Layered web app with isolated feature modules

Status: accepted

## Context

`rimss-app` uses a plugin architecture: each feature (search, showcase, cart) registers itself with the `PluginRegistry`. Without guard rails, modules drift into importing each other's internals.

## Decision

- Dependencies point downwards: `modules` -> `components`, `hooks`, `services`, `utils`, `types`. The lower layers never import `modules`.
- Code outside a module uses it only through its barrel (`modules/<name>`).
- Feature modules do not import each other. The one exception is `cart`, which other modules may use through its barrel because it is a cross-cutting capability.
- The rules are enforced by `no-restricted-imports` in [eslint.config.mjs](../../eslint.config.mjs), so violations fail `npm run lint`.

## Consequences

- A module can be disabled (`VITE_DISABLED_MODULES`) or removed without breaking others.
- Shared UI or logic needed by two modules must move to `components`, `hooks`, `services` or `utils`.
