import { useEffect, useState } from 'react'
import type { Book } from '../types'
import IconButton from '../components/IconButton'
import BookCover from '../components/BookCover'
import { BackIcon } from '../components/icons'

type Props = {
  book: Book
  onBack: () => void
  onDelete: (id: string) => void
  onUpdate: (patch: Partial<Pick<Book, 'memo' | 'lentTo'>>) => void
}

function formatAdded(iso: string) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}월 ${d.getDate()}일 등록`
}

function formatWon(n: number) {
  return `${n.toLocaleString('ko-KR')}원`
}

function usedSearchUrl(title: string) {
  return `https://www.aladin.co.kr/search/wsearchresult.aspx?SearchTarget=Used&SearchWord=${encodeURIComponent(title)}`
}

const SELL_URL = 'https://www.aladin.co.kr/shop/usedshop/wc2b_sales.aspx'

export default function Detail({ book, onBack, onDelete, onUpdate }: Props) {
  // 로컬 입력값 — 책이 바뀌면(다른 책 상세로 이동) 그 책의 값으로 다시 맞춘다.
  const [memo, setMemo] = useState(book.memo ?? '')
  const [lentTo, setLentTo] = useState(book.lentTo ?? '')

  useEffect(() => {
    setMemo(book.memo ?? '')
    setLentTo(book.lentTo ?? '')
  }, [book.id])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <div style={{ padding: 16, display: 'flex', alignItems: 'center' }}>
        <IconButton aria-label="뒤로" onClick={onBack}>
          <BackIcon />
        </IconButton>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '0 24px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 28,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 160, height: 232, boxShadow: '0 8px 20px oklch(0% 0 0 / 0.18)', borderRadius: 10 }}>
            <BookCover
              title={book.title}
              author={book.author}
              hue={book.hue}
              coverUrl={book.coverUrl}
              titleSize={15}
              authorSize={12}
              radius={10}
            />
          </div>
          <div style={{ marginTop: 18, fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 600, textAlign: 'center' }}>
            {book.title}
          </div>
          <div style={{ marginTop: 4, fontSize: 14, color: 'var(--muted)' }}>{book.author}</div>
          <div style={{ marginTop: 6, fontSize: 12, color: 'var(--muted)' }}>
            {[book.publisher, formatAdded(book.addedAt)].filter(Boolean).join(' · ')}
          </div>
          {book.subject && (
            <div
              style={{
                marginTop: 12,
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--accent)',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 15,
                padding: '5px 14px',
              }}
            >
              {book.subject}
            </div>
          )}

          {(book.status || book.price || book.salePrice) && (
            <div style={{ marginTop: 14, fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>
              {book.status && book.status !== '정상' && (
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{book.status} · </span>
              )}
              {book.salePrice ? formatWon(book.salePrice) : book.price ? formatWon(book.price) : null}
              {book.salePrice && book.price && book.salePrice < book.price && (
                <span style={{ textDecoration: 'line-through', marginLeft: 6, opacity: 0.6 }}>
                  {formatWon(book.price)}
                </span>
              )}
            </div>
          )}

          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <a
              href={usedSearchUrl(book.title)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--ink)',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 15,
                padding: '7px 14px',
              }}
            >
              중고 시세 확인
            </a>
            <a
              href={SELL_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--ink)',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 15,
                padding: '7px 14px',
              }}
            >
              중고로 팔기
            </a>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>한 줄 메모</div>
          <input
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            onBlur={() => onUpdate({ memo: memo.trim() || undefined })}
            placeholder="이 책에 대한 짧은 생각을 남겨보세요"
            style={{
              fontSize: 14,
              padding: '10px 12px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              width: '100%',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>빌려준 사람</div>
          <input
            value={lentTo}
            onChange={(e) => setLentTo(e.target.value)}
            onBlur={() => onUpdate({ lentTo: lentTo.trim() || undefined })}
            placeholder="빌려줬다면 누구인지 적어두세요"
            style={{
              fontSize: 14,
              padding: '10px 12px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              width: '100%',
            }}
          />
        </div>
      </div>

      <div style={{ padding: '8px 20px 20px', textAlign: 'center' }}>
        <button
          onClick={() => onDelete(book.id)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 44,
            padding: '0 16px',
            fontSize: 13,
            color: 'var(--muted)',
          }}
        >
          서재에서 삭제
        </button>
      </div>
    </div>
  )
}
