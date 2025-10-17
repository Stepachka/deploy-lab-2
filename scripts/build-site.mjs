import path from 'node:path'
import fs from 'node:fs/promises'
import fse from 'fs-extra'
import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'
import Typograf from 'typograf'
import { minify } from 'html-minifier-terser'
import { glob } from 'glob'

const projectRoot = path.resolve(process.cwd())
const distDir = path.join(projectRoot, 'dist')
const contentDir = path.join(projectRoot, 'content')
const themeLayout = path.join(projectRoot, 'theme', 'layout.html')

const md = new MarkdownIt({ html: true, linkify: true, typographer: true })
const tp = new Typograf({ locale: ['ru', 'en-US'] })

async function readLayout() {
  return fs.readFile(themeLayout, 'utf8')
}

function applyLayout(layoutHtml, { title, siteName, year, content }) {
  return layoutHtml
    .replaceAll('{{ title }}', title)
    .replaceAll('{{ siteName }}', siteName)
    .replaceAll('{{ year }}', String(year))
    .replace('{{ content }}', content)
}

async function buildPages() {
  const layoutHtml = await readLayout()
  const files = await glob('**/*.md', { cwd: contentDir, absolute: true })
  await fse.ensureDir(distDir)

  for (const file of files) {
    const raw = await fs.readFile(file, 'utf8')
    const { data, content } = matter(raw)
    const title = data.title || 'Страница'
    const siteName = data.siteName || 'Demo Site'
    const htmlFromMd = md.render(content)
    const improved = tp.execute(htmlFromMd)
    const withLayout = applyLayout(layoutHtml, {
      title,
      siteName,
      year: new Date().getFullYear(),
      content: improved,
    })
    const minified = await minify(withLayout, {
      collapseWhitespace: true,
      removeComments: true,
      minifyCSS: true,
      minifyJS: true,
      keepClosingSlash: true,
      decodeEntities: true,
      sortAttributes: true,
      sortClassName: true,
    })

    const rel = path.relative(contentDir, file)
    const outName = rel.replace(/\.md$/i, '.html')
    const outPath = path.join(distDir, outName)
    await fse.ensureDir(path.dirname(outPath))
    await fs.writeFile(outPath, minified, 'utf8')
  }
}

async function copyAssets() {
  // Vite outputs assets to dist already; ensure theme static files if any
  const staticDir = path.join(projectRoot, 'public')
  if (await fse.pathExists(staticDir)) {
    await fse.copy(staticDir, distDir, { overwrite: true })
  }
}

async function main() {
  await buildPages()
  await copyAssets()
  console.log('Site built into dist/')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})


