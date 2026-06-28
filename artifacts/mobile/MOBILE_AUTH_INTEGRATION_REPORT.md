# Mobile Auth Integration Report

Date: 2026-06-27

Scope: Phase 1 Auth backend integration only. No Profile, Dashboard, Vitals, Alerts, AI, Telegram, or ESP/device integration was implemented.

## Recovery Status

- Interrupted auth work left no partial auth integration files in the mobile project.
- `lib/apiClient.ts`, `auth/tokenStorage.ts`, `auth/AuthProvider.tsx`, and `types/auth.ts` were not present before this phase and were created cleanly.
- Initial project health before implementation:
  - `npm run typecheck`: passed.
  - `npx expo install --check`: passed.

## Backend Routes Inspected

From `backend/routes/api.php`:

- `POST /api/register`: public.
- `POST /api/login`: public.
- `POST /api/logout`: authenticated with Sanctum.
- `GET /api/me`: authenticated with Sanctum.

## Backend Auth Contract

From `backend/app/Http/Controllers/Api/AuthController.php`:

### Login

Request:

- `email`
- `password`

Response:

- `message`
- `access_token`
- `token_type`
- `user`

### Register

Request:

- `name`
- `email`
- `password`
- `password_confirmation`
- optional `phone_country_code`
- optional `phone_number`
- optional `date_of_birth`
- optional `gender`
- optional `chronic_conditions`

Response:

- `message`
- `access_token`
- `token_type`
- `user`

### Current User

Response:

- `user`

### Logout

Response:

- `message`

## Web Auth Reference

The Vite web frontend uses a shared API client, stores the returned bearer token, calls `/login` and `/register`, and uses `/logout` as the backend logout contract. Web signup performs a later profile update for profile-only fields after registration.

## Mobile Auth Implementation

- Added `lib/apiClient.ts`.
- Added `types/auth.ts`.
- Added `auth/tokenStorage.ts`.
- Added `auth/AuthProvider.tsx`.
- Wrapped the app in `AuthProvider`.
- Login now calls backend `POST /login`.
- Register now calls backend `POST /register`.
- Logout now calls backend `POST /logout` when possible and always clears local token state.
- Session restore checks stored token and validates it through `GET /me`.
- Protected route logic redirects unauthenticated users away from tabs/protected routes.

## API Base URL

Mobile auth reads the API base from `EXPO_PUBLIC_API_BASE_URL`.

Expected shape:

```text
http(s)://host-or-domain/api
```

No localhost value was hardcoded into source.

## Token Storage

The mobile project currently has `@react-native-async-storage/async-storage` available and does not have `expo-secure-store` installed. Token storage uses AsyncStorage for this phase and should be upgraded to SecureStore in a later hardening pass if approved.

## Payload Mismatches / Deferred Fields

Laravel `/api/register` does not accept these Register Step 2 fields directly:

- `height_cm`
- `weight_kg`
- `blood_type`
- `hospital_name`

The web app sends those through a later Profile update call. Mobile did not implement Profile API in this auth-only phase, so those fields remain UI/local until Phase 2 Profile integration.

## Manual Test Steps

1. Set `EXPO_PUBLIC_API_BASE_URL` to the Laravel `/api` URL.
2. Start Laravel backend.
3. Start Expo.
4. Open Login.
5. Try invalid login and confirm backend validation/error is shown.
6. Try valid login and confirm tabs open.
7. Restart/reload the app and confirm session restores through `/me`.
8. Use Register Step 1 and Step 2 with valid backend-supported fields and confirm tabs open after backend success.
9. Open Profile and tap Sign Out.
10. Confirm backend logout is attempted, local token is cleared, and Login opens.

## Not Implemented In This Phase

- Profile fetch/update.
- Dashboard data.
- Vitals/manual reading save.
- Alerts.
- AI Analysis.
- Telegram.
- ESP/device ingestion.

## Runtime Verification Attempt

Date: 2026-06-27

Backend command confirmed:

```powershell
cd C:\Users\M.Alaa\Desktop\front-g-main\backend
php artisan serve --host=127.0.0.1 --port=8000
```

Mobile API base URL used for local desktop verification:

```text
http://127.0.0.1:8000/api
```

For a physical phone, use the computer LAN IP instead of `127.0.0.1`.

### Checks

- `php artisan route:list --path=api`: passed and confirmed `/api/login`, `/api/register`, `/api/logout`, and `/api/me`.
- Backend `/api/health`: passed.
- `npm run typecheck`: passed.
- `npx expo install --check`: failed with `TypeError: fetch failed`.
- `npx expo start --localhost --port 8094`: failed with `TypeError: fetch failed`.
- `npx expo start --offline --port 8094`: Metro started and reached `Waiting on http://localhost:8094`; dependency validation was skipped in offline mode.

### Backend Auth Endpoint Results

