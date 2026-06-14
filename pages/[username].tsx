import { type GetServerSideProps } from 'next'

import { NotionPage } from '@/components/NotionPage'
import { domain, isDev, pageUrlOverrides } from '@/lib/config'
import { getPage } from '@/lib/notion'
import { resolveNotionPage } from '@/lib/resolve-notion-page'
import { supabase } from '@/lib/supabase'
import { type PageProps, type Site } from '@/lib/types'

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  context
) => {
  const rawPageId = context.params?.username as string

  // username으로 등록된 블로그인지 먼저 확인
  const { data: userPage } = await supabase
    .from('pages')
    .select('*')
    .eq('username', rawPageId)
    .single()

  if (userPage) {
    try {
      const recordMap = await getPage(userPage.notion_page_id)

      const site: Site = {
        name: userPage.title,
        domain: rawPageId,
        rootNotionPageId: userPage.notion_page_id,
        rootNotionSpaceId: null,
        description: userPage.subtitle ?? undefined,
        previewImages: true
      }

      return { props: { recordMap, pageId: userPage.notion_page_id, site } }
    } catch (err) {
      console.error('username page error', rawPageId, err)
      return { notFound: true }
    }
  }

  // 일반 Notion 페이지 ID로 처리
  try {
    const props = await resolveNotionPage(domain, rawPageId)
    return { props }
  } catch (err) {
    console.error('page error', domain, rawPageId, err)
    return { notFound: true }
  }
}

export default function NotionDomainDynamicPage(props: PageProps) {
  return <NotionPage {...props} />
}
