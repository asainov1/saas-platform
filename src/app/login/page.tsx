"use client";

import { useState, useRef, useEffect, Suspense } from "react";
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
        oauth2: {
          initCodeClient: (config: Record<string, unknown>) => { requestCode: () => void };
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
  const codeClientRef = useRef<{ requestCode: () => void } | null>(null);
  const [gsiReady, setGsiReady] = useState(false);

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

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      codeClientRef.current = window.google?.accounts.oauth2.initCodeClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: "openid email profile",
        ux_mode: "popup",
        callback: async (response: { code?: string; error?: string }) => {
          if (response.error || !response.code) {
            setError(response.error || "Google авторизация отменена");
            setGoogleLoading(false);
            return;
          }

          setGoogleLoading(true);
          setError("");

          try {
            const res = await fetch("/api/auth/google-callback", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code: response.code }),
            });

            const data = await res.json();

            if (!res.ok) {
              throw new Error(data.error || "Ошибка авторизации через Google");
            }

            saveToken(data.access_token, data.expires_in);
            router.replace(next);
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Ошибка авторизации через Google";
            setError(msg);
            setGoogleLoading(false);
          }
        },
      }) || null;
      setGsiReady(true);
    };
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, [next, router]);

  const handleGoogleClick = () => {
    if (codeClientRef.current) {
      codeClientRef.current.requestCode();
    }
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
            onClick={handleGoogleClick}
            disabled={!gsiReady || googleLoading}
            className="w-full flex items-center justify-center gap-3 h-11 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <div className="h-5 w-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Войти через Google
              </>
            )}
          </button>

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
