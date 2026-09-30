const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.join(__dirname, '..', 'output');
fs.mkdirSync(OUT_DIR, { recursive: true });

const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC65B3C' } };
const HEADER_FONT = { bold: true, color: { argb: 'FFFFFFFF' } };
const SECTION_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0E4E0' } };

async function main() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'RIMSS Promotion Assignment';
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
      'Telemetry beacon and global error capture; CSP/security headers',
      'Frontend Dev',
      6,
      'VITE_TELEMETRY_URL, public/_headers',
    ],
    [
      'Development Phase',
      'Repo quality gates: Husky, lint-staged, commitlint, bundle budget, Dependabot, npm audit',
      'Frontend Dev / DevOps',
      6,
      'Conventional Commits, pre-commit checks, CI budget',
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
      'Project Management',
      'Planning, status reporting, reviews',
      'TL / PM',
      16,
      'Across full 4-week duration',
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
      'PWA (offline app shell), Web Push opt-in, resilient HTTP client, error boundaries, telemetry hook, feature flags, CI, Storybook',
    ],
    [
      'Out of Scope',
      'Production push campaign tooling, audience segmentation and VAPID key management',
    ],
    [
      'Out of Scope',
      'Production hosting, managed Postgres provisioning/backups and payment processor (local docker-compose Postgres provided)',
    ],
    ['Out of Scope', 'Real payment processor integration and PCI compliance work'],
    ['Out of Scope', 'Admin/inventory management back-office screens'],
    ['Assumption', 'Client provides production REST APIs matching the documented contract'],
    [
      'Assumption',
      'Moderate catalog size; pagination/server-side search can be added later without redesign',
    ],
    ['Assumption', 'Only evergreen browser support required (no IE11)'],
    ['Assumption', 'Application is served over HTTPS (required for service workers and Web Push)'],
    [
      'Assumption',
      'Telemetry backend (Sentry/App Insights) is provided by client; only the integration hook is estimated',
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
