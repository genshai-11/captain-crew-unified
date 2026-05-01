import { evaluateCaptionCrewMeaningClient } from '@caption-crew/shared-ai-client';
import { loadAdminRuntimeConfig } from '@/services/adminConfigRepository';

const EVALUATE_MEANING_URL = import.meta.env.DEV ? '/api/evaluateCaptionCrewMeaning' : (import.meta.env.VITE_EVALUATE_MEANING_URL || '');

export async function evaluateCaptionCrewMeaning(payload: { captainTranscript: string; crewTranscript: string; strictness: 'loose' | 'medium' | 'strict' }) {
  const config = loadAdminRuntimeConfig();
  return evaluateCaptionCrewMeaningClient({
    evaluateMeaningUrl: EVALUATE_MEANING_URL,
    meaningStrictness: config.meaningStrictness,
    meaningWeight: config.meaningWeight,
    feedbackEnabled: config.feedbackEnabled,
    feedbackMode: config.feedbackMode,
    feedbackTone: config.feedbackTone,
    showGrammarReminder: config.showGrammarReminder,
    showImprovedSentence: config.showImprovedSentence,
    showWhenMeaningCorrect: config.showWhenMeaningCorrect,
    onlyIfAffectsClarity: config.onlyIfAffectsClarity,
  }, payload);
}
