# 🩸 RedNova

```{=html}
<p align="center">
```
`<img src="./Index(1).png" alt="RedNova" width="900">`{=html}
```{=html}
</p>
```
```{=html}
<h3 align="center">
```
Hyperlocal Blood Donor Availability Network
```{=html}
</h3>
```
```{=html}
<p align="center">
```
Find eligible blood donors nearby. Connect faster. Help save lives.
```{=html}
</p>
```
```{=html}
<p align="center">
```
`<img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" alt="Status">`{=html}
`<img src="https://img.shields.io/badge/Frontend-HTML%20%7C%20CSS%20%7C%20JavaScript-blue?style=for-the-badge" alt="Frontend">`{=html}
`<img src="https://img.shields.io/badge/Responsive-Mobile%20Friendly-purple?style=for-the-badge" alt="Responsive">`{=html}
`<img src="https://img.shields.io/badge/Deployment-Vercel-black?style=for-the-badge&logo=vercel" alt="Vercel">`{=html}
```{=html}
</p>
```
```{=html}
<p align="center">
```
`<a href="#-live-demo">`{=html}Live Demo`</a>`{=html} •
`<a href="#-features">`{=html}Features`</a>`{=html} •
`<a href="#-screenshots">`{=html}Screenshots`</a>`{=html} •
`<a href="#-tech-stack">`{=html}Tech Stack`</a>`{=html} •
`<a href="#-getting-started">`{=html}Getting Started`</a>`{=html}
```{=html}
</p>
```

------------------------------------------------------------------------

## 🌟 Overview

**RedNova** is a hyperlocal blood donor availability platform designed
to make it easier to discover eligible blood donors nearby during urgent
situations.

The project combines blood-group matching, location-aware discovery,
donation eligibility, rare blood phenotype support, emergency requests
and donor profiles into one responsive web experience.

> **Note:** RedNova is currently a client-side prototype. It should not
> be used as a production medical or emergency service without
> appropriate verification, backend security, privacy controls and
> healthcare compliance.

------------------------------------------------------------------------

## 🚀 Live Demo

### 🌐 Try RedNova

**Live Demo:** `YOUR_VERCEL_URL_HERE`

Replace `YOUR_VERCEL_URL_HERE` with your deployed Vercel URL.

```{=html}
<p align="center">
```
`<a href="YOUR_VERCEL_URL_HERE">`{=html}
`<img src="https://img.shields.io/badge/🚀%20Open%20Live%20Demo-RedNova-black?style=for-the-badge" alt="Open Live Demo">`{=html}
`</a>`{=html}
```{=html}
</p>
```

------------------------------------------------------------------------

## ✨ Features

  -----------------------------------------------------------------------
  Feature                             Description
  ----------------------------------- -----------------------------------
  🩸 **Blood Group Matching**         Find donors according to the
                                      required blood group

  📍 **Hyperlocal Discovery**         Locate donors using geographical
                                      coordinates

  ⏱️ **90-Day Eligibility**           Calculate donor eligibility from
                                      donation history

  🧬 **Rare Blood Registry**          Support rare blood phenotypes and
                                      emergency donors

  🚨 **SOS Requests**                 Create urgent requests and initiate
                                      donor contact

  👤 **Donor Profiles**               View donor status, eligibility and
                                      profile information

  📱 **Responsive UI**                Designed for desktop and mobile
                                      screens

  🔐 **Privacy-Conscious Contact**    Mask phone numbers in public-facing
                                      donor results

  🌎 **Geolocation**                  Browser-based location detection

  💾 **Client-Side Storage**          LocalStorage-powered prototype data
                                      layer

  🧪 **Test Scripts**                 Dedicated tests for important
                                      workflows

  ☁️ **Vercel Ready**                 Static deployment configuration
                                      included
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 🖥️ Screenshots

## 🏠 Home / Landing Page

```{=html}
<p align="center">
```
`<img src="./Index(1).png" alt="RedNova Home Page" width="900">`{=html}
```{=html}
</p>
```
```{=html}
<p align="center">
```
`<img src="./Index(2).png" alt="RedNova Home Page - Section 2" width="900">`{=html}
```{=html}
</p>
```
The landing experience introduces RedNova and provides clear entry
points for finding donors and registering as a donor.

------------------------------------------------------------------------

## 🔎 Find Blood Donors

