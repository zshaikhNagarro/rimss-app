/**
 * Hand-authored SVG diagrams (MSAG-guideline style: boxed layers, legends,
 * light professional colors) rasterized to PNG for embedding in the docx.
 */

const ACCENT = '#C65B3C';
const GREY_BORDER = '#B9C0C7';
const GREY_FILL = '#F4F6F8';
const BLUE_FILL = '#DCEBFA';
const BLUE_BORDER = '#8FB8DD';
const GREEN_FILL = '#E1F0E1';
const GREEN_BORDER = '#8FC38F';
const AMBER_FILL = '#FBEBD9';
const AMBER_BORDER = '#E3B274';
const TEXT_DARK = '#22303C';
const TEXT_MUTED = '#5B6B77';

function box(x, y, w, h, { fill = GREY_FILL, stroke = GREY_BORDER, rx = 8, dashed = false } = {}) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="1.5" ${
    dashed ? 'stroke-dasharray="6,4"' : ''
  }/>`;
}

function escapeXml(text) {
  return String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function label(
  x,
  y,
  text,
  { size = 13, weight = '600', color = TEXT_DARK, anchor = 'start' } = {},
) {
  return `<text x="${x}" y="${y}" font-family="Calibri, Segoe UI, Arial" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}">${escapeXml(text)}</text>`;
}

function arrow(x1, y1, x2, y2, { color = TEXT_MUTED, dashed = false, markerEnd = true } = {}) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2" ${
    dashed ? 'stroke-dasharray="5,4"' : ''
  } ${markerEnd ? 'marker-end="url(#arrowhead)"' : ''} />`;
}

const DEFS = `
<defs>
  <marker id="arrowhead" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
    <polygon points="0 0, 10 4, 0 8" fill="${TEXT_MUTED}" />
  </marker>
