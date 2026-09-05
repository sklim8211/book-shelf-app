import { useMemo, useState } from 'react'
import type { Book } from '../types'
import IconButton from '../components/IconButton'
import BookCover from '../components/BookCover'
import { BackIcon, SearchIcon } from '../components/icons'

type Props = {
  books: Book[]
  onBack: () => void
  onOpenBook: (id: string) => void
}

export default function Search({ books, onBack, onOpenBook }: Props) {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return books.filter((b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q))
  }, [books, query])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <IconButton aria-label="뒤로" onClick={onBack}>
          <BackIcon />
        </IconButton>
        <div
          style={{
            flex: 1,
            height: 44,
            borderRadius: 12,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '0 14px',
          }}
        >
          <SearchIcon size={16} color="var(--muted)" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="제목, 저자로 검색"
            style={{ fontSize: 15, background: 'transparent', width: '100%' }}
          />
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '8px 16px 16px', display: 'flex', flexDirection: 'column' }}>
        {query.trim() && (
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>검색 결과 {results.length}권</div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {results.map((b) => (
            <button
              key={b.id}
              onClick={() => onOpenBook(b.id)}
              style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 8, textAlign: 'left' }}
            >
              <div style={{ width: 40, height: 56, flexShrink: 0 }}>
                <BookCover title={b.title} author="" hue={b.hue} coverUrl={b.coverUrl} radius={4} titleSize={9} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{b.title}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{b.author}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
