import { getDeepgramAccessTokenClient, transcribeRoundAudioClient } from '@caption-crew/shared-ai-client';
import { loadAdminRuntimeConfig } from '@/services/adminConfigRepository';

const TRANSCRIBE_URL = import.meta.env.DEV ? '/api/transcribeRoundAudio' : (import.meta.env.VITE_TRANSCRIBE_URL || '');
const DEEPGRAM_TOKEN_URL = import.meta.env.DEV ? '/api/getDeepgramAccessToken' : (import.meta.env.VITE_DEEPGRAM_TOKEN_URL || '');

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
    deepgramTokenUrl: DEEPGRAM_TOKEN_URL,
    transcriptProvider: config.transcriptProvider,
    captainDeepgramModel: config.captainDeepgramModel,
    crewDeepgramModel: config.crewDeepgramModel,
    googleTranscriptModel: config.googleTranscriptModel,
    googleCloudProjectId: config.googleCloudProjectId,
    googleTranscriptLocation: config.googleTranscriptLocation,
    thirdPartyTranscriptModel: config.thirdPartyTranscriptModel,
    deepgramApiKey: config.deepgramApiKey,
    googleApiKey: config.googleApiKey,
    thirdPartyTranscriptApiKey: config.thirdPartyTranscriptApiKey,
    thirdPartyTranscriptUrl: config.thirdPartyTranscriptUrl,
    thirdPartyTranscriptAuthScheme: config.thirdPartyTranscriptAuthScheme,
  }, audioBlob, options);
}

export async function getDeepgramAccessToken() {
  const config = loadAdminRuntimeConfig();
  return getDeepgramAccessTokenClient({
    transcribeUrl: TRANSCRIBE_URL,
    deepgramTokenUrl: DEEPGRAM_TOKEN_URL,
    deepgramApiKey: config.deepgramApiKey,
  });
}
