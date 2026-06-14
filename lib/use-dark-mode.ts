import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'dark-mode'
const SYNC_EVENT = 'dark-mode-sync'

export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // 초기값 로드
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored !== null) {
        const value = stored === 'true'
        setIsDarkMode(value)
        if (value) {
          document.documentElement.classList.add('dark-mode')
        } else {
          document.documentElement.classList.remove('dark-mode')
        }
      }
    } catch {}

    // 다른 컴포넌트 인스턴스와 상태 동기화
    const onSync = (e: Event) => {
      setIsDarkMode((e as CustomEvent<boolean>).detail)
    }
    window.addEventListener(SYNC_EVENT, onSync)
    return () => window.removeEventListener(SYNC_EVENT, onSync)
  }, [])

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY, String(next))
        if (next) {
          document.documentElement.classList.add('dark-mode')
        } else {
          document.documentElement.classList.remove('dark-mode')
        }
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: next }))
        }, 0)
      } catch {}
      return next
    })
  }, [])

  return { isDarkMode, toggleDarkMode }
}
