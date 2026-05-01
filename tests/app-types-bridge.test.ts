import { describe, expect, test } from 'vitest';
import type { SummaryLocationState as ThcSummaryLocationState } from '../apps/thc-web/src/types';
import type { SummaryLocationState as CcSummaryLocationState, TranscriptResult as CcTranscriptResult } from '../apps/cc-web/src/types';

describe('app type bridges', () => {
  test('THC and CC app type entrypoints expose the same summary contract needed by shared screens', () => {
    const transcript: CcTranscriptResult = {
      transcript: 'crew answer',
      confidence: 0.92,
      duration: 2.1,
      source: 'batch',
      transcriptProviderUsed: 'thirdparty',
    };

    const thcSummary: ThcSummaryLocationState = {
      evaluation: null,
      reactionDelayMs: 3000,
      captainTranscript: transcript,
      crewTranscript: transcript,
      captainVerifiedTranscript: transcript,
      crewVerifiedTranscript: transcript,
      ohmResult: null,
    };

    const ccSummary: CcSummaryLocationState = thcSummary;

    expect(ccSummary.crewVerifiedTranscript?.transcriptProviderUsed).toBe('thirdparty');
  });
});
