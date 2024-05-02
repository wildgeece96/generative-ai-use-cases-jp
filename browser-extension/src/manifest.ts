import { defineManifest } from '@crxjs/vite-plugin';
import { version } from '../package.json';

// NOTE: do not include src/ in paths,
// vite root folder: src, public folder: public (based on the project root)
// @see ../vite.config.ts#L16

const manifest = defineManifest(async (env) => ({
  manifest_version: 3,
  name: `${env.mode === 'development' ? '[Dev] ' : ''}generative-ai-use-cases-jp 拡張機能`,
  description: 'generative-ai-use-cases-jp をブラウザ拡張機能として利用できます。',
  version,
  background: {
    service_worker: 'background/index.ts',
  },
  web_accessible_resources: [
    {
      resources: ['pages/chat/index.html'],
      matches: ['http://*/*', 'https://*/*'],
    },
  ],
  content_scripts: [
    {
      matches: ['http://*/*', 'https://*/*', 'file:///*'],
      js: ['content/index.tsx'],
    },
  ],
  host_permissions: ['<all_urls>'],
  action: {
    default_popup: 'popup/index.html',
    default_icon: {
      '16': 'images/bedrock_icon_16.png',
      '32': 'images/bedrock_icon_32.png',
      '48': 'images/bedrock_icon_48.png',
      '128': 'images/bedrock_icon_64.png',
    },
  },
  icons: {
    '16': 'images/bedrock_icon_16.png',
    '32': 'images/bedrock_icon_32.png',
    '48': 'images/bedrock_icon_48.png',
    '128': 'images/bedrock_icon_64.png',
  },
  permissions: ['storage', 'tabs', 'contextMenus'],
}));

export default manifest;
