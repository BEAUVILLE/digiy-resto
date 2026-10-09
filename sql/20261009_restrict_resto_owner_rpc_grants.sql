-- Harden existing RESTO owner-only RPC entrypoints. No body or row changes.
-- Verified 2026-10-09: all three check auth.uid() and intended owners.
-- All three previously inherited EXECUTE from PUBLIC, making anon calls
-- possible (though their body rejected unsigned callers).
REVOKE EXECUTE ON FUNCTION public.digiy_resa_resto_claim_site_by_email_v1(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.digiy_resa_resto_owner_refresh_no_shows_v1(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.digiy_resa_resto_owner_set_booking_status_v1(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.digiy_resa_resto_claim_site_by_email_v1(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.digiy_resa_resto_owner_refresh_no_shows_v1(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.digiy_resa_resto_owner_set_booking_status_v1(uuid,text) TO authenticated, service_role;
