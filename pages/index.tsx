import type { PageProps } from '@/lib/types'
import { BlogIndex } from '@/components/BlogIndex'
import { domain } from '@/lib/config'
import { resolveNotionPage } from '@/lib/resolve-notion-page'

export const getStaticProps = async () => {
  try {
    const props = await resolveNotionPage(domain)
    return { props, revalidate: 10 }
  } catch (err) {
    console.error('page error', domain, err)
    throw err
  }
}

export default function NotionDomainPage(props: PageProps) {
  if (!props.site || !props.recordMap || !props.pageId) return null
  return (
    <BlogIndex
      site={props.site}
      recordMap={props.recordMap}
      pageId={props.pageId}
    />
  )
}
