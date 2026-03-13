"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { coreApi } from "@/lib/api";
import type { Organization } from "@/lib/api";
import { useAuth } from "./AuthProvider";

const STORAGE_KEY = "flowly_selected_org";

interface OrganizationContextValue {
  currentOrg: Organization | null;
  organizations: Organization[];
  setCurrentOrg: (org: Organization) => void;
  loading: boolean;
}

const OrganizationContext = createContext<OrganizationContextValue>({
  currentOrg: null,
  organizations: [],
  setCurrentOrg: () => {},
  loading: true,
});

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrgState] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  const setCurrentOrg = useCallback((org: Organization) => {
    setCurrentOrgState(org);
    localStorage.setItem(STORAGE_KEY, String(org.id));
  }, []);

  useEffect(() => {
    if (authLoading || !user) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const res = await coreApi.getOrganizations();
        const orgs = res.results;
        setOrganizations(orgs);

        if (orgs.length > 0) {
          const savedId = localStorage.getItem(STORAGE_KEY);
          const saved = savedId ? orgs.find((o) => o.id === Number(savedId)) : null;
          setCurrentOrgState(saved || orgs[0]);
        }
      } catch {
        // Fallback: create demo organization
        const demoOrg: Organization = {
          id: 1,
          name: "Demo Organization",
          slug: "demo",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setOrganizations([demoOrg]);
        setCurrentOrgState(demoOrg);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, authLoading]);

  return (
    <OrganizationContext.Provider value={{ currentOrg, organizations, setCurrentOrg, loading }}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  return useContext(OrganizationContext);
}
