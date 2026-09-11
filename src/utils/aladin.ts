// 알라딘 공개 웹페이지로 연결하는 링크 — API 없이도 쓸 수 있는, 키가 필요없는
// 정적 링크만 사용한다 (알라딘 오픈API는 2026년 하반기에 종료됨).

// 저자를 같이 넘기면 "제목 저자"로 검색해서, 흔한 제목의 책이 여러 권 섞여
// 나오는 문제를 줄인다 — 알라딘 검색창도 카카오처럼 한 개의 자유 텍스트
// 검색어만 받기 때문에, 그냥 공백으로 이어붙이면 된다.
export function usedSearchUrl(title: string, author?: string): string {
  const query = author?.trim() ? `${title} ${author.trim()}` : title
  return `https://www.aladin.co.kr/search/wsearchresult.aspx?SearchTarget=Used&SearchWord=${encodeURIComponent(query)}`
}

export const SELL_URL = 'https://www.aladin.co.kr/shop/usedshop/wc2b_sales.aspx'
