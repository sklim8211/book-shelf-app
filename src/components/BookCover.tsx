import { useState } from 'react'

type Props = {
  title: string
  author: string
  hue: number
  coverUrl?: string
  width?: number | string
  height?: number | string
  titleSize?: number
  authorSize?: number
  radius?: number
}

// Real cover art when available (via Kakao 도서 검색 API), falling back to the
// flat-color placeholder swatch from the design mockup when there's no image
// or it fails to load.
export default function BookCover({
  title,
  author,
  hue,
  coverUrl,
  width = '100%',
  height = '100%',
  titleSize = 11,
  authorSize = 9,
  radius = 8,
}: Props) {
  const [imgFailed, setImgFailed] = useState(false)
  const showImage = coverUrl && !imgFailed

  return (
    <div
      className={showImage ? undefined : `cover-hue-${hue % 7}`}
      style={{
        position: 'relative',
        width,
        height,
        borderRadius: radius,
        overflow: 'hidden',
        boxShadow: '0 1px 2px oklch(0% 0 0 / 0.14)',
        background: showImage ? 'var(--border)' : undefined,
      }}
    >
      {showImage ? (
        <img
          src={coverUrl}
          alt={title || '책 표지'}
          onError={() => setImgFailed(true)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, oklch(0% 0 0 / 0.55), transparent 58%)',
            }}
          />
          <div style={{ position: 'absolute', left: 8, right: 8, bottom: 8 }}>
            <div
              style={{
                fontSize: titleSize,
                fontWeight: 600,
                lineHeight: 1.25,
                color: 'oklch(98% 0.01 90)',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {title || '제목 없음'}
            </div>
            {author && (
              <div style={{ fontSize: authorSize, marginTop: 2, color: 'oklch(98% 0.01 90 / 0.8)' }}>{author}</div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
