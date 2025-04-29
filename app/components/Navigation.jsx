import Link from 'next/link';
import Image from 'next/image';
import styles from '../../styles/Navigation.module.css';

const navItems = [
    { linkText: 'Home', href: '/' },
    { linkText: 'Leaderboard', href: '/leaderboard' },
    { linkText: 'Apply', href: '/apply' },
    { linkText: 'Admin', href: '/admin' }
];

export default function Navigation() {
    return (
        <nav className={styles.nav}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    Raid Team
                </Link>
                <div className={styles.links}>
                    {navItems.map((item, index) => (
                        <Link key={index} href={item.href} className={styles.link}>
                            {item.linkText}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
} 