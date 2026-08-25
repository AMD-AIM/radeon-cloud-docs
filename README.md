# Radeon Cloud Docs

Documentation for [Radeon Cloud](https://radeon-global.anruicloud.com/) — user guide and API reference, in English and 简体中文.

Built with [Astro Starlight](https://starlight.astro.build/). Published to GitHub Pages at **https://amd-aim.github.io/radeon-cloud-docs/**.

## Develop

```bash
npm install
npm run dev      # http://localhost:4321/radeon-cloud-docs/
npm run build    # output to ./dist
npm run preview  # serve the built site
```

Node 20 or newer.

## Structure

```
src/
  content/docs/          English pages
    guides/              user guide
    api/                 API reference
    resources/           troubleshooting, FAQ
    zh-cn/               Chinese pages, mirroring the same tree
  assets/guide/          screenshots
  components/Hero.astro  home page hero
  styles/custom.css      theme
astro.config.mjs         site config, sidebar, locales
```

## Writing

Pages are Markdown with frontmatter:

```md
---
title: Page title
description: One line, used for search results and social cards.
sidebar:
  order: 3
---
```

**Every English page needs a Chinese counterpart** at the same path under `zh-cn/`, and vice versa. The sidebar is defined once in `astro.config.mjs` by slug and applies to both languages, so a page missing from one locale will 404 from its own sidebar.

Internal links are absolute and include the base path and locale:

```md
[Quickstart](/radeon-cloud-docs/quickstart/)
[快速开始](/radeon-cloud-docs/zh-cn/quickstart/)
```

Adding a page means creating both files and adding its slug to the `sidebar` array in `astro.config.mjs`.

### API endpoint signatures

API pages use a small HTML block for the method-and-path header:

```html
<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/api/notebook/request</span>
  <span class="rc-auth">Session or API key</span>
</div>
```

`data-m` accepts `GET`, `POST`, `PUT`, `DELETE`, and `ANY`. In parameter tables, mark requirements with `<span class="rc-req">Required</span>` and `<span class="rc-opt">Optional</span>`.

## Deploying

Pushing to `main` builds and publishes automatically via `.github/workflows/deploy.yml`. Enable it once under **Settings → Pages → Source → GitHub Actions**.

To move the site elsewhere, edit `SITE` and `BASE` at the top of `astro.config.mjs`. For a custom domain, set `BASE` to `/`, `SITE` to the domain, and add a `public/CNAME` file containing it.

## License

Documentation content is maintained by AMD.
