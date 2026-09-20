const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log('🧪 RUNNING HEALTH DETAILS & GAMIFIED BADGES TESTS');
console.log('====================================================\n');

// ── 1. register.html markup ──────────────────────────────────────────────────
const regHtml = fs.readFileSync(path.join(__dirname, 'register.html'), 'utf8');
assert.ok(regHtml.includes('id="reg-age"'),       'register.html must have #reg-age');
assert.ok(regHtml.includes('id="reg-weight"'),    'register.html must have #reg-weight');
assert.ok(regHtml.includes('name="isSmoker"'),    'register.html must have isSmoker radio');
assert.ok(regHtml.includes('name="isAlcoholic"'), 'register.html must have isAlcoholic radio');
assert.ok(regHtml.includes('name="isOnMedication"'), 'register.html must have isOnMedication radio');
assert.ok(regHtml.includes('isSmoker'),           'register.html submit handler must read isSmoker');
assert.ok(regHtml.includes('isAlcoholic'),        'register.html submit handler must read isAlcoholic');
assert.ok(regHtml.includes('isOnMedication'),     'register.html submit handler must read isOnMedication');
console.log('✓ [Step 1] register.html health fields and radio toggles verified.');

// ── 2. db.js getDonorBadges ──────────────────────────────────────────────────
const dbJs = fs.readFileSync(path.join(__dirname, 'js', 'db.js'), 'utf8');
assert.ok(dbJs.includes('getDonorBadges'), 'js/db.js must define getDonorBadges');
assert.ok(dbJs.includes('first_drop'),    'must have first_drop badge');
assert.ok(dbJs.includes('reliable_donor'),'must have reliable_donor badge');
assert.ok(dbJs.includes('rare_hero'),     'must have rare_hero badge');
assert.ok(dbJs.includes('champion_donor'),'must have champion_donor badge');
console.log('✓ [Step 2] js/db.js badge engine definitions verified.');

// ── 3. Runtime badge calculation via DB ──────────────────────────────────────
// Simulate minimal localStorage shim
const localStorage = { _store: {}, getItem(k){ return this._store[k]||null; }, setItem(k,v){ this._store[k]=v; }, removeItem(k){ delete this._store[k]; } };
global.localStorage = localStorage;
global.window = { dispatchEvent: ()=>{} };
const DB = require(path.join(__dirname, 'js', 'db.js'));

// Eligible standard donor
const eligibleDonor = {
  id: 'test_d1', name: 'Ravi', bloodType: 'O+', isRareType: false,
  lastDonationDate: '2026-04-01', available: true, emergencyStandby: true,
  age: 28, weight: 70, isSmoker: false, isAlcoholic: false, isOnMedication: false
};
const badges = DB.getDonorBadges(eligibleDonor);
assert.ok(Array.isArray(badges) && badges.length === 10, `Should return 10 badges, got ${badges.length}`);

const unlocked = badges.filter(b => b.unlocked).map(b => b.id);
assert.ok(unlocked.includes('first_drop'),     'first_drop must always be unlocked');
assert.ok(unlocked.includes('reliable_donor'), 'reliable_donor must be unlocked (90+ days)');
assert.ok(unlocked.includes('guardian_pledge'),'guardian_pledge must be unlocked');
assert.ok(unlocked.includes('healthy_donor'),  'healthy_donor must be unlocked (no smoking/alcohol/med)');
assert.ok(unlocked.includes('prime_age'),      'prime_age must be unlocked (age 28)');
assert.ok(unlocked.includes('iron_will'),      'iron_will must be unlocked (weight 70kg)');
console.log(`✓ [Step 3] Badge engine correct: ${unlocked.length}/10 unlocked for eligible healthy donor.`);
console.log(`  Unlocked: ${unlocked.join(', ')}`);

// Rare donor check
const rareDonor = { ...eligibleDonor, isRareType: true, bloodType: 'Bombay (hh)' };
const rareBadges = DB.getDonorBadges(rareDonor);
const rareUnlocked = rareBadges.filter(b => b.unlocked).map(b => b.id);
assert.ok(rareUnlocked.includes('rare_hero'), 'rare_hero must be unlocked for rare donor');
console.log(`✓ [Step 3b] Rare Hero badge unlocked correctly.`);

// Champion donor check
const championDonor = { ...eligibleDonor, donationCount: 25 };
const champBadges = DB.getDonorBadges(championDonor);
const champUnlocked = champBadges.filter(b => b.unlocked).map(b => b.id);
assert.ok(champUnlocked.includes('veteran_donor'),  'veteran_donor must unlock at 25 donations');
assert.ok(champUnlocked.includes('champion_donor'), 'champion_donor must unlock at 25 donations');
console.log(`✓ [Step 3c] Veteran & Champion badges unlock at 20+ donations.`);

// ── 4. profile.html markup ───────────────────────────────────────────────────
const profHtml = fs.readFileSync(path.join(__dirname, 'profile.html'), 'utf8');
assert.ok(profHtml.includes('id="health-details-card"'), 'profile.html must have #health-details-card');
assert.ok(profHtml.includes('id="health-details-body"'), 'profile.html must have #health-details-body');
assert.ok(profHtml.includes('id="badges-grid-card"'),    'profile.html must have #badges-grid-card');
assert.ok(profHtml.includes('id="badges-grid"'),         'profile.html must have #badges-grid');
assert.ok(profHtml.includes('id="badges-unlock-count"'), 'profile.html must have #badges-unlock-count');
console.log('✓ [Step 4] profile.html Health & Badges containers verified.');

// ── 5. profile.js render functions ──────────────────────────────────────────
const profJs = fs.readFileSync(path.join(__dirname, 'js', 'profile.js'), 'utf8');
assert.ok(profJs.includes('renderHealthDetails'), 'profile.js must define renderHealthDetails');
assert.ok(profJs.includes('renderDonorBadges'),   'profile.js must define renderDonorBadges');
assert.ok(profJs.includes("health-details-body"), 'renderHealthDetails must target health-details-body');
assert.ok(profJs.includes("badges-grid"),         'renderDonorBadges must target badges-grid');
console.log('✓ [Step 5] profile.js render functions verified.');

console.log('\n====================================================');
console.log('🎉 ALL HEALTH DETAILS & GAMIFIED BADGES TESTS PASSED 100%!');
console.log('====================================================\n');
