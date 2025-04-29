import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    throw new Error('Missing credentials');
                }

                if (credentials.username === process.env.ADMIN_USERNAME && 
                    credentials.password === process.env.ADMIN_PASSWORD) {
                    return {
                        id: '1',
                        name: 'Admin',
                        isAdmin: true
                    };
                }
                return null;
            }
        }),
    ],
    pages: {
        signIn: '/login',
        error: '/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.isAdmin = user.isAdmin;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.isAdmin = token.isAdmin;
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 