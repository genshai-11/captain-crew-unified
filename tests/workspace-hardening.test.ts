import { describe, expect, test } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('workspace hardening contracts', () => {
  test('functions validation script exists and checks the modular backend layout', () => {
    const scriptPath = resolve('scripts/validate-functions-structure.mjs');
    expect(existsSync(scriptPath)).toBe(true);

    const script = readFileSync(scriptPath, 'utf8');
    expect(script).toContain('firebase/ai-functions/src/config/sharedConfig.js');
    expect(script).toContain('firebase/ai-functions/src/utils/http.js');
    expect(script).toContain('firebase/ai-functions/src/transcript/googleSpeech.js');
    expect(script).toContain('firebase/ai-functions/src/meaning/json.js');
    expect(script).toContain('firebase/ai-functions/src/ohm/core.js');
  });

  test('deploy hardening docs and CI workflow exist for smoke validation', () => {
    const deployDoc = resolve('docs/deploy-hardening.md');
    const workflow = resolve('.github/workflows/ci-smoke.yml');

    expect(existsSync(deployDoc)).toBe(true);
    expect(existsSync(workflow)).toBe(true);

    const deployDocText = readFileSync(deployDoc, 'utf8');
    const workflowText = readFileSync(workflow, 'utf8');

    expect(deployDocText).toContain('npm run smoke:workspace');
    expect(deployDocText).toContain('chunks-cc-faceoff.web.app');
    expect(deployDocText).toContain('chunks-tron-thc.web.app');
    expect(workflowText).toContain('npm ci');
    expect(workflowText).toContain('npm run smoke:workspace');
  });
});
