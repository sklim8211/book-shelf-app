import { useEffect, useState } from 'react'
import type { Book, RecognizedCandidate, WishBook } from './types'
import { initialBooks } from './data/mockBooks'
import { fetchBookInfo, type SearchResult } from './data/kakaoBooks'
import { loadBooks, saveBooks, loadWishlist, saveWishlist } from './utils/storage'
import Shelf from './screens/Shelf'
import Confirm from './screens/Confirm'
import Detail from './screens/Detail'
import Search from './screens/Search'
import Wishlist from './screens/Wishlist'
import WishlistAdd from './screens/WishlistAdd'

type Screen = 'shelf' | 'confirm' | 'detail' | 'search' | 'wishlist' | 'wishlistAdd'

let bookSeq = 0
let wishSeq = 0

// Was there anything saved from a previous visit? If so, that's the real
// starting point — the mock shelf is only for a first-ever visit.
const savedBooks = loadBooks()

export default function App() {
  const [books, setBooks] = useState<Book[]>(savedBooks ?? initialBooks)
  const [wishlist, setWishlist] = useState<WishBook[]>(() => loadWishlist())
  const [screen, setScreen] = useState<Screen>('shelf')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedBook = books.find((b) => b.id === selectedId) ?? null

  // Backfill real cover art for the starter mock shelf on a first-ever visit
  // only — once something's been saved, this shouldn't re-run on the user's
  // own books.
  useEffect(() => {
    if (savedBooks) return
    initialBooks.forEach((b) => {
      fetchBookInfo(b.title, b.author).then(({ coverUrl, price, salePrice, status }) => {
        setBooks((bs) =>
          bs.map((x) =>
            x.id === b.id
              ? {
                  ...x,
                  coverUrl: coverUrl ?? x.coverUrl,
                  price: price ?? x.price,
                  salePrice: salePrice ?? x.salePrice,
                  status: status ?? x.status,
                }
              : x,
          ),
        )
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep the browser's copy in sync — a stand-in for real persistence until
  // Supabase is wired up.
  useEffect(() => {
    saveBooks(books)
  }, [books])

  useEffect(() => {
    saveWishlist(wishlist)
  }, [wishlist])

  function handleSave(accepted: RecognizedCandidate[]) {
    const today = new Date().toISOString().slice(0, 10)
    const newBooks: Book[] = accepted.map((c) => ({
      id: `new-${Date.now()}-${bookSeq++}`,
      title: c.title,
      author: c.author,
      addedAt: today,
      hue: c.hue,
      coverUrl: c.coverUrl,
      subject: c.subject?.trim() || undefined,
      price: c.price,
      salePrice: c.salePrice,
      status: c.status,
    }))
    setBooks((bs) => [...newBooks, ...bs])
    setScreen('shelf')
  }

  function handleDelete(id: string) {
    setBooks((bs) => bs.filter((b) => b.id !== id))
    setScreen('shelf')
  }

  function handleUpdate(id: string, patch: Partial<Book>) {
    setBooks((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  }

  function openBook(id: string) {
    setSelectedId(id)
    setScreen('detail')
  }

  function handleAddToWishlist(r: SearchResult) {
    const already = wishlist.some((w) => w.title.trim() === r.title.trim() && w.author.trim() === r.author.trim())
    if (already) return
    const entry: WishBook = {
      id: `wish-${Date.now()}-${wishSeq++}`,
      title: r.title,
      author: r.author,
      publisher: r.publisher || undefined,
      addedAt: new Date().toISOString().slice(0, 10),
      hue: wishlist.length,
      coverUrl: r.coverUrl ?? undefined,
      price: r.price ?? undefined,
      salePrice: r.salePrice ?? undefined,
      status: r.status ?? undefined,
      contents: r.contents ?? undefined,
    }
    setWishlist((ws) => [entry, ...ws])
  }

  function handleRemoveFromWishlist(id: string) {
    setWishlist((ws) => ws.filter((w) => w.id !== id))
  }

  // 읽고 싶은 책을 실제로 손에 넣었을 때 — 위시리스트에서 빼고 소장 서재로 옮긴다.
  function handleMoveToShelf(id: string) {
    const item = wishlist.find((w) => w.id === id)
    if (!item) return
    const newBook: Book = {
      id: `new-${Date.now()}-${bookSeq++}`,
      title: item.title,
      author: item.author,
      publisher: item.publisher,
      addedAt: new Date().toISOString().slice(0, 10),
      hue: item.hue,
      coverUrl: item.coverUrl,
      price: item.price,
      salePrice: item.salePrice,
      status: item.status,
    }
    setBooks((bs) => [newBook, ...bs])
    setWishlist((ws) => ws.filter((w) => w.id !== id))
  }

  return (
    <div className="app-shell">
      {screen === 'shelf' && (
        <Shelf
          books={books}
          onOpenBook={openBook}
          onOpenSearch={() => setScreen('search')}
          onAddBooks={() => setScreen('confirm')}
          onOpenWishlist={() => setScreen('wishlist')}
        />
      )}
      {screen === 'confirm' && (
        <Confirm existingBooks={books} onBack={() => setScreen('shelf')} onSave={handleSave} />
      )}
      {screen === 'detail' && selectedBook && (
        <Detail
          book={selectedBook}
          onBack={() => setScreen('shelf')}
          onDelete={handleDelete}
          onUpdate={(patch) => handleUpdate(selectedBook.id, patch)}
        />
      )}
      {screen === 'search' && <Search books={books} onBack={() => setScreen('shelf')} onOpenBook={openBook} />}
      {screen === 'wishlist' && (
        <Wishlist
          wishlist={wishlist}
          onBack={() => setScreen('shelf')}
          onOpenAdd={() => setScreen('wishlistAdd')}
          onMoveToShelf={handleMoveToShelf}
          onRemove={handleRemoveFromWishlist}
        />
      )}
      {screen === 'wishlistAdd' && (
        <WishlistAdd
          existingBooks={books}
          wishlist={wishlist}
          onBack={() => setScreen('wishlist')}
          onAdd={handleAddToWishlist}
        />
      )}
    </div>
  )
}
