#!/usr/bin/env bash
# Reproduction of the original bug ONLY in local synthetic PostgreSQL.
set -Eeuo pipefail
case "${RESTO_V33_SYNTHETIC_DB_URL:-}" in
  postgresql://postgres:synthetic-only@127.0.0.1:5432/resto_v33_synthetic) ;;
  *) echo 'RESTO_V33_REFUSE_ANY_REMOTE_URL' >&2; exit 78;;
esac
tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT
psql "$RESTO_V33_SYNTHETIC_DB_URL" -X -w -q -v ON_ERROR_STOP=1 -c "
 UPDATE public.digiy_resa_resto_service_windows w SET booking_from='00:00',booking_to='23:59'
 FROM public.digiy_resa_resto_sites s WHERE w.site_id=s.id AND s.slug='capacity-fake';"
if PGOPTIONS='-c statement_timeout=750ms' psql "$RESTO_V33_SYNTHETIC_DB_URL" \
  -X -w -q -v ON_ERROR_STOP=1 \
  -c "SELECT count(*) FROM public.digiy_resa_resto_public_availability_v1(
      'capacity-fake',DATE '2099-06-01',1,'main')" >"$tmp" 2>&1; then
  echo 'RESTO_V33_OLD_MIDNIGHT_LOOP_NOT_REPRODUCED' >&2; exit 1
fi
grep -q 'canceling statement due to statement timeout' "$tmp" || {
  echo 'RESTO_V33_REPRODUCTION_FAILED_FOR_WRONG_REASON' >&2
  tail -n 8 "$tmp" >&2; exit 1
}
psql "$RESTO_V33_SYNTHETIC_DB_URL" -X -w -q -v ON_ERROR_STOP=1 -c "
 UPDATE public.digiy_resa_resto_service_windows w SET booking_from='18:00',booking_to='19:00'
 FROM public.digiy_resa_resto_sites s WHERE w.site_id=s.id AND s.slug='capacity-fake';"
echo 'RESTO_V33_ORIGINAL_MIDNIGHT_LOOP_REPRODUCED_UNDER_TIMEOUT'
