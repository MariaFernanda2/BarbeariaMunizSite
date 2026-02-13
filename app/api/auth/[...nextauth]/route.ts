import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // coloca id no token na hora do login
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string; // adiciona id na sessão para acessar no client
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // se quiser uma página customizada para login
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
