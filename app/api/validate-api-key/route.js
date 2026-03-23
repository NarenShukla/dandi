import { NextResponse } from "next/server";
import { isApiKeyValid } from "@/lib/apiKeys/validateApiKey";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const key = typeof body.key === "string" ? body.key.trim() : "";
  if (!key) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const { valid, error } = await isApiKeyValid(key);

  if (error) {
    console.error("validate-api-key Supabase error", error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }

  return NextResponse.json({ valid });
}
