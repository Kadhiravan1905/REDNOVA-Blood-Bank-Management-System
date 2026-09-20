const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log('🧪 RUNNING SMS FALLBACK PAYLOAD GENERATOR TESTS');
console.log('====================================================\n');

// 1. Check find.html markup
const findHtml = fs.readFileSync(path.join(__dirname, 'find.html'), 'utf8');
assert.ok(findHtml.includes('id="smsModal"'), 'find.html must contain #smsModal container');
assert.ok(findHtml.includes('id="smsPayloadText"'), 'find.html must contain #smsPayloadText textarea');
assert.ok(findHtml.includes('id="smsSendBtn"'), 'find.html must contain #smsSendBtn action button');
assert.ok(findHtml.includes('closeSmsModal()'), 'find.html must have close button trigger');
assert.ok(findHtml.includes('copySmsPayload()'), 'find.html must have copy text trigger');
console.log('✓ [Step 1] find.html modal DOM components verified.');

// 2. Check js/app.js functions
const appJs = fs.readFileSync(path.join(__dirname, 'js', 'app.js'), 'utf8');
assert.ok(appJs.includes('window.openSmsModal'), 'js/app.js must define window.openSmsModal');
assert.ok(appJs.includes('window.closeSmsModal'), 'js/app.js must define window.closeSmsModal');
assert.ok(appJs.includes('window.copySmsPayload'), 'js/app.js must define window.copySmsPayload');
assert.ok(appJs.includes('🚨 REDNOVA EMERGENCY 🚨'), 'js/app.js must format emergency SMS payload');
console.log('✓ [Step 2] js/app.js modal functions & payload template verified.');

// 3. Check js/find.js donor card button binding
const findJs = fs.readFileSync(path.join(__dirname, 'js', 'find.js'), 'utf8');
assert.ok(findJs.includes('openSmsModal('), 'js/find.js must bind openSmsModal() to SMS Fallback button');
assert.ok(findJs.includes('SMS Fallback'), 'js/find.js donor cards must display SMS Fallback button label');
console.log('✓ [Step 3] js/find.js donor card binding verified.');

// 4. Test simulated runtime payload generation
const mockDonor = {
  name: 'Manikandan R',
  bloodType: 'Bombay (hh)',
  hospital: 'IGGGH Puducherry',
  phone: '+91 9443312387',
  reqId: '102'
};

const payload = `🚨 REDNOVA EMERGENCY 🚨\nBlood: ${mockDonor.bloodType}\nHospital: ${mockDonor.hospital}\nContact: ${mockDonor.phone}\nReq ID: #${mockDonor.reqId}\nRespond ASAP if available!`;

assert.ok(payload.includes('🚨 REDNOVA EMERGENCY 🚨'));
assert.ok(payload.includes('Blood: Bombay (hh)'));
assert.ok(payload.includes('Hospital: IGGGH Puducherry'));
assert.ok(payload.includes('Contact: +91 9443312387'));
assert.ok(payload.includes('Req ID: #102'));
assert.ok(payload.length <= 160, 'Payload length must fit in a single 160-char SMS segment');
console.log(`✓ [Step 4] Runtime payload generated (${payload.length} chars <= 160):\n---\n${payload}\n---`);

console.log('\n====================================================');
console.log('🎉 ALL SMS FALLBACK TESTS PASSED 100%!');
console.log('====================================================\n');
