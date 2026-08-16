import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import archiver from 'archiver';

const extRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(extRoot, 'dist');
const repoRoot = path.resolve(extRoot, '../..');
const releases = path.join(repoRoot, 'releases');
const manifest = JSON.parse(fs.readFileSync(path.join(dist, 'manifest.json'), 'utf8'));
const version = manifest.version || '0.0.0';
const outFile = path.join(releases, `PrivatePromptGuard-v${version}.zip`);

fs.mkdirSync(releases, { recursive: true });
await new Promise((resolve, reject) => {
  const output = fs.createWriteStream(outFile);
  const archive = archiver('zip', { zlib: { level: 9 } });
  output.on('close', resolve);
  archive.on('error', reject);
  archive.pipe(output);
  archive.directory(dist, false);
  archive.finalize();
});
console.log('[pack]', outFile);
