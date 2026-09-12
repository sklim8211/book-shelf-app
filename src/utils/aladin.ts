// 알라딘 공개 웹페이지로 연결하는 링크 — API 없이도 쓸 수 있는, 키가 필요없는
// 정적 링크만 사용한다 (알라딘 오픈API는 2026년 하반기에 종료됨).

// 저자까지 붙여서 검색하면 흔한 제목의 책이 섞여 나오는 건 줄지만, 알라딘
// 검색은 카카오와 달리 "제목 저자"를 곧이곧대로 하나의 문구로 취급해서
// 정작 있는 책도 못 찾는 경우가 생긴다 — 그래서 제목만으로 검색하고,
// 결과 목록에서 저자를 보고 직접 골라야 한다.
export function usedSearchUrl(title: string): string {
  return `https://www.aladin.co.kr/search/wsearchresult.aspx?SearchTarget=Used&SearchWord=${encodeURIComponent(title)}`
}

export const SELL_URL = 'https://www.aladin.co.kr/shop/usedshop/wc2b_sales.aspx'
