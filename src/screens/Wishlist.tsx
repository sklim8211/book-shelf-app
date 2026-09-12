import type { WishBook } from '../types'
import IconButton from '../components/IconButton'
import BookCover from '../components/BookCover'
import { BackIcon, PlusIcon, ArrowRightIcon, CloseIcon } from '../components/icons'
import { usedSearchUrl } from '../utils/aladin'

type Props = {
  wishlist: WishBook[]
  onBack: () => void
  onOpenAdd: () => void
  onMoveToShelf: (id: string) => void
  onRemove: (id: string) => void
}

function formatWon(n: number) {
  return `${n.toLocaleString('ko-KR')}원`
}

export default function Wishlist({ wishlist, onBack, onOpenAdd, onMoveToShelf, onRemove }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <div style={{ padding: '28px 24px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <IconButton aria-label="뒤로" onClick={onBack}>
          <BackIcon />
        </IconButton>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 600 }}>읽고 싶은 책</div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 20px 100px' }}>
        {wishlist.length === 0 ? (
          <div
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: 'var(--muted)',
              fontSize: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <div>아직 담아둔 책이 없어요</div>
            <div style={{ fontSize: 13 }}>제목이나 저자로 검색해서 담아보세요</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {wishlist.map((b) => (
              <div
                key={b.id}
                style={{
                  display: 'flex',
                  gap: 14,
                  alignItems: 'center',
                  padding: 14,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 14,
                }}
              >
                <div style={{ width: 52, height: 74, flexShrink: 0 }}>
                  <BookCover title={b.title} author="" hue={b.hue} coverUrl={b.coverUrl} radius={6} titleSize={9} />
                </div>

                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {b.title}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                    {[b.author, b.publisher].filter(Boolean).join(' · ')}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                    {b.status && b.status !== '정상' && (
                      <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{b.status} · </span>
                    )}
                    {b.salePrice ? formatWon(b.salePrice) : b.price ? formatWon(b.price) : ''}
                  </div>
                  <a
                    href={usedSearchUrl(b.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      alignSelf: 'flex-start',
                      marginTop: 2,
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--muted)',
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                      padding: '3px 9px',
                      textDecoration: 'none',
                    }}
                  >
                    중고가 확인
                  </a>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => onMoveToShelf(b.id)}
                    aria-label="서재로 옮기기"
                    title="서재로 옮기기"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: 'var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ArrowRightIcon size={15} color="white" />
                  </button>
                  <button
                    onClick={() => onRemove(b.id)}
                    aria-label="목록에서 제외"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CloseIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onOpenAdd}
        aria-label="책 검색해서 추가"
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