</defs>`;

// ---------------------------------------------------------------------------
// Diagram 1: Technical / Solution diagram - end-to-end client/server topology
// ---------------------------------------------------------------------------
function technicalDiagramSvg() {
  const width = 1200;
  const height = 760;

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#ffffff"/>
  ${DEFS}

  ${label(40, 40, 'RIMSS - Technical Diagram', { size: 22, weight: '700', color: ACCENT })}
  ${label(40, 64, 'Client / SPA / Backend topology', { size: 13, weight: '400', color: TEXT_MUTED })}

  <!-- Client Environment -->
  ${box(40, 100, 300, 220, { fill: BLUE_FILL, stroke: BLUE_BORDER, dashed: true })}
  ${label(60, 128, 'Client Environment', { size: 14 })}
  ${box(60, 145, 260, 50, {})}
  ${label(80, 175, 'Desktop Browser')}
  ${box(60, 205, 260, 50, {})}
  ${label(80, 235, 'Tablet Browser')}
  ${box(60, 265, 260, 45, {})}
  ${label(80, 293, 'Mobile Browser')}

  <!-- CDN -->
  ${box(400, 160, 160, 100, { fill: GREEN_FILL, stroke: GREEN_BORDER })}
  ${label(430, 205, 'CDN', { size: 15, weight: '700' })}
  ${label(415, 228, 'Static SPA bundle', { size: 11, weight: '400', color: TEXT_MUTED })}

  <!-- SPA App shell -->
  ${box(620, 100, 320, 350, { fill: AMBER_FILL, stroke: AMBER_BORDER })}
  ${label(640, 128, 'SPA (React + TypeScript)', { size: 14 })}
  ${box(640, 145, 280, 50, {})}
  ${label(660, 175, 'App Shell (Header, Router)')}
  ${box(640, 205, 280, 50, {})}
  ${label(660, 235, 'Plugin Registry')}
  ${box(640, 265, 130, 60, {})}
  ${label(660, 292, 'Product', { size: 12 })}
  ${label(660, 308, 'Search Module', { size: 12 })}
  ${box(790, 265, 130, 60, {})}
  ${label(810, 292, 'Product', { size: 12 })}
  ${label(810, 308, 'Showcase Module', { size: 12 })}
  ${box(640, 335, 280, 50, {})}
  ${label(660, 365, 'Cart / Business Logic')}
  ${box(640, 395, 280, 45, { fill: GREEN_FILL, stroke: GREEN_BORDER })}
  ${label(660, 423, 'Service Worker (offline cache + Push)', { size: 12 })}

  <!-- API Gateway / backend (out of scope) -->
  ${box(1000, 100, 160, 100, { fill: GREY_FILL, stroke: GREY_BORDER, dashed: true })}
  ${label(1015, 135, 'API Gateway', { size: 13 })}
  ${label(1015, 155, '(client-provided,', { size: 11, weight: '400', color: TEXT_MUTED })}
  ${label(1015, 172, 'out of scope)', { size: 11, weight: '400', color: TEXT_MUTED })}

  ${box(1000, 230, 160, 220, { fill: GREY_FILL, stroke: GREY_BORDER, dashed: true })}
  ${label(1015, 255, 'Backend Services', { size: 13 })}
  ${box(1015, 268, 130, 34, { fill: '#ffffff' })}
  ${label(1030, 290, 'Product Service', { size: 11 })}
  ${box(1015, 310, 130, 34, { fill: '#ffffff' })}
  ${label(1030, 332, 'Cart Service', { size: 11 })}
  ${box(1015, 352, 130, 34, { fill: '#ffffff' })}
  ${label(1030, 374, 'Payment Gateway', { size: 11 })}
  ${box(1015, 394, 130, 34, { fill: '#ffffff' })}
  ${label(1030, 416, 'Search Service', { size: 11 })}

  <!-- Mock server used for this working sample -->
  ${box(620, 480, 320, 110, { fill: GREEN_FILL, stroke: GREEN_BORDER, dashed: true })}
  ${label(640, 505, 'RIMSS API (this sample)', { size: 13 })}
  ${label(640, 525, 'Express + TypeScript, PostgreSQL (JSON fallback), Web Push,', { size: 11, weight: '400', color: TEXT_MUTED })}
  ${label(640, 542, 'idempotent POST /api/orders, POST /api/telemetry,', { size: 11, weight: '400', color: TEXT_MUTED })}
  ${label(640, 559, 'pino logs with masked credentials, Docker images', { size: 11, weight: '400', color: TEXT_MUTED })}
  ${label(640, 576, '(replaced by real APIs above in production)', { size: 11, weight: '400', color: TEXT_MUTED })}

  <!-- Arrows -->
  ${arrow(340, 210, 400, 210)}
  ${label(345, 200, 'HTTPS', { size: 10, weight: '400', color: TEXT_MUTED })}

  ${arrow(560, 210, 620, 210)}
  ${label(565, 200, 'serves bundle', { size: 10, weight: '400', color: TEXT_MUTED })}

  ${arrow(940, 200, 1000, 150)}
  ${label(935, 190, 'HTTPS/JSON', { size: 10, weight: '400', color: TEXT_MUTED })}

  ${arrow(1080, 200, 1080, 230)}

  ${arrow(780, 450, 780, 480, { dashed: true })}
  ${label(790, 470, 'dev/demo only', { size: 10, weight: '400', color: TEXT_MUTED })}

  <!-- Legend -->
  ${box(40, 640, 1120, 100, { fill: '#ffffff', stroke: GREY_BORDER })}
  ${label(60, 665, 'Legend', { size: 13, weight: '700' })}
  ${box(60, 680, 18, 18, { fill: BLUE_FILL, stroke: BLUE_BORDER })}
  ${label(86, 694, 'Client-side (browser)', { size: 11, weight: '400' })}
  ${box(300, 680, 18, 18, { fill: AMBER_FILL, stroke: AMBER_BORDER })}
  ${label(326, 694, 'SPA / frontend components (in scope)', { size: 11, weight: '400' })}
  ${box(680, 680, 18, 18, { fill: GREY_FILL, stroke: GREY_BORDER, dashed: true })}
  ${label(706, 694, 'External / backend (out of scope, assumed provided)', { size: 11, weight: '400' })}
  ${box(60, 706, 18, 18, { fill: GREEN_FILL, stroke: GREEN_BORDER })}
  ${label(86, 720, 'Build/deploy or mock infrastructure', { size: 11, weight: '400' })}
</svg>`;
}

// ---------------------------------------------------------------------------
// Diagram 2: Layered Solution Architecture
// ---------------------------------------------------------------------------
function architectureDiagramSvg() {
  const width = 1200;
  const height = 640;
  const layerX = 60;
  const layerW = 1080;
  const layerH = 70;
  const gap = 12;
  let y = 110;

  const layers = [
    {
      title: 'Presentation Layer',
      detail:
        'Home, Product Search (URL-synced filters), Product Showcase, Cart Drawer with checkout, Chatbot assistant, shared ui/ primitives (React + SCSS tokens)',
      fill: BLUE_FILL,
      border: BLUE_BORDER,
    },
    {
      title: 'Routing Layer',
      detail: 'React Router - maps URLs to registered plugin modules',
      fill: BLUE_FILL,
      border: BLUE_BORDER,
    },
    {
      title: 'Plugin / Module Layer',
      detail:
        'Plugin Registry - modules self-register (id, route, component); shell renders whatever is registered',
      fill: AMBER_FILL,
      border: AMBER_BORDER,
    },
    {
      title: 'State / Business Layer',
      detail:
        'Cart logic + localStorage persistence, product filtering & pricing - pure, framework-agnostic, unit-tested functions',
      fill: GREEN_FILL,
      border: GREEN_BORDER,
    },
    {
      title: 'Service / Integration Layer',
      detail:
        'productService (60s cache, in-flight de-dup) + orderService + pushService - fetch client with timeout/retry (httpClient)',
      fill: BLUE_FILL,
      border: BLUE_BORDER,
    },
    {
      title: 'Cross-Cutting Concerns',
      detail:
        'Config & feature flags, telemetry & analytics (local JSON store), masked logging, error boundaries, CSP/security headers, service worker - available to every layer',
      fill: GREY_FILL,
      border: GREY_BORDER,
    },
  ];

  let body = '';
  for (const l of layers) {
    body += box(layerX, y, layerW, layerH, { fill: l.fill, stroke: l.border });
    body += label(layerX + 24, y + 28, l.title, { size: 15, weight: '700' });
    body += label(layerX + 24, y + 50, l.detail, { size: 12, weight: '400', color: TEXT_MUTED });
    y += layerH + gap;
  }

  // Downward arrows between layers to show request flow
  let arrowY = 110 + layerH;
  for (let i = 0; i < layers.length - 1; i++) {
    body += arrow(layerX + layerW / 2, arrowY + 2, layerX + layerW / 2, arrowY + gap - 2);
    arrowY += layerH + gap;
  }

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#ffffff"/>
  ${DEFS}
  ${label(40, 40, 'RIMSS - Layered Solution Architecture', { size: 22, weight: '700', color: ACCENT })}
  ${label(40, 64, 'Request flows top (UI) to bottom (integration); business logic is UI-independent', { size: 13, weight: '400', color: TEXT_MUTED })}
  ${body}
</svg>`;
}

function circleTag(cx, cy, n, { fill = ACCENT, r = 12 } = {}) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" />
  ${label(cx, cy + 4, String(n), { size: 12, weight: '700', color: '#ffffff', anchor: 'middle' })}`;
}

