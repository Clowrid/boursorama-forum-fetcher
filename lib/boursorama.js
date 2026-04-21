const cheerio = require('cheerio');
const cache = require('./cache');

const FORUM_TTL_MS = 10 * 60 * 1000;
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
  const { value } = await cache.memoize(`boursorama:${boursoramaCode}`, FORUM_TTL_MS, async () => {
    try {
      const html = await fetchForumHtml(boursoramaCode);
      return parseTopics(html);
    } catch {
      return [];
    }
  });
  return value;
}

module.exports = { getForum };
