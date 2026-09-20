/**
 * Automated test script simulating cross-tab real-time sync and donor profile controls.
 */

const storage = {};
const listeners = { storage: [], rednova_storage_update: [] };

global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => {
    const oldVal = storage[k] || null;
    storage[k] = v;
    // Dispatch simulated cross-tab storage event
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
  dispatchEvent: (customEvent) => {}
};
global.CustomEvent = class {};

const DB = require('./js/db.js');

console.log('====================================================');
console.log('🧪 RUNNING CROSS-TAB SYNC & PROFILE INTERACTION TESTS');
console.log('====================================================\n');

// 1. Initial Seeding & Session Set for Tab B (Donor Profile: S. Sivaraji, donor_101)
DB.seedIfEmpty();
DB.setSession('donor_101');
const currentDonor = DB.getCurrentDonor();
console.log(`[Tab B - Donor View] Active Donor Session: ${currentDonor.name} (${currentDonor.bloodType}, ${currentDonor.phone})`);

// 2. Check initial requests count in Tab B
let tabBInbox = DB.getRequestsForDonor(currentDonor.id);
console.log(`[Tab B] Initial Inbox Count: ${tabBInbox.length} requests`);

// 3. Attach cross-tab storage listener to Tab B
let storageEventFiredCount = 0;
let lastSyncedRequestCount = 0;

window.addEventListener('storage', (e) => {
  if (e.key === 'rednova_requests') {
    storageEventFiredCount++;
    tabBInbox = DB.getRequestsForDonor(currentDonor.id);
    lastSyncedRequestCount = tabBInbox.length;
    console.log(`⚡ [Tab B Real-Time Sync Event] New request detected from Tab A! Updated Inbox Count: ${tabBInbox.length}`);
  }
});

// 4. Simulate Tab A (Requester on find.html) dispatching an urgent request to donor_101
console.log('\n[Tab A - Requester View] Submitting emergency contact request to donor_101...');
const emergencyRequest = DB.createRequest({
  donorId: 'donor_101',
  requesterName: 'Dr. Vignesh (Chief Surgeon)',
  requesterPhone: '9876112233',
  urgency: 'Critical',
  hospital: 'PIMS Super Specialty Hospital',
  unitsNeeded: 3,
  message: 'Emergency cardiac bypass surgery in OT-3 needs 3 units of O+ blood.'
});
console.log(`[Tab A] Request dispatched! ID: ${emergencyRequest.id}`);

// 5. Verify Tab B received the real-time update without manual reload
if (storageEventFiredCount === 0 || lastSyncedRequestCount !== (tabBInbox.length)) {
  throw new Error('Cross-tab storage sync failed to update Tab B inbox!');
}
console.log(`✓ Tab B successfully received real-time sync! Newest request in inbox: "${tabBInbox[0].requesterName}" (${tabBInbox[0].urgency})`);

// 6. Test Availability Toggle Switch (Online -> Offline -> Online)
console.log('\n[Profile Controls] Testing Donor Availability Toggle...');
console.log(`Initial Availability: ${currentDonor.available}`);

// Turn availability OFF
DB.toggleDonorAvailability('donor_101', false);
const donorOffline = DB.getDonorById('donor_101');
console.log(`✓ Donor availability toggled to: ${donorOffline.available} (OFFLINE)`);

// Verify that find.html search immediately excludes donor_101
const eligibleOPlusOffline = DB.getEligibleDonors('O+');
const isFoundWhileOffline = eligibleOPlusOffline.some(d => d.id === 'donor_101');
console.log(`✓ Is donor_101 visible on find.html search when OFFLINE: ${isFoundWhileOffline} (Expected: false)`);
if (isFoundWhileOffline) {
  throw new Error('Donor should NOT appear in search results when available === false!');
}

// Turn availability back ON
DB.toggleDonorAvailability('donor_101', true);
const donorOnline = DB.getDonorById('donor_101');
console.log(`✓ Donor availability toggled to: ${donorOnline.available} (ONLINE)`);
const eligibleOPlusOnline = DB.getEligibleDonors('O+');
const isFoundWhileOnline = eligibleOPlusOnline.some(d => d.id === 'donor_101');
console.log(`✓ Is donor_101 visible on find.html search when ONLINE: ${isFoundWhileOnline} (Expected: true)`);
if (!isFoundWhileOnline) {
  throw new Error('Donor should appear in search results when available === true and interval >= 90 days!');
}

// 7. Test Logout Button
console.log('\n[Profile Controls] Testing Log Out Button...');
DB.clearSession();
console.log(`✓ Session cleared: ${DB.getSession() === null}`);
if (DB.getSession() !== null || DB.getCurrentDonor() !== null) {
  throw new Error('Logout failed to clear rednova_session!');
}

console.log('\n====================================================');
console.log('🎉 ALL PROFILE & CROSS-TAB SYNC TESTS PASSED 100%!');
console.log('====================================================\n');
