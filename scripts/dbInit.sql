-- psql -U youruser -d yourdb -f dbInit.sql
-- psql -U postgres -d betternews (to make changes in the db)
-- \q (to quit/exit from the db)


CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT UNIQUE NOT NULL,
  description TEXT,
  published_at TIMESTAMP,
  source TEXT
);
ALTER TABLE articles
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
