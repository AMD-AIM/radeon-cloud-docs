# AMD Radeon Cloud Docs

Documentation for AMD Radeon Cloud — user guide and API reference, in English and 简体中文.

The platform has two regional entry points, both covered by these docs:

- China — https://developer.amd.com.cn/radeon/
- Global — https://radeon-global.anruicloud.com/

Built with [Astro Starlight](https://starlight.astro.build/). Published to GitHub Pages at **https://amd-aim.github.io/radeon-cloud-docs/**.

## Develop

```bash
npm install
npm run dev      # http://localhost:4321/radeon-cloud-docs/
npm run build    # output to ./dist
npm run preview  # serve the built site
```

Node 20 or newer.

After a build, check every internal link, anchor and image in `dist`:

```bash
python3 scripts/check-links.py   # exits 1 and lists what's broken
```

Every pull request runs this check (`.github/workflows/check.yml`) after `npm ci` and `npm run build`, and also fails if a page exists in only one locale. The deploy runs the link check too and stops if it fails.

## Structure

```
src/
  content/docs/          English pages
    guides/              getting started, GPU instance and Token Factory guides
    models/              Token Factory model catalog (one page per model)
    cli/                 Radeon Cloud CLI
    api/                 API reference
    resources/           troubleshooting, FAQ
    zh-cn/               Chinese pages, mirroring the same tree
  assets/guide/          screenshots
  components/Hero.astro  home page hero
  styles/custom.css      theme
astro.config.mjs         site config, sidebar, locales
scripts/check-links.py   link, anchor and image check for dist
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

### Style

- The docs describe the **new console design**. Name buttons and fields exactly as the UI shows them, in bold. Chinese pages use the Chinese UI labels and English pages use the English ones (see `static/redesign/locales/{en,zh}.json` in the product repo).
- Open each page with one or two sentences that say what the reader will get done.
- Task pages get verb titles (Launch an instance / 启动实例); concept pages get noun titles. No casual or rhetorical headings.
- Steps are numbered, one action per step.
- Short sentences, one idea each. Avoid chaining clauses with dashes. No asides or editorializing.
- Write each language natively; don't translate sentence by sentence.
- Values that depend on the account or change over time (sizes, images, resource pools, prices) are described as such, with a way to look them up.

### Terminology

| English | 中文 | Notes |
|---|---|---|
| AMD Radeon Cloud / Radeon Cloud | AMD Radeon Cloud / Radeon Cloud | Full name on first mention per page |
| China site / Global site | 中国站 / 全球站 | |
| instance | 实例 | Not "container" or "machine" |
| Deploy type: Notebook / Model API | 部署类型：Notebook / 模型 API | As in the UI |
| image | 镜像 | |
| size | 规格 | |
| resource pool | 资源池 | |
| workspace storage: temporary / persistent `/workspace` | 工作区存储：临时工作区 / 持久化 `/workspace` | Don't say PVC |
| credits | 积分 | Matches the Chinese UI |
| developer points | 开发者积分 | AMD AI Developer Program only; never shorten to 积分 |
| Token Factory, Token Factory API | Token Factory、Token Factory API | The hosted models and their API. Not "shared model API" or "Public Free" |
| model service (on an instance), model service endpoint | 模型服务（自部署模型服务）、模型服务接口 | vLLM on your own instance via **Deploy type: Model API**. Not part of Token Factory. Not "dedicated" / 专属 / 独占 |
| API key | API Key | |
| CLI token | CLI 令牌 | Starts with `rcc_` |
| account | 账号 | Use 账户 only when quoting a UI label |
| Gallery | 模板库 | As in the Chinese UI |

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

## Ask AI

The **Ask AI** button next to search sends the reader's question to the Radeon Cloud backend (`POST /api/docs/ask` on the China site), which answers with a Token Factory model using these docs as its knowledge base.

- Every build writes the knowledge base to `dist/ask-ai/corpus-en.md` and `dist/ask-ai/corpus-zh-cn.md` (`src/integrations/ask-ai-corpus.mjs`). The backend fetches them from the published site, so a docs change reaches Ask AI on the next deploy.
- The button appears only when the build has `PUBLIC_ASK_AI_ENDPOINT`. In CI it comes from the repository variable `ASK_AI_ENDPOINT` (**Settings → Secrets and variables → Actions → Variables**), for example `https://developer.amd.com.cn/radeon/api/docs/ask`. Delete the variable and redeploy to hide it.
- `?ask=<question>` on any page opens the panel and asks the question.

## License

Documentation content is maintained by AMD.
