#!/usr/bin/env bash
# Restore-free disposable synthetic test: no remote URLs, user accounts, or CORE keys.
set -Eeuo pipefail
case "${RESTO_V33_SYNTHETIC_DB_URL:-}" in
  postgresql://postgres:synthetic-only@127.0.0.1:5432/resto_v33_synthetic) ;;
  *) echo 'RESTO_V33_ONLY_LOCAL_SYNTHETIC_DB_ALLOWED' >&2; exit 78 ;;
esac
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
script_dir="$root/tests/resa-resto-v33"
candidate="$root/supabase/candidates/RESA_RESTO_V33_MIDNIGHT_LOOP_CANDIDATE.sql"
export V33_SYNTHETIC_DB_URL="$RESTO_V33_SYNTHETIC_DB_URL"
psql_args=(psql "$RESTO_V33_SYNTHETIC_DB_URL" -X -w -q -v ON_ERROR_STOP=1)
"${psql_args[@]}" -c 'CREATE ROLE anon NOLOGIN;'
"${psql_args[@]}" -f "$script_dir/synthetic-booking-schema.sql"
"${psql_args[@]}" -f "$script_dir/synthetic-booking-functions-snapshot.sql"
bash "$script_dir/assert-before-v33.sh"

log="$(mktemp)"
trap 'rm -f "$log"' EXIT
# Verify the SQL candidate cannot be applied accidentally, even to a fake DB.
if "${psql_args[@]}" -f "$candidate" >"$log" 2>&1; then
  echo 'RESTO_V33_MANUAL_GO_GATE_FAILED' >&2; exit 1
fi
grep -q 'RESTO_V33_MANUAL_SQL_GO_REQUIRED' "$log" || {
  echo 'RESTO_V33_MANUAL_GO_FAILURE_WRONG_REASON' >&2
  tail -n 8 "$log" >&2; exit 1
}
echo 'RESTO_V33_SQL_GATE_PASS'

# The only GO used here is injected into a local throwaway database process.
PGOPTIONS='-c digiy.v33_manual_go=YES' "${psql_args[@]}" -f "$candidate"
"${psql_args[@]}" -f "$script_dir/assert-after-v33.sql"
"${psql_args[@]}" -f "$script_dir/assert-booking-engine.sql"
bash "$script_dir/assert-concurrency.sh"

# Re-application must be refused on a changed function; never blindly replace.
if PGOPTIONS='-c digiy.v33_manual_go=YES' "${psql_args[@]}" -f "$candidate" >"$log" 2>&1; then
  echo 'RESTO_V33_CODE_DRIFT_GATE_FAILED' >&2; exit 1
fi
grep -q 'RESTO_V33_FUNCTION_DRIFT_REBASE_WITH_V32_REQUIRED' "$log" || {
  echo 'RESTO_V33_CODE_DRIFT_FAILURE_WRONG_REASON' >&2
  tail -n 8 "$log" >&2; exit 1
}
echo 'RESTO_V33_CODE_DRIFT_REJECTED'
echo 'RESTO_V33_ISOLATED_ENGINE_PASS'
