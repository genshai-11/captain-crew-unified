import { describe, expect, test } from 'vitest';
import type {
  SummaryLocationState,
  TranscriptResult,
  RoundRecord,
  RoomRoundDoc,
} from '../packages/shared-types/src';

describe('shared type contracts', () => {
  test('SummaryLocationState includes verified transcripts and OHM analysis fields', () => {
    const transcript: TranscriptResult = {
      transcript: 'hello world',
      confidence: 0.9,
      duration: 2.5,
      source: 'batch',
      transcriptProviderUsed: 'deepgram',
    };

    const summary: SummaryLocationState = {
      evaluation: null,
      reactionDelayMs: 2100,
      captainTranscript: transcript,
      crewTranscript: transcript,
      captainVerifiedTranscript: transcript,
      crewVerifiedTranscript: transcript,
      ohmResult: {
        totalOhm: 12,
        formula: '(5 + 7) x 1',
        voltage: 12,
        current: 1,
        difficulty: 'Beginner',
        score: 10,
        chunkCount: 2,
        chunks: [
          { text: 'honestly', label: 'GREEN', ohm: 5 },
          { text: 'you should', label: 'BLUE', ohm: 7 },
        ],
      },
    };

    expect(summary.ohmResult?.chunkCount).toBe(2);
    expect(summary.captainVerifiedTranscript?.transcriptProviderUsed).toBe('deepgram');
  });

  test('RoundRecord and RoomRoundDoc accept transcript metadata from the shared contract', () => {
    const transcript: TranscriptResult = {
      transcript: 'captain message',
      confidence: 0.85,
      duration: 1.6,
      source: 'streaming-fallback-batch',
      transcriptProviderUsed: 'google',
    };

    const round: RoundRecord = {
      id: 'round-1',
      createdAt: '2026-05-01T00:00:00Z',
      state: 'results',
      captainTranscript: transcript,
      crewTranscript: transcript,
      timeoutLost: false,
    };

    const roomRound: RoomRoundDoc = {
      roomId: 'room-1',
      roundNumber: 1,
      status: 'finished',
      createdAt: new Date().toISOString(),
      captainTranscriptMeta: round.captainTranscript,
      crewTranscriptMeta: round.crewTranscript,
    };

    expect(roomRound.captainTranscriptMeta?.source).toBe('streaming-fallback-batch');
    expect(roomRound.crewTranscriptMeta?.transcriptProviderUsed).toBe('google');
  });
});
