const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Deepgram-Api-Key, X-Deepgram-Model, x-deepgram-api-key, x-deepgram-model, x-transcript-provider, x-google-api-key, x-google-model, x-google-models, x-google-project-id, x-google-location, x-google-ohm-model, x-thirdparty-transcript-url, x-thirdparty-transcript-api-key, x-thirdparty-transcript-model, x-thirdparty-transcript-auth-scheme, x-ohm-analysis-provider, x-thirdparty-ohm-url, x-thirdparty-ohm-api-key, x-thirdparty-ohm-model, x-thirdparty-ohm-auth-scheme, x-thirdparty-ohm-webhook-url',
  'Access-Control-Max-Age': '3600',
};

function applyCors(res) {
  Object.entries(corsHeaders).forEach(([key, value]) => res.set(key, value));
}

function handleOptions(req, res) {
  applyCors(res);
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return true;
  }
  return false;
}

function createThirdPartyAuthHeaders(authScheme, apiKey) {
  if (!apiKey || authScheme === 'none') return {};
  if (String(authScheme || '').toLowerCase() === 'x-api-key') {
    return { 'x-api-key': String(apiKey) };
  }
  return { Authorization: 'Bearer ' + String(apiKey) };
}

function toBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
    if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  }
  return fallback;
}

function toFiniteNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function parseDurationSeconds(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const text = String(value || '');
  const matched = text.match(/^(\d+(?:\.\d+)?)s$/);
  if (!matched) return 0;
  return Number(matched[1] || 0);
}

module.exports = {
  corsHeaders,
  applyCors,
  handleOptions,
  createThirdPartyAuthHeaders,
  toBoolean,
  toFiniteNumber,
  parseDurationSeconds,
};
