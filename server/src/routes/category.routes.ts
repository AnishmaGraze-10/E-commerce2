import { Router } from 'express'
import fs from 'fs'
import path from 'path'

const router = Router()
const synonymsPath = path.resolve('server/src/data/categorySynonyms.json')

function loadSynonyms(): Record<string, string[]> {
  try {
    const raw = fs.readFileSync(synonymsPath, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return {
      lipstick: ['lip colour', 'lip gloss', 'lip tint', 'lip paint'],
      eyeliner: ['kajal', 'eye pencil'],
      eyeshadow: ['eye shadow', 'shadow', 'palette'],
      foundation: ['base', 'bb cream', 'skin tint']
    }
  }
}

router.get('/synonyms', (_req, res) => {
  const data = loadSynonyms()
  res.json({ ok: true, data })
})

export function buildCategoryNormalizer() {
  const data = loadSynonyms()
  const map = new Map<string, string>()
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  for (const canonical of Object.keys(data)) {
    map.set(norm(canonical), canonical)
    for (const syn of data[canonical]) map.set(norm(syn), canonical)
  }
  return (raw: string): string | null => map.get(norm(raw)) || null
}

export default router



