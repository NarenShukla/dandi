import { createSupabaseAdmin } from "@/lib/supabaseClient";

const MAX_IMAGE_LEN = 255;

/**
 * On first successful OAuth sign-in, insert a row into `users` if `email` is not yet present.
 */
export async function syncUserToSupabase({ email, name, image }) {
  if (!email) return;

  const admin = createSupabaseAdmin();
  if (!admin) {
    console.warn(
      "[syncUserToSupabase] SUPABASE_SERVICE_ROLE_KEY missing; skip user row insert."
    );
    return;
  }

  const displayName = (name && String(name).trim()) || email.split("@")[0];
  let imageUrl = image ? String(image).trim() : null;
  if (imageUrl && imageUrl.length > MAX_IMAGE_LEN) {
    imageUrl = imageUrl.slice(0, MAX_IMAGE_LEN);
  }

  const { data: existing, error: selectError } = await admin
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (selectError) {
    console.error("[syncUserToSupabase] lookup failed:", selectError);
    return;
  }
  if (existing) return;

  const { error: insertError } = await admin.from("users").insert({
    email,
    name: displayName,
    image: imageUrl,
  });

  if (insertError) {
    console.error("[syncUserToSupabase] insert failed:", insertError);
  }
}
