/**
 * RedNova — Hybrid Localization Engine (js/localization.js)
 *
 * Manages dual-mode location:
 *  1. 📍 GPS Mode  — navigator.geolocation with timeout/error handling
 *  2. ✏️ Manual Mode — pincode/landmark → fixed lat/lng lookup table
 *
 * Auto-fallback: if GPS is denied or times out, switches to Manual mode silently.
 * Exposed as: window.RedNovaLocation
 */

const LOCATION_LOOKUP_TABLE = [
  // ── Puducherry Pincodes ──────────────────────────────────────
  { query: '605001', label: 'Puducherry Town (White Town)', lat: 11.9340, lng: 79.8306 },
  { query: '605002', label: 'Muthialpet / Reddiarpalayam', lat: 11.9250, lng: 79.8250 },
  { query: '605003', label: 'Nellithope / Oulgaret', lat: 11.9500, lng: 79.8170 },
  { query: '605004', label: 'Lawspet, Puducherry', lat: 11.9301, lng: 79.8081 },
  { query: '605005', label: 'Murungapakkam, Puducherry', lat: 11.9556, lng: 79.8440 },
  { query: '605006', label: 'Thattanchavady, Puducherry', lat: 11.9090, lng: 79.8360 },
  { query: '605007', label: 'Bahour / Karikalampakkam', lat: 11.8760, lng: 79.8120 },
  { query: '605008', label: 'Kalapet / Pondicherry University', lat: 11.9567, lng: 79.8994 },
  { query: '605009', label: 'Seliamedu / Villianur', lat: 11.9120, lng: 79.7730 },
  { query: '605010', label: 'Ariyankuppam, Puducherry', lat: 11.8890, lng: 79.8270 },
  { query: '605011', label: 'Gorimedu / JIPMER Area', lat: 11.9500, lng: 79.8630 },
  { query: '605012', label: 'Kuyavarpalayam, Puducherry', lat: 11.9700, lng: 79.8700 },
  { query: '605014', label: 'Mannadipet, Puducherry', lat: 11.9880, lng: 79.8000 },

  // ── Puducherry Landmarks ─────────────────────────────────────
  { query: 'jipmer', label: 'JIPMER Campus, Puducherry', lat: 11.9567, lng: 79.7994 },
  { query: 'jipmer campus', label: 'JIPMER Campus, Puducherry', lat: 11.9567, lng: 79.7994 },
  { query: 'gorimedu', label: 'Gorimedu (JIPMER Area)', lat: 11.9500, lng: 79.8630 },
  { query: 'lawspet', label: 'Lawspet, Puducherry', lat: 11.9301, lng: 79.8081 },
  { query: 'lawspet puducherry', label: 'Lawspet, Puducherry', lat: 11.9301, lng: 79.8081 },
  { query: 'white town', label: 'White Town, Puducherry', lat: 11.9340, lng: 79.8306 },
  { query: 'pondicherry university', label: 'Pondicherry University, Kalapet', lat: 11.9567, lng: 79.8994 },
  { query: 'kalapet', label: 'Kalapet, Puducherry', lat: 11.9567, lng: 79.8994 },
  { query: 'igggh', label: 'IGGGH Puducherry', lat: 11.9290, lng: 79.8340 },
  { query: 'igggh puducherry', label: 'IGGGH Puducherry', lat: 11.9290, lng: 79.8340 },
  { query: 'pims', label: 'PIMS Hospital, Puducherry', lat: 11.9380, lng: 79.8060 },
  { query: 'pims hospital', label: 'PIMS Hospital, Puducherry', lat: 11.9380, lng: 79.8060 },
  { query: 'puducherry', label: 'Central Puducherry', lat: 11.9401, lng: 79.8341 },
  { query: 'pondicherry', label: 'Central Puducherry', lat: 11.9401, lng: 79.8341 },
  { query: 'oulgaret', label: 'Oulgaret, Puducherry', lat: 11.9500, lng: 79.8170 },
  { query: 'nellithope', label: 'Nellithope, Puducherry', lat: 11.9480, lng: 79.8210 },
  { query: 'reddiarpalayam', label: 'Reddiarpalayam, Puducherry', lat: 11.9250, lng: 79.8250 },
  { query: 'murungapakkam', label: 'Murungapakkam, Puducherry', lat: 11.9556, lng: 79.8440 },
  { query: 'villianur', label: 'Villianur, Puducherry', lat: 11.9120, lng: 79.7730 },
  { query: 'bahour', label: 'Bahour, Puducherry', lat: 11.8760, lng: 79.8120 },
  { query: 'ariyankuppam', label: 'Ariyankuppam, Puducherry', lat: 11.8890, lng: 79.8270 },
  { query: 'muthialpet', label: 'Muthialpet, Puducherry', lat: 11.9350, lng: 79.8340 },
  { query: 'thattanchavady', label: 'Thattanchavady, Puducherry', lat: 11.9090, lng: 79.8360 },

  // ── Chennai ──────────────────────────────────────────────────
  { query: '600001', label: 'Parrys Corner, Chennai', lat: 13.0827, lng: 80.2785 },
  { query: '600006', label: 'Egmore, Chennai', lat: 13.0755, lng: 80.2617 },
  { query: '600010', label: 'Tambaram, Chennai', lat: 12.9249, lng: 80.1000 },
  { query: '600020', label: 'T. Nagar, Chennai', lat: 13.0418, lng: 80.2341 },
  { query: '600032', label: 'Adyar, Chennai', lat: 13.0063, lng: 80.2574 },
  { query: '600042', label: 'Guindy, Chennai', lat: 13.0067, lng: 80.2206 },
  { query: 'chennai', label: 'Central Chennai', lat: 13.0827, lng: 80.2707 },
  { query: 'tambaram', label: 'Tambaram, Chennai', lat: 12.9249, lng: 80.1000 },
  { query: 'guindy', label: 'Guindy, Chennai', lat: 13.0067, lng: 80.2206 },
  { query: 'adyar', label: 'Adyar, Chennai', lat: 13.0063, lng: 80.2574 },
  { query: 't nagar', label: 'T. Nagar, Chennai', lat: 13.0418, lng: 80.2341 },
  { query: 'egmore', label: 'Egmore, Chennai', lat: 13.0755, lng: 80.2617 },

  // ── Tamil Nadu Key Cities ────────────────────────────────────
  { query: 'cuddalore', label: 'Cuddalore, Tamil Nadu', lat: 11.7449, lng: 79.7680 },
  { query: '607001', label: 'Cuddalore Town', lat: 11.7449, lng: 79.7680 },
  { query: 'villupuram', label: 'Villupuram, Tamil Nadu', lat: 11.9373, lng: 79.4930 },
  { query: '605602', label: 'Villupuram', lat: 11.9373, lng: 79.4930 },
  { query: 'vellore', label: 'Vellore, Tamil Nadu', lat: 12.9165, lng: 79.1325 },
  { query: 'coimbatore', label: 'Coimbatore, Tamil Nadu', lat: 11.0168, lng: 76.9558 },
  { query: 'madurai', label: 'Madurai, Tamil Nadu', lat: 9.9252, lng: 78.1198 },
  { query: 'trichy', label: 'Trichy (Tiruchirappalli), Tamil Nadu', lat: 10.7905, lng: 78.7047 },
  { query: 'tiruchirappalli', label: 'Trichy, Tamil Nadu', lat: 10.7905, lng: 78.7047 },
];

