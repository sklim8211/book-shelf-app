import { useEffect, useState } from 'react'
import type { Book, RecognizedCandidate } from './types'
import { initialBooks } from './data/mockBooks'
import { fetchCoverUrl } from './data/kakaoBooks'
import Shelf from './screens/Shelf'
import Confirm from './screens/Confirm'
import Detail from './screens/Detail'
import Search from './screens/Search'

type Screen = 'shelf' | 'confirm' | 'detail' | 'search'

let bookSeq = 0

export default function App() {
  const [books, setBooks] = useState<Book[]>(initialBooks)
  const [screen, setScreen] = useState<Screen>('shelf')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedBook = books.find((b) => b.id === selectedId) ?? null

  // Backfill real cover art for the starter mock shelf too, not just newly saved books.
  useEffect(() => {
    initialBooks.forEach((b) => {
      fetchCoverUrl(b.title, b.author).then((coverUrl) => {
        if (!coverUrl) return
        setBooks((bs) => bs.map((x) => (x.id === b.id ? { ...x, coverUrl } : x)))
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    }))
    setBooks((bs) => [...newBooks, ...bs])
    setScreen('shelf')
  }

  function handleDelete(id: string) {
    setBooks((bs) => bs.filter((b) => b.id !== id))
    setScreen('shelf')
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
      {screen === 'confirm' && <Confirm onBack={() => setScreen('shelf')} onSave={handleSave} />}
      {screen === 'detail' && selectedBook && (
        <Detail book={selectedBook} onBack={() => setScreen('shelf')} onDelete={handleDelete} />
      )}
      {screen === 'search' && <Search books={books} onBack={() => setScreen('shelf')} onOpenBook={openBook} />}
    </div>
  )
}
