import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'

export function useCategorySynonyms() {
  const [map, setMap] = useState<Record<string, string[]>>({})

  useEffect(() => {
    axios.get('/api/categories/synonyms')
      .then(res => setMap(res.data?.data || {}))
      .catch(() => setMap({}))
  }, [])

  const normalize = useMemo(() => {
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
    const m = new Map<string, string>()
    for (const canonical of Object.keys(map)) {
      m.set(norm(canonical), canonical)
      for (const syn of map[canonical]) m.set(norm(syn), canonical)
    }
    return (raw: string): { canonical?: string } => {
      const key = norm(raw)
      const canonical = m.get(key)
      return { canonical }
    }
  }, [map])

  return { synonyms: map, normalize }
}



