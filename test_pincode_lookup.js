const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log('🧪 RUNNING PINCODE AUTO-LOOKUP & MANUAL CITY TESTS');
console.log('====================================================\n');

// 1. Verify register.html markup
const regHtml = fs.readFileSync(path.join(__dirname, 'register.html'), 'utf8');
assert.ok(regHtml.includes('id="reg-pincode"'), 'register.html must contain #reg-pincode');
assert.ok(regHtml.includes('id="reg-location"'), 'register.html must contain #reg-location');
assert.ok(regHtml.includes('id="pincodeStatus"'), 'register.html must contain #pincodeStatus');

// Verify that #reg-location has neither disabled nor readonly
const locInputMatch = regHtml.match(/<input[^>]*id="reg-location"[^>]*>/);
assert.ok(locInputMatch, 'Found #reg-location element');
assert.ok(!locInputMatch[0].includes('disabled'), '#reg-location must NOT be disabled');
assert.ok(!locInputMatch[0].includes('readonly'), '#reg-location must NOT be readonly');
console.log('✓ [Step 1] register.html input elements and editable attributes verified.');

// 2. Verify js/app.js functions
const appJs = fs.readFileSync(path.join(__dirname, 'js', 'app.js'), 'utf8');
assert.ok(appJs.includes('setupPincodeAutoLookup'), 'js/app.js must define setupPincodeAutoLookup');
assert.ok(appJs.includes('https://api.postalpincode.in/pincode/'), 'js/app.js must reference postalpincode API');
assert.ok(appJs.includes('setupPincodeAutoLookup'), 'js/app.js exports setupPincodeAutoLookup');
console.log('✓ [Step 2] js/app.js pincode lookup handler verified.');

// 3. Test local landmark & pincode database resolution
const RedNovaLocation = require(path.join(__dirname, 'js', 'localization.js'));

const testPincodes = ['605008', '605004', '605011', '600010'];
testPincodes.forEach(pin => {
  const resolved = RedNovaLocation.resolveCoordinates(pin);
  assert.ok(resolved, `Pincode ${pin} must resolve to coordinates`);
  console.log(`  ✓ Pincode ${pin} → ${resolved.label} (${resolved.lat}, ${resolved.lng})`);
});
console.log('✓ [Step 3] Local fast resolution verified for multiple pincodes.');

// 4. Verify manual city entry without pincode works
const manualCity = "Anna Nagar, Puducherry";
const resolvedManual = RedNovaLocation.resolveCoordinates(manualCity);
assert.ok(resolvedManual, 'Manual city entry must resolve coordinates');
console.log(`✓ [Step 4] Manual city entry "${manualCity}" resolved to (${resolvedManual.lat}, ${resolvedManual.lng})`);

console.log('\n====================================================');
console.log('🎉 ALL PINCODE & MANUAL CITY TESTS PASSED 100%!');
console.log('====================================================\n');
