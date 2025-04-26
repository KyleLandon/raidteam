import '../../styles/globals.css';

export const metadata = {
  title: 'Raid Team Player',
  description: 'Raid Team player profile'
};

export default function PlayerLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" sizes="any" />
        <script src="/js/script.js" defer></script>
      </head>
      <body>
        <div className="content-wrapper">
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
} 