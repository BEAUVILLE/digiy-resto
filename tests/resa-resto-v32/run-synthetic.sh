#!/usr/bin/env bash
# V32 TEST ONLY. Whitelisted fake local database, no Supabase credentials / internet.
set -Eeuo pipefail
case "${RESTO_V32_SYNTHETIC_DB_URL:-}" in
  postgresql://postgres:synthetic-only@127.0.0.1:5432/resto_v32_synthetic) ;;
  *) echo 'RESTO_V32_ONLY_LOCAL_SYNTHETIC_DB_ALLOWED' >&2; exit 78;;
esac
script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
root="$(cd -- "$script_dir/../.." && pwd)"
export V32_SYNTHETIC_DB_URL="$RESTO_V32_SYNTHETIC_DB_URL"
candidate="$root/supabase/candidates/RESA_RESTO_V32_LOCAL_TIME_CANDIDATE.sql"
psql_synthetic=(psql "$RESTO_V32_SYNTHETIC_DB_URL" -X -w -q -v ON_ERROR_STOP=1)
"${psql_synthetic[@]}" -c 'CREATE ROLE anon NOLOGIN;'
"${psql_synthetic[@]}" -f "$script_dir/synthetic-booking-schema.sql"
"${psql_synthetic[@]}" -f "$script_dir/synthetic-booking-functions-snapshot.sql"
# Show that the 2026-10-09 original function previously allowed historical bookings;
# assertions create no durable rows, always ROLLBACK.
"${psql_synthetic[@]}" -f "$script_dir/assert-before-v32.sql"
# No explicitly authorized session means the candidate MUST be rejected.
log="$(mktemp)"
trap 'rm -f "$log"' EXIT
if "${psql_synthetic[@]}" -f "$candidate" >"$log" 2>&1; then
  echo 'RESTO_V32_UNAUTHORIZED_CANDIDATE_APPLIED' >&2; exit 1
fi
grep -q 'RESTO_V32_EXPLICIT_MANUAL_GO_REQUIRED' "$log" || {
  echo 'RESTO_V32_UNAUTHORIZED_CANDIDATE_FAILED_FOR_WRONG_REASON' >&2
  tail -n 8 "$log" >&2; exit 1
}
echo 'RESTO_V32_UNAUTHORIZED_SQL_BLOCKED'
# Explicit acceptance is permitted ONLY against this LOCAL disposable database.
PGOPTIONS='-c digiy.v32_manual_go=YES' "${psql_synthetic[@]}" -f "$candidate"
"${psql_synthetic[@]}" -f "$script_dir/assert-after-v32.sql"
# Re-run V31 engine baseline against the corrected SQL in same synthetic DB.
"${psql_synthetic[@]}" -f "$script_dir/assert-booking-engine.sql"
bash "$script_dir/assert-concurrency.sh"
echo 'RESTO_V32_ISOLATED_CLOCK_AND_ENGINE_PASS'
