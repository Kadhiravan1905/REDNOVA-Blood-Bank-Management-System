/**
 * RedNova - Donor Profile & Live Inbox Logic (profile.js)
 * Includes: Rare Blood Guardian verification card, Emergency Standby toggle, and Priority SOS Inbox alerts
 */

let activeDonor = null;

/**
 * Initialize and load donor profile data
 */
function initDonorProfile() {
  activeDonor = window.DB.getCurrentDonor();

  // If no active session exists, check if there are seeded donors
  if (!activeDonor) {
    const session = window.DB.getSession();
    if (!session) {
      // Auto-assign default seeded donor (Kadhiravan S, donor_104) for seamless presentation
      const defaultDonor = window.DB.getDonorById('donor_104') || window.DB.getDonorById('donor_101') || window.DB.getDonors()[0];
      if (defaultDonor) {
        window.DB.setSession(defaultDonor.id);
        activeDonor = defaultDonor;
        console.log('[RedNova Profile] Initialized default demo donor session:', activeDonor.name);
      } else {
        window.location.href = 'login.html';
        return;
      }
    } else {
      activeDonor = window.DB.getDonorById(session.donorId);
      if (!activeDonor) {
        window.location.href = 'login.html';
        return;
      }
    }
  }

  renderDonorHeader(activeDonor);
  renderRareBloodGuardianCard(activeDonor);
  renderEligibilitySection(activeDonor);
  renderAvailabilityToggle(activeDonor);
  renderHealthDetails(activeDonor);
  renderDonorBadges(activeDonor);
  renderIncomingRequests(activeDonor.id);
}

/**
 * Render Header & Donor details
 */
function renderDonorHeader(donor) {
  const nameEl = document.getElementById('donor-name');
  const bloodTypeBadge = document.getElementById('donor-bloodtype-badge');
  const metaEl = document.getElementById('donor-meta');
  const switchAccountList = document.getElementById('switch-account-dropdown');

  const isRare = donor.isRareType || window.DB.isRarePhenotype(donor.bloodType);

  if (nameEl) {
    nameEl.className = 'profile-name text-2xl sm:text-3xl font-black font-heading flex items-center gap-2.5 flex-wrap';
    nameEl.innerHTML = `
      <span>${donor.name}</span>
      <span class="status-badge" id="eligibility-badge">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>Eligible & Ready for Donation</span>
      </span>
      ${isRare ? '<span class="px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-amber-200 text-amber-950 border border-amber-400 shadow-sm">🌟 Rare Guardian</span>' : ''}
    `;
  }

  if (bloodTypeBadge) {
    bloodTypeBadge.textContent = donor.bloodType;
    if (isRare) {
      bloodTypeBadge.className = 'blood-type-square w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-600 to-rose-700 text-white flex items-center justify-center font-heading font-black text-xl sm:text-2xl shadow-lg shadow-rose-950 flex-shrink-0 text-center p-1';
    } else {
      bloodTypeBadge.className = 'blood-type-square w-16 h-16 sm:w-20 sm:h-20 rounded-2xl text-white flex items-center justify-center font-heading font-black text-2xl sm:text-3xl shadow-lg shadow-rose-950 flex-shrink-0 text-center';
    }
  }

  if (metaEl) {
    metaEl.className = 'profile-details mt-1 flex items-center gap-2 flex-wrap';
    metaEl.innerHTML = `
      <span>📍 ${donor.locationName}</span> • <span>📞 ${donor.phone}</span>
    `;
  }

  // Populate quick switch account dropdown
  if (switchAccountList) {
    const allDonors = window.DB.getDonors();
    switchAccountList.innerHTML = allDonors.map(d => `
      <option value="${d.id}" ${d.id === donor.id ? 'selected' : ''}>
        ${d.isRareType ? '🌟 ' : ''}${d.name} (${d.bloodType}) — ${d.locationName}
      </option>
    `).join('');
  }
}

/**
 * Render Dedicated "Rare Blood Guardian" Card if isRareType === true
 */
