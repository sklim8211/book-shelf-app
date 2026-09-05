import type { Book } from '../types'

// Starting shelf contents — stand-in for what would normally come from Supabase.
export const initialBooks: Book[] = [
  { id: 'b1', title: '먼지가 내려앉는 시간', author: '김소연', publisher: '사계절', addedAt: '2026-08-12', hue: 0 },
  { id: 'b2', title: '골목의 온도', author: '이재민', publisher: '문학동네', addedAt: '2026-08-10', hue: 1 },
  { id: 'b3', title: '빈 페이지의 위로', author: '박다인', publisher: '창비', addedAt: '2026-08-02', hue: 2 },
  {
    id: 'b4',
    title: '행정법 기본서',
    author: '정유안',
    publisher: '민음사',
    addedAt: '2026-07-28',
    hue: 3,
    subject: '행정법',
  },
  { id: 'b5', title: '두 번째 서랍', author: '최하람', publisher: '을유문화사', addedAt: '2026-07-20', hue: 4 },
  { id: 'b6', title: '물의 문장들', author: '한서율', publisher: '난다', addedAt: '2026-07-11', hue: 5 },
  {
    id: 'b7',
    title: '한국사능력검정 요약노트',
    author: '오정후',
    publisher: '위즈덤하우스',
    addedAt: '2026-06-30',
    hue: 6,
    subject: '한국사',
  },
  { id: 'b8', title: '책상 위의 우주', author: '강이든', publisher: '동아시아', addedAt: '2026-06-14', hue: 0 },
  {
    id: 'b9',
    title: '행정법 기출문제집',
    author: '윤소이',
    publisher: '어크로스',
    addedAt: '2026-05-29',
    hue: 1,
    subject: '행정법',
  },
]
