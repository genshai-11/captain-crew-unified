import { analyzeTranscriptClient, type OhmAnalysisResult } from '@caption-crew/shared-ai-client';
import { loadAdminRuntimeConfig } from '@/services/adminConfigRepository';

export type { OhmAnalysisResult };

const ANALYZE_OHM_URL = import.meta.env.DEV ? '/api/analyzeTranscriptOhm' : (import.meta.env.VITE_ANALYZE_OHM_URL || '');

export async function analyzeTranscript(transcript: string, options?: {
  model?: string;
  fallbackModel?: string;
  reactionDelayMs?: number | null;
  useMemoryAssist?: boolean;
  returnDebug?: boolean;
  sessionId?: string;
  roundId?: string;
  userId?: string;
}): Promise<OhmAnalysisResult> {
  const config = loadAdminRuntimeConfig();
  return analyzeTranscriptClient({
    analyzeOhmUrl: ANALYZE_OHM_URL,
    ohmModel: config.ohmModel,
    ohmFallbackModel: config.ohmFallbackModel,
    router9Model: config.router9Model,
    router9FallbackModel: config.router9FallbackModel,
    ohmAgentEnabled: config.ohmAgentEnabled,
    ohmAgentShadowMode: config.ohmAgentShadowMode,
  }, transcript, options);
}
