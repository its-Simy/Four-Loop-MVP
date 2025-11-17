import { ReactNode } from "react";
import { DashboardLayout as Shell } from "@/components/dashboard/dashboard-layout";
import { getDashboardSession } from "@/lib/dashboard/session";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { projects } = await getDashboardSession();

  return <Shell projects={projects}>{children}</Shell>;
}
