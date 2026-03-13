"use client";

import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      {icon && (
        <div className="p-4 rounded-2xl bg-violet-600/10 mb-4">{icon}</div>
      )}
      <p className="text-lg font-medium text-white mb-1">{title}</p>
      {description && (
        <p className="text-sm text-zinc-500 mb-4 text-center max-w-sm">{description}</p>
      )}
      {action}
    </div>
  );
}
