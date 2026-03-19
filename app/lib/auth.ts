import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "@/app/lib/repositories/prisma";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(db), // 🔥 ESSENCIAL

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id;
    }
    return token;
  },

  async session({ session, token }) {
    if (session.user && token?.sub) {
      session.user.id = token.sub; // 🔥 usar sub
    }
    return session;
  },
},

  pages: {
    signIn: "/login",
  },
};