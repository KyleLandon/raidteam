import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// This should be replaced with secure admin credentials stored in environment variables
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (credentials.username === ADMIN_USERNAME && 
            credentials.password === ADMIN_PASSWORD) {
          return {
            id: '1',
            name: 'Admin',
            role: 'admin'
          };
        }
        return null;
      }
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key'
};

export default NextAuth(authOptions); 