const express = require('express');
const path = require('path');

const societes = require('./lib/societes');
const yahoo = require('./lib/yahoo');
const wikipedia = require('./lib/wikipedia');
const boursorama = require('./lib/boursorama');

const app = express();

app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/img', express.static(path.join(__dirname, 'img')));

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/societes', async (_req, res) => {
  const list = societes.all();
  const enriched = await Promise.all(
    list.map(async (s) => ({
      code: s.code,
      name: s.displayName,
      ticker: s.yahooTicker,
      logoUrl: s.logoUrl || (s.wikipediaTitle ? await wikipedia.getLogoUrl(s.wikipediaTitle) : null),
    }))
  );
  res.json(enriched);
});

app.get('/api/societes/quotes', async (_req, res) => {
  const list = societes.all();
  const quotes = await Promise.all(
    list.map(async (s) => {
      try {
        const quote = await yahoo.getQuote(s.yahooTicker);
        return { code: s.code, ok: true, ...quote };
      } catch (err) {
        return { code: s.code, ok: false, error: err.message };
      }
    })
  );
  res.json(quotes);
});

app.get('/api/societes/:code/forum', async (req, res) => {
  const s = societes.byCode(req.params.code);
  if (!s) return res.status(404).json({ error: 'Société inconnue' });
  const topics = await boursorama.getForum(s.boursoramaCode);
  res.json(topics);
});

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

const port = Number(process.env.PORT) || 8000;
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
