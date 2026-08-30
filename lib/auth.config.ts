import type { NextAuthConfig } from "next-auth";

/** Edge-safe base config (no Prisma/bcrypt) — used directly by middleware,
 * and extended with the Credentials provider in lib/auth.ts for everything
 * else (API route, server components, server actions). */
export const authConfig = {
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8, // 8 hours
    updateAge: 60 * 15, // refresh the token every 15 min of activity
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
} satisfies NextAuthConfig;