function renderRareBloodGuardianCard(donor) {
  const container = document.getElementById('rare-guardian-card-container');
  if (!container) return;

  const isRare = donor.isRareType || window.DB.isRarePhenotype(donor.bloodType);

  if (!isRare) {
    container.innerHTML = '';
    container.classList.add('hidden');
    return;
  }

  container.classList.remove('hidden');
  container.innerHTML = `
    <div class="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 rounded-2xl p-5 sm:p-6 border border-amber-300 shadow-md relative overflow-hidden mb-8">
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 text-white flex items-center justify-center font-black text-2xl shadow-md flex-shrink-0">
            🛡️
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h2 class="text-lg font-black text-slate-900 font-heading">Rare Blood Guardian Verification</h2>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-200 text-amber-900 border border-amber-300 shadow-sm">
                Certified High-Priority Asset
              </span>
            </div>
            <p class="text-xs text-slate-700 mt-1">
              ${donor.rarePhenotypeNotes || 'Verified rare blood phenotype enrolled in the Regional Emergency Priority Network.'}
            </p>
            <div class="flex items-center gap-2 mt-2 text-[11px] text-amber-900 font-bold">
              <span>📡 Regional Broadcast Radius: <strong>250km</strong></span>
              <span>•</span>
              <span>🚨 Standby SOS Alerts: <strong>Enabled</strong></span>
            </div>
          </div>
        </div>

        <!-- Emergency Standby Toggle Switch -->
        <div class="p-3 bg-white/90 rounded-xl border border-amber-200 shadow-sm flex items-center justify-between gap-4 min-w-[220px]">
          <div>
            <span class="block text-[10px] uppercase font-black text-amber-900 tracking-wider">Emergency Standby</span>
            <span id="standby-status-label" class="text-xs font-black text-rose-700 block">
              ${donor.emergencyStandby ? 'ACTIVE (STANDBY)' : 'PAUSED'}
            </span>
          </div>

          <label class="relative inline-flex items-center justify-center cursor-pointer flex-shrink-0 min-h-[44px] min-w-[44px]">
            <input type="checkbox" id="standby-toggle" ${donor.emergencyStandby ? 'checked' : ''} class="sr-only peer">
            <div class="w-12 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[11px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 shadow-inner"></div>
          </label>
        </div>
      </div>
    </div>
  `;

  // Attach listener to Emergency Standby toggle
  const standbyToggle = document.getElementById('standby-toggle');
  if (standbyToggle) {
    standbyToggle.onchange = (e) => {
      const isStandby = e.target.checked;
      const updated = window.DB.toggleEmergencyStandby(donor.id, isStandby);
      if (updated) {
        activeDonor = updated;
        window.AppUtils.showToast(
          `Emergency Standby Status: ${isStandby ? 'ACTIVE (Ready for regional SOS alerts)' : 'PAUSED'}`,
          isStandby ? 'warning' : 'info'
        );
        renderRareBloodGuardianCard(updated);
      }
    };
  }
}

/**
 * Render 90-Day Eligibility badge and metrics
 */
function renderEligibilitySection(donor) {
  const eligibility = window.DB.getEligibilityDetails(donor);
  const badgeEl = document.getElementById('eligibility-badge');
  const daysSinceEl = document.getElementById('val-days-since');
  const lastDateEl = document.getElementById('val-last-date');
  const ruleStatusEl = document.getElementById('val-rule-status');

  if (badgeEl) {
    if (eligibility.eligible) {
      badgeEl.className = 'status-badge inline-flex items-center gap-1.5 shadow-sm';
      badgeEl.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>Eligible & Ready for Donation</span>
      `;
    } else {
      badgeEl.className = 'px-3 py-1 rounded-full text-xs font-bold bg-rose-950/80 text-rose-300 border border-rose-500/40 inline-flex items-center gap-1.5 shadow-sm';
      badgeEl.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-rose-500"></span>
        <span>${eligibility.reason}</span>
      `;
    }
  }

  if (daysSinceEl) daysSinceEl.textContent = `${eligibility.daysSince} days`;
  if (lastDateEl) lastDateEl.textContent = donor.lastDonationDate || 'Not recorded';
  if (ruleStatusEl) {
    ruleStatusEl.innerHTML = eligibility.isDateEligible 
      ? '<span class="text-emerald-800 font-bold">✓ Interval Met (≥ 90 Days)</span>'
      : `<span class="text-amber-800 font-bold">⏳ Cool-off (${eligibility.daysRemaining} days left)</span>`;
  }
}

/**
 * Render availability toggle switch and attach listener
 */
