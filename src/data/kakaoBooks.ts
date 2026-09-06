// Book lookup via Kakao's 도서 검색 API — cover art, price, and sale status.
// Docs: https://developers.kakao.com/docs/latest/ko/daum-search/dev-guide#search-book
// Free tier, REST API key only (no OAuth needed for this endpoint).

const KAKAO_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY as string | undefined

type KakaoBookDoc = {
  title: string
  authors: string[]
  thumbnail: string
  price: number
  sale_price: number
  status: string
}

type KakaoBookResponse = {
  documents: KakaoBookDoc[]
}

export type BookInfo = {
  coverUrl: string | null
  price: number | null
  salePrice: number | null
  status: string | null
}

const EMPTY_INFO: BookInfo = { coverUrl: null, price: null, salePrice: null, status: null }

const cache = new Map<string, BookInfo>()

// Strips spacing/punctuation so "김영하" and "김 영하" (or "총, 균, 쇠" vs "총·균·쇠")
// compare equal when checking author matches.
function normalize(s: string): string {
  return s.toLowerCase().replace(/[\s():,.\-·"'!?]/g, '')
}

/**
 * Looks up a book's cover, price, and sale status for a title (+ optional
 * author). Kakao's search endpoint only takes one free-text query, so
 * "제목 저자" search doesn't strictly filter by author — it just influences
 * ranking. To avoid picking a same-titled book by a different author, this
 * scans the top results and prefers one whose author list actually matches;
 * only when none match does it fall back to the top result. Nothing at all
 * was worse than an occasional miss, so it still always returns something
 * when the search has any results at all.
 */
export async function fetchBookInfo(title: string, author?: string): Promise<BookInfo> {
  const title2 = title.trim()
  if (!title2 || !KAKAO_KEY) return EMPTY_INFO

  const author2 = author?.trim()
  const query = author2 ? `${title2} ${author2}` : title2
  const cacheKey = query
  if (cache.has(cacheKey)) return cache.get(cacheKey)!

  try {
    const url = new URL('https://dapi.kakao.com/v3/search/book')
    url.searchParams.set('query', query)
    url.searchParams.set('size', '10')

    const res = await fetch(url.toString(), {
      headers: { Authorization: `KakaoAK ${KAKAO_KEY}` },
    })
    if (!res.ok) {
      cache.set(cacheKey, EMPTY_INFO)
      return EMPTY_INFO
    }

    const data = (await res.json()) as KakaoBookResponse
    const docs = data.documents ?? []

    const doc = author2
      ? docs.find((d) => d.authors?.some((a) => normalize(a) === normalize(author2))) ?? docs[0]
      : docs[0]

    const info: BookInfo = doc
      ? {
          coverUrl: doc.thumbnail || null,
          price: typeof doc.price === 'number' && doc.price > 0 ? doc.price : null,
          salePrice: typeof doc.sale_price === 'number' && doc.sale_price > 0 ? doc.sale_price : null,
          status: doc.status || null,
        }
      : EMPTY_INFO
    cache.set(cacheKey, info)
    return info
  } catch {
    cache.set(cacheKey, EMPTY_INFO)
    return EMPTY_INFO
  }
}
