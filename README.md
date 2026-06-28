# HealthSync Mobile App

This repository contains the HealthSync Expo mobile app only.

It does not include:

- Laravel backend
- Web dashboard/frontend
- ESP32 firmware
- Backend database or AI runtime

The mobile app connects to the backend through environment configuration.

## Private Repository Warning

This repo is prepared for a private graduation/demo workflow. It may include `.env` demo configuration. Do not make this repository public.

## Required Software

- Git
- Node.js LTS
- pnpm
- Expo through `pnpm exec expo` / `npx expo`
- Android phone with Expo Go for development
- Optional Android Studio for native Android builds

## Install

From the repo root:

```powershell
pnpm install
```

## Configure Backend API URL

Edit:

```text
artifacts/mobile/.env
```

The app uses this variable:

```env
EXPO_PUBLIC_API_BASE_URL=http://<BACKEND_PC_IP>:8000/api
```

For Expo Web/local desktop testing you can use:

```env
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api
```

For a physical phone or APK, do not use `127.0.0.1`; use the backend PC LAN IP.

Important: Expo public env values are embedded at bundle/build time. If you change the API URL for an APK build, rebuild the APK.

## Start Backend Separately

The backend is in the separate web/backend repository. Start it there:

```powershell
cd <web-backend-repo>\backend
php artisan serve --host=0.0.0.0 --port=8000
```

## Run Mobile App

From this repo root:

```powershell
pnpm --dir artifacts/mobile start
```

The mobile package also supports:

```powershell
pnpm --dir artifacts/mobile run dev:local
pnpm --dir artifacts/mobile run dev:web
pnpm --dir artifacts/mobile run typecheck
```

## One-Command Helper

```powershell
start-healthsync-mobile.bat
```

The helper runs `tools/healthsync_mobile_cli.py`, checks requirements, writes a setup report, installs dependencies if needed, runs typecheck, and starts Expo.

## ESP32 Local AP Measurement Flow

1. Start the Laravel backend on the demo PC.
2. Set `EXPO_PUBLIC_API_BASE_URL` to `http://<BACKEND_PC_IP>:8000/api`.
3. Run the mobile app.
4. Login.
5. Connect the phone to the ESP32 AP if using local AP mode.
6. Open Dashboard.
7. Tap Start Device Measurement.
8. Detect ESP32.
9. Start full measurement.
10. Confirm readings appear in Dashboard/History/AI after submission.

Network note: if the phone connects to the ESP32 AP, it may lose access to the backend PC unless mobile data or routing allows both networks. If backend submission fails after ESP32 measurement, reconnect the phone to the backend Wi-Fi and retry only if the app still has the result available.

## APK Build Notes

No APK is included in this repo. If EAS is added/configured later, set the correct `EXPO_PUBLIC_API_BASE_URL` before building. This package currently has no `eas.json`.
