// Splits openapi.yaml (the source of truth, which may contain fields and
// query parameters tagged `x-internal: true`) into two artifacts:
//
//   - a PUBLIC spec with every `x-internal` property and parameter removed
//     entirely (published to GitHub Pages)
//   - a FULL spec with every field/parameter intact, only the `x-internal`
//     marker stripped (uploaded as a private CI artifact, e.g. for Aplifisa)
//
// See ../README.md for the full pipeline and the reasoning behind it.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import yaml from 'js-yaml'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// Recursively removes:
//   - any `properties` entry whose schema is tagged `x-internal: true`
//     (dropping its name from a sibling `required` array if present)
//   - any entry in a `parameters` array (path-item or operation level)
//     that is itself tagged `x-internal: true`
// Mutates and returns `node`.
export function removeInternalProperties(node) {
  if (Array.isArray(node)) {
    node.forEach(removeInternalProperties)
    return node
  }

  if (node === null || typeof node !== 'object') {
    return node
  }

  if (node.properties && typeof node.properties === 'object') {
    const removedKeys = []

    for (const [key, schema] of Object.entries(node.properties)) {
      if (schema && typeof schema === 'object' && schema['x-internal'] === true) {
        delete node.properties[key]
        removedKeys.push(key)
      }
    }

    if (Array.isArray(node.required) && removedKeys.length > 0) {
      node.required = node.required.filter((key) => !removedKeys.includes(key))
    }
  }

  if (Array.isArray(node.parameters)) {
    node.parameters = node.parameters.filter(
      (param) => !(param && typeof param === 'object' && param['x-internal'] === true)
    )
  }

  for (const value of Object.values(node)) {
    removeInternalProperties(value)
  }

  return node
}

// Recursively deletes the `x-internal` marker key itself, leaving the
// field it was attached to untouched. Mutates and returns `node`.
export function stripInternalMarkers(node) {
  if (Array.isArray(node)) {
    node.forEach(stripInternalMarkers)
    return node
  }

  if (node === null || typeof node !== 'object') {
    return node
  }

  delete node['x-internal']

  for (const value of Object.values(node)) {
    stripInternalMarkers(value)
  }

  return node
}

export function buildSpecs(sourceYaml) {
  const source = yaml.load(sourceYaml)

  const full = stripInternalMarkers(structuredClone(source))
  const filtered = removeInternalProperties(structuredClone(source))
  stripInternalMarkers(filtered) // belt-and-braces: no stray markers should survive on kept fields

  return { full, filtered }
}

function main() {
  const sourcePath = path.join(ROOT, 'openapi.yaml')
  const sourceYaml = fs.readFileSync(sourcePath, 'utf8')

  const { full, filtered } = buildSpecs(sourceYaml)

  // Public artifact: overwrites openapi.yaml in place. This only ever runs in the
  // CI checkout (ephemeral) right before the Pages upload — the committed source
  // file with the x-internal tags is never touched.
  fs.writeFileSync(sourcePath, yaml.dump(filtered, { lineWidth: -1 }))

  // Full artifact: JSON, for the private "openapi-full" CI artifact.
  const fullOutDir = path.join(ROOT, 'dist-internal')
  fs.mkdirSync(fullOutDir, { recursive: true })
  fs.writeFileSync(path.join(fullOutDir, 'openapi.json'), JSON.stringify(full, null, 2))

  console.log(`Wrote filtered ${sourcePath}`)
  console.log(`Wrote ${path.join(fullOutDir, 'openapi.json')}`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
