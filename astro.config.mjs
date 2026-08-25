// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// Deployed to GitHub Pages under the AMD-AIM organization.
// If you later move to a custom domain (e.g. docs.radeon.cloud), set
// site to that domain and base to '/'.
const SITE = 'https://amd-aim.github.io';
const BASE = '/radeon-cloud-docs';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'always',
  integrations: [
    starlight({
      title: {
        en: 'AMD Radeon Cloud Docs',
        'zh-cn': 'AMD Radeon Cloud 文档',
      },
      description:
        'Run AMD Radeon GPUs in the cloud. Launch notebooks, deploy OpenAI-compatible model endpoints, and call the AMD Radeon Cloud API.',
      logo: {
        light: './src/assets/amd-logo.png',
        dark: './src/assets/amd-logo-white.png',
        alt: 'AMD',
      },
      favicon: '/favicon.png',
      customCss: ['./src/styles/custom.css'],
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
        'zh-cn': { label: '简体中文', lang: 'zh-CN' },
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/AMD-DEV-CONTEST/Radeon-hackathon-2026-07',
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
      },
      sidebar: [
        {
          label: 'Start here',
          translations: { 'zh-CN': '从这里开始' },
          items: [
            { slug: 'introduction' },
            { slug: 'quickstart' },
          ],
        },
        {
          label: 'User Guide',
          translations: { 'zh-CN': '用户指南' },
          items: [
            { slug: 'guides/login' },
            { slug: 'guides/templates' },
            { slug: 'guides/launch' },
            { slug: 'guides/jupyterlab' },
            { slug: 'guides/ssh' },
            { slug: 'guides/model-apis' },
            { slug: 'guides/tunnel' },
            { slug: 'guides/credits' },
            { slug: 'guides/destroy' },
          ],
        },
        {
          label: 'API Reference',
          translations: { 'zh-CN': 'API 参考' },
          items: [
            { slug: 'api/overview' },
            { slug: 'api/authentication' },
            { slug: 'api/models' },
            { slug: 'api/chat-completions' },
            { slug: 'api/dedicated-endpoints' },
            { slug: 'api/usage' },
            { slug: 'api/instances' },
            { slug: 'api/templates' },
            { slug: 'api/account' },
            { slug: 'api/rate-limits' },
            { slug: 'api/errors' },
          ],
        },
        {
          label: 'Resources',
          translations: { 'zh-CN': '资源' },
          items: [
            { slug: 'resources/troubleshooting' },
            { slug: 'resources/faq' },
          ],
        },
      ],
    }),
  ],
});
