#!/usr/bin/env python3
"""HealthSync mobile setup and Expo runner."""
from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path


def run(cmd, cwd: Path, timeout: int | None = None):
    try:
        completed = subprocess.run(
            cmd,
            cwd=str(cwd),
            text=True,
            capture_output=True,
            timeout=timeout,
            shell=(os.name == "nt"),
        )
        return completed.returncode, completed.stdout.strip(), completed.stderr.strip()
    except FileNotFoundError as exc:
        return 127, "", str(exc)
    except subprocess.TimeoutExpired as exc:
        return 124, exc.stdout or "", exc.stderr or "Timed out"


def version(command):
    exe = shutil.which(command[0])
    if not exe:
        return False, "not found"
    code, out, err = run(command, Path.cwd(), timeout=20)
    text = out or err
    return code == 0, text.splitlines()[0] if text else "found"


def read_env(path: Path):
    values = {}
    if not path.exists():
        return values
    for line in path.read_text(encoding="utf-8-sig").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip()
    return values


def detect_package_manager(root: Path):
    if (root / "pnpm-lock.yaml").exists():
        return "pnpm"
    if (root / "package-lock.json").exists():
        return "npm"
    if (root / "yarn.lock").exists():
        return "yarn"
    return "npm"


def write_report(root: Path, lines: list[str]):
    report = root / "MOBILE_SETUP_RUN_REPORT.md"
    report.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description="HealthSync mobile setup and Expo runner")
    parser.add_argument("--repo-root", default=None, help="Repository root. Defaults to parent of this tools folder.")
    parser.add_argument("--no-install", action="store_true", help="Skip dependency installation.")
    parser.add_argument("--no-typecheck", action="store_true", help="Skip typecheck.")
    parser.add_argument("--no-start", action="store_true", help="Do not start Expo.")
    parser.add_argument("--check-only", action="store_true", help="Only run preflight checks and write report.")
    args = parser.parse_args()

    script_path = Path(__file__).resolve()
    repo_root = Path(args.repo_root).resolve() if args.repo_root else script_path.parents[1]
    mobile_root = repo_root / "artifacts" / "mobile"
    package_manager = detect_package_manager(repo_root)
    env_path = mobile_root / ".env"
    env_values = read_env(env_path)
    api_base = env_values.get("EXPO_PUBLIC_API_BASE_URL", "")

    statuses: list[tuple[str, str, str]] = []
    def add(name: str, status: str, detail: str = ""):
        statuses.append((name, status, detail))

    add("Repo root", "OK" if repo_root.exists() else "MISSING", str(repo_root))
    add("Mobile root", "OK" if mobile_root.exists() else "MISSING", str(mobile_root))
    add("Root package.json", "OK" if (repo_root / "package.json").exists() else "MISSING", "required for workspace")
    add("Mobile package.json", "OK" if (mobile_root / "package.json").exists() else "MISSING", "required for Expo")
    add("pnpm-workspace.yaml", "OK" if (repo_root / "pnpm-workspace.yaml").exists() else "MISSING", "required for workspace")
    add("Lock file", "OK" if (repo_root / "pnpm-lock.yaml").exists() or (mobile_root / "package-lock.json").exists() else "MISSING", package_manager)
    add("Mobile .env", "OK" if env_path.exists() else "MISSING", str(env_path))
    add("API base URL", "OK" if api_base else "MISSING", api_base or "Set EXPO_PUBLIC_API_BASE_URL in artifacts/mobile/.env")
    add("app.json", "OK" if (mobile_root / "app.json").exists() else "MISSING", "Expo config")
    add("Node", *(lambda x: ("OK", x[1]) if x[0] else ("MISSING", x[1]))(version(["node", "--version"])))
    add("npm", *(lambda x: ("OK", x[1]) if x[0] else ("MISSING", x[1]))(version(["npm", "--version"])))
    add("pnpm", *(lambda x: ("OK", x[1]) if x[0] else ("MISSING", x[1]))(version(["pnpm", "--version"])))
    add("Git", *(lambda x: ("OK", x[1]) if x[0] else ("MISSING", x[1]))(version(["git", "--version"])))

    print("================ HealthSync Mobile Setup ================")
    for name, status, detail in statuses:
        print(f"{name:24} {status:10} {detail}")
    print("=========================================================")

    report_lines = [
        "# Mobile Setup Run Report",
        "",
        f"Generated: {datetime.now().isoformat(timespec='seconds')}",
        f"Repo root: `{repo_root}`",
        f"Mobile root: `{mobile_root}`",
        f"Package manager: `{package_manager}`",
        f"API base URL: `{api_base or 'MISSING'}`",
        "",
        "## Preflight",
        "",
        "| Check | Status | Detail |",
        "| --- | --- | --- |",
    ]
    for name, status, detail in statuses:
        report_lines.append(f"| {name} | {status} | `{detail}` |")

    blocking = [item for item in statuses if item[1] == "MISSING" and item[0] not in {"Git"}]
    if blocking:
        print("\nBlocking setup problems found:")
        for name, _, detail in blocking:
            print(f"- {name}: {detail}")
        report_lines += ["", "## Result", "", "Blocked by missing required files/tools."]
        write_report(repo_root, report_lines)
        return 1

    if args.check_only:
        report_lines += ["", "## Result", "", "Check-only mode completed."]
        write_report(repo_root, report_lines)
        return 0

    if not args.no_install:
        install_cmd = ["pnpm", "install"] if package_manager == "pnpm" else [package_manager, "install"]
        print(f"\nInstalling dependencies: {' '.join(install_cmd)}")
        code, out, err = run(install_cmd, repo_root)
        report_lines += ["", "## Install", "", f"Command: `{' '.join(install_cmd)}`", f"Exit code: `{code}`"]
        if code != 0:
            print(err or out)
            report_lines += ["", "Install failed.", "", "```", err or out, "```"]
            write_report(repo_root, report_lines)
            return code
        print("Install completed.")
    else:
        report_lines += ["", "## Install", "", "Skipped by `--no-install`."]

    if not args.no_typecheck:
        typecheck_cmd = ["pnpm", "--dir", "artifacts/mobile", "run", "typecheck"] if package_manager == "pnpm" else [package_manager, "run", "typecheck"]
        typecheck_cwd = repo_root if package_manager == "pnpm" else mobile_root
        print(f"\nRunning typecheck: {' '.join(typecheck_cmd)}")
        code, out, err = run(typecheck_cmd, typecheck_cwd)
        report_lines += ["", "## Typecheck", "", f"Command: `{' '.join(typecheck_cmd)}`", f"Exit code: `{code}`"]
        if code != 0:
            print(err or out)
            report_lines += ["", "Typecheck failed.", "", "```", err or out, "```"]
            write_report(repo_root, report_lines)
            return code
        print("Typecheck passed.")
    else:
        report_lines += ["", "## Typecheck", "", "Skipped by `--no-typecheck`."]

    start_cmd = ["pnpm", "--dir", "artifacts/mobile", "start"] if package_manager == "pnpm" else [package_manager, "start"]
    report_lines += ["", "## Expo Start", "", f"Command: `{' '.join(start_cmd)}`"]
    write_report(repo_root, report_lines)

    if args.no_start:
        print(f"\nExpo start skipped. To start manually run: {' '.join(start_cmd)}")
        return 0

    print(f"\nStarting Expo: {' '.join(start_cmd)}")
    print("Press Ctrl+C to stop Expo.")
    try:
        subprocess.run(start_cmd, cwd=str(repo_root if package_manager == "pnpm" else mobile_root), shell=(os.name == "nt"))
    except KeyboardInterrupt:
        print("Expo stopped.")
    return 0


if __name__ == "__main__":
    sys.exit(main())


