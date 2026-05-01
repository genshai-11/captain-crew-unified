import { describe, expect, test } from 'vitest';

import { RolePanel as SharedRolePanel, ResultCard as SharedResultCard, AudioWave as SharedAudioWave } from '../packages/shared-ui/src';
import { useRoundRecorder as SharedUseRoundRecorder } from '../packages/shared-audio/src/useRoundRecorder';

import { RolePanel as ThcRolePanel } from '../apps/thc-web/src/components/RolePanel';
import { ResultCard as ThcResultCard } from '../apps/thc-web/src/components/ResultCard';
import { AudioWave as ThcAudioWave } from '../apps/thc-web/src/components/AudioWave';
import { useRoundRecorder as ThcUseRoundRecorder } from '../apps/thc-web/src/hooks/useRoundRecorder';

import { RolePanel as CcRolePanel } from '../apps/cc-web/src/components/RolePanel';
import { ResultCard as CcResultCard } from '../apps/cc-web/src/components/ResultCard';
import { AudioWave as CcAudioWave } from '../apps/cc-web/src/components/AudioWave';
import { useRoundRecorder as CcUseRoundRecorder } from '../apps/cc-web/src/hooks/useRoundRecorder';

describe('app wrappers over shared packages', () => {
  test('THC app delegates duplicated UI and audio modules to shared packages', () => {
    expect(ThcRolePanel).toBe(SharedRolePanel);
    expect(ThcResultCard).toBe(SharedResultCard);
    expect(ThcAudioWave).toBe(SharedAudioWave);
    expect(ThcUseRoundRecorder).toBe(SharedUseRoundRecorder);
  });

  test('CC app delegates duplicated UI and audio modules to shared packages', () => {
    expect(CcRolePanel).toBe(SharedRolePanel);
    expect(CcResultCard).toBe(SharedResultCard);
    expect(CcAudioWave).toBe(SharedAudioWave);
    expect(CcUseRoundRecorder).toBe(SharedUseRoundRecorder);
  });
});
