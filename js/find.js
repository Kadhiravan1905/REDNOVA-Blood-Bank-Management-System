/**
 * RedNova — Find Donors Page Controller (find.js)
 *
 * Drives:
 *  - Hybrid Localization (GPS ↔ Manual area/pincode) via RedNovaLocation
 *  - Blood type & Rare SOS filters
 *  - Haversine proximity sorting
 *  - Donor card rendering
 *  - Request Contact modal (standard + Rare SOS broadcast)
 */

let currentSelectedBloodType = 'ALL';
let isRareSOSModeActive = false;

// ─── Donor Results ─────────────────────────────────────────────────────────

/**
 * Recalculate proximity and render donor cards relative to the active
 * search center (GPS or manual). Called on any filter or location change.
 */
function refreshDonorResults() {
  const grid = document.getElementById('donors-grid');
  const emptyState = document.getElementById('empty-state');
  const countBadge = document.getElementById('results-count');
  if (!grid || !emptyState || !countBadge) return;

  // Get current active coordinates from the Hybrid Localization engine
  const center = window.RedNovaLocation
    ? window.RedNovaLocation.getActiveCoords()
    : { lat: 11.9401, lng: 79.8341 };

  let donorsList = isRareSOSModeActive
    ? window.DB.getRareDonors(currentSelectedBloodType)
    : window.DB.getEligibleDonors(currentSelectedBloodType);

  // Compute Haversine distance from active center for each donor
  const donorsWithDistance = donorsList.map(donor => {
    const dist = window.AppUtils.calculateHaversineDistance(
      center.lat, center.lng, donor.lat, donor.lng
    );
    return { ...donor, distanceKm: dist !== null ? dist : 999 };
  });

  // Sort nearest → farthest
  donorsWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);

  // Filter by Top-Nav text search query if entered
  const navSearchInput = document.getElementById('top-nav-donor-search');
  const searchQuery = navSearchInput ? navSearchInput.value.trim().toLowerCase() : '';
  if (searchQuery) {
    donorsWithDistance = donorsWithDistance.filter(d => 
      (d.name && d.name.toLowerCase().includes(searchQuery)) ||
      (d.bloodType && d.bloodType.toLowerCase().includes(searchQuery)) ||
      (d.locationName && d.locationName.toLowerCase().includes(searchQuery))
    );
  }

  countBadge.textContent = donorsWithDistance.length;

  if (donorsWithDistance.length === 0) {
    grid.innerHTML = '';
    emptyState.classList.remove('hidden');
    const title = document.getElementById('empty-state-title');
    const desc = document.getElementById('empty-state-desc');
    if (isRareSOSModeActive) {
      if (title) title.textContent = `No Available Donors for "${currentSelectedBloodType}" in Registry`;
      if (desc) desc.textContent = 'No verified rare phenotype donors of this type are currently marked available in the regional database.';
    } else {
      if (title) title.textContent = 'No Eligible Donors Found';
      if (desc) desc.textContent = 'There are currently no available donors matching this blood type who meet the mandatory 90-day medical interval.';
    }
    return;
  }

  emptyState.classList.add('hidden');

  grid.innerHTML = donorsWithDistance.map(donor => {
    const isNearby = donor.distanceKm <= 10.0;
    const isRareHero = donor.isRareType || window.DB.isRarePhenotype(donor.bloodType);

    return `
      <div class="donor-card rounded-2xl p-5 sm:p-6 border ${isRareHero ? 'border-amber-400/80 ring-1 ring-amber-400/40 shadow-amber-950/40 shadow-lg' : 'border-rose-500/30'} transition-all flex flex-col justify-between group">
        <div>
          <!-- Name, badges, blood type -->
          <div class="flex items-start justify-between gap-3 mb-3">
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="donor-name text-base sm:text-lg leading-tight transition-colors">
                  ${donor.name}
                </h3>
                ${isRareHero
                  ? `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/40">🌟 Rare Phenotype Hero</span>`
                  : isNearby
                    ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">Nearby (&lt;10km)</span>`
                    : ''
                }
              </div>
              <div class="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                <svg class="w-3.5 h-3.5 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                </svg>
                <span>${donor.locationName}</span>
              </div>
            </div>
            <span class="inline-flex items-center justify-center px-3.5 py-1.5 rounded-xl font-black text-sm ${isRareHero ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md' : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'} flex-shrink-0 text-center p-1">
              ${donor.bloodType}
            </span>
          </div>

          <!-- Rare phenotype note -->
          ${donor.rarePhenotypeNotes ? `
            <div class="mb-3 p-2.5 bg-amber-950/60 border border-amber-400/40 rounded-xl text-[11px] text-amber-200 font-medium leading-relaxed">
              <strong>🔬 Rare Profile:</strong> ${donor.rarePhenotypeNotes}
            </div>
          ` : ''}

          <!-- Distance & interval metrics -->
          <div class="grid grid-cols-2 gap-2 my-3 p-3 inner-stat-box rounded-xl text-xs">
            <div>
              <span class="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Proximity</span>
              <span class="font-black text-white text-sm mt-0.5 block">📍 ${donor.distanceKm} km</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Interval</span>
              <span class="font-bold text-emerald-400 text-xs mt-0.5 block">✓ ${donor.eligibility.daysSince} days ago</span>
            </div>
          </div>

          <!-- Masked phone -->
          <div class="flex items-center justify-between text-xs py-2 px-1 border-t border-rose-500/20">
            <span class="text-slate-300 font-bold">Donor Phone:</span>
            <span class="font-mono font-bold text-slate-200 bg-black/40 px-2 py-0.5 rounded-md border border-rose-500/20">${donor.maskedPhone}</span>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2">
          <button
            type="button"
            onclick="openRequestContactModal('${donor.id}', ${isRareHero})"
            class="flex-1 w-full py-3 px-3 rounded-xl ${isRareHero ? 'bg-gradient-to-r from-rose-700 via-rose-600 to-amber-600 hover:from-rose-800 hover:to-amber-700' : 'bg-rose-600 hover:bg-rose-700'} text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-200 active:scale-[0.98] transition-all min-h-[44px]">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            <span>${isRareHero ? '🚨 Broadcast SOS' : 'Request Contact'}</span>
          </button>

          <!-- SMS Fallback -->
          <button
            type="button"
            onclick="openSmsModal('${donor.name}', '${donor.bloodType}', 'IGGGH Puducherry', '${donor.phone}', '${donor.id.replace('donor_', '')}')"
            class="w-full sm:w-auto py-3 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 flex items-center justify-center gap-1.5 transition-all min-h-[44px] active:scale-[0.98]"
            title="Generate 160-char SMS payload for offline/2G dispatch">
            <svg class="w-4 h-4 text-slate-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            <span>SMS Fallback</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// ─── Rare SOS Mode ─────────────────────────────────────────────────────────

function setupRareSOSModeToggle() {
  const sosToggle = document.getElementById('rare-sos-toggle');
  const sosBanner = document.getElementById('rare-sos-banner');
  const standardFilters = document.getElementById('standard-blood-filters');
  const rareFilters = document.getElementById('rare-blood-filters');
  const searchHeaderTitle = document.getElementById('search-header-title');

  if (!sosToggle) return;

  sosToggle.addEventListener('change', (e) => {
    isRareSOSModeActive = e.target.checked;

    if (isRareSOSModeActive) {
      sosBanner?.classList.remove('hidden');
      standardFilters?.classList.add('hidden');
      rareFilters?.classList.remove('hidden');
      if (searchHeaderTitle) searchHeaderTitle.innerHTML = '🚨 <span class="text-rose-700">Rare Blood Registry</span> & Priority SOS Channel';
      currentSelectedBloodType = 'Bombay (hh)';
      updateFilterButtonVisuals('Bombay (hh)');
      window.AppUtils.showToast('🚨 Rare Blood Emergency SOS Mode activated! 250km regional radius.', 'warning', 5000);
    } else {
      sosBanner?.classList.add('hidden');
      standardFilters?.classList.remove('hidden');
      rareFilters?.classList.add('hidden');
      if (searchHeaderTitle) searchHeaderTitle.innerHTML = 'Find Eligible Blood Donors';
      currentSelectedBloodType = 'ALL';
      updateFilterButtonVisuals('ALL');
      window.AppUtils.showToast('Switched back to standard blood donor search.', 'info');
    }

    refreshDonorResults();
  });
}

// ─── Blood Type Filters ────────────────────────────────────────────────────

function updateFilterButtonVisuals(selectedType) {
  document.querySelectorAll('.blood-filter-btn, .blood-type-btn').forEach(btn => {
    const isSelected = btn.getAttribute('data-type') === selectedType;
    btn.className = isSelected
      ? 'blood-type-btn blood-filter-btn active nav-active px-4 py-2.5 rounded-xl font-bold text-xs min-h-[44px]'
      : 'blood-type-btn blood-filter-btn nav-active px-4 py-2.5 rounded-xl font-bold text-xs min-h-[44px]';
  });
  const dropdown = document.getElementById('bloodtype-select-dropdown');
  if (dropdown) dropdown.value = selectedType;
}

function setupBloodTypeFilters() {
  document.querySelectorAll('.blood-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentSelectedBloodType = btn.getAttribute('data-type') || 'ALL';
      updateFilterButtonVisuals(currentSelectedBloodType);
      refreshDonorResults();
    });
  });

  document.getElementById('bloodtype-select-dropdown')?.addEventListener('change', (e) => {
    currentSelectedBloodType = e.target.value;
    updateFilterButtonVisuals(currentSelectedBloodType);
    refreshDonorResults();
  });
}

