"use client";

import { AuthProvider } from "@/lib/providers/AuthProvider";
import { OrganizationProvider } from "@/lib/providers/OrganizationProvider";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <AuthProvider>
        <OrganizationProvider>
          <div className="flex min-h-screen bg-[#09090b]">
            <Sidebar />
            <div className="flex-1 flex flex-col min-h-screen">
              <Topbar />
              <main className="flex-1 p-6">{children}</main>
            </div>
          </div>
        </OrganizationProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
