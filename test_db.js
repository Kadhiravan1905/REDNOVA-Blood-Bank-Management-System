// Test script for RedNova DB (Updated with Rare Phenotype Registry)
const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = v; },
  removeItem: (k) => { delete storage[k]; }
};
global.window = {
  dispatchEvent: () => {}
};
global.CustomEvent = class {};

const DB = require('./js/db.js');

console.log('--- 1. Testing DB.seedIfEmpty() ---');
const seeded = DB.seedIfEmpty();
console.log('Seed executed:', seeded);
const donors = DB.getDonors();
console.log('Total Donors Count:', donors.length);
if (donors.length !== 10) {
  throw new Error(`Expected 10 donors (8 standard + 2 rare), got ${donors.length}`);
}

console.log('\n--- 2. Testing 90-day Eligibility & Phone Masking ---');
const eligibleAll = DB.getEligibleDonors('ALL');
console.log(`Eligible donors (Available + 90+ days): ${eligibleAll.length} of ${donors.length}`);
eligibleAll.forEach(d => {
  console.log(`✓ ${d.name} | Type: ${d.bloodType} | Masked: ${d.maskedPhone} | Days: ${d.eligibility.daysSince}`);
  if (!d.maskedPhone.includes('*')) {
    throw new Error(`Phone number not masked properly: ${d.maskedPhone}`);
  }
  if (d.eligibility.daysSince < 90) {
    throw new Error(`Donor ${d.name} is ineligible (<90 days: ${d.eligibility.daysSince}) but returned in eligible list!`);
  }
});

console.log('\n--- 3. Testing Filter by Blood Type (e.g. O+) ---');
const oPlus = DB.getEligibleDonors('O+');
console.log(`Eligible O+ donors: ${oPlus.length}`);
oPlus.forEach(d => {
  console.log(`✓ ${d.name} (${d.bloodType})`);
});

console.log('\n--- 4. Testing Rare Phenotype Queries ---');
const rareDonors = DB.getRareDonors('Bombay (hh)');
console.log(`Eligible Bombay (hh) donors: ${rareDonors.length}`);
if (rareDonors.length === 0) {
  throw new Error('Expected at least 1 Bombay (hh) donor');
}

console.log('\n--- 5. Testing CRUD & Request Creation ---');
const newReq = DB.createRequest({
  donorId: donors[0].id,
  requesterName: 'Dr. Test',
  requesterPhone: '9888877777',
  hospital: 'Test Hospital',
  urgency: 'Critical',
  unitsNeeded: 2
});
console.log('Created request ID:', newReq.id);
const donorReqs = DB.getRequestsForDonor(donors[0].id);
console.log(`Requests for donor ${donors[0].id}: ${donorReqs.length}`);

console.log('\n--- 6. Testing Session Management ---');
DB.setSession(donors[0].id);
const session = DB.getSession();
console.log('Current session donor ID:', session.donorId);
const currentDonor = DB.getCurrentDonor();
console.log('Current logged in donor:', currentDonor.name);

DB.clearSession();
console.log('Session cleared:', DB.getSession() === null);

console.log('\n======================================');
console.log('🎉 ALL DATABASE TESTS PASSED CLEANLY!');
console.log('======================================');
