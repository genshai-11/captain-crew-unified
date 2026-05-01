const { existsSync, readFileSync } = require('node:fs');
const { resolve } = require('node:path');

describe('functions handler modularization', () => {
  test('public handler groups exist as dedicated modules', () => {
    const required = [
      'firebase/ai-functions/src/handlers/transcriptHandlers.js',
      'firebase/ai-functions/src/handlers/ohmHandlers.js',
      'firebase/ai-functions/src/handlers/modelHandlers.js',
      'firebase/ai-functions/src/handlers/meaningHandlers.js',
    ];

    for (const file of required) {
      expect(existsSync(resolve(file))).toBe(true);
    }
  });

  test('functions index delegates to extracted handler modules', () => {
    const indexText = readFileSync(resolve('firebase/ai-functions/src/index.js'), 'utf8');
    const ohmHandlerText = readFileSync(resolve('firebase/ai-functions/src/handlers/ohmHandlers.js'), 'utf8');
    expect(indexText).toContain("require('./handlers/transcriptHandlers')");
    expect(indexText).toContain("require('./handlers/ohmHandlers')");
    expect(indexText).toContain("require('./handlers/modelHandlers')");
    expect(indexText).toContain("require('./handlers/meaningHandlers')");

    expect(indexText).not.toContain('const OHM_NOISE_TERMS');
    expect(indexText).not.toContain('function isLexiconEntryAcceptable');
    expect(indexText).not.toContain('exports.analyzeTranscriptOhm = createAnalyzeTranscriptOhmHandler({ onRequest, impl: async');

    expect(ohmHandlerText).toContain('const OHM_NOISE_TERMS');
    expect(ohmHandlerText).toContain('function isLexiconEntryAcceptable');
    expect(ohmHandlerText).toContain('createAnalyzeTranscriptOhmHandler');
    expect(ohmHandlerText).toContain('callRouterChat');
  });

  test('deploy scripts exist for hosting and functions release flow', () => {
    const rootPackage = JSON.parse(readFileSync(resolve('package.json'), 'utf8'));
    expect(rootPackage.scripts['deploy:functions']).toBeDefined();
    expect(rootPackage.scripts['deploy:hosting']).toBeDefined();
    expect(rootPackage.scripts['deploy:all']).toBeDefined();
    expect(existsSync(resolve('scripts/deploy-all.mjs'))).toBe(true);
  });
});
