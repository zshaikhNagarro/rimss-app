# RIMSS architecture

Decisions behind these views are recorded in [docs/adr](adr).

## 1. System context

```mermaid
flowchart LR
  user([Shopper / browser PWA])
  admin([Admin])
  subgraph web[rimss-app - nginx container]
    spa[React SPA]
    sw[Service worker<br/>precache + runtime cache + push-sw.js]
  end
  api[rimss-api<br/>Express]
  db[(PostgreSQL)]
  files[(data/*.json<br/>dev fallback)]
  pushsvc[[Browser push service]]
  collector[[External telemetry collector<br/>optional]]

  user --> spa
  spa <--> sw
  spa -- "/api (same origin proxy)" --> api
  admin -- "POST /api/push/send<br/>ADMIN_API_KEY" --> api
  api --> db
  api -. "no DATABASE_URL" .-> files
  api -- "Web Push / VAPID" --> pushsvc --> sw
  spa -. "VITE_TELEMETRY_URL" .-> collector
```

## 2. Repository and package dependencies

```mermaid
flowchart TD
  shared["packages/shared<br/>@rimss/shared<br/>types + zod request schemas"]
  app[rimss-app]
  api[rimss-api]
  app -- "types only" --> shared
  api -- "schemas + types" --> shared
```

## 3. Web app layers (ADR 0001)

```mermaid
flowchart TD
  main[main.tsx / App.tsx<br/>shell, routes, providers]
  registry[plugins/PluginRegistry]
  modules[modules<br/>cart, productSearch, productShowcase]
  components[components<br/>Header, ProductCard, Chatbot, ui/*...]
  hooks[hooks]
  services[services<br/>httpClient, requestCache, orderService,<br/>productService, pushService, telemetry]
  utils[utils]
  types[types]

  main --> registry
  main --> modules
  main --> components
  modules --> components
  modules --> hooks
  modules --> services
  modules --> utils
  modules --> types
  components --> hooks
  components --> services
  components --> utils
  components --> types
  services --> utils
  services --> types
  hooks --> services
```

Modules register themselves with `PluginRegistry`; `App` renders one route per registered plugin, each wrapped in `ModuleErrorBoundary`. Only `cart` may be imported by other modules.

## 4. API structure (ADR 0002)

```mermaid
flowchart TD
  server[server.ts<br/>chooses implementations] --> app[app.ts<br/>composition root]
  app --> mw[middleware.ts<br/>requireAdmin, request id, logging]
  app --> err[errors.ts<br/>error envelope]
  app --> routes
  subgraph routes[routes/ on /api]
    health
    catalog
    orders
    push
    telemetry
  end
  catalog --> ProductRepository
  orders --> ProductRepository
  orders --> OrderStore
  push --> PushService
  subgraph impl[Implementations]
    ProductRepository --> pgP[Postgres]
    ProductRepository --> fileP[JSON file]
    OrderStore --> pgO[Postgres]
    OrderStore --> memO[In-memory]
    PushService --> pgS[Postgres subscriptions]
    PushService --> fileS[JSON subscriptions]
  end
```

## 5. Checkout with idempotency (ADR 0004)

```mermaid
sequenceDiagram
  actor U as Shopper
  participant A as Web app
  participant S as API
  participant D as Order store
  U->>A: Checkout
  A->>S: POST /api/orders (items, Idempotency-Key)
  S->>D: findByIdempotencyKey
  alt key already used
    D-->>S: existing order
    S-->>A: 200 original order
  else new
    S->>S: buildQuote (server-side pricing)
    S->>D: create(order, key)
    S-->>A: 201 order
  end
  A->>S: POST /api/telemetry (checkout_success | checkout_failed)
```

## 6. Push subscription (ADR 0006)

```mermaid
sequenceDiagram
  actor U as Shopper
  participant A as Web app
  participant SW as Service worker
  participant S as API
  participant P as Browser push service
  U->>A: Enable notifications
  A->>U: Permission prompt
  A->>S: GET /api/push/public-key
  A->>SW: pushManager.subscribe(VAPID key)
  A->>S: POST /api/push/subscribe
  Note over S: Admin calls POST /api/push/send
  S->>P: Encrypted push (VAPID)
  P->>SW: push event
  SW->>U: Notification
```

