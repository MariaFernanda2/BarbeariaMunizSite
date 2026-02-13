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
      // user existe somente no primeiro login, adiciona id no token
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // adiciona id na sessão para acesso no client
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  // Opcional: defina página customizada de login
  pages: {
    signIn: "/login", // coloque a url da sua página de login
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
