import { describe, expect, test } from 'vitest';
import {
  calculateSemanticOhm,
  detectSemanticChunksFromCaptain,
  getDifficultyLabel,
  OhmCategory,
} from '../packages/shared-audio/src/ohmCalculator';

describe('shared ohm calculator', () => {
  test('detects semantic chunks from a mixed transcript', () => {
    const chunks = detectSemanticChunksFromCaptain('Honestly, you should remember that. Piece of cake!');

    expect(chunks).toEqual([
      { text: 'Honestly', label: OhmCategory.GREEN, ohm: 5 },
      { text: 'you should remember that', label: OhmCategory.BLUE, ohm: 7 },
      { text: 'Piece of cake', label: OhmCategory.RED, ohm: 9 },
    ]);
  });

  test('calculates voltage, formula, and score from chunk values', () => {
    const result = calculateSemanticOhm([
      { text: 'Honestly', label: OhmCategory.GREEN },
      { text: 'you should', label: OhmCategory.BLUE },
    ], 1.5);

    expect(result).toEqual({
      totalOhm: 18,
      formula: '(5 + 7) x 1.5',
      voltage: 18,
      current: 1.5,
      score: 15,
    });
  });

  test('maps voltage bands to difficulty labels', () => {
    expect(getDifficultyLabel(10)).toBe('Beginner');
    expect(getDifficultyLabel(40)).toBe('Intermediate');
    expect(getDifficultyLabel(80)).toBe('Advanced');
  });
});
