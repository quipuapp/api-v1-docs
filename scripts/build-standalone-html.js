// Bundles a single self-contained HTML file: Scalar UI + the OpenAPI spec
// embedded inline (no fetch, no other files). Open it directly in any
// browser — nothing to serve, nothing to convert.
//
// Replaces the earlier Puppeteer/PDF pipeline: printing an SPA to PDF hits
// page-break pagination that cuts content mid-element. HTML has no pages, so
// there's nothing to cut.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import yaml from 'js-yaml'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

function loadSpecAsObject(specPath) {
  const raw = fs.readFileSync(specPath, 'utf8')
  return specPath.endsWith('.json') ? JSON.parse(raw) : yaml.load(raw)
}

function main() {
  const [, , specPath, outputPath] = process.argv
  if (!specPath || !outputPath) {
    console.error('Usage: node scripts/build-standalone-html.js <spec.yaml|spec.json> <output.html>')
    process.exit(1)
  }

  const spec = loadSpecAsObject(path.resolve(specPath))
  const specJson = JSON.stringify(spec).replace(/</g, '\\u003c') // no literal "</script>" inside the embedded JSON
  const logoBase64 = fs.readFileSync(path.join(ROOT, 'logo.png')).toString('base64')

  const html = `<!doctype html>
<html>
  <head>
    <title>${spec.info?.title ?? 'API Reference'}</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { margin: 0; }
      .quipu-sidebar-logo { padding: 14px 12px 6px 12px; display: flex; align-items: center; gap: 10px; }
      .quipu-sidebar-logo img { height: 30px; }
    </style>
  </head>
  <body>
    <script
      id="api-reference"
      type="application/json"
      data-configuration='{
        "layout": "modern",
        "theme": "none",
        "hideModels": false,
        "hideDownloadButton": false,
        "defaultOpenAllTags": true,
        "showSidebar": true,
        "defaultHttpClient": { "targetKey": "shell", "clientKey": "curl" },
        "metaData": { "title": "${spec.info?.title ?? 'API Reference'}" }
      }'
    >${specJson}</script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
    <script>
      const observer = new MutationObserver(() => {
        const sidebar = document.querySelector('aside.t-doc__sidebar');
        if (!sidebar || document.getElementById('quipu-sidebar-logo')) return;
        const logoDiv = document.createElement('div');
        logoDiv.id = 'quipu-sidebar-logo';
        logoDiv.className = 'quipu-sidebar-logo';
        logoDiv.innerHTML = '<img src="data:image/png;base64,${logoBase64}" alt="Quipu" />';
        sidebar.insertBefore(logoDiv, sidebar.firstChild);
      });
      observer.observe(document.body, { childList: true, subtree: true });
    </script>
  </body>
</html>
`
  fs.writeFileSync(path.resolve(outputPath), html)
  console.log(`Wrote ${outputPath}`)
}

main()
