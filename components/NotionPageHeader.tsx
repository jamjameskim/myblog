import type * as types from 'notion-types'
import Link from 'next/link'
import * as React from 'react'
import { signOut, useSession } from 'next-auth/react'

import { MoonIcon } from '@/lib/icons/moon'
import { SunIcon } from '@/lib/icons/sun'
import { useDarkMode } from '@/lib/use-dark-mode'

import headerStyles from './NotionPageHeader.module.css'

export const SiteContext = React.createContext<{
  name: string
  rootHref: string
  isRoot: boolean
  username: string
}>({
  name: 'Overlooked',
  rootHref: '/',
  isRoot: false,
  username: ''
})

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

function ProfileMenu({ username }: { username: string }) {
  const { data: session } = useSession()
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!session) return null

  const isOwner = (session as any).username === username

  return (
    <div className={headerStyles.profileWrap} ref={ref}>
      <button
        className={headerStyles.profileBtn}
        onClick={() => setOpen((v) => !v)}
        aria-label='프로필 메뉴'
      >
        {session.user?.image
          ? <img src={session.user.image} alt='' className={headerStyles.profileImg} />
          : <span className={headerStyles.profileInitial}>{session.user?.name?.[0] ?? '?'}</span>
        }
      </button>
      {open && (
        <div className={headerStyles.dropdown}>
          {isOwner && (
            <Link
              href={`/${username}/settings`}
              className={headerStyles.dropdownItem}
              onClick={() => setOpen(false)}
            >
              블로그 설정
            </Link>
          )}
          <button
            className={headerStyles.dropdownItem}
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  )
}

export function NotionPageHeader({
  block: _block
}: {
  block: types.CollectionViewPageBlock | types.PageBlock
}) {
  const { name, rootHref, isRoot, username } = React.useContext(SiteContext)

  return (
    <header className={headerStyles.header}>
      <div className={headerStyles.inner}>
        <div className={headerStyles.lhs}>
          <Link href={rootHref} className={headerStyles.title}>
            {name}
          </Link>
          {!isRoot && (
            <Link href={rootHref} className={headerStyles.allListBtn}>
              전체목록
            </Link>
          )}
        </div>
        <div className={headerStyles.rhs}>
          <ToggleThemeButton />
          <ProfileMenu username={username} />
        </div>
      </div>
    </header>
  )
}
