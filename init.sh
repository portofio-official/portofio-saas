#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "==> Working directory: $PWD"

if [ ! -f package.json ]; then
  echo "==> No package.json found. Project is not scaffolded yet."
  echo "    Next step: feature setup-001 in feature_list.json — scaffold Next.js + Supabase."
  exit 0
fi

INSTALL_CMD=(npm install)
VERIFY_CMD=(npm run lint)
START_CMD=(npm run dev)

echo "==> Syncing dependencies"
"${INSTALL_CMD[@]}"

echo "==> Running baseline verification"
"${VERIFY_CMD[@]}"

echo "==> Startup command"
printf '    %q' "${START_CMD[@]}"
printf '\n'

if [ "${RUN_START_COMMAND:-0}" = "1" ]; then
  echo "==> Starting the app"
  exec "${START_CMD[@]}"
fi

echo "Set RUN_START_COMMAND=1 if you want init.sh to launch the app directly."
