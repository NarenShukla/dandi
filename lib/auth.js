import GoogleProvider from "next-auth/providers/google";
import { syncUserToSupabase } from "@/lib/users/syncUserToSupabase";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
  },
};
