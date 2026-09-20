const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log('🧪 RUNNING PRODUCTION DEPLOYMENT & AUTO-SEEDING TESTS');
console.log('====================================================\n');

// 1. Check for insecure http:// in js files
const jsFiles = ['app.js', 'db.js', 'find.js', 'localization.js', 'profile.js'];
jsFiles.forEach(file => {
  const content = fs.readFileSync(path.join(__dirname, 'js', file), 'utf8');
  const httpMatches = content.match(/http:\/\/[^\s'"`]+/g);
  if (httpMatches) {
    // Filter out namespace schemas like w3.org if any
    const insecureApis = httpMatches.filter(url => !url.includes('www.w3.org'));
    assert.strictEqual(insecureApis.length, 0, `Insecure http:// found in js/${file}: ${insecureApis.join(', ')}`);
  }
  console.log(`  ✓ js/${file} clean (no insecure http:// API calls)`);
});
console.log('✓ [Step 1] All JavaScript files enforce secure HTTPS protocol.');

// 2. Test autoSeedLocalStorage and resetSeedData in mock environment
const mockStorage = {
  _store: {},
  getItem(k) { return this._store[k] || null; },
  setItem(k, v) { this._store[k] = v; },
  removeItem(k) { delete this._store[k]; },
  clear() { this._store = {}; }
};

global.localStorage = mockStorage;
global.window = {
  dispatchEvent: () => {},
  addEventListener: () => {}
};

const DB = require(path.join(__dirname, 'js', 'db.js'));

// Verify empty state auto-seeding
mockStorage.clear();
assert.strictEqual(mockStorage.getItem('rednova_donors'), null, 'Storage should be empty initially');

const seeded = DB.autoSeedLocalStorage();
assert.ok(seeded, 'autoSeedLocalStorage should return true when seeding empty database');

const rawDonors = JSON.parse(mockStorage.getItem('rednova_donors'));
assert.ok(Array.isArray(rawDonors) && rawDonors.length >= 8, 'Seeded donors count should be at least 8');

const porselvi = rawDonors.find(d => d.name.includes('Porselvi'));
assert.ok(porselvi, 'Porselvi S standard donor must be present in seeded donors');

const manikandan = rawDonors.find(d => d.name.includes('Manikandan'));
assert.ok(manikandan && manikandan.isRareType, 'Manikandan R rare donor must be present in seeded donors');

console.log(`✓ [Step 2] autoSeedLocalStorage() successfully seeded ${rawDonors.length} donors including Porselvi S and Manikandan R.`);

// Verify resetSeedData()
rawDonors.push({ id: 'donor_temp_999', name: 'Temporary User', phone: '9999999999' });
mockStorage.setItem('rednova_donors', JSON.stringify(rawDonors));
assert.strictEqual(JSON.parse(mockStorage.getItem('rednova_donors')).length, rawDonors.length);

DB.resetDatabase();
const resetDonors = JSON.parse(mockStorage.getItem('rednova_donors'));
assert.ok(!resetDonors.some(d => d.id === 'donor_temp_999'), 'resetDatabase should clear temporary data and restore seed data');
console.log('✓ [Step 3] resetSeedData / DB.resetDatabase successfully restores default demo dataset.');

// 3. Verify register.html submit handler
const regHtml = fs.readFileSync(path.join(__dirname, 'register.html'), 'utf8');
assert.ok(regHtml.includes("e.preventDefault()"), 'register.html submit handler must call e.preventDefault()');
assert.ok(regHtml.includes("window.DB.addDonor") || regHtml.includes("window.DB.updateDonor"), 'register.html must save donor');
assert.ok(regHtml.includes("profile.html"), 'register.html must redirect to profile.html on success');
console.log('✓ [Step 4] register.html submit handler verified with e.preventDefault(), DB save, and profile redirect.');

console.log('\n====================================================');
console.log('🎉 ALL PRODUCTION & SEEDING TESTS PASSED 100%!');
console.log('====================================================\n');
