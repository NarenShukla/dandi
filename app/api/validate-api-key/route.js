import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/apiKeys/validateApiKey";

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

  const result = await validateApiKey(key);

  if (result.ok) {
    return NextResponse.json({ valid: true });
  }

  if (result.code === "unavailable") {
    return NextResponse.json({ valid: false, message: result.message }, { status: 503 });
  }

  if (result.code === "error") {
    console.error("validate-api-key Supabase error", result.error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }

  return NextResponse.json({ valid: false, message: result.message });
}
