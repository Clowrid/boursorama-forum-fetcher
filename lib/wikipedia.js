const cache = require('./cache');

const LOGO_TTL_MS = 24 * 60 * 60 * 1000;
const USER_AGENT = 'boursorama-forum-fetcher/2.0 (contact: local-dev)';

async function fetchPageImage(wikipediaTitle) {
  const url =
    `https://fr.wikipedia.org/w/api.php?action=query&format=json&origin=*` +
    `&prop=pageimages&piprop=original|thumbnail&pithumbsize=200` +
    `&titles=${encodeURIComponent(wikipediaTitle)}`;
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' } });
  if (!response.ok) return null;
  const body = await response.json();
  const pages = body?.query?.pages;
  if (!pages) return null;
  const page = Object.values(pages)[0];
  if (!page) return null;
  return page.thumbnail?.source || page.original?.source || null;
}

async function getLogoUrl(wikipediaTitle) {
  if (!wikipediaTitle) return null;
  const { value } = await cache.memoize(`wikipedia:${wikipediaTitle}`, LOGO_TTL_MS, async () => {
    try {
      return await fetchPageImage(wikipediaTitle);
    } catch {
      return null;
    }
  });
  return value;
}

module.exports = { getLogoUrl };
