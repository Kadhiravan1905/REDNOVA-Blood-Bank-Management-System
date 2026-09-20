/**
 * RedNova - Central DB Utility Module (localStorage Management)
 * Manages collections: rednova_donors, rednova_requests, rednova_session
 * Includes: Rare Blood Registry & Priority SOS Channel support (Bombay hh, Rh-null, D--, AB- Rare)
 */

const STORAGE_KEYS = {
  DONORS: 'rednova_donors',
  REQUESTS: 'rednova_requests',
  SESSION: 'rednova_session'
};

const RARE_PHENOTYPES = ['BOMBAY (HH)', 'RH-NULL', 'D--', 'AB- (RARE)', 'BOMBAY', 'RHNULL'];

const DB = {
  KEYS: STORAGE_KEYS,
  RARE_PHENOTYPES,

  // Helper: Get item from localStorage
  _get(key, defaultValue = []) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error(`Error reading ${key} from localStorage:`, e);
      return defaultValue;
    }
  },

  // Helper: Set item in localStorage
  _set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      // Manually trigger storage event for current window
      window.dispatchEvent(new CustomEvent('rednova_storage_update', { detail: { key, value } }));
      return true;
    } catch (e) {
      console.error(`Error saving ${key} to localStorage:`, e);
      return false;
    }
  },

  // Mask phone number: e.g. "9876543210" -> "+91 98******10"
  maskPhoneNumber(phone) {
    if (!phone) return '+91 **********';
    const clean = phone.toString().trim().replace(/[^0-9]/g, '');
    if (clean.length < 6) return `+91 ${clean}`;
    const start = clean.slice(0, 2);
    const end = clean.slice(-2);
    const maskLen = clean.length - 4;
    return `+91 ${start}${'*'.repeat(maskLen)}${end}`;
  },

  // Calculate days passed since date string (YYYY-MM-DD)
  daysSince(dateStr) {
    if (!dateStr) return 9999;
    const target = new Date(dateStr);
    const today = new Date();
    const diffTime = today.getTime() - target.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  },

  // Check 90-day eligibility and availability
  isDonorEligible(donor) {
    if (!donor) return false;
    if (donor.available !== true) return false;
    const days = this.daysSince(donor.lastDonationDate);
    return days >= 90;
  },

  // Get eligibility details
  getEligibilityDetails(donor) {
    if (!donor) {
      return { eligible: false, daysSince: 0, daysRemaining: 90, reason: 'Invalid donor record' };
    }
    const daysSince = this.daysSince(donor.lastDonationDate);
    const daysRemaining = Math.max(0, 90 - daysSince);
    const isDateEligible = daysSince >= 90;
    const isAvailable = donor.available === true;
    
    let reason = 'Eligible to donate';
    if (!isAvailable) {
      reason = 'Donor is currently marked as unavailable / offline';
    } else if (!isDateEligible) {
      reason = `In cool-off period (${daysRemaining} days remaining for 90-day gap)`;
    }

    return {
      eligible: isAvailable && isDateEligible,
      isAvailable,
      isDateEligible,
      daysSince,
      daysRemaining,
      reason
    };
  },

  // ==========================================
  // DONOR CRUD & QUERIES
  // ==========================================

  getDonors() {
    return this._get(STORAGE_KEYS.DONORS, []);
  },

  saveDonors(donors) {
    return this._set(STORAGE_KEYS.DONORS, donors);
  },

  getDonorById(id) {
    const donors = this.getDonors();
    return donors.find(d => d.id === id) || null;
  },

  getDonorByPhone(phone) {
    const donors = this.getDonors();
    const cleanPhone = (phone || '').toString().trim().replace(/[^0-9]/g, '');
    return donors.find(d => {
      const dPhone = (d.phone || '').toString().trim().replace(/[^0-9]/g, '');
      return dPhone === cleanPhone || (dPhone.length >= 10 && cleanPhone.length >= 10 && dPhone.slice(-10) === cleanPhone.slice(-10));
    }) || null;
  },

  addDonor(donorData) {
    const donors = this.getDonors();
    const isRare = Boolean(donorData.isRareType) || this.isRarePhenotype(donorData.bloodType);

    const newDonor = {
      id: donorData.id || `donor_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: donorData.name?.trim() || 'Anonymous Donor',
      phone: donorData.phone?.trim() || '',
      bloodType: (donorData.bloodType || 'O+').trim(),
      isRareType: isRare,
      rarePhenotypeNotes: donorData.rarePhenotypeNotes?.trim() || (isRare ? 'Registered Rare Phenotype Donor' : ''),
      emergencyStandby: donorData.emergencyStandby !== undefined ? Boolean(donorData.emergencyStandby) : isRare,
      locationName: donorData.locationName?.trim() || 'Puducherry',
      lat: typeof donorData.lat === 'number' ? donorData.lat : 11.9401,
      lng: typeof donorData.lng === 'number' ? donorData.lng : 79.8341,
      lastDonationDate: donorData.lastDonationDate || new Date().toISOString().split('T')[0],
      available: donorData.available !== undefined ? Boolean(donorData.available) : true,
      createdAt: donorData.createdAt || new Date().toISOString()
    };
    donors.push(newDonor);
    this.saveDonors(donors);
    return newDonor;
  },

  updateDonor(id, updates) {
    const donors = this.getDonors();
    const index = donors.findIndex(d => d.id === id);
    if (index === -1) return null;

    const isRare = updates.isRareType !== undefined ? Boolean(updates.isRareType) : donors[index].isRareType;

    donors[index] = {
      ...donors[index],
      ...updates,
      isRareType: isRare,
      id // preserve ID
    };
    this.saveDonors(donors);
    return donors[index];
  },

  toggleDonorAvailability(id, isAvailable) {
    const donor = this.getDonorById(id);
    if (!donor) return null;
    const newStatus = isAvailable !== undefined ? Boolean(isAvailable) : !donor.available;
    return this.updateDonor(id, { available: newStatus });
  },

  toggleEmergencyStandby(id, standbyStatus) {
    const donor = this.getDonorById(id);
    if (!donor) return null;
    const newStatus = standbyStatus !== undefined ? Boolean(standbyStatus) : !donor.emergencyStandby;
    return this.updateDonor(id, { emergencyStandby: newStatus });
  },

  deleteDonor(id) {
    const donors = this.getDonors();
    const filtered = donors.filter(d => d.id !== id);
    this.saveDonors(filtered);
    return filtered.length !== donors.length;
  },

  isRarePhenotype(type) {
    if (!type) return false;
    const upper = type.toUpperCase().trim();
    return upper.includes('BOMBAY') || upper.includes('RH-NULL') || upper.includes('RHNULL') || upper === 'D--' || upper.includes('(RARE)');
  },

  /**
   * Get eligible donors filtered by blood type
   * Automatically enforces:
   * 1. donor.available === true
   * 2. (today - lastDonationDate) >= 90 days
   * 3. Masks phone numbers in the returned records for privacy
   */
  getEligibleDonors(bloodType = 'ALL') {
    const donors = this.getDonors();
    const targetType = bloodType ? bloodType.trim().toUpperCase() : 'ALL';

    return donors
      .filter(donor => {
        const dType = (donor.bloodType || '').toUpperCase().trim();

        // Blood type matching
        let matchType = false;
        if (targetType === 'ALL' || targetType === '') {
          matchType = true;
        } else if (targetType === 'RARE_ALL') {
          matchType = Boolean(donor.isRareType);
        } else {
          matchType = (dType === targetType || dType.includes(targetType) || targetType.includes(dType));
        }

        if (!matchType) return false;

        // Eligibility check
        return this.isDonorEligible(donor);
      })
      .map(donor => {
        const eligibility = this.getEligibilityDetails(donor);
        return {
          ...donor,
          rawPhone: donor.phone,
          phone: this.maskPhoneNumber(donor.phone),
          maskedPhone: this.maskPhoneNumber(donor.phone),
          eligibility
        };
      });
  },

  /**
   * Dedicated Rare Blood Registry Query
   * Queries active rare phenotype donors regardless of strict local radius cutoffs.
   */
  getRareDonors(phenotype = 'ALL') {
    const donors = this.getDonors();
    const target = phenotype ? phenotype.trim().toUpperCase() : 'ALL';

    return donors
      .filter(donor => {
        // Must be marked as rare type or rare phenotype
        const isRare = Boolean(donor.isRareType) || this.isRarePhenotype(donor.bloodType);
        if (!isRare) return false;

        // Must be currently available / active
        if (donor.available !== true) return false;

        // Filter by phenotype if specified
        if (target !== 'ALL' && target !== 'RARE_ALL') {
          const dType = (donor.bloodType || '').toUpperCase().trim();
          const matches = dType === target || dType.includes(target) || target.includes(dType);
          if (!matches) return false;
        }

        return true;
      })
      .map(donor => {
        const eligibility = this.getEligibilityDetails(donor);
        return {
          ...donor,
          rawPhone: donor.phone,
          phone: this.maskPhoneNumber(donor.phone),
          maskedPhone: this.maskPhoneNumber(donor.phone),
          eligibility,
          isRareHero: true
        };
      });
  },

  // ==========================================
  // REQUESTS CRUD
  // ==========================================

  getRequests() {
    return this._get(STORAGE_KEYS.REQUESTS, []);
  },

  saveRequests(requests) {
    return this._set(STORAGE_KEYS.REQUESTS, requests);
  },

  getRequestsForDonor(donorId) {
    const requests = this.getRequests();
    return requests
      .filter(r => r.donorId === donorId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  createRequest(requestData) {
    const requests = this.getRequests();
    const newRequest = {
      id: requestData.id || `req_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      donorId: requestData.donorId,
      requesterName: requestData.requesterName?.trim() || 'Anonymous Requester',
      requesterPhone: requestData.requesterPhone?.trim() || '',
      hospital: requestData.hospital?.trim() || 'General Hospital',
      patientBloodType: (requestData.patientBloodType || '').trim(),
      urgency: requestData.urgency || 'Urgent', // 'Critical' | 'Urgent' | 'Standard'
      isRareSOS: Boolean(requestData.isRareSOS),
      broadcastRadiusKm: requestData.broadcastRadiusKm || (requestData.isRareSOS ? 250 : 25),
      unitsNeeded: parseInt(requestData.unitsNeeded, 10) || 1,
      message: requestData.message?.trim() || '',
      status: requestData.status || 'pending', // 'pending' | 'accepted' | 'declined' | 'completed'
      createdAt: requestData.createdAt || new Date().toISOString()
    };
    requests.unshift(newRequest);
    this.saveRequests(requests);
    return newRequest;
  },

  updateRequestStatus(requestId, status) {
    const requests = this.getRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index === -1) return null;
    requests[index].status = status;
    this.saveRequests(requests);
    return requests[index];
  },

  // ==========================================
  // SESSION MANAGEMENT
  // ==========================================

  getSession() {
    return this._get(STORAGE_KEYS.SESSION, null);
  },

  setSession(donorId) {
    const session = {
      donorId,
      loggedInAt: new Date().toISOString()
    };
    this._set(STORAGE_KEYS.SESSION, session);
    return session;
  },

  clearSession() {
    try {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      window.dispatchEvent(new CustomEvent('rednova_storage_update', { detail: { key: STORAGE_KEYS.SESSION, value: null } }));
      return true;
    } catch (e) {
      console.error('Error clearing session:', e);
      return false;
    }
  },

  getCurrentDonor() {
    const session = this.getSession();
    if (!session || !session.donorId) return null;
    return this.getDonorById(session.donorId);
  },

  // ==========================================
  // SEEDING & RESET (Includes 2 Rare Phenotype Donors)
  // ==========================================

  getInitialSeedDonors() {
    return [
      // Standard Donors
      {
        id: 'donor_101',
        name: 'Porselvi S',
        phone: '9876500001',
        bloodType: 'O+',
        isRareType: false,
        rarePhenotypeNotes: '',
        locationName: 'Puducherry Town (White Town)',
        lat: 11.9340,
        lng: 79.8306,
        lastDonationDate: '2026-04-15', // > 90 days ago -> ELIGIBLE
        available: true,
        emergencyStandby: true,
        createdAt: '2026-08-01T08:00:00.000Z'
      },
      {
        id: 'donor_102',
        name: 'Sekar G',
        phone: '9840123456',
        bloodType: 'A+',
        isRareType: false,
        rarePhenotypeNotes: '',
        locationName: 'Lawspet, Puducherry',
        lat: 11.9612,
        lng: 79.8220,
        lastDonationDate: '2026-03-10', // > 90 days ago -> ELIGIBLE
        available: true,
        emergencyStandby: true,
        createdAt: '2026-08-02T08:00:00.000Z'
      },
      {
        id: 'donor_103',
        name: 'Mani megalai S',
        phone: '9443198765',
        bloodType: 'B+',
        isRareType: false,
        rarePhenotypeNotes: '',
        locationName: 'Villianur, Puducherry',
        lat: 11.9168,
        lng: 79.7617,
        lastDonationDate: '2026-05-01', // > 90 days ago -> ELIGIBLE
        available: true,
        emergencyStandby: true,
        createdAt: '2026-08-03T08:00:00.000Z'
      },
      {
        id: 'donor_104',
        name: 'Kadhiravan S',
        phone: '9876543210',
        bloodType: 'B+',
        isRareType: false,
        rarePhenotypeNotes: '',
        locationName: 'mettupalayam,Shanmugapuram',
        lat: 11.9425,
        lng: 79.8050,
        lastDonationDate: '2026-01-20', // > 90 days ago -> ELIGIBLE
        available: true,
        emergencyStandby: true,
        age: 24,
        weight: 72,
        isSmoker: false,
        isAlcoholic: false,
        isOnMedication: false,
        donationCount: 22,
        createdAt: '2026-08-04T08:00:00.000Z'
      },
      {
        id: 'donor_105',
        name: 'Thalapathy Vijay',
        phone: '9894567890',
        bloodType: 'O-',
        isRareType: false,
        rarePhenotypeNotes: '',
        locationName: 'Kalapet / Pondicherry University',
        lat: 12.0234,
        lng: 79.8540,
        lastDonationDate: '2025-12-10', // > 90 days ago -> ELIGIBLE
        available: true,
        emergencyStandby: true,
        createdAt: '2026-08-05T08:00:00.000Z'
      },
      {
        id: 'donor_106',
        name: 'P. Dinesh Kumar',
        phone: '9655123489',
        bloodType: 'A-',
        isRareType: false,
        rarePhenotypeNotes: '',
        locationName: 'Ariyankuppam, Puducherry',
        lat: 11.8962,
        lng: 79.8137,
        lastDonationDate: '2026-08-02', // ~18 days ago (<90 days) -> INELIGIBLE (Cool-off)
        available: true,
        emergencyStandby: false,
        createdAt: '2026-08-06T08:00:00.000Z'
      },
      {
        id: 'donor_107',
        name: 'V. Rajesh',
        phone: '9345678901',
        bloodType: 'B-',
        isRareType: false,
        rarePhenotypeNotes: '',
        locationName: 'Mudaliarpet, Puducherry',
        lat: 11.9215,
        lng: 79.8150,
        lastDonationDate: '2026-07-25', // ~26 days ago (<90 days) -> INELIGIBLE (Cool-off)
        available: true,
        emergencyStandby: false,
        createdAt: '2026-08-07T08:00:00.000Z'
      },
      {
        id: 'donor_108',
        name: 'K. Sneha',
        phone: '9944556677',
        bloodType: 'AB-',
        isRareType: false,
        rarePhenotypeNotes: '',
        locationName: 'Thavalakuppam, Puducherry',
        lat: 11.8643,
        lng: 79.7891,
        lastDonationDate: '2026-02-14', // > 90 days ago, but availability is FALSE -> INELIGIBLE
        available: false,
        emergencyStandby: false,
        createdAt: '2026-08-08T08:00:00.000Z'
      },

      // Pre-configured Rare Phenotype Donors (TECHNOVA'26 Priority Network)
      {
        id: 'donor_rare_201',
        name: 'Manikandan R',
        phone: '9443210987',
        bloodType: 'Bombay (hh)',
        isRareType: true,
        rarePhenotypeNotes: 'Bombay Oh Phenotype (Genetically confirmed) — Transfusion Medicine Dept Registry #BMB-PY-01',
        locationName: 'Lawspet Medical Quarters, Puducherry',
        lat: 11.9540,
        lng: 79.8180,
        lastDonationDate: '2026-02-10', // > 90 days ago -> ELIGIBLE
        available: true,
        emergencyStandby: true,
        createdAt: '2026-08-09T08:00:00.000Z'
      },
      {
        id: 'donor_rare_202',
        name: 'Anandan A',
        phone: '9840998877',
        bloodType: 'Rh-null',
        isRareType: true,
        rarePhenotypeNotes: 'Rh-null ("Golden Blood" - Lacks all Rh antigens) — National Rare Donor Network #IND-RH-09',
        locationName: 'Tambaram / Guindy, Chennai (Regional Radius ~130km)',
        lat: 12.9249,
        lng: 80.1000,
        lastDonationDate: '2026-01-15', // > 90 days ago -> ELIGIBLE
        available: true,
        emergencyStandby: true,
        createdAt: '2026-08-10T08:00:00.000Z'
      }
    ];
  },

  getInitialSeedRequests() {
    return [
      {
        id: 'req_501',
        donorId: 'donor_101',
        requesterName: 'Dr. Ramesh Nathan',
        requesterPhone: '9123456789',
        hospital: 'IGGGH&PGI General Hospital',
        patientBloodType: 'O+',
        urgency: 'Critical',
        isRareSOS: false,
        broadcastRadiusKm: 25,
        unitsNeeded: 2,
        message: 'Emergency trauma patient in ICU requires urgent O+ replacement blood.',
        status: 'pending',
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
      },
      {
        id: 'req_502',
        donorId: 'donor_rare_201',
        requesterName: 'JIPMER Emergency Transfusion Wing',
        requesterPhone: '9884411223',
        hospital: 'JIPMER Super Specialty Block, Puducherry',
        patientBloodType: 'Bombay (hh)',
        urgency: 'Critical',
        isRareSOS: true,
        broadcastRadiusKm: 250,
        unitsNeeded: 1,
        message: '🚨 RARE SOS: Emergency obstetric patient requiring certified Bombay (hh) blood unit immediately.',
        status: 'pending',
        createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString()
      }
    ];
  },

  seedIfEmpty() {
    const existingDonors = this._get(STORAGE_KEYS.DONORS, null);
    let seeded = false;

    // Check if donors exist and whether rare donors are seeded
    if (!existingDonors || !Array.isArray(existingDonors) || existingDonors.length === 0 || !existingDonors.some(d => d.isRareType)) {
      console.log('[RedNova DB] Seeding initial realistic donors including Rare Phenotype Registry...');
      const seedDonors = this.getInitialSeedDonors();
      this.saveDonors(seedDonors);
      seeded = true;
    }

    const existingRequests = this._get(STORAGE_KEYS.REQUESTS, null);
    if (!existingRequests || !Array.isArray(existingRequests) || existingRequests.length === 0) {
      console.log('[RedNova DB] Seeding initial sample requests...');
      const seedRequests = this.getInitialSeedRequests();
      this.saveRequests(seedRequests);
    }

    return seeded;
  },

  // ==========================================
  // GAMIFIED BADGE ENGINE
  // ==========================================

  /**
   * getDonorBadges(donor)
   * Returns an array of badge objects with { id, label, emoji, color, unlocked, hint }.
   * Unlocked badges are bright; locked badges appear greyed-out in UI.
   */
  getDonorBadges(donor) {
    if (!donor) return [];

    const daysSince = this.daysSince(donor.lastDonationDate);
    const eligible = this.isDonorEligible(donor);
    const donationCount = typeof donor.donationCount === 'number' ? donor.donationCount : 1;
    const age = donor.age || null;
    const weight = donor.weight || null;
    const isSmoker = donor.isSmoker === true;
    const isAlcoholic = donor.isAlcoholic === true;
    const isOnMedication = donor.isOnMedication === true;

    const badges = [
      {
        id: 'first_drop',
        label: 'First Drop',
        emoji: '🩸',
        color: 'bg-rose-100 text-rose-800 border-rose-300',
        unlocked: true, // Every registered donor earns this
        hint: 'Registered as a RedNova donor'
      },
      {
        id: 'reliable_donor',
        label: 'Reliable Donor',
        emoji: '✅',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        unlocked: eligible,
        hint: '90-day cooldown clear — currently eligible'
      },
      {
        id: 'guardian_pledge',
        label: 'Guardian Pledge',
        emoji: '🛡️',
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        unlocked: donor.emergencyStandby === true,
        hint: 'Emergency Standby mode activated'
      },
      {
        id: 'rare_hero',
        label: 'Rare Blood Hero',
        emoji: '🌟',
        color: 'bg-amber-100 text-amber-900 border-amber-300',
        unlocked: donor.isRareType === true,
        hint: 'Registered as a Rare Blood Phenotype donor'
      },
      {
        id: 'healthy_donor',
        label: 'Healthy Donor',
        emoji: '💪',
        color: 'bg-teal-100 text-teal-800 border-teal-300',
        unlocked: !isSmoker && !isAlcoholic && !isOnMedication && age !== null && weight !== null,
        hint: 'No smoking, no alcohol, no medication, age & weight recorded'
      },
      {
        id: 'prime_age',
        label: 'Prime Age',
        emoji: '🧬',
        color: 'bg-purple-100 text-purple-800 border-purple-300',
        unlocked: age !== null && age >= 18 && age <= 40,
        hint: 'Age between 18–40 — peak donation fitness'
      },
      {
        id: 'iron_will',
        label: 'Iron Will',
        emoji: '🏋️',
        color: 'bg-slate-200 text-slate-900 border-slate-400',
        unlocked: weight !== null && weight >= 65,
        hint: 'Weight ≥ 65 kg — high-volume donation capacity'
      },
      {
        id: 'veteran_donor',
        label: 'Veteran Donor',
        emoji: '🎖️',
        color: 'bg-yellow-100 text-yellow-900 border-yellow-400',
        unlocked: donationCount >= 5,
        hint: '5+ donation cycles completed'
      },
      {
        id: 'champion_donor',
        label: 'Champion Donor',
        emoji: '🏆',
        color: 'bg-orange-100 text-orange-900 border-orange-400',
        unlocked: donationCount >= 20,
        hint: '20+ lifetime donations — elite status'
      },
      {
        id: 'universal_hero',
        label: 'Universal Hero',
        emoji: '🌍',
        color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        unlocked: (donor.bloodType || '').toUpperCase() === 'O-',
        hint: 'O- blood type — universal donor compatible with all groups'
      }
    ];

    return badges;
  },

  autoSeedLocalStorage() {
    const rawDonors = this._get(STORAGE_KEYS.DONORS, null);
    if (!rawDonors || !Array.isArray(rawDonors) || rawDonors.length === 0 || !rawDonors.some(d => d.isRareType)) {
      console.log('[RedNova DB] Auto-seeding default demo accounts (standard + rare donors)...');
      const seedDonors = this.getInitialSeedDonors();
      this.saveDonors(seedDonors);
      if (!this._get(STORAGE_KEYS.REQUESTS, null)) {
        this.saveRequests(this.getInitialSeedRequests());
      }
      return true;
    }
    return false;
  },

  resetDatabase() {
    console.log('[RedNova DB] Resetting database to clean seed state (including Rare Phenotype Donors)...');
    localStorage.removeItem(STORAGE_KEYS.DONORS);
    localStorage.removeItem(STORAGE_KEYS.REQUESTS);
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    
    this.saveDonors(this.getInitialSeedDonors());
    this.saveRequests(this.getInitialSeedRequests());
    // Auto-login donor_104 (Kadhiravan S) for quick demo convenience
    this.setSession('donor_104');
    console.log('[RedNova DB] Reset complete.');
    return true;
  }
};

/**
 * Top-level global helper functions
 */
function autoSeedLocalStorage() {
  if (typeof DB !== 'undefined' && DB.autoSeedLocalStorage) {
    return DB.autoSeedLocalStorage();
  }
  return false;
}

function resetSeedData() {
  if (typeof DB !== 'undefined' && DB.resetDatabase) {
    return DB.resetDatabase();
  }
  return false;
}

// Auto-seed on DOMContentLoaded if running in browser
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      autoSeedLocalStorage();
    });
  } else {
    autoSeedLocalStorage();
  }
}

// Export to window object for vanilla script tags and ES export
if (typeof window !== 'undefined') {
  window.DB = DB;
  window.autoSeedLocalStorage = autoSeedLocalStorage;
  window.resetSeedData = resetSeedData;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DB;
}
