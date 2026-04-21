# Boursorama Forum Fetcher

Dashboard boursier léger : pour chaque société configurée, affiche le cours du jour, les variations (jour / 6 mois / 1 an / 5 ans), le logo et les derniers topics du forum Boursorama.

## Stack

- **Backend** : Node ≥ 18, Express, `cheerio` pour le scraping du forum.
- **Frontend** : vanilla JS (modules ES) + CSS (pas de build).
- **Sources** : Yahoo Finance (cours + historique), Wikipedia (logos), Boursorama (forum).

## Installation

```bash
npm install
npm start
```

Ouvrir `http://localhost:8000`.

Pour utiliser un autre port :

```bash
PORT=3000 npm start
```

En développement avec rechargement automatique :

```bash
npm run dev
```

## Configurer la liste des sociétés

Éditer `config/societes.json`. Chaque entrée doit contenir :

| Champ            | Exemple         | Description                                                      |
| ---------------- | --------------- | ---------------------------------------------------------------- |
| `code`           | `BNP`           | Identifiant court utilisé dans l'URL `/api/societes/:code/forum` |
| `displayName`    | `BNP Paribas`   | Nom affiché dans la card                                         |
| `boursoramaCode` | `1rPBNP`        | Code interne Boursorama (visible dans l'URL du forum)            |
| `yahooTicker`    | `BNP.PA`        | Ticker Yahoo Finance (suffixe `.PA` pour Euronext Paris)         |
| `wikipediaTitle` | `BNP_Paribas`   | Titre de la page Wikipédia FR pour récupérer le logo             |

Redémarrer le serveur après modification.

## API

- `GET /api/societes` → métadonnées statiques (code, nom, ticker, URL du logo).
- `GET /api/societes/quotes` → cours et variations pour toutes les sociétés (cache 5 min).
- `GET /api/societes/:code/forum` → topics récents du forum Boursorama (cache 10 min).

## Déploiement

Le fichier `Procfile` est prêt pour Heroku ou tout PaaS compatible (commande `web: node index.js`).
