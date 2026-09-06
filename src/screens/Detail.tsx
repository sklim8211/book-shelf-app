import type { Book } from '../types'
import IconButton from '../components/IconButton'
import BookCover from '../components/BookCover'
import { BackIcon } from '../components/icons'

type Props = {
  book: Book
  onBack: () => void
  onDelete: (id: string) => void
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

export default function Detail({ book, onBack, onDelete }: Props) {
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
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 24px',
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
