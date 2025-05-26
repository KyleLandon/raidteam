import '../styles/globals.css';
import Navigation from './components/Navigation';
import NextAuthSessionProvider from './providers/SessionProvider';

export const metadata = {
    title: 'Raid Team - WoW Guild',
    description: 'Raid Team is a no-drama, early AOTC guild that dives into Mythic.',
    icons: {
        icon: [
            { url: '/favicon.svg', type: 'image/svg+xml' },
            { url: '/images/raidteam.png', sizes: '32x32', type: 'image/png' }
        ],
        apple: '/images/raidteam.png',
    }
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/favicon.svg" sizes="any" />
                <link rel="icon" href="/images/raidteam.png" sizes="32x32" type="image/png" />
                <link rel="apple-touch-icon" href="/images/raidteam.png" />
                <script src="/js/script.js" defer></script>
            </head>
            <body>
                <div className="content-wrapper">
                    <Navigation />
                    <NextAuthSessionProvider>
                        <main>{children}</main>
                    </NextAuthSessionProvider>
                </div>
            </body>
        </html>
    );
}
