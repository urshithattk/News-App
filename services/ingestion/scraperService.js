// backend/services/ingestion/scraperService.js
import axios from 'axios';
import * as cheerio from 'cheerio';
import { insertArticle } from '../../config/db.js';
import { cleanText } from '../../utils/textCleaner.js';

/**
 * Example: Scrape BBC News homepage promos (fallback if RSS/API misses some).
 * NOTE: Be respectful; keep frequency modest to avoid rate limiting.
 */
async function scrapeBBC() {
  const base = 'https://www.bbc.com';
  const { data } = await axios.get(`${base}/news`, { timeout: 15000 });
  const $ = cheerio.load(data);
  const seen = new Set();
  let count = 0;

  $('a.gs-c-promo-heading').each((_i, el) => {
    const href = $(el).attr('href');
    let url = href?.startsWith('http') ? href : `${base}${href}`;
    const title = $(el).text().trim();
    if (!title || !url) return;
    if (seen.has(url)) return;
    seen.add(url);

    // Short description: neighbor text if available
    const desc = $(el).closest('.gs-c-promo').find('.gs-c-promo-summary').text().trim();

    // No published time on listing reliably — keep null
    insertArticle({
      title,
      url,
      description: cleanText(desc || ''),
      publishedAt: null,
      source: 'BBC'
    });
    count++;
  });

  return count;
}

export async function runScraperIngestion() {
  let total = 0;
  try { total += await scrapeBBC(); } catch (e) { console.warn('BBC scrape:', e.message); }
  return total;
}
