// 알라딘 공개 웹페이지로 연결하는 링크 — API 없이도 쓸 수 있는, 키가 필요없는
// 정적 링크만 사용한다 (알라딘 오픈API는 2026년 하반기에 종료됨).

export function usedSearchUrl(title: string): string {
  return `https://www.aladin.co.kr/search/wsearchresult.aspx?SearchTarget=Used&SearchWord=${encodeURIComponent(title)}`
}

export const SELL_URL = 'https://www.aladin.co.kr/shop/usedshop/wc2b_sales.aspx'