```{=html}
<p align="center">
```
`<img src="./Find(1).png" alt="RedNova Find Donors" width="900">`{=html}
```{=html}
</p>
```
```{=html}
<p align="center">
```
`<img src="./Find(2).png" alt="RedNova Donor Search Results" width="900">`{=html}
```{=html}
</p>
```
The donor discovery interface combines blood-group requirements,
availability and location-aware matching.

------------------------------------------------------------------------

## 📝 Donor Registration

```{=html}
<p align="center">
```
`<img src="./Register(1).png" alt="RedNova Registration" width="900">`{=html}
```{=html}
</p>
```
```{=html}
<p align="center">
```
`<img src="./Register(2).png" alt="RedNova Registration Form" width="900">`{=html}
```{=html}
</p>
```
Donors can create profiles containing their blood group, location,
donation history and availability information.

------------------------------------------------------------------------

## 👤 Donor Profile

```{=html}
<p align="center">
```
`<img src="./Profile(1).png" alt="RedNova Donor Profile" width="900">`{=html}
```{=html}
</p>
```
```{=html}
<p align="center">
```
`<img src="./Profile(2).png" alt="RedNova Donor Dashboard" width="900">`{=html}
```{=html}
</p>
```
The profile experience provides a centralized view of donor information,
availability, eligibility and relevant donor status.

------------------------------------------------------------------------

# 🧠 How RedNova Works

``` text
                 ┌───────────────────────┐
                 │      User / Donor     │
                 └───────────┬───────────┘
                             │
                  ┌──────────▼──────────┐
                  │  Register / Search  │
                  └──────────┬──────────┘
                             │
              ┌──────────────▼──────────────┐
              │     Donor Information       │
              │ Blood Group • Location      │
              │ Donation History • Status   │
              └──────────────┬──────────────┘
                             │
                   ┌─────────▼─────────┐
                   │ Eligibility Check │
                   │     90 Days       │
                   └─────────┬─────────┘
                             │
              ┌──────────────▼──────────────┐
              │     Donor Matching          │
              │ Blood Group + Availability  │
              │ + Geographic Distance       │
              └──────────────┬──────────────┘
                             │
                 ┌───────────▼───────────┐
                 │ Nearby Eligible Donor │
                 └───────────┬───────────┘
                             │
                 ┌───────────▼───────────┐
                 │ Contact / SOS Request │
                 └───────────────────────┘
```

------------------------------------------------------------------------

# 📍 Hyperlocal Matching

RedNova calculates approximate geographic distance between locations
using the **Haversine formula**.

This allows donor discovery to consider physical proximity rather than
relying only on city or district names.

``` text
Donor Location
      +
Search / Recipient Location
      ↓
Geographical Distance
      ↓
Nearby Donor Results
```

------------------------------------------------------------------------

# ⏱️ Donor Eligibility

RedNova includes a donation cooldown mechanism based on a **90-day
interval**.

The eligibility flow considers information such as:

-   Previous donation date
-   Current date
-   Donor availability
-   Eligibility status

------------------------------------------------------------------------

# 🧬 Rare Blood Registry

The project includes support for rare blood phenotypes, including
examples such as:

-   Bombay Blood Group `(hh)`
-   Rh-null
-   D--
-   Other rare phenotype records

Rare donors can be surfaced through emergency-oriented workflows.

------------------------------------------------------------------------

# 🚨 Emergency SOS

The SOS workflow is designed around urgent blood requirements.

``` text
Emergency Request
       ↓
Required Blood Group
       ↓
Location / Distance
       ↓
Eligible Donor Discovery
       ↓
Donor Contact
```

The project also contains an SMS fallback workflow for initiating
contact.

------------------------------------------------------------------------

# 🔐 Privacy & Security

RedNova uses privacy-conscious UI behavior when displaying donor
information.

Example masked phone number:

``` text
+91 98******10
```

The project also includes security-related deployment headers such as:

-   `X-Content-Type-Options`
-   `X-Frame-Options`
-   `Referrer-Policy`

> **Production note:** A real deployment handling sensitive personal or
> healthcare information should use secure server-side storage,
> authentication, authorization, encryption and appropriate
> privacy/compliance controls.

------------------------------------------------------------------------

# 🛠️ Tech Stack

### Frontend

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![Tailwind
CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)

### Platform

