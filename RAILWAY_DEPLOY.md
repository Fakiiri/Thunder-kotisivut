# Railway Deploy Guide — Thunder Kustannus

## Vaihe 1: Luo Railway-projekti

1. Mene [railway.app](https://railway.app) → kirjaudu sisään
2. "New Project" → "Deploy from GitHub repo"
3. Valitse `Fakiiri/Thunder-kotisivut`
4. Railway tunnistaa automaattisesti `railway.json`-tiedoston

## Vaihe 2: Lisää MySQL-tietokanta

1. Railway-projektissa: "New" → "Database" → "MySQL"
2. Kun tietokanta on luotu, kopioi `DATABASE_URL` muuttujien listasta

## Vaihe 3: Lisää ympäristömuuttujat

Railway → Variables → lisää seuraavat:

| Muuttuja | Arvo |
|---|---|
| `DATABASE_URL` | (kopioi Railway MySQL:stä automaattisesti) |
| `JWT_SECRET` | Satunnainen 32+ merkin merkkijono (esim. generoi osoitteessa randomkeygen.com) |
| `BREVO_API_KEY` | Brevo-tilin API-avain |
| `BREVO_LIST_ID` | 2 (tai oma listanumero Brevosta) |
| `VITE_APP_TITLE` | Thunder Kustannus |
| `NODE_ENV` | production |

## Vaihe 4: Aja tietokantamigraatio

Railway → palvelun Settings → "Run Command" kenttään:
```
pnpm db:push
```
Aja kerran deployn jälkeen.

## Vaihe 5: Lisää domain

Railway → Settings → Domains → lisää `thunderkustannus.fi`
Päivitä DNS-asetukset domainrekisterissä Railway:n ohjeiden mukaan.

## Huomioita

- **PDF-opas** on nyt staattinen tiedosto: `client/public/downloads/opas.pdf` — toimii suoraan Railwayssa osoitteessa `/downloads/opas.pdf`.
- **Manus OAuth** on poistettu — sivusto toimii ilman kirjautumista.
- **Manus Storage** on poistettu — ei tarvita.
- **Seuraavat muuttujat EI tarvita Railwayssa:** `VITE_APP_ID`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`, `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY`, `VITE_FRONTEND_FORGE_API_KEY`, `VITE_FRONTEND_FORGE_API_URL`, `OWNER_OPEN_ID`, `OWNER_NAME`

## Arvioitu hinta Railwayssa

- Hobby-plan: ~5 USD/kk
- MySQL: ~5 USD/kk
- **Yhteensä: ~10 USD/kk (~9 €/kk)**
