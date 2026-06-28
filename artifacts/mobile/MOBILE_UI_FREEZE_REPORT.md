# Mobile UI Freeze Report

Date: 2026-06-27

Scope: Expo mobile app UI freeze and source-level smoke audit only. No backend/API integration was implemented.

## Freeze Status

The current Expo mobile UI is frozen as the approved mobile UI baseline for backend integration planning. The app uses Expo Router, shared UI components, `useColors`, `ThemeProvider`, and local mock/profile state.

## Screens And Flows Checked

Checked from route/source inventory and Metro startup:

- Login: `app/index.tsx`, alias `app/login.tsx`
- Register Step 1: `app/register.tsx`
- Register Step 2: `app/register-profile.tsx`
- Forgot Password: `app/forgot-password.tsx`
- Reset Password: `app/reset-password.tsx`
- Dashboard: `app/(tabs)/index.tsx`
- Health History: `app/(tabs)/history.tsx`
- AI Analysis: `app/(tabs)/ai-analysis.tsx`
- Alerts: `app/(tabs)/alerts.tsx`
- Profile: `app/(tabs)/profile.tsx`
- Profile Edit Step 1: `app/profile/edit-step-1.tsx`
- Profile Edit Step 2: `app/profile/edit-step-2.tsx`
- Blood Pressure detail: `app/vitals/blood-pressure.tsx`
- Heart Rate detail: `app/vitals/heart-rate.tsx`
- Blood Oxygen detail: `app/vitals/blood-oxygen.tsx`
- Blood Glucose detail: `app/vitals/blood-glucose.tsx`
- Manual Reading modal: `app/manual-reading.tsx`
- Sign Out to Login: `app/(tabs)/profile.tsx` uses `/login`
- Light/Dark theme toggle: `app/(tabs)/profile.tsx`, `theme/ThemeProvider.tsx`

## Recent Fix Verification

- Blood Glucose uses `mg/dL` in dashboard, history, alerts, manual reading, and glucose detail screens.
- Dashboard glucose card uses `104 mg/dL`.
- Vital detail charts use `InteractiveLineChart` for Heart Rate, Blood Oxygen, Blood Pressure, and Blood Glucose.
- Health History filter rail has stable chip height and horizontal scrolling.
- Register Step 1 country code selector is interactive and includes Egypt, UAE, Saudi Arabia, Kuwait, Qatar, Bahrain, Oman, Jordan, United States, and United Kingdom.
- Register Step 2 DOB, height, and weight selectors are implemented.
- Hospital directory error was removed from Register Step 2.
- Manual Reading now uses picker modals for date, time, heart rate, blood oxygen, blood glucose, and blood pressure values.
- Profile edit flow updates local profile state and returns to Profile.
- Dark mode theme exists and critical dashboard/AI score cards have dark-readable styling.

## Known UI Issues Or Gaps

- Manual Reading picker gap is resolved. The flow remains frontend-local until the Vitals integration phase.
- Runtime device-level smoke was not performed in this audit; verification is source-level plus TypeScript, dependency, and Metro startup checks.
- Theme preference is in-memory only and does not persist after app restart.
- Login/register/logout are now covered by Phase 1 mobile auth integration. Password reset remains outside this phase.

## Mock And Static Data Locations

Mock/static data is currently scattered across screen files and one profile context:

- `profile/ProfileContext.tsx`: default user/profile mock data.
- `app/(tabs)/index.tsx`: dashboard current vitals, health score, recent readings, AI recommendation copy.
- `app/(tabs)/history.tsx`: `FILTERS` and `ALL_READINGS`.
- `app/(tabs)/alerts.tsx`: `INITIAL_ALERTS`.
- `app/(tabs)/ai-analysis.tsx`: `RECOMMENDATIONS` and `ANALYSES`.
- `app/vitals/blood-pressure.tsx`: blood pressure trend/readings.
- `app/vitals/heart-rate.tsx`: heart rate trend/readings.
- `app/vitals/blood-oxygen.tsx`: oxygen trend/readings.
- `app/vitals/blood-glucose.tsx`: glucose trend/readings and simple status logic.
- `app/register.tsx`: country code list and local register form state.
- `app/register-profile.tsx`: blood types, conditions, height/weight/year lists.
- `app/profile/edit-step-1.tsx`: country code list duplicated from Register Step 1.
- `app/profile/edit-step-2.tsx`: blood types, conditions, height/weight/year lists duplicated from Register Step 2.
- `app/manual-reading.tsx`: local manual reading form state and local save timeout.
- `theme/ThemeProvider.tsx`: in-memory theme mode.

## Freeze Decision

Do not refactor mock data before API integration unless a specific integration task requires it. During integration, move data access into typed service/client modules while preserving UI layout.