/**
 * Lookup coordinates for a pincode or area name query.
 * Tries exact match first, then partial match.
 * Returns { label, lat, lng } or null.
 */
function lookupLocation(rawQuery) {
  if (!rawQuery || !rawQuery.trim()) return null;
  const q = rawQuery.trim().toLowerCase().replace(/[,.-]/g, ' ').replace(/\s+/g, ' ');

  // 1. Exact match
  const exact = LOCATION_LOOKUP_TABLE.find(e => e.query === q);
  if (exact) return { label: exact.label, lat: exact.lat, lng: exact.lng };

  // 2. Starts-with match (e.g. "lawspet pu" → "lawspet")
  const startsWith = LOCATION_LOOKUP_TABLE.find(e => q.startsWith(e.query) || e.query.startsWith(q));
  if (startsWith) return { label: startsWith.label, lat: startsWith.lat, lng: startsWith.lng };

  // 3. Includes match
  const includes = LOCATION_LOOKUP_TABLE.find(e => q.includes(e.query) || e.query.includes(q));
  if (includes) return { label: includes.label, lat: includes.lat, lng: includes.lng };

  return null;
}

/**
 * Get autocomplete suggestions for a partial query.
 * Returns up to 6 matches.
 */
function getSuggestions(rawQuery) {
  if (!rawQuery || rawQuery.trim().length < 2) return [];
  const q = rawQuery.trim().toLowerCase().replace(/[,.-]/g, ' ').replace(/\s+/g, ' ');

  const seen = new Set();
  const results = [];

  for (const entry of LOCATION_LOOKUP_TABLE) {
    if (results.length >= 6) break;
    const key = entry.label;
    if (!seen.has(key) && (entry.query.includes(q) || entry.label.toLowerCase().includes(q))) {
      seen.add(key);
      results.push({ label: entry.label, lat: entry.lat, lng: entry.lng });
    }
  }
  return results;
}