// ─── Contact Request Modal ─────────────────────────────────────────────────

window.openRequestContactModal = function(donorId, isRareHero = false) {
  const donor = window.DB.getDonorById(donorId);
  if (!donor) return;

  const modal = document.getElementById('request-modal');
  document.getElementById('modal-donor-id').value = donor.id;
  document.getElementById('modal-is-rare-sos').value = isRareHero ? 'true' : 'false';

  const title = document.getElementById('modal-header-title');
  if (title) title.textContent = isRareHero ? '🚨 Broadcast Regional Priority SOS' : 'Request Contact Initiation';

  const urgency = document.getElementById('req-modal-urgency');
  if (urgency && isRareHero) urgency.value = 'Critical';

  const banner = document.getElementById('modal-donor-banner');
  if (banner) {
    banner.innerHTML = `
      <div class="donor-card-mini selected-donor-info flex items-center gap-3 p-3.5 rounded-xl border">
        <div class="w-11 h-11 rounded-xl ${isRareHero ? 'bg-amber-600' : 'bg-rose-600'} text-white font-black text-xs flex items-center justify-center font-heading text-center p-1 shadow-sm">
          ${donor.bloodType}
        </div>
        <div class="flex-1">
          <div class="font-bold text-white text-sm flex items-center gap-2">
            <span class="text-white font-bold">${donor.name}</span>
            ${isRareHero ? '<span class="px-2 py-0.5 bg-amber-500 text-white font-bold text-[10px] rounded shadow-sm">Rare Hero</span>' : ''}
          </div>
          <div class="text-xs text-slate-300 font-medium">${donor.locationName} • ${donor.maskedPhone}</div>
          ${donor.rarePhenotypeNotes ? `<div class="text-[11px] text-amber-300 mt-1 font-medium italic">${donor.rarePhenotypeNotes}</div>` : ''}
        </div>
      </div>`;
  }

  if (modal) { modal.classList.remove('hidden'); document.body.style.overflow = 'hidden'; }
};