## 7. Resilient reads and caching (ADR 0005, 0007)

```mermaid
flowchart LR
  ui[Component] --> hook[useAsyncResource]
  hook --> cache[requestCache<br/>TTL + de-dup]
  cache --> http[getJson<br/>timeout, retry 5xx/network]
  http --> swc[Service worker<br/>StaleWhileRevalidate]
  swc --> api[API]
  http -. retry .-> tel[telemetry: http_retry]
```

## 8. Deployment

```mermaid
flowchart LR
  browser --> nginx["web container<br/>nginx: static + /api proxy"]
  nginx --> apic["api container<br/>non-root, healthcheck"]
  apic --> pg[(Postgres)]
```

## 9. Folder structure

### Repository

```text
RIMSS/
├─ package.json, turbo.json            npm workspaces + Turborepo (ADR 0009)
├─ eslint.config.mjs, commitlint.config.mjs
├─ docker-compose.yml                  web + api + Postgres
├─ docs/                               this file and adr/
├─ packages/shared/src/index.ts        @rimss/shared contract
├─ rimss-api/                          Express API
├─ rimss-app/                          React PWA
├─ deliverables/gen/                   document generators (not in runtime build)
└─ Req_Doc/                            requirements
```

### rimss-app

```text
rimss-app/
├─ index.html, vite.config.ts          Vite + PWA plugin config
├─ nginx.conf, Dockerfile              production image
├─ playwright.config.ts, e2e/          e2e, accessibility, resilience specs
├─ public/
│  ├─ _headers                         CSP and security headers
│  └─ push-sw.js                       push + notificationclick handlers
├─ scripts/                            check-bundle-size, PWA icon generation
└─ src/
   ├─ main.tsx, App.tsx, App.scss      entry and shell (routes from registry)
   ├─ plugins/PluginRegistry.ts        module manifest + feature flags
   ├─ modules/                         feature modules (barrel per module)
   │  ├─ index.ts                      registers all modules
   │  ├─ cart/                         CartContext, CartDrawer, cartLogic, cartStorage
   │  ├─ productSearch/                ProductSearchModule, filterProducts, searchParams
   │  └─ productShowcase/              ProductShowcaseModule
   ├─ components/                      shared UI
   │  ├─ Chatbot/                      rule-based chat + responses.json
   │  ├─ Header/, ProductCard/, NotificationToggle/, UpdatePrompt/
   │  ├─ Loader/, Skeleton/, ErrorFallback/, ModuleErrorBoundary/
   │  └─ ui/                           Button, Card, Field, Heading, Table
   ├─ hooks/                           useAsyncResource, useDebouncedValue
   ├─ services/                        httpClient, requestCache, productService,
   │                                   orderService, pushService, telemetry
   ├─ utils/                           price
   ├─ types/                           cart, order, product
   ├─ styles/, assets/                 global styles and static assets
   └─ test/, setupTests.ts             fixtures and Vitest setup
```

### rimss-api

```text
rimss-api/
├─ Dockerfile, tsconfig*.json
├─ data/                               dev JSON stores (products, subscriptions, telemetry, vapid)
├─ migrations/                         001_init.sql, 002_order_idempotency.sql
├─ src/
│  ├─ server.ts                        picks Postgres or file/memory implementations
│  ├─ app.ts                           composition root
│  ├─ config.ts, logger.ts, errors.ts, middleware.ts
│  ├─ db.ts                            pool helpers, migrations, Postgres stores
│  ├─ products.ts, orders.ts, push.ts  interfaces + file/memory implementations
│  └─ routes/                          health, catalog, orders, push, telemetry
└─ test/                               api, config, logger, postgres, push, telemetry
```

### packages/shared

```text
packages/shared/src/index.ts           types and zod request schemas (ADR 0003)
```
