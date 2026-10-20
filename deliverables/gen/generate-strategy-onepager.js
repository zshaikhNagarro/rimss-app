const { Document, Packer } = require('docx');
const fs = require('node:fs');
const path = require('node:path');
const {
  h1,
  h2,
  p,
  bullet,
  pageBreak,
  table,
  coverPage,
  referencePageFurniture,
  revisionHistory,
  contentsPage,
} = require('./docTemplateParts');

const OUT_DIR = path.join(__dirname, '..', 'output');
fs.mkdirSync(OUT_DIR, { recursive: true });

const TODAY = new Date().toISOString().slice(0, 10);

// Follows the "General Document" template: cover, revision history, contents,
// then Introduction / Strategy Overview / Glossary sections.
referencePageFurniture('General Document.docx', 'RIMSS')
  .then((pageFurniture) => {
    const doc = new Document({
      styles: { default: { document: { run: { font: 'Calibri', size: 22 } } } },
      sections: [
        {
          ...pageFurniture,
          children: [
            ...coverPage('RIMSS', 'Build Strategy Document'),
            ...revisionHistory([
              [
                '1.00',
                TODAY,
                'Zibran Shaikh',
                'Initial version for YCompany RIMSS promotion assignment',
              ],
            ]),
            ...contentsPage(),

            h1('1. Introduction'),
            p(
              'This document summarizes the build strategy used to deliver the RIMSS (Retail Inventory Management Software System) frontend working sample for the YCompany promotion assignment. It complements the Solution Approach document by focusing on how the solution is built, sequenced and quality-checked rather than what it contains.',
            ),

            h1('2. Strategy Overview'),
            h2('2.1 Build Approach'),
            bullet(
              'Stack: React 19 + TypeScript, Vite build tooling, React Router for navigation.',
            ),
            bullet(
              'Architecture: plugin-based module registry - the app shell renders whatever functional modules are registered, enabling independent addition/removal of features.',
            ),
            bullet(
              'Business logic (cart, search filtering) implemented as pure, framework-agnostic functions for maximum testability.',
            ),
            bullet(
              'Backend: Express + TypeScript API (zod validation, helmet, CORS allow-list, rate limiting) in the same Turborepo monorepo, sharing types via @rimss/shared.',
            ),
            bullet(
              'Mock Node.js/Express API server with static JSON backs frontend development in parallel with backend delivery.',
            ),
            bullet(
              'Persistence and delivery: PostgreSQL with SQL migrations (JSON fallback locally), idempotent order creation, structured pino logging, and Docker/docker-compose images.',
            ),
            bullet(
              'UX additions: SCSS design tokens (CSS custom properties) with shared ui/ primitives, light and dark themes, English/Spanish UI strings, a responsive header and a rule-based Chatbot assistant.',
            ),
            bullet(
              'Accounts and orders: JWT authentication, sign-in dialog, auth-gated checkout with a demo payment, order history, and atomic stock reservation so concurrent orders cannot oversell.',
            ),
            bullet(
              'Route-level code splitting (React.lazy/Suspense) and a full PWA setup (offline caching, installable manifest, update prompts).',
            ),
            bullet(
              'Resilience by design: retrying HTTP client (timeout + backoff), per-module error boundaries, skeleton loaders and error fallbacks, telemetry hook, env-driven feature flags.',
            ),
            bullet(
              'Opt-in Web Push notifications via the service worker, served by Web Push (VAPID) endpoints on the mock server.',
            ),
            bullet(
              'Quality tooling: Vitest + Testing Library tests (209 app and 64 API tests), Playwright e2e on desktop and mobile with axe accessibility checks, k6 load test, Storybook for UI states, CodeQL and image scanning, GitHub Actions CI (lint, test, build).',
            ),
            bullet(
              'Environments and release: infrastructure as code for Dev, SIT, QA, UAT, Pre-prod, Production and DR; staged promotion with smoke tests, rollback plan, go/no-go review and hypercare.',
            ),

            h2('2.2 Delivery Plan by Phase'),
            p(
              'Effort per phase is detailed in the Estimation Sheet (about 1,100 person-hours in total); phases overlap where noted.',
            ),
            table(
              ['Phase', 'Focus', 'Key Outputs'],
              [
                [
                  'Requirements & Design',
                  'Scope, NFRs, architecture, UX, API contract',
                  'Architecture diagrams, ADRs, wireframes, API contract',
                ],
                [
                  'Development',
                  'App shell, plugin modules, API, auth, orders and stock, PWA, push, theming, i18n',
                  'Working full-stack sample, Storybook, unit and API tests',
                ],
                [
                  'Infrastructure & Environments',
                  'IaC, Dev/SIT/QA/UAT/Pre-prod/Prod/DR, secrets, TLS, observability',
                  'Repeatable environments, runbooks, access matrix',
                ],
                [
                  'SIT & QA',
                  'Test plan, SIT, regression, security, load, accessibility',
                  'Test reports, defect log, exit criteria met',
                ],
                [
                  'UAT & Release',
                  'Business acceptance, CD pipeline, go/no-go, production release',
                  'Signed-off release, release notes, smoke test results',
                ],
                [
                  'Hypercare',
                  'Monitoring, incident response, hotfixes',
                  'Stable production, handover to support',
                ],
              ],
              [20, 40, 40],
            ),

            h2('2.3 Quality Gates'),
            bullet('Unit and component tests (npm test) must pass in CI before merge.'),
            bullet(
              'Lint, production build (npm run build) and Storybook build must complete without errors.',
            ),
            bullet(
              'Manual smoke test across Chrome, Edge, Firefox, Safari and one mobile viewport.',
            ),
            bullet(
              'SIT exit: integration scenarios pass with no open critical or high defects; QA regression, security (OWASP, dependency audit), load (p95 < 300 ms) and WCAG AA checks complete.',
            ),
            bullet('UAT sign-off and a go/no-go review before each production release.'),
            bullet(
              'Lighthouse/PWA checks (installability, offline start-up) and a push-notification round trip before demo.',
            ),

            h2('2.4 Risks & Mitigations'),
            table(
              ['Risk', 'Mitigation'],
              [
                [
                  'Backend APIs not ready in time',
                  'Mock server unblocks frontend development end-to-end',
                ],
                [
                  'Scope creep on plugin framework',
                  'Timebox plugin registry to the minimal contract needed for Search/Showcase modules',
                ],
                [
                  'Performance regressions from added features',
                  'Automate build size + interaction latency checks in CI',
                ],
                [
                  'Push support varies by browser/OS (e.g. iOS needs an installed PWA)',
                  'Feature-detect and hide the toggle when unsupported; test on real devices',
                ],
                [
                  'Environments or access (cloud accounts, SIT/UAT data) not ready on time',
                  'Start infrastructure setup early with IaC, agree owners and access in the planning phase',
                ],
                [
                  'Defects found late in SIT/UAT delay release',
                  'Automated regression in CI, early SIT of critical flows, buffer for defect fixing and retest',
                ],
                [
                  'Overselling or data loss under concurrent orders',
                  'Atomic stock reservation, idempotent orders, load tests on the pre-production environment',
                ],
              ],
              [30, 70],
            ),

            pageBreak(),
            h1('3. Glossary'),
            h2('3.1 Terms'),
            table(
              ['Term', 'Definition'],
              [
                [
                  'RIMSS',
                  'Retail Inventory Management Software System - the case study application',
                ],
                [
                  'NFR',
                  'Non-Functional Requirement (performance, scalability, cross-platform support, etc.)',
                ],
                [
                  'Plugin Registry',
                  'Custom self-registration pattern letting functional modules plug into the app shell without code changes',
                ],
                ['SPA', 'Single Page Application'],
                ['PWA', 'Progressive Web App - installable, offline-capable web application'],
                [
                  'Web Push',
                  'Browser push notifications delivered through a service worker using VAPID-signed messages',
                ],
                ['Skeleton loader', 'Placeholder UI shown while data loads, preserving layout'],
                [
                  'SIT',
                  'System Integration Testing - verifying the UI, API and database work together',
                ],
                ['UAT', 'User Acceptance Testing - business sign-off before release'],
                [
                  'IaC',
                  'Infrastructure as Code - environments defined and created from versioned templates',
                ],
                ['i18n', 'Internationalisation - UI text served from per-language catalogues'],
                ['CDN', 'Content Delivery Network'],
              ],
              [25, 75],
            ),
          ],
        },
      ],
    });

    return Packer.toBuffer(doc);
  })
  .then((buffer) => {
    fs.writeFileSync(path.join(OUT_DIR, 'RIMSS - Build Strategy Document.docx'), buffer);
    console.log('Build Strategy document generated (General Document template).');
  })
  .catch((error) => {
    console.error('Failed to generate build strategy document:', error);
    process.exitCode = 1;
  });
