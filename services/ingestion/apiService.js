// backend/services/ingestion/apiService.js
import axios from 'axios';
import dotenv from 'dotenv';
import { insertArticle } from '../../config/db.js';
import { cleanText } from '../../utils/textCleaner.js';
dotenv.config();

/**
 * Provider: NewsAPI.org (Top headlines)
 * Free plan is limited and disallows storing full content;
 * we store title/description/source/url only (which is allowed).
 */
async function fetchFromNewsAPI(country = 'in') {
  const key = process.env.NEWSAPI_KEY;
  if (!key) return 0;

  const url = 'https://newsapi.org/v2/top-headlines';
  const params = { country, pageSize: 50, apiKey: key };

  const { data } = await axios.get(url, { params });
  let count = 0;
  for (const a of data.articles || []) {
    await insertArticle({
      title: a.title,
      url: a.url,
      description: cleanText(a.description || a.content || ''),
      publishedAt: a.publishedAt ? new Date(a.publishedAt) : null,
      source: a.source?.name || 'NewsAPI'
    });
    count++;
  }
  return count;
}

/**
 * Provider: GNews (alternative)
 */
async function fetchFromGNews(topic = 'breaking-news', lang = 'en') {
  const key = process.env.GNEWS_API_KEY;
  if (!key) return 0;

  const url = 'https://gnews.io/api/v4/top-headlines';
  const params = { topic, lang, max: 50, apikey: key };

  const { data } = await axios.get(url, { params });
  let count = 0;
  for (const a of data.articles || []) {
    await insertArticle({
      title: a.title,
      url: a.url,
      description: cleanText(a.description || ''),
      publishedAt: a.publishedAt ? new Date(a.publishedAt) : null,
      source: a.source?.name || 'GNews'
    });
    count++;
  }
  return count;
}

export async function runApiIngestion() {
  let total = 0;
  try { total += await fetchFromNewsAPI('in'); } catch (e) { console.warn('NewsAPI IN:', e.message); }
  try { total += await fetchFromNewsAPI('us'); } catch (e) { console.warn('NewsAPI US:', e.message); }
  try { total += await fetchFromGNews('breaking-news', 'en'); } catch (e) { console.warn('GNews:', e.message); }
  return total;
}
