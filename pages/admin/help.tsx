import * as React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import styles from './help.module.css'

const sections = [
  {
    id: 'intro',
    title: '서비스 소개',
    content: (
      <>
        <p>
          <strong>Overlooked</strong>는 Notion 페이지를 그대로 블로그로 만들어주는 서비스입니다.
          별도의 CMS나 코딩 없이, 평소 쓰던 Notion에서 글을 쓰면 자동으로 블로그에 반영됩니다.
        </p>
        <ul>
          <li>Notion 데이터베이스가 블로그 게시글 목록이 됩니다</li>
          <li>게시글에 커버 이미지, 태그, 날짜, 설명을 달 수 있습니다</li>
          <li><code>overlooked.me/내아이디</code> 형태의 고유 주소를 갖습니다</li>
        </ul>
      </>
    )
  },
  {
    id: 'setup',
    title: '시작하는 방법',
    content: (
      <>
        <h3>1단계 — 로그인</h3>
        <p>
          우측 상단의 <strong>로그인</strong> 버튼을 눌러 Google 계정으로 로그인합니다.
        </p>

        <h3>2단계 — Notion 페이지 공개 설정</h3>
        <p>블로그로 연결할 Notion 페이지를 <strong>웹에 게시(Publish to web)</strong> 상태로 만들어야 합니다.</p>
        <ol>
          <li>Notion에서 연결할 데이터베이스 페이지를 엽니다</li>
          <li>우측 상단 <strong>···</strong> 메뉴 → <strong>Connections</strong> → <strong>공유</strong> 탭 클릭</li>
          <li><strong>웹에 게시</strong> 토글을 켭니다</li>
          <li>페이지 URL을 복사합니다 (예: <code>https://notion.so/내이름/페이지제목-32자리ID</code>)</li>
        </ol>

        <h3>3단계 — 내 페이지 만들기</h3>
        <p>
          <strong>내 페이지 만들기</strong> 버튼을 클릭하면 등록 폼이 나옵니다.
        </p>
        <ul>
          <li><strong>URL (username)</strong>: 영문 소문자, 숫자, 하이픈만 사용 가능. 예) <code>my-blog</code></li>
          <li><strong>블로그 이름</strong>: 헤더에 표시될 블로그 제목</li>
          <li><strong>한 줄 소개</strong>: 메인 페이지에 표시되는 짧은 소개문 (선택)</li>
          <li><strong>노션 페이지 링크</strong>: 위에서 복사한 Notion URL 또는 페이지 ID</li>
        </ul>
        <p>입력 후 <strong>시작하기</strong>를 누르면 <code>overlooked.me/내아이디</code>로 블로그가 생성됩니다.</p>
      </>
    )
  },
  {
    id: 'notion-structure',
    title: 'Notion 페이지 구조',
    content: (
      <>
        <p>
          블로그 게시글은 Notion <strong>데이터베이스(Database)</strong>로 관리합니다.
          아래 속성(Property)을 추가하면 블로그에서 자동으로 인식합니다.
        </p>
        <table>
          <thead>
            <tr>
              <th>속성 이름</th>
              <th>타입</th>
              <th>설명</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>Title</code></td>
              <td>제목 (기본)</td>
              <td>게시글 제목</td>
            </tr>
            <tr>
              <td><code>Date</code></td>
              <td>날짜</td>
              <td>게시글 날짜</td>
            </tr>
            <tr>
              <td><code>Tags</code></td>
              <td>다중 선택</td>
              <td>태그 목록</td>
            </tr>
            <tr>
              <td><code>Description</code></td>
              <td>텍스트</td>
              <td>게시글 요약 문구</td>
            </tr>
          </tbody>
        </table>
        <p>
          데이터베이스 각 행이 하나의 게시글이 됩니다. 행을 클릭해서 내용을 작성하면 됩니다.
          페이지 상단에 <strong>커버 이미지</strong>를 추가하면 썸네일로 표시됩니다.
        </p>
      </>
    )
  },
  {
    id: 'faq',
    title: '자주 묻는 질문',
    content: (
      <>
        <div className={styles.faqItem}>
          <p className={styles.faqQ}>Q. 글을 수정하면 바로 반영되나요?</p>
          <p className={styles.faqA}>Notion에서 저장하면 보통 수 초~수십 초 내에 반영됩니다. 캐시로 인해 최대 1분 정도 걸릴 수 있습니다.</p>
        </div>
        <div className={styles.faqItem}>
          <p className={styles.faqQ}>Q. 이미지가 표시되지 않아요.</p>
          <p className={styles.faqA}>Notion 페이지가 <strong>웹에 게시</strong> 상태인지 확인하세요. 비공개 페이지의 이미지는 외부에서 접근할 수 없습니다.</p>
        </div>
        <div className={styles.faqItem}>
          <p className={styles.faqQ}>Q. username을 변경할 수 있나요?</p>
          <p className={styles.faqA}>현재 username 변경 기능은 지원하지 않습니다. 변경이 필요하면 운영자에게 문의해주세요.</p>
        </div>
        <div className={styles.faqItem}>
          <p className={styles.faqQ}>Q. 연결된 Notion 페이지를 바꾸고 싶어요.</p>
          <p className={styles.faqA}>현재 페이지 변경 기능은 준비 중입니다. 운영자에게 문의해주세요.</p>
        </div>
        <div className={styles.faqItem}>
          <p className={styles.faqQ}>Q. 다크모드를 지원하나요?</p>
          <p className={styles.faqA}>헤더 우측의 ☀ / 🌙 버튼으로 라이트/다크 모드를 전환할 수 있습니다.</p>
        </div>
      </>
    )
  }
]

export default function HelpPage() {
  const [active, setActive] = React.useState('intro')

  return (
    <>
      <Head>
        <title>사용 설명서 — Overlooked</title>
      </Head>
      <div className={styles.root}>
        <header className={styles.header}>
          <Link href='/' className={styles.logo}>Overlooked</Link>
          <span className={styles.headerTitle}>사용 설명서</span>
        </header>

        <div className={styles.layout}>
          <nav className={styles.nav}>
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`${styles.navItem} ${active === s.id ? styles.navActive : ''}`}
                onClick={() => setActive(s.id)}
              >
                {s.title}
              </a>
            ))}
          </nav>

          <main className={styles.main}>
            {sections.map((s) => (
              <section key={s.id} id={s.id} className={styles.section}>
                <h2 className={styles.sectionTitle}>{s.title}</h2>
                <div className={styles.sectionBody}>{s.content}</div>
              </section>
            ))}
          </main>
        </div>
      </div>
    </>
  )
}
