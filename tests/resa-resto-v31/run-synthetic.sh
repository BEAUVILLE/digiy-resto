#!/usr/bin/env bash
# LOCAL/CI ONLY — never connect to a Supabase URL and never use real credentials.
set -Eeuo pipefail
test -n "${RESTO_SYNTHETIC_DB_URL:-}" || { echo 'SYNTHETIC_DB_URL_REQUIRED'; exit 78; }
case "$RESTO_SYNTHETIC_DB_URL" in
  postgresql://postgres:synthetic-only@127.0.0.1:5432/resto_v31_synthetic) ;;
  *) echo 'ONLY_LOCAL_SYNTHETIC_DATABASE_ALLOWED'; exit 78;;
esac
script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
root="$(cd "$script_dir/../.." && pwd)"
psql "$RESTO_SYNTHETIC_DB_URL" -X -w -v ON_ERROR_STOP=1 -f "$script_dir/synthetic-functions.sql"
psql "$RESTO_SYNTHETIC_DB_URL" -X -w -v ON_ERROR_STOP=1 -f "$root/supabase/candidates/RESA_RESTO_OWNER_RPC_V31_CANDIDATE.sql"
psql "$RESTO_SYNTHETIC_DB_URL" -X -w -v ON_ERROR_STOP=1 -f "$script_dir/assert-grants.sql"
# Reapplication is harmless; the postconditions stay the same.
psql "$RESTO_SYNTHETIC_DB_URL" -X -w -v ON_ERROR_STOP=1 -f "$root/supabase/candidates/RESA_RESTO_OWNER_RPC_V31_CANDIDATE.sql"
psql "$RESTO_SYNTHETIC_DB_URL" -X -w -v ON_ERROR_STOP=1 -f "$script_dir/assert-grants.sql"
# Test actual SQL role switching in addition to catalog privileges.
bash "$script_dir/assert-execute-roles.sh"
# Replace simple RPC fixtures with 2026-10-09 owner-body snapshots and
# exercise A/B authorization and RLS on fake records only.
psql "$RESTO_SYNTHETIC_DB_URL" -X -w -v ON_ERROR_STOP=1 -f "$script_dir/synthetic-owner-ab.sql"
psql "$RESTO_SYNTHETIC_DB_URL" -X -w -v ON_ERROR_STOP=1 -f "$script_dir/assert-owner-ab.sql"
echo 'RESTO_V31_SYNTHETIC_OWNER_AB_PASS'
echo 'RESTO_V31_SYNTHETIC_GRANTS_PASS'
# Break a function's expected owner contract. The transaction MUST fail before
# changes and never grant anonymous execution as a fallback.
psql "$RESTO_SYNTHETIC_DB_URL" -X -w -v ON_ERROR_STOP=1 -c \
  'ALTER FUNCTION public.digiy_resa_resto_claim_site_by_email_v1(text) SECURITY INVOKER;'
log="$(mktemp)"
trap 'rm -f "$log"' EXIT
if psql "$RESTO_SYNTHETIC_DB_URL" -X -w -v ON_ERROR_STOP=1 \
  -f "$root/supabase/candidates/RESA_RESTO_OWNER_RPC_V31_CANDIDATE.sql" >"$log" 2>&1; then
  echo 'ERROR: unexpected migration accepted function drift' >&2
  exit 1
fi
grep -q 'RESTO_V31_PREFLIGHT_FUNCTION_CONTRACT_DRIFT' "$log"
echo 'RESTO_V31_SYNTHETIC_SCHEMA_DRIFT_REJECTED'
