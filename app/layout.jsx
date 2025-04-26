import '../styles/globals.css';
import Link from 'next/link';

export const metadata = {
    title: 'Raid Team - WoW Guild',
    description: 'Raid Team is a no-drama, early AOTC guild that dives into Mythic.'
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/favicon.svg" sizes="any" />
                <script src="/js/script.js" defer></script>
            </head>
            <body>
                <div className="content-wrapper">
                    <nav className="main-nav">
                        <div className="nav-links">
                            <Link href="/" className="nav-link">Home</Link>
                            <Link href="/apply" className="nav-link">Apply</Link>
                        </div>
                    </nav>
                    <main>{children}</main>
                </div>
            </body>
        </html>
    );
}
