-- v1.3 schema simplification: threads + messages
-- removes persona routing columns; adds last_message_at + deleted_at to threads
-- removes member_id + deleted_at from messages (member is inferred via thread)

ALTER TABLE threads DROP COLUMN IF EXISTS coach_persona;
ALTER TABLE threads DROP COLUMN IF EXISTS status;
ALTER TABLE threads DROP COLUMN IF EXISTS system_prompt_version;
ALTER TABLE threads ADD COLUMN IF NOT EXISTS last_message_at timestamptz;
ALTER TABLE threads ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

ALTER TABLE messages DROP COLUMN IF EXISTS member_id;
ALTER TABLE messages DROP COLUMN IF EXISTS deleted_at;
