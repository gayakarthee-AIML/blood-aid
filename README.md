# BloodAid

**Verified donors near you, alerted in seconds.**

BloodAid is an emergency blood-request app. A family member or hospital raises a request, BloodAid finds donors who are compatible, eligible and nearby, ranks them with a transparent match score, alerts the chosen donors and tracks the response live until the blood is received.

This repository contains the **clickable prototype**: a single HTML file with dummy data that demonstrates the full flow and runs the real matching logic in the browser. The production design (Flutter + Firebase) is described in the [Technical Design Document](docs/TECHNICAL_DESIGN.md).

## Features

- **Request in under a minute:** blood group, units, hospital and urgency.
- **Compatibility-aware matching:** only donors whose blood group the patient can receive.
- **Transparent match score** out of 100, with a "Why 99%?" breakdown.
- **Choose who to alert,** in a list or on a map.
- **Live tracking:** alerts delivered → donors viewing → donor accepted with ETA → blood received.
- **Donor health first:** donors in cooldown are never alerted, and can set a reminder for when they're eligible.
- **Nearby blood banks** with stock levels for every group.

## Quick start

No install, no build, no server.

1. Clone the repo:
   ```bash
   git clone https://github.com/<your-username>/bloodaid.git
   cd bloodaid
   ```
2. Open `index.html` in any modern browser (double-click it).

That's it. The app needs internet only for Google Fonts and falls back to system fonts offline.

### Optional: serve locally

To view it on your phone over the same Wi-Fi, or to avoid browser restrictions on `file://` pages:

```bash
npm start            # runs `npx serve .` (needs Node.js 18+)
```

Then open the URL it prints. On a phone-width screen the app fills the screen without the phone frame.

### Run the tests

```bash
npm test             # 27 unit tests, no dependencies to install
```

Requires Node.js 18 or later. See [Testing](#testing).

## Environment variables

**The prototype needs no environment variables.** All data is built in and nothing is sent anywhere.

The production app will need the variables below. Copy [`.env.example`](.env.example) to `.env` and fill in your own values. Never commit `.env`.

| Variable | Used for | Where to get it |
|---|---|---|
| `FIREBASE_PROJECT_ID` | Firebase project for Auth, Firestore, Functions | Firebase console → Project settings |
| `FIREBASE_API_KEY` | Client SDK initialisation | Firebase console → Project settings → Your apps |
| `FIREBASE_APP_ID` | Client SDK initialisation | Firebase console → Project settings → Your apps |
| `FIREBASE_MESSAGING_SENDER_ID` | Push notifications (FCM) | Firebase console → Cloud Messaging |
| `GOOGLE_APPLICATION_CREDENTIALS` | Server-side access for Cloud Functions | Path to a service account JSON key |
| `GOOGLE_MAPS_API_KEY` | Maps, geocoding and ETA | Google Cloud console → APIs & Services |
| `SMS_PROVIDER` | Which SMS gateway sends fallback alerts | e.g. `msg91` or `twilio` |
| `SMS_API_KEY` | SMS gateway authentication | Your SMS provider's dashboard |
| `SMS_SENDER_ID` | Registered sender name for SMS (DLT in India) | Your SMS provider's dashboard |
| `ALERT_SMS_FALLBACK_SECONDS` | Wait before sending SMS if push isn't delivered | Default `60` |
| `DONATION_COOLDOWN_DAYS` | Minimum gap between donations | Set from current NBTC guidelines |
| `MAX_ALERT_RADIUS_KM` | How far to search for donors | Default `10` |

## Demo walkthrough

Splash → Sign in (code auto-fills) → Home → **Request blood** → **Find donors** → **Alert donors** → watch the live tracking → **Mark blood as received** → Done.

Also try:

- **Why 99%?** on any donor card to see how the score is built.
- Request **AB−** or **O−** to see the compatibility filter change the results.
- Tap **Wait on home screen** while an alert is running; home shows a live tracking card.
- **Nearby** tab: map plus blood bank stock for all 8 groups.
- **Profile:** availability is locked during cooldown, with a reminder toggle.

## Project structure

```
bloodaid/
├── index.html                  The whole prototype (HTML, CSS, JS)
├── docs/
│   └── TECHNICAL_DESIGN.md     Architecture, data model, matching algorithm, diagrams
├── sample-data/
│   ├── donors.json             8 sample donors
│   ├── blood-banks.json        3 blood banks with stock levels
│   ├── hospitals.json          3 hospitals
│   └── user.json               The logged-in demo user
├── tests/
│   ├── match-engine.test.mjs   Automated tests (node:test)
│   ├── load-app.mjs            Loads the app script into Node for testing
│   └── TEST_CASES.md           Manual UI test cases + sample data table
├── .env.example                Environment variables for the production app
├── package.json                npm start / npm test
└── LICENSE                     MIT
```

## How matching works

1. **Filter** to donors whose blood group the patient can receive (e.g. an O+ patient can receive O+ and O−).
2. **Set aside** donors in cooldown or not taking requests; they're shown but never alerted.
3. **Score** the rest out of 100:

| Factor | Weight |
|---|---|
| Blood match (exact group scores higher than compatible) | 30 |
| Availability | 20 |
| Distance (full within 1 km, zero at 10 km) | 20 |
| Verified donor | 15 |
| Reliability (past response rate) | 10 |
| Eligibility | 5 |

Full details and worked examples are in the [Technical Design Document](docs/TECHNICAL_DESIGN.md#9-matching-algorithm).

## Sample data

The demo uses the data in [`sample-data/`](sample-data), which mirrors the data built into `index.html`. A test checks they stay in sync.

The demo date is fixed at **26 Oct 2026** so the cooldown story stays consistent: the logged-in donor (Aarav, O+) last gave on 12 Aug and is eligible again on 4 Nov.

To change the demo, edit the `<script>` block at the bottom of `index.html`:

- `DONORS`, `BANKS`, `HOSPITALS`, `USER`: dummy data (`x,y` are positions on the 36×28 map grid; you are at 18,14).
- `WEIGHTS`: match-score weights (must add up to 100).
- `COMPAT`: blood compatibility table.
- `TODAY`, `COOLDOWN_DAYS`: demo date and donation gap.
- `ICONS`, `PAL`: the vector icon set and colours.

If you change the data, update `sample-data/` too, or `npm test` will tell you.

## Testing

- **Automated** (`npm test`): matching engine scores, blood compatibility rules, cooldown dates, request scenarios and sample-data consistency.
- **Manual:** [35 UI test cases](tests/TEST_CASES.md) covering sign-in, requests, matching, live tracking, profile, responsiveness and accessibility.

## Tech

- Prototype: HTML, CSS and vanilla JavaScript in one file. No frameworks, no build step.
- Fonts: Bricolage Grotesque, IBM Plex Mono, DM Sans (Google Fonts).
- Tests: Node.js built-in test runner.
- Production (planned): Flutter, Firebase Auth, Cloud Firestore, Cloud Functions, Firebase Cloud Messaging, Google Maps Platform, SMS gateway.

## Disclaimer

BloodAid is a prototype. All people, hospitals and stock levels shown are fictional. It is not a medical device and does not replace hospital cross-matching or clinical eligibility checks.

## License

[MIT](LICENSE)
