# Deploy (Rocketory → Mittwald)

## Deine Routine

1. Änderungen committen und **pushen** (`main`).
2. Lokal ausführen:

```bash
npm run deploy
```

Das Script zieht auf dem Server `origin/main`, installiert Dependencies, pinnt ggf. `sharp@0.34.5`, stellt fehlende DB-Spalten sicher, baut Next.js und startet die Node-App neu.

Voraussetzung: SSH-Key unter `.deploy-keys/mittwald_ed25519` (bereits eingerichtet).

## Optional

| Variable | Wirkung |
|---|---|
| `SKIP_SEED=1` | Kein Blog-Seed vor dem Build |

Beispiel:

```bash
SKIP_SEED=1 npm run deploy
```

Schema-Fixes für Turnstile/E-Mail-Felder laufen automatisch über `scripts/ensure-email-settings-columns.mjs` (ohne interaktive Payload-Migration).

## Checks nach dem Deploy

- https://rocketory.de/
- https://rocketory.de/admin
- https://rocketory.de/api/form-settings (Turnstile Site Keys)

## Hinweise

- **sharp** muss `0.34.5` bleiben (0.35.x bricht den Build auf Mittwald).
- `payload.db`, `media/` und `.env.production` bleiben auf dem Server unangetastet.
- Der Agent muss für Deploys nicht mehr genutzt werden – Push + `npm run deploy` reicht.
