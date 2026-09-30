const {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  ShadingType,
  PageBreak,
  ImageRun,
} = require('docx');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'output');
const ASSETS_DIR = path.join(__dirname, 'assets');
fs.mkdirSync(OUT_DIR, { recursive: true });

const ACCENT = 'C65B3C';
const GREY = '6B7280';

// Diagrams are rendered by render-diagrams.js into assets/*.png at 1200px
// wide; scale each down to a consistent ~6.4in printable width (620px @ 96dpi).
const TARGET_WIDTH = 620;
const DIAGRAMS = {
  technical: { file: 'technical-diagram.png', w: 1200, h: 760 },
  dataFlow: { file: 'data-flow-diagram.png', w: 1200, h: 560 },
  systemModel: { file: 'system-model-diagram.png', w: 1200, h: 700 },
  architecture: { file: 'architecture-diagram.png', w: 1200, h: 640 },
  componentArchitecture: { file: 'component-architecture-diagram.png', w: 1200, h: 720 },
  comparison: { file: 'comparison-diagram.png', w: 1200, h: 620 },
};

function diagram(key, { caption } = {}) {
  const meta = DIAGRAMS[key];
  const height = Math.round((TARGET_WIDTH * meta.h) / meta.w);
  const data = fs.readFileSync(path.join(ASSETS_DIR, meta.file));
  const children = [
    new Paragraph({
      children: [
        new ImageRun({
          data,
          type: 'png',
          transformation: { width: TARGET_WIDTH, height },
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: caption ? 60 : 200 },
    }),
  ];
  if (caption) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: caption, italics: true, size: 18, color: GREY })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
    );
  }
  return children;
}

