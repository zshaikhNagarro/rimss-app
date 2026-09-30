const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const {
  technicalDiagramSvg,
  architectureDiagramSvg,
  dataFlowDiagramSvg,
  systemModelDiagramSvg,
  componentArchitectureDiagramSvg,
  comparisonDiagramSvg,
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
};

async function main() {
  for (const [file, svgFn] of Object.entries(diagrams)) {
    await sharp(Buffer.from(svgFn())).png().toFile(path.join(OUT_DIR, file));
  }
  console.log('Diagrams rendered to', OUT_DIR);
}

main();
