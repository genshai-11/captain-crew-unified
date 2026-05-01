import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'node:path';
const sharedFunctionsTarget = process.env.SHARED_FUNCTIONS_PROXY_TARGET || 'https://us-central1-gen-lang-client-0815518176.cloudfunctions.net';
export default defineConfig({
  server: {
    host: '::',
    port: 4174,
    proxy: {
      '/api/transcribeRoundAudio': { target: sharedFunctionsTarget, changeOrigin: true, rewrite: () => '/transcribeRoundAudio' },
      '/api/getDeepgramAccessToken': { target: sharedFunctionsTarget, changeOrigin: true, rewrite: () => '/getDeepgramAccessToken' },
      '/api/fetchRouterModels': { target: sharedFunctionsTarget, changeOrigin: true, rewrite: () => '/fetchRouterModels' },
      '/api/testRouterCompletion': { target: sharedFunctionsTarget, changeOrigin: true, rewrite: () => '/testRouterCompletion' },
      '/api/fetchGoogleSttModels': { target: sharedFunctionsTarget, changeOrigin: true, rewrite: () => '/fetchGoogleSttModels' },
      '/api/testGoogleSttModels': { target: sharedFunctionsTarget, changeOrigin: true, rewrite: () => '/testGoogleSttModels' },
      '/api/analyzeTranscriptOhm': { target: sharedFunctionsTarget, changeOrigin: true, rewrite: () => '/analyzeTranscriptOhm' },
      '/api/evaluateCaptionCrewMeaning': { target: sharedFunctionsTarget, changeOrigin: true, rewrite: () => '/evaluateCaptionCrewMeaning' }
    }
  },
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } }
});
