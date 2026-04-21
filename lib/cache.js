const store = new Map();

function get(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

function set(key, value, ttlMs) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

async function memoize(key, ttlMs, producer) {
  const cached = get(key);
  if (cached !== null) return { value: cached, hit: true };
  const value = await producer();
  set(key, value, ttlMs);
  return { value, hit: false };
}

module.exports = { get, set, memoize };
