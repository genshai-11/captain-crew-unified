import { afterEach, describe, expect, test, vi } from 'vitest';
import {
  evaluateCaptionCrewMeaningClient,
  getDeepgramAccessTokenClient,
  transcribeRoundAudioClient,
} from '../packages/shared-ai-client/src';

describe('shared ai client', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('transcribeRoundAudioClient forwards provider headers and maps the response', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        transcript: 'xin chào',
        confidence: 0.77,
        duration: 1.4,
        transcriptProviderUsed: 'google',
      }),
    } as Response);

    const result = await transcribeRoundAudioClient({
      transcribeUrl: 'https://api.example/transcribe',
      transcriptProvider: 'google',
      googleTranscriptModel: 'chirp_3',
      googleCloudProjectId: 'project-1',
      googleTranscriptLocation: 'asia-southeast1',
    }, new Blob(['audio'], { type: 'audio/webm' }), {
      role: 'captain',
      language: 'vi',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('role=captain&language=vi');
    expect((init?.headers as Record<string, string>)['x-transcript-provider']).toBe('google');
    expect((init?.headers as Record<string, string>)['x-google-model']).toBe('chirp_3');
    expect(result.transcript).toBe('xin chào');
    expect(result.transcriptProviderUsed).toBe('google');
    expect(result.source).toBe('batch');
  });

  test('getDeepgramAccessTokenClient includes API key header and returns token metadata', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ accessToken: 'token-123', expiresIn: 55 }),
    } as Response);

    const result = await getDeepgramAccessTokenClient({
      transcribeUrl: 'https://api.example/transcribe',
      deepgramTokenUrl: 'https://api.example/token',
      deepgramApiKey: 'secret-key',
    });

    const [, init] = fetchMock.mock.calls[0];
    expect((init?.headers as Record<string, string>)['x-deepgram-api-key']).toBe('secret-key');
    expect(result).toEqual({ accessToken: 'token-123', expiresIn: 55 });
  });

  test('evaluateCaptionCrewMeaningClient sends feedback config and maps evaluation response', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        matchScore: 88,
        decision: 'match',
        reason: 'Good semantic match',
        missingConcepts: [],
        extraConcepts: [],
        feedbackType: 'balanced',
      }),
    } as Response);

    const result = await evaluateCaptionCrewMeaningClient({
      evaluateMeaningUrl: 'https://api.example/meaning',
      meaningStrictness: 'strict',
      feedbackEnabled: true,
      feedbackMode: 'balanced',
      feedbackTone: 'coach',
      showGrammarReminder: true,
      showImprovedSentence: true,
      showWhenMeaningCorrect: true,
      onlyIfAffectsClarity: false,
    }, {
      captainTranscript: 'Do your homework',
      crewTranscript: 'Please do your homework',
      strictness: 'loose',
    });

    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(String(init?.body));
    expect(body.strictness).toBe('strict');
    expect(body.feedbackConfig.feedbackMode).toBe('balanced');
    expect(result.decision).toBe('match');
    expect(result.feedbackType).toBe('balanced');
  });
});
