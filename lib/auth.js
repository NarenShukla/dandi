import GoogleProvider from "next-auth/providers/google";
import { encode } from "next-auth/jwt";
import { syncUserToSupabase } from "@/lib/users/syncUserToSupabase";

/** @type {import("next-auth").AuthOptions} */
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, profile }) {
      await syncUserToSupabase({
        email: user.email,
        name: user.name ?? profile?.name,
        image: user.image ?? profile?.picture,
      });
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.jwt = await encode({
          token,
          secret: process.env.NEXTAUTH_SECRET,
        });
      }
      return session;
    },
  },
};
