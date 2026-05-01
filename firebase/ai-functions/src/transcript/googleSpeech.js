const { GOOGLE_STT_MODELS } = require('../config/sharedConfig');

function normalizeGoogleModelList(rawModels) {
  const explicit = String(rawModels || '')
    .split(',')
    .map((value) => String(value || '').trim())
    .filter(Boolean);

  if (explicit.length > 0) return explicit;
  return GOOGLE_STT_MODELS.map((model) => model.id);
}

function sanitizeSpeechModel(model) {
  return String(model || 'chirp_3')
    .replace(/^models\//, '')
    .trim()
    .replace(/[\s.,;:!?]+$/g, '')
    .toLowerCase();
}

function resolveSpeechLocation(model, location) {
  const cleanModel = sanitizeSpeechModel(model);
  const selected = String(location || 'global').trim().toLowerCase();

  if ((cleanModel === 'chirp_3' || cleanModel === 'chirp_2' || cleanModel.startsWith('chirp_')) && selected === 'global') {
    return 'us';
  }

  return selected || 'us';
}

module.exports = {
  normalizeGoogleModelList,
  sanitizeSpeechModel,
  resolveSpeechLocation,
};
