#!/usr/bin/env sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
CLI="$ROOT/.tools/supabase-cli"
APP="$ROOT/test/integration/app"
STATUS_FILE=$(mktemp)
trap '"$CLI" db reset --workdir "$APP" --yes >/dev/null 2>&1 || true; "$CLI" stop --workdir "$APP" --yes >/dev/null 2>&1 || true; rm -f "$STATUS_FILE"' EXIT

TENANTPROOF_KEEP_STACK=1 "$ROOT/test/integration/run-local.sh"
"$CLI" db reset --workdir "$APP" --yes
docker exec supabase_db_app psql -U postgres -d postgres -c \
  'create policy "regression leak" on public.invoices for select to authenticated using (true);'
"$CLI" status --workdir "$APP" -o env > "$STATUS_FILE"

if node "$ROOT/test/integration/run-e2e.js" "$STATUS_FILE"; then
  echo "Expected TenantProof to detect the injected cross-tenant leak." >&2
  exit 1
fi

echo "TenantProof correctly detected the injected cross-tenant leak."
