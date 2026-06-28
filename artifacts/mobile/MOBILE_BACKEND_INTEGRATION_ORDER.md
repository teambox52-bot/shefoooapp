# Mobile Backend Integration Order

Date: 2026-06-27

This order freezes the recommended sequence for connecting the approved Expo mobile UI to the Laravel backend.

## 1. Auth

Implement first because every protected mobile screen depends on authenticated user state.

- `POST /api/login`
- `POST /api/register`
- `POST /api/logout`
- `GET /api/me`
- Secure token storage
- Auth/session provider
- Session restore on app start
- Protected tabs
- Safe logout cleanup even if backend logout fails

Exit criteria:

- Login and register enter tabs only after valid backend auth.
- Reload/restoring app keeps valid sessions.
- Invalid token clears session and returns to Login.
- Logout clears local token and returns to Login.

## 2. Profile

Connect after auth because profile data belongs to the authenticated user.

- `GET /api/profile`
- `PUT/PATCH /api/profile`
- Profile screen display
- Profile edit Step 1 and Step 2 save
- Diagnosed/chronic conditions
- Profile fallback/cache rules

Exit criteria:

- Backend profile is primary.
- Local mock profile is fallback only.
- Profile edit updates backend and then Profile screen.

## 3. Dashboard And Vitals

Connect the main clinical surfaces after profile is stable.

- `GET /api/dashboard`
- Current vitals
- Health score
- Recent readings
- `GET /api/vitals`
- Manual reading save through `POST /api/vitals`
- Detail charts from real history data

Exit criteria:

- Dashboard values come from backend.
- Manual reading appears in history after save.
- Vital detail charts are real-data driven.
- No fake clinical value is shown as real backend data.

## 4. Alerts / Notifications

- Notifications list
- Read/unread state
- Badge count
- Mark read / mark all read

Exit criteria:

- Alerts tab is backend-driven.
- Badge reflects unread count.
- Empty state is shown when no notifications exist.

## 5. AI Analysis

Start with the current backend mock/rule-based AI endpoint before real AI.

- `GET /api/ai-analysis`
- Health score
- Risk level
- Cards
- Recommendations
- Explanation

Real OpenAI integration is later. When real AI/OpenAI is implemented, update both:

- web dashboard
- Expo mobile app

## 6. Telegram

- Telegram status
- Connect/disconnect
- Preferences
- Send test message
- Daily summary later

Exit criteria:

- Profile Telegram section is backend-driven.
- Test message reports safe success/error state.
- Daily summary remains a later dedicated phase.

## 7. ESP / Device Ingestion

Real ESP32/device ingestion is a later dedicated phase.

When real ESP integration is implemented, update both:

- web dashboard
- Expo mobile app

Exit criteria:

- Device data lands in backend.
- Web and mobile vitals/dashboard surfaces read the same backend data.

## Do Not Start With

- Real OpenAI integration
- ESP/device ingestion
- Telegram daily summary
- Broad UI redesign
- Mock data deletion

These are later phases after stable API wiring.
