#!/usr/bin/env bash
# Real EXECUTE privilege checks against synthetic fixture only, not owner A/B authorization.
set -Eeuo pipefail
: "${RESTO_SYNTHETIC_DB_URL:?SYNTHETIC_DB_URL_REQUIRED}"
case "$RESTO_SYNTHETIC_DB_URL" in
  postgresql://postgres:synthetic-only@127.0.0.1:5432/resto_v31_synthetic) ;;
  *) echo "ONLY_LOCAL_SYNTHETIC_DATABASE_ALLOWED" >&2; exit 78;;
esac
psql_synthetic=(psql "$RESTO_SYNTHETIC_DB_URL" -X -w -q -v ON_ERROR_STOP=1)
log="$(mktemp)"
trap 'rm -f "$log"' EXIT
expect_denied_anon() {
  local label="$1" query="$2"
  if "${psql_synthetic[@]}" -c "SET ROLE anon; SELECT ${query};" >"$log" 2>&1; then
    echo "FAIL: anon unexpectedly executed ${label}" >&2; exit 1
  fi
  if ! grep -qi "permission denied for function" "$log"; then
    echo "FAIL: ${label} failed for a reason other than EXECUTE privilege" >&2
    cat "$log" >&2; exit 1
  fi
}
expect_allowed() {
  local role="$1" label="$2" query="$3"
  if ! "${psql_synthetic[@]}" -c "SET ROLE ${role}; SELECT ${query};" >"$log" 2>&1; then
    echo "FAIL: ${role} cannot execute ${label}" >&2
    cat "$log" >&2; exit 1
  fi
}
claim="public.digiy_resa_resto_claim_site_by_email_v1('synthetic-site')"
refresh="public.digiy_resa_resto_owner_refresh_no_shows_v1('00000000-0000-0000-0000-000000000001'::uuid)"
status="public.digiy_resa_resto_owner_set_booking_status_v1('00000000-0000-0000-0000-000000000002'::uuid,'confirmed')"
book="public.digiy_resa_resto_public_book_v1('synthetic-site','2099-06-01'::date,'19:00'::time,2,'zone','fictitious','000')"
for pair in "claim:$claim" "refresh:$refresh" "status:$status"; do
  label="${pair%%:*}"
  query="${pair#*:}"
  expect_denied_anon "$label" "$query"
  expect_allowed authenticated "$label" "$query"
  expect_allowed service_role "$label" "$query"
done
expect_allowed anon public_booking "$book"
echo "RESTO_V31_SYNTHETIC_ROLE_EXECUTE_PASS"
