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

const UNSORTED = '미분류'

// "인문·사회과학 > 역사" 같은 분류 문자열에서 방을 나누는 기준이 되는 대분류만 뽑아낸다.
function topCategory(subject?: string): string {
  if (!subject?.trim()) return UNSORTED
  return subject.split('>')[0].trim() || UNSORTED
}

export default function Shelf({ books, onOpenBook, onOpenSearch, onAddBooks }: Props) {
  const [activeRoom, setActiveRoom] = useState<string | null>(null)

  // 책을 대분류별로 묶어서 "방"을 만든다 — 처음 등장한 순서대로, 미분류는 맨 뒤로.
  const rooms = useMemo(() => {
    const order: string[] = []
    const byCategory = new Map<string, Book[]>()
    books.forEach((b) => {
      const cat = topCategory(b.subject)
      if (!byCategory.has(cat)) {
        order.push(cat)
        byCategory.set(cat, [])
      }
      byCategory.get(cat)!.push(b)
    })
    const sortedOrder = [...order.filter((c) => c !== UNSORTED), ...order.filter((c) => c === UNSORTED)]
    return sortedOrder.map((category) => ({ category, books: byCategory.get(category)! }))
  }, [books])

  const roomNames = rooms.map((r) => r.category)
  const visibleBooks = activeRoom ? books.filter((b) => topCategory(b.subject) === activeRoom) : books
  const visibleRooms = activeRoom ? rooms.filter((r) => r.category === activeRoom) : rooms

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
            {activeRoom ? `${visibleBooks.length}권 · ${activeRoom}` : `${books.length}권`}
          </div>
        </div>
        <IconButton aria-label="검색" onClick={onOpenSearch}>
          <SearchIcon />
        </IconButton>
      </div>

      {roomNames.length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: 8,
            padding: '14px 20px 0',
            overflowX: 'auto',
          }}
        >
          <button
            onClick={() => setActiveRoom(null)}
            style={{
              flexShrink: 0,
              height: 30,
              padding: '0 14px',
              borderRadius: 15,
              fontSize: 12,
              fontWeight: 600,
              background: activeRoom === null ? 'var(--accent)' : 'var(--surface)',
              color: activeRoom === null ? 'white' : 'var(--muted)',
              border: '1px solid var(--border)',
            }}
          >
            전체
          </button>
          {roomNames.map((r) => (
            <button
              key={r}
              onClick={() => setActiveRoom(r)}
              style={{
                flexShrink: 0,
                height: 30,
                padding: '0 14px',
                borderRadius: 15,
                fontSize: 12,
                fontWeight: 600,
                background: activeRoom === r ? 'var(--accent)' : 'var(--surface)',
                color: activeRoom === r ? 'white' : 'var(--muted)',
                border: '1px solid var(--border)',
              }}
            >
              {r}
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
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          {visibleRooms.map((room) => (
            <div key={room.category} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {roomNames.length > 1 && (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600 }}>
                    {room.category}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{room.books.length}권</div>
                </div>
              )}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  gap: 14,
                }}
              >
                {room.books.map((book) => (
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
            </div>
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