// ---------------------------------------------------------------------------
// Diagram 3: Data Flow Diagram - Browse -> Add to Cart -> Checkout, numbered
// ---------------------------------------------------------------------------
function dataFlowDiagramSvg() {
  const width = 1200;
  const height = 560;

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#ffffff"/>
  ${DEFS}
  ${label(40, 40, 'RIMSS - Data Flow Diagram', { size: 22, weight: '700', color: ACCENT })}
  ${label(40, 64, 'Browse to checkout, arrows tagged in sequence order', { size: 13, weight: '400', color: TEXT_MUTED })}

  ${box(40, 110, 200, 80, { fill: BLUE_FILL, stroke: BLUE_BORDER })}
  ${label(65, 155, 'Web Browser', { size: 13 })}

  ${box(320, 110, 220, 80, { fill: AMBER_FILL, stroke: AMBER_BORDER })}
  ${label(345, 145, 'Product Search', { size: 13 })}
  ${label(345, 165, 'Module', { size: 13 })}

  ${box(620, 110, 220, 80, { fill: AMBER_FILL, stroke: AMBER_BORDER })}
  ${label(645, 145, 'Product Showcase', { size: 13 })}
  ${label(645, 165, 'Module', { size: 13 })}

  ${box(920, 110, 220, 80, { fill: GREY_FILL, stroke: GREY_BORDER, dashed: true })}
  ${label(945, 145, 'Product Service', { size: 13 })}
  ${label(945, 165, '(backend API)', { size: 11, weight: '400', color: TEXT_MUTED })}

  ${box(320, 260, 220, 80, { fill: GREEN_FILL, stroke: GREEN_BORDER })}
  ${label(345, 295, 'Cart Business Logic', { size: 13 })}
  ${label(345, 315, '(addToCart, totals)', { size: 11, weight: '400', color: TEXT_MUTED })}

  ${box(620, 260, 220, 80, { fill: BLUE_FILL, stroke: BLUE_BORDER })}
  ${label(645, 295, 'Cart Drawer UI', { size: 13 })}
  ${label(645, 315, '(review & totals)', { size: 11, weight: '400', color: TEXT_MUTED })}

  ${box(920, 260, 220, 80, { fill: GREY_FILL, stroke: GREY_BORDER, dashed: true })}
  ${label(945, 290, 'Orders API', { size: 13 })}
  ${label(945, 310, 'POST /orders, server-priced', { size: 11, weight: '400', color: TEXT_MUTED })}

  ${box(320, 410, 520, 80, { fill: GREEN_FILL, stroke: GREEN_BORDER })}
  ${label(345, 445, 'Order Confirmation', { size: 13 })}
  ${label(345, 465, 'order id + total shown in the cart drawer; cart cleared (payment gateway out of scope)', { size: 11, weight: '400', color: TEXT_MUTED })}

  <!-- flow -->
  ${arrow(240, 150, 320, 150)}
  ${circleTag(280, 138, 1)}

  ${arrow(540, 150, 620, 150)}
  ${circleTag(580, 138, 2)}

  ${arrow(840, 150, 920, 150)}
  ${circleTag(880, 138, 3)}

  ${arrow(730, 190, 730, 260)}
  ${circleTag(742, 225, 4)}

  ${arrow(430, 190, 430, 260)}
  ${circleTag(442, 225, 5)}

  ${arrow(540, 300, 620, 300)}
  ${circleTag(580, 288, 6)}

  ${arrow(840, 300, 920, 300)}
  ${circleTag(880, 288, 7)}

  ${arrow(730, 340, 730, 410, { dashed: true })}
  ${circleTag(742, 375, 8)}

  ${arrow(320, 450, 240, 190)}
  ${circleTag(300, 420, 9)}

  <!-- legend -->
  ${box(40, 510, 1120, 40, { fill: '#ffffff', stroke: GREY_BORDER })}
  ${label(60, 535, '1-3 search & fetch (cached)  ·  4-5 add to cart (persisted)  ·  6-7 place order  ·  8-9 confirmation returned to user', { size: 11, weight: '400', color: TEXT_MUTED })}
</svg>`;
}

// ---------------------------------------------------------------------------
// Diagram 4: System Model - functional/holistic view (infographic style)
// ---------------------------------------------------------------------------
function systemModelDiagramSvg() {
  const width = 1200;
  const height = 700;

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#ffffff"/>
  ${DEFS}
  ${label(40, 40, 'RIMSS - System Model (Functional View)', { size: 22, weight: '700', color: ACCENT })}
  ${label(40, 64, 'Holistic view of users, functional modules and integration points', { size: 13, weight: '400', color: TEXT_MUTED })}

  <!-- Users row -->
  ${box(60, 100, 260, 60, { fill: BLUE_FILL, stroke: BLUE_BORDER })}
  ${label(90, 135, 'Online Customers', { size: 13 })}
  ${box(470, 100, 260, 60, { fill: BLUE_FILL, stroke: BLUE_BORDER })}
  ${label(510, 135, 'Store Merchandisers', { size: 13 })}
  ${box(880, 100, 260, 60, { fill: BLUE_FILL, stroke: BLUE_BORDER })}
  ${label(930, 135, 'Store Administrators', { size: 13 })}

  <!-- Core system oval-ish container -->
  ${box(140, 210, 920, 260, { fill: AMBER_FILL, stroke: AMBER_BORDER, rx: 40 })}
  ${label(560, 240, 'RIMSS Core', { size: 16, weight: '700', anchor: 'middle' })}

  ${box(180, 265, 190, 70, {})}
  ${label(200, 295, 'Home &', { size: 12 })}
  ${label(200, 313, 'Featured Offers', { size: 12 })}

  ${box(390, 265, 190, 70, {})}
  ${label(410, 295, 'Product Search', { size: 12 })}
  ${label(410, 313, '& Filtering', { size: 12 })}

  ${box(600, 265, 190, 70, {})}
  ${label(620, 295, 'Product', { size: 12 })}
  ${label(620, 313, 'Showcase', { size: 12 })}

  ${box(810, 265, 190, 70, {})}
  ${label(830, 295, 'Shopping Cart', { size: 12 })}
  ${label(830, 313, '& Pricing', { size: 12 })}

  ${box(390, 355, 190, 70, {})}
  ${label(410, 385, 'Payment', { size: 12 })}
  ${label(410, 403, 'Gateway (UI)', { size: 12 })}

  ${box(600, 355, 190, 70, {})}
  ${label(620, 385, 'Plugin', { size: 12 })}
  ${label(620, 403, 'Registry', { size: 12 })}

  <!-- Integration points row -->
  ${box(60, 520, 260, 70, { fill: GREY_FILL, stroke: GREY_BORDER, dashed: true })}
  ${label(80, 550, 'Product Catalog API', { size: 12 })}
  ${label(80, 568, '(backend, out of scope)', { size: 10, weight: '400', color: TEXT_MUTED })}

  ${box(470, 520, 260, 70, { fill: GREY_FILL, stroke: GREY_BORDER, dashed: true })}
  ${label(490, 550, 'Payment Processor', { size: 12 })}
  ${label(490, 568, '(backend, out of scope)', { size: 10, weight: '400', color: TEXT_MUTED })}

  ${box(880, 520, 260, 70, { fill: GREY_FILL, stroke: GREY_BORDER, dashed: true })}
  ${label(900, 550, 'Order / Inventory API', { size: 12 })}
  ${label(900, 568, '(backend, out of scope)', { size: 10, weight: '400', color: TEXT_MUTED })}

  <!-- connective arrows -->
  ${arrow(190, 160, 275, 210)}
  ${arrow(600, 160, 600, 210)}
  ${arrow(1010, 160, 925, 210)}
  ${arrow(190, 470, 190, 520)}
  ${arrow(600, 470, 600, 520)}
  ${arrow(1010, 470, 1010, 520)}

  <!-- Key facts callouts -->
  ${box(140, 610, 920, 60, { fill: '#ffffff', stroke: GREY_BORDER })}
  ${label(165, 635, 'Cross-platform (desktop/tablet/mobile)  ·  Client-side filtering (< 100ms interactions)  ·  Pluggable module architecture', { size: 12, weight: '400', color: TEXT_MUTED })}
  ${label(165, 655, 'Frontend scope: FRONTEND-REACT assignment — backend/payment integration assumed provided by YCompany', { size: 12, weight: '400', color: TEXT_MUTED })}
</svg>`;
}

