import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

// Gzipped JavaScript budgets in kB; raise deliberately when a dependency is worth it.
const TOTAL_BUDGET_KB = 150;
const CHUNK_BUDGET_KB = 100;

const dir = join(import.meta.dirname, '..', 'dist', 'assets');
const chunks = readdirSync(dir)
  .filter((f) => f.endsWith('.js'))
  .map((f) => ({ file: f, kb: gzipSync(readFileSync(join(dir, f))).length / 1024 }));

const total = chunks.reduce((sum, c) => sum + c.kb, 0);
const failures = chunks
  .filter((c) => c.kb > CHUNK_BUDGET_KB)
  .map((c) => `${c.file} is ${c.kb.toFixed(1)} kB (chunk budget ${CHUNK_BUDGET_KB} kB)`);
if (total > TOTAL_BUDGET_KB) {
  failures.push(`Total JS is ${total.toFixed(1)} kB (budget ${TOTAL_BUDGET_KB} kB)`);
}

console.log(`Total gzipped JS: ${total.toFixed(1)} kB across ${chunks.length} chunks`);
if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}
