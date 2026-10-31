# QA device HTTP — localhost integration only

Node.js 22+ built-in HTTP server; no third-party networking libraries.
The module exports createQaDeviceHttpServer() but does NOT listen or deploy.
Consumers must explicitly bind to 127.0.0.1 for QA; remote sockets are
denied even if the caller binds to other interfaces.

Routes:
- GET /qa/health: offline status with sendPush:false.
- POST /qa/v1/devices: opt-in registration (deviceSlot, installationId).
- GET /qa/v1/devices: current authenticated caller's hashed handles.
- DELETE /qa/v1/devices: revoke deviceSlot (never delete another user).
- NO /send, /push, /signals, /FCM endpoint.

Headers: Authorization: Bearer <FIREBASE_ID_TOKEN>
and X-Firebase-AppCheck: <LIMITED_USE_APP_CHECK_TOKEN>.
The registry receives a verified server-side principal, not a user ID
supplied by the caller. The supplied Firebase Admin adapter checks token
revocation and App Check replay protection. No raw token, FID, or user UID
is returned by the API or written to logs.

Strict content type application/json (<=4096 bytes); no browser CORS,
no caching; in-memory 12 req/min per token fingerprint (configurable),
bounded 2048 fingerprint buckets, and fail closed on SDK errors.

CRITICAL LIMITATIONS:
- Registry is IN MEMORY: restarts lose data; no shared transactional
  rate-limit or persistent device storage. SQL migration 002 is only
  a proposal in GitHub, not applied to any external database.
- No Firebase project configured, no App Check/Identity credentials, no
  real login, HTTPS termination, authenticated Android registration,
  or FCM sending. Integration tests use local fake verifiers.
- In-memory rate limits are QA safeguards and not a production security
  boundary; use an external bounded rate limiter, TLS/edge protections,
  and transactional DB leases before staging traffic.
- The Android QA build has FCM disabled, cannot call these endpoints.
- Never expose this server publicly or interpret a passing test as
  verified Android notification delivery.