function renderAvailabilityToggle(donor) {
  const toggle = document.getElementById('availability-toggle');
  const statusLabel = document.getElementById('availability-status-label');
  const statusDesc = document.getElementById('availability-status-desc');

  if (!toggle) return;

  toggle.checked = Boolean(donor.available);

  if (statusLabel && statusDesc) {
    if (donor.available) {
      statusLabel.textContent = 'AVAILABLE (ONLINE)';
      statusLabel.className = 'text-xs font-black text-emerald-700 tracking-wide block';
      statusDesc.textContent = 'You appear in search results for emergency requests.';
    } else {
      statusLabel.textContent = 'OFFLINE (UNAVAILABLE)';
      statusLabel.className = 'text-xs font-black text-slate-500 tracking-wide block';
      statusDesc.textContent = 'Hidden from emergency search queries.';
    }
  }

  toggle.onchange = (e) => {
    const isChecked = e.target.checked;
    const updated = window.DB.toggleDonorAvailability(donor.id, isChecked);
    if (updated) {
      activeDonor = updated;
      window.AppUtils.showToast(
        `Availability updated: ${isChecked ? 'ONLINE (Ready to donate)' : 'OFFLINE (Temporarily paused)'}`,
        isChecked ? 'success' : 'info'
      );
      renderEligibilitySection(updated);
      renderAvailabilityToggle(updated);
    }
  };
}

/**
 * Render incoming requests for active donor
 */
