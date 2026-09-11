import type { Book, WishBook } from '../types'

// Temporary stand-in for Supabase — keeps the shelf across refreshes using
// the browser's own storage. Per-device only (doesn't sync across devices),
// and wiped if the person clears site data — but good enough until real
// persistence is wired up.
const KEY = 'book-shelf:books'
const WISHLIST_KEY = 'book-shelf:wishlist'

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

export function loadWishlist(): WishBook[] {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveWishlist(wishlist: WishBook[]): void {
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist))
  } catch {
    // storage full or unavailable (e.g. private browsing) — silently skip
  }
}
