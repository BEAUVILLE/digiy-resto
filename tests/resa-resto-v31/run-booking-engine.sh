#!/usr/bin/env bash
# Must be called only by run-synthetic.sh with its strictly whitelisted local DB.
set -Eeuo pipefail
case "${RESTO_SYNTHETIC_DB_URL:-}" in
  postgresql://postgres:synthetic-only@127.0.0.1:5432/resto_v31_synthetic) ;;
  *) echo 'BOOKING_RUNNER_REJECTS_NON_SYNTHETIC_DB' >&2; exit 78 ;;
esac
script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
export BOOKING_TEST_DB_URL='postgresql://postgres:synthetic-only@127.0.0.1:5432/resto_v31_booking_synthetic'
# Separate disposable database avoids touching/resting V31 owner test data.
psql "$RESTO_SYNTHETIC_DB_URL" -X -w -q -v ON_ERROR_STOP=1 \
  -c 'CREATE DATABASE resto_v31_booking_synthetic;'
psql "$BOOKING_TEST_DB_URL" -X -w -q -v ON_ERROR_STOP=1 \
  -f "$script_dir/synthetic-booking-schema.sql"
psql "$BOOKING_TEST_DB_URL" -X -w -q -v ON_ERROR_STOP=1 \
  -f "$script_dir/synthetic-booking-functions-snapshot.sql"
psql "$BOOKING_TEST_DB_URL" -X -w -q -v ON_ERROR_STOP=1 \
  -f "$script_dir/assert-booking-engine.sql"
bash "$script_dir/assert-booking-concurrency.sh"
echo 'RESTO_V31_SYNTHETIC_BOOKING_ENGINE_PASS'
