// Package only public runtime files. Personal data and local preview tooling are never copied.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve('.');
const destination = process.argv[2];
const sourceCommit = process.argv[3];
if (!destination || !/^[a-f0-9]{40}$/.test(sourceCommit || '')) throw new Error('Usage: node scripts/package-beta.mjs EMPTY_OUTPUT_DIRECTORY SOURCE_COMMIT');
const output = path.resolve(destination);
if (output === root || root.startsWith(output + path.sep)) throw new Error('Choose a separate output directory.');
await fs.mkdir(output, { recursive: true });
if ((await fs.readdir(output)).length) throw new Error('The output directory must be empty; no existing files will be removed.');
const names = ['index.html', 'sw.js', 'manifest.webmanifest', '.nojekyll', 'THIRD_PARTY_NOTICES.md'];
const walk = async directory => {
  for (const entry of await fs.readdir(path.join(root, directory), { withFileTypes: true })) {
    const name = path.posix.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error('Symlinks cannot enter the deployment: ' + name);
    if (entry.isDirectory()) await walk(name); else if (entry.isFile()) names.push(name);
  }
};
await walk('assets'); await walk('vendor');
const assets = {};
for (const name of names.sort()) {
  if (/backup|\.pem$|\.key$|\.cer$|\.env|credentials/i.test(name) || (name.endsWith('.json') && name !== 'manifest.webmanifest')) throw new Error('Unexpected deployment filename: ' + name);
  const target = path.join(output, name); let content = await fs.readFile(path.join(root, name));
  if (name === 'sw.js') {
    const source = content.toString();
    if (!/^const GENERATION = '[^']+';/m.test(source)) throw new Error('Missing worker generation marker.');
    content = Buffer.from(source.replace(/^const GENERATION = '[^']+';/m, `const GENERATION = 'beta-${sourceCommit.slice(0, 12)}';`));
  }
  await fs.mkdir(path.dirname(target), { recursive: true }); await fs.writeFile(target, content);
  assets[name] = crypto.createHash('sha256').update(content).digest('hex');
}
await fs.writeFile(path.join(output, 'release.json'), JSON.stringify({ channel: 'personal-beta', sourceCommit, builtAt: new Date().toISOString(), assets }, null, 2) + '\n');
console.log(JSON.stringify({ output, channel: 'personal-beta', sourceCommit, publicFiles: names.length + 1, indexSHA256: assets['index.html'] }));
