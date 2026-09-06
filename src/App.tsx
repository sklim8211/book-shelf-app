import { useEffect, useState } from 'react'
import type { Book, RecognizedCandidate } from './types'
import { initialBooks } from './data/mockBooks'
import { fetchBookInfo } from './data/kakaoBooks'
import { loadBooks, saveBooks } from './utils/storage'
import Shelf from './screens/Shelf'
import Confirm from './screens/Confirm'
import Detail from './screens/Detail'
import Search from './screens/Search'

type Screen = 'shelf' | 'confirm' | 'detail' | 'search'

let bookSeq = 0

// Was there anything saved from a previous visit? If so, that's the real
// starting point — the mock shelf is only for a first-ever visit.
const savedBooks = loadBooks()

export default function App() {
  const [books, setBooks] = useState<Book[]>(savedBooks ?? initialBooks)
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

  function handleUpdate(id: string, patch: Partial<Pick<Book, 'memo' | 'lentTo'>>) {
    setBooks((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  }

  function openBook(id: string) {
    setSelectedId(id)
    setScreen('detail')
  }

  return (
    <div className="app-shell">
      {screen === 'shelf' && (
        <Shelf
          books={books}
          onOpenBook={openBook}
          onOpenSearch={() => setScreen('search')}
          onAddBooks={() => setScreen('confirm')}
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
    </div>
  )
}
