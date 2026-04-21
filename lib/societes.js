const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'config', 'societes.json');
const raw = fs.readFileSync(configPath, 'utf8');
const societes = JSON.parse(raw);

const required = ['code', 'displayName', 'boursoramaCode', 'yahooTicker'];
for (const s of societes) {
  for (const key of required) {
    if (!s[key]) throw new Error(`societes.json: missing "${key}" in entry ${JSON.stringify(s)}`);
  }
}

const byCode = new Map(societes.map((s) => [s.code, s]));

function all() {
  return societes;
}

function byCodeOrNull(code) {
  return byCode.get(code) || null;
}

module.exports = { all, byCode: byCodeOrNull };
