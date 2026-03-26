import { useState, useCallback } from 'react'

export interface Identity {
  author_id: string
  author_name: string
  author_color: string
}

const STORAGE_KEY = 'family_calendar_identity'

function readIdentity(): Identity | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Identity>
    if (parsed.author_id && parsed.author_name && parsed.author_color) {
      return parsed as Identity
    }
    return null
  } catch {
    return null
  }
}

function writeIdentity(identity: Identity): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(identity))
}

export function useIdentity() {
  const [identity, setIdentityState] = useState<Identity | null>(readIdentity)

  const isIdentitySet = identity !== null

  const setIdentity = useCallback((name: string, color: string) => {
    const newIdentity: Identity = {
      author_id: crypto.randomUUID(),
      author_name: name,
      author_color: color,
    }
    writeIdentity(newIdentity)
    setIdentityState(newIdentity)
  }, [])

  return { identity, isIdentitySet, setIdentity }
}
