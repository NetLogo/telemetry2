CREATE DATABASE nl_telemetry2_dev;
\c nl_telemetry2_dev;

CREATE TABLE events (
    event_id BIGSERIAL PRIMARY KEY,
    user_uuid UUID NOT NULL,
    event_type TEXT NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

---------------------------------------------------
-- Structured payload events
---------------------------------------------------

CREATE TABLE app_exit_payload (
    event_id BIGINT PRIMARY KEY REFERENCES events(event_id) ON DELETE CASCADE,
    app_minutes DOUBLE PRECISION NOT NULL
);

CREATE TABLE app_start_payload (
    event_id BIGINT PRIMARY KEY REFERENCES events(event_id) ON DELETE CASCADE,
    version TEXT NOT NULL,
    is_3d BOOLEAN NOT NULL,
    os TEXT NOT NULL,
    arch TEXT NOT NULL
);

CREATE TABLE behaviorspace_run_payload (
    event_id BIGINT PRIMARY KEY REFERENCES events(event_id) ON DELETE CASCADE,
    used_table BOOLEAN NOT NULL,
    used_spreadsheet BOOLEAN NOT NULL,
    used_stats BOOLEAN NOT NULL,
    used_lists BOOLEAN NOT NULL
);

CREATE TABLE include_extension_payload (
    event_id BIGINT PRIMARY KEY REFERENCES events(event_id) ON DELETE CASCADE,
    name TEXT NOT NULL
);

CREATE TABLE load_old_size_widgets_payload (
    event_id BIGINT PRIMARY KEY REFERENCES events(event_id) ON DELETE CASCADE,
    num_widgets INT NOT NULL
);

CREATE TABLE model_code_hash_payload (
    event_id BIGINT PRIMARY KEY REFERENCES events(event_id) ON DELETE CASCADE,
    hash INT NOT NULL
);

CREATE TABLE preference_change_payload (
    event_id BIGINT PRIMARY KEY REFERENCES events(event_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    value TEXT
);

---------------------------------------------------
-- JSONB payload events
---------------------------------------------------

CREATE TABLE keyword_usage_payload (
    event_id BIGINT PRIMARY KEY REFERENCES events(event_id) ON DELETE CASCADE,
    payload JSONB NOT NULL
);

CREATE TABLE primitive_usage_payload (
    event_id BIGINT PRIMARY KEY REFERENCES events(event_id) ON DELETE CASCADE,
    payload JSONB NOT NULL
);

---------------------------------------------------
-- Optional JSONB index for faster searching
---------------------------------------------------

CREATE INDEX keyword_usage_payload_gin
  ON keyword_usage_payload USING GIN (payload);

CREATE INDEX primitive_usage_payload_gin
  ON primitive_usage_payload USING GIN (payload);

---------------------------------------------------
-- Duplicate _dev to _prod
---------------------------------------------------

CREATE DATABASE nl_telemetry2_prod WITH TEMPLATE nl_telemetry2_dev;
