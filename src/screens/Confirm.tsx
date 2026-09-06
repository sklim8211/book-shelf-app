import { useMemo, useState } from 'react'
import type { Book, RecognizedCandidate } from '../types'
import IconButton from '../components/IconButton'
import BookCover from '../components/BookCover'
import { fetchBookInfo } from '../data/kakaoBooks'
import { BackIcon, CloseIcon, PlusIcon } from '../components/icons'

type Props = {
  existingBooks: Book[]
  onBack: () => void
  onSave: (accepted: RecognizedCandidate[]) => void
}

// 공백/구두점을 지워서 "총, 균, 쇠"와 "총·균·쇠"를 같은 책으로 인식한다.
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[\s():,.\-·"'!?]/g, '')
}

const GEMINI_PROMPT =
  '이 사진 속 책들을 한 줄에 한 권씩, 반드시 "제목 - 저자 - 분류" 형식으로만 정리해줘. 다른 설명이나 번호, 괄호는 붙이지 마. 분류는 대형서점처럼 "대분류 > 소분류" 형태로 적어줘.\n예시:\n데미안 - 헤르만 헤세 - 문학·예술·실무 > 소설\n사피엔스 - 유발 하라리 - 인문·사회과학 > 역사\n확실하지 않은 정보는 추측하지 말고 비워둬.'

let seq = 0

// Copies text to the clipboard, working even without a secure context (http) —
// the modern Clipboard API needs https/localhost, so this falls back to the
// older execCommand trick via a hidden textarea when that's unavailable.
async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
    throw new Error('insecure context')
  } catch {
    try {
      const el = document.createElement('textarea')
      el.value = text
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.focus()
      el.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(el)
      return ok
    } catch {
      return false
    }
  }
}

// Splits one line of pasted text like "데미안 - 헤르만 헤세 - 문학·예술·실무 > 소설"
// (or just "데미안 - 헤르만 헤세", or just "데미안") into title/author/subject.
// Strips leading numbering ("1. ", "1) ", "- ").
function parseLine(raw: string): { title: string; author: string; subject: string } {
  const line = raw.trim().replace(/^(\d+[.)]|-|\*)\s*/, '')
  const parts = line.split(/\s*[-–|\t]\s*/)
  if (parts.length >= 3 && parts[0].trim()) {
    return {
      title: parts[0].trim(),
      author: parts[1].trim(),
      subject: parts.slice(2).join(' - ').trim(),
    }
  }
  if (parts.length === 2 && parts[0].trim()) {
    return { title: parts[0].trim(), author: parts[1].trim(), subject: '' }
  }
  return { title: line.trim(), author: '', subject: '' }
}

