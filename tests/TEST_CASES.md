# Test Cases

BloodAid is tested two ways:

1. **Automated:** `npm test` runs 27 unit tests on the matching engine, blood compatibility rules, eligibility dates and sample data (`tests/match-engine.test.mjs`). No browser needed.
2. **Manual:** the UI walkthrough below. Open `index.html` and follow each case.

All cases use the sample data in [`sample-data/`](../sample-data) and the fixed demo date **26 Oct 2026**.

## Sample data at a glance

| Donor | Group | Distance | Verified | Reliability | Status | Score for an O+ request |
|---|---|---|---|---|---|---|
| Rahul | O+ | 1.2 km | Yes | 96% | Ready | **99%** |
| Priya | O− | 2.8 km | Yes | 81% | Ready | **91%** |
| Vikram | O− | 6.3 km | No | 70% | Ready | **67%** |
| Kavya | O+ | 3.4 km | Yes | 74% | Cooldown until 9 Nov | not offered |
| Sanjay | O+ | 5.7 km | Yes | 65% | Not taking requests | not offered |
| Imran | B+ | 2.0 km | Yes | 88% | Ready | incompatible |
| Divya | A+ | 4.6 km | Yes | 90% | Ready | incompatible |
| Meera | AB+ | 1.9 km | Yes | 84% | Ready | incompatible |

Logged-in user: **Aarav Menon**, O+, last donated 12 Aug 2026, eligible again 4 Nov 2026 (9 days left).

## Manual UI test cases

### Sign-in

| ID | Steps | Expected result |
|---|---|---|
| TC-01 | Open the app, tap **Get started** | Sign-in screen with phone number field |
| TC-02 | Tap **Send code** | Code boxes fill with 4-2-1-7 one by one; resend countdown starts at 0:30; **Verify** becomes enabled after the 4th digit |
| TC-03 | On the code step, tap **Change** | Returns to the phone number field |
| TC-04 | Tap **Verify & continue** | Home screen, greeting "Aarav", tab bar visible |

### Home and donor status

| ID | Steps | Expected result |
|---|---|---|
| TC-05 | Look at "You as a donor" | Shows "9 days to go", Cooldown badge, last gave 12 Aug, eligible 4 Nov |
| TC-06 | Look at "Blood banks near you" | 3 banks; O+ stock shown as ✓ (City Central), low (Sri Ramachandra), out (Apollo) |
| TC-07 | Tap a blood bank row | Opens Nearby tab with that bank selected on the map |

### Request blood

| ID | Steps | Expected result |
|---|---|---|
| TC-08 | Tap **Request blood** | Form with O+ selected, 2 units, ABC General Hospital, Critical |
| TC-09 | Select each blood group | "Can receive from" updates (e.g. AB− → AB−, A−, B−, O−) and the ready-donor count updates |
| TC-10 | Tap − until 1, then + until 6 | − disables at 1 unit, + disables at 6 units; "unit" vs "units" is correct |
| TC-11 | With O+ selected, read the hint above the button | "3 compatible donors ready nearby" |

### Donor matching

| ID | Steps | Expected result |
|---|---|---|
| TC-12 | O+ request → **Find donors** | Ready list: Rahul 99%, Priya 91%, Vikram 67%; all three pre-selected |
| TC-13 | Same screen, scroll down | "Not available now": Kavya (cooldown, eligible from 9 Nov) and Sanjay (not taking requests) |
| TC-14 | Tap **Why 99%?** on Rahul | Breakdown: blood 30/30, availability 20/20, distance 20/20, verified 15/15, reliability 10/10, eligibility 5/5 |
| TC-15 | Tap a donor card to deselect | Card loses red shadow; button reads "Alert 2 donors" |
| TC-16 | Deselect all donors | Button disabled, reads "Select donors to alert"; Select all/Clear toggles |
| TC-17 | Switch to **Map** | Pins for ready donors, compatible blood banks and the hospital; tapping a pin shows details with Add/Remove |
| TC-18 | Request **AB−** → Find donors | Ready: Priya and Vikram only |
| TC-19 | Request **O−** → Find donors | Only O− donors appear |
| TC-20 | Tap **Edit** in the summary row | Returns to the request form with values kept |

### Alert and live tracking

| ID | Steps | Expected result |
|---|---|---|
| TC-21 | Alert 3 donors | Tracking screen: "Alerting 3 donors…", best match 99% |
| TC-22 | Wait about 5 seconds | Timeline advances: delivered → viewing (2 of 3) → Rahul accepted; header changes to "Rahul is on the way", ETA 11 min |
| TC-23 | During an alert, tap **Wait on home screen** | Home shows a dark live card with the current status; tapping it returns to tracking |
| TC-24 | Leave tracking before Rahul accepts | A toast says "Rahul accepted your request" |
| TC-25 | Tap **Cancel request** once | Button changes to "Tap again to cancel request" and resets after 3 seconds |
| TC-26 | Tap **Cancel request** twice | Request cancelled, back on home, toast confirms donors were told |
| TC-27 | After acceptance, tap **Mark blood as received**, then **Done** | "Donation complete", then home with no active request |

### Nearby and profile

| ID | Steps | Expected result |
|---|---|---|
| TC-28 | Open **Nearby** tab | Map plus stock grid for all 8 groups per bank; O+ outlined; out-of-stock groups struck through |
| TC-29 | Open **Profile** | "Visible to requesters" is off and locked during cooldown; cooldown note shows 9 days |
| TC-30 | Toggle **Remind me when eligible** | Toast confirms reminder on 4 Nov / reminder off |
| TC-31 | Tap the centre **Request** tab with no active request | Opens the request form |
| TC-32 | Tap the **Request** tab (bell) with no active request | Toast: no active request |

### Responsiveness and accessibility

| ID | Steps | Expected result |
|---|---|---|
| TC-33 | Open on a phone or a window narrower than 440 px | App fills the screen without the phone frame |
| TC-34 | Navigate with Tab and Enter only | Every control is reachable and shows a red focus ring |
| TC-35 | Turn on "reduce motion" in the OS | Animations stop; everything still works |
