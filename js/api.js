async function getJson(url) {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`${url} → ${response.status}`);
  return response.json();
}

export const getSocietes = () => getJson('/api/societes');
export const getQuotes = () => getJson('/api/societes/quotes');
export const getForum = (code) => getJson(`/api/societes/${encodeURIComponent(code)}/forum`);
