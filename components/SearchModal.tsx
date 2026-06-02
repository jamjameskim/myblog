import Link from 'next/link'
import * as React from 'react'

import { searchNotion } from '@/lib/search-notion'
import styles from './SearchModal.module.css'

interface Result {
  id: string
  title: string
  url: string
}

export function SearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState<Result[]>([])
  const [loading, setLoading] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // ESC 닫기
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  React.useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const res = await searchNotion({ query })
        const items: Result[] = (res.results || []).map((r: any) => ({
          id: r.id,
          title: r.title || '제목 없음',
          url: `/${r.id}`
        }))
        setResults(items)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.inputRow}>
          <svg className={styles.searchIcon} width='16' height='16' viewBox='0 0 16 16' fill='none'>
            <circle cx='6.5' cy='6.5' r='4.5' stroke='currentColor' strokeWidth='1.5' />
            <path d='M10 10L13.5 13.5' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
          </svg>
          <input
            ref={inputRef}
            className={styles.input}
            placeholder='검색'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className={styles.cancelBtn} onClick={onClose}>취소</button>
        </div>

        {query.trim() && (
          <div className={styles.results}>
            {loading && <p className={styles.hint}>검색 중...</p>}
            {!loading && results.length === 0 && (
              <p className={styles.hint}>결과 없음</p>
            )}
            {results.map((r, i) => (
              <React.Fragment key={r.id}>
                {i > 0 && <div className={styles.divider} />}
                <Link href={r.url} className={styles.resultItem} onClick={onClose}>
                  <svg width='14' height='14' viewBox='0 0 16 16' fill='none'>
                    <path d='M3 8h10M9 4l4 4-4 4' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                  </svg>
                  {r.title}
                </Link>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
