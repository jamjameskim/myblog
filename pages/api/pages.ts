import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', session.user.email)
    .single()

  if (!user) return res.status(401).json({ error: 'User not found' })

  // 페이지 생성
  if (req.method === 'POST') {
    const { username, title, subtitle, notion_page_id } = req.body

    // username 중복 체크
    const { data: existing } = await supabase
      .from('pages')
      .select('id')
      .eq('username', username)
      .single()

    if (existing) {
      return res.status(400).json({ error: '이미 사용 중인 username입니다.' })
    }

    const { data, error } = await supabase
      .from('pages')
      .insert({ user_id: user.id, username, title, subtitle, notion_page_id })
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json(data)
  }

  // 페이지 수정
  if (req.method === 'PATCH') {
    const { title, subtitle } = req.body

    const { data, error } = await supabase
      .from('pages')
      .update({ title, subtitle, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  // 페이지 삭제
  if (req.method === 'DELETE') {
    const { error } = await supabase
      .from('pages')
      .delete()
      .eq('user_id', user.id)

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
