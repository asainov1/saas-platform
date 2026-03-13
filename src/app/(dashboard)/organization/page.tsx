"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useOrganization } from "@/lib/providers/OrganizationProvider";
import { useRouter } from "next/navigation";
import { Building2, Users } from "lucide-react";

export default function OrganizationPage() {
  const { currentOrg, loading } = useOrganization();
  const router = useRouter();

  if (loading || !currentOrg) return null;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Организация</h1>
        <p className="text-sm text-zinc-500 mt-1">Управление организацией</p>
      </div>

      <Card title="Информация">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500">Название</span>
            <span className="text-white">{currentOrg.name}</span>
          </div>
          {currentOrg.slug && (
            <div className="flex justify-between">
              <span className="text-zinc-500">Slug</span>
              <span className="text-zinc-400 font-mono">{currentOrg.slug}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-zinc-500">ID</span>
            <span className="text-zinc-400 font-mono">{currentOrg.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Создана</span>
            <span className="text-white">
              {new Date(currentOrg.created_at).toLocaleDateString("ru-RU")}
            </span>
          </div>
        </div>
      </Card>

      <Button
        variant="secondary"
        onClick={() => router.push("/organization/members")}
      >
        <Users className="h-4 w-4" />
        Управление участниками
      </Button>
    </div>
  );
}
