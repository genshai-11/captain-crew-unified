import { transcribeRoundAudioClient } from '@caption-crew/shared-ai-client';
import { loadAdminRuntimeConfig } from '@/services/adminConfigRepository';

const TRANSCRIBE_URL = import.meta.env.DEV ? '/api/transcribeRoundAudio' : (import.meta.env.VITE_TRANSCRIBE_URL || '');

export async function transcribeRoundAudio(audioBlob: Blob, options: {
  role: 'captain' | 'crew';
  language: 'vi' | 'en';
  providerOverride?: 'deepgram' | 'google' | 'thirdparty';
  deepgramModelOverride?: string;
  googleModelOverride?: string;
  googleProjectIdOverride?: string;
  googleLocationOverride?: string;
  thirdPartyTranscriptModelOverride?: string;
  deepgramApiKeyOverride?: string;
  googleApiKeyOverride?: string;
  thirdPartyTranscriptApiKeyOverride?: string;
  thirdPartyTranscriptUrlOverride?: string;
  thirdPartyTranscriptAuthSchemeOverride?: 'none' | 'bearer' | 'x-api-key';
  preferServerConfig?: boolean;
}) {
  const config = loadAdminRuntimeConfig();
  return transcribeRoundAudioClient({
    transcribeUrl: TRANSCRIBE_URL,
    transcriptProvider: (config as any).transcriptProvider || 'deepgram',
    captainDeepgramModel: config.captainDeepgramModel,
    crewDeepgramModel: config.crewDeepgramModel,
    googleTranscriptModel: (config as any).googleTranscriptModel,
    googleCloudProjectId: (config as any).googleCloudProjectId,
    googleTranscriptLocation: (config as any).googleTranscriptLocation,
    thirdPartyTranscriptModel: (config as any).thirdPartyTranscriptModel,
    deepgramApiKey: (config as any).deepgramApiKey,
    googleApiKey: (config as any).googleApiKey,
    thirdPartyTranscriptApiKey: (config as any).thirdPartyTranscriptApiKey,
    thirdPartyTranscriptUrl: (config as any).thirdPartyTranscriptUrl,
    thirdPartyTranscriptAuthScheme: (config as any).thirdPartyTranscriptAuthScheme,
  }, audioBlob, options);
}