// ---------------------------------------------------------------------------
// Diagram 5: Application / Component Logical Architecture (plugin wiring)
// ---------------------------------------------------------------------------
function componentArchitectureDiagramSvg() {
  const width = 1200;
  const height = 720;

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#ffffff"/>
  ${DEFS}
  ${label(40, 40, 'RIMSS - Application / Component Logical Architecture', { size: 21, weight: '700', color: ACCENT })}
  ${label(40, 64, 'How App Shell, Plugin Registry and functional modules are wired together', { size: 13, weight: '400', color: TEXT_MUTED })}

  <!-- App Shell -->
  ${box(60, 100, 300, 100, { fill: BLUE_FILL, stroke: BLUE_BORDER })}
  ${label(80, 130, 'App Shell', { size: 15, weight: '700' })}
  ${label(80, 150, 'main.tsx / App.tsx', { size: 11, weight: '400', color: TEXT_MUTED })}
  ${label(80, 168, 'Header, layout, cart drawer host', { size: 11, weight: '400', color: TEXT_MUTED })}

  <!-- Plugin Registry -->
  ${box(440, 100, 300, 100, { fill: AMBER_FILL, stroke: AMBER_BORDER })}
  ${label(460, 130, 'Plugin Registry', { size: 15, weight: '700' })}
  ${label(460, 150, 'register() / getAll()', { size: 11, weight: '400', color: TEXT_MUTED })}
  ${label(460, 168, 'single source of truth for routes & nav', { size: 11, weight: '400', color: TEXT_MUTED })}

  <!-- React Router -->
  ${box(840, 100, 300, 100, { fill: BLUE_FILL, stroke: BLUE_BORDER })}
  ${label(860, 130, 'React Router', { size: 15, weight: '700' })}
  ${label(860, 150, 'renders <Route> per', { size: 11, weight: '400', color: TEXT_MUTED })}
  ${label(860, 168, 'registered plugin manifest', { size: 11, weight: '400', color: TEXT_MUTED })}

  <!-- Modules row -->
  ${box(60, 260, 340, 160, { fill: GREEN_FILL, stroke: GREEN_BORDER })}
  ${label(80, 288, 'Product Search Module', { size: 14, weight: '700' })}
  ${box(80, 300, 300, 40, { fill: '#ffffff' })}
  ${label(95, 325, 'ProductSearchModule.tsx (UI, URL-synced)', { size: 11 })}
  ${box(80, 345, 300, 40, { fill: '#ffffff' })}
  ${label(95, 370, 'filterProducts.ts + searchParams.ts', { size: 11 })}

  ${box(430, 260, 340, 160, { fill: GREEN_FILL, stroke: GREEN_BORDER })}
  ${label(450, 288, 'Product Showcase Module', { size: 14, weight: '700' })}
  ${box(450, 300, 300, 40, { fill: '#ffffff' })}
  ${label(465, 325, 'ProductShowcaseModule.tsx (UI)', { size: 11 })}
  ${box(450, 345, 300, 40, { fill: '#ffffff' })}
  ${label(465, 370, 'useAsyncResource + useCart()', { size: 11 })}

  ${box(800, 260, 340, 160, { fill: GREEN_FILL, stroke: GREEN_BORDER })}
  ${label(820, 288, 'Cart Module', { size: 14, weight: '700' })}
  ${box(820, 300, 300, 40, { fill: '#ffffff' })}
  ${label(835, 325, 'CartContext.tsx + cartStorage.ts', { size: 11 })}
  ${box(820, 345, 300, 40, { fill: '#ffffff' })}
  ${label(835, 370, 'cartLogic.ts (pure, unit-tested)', { size: 11 })}

  <!-- Service layer -->
  ${box(60, 470, 1080, 90, { fill: BLUE_FILL, stroke: BLUE_BORDER })}
  ${label(80, 500, 'Service Layer', { size: 14, weight: '700' })}
  ${label(80, 522, 'productService (cached) / orderService / pushService over httpClient - single integration point to backend APIs', { size: 12, weight: '400', color: TEXT_MUTED })}

  <!-- Backend -->
  ${box(60, 610, 1080, 70, { fill: GREY_FILL, stroke: GREY_BORDER, dashed: true })}
  ${label(80, 640, 'Backend REST APIs (assumed provided by YCompany, out of scope for this assignment)', { size: 13 })}

  <!-- arrows -->
  ${arrow(360, 150, 440, 150)}
  ${arrow(740, 150, 840, 150)}
  ${arrow(990, 200, 600, 260)}
  ${arrow(600, 200, 600, 260, { dashed: true })}
  ${arrow(230, 200, 230, 260, { dashed: true })}
  ${arrow(970, 200, 970, 260, { dashed: true })}

  ${arrow(230, 420, 230, 470)}
  ${arrow(600, 420, 600, 470)}
  ${arrow(970, 420, 970, 470)}
  ${arrow(600, 560, 600, 610)}

  <!-- legend -->
  ${box(60, 700, 1, 1, {})}
</svg>`;
}

// ---------------------------------------------------------------------------
// Diagram 6: Current vs Proposed - highlights fixes for the website issues
// ---------------------------------------------------------------------------
function comparisonDiagramSvg() {
  const width = 1200;
  const height = 620;

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#ffffff"/>
  ${DEFS}
  ${label(40, 40, 'RIMSS - Current vs Proposed System', { size: 22, weight: '700', color: ACCENT })}
  ${label(40, 64, 'Mapping each reported issue to the RIMSS solution', { size: 13, weight: '400', color: TEXT_MUTED })}

  <!-- Current system -->
  ${box(40, 100, 540, 480, { fill: GREY_FILL, stroke: GREY_BORDER, dashed: true })}
  ${label(60, 130, 'Current Website (as-is)', { size: 16, weight: '700', color: TEXT_MUTED })}

  ${box(70, 150, 480, 60, { fill: '#ffffff' })}
  ${label(90, 185, 'No cross-platform support', { size: 13 })}
  ${box(70, 220, 480, 60, { fill: '#ffffff' })}
  ${label(90, 255, 'Initial load time > 60 seconds', { size: 13 })}
  ${box(70, 290, 480, 60, { fill: '#ffffff' })}
  ${label(90, 325, 'UI not smooth, freezes at times', { size: 13 })}
  ${box(70, 360, 480, 60, { fill: '#ffffff' })}
  ${label(90, 395, 'Product search is slow', { size: 13 })}
  ${box(70, 430, 480, 60, { fill: '#ffffff' })}
  ${label(90, 465, 'Monolithic, hard to extend', { size: 13 })}
  ${box(70, 500, 480, 60, { fill: '#ffffff' })}
  ${label(90, 535, 'No automated testing', { size: 13 })}

  <!-- Proposed system -->
  ${box(620, 100, 540, 480, { fill: GREEN_FILL, stroke: GREEN_BORDER })}
  ${label(640, 130, 'RIMSS (proposed)', { size: 16, weight: '700' })}

  ${box(650, 150, 480, 60, { fill: '#ffffff' })}
  ${label(670, 175, 'Responsive layouts, tested on desktop/', { size: 12 })}
  ${label(670, 193, 'tablet/mobile viewports', { size: 12 })}

  ${box(650, 220, 480, 60, { fill: '#ffffff' })}
  ${label(670, 245, 'Vite production build, code-splitting,', { size: 12 })}
  ${label(670, 263, 'CDN + compression -> sub-second load', { size: 12 })}

  ${box(650, 290, 480, 60, { fill: '#ffffff' })}
  ${label(670, 315, 'Client-side filtering & optimistic cart', { size: 12 })}
  ${label(670, 333, 'updates keep interactions under 100ms', { size: 12 })}

  ${box(650, 360, 480, 60, { fill: '#ffffff' })}
  ${label(670, 385, 'In-memory catalog filtering -', { size: 12 })}
  ${label(670, 403, 'instant results, no server round trip', { size: 12 })}

  ${box(650, 430, 480, 60, { fill: '#ffffff' })}
  ${label(670, 455, 'Plugin-based architecture - new', { size: 12 })}
  ${label(670, 473, 'modules plug in without shell changes', { size: 12 })}

  ${box(650, 500, 480, 60, { fill: '#ffffff' })}
  ${label(670, 525, 'Vitest unit tests for all business logic', { size: 12 })}
  ${label(670, 543, '(cart, filtering) - CI-pipeline ready', { size: 12 })}

  <!-- connecting arrows -->
  ${arrow(550, 180, 650, 180)}
  ${arrow(550, 250, 650, 250)}
  ${arrow(550, 320, 650, 320)}
  ${arrow(550, 390, 650, 390)}
  ${arrow(550, 460, 650, 460)}
  ${arrow(550, 530, 650, 530)}
</svg>`;
}

