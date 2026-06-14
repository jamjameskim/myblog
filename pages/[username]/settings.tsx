import { type GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import * as React from 'react'
import { getServerSession } from 'next-auth'
import { signOut } from 'next-auth/react'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import styles from '../onboarding.module.css'
import s from './settings.module.css'

interface Props {
  username: string
  initialTitle: string
  initialSubtitle: string
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions)
  const username = ctx.params?.username as string

  if (!session?.user?.email) {
    return { redirect: { destination: `/auth/signin?callbackUrl=/${username}/settings`, permanent: false } }
  }

  if ((session as any).username !== username) {
    return { notFound: true }
  }

  const { data: page } = await supabase
    .from('pages')
    .select('title, subtitle')
    .eq('username', username)
    .single()

  if (!page) return { notFound: true }

  return {
    props: {
      username,
      initialTitle: page.title ?? '',
      initialSubtitle: page.subtitle ?? ''
    }
  }
}

export default function SettingsPage({ username, initialTitle, initialSubtitle }: Props) {
  const router = useRouter()
  const [form, setForm] = React.useState({ title: initialTitle, subtitle: initialSubtitle })
  const [savedBase, setSavedBase] = React.useState({ title: initialTitle, subtitle: initialSubtitle })
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [saved, setSaved] = React.useState(false)
  const hasChanges = form.title !== savedBase.title || form.subtitle !== savedBase.subtitle
  const [deletingPage, setDeletingPage] = React.useState(false)
  const [deletingAccount, setDeletingAccount] = React.useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setSaved(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/pages', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(form)
    })

    const data = await res.json() as { error?: string }
    setLoading(false)

    if (!res.ok) {
      setError(data.error || '오류가 발생했습니다.')
      return
    }

    setSaved(true)
    setSavedBase(form)
  }

  const handleDeletePage = async () => {
    if (!confirm(`"${form.title}" 블로그를 삭제할까요? 이 작업은 되돌릴 수 없어요.`)) return
    setDeletingPage(true)
    const res = await fetch('/api/pages', { method: 'DELETE' })
    if (res.ok) {
      await signOut({ callbackUrl: '/' })
    } else {
      setDeletingPage(false)
      alert('오류가 발생했습니다. 다시 시도해주세요.')
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('회원탈퇴 시 블로그와 계정 정보가 모두 삭제돼요. 정말 탈퇴할까요?')) return
    setDeletingAccount(true)
    const res = await fetch('/api/account', { method: 'DELETE' })
    if (res.ok) {
      await signOut({ callbackUrl: '/' })
    } else {
      setDeletingAccount(false)
      alert('오류가 발생했습니다. 다시 시도해주세요.')
    }
  }

  return (
    <>
      <Head>
        <title>블로그 설정 — {initialTitle}</title>
      </Head>
      <div className={styles.root}>
        <div className={styles.card}>
          <div className={s.header}>
            <Link href={`/${username}`} className={s.back}>← 블로그로 돌아가기</Link>
            <h1 className={styles.title}>블로그 설정</h1>
            <p className={styles.desc}>블로그 정보를 수정할 수 있어요</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label}>URL</label>
              <div className={s.readonlyField}>
                <span className={s.readonlyPrefix}>overlooked.me/</span>
                <span className={s.readonlyValue}>{username}</span>
              </div>
              <p className={s.fieldNote}>URL은 변경할 수 없어요</p>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>블로그 이름</label>
              <input
                className={styles.input}
                name='title'
                value={form.title}
                onChange={handleChange}
                placeholder='나의 블로그'
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>한 줄 소개</label>
              <input
                className={styles.input}
                name='subtitle'
                value={form.subtitle}
                onChange={handleChange}
                placeholder='이런 이야기를 씁니다'
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}
            {saved && <p className={s.success}>저장됐어요!</p>}

            <button className={styles.submit} type='submit' disabled={loading || !hasChanges}>
              {loading ? '저장 중...' : '저장하기'}
            </button>
          </form>

          <div className={s.dangerZone}>
            <h2 className={s.dangerTitle}>위험 구역</h2>
            <div className={s.dangerItem}>
              <div>
                <p className={s.dangerLabel}>블로그 삭제</p>
                <p className={s.dangerDesc}>블로그와 모든 설정이 삭제돼요. 계정은 유지돼요.</p>
              </div>
              <button
                className={s.dangerBtn}
                onClick={handleDeletePage}
                disabled={deletingPage}
              >
                {deletingPage ? '삭제 중...' : '블로그 삭제'}
              </button>
            </div>
            <div className={s.dangerItem}>
              <div>
                <p className={s.dangerLabel}>회원탈퇴</p>
                <p className={s.dangerDesc}>블로그와 계정 정보가 모두 삭제돼요. 되돌릴 수 없어요.</p>
              </div>
              <button
                className={s.dangerBtn}
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
              >
                {deletingAccount ? '처리 중...' : '회원탈퇴'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
