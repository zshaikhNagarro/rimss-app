const { Document, Packer } = require('docx');
const fs = require('fs');
const path = require('path');
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
                'Senior Staff Engineer Candidate',
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
              'Route-level code splitting (React.lazy/Suspense) and a full PWA setup (offline caching, installable manifest, update prompts).',
            ),
            bullet(
              'Resilience by design: retrying HTTP client (timeout + backoff), per-module error boundaries, skeleton loaders and error fallbacks, telemetry hook, env-driven feature flags.',
            ),
            bullet(
              'Opt-in Web Push notifications via the service worker, served by Web Push (VAPID) endpoints on the mock server.',
            ),
            bullet(
              'Quality tooling: Vitest + Testing Library tests, Storybook for UI states, GitHub Actions CI (lint, test, build).',
            ),

            h2('2.2 4-Week Delivery Plan'),
            table(
              ['Week', 'Focus', 'Key Outputs'],
              [
                [
                  '1',
                  'Setup & Design',
                  'Project scaffold, architecture & technical diagrams, API contracts, wireframes',
                ],
                [
                  '2',
                  'Core Build',
                  'App shell, plugin registry, Home + Product Search module, mock API',
                ],
                [
                  '3',
                  'Feature Completion',
                  'Product Showcase, Shopping Cart, Payment Gateway stub, responsive polish, PWA + Web Push, skeleton/fallback UI',
                ],
                [
                  '4',
                  'Hardening',
                  'Component/service/module tests, Storybook, CI, cross-browser fixes, performance tuning, documentation & demo',
                ],
              ],
              [12, 30, 58],
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
                ['CDN', 'Content Delivery Network'],
              ],
              [25, 75],
            ),
          ],
        },
      ],
    });

    return Packer.toBuffer(doc).then((buffer) => {
      fs.writeFileSync(path.join(OUT_DIR, 'RIMSS - Build Strategy Document.docx'), buffer);
      console.log('Build Strategy document generated (General Document template).');
    });
  })
  .catch((error) => {
    console.error('Failed to generate build strategy document:', error);
    process.exitCode = 1;
  });
