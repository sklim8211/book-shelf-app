// Real cover-art lookup via Kakao's 도서 검색 API.
// Docs: https://developers.kakao.com/docs/latest/ko/daum-search/dev-guide#search-book
// Free tier, REST API key only (no OAuth needed for this endpoint).

const KAKAO_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY as string | undefined

type KakaoBookDoc = {
  title: string
  authors: string[]
  thumbnail: string
}

type KakaoBookResponse = {
  documents: KakaoBookDoc[]
}

const cache = new Map<string, string | null>()

/**
 * Looks up a cover-image URL for a title (+ optional author to help Kakao's
 * own search rank the right book first). Just takes the top search result —
 * covers show up far more often this way, and a wrong one is easy for the
 * person to fix by hand; no cover at all was worse than an occasional miss.
 * Returns null only when there's no key configured, no results, or the
 * request fails.
 */
export async function fetchCoverUrl(title: string, author?: string): Promise<string | null> {
  const title2 = title.trim()
  if (!title2 || !KAKAO_KEY) return null

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
      cache.set(cacheKey, null)
      return null
    }

    const data = (await res.json()) as KakaoBookResponse
    const cover = data.documents?.[0]?.thumbnail || null
    cache.set(cacheKey, cover)
    return cover
  } catch {
    cache.set(cacheKey, null)
    return null
  }
}