// ═══════════════════════════════════════════════════════
// Hybrid Location Controller
// ═══════════════════════════════════════════════════════

const DEFAULT_COORDS = { lat: 11.9401, lng: 79.8341, label: 'Central Puducherry (Default)' };

let currentMode = 'gps';           // 'gps' | 'manual'
let activeCoords = { ...DEFAULT_COORDS };  // currently active search center

/**
 * Switch the visible tab & panels
 */
function switchLocationMode(mode, options = {}) {
  currentMode = mode;

  const tabGPS = document.getElementById('tab-gps');
  const tabManual = document.getElementById('tab-manual');
  const panelGPS = document.getElementById('loc-panel-gps');
  const panelManual = document.getElementById('loc-panel-manual');
  const modeBadge = document.getElementById('loc-mode-badge');

  const activeTab = 'action-btn toggle-btn active bg-rose-600 text-white shadow-sm border border-rose-500';
  const inactiveTab = 'action-btn toggle-btn text-slate-300 opacity-80 hover:opacity-100';

  if (mode === 'gps') {
    if (tabGPS) {
      tabGPS.setAttribute('aria-selected', 'true');
      tabGPS.className = `loc-mode-tab flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs transition-all min-h-[44px] ${activeTab}`;
    }
    if (tabManual) {
      tabManual.setAttribute('aria-selected', 'false');
      tabManual.className = `loc-mode-tab flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs transition-all min-h-[44px] ${inactiveTab}`;
    }
    panelGPS?.classList.remove('hidden');
    panelManual?.classList.add('hidden');
    if (modeBadge) {
      modeBadge.textContent = 'GPS Active';
      modeBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 uppercase tracking-wide';
    }
  } else {
    if (tabGPS) {
      tabGPS.setAttribute('aria-selected', 'false');
      tabGPS.className = `loc-mode-tab flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs transition-all min-h-[44px] ${inactiveTab}`;
    }
    if (tabManual) {
      tabManual.setAttribute('aria-selected', 'true');
      tabManual.className = `loc-mode-tab flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs transition-all min-h-[44px] ${activeTab}`;
    }
    panelGPS?.classList.add('hidden');
    panelManual?.classList.remove('hidden');
    if (modeBadge) {
      if (options.gpsDenied) {
        modeBadge.textContent = 'GPS Denied — Manual Mode';
        modeBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wide';
        document.getElementById('gps-denied-banner')?.classList.remove('hidden');
        document.getElementById('gps-denied-banner')?.classList.add('flex');
      } else {
        modeBadge.textContent = 'Manual Area';
        modeBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 uppercase tracking-wide';
      }
    }
  }
}

/**
 * Update the GPS panel display labels
 */
function updateGPSDisplay(lat, lng, label) {
  const statusLabel = document.getElementById('location-status-label');
  const coordsDisplay = document.getElementById('location-coords-display');
  if (statusLabel) statusLabel.textContent = label;
  if (coordsDisplay) coordsDisplay.textContent = `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
}

/**
 * Show the Location Accuracy Banner (Manual mode)
 */
function showAccuracyBanner(label, lat, lng) {
  const banner = document.getElementById('loc-accuracy-banner');
  const labelEl = document.getElementById('loc-accuracy-label');
  const coordsEl = document.getElementById('loc-accuracy-coords');
  if (banner) {
    banner.classList.remove('hidden');
    banner.classList.add('flex');
  }
  if (labelEl) labelEl.textContent = label;
  if (coordsEl) coordsEl.textContent = `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
}

/**
 * Apply a new set of coordinates as the active search center
 * and trigger a search refresh.
 */
function applyCoords(lat, lng, label) {
  activeCoords = { lat, lng, label };
  if (window._rednova_onLocationChange) {
    window._rednova_onLocationChange({ lat, lng, label });
  }
}

/**
 * GPS Detection
 */
function detectGPS() {
  const btn = document.getElementById('btn-detect-location');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<svg class="w-4 h-4 text-amber-300 animate-spin flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg><span>Locating…</span>`;
  }

  if (!navigator.geolocation) {
    onGPSFailed('unsupported');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<svg class="w-4 h-4 text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><span>Detect My Location</span>`;
      }
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const label = `Live GPS (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`;
      updateGPSDisplay(lat, lng, 'Live GPS Location');
      applyCoords(lat, lng, label);
      if (window.AppUtils) window.AppUtils.showToast('📍 GPS location acquired! Results recalculated.', 'success');
    },
    (err) => {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<svg class="w-4 h-4 text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><span>Detect My Location</span>`;
      }
      onGPSFailed(err.code === 1 ? 'denied' : 'timeout');
    },
    { timeout: 7000, maximumAge: 60000, enableHighAccuracy: true }
  );
}

