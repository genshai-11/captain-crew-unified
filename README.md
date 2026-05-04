# captain-crew-unified

Unified workspace for the THC + CC product line.

## Production domains (important)

This repo uses a **swapped naming mapping** on purpose. Do not assume app name == domain name.

- `apps/thc-web` -> **https://chunks-cc-faceoff.web.app**
- `apps/cc-web` -> **https://chunks-tron-thc.web.app**
- Shared backend functions -> `firebase/ai-functions`

### Anti-mixup rule

Before every deploy, confirm both:
1. The app folder you built.
2. The hosting target you deploy.

If these do not match the mapping above, stop.

## Workspace layout
- `apps/thc-web` — THC single-flow app
- `apps/cc-web` — CC room/multiplayer app
- `packages/shared-types` — converged shared types
- `packages/shared-ai-client` — shared transcript/meaning/OHM API clients
- `packages/shared-ui` — candidate presentational components
- `packages/shared-audio` — candidate audio/OHM helpers
- `firebase/ai-functions` — canonical shared backend copied from THC

## Deploy commands

From repo root:

```bash
# Deploy THC app -> chunks-cc-faceoff.web.app
npm --prefix apps/thc-web run build
firebase deploy --only hosting:chunks-cc-faceoff --project gen-lang-client-0815518176

# Deploy CC app -> chunks-tron-thc.web.app
npm --prefix apps/cc-web run build
firebase deploy --only hosting:chunks-tron-thc --project gen-lang-client-0815518176

# Deploy both hostings together
firebase deploy --only hosting:chunks-cc-faceoff,hosting:chunks-tron-thc --project gen-lang-client-0815518176
```

## Post-deploy verification checklist

- Open both domains and verify correct app appears:
  - `chunks-cc-faceoff.web.app` should show THC app
  - `chunks-tron-thc.web.app` should show CC app
- Hard refresh (Ctrl/Cmd+Shift+R) to avoid stale bundle cache.
- Run one happy-path flow per app:
  - THC: record -> evaluate -> summary.
  - CC: create/join room -> captain/crew turn -> result.
- If OHM is expected, confirm result block renders and has values.

## Quick rollback (hosting)

If wrong build goes live, redeploy the correct target immediately from the matching app build.

```bash
# Example rollback by redeploying correct CC build
npm --prefix apps/cc-web run build
firebase deploy --only hosting:chunks-tron-thc --project gen-lang-client-0815518176
```

## Notes

- Domain mapping details are also documented in `docs/domain-mapping.md`.
- Current `firebase.json` hosting targets are the source of truth for deployment wiring.
