"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { authApi, saveToken } from "@/lib/api";

const GOOGLE_CLIENT_ID =
  "149964995044-l1ama192qc1jcjlatta0j22qv0cb2l9j.apps.googleusercontent.com";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (element: HTMLElement, config: Record<string, unknown>) => void;
        };
      };
    };
  }
}

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const next = searchParams.get("next") || "/";
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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

  const handleGoogleCallback = useCallback(
    async (response: { credential: string }) => {
      setError("");
      setGoogleLoading(true);
      try {
        const tokenData = await authApi.googleLogin(response.credential);
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
        const msg = err instanceof Error ? err.message : "Ошибка авторизации через Google";
        setError(msg);
        setGoogleLoading(false);
      }
    },
    [next, router]
  );

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
      });
      const btnContainer = document.getElementById("google-signin-btn");
      if (btnContainer) {
        window.google?.accounts.id.renderButton(btnContainer, {
          type: "standard",
          theme: "filled_black",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
          width: 360,
          locale: "ru",
        });
      }
    };
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, [handleGoogleCallback]);

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

          <div className="flex justify-center mb-4">
            {googleLoading ? (
              <div className="h-[44px] flex items-center justify-center">
                <div className="h-5 w-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div id="google-signin-btn" />
            )}
          </div>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-zinc-700" />
            <span className="text-xs text-zinc-500">или</span>
            <div className="flex-1 h-px bg-zinc-700" />
          </div>

          <Button
            onClick={handleLogin}
            loading={loading}
            className="w-full"
            size="lg"
            variant="secondary"
          >
            Войти через email
          </Button>
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