// ---------------------------------------------------------------------------
// Diagram 7: Repository & application folder structure
// ---------------------------------------------------------------------------
function folderStructureDiagramSvg() {
  const width = 1200;
  const height = 700;

  const mono = (x, y, text, { color = TEXT_DARK, weight = '400' } = {}) =>
    `<text x="${x}" y="${y}" font-family="Consolas, 'Courier New', monospace" font-size="12" xml:space="preserve" font-weight="${weight}" fill="${color}">${escapeXml(text)}</text>`;

  const column = (x, y, w, title, fill, border, lines) => {
    let out = box(x, y, w, 30 + lines.length * 20 + 14, { fill, stroke: border });
    out += label(x + 14, y + 22, title, { size: 14, weight: '700' });
    lines.forEach(([text, note], i) => {
      const ly = y + 46 + i * 20;
      out += mono(x + 14, ly, text, { weight: text.endsWith('/') ? '700' : '400' });
      if (note)
        out += label(x + 14 + 8 * 29, ly, note, { size: 11, weight: '400', color: TEXT_MUTED });
    });
    return out;
  };

  const app = [
    ['rimss-app/', 'React 19 + Vite PWA'],
    ['  src/', ''],
    ['    main.tsx, App.tsx', 'shell, routes, plugin wiring'],
    ['    plugins/', 'PluginRegistry'],
    ['    modules/', 'pluggable features'],
    ['      productSearch/', 'filters, URL-synced params'],
    ['      productShowcase/', 'detail + add to cart'],
    ['      cart/', 'CartContext, CartDrawer, cartLogic'],
    ['    components/', 'shared UI'],
    ['      ui/', 'Button, Card, Field, Heading, Table'],
    ['      Header/, Footer/, Chatbot/, ProductCard/', ''],
    ['      Skeleton/, Loader/, ErrorFallback/', ''],
    ['      ModuleErrorBoundary/', ''],
    ['      NotificationToggle/, UpdatePrompt/,', ''],
    ['      ConsentBanner/', ''],
    ['    services/', 'httpClient, product/order/push,'],
    ['', 'requestCache, telemetry'],
    ['    hooks/', 'useAsyncResource, useDebouncedValue'],
    ['    utils/, types/, styles/', 'price, models, SCSS tokens'],
    ['  public/', 'push-sw.js, _headers'],
    ['  e2e/', 'Playwright specs'],
    ['  Dockerfile, nginx.conf', ''],
  ];

  const api = [
    ['rimss-api/', 'Express + TypeScript'],
    ['  src/', ''],
    ['    server.ts, app.ts', 'bootstrap, wiring'],
    ['    routes/', 'catalog, orders, push,'],
    ['', 'telemetry, health'],
    ['    orders.ts, products.ts', 'domain + repositories'],
    ['    push.ts, db.ts', 'subscriptions, Postgres'],
    ['    config.ts, logger.ts', ''],
    ['    middleware.ts, errors.ts', ''],
    ['  migrations/', '001_init, 002_order_idempotency'],
    ['  data/', 'seed + local JSON stores'],
    ['  test/', 'API, config, push, telemetry'],
    ['  Dockerfile', ''],
  ];

  const root = [
    ['packages/shared/', '@rimss/shared contracts'],
    ['docs/adr/', 'architecture decisions'],
    ['deliverables/', 'doc + diagram generators'],
    ['docker-compose.yml', 'postgres, api, web'],
    ['turbo.json, eslint.config.mjs', ''],
  ];

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#ffffff"/>
  ${DEFS}
  ${label(40, 40, 'RIMSS - Repository & Application Folder Structure', { size: 22, weight: '700', color: ACCENT })}
  ${label(40, 64, 'Turborepo monorepo: web app, API and shared contract package', { size: 13, weight: '400', color: TEXT_MUTED })}

  ${column(40, 90, 620, 'Frontend - rimss-app', BLUE_FILL, BLUE_BORDER, app)}
  ${column(690, 90, 470, 'Backend - rimss-api', AMBER_FILL, AMBER_BORDER, api)}
  ${column(690, 450, 470, 'Monorepo root', GREEN_FILL, GREEN_BORDER, root)}

  ${box(690, 600, 470, 70, { fill: '#ffffff', stroke: GREY_BORDER })}
  ${label(704, 624, 'Dependency direction', { size: 13, weight: '700' })}
  ${label(704, 646, 'rimss-app  ->  @rimss/shared  <-  rimss-api', { size: 12, weight: '400', color: TEXT_MUTED })}
</svg>`;
}

// ---------------------------------------------------------------------------
// API architecture: composition root, routers, interfaces, implementations
// ---------------------------------------------------------------------------
function apiArchitectureDiagramSvg() {
  const width = 1200;
  const height = 640;
  const routers = ['health', 'catalog', 'orders', 'push', 'telemetry'];
  const routerBoxes = routers
    .map(
      (r, i) =>
        `${box(60 + i * 215, 250, 195, 44, { fill: '#ffffff' })}${label(157 + i * 215, 278, r, { size: 13, anchor: 'middle' })}`,
    )
    .join('\n');
  const ifaces = [
    ['ProductRepository', 'Postgres | JSON file'],
    ['OrderStore', 'Postgres | in-memory'],
    ['PushService', 'Postgres | JSON subscriptions'],
  ];
  const ifaceBoxes = ifaces
    .map(
      ([n, impl], i) =>
        `${box(60 + i * 360, 400, 330, 90, { fill: GREEN_FILL, stroke: GREEN_BORDER })}${label(80 + i * 360, 430, n, { size: 14 })}${label(80 + i * 360, 456, impl, { size: 12, weight: '400', color: TEXT_MUTED })}`,
    )
    .join('\n');

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#ffffff"/>
  ${DEFS}
  ${label(40, 40, 'RIMSS - API Architecture', { size: 22, weight: '700', color: ACCENT })}
  ${label(40, 64, 'Composition root, feature routers and injected dependencies', { size: 13, weight: '400', color: TEXT_MUTED })}

  ${box(60, 90, 1080, 60, { fill: AMBER_FILL, stroke: AMBER_BORDER })}
  ${label(80, 115, 'server.ts', { size: 14 })}
  ${label(80, 136, 'Reads config; picks Postgres (DATABASE_URL) or JSON/in-memory implementations; runs migrations', { size: 12, weight: '400', color: TEXT_MUTED })}

  ${box(60, 170, 1080, 50, { fill: BLUE_FILL, stroke: BLUE_BORDER })}
  ${label(80, 200, 'app.ts - security headers, CORS, request id + pino logging, error envelope, /api mount', { size: 13 })}

  ${box(40, 230, 1120, 80, { fill: '#ffffff', stroke: GREY_BORDER, dashed: true })}
  ${label(60, 246, 'routes/', { size: 11, color: TEXT_MUTED })}
  ${routerBoxes}

  ${box(40, 330, 1120, 180, { fill: '#ffffff', stroke: GREY_BORDER, dashed: true })}
  ${label(60, 352, 'Interfaces and implementations', { size: 13 })}
  ${ifaceBoxes}

  ${arrow(600, 150, 600, 170)}
  ${arrow(600, 220, 600, 250)}
  ${arrow(600, 310, 600, 400)}

  ${box(40, 540, 1120, 80, { fill: GREY_FILL, stroke: GREY_BORDER })}
  ${label(60, 566, 'Cross-cutting', { size: 13, weight: '700' })}
  ${label(60, 590, 'middleware.ts requireAdmin (ADMIN_API_KEY) | errors.ts one error envelope | buildQuote server-side pricing | @rimss/shared zod schemas', { size: 12, weight: '400', color: TEXT_MUTED })}
</svg>`;
}