function h1(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { after: 200 } });
}
function h2(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 120 },
  });
}
function p(text, opts = {}) {
  return new Paragraph({ children: [new TextRun({ text, ...opts })], spacing: { after: 120 } });
}
function bullet(text) {
  return new Paragraph({ text, bullet: { level: 0 }, spacing: { after: 60 } });
}
function cell(text, opts = {}) {
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    shading: opts.header ? { fill: ACCENT, type: ShadingType.CLEAR, color: 'auto' } : undefined,
    children: [
      new Paragraph({
        children: [
          new TextRun({ text, bold: opts.header, color: opts.header ? 'FFFFFF' : undefined }),
        ],
      }),
    ],
  });
}
function row(cells) {
  return new TableRow({ children: cells });
}
function table(headers, rows, widths) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      row(headers.map((hText, i) => cell(hText, { header: true, width: widths?.[i] }))),
      ...rows.map((r) => row(r.map((text, i) => cell(String(text), { width: widths?.[i] })))),
    ],
  });
}

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: 'Calibri', size: 22 } },
    },
  },
  sections: [
    {
      properties: {},
      children: [
        new Paragraph({
          children: [new TextRun({ text: 'RIMSS', bold: true, size: 56, color: ACCENT })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'Retail Inventory Management Software System',
              size: 32,
              color: GREY,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Solution Approach Document · Version 1.0', size: 24 })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'Prepared for: YCompany Promotion Assignment (FRONTEND-REACT)',
              italics: true,
            }),
          ],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ children: [new PageBreak()] }),

        h1('1. Introduction & Objective'),
        p(
          "YCompany's existing storefront suffers from slow initial load (>60s), a frozen/unresponsive UI, slow product search, and no cross-platform support. This document proposes a frontend solution approach for the Retail Inventory Management Software System (RIMSS) that resolves these issues, focused on the customer-facing shopping experience (Home, Product Search, Product Showcase, Shopping Cart, Payment Gateway).",
        ),
        p('This document is organized as follows:'),
        bullet('Technical Diagram & Data Flow - visual overview of the solution end-to-end'),
        bullet('System Model - holistic functional view of RIMSS'),
        bullet('Solution Architecture - logical layers, component wiring and plugin design'),
        bullet('Current vs Proposed System - how each reported issue is resolved'),
        bullet('Non-Functional Requirements Coverage - how each NFR is addressed'),
        bullet('Performance - strategy to meet the 100ms interaction budget and fast load'),
        bullet('Assumptions & Scope - in-scope / out-of-scope boundaries'),

        new Paragraph({ children: [new PageBreak()] }),
        h1('2. Technical Diagram'),
        p(
          'The diagram below depicts the client-server topology: Web/Mobile browsers communicate over HTTPS with a CDN-fronted static SPA bundle, which calls backend REST APIs (assumed provided by client per assignment scope) for product, cart and payment operations. A Node.js/Express mock server stands in for those APIs during development and demo.',
        ),
        ...diagram('technical', { caption: 'Figure 1 - RIMSS technical / solution diagram' }),
        p('Diagram legend:'),
        bullet('Blue boxes = client-side (browser) components'),
        bullet('Amber boxes = SPA / frontend components (in scope for this assignment)'),
        bullet('Green boxes = build/deploy or mock infrastructure'),
        bullet('Grey dashed boxes = external/backend services (out of scope, assumed available)'),

        h2('2.1 Data Flow Diagram'),
        p(
          'The sequence below traces a representative user journey - browsing, adding an item to cart, and checking out - with arrows tagged in call order so each step can be cross-referenced from this write-up.',
        ),
        ...diagram('dataFlow', { caption: 'Figure 2 - Browse-to-checkout data flow (steps 1-9)' }),
        bullet(
          'Steps 1-3: user searches the catalog; the Product Search module calls the Product Service',
        ),
        bullet(
          'Steps 4-5: user opens Product Showcase and adds the item to cart via the business logic layer',
        ),
        bullet('Steps 6-7: user opens the Cart Drawer and proceeds to the Payment Gateway'),
        bullet('Steps 8-9: confirmation is returned through the SPA back to the browser'),

        new Paragraph({ children: [new PageBreak()] }),
        h1('3. System Model'),
        p(
          'The functional system model below gives a holistic, business-facing view of RIMSS: the user types it serves, the functional modules that make up the core system, and the integration points each module depends on.',
        ),
        ...diagram('systemModel', { caption: 'Figure 3 - RIMSS functional system model' }),

        new Paragraph({ children: [new PageBreak()] }),
        h1('4. Solution Architecture'),
        h2('4.1 Layered Application Architecture'),
        p(
          'RIMSS follows a layered frontend architecture. Requests flow top-down from UI to integration, while business logic remains independent of the UI so it can be unit tested in isolation.',
        ),
        table(
          ['Layer', 'Responsibility', 'Key Technology'],
          [
            [
              'Presentation Layer',
              'Renders UI screens (Home, Search, Showcase, Cart)',
              'React 19 + TypeScript, CSS Modules',
            ],
            ['Routing Layer', 'Maps URLs to functional modules', 'React Router'],
            [
              'Plugin/Module Layer',
              'Registers pluggable functional modules with the host shell',
              'Custom Plugin Registry (self-registration pattern)',
            ],
            [
              'State/Business Layer',
              'Cart logic, filtering/search logic, pricing & discount calculation, cart persistence (localStorage), URL-synced filters',
              'React Context + pure TypeScript functions (unit tested)',
            ],
            [
              'Service/Integration Layer',
              'Talks to backend REST APIs with timeout, bounded retry/backoff (reads only), short-lived response cache; creates orders; manages Web Push subscriptions',
              'Fetch-based clients (productService, orderService, httpClient, pushService)',
            ],
            [
              'Cross-cutting Concerns',
              'Feature flags, telemetry (beacon + global error capture), per-module error boundaries, skeleton/fallback UI, accessibility (focus-managed dialog, axe checks), CSP/security headers, service worker (offline cache + push)',
              'Config, ModuleErrorBoundary, telemetry, Workbox service worker',
            ],
          ],
          [22, 55, 23],
        ),
        new Paragraph({ spacing: { after: 200 } }),
        ...diagram('architecture', { caption: 'Figure 4 - Layered solution architecture' }),

        h2('4.2 Application / Component Logical Architecture'),
        p(
          'The diagram below shows how the App Shell, Plugin Registry, React Router and each functional module wire together at the component level, and how every module shares a single Service Layer to reach backend APIs.',
        ),
        ...diagram('componentArchitecture', {
          caption: 'Figure 5 - Application/component logical architecture',
        }),

        h2('4.3 Plugin-Based / Pluggable Architecture'),
        p(
          "RIMSS uses a lightweight Plugin Registry (see src/plugins/PluginRegistry.ts in the working sample). Each functional module (Product Search, Product Showcase, and future modules such as Wishlist or Reviews) self-registers a manifest (id, route, nav label, component) on import. The application shell (App.tsx) never imports feature modules by name - it only renders whatever is registered. This satisfies the requirement that 'any functional module could be plugged into the application' without modifying shell code.",
        ),
        h2('4.4 Component Interaction Flow'),
        bullet(
          'User lands on Home/Search screen -> ProductSearchModule fetches catalog + facets from productService',
        ),
        bullet(
          'User applies filters (category, price, color, discount, name) -> pure filterProducts() re-filters client-side instantly; the name box is debounced and all filters are mirrored into the URL so views are shareable',
        ),
        bullet('User clicks a product -> ProductShowcaseModule fetches product detail by id'),
        bullet(
          'User clicks Add to Cart -> CartContext dispatches to pure cartLogic functions (addToCart, getCartTotal) and persists the cart to localStorage',
        ),
        bullet(
          'User opens cart drawer -> reviews items, quantities, discounted totals -> places the order (orderService posts ids and quantities; the API prices it and returns an order id). The real payment gateway remains an integration point, out of scope',
        ),

        new Paragraph({ children: [new PageBreak()] }),
        h1('5. Current vs Proposed System'),
        p(
          "The comparison below maps each issue reported against YCompany's existing website directly to the corresponding RIMSS design decision.",
        ),
        ...diagram('comparison', {
          caption: 'Figure 6 - Current website issues mapped to the RIMSS solution',
        }),

        new Paragraph({ children: [new PageBreak()] }),
        h1('6. Non-Functional Requirements Coverage'),
        table(
          ['NFR', 'Approach'],
          [
            [
              'Cross-platform support',
              'Responsive CSS Grid/Flexbox layouts; no platform-specific code; tested on desktop, tablet and mobile breakpoints.',
            ],
            [
              'Cross-browser compatibility',
              "Standards-based React/CSS with Vite's esbuild/Rollup output targeting evergreen browsers (Chrome, Edge, Firefox, Safari).",
            ],
            [
              'Smooth UI / rich UX (100ms budget)',
              'Client-side filtering (no server round-trip per keystroke), optimistic cart updates, shimmer skeleton placeholders and image fallbacks for network waits, code-splitting per route.',
            ],
            [
              'Fast initial load',
              'Vite production build with tree-shaking, route-level code splitting, lazy image loading, CDN + gzip/brotli compression.',
            ],
            [
              'In-built SEO',
              'Server-side rendering or pre-rendering recommended for production (Next.js migration path); semantic HTML, meaningful title/meta tags, descriptive alt text.',
            ],
            [
              'Scalability / pluggable design',
              'Plugin Registry pattern lets new modules be added without touching shell code; stateless SPA scales horizontally behind a CDN.',
            ],
            [
              'Logging / debuggability / observability',
              'Single telemetry sink (setTelemetrySink) receives module crashes and HTTP retries; pluggable to Sentry/App Insights without changing call sites.',
            ],
            [
              'Resilience / graceful degradation',
              'Fetch timeout + bounded exponential-backoff retry (5xx/network only); per-module error boundary isolates crashes; reusable ErrorFallback with retry; offline app shell and cached API via service worker.',
            ],
            [
              'Engagement / re-engagement',
              'Opt-in Web Push notifications (VAPID) via the service worker for offers and restocks; user can enable/disable from the header.',
            ],
            [
              'Feature toggling',
              'VITE_DISABLED_MODULES switches functional modules off per environment with no code change.',
            ],
            [
              'Unit testability',
              'Business logic (cart, filtering) as pure functions plus component, service and module tests (Vitest + Testing Library, 77 tests); UI states documented in Storybook.',
            ],
            [
              'CI/CD readiness',
              'GitHub Actions workflow runs lint, tests and build on every push; npm scripts are pipeline-ready.',
            ],
          ],
          [30, 70],
        ),

        new Paragraph({ children: [new PageBreak()] }),
        h1('7. Performance'),
        h2('7.1 Load Time'),
        bullet(
          'Vite production bundling: ES module output, minification, and gzip: ~85KB gzipped JS in the working sample.',
        ),
        bullet(
          'Code-split routes (Search vs. Showcase) so only the needed module loads per screen.',
        ),
        bullet('Lazy-loaded product images (loading="lazy") and responsive image sizing.'),
        bullet(
          'PWA service worker precaches the app shell for instant repeat visits and offline start-up; API responses use stale-while-revalidate, images cache-first.',
        ),
        h2('7.2 Interaction Responsiveness (100ms budget)'),
        bullet(
          'Filtering/search executes client-side against an in-memory catalog snapshot - no network latency per interaction.',
        ),
        bullet(
          'Cart operations are synchronous, pure-function state updates via React state, avoiding unnecessary re-renders through memoization (useMemo).',
        ),
        bullet(
          'Skeleton placeholders render immediately for any operation that requires a network round trip (catalog fetch, product detail, images), preserving layout and perceived speed.',
        ),
        bullet(
          'Requests are bounded by an 8s timeout and up to 2 retries with exponential backoff, so transient failures self-heal instead of freezing the UI.',
        ),
        h2('7.3 Scalability'),
        bullet(
          'Stateless SPA can be served from a CDN and scaled independently of backend services.',
        ),
        bullet(
          'Backend APIs (assumed provided) can be scaled/cached independently; client is decoupled via the service layer abstraction.',
        ),

        new Paragraph({ children: [new PageBreak()] }),
        h1('8. Assumptions & Scope'),
        h2('8.1 In Scope'),
        bullet(
          'Home page, Product Search (with filters: category, price, discount, name, color), Product Showcase, Shopping Cart UI',
        ),
        bullet(
          'Plugin-based frontend architecture with at least one fully implemented functional module',
        ),
        bullet(
          'Backend API (Express + TypeScript): catalog search, server-side pricing/quote, orders, Web Push - full-stack option, delivered in a Turborepo monorepo with a shared contract package',
        ),
        bullet(
          'Mock/stub backend APIs (Node.js/Express + static JSON) to unblock frontend development',
        ),
        bullet(
          'Unit tests for business layer logic (cart & filtering) plus component, service and module tests; Storybook for UI states',
        ),
        bullet(
          'Installable PWA (offline app shell, update prompt) and opt-in Web Push notifications, backed by a mock push endpoint',
        ),
        bullet(
          'Resilience and operations: retrying HTTP client, module error boundaries, telemetry hook, feature flags, CI workflow',
        ),
        h2('8.2 Out of Scope (per assignment instructions)'),
        bullet(
          'Production hosting, persistent database and real payment processor for the sample backend (client-provided APIs remain the production source of truth)',
        ),
        bullet(
          "Real payment gateway integration - UI stub only ('Proceed to Payment Gateway' button)",
        ),
        bullet('Authentication/authorization and admin/inventory management screens'),
        bullet('Production SEO/SSR implementation (documented as a recommended follow-on)'),
        bullet(
          'Production push campaign tooling, segmentation and VAPID key management (mock broadcast endpoint only)',
        ),
        h2('8.3 Assumptions'),
        bullet(
          'Client will supply production REST/GraphQL APIs matching the contract used by productService',
        ),
        bullet(
          'Product catalog size is moderate (thousands, not millions, of SKUs) suitable for client-side filtering of a paged/fetched subset',
        ),
        bullet('Modern evergreen browser support is sufficient; no legacy IE11 support required'),
        bullet(
          'Web Push requires HTTPS and a browser with service worker and Push API support; unsupported browsers simply hide the alerts toggle',
        ),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(path.join(OUT_DIR, 'RIMSS - Solution Approach - v1.0.docx'), buffer);
  console.log('Solution Approach document generated.');
});
