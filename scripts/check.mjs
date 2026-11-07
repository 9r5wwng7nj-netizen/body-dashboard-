#!/usr/bin/env node
// Static safety check for Body Dashboard's index.html — no browser needed.
//  1. Every inline <script> parses (catches syntax errors and duplicate let/const names).
//  2. No top-level function is declared twice (the later one silently wins).
//  3. No action name is defined in two action tables (A_*) unless it is a known, intentional override.
//  4. Runtime dependency scripts and styles are local, not executable CDN assets.
// Usage: node scripts/check.mjs [path/to/index.html]
import { readFileSync } from 'node:fs';

const file = process.argv[2] || new URL('../index.html', import.meta.url);
const html = readFileSync(file, 'utf8');
let failed = false;
const fail = msg => { failed = true; console.error(`✗ ${msg}`); };
const ok = msg => console.log(`✓ ${msg}`);

// 1. Syntax
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
scripts.forEach((src, i) => { try { new Function(src); } catch (e) { fail(`inline script #${i + 1}: ${e.message}`); } });
if (!failed) ok(`${scripts.length} inline scripts parse`);

// 2. Duplicate top-level function declarations
const fnCount = {};
for (const m of html.matchAll(/^(?:async )?function ([A-Za-z0-9_$]+)\s*\(/gm)) fnCount[m[1]] = (fnCount[m[1]] || 0) + 1;
const dupFns = Object.entries(fnCount).filter(([, n]) => n > 1).map(([k]) => k);
if (dupFns.length) fail(`functions declared more than once: ${dupFns.join(', ')}`); else ok(`${Object.keys(fnCount).length} top-level functions, no duplicates`);

// 3. Action-name collisions across action tables. Tables are merged with
//    Object.assign(A, A_FIT, A_NUT, …) so a later table overrides an earlier one.
const INTENTIONAL = new Set([]); // none: A_MEALS, A_RECIPES and A_MPW name different actions
const lines = html.split('\n'), owner = {}; let cur = null;
lines.forEach((l, i) => {
  const m = l.match(/^const (A_[A-Z_]+|A) = \{/); if (m) { cur = m[1]; return; }
  if (cur && l.startsWith('};')) { cur = null; return; }
  if (!cur) return;
  const k = l.match(/^ {2}(?:async )?([A-Za-z_$][\w$]*)\s*[:(]/); if (!k) return;
  (owner[k[1]] = owner[k[1]] || []).push(`${cur}:${i + 1}`);
});
const clashes = Object.entries(owner).filter(([k, v]) => new Set(v.map(x => x.split(':')[0])).size > 1);
const bad = clashes.filter(([k]) => !INTENTIONAL.has(k));
bad.forEach(([k, v]) => fail(`action "${k}" is defined in more than one table: ${v.join(', ')}`));
// Every action name the markup uses has a handler, so no button points at removed code.
const used = new Set([...html.matchAll(/data-(?:action|change|input|submit)="([A-Za-z_$][\w$]*)"/g)].map(m => m[1]));
for (const m of html.matchAll(/`, '([a-z][A-Za-z]+)'\)/g)) used.add(m[1]); // modalShell(title, body, footer, 'submitAction')
const handled = new Set(Object.keys(owner));
{ let inTable = false; // every key whose value is a function, anywhere in an action table, plus shorthand entries
  for (const l of lines) {
    if (/^const (A_[A-Z_]+|A) = \{/.test(l)) { inTable = true; continue; }
    if (inTable && l.startsWith('};')) { inTable = false; continue; }
    if (!inTable) continue;
    for (const m of l.matchAll(/(?:^|[,{]\s*)\s*([A-Za-z_$][\w$]*)\s*:\s*(?:async\s*)?(?:\(|[A-Za-z_$][\w$]*\s*=>)/g)) handled.add(m[1]);
    for (const m of l.matchAll(/(?:^\s{2}|,\s*)([A-Za-z_$][\w$]*)\s*(?=,|$)/g)) handled.add(m[1]); // shorthand: openSettings, exportAll,
  } }
const missing = [...used].filter(n => !handled.has(n)).sort();
if (missing.length) fail(`actions used but not defined: ${missing.join(', ')}`); else ok(`${used.size} action names in use, all defined`);
if (!bad.length) ok(`${Object.keys(owner).length} actions, ${clashes.length} intentional overrides, no accidental collisions`);

// 4. Remote web services are allowed, but executable dependencies must be vendored.
const remoteScripts = [...html.matchAll(/<script\b[^>]*\bsrc=["']https?:\/\/[^"']+/gi)].map(m => m[0]);
const remoteStyles = [...html.matchAll(/<link\b[^>]*\brel=["']stylesheet["'][^>]*\bhref=["']https?:\/\/[^"']+/gi)].map(m => m[0]);
const remoteLoaders = [...html.matchAll(/loadScript\(\s*["'`]https?:\/\/[^"'`]+/gi)].map(m => m[0]);
const remoteExec = [...remoteScripts, ...remoteStyles, ...remoteLoaders];
if (remoteExec.length) fail(`remote executable dependencies found: ${remoteExec.join(', ')}`); else ok('runtime dependency scripts and styles are local');

process.exit(failed ? 1 : 0);
