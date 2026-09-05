import type { Book } from '../types'

// Temporary stand-in for Supabase — keeps the shelf across refreshes using
// the browser's own storage. Per-device only (doesn't sync across devices),
// and wiped if the person clears site data — but good enough until real
// persistence is wired up.
const KEY = 'book-shelf:books'

export function loadBooks(): Book[] | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function saveBooks(books: Book[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(books))
  } catch {
    // storage full or unavailable (e.g. private browsing) — silently skip
  }
}
