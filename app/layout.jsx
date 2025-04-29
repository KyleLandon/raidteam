import '../styles/globals.css';
import Navigation from './components/Navigation';

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
                    <Navigation />
                    <main>{children}</main>
                </div>
            </body>
        </html>
    );
}
