# Run Mobile Demo

1. Install Git, Node.js LTS, and pnpm.
2. Clone/open this private repo.
3. Install dependencies:

```powershell
pnpm install
```

4. Start the separate Laravel backend from the web/backend repo:

```powershell
cd <web-backend-repo>\backend
php artisan serve --host=0.0.0.0 --port=8000
```

5. Find the backend PC IP:

```powershell
ipconfig
```

6. Edit `artifacts/mobile/.env`:

```env
EXPO_PUBLIC_API_BASE_URL=http://<BACKEND_PC_IP>:8000/api
```

7. Start Expo:

```powershell
pnpm --dir artifacts/mobile start
```

8. Open in Expo Go or run in the browser as needed.

## Backend API Reminder

The mobile app expects the backend `/api` base URL. Example:

```text
http://192.168.1.20:8000/api
```

## Device Measurement Demo

- ESP32 firmware is not included in this repo.
- Backend measurement-session support is in the separate backend repo.
- Local AP ESP32 URL is `http://192.168.4.1`.
- The mobile app uses the existing ESP32 local APIs and then submits results to the backend under the logged-in user.
