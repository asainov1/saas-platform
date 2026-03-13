"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { useAuth } from "@/lib/providers/AuthProvider";
import { useOrganization } from "@/lib/providers/OrganizationProvider";
import { authApi, notificationsApi } from "@/lib/api";
import type { NotificationSettings } from "@/lib/api";
import { ExternalLink } from "lucide-react";

export default function SettingsPage() {
  const { user, refreshUser, loading: authLoading } = useAuth();
  const { currentOrg } = useOrganization();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  const [notifSettings, setNotifSettings] = useState<NotificationSettings | null>(null);
  const [telegramLink, setTelegramLink] = useState("");

  useEffect(() => {
    if (!user) return;
    setFirstName(user.first_name || "");
    setLastName(user.last_name || "");
    setPhone(user.phone_number || "");

    const orgId = currentOrg?.id;
    if (orgId) {
      notificationsApi
        .getSettings(orgId)
        .then(setNotifSettings)
        .catch(() => {});
    }
  }, [user, currentOrg]);

  const saveProfile = async () => {
    setProfileLoading(true);
    setProfileSuccess(false);
    try {
      await authApi.updateMe({
        first_name: firstName,
        last_name: lastName,
        phone_number: phone || null,
      });
      await refreshUser();
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch {}
    setProfileLoading(false);
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwLoading(true);
    setPwError("");
    setPwSuccess(false);
    try {
      await authApi.changePassword(oldPassword, newPassword);
      setPwSuccess(true);
      setOldPassword("");
      setNewPassword("");
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : "Ошибка смены пароля");
    }
    setPwLoading(false);
  };

  const toggleNotifSetting = async (
    key: keyof NotificationSettings,
    value: boolean
  ) => {
    const orgId = currentOrg?.id;
    if (!orgId || !notifSettings) return;
    try {
      const updated = await notificationsApi.updateSettings(orgId, {
        [key]: value,
      });
      setNotifSettings(updated);
    } catch {}
  };

  const linkTelegram = async () => {
    try {
      const res = await notificationsApi.linkTelegram();
      setTelegramLink(res.link_url);
      window.open(res.link_url, "_blank");
    } catch {}
  };

  const notifToggles: { key: keyof NotificationSettings; label: string }[] = [
    { key: "function_errors", label: "Ошибки функций" },
    { key: "channel_disconnection", label: "Отключение каналов" },
    { key: "integration_disconnection", label: "Отключение интеграций" },
    { key: "tokens", label: "Токены" },
    { key: "subscriptions", label: "Подписки" },
    { key: "balance", label: "Баланс" },
    { key: "email_enabled", label: "Email-уведомления" },
    { key: "telegram_enabled", label: "Telegram-уведомления" },
  ];

  if (authLoading) return null;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Настройки</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Управление профилем и уведомлениями
        </p>
      </div>

      <Card title="Профиль">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Имя"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              label="Фамилия"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <Input label="Email" value={user?.email || ""} disabled />
          <Input
            label="Телефон"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+7 (XXX) XXX-XX-XX"
          />
          <div className="flex items-center gap-3">
            <Button onClick={saveProfile} loading={profileLoading}>
              Сохранить
            </Button>
            {profileSuccess && (
              <span className="text-sm text-emerald-400">Сохранено</span>
            )}
          </div>
        </div>
      </Card>

      <Card title="Смена пароля">
        <form onSubmit={changePassword} className="space-y-4">
          <Input
            label="Текущий пароль"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
          <Input
            label="Новый пароль"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          {pwError && <p className="text-sm text-red-400">{pwError}</p>}
          <div className="flex items-center gap-3">
            <Button type="submit" loading={pwLoading}>
              Сменить пароль
            </Button>
            {pwSuccess && (
              <span className="text-sm text-emerald-400">Пароль изменён</span>
            )}
          </div>
        </form>
      </Card>

      {currentOrg && (
        <Card title="Организация">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Название</span>
              <span className="text-white">{currentOrg.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">ID</span>
              <span className="text-zinc-400 font-mono">{currentOrg.id}</span>
            </div>
          </div>
        </Card>
      )}

      {notifSettings && (
        <Card title="Уведомления">
          <div className="space-y-4">
            {notifToggles.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">{label}</span>
                <Toggle
                  checked={notifSettings[key] as boolean}
                  onChange={(val) => toggleNotifSetting(key, val)}
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card title="Telegram">
        <p className="text-sm text-zinc-500 mb-4">
          Привяжите Telegram для получения уведомлений
        </p>
        <Button variant="secondary" onClick={linkTelegram}>
          <ExternalLink className="h-4 w-4" />
          Привязать Telegram
        </Button>
        {telegramLink && (
          <p className="text-xs text-zinc-500 mt-2 break-all">
            {telegramLink}
          </p>
        )}
      </Card>
    </div>
  );
}
