/**
 * Automated test script for Rare Blood Registry & Priority SOS Channel
 */

const storage = {};
const listeners = { storage: [], rednova_storage_update: [] };

global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => {
    const oldVal = storage[k] || null;
    storage[k] = v;
    listeners.storage.forEach(fn => fn({ key: k, oldValue: oldVal, newValue: v }));
  },
  removeItem: (k) => {
    const oldVal = storage[k] || null;
    delete storage[k];
    listeners.storage.forEach(fn => fn({ key: k, oldValue: oldVal, newValue: null }));
  }
};

global.window = {
  addEventListener: (event, handler) => {
    if (listeners[event]) listeners[event].push(handler);
  },
  dispatchEvent: () => {}
};
global.CustomEvent = class {};

const DB = require('./js/db.js');

console.log('====================================================');
console.log('🧪 RUNNING RARE BLOOD REGISTRY & SOS CHANNEL TESTS');
console.log('====================================================\n');

// 1. Test Seeding with Rare Donors
DB.seedIfEmpty();
const allDonors = DB.getDonors();
console.log(`[Step 1] Total Seeded Donors in DB: ${allDonors.length} (Expected: 10)`);
if (allDonors.length !== 10) {
  throw new Error(`Expected 10 donors (8 standard + 2 rare), got ${allDonors.length}`);
}

const rareDonors = allDonors.filter(d => d.isRareType);
console.log(`✓ Seeded Rare Donors count: ${rareDonors.length}`);
rareDonors.forEach(rd => {
  console.log(`  🌟 ${rd.name} | Phenotype: ${rd.bloodType} | Location: ${rd.locationName} | Notes: ${rd.rarePhenotypeNotes}`);
});

if (rareDonors.length < 2) {
  throw new Error('Expected at least 2 seeded rare phenotype donors!');
}

// 2. Test DB.getRareDonors('Bombay (hh)')
console.log('\n[Step 2] Testing DB.getRareDonors("Bombay (hh)")...');
const bombayDonors = DB.getRareDonors('Bombay (hh)');
console.log(`✓ Found ${bombayDonors.length} Bombay (hh) donor(s):`);
bombayDonors.forEach(b => {
  console.log(`  - ${b.name} (${b.bloodType}) | Phone: ${b.maskedPhone} | Area: ${b.locationName}`);
  if (!b.maskedPhone.includes('*')) {
    throw new Error('Phone number must be masked!');
  }
  if (!b.isRareHero) {
    throw new Error('Expected isRareHero flag!');
  }
});
if (bombayDonors.length === 0 || !bombayDonors[0].name.includes('Manikandan')) {
  throw new Error('Bombay (hh) donor lookup failed!');
}

// 3. Test DB.getRareDonors('Rh-null')
console.log('\n[Step 3] Testing DB.getRareDonors("Rh-null")...');
const rhNullDonors = DB.getRareDonors('Rh-null');
console.log(`✓ Found ${rhNullDonors.length} Rh-null donor(s):`);
rhNullDonors.forEach(r => {
  console.log(`  - ${r.name} (${r.bloodType}) | Phone: ${r.maskedPhone} | Notes: ${r.rarePhenotypeNotes}`);
});
if (rhNullDonors.length === 0 || !rhNullDonors[0].name.includes('Anandan')) {
  throw new Error('Rh-null donor lookup failed!');
}

// 4. Test Registration of a New Rare Donor (e.g. D--)
console.log('\n[Step 4] Testing new Rare Donor registration (D--)...');
const newRareDonor = DB.addDonor({
  name: 'Dr. V. Karthikeyan',
  phone: '9788112233',
  bloodType: 'D--',
  isRareType: true,
  rarePhenotypeNotes: 'Rare Rh-D deletion phenotype (D--) certified by Central Blood Bank #RH-DEL-04',
  locationName: 'JIPMER Campus, Puducherry',
  lat: 11.9567,
  lng: 79.7994,
  lastDonationDate: '2026-03-15',
  available: true,
  emergencyStandby: true
});
console.log(`✓ Registered new rare donor: ${newRareDonor.name} (${newRareDonor.bloodType}, ID: ${newRareDonor.id})`);

const dMinusDonors = DB.getRareDonors('D--');
console.log(`✓ Found ${dMinusDonors.length} D-- donor(s) in registry:`, dMinusDonors.map(d => d.name));
if (dMinusDonors.length === 0) {
  throw new Error('Newly registered D-- donor not returned in getRareDonors query!');
}

// 5. Test Rare SOS Broadcast & Real-Time Sync to Bombay Donor
console.log('\n[Step 5] Simulating Rare Blood Emergency SOS Broadcast to Bombay donor...');
const bombayTarget = bombayDonors[0];

// Tab B listens for requests
let tabBBombayInbox = DB.getRequestsForDonor(bombayTarget.id);
console.log(`[Tab B - Bombay Donor] Initial Inbox count: ${tabBBombayInbox.length}`);

window.addEventListener('storage', (e) => {
  if (e.key === 'rednova_requests') {
    tabBBombayInbox = DB.getRequestsForDonor(bombayTarget.id);
    console.log(`⚡ [Tab B Real-Time Sync Event] RARE SOS Alert received! Inbox Count: ${tabBBombayInbox.length}`);
  }
});

// Tab A broadcasts Regional Priority SOS
const sosRequest = DB.createRequest({
  donorId: bombayTarget.id,
  requesterName: 'State Transfusion Officer (Govt. Maternity Hospital)',
  requesterPhone: '9444001122',
  hospital: 'Rajiv Gandhi Women and Children Hospital, Puducherry',
  patientBloodType: 'Bombay (hh)',
  urgency: 'Critical',
  isRareSOS: true,
  broadcastRadiusKm: 250,
  unitsNeeded: 2,
  message: '🚨 CRITICAL RARE SOS: Emergency postpartum hemorrhage patient with confirmed Bombay (hh) antibodies.'
});
console.log(`[Tab A] SOS Alert dispatched! Request ID: ${sosRequest.id}`);

if (tabBBombayInbox.length === 0 || tabBBombayInbox[0].id !== sosRequest.id) {
  throw new Error('Rare SOS broadcast failed to reach Bombay donor inbox!');
}
console.log(`✓ Verified Tab B received SOS: "${tabBBombayInbox[0].requesterName}" (isRareSOS: ${tabBBombayInbox[0].isRareSOS}, Radius: ${tabBBombayInbox[0].broadcastRadiusKm}km)`);

// 6. Test Emergency Standby Toggle
console.log('\n[Step 6] Testing Emergency Standby Toggle for Rare Donor...');
DB.toggleEmergencyStandby(bombayTarget.id, false);
const standbyOff = DB.getDonorById(bombayTarget.id);
console.log(`✓ Standby toggled to: ${standbyOff.emergencyStandby}`);
if (standbyOff.emergencyStandby !== false) {
  throw new Error('Failed to toggle emergencyStandby to false');
}

DB.toggleEmergencyStandby(bombayTarget.id, true);
const standbyOn = DB.getDonorById(bombayTarget.id);
console.log(`✓ Standby toggled to: ${standbyOn.emergencyStandby}`);
if (standbyOn.emergencyStandby !== true) {
  throw new Error('Failed to toggle emergencyStandby to true');
}

console.log('\n====================================================');
console.log('🎉 ALL RARE BLOOD REGISTRY & SOS TESTS PASSED 100%!');
console.log('====================================================\n');
