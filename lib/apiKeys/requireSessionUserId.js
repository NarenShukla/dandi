import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { authOptions } from "@/lib/auth";
import { getSupabaseUserIdForEmail } from "@/lib/users/getSupabaseUserIdForEmail";

/**
 * Resolves the Supabase `users.id` for the current NextAuth session.
 * Accepts `Authorization: Bearer <session-jwt>` (URL-encoded token) and/or session cookies.
 */
export async function requireSessionUserId(request) {
  const secret = authOptions.secret ?? process.env.NEXTAUTH_SECRET;
  const token = await getToken({ req: request, secret });
  const email =
    typeof token?.email === "string"
      ? token.email
      : typeof token?.user?.email === "string"
        ? token.user.email
        : null;

  if (!email) {
    return { userId: null, errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const userId = await getSupabaseUserIdForEmail(email);
  if (!userId) {
    return {
      userId: null,
      errorResponse: NextResponse.json({ error: "Account not provisioned" }, { status: 403 }),
    };
  }

  return { userId, errorResponse: null };
}
