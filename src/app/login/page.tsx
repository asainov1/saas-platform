"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { authApi, saveToken } from "@/lib/api";

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/callback?next=${encodeURIComponent(next)}`;
      const res = await authApi.getAuthUrl(redirectUrl);
      window.location.href = res.auth_url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ошибка авторизации";
      setError(msg);
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(
      JSON.stringify({
        user_id: 1,
        email: "demo@flowlyai.kz",
        first_name: "Demo",
        last_name: "User",
        is_active: true,
        is_staff: false,
        is_superuser: false,
        organization_ids: [1],
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      })
    );
    saveToken(`${header}.${payload}.demo`, 60 * 60 * 24);
    window.location.href = next;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-violet-600 flex items-center justify-center text-white font-bold text-xl mb-4">
            F
          </div>
          <h1 className="text-2xl font-bold text-white">Войти в Flowly</h1>
          <p className="text-sm text-zinc-500 mt-1">
            AI-платформа для вашего бизнеса
          </p>
        </div>

        <div className="glass rounded-xl p-6">
          {error && (
            <p className="text-sm text-red-400 mb-4">{error}</p>
          )}

          <button
            onClick={handleDemoLogin}
            className="w-full py-3 rounded-lg bg-violet-600 hover:bg-violet-500 transition-colors text-sm font-medium text-white mb-4"
          >
            Войти как демо-пользователь
          </button>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#0c0c0f] px-2 text-zinc-500">или</span>
            </div>
          </div>

          <Button
            onClick={handleLogin}
            loading={loading}
            className="w-full"
            size="lg"
          >
            Войти через Google
          </Button>
          <p className="text-xs text-zinc-500 mt-4 text-center">
            Вы будете перенаправлены на страницу авторизации
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
          <div className="h-12 w-12 rounded-xl bg-violet-600 animate-pulse" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
