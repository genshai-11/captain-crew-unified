# Deploy hardening

## Preflight
Run the full workspace smoke check before any deploy:

```bash
npm run smoke:workspace
```

This validates:
- runtime/unit tests
- type-level contracts
- both frontend app builds
- backend modular file layout

## Domain targets
- THC app -> `chunks-cc-faceoff.web.app`
- CC app -> `chunks-tron-thc.web.app`
- shared backend -> `firebase/ai-functions`

## Recommended release flow
1. `npm ci`
2. `npm run smoke:workspace`
3. configure `.firebaserc` from `.firebaserc.example`
4. deploy functions: `npm run deploy:functions`
5. deploy hosting: `npm run deploy:hosting`
6. or do both sequentially: `npm run deploy:all`

## Notes
- Backend helper modules now live under `firebase/ai-functions/src/{config,utils,transcript,meaning,ohm}`.
- Keep `firebase/ai-functions/src/index.js` as the public entrypoint while extracting more handler-specific modules over time.
- Build warnings for chunk size remain non-blocking and should be handled in a later performance pass.