function renderIncomingRequests(donorId) {
  const listContainer = document.getElementById('requests-list');
  const emptyState = document.getElementById('requests-empty');
  const countBadge = document.getElementById('requests-count-badge');

  if (!listContainer || !emptyState || !countBadge) return;

  const requests = window.DB.getRequestsForDonor(donorId);
  countBadge.textContent = requests.length;

  if (requests.length === 0) {
    listContainer.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  listContainer.innerHTML = requests.map((req, index) => {
    const isNewest = index === 0;
    const isSOS = Boolean(req.isRareSOS);

    const urgencyBadges = {
      Critical: 'bg-rose-100 text-rose-800 border-rose-300 pulse-urgent font-black',
      Urgent: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
      Standard: 'bg-slate-100 text-slate-800 border-slate-300 font-medium'
    };

    const statusBadges = {
      pending: '<span class="inline-flex items-center gap-1 text-amber-800 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">⏳ Pending Your Response</span>',
      accepted: '<span class="inline-flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">✓ Accepted by You</span>',
      declined: '<span class="inline-flex items-center gap-1 text-slate-600 font-medium bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">✕ Declined</span>'
    };

    const timeAgo = formatTimeAgo(req.createdAt);

    return `
      <div class="bg-white rounded-2xl p-5 sm:p-6 border ${isSOS ? 'border-amber-400 bg-gradient-to-r from-amber-50/40 via-white to-rose-50/30 ring-1 ring-amber-300' : 'border-slate-200'} shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden ${isNewest ? 'ring-1 ring-rose-300/60' : ''}">
        ${isNewest ? '<div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500"></div>' : ''}
        
        <div class="space-y-2 flex-1">
          <!-- Urgency & Requester Info -->
          <div class="flex items-center gap-2.5 flex-wrap">
            ${isSOS ? `
              <span class="px-2.5 py-1 rounded-lg text-xs bg-amber-400 text-amber-950 font-black border border-amber-500 shadow-sm animate-pulse flex items-center gap-1">
                <span>🚨 RARE PRIORITY SOS</span>
              </span>
            ` : ''}
            <span class="px-2.5 py-1 rounded-lg text-xs border ${urgencyBadges[req.urgency] || urgencyBadges.Standard}">
              ${req.urgency === 'Critical' ? '🚨 ' : req.urgency === 'Urgent' ? '⚡ ' : '📅 '}${req.urgency.toUpperCase()}
            </span>
            <h3 class="font-black text-slate-900 text-base">${req.requesterName}</h3>
            <span class="text-xs text-slate-500 font-medium">• ${timeAgo}</span>
          </div>

          <!-- Medical Facility & Phone -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 pt-1">
            <div class="flex items-center gap-1.5">
              <span class="text-slate-500 font-medium">Hospital:</span>
              <strong class="text-slate-900">${req.hospital || 'General Hospital'}</strong>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-slate-500 font-medium">Phone:</span>
              <a href="tel:${req.requesterPhone}" class="font-mono font-bold text-rose-700 hover:underline bg-rose-50 px-2 py-0.5 rounded border border-rose-100 min-h-[30px] inline-flex items-center">
                📞 ${req.requesterPhone}
              </a>
            </div>
          </div>

          <!-- Message / Note -->
          ${req.message ? `
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 italic leading-relaxed">
              "${req.message}"
            </div>
          ` : ''}

          <!-- Status Indicator -->
          <div class="text-xs pt-1">
            ${statusBadges[req.status] || req.status}
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex sm:flex-col items-center gap-2 w-full md:w-44 flex-shrink-0">
          ${req.status === 'pending' ? `
            <button 
              type="button"
              onclick="handleRequestAction('${req.id}', 'accepted')" 
              class="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-100 transition-all flex items-center justify-center gap-1.5 active:scale-95 min-h-[44px]">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              <span>Accept Request</span>
            </button>
            <button 
              type="button"
              onclick="handleRequestAction('${req.id}', 'declined')" 
              class="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center justify-center gap-1 min-h-[44px]">
              <span>Decline</span>
            </button>
          ` : `
            <a 
              href="tel:${req.requesterPhone}" 
              class="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-2 text-center active:scale-95 min-h-[44px]">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
              <span>Call Requester</span>
            </a>
          `}
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Handle Request Status Updates (Accept / Decline)
 */
window.handleRequestAction = function(requestId, status) {
  const updated = window.DB.updateRequestStatus(requestId, status);
  if (updated && activeDonor) {
    window.AppUtils.showToast(
      status === 'accepted' ? '✓ Request accepted! You can now call the requester.' : 'Request marked as declined.',
      status === 'accepted' ? 'success' : 'info'
    );
    renderIncomingRequests(activeDonor.id);
  }
};

/**
 * Helper: Format time ago string
 */
function formatTimeAgo(isoString) {
  if (!isoString) return 'Just now';
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin} min${diffMin > 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hr${diffHour > 1 ? 's' : ''} ago`;
  return new Date(isoString).toLocaleDateString();
}

/**
 * Setup Real-time Cross-Tab Storage Listener
 */
function setupCrossTabSyncListener() {
  window.addEventListener('storage', (event) => {
    console.log('[RedNova Realtime Sync] Storage event detected from another tab:', event.key);

    if (event.key === window.DB.KEYS.REQUESTS) {
      if (activeDonor) {
        renderIncomingRequests(activeDonor.id);
        window.AppUtils.showToast('🚨 New incoming contact request received in real time!', 'warning', 5000);
      }
    } else if (event.key === window.DB.KEYS.DONORS) {
      if (activeDonor) {
        const freshDonor = window.DB.getDonorById(activeDonor.id);
        if (freshDonor) {
          activeDonor = freshDonor;
          renderDonorHeader(freshDonor);
          renderRareBloodGuardianCard(freshDonor);
          renderEligibilitySection(freshDonor);
          renderAvailabilityToggle(freshDonor);
        }
      }
    } else if (event.key === window.DB.KEYS.SESSION) {
      initDonorProfile();
    }
  });

  window.addEventListener('rednova_storage_update', (event) => {
    if (activeDonor && event.detail.key === window.DB.KEYS.REQUESTS) {
      renderIncomingRequests(activeDonor.id);
    }
  });
}

/**
 * Setup Logout & Switch Account Controls
 */
function setupSessionControls() {
  const logoutBtn = document.getElementById('btn-profile-logout');
  const switchDropdown = document.getElementById('switch-account-dropdown');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      window.DB.clearSession();
      window.AppUtils.showToast('Logged out of donor session.', 'info');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 400);
    });
  }

  if (switchDropdown) {
    switchDropdown.addEventListener('change', (e) => {
      const selectedId = e.target.value;
      if (selectedId) {
        window.DB.setSession(selectedId);
        window.AppUtils.showToast('Switched donor account.', 'success');
        initDonorProfile();
      }
    });
  }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initDonorProfile();
  setupCrossTabSyncListener();
  setupSessionControls();
});

// ─── Health Details Card ─────────────────────────────────────────────────────

