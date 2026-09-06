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

/**
 * Looks up a book's cover, price, and sale status for a title (+ optional
 * author to help Kakao's own search rank the right book first). Just takes
 * the top search result — covers/info show up far more often this way, and
 * a wrong one is easy for the person to fix by hand; nothing at all was
 * worse than an occasional miss. Returns all-null fields when there's no key
 * configured, no results, or the request fails.
 */
export async function fetchBookInfo(title: string, author?: string): Promise<BookInfo> {
  const title2 = title.trim()
  if (!title2 || !KAKAO_KEY) return EMPTY_INFO

  const query = author?.trim() ? `${title2} ${author.trim()}` : title2
  const cacheKey = query
  if (cache.has(cacheKey)) return cache.get(cacheKey)!

  try {
    const url = new URL('https://dapi.kakao.com/v3/search/book')
    url.searchParams.set('query', query)
    url.searchParams.set('size', '5')

    const res = await fetch(url.toString(), {
      headers: { Authorization: `KakaoAK ${KAKAO_KEY}` },
    })
    if (!res.ok) {
      cache.set(cacheKey, EMPTY_INFO)
      return EMPTY_INFO
    }

    const data = (await res.json()) as KakaoBookResponse
    const doc = data.documents?.[0]
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
