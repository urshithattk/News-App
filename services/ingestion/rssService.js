// backend/services/ingestion/rssService.js
import Parser from 'rss-parser';
import feeds from '../../config/rssFeeds.js';
import { insertArticle } from '../../config/db.js';
import { cleanText } from '../../utils/textCleaner.js';

const parser = new Parser({
  timeout: 30000 // 30s timeout to avoid long waits
});

export async function runRssIngestion() {
  const results = await Promise.allSettled(
    feeds.map(async (feedUrl) => {
      const feed = await parser.parseURL(feedUrl);

      let count = 0;
      for (const item of feed.items || []) {
        await insertArticle({
          title: item.title?.trim() || 'Untitled',
          url: item.link,
          description: cleanText(
            item.contentSnippet || item.content || item.summary || ''
          ),
          publishedAt: item.pubDate ? new Date(item.pubDate) : null,
          source: feed.title || new URL(feedUrl).hostname,
          created_at: new Date()
        });
        count++;
      }
      return count;
    })
  );

  // Summarize
  let totalInserted = 0;
  results.forEach((res, idx) => {
    if (res.status === 'fulfilled') {
      totalInserted += res.value;
    } else {
      const feedUrl = feeds[idx];
      if (res.reason.code === 'ETIMEDOUT' || res.reason.message.includes('timed out')) {
        console.warn(`⏱ Timeout fetching feed (${feedUrl}) — skipping`);
      } else {
        console.warn(`⚠ RSS error (${feedUrl}):`, res.reason.message);
      }
    }
  });

  return totalInserted;
}
