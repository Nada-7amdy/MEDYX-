-- ============================================================================
-- MEDYX — 001_init
-- Authentication foundation: users, pharmacies, sessions.
-- ============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- --------------------------------------------------------------------------
-- Roles supported by the platform.
-- --------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('patient', 'pharmacy', 'admin', 'pharma_partner');
  END IF;
END
$$;

-- --------------------------------------------------------------------------
-- users
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     TEXT        NOT NULL CHECK (length(btrim(full_name)) BETWEEN 2 AND 120),
  email         TEXT        NOT NULL CHECK (position('@' IN email) > 1),
  phone         TEXT        CHECK (phone IS NULL OR length(btrim(phone)) BETWEEN 6 AND 32),
  password_hash TEXT        NOT NULL,
  role          user_role   NOT NULL DEFAULT 'patient',
  is_demo       BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Email is unique case-insensitively; we store it already normalised.
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_key ON users (lower(email));
CREATE INDEX IF NOT EXISTS users_role_idx ON users (role);
CREATE INDEX IF NOT EXISTS users_created_at_idx ON users (created_at DESC);

-- --------------------------------------------------------------------------
-- pharmacies
--   One row per pharmacy, owned by a user whose role is 'pharmacy'.
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pharmacies (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID        NOT NULL UNIQUE
                            REFERENCES users (id) ON DELETE CASCADE,
  name          TEXT        NOT NULL CHECK (length(btrim(name)) BETWEEN 2 AND 160),
  phone         TEXT,
  address       TEXT        NOT NULL CHECK (length(btrim(address)) >= 4),
  latitude      DOUBLE PRECISION CHECK (latitude  IS NULL OR latitude  BETWEEN -90  AND 90),
  longitude     DOUBLE PRECISION CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180),
  verified      BOOLEAN     NOT NULL DEFAULT FALSE,
  is_demo       BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pharmacies_owner_idx    ON pharmacies (owner_user_id);
CREATE INDEX IF NOT EXISTS pharmacies_verified_idx ON pharmacies (verified);
CREATE INDEX IF NOT EXISTS pharmacies_geo_idx      ON pharmacies (latitude, longitude);

-- Enforce at the DB level that only 'pharmacy' users can own a pharmacy.
CREATE OR REPLACE FUNCTION assert_owner_is_pharmacy() RETURNS TRIGGER AS $$
DECLARE
  owner_role user_role;
BEGIN
  SELECT role INTO owner_role FROM users WHERE id = NEW.owner_user_id;
  IF owner_role IS DISTINCT FROM 'pharmacy' THEN
    RAISE EXCEPTION 'pharmacy owner % must have role ''pharmacy'' (got %)',
      NEW.owner_user_id, COALESCE(owner_role::text, 'NULL');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS pharmacies_owner_role_check ON pharmacies;
CREATE TRIGGER pharmacies_owner_role_check
  BEFORE INSERT OR UPDATE OF owner_user_id ON pharmacies
  FOR EACH ROW EXECUTE FUNCTION assert_owner_is_pharmacy();

-- --------------------------------------------------------------------------
-- sessions
--   Opaque server-side sessions. Only a SHA-256 hash of the token is stored,
--   so a database leak cannot be replayed as a valid cookie.
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token_hash   TEXT        NOT NULL UNIQUE,
  user_agent   TEXT,
  ip_address   TEXT,
  expires_at   TIMESTAMPTZ NOT NULL,
  revoked_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sessions_user_idx    ON sessions (user_id);
CREATE INDEX IF NOT EXISTS sessions_expires_idx ON sessions (expires_at);

-- --------------------------------------------------------------------------
-- updated_at maintenance
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS pharmacies_set_updated_at ON pharmacies;
CREATE TRIGGER pharmacies_set_updated_at
  BEFORE UPDATE ON pharmacies
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
