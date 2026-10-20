// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import askAiCorpus from './src/integrations/ask-ai-corpus.mjs';

// Deployed to GitHub Pages under the AMD-AIM organization.
// If you later move to a custom domain (e.g. docs.radeon.cloud), set
// site to that domain and base to '/'.
const SITE = 'https://amd-aim.github.io';
const BASE = '/radeon-cloud-docs';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'always',
  redirects: {
    '/guides/templates/': `${BASE}/guides/launch/`,
    '/zh-cn/guides/templates/': `${BASE}/zh-cn/guides/launch/`,
    '/guides/model-apis/': `${BASE}/guides/token-factory/`,
    '/zh-cn/guides/model-apis/': `${BASE}/zh-cn/guides/token-factory/`,
    '/guides/shared-models/': `${BASE}/guides/token-factory/`,
    '/zh-cn/guides/shared-models/': `${BASE}/zh-cn/guides/token-factory/`,
    '/guides/dedicated-models/': `${BASE}/guides/serve-model/`,
    '/zh-cn/guides/dedicated-models/': `${BASE}/zh-cn/guides/serve-model/`,
    '/api/dedicated-endpoints/': `${BASE}/api/model-services/`,
    '/zh-cn/api/dedicated-endpoints/': `${BASE}/zh-cn/api/model-services/`,
  },
  integrations: [
    askAiCorpus({ site: SITE, base: BASE }),
    starlight({
      // The no-break space keeps "Radeon Cloud" together when the phone
      // header drops the last word of the title (see .site-title in custom.css).
      title: {
        en: 'Radeon\u00a0Cloud Docs',
        'zh-CN': 'Radeon\u00a0Cloud 文档',
      },
      description:
        'Run AMD Radeon GPUs in the cloud. Launch GPU instances, call hosted models in Token Factory, and use the AMD Radeon Cloud API.',
      logo: {
        light: './src/assets/amd-logo.png',
        dark: './src/assets/amd-logo-white.png',
        alt: 'AMD',
      },
      favicon: '/favicon.ico',
      head: [
        {
          tag: 'link',
          attrs: {
            rel: 'apple-touch-icon',
            href: '/radeon-cloud-docs/apple-touch-icon.png',
            sizes: '180x180',
          },
        },
        { tag: 'meta', attrs: { property: 'og:image', content: `${SITE}${BASE}/og.png` } },
        { tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
        { tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
        { tag: 'meta', attrs: { property: 'og:image:alt', content: 'Radeon Cloud Docs' } },
      ],
      customCss: ['./src/styles/custom.css'],
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
        'zh-cn': { label: '简体中文', lang: 'zh-CN' },
      },
      social: [
        {
          icon: 'email',
          label: 'member-service@mail.developer.amd.com.cn',
          href: 'mailto:member-service@mail.developer.amd.com.cn',
        },
      ],
      editLink: {
        baseUrl:
          'https://github.com/AMD-AIM/radeon-cloud-docs/edit/main/',
      },
      lastUpdated: true,
      pagination: true,
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
      components: {
        Hero: './src/components/Hero.astro',
        Search: './src/components/Search.astro',
      },
      sidebar: [
        {
          label: 'Get started',
          translations: { 'zh-CN': '开始使用' },
          items: [
            { slug: 'introduction' },
            { slug: 'quickstart' },
            { slug: 'guides/login' },
            { slug: 'guides/developer-program' },
            { slug: 'guides/credits' },
          ],
        },
        {
          label: 'GPU instances',
          translations: { 'zh-CN': 'GPU 实例' },
          items: [
            { slug: 'guides/instances' },
            { slug: 'guides/launch' },
            { slug: 'guides/images' },
            { slug: 'guides/storage' },
            { slug: 'guides/jupyterlab' },
            { slug: 'guides/ssh' },
            { slug: 'guides/gallery' },
            { slug: 'guides/serve-model' },
            { slug: 'guides/tunnel' },
            { slug: 'guides/destroy' },
          ],
        },
        {
          label: 'Token Factory',
          items: [
            { slug: 'guides/token-factory' },
            {
              label: 'Model catalog',
              translations: { 'zh-CN': '模型目录' },
              collapsed: true,
              autogenerate: { directory: 'models' },
            },
          ],
        },
        {
          label: 'Radeon Cloud CLI',
          items: [
            { slug: 'cli/overview' },
            { slug: 'cli/install' },
            { slug: 'cli/authentication' },
            { slug: 'cli/instances' },
            { slug: 'cli/automation' },
          ],
        },
        {
          label: 'API reference',
          translations: { 'zh-CN': 'API 参考' },
          items: [
            { slug: 'api/overview' },
            { slug: 'api/authentication' },
            {
              label: 'Token Factory API',
              items: [
                { slug: 'api/models' },
                { slug: 'api/chat-completions' },
                { slug: 'api/messages' },
                { slug: 'api/usage' },
              ],
            },
            { slug: 'api/model-services' },
            {
              label: 'Platform API',
              translations: { 'zh-CN': '平台接口' },
              items: [
                { slug: 'api/instances' },
                { slug: 'api/templates' },
                { slug: 'api/account' },
              ],
            },
            { slug: 'api/rate-limits' },
            { slug: 'api/errors' },
          ],
        },
        {
          label: 'Help',
          translations: { 'zh-CN': '帮助' },
          items: [
            { slug: 'resources/troubleshooting' },
            { slug: 'resources/faq' },
            { slug: 'resources/classic-ui' },
            { slug: 'api/terms' },
          ],
        },
      ],
    }),
  ],
});
