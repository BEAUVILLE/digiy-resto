#!/usr/bin/env bash
# Real contention on actual snapshotted booking function, in fake local DB only.
set -Eeuo pipefail
case "${V32_SYNTHETIC_DB_URL:-}" in
  postgresql://postgres:synthetic-only@127.0.0.1:5432/resto_v32_synthetic) ;;
  *) echo 'LOCAL_BOOKING_SYNTHETIC_ONLY' >&2; exit 78 ;;
esac
tmp="$(mktemp -d)"
locker=""
trap 'test -z "$locker" || kill "$locker" 2>/dev/null || true; rm -rf "$tmp"' EXIT
query_key="SELECT hashtextextended(s.id::text||DATE '2099-06-02'::text||w.id::text||z.id::text,0)
 FROM public.digiy_resa_resto_sites s
 JOIN public.digiy_resa_resto_zones z ON z.site_id=s.id AND z.slug='main'
 JOIN public.digiy_resa_resto_service_windows w ON w.site_id=s.id AND w.service_no=1
 WHERE s.slug='concurrency-fake'"
key="$(psql "$V32_SYNTHETIC_DB_URL" -X -w -At -v ON_ERROR_STOP=1 -c "$query_key")"
[[ "$key" =~ ^-?[0-9]+$ ]] || { echo 'CONCURRENT_LOCK_KEY_UNAVAILABLE' >&2; exit 1; }
# Hold exactly the transaction-scoped advisory key used inside RESTO public_book.
psql "$V32_SYNTHETIC_DB_URL" -X -w -q -v ON_ERROR_STOP=1 \
  -c "BEGIN; SELECT pg_advisory_xact_lock($key); SELECT pg_sleep(12); COMMIT;" \
  >"$tmp/blocker.log" 2>&1 &
locker=$!
held=0
for _ in {1..40}; do
  can_lock="$(psql "$V32_SYNTHETIC_DB_URL" -X -w -At -v ON_ERROR_STOP=1 \
    -c "SELECT pg_try_advisory_xact_lock($key)")"
  if [[ "$can_lock" == "f" ]]; then held=1; break; fi
  sleep 0.1
done
(( held==1 )) || { echo 'CONCURRENT_ADVISORY_LOCK_NOT_HELD' >&2; exit 1; }
booking_sql="SELECT public.digiy_resa_resto_public_book_v1(
  'concurrency-fake','2099-06-02','18:00',1,'main','Fake Concurrent','00000009')"
psql "$V32_SYNTHETIC_DB_URL" -X -w -At -v ON_ERROR_STOP=1 \
  -c "$booking_sql" >"$tmp/one.log" 2>&1 &
one=$!
psql "$V32_SYNTHETIC_DB_URL" -X -w -At -v ON_ERROR_STOP=1 \
  -c "$booking_sql" >"$tmp/two.log" 2>&1 &
two=$!
# Both real booking transactions must be waiting on the intentionally held lock.
blocked=0
for _ in {1..45}; do
  count="$(psql "$V32_SYNTHETIC_DB_URL" -X -w -At -v ON_ERROR_STOP=1 -c \
    "SELECT count(*) FROM pg_stat_activity WHERE datname=current_database()
       AND wait_event_type='Lock' AND query LIKE '%digiy_resa_resto_public_book_v1%'")"
  if (( count>=2 )); then blocked=1; break; fi
  sleep 0.1
done
(( blocked==1 )) || { echo 'CONCURRENT_TWO_WAITERS_NOT_OBSERVED' >&2; exit 1; }
if wait "$one"; then result_one=0; else result_one=1; fi
if wait "$two"; then result_two=0; else result_two=1; fi
if (( result_one+result_two != 1 )); then
 echo 'CONCURRENT_EXPECTED_EXACTLY_ONE_DENIAL' >&2; exit 1
fi
if (( result_one==1 )); then
 grep -q 'Capacité de zone insuffisante' "$tmp/one.log" || { echo 'CONCURRENT_WRONG_ERROR_ONE' >&2; exit 1; }
else
 grep -q '"status": "confirmed"\|"status":"confirmed"' "$tmp/one.log" || { echo 'CONCURRENT_NO_SUCCESS_ONE' >&2; exit 1; }
fi
if (( result_two==1 )); then
 grep -q 'Capacité de zone insuffisante' "$tmp/two.log" || { echo 'CONCURRENT_WRONG_ERROR_TWO' >&2; exit 1; }
else
 grep -q '"status": "confirmed"\|"status":"confirmed"' "$tmp/two.log" || { echo 'CONCURRENT_NO_SUCCESS_TWO' >&2; exit 1; }
fi
tot="$(psql "$V32_SYNTHETIC_DB_URL" -X -w -At -v ON_ERROR_STOP=1 -c \
 "SELECT coalesce(sum(b.guests),0) FROM public.digiy_resa_resto_bookings b
  JOIN public.digiy_resa_resto_sites s ON s.id=b.site_id
  WHERE s.slug='concurrency-fake' AND b.status='confirmed'")"
[[ "$tot" == "1" ]] || { echo 'CONCURRENT_CAPACITY_INVARIANT_BROKEN' >&2; exit 1; }
echo 'RESTO_V32_CONCURRENCY_ADVISORY_LOCK_PASS'
