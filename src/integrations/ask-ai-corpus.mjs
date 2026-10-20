// Writes the docs, one file per locale, for the Ask AI backend to use as its
// system prompt: dist/ask-ai/corpus-en.md and dist/ask-ai/corpus-zh-cn.md.
// The output has no timestamps, so an unchanged docs tree produces a
// byte-identical prompt prefix and keeps the model's prefix cache warm.
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DOCS_DIR = fileURLToPath(new URL('../content/docs/', import.meta.url));
const LOCALES = { en: 'English', 'zh-cn': '简体中文' };

async function listPages(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return listPages(full);
      return /\.mdx?$/.test(entry.name) ? [full] : [];
    })
  );
  return files.flat().sort();
}

function splitFrontmatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { data: {}, body: source };
  const data = {};
  for (const line of match[1].split('\n')) {
    const field = line.match(/^(title|description):\s*(.*)$/);
    if (field) data[field[1]] = field[2].replace(/^["']|["']$/g, '').replace(/\\"/g, '"');
  }
  return { data, body: source.slice(match[0].length) };
}

function cleanBody(body, siteRoot, base) {
  const absolute = (href) => (href.startsWith(`${base}/`) ? `${siteRoot}${href}` : href);
  return body
    .replace(/^import .*$/gm, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\]\((\/[^)\s]+)\)/g, (_, href) => `](${absolute(href)})`)
    // Placeholders such as <instance-id> look like tags, so strip only real HTML.
    .replace(/<\/?(?:div|span|b|i|em|strong|kbd|code|br|p|a|sup|sub|details|summary)(?:\s[^>]*)?\/?>/gi, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export default function askAiCorpus({ site, base }) {
  const siteRoot = site.replace(/\/$/, '');
  return {
    name: 'ask-ai-corpus',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const pages = await listPages(DOCS_DIR);
        const sections = Object.fromEntries(Object.keys(LOCALES).map((locale) => [locale, []]));
        for (const file of pages) {
          const rel = path.relative(DOCS_DIR, file).split(path.sep).join('/');
          const locale = rel.startsWith('zh-cn/') ? 'zh-cn' : 'en';
          const slug = rel.replace(/\.mdx?$/, '').replace(/(^|\/)index$/, '');
          if (slug === '' || slug === 'zh-cn') continue;
          const { data, body } = splitFrontmatter(await readFile(file, 'utf8'));
          const url = `${siteRoot}${base}/${slug}/`;
          const header = [`# ${data.title || slug}`, `URL: ${url}`];
          if (data.description) header.push(`Summary: ${data.description}`);
          sections[locale].push(`${header.join('\n')}\n\n${cleanBody(body, siteRoot, base)}`);
        }
        const outDir = new URL('ask-ai/', dir);
        await mkdir(outDir, { recursive: true });
        for (const [locale, label] of Object.entries(LOCALES)) {
          const text = `# AMD Radeon Cloud documentation (${label})\n\n${sections[locale].join('\n\n---\n\n')}\n`;
          await writeFile(new URL(`corpus-${locale}.md`, outDir), text);
          logger.info(`corpus-${locale}.md: ${sections[locale].length} pages, ${text.length} characters`);
        }
      },
    },
  };
}
