// backend/controllers/articleController.js

import { pool } from '../config/db.js';

export async function getArticles(req, res) {
  try {
    const { limit = 30, offset = 0 } = req.query;
    const { rows } = await pool.query(
      `SELECT id, title, url, description, published_at, source
       FROM articles
       ORDER BY COALESCE(published_at, created_at) DESC NULLS LAST, id DESC
       LIMIT $1 OFFSET $2`,
      [Number(limit), Number(offset)]
    );
    res.json(rows);
  } catch (e) {
    console.error('Database query error:', e.message);
    res.status(500).json({ error: e.message });
  }
}
