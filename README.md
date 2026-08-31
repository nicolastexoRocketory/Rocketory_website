# Rocketory Landingpage

Eigenständige Next.js- und Payload-CMS-Installation der Rocketory-Landingpage  
**„All in One Webdesign und SEO aus Bünde“**.

## Voraussetzungen

- Node.js ≥ 20.9
- npm

## Schnellstart

```bash
cd "/Users/nicolastexo/Documents/Rocketory Landingpage"
cp .env.example .env
npm install
npm run dev
```

- **Landingpage:** [http://localhost:3000](http://localhost:3000)
- **Payload Admin:** [http://localhost:3000/admin](http://localhost:3000/admin)

Die Datenbank (`payload.db`) und Medien (`media/`) sind bereits aus dem Hauptprojekt übernommen – Blog-Slider und Featured-Artikel funktionieren direkt.

## Produktion

```bash
npm run build
npm run start
```

Setze in `.env` ein sicheres `PAYLOAD_SECRET` und die produktive `NEXT_PUBLIC_SITE_URL`.

## CMS-Inhalte

| Bereich | Pfad im Admin |
|--------|----------------|
| Blog-Beiträge (Slider) | Collections → Posts |
| Featured-Artikel | Globals → Homepage |
| Bilder | Collections → Media |

### Optional: Daten neu befüllen

```bash
npm run sync:media      # Bilder aus public/assets/images importieren
npm run seed:categories # Kategorien anlegen
npm run seed            # Beispiel-Beiträge anlegen
```

## Projektstruktur

```
legacy/index.html          Landingpage-Inhalt (HTML)
legacy/components/         Navigation & Footer
public/assets/images/      Statische Bilder
public/js/                 Client-Skripte (Slider, Parallax, …)
src/app/(frontend)/        Next.js Frontend (/ + /blog/[slug])
src/app/(payload)/         Payload Admin & API
src/collections/           Users, Media, Posts
src/globals/Homepage.ts    Featured-Artikel-Konfiguration
```

## Hinweise

- Blog-Links im Slider führen zu `/blog/[slug]` (Beitragsdetailseiten aus Payload).
- Navigation und Footer verlinken auf Anker der Landingpage (`/#leistungen`, `/#kontakt`, …).
- Keine Abhängigkeit zum Hauptprojekt „Rocketory Webseite“.
