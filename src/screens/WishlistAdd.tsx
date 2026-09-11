import { useEffect, useRef, useState } from 'react'
import type { Book, WishBook } from '../types'
import IconButton from '../components/IconButton'
import BookCover from '../components/BookCover'
import { searchBooks, type SearchResult } from '../data/kakaoBooks'
import { BackIcon, SearchIcon, PlusIcon, CheckIcon } from '../components/icons'

type Props = {
  existingBooks: Book[]
  wishlist: WishBook[]
  onBack: () => void
  onAdd: (result: SearchResult) => void
}

// 공백/구두점을 지워서 "총, 균, 쇠"와 "총·균·쇠"를 같은 책으로 인식한다.
function normalize(s: string): string {
  return s.toLowerCase().replace(/[\s():,.\-·"'!?]/g, '')
}

function formatWon(n: number) {
  return `${n.toLocaleString('ko-KR')}원`
}

export default function WishlistAdd({ existingBooks, wishlist, onBack, onAdd }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState<Set<string>>(new Set())
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const ownedTitles = new Set(existingBooks.map((b) => normalize(b.title)))
  const wishedTitles = new Set(wishlist.map((b) => normalize(b.title)))

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const q = query.trim()
    if (!q) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      const r = await searchBooks(q)
      setResults(r)
      setLoading(false)
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  function handleAdd(r: SearchResult) {
    onAdd(r)
    setAdded((s) => new Set(s).add(r.title + r.author))
  }

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

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '8px 16px 24px', display: 'flex', flexDirection: 'column' }}>
        {loading && <div style={{ fontSize: 13, color: 'var(--muted)', padding: '8px 4px' }}>찾는 중…</div>}
        {!loading && query.trim() && results.length === 0 && (
          <div style={{ fontSize: 13, color: 'var(--muted)', padding: '8px 4px' }}>검색 결과가 없어요</div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {results.map((r, i) => {
            const key = r.title + r.author + i
            const isOwned = ownedTitles.has(normalize(r.title))
            const isWished = wishedTitles.has(normalize(r.title)) || added.has(r.title + r.author)
            return (
              <div
                key={key}
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                  padding: 12,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                }}
              >
                <div style={{ width: 44, height: 62, flexShrink: 0 }}>
                  <BookCover title={r.title} author="" hue={i} coverUrl={r.coverUrl ?? undefined} radius={4} titleSize={9} />
                </div>

                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {[r.author, r.publisher].filter(Boolean).join(' · ')}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {r.status && r.status !== '정상' && (
                      <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{r.status} · </span>
                    )}
                    {r.salePrice ? formatWon(r.salePrice) : r.price ? formatWon(r.price) : ''}
                  </div>
                  {r.contents && (
                    <div
                      style={{
                        fontSize: 12,
                        color: 'var(--muted)',
                        marginTop: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {r.contents}
                    </div>
                  )}
                  {isOwned && (
                    <div style={{ fontSize: 11, color: '#c0392b', fontWeight: 600, marginTop: 2 }}>
                      이미 서재에 있는 책이에요
                    </div>
                  )}
                </div>

                <button
                  onClick={() => !isWished && handleAdd(r)}
                  disabled={isWished}
                  aria-label={isWished ? '담김' : '읽고 싶은 책에 담기'}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isWished ? 'var(--border)' : 'var(--accent)',
                  }}
                >
                  {isWished ? <CheckIcon size={16} color="var(--muted)" /> : <PlusIcon size={16} />}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
