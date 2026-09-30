const {
  Paragraph,
  HeadingLevel,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  AlignmentType,
  PageBreak,
  TableOfContents,
  Header,
  Footer,
  ImageRun,
  PageNumber,
} = require('docx');
const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const ACCENT = 'C65B3C';
const GREY = '6B7280';

function h1(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 200, after: 150 },
  });
}
function h2(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 160, after: 100 },
  });
}
function h3(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 120, after: 80 },
  });
}
function p(text, opts = {}) {
  return new Paragraph({ children: [new TextRun({ text, ...opts })], spacing: { after: 120 } });
}
function bullet(text, level = 0) {
  return new Paragraph({ text, bullet: { level }, spacing: { after: 60 } });
}
function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
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
      row(headers.map((t, i) => cell(t, { header: true, width: widths?.[i] }))),
      ...rows.map((r) => row(r.map((t, i) => cell(String(t), { width: widths?.[i] })))),
    ],
  });
}

/** Mirrors the "General Document" template cover: Project Name / Document Name / org branding. */
function coverPage(projectName, documentName) {
  return [
    new Paragraph({ spacing: { after: 2000 } }),
    new Paragraph({
      children: [new TextRun({ text: projectName, bold: true, size: 56, color: ACCENT })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [new TextRun({ text: documentName, size: 32, color: GREY })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 2400 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Nagarro Software Pvt. Ltd.', size: 22 })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Microsoft Architecture Group', size: 22, color: GREY })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    pageBreak(),
  ];
}

/** Mirrors the DAR template cover, including its company and author credits. */
function darCoverPage(projectName, authorName) {
  return [
    new Paragraph({ spacing: { after: 1800 } }),
    new Paragraph({
      children: [new TextRun({ text: projectName, bold: true, size: 48, color: ACCENT })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'DAR Document', size: 32, color: GREY })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 2200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Nagarro Software Pvt. Ltd.', size: 22 })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [new TextRun({ text: authorName, size: 22, color: GREY })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    pageBreak(),
  ];
}

/** Reuses the exact embedded logo and running page furniture from a reference DOCX. */
async function referencePageFurniture(templateName, runningHeader) {
  const templatePath = path.join(__dirname, '..', '..', 'Req_Doc', templateName);
  const template = await JSZip.loadAsync(fs.readFileSync(templatePath));
  const logoEntry = template.file('word/media/image1.png');
  if (!logoEntry) {
    throw new Error(
      `The reference template does not contain word/media/image1.png: ${templatePath}`,
    );
  }
  const logo = await logoEntry.async('nodebuffer');

  return {
    properties: { titlePage: true },
    headers: {
      default: new Header({
        children: [
          new Paragraph({
            children: [new TextRun({ text: runningHeader, size: 18, color: GREY })],
            alignment: AlignmentType.RIGHT,
          }),
        ],
      }),
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            children: [
              new ImageRun({
                data: logo,
                type: 'png',
                transformation: { width: 129, height: 106 },
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ children: ['Page ', PageNumber.CURRENT] })],
          }),
        ],
      }),
    },
  };
}

/** Mirrors the template's "Revision History" table (Version / Date / Author/Contributor / Comments). */
function revisionHistory(rows) {
  return [
    h1('Revision History'),
    table(['Version', 'Date', 'Author/Contributor', 'Comments'], rows, [12, 20, 33, 35]),
    pageBreak(),
  ];
}

function contentsPage() {
  return [
    h1('Contents'),
    new TableOfContents('Contents', { hyperlink: true, headingStyleRange: '1-3' }),
    pageBreak(),
  ];
}

module.exports = {
  h1,
  h2,
  p,
  bullet,
  pageBreak,
  table,
  coverPage,
  darCoverPage,
  referencePageFurniture,
  revisionHistory,
  contentsPage,
};
