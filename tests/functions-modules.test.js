const { GOOGLE_STT_MODELS, defaultSharedConfig } = require('../firebase/ai-functions/src/config/sharedConfig');
const {
  applyCors,
  handleOptions,
  createThirdPartyAuthHeaders,
  toBoolean,
  toFiniteNumber,
  parseDurationSeconds,
} = require('../firebase/ai-functions/src/utils/http');
const {
  normalizeGoogleModelList,
  sanitizeSpeechModel,
  resolveSpeechLocation,
} = require('../firebase/ai-functions/src/transcript/googleSpeech');
const { extractFirstJsonObject } = require('../firebase/ai-functions/src/meaning/json');
const {
  normalizeOhmSettings,
  resolveLengthBucket,
  computeOhmFromChunks,
  normalizeOhmText,
} = require('../firebase/ai-functions/src/ohm/core');

describe('functions helper modules', () => {
  test('exports canonical shared config defaults and Google STT model catalog', () => {
    expect(defaultSharedConfig.transcriptProvider).toBe('deepgram');
    expect(defaultSharedConfig.ohmWeights).toEqual({ GREEN: 5, BLUE: 7, RED: 9, PINK: 3 });
    expect(GOOGLE_STT_MODELS.map((model) => model.id)).toEqual(['chirp_3', 'chirp_2', 'telephony']);
  });

  test('http helpers apply cors and normalize header/auth/boolean/number parsing', () => {
    const headers = {};
    const res = {
      statusCode: 0,
      payload: '',
      set(key, value) {
        headers[key] = value;
      },
      status(code) {
        this.statusCode = code;
        return this;
      },
      send(payload) {
        this.payload = payload;
        return this;
      },
    };

    applyCors(res);
    expect(headers['Access-Control-Allow-Origin']).toBe('*');
    expect(createThirdPartyAuthHeaders('x-api-key', 'secret')).toEqual({ 'x-api-key': 'secret' });
    expect(createThirdPartyAuthHeaders('bearer', 'secret')).toEqual({ Authorization: 'Bearer secret' });
    expect(toBoolean('yes')).toBe(true);
    expect(toBoolean('off', true)).toBe(false);
    expect(toFiniteNumber('12.5', 0)).toBe(12.5);
    expect(parseDurationSeconds('3.75s')).toBe(3.75);

    const handled = handleOptions({ method: 'OPTIONS' }, res);
    expect(handled).toBe(true);
    expect(res.statusCode).toBe(204);
  });

  test('transcript helpers sanitize models and resolve location fallbacks', () => {
    expect(normalizeGoogleModelList('chirp_3, telephony')).toEqual(['chirp_3', 'telephony']);
    expect(normalizeGoogleModelList('')).toEqual(['chirp_3', 'chirp_2', 'telephony']);
    expect(sanitizeSpeechModel('models/chirp_3...')).toBe('chirp_3');
    expect(resolveSpeechLocation('chirp_3', 'global')).toBe('us');
    expect(resolveSpeechLocation('telephony', 'global')).toBe('global');
  });

  test('meaning helper extracts first JSON object from fenced model output', () => {
    expect(extractFirstJsonObject('```json\n{"score":88}\n```')).toBe('{"score":88}');
    expect(() => extractFirstJsonObject('no json here')).toThrow('AI response did not contain a JSON object');
  });

  test('ohm helpers normalize settings, bucket transcript length, compute formulas, and normalize text', () => {
    const normalized = normalizeOhmSettings({
      ohmWeights: { GREEN: 4 },
      ohmLengthConstraints: { short: { maxSentences: 9, maxWords: 99 } },
      ohmLengthCoefficients: { overLong: 3.5 },
    });

    expect(normalized.weights).toEqual({ GREEN: 4, BLUE: 7, RED: 9, PINK: 3 });
    expect(normalized.constraints.short).toEqual({ maxSentences: 9, maxWords: 99 });
    expect(normalized.coefficients.overLong).toBe(3.5);
    expect(resolveLengthBucket('One short sentence.', normalized.constraints).lengthBucket).toBe('veryShort');
    expect(computeOhmFromChunks([{ label: 'GREEN' }, { label: 'RED' }], normalized.weights)).toEqual({
      baseOhm: 13,
      formula: '(4 + 9)',
    });
    expect(normalizeOhmText('“Piece of Cake!”')).toBe('piece of cake');
  });
});
