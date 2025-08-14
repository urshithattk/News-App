// backend/config/db.js
import pg from 'pg';
import dotenv, { config } from 'dotenv';
dotenv.config();

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10
});

export async function insertArticle({ title, url, description, publishedAt, source }) {
  if (!title || !url) return;
  try {
    await pool.query(
      `INSERT INTO articles (title, url, description, published_at, source)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (url) DO NOTHING`,
      [title.trim(), url.trim(), description || null, publishedAt || null, source || null]
    );
  } catch (e) {
    console.error('DB insert error:', e.message);
  }
}
