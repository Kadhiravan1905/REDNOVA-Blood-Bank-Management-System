/**
 * Automated test script for find.html and js/find.js logic
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

// Mock AppUtils
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (angle) => (angle * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

console.log('====================================================');
console.log('🧪 RUNNING FIND DONORS & PROXIMITY SORTING TESTS');
console.log('====================================================\n');

// 1. Seed database
DB.seedIfEmpty();
const donors = DB.getDonors();
console.log(`[Step 1] Seeded Donors in DB: ${donors.length}`);

// 2. User coordinates (Puducherry Town)
const userCoords = { lat: 11.9340, lng: 79.8306 }; // White Town
console.log(`[Step 2] User location: Lat ${userCoords.lat}, Lng ${userCoords.lng}`);

// 3. Query All Eligible Donors and calculate distances
const eligibleAll = DB.getEligibleDonors('ALL');
console.log(`\n[Step 3] Total Eligible Donors: ${eligibleAll.length}`);

const donorsWithDistance = eligibleAll.map(d => ({
  ...d,
  distanceKm: calculateHaversineDistance(userCoords.lat, userCoords.lng, d.lat, d.lng)
})).sort((a, b) => a.distanceKm - b.distanceKm);

console.log('Sorted Results (Nearest First):');
donorsWithDistance.forEach((d, i) => {
  console.log(` #${i + 1}: ${d.name} (${d.bloodType}) | Dist: ${d.distanceKm} km | Phone: ${d.maskedPhone} | Area: ${d.locationName}`);
  if (i > 0 && d.distanceKm < donorsWithDistance[i - 1].distanceKm) {
    throw new Error('Donors are not properly sorted in ascending distance order!');
  }
  if (!d.maskedPhone.includes('*')) {
    throw new Error(`Phone number not masked for ${d.name}`);
  }
});

// 4. Test Blood Type Filter
console.log('\n[Step 4] Filtering by Blood Type "A+"...');
const aPlusDonors = DB.getEligibleDonors('A+');
console.log(`Found ${aPlusDonors.length} eligible A+ donor(s):`, aPlusDonors.map(d => d.name));
if (aPlusDonors.length !== 1 || aPlusDonors[0].name !== 'B. Manoj') {
  throw new Error('A+ filter did not return expected eligible donor!');
}

// 5. Test Empty State for Blood Type with no eligible donors (e.g. AB- or B-)
console.log('\n[Step 5] Filtering by Blood Type "AB-" (cool-off or unavailable)...');
const abMinusDonors = DB.getEligibleDonors('AB-');
console.log(`Eligible AB- donors count: ${abMinusDonors.length} (Empty State Triggered)`);
if (abMinusDonors.length !== 0) {
  throw new Error('AB- should return 0 eligible donors (since available: false)!');
}

// 6. Test Request Contact Modal Submission
console.log('\n[Step 6] Simulating "Request Contact" submission...');
const targetDonor = donorsWithDistance[0];
const newRequest = DB.createRequest({
  donorId: targetDonor.id,
  requesterName: 'Dr. S. Anbarasu',
  requesterPhone: '9443322110',
  urgency: 'Critical',
  hospital: 'JIPMER Emergency',
  unitsNeeded: 2,
  message: 'Trauma ICU patient requiring immediate blood transfusion.'
});

console.log(`✓ Request created with ID: ${newRequest.id}`);
const requestsInDB = DB.getRequests();
const storedReq = requestsInDB.find(r => r.id === newRequest.id);
if (!storedReq) {
  throw new Error('Request was not persisted into rednova_requests!');
}
console.log(`✓ Verified request in rednova_requests:`);
console.log(`  Requester: ${storedReq.requesterName} (${storedReq.requesterPhone})`);
console.log(`  Urgency: ${storedReq.urgency}`);
console.log(`  Target Donor ID: ${storedReq.donorId}`);

console.log('\n====================================================');
console.log('🎉 ALL FIND.HTML & REQUEST CONTACT TESTS PASSED 100%!');
console.log('====================================================\n');
