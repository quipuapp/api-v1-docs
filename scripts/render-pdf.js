// Renders an OpenAPI spec to PDF using the project's real index.html (Scalar),
// served locally and driven with Puppeteer.
//
// Scalar's "modern" layout keeps every sidebar group collapsed by default, and
// collapsed groups never mount their content in the DOM — so a naive
// page.pdf() only captures the intro paragraph. expandAll() clicks every
// "Open Group" toggle (and any other collapsed/expandable element) in
// rounds, since expanding a group reveals further collapsed children, until
// a round finds nothing left to click.
//
// Usage: node scripts/render-pdf.js <spec.yaml|spec.json> <output.pdf>
import fs from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const MIME = {
  '.html': 'text/html',
  '.json': 'application/json',
  '.yaml': 'text/yaml',
  '.yml': 'text/yaml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml'
}

function serveDir(dir) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const reqPath = decodeURIComponent(req.url.split('?')[0])
      const filePath = path.join(dir, reqPath === '/' ? 'index.html' : reqPath)
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404)
          res.end()
          return
        }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' })
        res.end(data)
      })
    })
    server.listen(0, () => resolve(server))
  })
}

function buildSiteDir(specPath) {
  const siteDir = fs.mkdtempSync(path.join(os.tmpdir(), 'scalar-pdf-'))
  const specName = 'spec' + path.extname(specPath)

  for (const asset of fs.readdirSync(ROOT)) {
    if (['.png', '.ico', '.svg'].includes(path.extname(asset))) {
      fs.copyFileSync(path.join(ROOT, asset), path.join(siteDir, asset))
    }
  }
  fs.copyFileSync(specPath, path.join(siteDir, specName))

  const html = fs
    .readFileSync(path.join(ROOT, 'index.html'), 'utf8')
    .replace(/data-url="\.\/openapi\.yaml(\?v=\d+)?"/, `data-url="./${specName}"`)
  fs.writeFileSync(path.join(siteDir, 'index.html'), html)

  return siteDir
}

async function expandAll(page) {
  for (let round = 0; round < 20; round++) {
    const clicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a')).filter(
        (el) =>
          el.innerText.includes('Open Group') ||
          el.innerText.trim() === 'Expand all' ||
          el.getAttribute('aria-expanded') === 'false'
      )
      buttons.forEach((b) => {
        try {
          b.click()
        } catch {
          // element detached by a previous click in this round — skip it
        }
      })
      return buttons.length
    })
    await new Promise((r) => setTimeout(r, 600))
    if (clicked === 0) break
  }
}

async function main() {
  const [, , specPath, outputPath] = process.argv
  if (!specPath || !outputPath) {
    console.error('Usage: node scripts/render-pdf.js <spec.yaml|spec.json> <output.pdf>')
    process.exit(1)
  }

  const siteDir = buildSiteDir(path.resolve(specPath))
  const server = await serveDir(siteDir)
  const { port } = server.address()

  const browser = await puppeteer.launch({ args: ['--no-sandbox'] })
  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 900 })
    await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0', timeout: 60_000 })
    await new Promise((r) => setTimeout(r, 3000)) // let Scalar parse and mount the spec
    await expandAll(page)
    await page.evaluate(() => window.scrollTo(0, 0))
    await new Promise((r) => setTimeout(r, 800))
    await page.pdf({ path: path.resolve(outputPath), printBackground: true, format: 'A4' })
  } finally {
    await browser.close()
    server.close()
    fs.rmSync(siteDir, { recursive: true, force: true })
  }

  console.log(`Wrote ${outputPath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
