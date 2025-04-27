import NextAuth from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '@/lib/db/mongodb';

// Discord authorization scopes
// See: https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes
const scopes = ['identify', 'email'].join(' ');

export const authOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      authorization: { params: { scope: scopes } },
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Add user info to JWT token
      if (user) {
        token.id = user.id;
        token.username = profile?.username || user.name;
        token.image = profile?.image || user.image;
        token.discriminator = profile?.discriminator;
        token.isOfficer = user.isOfficer || false;
      }
      return token;
    },
    async session({ session, token }) {
      // Add info from token to session
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.discriminator = token.discriminator;
        session.user.isOfficer = token.isOfficer;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after successful sign-in
      return url.startsWith(baseUrl) ? url : '/dashboard';
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 