![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![LocalStorage](https://img.shields.io/badge/Browser_LocalStorage-FF6B35?style=flat-square)
![Geolocation](https://img.shields.io/badge/Browser_Geolocation-4285F4?style=flat-square)

------------------------------------------------------------------------

# 📂 Project Structure

``` text
RedNova/
│
├── index.html
├── find.html
├── login.html
├── register.html
├── profile.html
│
├── css/
│   ├── style.css
│   └── styles.css
│
├── js/
│   ├── app.js
│   ├── db.js
│   ├── find.js
│   ├── localization.js
│   └── profile.js
│
├── Index(1).png
├── Index(2).png
├── Find(1).png
├── Find(2).png
├── Register(1).png
├── Register(2).png
├── Profile(1).png
├── Profile(2).png
├── Login.png
│
├── test_accessibility_and_mobile.js
├── test_cross_tab_sync.js
├── test_db.js
├── test_find_flow.js
├── test_flows.js
├── test_health_badges.js
├── test_health_eligibility.js
├── test_hybrid_localization.js
├── test_pincode_lookup.js
├── test_production_deploy.js
├── test_rare_blood_registry.js
├── test_sms_modal.js
│
├── vercel.json
└── .nojekyll
```

------------------------------------------------------------------------

# 💾 Data Architecture

The current prototype uses browser `LocalStorage` for client-side
persistence.

Important storage areas include:

``` text
rednova_donors
rednova_requests
rednova_session
```

The database-related functionality is primarily handled through:

``` text
js/db.js
```

------------------------------------------------------------------------

# 🧪 Testing

The repository includes dedicated test scripts covering important
application workflows.

``` text
✓ Database operations
✓ Donor registration
✓ Donor search
✓ Health eligibility
✓ Donor badges
✓ Rare blood registry
✓ Pincode lookup
✓ Hybrid localization
✓ Cross-tab synchronization
✓ Accessibility & mobile behavior
✓ Production deployment
✓ SMS modal workflow
```

------------------------------------------------------------------------

# 🚀 Getting Started

## 1. Clone the repository

``` bash
git clone https://github.com/YOUR-USERNAME/RedNova.git
cd RedNova
```

## 2. Start a local server

``` bash
python -m http.server 8000
```

## 3. Open RedNova

Visit:

``` text
http://localhost:8000
```

Using a local HTTP server is recommended because the application uses
browser APIs such as Geolocation and LocalStorage.

------------------------------------------------------------------------

# ☁️ Deployment

RedNova can be deployed as a static web application.

### Vercel

1.  Push the project to GitHub.
2.  Import the repository into Vercel.
3.  Configure the project as a static application.
4.  Deploy.

The repository includes:

``` text
vercel.json
```

for deployment configuration.

------------------------------------------------------------------------

# 🔮 Roadmap

-   [ ] Secure backend database
-   [ ] Phone / OTP verification
-   [ ] Verified donor accounts
-   [ ] Real-time donor availability
-   [ ] Push notifications
-   [ ] SMS / WhatsApp integration
-   [ ] Hospital integration
-   [ ] Blood-bank inventory integration
-   [ ] Interactive map-based donor discovery
-   [ ] Secure authentication
-   [ ] Role-based access control
-   [ ] Encrypted sensitive information
-   [ ] Cloud synchronization
-   [ ] Advanced fraud and abuse prevention

------------------------------------------------------------------------

# 🤝 Contributing

Contributions are welcome.

### 1. Fork the repository

### 2. Create a feature branch

``` bash
git checkout -b feature/amazing-feature
```

### 3. Commit your changes

``` bash
git commit -m "Add amazing feature"
```

### 4. Push your branch

``` bash
git push origin feature/amazing-feature
```

### 5. Open a Pull Request

------------------------------------------------------------------------

# 📜 License

Add your preferred open-source license to the repository.

For example:

``` text
MIT License
```

If you choose MIT, add a corresponding `LICENSE` file to the repository.

------------------------------------------------------------------------

# ❤️ RedNova

```{=html}
<p align="center">
```
`<strong>`{=html}Built with technology. Designed around human
connection.`</strong>`{=html}
```{=html}
</p>
```
```{=html}
<p align="center">
```
🩸 Donor  →  📍 Match  →  🤝 Connect
```{=html}
</p>
```
```{=html}
<p align="center">
```
`<sub>`{=html}RedNova • Hyperlocal Blood Donor Availability
Network`</sub>`{=html}
```{=html}
</p>
```
