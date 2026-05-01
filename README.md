# caption-crew-unified

Unified workspace for the THC + CC product line.

## Product mapping
- `apps/thc-web` deploys to **chunks-cc-faceoff.web.app**
- `apps/cc-web` deploys to **chunks-tron-thc.web.app**
- `firebase/ai-functions` is the canonical shared AI/audio backend, seeded from `thc-caption-crew-2026`

## Workspace layout
- `apps/thc-web` — THC single-flow app
- `apps/cc-web` — CC room/multiplayer app
- `packages/shared-types` — converged shared types
- `packages/shared-ai-client` — shared transcript/meaning/OHM API clients
- `packages/shared-ui` — candidate presentational components
- `packages/shared-audio` — candidate audio/OHM helpers
- `firebase/ai-functions` — canonical shared backend copied from THC
