import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourceRoots = [path.join(root, 'src'), path.join(root, '../backend/src')]
const packages = {
  ri: '@iconify-json/ri',
  iconamoon: '@iconify-json/iconamoon',
  'icon-park-outline': '@iconify-json/icon-park-outline',
  ix: '@iconify-json/ix'
}
const requested = new Map(Object.keys(packages).map((prefix) => [prefix, new Set()]))

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await walk(fullPath)))
    else if (/\.(?:vue|ts|tsx|js|mjs)$/.test(entry.name)) files.push(fullPath)
  }
  return files
}

for (const sourceRoot of sourceRoots) {
  if (!(await fs.stat(sourceRoot).catch(() => null))) continue
  for (const file of await walk(sourceRoot)) {
    const content = await fs.readFile(file, 'utf8')
    for (const match of content.matchAll(/['"`]([a-z0-9-]+):([a-z0-9-]+)['"`]/gi)) {
      requested.get(match[1])?.add(match[2])
    }
  }
}
requested.get('ri').add('question-line')

const collections = []
for (const [prefix, packageName] of Object.entries(packages)) {
  const source = JSON.parse(
    await fs.readFile(path.join(root, 'node_modules', packageName, 'icons.json'), 'utf8')
  )
  const icons = {}
  const aliases = {}
  const include = (name) => {
    if (source.icons?.[name]) {
      icons[name] = source.icons[name]
      return
    }
    const alias = source.aliases?.[name]
    if (!alias) throw new Error(`Missing local icon ${prefix}:${name}`)
    aliases[name] = alias
    include(alias.parent)
  }
  for (const name of [...requested.get(prefix)].sort()) include(name)
  collections.push({
    prefix,
    ...(source.width ? { width: source.width } : {}),
    ...(source.height ? { height: source.height } : {}),
    icons,
    ...(Object.keys(aliases).length ? { aliases } : {})
  })
}

const target = path.join(root, 'src/assets/icons/local-icon-collections.json')
await fs.mkdir(path.dirname(target), { recursive: true })
await fs.writeFile(target, `${JSON.stringify(collections)}\n`)
console.log(
  `Generated ${[...requested.values()].reduce((total, names) => total + names.size, 0)} local icons`
)
