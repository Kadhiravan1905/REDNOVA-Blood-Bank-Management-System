/**
 * RedNova - Core Shared Application Utilities
 * Includes: Haversine distance, toast notifications, UI helpers, RedNova Lite Mode, and demo reset controls
 */

const LITE_MODE_STORAGE_KEY = 'rednova_lite_mode';

// Haversine formula to compute distance in km between two lat/lng coordinates
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return null;
  }
  const toRad = (angle) => (angle * Math.PI) / 180;
  const R = 6371; // Earth radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

// Toast notification helper (Accessible & Responsive Light Theme)
function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const typeStyles = {
    success: 'bg-emerald-50 border border-emerald-300 text-emerald-900 font-semibold shadow-xl',
    error: 'bg-rose-50 border border-rose-300 text-rose-900 font-semibold shadow-xl',
    warning: 'bg-amber-50 border border-amber-300 text-amber-900 font-semibold shadow-xl',
    info: 'bg-slate-100 border border-slate-300 text-slate-800 font-semibold shadow-xl'
  };

  const icons = {
    success: '<svg class="w-5 h-5 flex-shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>',
    error: '<svg class="w-5 h-5 flex-shrink-0 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>',
    warning: '<svg class="w-5 h-5 flex-shrink-0 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>',
    info: '<svg class="w-5 h-5 flex-shrink-0 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
  };

  toast.className = `toast px-4 py-3 rounded-xl text-sm flex items-center gap-3 min-h-[44px] ${typeStyles[type] || typeStyles.info}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <span>${icons[type] || icons.info}</span>
    <span class="flex-1 text-xs sm:text-sm leading-snug">${message}</span>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Global Demo Reset Handler (Runs localStorage.clear(), re-seeds DB, and reloads)
function setupDemoResetButton() {
  const resetButtons = document.querySelectorAll('[data-action="reset-demo"]');
  resetButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Reset RedNova demo data? This will clear localStorage, restore default donors & sample requests, and reload the page.')) {
        try {
          if (typeof window.resetSeedData === 'function') {
            window.resetSeedData();
          } else if (window.DB && typeof window.DB.resetDatabase === 'function') {
            window.DB.resetDatabase();
          } else {
            localStorage.clear();
            if (window.DB && typeof window.DB.seedIfEmpty === 'function') {
              window.DB.seedIfEmpty();
            }
          }
          showToast('Database reset and re-seeded successfully!', 'success');
          setTimeout(() => {
            window.location.reload();
          }, 400);
        } catch (err) {
          console.error('Reset error:', err);
          window.location.reload();
        }
      }
    });
  });
}

// Render dynamic nav links based on session
function updateNavSessionState() {
  const currentDonor = window.DB ? window.DB.getCurrentDonor() : null;
  const navAuthContainer = document.getElementById('nav-auth-container');

  if (!navAuthContainer) return;

  if (currentDonor) {
    navAuthContainer.innerHTML = `
      <a href="profile.html" class="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white hover:text-rose-500 px-3 py-2 rounded-xl transition-colors min-h-[44px]">
        <span class="w-2.5 h-2.5 rounded-full ${currentDonor.available ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-slate-400'}"></span>
        <span class="hidden sm:inline">${currentDonor.name.split(' ')[0]} (${currentDonor.bloodType})</span>
        <span class="sm:hidden font-bold">${currentDonor.bloodType}</span>
      </a>
      <button id="nav-logout-btn" type="button" class="text-xs font-bold text-slate-300 hover:text-rose-500 px-2.5 py-2 rounded-lg transition-colors min-h-[44px] inline-flex items-center">Logout</button>
    `;

    const logoutBtn = document.getElementById('nav-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        window.DB.clearSession();
        showToast('Logged out of donor session', 'info');
        setTimeout(() => window.location.href = 'index.html', 400);
      });
    }
  } else {
    navAuthContainer.innerHTML = `
      <a href="login.html" class="login-btn inline-flex items-center justify-center text-xs sm:text-sm font-bold text-slate-200 hover:text-rose-500 px-3 py-2 rounded-xl transition-colors min-h-[44px]">Login</a>
      <a href="register.html" class="inline-flex items-center justify-center text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 px-3.5 py-2 rounded-xl shadow-sm shadow-rose-950 transition-all min-h-[44px]">Become a Donor</a>
    `;
  }
}

// ─── Pincode Auto-Lookup & Hybrid City Entry Helper ────────────────────────

function setupPincodeAutoLookup(pincodeInputId = 'reg-pincode', cityInputId = 'reg-location', statusId = 'pincodeStatus', latInputId = 'reg-lat', lngInputId = 'reg-lng') {
  const pinInput = document.getElementById(pincodeInputId);
  const cityInput = document.getElementById(cityInputId);
  const statusEl = document.getElementById(statusId);
  const latInput = document.getElementById(latInputId);
  const lngInput = document.getElementById(lngInputId);

  if (!pinInput || !cityInput) return;

  pinInput.addEventListener('input', async (e) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    e.target.value = rawVal;

    if (rawVal.length === 6) {
      if (statusEl) {
        statusEl.innerHTML = '<span class="text-rose-600 animate-pulse font-bold">🔍 Fetching city...</span>';
      }

      // Check local offline lookup table first (instant response)
      if (window.RedNovaLocation && window.RedNovaLocation.resolveCoordinates) {
        const localMatch = window.RedNovaLocation.resolveCoordinates(rawVal);
        if (localMatch) {
          if (!cityInput.value || cityInput.value.trim() === '' || cityInput.dataset.autofilled === 'true') {
            cityInput.value = localMatch.label;
            cityInput.dataset.autofilled = 'true';
          }
          if (latInput) latInput.value = localMatch.lat.toFixed(4);
          if (lngInput) lngInput.value = localMatch.lng.toFixed(4);
          if (statusEl) {
            statusEl.innerHTML = `<span class="text-emerald-700 font-bold">✓ Detected: ${localMatch.label.split(',')[0]}</span>`;
          }
          return;
        }
      }

      // Fetch from Indian Postal Pincode API
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${rawVal}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
            const po = data[0].PostOffice[0];
            const detectedArea = `${po.Name}, ${po.District || po.State}`;
            
            cityInput.value = detectedArea;
            cityInput.dataset.autofilled = 'true';

            if (statusEl) {
              statusEl.innerHTML = `<span class="text-emerald-700 font-bold">✓ Detected: ${po.District || po.Name}</span>`;
            }
            return;
          }
        }
      } catch (err) {
        console.warn('[Pincode Lookup] API error or offline mode:', err);
      }

      if (statusEl) {
        statusEl.innerHTML = '<span class="text-slate-500 font-medium">Please enter area manually</span>';
      }
    } else {
      if (statusEl) statusEl.innerHTML = '';
    }
  });

  cityInput.addEventListener('input', () => {
    cityInput.dataset.autofilled = 'false';
  });
}

// Ensure database is seeded and helpers wired on page load
document.addEventListener('DOMContentLoaded', () => {
  if (typeof window.autoSeedLocalStorage === 'function') {
    window.autoSeedLocalStorage();
  } else if (window.DB && typeof window.DB.autoSeedLocalStorage === 'function') {
    window.DB.autoSeedLocalStorage();
  } else if (window.DB && typeof window.DB.seedIfEmpty === 'function') {
    window.DB.seedIfEmpty();
  }
  setupDemoResetButton();
  updateNavSessionState();
  setupPincodeAutoLookup();

  window.addEventListener('storage', () => {
    updateNavSessionState();
  });
  window.addEventListener('rednova_storage_update', () => {
    updateNavSessionState();
  });
});

// ─── RedNova Lite SMS Fallback Payload Generator ──────────────────────────

window.openSmsModal = function(donorName, bloodType, hospital, phone, reqId) {
  const h = hospital || 'IGGGH Puducherry';
  const p = phone || '9876543210';
  const rId = reqId || Math.floor(1000 + Math.random() * 9000);
  const payload = `🚨 REDNOVA EMERGENCY 🚨\nBlood: ${bloodType}\nHospital: ${h}\nContact: ${p}\nReq ID: #${rId}\nRespond ASAP if available!`;

  const payloadEl = document.getElementById('smsPayloadText');
  if (payloadEl) payloadEl.value = payload;

  const sendBtn = document.getElementById('smsSendBtn');
  if (sendBtn) {
    const cleanPhone = (p || '').replace(/[^0-9+]/g, '');
    sendBtn.href = `sms:${cleanPhone}?body=${encodeURIComponent(payload)}`;
  }

  const modal = document.getElementById('smsModal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
};

window.closeSmsModal = function() {
  const modal = document.getElementById('smsModal');
  if (modal) modal.classList.add('hidden');
  document.body.style.overflow = '';
};

window.copySmsPayload = function() {
  const payloadEl = document.getElementById('smsPayloadText');
  if (!payloadEl) return;
  const text = payloadEl.value;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('📋 160-char SMS text copied!', 'success');
    }).catch(() => {
      payloadEl.select();
      document.execCommand('copy');
      showToast('📋 160-char SMS text copied!', 'success');
    });
  } else {
    payloadEl.select();
    document.execCommand('copy');
    showToast('📋 160-char SMS text copied!', 'success');
  }
};

// Export utilities
window.AppUtils = {
  calculateHaversineDistance,
  showToast,
  setupDemoResetButton,
  updateNavSessionState,
  openSmsModal,
  closeSmsModal,
  copySmsPayload,
  setupPincodeAutoLookup,
  autoSeedLocalStorage: typeof autoSeedLocalStorage === 'function' ? autoSeedLocalStorage : () => (window.DB ? window.DB.autoSeedLocalStorage() : false),
  resetSeedData: typeof resetSeedData === 'function' ? resetSeedData : () => (window.DB ? window.DB.resetDatabase() : false)
};
