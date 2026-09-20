/**
 * Automated test suite simulating the full RedNova registration and login flows.
 */

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

console.log('====================================================');
console.log('🧪 RUNNING REDNOVA REGISTRATION & LOGIN FLOW TESTS');
console.log('====================================================\n');

// 1. Initial State
DB.seedIfEmpty();
const initialDonors = DB.getDonors();
console.log(`[Step 1] Initial seeded donor count: ${initialDonors.length}`);

// 2. Simulate Geolocation & Registration on register.html
console.log('\n[Step 2] Simulating register.html form submission...');
const mockGeolocationCoords = { latitude: 11.9567, longitude: 79.7994 }; // Gorimedu / JIPMER area

const registrationFormData = {
  name: 'Dr. Priya Raman',
  phone: '9843210987',
  bloodType: 'AB+',
  locationName: 'Gorimedu, Puducherry',
  lat: mockGeolocationCoords.latitude,
  lng: mockGeolocationCoords.longitude,
  lastDonationDate: '2026-04-10', // ~132 days ago -> immediately eligible
  available: true
};

// Add donor to DB
const registeredDonor = DB.addDonor(registrationFormData);
console.log(`✓ New Donor Created: ID=${registeredDonor.id}, Name=${registeredDonor.name}, Phone=${registeredDonor.phone}`);

// Set session
DB.setSession(registeredDonor.id);
const sessionAfterReg = DB.getSession();
console.log(`✓ Session set: donorId=${sessionAfterReg.donorId}`);

if (sessionAfterReg.donorId !== registeredDonor.id) {
  throw new Error('Session donorId does not match registered donor ID!');
}

// 3. Verify Donor is in rednova_donors and is eligible
console.log('\n[Step 3] Verifying donor in rednova_donors collection...');
const updatedDonors = DB.getDonors();
const foundDonor = DB.getDonorById(registeredDonor.id);
if (!foundDonor) {
  throw new Error('Newly registered donor not found in localStorage rednova_donors!');
}
console.log(`✓ Total donors now: ${updatedDonors.length} (Expected: ${initialDonors.length + 1})`);
console.log(`✓ Stored details: ${foundDonor.name} | ${foundDonor.bloodType} | ${foundDonor.locationName} | Lat:${foundDonor.lat}, Lng:${foundDonor.lng}`);

const eligibleDonors = DB.getEligibleDonors('AB+');
const isPresentInEligible = eligibleDonors.some(d => d.id === registeredDonor.id);
console.log(`✓ Is donor surfaced in eligible AB+ search: ${isPresentInEligible}`);
if (!isPresentInEligible) {
  throw new Error('Registered donor with >90 days interval should be eligible!');
}

// 4. Test Login Flow on login.html (Phone-based session recovery)
console.log('\n[Step 4] Simulating login.html flow by phone lookup...');
// Clear active session first
DB.clearSession();
console.log(`✓ Session cleared. Current session: ${JSON.stringify(DB.getSession())}`);

// Donor types their phone
const loginPhoneInput = '9843210987';
const matchedDonor = DB.getDonorByPhone(loginPhoneInput);
if (!matchedDonor) {
  throw new Error(`Failed to lookup donor with phone ${loginPhoneInput}!`);
}
console.log(`✓ Lookup successful: Found donor "${matchedDonor.name}" for phone "${loginPhoneInput}"`);

// Recover session
DB.setSession(matchedDonor.id);
const recoveredDonor = DB.getCurrentDonor();
console.log(`✓ Session successfully recovered for: ${recoveredDonor.name} (${recoveredDonor.bloodType})`);
if (recoveredDonor.id !== registeredDonor.id) {
  throw new Error('Recovered donor ID does not match expected ID!');
}

// 5. Test Invalid Login
console.log('\n[Step 5] Testing non-existent phone lookup on login.html...');
const nonExistent = DB.getDonorByPhone('9000000000');
console.log(`✓ Non-existent phone lookup result: ${nonExistent === null ? 'null (Correct - error displayed)' : 'Found (Incorrect)'}`);
if (nonExistent !== null) {
  throw new Error('Lookup for unknown phone should return null!');
}

console.log('\n====================================================');
console.log('🎉 ALL REGISTRATION & LOGIN FLOW TESTS PASSED 100%!');
console.log('====================================================\n');
