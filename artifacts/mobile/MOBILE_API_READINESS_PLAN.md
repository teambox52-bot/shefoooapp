# Mobile API Readiness Plan

Date: 2026-06-27

Scope: API readiness audit for the approved Expo mobile app. No API integration has been implemented in this pass.

## Current API Readiness Status

| Area | Current State | Gap |
| --- | --- | --- |
| API client | Added for Auth in `lib/apiClient.ts` | Add domain service helpers in later phases |
| API base URL | Auth client reads `EXPO_PUBLIC_API_BASE_URL` | Ensure local/dev env is set before runtime testing |
| Token storage | Added in `auth/tokenStorage.ts` using AsyncStorage | Upgrade to SecureStore later if approved |
| Auth/session state | Added in `auth/AuthProvider.tsx` | Runtime-test against local Laravel backend |
| Protected navigation | Tabs/protected routes redirect without auth | Verify on device after backend is running |
| Logout cleanup | Profile sign out calls AuthProvider logout | Runtime-test backend token revocation from mobile |
| Typed payloads/responses | Not present | Add TypeScript request/response types |
| Service files | Not present | Add service modules per domain |
| Loading states | Present on some auth/manual flows | Standardize per API call |
| Error states | Auth has safe API error handling | Add per-feature API errors in later phases |
| Empty states | Present in some screens | Add backend-driven empty states |
| Form validation | Basic/local only | Add client validation aligned with backend |

## Recommended Mobile API Structure

Suggested future files:

- `src/lib/apiClient.ts` or `lib/apiClient.ts`
- `src/services/authService.ts`
- `src/services/profileService.ts`
- `src/services/dashboardService.ts`
- `src/services/vitalsService.ts`
- `src/services/notificationsService.ts`
- `src/services/aiAnalysisService.ts`
- `src/services/telegramService.ts`
- `src/types/api.ts`
- `src/auth/AuthProvider.tsx`
- `src/auth/tokenStorage.ts`

If this app keeps the current root-level structure, place these under `lib/`, `services/`, `types/`, and `auth/` at the mobile project root instead.

## Screen API Needs

### Auth

- Login: `POST /api/login`
- Register Step 1/2: `POST /api/register`
- Forgot Password: `POST /api/forgot-password`
- Reset Password: `POST /api/reset-password`
- Current user/session restore: `GET /api/me`
- Logout: `POST /api/logout`

### Profile

- Profile view: `GET /api/profile`
- Profile edit save: `PUT/PATCH /api/profile`
- Fields needed:
  - `first_name`
  - `last_name`
  - `email`
  - `phone_country_code`
  - `phone_number`
  - `gender`
  - `date_of_birth`
  - `height_cm`
  - `weight_kg`
  - `blood_type`
  - `hospital_name`
  - `chronic_conditions`

### Dashboard And Vitals

- Dashboard summary: `GET /api/dashboard`
- Vitals history: `GET /api/vitals`
- Manual reading save: `POST /api/vitals`
- Vital detail charts can be derived from `GET /api/vitals?type=...`

### Alerts

- Notifications list: `GET /api/notifications`
- Mark read/read all: `POST/PATCH /api/notifications/...`
- Badge count: from notifications response or dashboard summary.

### AI Analysis

- AI screen: `GET /api/ai-analysis`
- Start with current backend mock/rule-based response.
- Real OpenAI integration is a later phase.

### Telegram

- Status: `GET /api/telegram/status`
- Connect token: existing backend Telegram connect flow, to be confirmed before implementation.
- Disconnect: backend Telegram disconnect endpoint.
- Preferences: backend Telegram preferences endpoint.
- Test message: backend Telegram test-message endpoint.

## Required Integration Rules

- Preserve the current UI layout during API integration.
- Preserve fallback/mock data until each backend endpoint is verified.
- Add loading, error, empty, and retry states per screen.
- Keep auth token storage secure.
- When real AI/OpenAI is implemented later, update both web dashboard and Expo mobile app.
- When real ESP32/device ingestion is implemented later, update both web dashboard and Expo mobile app.

## Risks Before Integration

- Mock data is scattered across many screens, so integration should be staged.
- Profile edit state is currently in memory only.
- Auth integration is source-complete; runtime credential testing remains.
- Manual Reading currently saves via local timeout only.
- Manual Reading picker UI is complete, but saving remains local until the Dashboard/Vitals integration phase.
- Auth API error handling exists; feature-specific API errors remain for later phases.

## Phase 1 Auth Update

Phase 1 Auth integration has now added:

- `lib/apiClient.ts`
- `types/auth.ts`
- `auth/tokenStorage.ts`
- `auth/AuthProvider.tsx`

Auth now uses `EXPO_PUBLIC_API_BASE_URL`, backend `/login`, backend `/register`, backend `/logout`, backend `/me`, token restore, and protected tabs. Remaining service files for Profile, Dashboard, Vitals, Alerts, AI, and Telegram should be added only in their approved phases.
