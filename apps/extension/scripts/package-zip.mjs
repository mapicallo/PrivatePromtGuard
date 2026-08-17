import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import archiver from 'archiver';

const extRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(extRoot, 'dist');
const repoRoot = path.resolve(extRoot, '../..');
const releases = path.join(repoRoot, 'releases');
const manifestPath = path.join(dist, 'manifest.json');

if (!fs.existsSync(manifestPath)) {
  console.error('Missing dist/. Run npm run build first.');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const version = manifest.version || '0.0.0';
const fileName = `PrivatePromptGuard-v${version}.zip`;
const outFile = path.join(releases, fileName);
const copyFile = path.join(extRoot, fileName);

fs.mkdirSync(releases, { recursive: true });
await new Promise((resolve, reject) => {
  const output = fs.createWriteStream(outFile);
  const archive = archiver('zip', { zlib: { level: 9 } });
  output.on('close', resolve);
  archive.on('error', reject);
  archive.pipe(output);
  archive.glob('**/*', {
    cwd: dist,
    ignore: ['**/*.map'],
    dot: false,
  });
  archive.finalize();
});
fs.copyFileSync(outFile, copyFile);
const sizeMb = (fs.statSync(outFile).size / (1024 * 1024)).toFixed(2);
console.log(`[pack] Chrome Web Store zip (${sizeMb} MiB)`);
console.log(`[pack] ${outFile}`);
console.log(`[pack] ${copyFile}`);
