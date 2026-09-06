export type Book = {
  id: string
  title: string
  author: string
  publisher?: string
  addedAt: string // ISO date string
  hue: number // index into the .cover-hue-N palette (0-6), used when coverUrl is missing
  coverUrl?: string // real cover-art image, fetched from Kakao 도서 검색 API
  subject?: string // free-text subject/과목 tag (e.g. "행정법", "한국사") — optional
  price?: number // 정가, from Kakao 도서 검색 API
  salePrice?: number // 판매가, from Kakao 도서 검색 API
  status?: string // 판매 상태 ("정상", "품절", "절판" 등), from Kakao 도서 검색 API
}

// A candidate row on the Confirm screen — before it's accepted into the shelf.
export type RecognizedCandidate = {
  id: string
  title: string
  author: string
  hue: number
  /** false = recognition failed / low confidence, needs the person to type it in */
  recognized: boolean
  coverUrl?: string
  subject?: string
  price?: number
  salePrice?: number
  status?: string
}
