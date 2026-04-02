import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    /** Encrypted NextAuth session JWT for `Authorization: Bearer` API calls. */
    jwt?: string;
  }
}
