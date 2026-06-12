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

- PDF-opas on tallennettu Manuksen storageen (`/manus-storage/...`). 
  Railwayssä tämä URL ei toimi. Lataa PDF uudelleen ja host se esim. Google Drivessä tai S3:ssa,
  ja päivitä `PDF_DOWNLOAD_URL` muuttuja `server/routers.ts`-tiedostossa.
- Manus OAuth (kirjautuminen) on poistettu käytöstä — sivusto toimii ilman sitä.
