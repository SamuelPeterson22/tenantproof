#!/usr/bin/env sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
CLI="$ROOT/.tools/supabase-cli"
APP="$ROOT/test/integration/app"
STATUS_FILE=$(mktemp)
trap 'rm -f "$STATUS_FILE"; if [ "${TENANTPROOF_KEEP_STACK:-0}" != "1" ]; then "$CLI" stop --workdir "$APP" --yes >/dev/null 2>&1 || true; fi' EXIT

if [ ! -x "$CLI" ]; then
  echo "Missing $CLI. Install the standalone Supabase CLI binary first." >&2
  exit 1
fi

docker info >/dev/null
"$CLI" stop --workdir "$APP" --yes >/dev/null 2>&1 || true
"$CLI" start \
  --workdir "$APP" \
  --exclude edge-runtime,imgproxy,studio,realtime,storage-api,postgres-meta,logflare,mailpit,supavisor,vector \
  --yes
"$CLI" db reset --workdir "$APP" --yes
"$CLI" status --workdir "$APP" -o env > "$STATUS_FILE"

node "$ROOT/bin/tenantproof.js" verify --project "$APP"
node "$ROOT/bin/tenantproof.js" plan --project "$APP"
node "$ROOT/test/integration/run-e2e.js" "$STATUS_FILE"
