import { NextResponse } from "next/server";
import { generateApiKey, uuid } from "@/lib/apiKeys/format";
import { listApiKeysByUserId, insertApiKey } from "@/lib/apiKeys/dbApiKeys";
import { mapApiKeyRow } from "@/lib/apiKeys/mappers";
import { requireSessionUserId } from "@/lib/apiKeys/requireSessionUserId";

export async function GET(request) {
  const { userId, errorResponse } = await requireSessionUserId(request);
  if (errorResponse) return errorResponse;

  const { unavailable, error, keys } = await listApiKeysByUserId(userId);
  if (unavailable) {
    return NextResponse.json({ error: "Supabase service role is not configured" }, { status: 503 });
  }
  if (error) {
    console.error("[api-keys GET] Supabase error", error);
    return NextResponse.json({ error: "Failed to list API keys" }, { status: 500 });
  }

  return NextResponse.json({ keys });
}

export async function POST(request) {
  const { userId, errorResponse } = await requireSessionUserId(request);
  if (errorResponse) return errorResponse;

  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  if (Object.prototype.hasOwnProperty.call(body, "limit")) {
    return NextResponse.json(
      { error: "The usage limit cannot be set through the API or UI." },
      { status: 400 }
    );
  }

  const nameRaw = typeof body.name === "string" ? body.name.trim() : "";
  const name = nameRaw || "Untitled key";
  const id = uuid();
  const keyValue = generateApiKey();

  const insertResult = await insertApiKey({
    userId,
    id,
    name,
    key: keyValue,
    usage: 0,
  });

  if (insertResult.unavailable) {
    return NextResponse.json({ error: "Supabase service role is not configured" }, { status: 503 });
  }

  const { data, error } = insertResult;

  if (error) {
    console.error("[api-keys POST] Supabase error", error);
    const code = error.code;
    if (code === "23505") {
      return NextResponse.json({ error: "An API key with this id already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create API key" }, { status: 500 });
  }

  return NextResponse.json({ apiKey: mapApiKeyRow(data) }, { status: 201 });
}
