import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' })

  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.email) return res.status(401).json({ error: 'Unauthorized' })

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', session.user.email)
    .single()

  if (!user) return res.status(401).json({ error: 'User not found' })

  // pages 먼저 삭제 후 user 삭제
  await supabase.from('pages').delete().eq('user_id', user.id)
  const { error } = await supabase.from('users').delete().eq('id', user.id)

  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ ok: true })
}
