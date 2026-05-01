function createEvaluateCaptionCrewMeaningHandler({ onRequest, handleOptions, applyCors, getSharedAdminConfig, callRouterChat, logger }) {
  return onRequest({ cors: false, invoker: 'public' }, async (req, res) => {
    try {
      if (handleOptions(req, res)) return;
      applyCors(res);

      const sharedConfig = await getSharedAdminConfig();
      const apiKey = req.body.routerApiKey || process.env.ROUTER9_API_KEY || sharedConfig.router9ApiKey;
      const baseUrl = req.body.routerBaseUrl || process.env.ROUTER9_BASE_URL || sharedConfig.router9BaseUrl || 'https://rqlaeq5.9router.com/v1';
      const model = req.body.model || process.env.ROUTER9_MODEL || sharedConfig.router9Model;
      const fallbackModel = req.body.fallbackModel || process.env.ROUTER9_FALLBACK_MODEL || sharedConfig.router9FallbackModel;

      if (!apiKey) throw new Error('ROUTER9_API_KEY not configured');
      if (!model && !fallbackModel) throw new Error('No Router9 model configured');

      const captainTranscript = String(req.body.captainTranscript || '').trim();
      const crewTranscript = String(req.body.crewTranscript || '').trim();
      const strictness = String(req.body.strictness || sharedConfig.meaningStrictness || 'medium');
      const meaningWeight = typeof req.body.meaningWeight === 'number' ? req.body.meaningWeight : sharedConfig.meaningWeight || 100;
      const feedbackConfig = req.body.feedbackConfig && typeof req.body.feedbackConfig === 'object'
        ? req.body.feedbackConfig
        : {
            enabled: sharedConfig.feedbackEnabled,
            feedbackMode: sharedConfig.feedbackMode,
            tone: sharedConfig.feedbackTone,
            showGrammarReminder: sharedConfig.showGrammarReminder,
            showImprovedSentence: sharedConfig.showImprovedSentence,
            showWhenMeaningCorrect: sharedConfig.showWhenMeaningCorrect,
            onlyIfAffectsClarity: sharedConfig.onlyIfAffectsClarity,
          };

      const feedbackEnabled = feedbackConfig.enabled !== false;
      const feedbackMode = String(feedbackConfig.feedbackMode || 'gentle');
      const feedbackTone = String(feedbackConfig.tone || 'encouraging');
      const showGrammarReminder = feedbackConfig.showGrammarReminder !== false;
      const showImprovedSentence = feedbackConfig.showImprovedSentence !== false;
      const showWhenMeaningCorrect = feedbackConfig.showWhenMeaningCorrect !== false;
      const onlyIfAffectsClarity = feedbackConfig.onlyIfAffectsClarity === true;

      const prompt = `You are evaluating whether an English response preserves the meaning of an original Vietnamese sentence.\n\nScore ONLY by meaning and intent, not by literal word overlap. Natural paraphrases that preserve the same meaning should receive 95-100. Minor grammar mistakes must NOT reduce score unless they change meaning or clarity significantly.\n\nReturn strict JSON only with keys: matchScore, decision, reason, missingConcepts, extraConcepts, grammarNote, improvedTranscript, grammarSeverity, feedbackType.\n- matchScore: integer 0-100 based only on meaning equivalence\n- decision: one of match, partial, mismatch\n- reason: concise explanation focused on meaning\n- missingConcepts: string[] for important missing meaning elements only\n- extraConcepts: string[] for important added meaning only\n- grammarNote: short gentle note, or empty string if no reminder should be shown\n- improvedTranscript: smoother or more natural version, or empty string if not needed\n- grammarSeverity: one of none, minor, medium, major\n- feedbackType: one of off, gentle, balanced, detailed\n\nFeedback policy:\n- Feedback enabled: ${feedbackEnabled}\n- Feedback mode: ${feedbackMode}\n- Tone: ${feedbackTone}\n- Show grammar reminder: ${showGrammarReminder}\n- Show improved sentence: ${showImprovedSentence}\n- Show feedback when meaning is correct: ${showWhenMeaningCorrect}\n- Only show feedback if clarity is affected: ${onlyIfAffectsClarity}\n\nIf feedback is disabled, return empty grammarNote and improvedTranscript, grammarSeverity=none, feedbackType=off.\nIf meaning is correct and feedback is allowed, keep the wording gentle and encouraging.\nIf onlyIfAffectsClarity is true, hide minor grammar reminders that do not affect understanding.\n\nStrictness: ${strictness}\nMeaning weight hint: ${meaningWeight}\nCaptain original Vietnamese: ${captainTranscript}\nCrew English response: ${crewTranscript}`;

      const completion = await callRouterChat({
        apiKey,
        baseUrl,
        model,
        fallbackModel,
        temperature: 0.2,
        responseFormat: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'Be concise. Return only valid JSON with the requested keys.' },
          { role: 'user', content: prompt },
        ],
      });

      const raw = completion?.choices?.[0]?.message?.content;
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      const semanticScore = Math.max(0, Math.min(100, Number(parsed?.matchScore) || 0));

      res.json({
        matchScore: semanticScore,
        decision: parsed?.decision || (semanticScore >= 80 ? 'match' : semanticScore >= 50 ? 'partial' : 'mismatch'),
        reason: parsed?.reason || 'Meaning evaluation completed.',
        missingConcepts: Array.isArray(parsed?.missingConcepts) ? parsed.missingConcepts : [],
        extraConcepts: Array.isArray(parsed?.extraConcepts) ? parsed.extraConcepts : [],
        grammarNote: typeof parsed?.grammarNote === 'string' ? parsed.grammarNote : '',
        improvedTranscript: typeof parsed?.improvedTranscript === 'string' ? parsed.improvedTranscript : '',
        grammarSeverity: ['none', 'minor', 'medium', 'major'].includes(parsed?.grammarSeverity) ? parsed.grammarSeverity : 'none',
        feedbackType: ['off', 'gentle', 'balanced', 'detailed'].includes(parsed?.feedbackType) ? parsed?.feedbackType : (feedbackEnabled ? feedbackMode : 'off'),
      });
    } catch (error) {
      logger.error(error);
      applyCors(res);
      res.status(500).json({ error: error.message || 'Meaning evaluation failed' });
    }
  });
}

module.exports = {
  createEvaluateCaptionCrewMeaningHandler,
};
