import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      barbershopId?: string;
      barberId?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    barbershopId?: string;
    barberId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    sub?: string;
    role?: string;
    barbershopId?: string;
    barberId?: string;
  }
}