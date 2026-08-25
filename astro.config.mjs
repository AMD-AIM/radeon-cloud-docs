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
        en: 'Radeon Cloud Docs',
        'zh-CN': 'Radeon Cloud 文档',
      },
      description:
        'Run AMD Radeon GPUs in the cloud. Launch notebooks, deploy OpenAI-compatible model endpoints, and call the AMD Radeon Cloud API.',
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
      ],
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
          items: [{ slug: 'introduction' }, { slug: 'quickstart' }],
        },
        {
          label: 'Guides',
          translations: { 'zh-CN': '使用指南' },
          items: [
            { slug: 'guides/login' },
            {
              label: 'GPU instances',
              translations: { 'zh-CN': 'GPU 实例' },
              items: [
                { slug: 'guides/templates' },
                { slug: 'guides/launch' },
                { slug: 'guides/jupyterlab' },
                { slug: 'guides/ssh' },
                { slug: 'guides/tunnel' },
                { slug: 'guides/destroy' },
              ],
            },
            { slug: 'guides/model-apis' },
            { slug: 'guides/credits' },
          ],
        },
        {
          label: 'API Reference',
          translations: { 'zh-CN': 'API 参考' },
          items: [
            { slug: 'api/overview' },
            { slug: 'api/authentication' },
            {
              label: 'Public Free Model APIs',
              translations: { 'zh-CN': '免费共享模型 API' },
              items: [
                { slug: 'api/models' },
                { slug: 'api/chat-completions' },
                { slug: 'api/messages' },
                { slug: 'api/usage' },
              ],
            },
            {
              label: 'Dedicated Model APIs',
              translations: { 'zh-CN': '独占模型 API' },
              items: [{ slug: 'api/dedicated-endpoints' }],
            },
            {
              label: 'Platform API',
              translations: { 'zh-CN': '平台 API' },
              items: [
                { slug: 'api/instances' },
                { slug: 'api/templates' },
                { slug: 'api/account' },
              ],
            },
            {
              label: 'Limits and errors',
              translations: { 'zh-CN': '限流与错误' },
              collapsed: true,
              items: [{ slug: 'api/rate-limits' }, { slug: 'api/errors' }],
            },
          ],
        },
        {
          label: 'Help',
          translations: { 'zh-CN': '帮助' },
          items: [
            { slug: 'resources/troubleshooting' },
            { slug: 'resources/faq' },
          ],
        },
      ],
    }),
  ],
});
