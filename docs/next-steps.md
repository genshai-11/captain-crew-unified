# Next steps

## Phase 2
1. Move app imports from local `src/types.ts` to `@caption-crew/shared-types`.
2. Extract app-local admin config adapters into a shared runtime-config package.
3. Decide whether CC room data stays in its current Firebase project or moves into the shared THC project.
4. Refactor `firebase/ai-functions/src/index.js` into transcript / meaning / ohm / config modules.
5. Remove duplicate presentational components from the apps after verifying `@caption-crew/shared-ui` coverage.
6. Evaluate whether `useCaptionCrewRound.ts` should become a THC-only hook or split into reusable engine + app wrappers.

## Deploy notes
- `apps/thc-web` is mapped to `chunks-cc-faceoff.web.app`
- `apps/cc-web` is mapped to `chunks-tron-thc.web.app`
- both apps currently target the THC canonical backend for transcript / meaning / OHM
