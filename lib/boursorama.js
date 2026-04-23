const cheerio = require('cheerio');
const cache = require('./cache');

const FORUM_TTL_MS = 10 * 60 * 1000;
const QUOTE_TTL_MS = 5 * 60 * 1000;
const MAX_TOPICS = 7;
const BASE_URL = 'https://www.boursorama.com';
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function fetchForumHtml(boursoramaCode) {
  const url = `${BASE_URL}/bourse/forum/${encodeURIComponent(boursoramaCode)}/`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'fr-FR,fr;q=0.9',
    },
  });
  if (!response.ok) throw new Error(`Boursorama ${response.status} for ${boursoramaCode}`);
  return response.text();
}

function parseTopics(html) {
  const $ = cheerio.load(html);
  const dateNodes = $('span.u-color-big-stone.c-table__last-message');
  const topics = [];

  $('div.c-table__date').each((idx, node) => {
    if (topics.length >= MAX_TOPICS) return false;
    const $node = $(node);
    let found = null;
    $node.find('a[href]').each((_, link) => {
      const $link = $(link);
      const text = $link.text().trim();
      if (text === '1' || text === '2' || text === '3') return;
      if ($link.attr('title') !== 'Voir le sujet') return;
      const href = $link.attr('href');
      if (!href) return;
      found = {
        title: text,
        linkUrl: href.startsWith('http') ? href : BASE_URL + href,
      };
      return false;
    });
    if (!found) return;
    const dateIdx = idx * 2;
    const dateText = $(dateNodes[dateIdx]).text().trim();
    found.date = dateText || null;
    topics.push(found);
    return undefined;
  });

  return topics;
}

async function getForum(boursoramaCode) {
  const { value } = await cache.memoize(`boursorama:forum:${boursoramaCode}`, FORUM_TTL_MS, async () => {
    try {
      const html = await fetchForumHtml(boursoramaCode);
      return parseTopics(html);
    } catch {
      return [];
    }
  });
  return value;
}

async function fetchBars(boursoramaCode) {
  const url = `${BASE_URL}/bourse/action/graph/ws/GetTicksEOD?symbol=${encodeURIComponent(boursoramaCode)}&length=1825&period=0&guid=`;
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Boursorama quote ${response.status} for ${boursoramaCode}`);
  const body = await response.json();
  const bars = body?.d?.QuoteTab || [];
  if (!bars.length) throw new Error(`Boursorama quote: empty series for ${boursoramaCode}`);
  return bars;
}

function pctChange(from, to) {
  if (!Number.isFinite(from) || !Number.isFinite(to) || from === 0) return null;
  return ((to - from) / from) * 100;
}

function closeAtOrBefore(bars, targetDaysEpoch) {
  for (let i = bars.length - 1; i >= 0; i--) {
    const bar = bars[i];
    if (bar && bar.d <= targetDaysEpoch && Number.isFinite(bar.c)) return bar.c;
  }
  return null;
}

function computeQuote(bars) {
  const last = bars[bars.length - 1];
  const prev = bars[bars.length - 2];
  const price = last?.c;
  const prevClose = prev?.c;

  const nowDays = Math.floor(Date.now() / 86400000);

  return {
    price: Number.isFinite(price) ? price : null,
    currency: 'EUR',
    dayPct: pctChange(prevClose, price),
    m6Pct: pctChange(closeAtOrBefore(bars, nowDays - 180), price),
    y1Pct: pctChange(closeAtOrBefore(bars, nowDays - 365), price),
    y5Pct: pctChange(closeAtOrBefore(bars, nowDays - 5 * 365), price),
    asOf: last ? new Date(last.d * 86400000).toISOString() : new Date().toISOString(),
  };
}

async function getQuote(boursoramaCode) {
  const { value } = await cache.memoize(`boursorama:quote:${boursoramaCode}`, QUOTE_TTL_MS, async () => {
    const bars = await fetchBars(boursoramaCode);
    return computeQuote(bars);
  });
  return value;
}

module.exports = { getForum, getQuote };
