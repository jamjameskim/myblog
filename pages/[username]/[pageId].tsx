import { type GetServerSideProps } from 'next'
import { parsePageId } from 'notion-utils'

import { NotionPage } from '@/components/NotionPage'
import { getCanonicalPageId } from '@/lib/get-canonical-page-id'
import { getPage } from '@/lib/notion'
import { supabase } from '@/lib/supabase'
import { type PageProps, type Site } from '@/lib/types'

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  context
) => {
  const username = context.params?.username as string
  const rawPageId = context.params?.pageId as string

  const { data: userPage } = await supabase
    .from('pages')
    .select('*')
    .eq('username', username)
    .single()

  if (!userPage) {
    return { notFound: true }
  }

  const site: Site = {
    name: userPage.title,
    domain: username,
    rootNotionPageId: userPage.notion_page_id,
    rootNotionSpaceId: null,
    description: userPage.subtitle ?? undefined,
    previewImages: true
  }

  try {
    // UUID 형식이면 바로 사용
    let pageId = parsePageId(rawPageId, { uuid: false })

    if (!pageId) {
      // 슬러그인 경우 루트 recordMap에서 매핑 탐색
      const rootRecordMap = await getPage(userPage.notion_page_id)
      const blockIds = Object.keys(rootRecordMap.block)

      for (const blockId of blockIds) {
        const canonical = getCanonicalPageId(blockId, rootRecordMap, { uuid: false })
        if (canonical === rawPageId) {
          pageId = blockId
          break
        }
      }
    }

    if (!pageId) {
      return { notFound: true }
    }

    const recordMap = await getPage(pageId)
    return { props: { recordMap, pageId, site } }
  } catch (err) {
    console.error('user subpage error', username, rawPageId, err)
    return { notFound: true }
  }
}

export default function UserSubPage(props: PageProps) {
  return <NotionPage {...props} />
}
