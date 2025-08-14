// backend/services/scheduler/ingestScheduler.js
import cron from 'node-cron';
import { runApiIngestion } from '../ingestion/apiService.js';
import { runRssIngestion } from '../ingestion/rssService.js';
import { runScraperIngestion } from '../ingestion/scraperService.js';

export function startScheduler() {
  // On startup
  ;(async () => {
    console.log('Initial ingestion starting…');
    await runAll('startup');
  })();

  // Every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    await runAll('cron-30m');
  });
}

async function runAll(tag) {
  console.time(`[ingest ${tag}]`);
  try {
    const [api, rss, scrape] = await Promise.all([
      runApiIngestion().catch(() => 0),
      runRssIngestion().catch(() => 0),
      runScraperIngestion().catch(() => 0)
    ]);
    console.log(`Ingestion (${tag}) → API:${api} RSS:${rss} SCRAPE:${scrape}`);
  } finally {
    console.timeEnd(`[ingest ${tag}]`);
  }
}
