function normalizeOhmSettings(sharedConfig = {}) {
  const defaultWeights = { GREEN: 5, BLUE: 7, RED: 9, PINK: 3 };
  const defaultConstraints = {
    veryShort: { maxSentences: 1, maxWords: 25 },
    short: { maxSentences: 2, maxWords: 35 },
    medium: { maxSentences: 3, maxWords: 60 },
    long: { maxSentences: 5, maxWords: 110 },
  };
  const defaultCoefficients = { veryShort: 1, short: 1.5, medium: 2, long: 2.5, overLong: 2.5 };

  return {
    weights: {
      GREEN: Number(sharedConfig?.ohmWeights?.GREEN || defaultWeights.GREEN),
      BLUE: Number(sharedConfig?.ohmWeights?.BLUE || defaultWeights.BLUE),
      RED: Number(sharedConfig?.ohmWeights?.RED || defaultWeights.RED),
      PINK: Number(sharedConfig?.ohmWeights?.PINK || defaultWeights.PINK),
    },
    constraints: {
      veryShort: {
        maxSentences: Number(sharedConfig?.ohmLengthConstraints?.veryShort?.maxSentences || defaultConstraints.veryShort.maxSentences),
        maxWords: Number(sharedConfig?.ohmLengthConstraints?.veryShort?.maxWords || defaultConstraints.veryShort.maxWords),
      },
      short: {
        maxSentences: Number(sharedConfig?.ohmLengthConstraints?.short?.maxSentences || defaultConstraints.short.maxSentences),
        maxWords: Number(sharedConfig?.ohmLengthConstraints?.short?.maxWords || defaultConstraints.short.maxWords),
      },
      medium: {
        maxSentences: Number(sharedConfig?.ohmLengthConstraints?.medium?.maxSentences || defaultConstraints.medium.maxSentences),
        maxWords: Number(sharedConfig?.ohmLengthConstraints?.medium?.maxWords || defaultConstraints.medium.maxWords),
      },
      long: {
        maxSentences: Number(sharedConfig?.ohmLengthConstraints?.long?.maxSentences || defaultConstraints.long.maxSentences),
        maxWords: Number(sharedConfig?.ohmLengthConstraints?.long?.maxWords || defaultConstraints.long.maxWords),
      },
    },
    coefficients: {
      veryShort: Number(sharedConfig?.ohmLengthCoefficients?.veryShort || defaultCoefficients.veryShort),
      short: Number(sharedConfig?.ohmLengthCoefficients?.short || defaultCoefficients.short),
      medium: Number(sharedConfig?.ohmLengthCoefficients?.medium || defaultCoefficients.medium),
      long: Number(sharedConfig?.ohmLengthCoefficients?.long || defaultCoefficients.long),
      overLong: Number(sharedConfig?.ohmLengthCoefficients?.overLong || defaultCoefficients.overLong),
    },
  };
}

function resolveLengthBucket(transcript, constraints = {}) {
  const sentenceCount = String(transcript || '').split(/[.!?\n\r]+/).map((segment) => segment.trim()).filter(Boolean).length || 1;
  const wordCount = String(transcript || '').trim().split(/\s+/).filter(Boolean).length;

  if (sentenceCount <= (constraints.veryShort?.maxSentences || 1) && wordCount <= (constraints.veryShort?.maxWords || 25)) {
    return { sentenceCount, wordCount, lengthBucket: 'veryShort' };
  }
  if (sentenceCount <= (constraints.short?.maxSentences || 2) && wordCount <= (constraints.short?.maxWords || 35)) {
    return { sentenceCount, wordCount, lengthBucket: 'short' };
  }
  if (sentenceCount <= (constraints.medium?.maxSentences || 3) && wordCount <= (constraints.medium?.maxWords || 60)) {
    return { sentenceCount, wordCount, lengthBucket: 'medium' };
  }
  if (sentenceCount <= (constraints.long?.maxSentences || 5) && wordCount <= (constraints.long?.maxWords || 110)) {
    return { sentenceCount, wordCount, lengthBucket: 'long' };
  }
  return { sentenceCount, wordCount, lengthBucket: 'overLong' };
}

function computeOhmFromChunks(chunks = [], weights = { GREEN: 5, BLUE: 7, RED: 9, PINK: 3 }) {
  const values = chunks
    .map((chunk) => {
      const label = String(chunk?.label || '').toUpperCase();
      return Number(weights[label] || 0);
    })
    .filter((value) => Number.isFinite(value) && value > 0);

  if (values.length === 0) {
    return { baseOhm: 0, formula: '0' };
  }

  const baseOhm = values.reduce((acc, value) => acc + value, 0);
  const formula = values.length > 1 ? `(${values.join(' + ')})` : `${values[0]}`;

  return { baseOhm, formula };
}

function normalizeOhmText(value = '') {
  return String(value || '')
    .toLowerCase()
    .replace(/[“”"'`]/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

module.exports = {
  normalizeOhmSettings,
  resolveLengthBucket,
  computeOhmFromChunks,
  normalizeOhmText,
};
