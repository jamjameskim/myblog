import Link from 'next/link'
import styles from './OverlookedFab.module.css'

export function OverlookedFab() {
  return (
    <Link href='/' className={styles.fab}>
      Overlooked 구경하기
    </Link>
  )
}
