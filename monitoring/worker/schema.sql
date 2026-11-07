-- Private D1 data. No raw UID, email, token, user text, URL or study record.
-- Deploy manually to NEW D1 database; do not apply to Firestore.
CREATE TABLE IF NOT EXISTS telemetry_events (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  release TEXT NOT NULL,
  browser TEXT NOT NULL,
  received_ms INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_telemetry_time ON telemetry_events(received_ms);
CREATE TABLE IF NOT EXISTS telemetry_quota(
  actor_key TEXT PRIMARY KEY,
  used INTEGER NOT NULL CHECK(used BETWEEN 0 AND 24),
  updated_ms INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_telemetry_quota_time ON telemetry_quota(updated_ms);
CREATE TABLE IF NOT EXISTS telemetry_heartbeat(
  name TEXT PRIMARY KEY,
  value_ms INTEGER NOT NULL
);
