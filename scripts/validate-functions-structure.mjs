import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const requiredFiles = [
  'firebase/ai-functions/src/config/sharedConfig.js',
  'firebase/ai-functions/src/utils/http.js',
  'firebase/ai-functions/src/transcript/googleSpeech.js',
  'firebase/ai-functions/src/meaning/json.js',
  'firebase/ai-functions/src/ohm/core.js',
  'firebase/ai-functions/src/handlers/transcriptHandlers.js',
  'firebase/ai-functions/src/handlers/ohmHandlers.js',
  'firebase/ai-functions/src/handlers/modelHandlers.js',
  'firebase/ai-functions/src/handlers/meaningHandlers.js',
];

const missing = requiredFiles.filter((file) => !existsSync(file));
if (missing.length > 0) {
  console.error('Missing required backend modules:\n' + missing.join('\n'));
  process.exit(1);
}

execFileSync(process.execPath, ['--check', 'firebase/ai-functions/src/index.js'], { stdio: 'inherit' });

console.log('Functions structure OK');
