# Quipu API v1 Documentation

API reference documentation for the Quipu API v1, rendered with [Scalar](https://scalar.com).

## How it works

- `openapi.yaml` — the OpenAPI 3.1 specification
- `index.html` — single-page app that renders the spec using Scalar
- Deployed automatically to GitHub Pages on push to `main`

## Local development

Just open `index.html` in a browser, or serve it locally:

```bash
npx serve .
```

## Updating the documentation

Edit `openapi.yaml` and push to `main`. The docs will be deployed automatically.

## Internal-only fields (`x-internal`)

Some API v1 fields only exist for a specific integration partner (e.g. Aplifisa) and are gated
server-side in the Rails app — they only appear in a response when the owner has that integration
activated (`owner.aplifisa?` in the serializers, passed down from the API v1 controllers as
`with_aplifisa_data`). This repo is public documentation, so those partner-gated fields must never
ship in the published spec (CI removes every `x-internal: true` field before deploying). Any field
that *does* ship publicly (i.e. not `x-internal`) must never name the partner integration by name in
its description — that would leak the association even though the field itself stays public.

**Rule of thumb:** if a field is only serialized `if: -> { instance_options[:with_aplifisa_data] }`
(or the equivalent gate) in `app/serializers/api/v1/**` in the main app, tag it here:

```yaml
some_field:
  x-internal: true
  type: string
  description: >
    Whatever it does. (Aplifisa integration only.)
```

Fields that are *always* returned regardless of any integration flag (even if they were added
alongside integration work) are NOT `x-internal` — document them normally, without naming any
partner.

### How it's built

`openapi.yaml` (committed, with `x-internal` tags visible) is the single source of truth. CI
(`.github/workflows/deploy.yml`) runs `scripts/filter-internal.js` before publishing, which produces
two artifacts from it:

- **Public spec** — every `x-internal`-tagged property removed entirely (not hidden, not present).
  This overwrites `openapi.yaml` in the ephemeral CI checkout right before the GitHub Pages upload —
  the committed source file is never touched. Formatting of this generated file will differ from the
  committed source (it's a machine-dumped copy); don't diff the two for style, only for content.
- **Full spec** (`dist-internal/openapi.json`) — every field present, `x-internal` markers stripped.
  Uploaded as a private GitHub Actions artifact (`openapi-full`, 90-day retention) — never published
  to Pages. This repo is private, so downloading it requires repo access. Whoever manages the Aplifisa
  integration downloads it from the workflow run and sends it to Aplifisa directly.

Both a CI job (`test`, runs on every push and PR) and local `npm test` run
`scripts/filter-internal.test.js`, which includes a check against the real `openapi.yaml` — so a
field with a bad tag, a missing tag, or a stray partner-name leak into a public description fails CI
before it can reach `main`.

```bash
npm install
npm test        # unit tests for the filter script, incl. a check against the real spec
npm run build   # writes the filtered openapi.yaml + dist-internal/openapi.json (do this in CI, not locally —
                 # it overwrites your local openapi.yaml with the machine-formatted public version)
npm run lint:spec  # quick YAML-validity check
```

### What each filter step does (`scripts/filter-internal.js`)

`buildSpecs` runs these in order to produce the filtered (public) spec; the full (internal) spec only
runs `applyInternalDescriptions` + `stripInternalMarkers`:

- **`removeInternalPaths`** — drops a whole `paths` entry tagged `x-internal: true` on the path item,
  or an individual operation (`get`/`post`/...) tagged `x-internal: true` when the path item itself
  isn't fully internal.
- **`removeInternalComponents`** — drops whole `components.schemas` / `parameters` / `responses` /
  `requestBodies` entries tagged `x-internal: true` on the definition itself (used for resources that
  are entirely internal, e.g. `LiquidationResource`, as opposed to one internal field on an otherwise
  public resource).
- **`removeInternalTags`** — drops top-level `tags` registry entries (used for docs-UI grouping) tagged
  `x-internal: true`.
- **`removeInternalProperties`** — drops any `properties` entry whose schema is tagged
  `x-internal: true` (and removes its name from a sibling `required` array), plus any `parameters`
  array entry tagged the same way. Recurses through `allOf`/`items`/`additionalProperties` too, so a
  property nested inside a composed schema is still caught.
- **`removeDanglingRefs`** — cleanup pass that must run *after* `removeInternalComponents`. If a
  `oneOf`/`anyOf` list elsewhere in the doc (e.g. a polymorphic `included` items schema) still `$ref`s
  a schema that step just deleted, the public spec would ship a dangling reference. This filters those
  entries out, keeping every other `$ref` untouched.
- **`applyInternalDescriptions`** (full spec only) — where a field carries both a public-safe
  `description` and a fuller `x-internal-description` (shared fields whose *allowed-values list*
  includes an internal-only value, not droppable wholesale), swaps `description` for the complete
  text. The filtered spec never calls this — it already has the safe text in `description`.
- **`stripInternalMarkers`** — recursively deletes the `x-internal` / `x-internal-description` marker
  keys themselves, leaving the field they were attached to untouched. Run last on both specs so no
  marker ever leaks into either output.

## Future improvements

- Auto-generate `openapi.yaml` from request specs using `rspec-openapi`
- Add `starlight-openapi` plugin if migrating to Astro/Starlight
