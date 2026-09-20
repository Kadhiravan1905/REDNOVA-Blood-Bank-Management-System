# RedNova --- Product Requirements Document (PRD)

### Hyperlocal Blood Donor Availability Network

  ----------------------------------- -----------------------------------
  **Document Type**                   Product Requirements Document
                                      (Client-Side Website MVP)

  **Version**                         1.0

  **Status**                          Website MVP
  ----------------------------------- -----------------------------------

------------------------------------------------------------------------

## 1. Executive Summary

RedNova is a zero-friction, hyperlocal web application that connects
patients/requesters directly with **currently eligible, nearby blood
donors** in real time. Unlike national platforms that track static blood
bank inventory, RedNova tracks **individual donor availability**,
automatically enforcing a 90-day donation-eligibility window and
calculating live proximity using the donor's and requester's location.

The MVP is a fully client-side, static web application --- no backend
server, database, or API required --- built to demonstrate the core
coordination problem and solution quickly and cheaply ("frugal
innovation").

------------------------------------------------------------------------

## 2. Problem Statement

Blood shortages during emergencies are frequently caused by
**coordination failure**, not actual scarcity of donors. Existing
platforms have two structural gaps:

1.  They track blood bank **stock**, not individual **donor
    availability**.
2.  They have no mechanism to filter donors by real-time eligibility
    (e.g., the mandatory \~90-day gap between donations) or by proximity
    to the person in need.

**Result:** eligible, willing donors exist nearby, but requesters have
no fast way to discover and contact them.

------------------------------------------------------------------------

## 3. Vision & Goals

Provide a zero-friction way to find eligible, available blood donors
nearby in real time, with automatic eligibility filtering and
privacy-safe contact initiation.

  -----------------------------------------------------------------------
  Goal                                Description
  ----------------------------------- -----------------------------------
  G1                                  Surface only donors who are both
                                      *available* and *eligible* (90+
                                      days since last donation)

  G2                                  Sort and filter donors by real
                                      distance from the requester, not
                                      just city/region

  G3                                  Protect donor privacy by default
                                      (masked phone numbers,
                                      contact-on-request only)

  G4                                  Demonstrate real-time
                                      responsiveness without a backend,
                                      for fast/cheap prototyping

  G5                                  Keep the interface simple enough
                                      for non-technical users in an
                                      emergency situation
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 4. Target Users / Personas

  -----------------------------------------------------------------------
  Persona                 Description             Needs
  ----------------------- ----------------------- -----------------------
  **Donor**               A registered, willing   Control over
                          blood donor             availability status;
                                                  privacy of contact
                                                  info; visibility into
                                                  incoming requests

  **Requester**           A patient, family       Fast search by blood
                          member, or hospital     type + location;
                          staff looking for a     ability to initiate
                          compatible donor        contact without needing
                          urgently                the donor's number
                                                  upfront
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 5. Scope

### 5.1 In Scope (MVP)

-   Donor registration and login (phone-based session, no password)
-   Donor availability toggle
-   Automatic 90-day eligibility calculation
-   Geolocation-based hyperlocal donor search (Haversine distance)
-   Blood type filtering
-   Phone number masking on public listings
-   "Request Contact" flow (creates a request record, does not expose
    phone number directly)
-   Donor inbox showing incoming requests, with real-time cross-tab sync
-   Reset tool for restoring the website to its initial state

### 5.2 Out of Scope (MVP)

-   Backend server / persistent database (uses browser `localStorage`
    only --- data is local to one browser/device and not synced across
    real users or devices)
-   Real SMS/call integration (requests are in-app only, not sent to a
    real phone)
-   User authentication security (no passwords, sessions are
    non-persistent across devices)
-   Hospital/blood bank verification system
-   Push notifications outside the browser tab
-   Anonymized two-way messaging beyond the initial contact request

> **Note:** Because persistence is `localStorage`-based, this MVP is a
> **single-device/browser demo**, not a multi-user production system.
> Real-world deployment would require a backend database and
> authentication layer (see Section 11, Future Roadmap).

------------------------------------------------------------------------

## 6. Functional Requirements

  ----------------------------------------------------------------------------------------
  ID                      Requirement                              Priority
  ----------------------- ---------------------------------------- -----------------------
  FR-1                    System shall allow a donor to register   Must
                          with name, phone, blood type, location   
                          name, GPS coordinates, and last donation 
                          date                                     

  FR-2                    System shall allow a donor to log in via Must
                          phone number lookup                      

  FR-3                    System shall calculate donor eligibility Must
                          as `available === true` AND              
                          `(today − lastDonationDate) ≥ 90 days`   

  FR-4                    System shall mask donor phone numbers in Must
                          all public-facing views (e.g.,           
                          `98******10`)                            

  FR-5                    System shall allow a requester to search Must
                          for eligible donors by blood type        

  FR-6                    System shall calculate and display       Must
                          distance (km) from requester to each     
                          eligible donor using the Haversine       
                          formula, sorted nearest-first            

  FR-7                    System shall show an empty-state message Should
                          when no eligible donors match the search 

  FR-8                    System shall allow a requester to submit Must
                          a "Request Contact" which is stored and  
                          linked to the target donor               

  FR-9                    System shall display an eligibility      Must
                          status badge and incoming request list   
                          on the donor's profile/dashboard         

  FR-10                   System shall allow a donor to toggle     Must
                          their own availability on/off            

  FR-11                   System shall sync incoming requests      Should
                          across open browser tabs in real time    
                          using the Storage event API              

  FR-12                   System shall provide a "Reset Demo Data" Could
                          control that clears and re-seeds all     
                          data for repeatable testing              
  ----------------------------------------------------------------------------------------

------------------------------------------------------------------------

## 7. Data Model & Client-Side Storage

RedNova currently uses the browser's `localStorage` as its client-side data store. The implementation is organized around three storage collections used by the application's database utility (`js/db.js`).

> **Implementation note:** The website is branded as RedNova, while the current JavaScript implementation still uses the existing `rednova_*` storage keys. The schema below reflects the actual project code.

### 7.1 Donor Records — `rednova_donors`

Each donor record contains identity, contact, blood information, location, availability, eligibility, rare-phenotype, and optional health/donation fields.

```json
{
  "id": "donor_104",
  "name": "Kadhiravan S",
  "phone": "9876543210",
  "bloodType": "B+",
  "isRareType": false,
  "rarePhenotypeNotes": "",
  "locationName": "mettupalayam,Shanmugapuram",
  "lat": 11.9425,
  "lng": 79.8050,
  "lastDonationDate": "2026-01-20",
  "available": true,
  "emergencyStandby": true,
  "age": 24,
  "weight": 72,
  "isSmoker": false,
  "isAlcoholic": false,
  "isOnMedication": false,
  "donationCount": 22,
  "createdAt": "2026-08-04T08:00:00.000Z"
}
```

**Core donor fields:**

| Field | Purpose |
|---|---|
| `id` | Unique donor identifier |
| `name` | Donor display name |
| `phone` | Donor contact number |
| `bloodType` | Blood group or rare phenotype |
| `isRareType` | Identifies rare blood donors |
| `rarePhenotypeNotes` | Additional rare-phenotype information |
| `locationName` | Human-readable donor location |
| `lat`, `lng` | Coordinates used for distance calculations |
| `lastDonationDate` | Used for the 90-day eligibility rule |
| `available` | Current donor availability status |
| `emergencyStandby` | Emergency standby preference |
| `age`, `weight` | Optional donor health/profile information |
| `isSmoker`, `isAlcoholic`, `isOnMedication` | Health-screening attributes |
| `donationCount` | Lifetime donation count used by donor badges |
| `createdAt` | Donor record creation timestamp |

### 7.2 Blood Request Records — `rednova_requests`

Requests connect a requester with a specific donor and contain patient blood requirements, urgency, emergency mode, and request status.

```json
{
  "id": "req_501",
  "donorId": "donor_101",
  "requesterName": "Dr. Ramesh Nathan",
  "requesterPhone": "9123456789",
  "hospital": "IGGGH&PGI General Hospital",
  "patientBloodType": "O+",
  "urgency": "Critical",
  "isRareSOS": false,
  "broadcastRadiusKm": 25,
  "unitsNeeded": 2,
  "message": "Emergency trauma patient requires urgent O+ replacement blood.",
  "status": "pending",
  "createdAt": "2026-08-20T09:30:00.000Z"
}
```

**Request fields:**

| Field | Purpose |
|---|---|
| `id` | Unique request identifier |
| `donorId` | Donor receiving the request |
| `requesterName` | Name of the person making the request |
| `requesterPhone` | Requester's contact number |
| `hospital` | Hospital or care location |
| `patientBloodType` | Required blood group or phenotype |
| `urgency` | `Critical`, `Urgent`, or `Standard` |
| `isRareSOS` | Activates rare-blood emergency handling |
| `broadcastRadiusKm` | Search/broadcast radius for the request |
| `unitsNeeded` | Number of blood units requested |
| `message` | Additional request details |
| `status` | `pending`, `accepted`, `declined`, or `completed` |
| `createdAt` | Request creation timestamp |

### 7.3 Login Session — `rednova_session`

The current donor session is stored locally in the browser.

```json
{
  "donorId": "donor_104",
  "loggedInAt": "2026-08-20T08:30:00.000Z"
}
```

### 7.4 Data Operations

The client-side database utility provides the following operations:

- Create, read, update, and delete donor records
- Find donors by ID or phone number
- Toggle donor availability
- Toggle emergency standby
- Calculate donor eligibility from availability and donation date
- Filter eligible donors by blood type
- Identify and query rare blood donors
- Mask donor phone numbers in search results
- Create and update blood requests
- Retrieve requests for a specific donor
- Create, read, and clear the active donor session
- Seed initial donor/request records
- Reset the local data store to the initial application state

### 7.5 Privacy Handling

Donor phone numbers are stored locally for the application's functionality, but search results use a masked representation. The database utility preserves the original number internally as `rawPhone` while exposing the masked number through the public donor result.

------------------------------------------------------------------------

## 8. System Architecture & Tech Stack

  -----------------------------------------------------------------------
  Layer                               Technology
  ----------------------------------- -----------------------------------
  Frontend                            HTML5, Tailwind CSS (CDN), Vanilla
                                      JavaScript (ES6 Modules)

  Persistence                         Browser `localStorage`, with native
                                      cross-tab `storage` event listeners
                                      for instant sync

  Location Engine                     Browser Geolocation API + in-memory
                                      Haversine distance formula

  Deployment                          Static hosting --- GitHub Pages,
                                      Vercel, or Netlify
  -----------------------------------------------------------------------

**Architecture notes:** - No server, API, or database --- all logic runs
client-side. - Cross-tab "real-time" updates are simulated using the
native `window.addEventListener('storage', …)` event, which fires when
`localStorage` changes in another tab of the same browser. This is a
demo technique and does **not** sync across different devices or users.

------------------------------------------------------------------------

## 9. User Flows

### 9.1 Donor Registration & Login

1.  Donor opens `register.html`, enters name, phone, blood type,
    location name, and last donation date.
2.  Browser requests GPS permission via
    `navigator.geolocation.getCurrentPosition`; manual location entry is
    the fallback if denied.
3.  Record is saved to `rednova_donors`; session is created in
    `rednova_session`; donor is redirected to `profile.html`.
4.  On return visits, donor logs in via `login.html` by matching their
    phone number against `rednova_donors`.

### 9.2 Requester Search & Contact Request

1.  Requester opens `find.html`, selects a blood type, and allows
    location access.
2.  App calls `getEligibleDonors(bloodType)`, calculates distance to
    each result via Haversine, and sorts nearest-first.
3.  Donor phone numbers are shown masked (e.g., `+91******1234`).
4.  Requester taps a donor and submits a "Request Contact" form (name,
    phone, urgency); a new record is appended to `rednova_requests`.
5.  If no eligible donors are found, an empty-state message is shown.

### 9.3 Donor Dashboard & Live Inbox

1.  Donor's `profile.html` loads their record from `rednova_session`.
2.  Page displays donor details, an eligibility badge (from the 90-day
    rule), and an availability toggle.
3.  Incoming requests for this donor are listed from `rednova_requests`.
4.  A `storage` event listener re-renders the inbox instantly if a new
    request arrives while another tab is open (e.g., a requester
    submitting from `find.html` in Tab A while the donor's
    `profile.html` is open in Tab B).
5.  Donor can log out, clearing the session.

------------------------------------------------------------------------

## 10. Non-Functional Requirements

  -----------------------------------------------------------------------
  Category                            Requirement
  ----------------------------------- -----------------------------------
  Usability                           Mobile-first layout; touch targets
                                      ≥ 44×44px

  Accessibility                       Colors must meet WCAG AA contrast
                                      standards

  Performance                         All operations run client-side; no
                                      network latency for core
                                      interactions

  Privacy                             Phone numbers masked by default in
                                      all list/search views; full number
                                      never exposed until a request is
                                      explicitly initiated

  Portability                         Fully static build, deployable to
                                      any static host with no server
                                      configuration

  Demo Reliability                    One-click reset must fully restore
                                      seed data for repeatable testing
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 11. Known Limitations & Risks

  -----------------------------------------------------------------------
  Risk / Limitation       Impact                  Notes
  ----------------------- ----------------------- -----------------------
  Data is stored only in  Not a real multi-user   Acceptable for a
  the local browser       system; two people on   client-side prototype;
  (`localStorage`)        different devices don't requires a backend
                          see each other's data   (e.g., Firebase, Node +
                                                  DB) for production

  No password-based       Anyone with a donor's   Suitable for a
  authentication          phone number could "log prototype; needs proper
                          in" as them             auth (OTP, etc.) before
                                                  real-world use

  No hospital/requester   Requests could be       Reserved for a future
  verification            fabricated or spammy in production
                          a real deployment       implementation

  Contact requests don't  Donor must be actively  A production
  trigger real SMS/calls  viewing the app to see  implementation would
                          a request               need push notifications
                                                  or SMS integration

  Geolocation accuracy    Distance sorting may be Manual location
  depends on              inaccurate if GPS is    fallback mitigates this
  browser/device          denied or imprecise     partially
  permissions                                     
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 12. Implementation Plan

  -----------------------------------------------------------------------
  Phase                   Objective               Key Deliverable
  ----------------------- ----------------------- -----------------------
  **Phase 1**             Shared Storage Engine & `js/db.js` --- CRUD
                          Pre-Seeding             wrapper, mock data
                                                  seeding, phone masking,
                                                  90-day eligibility
                                                  logic

  **Phase 2**             Donor Registration &    `register.html`,
                          Login Flow              `login.html` --- GPS
                                                  capture, session
                                                  handling, form
                                                  validation

  **Phase 3**             Hyperlocal Search &     `find.html` --- blood
                          Contact Requests        type filter, Haversine
                                                  sorting, masked
                                                  results, request modal

  **Phase 4**             Real-Time Donor Profile `profile.html` ---
                          & Inbox                 availability toggle,
                                                  live request inbox,
                                                  cross-tab sync

  **Phase 5**             Demo Reset Controls &   Global reset button,
                          Deployment              accessibility polish,
                                                  static deployment
                                                  (GitHub Pages/Vercel)
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 13. Project Structure

    rednova/
    ├── index.html          # Landing Page & Quick Action Entry
    ├── register.html       # Donor Registration & GPS Capture
    ├── login.html           # Lightweight Phone Session Login
    ├── find.html            # Hyperlocal Eligible Donor Search & Request Modal
    ├── profile.html         # Donor Dashboard, Availability Toggle & Live Inbox
    ├── css/
    │   └── styles.css      # Custom Styles & Animations
    ├── js/
    │   ├── db.js            # LocalStorage Data Layer & Seeding
    │   ├── app.js           # Core Utility Functions (Haversine, Date Math, Masking)
    │   ├── find.js          # Search Logic & Distance Calculations
    │   └── profile.js       # Profile Logic & Realtime Cross-Tab Listener
    └── README.md            # Documentation

