"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Wifi, WifiOff, Trash2 } from "lucide-react";

interface ChannelCardProps {
  type: string;
  label: string;
  icon: string;
  isActive: boolean;
  onToggle: () => void;
  onDelete: () => void;
}

export function ChannelCard({ type, label, icon, isActive, onToggle, onDelete }: ChannelCardProps) {
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 rounded-lg bg-violet-600/10 flex items-center justify-center text-violet-400 text-sm font-bold">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-white">{label}</p>
          <Badge variant={isActive ? "success" : "default"}>
            {isActive ? "Подключён" : "Неактивен"}
          </Badge>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" className="flex-1" onClick={onToggle}>
          {isActive ? <WifiOff className="h-3 w-3" /> : <Wifi className="h-3 w-3" />}
          {isActive ? "Откл." : "Вкл."}
        </Button>
        <Button size="sm" variant="danger" onClick={onDelete}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
