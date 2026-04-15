import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "@/app/lib/repositories/prisma";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(db),

  session: {
    strategy: "jwt",
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }

      if (token.email) {
        const dbUser = await db.user.findUnique({
          where: { email: token.email },
          include: {
            barber: true,
          },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.barbershopId = dbUser.barber?.barbershopId ?? undefined;
          token.barberId = dbUser.barber?.id ?? undefined;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.barbershopId = token.barbershopId as string | undefined;
        session.user.barberId = token.barberId as string | undefined;
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
};