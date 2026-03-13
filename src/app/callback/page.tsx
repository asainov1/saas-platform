"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { saveToken } from "@/lib/api";
import { coreApi } from "@/lib/api/core";

function CallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState("");
  const next = searchParams.get("next") || "/";

  useEffect(() => {
    const exchange = async () => {
      try {
        const authResponseUrl = window.location.href;
        const tokenData = await coreApi.exchangeCode(authResponseUrl);

        saveToken(tokenData.access_token, tokenData.expires_in);

        if (tokenData.refresh_token) {
          await fetch("/api/auth/callback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              refresh_token: tokenData.refresh_token,
              expires_in: tokenData.expires_in,
            }),
          });
        }

        router.replace(next);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Ошибка авторизации";
        setError(msg);
      }
    };

    exchange();
  }, [next, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] px-4">
        <div className="glass rounded-xl p-6 max-w-sm w-full text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <a href="/login" className="text-violet-400 hover:underline text-sm">
            Вернуться к входу
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-violet-600 animate-pulse" />
        <p className="text-sm text-zinc-500">Авторизация...</p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
          <div className="h-12 w-12 rounded-xl bg-violet-600 animate-pulse" />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
