import { useEffect, useState } from 'react'
import type { Book } from '../types'
import IconButton from '../components/IconButton'
import BookCover from '../components/BookCover'
import { fetchBookInfo } from '../data/kakaoBooks'
import { PRESET_CATEGORIES } from '../data/categories'
import { usedSearchUrl, SELL_URL } from '../utils/aladin'
import { BackIcon } from '../components/icons'

type Props = {
  book: Book
  onBack: () => void
  onDelete: (id: string) => void
  onUpdate: (patch: Partial<Book>) => void
}

function formatAdded(iso: string) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}월 ${d.getDate()}일 등록`
}

function formatWon(n: number) {
  return `${n.toLocaleString('ko-KR')}원`
}

export default function Detail({ book, onBack, onDelete, onUpdate }: Props) {
  // 로컬 입력값 — 책이 바뀌면(다른 책 상세로 이동) 그 책의 값으로 다시 맞춘다.
  const [memo, setMemo] = useState(book.memo ?? '')
  const [lentTo, setLentTo] = useState(book.lentTo ?? '')
  const [subject, setSubject] = useState(book.subject ?? '')
  const [refetching, setRefetching] = useState(false)

  useEffect(() => {
    setMemo(book.memo ?? '')
    setLentTo(book.lentTo ?? '')
    setSubject(book.subject ?? '')
  }, [book.id])

  // 예전에 잘못 매칭된 표지/정가를 다시 조회해서 덮어쓴다 — 이미 저장된 책은
  // 코드를 고쳐도 자동으로 다시 조회되지 않기 때문에 필요.
  async function refetchInfo() {
    setRefetching(true)
    const { coverUrl, price, salePrice, status } = await fetchBookInfo(book.title, book.author)
    onUpdate({ coverUrl: coverUrl ?? undefined, price: price ?? undefined, salePrice: salePrice ?? undefined, status: status ?? undefined })
    setRefetching(false)
  }

  // "대분류 > 소분류"에서 대분류만 뽑아 프리셋 버튼의 선택 여부를 표시한다.
  function mainCategory(s: string): string {
    return s.split('>')[0].trim()
  }

  // 프리셋 버튼을 누르면 대분류만 바꾸고, 이미 적어둔 소분류(> 뒤)는 그대로 둔다. 바로 저장까지 반영.
  function pickCategory(cat: string) {
    const rest = subject.split('>').slice(1).join('>').trim()
    const next = rest ? `${cat} > ${rest}` : cat
    setSubject(next)
    onUpdate({ subject: next })
  }

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
          <button
            onClick={refetchInfo}
            disabled={refetching}
            style={{ marginTop: 6, fontSize: 11, color: 'var(--muted)', textDecoration: 'underline' }}
          >
            {refetching ? '다시 찾는 중…' : '표지·정가 다시 찾기'}
          </button>
          <div style={{ marginTop: 6, fontSize: 12, color: 'var(--muted)' }}>
            {[book.publisher, formatAdded(book.addedAt)].filter(Boolean).join(' · ')}
          </div>
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
                textDecoration: 'none',
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
                textDecoration: 'none',
              }}
            >
              중고로 팔기
            </a>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>분류</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {PRESET_CATEGORIES.map((cat) => {
              const active = mainCategory(subject) === cat
              return (
                <button
                  key={cat}
                  onClick={() => pickCategory(cat)}
                  style={{
                    height: 28,
                    padding: '0 12px',
                    borderRadius: 14,
                    fontSize: 12,
                    fontWeight: 600,
                    border: '1px solid var(--border)',
                    background: active ? 'var(--accent)' : 'var(--surface)',
                    color: active ? 'white' : 'var(--muted)',
                  }}
                >
                  {cat}
                </button>
              )
            })}
          </div>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            onBlur={() => onUpdate({ subject: subject.trim() || undefined })}
            placeholder="분류를 입력하세요 (선택, 예: 인문학 > 역사)"
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
