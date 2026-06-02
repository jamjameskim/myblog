import type * as types from 'notion-types'
import Link from 'next/link'
import * as React from 'react'

import { MoonIcon } from '@/lib/icons/moon'
import { SunIcon } from '@/lib/icons/sun'
import { useDarkMode } from '@/lib/use-dark-mode'

import headerStyles from './NotionPageHeader.module.css'

function ToggleThemeButton() {
  const [hasMounted, setHasMounted] = React.useState(false)
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  React.useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) return null

  return (
    <button className={headerStyles.iconBtn} onClick={toggleDarkMode} aria-label='Toggle theme'>
      {isDarkMode ? <MoonIcon /> : <SunIcon />}
    </button>
  )
}

export function NotionPageHeader({
  block: _block
}: {
  block: types.CollectionViewPageBlock | types.PageBlock
}) {
  return (
    <header className={headerStyles.header}>
      <div className={headerStyles.inner}>
        <Link href='/' className={headerStyles.backLink}>
          <svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
            <path d='M10 3L5 8L10 13' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
          전체 목록
        </Link>
        <div className={headerStyles.rhs}>
          <ToggleThemeButton />
        </div>
      </div>
    </header>
  )
}
