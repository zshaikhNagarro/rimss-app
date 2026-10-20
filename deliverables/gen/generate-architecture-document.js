const { Document, Packer, Paragraph, ImageRun, TextRun, AlignmentType } = require('docx');
const fs = require('node:fs');
const path = require('node:path');
const {
  h1,
  p,
  bullet,
  pageBreak,
  coverPage,
  referencePageFurniture,
  revisionHistory,
  contentsPage,
} = require('./docTemplateParts');

const OUT_DIR = path.join(__dirname, '..', 'output');
const ASSETS_DIR = path.join(__dirname, 'assets');
fs.mkdirSync(OUT_DIR, { recursive: true });

const TODAY = new Date().toISOString().slice(0, 10);
const TARGET_WIDTH = 620;

// Source images are 1200px wide (see render-diagrams.js).
function diagram(file, height, caption) {
  const data = fs.readFileSync(path.join(ASSETS_DIR, file));
  return [
    new Paragraph({
      children: [
        new ImageRun({
          data,
          type: 'png',
          transformation: {
            width: TARGET_WIDTH,
            height: Math.round((TARGET_WIDTH * height) / 1200),
          },
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [new TextRun({ text: caption, italics: true, size: 18, color: '6B7280' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
  ];
}

const sections = [
  [
    '2. Technical Diagram',
    'technical-diagram.png',
    760,
    'Client, SPA and backend topology',
    'End-to-end view from browsers through the CDN-served SPA to the API and backing services.',
  ],
  [
    '3. System Architecture',
    'architecture-diagram.png',
    640,
    'System architecture',
    'Layered view of the application and its runtime dependencies.',
  ],
  [
    '4. System Model',
    'system-model-diagram.png',
    700,
    'System model',
    'Main actors, capabilities and their relationships.',
  ],
  [
    '5. Frontend Component Architecture',
    'component-architecture-diagram.png',
    720,
    'Frontend component architecture',
    'Plugin registry, feature modules and shared layers (ADR 0001).',
  ],
  [
    '6. API Architecture',
    'api-architecture-diagram.png',
    640,
    'API architecture',
    'Composition root, routers and injected repositories (ADR 0002).',
  ],
  [
    '7. Data Flow',
    'data-flow-diagram.png',
    560,
    'Data flow',
    'How catalog and cart data move between UI, services and API.',
  ],
  [
    '8. Checkout Sequence',
    'checkout-sequence-diagram.png',
    600,
    'Checkout sequence',
    'Server-side pricing, sign-in at checkout, idempotent order creation and stock reservation (ADR 0004, 0010, 0011).',
  ],
  [
    '9. Web Push Sequence',
    'push-sequence-diagram.png',
    520,
    'Web Push sequence',
    'Subscription and admin broadcast with VAPID (ADR 0006).',
  ],
  [
    '10. Repository and Folder Structure',
    'folder-structure-diagram.png',
    700,
    'Repository and application folder structure',
    'Turborepo layout of the app, API and shared package.',
  ],
];

referencePageFurniture('General Document.docx', 'RIMSS')
  .then((pageFurniture) => {
    const children = [
      ...coverPage('RIMSS', 'Architecture Diagrams'),
      ...revisionHistory([['1.00', TODAY, 'Zibran Shaikh', 'Consolidated architecture diagrams']]),
      ...contentsPage(),
      h1('1. Introduction'),
      p(
        'This document gathers all RIMSS architecture diagrams in one place. Decisions behind them are recorded in docs/adr and the editable Mermaid versions are in docs/ARCHITECTURE.md.',
      ),
      bullet('rimss-app: React 19 PWA with a plugin-based module registry.'),
      bullet('rimss-api: Express API with injected repositories (PostgreSQL or JSON/in-memory).'),
      bullet('@rimss/shared: types and zod request schemas used by both.'),
    ];

    for (const [title, file, height, caption, intro] of sections) {
      children.push(pageBreak(), h1(title), p(intro), ...diagram(file, height, caption));
    }

    return Packer.toBuffer(
      new Document({
        styles: { default: { document: { run: { font: 'Calibri', size: 22 } } } },
        sections: [{ ...pageFurniture, children }],
      }),
    );
  })
  .then((buffer) => {
    fs.writeFileSync(path.join(OUT_DIR, 'RIMSS - Architecture Diagrams.docx'), buffer);
    console.log('Architecture Diagrams document generated.');
  })
  .catch((error) => {
    console.error('Failed to generate architecture document:', error);
    process.exitCode = 1;
  });
