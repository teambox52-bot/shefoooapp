# Mobile Backend Connection Debug Report

## Detected Paths

| Item | Path |
| --- | --- |
| Project root | `C:\Users\M.Alaa\Desktop\front-g-main` |
| Mobile root | `C:\Users\M.Alaa\Desktop\front-g-main\replit expo test\Health-Sync-UI\artifacts\mobile` |
| Backend root | `C:\Users\M.Alaa\Desktop\front-g-main\backend` |

## Root Cause

The mobile app API client was reading only:

- `EXPO_PUBLIC_API_BASE_URL`

But the mobile `.env` contained only:

- `VITE_API_BASE_URL`

Because Expo client code only exposes `EXPO_PUBLIC_*` variables by default, the app resolved an empty API base URL and showed a generic server reachability error.

## API Base URL Fix

Updated the mobile API client to resolve the base URL safely:

1. Prefer `EXPO_PUBLIC_API_BASE_URL`.
2. Fall back to `VITE_API_BASE_URL` for compatibility.
3. Trim whitespace.
4. Remove trailing slash.
5. Ensure `/api` exists exactly once.

Final resolved API base URL:

```text
https://nest-dean-virginia-acrobat.trycloudflare.com/api
```

## Env Files

Updated:

- `replit expo test/Health-Sync-UI/artifacts/mobile/.env`
- `replit expo test/Health-Sync-UI/artifacts/mobile/.env.example`

Both now include:

```env
EXPO_PUBLIC_API_BASE_URL=https://nest-dean-virginia-acrobat.trycloudflare.com/api
VITE_API_BASE_URL=https://nest-dean-virginia-acrobat.trycloudflare.com/api
```

After changing Expo env, Metro must be restarted with clear cache.

## Backend CORS

Inspected:

- `backend/config/cors.php`
- `backend/config/sanctum.php`
- `backend/.env`
- `backend/routes/api.php`

Backend `.env` has one line each for:

- `APP_URL`
- `FRONTEND_APP_URL`
- `SANCTUM_STATEFUL_DOMAINS`
- `CORS_ALLOWED_ORIGINS`

No duplicate `CORS_ALLOWED_ORIGINS` key was found.

Updated `backend/config/cors.php` to allow temporary Cloudflare demo origins:

```php
'allowed_origins_patterns' => [
    '/^https:\/\/.*\.trycloudflare\.com$/',
],
```

This mainly helps browser/Expo Web contexts. Native Expo mobile uses bearer tokens and is not normally blocked by browser CORS.

## Connectivity Results

Cloudflare backend URL tested:

```text
https://nest-dean-virginia-acrobat.trycloudflare.com
```

Results:

| Test | Result |
| --- | --- |
| `GET /api/health` | `200 OK`, JSON `{ "ok": true, "service": "backend" }` |
| `GET /api/dashboard` with `Accept: application/json` | `401 Unauthorized`, JSON `Unauthenticated.` |
| `POST /api/login` with invalid credentials | `401 Unauthorized`, JSON `Invalid email or password.` |

These prove the Cloudflare backend tunnel is reachable and Laravel API routes are responding correctly.

## Expo Tunnel

Expo tunnel is not required for this fix.

The app can run locally/LAN and call the backend through Cloudflare:

```text
Expo LAN app -> Cloudflare backend URL -> Laravel on port 8000
```

The previous Expo/ngrok error is separate from the backend API connection problem.

## Expo Command Fix

`pnpm exec expo` still failed on this machine with:

```text
'expo' is not recognized as an internal or external command
```

But the local Expo binary works, and pnpm scripts can resolve it. Updated mobile package scripts:

- `start`: `expo start --lan --clear`
- `dev:local`: `expo start --lan --clear --port 8081`
- `dev:web`: `expo start --web --localhost --port 8081`

Verified:

- `pnpm run start -- --help`: passed
- `pnpm run dev:local -- --help`: passed

## Files Changed

- `replit expo test/Health-Sync-UI/artifacts/mobile/lib/apiClient.ts`
- `replit expo test/Health-Sync-UI/artifacts/mobile/.env`
- `replit expo test/Health-Sync-UI/artifacts/mobile/.env.example`
- `replit expo test/Health-Sync-UI/artifacts/mobile/package.json`
- `backend/config/cors.php`
- `MOBILE_BACKEND_CONNECTION_DEBUG_REPORT.md`

## Commands Run

Backend:

```powershell
php artisan optimize:clear
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan route:list --path=dashboard
php artisan route:list --path=api
php artisan route:list --path=health
```

Mobile:

```powershell
pnpm install
pnpm run typecheck
pnpm run start -- --help
pnpm run dev:local -- --help
```

Connectivity:

```powershell
curl.exe -i https://nest-dean-virginia-acrobat.trycloudflare.com/api/health
curl.exe -i -H "Accept: application/json" https://nest-dean-virginia-acrobat.trycloudflare.com/api/dashboard
curl.exe -i -H "Accept: application/json" -H "Content-Type: application/json" --data-binary "@<temp-json>" https://nest-dean-virginia-acrobat.trycloudflare.com/api/login
```

## Current Status

The backend tunnel is reachable and the mobile API base URL resolution is fixed.

Remaining manual step:

Restart Metro with clear cache and retest login in Expo Go:

```powershell
cd "C:\Users\M.Alaa\Desktop\front-g-main\replit expo test\Health-Sync-UI\artifacts\mobile"
pnpm run start
```

If using a physical APK built before this env change, rebuild it because Expo public env values are embedded at build time.

## Runtime Localized AI Payload Fix

After the backend connection started working, the mobile Dashboard received the real backend AI/dashboard payload and crashed with:

```text
Objects are not valid as a React child (found: object with keys {en, ar})
```

Root cause:

- The backend now returns bilingual AI/dashboard text in localized object form such as `{ "en": "...", "ar": "..." }`.
- The Dashboard was still typed and rendered as if `analysis_preview.summary`, `analysis_preview.health_message`, `analysis_preview.risk_level`, and `analysis_preview.recommendations` were always plain strings.

Fix:

- Added safe localized text/list normalization before rendering Dashboard AI preview values.
- Broadened Dashboard AI preview types to accept backend bilingual payloads.
- Added the same defensive handling to Device Measurement result text and AI Analysis risk label.

Files changed:

- `replit expo test/Health-Sync-UI/artifacts/mobile/app/(tabs)/index.tsx`
- `replit expo test/Health-Sync-UI/artifacts/mobile/app/(tabs)/ai-analysis.tsx`
- `replit expo test/Health-Sync-UI/artifacts/mobile/app/device-measurement.tsx`
- `replit expo test/Health-Sync-UI/artifacts/mobile/types/dashboard.ts`
- `replit expo test/Health-Sync-UI/artifacts/mobile/types/aiAnalysis.ts`
- `replit expo test/Health-Sync-UI/artifacts/mobile/types/measurementSession.ts`

Verification:

```powershell
cd "C:\Users\M.Alaa\Desktop\front-g-main\replit expo test\Health-Sync-UI\artifacts\mobile"
pnpm run typecheck
pnpm run start -- --help
```

Result:

- Typecheck passed.
- Expo start command is available.
- The backend connection fix remains unchanged; final API URL is still `https://nest-dean-virginia-acrobat.trycloudflare.com/api`.