------------------------------------------------------------------------

## 14. Success Metrics

  -----------------------------------------------------------------------
  Metric                              Target
  ----------------------------------- -----------------------------------
  Time to find an eligible donor from Under 5 seconds (client-side, no
  search                              network dependency)

  Accuracy of eligibility filter      100% correct application of 90-day
                                      rule against seed data

  Cross-tab sync latency              Near-instant (native `storage`
                                      event, no polling)

  Demo reset reliability              Fully restores clean state every
                                      time, no residual data
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 15. Future Roadmap (Beyond MVP)

1.  Replace `localStorage` with a real backend (e.g., Firebase,
    Supabase, or Node.js + PostgreSQL) for true multi-user, multi-device
    support.
2.  Add phone/OTP-based authentication for donor accounts.
3.  Add hospital/blood bank account verification before requests can be
    posted.
4.  Integrate real SMS or push notifications so donors are alerted even
    when the app is closed.
5.  Add anonymized in-app messaging with staged, consent-based identity
    disclosure between donor and requester (see companion research on
    donor--recipient communication safety).
6.  Add live blood bank stock integration alongside individual donor
    availability.

------------------------------------------------------------------------

## 16. How to Run Locally

``` bash
git clone https://github.com/your-username/rednova.git
cd rednova
```

Then open the project folder in VS Code and either: - Right-click
`index.html` → **Open with Live Server**, or - Open `index.html`
directly in any web browser.

**To simulate the real-time demo:** 1. Open Tab A → navigate to
`find.html` (Requester view). 2. Open Tab B side-by-side → navigate to
`profile.html` (logged-in Donor view). 3. Submit a request from Tab A
--- it appears instantly in Tab B's inbox.
