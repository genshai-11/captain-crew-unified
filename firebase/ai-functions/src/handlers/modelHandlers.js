function createFetchGoogleSttModelsHandler({ onRequest, handleOptions, applyCors, getSharedAdminConfig, GOOGLE_STT_MODELS, logger }) {
  return onRequest({ cors: false, invoker: 'public' }, async (req, res) => {
    try {
      if (handleOptions(req, res)) return;
      applyCors(res);
      const sharedConfig = await getSharedAdminConfig();
      const configuredModel = String(sharedConfig.googleTranscriptModel || 'chirp_3');
      res.json({
        models: GOOGLE_STT_MODELS,
        recommendedModel: 'chirp_3',
        configuredModel,
      });
    } catch (error) {
      logger.error(error);
      applyCors(res);
      res.status(500).json({ error: error.message || 'Failed to fetch Google STT models' });
    }
  });
}

function createTestGoogleSttModelsHandler({ onRequest, handleOptions, applyCors, getSharedAdminConfig, normalizeGoogleModelList, callGoogleSpeechTranscribe, logger }) {
  return onRequest({ cors: false, invoker: 'public' }, async (req, res) => {
    try {
      if (handleOptions(req, res)) return;
      applyCors(res);

      const sharedConfig = await getSharedAdminConfig();
      const role = String(req.query.role || 'captain');
      const language = String(req.query.language || (role === 'captain' ? 'vi' : 'en'));
      const contentType = String(req.headers['content-type'] || 'audio/webm');
      const audioBuffer = req.rawBody;
      const audioBytes = audioBuffer?.length || audioBuffer?.byteLength || 0;
      if (!audioBuffer || !audioBytes) throw new Error('No audio payload received');

      const googleProjectId = String(req.headers['x-google-project-id'] || sharedConfig.googleCloudProjectId || process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || '');
      const googleLocation = String(req.headers['x-google-location'] || sharedConfig.googleTranscriptLocation || 'global');
      const requestedModels = normalizeGoogleModelList(req.headers['x-google-models'] || req.body?.models);
      if (!googleProjectId) throw new Error('Google STT project ID is missing');

      logger.info('Testing Google STT models', { role, language, models: requestedModels, googleLocation, googleProjectId, contentType, audioBytes });
      const startedAt = Date.now();
      const results = await Promise.all(requestedModels.map(async (modelId) => {
        const modelStartedAt = Date.now();
        try {
          const result = await callGoogleSpeechTranscribe({
            model: modelId,
            language,
            location: googleLocation,
            projectId: googleProjectId,
            contentType,
            audioBuffer,
          });
          const transcript = String(result?.transcript || '').trim();
          return {
            model: modelId,
            ok: true,
            transcript,
            emptyTranscript: !transcript,
            confidence: Number(result?.confidence || 0),
            duration: Number(result?.duration || 0),
            elapsedMs: Date.now() - modelStartedAt,
            requestId: String(result?.metadata?.requestId || ''),
          };
        } catch (modelError) {
          return {
            model: modelId,
            ok: false,
            transcript: '',
            emptyTranscript: true,
            confidence: 0,
            duration: 0,
            elapsedMs: Date.now() - modelStartedAt,
            error: modelError?.message || String(modelError),
          };
        }
      }));

      const passedModels = results.filter((entry) => entry.ok && !entry.emptyTranscript).map((entry) => entry.model);
      res.json({
        role,
        language,
        location: googleLocation,
        projectId: googleProjectId,
        totalModels: requestedModels.length,
        passedModels,
        elapsedMs: Date.now() - startedAt,
        results,
      });
    } catch (error) {
      logger.error(error);
      applyCors(res);
      res.status(500).json({ error: error.message || 'Google STT model test failed' });
    }
  });
}

function createFetchRouterModelsHandler({ onRequest, handleOptions, applyCors, getSharedAdminConfig, fetch, logger }) {
  return onRequest({ cors: false, invoker: 'public' }, async (req, res) => {
    try {
      if (handleOptions(req, res)) return;
      applyCors(res);

      const sharedConfig = await getSharedAdminConfig();
      const apiKey = req.body.routerApiKey || process.env.ROUTER9_API_KEY || sharedConfig.router9ApiKey;
      const baseUrl = req.body.routerBaseUrl || process.env.ROUTER9_BASE_URL || sharedConfig.router9BaseUrl || 'https://rqlaeq5.9router.com/v1';
      if (!apiKey) throw new Error('ROUTER9_API_KEY not configured');

      const response = await fetch(`${baseUrl.replace(/\/$/, '')}/models`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Router9 models error (${response.status}): ${text}`);
      }

      const result = await response.json();
      res.json({ models: Array.isArray(result?.data) ? result.data : [] });
    } catch (error) {
      logger.error(error);
      applyCors(res);
      res.status(500).json({ error: error.message || 'Failed to fetch models' });
    }
  });
}

function createTestRouterCompletionHandler({ onRequest, handleOptions, applyCors, getSharedAdminConfig, callRouterChat, logger }) {
  return onRequest({ cors: false, invoker: 'public' }, async (req, res) => {
    try {
      if (handleOptions(req, res)) return;
      applyCors(res);

      const sharedConfig = await getSharedAdminConfig();
      const apiKey = req.body.routerApiKey || process.env.ROUTER9_API_KEY || sharedConfig.router9ApiKey;
      const baseUrl = req.body.routerBaseUrl || process.env.ROUTER9_BASE_URL || sharedConfig.router9BaseUrl || 'https://rqlaeq5.9router.com/v1';
      const model = req.body.model || process.env.ROUTER9_MODEL || sharedConfig.router9Model;
      const fallbackModel = req.body.fallbackModel || process.env.ROUTER9_FALLBACK_MODEL || sharedConfig.router9FallbackModel;

      const completion = await callRouterChat({
        apiKey,
        baseUrl,
        model,
        fallbackModel,
        temperature: 0,
        messages: [
          { role: 'system', content: 'Reply with a single short sentence.' },
          { role: 'user', content: 'Say: Router9 connection OK' },
        ],
      });

      const content = completion?.choices?.[0]?.message?.content || '';
      res.json({ ok: true, content, model: model || fallbackModel || '' });
    } catch (error) {
      logger.error(error);
      applyCors(res);
      res.status(500).json({ error: error.message || 'Router9 completion test failed' });
    }
  });
}

module.exports = {
  createFetchGoogleSttModelsHandler,
  createTestGoogleSttModelsHandler,
  createFetchRouterModelsHandler,
  createTestRouterCompletionHandler,
};
