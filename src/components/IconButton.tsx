import type { ReactNode } from 'react'

type Props = {
  onClick?: () => void
  children: ReactNode
  'aria-label': string
  filled?: boolean
}

// A 44x44 circular tap target — the minimum hit-target size used throughout.
export default function IconButton({ onClick, children, filled, ...rest }: Props) {
  return (
    <button
      onClick={onClick}
      {...rest}
      style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: filled ? 'var(--accent)' : 'var(--surface)',
        border: filled ? 'none' : '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  )
}