/**
 * Called when GPS fails — auto-switches to Manual mode
 */
function onGPSFailed(reason) {
  const isDenied = reason === 'denied' || reason === 'unsupported';
  switchLocationMode('manual', { gpsDenied: isDenied });
  if (window.AppUtils) {
    window.AppUtils.showToast(
      isDenied
        ? '⚠️ GPS blocked by browser. Switched to Manual Area mode. Enter a landmark or pincode.'
        : '⚠️ GPS signal timed out. Switched to Manual Area mode.',
      'warning',
      5000
    );
  }
}

/**
 * Handle Apply button — resolve manual input to coordinates
 */
function applyManualLocation() {
  const input = document.getElementById('manual-location-input');
  if (!input || !input.value.trim()) {
    if (window.AppUtils) window.AppUtils.showToast('Please enter an area name or pincode.', 'error');
    input?.focus();
    return;
  }

  const match = lookupLocation(input.value);
  if (!match) {
    if (window.AppUtils) window.AppUtils.showToast(`"${input.value}" not found in the location database. Try: Lawspet, 605008, JIPMER, or Chennai.`, 'error', 5000);
    return;
  }

  showAccuracyBanner(match.label, match.lat, match.lng);
  applyCoords(match.lat, match.lng, match.label);
  hideSuggestions();
  if (window.AppUtils) window.AppUtils.showToast(`✏️ Search center set to: ${match.label}`, 'success');
}

/**
 * Autocomplete Suggestions
 */
function showSuggestions(query) {
  const list = document.getElementById('loc-suggestions');
  if (!list) return;

  const suggestions = getSuggestions(query);
  if (!suggestions.length) {
    hideSuggestions();
    return;
  }

  list.innerHTML = suggestions.map(s => `
    <li>
      <button
        type="button"
        class="w-full text-left px-4 py-3 text-sm hover:bg-rose-50 flex items-center gap-3 transition-colors min-h-[44px] font-medium text-slate-800"
        data-lat="${s.lat}" data-lng="${s.lng}" data-label="${s.label}">
        <svg class="w-4 h-4 text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
        </svg>
        <span>${s.label}</span>
      </button>
    </li>
  `).join('');

  // Attach click handlers
  list.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      const lat = parseFloat(btn.getAttribute('data-lat'));
      const lng = parseFloat(btn.getAttribute('data-lng'));
      const label = btn.getAttribute('data-label');
      const input = document.getElementById('manual-location-input');
      if (input) input.value = label;
      hideSuggestions();
      showAccuracyBanner(label, lat, lng);
      applyCoords(lat, lng, label);
      if (window.AppUtils) window.AppUtils.showToast(`✏️ Search center set to: ${label}`, 'success');
    });
  });

  list.classList.remove('hidden');
}

function hideSuggestions() {
  document.getElementById('loc-suggestions')?.classList.add('hidden');
}

/**
 * Setup all event listeners
 */
function setupHybridLocalization(onLocationChange) {
  window._rednova_onLocationChange = onLocationChange;

  // Tab switcher
  document.querySelectorAll('.loc-mode-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-loc-mode');
      switchLocationMode(mode);
      // When switching to GPS tab, use existing activeCoords (or default)
      if (mode === 'gps') {
        // Re-apply current known coords to refresh results
        onLocationChange(activeCoords);
      }
    });
  });

  // GPS detect button
  document.getElementById('btn-detect-location')?.addEventListener('click', detectGPS);

  // Manual input — autocomplete on type
  const manualInput = document.getElementById('manual-location-input');
  if (manualInput) {
    manualInput.addEventListener('input', () => showSuggestions(manualInput.value));
    manualInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); applyManualLocation(); }
      if (e.key === 'Escape') hideSuggestions();
    });
    // Close suggestions on outside click
    document.addEventListener('click', (e) => {
      if (!manualInput.contains(e.target)) hideSuggestions();
    });
  }

  // Apply manual location button
  document.getElementById('btn-apply-manual-location')?.addEventListener('click', applyManualLocation);
}

// Expose public API
const RedNovaLocation = {
  lookupLocation,
  resolveCoordinates: lookupLocation,
  getSuggestions,
  detectGPS,
  applyManualLocation,
  switchLocationMode,
  setupHybridLocalization,
  getActiveCoords: () => ({ ...activeCoords }),
  getMode: () => currentMode,
  DEFAULT_COORDS,
  LOOKUP_TABLE: LOCATION_LOOKUP_TABLE,
};

if (typeof window !== 'undefined') {
  window.RedNovaLocation = RedNovaLocation;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = RedNovaLocation;
}
