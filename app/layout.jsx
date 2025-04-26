import '../styles/globals.css';

export const metadata = {
    title: 'Raid Team - WoW Guild',
    description: 'Raid Team is a no-drama, early AOTC guild that dives into Mythic.'
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/favicon.svg" sizes="any" />
                <link href="https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Comic+Neue:wght@400;700&display=swap" rel="stylesheet" />
                <script src="/js/script.js" defer></script>
            </head>
            <body>
                <div className="content-wrapper">
                    <nav className="main-nav">
                        <div className="nav-links">
                            <a href="/" className="nav-link">Home</a>
                            <a href="/apply" className="nav-link">Apply</a>
                        </div>
                    </nav>
                    <main>{children}</main>
                </div>
            </body>
        </html>
    );
}
