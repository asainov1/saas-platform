"use client";

interface Tab {
  key: string;
  label: string;
  href?: string;
}

interface TabsProps {
  tabs: Tab[];
  activeKey: string;
  onChange?: (key: string) => void;
}

export function Tabs({ tabs, activeKey, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 border-b border-white/5 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange?.(tab.key)}
          className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
            activeKey === tab.key
              ? "text-violet-400 border-violet-600"
              : "text-zinc-500 border-transparent hover:text-white"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
