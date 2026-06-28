# Mobile Profile Integration Report

## Status

Phase 2 Mobile Profile backend integration is officially verified for the Expo Web local runtime.

The interrupted Profile work was recovered safely. The expected Profile service, types, context, Profile screen, and edit flow files were present and compilable. The report file did not exist before closeout.

## Files Inspected

- `services/profileService.ts`
- `types/profile.ts`
- `profile/ProfileContext.tsx`
- `app/(tabs)/profile.tsx`
- `app/profile/edit-step-1.tsx`
- `app/profile/edit-step-2.tsx`
- `auth/AuthProvider.tsx`
- `lib/apiClient.ts`
- `backend/routes/api.php`
- `backend/app/Http/Controllers/Api/ProfileController.php`
- `backend/app/Models/User.php`
- `backend/database/migrations/2026_04_03_000001_add_profile_fields_to_users_table.php`
- `backend/database/migrations/2026_04_22_000003_add_body_metrics_to_users_table.php`
- `backend/database/migrations/2026_06_22_000001_add_extended_profile_fields_to_users_table.php`
- `src/lib/api.ts`
- `src/pages/ProfilePage.tsx`
- `src/lib/health-data.ts`

## Files Changed

- `services/profileService.ts`
- `types/profile.ts`
- `profile/ProfileContext.tsx`
- `app/(tabs)/profile.tsx`
- `app/profile/edit-step-1.tsx`
- `app/profile/edit-step-2.tsx`
- `MOBILE_PROFILE_INTEGRATION_REPORT.md`

No Laravel backend files, web dashboard files, Dashboard/Vitals/Alerts/AI/Telegram mobile screens, or mock data files were changed.

## Backend Profile Routes

Protected by Sanctum auth:

- `GET /api/profile` -> `ProfileController@show`
- `PUT /api/profile` -> `ProfileController@update`
- `PATCH /api/profile` -> `ProfileController@update`
- `POST /api/profile/update` -> `ProfileController@update`

The mobile app uses:

- `GET /profile`
- `PATCH /profile`

through the shared mobile API client, whose base URL comes from `EXPO_PUBLIC_API_BASE_URL`.

## Backend Request Payload

`PATCH /api/profile` accepts:

- `name`
- `phone_country_code`
- `phone_number`
- `date_of_birth`
- `gender`
- `chronic_conditions`
- `height_cm`
- `weight_kg`
- `blood_type`
- `hospital_name`
- `avatar`

The mobile Profile save sends:

```json
{
  "name": "First Last",
  "phone_country_code": "+20",
  "phone_number": "1012345678",
  "date_of_birth": "1990-05-12",
  "gender": "male",
  "chronic_conditions": ["hypertension", "diabetes_type_2", "asthma"],
  "height_cm": 182,
  "weight_kg": 78,
  "blood_type": "A+",
  "hospital_name": "Verified Medical Center"
}
```

Phone numbers are normalized to digits for the backend regex.

## Backend Response Shape

`GET /api/profile` returns:

```json
{
  "user": { "...": "BackendUser fields" }
}
```

`PATCH /api/profile` returns:

```json
{
  "message": "Profile updated successfully.",
  "user": { "...": "BackendUser fields" }
}
```

## Supported Fields

Verified supported from backend:

- `name`
- `phone_country_code`
- `phone_number`
- `gender`
- `date_of_birth`
- `height_cm`
- `weight_kg`
- `blood_type`
- `hospital_name`
- `chronic_conditions`

The mobile UI maps backend chronic condition codes to readable chips and maps chips back to backend codes on save.

## Missing Or Deferred Fields

- `email` is returned by the backend user response and displayed in the mobile Edit Step 1 form.
- The backend Profile update endpoint does not accept email changes.
- To avoid fake persistence, the mobile email field is read-only during Phase 2.
- Email update should remain a future account-management/backend feature if needed.

## Mock And Fallback Behavior

- Existing Profile mock data remains as a fallback only before auth or if backend profile fetch fails.
- Backend profile data is primary after login.
- Profile save no longer uses mock-only local persistence for integrated Profile fields.
- Dashboard, Vitals, Manual Reading, Alerts, AI, Telegram, and ESP/device mock behavior was not changed in this phase.

## Loading, Error, And Success Behavior

- `ProfileContext` exposes profile loading, saving, error, and success status.
- Profile screen shows safe status feedback for loading, saving, success, and errors.
- Edit Step 2 shows backend save errors without changing the approved layout.
- Backend response data is used after save.

## Runtime UI Verification

Local runtime:

- Backend: `http://127.0.0.1:8000`
- Expo Web: `http://localhost:8094`
- API base URL used in shell: `http://127.0.0.1:8000/api`

Runtime test account:

- Disposable local test user created for verification.

Results:

- Login through the mobile UI succeeded and opened tabs.
- Profile screen fetched backend data and displayed:
  - name
  - blood type
  - age from date of birth
  - height
  - weight
  - diagnosed conditions
  - date of birth
  - hospital name
- Edit Step 1 prefilled from backend profile data.
- Edit Step 2 prefilled from backend profile data.
- Name, phone, hospital, and chronic conditions were updated through the mobile UI.
- Save called the backend profile update endpoint and returned success.
- Profile screen immediately showed updated backend response data.
- Fresh backend read confirmed persisted values:
  - `name`: `Verified Profile`
  - `phone_country_code`: `+20`
  - `phone_number`: `1012345678`
  - `date_of_birth`: `1990-05-12`
  - `height_cm`: `182`
  - `weight_kg`: `78`
  - `blood_type`: `A+`
  - `hospital_name`: `Verified Medical Center`
  - `chronic_conditions`: `hypertension`, `diabetes_type_2`, `asthma`
- Reload restored the authenticated session and showed the persisted Profile values.
- Profile Sign Out returned to Login.

## Commands Run

```powershell
npm run typecheck
```

Result: passed.

```powershell
npx expo install --check
```

Result: passed. Dependencies are up to date.

```powershell
php artisan route:list --path=profile
```

Result: `GET`, `PUT`, `PATCH`, and `POST /api/profile/update` profile routes are registered.

```powershell
php artisan serve --host=0.0.0.0 --port=8000
```

Result: backend was already running and health check returned JSON `ok: true`.

```powershell
$env:EXPO_PUBLIC_API_BASE_URL="http://127.0.0.1:8000/api"
npx expo start --web --localhost --port 8094
```

Result: Expo Web was running and returned HTTP 200.

## Official Verification

Phase 2 Profile backend integration is officially verified.

## Recommended Next Phase

Phase 3 Dashboard + Vitals backend integration.