function sequenceSvg(title, subtitle, actors, steps, height) {
  const width = 1200;
  const gap = width / actors.length;
  const xs = actors.map((_, i) => Math.round(gap * i + gap / 2));
  const heads = actors
    .map(
      (a, i) =>
        `${box(xs[i] - 90, 90, 180, 40, { fill: BLUE_FILL, stroke: BLUE_BORDER })}${label(xs[i], 116, a, { size: 13, anchor: 'middle' })}<line x1="${xs[i]}" y1="130" x2="${xs[i]}" y2="${height - 30}" stroke="${GREY_BORDER}" stroke-width="1.5" stroke-dasharray="5,4"/>`,
    )
    .join('\n');
  const msgs = steps
    .map(([from, to, text, dashed], i) => {
      const y = 170 + i * 46;
      const x1 = xs[from];
      const x2 = xs[to];
      if (from === to) {
        return `${box(x1 + 10, y - 22, 300, 30, { fill: AMBER_FILL, stroke: AMBER_BORDER })}${label(x1 + 22, y - 2, text, { size: 12, weight: '400' })}`;
      }
      return `${arrow(x1, y, x2, y, { dashed })}${label((x1 + x2) / 2, y - 8, text, { size: 12, weight: '400', anchor: 'middle' })}`;
    })
    .join('\n');
  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#ffffff"/>
  ${DEFS}
  ${label(40, 40, title, { size: 22, weight: '700', color: ACCENT })}
  ${label(40, 64, subtitle, { size: 13, weight: '400', color: TEXT_MUTED })}
  ${heads}
  ${msgs}
</svg>`;
}

function checkoutSequenceDiagramSvg() {
  return sequenceSvg(
    'RIMSS - Checkout Sequence',
    'Server-side pricing and idempotent order creation',
    ['Shopper / Web app', 'API', 'Order store'],
    [
      [0, 1, 'POST /api/orders (items, Idempotency-Key)'],
      [1, 2, 'findByIdempotencyKey'],
      [2, 1, 'existing order or none', true],
      [1, 0, 'replay: 200 original order', true],
      [1, 1, 'new: buildQuote (server-side prices)'],
      [1, 2, 'create(order, key)'],
      [1, 0, '201 order', true],
      [0, 1, 'POST /api/telemetry (checkout_success | checkout_failed)'],
    ],
    600,
  );
}

function pushSequenceDiagramSvg() {
  return sequenceSvg(
    'RIMSS - Web Push Sequence',
    'Subscription and admin broadcast using VAPID',
    ['Web app', 'Service worker', 'API', 'Browser push service'],
    [
      [0, 2, 'GET /api/push/public-key'],
      [0, 1, 'pushManager.subscribe(VAPID key)'],
      [0, 2, 'POST /api/push/subscribe'],
      [2, 2, 'store subscription'],
      [2, 3, 'admin: POST /api/push/send -> encrypted push'],
      [3, 1, 'push event', true],
      [1, 0, 'show notification', true],
    ],
    520,
  );
}

module.exports = {
  apiArchitectureDiagramSvg,
  checkoutSequenceDiagramSvg,
  pushSequenceDiagramSvg,
  folderStructureDiagramSvg,
  technicalDiagramSvg,
  architectureDiagramSvg,
  dataFlowDiagramSvg,
  systemModelDiagramSvg,
  componentArchitectureDiagramSvg,
  comparisonDiagramSvg,
};
