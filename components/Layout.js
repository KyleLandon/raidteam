import Navigation from './Navigation';
import styles from '../styles/Layout.module.css';

export default function Layout({ children }) {
  return (
    <div className={styles.layout}>
      <Navigation />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
} 