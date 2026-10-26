# BloodAid — Clickable Prototype

A single-file interactive prototype of the BloodAid app: bold, clean vector style, live match-score engine, and a full request-to-donation loop. Dummy data only.

## How to run
Double-click `index.html` to open it in any modern browser. No install or server needed.
(Internet is only used to load the Google Fonts: Bricolage Grotesque, IBM Plex Mono, DM Sans. It still works offline with fallback fonts.)

## Demo flow
Splash → Sign in (OTP auto-fills) → Home → **Request blood** (group, units, hospital, urgency) → **Donors** (ranked by match score, pick who to alert, list or map view) → **Live tracking** (alerts delivered → donors viewing → a donor accepts with ETA) → Mark blood as received → Done.

Also try:
- **Why 99%?** on any donor card to see the score breakdown.
- Request **AB−** or **O−** to see compatibility filtering change the results.
- Tap **Wait on home screen** while an alert is running; the home screen shows a live tracking card.
- **Nearby** tab: map plus blood bank stock for every group.
- **Profile**: availability is locked during the 84-day cooldown, with a reminder toggle.

## Editing
Everything is in the `<script>` block at the bottom of `index.html`:
- `DONORS`, `BANKS`, `HOSPITALS`: dummy data. `x,y` are positions on the 36×28 map grid (you are at 18,14).
- `WEIGHTS`: match-score weights (sum to 100). `COMPAT`: red-cell compatibility table.
- `TODAY`: fixed demo date (26 Oct 2026) so the cooldown story stays consistent. `COOLDOWN_DAYS`: eligibility interval.
- `ICONS`: the vector icon set (drop, hospital, map pins, tab icons). Colours are in `PAL`.

The map is a stylized mock. Replace it with Google Maps in the real Flutter app.
