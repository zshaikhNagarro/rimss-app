const ExcelJS = require('exceljs');
const path = require('node:path');
const fs = require('node:fs');

const OUT_DIR = path.join(__dirname, '..', 'output');
fs.mkdirSync(OUT_DIR, { recursive: true });

const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC65B3C' } };
const HEADER_FONT = { bold: true, color: { argb: 'FFFFFFFF' } };
const SECTION_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0E4E0' } };

async function main() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Zibran Shaikh';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Estimation');
  sheet.columns = [
    { header: 'Phase', key: 'phase', width: 26 },
    { header: 'Activity', key: 'activity', width: 42 },
    { header: 'Role', key: 'role', width: 16 },
    { header: 'Effort (Hours)', key: 'effort', width: 16 },
    { header: 'Notes', key: 'notes', width: 40 },
  ];

  sheet.getRow(1).eachCell((c) => {
    c.fill = HEADER_FILL;
    c.font = HEADER_FONT;
  });

  const data = [
    [
      'Requirement Phase',
      'Requirement gathering & clarification with stakeholders',
      'BA / TL',
      8,
      'Assumes requirements already documented in case study',
    ],
    [
      'Requirement Phase',
      'NFR elicitation & prioritization',
      'TL',
      4,
      'Cross-platform, performance, SEO, scalability',
    ],
    [
      'Design Phase',
      'Solution architecture & technical diagram',
      'Architect / TL',
      12,
      'Includes plugin architecture design',
    ],
    [
      'Design Phase',
      'UI/UX wireframes for Home, Search, Showcase, Cart',
      'UX Designer',
      16,
      '4 key screens',
    ],
    [
      'Design Phase',
      'API contract definition with backend team',
      'TL',
      8,
      'Backend out of scope, contract only',
    ],
    [
      'Design Phase',
      'Resilience, observability & push notification design',
      'Architect / TL',
      8,
      'Retry/timeout policy, error boundaries, telemetry sink, VAPID/subscription flow',
    ],
    [
      'Design Phase',
      'Loading/skeleton & error fallback UX patterns',
      'UX Designer',
      6,
      'Shared across all modules',
    ],
    [
      'Design Phase',
      'Backend API design (REST contract, error envelope, data model, security)',
      'Architect / Backend Dev',
      12,
      'Full-stack option',
    ],
    [
      'Development Phase',
      'Project scaffolding (Vite + React + TS), CI config',
      'Frontend Dev',
      8,
      'One-time setup',
    ],
    [
      'Development Phase',
      'Plugin registry & app shell (routing, header, layout)',
      'Frontend Dev',
      12,
      '',
    ],
    ['Development Phase', 'Home page', 'Frontend Dev', 12, 'Featured products, offers, nav'],
    [
      'Development Phase',
      'Product Search module (filters, sort, grid)',
      'Frontend Dev',
      24,
      'Category, price, color, discount, name filters',
    ],
    [
      'Development Phase',
      'Product Showcase module',
      'Frontend Dev',
      16,
      'Detail view, size selection, add-to-cart',
    ],
    [
      'Development Phase',
      'Shopping cart (add/remove/update/total)',
      'Frontend Dev',
      16,
      'Business logic + drawer UI',
    ],
    [
      'Development Phase',
      'Payment gateway integration (UI + stub/real)',
      'Frontend Dev',
      16,
      'Assumes gateway SDK provided',
    ],
    [
      'Development Phase',
      'Pluggable offers/banner widget',
      'Frontend Dev',
      12,
      'Configurable show/hide, theme',
    ],
    [
      'Development Phase',
      'Cross-browser & responsive fixes',
      'Frontend Dev',
      16,
      'Chrome, Edge, Firefox, Safari, mobile',
    ],
    [
      'Development Phase',
      'SEO baseline (meta tags, semantic HTML, pre-render eval)',
      'Frontend Dev',
      8,
      '',
    ],
    [
      'Development Phase',
      'Mock API server for parallel development',
      'Frontend Dev',
      8,
      'Node/Express + static JSON',
    ],
    [
      'Development Phase',
      'PWA: manifest, service worker caching, update prompt',
      'Frontend Dev',
      12,
      'NFR: fast repeat load, offline start-up',
    ],
    [
      'Development Phase',
      'Web Push notifications (SW handlers, subscription client, header toggle, mock push endpoints)',
      'Frontend Dev',
      16,
      'NFR: re-engagement; HTTPS + VAPID keys',
    ],
    [
      'Development Phase',
      'Resilient HTTP client, module error boundaries, telemetry hook',
      'Frontend Dev',
      12,
      'NFR: resilience, observability',
    ],
    [
      'Development Phase',
      'Skeleton loaders, image and error fallback UI',
      'Frontend Dev',
      12,
      'NFR: smooth UI / 100ms perceived budget',
    ],
    [
      'Development Phase',
      'Module feature flags (env-driven)',
      'Frontend Dev',
      4,
      'VITE_DISABLED_MODULES',
    ],
    [
      'Development Phase',
      'CI pipeline (lint, test, build)',
      'Frontend Dev / DevOps',
      6,
      'GitHub Actions',
    ],
    [
      'Development Phase',
      'Storybook setup and component/module stories',
      'Frontend Dev',
      16,
      'Living UI documentation with mocked data',
    ],
    [
      'Development Phase',
      'Monorepo setup (npm workspaces, Turborepo, shared contract package)',
      'Frontend Dev / DevOps',
      8,
      'Single install, cached builds, one CI entry point',
    ],
    [
      'Development Phase',
      'Backend API: catalog search, product, categories/colors endpoints',
      'Backend Dev',
      16,
      'Express + TypeScript + zod validation',
    ],
    [
      'Development Phase',
      'Backend API: server-side pricing/quote and orders',
      'Backend Dev',
      16,
      'Never trusts client prices; stock checks',
    ],
    [
      'Development Phase',
      'Backend API: Web Push subscription and broadcast',
      'Backend Dev',
      8,
      'VAPID, admin-key protected broadcast',
    ],
    [
      'Development Phase',
      'Backend: PostgreSQL persistence, migrations, idempotent orders, TLS options',
      'Backend Dev',
      16,
      'Idempotency-Key header; JSON fallback without DATABASE_URL',
    ],
    [
      'Development Phase',
      'Structured logging (pino) with masking, telemetry and analytics endpoint',
      'Backend Dev',
      8,
      'NFR: observability',
    ],
    [
      'Development Phase',
      'SCSS design tokens and shared ui/ components',
      'Frontend Dev',
      12,
      'Button, Card, Field, Heading, Table',
    ],
    [
      'Development Phase',
      'Rule-based Chatbot assistant',
      'Frontend Dev',
      8,
      'responses.json intents; localStorage history',
    ],
    [
      'Development Phase',
      'Dockerfiles and docker-compose (postgres, api, web)',
      'DevOps',
      8,
      'Multi-stage, non-root images',
    ],
    [
      'Development Phase',
      'Backend hardening: helmet, CORS allow-list, rate limiting, error envelope, config',
      'Backend Dev',
      8,
      'OWASP baseline',
    ],
    [
      'Development Phase',
      'PostgreSQL persistence: schema migrations, seeding, repositories, docker-compose',
      'Backend Dev',
      16,
      'Products, orders, push subscriptions; parameterized queries',
    ],
    [
      'Development Phase',
      'Cart persistence, URL-synced search filters, debounced search, request cache',
      'Frontend Dev',
      12,
      'localStorage with validation; useSearchParams mirror; TTL cache with in-flight de-dup',
    ],
    [
      'Development Phase',
      'Checkout flow: order placement from the cart drawer',
      'Frontend Dev',
      8,
      'orderService (non-retried POST), confirmation and error states',
    ],
    [
      'Development Phase',
      'Accessibility hardening: focus-managed cart dialog, live regions, WCAG AA contrast',
      'Frontend Dev',
      8,
      'axe checks in Playwright',
    ],
    [
      'Development Phase',
      'Telemetry/analytics events stored locally via API JSON file; global error capture; log masking; CSP/security headers',
      'Frontend Dev',
      6,
      'VITE_TELEMETRY_URL (optional), public/_headers',
    ],
    [
      'Development Phase',
      'Repo quality gates: Husky, lint-staged, commitlint, bundle budget, Dependabot, npm audit',
      'Frontend Dev / DevOps',
      6,
      'Conventional Commits, pre-commit checks, CI budget',
    ],
    [
      'Development Phase',
      'Authentication: register/login (scrypt, JWT), sign-in dialog, auth-gated checkout, account and order history',
      'Frontend Dev / Backend Dev',
      24,
      'Rate-limited auth routes, per-user order visibility, demo payment (pay/cancel)',
    ],
    [
      'Development Phase',
      'Stock reservation: atomic decrement on order, restore on cancel, oversell protection',
      'Backend Dev',
      8,
      'Conditional UPDATE in the order transaction; migration 003',
    ],
    [
      'Development Phase',
      'Dark mode (CSS custom-property tokens) and English/Spanish i18n with persisted preferences',
      'Frontend Dev',
      20,
      'Theme toggle, language menu, message catalogue, contrast checks',
    ],
    [
      'Development Phase',
      'Responsive header, active-nav highlighting, wishlist module, search paging',
      'Frontend Dev',
      12,
      'Stacked layout below desktop width',
    ],
    [
      'Development Phase',
      'Technical documentation: ADRs, architecture views, README, generated deliverables',
      'Architect / TL',
      16,
      '12 ADRs, Mermaid diagrams, Word/Excel deliverables',
    ],
    [
      'Infrastructure & Environment Setup Phase',
      'Infrastructure architecture, environment strategy and sizing (Dev, SIT, QA, UAT, Pre-prod, Prod, DR)',
      'Architect / DevOps',
      16,
      'Topology, promotion path, naming, capacity and cost plan',
    ],
    [
      'Infrastructure & Environment Setup Phase',
      'Infrastructure as code baseline: network, container registry, Kubernetes namespaces, shared modules',
      'DevOps',
      24,
      'Reusable templates so every environment is built the same way',
    ],
    [
      'Infrastructure & Environment Setup Phase',
      'Dev environment: docker-compose, local Postgres, seed data, developer onboarding',
      'DevOps / Frontend Dev',
      8,
      'One-command start for web, API and database',
    ],
    [
      'Infrastructure & Environment Setup Phase',
      'SIT environment: web, API, managed Postgres, test data, integration endpoints',
      'DevOps / QA',
      16,
      'Shared integration environment, resettable data',
    ],
    [
      'Infrastructure & Environment Setup Phase',
      'QA environment: isolated deployment, data refresh and automation access',
      'DevOps / QA',
      12,
      'Hosts the Playwright and regression suites',
    ],
    [
      'Infrastructure & Environment Setup Phase',
      'UAT / Staging environment: production-like deployment with masked data',
      'DevOps',
      16,
      'Business acceptance testing and release rehearsal',
    ],
    [
      'Infrastructure & Environment Setup Phase',
      'Pre-production / performance environment sized like production',
      'DevOps',
      16,
      'Used for k6 load tests and failover checks',
    ],
    [
      'Infrastructure & Environment Setup Phase',
      'Production environment: hosting, autoscaling, CDN, WAF, managed Postgres with backups',
      'DevOps',
      32,
      'Kubernetes manifests, ingress, HPA, high availability',
    ],
    [
      'Infrastructure & Environment Setup Phase',
      'Disaster recovery: backup and restore, multi-zone or secondary region, DR runbook and drill',
      'DevOps',
      16,
      'RPO/RTO targets agreed with the client',
    ],
    [
      'Infrastructure & Environment Setup Phase',
      'DNS, TLS certificates and domain setup per environment',
      'DevOps',
      8,
      'HTTPS is required for service workers and Web Push',
    ],
    [
      'Infrastructure & Environment Setup Phase',
      'Secrets and configuration management per environment (JWT_SECRET, VAPID keys, DATABASE_URL, CORS)',
      'DevOps / Backend Dev',
      12,
      'Secret store, rotation, no secrets in images or repo',
    ],
    [
      'Infrastructure & Environment Setup Phase',
      'Observability stack per environment: logs, metrics (/metrics), dashboards, alerts, telemetry collector',
      'DevOps',
      20,
      'Prometheus-style metrics, structured log shipping, on-call alerts',
    ],
    [
      'Infrastructure & Environment Setup Phase',
      'Network and security hardening: firewall rules, least-privilege access, image scanning, access reviews',
      'DevOps / Security',
      16,
      'Trivy and CodeQL gates, private database access',
    ],
    [
      'Infrastructure & Environment Setup Phase',
      'Environment validation, smoke checks and handover documentation',
      'DevOps / QA',
      8,
      'Health checks, access matrix, environment runbooks',
    ],
    [
      'Testing & Bug Fixing Phase',
      'Unit tests for business layer (cart, filters)',
      'Frontend Dev',
      12,
      'Vitest',
    ],
    [
      'Testing & Bug Fixing Phase',
      'Component, service and module tests (Testing Library)',
      'Frontend Dev',
      24,
      '~110 tests covering loading/error/retry states, persistence, checkout and focus handling',
    ],
    [
      'Testing & Bug Fixing Phase',
      'Backend API tests (supertest) incl. validation, security and pricing',
      'Backend Dev',
      16,
      '~40 tests',
    ],
    [
      'Testing & Bug Fixing Phase',
      'Playwright end-to-end tests (desktop + mobile, incl. axe accessibility)',
      'QA / Frontend Dev',
      16,
      '~21 scenarios x 2 projects',
    ],
    [
      'Testing & Bug Fixing Phase',
      'Push, offline and PWA install testing on real devices',
      'QA',
      8,
      'Android/Chrome, desktop Edge/Chrome, iOS Safari (installed PWA)',
    ],
    ['Testing & Bug Fixing Phase', 'Manual functional & cross-browser testing', 'QA', 16, ''],
    ['Testing & Bug Fixing Phase', 'Bug triage & fixes', 'Frontend Dev / QA', 16, ''],
    [
      'Testing & Bug Fixing Phase',
      'Performance validation (load time, interaction latency)',
      'QA / Frontend Dev',
      8,
      '100ms interaction budget',
    ],
    [
      'Testing & Bug Fixing Phase',
      'Test strategy, test plan and test case design (functional, regression, NFR)',
      'QA',
      16,
      'Traceability to requirements and NFRs',
    ],
    [
      'Testing & Bug Fixing Phase',
      'SIT execution: UI to API integration, checkout, auth, stock, push and offline flows',
      'QA',
      32,
      'End-to-end scenarios across services, error and edge cases',
    ],
    [
      'Testing & Bug Fixing Phase',
      'SIT defect fixing and retest',
      'Frontend Dev / Backend Dev / QA',
      24,
      'Triage, fix, verify, regression',
    ],
    [
      'Testing & Bug Fixing Phase',
      'QA full regression cycle (desktop, tablet, mobile; Chrome, Edge, Firefox, Safari)',
      'QA',
      24,
      'Includes dark mode and both languages',
    ],
    [
      'Testing & Bug Fixing Phase',
      'Security testing: OWASP Top 10 review, dependency audit, auth and rate-limit checks',
      'QA / Backend Dev',
      16,
      'npm audit, CodeQL, image scan, manual checks',
    ],
    [
      'Testing & Bug Fixing Phase',
      'Load and performance testing (k6) and tuning',
      'QA / Backend Dev',
      12,
      'Thresholds: p95 < 300 ms, error rate < 1%',
    ],
    [
      'Testing & Bug Fixing Phase',
      'Accessibility audit (WCAG 2.1 AA, keyboard and screen reader)',
      'QA',
      8,
      'axe plus manual verification',
    ],
    [
      'Testing & Bug Fixing Phase',
      'UAT support, defect fixes and QA sign-off report',
      'QA / TL',
      16,
      'Business acceptance, exit criteria, test summary report',
    ],
    [
      'Release & Deployment Phase',
      'CD pipeline: image build, scan, deploy to staging and production',
      'DevOps',
      12,
      'Trivy scan, environment promotion, rollback',
    ],
    [
      'Release & Deployment Phase',
      'Release readiness: release notes, runbook, rollback plan, go/no-go review',
      'TL / PM',
      8,
      '',
    ],
    [
      'Release & Deployment Phase',
      'Production release and smoke test',
      'DevOps / QA',
      8,
      'Health, metrics and critical-path checks',
    ],
    [
      'Release & Deployment Phase',
      'Hypercare and post-release support',
      'Frontend Dev / Backend Dev / QA',
      24,
      'Monitoring, incident response, hotfixes during the first weeks',
    ],
    [
      'Project Management',
      'Planning, status reporting, reviews',
      'TL / PM',
      16,
      'Across the full delivery, from planning through hypercare',
    ],
    ['Project Management', 'Risk management & stakeholder communication', 'TL / PM', 8, ''],
  ];

  let currentPhase = '';
  data.forEach((r) => {
    if (r[0] !== currentPhase) {
      currentPhase = r[0];
    }
    sheet.addRow({ phase: r[0], activity: r[1], role: r[2], effort: r[3], notes: r[4] });
  });

  // Totals per phase
  const phases = [...new Set(data.map((r) => r[0]))];
  sheet.addRow([]);
  const totalsHeaderRow = sheet.addRow(['Phase Totals']);
  totalsHeaderRow.getCell(1).font = { bold: true };
  totalsHeaderRow.getCell(1).fill = SECTION_FILL;

  let grandTotal = 0;
  phases.forEach((ph) => {
    const total = data.filter((r) => r[0] === ph).reduce((s, r) => s + r[3], 0);
    grandTotal += total;
    sheet.addRow([ph, '', '', total, '']);
  });

  const grandRow = sheet.addRow([
    'Grand Total',
    '',
    '',
    grandTotal,
    '≈ ' +
      Math.ceil(grandTotal / 8) +
      ' person-days (' +
      Math.ceil(grandTotal / 40) +
      ' person-weeks)',
  ]);
  grandRow.font = { bold: true };
  grandRow.eachCell((c) => (c.fill = HEADER_FILL));
  grandRow.getCell(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  grandRow.getCell(4).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  grandRow.getCell(5).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.alignment = { vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
      };
    });
  });

  const assumptionsSheet = workbook.addWorksheet('Assumptions & Scope');
  assumptionsSheet.columns = [
    { header: 'Category', key: 'cat', width: 20 },
    { header: 'Item', key: 'item', width: 90 },
  ];
  assumptionsSheet.getRow(1).eachCell((c) => {
    c.fill = HEADER_FILL;
    c.font = HEADER_FONT;
  });
  const assumptionRows = [
    [
      'In Scope',
      'Home, Product Search, Product Showcase, Shopping Cart, Payment Gateway UI (frontend only)',
    ],
    ['In Scope', 'Plugin-based architecture with at least one fully working functional module'],
    [
      'In Scope',
      'Full-stack option: Express/TypeScript backend (catalog, pricing, orders, push) in a Turborepo monorepo with shared types',
    ],
    ['In Scope', 'Mock backend APIs for development/demo purposes'],
    [
      'In Scope',
      'Test strategy, SIT, QA regression, security, load and accessibility testing, UAT support, release to staging/production and hypercare',
    ],
    [
      'In Scope',
      'Infrastructure setup for Dev, SIT, QA, UAT, Pre-prod, Production and DR: IaC, secrets, TLS/DNS, observability, backups and security hardening',
    ],
    [
      'In Scope',
      'PWA (offline app shell), Web Push opt-in, resilient HTTP client, error boundaries, telemetry hook, feature flags, CI, Storybook',
    ],
    [
      'Out of Scope',
      'Production push campaign tooling, audience segmentation and VAPID key management',
    ],
    [
      'Out of Scope',
      'Payment processor integration and cloud cost/licence charges (infrastructure setup effort is in scope; the client supplies accounts and pays usage)',
    ],
    ['Out of Scope', 'Real payment processor integration and PCI compliance work'],
    ['Out of Scope', 'Admin/inventory management back-office screens'],
    ['Assumption', 'Client provides production REST APIs matching the documented contract'],
    [
      'Assumption',
      'Moderate catalog size; pagination/server-side search can be added later without redesign',
    ],
    ['Assumption', 'Only evergreen browser support required (no IE11)'],
    [
      'Assumption',
      'Cloud accounts, subscriptions, network access and domain ownership are provided by the client; infra effort assumes one cloud provider and Kubernetes',
    ],
    [
      'Assumption',
      'SIT and UAT environments, test users and business UAT participants are provided by the client',
    ],
    [
      'Assumption',
      'Hypercare is estimated for roughly the first two weeks after release; efforts are person-hours',
    ],
    ['Assumption', 'Application is served over HTTPS (required for service workers and Web Push)'],
    [
      'Assumption',
      'Production telemetry/analytics collector (Sentry/App Insights) is provided by client; the sample stores events in a local JSON file via the API',
    ],
  ];
  assumptionRows.forEach((r) => assumptionsSheet.addRow(r));
  assumptionsSheet.eachRow((row) => {
    row.eachCell((cell) => (cell.alignment = { vertical: 'middle', wrapText: true }));
  });

  await workbook.xlsx.writeFile(path.join(OUT_DIR, 'RIMSS - Estimation Sheet.xlsx'));
  console.log('Estimation sheet generated.');
}

main();
