-- RUN169: additive migration for an existing owner-controlled Cloudflare D1 only.
-- NOT Firestore. Run manually, after confirming the Worker source and least-privilege IAM.
-- No IP, URL, plaintext UID, email, password, answer, grade, or raw study content.
CREATE TABLE IF NOT EXISTS activity_days(
  actor_key TEXT NOT NULL CHECK(length(actor_key)=64),
  day TEXT NOT NULL CHECK(length(day)=10),
  kind TEXT NOT NULL CHECK(kind IN ('visit','cards','tests','exam_start','exam_finish')),
  first_ms INTEGER NOT NULL,
  last_ms INTEGER NOT NULL,
  PRIMARY KEY(actor_key,day,kind)
);
CREATE INDEX IF NOT EXISTS ix_activity_days_day ON activity_days(day);
CREATE TABLE IF NOT EXISTS admin_audit(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_key TEXT NOT NULL CHECK(length(actor_key)=64),
  kind TEXT NOT NULL CHECK(kind IN ('directory_read','activity_read')),
  at_ms INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_admin_audit_at ON admin_audit(at_ms);
-- Activity retention 30 days; admin access audit retention 90 days.
-- The Worker Cron cleans them up daily. There is no import from Firestore.
