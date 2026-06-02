import Link from 'next/link'
import * as React from 'react'
import { getBlockTitle, getPageProperty } from 'notion-utils'
import { type ExtendedRecordMap } from 'notion-types'

import { mapPageUrl } from '@/lib/map-page-url'
import { mapImageUrl } from '@/lib/map-image-url'
import { MoonIcon } from '@/lib/icons/moon'
import { SunIcon } from '@/lib/icons/sun'
import { type Site } from '@/lib/types'
import { useDarkMode } from '@/lib/use-dark-mode'
import { Footer } from './Footer'
import { SearchModal } from './SearchModal'
import styles from './BlogIndex.module.css'

interface Post {
  id: string
  title: string
  description: string
  date: string
  slug: string
  tags: string[]
  cover: string | null
}

interface Props {
  site: Site
  recordMap: ExtendedRecordMap
  pageId: string
}

function extractPosts(recordMap: ExtendedRecordMap, site: Site): Post[] {
  const searchParams = new URLSearchParams()
  const getUrl = mapPageUrl(site, recordMap, searchParams)

  const collectionQuery = recordMap.collection_query
  const pageIds: string[] = []

  for (const collectionId of Object.keys(collectionQuery)) {
    const query = collectionQuery[collectionId]
    for (const viewId of Object.keys(query)) {
      const ids = (query[viewId] as any)?.collection_group_results?.blockIds
      if (Array.isArray(ids)) {
        ids.forEach((id: string) => {
          if (!pageIds.includes(id)) pageIds.push(id)
        })
        break
      }
    }
    break
  }

  const posts: Post[] = []

  for (const id of pageIds) {
    const blockData = recordMap.block[id]
    const block = (blockData?.value as any)?.value ?? blockData?.value
    if (!block) continue

    const title = getBlockTitle(block, recordMap)
    if (!title) continue

    const description =
      getPageProperty<string>('Description', block, recordMap) || ''
    const rawDate = getPageProperty<any>('Date', block, recordMap)
    const tags = getPageProperty<string[]>('Tags', block, recordMap) || []

    let dateStr = ''
    if (rawDate) {
      const d = new Date(rawDate)
      if (!isNaN(d.getTime())) {
        dateStr = d.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }
    }

    const rawCover = block.format?.page_cover ?? null
    const cover = rawCover ? mapImageUrl(rawCover, block) ?? null : null

    posts.push({
      id,
      title,
      description,
      date: dateStr,
      slug: getUrl(id),
      tags: Array.isArray(tags) ? tags : [],
      cover
    })
  }

  return posts
}

function ThemeToggle() {
  const [hasMounted, setHasMounted] = React.useState(false)
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  React.useEffect(() => { setHasMounted(true) }, [])
  if (!hasMounted) return null

  return (
    <button className={styles.iconBtn} onClick={toggleDarkMode} aria-label='Toggle theme'>
      {isDarkMode ? <MoonIcon /> : <SunIcon />}
    </button>
  )
}

function SearchButton({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <button
        className={`${styles.iconBtn} ${className ?? ''}`}
        onClick={() => setOpen(true)}
        aria-label='Search'
      >
        <svg width='18' height='18' viewBox='0 0 18 18' fill='none'>
          <circle cx='7.5' cy='7.5' r='5' stroke='currentColor' strokeWidth='1.6' />
          <path d='M11.5 11.5L15 15' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' />
        </svg>
      </button>
      {open && <SearchModal onClose={() => setOpen(false)} />}
    </>
  )
}

export function BlogIndex({ site, recordMap }: Props) {
  const { isDarkMode } = useDarkMode()
  const posts = extractPosts(recordMap, site)

  return (
    <div className={`${styles.root} ${isDarkMode ? styles.dark : ''}`}>
      {/* 모바일 전용 sticky 헤더 */}
      <div className={styles.mobileHeader}>
        <span className={styles.mobileTitle}>{site.name}</span>
        <div className={styles.mobileHeaderRhs}>
          <SearchButton />
          <ThemeToggle />
        </div>
      </div>

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerTop}>
            <h1 className={styles.siteName}>{site.name}</h1>
            <div className={styles.headerRhs}>
              <SearchButton />
              <ThemeToggle />
            </div>
          </div>
          {site.description && (
            <p className={styles.siteDesc}>{site.description}</p>
          )}
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.cardGrid}>
          {posts.map((post) => (
            <Link key={post.id} href={post.slug} className={styles.card}>
              <div className={styles.cardThumb}>
                {post.cover ? (
                  <img src={post.cover} alt={post.title} className={styles.cardImg} />
                ) : (
                  <div className={styles.cardImgPlaceholder} />
                )}
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardMeta}>
                  {post.date && (
                    <span className={styles.postDate}>{post.date}</span>
                  )}
                  {post.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                </div>
                <h2 className={styles.postTitle}>{post.title}</h2>
                {post.description && (
                  <p className={styles.postDesc}>{post.description}</p>
                )}
              </div>
            </Link>
          ))}
          {posts.length === 0 && (
            <p className={styles.empty}>아직 게시글이 없습니다.</p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
