# Source map

## THC canonical imports
- frontend seed for `apps/thc-web`
- backend seed for `firebase/ai-functions`
- shared type baseline
- shared audio + OHM helper baseline

## CC imported slices
- `PlayerAuth`
- `LobbyPage`
- `RoomPage`
- `rooms/*`
- public timing/scoring services + hooks

## Consolidation status
### Centralized now
- backend functions in `firebase/ai-functions`
- first shared API client package in `packages/shared-ai-client`
- first shared type package in `packages/shared-types`

### Still duplicated on purpose
- app-local pages and routing
- app-local admin config adapters
- app-local CSS and orchestration hooks
