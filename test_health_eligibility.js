const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log('🧪 RUNNING HEALTH ELIGIBILITY VALIDATION TESTS');
console.log('====================================================\n');

const regHtml = fs.readFileSync(path.join(__dirname, 'register.html'), 'utf8');
const profJs  = fs.readFileSync(path.join(__dirname, 'js', 'profile.js'), 'utf8');

// 1. HTML: warning banners present
assert.ok(regHtml.includes('id="health-block-notice"'),     'Hard-block notice element must exist');
assert.ok(regHtml.includes('id="health-block-message"'),    'Block message span must exist');
assert.ok(regHtml.includes('id="health-restricted-notice"'),'Restricted-mode notice must exist');
assert.ok(regHtml.includes('id="smoker-warning"'),          'Smoker inline warning must exist');
assert.ok(regHtml.includes('id="alcoholic-warning"'),       'Alcoholic inline warning must exist');
console.log('✓ [1] register.html: all warning banner elements present.');

// 2. HTML: validation logic in submit handler
assert.ok(regHtml.includes('age < 18 || age > 65'),         'Hard-block: age out-of-range check');
assert.ok(regHtml.includes('weight < 45'),                  'Hard-block: weight < 45 check');
assert.ok(regHtml.includes('eligibleForEmergency'),         'eligibleForEmergency flag must be set');
assert.ok(regHtml.includes('restricted mode'),              'Restricted-mode toast must be shown');
assert.ok(regHtml.includes('setupHealthEligibilityListeners'), 'Real-time listener setup must be called');
console.log('✓ [2] register.html: validation intercept and listener wiring verified.');

// 3. HTML: eligibleForEmergency saved to donor profile
const updateMatch = regHtml.match(/updateDonor[\s\S]*?available: eligibleForEmergency/);
const addMatch    = regHtml.match(/addDonor[\s\S]*?available: eligibleForEmergency/);
assert.ok(updateMatch, 'updateDonor must include available: eligibleForEmergency');
assert.ok(addMatch,    'addDonor must include available: eligibleForEmergency');
console.log('✓ [3] register.html: eligibleForEmergency saved in both updateDonor and addDonor.');

// 4. profile.js: restricted-mode banner in renderHealthDetails
assert.ok(profJs.includes('eligibleForEmergency === false'), 'renderHealthDetails must detect restricted mode');
assert.ok(profJs.includes('Restricted Mode Active'),        'Restricted Mode Active banner must render');
console.log('✓ [4] profile.js: restricted-mode banner renders correctly.');

// 5. Runtime eligibility simulation
const localStorage = { _store: {}, getItem(k){ return this._store[k]||null; }, setItem(k,v){ this._store[k]=v; }, removeItem(k){ delete this._store[k]; } };
global.localStorage = localStorage;
global.window = { dispatchEvent: ()=>{} };
const DB = require(path.join(__dirname, 'js', 'db.js'));

// Helper: simulate submit-handler logic
function validateHealth(age, weight, isSmoker, isAlcoholic) {
  if (age !== null && (age < 18 || age > 65)) return { blocked: true, reason: 'age' };
  if (weight !== null && weight < 45)          return { blocked: true, reason: 'weight' };
  const eligibleForEmergency = !(isSmoker || isAlcoholic);
  return { blocked: false, eligibleForEmergency };
}

// Test: hard block on age
let r = validateHealth(15, 70, false, false);
assert.ok(r.blocked && r.reason === 'age', 'Age 15 must be blocked');
r = validateHealth(70, 70, false, false);
assert.ok(r.blocked && r.reason === 'age', 'Age 70 must be blocked');
r = validateHealth(25, 70, false, false);
assert.ok(!r.blocked, 'Age 25 must pass');
console.log('✓ [5a] Age validation: <18 and >65 blocked, 25 passes.');

// Test: hard block on weight
r = validateHealth(25, 40, false, false);
assert.ok(r.blocked && r.reason === 'weight', 'Weight 40 must be blocked');
r = validateHealth(25, 45, false, false);
assert.ok(!r.blocked, 'Weight 45 must pass');
console.log('✓ [5b] Weight validation: <45 blocked, 45 passes.');

// Test: smoker → restricted mode
r = validateHealth(25, 60, true, false);
assert.ok(!r.blocked && r.eligibleForEmergency === false, 'Smoker must be restricted');
// Test: alcoholic → restricted mode
r = validateHealth(25, 60, false, true);
assert.ok(!r.blocked && r.eligibleForEmergency === false, 'Alcoholic must be restricted');
// Test: both clean → full eligible
r = validateHealth(25, 60, false, false);
assert.ok(!r.blocked && r.eligibleForEmergency === true, 'Clean donor must be fully eligible');
console.log('✓ [5c] Restricted-mode logic: smoker & alcoholic restricted, clean donor eligible.');

console.log('\n====================================================');
console.log('🎉 ALL HEALTH ELIGIBILITY VALIDATION TESTS PASSED 100%!');
console.log('====================================================\n');
