const cache = require('./cache');

const QUOTE_TTL_MS = 5 * 60 * 1000;

let yfPromise = null;
async function yf() {
  if (!yfPromise) {
    yfPromise = import('yahoo-finance2').then((mod) => {
      const YahooFinance = mod.default;
      const instance = new YahooFinance();
      instance.suppressNotices?.(['yahooSurvey', 'ripHistorical']);
      return instance;
    });
  }
  return yfPromise;
}

function pctChange(from, to) {
  if (!Number.isFinite(from) || !Number.isFinite(to) || from === 0) return null;
  return ((to - from) / from) * 100;
}

function closeAtOrBefore(bars, targetMs) {
  for (let i = bars.length - 1; i >= 0; i--) {
    const bar = bars[i];
    if (!bar) continue;
    const t = bar.date instanceof Date ? bar.date.getTime() : new Date(bar.date).getTime();
    if (t <= targetMs && Number.isFinite(bar.close)) return bar.close;
  }
  return null;
}

async function fetchYahoo(ticker) {
  const instance = await yf();
  const period2 = new Date();
  const period1 = new Date(period2);
  period1.setFullYear(period1.getFullYear() - 5);
  period1.setDate(period1.getDate() - 7);

  const [quote, chart] = await Promise.all([
    instance.quote(ticker),
    instance.chart(ticker, { period1, period2, interval: '1d' }),
  ]);

  const bars = chart?.quotes || [];
  const price = quote?.regularMarketPrice;
  const previousClose = quote?.regularMarketPreviousClose ?? quote?.chartPreviousClose;
  const now = Date.now();
  const day = 86400 * 1000;

  return {
    price: Number.isFinite(price) ? price : null,
    currency: quote?.currency || null,
    dayPct: pctChange(previousClose, price),
    m6Pct: pctChange(closeAtOrBefore(bars, now - 180 * day), price),
    y1Pct: pctChange(closeAtOrBefore(bars, now - 365 * day), price),
    y5Pct: pctChange(closeAtOrBefore(bars, now - 5 * 365 * day), price),
    asOf: quote?.regularMarketTime ? new Date(quote.regularMarketTime).toISOString() : new Date().toISOString(),
  };
}

async function getQuote(ticker) {
  const { value } = await cache.memoize(`yahoo:${ticker}`, QUOTE_TTL_MS, () => fetchYahoo(ticker));
  return value;
}

module.exports = { getQuote };
