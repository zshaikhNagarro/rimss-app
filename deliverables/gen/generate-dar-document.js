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
  darCoverPage,
  referencePageFurniture,
  revisionHistory,
  contentsPage,
} = require('./docTemplateParts');

const OUT_DIR = path.join(__dirname, '..', 'output');
fs.mkdirSync(OUT_DIR, { recursive: true });

const TODAY = new Date().toISOString().slice(0, 10);

// Follows the DAR (Decision Analysis and Resolution) Template structure to
// justify the RIMSS frontend framework/architecture choice.
referencePageFurniture('DAR Template.docx', 'YCompany-RIMSS - DAR Document')
  .then((pageFurniture) => {
    const doc = new Document({
      styles: { default: { document: { run: { font: 'Calibri', size: 22 } } } },
      sections: [
        {
          ...pageFurniture,
          children: [
            ...darCoverPage('YCompany-RIMSS', 'Senior Staff Engineer Candidate'),
            ...revisionHistory([
              [
                '1.00',
                TODAY,
                'Senior Staff Engineer Candidate',
                'Initial DAR for frontend framework & architecture selection',
              ],
            ]),
            ...contentsPage(),

            h1('1. Introduction'),
            p(
              'This Decision Analysis and Resolution (DAR) document evaluates two candidate approaches for building the RIMSS customer-facing frontend and justifies the final selection used in the accompanying working sample and Solution Approach document.',
            ),
            h2('1.1 Objective and scope of document'),
            p(
              "Objective: select the frontend framework and application architecture that best satisfies RIMSS's requirement for a pluggable, modular design while meeting the stated NFRs (cross-platform, fast load, 100ms interaction budget, SEO, testability). Scope is limited to the frontend/presentation tier; backend API implementation is out of scope for this assignment.",
            ),

            h1('2. Requirements at a Glance'),
            bullet('Cross-platform support across desktop, tablet and mobile browsers'),
            bullet(
              'Pluggable/modular architecture - functional modules can be added or removed without shell changes',
            ),
            bullet('Fast initial load and sub-100ms interaction responsiveness'),
            bullet('In-built SEO friendliness'),
            bullet('Unit testable business logic, CI/CD-ready build & test scripts'),

            h1('3. Available tools'),
            p('Two candidate approaches were evaluated for delivering the RIMSS frontend:'),

            h2('3.1 React + Vite with a custom Plugin Registry'),
            p(
              'A single-page application built with React 19 and TypeScript, bundled by Vite, where functional modules self-register into a lightweight in-house Plugin Registry that the app shell renders generically.',
            ),
            h2('3.1.1 Features'),
            bullet(
              'Full control over the plugin/module contract (id, route, nav label, component)',
            ),
            bullet(
              'Minimal dependency footprint; Vite provides fast dev server + optimized production builds',
            ),
            bullet('Route-level code splitting via React.lazy for each registered module'),
            bullet(
              'Straightforward to add a PWA layer (service worker, manifest, offline caching)',
            ),
            h2('3.1.2 Pricing'),
            p(
              'Open-source, no licensing cost. Effort cost only (build/maintain the registry, estimated in the Estimation Sheet).',
            ),

            h2('3.2 Next.js with Module Federation'),
            p(
              'A framework-driven approach using Next.js file-based routing and React Server Components, with Webpack Module Federation for runtime plugin loading across independently deployable micro-frontends.',
            ),
            h2('3.2.1 Features'),
            bullet('Built-in SSR/SSG - strongest out-of-the-box SEO and first-paint performance'),
            bullet('Module Federation enables independently deployed micro-frontends at runtime'),
            bullet('Larger ecosystem of conventions (routing, data fetching, image optimization)'),
            h2('3.2.2 Pricing'),
            p(
              'Open-source, no licensing cost. Higher setup/tooling effort due to Module Federation configuration and SSR infrastructure.',
            ),

            h1('4. Comparison Analysis'),
            p(
              'Each candidate is scored against the key requirements, then compared feature-by-feature and on non-functional fit.',
            ),

            h2('4.1 Point Matrix'),
            p('Points assigned 1 (poor fit) to 5 (excellent fit) per requirement:'),
            table(
              ['Feature', 'Points'],
              [
                [
                  'Pluggable/modular architecture fit',
                  'React + Vite: 5  |  Next.js + Module Federation: 4',
                ],
                [
                  'Time to build for a 4-week assignment',
                  'React + Vite: 5  |  Next.js + Module Federation: 2',
                ],
                ['Out-of-the-box SEO/SSR', 'React + Vite: 2  |  Next.js + Module Federation: 5'],
                [
                  'Interaction responsiveness (100ms budget)',
                  'React + Vite: 5  |  Next.js + Module Federation: 4',
                ],
                [
                  'Learning curve / team familiarity',
                  'React + Vite: 5  |  Next.js + Module Federation: 3',
                ],
                ['Total', 'React + Vite: 22  |  Next.js + Module Federation: 18'],
              ],
              [55, 45],
            ),

            h2('4.2 Technical Comparison'),
            table(
              ['Feature', 'React + Vite + Plugin Registry', 'Next.js + Module Federation'],
              [
                [
                  'Bundle tooling',
                  'Vite (esbuild/Rollup), sub-second HMR',
                  'Webpack-based, slower cold start',
                ],
                [
                  'Plugin/module extensibility',
                  'Custom registry, full control, simple contract',
                  'Module Federation, more powerful but heavier setup',
                ],
                [
                  'Code splitting',
                  'React.lazy per module route',
                  'Built-in per-page + federation remotes',
                ],
                [
                  'Testing ecosystem',
                  'Vitest + Testing Library, fast',
                  'Jest/Vitest, same coverage, more config',
                ],
              ],
              [28, 36, 36],
            ),

            h2('4.3 Non-Functional Fit Comparison'),
            table(
              ['Feature', 'React + Vite + Plugin Registry', 'Next.js + Module Federation'],
              [
                [
                  'SEO',
                  'Requires added SSR/pre-render effort (documented as follow-on)',
                  'Native SSR/SSG support',
                ],
                [
                  'Performance (initial load)',
                  'Small bundle, CDN + compression',
                  'Slightly heavier runtime, but server-rendered first paint',
                ],
                [
                  'PWA / offline support',
                  'Straightforward via vite-plugin-pwa',
                  'Supported but less common in Next.js app router setups',
                ],
                [
                  'Delivery timeline fit (4 weeks)',
                  'Achievable end-to-end incl. tests',
                  'Tight given federation/infra setup overhead',
                ],
              ],
              [28, 36, 36],
            ),

            h1('5. Recommendation'),
            p(
              "React + Vite with the custom Plugin Registry is recommended for this assignment's 4-week delivery window and FRONTEND-REACT skill focus. It scores highest on the point matrix, most directly demonstrates the plugin-based architecture the case study asks for, and is fast enough to build, test and document end-to-end in scope. Next.js with Module Federation is recommended as a future production evolution once SSR/SEO becomes a hard requirement and multiple teams need to deploy modules independently.",
            ),

            h1('6. Assumptions'),
            bullet(
              'Team has existing React/TypeScript expertise; no ramp-up time budgeted for a new framework',
            ),
            bullet(
              'SEO is a stated NFR but not the top priority within the 4-week assignment window',
            ),
            bullet(
              'Only one team/module owner is building all functional modules for this assignment (no need for independently deployed micro-frontends yet)',
            ),

            h1('7. Risks'),
            bullet(
              'Custom Plugin Registry is less battle-tested than a framework-provided mechanism - mitigated by keeping its contract minimal and unit testing module registration',
            ),
            bullet(
              'Migrating to SSR/Next.js later would require revisiting data-fetching patterns in each module',
            ),
            bullet(
              'Without Module Federation, independently deployable micro-frontends are not yet possible - acceptable for current scope, flagged for future roadmap',
            ),

            pageBreak(),
            h1('8. Appendix'),
            h2('8.1 References'),
            bullet('YCompany RIMSS Case Study v1.3 (assignment brief)'),
            bullet('MSAG Diagram Preparation Guidelines v1.1 (Nagarro Architecture Group)'),
            bullet('React documentation (react.dev) and Vite documentation (vite.dev)'),
            bullet('RIMSS Solution Approach document (this assignment package)'),
          ],
        },
      ],
    });

    return Packer.toBuffer(doc).then((buffer) => {
      fs.writeFileSync(
        path.join(OUT_DIR, 'RIMSS - DAR - Frontend Architecture Selection.docx'),
        buffer,
      );
      console.log('DAR document generated (DAR template).');
    });
  })
  .catch((error) => {
    console.error('Failed to generate DAR document:', error);
    process.exitCode = 1;
  });
