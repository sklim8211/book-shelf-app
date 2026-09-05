import { useMemo, useState } from 'react'
import type { Book } from '../types'
import IconButton from '../components/IconButton'
import BookCover from '../components/BookCover'
import { SearchIcon, PlusIcon } from '../components/icons'

type Props = {
  books: Book[]
  onOpenBook: (id: string) => void
  onOpenSearch: () => void
  onAddBooks: () => void
}

export default function Shelf({ books, onOpenBook, onOpenSearch, onAddBooks }: Props) {
  const [activeSubject, setActiveSubject] = useState<string | null>(null)

  const subjects = useMemo(() => {
    const set = new Set<string>()
    books.forEach((b) => b.subject && set.add(b.subject))
    return Array.from(set)
  }, [books])

  const visibleBooks = activeSubject ? books.filter((b) => b.subject === activeSubject) : books

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', position: 'relative' }}>
      <div
        style={{
          padding: '24px 20px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 600 }}>내 서재</div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>
            {activeSubject ? `${visibleBooks.length}권 · ${activeSubject}` : `${books.length}권`}
          </div>
        </div>
        <IconButton aria-label="검색" onClick={onOpenSearch}>
          <SearchIcon />
        </IconButton>
      </div>

      {subjects.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: 8,
            padding: '14px 20px 0',
            overflowX: 'auto',
          }}
        >
          <button
            onClick={() => setActiveSubject(null)}
            style={{
              flexShrink: 0,
              height: 30,
              padding: '0 14px',
              borderRadius: 15,
              fontSize: 12,
              fontWeight: 600,
              background: activeSubject === null ? 'var(--accent)' : 'var(--surface)',
              color: activeSubject === null ? 'white' : 'var(--muted)',
              border: '1px solid var(--border)',
            }}
          >
            전체
          </button>
          {subjects.map((s) => (
            <button
              key={s}
              onClick={() => setActiveSubject(s)}
              style={{
                flexShrink: 0,
                height: 30,
                padding: '0 14px',
                borderRadius: 15,
                fontSize: 12,
                fontWeight: 600,
                background: activeSubject === s ? 'var(--accent)' : 'var(--surface)',
                color: activeSubject === s ? 'white' : 'var(--muted)',
                border: '1px solid var(--border)',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {books.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '0 40px',
            textAlign: 'center',
            color: 'var(--muted)',
          }}
        >
          <div style={{ fontSize: 14 }}>아직 서재가 비어있어요</div>
          <div style={{ fontSize: 13 }}>오른쪽 아래 버튼으로 책장을 찍어보세요</div>
        </div>
      ) : visibleBooks.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--muted)',
            fontSize: 14,
          }}
        >
          이 과목에는 아직 책이 없어요
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            padding: '20px 20px 110px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 14,
            alignContent: 'start',
          }}
        >
          {visibleBooks.map((book) => (
            <button
              key={book.id}
              onClick={() => onOpenBook(book.id)}
              aria-label={`${book.title} 상세 보기`}
              style={{ aspectRatio: '2 / 3', display: 'block', textAlign: 'left' }}
            >
              <BookCover title={book.title} author={book.author} hue={book.hue} coverUrl={book.coverUrl} />
            </button>
          ))}
        </div>
      )}

      <button
        onClick={onAddBooks}
        aria-label="책 추가하기"
        style={{
          position: 'fixed',
          right: 'max(20px, calc((100vw - 480px) / 2 + 20px))',
          bottom: 28,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 10px oklch(0% 0 0 / 0.28)',
        }}
      >
        <PlusIcon />
      </button>
    </div>
  )
}
