# Deploy (Rocketory → Mittwald)

## Deine Routine

1. Änderungen committen und **pushen** (`main`).
2. Lokal ausführen:

```bash
npm run deploy
```

Das Script zieht auf dem Server `origin/main`, installiert Dependencies, pinnt ggf. `sharp@0.34.5`, stellt fehlende DB-Spalten sicher, baut Next.js über mittnite und startet die Node-App neu.

Während des Builds kann die Seite kurz **503** zeigen – das ist normal, bis `Ready` kommt (oft 1–3 Minuten).

Voraussetzung: SSH-Key unter `.deploy-keys/mittwald_ed25519` (bereits eingerichtet).

## Optional

| Variable | Wirkung |
|---|---|
| `SKIP_SEED=1` | Kein Blog-Seed vor dem Build |

Beispiel:

```bash
SKIP_SEED=1 npm run deploy
```

Schema-Fixes für Turnstile/E-Mail-Felder und KI-Check-Antwort-Felder laufen automatisch über `scripts/ensure-email-settings-columns.mjs` bzw. `scripts/ensure-contact-inquiry-reply-columns.mjs` (ohne interaktive Payload-Migration).

## Checks nach dem Deploy

- https://rocketory.de/
- https://rocketory.de/admin
- https://rocketory.de/api/form-settings (Turnstile Site Keys)
- Admin → Kontaktanfrage öffnen → Tab **Antwort senden** → Felder ausfüllen → **Bericht senden** (braucht aktives SMTP unter E-Mail & SMTP)

## Hinweise

- **sharp** muss `0.34.5` bleiben (0.35.x bricht den Build auf Mittwald).
- `payload.db`, `media/` und `.env.production` bleiben auf dem Server unangetastet.
- Der Agent muss für Deploys nicht mehr genutzt werden – Push + `npm run deploy` reicht.
