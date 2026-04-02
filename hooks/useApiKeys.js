import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

async function readJsonResponse(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

function bearerAuthHeaders(sessionJwt) {
  if (!sessionJwt) return {};
  return { Authorization: `Bearer ${encodeURIComponent(sessionJwt)}` };
}

export function useApiKeys() {
  const { status, data: session } = useSession();
  const sessionJwt = session?.jwt ?? null;

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

  const refetchKeys = useCallback(
    async (signal) => {
      if (!sessionJwt) return;
      try {
        const res = await fetch("/api/api-keys", {
          headers: { ...bearerAuthHeaders(sessionJwt) },
          signal,
        });
        const data = await readJsonResponse(res);
        if (!res.ok) {
          console.error("Failed to load API keys", data?.error ?? res.statusText);
          setKeys([]);
          return;
        }
        setKeys(Array.isArray(data.keys) ? data.keys : []);
      } catch (err) {
        if (err?.name === "AbortError") return;
        console.error("Failed to load API keys", err);
        setKeys([]);
      }
    },
    [sessionJwt]
  );

  useEffect(() => {
    if (status !== "authenticated") {
      setKeys([]);
      return undefined;
    }
    if (!sessionJwt) {
      setKeys([]);
      return undefined;
    }
    const ac = new AbortController();
    refetchKeys(ac.signal);
    return () => ac.abort();
  }, [status, sessionJwt, refetchKeys]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return keys;
    return keys.filter((k) => (k.name ?? "").toLowerCase().includes(q));
  }, [keys, query]);

  async function onCreate(e) {
    e.preventDefault();
    if (status !== "authenticated" || !sessionJwt) {
      showToast("Sign in to create API keys", "error");
      return;
    }
    const trimmed = name.trim();
    const res = await fetch("/api/api-keys", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...bearerAuthHeaders(sessionJwt),
      },
      body: JSON.stringify({ name: trimmed || "Untitled key" }),
    });
    const data = await readJsonResponse(res);
    if (!res.ok) {
      console.error("Failed to create API key", data?.error ?? res.statusText);
      showToast(data?.error || "Failed to create API key", "error");
      return;
    }
    setName("");
    setIsCreateOpen(false);
    if (data.apiKey) {
      setKeys((prev) => [data.apiKey, ...prev]);
    } else {
      await refetchKeys();
    }
    showToast("Created new API key", "success");
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

  async function updateName(id, nextName) {
    if (status !== "authenticated" || !sessionJwt) {
      showToast("Sign in to update API keys", "error");
      return;
    }
    const res = await fetch(`/api/api-keys/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...bearerAuthHeaders(sessionJwt),
      },
      body: JSON.stringify({ name: nextName }),
    });
    const data = await readJsonResponse(res);
    if (!res.ok) {
      console.error("Failed to update API key name", data?.error ?? res.statusText);
      showToast("Failed to rename API key", "error");
      return;
    }
    if (data.apiKey) {
      setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, ...data.apiKey } : k)));
    }
    showToast("Updated API key name", "success");
  }

  async function regenerate(id) {
    if (status !== "authenticated" || !sessionJwt) {
      showToast("Sign in to regenerate API keys", "error");
      return;
    }
    const res = await fetch(`/api/api-keys/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...bearerAuthHeaders(sessionJwt),
      },
      body: JSON.stringify({ regenerate: true }),
    });
    const data = await readJsonResponse(res);
    if (!res.ok) {
      console.error("Failed to regenerate API key", data?.error ?? res.statusText);
      showToast("Failed to regenerate API key", "error");
      return;
    }
    if (data.apiKey) {
      setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, ...data.apiKey } : k)));
    }
    showToast("Regenerated API key", "success");
  }

  async function remove(id) {
    if (status !== "authenticated" || !sessionJwt) {
      showToast("Sign in to delete API keys", "error");
      return;
    }
    const res = await fetch(`/api/api-keys/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { ...bearerAuthHeaders(sessionJwt) },
    });
    if (!res.ok) {
      const data = await readJsonResponse(res);
      console.error("Failed to delete API key", data?.error ?? res.statusText);
      showToast("Failed to delete API key", "error");
      await refetchKeys();
      return;
    }
    setKeys((prev) => prev.filter((k) => k.id !== id));
    setRevealed((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    showToast("Deleted API key", "delete");
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
