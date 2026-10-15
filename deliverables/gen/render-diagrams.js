const sharp = require('sharp');
const fs = require('node:fs');
const path = require('node:path');
const {
  technicalDiagramSvg,
  architectureDiagramSvg,
  dataFlowDiagramSvg,
  systemModelDiagramSvg,
  componentArchitectureDiagramSvg,
  comparisonDiagramSvg,
  folderStructureDiagramSvg,
  apiArchitectureDiagramSvg,
  checkoutSequenceDiagramSvg,
  pushSequenceDiagramSvg,
} = require('./diagrams');

const OUT_DIR = path.join(__dirname, 'assets');
fs.mkdirSync(OUT_DIR, { recursive: true });

const diagrams = {
  'technical-diagram.png': technicalDiagramSvg,
  'architecture-diagram.png': architectureDiagramSvg,
  'data-flow-diagram.png': dataFlowDiagramSvg,
  'system-model-diagram.png': systemModelDiagramSvg,
  'component-architecture-diagram.png': componentArchitectureDiagramSvg,
  'comparison-diagram.png': comparisonDiagramSvg,
  'folder-structure-diagram.png': folderStructureDiagramSvg,
  'api-architecture-diagram.png': apiArchitectureDiagramSvg,
  'checkout-sequence-diagram.png': checkoutSequenceDiagramSvg,
  'push-sequence-diagram.png': pushSequenceDiagramSvg,
};

async function main() {
  await Promise.all(
    Object.entries(diagrams).map(([file, svgFn]) =>
      sharp(Buffer.from(svgFn())).png().toFile(path.join(OUT_DIR, file)),
    ),
  );
  console.log('Diagrams rendered to', OUT_DIR);
}

void main();
