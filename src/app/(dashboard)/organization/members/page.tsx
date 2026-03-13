"use client";

import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useOrganization } from "@/lib/providers/OrganizationProvider";
import { Users } from "lucide-react";

export default function MembersPage() {
  const { currentOrg } = useOrganization();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Участники</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Управление участниками организации {currentOrg?.name}
        </p>
      </div>

      <Card>
        <EmptyState
          icon={<Users className="h-8 w-8 text-violet-400" />}
          title="Управление участниками"
          description="Функция управления участниками будет доступна в ближайшее время"
        />
      </Card>
    </div>
  );
}
