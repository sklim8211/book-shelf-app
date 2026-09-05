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

// Strips spacing/punctuation so "총, 균, 쇠" and "총·균·쇠" compare equal.
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[\s():,.\-·"'!?]/g, '')
}

/**
 * Looks up a cover-image URL for a title (+ optional author to disambiguate).
 * Only returns a cover when the title genuinely matches a search result (and
 * the author too, when one was given) — a same-titled but different book is
 * treated the same as no match. Returns null in every other case (no key
 * configured, no confident match, or the request fails); callers should fall
 * back to the flat-color placeholder rather than show a possibly-wrong cover.
 */
export async function fetchCoverUrl(title: string, author?: string): Promise<string | null> {
  const query = title.trim()
  if (!query || !KAKAO_KEY) return null

  const cacheKey = `${query}::${author ?? ''}`
  if (cache.has(cacheKey)) return cache.get(cacheKey)!

  try {
    const url = new URL('https://dapi.kakao.com/v3/search/book')
    url.searchParams.set('query', query)
    url.searchParams.set('size', '10')

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

    const normalizedTitle = normalize(query)
    const normalizedAuthor = author?.trim() ? normalize(author) : null

    // Only titles that actually match, not just "showed up in a fuzzy search".
    const titleMatches = data.documents.filter((d) => normalize(d.title) === normalizedTitle)

    const best = normalizedAuthor
      ? titleMatches.find((d) => d.authors.some((a) => normalize(a) === normalizedAuthor)) ?? null
      : titleMatches[0] ?? null

    const cover = best?.thumbnail || null
    cache.set(cacheKey, cover)
    return cover
  } catch {
    cache.set(cacheKey, null)
    return null
  }
}
