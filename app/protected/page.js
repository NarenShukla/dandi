"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { takePendingApiKeyFromSession } from "@/lib/playground/pendingApiKey";
import { ValidationToast } from "@/lib/playground/ValidationToast";

const SUCCESS_MESSAGE = "It is a valid API key";

export default function ProtectedPage() {
  const [toast, setToast] = useState(null);
  /** "pending" until we know if a validated key was passed from the playground. */
  const [visitState, setVisitState] = useState("pending");

  useEffect(() => {
    const pending = takePendingApiKeyFromSession();

    queueMicrotask(() => {
      if (!pending) {
        setToast(null);
        setVisitState("needPlayground");
        return;
      }
      setToast({ kind: "success", message: SUCCESS_MESSAGE });
      setVisitState("ok");
    });
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-950 dark:bg-black dark:text-zinc-50">
      <ValidationToast toast={toast} />

      <div className="mx-auto w-full max-w-lg px-4 py-10 sm:px-6">
        <div className="mb-8 text-sm">
          <Link
            href="/playground"
            className="text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
          >
            ← API Playground
          </Link>
        </div>

        {visitState === "ok" && (
          <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
            Your key was verified. You can use protected routes that trust this flow.
          </p>
        )}

        {visitState === "needPlayground" && (
          <p className="mt-6 text-sm text-zinc-700 dark:text-zinc-300">
            To open this page with confirmation, submit a valid API key from the{" "}
            <Link href="/playground" className="underline underline-offset-4">
              API Playground
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
