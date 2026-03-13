"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  AlertTriangle,
  CreditCard,
  Bot,
  Check,
  CircleDot,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/lib/providers/AuthProvider";
import { notificationsApi } from "@/lib/api";
import type { Notification } from "@/lib/api";

const typeIcons: Record<string, React.ReactNode> = {
  error: <AlertTriangle className="h-4 w-4 text-red-400" />,
  billing: <CreditCard className="h-4 w-4 text-amber-400" />,
  agent: <Bot className="h-4 w-4 text-violet-400" />,
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} мин. назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч. назад`;
  const days = Math.floor(hours / 24);
  return `${days} дн. назад`;
}

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    if (authLoading || !user) return;
    const orgId = user.organization_ids?.[0];
    if (!orgId) {
      setLoading(false);
      return;
    }

    notificationsApi
      .list({ organization_id: orgId, limit: 50 })
      .then((res) => setNotifications(res.results))
      .catch(() => {
        // Demo notifications
        setNotifications([
          { id: "n1", organization_id: 1, agent_id: "a1", type: "error", title: "Ошибка функции", description: "Маркетолог: не удалось опубликовать пост в Instagram — истёк токен", is_read: false, data: {}, created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
          { id: "n2", organization_id: 1, agent_id: "e5", type: "agent", title: "Новый диалог", description: "HR-рекрутер начал интервью с кандидатом Алия Т.", is_read: false, data: {}, created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
          { id: "n3", organization_id: 1, agent_id: null, type: "billing", title: "Лимит токенов 80%", description: "Использовано 80% месячного лимита токенов. Рекомендуем пополнить баланс.", is_read: false, data: {}, created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
          { id: "n4", organization_id: 1, agent_id: null, type: "billing", title: "Баланс пополнен", description: "На счёт зачислено 50,000 ₸ с карты •••• 4242", is_read: true, data: {}, created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
          { id: "n5", organization_id: 1, agent_id: "m3", type: "agent", title: "Агент активирован", description: "Чат-бот «Kaspi Магазин» успешно запущен и подключён к WhatsApp", is_read: true, data: {}, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
          { id: "n6", organization_id: 1, agent_id: "i9", type: "error", title: "Агент приостановлен", description: "Голосовой агент «Клиника Аль-Фараби» приостановлен из-за ошибки SIP-подключения", is_read: true, data: {}, created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
          { id: "n7", organization_id: 1, agent_id: null, type: "billing", title: "Подписка продлена", description: "Pro тариф автоматически продлён. Следующее списание: 13 апреля 2026", is_read: true, data: {}, created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString() },
        ]);
      })
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  const toggleRead = async (n: Notification) => {
    try {
      const updated = n.is_read
        ? await notificationsApi.markUnread(n.id)
        : await notificationsApi.markRead(n.id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? updated : item))
      );
    } catch {}
  };

  const filtered =
    filter === "unread"
      ? notifications.filter((n) => !n.is_read)
      : notifications;

  if (authLoading || loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="card" className="h-20" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Уведомления</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {notifications.filter((n) => !n.is_read).length} непрочитанных
          </p>
        </div>
      </div>

      <div className="flex gap-1 p-1 rounded-lg bg-white/5 w-fit">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            filter === "all"
              ? "bg-violet-600 text-white"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Все
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            filter === "unread"
              ? "bg-violet-600 text-white"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Непрочитанные
        </button>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center py-12">
            <Bell className="h-8 w-8 text-zinc-600 mb-3" />
            <p className="text-sm text-zinc-500">Нет уведомлений</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => (
            <div
              key={n.id}
              className={`glass rounded-xl p-4 flex items-start gap-4 transition-colors ${
                !n.is_read ? "bg-violet-600/[0.03]" : ""
              }`}
            >
              <div className="p-2 rounded-lg bg-white/5 shrink-0 mt-0.5">
                {typeIcons[n.type] || <Bell className="h-4 w-4 text-zinc-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-white">{n.title}</p>
                  <span className="text-xs text-zinc-600 shrink-0">
                    {timeAgo(n.created_at)}
                  </span>
                </div>
                <p className="text-sm text-zinc-500 mt-0.5 line-clamp-2">
                  {n.description}
                </p>
              </div>
              <button
                onClick={() => toggleRead(n)}
                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors shrink-0"
                title={n.is_read ? "Отметить непрочитанным" : "Отметить прочитанным"}
              >
                {n.is_read ? (
                  <CircleDot className="h-4 w-4 text-zinc-600" />
                ) : (
                  <div className="h-3 w-3 rounded-full bg-violet-500 m-0.5" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
