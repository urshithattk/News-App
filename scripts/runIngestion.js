// backend/scripts/runApiIngestion.js
import { runApiIngestion } from '../services/ingestion/apiService.js';
import { runRssIngestion } from '../services/ingestion/rssService.js';
import { runScraperIngestion } from '../services/ingestion/scraperService.js';

(async () => {
  const api = await runApiIngestion().catch(() => 0);
  const rss = await runRssIngestion().catch(() => 0);
  const scrape = await runScraperIngestion().catch(() => 0);
  console.log(`Manual ingestion → API:${api} RSS:${rss} SCRAPE:${scrape}`);
  process.exit(0);
})();
