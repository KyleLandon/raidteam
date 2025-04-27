import { Inter } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Raid Team Crayon Points",
  description: "Track and award points to raid team members",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
} 