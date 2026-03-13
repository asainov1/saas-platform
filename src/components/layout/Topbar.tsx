"use client";

import { Search, Bell } from "lucide-react";
import { useAuth } from "@/lib/providers/AuthProvider";
import { useOrganization } from "@/lib/providers/OrganizationProvider";
import { useEffect, useState } from "react";
import { notificationsApi } from "@/lib/api";
import Link from "next/link";

interface TopbarProps {
  title?: string;
}

export function Topbar({ title }: TopbarProps) {
  const { user } = useAuth();
  const { currentOrg } = useOrganization();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!currentOrg) return;
    notificationsApi
      .unreadCount(currentOrg.id)
      .then((r) => setUnread(r.count))
      .catch(() => {});
  }, [currentOrg]);

  return (
    <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-lg font-semibold text-white lg:block hidden">
        {title}
      </h1>

      <div className="flex items-center gap-4 ml-auto">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Поиск..."
            className="w-64 pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-600/50"
          />
        </div>

        <Link
          href="/notifications"
          className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <Bell className="h-5 w-5 text-zinc-400" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 rounded-full bg-violet-600 text-[10px] font-bold text-white flex items-center justify-center">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </Link>

        {user && (
          <div className="h-8 w-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
            {user.email[0].toUpperCase()}
          </div>
        )}
      </div>
    </header>
  );
}
