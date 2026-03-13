"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Building2 } from "lucide-react";
import { useOrganization } from "@/lib/providers/OrganizationProvider";

export function OrgSwitcher() {
  const { currentOrg, organizations, setCurrentOrg, loading } = useOrganization();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (loading || organizations.length === 0) return null;

  return (
    <div ref={ref} className="relative px-3 mb-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
      >
        <Building2 className="h-4 w-4 text-violet-400 shrink-0" />
        <span className="text-sm text-white truncate flex-1">
          {currentOrg?.name || "Организация"}
        </span>
        <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-3 right-3 top-full mt-1 z-50 glass rounded-lg py-1 shadow-xl">
          {organizations.map((org) => (
            <button
              key={org.id}
              onClick={() => {
                setCurrentOrg(org);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                org.id === currentOrg?.id
                  ? "text-violet-400 bg-violet-600/10"
                  : "text-zinc-300 hover:bg-white/5"
              }`}
            >
              {org.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
