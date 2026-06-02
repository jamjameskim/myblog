import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import * as React from 'react'
import styles from './onboarding.module.css'

export default function OnboardingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [form, setForm] = React.useState({
    username: '',
    title: '',
    subtitle: '',
    notion_page_id: ''
  })
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  // 이미 페이지가 있으면 해당 페이지로 이동
  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/signin?callbackUrl=/onboarding')
    }
    if ((session as any)?.username) {
      router.replace(`/${(session as any).username}`)
    }
  }, [session, status, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // Notion 페이지 ID 추출
  const extractNotionPageId = (input: string) => {
    const match = input.match(/([a-f0-9]{32})/)
    return match ? match[1] : input
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const notion_page_id = extractNotionPageId(form.notion_page_id)

    const res = await fetch('/api/pages', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...form, notion_page_id })
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || '오류가 발생했습니다.')
      return
    }

    router.push(`/${form.username}`)
  }

  if (status === 'loading') return null

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <h1 className={styles.title}>내 페이지 만들기</h1>
        <p className={styles.desc}>아래 정보를 입력하면 나만의 블로그가 생성돼요</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>URL (username)</label>
            <div className={styles.inputWrap}>
              <span className={styles.prefix}>overlooked.me/</span>
              <input
                className={styles.input}
                name='username'
                value={form.username}
                onChange={handleChange}
                placeholder='my-blog'
                pattern='[a-z0-9\-]+'
                title='영문 소문자, 숫자, 하이픈만 가능합니다'
                required
              />
            </div>
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

          <div className={styles.field}>
            <label className={styles.label}>
              노션 페이지 링크
              <a
                href='/manual'
                target='_blank'
                rel='noopener noreferrer'
                className={styles.manualLink}
              >
                연결 방법 보기 →
              </a>
            </label>
            <input
              className={styles.input}
              name='notion_page_id'
              value={form.notion_page_id}
              onChange={handleChange}
              placeholder='https://www.notion.so/...'
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.submit} type='submit' disabled={loading}>
            {loading ? '생성 중...' : '시작하기'}
          </button>
        </form>
      </div>
    </div>
  )
}