function renderHealthDetails(donor) {
  const body = document.getElementById('health-details-body');
  if (!body) return;

  const pill = (val, yesLabel = 'Yes', noLabel = 'No') =>
    val === true
      ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-950/80 text-rose-300 border border-rose-500/40">${yesLabel}</span>`
      : val === false
        ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">${noLabel}</span>`
        : `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/60 text-slate-400 border border-slate-700">Not set</span>`;

  const metric = (icon, label, valueHtml) => `
    <div class="health-box flex flex-col gap-1">
      <span class="text-[10px] font-bold uppercase tracking-wider text-slate-300">${icon} ${label}</span>
      <div class="mt-0.5 font-bold">${valueHtml}</div>
    </div>`;

  const hasSomeHealthData = donor.age != null || donor.weight != null ||
    typeof donor.isSmoker === 'boolean' ||
    typeof donor.isAlcoholic === 'boolean' ||
    typeof donor.isOnMedication === 'boolean';

  if (!hasSomeHealthData) {
    body.innerHTML = `
      <div class="col-span-2 sm:col-span-3 lg:col-span-5 text-center py-6 text-slate-300 text-xs">
        <span class="text-2xl block mb-1">📋</span>
        Health details not filled yet. 
        <a href="register.html" class="text-rose-400 font-bold hover:underline">Update profile →</a>
      </div>`;
    return;
  }

  const ageVal = donor.age != null
    ? `<span class="text-sm font-black text-white">${donor.age} yrs</span>`
    : `<span class="text-[10px] text-slate-400">Not set</span>`;

  const weightVal = donor.weight != null
    ? `<span class="text-sm font-black text-white">${donor.weight} kg${donor.weight >= 65 ? ' <span class="text-emerald-400">✓</span>' : ''}</span>`
    : `<span class="text-[10px] text-slate-400">Not set</span>`;

  // Restricted-mode banner
  const isRestricted = donor.eligibleForEmergency === false;
  const restrictedBanner = isRestricted ? `
    <div class="col-span-2 sm:col-span-3 lg:col-span-5 flex items-start gap-2.5 p-3 bg-amber-950/80 border border-amber-500/40 rounded-xl text-xs text-amber-200 font-semibold mb-1">
      <span class="text-base flex-shrink-0">⚠️</span>
      <span><strong>Restricted Mode Active:</strong> Your profile is currently ineligible for emergency SOS broadcasts due to smoking or alcohol use. 
      <a href="register.html" class="underline font-black hover:text-amber-300 ml-1">Update health details →</a></span>
    </div>` : '';

  body.innerHTML = restrictedBanner +
    metric('🎂', 'Age', ageVal) +
    metric('⚖️', 'Weight', weightVal) +
    metric('🚬', 'Smoker', pill(donor.isSmoker, 'Smoker', 'Non-Smoker')) +
    metric('🍺', 'Alcoholic', pill(donor.isAlcoholic, 'Yes', 'No')) +
    metric('💊', 'On Medication', pill(donor.isOnMedication, 'Yes', 'No'));
}

// ─── Gamified Badges Grid ────────────────────────────────────────────────────

function renderDonorBadges(donor) {
  const grid = document.getElementById('badges-grid');
  const countBadge = document.getElementById('badges-unlock-count');
  if (!grid) return;

  const badges = window.DB.getDonorBadges(donor);
  const unlockedCount = badges.filter(b => b.unlocked).length;

  if (countBadge) {
    countBadge.textContent = `${unlockedCount} / ${badges.length} Unlocked`;
    countBadge.className = 'badge-counter';
  }

  grid.innerHTML = badges.map(badge => {
    let customClass = '';
    if (badge.id === 'first_drop') customClass = 'badge-first-drop';
    else if (badge.id === 'reliable_donor') customClass = 'badge-reliable';
    else if (badge.id === 'guardian_pledge') customClass = 'badge-guardian';
    else if (badge.id === 'healthy_donor') customClass = 'badge-healthy';
    else if (badge.id === 'prime_age') customClass = 'badge-prime';
    else if (badge.id === 'iron_will') customClass = 'badge-iron';
    else if (badge.id === 'veteran_donor') customClass = 'badge-veteran';
    else if (badge.id === 'champion_donor') customClass = 'badge-champion';

    if (badge.unlocked) {
      return `
        <div class="badge-card ${customClass || badge.color} flex flex-col items-center gap-1.5 p-3 rounded-2xl shadow-sm cursor-default select-none transition-all" title="${badge.hint}">
          <span class="text-2xl leading-none">${badge.emoji}</span>
          <h4 class="text-[11px] font-black text-center leading-tight">${badge.emoji} ${badge.label}</h4>
          <p class="text-[10px] text-center leading-tight opacity-80 px-1">${badge.hint}</p>
        </div>`;
    } else {
      return `
        <div class="badge-card badge-locked flex flex-col items-center gap-1.5 p-3 rounded-2xl cursor-default select-none grayscale opacity-60 transition-all" title="${badge.hint}">
          <span class="text-2xl leading-none grayscale">${badge.emoji}</span>
          <h4 class="text-[11px] font-black text-center leading-tight">🔒 ${badge.label}</h4>
          <p class="text-[10px] text-center leading-tight opacity-70 px-1">Unlock: ${badge.hint}</p>
        </div>`;
    }
  }).join('');
}
