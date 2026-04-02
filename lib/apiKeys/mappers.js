export function mapApiKeyRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name ?? "Untitled key",
    key: row.key,
    usage: row.usage ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
  };
}
