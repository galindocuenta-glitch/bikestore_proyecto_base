USE bs_bike_store;

-- Preserve the latest conversation as the account conversation. Older
-- conversations remain in the database as anonymous records for auditing.
CREATE TEMPORARY TABLE duplicate_user_chat_sessions AS
SELECT session_id FROM (
  SELECT session_id,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY updated_at DESC, session_id DESC) AS position
  FROM chat_sessions
  WHERE user_id IS NOT NULL
) AS ranked_sessions
WHERE position > 1;

UPDATE chat_sessions
SET user_id = NULL
WHERE session_id IN (SELECT session_id FROM duplicate_user_chat_sessions);

DROP TEMPORARY TABLE duplicate_user_chat_sessions;

ALTER TABLE chat_sessions
  ADD CONSTRAINT uq_chat_sessions_user_id UNIQUE (user_id);
