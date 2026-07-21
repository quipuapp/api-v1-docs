import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import yaml from 'js-yaml'
import { removeInternalProperties, stripInternalMarkers, buildSpecs } from './filter-internal.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

test('removeInternalProperties drops only x-internal properties', () => {
  const doc = {
    type: 'object',
    properties: {
      public_field: { type: 'string' },
      secret_field: { type: 'string', 'x-internal': true }
    }
  }

  removeInternalProperties(doc)

  assert.deepEqual(Object.keys(doc.properties), ['public_field'])
})

test('removeInternalProperties cleans up the required array', () => {
  const doc = {
    type: 'object',
    required: ['public_field', 'secret_field'],
    properties: {
      public_field: { type: 'string' },
      secret_field: { type: 'string', 'x-internal': true }
    }
  }

  removeInternalProperties(doc)

  assert.deepEqual(doc.required, ['public_field'])
})

test('removeInternalProperties recurses into nested schemas (allOf, items, additionalProperties)', () => {
  const doc = {
    components: {
      schemas: {
        Widget: {
          allOf: [
            {
              type: 'object',
              properties: {
                internal_nested: { type: 'string', 'x-internal': true },
                kept_nested: { type: 'string' }
              }
            }
          ]
        },
        WidgetList: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              internal_in_item: { type: 'string', 'x-internal': true }
            }
          }
        },
        WidgetMap: {
          type: 'object',
          additionalProperties: {
            type: 'object',
            properties: {
              internal_in_map: { type: 'string', 'x-internal': true },
              kept_in_map: { type: 'number' }
            }
          }
        }
      }
    }
  }

  removeInternalProperties(doc)

  const { schemas } = doc.components
  assert.deepEqual(Object.keys(schemas.Widget.allOf[0].properties), ['kept_nested'])
  assert.deepEqual(Object.keys(schemas.WidgetList.items.properties), [])
  assert.deepEqual(Object.keys(schemas.WidgetMap.additionalProperties.properties), ['kept_in_map'])
})

test('removeInternalProperties leaves a doc with no internal fields unchanged', () => {
  const doc = {
    properties: {
      a: { type: 'string' },
      b: { type: 'number' }
    }
  }
  const before = structuredClone(doc)

  removeInternalProperties(doc)

  assert.deepEqual(doc, before)
})

test('stripInternalMarkers removes the marker but keeps the field', () => {
  const doc = {
    properties: {
      secret_field: { type: 'string', 'x-internal': true, description: 'shh' }
    }
  }

  stripInternalMarkers(doc)

  assert.deepEqual(doc.properties.secret_field, { type: 'string', description: 'shh' })
})

test('buildSpecs: filtered spec has no x-internal fields and no "x-internal" strings left anywhere', () => {
  const source = yaml.dump({
    components: {
      schemas: {
        Thing: {
          properties: {
            open: { type: 'string', description: 'visible to everyone' },
            hidden: { type: 'string', 'x-internal': true, description: 'Vendor integration only.' }
          }
        }
      }
    }
  })

  const { filtered, full } = buildSpecs(source)

  const filteredProps = filtered.components.schemas.Thing.properties
  assert.deepEqual(Object.keys(filteredProps), ['open'])
  assert.equal(JSON.stringify(filtered).includes('x-internal'), false)

  // full keeps both fields, marker stripped
  const fullProps = full.components.schemas.Thing.properties
  assert.deepEqual(Object.keys(fullProps).sort(), ['hidden', 'open'])
  assert.equal(JSON.stringify(full).includes('x-internal'), false)
})

// Finds every (schemaName, propertyName) pair tagged x-internal directly under
// components.schemas.*.properties in the ORIGINAL doc (field names can repeat
// across unrelated schemas, e.g. "document_type" exists on both ContactAttributes
// (public, unrelated) and BookEntryAttributes (internal) — so checks must be
// scoped per schema, never a whole-document substring search).
function findTaggedFields(sourceDoc) {
  const pairs = []
  for (const [schemaName, schema] of Object.entries(sourceDoc.components.schemas)) {
    if (!schema || typeof schema !== 'object' || !schema.properties) continue
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      if (propSchema && propSchema['x-internal'] === true) {
        pairs.push({ schemaName, propName })
      }
    }
  }
  return pairs
}

test('the real openapi.yaml: every x-internal field disappears from the filtered spec, survives in the full spec', () => {
  const sourcePath = path.join(__dirname, '..', 'openapi.yaml')
  const sourceYaml = fs.readFileSync(sourcePath, 'utf8')
  const sourceDoc = yaml.load(sourceYaml)

  const tagged = findTaggedFields(sourceDoc)
  assert.ok(tagged.length > 0, 'expected at least one x-internal field in openapi.yaml')

  const { filtered, full } = buildSpecs(sourceYaml)

  for (const { schemaName, propName } of tagged) {
    assert.equal(
      Object.prototype.hasOwnProperty.call(filtered.components.schemas[schemaName].properties, propName),
      false,
      `${schemaName}.${propName} leaked into the public spec`
    )
    assert.ok(
      Object.prototype.hasOwnProperty.call(full.components.schemas[schemaName].properties, propName),
      `${schemaName}.${propName} missing from the full spec`
    )
  }

  // No non-internal field should have been caught in the crossfire.
  assert.equal(Object.keys(filtered.components.schemas.ItemAttributes.properties).includes('concept'), true)
  assert.equal(Object.keys(filtered.components.schemas.ContactAttributes.properties).includes('account_code'), true)
  assert.equal(Object.keys(filtered.components.schemas.ContactAttributes.properties).includes('document_type'), true)
  assert.equal(
    Object.keys(filtered.components.schemas.AccountingCategoryAttributes.properties).includes('accounting_digits_number'),
    true
  )
})

test('the real openapi.yaml: no "Aplifisa" mention survives in the public spec', () => {
  const sourcePath = path.join(__dirname, '..', 'openapi.yaml')
  const sourceYaml = fs.readFileSync(sourcePath, 'utf8')

  const { filtered } = buildSpecs(sourceYaml)

  assert.equal(JSON.stringify(filtered).toLowerCase().includes('aplifisa'), false)
})
