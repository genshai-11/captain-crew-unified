function extractFirstJsonObject(text) {
  const source = String(text || '').trim();
  if (!source) throw new Error('Empty AI response');
  const fenced = source.match(/```json\s*([\s\S]*?)\s*```/i);
  const raw = fenced?.[1] || source;
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end < 0 || end <= start) {
    throw new Error('AI response did not contain a JSON object');
  }
  return raw.slice(start, end + 1);
}

module.exports = {
  extractFirstJsonObject,
};
