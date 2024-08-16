import { type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prismaClient } from "@repo/db";
import * as bcrypt from "bcryptjs";
import { DefaultSession } from "next-auth";

const VERCEL_DEPLOYMENT = !!process.env.VERCEL_URL;

export const authOption: AuthOptions = {
  cookies: {
    sessionToken: {
      name: `${VERCEL_DEPLOYMENT ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        // When working on localhost, the cookie domain must be omitted entirely (https://stackoverflow.com/a/1188145)
        domain: VERCEL_DEPLOYMENT
          ? `.${process.env.NEXT_PUBLIC_APP_DOMAIN}`
          : undefined,
        secure: VERCEL_DEPLOYMENT,
      },
    },
  },
  session: {
    strategy: "jwt",
    maxAge: parseInt(process.env.JWT_EXPIRE_IN_HR!, 10) * 60 * 60,
  },
  pages: {
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        const email = credentials?.email;
        let password = credentials?.password;

        if (!email || !password) return null;
        try {
          const user = await prismaClient.user.findFirst({
            where: { email, emailVerified: { not: null } },
          });

          if (user && (await bcrypt.compare(password, user.password))) {
            return {
              email,
              id: user.id as string,
              username: user.username,
              role: "USER",
            };
          } else return null;
        } catch (err) {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    jwt: async (jwtProps) => {
      let { account, token, user, profile, session, trigger } = jwtProps;

      if (user?.id) token.id = user.id;

      // @ts-ignore
      if (user?.username) token.username = user.username;
      // @ts-ignore
      if (user?.role) token.role = user.role;

      return token;
    },

    async session(sessionProps) {
      const { session, token, user, newSession, trigger } = sessionProps;
      session.user = session.user ?? {};
      session.user.id = token?.id! as string;
      session.user.username = token?.username! as string;
      // @ts-ignore
      session.user.role = token.role! as string;

      return session;
    },
  },
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: "ADMIN" | "USER";
    } & DefaultSession["user"];
  }
}