function setupModalCloseHandlers() {
  const modal = document.getElementById('request-modal');
  const close = () => { modal?.classList.add('hidden'); document.body.style.overflow = ''; };
  document.getElementById('modal-close-btn')?.addEventListener('click', close);
  document.getElementById('modal-cancel-btn')?.addEventListener('click', close);
  modal?.addEventListener('click', (e) => { if (e.target === modal) close(); });
}

function setupContactRequestForm() {
  const form = document.getElementById('contact-request-form');
  const modal = document.getElementById('request-modal');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const donorId = document.getElementById('modal-donor-id').value;
    const isRareSOS = document.getElementById('modal-is-rare-sos')?.value === 'true';
    const requesterName = document.getElementById('req-modal-name').value.trim();
    const requesterPhone = document.getElementById('req-modal-phone').value.trim();
    const urgency = document.getElementById('req-modal-urgency').value;
    const hospital = document.getElementById('req-modal-hospital')?.value.trim() || 'Hospital';
    const message = document.getElementById('req-modal-message')?.value.trim() || '';

    if (!donorId || !requesterName || !requesterPhone || !urgency) {
      window.AppUtils.showToast('Please fill out all required fields.', 'error');
      return;
    }

    window.DB.createRequest({
      donorId, requesterName, requesterPhone, urgency, hospital,
      isRareSOS, broadcastRadiusKm: isRareSOS ? 250 : 25, message, status: 'pending'
    });

    modal?.classList.add('hidden');
    document.body.style.overflow = '';
    form.reset();

    window.AppUtils.showToast(
      isRareSOS
        ? '🚨 Regional Priority SOS broadcast dispatched! (250km radius)'
        : `✓ Request sent to donor — Urgency: ${urgency.toUpperCase()}`,
      isRareSOS ? 'warning' : 'success', 5000
    );
  });
}

// ─── Init ─────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Wire hybrid localization — any location change triggers a fresh search
  if (window.RedNovaLocation) {
    window.RedNovaLocation.setupHybridLocalization(({ lat, lng, label }) => {
      refreshDonorResults();
    });
  }

  setupRareSOSModeToggle();
  setupBloodTypeFilters();
  setupModalCloseHandlers();
  setupContactRequestForm();

  const topNavSearch = document.getElementById('top-nav-donor-search');
  if (topNavSearch) {
    const urlParams = new URLSearchParams(window.location.search);
    const qParam = urlParams.get('q');
    if (qParam) {
      topNavSearch.value = qParam;
    }
    topNavSearch.addEventListener('input', refreshDonorResults);
  }

  refreshDonorResults();

  window.addEventListener('rednova_storage_update', refreshDonorResults);
  window.addEventListener('storage', refreshDonorResults);
});
