# Mobile File Inventory

## Included

| File/folder | Purpose | Why required | Safe for private repo? | Remove before public release? |
| --- | --- | --- | --- | --- |
| `package.json` | Workspace scripts and pnpm enforcement | Required for workspace install/typecheck | Yes | No |
| `pnpm-workspace.yaml` | Workspace package layout and dependency catalog | Required because mobile depends on workspace catalog and package | Yes | No |
| `pnpm-lock.yaml` | Locked dependency versions | Required for reproducible install | Yes | No |
| `.npmrc` | pnpm/npm workspace config | Required to preserve install behavior | Yes | Review |
| `tsconfig.base.json` | Shared TypeScript config | Required by `lib/api-client-react` | Yes | No |
| `tsconfig.json` | Root TS project references | Required for workspace typecheck | Yes | No |
| `artifacts/mobile/` | Expo mobile app | Main app source | Yes | No |
| `artifacts/mobile/package.json` | Mobile package scripts/deps | Required to run Expo | Yes | No |
| `artifacts/mobile/.env` | Private demo API URL config | Allowed because repo is private | Private only | Yes |
| `artifacts/mobile/.env.example` | Safe env template | Setup documentation | Yes | No |
| `lib/api-client-react/` | Workspace package dependency | Mobile TypeScript references `../../lib/api-client-react` | Yes | No |
| `tools/healthsync_mobile_cli.py` | Setup/run helper | Helps demo PC setup | Yes | No |
| `start-healthsync-mobile.bat` | Windows launcher | Convenience runner | Yes | No |
| `README.md` | Setup guide | Required for another PC | Yes | No |
| `RUN_MOBILE_DEMO.md` | Demo runbook | Required for demo flow | Yes | No |
| `PRIVATE_REPO_NOTICE.md` | Private repo warning | Required because `.env` is included | Yes | No |

## Explicit Include Decisions

| Item | Included? | Why |
| --- | --- | --- |
| `pnpm-workspace.yaml` | Yes | Mobile uses pnpm catalog/workspace dependency resolution |
| `pnpm-lock.yaml` | Yes | Reproducible install |
| Root `package.json` | Yes | Workspace scripts and pnpm guard |
| Mobile `package.json` | Yes | Expo scripts and dependencies |
| Mobile `.env` | Yes | Private demo repo; API base config required |
| Mobile `.env.example` | Yes | Setup template |

## Excluded

| Excluded | Reason |
| --- | --- |
| Laravel backend | Separate web/backend repo owns backend |
| Web frontend source | This is mobile-only repo |
| `node_modules/` | Generated dependencies |
| `.expo/` | Generated Expo cache |
| `.git/` | New repo will initialize its own Git history |
| build outputs / `dist/` / `build/` | Generated artifacts |
| APK/AAB files | Not included; build separately |
| backend `.env` / database | Backend not included |
| Python AI venv / AI model | Backend-owned, not mobile-owned |
| logs/cache/temp files | Generated noise |
