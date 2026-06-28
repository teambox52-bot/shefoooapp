# Mobile Dashboard + Vitals Integration Report

## Status

Phase 3 Mobile Dashboard + Vitals backend integration is officially verified for the Expo Web local runtime.

Phase gates were satisfied before starting:

- Phase 1 Auth was already officially verified.
- Phase 2 Profile was already officially verified.

## Files Changed

- `types/dashboard.ts`
- `types/vitals.ts`
- `services/dashboardService.ts`
- `services/vitalsService.ts`
- `lib/vitals.ts`
- `components/VitalDetailScreen.tsx`
- `app/(tabs)/index.tsx`
- `app/(tabs)/history.tsx`
- `app/manual-reading.tsx`
- `app/vitals/blood-pressure.tsx`
- `app/vitals/heart-rate.tsx`
- `app/vitals/blood-oxygen.tsx`
- `app/vitals/blood-glucose.tsx`
- `MOBILE_DASHBOARD_VITALS_INTEGRATION_REPORT.md`

No Laravel backend code, web dashboard code, Alerts, AI, Telegram, ESP/device, or unrelated mock files were changed.

## Backend Routes Inspected

Protected by Sanctum auth:

- `GET /api/dashboard` -> `DashboardController@index`
- `GET /api/vitals` -> `VitalSignController@index`
- `POST /api/vitals` -> `VitalSignController@store`
- `GET /api/recommendations/latest` -> `VitalSignController@latestRecommendation`
- `GET /api/summary/today` -> `VitalSignController@todaySummary`

The expected `/api/vital-signs` routes do not exist in this backend. The mobile app follows the actual backend and web frontend contract: `/api/vitals`.

## Backend Payloads

`POST /api/vitals` accepts:

- `type`
- `value`
- `systolic`
- `diastolic`
- `status`
- `measured_at`
- `source`

Backend vital types:

- `blood_pressure`
- `heart_rate`
- `oxygen`
- `blood_sugar`

Mobile-to-backend type mapping:

- `blood-pressure` -> `blood_pressure`
- `heart-rate` -> `heart_rate`
- `blood-oxygen` -> `oxygen`
- `blood-glucose` -> `blood_sugar`

Manual reading payload examples:

```json
{
  "type": "heart_rate",
  "value": 75,
  "measured_at": "2026-06-28T01:49:00.000Z",
  "source": "manual"
}
```

```json
{
  "type": "blood_pressure",
  "systolic": 125,
  "diastolic": 80,
  "measured_at": "2026-06-28T01:51:00.000Z",
  "source": "manual"
}
```

```json
{
  "type": "blood_sugar",
  "value": 107,
  "measured_at": "2026-06-28T01:51:00.000Z",
  "source": "manual"
}
```

## Backend Response Shapes

`GET /api/dashboard` returns:

- `user`
- `current_vitals`
- `recent_vitals`
- `latest_analysis`
- `analysis_preview`
- `notifications_count`
- `recent_notifications`

`GET /api/vitals` returns:

- `items`
- `current`

`POST /api/vitals` returns:

- `message`
- `data`
- `recommendation`
- `alert_created`

Vital item fields used by mobile:

- `id`
- `type`
- `value`
- `numeric_value`
- `systolic`
- `diastolic`
- `status`
- `source`
- `measured_at`
- `created_at`

## Web Reference Inspected

The existing Vite web app uses:

- `fetchDashboard()` -> `GET /dashboard`
- `fetchVitals(type?)` -> `GET /vitals`
- `createVital(payload)` -> `POST /vitals`
- `fetchLatestRecommendation()` -> `GET /recommendations/latest`
- `fetchTodaySummary()` -> `GET /summary/today`

The mobile implementation follows the same backend endpoint family.

## Dashboard Integration

Dashboard now loads backend data on focus after auth is restored.

Backend-driven fields:

- user name
- health score from `analysis_preview.health_score`
- risk label / health message / recommendation preview
- current vitals
- recent readings

Safe behavior:

