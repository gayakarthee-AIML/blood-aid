// Loads the app script from index.html into a sandbox so the match engine
// can be tested in Node without a browser. The DOM is stubbed out.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

export function loadApp() {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const exportApi = `;globalThis.__api = { S, WEIGHTS, COMPAT, GROUPS, DONORS, BANKS, HOSPITALS, USER, TODAY,
    COOLDOWN_DAYS, distanceScore, scoreDonor, getMatches, isEligible, nextEligible, daysBetween };`;

  const fakeEl = { innerHTML: '', textContent: '', hidden: false, disabled: false,
                   classList: { add() {}, remove() {}, toggle() {} } };
  const ctx = {
    document: { querySelector: () => fakeEl, querySelectorAll: () => [] },
    setTimeout, clearTimeout, setInterval, clearInterval,
  };
  vm.createContext(ctx);
  vm.runInContext(script + exportApi, ctx);
  return ctx.__api;
}

export function readSample(name) {
  return JSON.parse(fs.readFileSync(path.join(root, 'sample-data', name), 'utf8'));
}
