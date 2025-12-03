const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const docmapPath = path.join(repoRoot, 'docs', 'docmap.json');

function loadDocmap() {
  if (!fs.existsSync(docmapPath)) {
    console.error('docmap.json not found at', docmapPath);
    process.exit(2);
  }
  return JSON.parse(fs.readFileSync(docmapPath, 'utf8'));
}

function checkPaths(docmap) {
  let ok = true;
  const results = [];
  for (const entry of docmap) {
    const entryPath = path.join(repoRoot, entry.path);
    const exists = fs.existsSync(entryPath);
    results.push({ id: entry.id, path: entry.path, exists });
    if (!exists) ok = false;
  }
  return { ok, results };
}

function main() {
  const docmap = loadDocmap();
  const { ok, results } = checkPaths(docmap);
  console.log('\nDocmap validation report:');
  for (const r of results) {
    console.log(`- ${r.id}: ${r.path} -> ${r.exists ? 'OK' : 'MISSING'}`);
  }
  if (!ok) {
    console.error('\nOne or more docmap entries are missing. See report above.');
    process.exit(1);
  }
  console.log('\nAll docmap entries exist.');
  process.exit(0);
}

main();
