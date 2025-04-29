import Link from 'next/link';
import styles from '../styles/Navigation.module.css';

export default function Navigation() {
  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          Raid Team
        </Link>
        <div className={styles.links}>
          <Link href="/leaderboard" className={styles.link}>
            Crayon Leaderboard
          </Link>
          <Link href="/admin" className={styles.link}>
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
} 