- Shows loading status while fetching.
- Shows backend error safely.
- Uses `--` and empty states when no backend readings exist.
- Does not present mock clinical values as backend data.

## History Integration

History now loads backend readings from `GET /api/vitals`.

Filters use backend data:

- All
- Blood Pressure
- Heart Rate
- Blood Oxygen
- Blood Glucose

Safe behavior:

- Shows loading status while fetching.
- Shows backend error safely.
- Shows empty state when there are no backend readings.
- Keeps filter chip row layout unchanged.

## Manual Reading Integration

Manual Reading now saves through `POST /api/vitals`.

Verified UI saves:

- Heart Rate: `75 bpm`
- Blood Pressure: `125/80 mmHg`
- Blood Glucose: `107 mg/dL`

After save:

- The app navigates to History.
- History refetches backend readings.
- Saved readings appear from backend data.

Deferred backend fields:

- `notes` are still collected in the mobile UI but are not sent because backend `vital_signs` does not currently accept a notes field.
- Blood glucose reading context (`Fasting`, `Random`, `Post-meal`) is still UI-only because backend does not currently accept a glucose context field.

These were not faked or called complete.

## Vital Detail Screens

The four vital detail screens now use a shared backend-backed component:

- Blood Pressure -> `GET /api/vitals?type=blood_pressure`
- Heart Rate -> `GET /api/vitals?type=heart_rate`
- Blood Oxygen -> `GET /api/vitals?type=oxygen`
- Blood Glucose -> `GET /api/vitals?type=blood_sugar`

Each screen keeps:

- current reading card
- summary row
- interactive line chart
- reading history list
- recommendation card

Safe behavior:

- Fetches only after Auth status is authenticated.
- Shows loading/error state.
- Shows empty chart/history state if no backend readings exist.
- Blood glucose remains `mg/dL` everywhere.

## Runtime Verification

Local runtime:

- Backend: `http://127.0.0.1:8000`
- Expo Web: `http://localhost:8094`
- API base URL used by Expo shell: `http://127.0.0.1:8000/api`

Disposable local test user:

- Created through backend API.
- Seeded with initial vitals through backend API.
- Used for Expo Web UI verification.

Results:

- Login through mobile UI succeeded.
- Dashboard loaded backend user name, health score, current vitals, recent readings, and backend recommendation preview.
- Dashboard showed glucose in `mg/dL`.
- History loaded backend readings.
- History filters worked on backend data.
- Manual Heart Rate save succeeded and appeared in History.
- Manual Blood Pressure save succeeded with systolic/diastolic values and appeared in History.
- Manual Blood Glucose save succeeded in `mg/dL` and appeared in History.
- Blood Pressure detail showed backend chart/history.
- Heart Rate detail showed backend chart/history.
- Blood Oxygen detail showed backend chart/history.
- Blood Glucose detail showed backend chart/history and `mg/dL`.
- Reload/session restore worked after saved readings.
- Dashboard showed persisted newer backend readings after app navigation.
- Profile screen still loaded after Phase 3 changes.

Backend confirmation after runtime:

- `GET /api/vitals` returned 7 readings.
- `GET /api/dashboard` returned 4 current vitals.
- Latest backend readings included:
  - `blood_sugar:107`
  - `blood_pressure:125/80`
  - `heart_rate:75`
  - `oxygen:97`

## Commands Run

```powershell
php artisan route:list --path=dashboard
php artisan route:list --path=vitals
php artisan route:list --path=recommendations
php artisan route:list --path=summary
```

Result: expected backend routes are registered.

```powershell
npm run typecheck
```

Result: passed.

```powershell
npx expo install --check
```

Result: passed. Dependencies are up to date.

Backend and Expo Web were already running and responding:

- Backend health check returned JSON `ok: true`.
- Expo Web returned HTTP 200.

## Official Verification

Phase 3 Dashboard + Vitals backend integration is officially verified.

## Recommended Next Phase

Phase 4 Mobile Alerts / Notifications backend integration.
