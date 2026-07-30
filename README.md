# Motorhome Itinerary

A shared, installable trip-planning app for motorhome travel. Two accounts
(family), one synced itinerary, works offline.

Live at: https://christoph-koch42.github.io/motorhome-itinerary/

## Features

- Day-by-day itinerary: main activity (travel/stay), distance in km,
  overnight place, overnight type (campground / aire / parking / wild
  camping / other), booking status, price, amenities (hookup / water /
  dump), highlights, and a Google Maps link for the overnight location
- **Copy day**: duplicate an existing entry with the date bumped by one day
- **Today highlighting**: the current day's card is visually marked
- Shared in real time between two signed-in accounts (e.g. both travelers'
  phones stay in sync automatically)
- Works with no signal — cached locally and syncs once back online
- Installable as a PWA ("Add to Home Screen") on Android/desktop Chrome

## Architecture, in plain terms

There is no server we run or maintain. It's a **static site** (the app
that ships in your browser was fully built in advance — no per-request
server rendering) hosted for free on **GitHub Pages**, which talks
directly to **Firebase** (Google's managed backend platform) for data
and login. A push to `main` automatically rebuilds and redeploys via
**GitHub Actions**.

```
 Browser (phone/desktop)
   │
   ├── loads app code from ──────► GitHub Pages (static files, HTTPS)
   │                                     ▲
   │                                     │ auto-deploy on push
   │                               GitHub Actions (build + publish)
   │                                     ▲
   │                               GitHub repo (source code, this repo)
   │
   └── reads/writes data via ────► Firebase (Google-managed)
                                     ├── Authentication (email/password login)
                                     └── Firestore (the itinerary database,
                                         region: europe-west6 / Zurich)
```

### Term-by-term

- **React** — the UI library the app's components (day cards, forms, login
  screen) are built with.
- **Static site** — the build step produces a fixed set of HTML/CSS/JS
  files once; everything runs in the browser afterwards. No server to
  patch, scale, or keep alive.
- **PWA (Progressive Web App)** — the site carries a manifest (name, icon)
  and a service worker (background script) so the browser can install it
  to the home screen, run full-screen, and cache itself for offline use.
  Still just a website — no app store, no native codebase.
- **Vite** — the build tool that compiles/bundles the React + TypeScript
  source into the optimized static files, and generates the service
  worker (via `vite-plugin-pwa`).
- **TypeScript** — JavaScript with type-checking, catching a class of bugs
  before the code runs. Doesn't change what ships to the browser.
- **GitHub Pages** — free static file hosting built into GitHub; serves
  this repo's built output over HTTPS.
- **GitHub Actions (CI/CD)** — automation that runs on every push to
  `main`: install dependencies, run the Vite build, publish to Pages. See
  [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). This is
  the entire deployment process — no manual upload step.
- **Firebase** — Google's managed backend platform. We use two pieces of
  it, reached directly from the browser (no server of ours in between):
  - **Firestore** — a NoSQL document database. One collection, `days`;
    each document is one itinerary day. Real-time: a change on one phone
    appears on the other within moments via a live subscription, not a
    manual refresh. Hosted in Zurich (`europe-west6`), chosen for data
    residency and latency.
  - **Authentication** — email/password login. Exactly two accounts exist,
    created manually in the Firebase console; there is no public sign-up
    flow in the app.
- **Security Rules** — a rules file deployed to Firebase and enforced by
  Google's servers on every database request, independent of the app's
  own code. Ours rejects any read/write unless the signed-in account's
  email is one of the two allow-listed addresses. This is the actual
  access-control boundary — not the visibility of the Firebase config
  values, which are project identifiers, not secrets.
- **HTTPS everywhere** — every connection (browser ↔ GitHub Pages, browser
  ↔ Firebase) is encrypted by default on both platforms.

### Cost

$0. Everything used (GitHub public repo, Pages, Actions minutes; Firebase
Firestore + Authentication) sits comfortably within each platform's free
tier at this scale (2 users, a few hundred KB of data).

## Data model

Each day entry (`src/types.ts`):

| Field | Meaning |
|---|---|
| `date` | ISO date (`YYYY-MM-DD`) |
| `activityType` | `travel` or `stay` |
| `activityTitle` | free-text title |
| `km` | distance driven |
| `overnightPlace` | name of the overnight location |
| `overnightType` | `campground` / `aire` / `parking` / `wildcamp` / `other` |
| `mapsLink` | Google Maps URL for the overnight location |
| `bookingStatus` | `planned` / `requested` / `not_possible` / `confirmed` |
| `price` | cost per night |
| `hookup` / `water` / `dump` | amenity booleans |
| `highlights` | free-text places/things to see |

## Local development

```bash
npm install
npm run dev -- --host   # --host exposes it on your LAN for phone testing
```

Requires a `.env.local` (git-ignored, not committed) with the Firebase web
app config — see [`.env.local.example`](.env.local.example) for the
expected keys. Get the actual values from the Firebase console
(Project settings → Your apps → the registered web app).

To test on a phone: connect it to the same Wi-Fi as your dev machine and
open `http://<your-pc-lan-ip>:5173/motorhome-itinerary/`.

## Deployment

Deployment is automatic: push to `main` and
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds and
publishes to GitHub Pages. The Firebase config is injected at build time
from GitHub Actions repository secrets (**Settings → Secrets and
variables → Actions**, not Environment secrets, not Dependabot secrets —
each of the 6 values below as its own separate secret entry, name and
value only):

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

These values aren't secret in the traditional sense (Firebase's security
model relies on the Firestore security rules, not on hiding them), but
they're still kept out of the committed source so the project isn't tied
to one specific Firebase project by default.

## Firestore security rules

See [`firestore.rules`](firestore.rules) — deployed manually via the
Firebase console (Firestore Database → Rules). Restricts all reads/writes
to the two account email addresses.
