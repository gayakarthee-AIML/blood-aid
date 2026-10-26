import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { loadApp, readSample } from './load-app.mjs';

// Values created inside the sandbox have their own Array/Object prototypes,
// so compare plain JSON copies.
const plain = v => JSON.parse(JSON.stringify(v));
const ids = list => plain(list.map(d => d.id));

function matchesFor(group) {
  const app = loadApp();
  app.S.group = group;
  return { app, ...app.getMatches() };
}

describe('Configuration', () => {
  test('match weights add up to 100', () => {
    const { WEIGHTS } = loadApp();
    assert.equal(Object.values(WEIGHTS).reduce((a, b) => a + b, 0), 100);
  });

  test('all 8 blood groups have a compatibility rule', () => {
    const { COMPAT, GROUPS } = loadApp();
    assert.deepEqual(plain(Object.keys(COMPAT).sort()), plain([...GROUPS].sort()));
  });
});

describe('Blood compatibility', () => {
  test('every group can receive its own group', () => {
    const { COMPAT } = loadApp();
    for (const [g, donors] of Object.entries(COMPAT)) assert.ok(donors.includes(g), g);
  });

  test('O− is a universal red-cell donor', () => {
    const { COMPAT } = loadApp();
    for (const donors of Object.values(COMPAT)) assert.ok(donors.includes('O-'));
  });

  test('AB+ is a universal recipient', () => {
    const { COMPAT } = loadApp();
    assert.equal(COMPAT['AB+'].length, 8);
  });

  test('Rh-negative patients never receive Rh-positive blood', () => {
    const { COMPAT } = loadApp();
    for (const g of ['O-', 'A-', 'B-', 'AB-'])
      assert.ok(COMPAT[g].every(d => d.endsWith('-')), g);
  });

  test('O− patient only matches O− donors', () => {
    const { ready, later } = matchesFor('O-');
    assert.ok([...ready, ...later].every(d => d.group === 'O-'));
  });
});

describe('Distance score', () => {
  test('full score within 1 km', () => {
    const { distanceScore } = loadApp();
    assert.equal(distanceScore(0.3), 1);
    assert.equal(distanceScore(1), 1);
  });

  test('drops to zero at 10 km and never goes negative', () => {
    const { distanceScore } = loadApp();
    assert.equal(distanceScore(10), 0);
    assert.equal(distanceScore(25), 0);
  });

  test('closer is always better', () => {
    const { distanceScore } = loadApp();
    assert.ok(distanceScore(2) > distanceScore(5));
  });
});

describe('Match score (O+ request, sample data)', () => {
  test('Rahul (exact group, 1.2 km, verified) scores 99', () => {
    const { ready } = matchesFor('O+');
    assert.equal(ready.find(d => d.id === 'rahul').score, 99);
  });

  test('Priya (compatible O−, 2.8 km) scores 91', () => {
    const { ready } = matchesFor('O+');
    assert.equal(ready.find(d => d.id === 'priya').score, 91);
  });

  test('Vikram (unverified, 6.3 km) scores 67', () => {
    const { ready } = matchesFor('O+');
    assert.equal(ready.find(d => d.id === 'vikram').score, 67);
  });

  test('ready donors are sorted by score, highest first', () => {
    const { ready } = matchesFor('O+');
    assert.deepEqual(ids(ready), ['rahul', 'priya', 'vikram']);
  });

  test('score breakdown parts add up to the score', () => {
    const { ready } = matchesFor('O+');
    for (const d of ready) {
      const sum = d.parts.reduce((a, p) => a + p.pts, 0);
      assert.equal(Math.round(sum), d.score, d.id);
    }
  });

  test('scores stay between 0 and 100', () => {
    const { app } = matchesFor('AB+');
    for (const d of app.DONORS) {
      const { score } = app.scoreDonor(d);
      assert.ok(score >= 0 && score <= 100, d.id);
    }
  });
});

describe('Eligibility and availability', () => {
  test('donor in cooldown is not offered as ready', () => {
    const { ready, later } = matchesFor('O+');
    assert.ok(!ids(ready).includes('kavya'));
    assert.ok(ids(later).includes('kavya'));
  });

  test('donor not taking requests is not offered as ready', () => {
    const { ready, later } = matchesFor('O+');
    assert.ok(!ids(ready).includes('sanjay'));
    assert.ok(ids(later).includes('sanjay'));
  });

  test('incompatible donors are left out entirely', () => {
    const { ready, later } = matchesFor('O+');
    const all = [...ids(ready), ...ids(later)];
    for (const id of ['imran', 'divya', 'meera']) assert.ok(!all.includes(id), id);
  });

  test('user next eligible date is 84 days after last donation (4 Nov 2026)', () => {
    const { USER, nextEligible } = loadApp();
    const next = nextEligible(USER.lastDonation);
    assert.equal(next.getFullYear(), 2026);
    assert.equal(next.getMonth(), 10);   // November
    assert.equal(next.getDate(), 4);
  });

  test('user has 9 days of cooldown left on the demo date', () => {
    const { USER, TODAY, nextEligible, daysBetween } = loadApp();
    assert.equal(daysBetween(TODAY, nextEligible(USER.lastDonation)), 9);
  });
});

describe('Other request scenarios', () => {
  test('AB− request finds Priya and Vikram (both O−)', () => {
    const { ready } = matchesFor('AB-');
    assert.deepEqual(ids(ready), ['priya', 'vikram']);
  });

  test('B+ request ranks exact-match Imran alongside O donors', () => {
    const { ready } = matchesFor('B+');
    assert.deepEqual(ids(ready).sort(), ['imran', 'priya', 'rahul', 'vikram']);
  });

  test('AB+ request includes every available, eligible donor', () => {
    const { app, ready } = matchesFor('AB+');
    const expected = app.DONORS.filter(d => d.available && app.isEligible(d)).length;
    assert.equal(ready.length, expected);
  });
});

describe('Sample data files', () => {
  test('sample-data/donors.json matches the data in the app', () => {
    const { DONORS } = loadApp();
    const fromApp = plain(DONORS).map(d => ({ ...d, cooldownUntil: d.cooldownUntil ? d.cooldownUntil.slice(0, 10) : undefined }));
    const fromFile = readSample('donors.json');
    assert.deepEqual(fromFile.map(d => d.id), fromApp.map(d => d.id));
    fromFile.forEach((d, i) => {
      assert.equal(d.group, fromApp[i].group);
      assert.equal(d.km, fromApp[i].km);
      assert.equal(d.reliability, fromApp[i].reliability);
    });
  });

  test('sample-data/blood-banks.json matches the data in the app', () => {
    const { BANKS } = loadApp();
    assert.deepEqual(readSample('blood-banks.json'), plain(BANKS));
  });

  test('every blood bank lists stock for all 8 groups', () => {
    const { GROUPS } = loadApp();
    for (const b of readSample('blood-banks.json'))
      for (const g of GROUPS) assert.ok(['high', 'low', 'out'].includes(b.stock[g]), `${b.id} ${g}`);
  });
});