export default function Confirm({ existingBooks, onBack, onSave }: Props) {
  const [candidates, setCandidates] = useState<RecognizedCandidate[]>([])
  const [pasteText, setPasteText] = useState('')
  const [copyStatus, setCopyStatus] = useState<string | null>(null)

  // 이미 서재에 있는 제목들 — 중복구매 경고용.
  const existingTitles = useMemo(() => new Set(existingBooks.map((b) => normalize(b.title))), [existingBooks])

  function isDuplicate(c: RecognizedCandidate): boolean {
    return c.title.trim().length > 0 && existingTitles.has(normalize(c.title))
  }

  async function handleCopyPrompt() {
    const ok = await copyText(GEMINI_PROMPT)
    setCopyStatus(ok ? '복사됐어요 — 제미나이에 사진과 함께 붙여넣으세요' : '복사에 실패했어요, 위 문구를 직접 선택해서 복사해주세요')
  }

  function updateField(id: string, field: 'title' | 'author' | 'subject', value: string) {
    setCandidates((cs) => cs.map((c) => (c.id === id ? { ...c, [field]: value } : c)))
  }

  // Look up a real cover + price/절판여부 once the person finishes typing a
  // title (on blur, not on every keystroke).
  function lookupInfo(c: RecognizedCandidate) {
    if (!c.title.trim()) return
    fetchBookInfo(c.title, c.author).then(({ coverUrl, price, salePrice, status }) => {
      setCandidates((cs) =>
        cs.map((x) =>
          x.id === c.id
            ? {
                ...x,
                coverUrl: coverUrl ?? x.coverUrl,
                price: price ?? x.price,
                salePrice: salePrice ?? x.salePrice,
                status: status ?? x.status,
              }
            : x,
        ),
      )
    })
  }

  function applyPaste() {
    const lines = pasteText.split('\n').map((l) => l.trim()).filter(Boolean)
    if (lines.length === 0) return
    const parsed: RecognizedCandidate[] = lines.map((line, i) => {
      const { title, author, subject } = parseLine(line)
      return {
        id: `pasted-${Date.now()}-${seq++}`,
        title,
        author,
        subject: subject || undefined,
        hue: candidates.length + i,
        recognized: false,
      }
    })
    setCandidates((cs) => [...cs, ...parsed])
    setPasteText('')
    parsed.forEach((c) => lookupInfo(c))
  }

  function remove(id: string) {
    setCandidates((cs) => cs.filter((c) => c.id !== id))
  }

  function addRow() {
    setCandidates((cs) => [
      ...cs,
      { id: `extra-${Date.now()}-${seq++}`, title: '', author: '', hue: cs.length, recognized: false },
    ])
  }

  const readyToSave = candidates.filter((c) => c.title.trim().length > 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <div style={{ padding: '28px 24px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <IconButton aria-label="뒤로" onClick={onBack}>
          <BackIcon />
        </IconButton>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 600 }}>책 붙여넣기</div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'vFlat Scan 앱으로 책장을 스캔해서 PDF로 저장하세요 (일반 사진보다 훨씬 잘 인식돼요)',
              '아래 "지시문 복사"를 누르세요',
              '구글 제미나이를 열어 그 PDF를 올리고, 복사한 지시문을 붙여넣으세요',
              '제미나이가 준 목록을 복사해서, 아래 칸에 붙여넣으세요',
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div
                  style={{
                    flexShrink: 0,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    color: 'white',
                    fontSize: 11,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 1,
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.5 }}>{step}</div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              padding: 14,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 12,
            }}
          >
            <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.6 }}>"{GEMINI_PROMPT}"</div>
            <button
              onClick={handleCopyPrompt}
              style={{
                alignSelf: 'flex-start',
                height: 32,
                padding: '0 14px',
                borderRadius: 16,
                fontSize: 12,
                fontWeight: 600,
                color: 'white',
                background: 'var(--accent)',
              }}
            >
              지시문 복사
            </button>
            {copyStatus && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{copyStatus}</div>}
          </div>

          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>
            여기에 제미나이가 준 목록을 붙여넣으세요
          </div>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={
              '데미안 - 헤르만 헤세 - 문학·예술·실무 > 소설\n군주론 - 니콜로 마키아벨리 - 인문·사회과학 > 정치\n사피엔스 - 유발 하라리 - 인문·사회과학 > 역사'
            }
            rows={5}
            style={{
              fontSize: 15,
              lineHeight: 1.7,
              resize: 'vertical',
              width: '100%',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: 16,
            }}
          />
          <button
            onClick={applyPaste}
            disabled={!pasteText.trim()}
            style={{
              height: 48,
              borderRadius: 14,
              fontSize: 15,
              fontWeight: 600,
              color: 'white',
              background: pasteText.trim() ? 'var(--accent)' : 'var(--border)',
            }}
          >
            목록에 채우기
          </button>
        </div>

        {candidates.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>{candidates.length}권 확인 중</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {candidates.map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center',
                    padding: 10,
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                  }}
                >
                  <div style={{ width: 40, height: 56, flexShrink: 0 }}>
                    <BookCover title={c.title} author="" hue={c.hue} coverUrl={c.coverUrl} radius={4} titleSize={9} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <input
                      value={c.title}
                      onChange={(e) => updateField(c.id, 'title', e.target.value)}
                      onBlur={() => lookupInfo(c)}
                      placeholder="제목을 입력하세요"
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        paddingBottom: 2,
                        borderBottom: '1px dashed var(--border)',
                        background: 'transparent',
                        fontStyle: c.title ? 'normal' : 'italic',
                        color: c.title ? 'var(--ink)' : 'var(--muted)',
                        width: '100%',
                      }}
                    />
                    <input
                      value={c.author}
                      onChange={(e) => updateField(c.id, 'author', e.target.value)}
                      onBlur={() => lookupInfo(c)}
                      placeholder="저자 (선택)"
                      style={{ fontSize: 12, color: 'var(--muted)', background: 'transparent', width: '100%' }}
                    />
                    <input
                      value={c.subject ?? ''}
                      onChange={(e) => updateField(c.id, 'subject', e.target.value)}
                      placeholder="분류 (선택, 예: 인문·사회과학 > 역사)"
                      style={{ fontSize: 11, color: 'var(--accent)', background: 'transparent', width: '100%' }}
                    />
                    {isDuplicate(c) && (
                      <div style={{ fontSize: 11, color: '#c0392b', fontWeight: 600 }}>
                        이미 서재에 있는 책이에요
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => remove(c.id)}
                    aria-label="목록에서 제외"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CloseIcon />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={addRow}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            height: 48,
            borderRadius: 14,
            border: '1px dashed var(--border)',
            color: 'var(--muted)',
            fontSize: 14,
          }}
        >
          <PlusIcon size={14} color="var(--muted)" />한 권씩 직접 입력
        </button>
      </div>

      {candidates.length > 0 && (
        <div style={{ padding: '14px 24px 24px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => onSave(readyToSave)}
            disabled={readyToSave.length === 0}
            style={{
              width: '100%',
              height: 52,
              borderRadius: 14,
              background: readyToSave.length === 0 ? 'var(--border)' : 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 600,
              color: 'white',
            }}
          >
            {readyToSave.length}권 서재에 저장
          </button>
        </div>
      )}
    </div>
  )
}
