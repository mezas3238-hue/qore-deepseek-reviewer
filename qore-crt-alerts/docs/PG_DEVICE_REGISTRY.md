# PgQaDeviceRegistry — SQL-backed staging integration boundary

This is an INJECTABLE PostgreSQL adapter; it never creates a database
connection, never reads credentials, never imports pg, never deploys,
and never sends FCM.

Preconditions: migrations 001, 002, 003 explicitly approved and
applied to a separate STAGING database. The server-side-only SQL role
must be explicitly provisioned with minimal privileges (never public,
authenticated, anon or Android clients). Firebase Admin Auth/App Check
must use a separately configured matching Firebase project.

Constructor inputs: db.query (pg-like query interface), verifyAuth,
verifyAppCheck, projectId, firebaseAppId, hashSecret (server-side only).
No raw FID, raw ID token or App Check token is persisted in SQL. No
real connection is included in the GitHub repository.

HTTP body for registration:
{ "deviceSlot":"...", "installationId":"...", "optedIn":true,
  "expectedRevision":0 }
POST with expectedRevision=0 creates an entry or deduplicates the exact
same installation. For rotation, the client must provide current
revision from authenticated GET. Otherwise the SQL CAS refuses writes.

DELETE uses { "deviceSlot":"...", "expectedRevision":1 } and
requires that the device still belongs to the authenticated scope.

Until a Firebase QA project and an external PostgreSQL connection are
explicitly enabled, the only executable end-to-end HTTP harness uses
QaDeviceRegistry (memory) and local mock Firebase verifiers.

Important: integration unit tests use an injected fake db.query. SQL
integration runs against ephemeral PostgreSQL 16 in GitHub Actions.
No remote staging database is connected and no physical Android app
can register. All records remain BLOCKED_NOT_CERTIFIED.
