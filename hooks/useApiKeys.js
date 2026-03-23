import { useEffect, useMemo, useRef, useState } from "react";
import { generateApiKey, uuid } from "@/lib/apiKeys/format";
import { loadKeys, saveKeys } from "@/lib/apiKeys/storage";
import {
  deleteApiKey,
  insertApiKey,
  listApiKeys,
  updateApiKeyName as updateApiKeyNameRequest,
  updateApiKeyValue,
} from "@/lib/apiKeys/supabaseApiKeys";

export function useApiKeys() {
  const [keys, setKeys] = useState([]);
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [revealed, setRevealed] = useState(() => new Set());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const nameInputRef = useRef(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  function showToast(message, kind = "success") {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, kind });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 2200);
  }

  useEffect(() => {
    let cancelled = false;

    async function fetchKeys() {
      const { error, keys: remoteKeys } = await listApiKeys();

      if (error) {
        console.error("Failed to load API keys from Supabase", error);
        if (!cancelled) setKeys(loadKeys());
        return;
      }

      if (!cancelled) setKeys(remoteKeys);
    }

    fetchKeys();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    saveKeys(keys);
  }, [keys]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return keys;
    return keys.filter((k) => (k.name ?? "").toLowerCase().includes(q));
  }, [keys, query]);

  function onCreate(e) {
    e.preventDefault();
    const trimmed = name.trim();
    const localId = uuid();
    const now = new Date().toISOString();
    const keyValue = generateApiKey();
    const optimistic = {
      id: localId,
      name: trimmed || "Untitled key",
      key: keyValue,
      usage: 0,
      createdAt: now,
      updatedAt: now,
    };
    setKeys((prev) => [optimistic, ...prev]);
    setName("");
    setIsCreateOpen(false);
    showToast("Created new API key", "success");

    insertApiKey({
      id: localId,
      name: optimistic.name,
      key: optimistic.key,
      usage: optimistic.usage,
    }).then(({ error, data }) => {
      if (error) {
        console.error("Failed to create API key in Supabase", error);
        return;
      }
      if (!data) return;
      setKeys((prev) =>
        prev.map((k) =>
          k.id === localId
            ? {
                ...k,
                createdAt: data.created_at,
                updatedAt: data.updated_at ?? data.created_at,
              }
            : k
        )
      );
    });
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied API key to clipboard", "success");
    } catch {
      showToast("Failed to copy to clipboard", "error");
    }
  }

  function toggleReveal(id) {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function updateName(id, nextName) {
    const updatedAt = new Date().toISOString();
    setKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, name: nextName, updatedAt } : k))
    );

    updateApiKeyNameRequest(id, nextName, updatedAt).then(({ error }) => {
      if (error) {
        console.error("Failed to update API key name in Supabase", error);
        showToast("Failed to rename API key", "error");
        return;
      }
      showToast("Updated API key name", "success");
    });
  }

  function regenerate(id) {
    const nextKey = generateApiKey();
    const updatedAt = new Date().toISOString();
    setKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, key: nextKey, updatedAt } : k))
    );

    updateApiKeyValue(id, nextKey, updatedAt).then(({ error }) => {
      if (error) {
        console.error("Failed to regenerate API key in Supabase", error);
        showToast("Failed to regenerate API key", "error");
        return;
      }
      showToast("Regenerated API key", "success");
    });
  }

  function remove(id) {
    setKeys((prev) => prev.filter((k) => k.id !== id));
    setRevealed((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    deleteApiKey(id).then(({ error }) => {
      if (error) {
        console.error("Failed to delete API key in Supabase", error);
        showToast("Failed to delete API key", "error");
        return;
      }
      showToast("Deleted API key", "delete");
    });
  }

  return {
    keys,
    name,
    setName,
    query,
    setQuery,
    revealed,
    isCreateOpen,
    setIsCreateOpen,
    isDesktopSidebarOpen,
    setIsDesktopSidebarOpen,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    toast,
    nameInputRef,
    filtered,
    onCreate,
    copyToClipboard,
    toggleReveal,
    updateName,
    regenerate,
    remove,
  };
}
