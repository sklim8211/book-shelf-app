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
 * Looks up a cover-image URL for a title (+ optional author to disambiguate).
 * Returns null when there's no key configured, no match, or the request fails —
 * callers should fall back to the flat-color placeholder in that case.
 */
export async function fetchCoverUrl(title: string, author?: string): Promise<string | null> {
  const query = title.trim()
  if (!query || !KAKAO_KEY) return null

  const cacheKey = `${query}::${author ?? ''}`
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
    if (!data.documents?.length) {
      cache.set(cacheKey, null)
      return null
    }

    // Prefer a result whose author list matches, when we have an author to check.
    const normalizedAuthor = author?.trim().toLowerCase()
    const best =
      (normalizedAuthor &&
        data.documents.find((d) => d.authors.some((a) => a.toLowerCase().includes(normalizedAuthor)))) ||
      data.documents[0]

    const cover = best.thumbnail || null
    cache.set(cacheKey, cover)
    return cover
  } catch {
    cache.set(cacheKey, null)
    return null
  }
}
