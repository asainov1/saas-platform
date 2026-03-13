"use client";

import { type ReactNode } from "react";
import { Skeleton } from "./Skeleton";

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  keyExtractor?: (item: T) => string;
  onRowClick?: (item: T) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Table<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyMessage = "Нет данных",
  keyExtractor,
  onRowClick,
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/5">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-white/5">
                  {columns.map((col) => (
                    <td key={col.key} className="py-3 px-4">
                      <Skeleton variant="text" />
                    </td>
                  ))}
                </tr>
              ))
            : data.length === 0
              ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-12 text-center text-zinc-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )
              : data.map((item, idx) => (
                <tr
                  key={keyExtractor ? keyExtractor(item) : idx}
                  onClick={() => onRowClick?.(item)}
                  className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="py-3 px-4 text-sm text-zinc-300">
                      {col.render
                        ? col.render(item)
                        : (item[col.key] as ReactNode)}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}