- Invalid login: returned HTTP 401 as expected.
- Register new user: succeeded and returned token/user.
- `GET /api/me` with register token: succeeded.
- Logout: succeeded and returned `Logout successful.`
- `GET /api/me` with the same token after logout: returned HTTP 401 as expected.
- Valid login with the registered user: succeeded and returned token/user.
- `GET /api/me` with valid login token: succeeded.
- `GET /api/me` with an invalid token: returned HTTP 401 as expected.

### In-App Runtime Status

The mobile app could not be fully exercised through the normal Expo runtime because Expo CLI online startup is currently blocked by `TypeError: fetch failed`. Backend auth is verified, and the mobile source still typechecks, but the following UI/runtime checklist remains manual after Expo online startup or a device run is available:

- No token start shows Login.
- Invalid login displays safe error and does not enter tabs.
- Valid login opens tabs.
- App reload restores session through `/me`.
- Profile Sign Out calls logout/clears token/returns to Login.
- Back button does not return to tabs after logout.
- Register flow opens tabs only after backend `/register` success.

### Verification Decision

Backend Auth API is verified. Mobile Auth source is typecheck-clean. Full mobile in-app Auth runtime is not officially verified yet because Expo normal startup is blocked by `TypeError: fetch failed`.

## Expo Web CORS Fix And Completed Runtime Verification

Date: 2026-06-27

### Expo CLI Fetch Diagnosis

The earlier Expo CLI `TypeError: fetch failed` was not reproducible in the recovery run:

- Node: `v24.14.1`
- npm: `11.11.0`
- Expo CLI: `54.0.25`
- npm registry: `https://registry.npmjs.org/`
- npm proxy: `null`
- npm https-proxy: `null`
- `npx expo install --check`: passed.

The likely cause was a temporary network/DNS/Expo registry reachability issue, not project source code.

### CORS Diagnosis

Expo Web was running from:

```text
http://localhost:8094
```

Laravel API was running from:

```text
http://127.0.0.1:8000/api
```

Before the fix, browser preflight to `/api/login` returned HTTP 204 but did not include `Access-Control-Allow-Origin` for `http://localhost:8094`. Direct backend API calls worked outside the browser, so the failing layer was browser CORS for Expo Web, not auth payloads or Laravel auth logic.

### Backend CORS Change

Changed `backend/config/cors.php` to add local Expo Web origins:

- `http://localhost:8094`
- `http://127.0.0.1:8094`

Then ran:

```powershell
php artisan config:clear
```

After restart, preflight returned:

- HTTP 204
- `Access-Control-Allow-Origin: http://localhost:8094`
- `Access-Control-Allow-Methods: POST`
- `Access-Control-Allow-Headers: content-type, authorization`

Actual API responses also include the Expo Web origin.

### Runtime Commands

Backend:

```powershell
cd C:\Users\M.Alaa\Desktop\front-g-main\backend
php artisan serve --host=0.0.0.0 --port=8000
```

Expo Web:

```powershell
cd "C:\Users\M.Alaa\Desktop\front-g-main\replit expo test\Health-Sync-UI\artifacts\mobile"
$env:EXPO_PUBLIC_API_BASE_URL="http://127.0.0.1:8000/api"
npx expo start --web --localhost --port 8094
```

### Auth UI Results

Verified through normal Chrome against Expo Web, without disabling browser security:

- No token start: passed. Login screen appeared; tabs were not shown.
- Protected tabs without auth: passed. Navigating to tabs redirected back to Login.
- Invalid login: passed. UI stayed on Login and showed `Invalid email or password.`
- Valid login: passed. UI called `/api/login`, received HTTP 200, stored session, and opened Dashboard/tabs.
- Session restore: passed. Reload called `/api/me`, received HTTP 200, and restored tabs.
- Logout: passed. Profile Sign Out called `/api/logout`, received HTTP 200, cleared local session, returned to Login, and protected tabs redirected to Login afterward.
- Register: passed. Register Step 1 and Step 2 submitted backend-supported fields only, `/api/register` returned HTTP 201, and tabs opened after real backend success.
- Profile-only fields not sent in Auth phase: confirmed. No `height_cm`, `weight_kg`, `blood_type`, or `hospital_name` API error appeared during register.

Observed auth network calls:

- `OPTIONS /api/login`: 204
- `POST /api/login` invalid: 401
- `POST /api/login` valid: 200
- `OPTIONS /api/me`: 204
- `GET /api/me`: 200
- `OPTIONS /api/logout`: 204
- `POST /api/logout`: 200
- `OPTIONS /api/register`: 204
- `POST /api/register`: 201

### Final Auth Verification Decision

Auth is officially verified for Expo Web local runtime and backend API behavior. Native Expo/physical phone runtime should still use a LAN API URL and can be smoke-tested separately, but it is no longer blocking the next backend integration phase.
