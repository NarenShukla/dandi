import { NextResponse } from "next/server";
import { generateApiKey } from "@/lib/apiKeys/format";
import {
  deleteApiKeyById,
  getApiKeyById,
  updateApiKeyFields,
} from "@/lib/apiKeys/dbApiKeys";
import { mapApiKeyRow } from "@/lib/apiKeys/mappers";
import { requireSessionUserId } from "@/lib/apiKeys/requireSessionUserId";

async function resolveParams(params) {
  const p = await params;
  return p?.id ?? null;
}

export async function GET(request, { params }) {
  const { userId, errorResponse } = await requireSessionUserId(request);
  if (errorResponse) return errorResponse;

  const id = await resolveParams(params);
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { unavailable, error, key } = await getApiKeyById(userId, id);
  if (unavailable) {
    return NextResponse.json({ error: "Supabase service role is not configured" }, { status: 503 });
  }
  if (error) {
    console.error("[api-keys/[id] GET] Supabase error", error);
    return NextResponse.json({ error: "Failed to load API key" }, { status: 500 });
  }

  if (!key) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ apiKey: key });
}

export async function PATCH(request, { params }) {
  const { userId, errorResponse } = await requireSessionUserId(request);
  if (errorResponse) return errorResponse;

  const id = await resolveParams(params);
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  let body = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const wantsRegenerate = body.regenerate === true;
  const hasName = Object.prototype.hasOwnProperty.call(body, "name");
  const name = hasName && typeof body.name === "string" ? body.name.trim() : undefined;

  if (!wantsRegenerate && !hasName) {
    return NextResponse.json({ error: "Provide name and/or regenerate: true" }, { status: 400 });
  }

  const patch = {};
  if (hasName) patch.name = name || "Untitled key";
  if (wantsRegenerate) patch.key = generateApiKey();

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const updateResult = await updateApiKeyFields(userId, id, patch);
  if (updateResult.unavailable) {
    return NextResponse.json({ error: "Supabase service role is not configured" }, { status: 503 });
  }
  const { data, error } = updateResult;
  if (error) {
    console.error("[api-keys/[id] PATCH] Supabase error", error);
    return NextResponse.json({ error: "Failed to update API key" }, { status: 500 });
  }

  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ apiKey: mapApiKeyRow(data) });
}

export async function DELETE(request, { params }) {
  const { userId, errorResponse } = await requireSessionUserId(request);
  if (errorResponse) return errorResponse;

  const id = await resolveParams(params);
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { unavailable, error } = await deleteApiKeyById(userId, id);
  if (unavailable) {
    return NextResponse.json({ error: "Supabase service role is not configured" }, { status: 503 });
  }
  if (error) {
    console.error("[api-keys/[id] DELETE] Supabase error", error);
    return NextResponse.json({ error: "Failed to delete API key" }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
