import { compare } from "bcrypt-ts";
import NextAuth, { type DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { DUMMY_PASSWORD } from "@/lib/constants";
import { createGuestUser, getUser } from "@/lib/db/queries";
import {
  normalizeBillingStatus,
  normalizePlanId,
  type BillingStatus,
  type PlanId,
} from "@/lib/saas/plans";
import { authConfig } from "./auth.config";

export type UserType = "guest" | "regular";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      type: UserType;
      plan: PlanId;
      billingStatus: BillingStatus;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    email?: string | null;
    type: UserType;
    plan?: PlanId | null;
    billingStatus?: BillingStatus | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    type: UserType;
    plan: PlanId;
    billingStatus: BillingStatus;
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials.email ?? "");
        const password = String(credentials.password ?? "");
        const users = await getUser(email);

        if (users.length === 0) {
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const [user] = users;

        if (!user.password) {
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const passwordsMatch = await compare(password, user.password);

        if (!passwordsMatch) {
          return null;
        }

        return {
          ...user,
          type: "regular",
          plan: normalizePlanId(user.plan),
          billingStatus: normalizeBillingStatus(user.billingStatus),
        };
      },
    }),
    Credentials({
      id: "guest",
      credentials: {},
      async authorize() {
        const [guestUser] = await createGuestUser();
        return {
          ...guestUser,
          type: "guest",
          plan: normalizePlanId(guestUser.plan),
          billingStatus: normalizeBillingStatus(guestUser.billingStatus),
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.type = user.type ?? "regular";
        token.plan = normalizePlanId(user.plan);
        token.billingStatus = normalizeBillingStatus(user.billingStatus);
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.type = token.type ?? "regular";
        session.user.plan = normalizePlanId(token.plan);
        session.user.billingStatus = normalizeBillingStatus(
          token.billingStatus
        );
      }

      return session;
    },
  },
});
