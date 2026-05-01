function createGetDeepgramAccessTokenHandler({ onRequest, handleOptions, applyCors, getSharedAdminConfig, fetch, logger }) {
  return onRequest({ cors: false, invoker: 'public' }, async (req, res) => {
    try {
      if (handleOptions(req, res)) return;
      applyCors(res);

      const sharedConfig = await getSharedAdminConfig();
      const transcriptProvider = String(sharedConfig.transcriptProvider || 'deepgram').toLowerCase();
      const partialEnabled = sharedConfig.partialTranscriptEnabled === true;
      if (transcriptProvider !== 'deepgram' || !partialEnabled) {
        throw new Error('Deepgram live token is disabled because provider is not Deepgram or partial transcript setting is OFF.');
      }
      const apiKey = req.headers['x-deepgram-api-key'] || process.env.DEEPGRAM_API_KEY || sharedConfig.deepgramApiKey;
      if (!apiKey) throw new Error('DEEPGRAM_API_KEY not configured');

      const ttlSeconds = Math.max(30, Math.min(300, Number(req.body?.ttlSeconds || 90) || 90));
      const response = await fetch('https://api.deepgram.com/v1/auth/grant', {
        method: 'POST',
        headers: {
          Authorization: `Token ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ttl_seconds: ttlSeconds }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Deepgram token error (${response.status}): ${text}`);
      }

      const token = await response.json();
      res.json({
        accessToken: token?.access_token || '',
        expiresIn: Number(token?.expires_in || ttlSeconds),
      });
    } catch (error) {
      logger.error(error);
      applyCors(res);
      res.status(500).json({ error: error.message || 'Could not create Deepgram token' });
    }
  });
}

function createTranscribeRoundAudioHandler({
  onRequest,
  handleOptions,
  applyCors,
  getSharedAdminConfig,
  callThirdPartyTranscript,
  callGoogleSpeechTranscribe,
  callDeepgramListen,
  normalizeDeepgramResult,
  logger,
}) {
  return onRequest({ cors: false, invoker: 'public' }, async (req, res) => {
    try {
      if (handleOptions(req, res)) return;
      applyCors(res);

      const sharedConfig = await getSharedAdminConfig();
      const role = String(req.query.role || 'captain');
      const language = String(req.query.language || (role === 'captain' ? 'vi' : 'en'));
      const transcriptProvider = String(req.headers['x-transcript-provider'] || sharedConfig.transcriptProvider || 'deepgram').toLowerCase();

      const contentType = String(req.headers['content-type'] || 'audio/webm');
      const audioBuffer = req.rawBody;
      const audioBytes = audioBuffer?.length || audioBuffer?.byteLength || 0;

      if (!audioBuffer || !audioBytes) throw new Error('No audio payload received');

      if (transcriptProvider === 'thirdparty') {
        const thirdPartyUrl = String(req.headers['x-thirdparty-transcript-url'] || process.env.THIRD_PARTY_TRANSCRIPT_URL || sharedConfig.thirdPartyTranscriptUrl || '');
        const thirdPartyApiKey = req.headers['x-thirdparty-transcript-api-key'] || process.env.THIRD_PARTY_TRANSCRIPT_API_KEY || sharedConfig.thirdPartyTranscriptApiKey;
        const thirdPartyModel = String(req.headers['x-thirdparty-transcript-model'] || process.env.THIRD_PARTY_TRANSCRIPT_MODEL || sharedConfig.thirdPartyTranscriptModel || '');
        const thirdPartyAuthScheme = String(req.headers['x-thirdparty-transcript-auth-scheme'] || process.env.THIRD_PARTY_TRANSCRIPT_AUTH_SCHEME || sharedConfig.thirdPartyTranscriptAuthScheme || 'bearer').toLowerCase();

        logger.info('STT request received (thirdparty)', { role, language, thirdPartyUrl, thirdPartyModel, contentType, audioBytes });

        const thirdPartyResult = await callThirdPartyTranscript({
          url: thirdPartyUrl,
          apiKey: thirdPartyApiKey,
          authScheme: thirdPartyAuthScheme,
          contentType,
          audioBuffer,
        });

        const transcript = String(thirdPartyResult?.transcript || '').trim();
        res.json({
          transcript,
          words: [],
          confidence: Number(thirdPartyResult?.confidence || (transcript ? 1 : 0)),
          duration: Number(thirdPartyResult?.duration || 0),
          modelRequested: thirdPartyModel,
          modelUsed: String(thirdPartyResult?.modelUsed || thirdPartyModel || ''),
          fallbackUsed: false,
          roleReceived: role,
          languageReceived: language,
          contentTypeReceived: contentType,
          requestId: String(thirdPartyResult?.requestId || ''),
          transcriptProviderUsed: 'thirdparty',
        });
        return;
      }

      if (transcriptProvider === 'google') {
        const googleModel = String(req.headers['x-google-model'] || sharedConfig.googleTranscriptModel || 'chirp_3');
        const googleProjectId = String(req.headers['x-google-project-id'] || sharedConfig.googleCloudProjectId || process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || '');
        const googleLocation = String(req.headers['x-google-location'] || sharedConfig.googleTranscriptLocation || 'global');

        logger.info('STT request received (google)', { role, language, googleModel, googleLocation, googleProjectId, contentType, audioBytes });

        const googleResult = await callGoogleSpeechTranscribe({
          model: googleModel,
          language,
          location: googleLocation,
          projectId: googleProjectId,
          contentType,
          audioBuffer,
        });

        const transcript = String(googleResult?.transcript || '').trim();
        res.json({
          transcript,
          words: [],
          confidence: Number(googleResult?.confidence || (transcript ? 1 : 0)),
          duration: Number(googleResult?.duration || 0),
          modelRequested: googleModel,
          modelUsed: String(googleResult?.metadata?.model || googleModel),
          fallbackUsed: false,
          roleReceived: role,
          languageReceived: language,
          contentTypeReceived: contentType,
          requestId: String(googleResult?.metadata?.requestId || ''),
          transcriptProviderUsed: 'google',
        });
        return;
      }

      const selectedModel = String(req.headers['x-deepgram-model'] || (role === 'captain' ? sharedConfig.captainDeepgramModel : sharedConfig.crewDeepgramModel) || 'nova-3');
      const apiKey = req.headers['x-deepgram-api-key'] || process.env.DEEPGRAM_API_KEY || sharedConfig.deepgramApiKey;
      if (!apiKey) throw new Error('DEEPGRAM_API_KEY not configured');

      logger.info('STT request received (deepgram)', { role, language, selectedModel, contentType, audioBytes });

      const primaryRaw = await callDeepgramListen({
        apiKey,
        model: selectedModel,
        language,
        contentType,
        audioBuffer,
        detectLanguage: false,
      });

      let normalized = normalizeDeepgramResult(primaryRaw, { modelUsed: selectedModel, fallbackUsed: false });

      const shouldFallback = !normalized.transcript.trim() && selectedModel !== 'nova-2';
      if (shouldFallback) {
        logger.warn('STT empty transcript, retrying fallback model', { role, language, selectedModel, contentType, audioBytes });
        const fallbackRaw = await callDeepgramListen({
          apiKey,
          model: 'nova-2',
          language,
          contentType,
          audioBuffer,
          detectLanguage: false,
        });
        const fallbackNormalized = normalizeDeepgramResult(fallbackRaw, { modelUsed: 'nova-2', fallbackUsed: true });
        if (fallbackNormalized.transcript.trim()) normalized = fallbackNormalized;
      }

      res.json({
        transcript: normalized.transcript,
        words: normalized.words,
        confidence: normalized.confidence,
        duration: normalized.duration,
        modelRequested: selectedModel,
        modelUsed: normalized.modelUsed,
        fallbackUsed: normalized.fallbackUsed,
        roleReceived: role,
        languageReceived: language,
        contentTypeReceived: contentType,
        requestId: normalized.requestId,
        transcriptProviderUsed: 'deepgram',
      });
    } catch (error) {
      logger.error(error);
      applyCors(res);
      res.status(500).json({ error: error.message || 'Transcription failed' });
    }
  });
}

module.exports = {
  createGetDeepgramAccessTokenHandler,
  createTranscribeRoundAudioHandler,
};
